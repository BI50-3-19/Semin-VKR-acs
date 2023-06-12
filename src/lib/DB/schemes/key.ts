
import { Static, Type } from "@sinclair/typebox";
import { Schema } from "mongoose";

const keyBox = Type.Object({
    id: Type.Number(),
    key: Type.String(),
    userId: Type.Number(),
    passes: Type.Number(),
    lastPassId: Type.Optional(Type.Number()),
    expiresIn: Type.Optional(Type.Date()),
    createdAt: Type.Date(),
    isBlocked: Type.Boolean(),
    isDeleted: Type.Boolean(),
    creatorId: Type.Number()
});

type TKeyBox = Static<typeof keyBox>;

const keySchema = new Schema<TKeyBox>({
    id: {
        type: Schema.Types.Number,
        unique: true,
        required: true
    },
    key: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    userId: {
        type: Schema.Types.Number,
        required: true
    },
    passes: {
        type: Schema.Types.Number,
        required: true,
        default: 0
    },
    lastPassId: {
        type: Schema.Types.Number,
        required: false
    },
    expiresIn: {
        type: Schema.Types.Date,
        required: false
    },
    createdAt: {
        type: Schema.Types.Date,
        required: true,
        default: Date.now
    },
    creatorId: {
        type: Schema.Types.Number,
        required: true
    },
    isDeleted: {
        type: Schema.Types.Boolean,
        required: true,
        default: false
    }
});

export type { TKeyBox };

export default keySchema;
