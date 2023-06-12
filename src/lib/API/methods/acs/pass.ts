import server from "../..";

import { Type } from "@sinclair/typebox";
import ACS from "../../../ACS";
import DB from "../../../DB";
import { PassLogUnsuccesfulReasons } from "../../../DB/schemes/passLog";
import { SecurityIncidents } from "../../../DB/schemes/securityIncident";
import APIError from "../../Error";

const DIRECTIONS = ["next", "prev"] as const;

server.post("/acs.pass", {
    schema: {
        body: Type.Object({
            key: Type.String(),
            direction: Type.Union(DIRECTIONS.map(x => Type.Literal(x)))
        }),
        response: {
            200: Type.Boolean()
        }
    }
}, async (request) => {
    const device = request.deviceData;
    const { key, direction } = request.body;
    const date = new Date();

    const keyInfo = await DB.keys.findOne({ key }).lean();

    if (keyInfo === null || keyInfo.isBlocked || keyInfo.isDeleted) {
        return false;
    }

    if (keyInfo.expiresIn && keyInfo.expiresIn < new Date()) {
        void DB.keys.updateOne({ key }, { $set: { isDeleted: true } });
        return false;
    }

    const user = await DB.cache.getUser(keyInfo.userId);

    if (user === null) {
        void ACS.addSecurityIncident({
            type: SecurityIncidents.UserNotFound,
            userId: keyInfo.userId,
            creator: {
                type: "acs",
                deviceId: device.id
            }
        });
        return false;
    }

    if (device.isEnabled === false) {
        void ACS.addPassLog({
            user,
            log: {
                type: "unsuccessful",
                keyId: keyInfo.id,
                reason: PassLogUnsuccesfulReasons.DisabledDevice,
                creator: {
                    type: "acs",
                    deviceId: device.id
                }
            }
        });
        return false;
    }

    const prevAreaId = direction === "next" ? device.prevAreaId : device.nextAreaId;
    const nextAreaId = direction === "prev" ? device.prevAreaId : device.nextAreaId;
    const areaId = nextAreaId === null ? prevAreaId : nextAreaId;

    if (areaId === null) {
        void ACS.addSecurityIncident({
            type: SecurityIncidents.AreaNotFound,
            areaId: 0,
            userId: user.id,
            creator: {
                type: "acs",
                deviceId: device.id
            }
        });
        return false;
    }

    const area = await DB.cache.getArea(areaId);

    if (area === null) {
        void ACS.addSecurityIncident({
            type: SecurityIncidents.AreaNotFound,
            areaId,
            userId: user.id,
            creator: {
                type: "acs",
                deviceId: device.id
            }
        });
        throw new APIError({
            code: 18, request
        });
    }

    if (area.isLocked) {
        await ACS.addPassLog({
            user,
            log: {
                type: "unsuccessful",
                keyId: keyInfo.id,
                reason: PassLogUnsuccesfulReasons.AreaIsLocked,
                areaId: area.id,
                creator: {
                    type: "acs",
                    deviceId: device.id
                }
            }
        });
        return false;
    }

    const isAllow = await ACS.hasAccess({
        user,
        date,
        area
    });

    if (isAllow) {
        const pass = await ACS.addPassLog({
            user,
            log: {
                type: "successful",
                keyId: keyInfo.id,
                creator: {
                    type: "acs",
                    deviceId: device.id
                },
                prevAreaId,
                areaId: nextAreaId,
            }
        });
        void DB.keys.updateOne({ key }, {
            $inc: {
                passes: 1
            },
            $set: {
                lastPassId: pass.id
            }
        });
        return true;
    } else {
        await ACS.addPassLog({
            user,
            log: {
                type: "unsuccessful",
                keyId: keyInfo.id,
                reason: PassLogUnsuccesfulReasons.OutsideUserSchedule,
                areaId: area.id,
                creator: {
                    type: "acs",
                    deviceId: device.id
                },
            }
        });
        return false;
    }
});
