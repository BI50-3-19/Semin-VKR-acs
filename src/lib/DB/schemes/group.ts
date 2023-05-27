import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const groupBox = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    areas: Type.Array(Type.Number()),
    scheduleId: Type.Number()
});

type TGroupBox = Static<typeof groupBox>

const groupSchema = new Schema<TGroupBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    },
    name: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    areas: {
        type: [Schema.Types.Number],
        required: true
    },
    scheduleId: {
        type: Schema.Types.Number,
        required: true,
    }
}, {
    versionKey: false
});

export type { TGroupBox };
export { groupBox };


export default groupSchema;
