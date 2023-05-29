import { Type } from "@sinclair/typebox";
import CryptoJS, {
    AES, MD5, PBKDF2
} from "crypto-js";

import server from "../..";
import DB from "../../../DB";
import utils from "../../../utils";
import APIError from "../../Error";

server.post("/auth.byTempKey", {
    schema: {
        body: Type.Object({
            userId: Type.Number(),
            key: Type.String(),
            sign: Type.String()
        })
    }
}, async (request) => {
    const { userId, key, sign } = request.body;

    const keySign = PBKDF2(key, DB.config.server.tempKeySecret, {
        keySize: 16
    }).toString(CryptoJS.enc.Base64);

    if (keySign !== sign) {
        throw new APIError({
            code: 4, request
        });
    }

    const decryptedKey = AES.decrypt(
        key,
        DB.config.server.tempKeySecret
    ).toString(CryptoJS.enc.Utf8);

    const tempKeyInfo = JSON.parse(decryptedKey) as {
        userId: number;
        createdAt: number;
    };

    if (userId !== tempKeyInfo.userId) {
        throw new APIError({
            code: 4, request
        });
    }

    if (Date.now() > tempKeyInfo.createdAt + DB.config.server.tempKeyTTL * 1000) {
        throw new APIError({
            code: 4, request
        });
    }

    const user = await DB.users.findOne({
        id: userId,
        isDeleted: false
    }).lean();

    if (user === null || !user.auth?.password) {
        throw new APIError({
            code: 4, request
        });
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
