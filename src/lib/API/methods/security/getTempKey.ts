import CryptoJS,{ AES,PBKDF2 } from "crypto-js";
import server from "../..";
import DB from "../../../DB";

server.post("/security.getTempKey", (request) => {
    const keyInfo = {
        userId: request.user.id,
        createdAt: Date.now()
    };

    const encryptedKeyInfo = AES.encrypt(
        JSON.stringify(keyInfo),
        DB.config.server.tempKeySecret
    ).toString();

    const sign = PBKDF2(encryptedKeyInfo, DB.config.server.tempKeySecret, {
        keySize: 16
    }).toString(CryptoJS.enc.Base64);

    return {
        key: encryptedKeyInfo,
        sign,
        expireIn: DB.config.server.tempKeyTTL * 1000
    };
});
