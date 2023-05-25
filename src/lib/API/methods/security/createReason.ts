import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/security.createReason", {
    schema: {
        body: Type.Object({
            name: Type.String()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("security:reasons")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { name } = request.body;

    if ((await DB.securityReasons.exists({ name }))) {
        throw new APIError({
            code: 28, request
        });
    }

    const id = ++DB.cache.lastRoleId;

    await DB.securityReasons.insertMany([
        {
            id,
            name
        }
    ]);
    await DB.cache.getSecurityReason(id, true);

    return 1;
});
