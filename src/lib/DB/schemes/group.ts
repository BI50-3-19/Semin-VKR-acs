import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const groupBox = Type.Object({
    id: Type.Number(),
    title: Type.String(),
});

type TGroupBox = Static<typeof groupBox>

const groupSchema = new Schema<TGroupBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    },
    title: {
        type: Schema.Types.String,
        required: true,
    }
}, {
    versionKey: false
});

export type { TGroupBox };

export { groupBox };

export default groupSchema;
