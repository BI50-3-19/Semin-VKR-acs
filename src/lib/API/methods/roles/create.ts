import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/roles.create", {
    schema: {
        body: Type.Object({
            name: Type.String(),
            mask: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("roles")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { name, mask } = request.body;

    if ((await DB.roles.exists({ name }))) {
        throw new APIError({
            code: 10, request
        });
    }

    const id = ++DB.cache.lastRoleId;

    await DB.roles.insertMany([
        {
            id,
            name,
            mask
        }
    ]);
    await DB.cache.getRole(id, true);

    return 1;
});
