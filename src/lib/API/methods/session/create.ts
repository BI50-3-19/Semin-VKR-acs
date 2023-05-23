import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import CryptoJS, { PBKDF2 } from "crypto-js";
import { Type } from "@sinclair/typebox";

server.post("/session.create" ,{
    schema: {
        body: Type.Object({
            login: Type.String(),
            password: Type.String(),
            otp: Type.Optional(Type.String())
        })
    }
}, async (request) => {
    const password = PBKDF2(request.body.password, DB.config.db.salt).toString(CryptoJS.enc.Base64);

    const user = await DB.users.findOne({
        "auth.login": request.body.login,
        "auth.password": password
    }).lean();

    if (user === null) {
        throw new APIError({
            code: 4, request
        });
    }

    return {
        token: server.jwt.sign({
            id: user.id
        })
    };
});
