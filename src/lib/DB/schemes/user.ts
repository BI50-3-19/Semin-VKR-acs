import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const userAuthBox = Type.Object({
    login: Type.String(),
    password: Type.String(),
    passwordUpdatedAt: Type.Date(),
    otp: Type.Optional(Type.String())
});

type TUserAuthBox = Static<typeof userAuthBox>

const userAuthSchema = new Schema<TUserAuthBox>({
    login: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    passwordUpdatedAt: {
        type: Schema.Types.Date,
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
    roleId: Type.Number(),
    groups: Type.Array(Type.Number()),
    lastPassId: Type.Optional(Type.Number()),
    auth: Type.Optional(userAuthBox),
    name: Type.String(),
    surname: Type.String(),
    patronymic: Type.Optional(Type.String()),
    hasAvatar: Type.Boolean()
});

type TUserBox = Static<typeof userBox>

const userSchema = new Schema<TUserBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    },
    roleId: {
        type: Schema.Types.Number,
        required: true,
    },
    groups: {
        type: [Schema.Types.Number],
        required: false
    },
    lastPassId: {
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
    },
    hasAvatar: {
        type: Schema.Types.Boolean,
        required: true
    }
}, {
    versionKey: false
});

export type { TUserBox };
export { userBox };


export default userSchema;
