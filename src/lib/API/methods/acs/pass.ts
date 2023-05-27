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
            userId: Type.Number(),
            direction: Type.Union(DIRECTIONS.map(x => Type.Literal(x)))
        }),
        response: {
            200: Type.Boolean()
        }
    }
}, async (request) => {
    const device = request.deviceData;
    const { userId, direction } = request.body;
    const date = new Date();

    const user = await DB.cache.getUser(userId);

    if (user === null) {
        void ACS.addSecurityIncident({
            type: SecurityIncidents.UserNotFound,
            userId,
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
            userId,
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
        await ACS.addPassLog({
            user,
            log: {
                type: "successful",
                creator: {
                    type: "acs",
                    deviceId: device.id
                },
                prevAreaId,
                areaId: nextAreaId,
            }
        });
        return true;
    } else {
        await ACS.addPassLog({
            user,
            log: {
                type: "unsuccessful",
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
