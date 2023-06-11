import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/devices.getList", {
    schema: {
        body: Type.Object({
            count: Type.Optional(Type.Number({ minimum: 1, maximum: 200 })),
            offset: Type.Optional(Type.Number({ minimum: 0 }))
        })
    }
}, async (request) => {
    if (!request.userHasAccess("devices")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { count, offset } = request.body;

    const devices = await DB.devices.find({}, {
        _id: false,
        id: true,
        description: true,
        isEnabled: true,
        lastRequestDate: true,
        nextAreaId: true,
        prevAreaId: true,
        title: true,
        token: true
    }, {
        limit: count,
        skip: offset
    });

    return devices;
});
