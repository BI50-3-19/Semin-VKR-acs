import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const sessionBox = Type.Object({
    userId: Type.Number(),
    refreshToken: Type.String(),
    accessToken: Type.String(),
    lastUsedAt: Type.Date(),
    createdAt: Type.Date()
});

type TSessionBox = Static<typeof sessionBox>

const sessionSchema = new Schema<TSessionBox>({
    userId: {
        type: Schema.Types.Number,
        required: true
    },
    refreshToken: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    accessToken: {
        type: Schema.Types.String,
        required: true
    },
    lastUsedAt: {
        type: Schema.Types.Date,
        required: true
    },
    createdAt: {
        type: Schema.Types.Date,
        required: true
    }
}, {
    versionKey: false
});

export type { TSessionBox };
export { sessionBox };


export default sessionSchema;
