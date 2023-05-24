import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/schedules.delete", {
    schema: {
        body: Type.Object({
            id: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("schedules")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { id } = request.body;

    if (!(await DB.schedules.exists({ id }))) {
        throw new APIError({
            code: 15, request
        });
    }

    if (await DB.groups.exists({ scheduleId: id })) {
        throw new APIError({
            code: 17, request
        });
    }

    await DB.schedules.deleteOne({
        id
    });

    return 1;
});
