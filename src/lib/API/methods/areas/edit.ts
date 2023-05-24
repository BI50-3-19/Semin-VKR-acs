import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/areas.edit", {
    schema: {
        body: Type.Object({
            id: Type.Number(),
            title: Type.String(),
            description: Type.Optional(Type.String()),
            isLocked: Type.Boolean()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("areas")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { id, title, description, isLocked } = request.body;

    if (!(await DB.areas.exists({ id }))) {
        throw new APIError({
            code: 18, request
        });
    }

    await DB.areas.updateOne({
        id
    }, {
        $set: {
            title,
            description,
            isLocked
        }
    });

    return 1;
});
