import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const areaBox = Type.Object({
    id: Type.Number(),
    title: Type.String(),
    description: Type.Optional(Type.String())
});

type TAreaBox = Static<typeof areaBox>

const areaSchema = new Schema<TAreaBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    },
    title: {
        type: Schema.Types.String,
        required: true,
    },
    description: {
        type: Schema.Types.String,
        required: false
    }
}, {
    versionKey: false
});

export type { TAreaBox };

export { areaBox };

export default areaSchema;
