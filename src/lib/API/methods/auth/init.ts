import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import CryptoJS, { MD5, PBKDF2 } from "crypto-js";
import { Type } from "@sinclair/typebox";
import { authenticator } from "otplib";
import utils from "../../../utils";

server.post("/auth.init", {
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

    if (user === null || !user.auth?.password) {
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

    const accessToken = server.jwt.sign({
        id: user.id,
        hash: MD5(user.auth.password).toString(CryptoJS.enc.Base64),
        createdAt: Date.now()
    });

    return {
        userId: user.id,
        accessToken,
        refreshToken: (await utils.createSession(accessToken, user.id)).refreshToken
    };
});
