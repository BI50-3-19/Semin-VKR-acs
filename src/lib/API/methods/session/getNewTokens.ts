import server from "../..";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";
import utils from "../../../utils";
import DB from "../../../DB";
import CryptoJS, { MD5 } from "crypto-js";

server.post("/session.getNewTokens", {
    schema: {
        body: Type.Object({
            refreshToken: Type.String()
        })
    }
}, async (request) => {
    const [refreshToken, user] = [
        request.refreshTokenInfo,
        request.userData
    ];

    if (
        refreshToken === null ||
        (refreshToken.createdAt.getTime() + (DB.config.server.refreshTokenTTL * 1000)) < Date.now() ||
        user === null ||
        !user?.auth?.password
    ) {
        throw new APIError({
            code: 4, request
        });
    }

    const accessToken = server.jwt.sign({
        id: request.user.id,
        hash: MD5(user.auth.password).toString(CryptoJS.enc.Base64),
        createdAt: Date.now()
    });

    return {
        userId: request.user.id,
        accessToken,
        refreshToken: (await utils.createRefreshToken(accessToken)).token
    };
});