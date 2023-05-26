import { Type } from "@sinclair/typebox";
import server from "../..";

import DB from "../../../DB";

server.post("/sessions.destroy", {
    schema: {
        body: Type.Object({
            id: Type.String()
        })
    }
}, async (request) => {
    const result = await DB.sessions.findOneAndDelete({
        _id: request.body.id
    }).lean();

    if (result) {
        DB.cache.data.del(`jwt-token-${result.accessToken}`);
    }

    return result !== null;
});
