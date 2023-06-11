import utils from "@rus-anonym/utils";
import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/devices.edit", {
    schema: {
        body: Type.Object({
            id: Type.Number(),
            title: Type.Optional(Type.String()),
            description: Type.Optional(Type.String()),
            prevAreaId: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
            nextAreaId: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
            isEnabled: Type.Optional(Type.Boolean()),
            ip: Type.Optional(Type.String())
        })
    }
}, async (request) => {
    if (!request.userHasAccess("devices")) {
        throw new APIError({
            code: 8, request
        });
    }

    const {
        id,
        title,
        description,
        prevAreaId,
        nextAreaId,
        isEnabled,
        ip
    } = request.body;

    if (ip !== undefined && !utils.IP.is(ip)) {
        throw new APIError({
            code: 2, request
        });
    }

    if (!(await DB.devices.exists({ id }))) {
        throw new APIError({
            code: 21, request
        });
    }

    if (prevAreaId !== null && prevAreaId !== undefined && (prevAreaId === nextAreaId)) {
        throw new APIError({
            code: 26, request
        });
    }

    if (prevAreaId !== null || nextAreaId !== null) {
        const total = +(prevAreaId !== null && prevAreaId !== undefined) + +(nextAreaId !== null && nextAreaId !== undefined);

        if (total !== (await DB.areas.count({
            id: {
                $in: [
                    prevAreaId,
                    nextAreaId
                ]
            }
        }))) {
            throw new APIError({
                code: 18, request
            });
        }
    }

    await DB.devices.updateOne({
        id
    }, {
        $set: {
            title,
            description,
            prevAreaId,
            nextAreaId,
            isEnabled,
            ip
        }
    });

    return 1;
});
