import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

import { scheduleDayBox, scheduleDaySchema } from "./schedule";

const tempPassTypes = ["user", "group"] as const;

const tempUserPass = Type.Object({
    type: Type.Literal("user"),
    isUsed: Type.Boolean(),
    used: Type.Undefined(),
    isOneTime: Type.Literal(true)
});

const tempGroupPass = Type.Object({
    type: Type.Literal("group"),
    used: Type.Array(Type.Number()),
    isUsed: Type.Undefined(),
    isOneTime: Type.Literal(true)
});

const tempPassMain = Type.Object({
    type: Type.Union(tempPassTypes.map(x => Type.Literal(x))),
    id: Type.Number(),
    range: Type.Object({
        start: Type.Date(),
        end: Type.Date()
    }),
    areas: Type.Array(Type.Number()),
    week: Type.Array(scheduleDayBox, {
        minItems: 1,
        maxItems: 7
    }),
    isOneTime: Type.Boolean()
});

const tempPassBox = Type.Intersect([
    Type.Union([tempUserPass, tempGroupPass]),
    tempPassMain
]);

type TTempPassBox = Static<typeof tempPassBox>

const tempPassSchema = new Schema<TTempPassBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true
    },
    range: {
        type: new Schema<TTempPassBox["range"]>({
            start: {
                type: Schema.Types.Date,
                required: true
            },
            end: {
                type: Schema.Types.Date,
                required: true
            }
        }, { versionKey: false, _id: false }),
        required: true
    },
    week: {
        type: [scheduleDaySchema],
        required: true
    },
    areas: {
        type: [Schema.Types.Number],
        required: true
    },
    isOneTime: {
        type: Schema.Types.Boolean,
        required: true
    },
    isUsed: {
        type: Schema.Types.Boolean,
        required: false
    },
    used: {
        type: [Schema.Types.Number],
        required: false
    }
}, {
    versionKey: false
});

export type { TTempPassBox };

export { tempPassBox };

export default tempPassSchema;
