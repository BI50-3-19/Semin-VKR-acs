import utils from "@rus-anonym/utils";
import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";
import CryptoJS, { PBKDF2 } from "crypto-js";

server.post("/devices.create", {
    schema: {
        body: Type.Object({
            title: Type.String(),
            description: Type.Optional(Type.String()),
            prevAreaId: Type.Union([Type.Number(), Type.Null()]),
            nextAreaId: Type.Union([Type.Number(), Type.Null()]),
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

    const { title, description, prevAreaId, nextAreaId, ip, isEnabled } = request.body;

    if (ip !== undefined && !utils.IP.is(ip)) {
        throw new APIError({
            code: 2, request
        });
    }

    if (await DB.devices.exists({ title })) {
        throw new APIError({
            code: 22, request
        });
    }

    if (prevAreaId !== null && (prevAreaId === nextAreaId)) {
        throw new APIError({
            code: 26, request
        });
    }

    if (prevAreaId !== null || nextAreaId !== null) {
        const total = +(prevAreaId !== null) + +(nextAreaId !== null);

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

    const id = ++DB.cache.lastAreaId;

    const token = PBKDF2(`device-${id}-${Date.now()}`, DB.config.db.salt, {
        keySize: 12
    }).toString(CryptoJS.enc.Base64);

    await DB.devices.insertMany([
        {
            id,
            token,
            title,
            description,
            prevAreaId,
            nextAreaId,
            isEnabled,
            ip
        }
    ]);

    return 1;
});
