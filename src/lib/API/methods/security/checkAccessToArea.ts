import { Type } from "@sinclair/typebox";

import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";
import ACS from "../../../ACS";
import { SecurityIncidents } from "../../../DB/schemes/securityIncident";

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
