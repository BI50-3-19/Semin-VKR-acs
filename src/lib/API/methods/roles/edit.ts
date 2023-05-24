import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/roles.edit", {
    schema: {
        body: Type.Object({
            id: Type.Number(),
            name: Type.Optional(Type.String()),
            mask: Type.Optional(Type.Number())
        })
    }
}, async (request) => {
    if (!request.userHasAccess("roles")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { id, name, mask } = request.body;

    if (!(await DB.roles.exists({ id }))) {
        throw new APIError({
            code: 9, request
        });
    }

    await DB.roles.updateOne({
        id
    }, {
        $set: {
            name,
            mask
        }
    });
    await DB.cache.getRole(request.body.id, true);

    return 1;
});
