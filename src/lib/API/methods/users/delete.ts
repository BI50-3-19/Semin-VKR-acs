import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/users.delete", {
    schema: {
        body: Type.Object({
            userId: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("users:manage")) {
        throw new APIError({
            code: 8, request
        });
    }

    const user = await DB.users.findOne({
        id: request.body.userId,
        isDeleted: false
    }).lean();

    if (user === null) {
        throw new APIError({
            code: 7, request
        });
    }

    await DB.users.updateOne({
        id: request.body.userId
    }, {
        $set: {
            isDeleted: true
        }
    });

    return true;
});
