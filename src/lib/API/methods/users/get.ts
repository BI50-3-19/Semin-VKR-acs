import server from "../..";
import DB from "../../../DB";
import utils from "../../../utils";
import APIError from "../../Error";
import { TUserBox } from "../../../DB/schemes/user";

import { Type } from "@sinclair/typebox";

server.post("/users.get", {
    schema: {
        body: Type.Object({
            userId: Type.Optional(Type.Number())
        })
    }
}, async (request) => {
    let user: TUserBox | null = request.userData;
    let role = request.userRole;

    if ("userId" in request.body) {
        if (!utils.hasAccess("users.get", role.mask)) {
            throw new APIError({
                code: 8, request
            });
        }

        user = await DB.users.findOne({
            id: request.body.userId
        }).lean();

        if (user === null) {
            throw new APIError({
                code: 7, request
            });
        }

        role = await DB.cache.getRole(user.roleId);
    }

    return {
        id: user.id,
        name: user.name,
        surname: user.surname,
        patronymic: user.patronymic,
        role: role.name
    };
});
