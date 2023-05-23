import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

server.post("/users.get", async (request) => {
    const user = await DB.users.findOne({
        id: request.user.id
    }).lean();

    if (user === null) {
        throw new APIError({
            code: 6, request
        });
    }

    return {
        id: user.id,
        name: user.name,
        surname: user.surname,
        patronymic: user.patronymic
    };
});
