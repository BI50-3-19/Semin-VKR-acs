import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const userAuthBox = Type.Object({
    roleId: Type.Number(),
    login: Type.String(),
    password: Type.String(),
    otp: Type.Optional(Type.String())
});

type TUserAuthBox = Static<typeof userAuthBox>

const userAuthSchema = new Schema<TUserAuthBox>({
    roleId: {
        type: Schema.Types.Number,
        required: true,
    },
    login: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    otp: {
        type: Schema.Types.String,
        required: false
    }
}, {
    versionKey: false,
    _id: false
});

const userBox = Type.Object({
    id: Type.Number(),
    groups: Type.Array(Type.Number()),
    auth: Type.Optional(userAuthBox),
    name: Type.String(),
    surname: Type.String(),
    patronymic: Type.Optional(Type.String())
});

type TUserBox = Static<typeof userBox>

const userSchema = new Schema<TUserBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    },
    groups: {
        type: [Schema.Types.Number],
        required: false
    },
    auth: {
        type: userAuthSchema,
        required: false
    },
    name: {
        type: Schema.Types.String,
        required: true
    },
    surname: {
        type: Schema.Types.String,
        required: true
    },
    patronymic: {
        type: Schema.Types.String,
        required: false
    }
}, {
    versionKey: false
});

export type { TUserBox };

export { userBox };

export default userSchema;
