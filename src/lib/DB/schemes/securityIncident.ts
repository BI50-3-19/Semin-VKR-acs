import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const SECURITY_INCIDENTS_TYPES = [
    "device-is-disabled",
    "user-not-found",
    "area-not-found",
    "area-is-locked",
    "unauthorized-user"
] as const;

const securityIncidentBox = Type.Object({
    id: Type.Number(),
    type: Type.Union(SECURITY_INCIDENTS_TYPES.map(x => Type.Literal(x)))
});

type TSecurityIncidentBox = Static<typeof securityIncidentBox>;

const securityIncidentSchema = new Schema<TSecurityIncidentBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    },
    type: {
        type: Schema.Types.String,
        required: true
    }
}, {
    versionKey: false
});

export type { TSecurityIncidentBox };

export { securityIncidentBox, SECURITY_INCIDENTS_TYPES };

export default securityIncidentSchema;
