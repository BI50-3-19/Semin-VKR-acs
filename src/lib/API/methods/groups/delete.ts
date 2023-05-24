import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/groups.delete", {
    schema: {
        body: Type.Object({
            id: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("groups")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { id } = request.body;

    if (!(await DB.groups.exists({ id }))) {
        throw new APIError({
            code: 12, request
        });
    }

    if (await DB.users.exists({ groups: { $in: [id] } })) {
        throw new APIError({
            code: 14, request
        });
    }

    await DB.roles.deleteOne({
        id
    });

    return 1;
});
