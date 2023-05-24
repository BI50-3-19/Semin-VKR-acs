import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const passLogBox = Type.Object({
    date: Type.Date(),
    userId: Type.Number(),
    prevAreaId: Type.Number(),
    nextAreaId: Type.Number()
});

type TPassLogBox = Static<typeof passLogBox>

const passLogSchema = new Schema<TPassLogBox>({
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
        required: true,
        validate: {
            validator: (v: number | null): boolean => v == null || typeof v === "number"
        }
    },
    nextAreaId: {
        type: Schema.Types.Number,
        required: true,
        validate: {
            validator: (v: number | null): boolean => v == null || typeof v === "number"
        }
    }
}, {
    versionKey: false
});

export type { TPassLogBox };

export { passLogBox };

export default passLogSchema;
