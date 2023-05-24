import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/groups.edit", {
    schema: {
        body: Type.Object({
            id: Type.Number(),
            name: Type.Optional(Type.String()),
            scheduleId: Type.Optional(Type.Number())
        })
    }
}, async (request) => {
    if (!request.userHasAccess("groups")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { id, name, scheduleId } = request.body;

    const [isGroupExist, isScheduleExist] = await Promise.all([
        await DB.groups.exists({ id }),
        await DB.schedules.exists({ id: scheduleId })
    ]);

    if (!isGroupExist) {
        throw new APIError({
            code: 12, request
        });
    }

    if (!isScheduleExist) {
        throw new APIError({
            code: 15, request
        });
    }

    await DB.groups.updateOne({
        id
    }, {
        $set: {
            name,
            scheduleId
        }
    });

    return 1;
});
