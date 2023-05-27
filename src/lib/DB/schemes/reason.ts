import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const securityReasonBox = Type.Object({
    id: Type.Number(),
    title: Type.String()
});

type TSecurityReasonBox = Static<typeof securityReasonBox>

const securityReasonSchema = new Schema<TSecurityReasonBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    },
    title: {
        type: Schema.Types.String,
        required: true,
        unique: true
    }
}, {
    versionKey: false
});

export type { TSecurityReasonBox };
export { securityReasonBox };


export default securityReasonSchema;
