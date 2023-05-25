import server from "../..";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";
import utils from "../../../utils";
import DB from "../../../DB";
import CryptoJS, { MD5 } from "crypto-js";

server.post("/session.getRefreshToken", {
    schema: {
        body: Type.Object({
            refreshToken: Type.String()
        })
    }
}, async (request) => {
    const [refreshToken, user] = await Promise.all([
        DB.refreshTokens.findOneAndDelete({
            token: request.body.refreshToken,
            userId: request.user.id
        }).lean(),
        DB.users.findOne({
            id: request.user.id
        }).lean()
    ]);

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

    return {
        userId: refreshToken.userId,
        accessToken: server.jwt.sign({
            id: refreshToken.userId,
            hash: MD5(user.auth.password).toString(CryptoJS.enc.Base64),
            createdAt: Date.now()
        }),
        refreshToken: (await utils.createRefreshToken(refreshToken.userId)).token
    };
});
