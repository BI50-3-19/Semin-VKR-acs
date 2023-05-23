import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const DEVICE_TYPES = ["middle", "end"] as const;

const deviceBox = Type.Object({
    id: Type.Number(),
    token: Type.String(),
    areaId: Type.Number(),
    type: Type.Union(DEVICE_TYPES.map((type) => Type.Literal(type))),
});

type TDeviceBox = Static<typeof deviceBox>

const deviceSchema = new Schema<TDeviceBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    } ,
    token: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    type: {
        type: Schema.Types.String,
        required: true,
        validate: [(val: TDeviceBox["type"]): boolean => DEVICE_TYPES.includes(val), "Invalid device type"],
    },
    areaId: {
        type: Schema.Types.Number,
        required: true
    }
}, {
    versionKey: false
});

export type { TDeviceBox };

export { deviceBox };

export default deviceSchema;
