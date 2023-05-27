import { Type } from "@sinclair/typebox";

import server from "../..";
import ACS from "../../../ACS";
import DB from "../../../DB";
import { SecurityIncidents } from "../../../DB/schemes/securityIncident";
import APIError from "../../Error";

server.post("/security.checkAccessToArea", {
    schema: {
        body: Type.Object({
            userId: Type.Number(),
            areaId: Type.Number()
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
    const { userId, areaId } = request.body;

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

    return {
        isAllow,
        isAreaLocked: area.isLocked
    };
});
