import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/security.getReasons", {
    schema: {
        body: Type.Object({
            count: Type.Optional(Type.Number({ minimum: 1, maximum: 200 })),
            offset: Type.Optional(Type.Number({ minimum: 0 }))
        })
    }
}, async (request) => {
    if (!request.userHasAccess("security")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { count, offset } = request.body;

    const reasons = await DB.securityReasons.find({}, {
        _id: false,
        id: true,
        title: true
    }, {
        limit: count,
        skip: offset
    });

    return reasons;
});
