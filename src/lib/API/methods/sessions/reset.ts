import server from "../..";

import DB from "../../../DB";

server.post("/sessions.reset", async (request) => {
    const sessions = await DB.sessions.find({
        refreshToken: {
            $ne: request.session.refreshToken
        }
    }, {
        accessToken: true
    }).lean();

    for (const session of sessions) {
        DB.cache.data.del(`jwt-token-${session.accessToken}`);
    }

    await DB.sessions.deleteMany({
        refreshToken: {
            $ne: request.session.refreshToken
        }
    });

    return sessions.length !== 0;
});
