import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const SECURITY_INCIDENTS_TYPES = [
    "device-is-disabled",
    "user-not-found",
    "area-not-found",
    "area-is-locked",
    "unauthorized-user",
    "new-entrance-without-exit"
] as const;

const securityIncidentCreatorAcs = Type.Object({
    type: Type.Literal("acs")
});

const securityIncidentCreatorUser = Type.Object({
    type: Type.Literal("user"),
    userId: Type.Number()
});

const securityIncidentCreator = Type.Union([
    securityIncidentCreatorAcs,
    securityIncidentCreatorUser
]);

type TSecurityIncidentCreatorBox = Static<typeof securityIncidentCreator>;

const securityIncidentBox = Type.Object({
    id: Type.Number(),
    type: Type.Union(SECURITY_INCIDENTS_TYPES.map(x => Type.Literal(x))),
    userId: Type.Number(),
    deviceId: Type.Optional(Type.Number()),
    passLogId: Type.Optional(Type.Number()),
    message: Type.Optional(Type.String()),
    creator: securityIncidentCreator,
    createdAt: Type.Date()
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
    },
    userId: {
        type: Schema.Types.Number,
        required: true
    },
    deviceId: {
        type: Schema.Types.Number,
        required: false
    },
    passLogId: {
        type: Schema.Types.Number,
        required: false
    },
    message: {
        type: Schema.Types.String,
        required: false
    },
    creator: {
        type: new Schema<TSecurityIncidentCreatorBox>({
            type: {
                type: Schema.Types.String,
                required: true
            },
            userId: {
                type: Schema.Types.Number,
                required: false
            }
        }, {
            versionKey: false,
            _id: false
        }),
        required: true
    },
    createdAt: {
        type: Schema.Types.Date,
        required: true
    }
}, {
    versionKey: false
});

export type { TSecurityIncidentBox };

export { securityIncidentBox, SECURITY_INCIDENTS_TYPES };

export default securityIncidentSchema;
