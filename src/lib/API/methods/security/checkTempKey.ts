import { Type } from "@sinclair/typebox";
import server from "../..";
import DB from "../../../DB";

server.post("/security.checkTempKey", {
    schema: {
        body: Type.Object({
            userId: Type.Number(),
            key: Type.String()
        })
    }
}, (request) => {
    const userKey = DB.cache.getUserTempKey(request.body.userId);

    return {
        isValid: !!(userKey && userKey === request.body.key)
    };
});
