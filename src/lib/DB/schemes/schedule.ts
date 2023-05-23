import { Schema } from "mongoose";

import { Static, Type } from "@sinclair/typebox";

const scheduleDayBox = Type.Object({
    day: Type.Number(),
    start: Type.Optional(
        Type.Object({
            hour: Type.Number(),
            minute: Type.Number()
        })
    ),
    end: Type.Optional(
        Type.Object({
            hour: Type.Number(),
            minute: Type.Number()
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
    title: Type.String(),
    range: Type.Optional(
        Type.Object({
            start: Type.Date(),
            end: Type.Date()
        })
    ),
    week: Type.Array(scheduleDayBox)
});

type TScheduleBox = Static<typeof scheduleBox>

const scheduleSchema = new Schema<TScheduleBox>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    },
    title: {
        type: Schema.Types.String,
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

export type { TScheduleBox };

export { scheduleBox };

export default scheduleSchema;
