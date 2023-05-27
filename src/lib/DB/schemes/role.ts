import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const roleBox = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    mask: Type.Number()
});

type TRoleBox = Static<typeof roleBox>

const roleSchema = new Schema<TRoleBox>({
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
    mask: {
        type: Schema.Types.Number,
        required: true
    }
}, {
    versionKey: false
});

export type { TRoleBox };
export { roleBox };


export default roleSchema;
