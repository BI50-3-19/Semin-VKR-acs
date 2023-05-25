import server from "../..";
import DB from "../../../DB";
import crypto from "node:crypto";

server.post("/security.getTempKey", (request) => {
    const key = crypto.randomBytes(72).toString("hex");

    DB.cache.setUserTempKey(request.user.id, key);

    return {
        key
    };
});
