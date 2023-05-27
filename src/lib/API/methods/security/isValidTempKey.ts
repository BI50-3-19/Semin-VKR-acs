import { Type } from "@sinclair/typebox";
import CryptoJS, { AES, PBKDF2 } from "crypto-js";

import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

server.post("/security.isValidTempKey", {
    schema: {
        body: Type.Object({
            userId: Type.Number(),
            key: Type.String(),
            sign: Type.String()
        })
    }
}, (request) => {
    if (!request.userHasAccess("security")) {
        throw new APIError({
            code: 8, request
        });
    }

    const { userId, key, sign } = request.body;

    const keySign = PBKDF2(key, DB.config.server.tempKeySecret, {
        keySize: 16
    }).toString(CryptoJS.enc.Base64);

    if (keySign !== sign) {
        return {
            status: false,
            reason: "INVALID_SIGN"
        };
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
        return {
            status: false,
            reason: "INVALID_USER_ID"
        };
    }

    if (Date.now() > tempKeyInfo.createdAt + DB.config.server.tempKeyTTL * 1000) {
        return {
            status: false,
            reason: "EXPIRED"
        };
    }

    return {
        status: true
    };
});
