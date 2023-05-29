import server from "../..";
import DB from "../../../DB";
import { TUserBox } from "../../../DB/schemes/user";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.get("/users.getAvatar", {
    schema: {
        querystring: Type.Object({
            userId: Type.Optional(Type.Number())
        })
    }
}, async (request) => {
    let user: TUserBox | null = request.userData;

    if ("userId" in request.query) {
        if (!request.userHasAccess("users:get")) {
            throw new APIError({
                code: 8, request
            });
        }

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

    if (user.hasAvatar) {
        const stream = DB.files.avatars.getDownloadStream(user.id);

        return stream;
    } else {
        return 404;
    }
});
