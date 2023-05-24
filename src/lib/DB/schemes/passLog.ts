import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const passLogBox = Type.Object({
    id: Type.Number(),
    date: Type.Date(),
    userId: Type.Number(),
    prevAreaId: Type.Union([Type.Number(), Type.Null()]),
    nextAreaId: Type.Union([Type.Number(), Type.Null()]),
});

type TPassLogBox = Static<typeof passLogBox>

const passLogSchema = new Schema<TPassLogBox>({
    id: {
        type: Schema.Types.Number,
        unique: true,
        required: true
    },
    date: {
        type: Schema.Types.Date,
        required: true
    },
    userId: {
        type: Schema.Types.Number,
        required: true
    },
    prevAreaId: {
        type: Schema.Types.Number,
        required: false
    },
    nextAreaId: {
        type: Schema.Types.Number,
        required: false
    }
}, {
    versionKey: false
});

export type { TPassLogBox };

export { passLogBox };

export default passLogSchema;
