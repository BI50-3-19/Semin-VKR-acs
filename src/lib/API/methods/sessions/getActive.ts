import server from "../..";

import DB from "../../../DB";

server.post("/sessions.getActive", async (request) => {
    const sessions = await DB.sessions.find({
        userId: request.user.id
    }, {
        _id: true,
        lastUsedAt: true,
        createdAt: true
    }).lean();

    return sessions.map((session) => {
        return {
            id: session._id,
            lastUsedAt: session.lastUsedAt,
            createdAt: session.createdAt
        };
    });
});
