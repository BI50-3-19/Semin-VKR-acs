import server from "../..";
import DB from "../../../DB";
import { TUserBox } from "../../../DB/schemes/user";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/users.setAvatar", {
    schema: {
        querystring: Type.Object({
            userId: Type.Optional(Type.Number())
        })
    }
}, async (request) => {
    let user: TUserBox | null = request.userData;

    if (!request.userHasAccess("users:manage")) {
        throw new APIError({
            code: 8, request
        });
    }

    if ("userId" in request.query) {
        user = await DB.users.findOne({
            id: request.query.userId,
            isDeleted: false
        }).lean();

        if (user === null) {
            throw new APIError({
                code: 7, request
            });
        }
    }

    const avatar = await request.file();

    if (!avatar) {
        throw new APIError({
            code: 2, request
        });
    }

    if (!["image/png", "image/jpeg"].includes(avatar.mimetype)) {
        throw new APIError({
            code: 2, request
        });
    }

    await DB.files.avatars.upload(user.id, await avatar.toBuffer());
    await DB.users.updateOne({
        id: user.id
    }, {
        $set: {
            hasAvatar: true
        }
    });
    await DB.cache.getUser(user.id, true);

    return true;
});
