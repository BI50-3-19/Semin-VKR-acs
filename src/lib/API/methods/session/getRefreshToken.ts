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
    const currentAccessToken = request.headers["authorization"]?.split(" ")[1] as string;

    const [refreshToken, user] = await Promise.all([
        DB.refreshTokens.findOneAndDelete({
            token: request.body.refreshToken,
            accessToken: currentAccessToken,
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

    const accessToken = server.jwt.sign({
        id: refreshToken.userId,
        hash: MD5(user.auth.password).toString(CryptoJS.enc.Base64),
        createdAt: Date.now()
    });

    return {
        userId: refreshToken.userId,
        accessToken,
        refreshToken: (await utils.createRefreshToken(refreshToken.userId, accessToken)).token
    };
});
