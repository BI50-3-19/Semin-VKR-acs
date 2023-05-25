import { Type } from "@sinclair/typebox";

import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

server.post("/security.checkTempKey", {
    schema: {
        body: Type.Object({
            userId: Type.Number(),
            key: Type.String()
        })
    }
}, (request) => {
    if (!request.userHasAccess("security")) {
        throw new APIError({
            code: 8, request
        });
    }

    const userKey = DB.cache.getUserTempKey(request.body.userId);

    return {
        isValid: !!(userKey && userKey === request.body.key)
    };
});
