import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import CryptoJS, { PBKDF2 } from "crypto-js";
import { Type } from "@sinclair/typebox";
import { authenticator } from "otplib";

server.post("/session.create" ,{
    schema: {
        body: Type.Object({
            login: Type.String(),
            password: Type.String(),
            otp: Type.Optional(Type.String())
        })
    }
}, async (request) => {
    const password = PBKDF2(request.body.password, DB.config.db.salt, {
        keySize: 16
    }).toString(CryptoJS.enc.Base64);

    const user = await DB.users.findOne({
        "auth.login": request.body.login,
        "auth.password": password
    }).lean();

    if (user === null) {
        throw new APIError({
            code: 4, request
        });
    }

    if (user.auth?.otp) {
        if (!("otp" in request.body)) {
            throw new APIError({
                code: 5, request
            });
        }

        const code = authenticator.generate(user.auth.otp);

        if (code !== request.body.otp) {
            throw new APIError({
                code: 6, request
            });
        }
    }

    return {
        token: server.jwt.sign({
            id: user.id
        })
    };
});
