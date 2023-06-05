import server from "../..";
import DB from "../../../DB";
import { TUserBox } from "../../../DB/schemes/user";
import APIError from "../../Error";

import raUtils from "@rus-anonym/utils";
import { Type } from "@sinclair/typebox";
import CryptoJS, { PBKDF2 } from "crypto-js";

server.post("/users.create", {
    schema: {
        body: Type.Object({
            login: Type.Optional(Type.String()),
            password: Type.Optional(Type.String()),
            name: Type.String(),
            surname: Type.String(),
            patronymic: Type.String(),
            roleId: Type.Number()
        })
    }
}, async (request) => {
    if (!request.userHasAccess("users:manage")) {
        throw new APIError({
            code: 8, request
        });
    }

    if (!(await DB.roles.exists({ id: request.body.roleId }))) {
        throw new APIError({
            code: 9, request
        });
    }

    let password: string | undefined = request.body.password;

    if (password === undefined) {
        password = "";
        const newPassword: string[] = [];

        const length = 8;
        const letters = "abcdefghijklmnopqrstuvwxyz".split("");
        const numbers = "0123456789".split("");
        const symbols = "!@#$%^&*()_+~`|}{[]\\:;?><,./-=".split("");

        while(newPassword.length < length) {
            const letter = raUtils.array.random(letters);
            newPassword.push(newPassword.length % 2 === 0 ? letter : letter.toUpperCase());
            newPassword.push(raUtils.array.random(numbers));
            newPassword.push(raUtils.array.random(symbols));
        }

        password = newPassword.join("");
    }

    const id = ++DB.cache.lastUserId;

    const user: TUserBox = {
        id,
        name: request.body.name,
        surname: request.body.surname,
        patronymic: request.body.patronymic,
        auth: {
            login: `user-${id}`,
            password: PBKDF2(password, DB.config.db.salt, {
                keySize: 16
            }).toString(CryptoJS.enc.Base64),
            passwordUpdatedAt: new Date()
        },
        groups: [],
        hasAvatar: false,
        isDeleted: false,
        roleId: request.body.roleId
    };

    return {
        id: user.id,
        login: user.auth.login,
        password
    };
});
