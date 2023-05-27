import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

server.post("/areas.getList", async (request) => {
    if (!request.userHasAccess("security")) {
        throw new APIError({
            code: 8, request
        });
    }

    return DB.areas.find({}, {
        _id: false,
        id: true,
        title: true,
        isLocked: true
    });
});
