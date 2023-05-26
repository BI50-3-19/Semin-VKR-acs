import server from "../..";

import DB from "../../../DB";

server.post("/sessions.reset", async (request) => {
    const result = await DB.sessions.deleteMany({
        refreshToken: {
            $ne: request.session.refreshToken
        }
    }).lean();

    return result.deletedCount !== 0;
});
