import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/areas.create", {
    schema: {
        body: Type.Object({
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

    const { title, description, isLocked } = request.body;

    if (await DB.areas.exists({ title })) {
        throw new APIError({
            code: 19, request
        });
    }

    const id = ++DB.cache.lastAreaId;

    await DB.areas.insertMany([
        {
            id,
            title,
            description,
            isLocked
        }
    ]);

    return 1;
});
