import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const scheduleDayBox = Type.Object({
    day: Type.Number({ minimum: 0, maximum: 6 }),
    start: Type.Optional(
        Type.Object({
            hour: Type.Number({ minimum: 0, maximum: 23 }),
            minute: Type.Number({ minimum: 0, maximum: 59 }),
        })
    ),
    end: Type.Optional(
        Type.Object({
            hour: Type.Number({ minimum: 0, maximum: 23 }),
            minute: Type.Number({ minimum: 0, maximum: 59 }),
        })
    )
});

type TScheduleDayBox = Static<typeof scheduleDayBox>

const scheduleDaySchema = new Schema<TScheduleDayBox>({
    day: {
        type: Schema.Types.Number,
        required: true
    },
    start: {
        type: new Schema<TScheduleDayBox["start"]>({
            hour: {
                type: Schema.Types.Number,
                required: true
            },
            minute: {
                type: Schema.Types.Number,
                required: true
            }
        }, { versionKey: false, _id: false }),
        required: false
    },
    end: {
        type: new Schema<TScheduleDayBox["end"]>({
            hour: {
                type: Schema.Types.Number,
                required: true
            },
            minute: {
                type: Schema.Types.Number,
                required: true
            }
        }, { versionKey: false, _id: false }),
        required: false
    }
}, { versionKey: false, _id: false });

const scheduleBox = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    range: Type.Optional(
        Type.Object({
            start: Type.Date(),
            end: Type.Date()
        })
    ),
    week: Type.Array(scheduleDayBox, {
        minItems: 1,
        maxItems: 7
    }),
    isDisable: Type.Boolean()
});

type TScheduleBox = Static<typeof scheduleBox>

const scheduleSchema = new Schema<TScheduleBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    },
    name: {
        type: Schema.Types.String,
        unique: true,
        required: true
    },
    range: {
        type: new Schema<TScheduleBox["range"]>({
            start: {
                type: Schema.Types.Date,
                required: true
            },
            end: {
                type: Schema.Types.Date,
                required: true
            }
        }, { versionKey: false, _id: false }),
        required: false
    },
    week: {
        type: [scheduleDaySchema],
        required: true
    }
}, {
    versionKey: false
});

export type { TScheduleBox, TScheduleDayBox };

export {
    scheduleBox, scheduleDayBox, scheduleDaySchema
};

export default scheduleSchema;
