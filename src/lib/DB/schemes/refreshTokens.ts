import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const refreshTokenBox = Type.Object({
    token: Type.String(),
    userId: Type.Number(),
    createdAt: Type.Date()
});

type TRefreshTokenBox = Static<typeof refreshTokenBox>

const refreshTokenSchema = new Schema<TRefreshTokenBox>({
    token: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    userId: {
        type: Schema.Types.Number,
        required: true
    },
    createdAt: {
        type: Schema.Types.Date,
        required: true
    }
}, {
    versionKey: false
});

export type { TRefreshTokenBox };

export { refreshTokenBox };

export default refreshTokenSchema;
