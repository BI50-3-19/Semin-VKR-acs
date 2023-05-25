import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/security.deleteReason", {
    schema: {
        body: Type.Object({
            id: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("security:reasons")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { id } = request.body;

    if (!(await DB.securityReasons.exists({ id }))) {
        throw new APIError({
            code: 27, request
        });
    }

    if (await DB.passLogs.exists({ reasonId: id })) {
        throw new APIError({
            code: 29, request
        });
    }

    await DB.securityReasons.deleteOne({
        id
    });
    DB.cache.data.del(`security-reason-${id}`);

    return 1;
});
