import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/groups.create", {
    schema: {
        body: Type.Object({
            name: Type.String(),
            scheduleId: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("groups")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { name, scheduleId } = request.body;

    if ((await DB.groups.exists({ name }))) {
        throw new APIError({
            code: 13, request
        });
    }

    if (!(await DB.schedules.exists({ id: scheduleId }))) {
        throw new APIError({
            code: 15, request
        });
    }

    const id = ++DB.cache.lastGroupId;

    await DB.groups.insertMany([
        {
            id,
            name,
            scheduleId
        }
    ]);

    return 1;
});
