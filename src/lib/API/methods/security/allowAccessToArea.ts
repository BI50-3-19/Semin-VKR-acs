import { Type } from "@sinclair/typebox";

import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";
import ACS from "../../../ACS";
import { SecurityIncidents } from "../../../DB/schemes/securityIncident";

const DIRECTIONS = ["next", "prev"] as const;

server.post("/security.allowAccessToArea", {
    schema: {
        body: Type.Object({
            userId: Type.Number(),
            nextAreaId: Type.Union([Type.Number(), Type.Null()]),
            prevAreaId: Type.Union([Type.Number(), Type.Null()]),
            direction: Type.Union(DIRECTIONS.map(x => Type.Literal(x)))
        })
    }
}, async (request) => {
    if (!request.userHasAccess("security")) {
        throw new APIError({
            code: 8, request
        });
    }

    const date = new Date();
    const securityId = request.user.id;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { userId, nextAreaId: _nextAreaId, prevAreaId: _prevAreaId, direction } = request.body;

    const prevAreaId = direction === "next" ? _prevAreaId : _nextAreaId;
    const nextAreaId = direction === "prev" ? _prevAreaId : _nextAreaId;
    const areaId = nextAreaId === null ? prevAreaId : nextAreaId;

    if (areaId === null) {
        void ACS.addSecurityIncident({
            type: SecurityIncidents.AreaNotFound,
            areaId: 0,
            userId,
            creator: {
                type: "user",
                userId: securityId
            }
        });
        return false;
    }

    const user = await DB.cache.getUser(userId);

    if (user === null) {
        void ACS.addSecurityIncident({
            type: SecurityIncidents.UserNotFound,
            userId,
            creator: {
                type: "user",
                userId: securityId
            }
        });

        throw new APIError({
            code: 7, request
        });
    }

    const area = await DB.cache.getArea(areaId);

    if (area === null) {
        void ACS.addSecurityIncident({
            type: SecurityIncidents.AreaNotFound,
            areaId,
            userId,
            creator: {
                type: "user",
                userId: securityId
            }
        });
        throw new APIError({
            code: 18, request
        });
    }

    const isAllow = await ACS.hasAccess({
        user,
        date,
        area
    });

    if (area.isLocked || !isAllow) {
        void ACS.addSecurityIncident({
            type: SecurityIncidents.EnterWithoutAccess,
            userId,
            areaId,
            creator: {
                type: "user",
                userId: securityId
            }
        });
    }

    void ACS.addPassLog({
        user,
        log: {
            type: "successful",
            creator: {
                type: "user",
                userId: securityId
            },
            areaId,
            prevAreaId,
        }
    });

    return true;
});
