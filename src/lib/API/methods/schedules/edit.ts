import server from "../..";
import DB from "../../../DB";
import { scheduleBox } from "../../../DB/schemes/schedule";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/schedules.edit", {
    schema: {
        body: Type.Intersect([
            Type.Partial(scheduleBox),
            Type.Object({
                id: Type.Number()
            })
        ])
    }
}, async (request) => {
    if (!request.userHasAccess("schedules")) {
        throw new APIError({
            code: 8, request
        });
    }

    const schedule = request.body;

    if (!(await DB.schedules.exists({ id: schedule.id }))) {
        throw new APIError({
            code: 15, request
        });
    }

    await DB.schedules.updateOne({
        id: schedule.id
    }, {
        $set: schedule
    });

    return 1;
});
