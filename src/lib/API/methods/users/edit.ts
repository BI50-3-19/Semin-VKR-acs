import server from "../..";
import DB from "../../../DB";
import APIError from "../../Error";

import { Type } from "@sinclair/typebox";
import CryptoJS, { PBKDF2 } from "crypto-js";

server.post("/users.edit", {
    schema: {
        body: Type.Object({
            userId: Type.Number(),
            login: Type.Optional(Type.String()),
            password: Type.Optional(Type.String()),
            name: Type.Optional(Type.String()),
            surname: Type.Optional(Type.String()),
            patronymic: Type.Optional(Type.String())
        })
    }
}, async (request) => {
    if (!request.userHasAccess("users:manage")) {
        throw new APIError({
            code: 8, request
        });
    }

    const user = await DB.users.findOne({
        id: request.body.userId,
        isDeleted: false
    }).lean();

    if (user === null) {
        throw new APIError({
            code: 7, request
        });
    }

    if (request.body.login !== undefined) {
        if (await DB.users.exists({
            "auth.login": request.body.login
        })) {
            throw new APIError({
                code: 2,
                request
            });
        }
    }

    if (request.body.password !== undefined) {
        const password = request.body.password.split("");
        const length = 8;
        const letters = "abcdefghijklmnopqrstuvwxyz".split("");
        const numbers = "0123456789".split("");
        const symbols = "!@#$%^&*()_+~`|}{[]\\:;?><,./-=".split("");

        const counter = {
            letters: 0,
            numbers: 0,
            symbols: 0
        };

        for (const symbol of password) {
            if (letters.includes(symbol)) {
                counter.letters++;
            } else if (numbers.includes(symbol)) {
                counter.numbers++;
            } else if (symbols.includes(symbol)) {
                counter.symbols++;
            } else {
                throw new APIError({
                    code: 2,
                    request
                });
            }
        }

        if (
            password.length < length ||
            counter.numbers < 1 ||
            counter.symbols < 1
        ) {
            throw new APIError({
                code: 2,
                request
            });
        }

        request.body.password = PBKDF2(password.join(""), DB.config.db.salt, {
            keySize: 16
        }).toString(CryptoJS.enc.Base64);
    }

    await DB.users.updateOne({
        id: request.body.userId
    }, {
        $set: {
            name: request.body.name,
            surname: request.body.surname,
            patronymic: request.body.patronymic,
            "auth.login": request.body.login,
            "auth.password": request.body.password
        }
    });

    return true;
});
