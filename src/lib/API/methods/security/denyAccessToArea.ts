import { Type } from "@sinclair/typebox";

import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";
import ACS from "../../../ACS";
import { SecurityIncidents } from "../../../DB/schemes/securityIncident";
import { PassLogUnsuccesfulReasons } from "../../../DB/schemes/passLog";

const DIRECTIONS = ["next", "prev"] as const;

server.post("/security.denyAccessToArea", {
    schema: {
        body: Type.Object({
            userId: Type.Number(),
            nextAreaId: Type.Union([Type.Number(), Type.Null()]),
            prevAreaId: Type.Union([Type.Number(), Type.Null()]),
            direction: Type.Union(DIRECTIONS.map(x => Type.Literal(x))),
            reasonId: Type.Optional(Type.Number()),
            comment: Type.Optional(Type.String())
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

    const {
        userId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        nextAreaId: _nextAreaId,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        prevAreaId: _prevAreaId,
        direction,
        reasonId,
        comment
    } = request.body;

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
    const isAllow = await ACS.hasAccess({
        user,
        date,
        area
    });

    const log = await ACS.addPassLog({
        user,
        log: {
            type: "unsuccessful",
            reason: PassLogUnsuccesfulReasons.SecurityDenyAccess,
            areaId,
            reasonId,
            comment,
            creator: {
                type: "user",
                userId: securityId
            }
        }
    });

    if (area.isLocked === false && isAllow) {
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

    if (comment === undefined && reasonId === undefined) {
        void ACS.addSecurityIncident({
            type: SecurityIncidents.SecurityDenyAccessWithoutReason,
            userId,
            passLogId: log.id,
            creator: {
                type: "user",
                userId: securityId
            }
        });
    }

    return true;
});
