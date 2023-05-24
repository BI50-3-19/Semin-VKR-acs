import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/roles.delete", {
    schema: {
        body: Type.Object({
            id: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("roles")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { id } = request.body;

    if (!(await DB.roles.exists({ id }))) {
        throw new APIError({
            code: 9, request
        });
    }

    if (await DB.users.exists({ roleId: id })) {
        throw new APIError({
            code: 11, request
        });
    }

    await DB.roles.deleteOne({
        id
    });
    DB.cache.data.del(`role-${id}`);

    return 1;
});
