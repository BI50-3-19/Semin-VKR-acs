import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const deviceBox = Type.Object({
    id: Type.Number(),
    token: Type.String(),
    areaId: Type.Number()
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
