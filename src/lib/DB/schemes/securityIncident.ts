import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

enum SecurityIncidents {
    UserNotFound = "user-not-found",
    AreaNotFound = "area-not-found",
    EnterWithoutExit = "new-enter-without-exit",
    EnterWithoutAccess = "enter-without-access",
    SecurityDenyAccessWithoutReason = "security-deny-access"
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
        creator: securityIncidentCreator
    }),
    Type.Union([
        Type.Object({
            type: Type.Literal(SecurityIncidents.UserNotFound)
        }),
        Type.Object({
            type: Type.Literal(SecurityIncidents.AreaNotFound),
            areaId: Type.Number()
        }),
        Type.Object({
            type: Type.Literal(SecurityIncidents.EnterWithoutExit),
            prevPassLogId: Type.Number(),
            passLogId: Type.Number()
        }),
        Type.Object({
            type: Type.Literal(SecurityIncidents.EnterWithoutAccess),
            areaId: Type.Number(),
            passLogId: Type.Number()
        }),
        Type.Object({
            type: Type.Literal(SecurityIncidents.SecurityDenyAccessWithoutReason),
            creator: securityIncidentCreatorUser,
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

export { SecurityIncidents, securityIncidentBox };
export type {
    TFullSecurityIncidentBox, TSecurityIncidentBox, TSecurityIncidentCreatorBox
};


export default securityIncidentSchema;
