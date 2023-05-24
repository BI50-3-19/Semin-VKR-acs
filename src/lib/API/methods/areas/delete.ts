import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/areas.delete", {
    schema: {
        body: Type.Object({
            id: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("areas")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { id } = request.body;

    if (!(await DB.areas.exists({ id }))) {
        throw new APIError({
            code: 18, request
        });
    }

    const isExist = (await Promise.all([
        DB.devices.exists({
            $or: [{
                prevAreaId: id
            }, {
                nextAreaId: id
            }]
        }),
        DB.groups.exists({ areas: { $in: [id] } }),
        DB.tempPasses.exists({ areas: { $in: [id] } })
    ])).map(Boolean);

    if (isExist.includes(true)) {
        throw new APIError({
            code: 20, request
        });
    }

    await DB.areas.deleteOne({
        id
    });

    return 1;
});
