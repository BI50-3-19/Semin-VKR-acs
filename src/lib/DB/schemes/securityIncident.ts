import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

enum SecurityIncidents {
    UserNotFound = "user-not-found",
    AreaNotFound = "area-not-found",
    EnterWithoutExit = "new-enter-without-exit"
}

const securityIncidentCreatorAcs = Type.Object({
    type: Type.Literal("acs"),
    deviceId: Type.Number()
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
        userId: Type.Number(),
        creator: securityIncidentCreator,
        message: Type.Optional(Type.String())
    }),
    Type.Union([
        Type.Union([
            Type.Object({
                type: Type.Literal(SecurityIncidents.UserNotFound),
                creator: securityIncidentCreatorAcs
            }),
            Type.Object({
                type: Type.Literal(SecurityIncidents.UserNotFound),
                creator: securityIncidentCreatorUser,
                message: Type.String()
            }),
        ]),
        Type.Object({
            type: Type.Literal(SecurityIncidents.AreaNotFound),
            creator: securityIncidentCreatorAcs,
            areaId: Type.Number()
        }),
        Type.Object({
            type: Type.Literal(SecurityIncidents.EnterWithoutExit),
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
            deviceId: {
                type: Schema.Types.Number,
                required: false
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

export { securityIncidentBox, SecurityIncidents };

export default securityIncidentSchema;
