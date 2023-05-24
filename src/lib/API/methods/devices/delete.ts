import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/devices.delete", {
    schema: {
        body: Type.Object({
            id: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("devices")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { id } = request.body;
    const device = await DB.devices.findOne({ id });

    if (!device) {
        throw new APIError({
            code: 21, request
        });
    }

    if (device.nextAreaId !== null || device.prevAreaId !== null || device.isEnabled) {
        throw new APIError({
            code: 23, request
        });
    }

    await DB.devices.deleteOne({
        id
    });

    return 1;
});
