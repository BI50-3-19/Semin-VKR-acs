
import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/security.getUserAccessKeys", {
    schema: {
        body: Type.Object({
            userId: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("security:keys")) {
        throw new APIError({
            code: 8, request
        });
    }

    return DB.keys.find({
        userId: request.body.userId,
        isDeleted: false
    }, {
        _id: false,
        id: true,
        key: true,
        createdAt: true,
        creatorId: true,
        expiresIn: true,
        lastPassId: true,
        passes: true,
        isBlocked: true
    }).lean();
});
