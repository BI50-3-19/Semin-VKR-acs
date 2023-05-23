import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const userBox = Type.Object({
    id: Type.Number(),
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
