import server from "../..";
import DB from "../../../DB";
import { scheduleBox } from "../../../DB/schemes/schedule";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/schedules.create", {
    schema: {
        body: Type.Omit(scheduleBox, ["id"])
    }
}, async (request) => {
    if (!request.userHasAccess("schedules")) {
        throw new APIError({
            code: 8, request
        });
    }

    if ((await DB.schedules.exists({ name: request.body.name }))) {
        throw new APIError({
            code: 16, request
        });
    }

    const schedule = request.body;

    const scheduleDays = schedule.week.map(x => x.day);
    const uniqueScheduleDays = [...new Set(scheduleDays)];

    if (scheduleDays.length !== uniqueScheduleDays.length) {
        throw new APIError({
            code: 2,
            request,
        });
    }

    const id = ++DB.cache.lastScheduleId;

    await DB.schedules.insertMany([
        {
            ...schedule,
            id,
        }
    ]);

    return 1;
});
