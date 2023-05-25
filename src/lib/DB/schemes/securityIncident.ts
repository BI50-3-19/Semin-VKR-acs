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

const securityIncidentBox = Type.Intersect([
    Type.Object({
        type: Type.Union(SECURITY_INCIDENTS_TYPES.map(x => Type.Literal(x))),
        userId: Type.Number(),
        creator: securityIncidentCreator,
        message: Type.Optional(Type.String())
    }),
    Type.Union([
        Type.Object({
            type: Type.Literal("device-is-disabled"),
            creator: securityIncidentCreatorAcs,
            deviceId: Type.Number()
        }),
        Type.Object({
            type: Type.Literal("area-not-found"),
            creator: securityIncidentCreatorAcs,
            deviceId: Type.Number(),
            areaId: Type.Number()
        }),
        Type.Object({
            type: Type.Literal("area-is-locked"),
            areaId: Type.Number()
        }),
        Type.Union([
            Type.Object({
                type: Type.Literal("unauthorized-user"),
                creator: securityIncidentCreatorAcs,
                deviceId: Type.Number(),
                areaId: Type.Number()
            }),
            Type.Object({
                type: Type.Literal("unauthorized-user"),
                creator: securityIncidentCreatorUser,
                areaId: Type.Number()
            }),
        ]),
        Type.Object({
            type: Type.Literal("new-entrance-without-exit"),
            prevAreaId: Type.Number(),
            areaId: Type.Number(),
            prevPassLogId: Type.Number(),
            passLogId: Type.Number()
        })
    ])
]);

const fullSecurityIncidentBox = Type.Intersect([
    Type.Object({
        id: Type.Number(),
        createdAt: Type.Date()
    }),
    securityIncidentBox
]);

type TSecurityIncidentBox = Static<typeof securityIncidentBox>;
type TFullSecurityIncidentBox = Static<typeof fullSecurityIncidentBox>;

const securityIncidentSchema = new Schema<TFullSecurityIncidentBox>({
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
    prevPassLogId: {
        type: Schema.Types.Number,
        required: false
    },
    areaId: {
        type: Schema.Types.Number,
        required: false
    },
    prevAreaId: {
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

export type {
    TSecurityIncidentBox,
    TFullSecurityIncidentBox,
    TSecurityIncidentCreatorBox
};

export { securityIncidentBox, SECURITY_INCIDENTS_TYPES };

export default securityIncidentSchema;
