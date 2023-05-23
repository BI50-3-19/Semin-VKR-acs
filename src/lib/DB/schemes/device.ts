import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const deviceBox = Type.Object({
    id: Type.Number(),
    title: Type.String(),
    description: Type.Optional(Type.String()),
    token: Type.String(),
    prevAreaId: Type.Union([Type.Number(), Type.Null()]),
    nextAreaId: Type.Union([Type.Number(), Type.Null()]),
    lastRequestDate: Type.Optional(Type.Date())
});

type TDeviceBox = Static<typeof deviceBox>

const deviceSchema = new Schema<TDeviceBox>({
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
    },
    token: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    prevAreaId: {
        type: Schema.Types.Number,
        required: true,
    },
    nextAreaId: {
        type: Schema.Types.Number,
        required: true
    },
    lastRequestDate: {
        type: Schema.Types.Date,
        required: false
    }
}, {
    versionKey: false
});

export type { TDeviceBox };

export { deviceBox };

export default deviceSchema;
