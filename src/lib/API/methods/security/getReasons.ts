import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

server.post("/security.getReasons", async (request) => {
    if (!request.userHasAccess("security")) {
        throw new APIError({
            code: 8, request
        });
    }

    const reasons = await DB.securityReasons.find({}, {
        _id: false,
        id: true,
        title: true
    }).lean();

    return reasons;
});
