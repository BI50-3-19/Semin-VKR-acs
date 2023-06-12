import CryptoJS, { SHA512 } from "crypto-js";

import server from "../..";
import DB from "../../../DB";
import { TKeyBox } from "../../../DB/schemes/key";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";

server.post("/security.generateAccessKey", {
    schema: {
        body: Type.Object({
            userId: Type.Number(),
            expiresIn: Type.Optional(Type.Number())
        })
    }
}, async (request) => {
    if (!request.userHasAccess("security:keys")) {
        throw new APIError({
            code: 8, request
        });
    }

    const expiresIn = request.body.expiresIn ? new Date(request.body.expiresIn) : undefined;
    const id = ++DB.cache.lastKeyId;
    const key = SHA512(`key-${id}-${request.body.userId}`).toString(CryptoJS.enc.Base64);

    const box: TKeyBox = {
        id,
        key,
        userId: request.body.userId,
        passes: 0,
        createdAt: new Date(),
        isBlocked: false,
        isDeleted: false,
        expiresIn,
        creatorId: request.user.id
    };

    await DB.keys.insertMany([box]);

    return {
        id,
        key
    };
});
