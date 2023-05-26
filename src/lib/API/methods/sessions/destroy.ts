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
    const result = await DB.sessions.deleteOne({
        _id: request.body.id
    }).lean();

    return result.deletedCount === 1;
});
