import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/security.editReason", {
    schema: {
        body: Type.Object({
            id: Type.Number(),
            name: Type.String()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("security:reasons")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { id, name } = request.body;

    if (!(await DB.securityReasons.exists({ id }))) {
        throw new APIError({
            code: 27, request
        });
    }

    await DB.securityReasons.updateOne({
        id
    }, {
        $set: {
            name
        }
    });
    await DB.cache.getSecurityReason(request.body.id, true);

    return 1;
});
