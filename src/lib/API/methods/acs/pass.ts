import server from "../..";

import { Type } from "@sinclair/typebox";
import DB from "../../../DB";
import ACS from "../../../ACS";
import { SecurityIncidents } from "../../../DB/schemes/securityIncident";
import { PassLogUnsuccesfulReasons } from "../../../DB/schemes/passLog";

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

    if (area.isLocked) {
        void ACS.addPassLog({
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
        void ACS.addPassLog({
            user,
            log: {
                type: "successful",
                creator: {
                    type: "acs",
                    deviceId: device.id
                },
                prevAreaId,
                nextAreaId,
            }
        });
        return true;
    } else {
        void ACS.addPassLog({
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
