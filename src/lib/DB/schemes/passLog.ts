import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

enum PassLogUnsuccesfulReasons {
    SecurityDenyAccess = "security-deny-access",
    DisabledDevice = "device-is-disabled",
    OutsideUserSchedule = "outside-user-schedule",
    UserNotAuthorized = "unauthorized-user",
    AreaIsLocked = "area-is-locked",
}

const passLogCreatorAcs = Type.Object({
    type: Type.Literal("acs"),
    deviceId: Type.Number()
});

const passLogCreatorUser = Type.Object({
    type: Type.Literal("user"),
    userId: Type.Number()
});

const passLogSuccessfulBox = Type.Object({
    type: Type.Literal("successful"),
    prevAreaId: Type.Union([Type.Number(), Type.Null()]),
    areaId: Type.Union([Type.Number(), Type.Null()]),
    creator: Type.Union([passLogCreatorAcs, passLogCreatorUser])
});

const passLogUnsuccessfulBox = Type.Intersect([
    Type.Object({
        type: Type.Literal("unsuccessful"),
        creator: Type.Union([passLogCreatorAcs, passLogCreatorUser])
    }),
    Type.Union([
        Type.Object({
            reason: Type.Literal(PassLogUnsuccesfulReasons.SecurityDenyAccess),
            areaId: Type.Number(),
            creator: passLogCreatorUser,
            reasonId: Type.Optional(Type.Number()),
            comment: Type.Optional(Type.String()),
        }),
        Type.Object({
            reason: Type.Literal(PassLogUnsuccesfulReasons.DisabledDevice),
            creator: passLogCreatorAcs,
        }),
        Type.Object({
            reason: Type.Literal(PassLogUnsuccesfulReasons.OutsideUserSchedule),
            areaId: Type.Number()
        }),
        Type.Object({
            reason: Type.Literal(PassLogUnsuccesfulReasons.AreaIsLocked),
            areaId: Type.Number()
        }),
        Type.Object({
            reason: Type.Literal(PassLogUnsuccesfulReasons.UserNotAuthorized),
            areaId: Type.Number()
        })
    ])
]);

const passLogBox = Type.Union([passLogSuccessfulBox, passLogUnsuccessfulBox]);

const passFullLogBox = Type.Intersect([
    Type.Object({
        id: Type.Number(),
        date: Type.Date(),
        userId: Type.Number()
    }),
    passLogBox
]);

type TPassLogBox = Static<typeof passLogBox>
type TPassFullLogBox = Static<typeof passFullLogBox>

const passLogSchema = new Schema<TPassFullLogBox>({
    id: {
        type: Schema.Types.Number,
        unique: true,
        required: true
    },
    date: {
        type: Schema.Types.Date,
        required: true
    },
    userId: {
        type: Schema.Types.Number,
        required: true
    },
    prevAreaId: {
        type: Schema.Types.Number,
        required: false
    },
    areaId: {
        type: Schema.Types.Number,
        required: false
    }
}, {
    versionKey: false
});

export type { TPassFullLogBox, TPassLogBox };

export { PassLogUnsuccesfulReasons, passFullLogBox };

export default passLogSchema;
