import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/users.getList", {
    schema: {
        body: Type.Object({
            count: Type.Optional(Type.Number({ minimum: 1, maximum: 200 })),
            offset: Type.Optional(Type.Number({ minimum: 0 }))
        })
    }
}, async (request) => {
    if (!request.userHasAccess("users:manage")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { count, offset } = request.body;

    const users = await DB.users.find({}, {
        _id: false,
        id: true,
        name: true,
        surname: true,
        patronymic: true,
        hasAvatar: true,
        roleId: true
    }, {
        limit: count,
        skip: offset
    });

    const response: {
        id: number;
        name: string;
        surname: string;
        patronymic?: string;
        hasAvatar: boolean;
        role: string;
        mask: number;
    }[] = [];

    for (const user of users) {
        const role = await DB.cache.getRole(user.roleId);

        if (role === null) {
            throw new APIError({
                code: 9, request
            });
        }

        response.push({
            id: user.id as number,
            name: user.name,
            surname: user.surname,
            patronymic: user.patronymic,
            hasAvatar: user.hasAvatar,
            role: role.name,
            mask: role.mask
        });
    }

    return response;
});
