import server from "../..";

import { Type } from "@sinclair/typebox";
import DB from "../../../DB";
import APIError from "../../Error";
import { TPassLogBox } from "../../../DB/schemes/passLog";

const DIRECTIONS = ["next", "prev"] as const;

const addLog = async (current: Omit<TPassLogBox, "id">): Promise<void> => {
    const id = ++DB.cache.lastPassLogId;
    const latest = await DB.passLogs.findOne({
        userId: current.userId
    }).sort({
        date: -1
    }).lean();

    await DB.passLogs.insertMany([
        {
            ...current,
            id
        }
    ]);

    if (latest === null || (
        latest.prevAreaId !== current.prevAreaId &&
        latest.nextAreaId !== current.nextAreaId
    )) {
        return;
    }

    // Suspicious
};

server.post("/acs.pass", {
    schema: {
        body: Type.Object({
            userId: Type.Number(),
            direction: Type.Union(DIRECTIONS.map(x => Type.Literal(x)))
        })
    }
}, async (request) => {
    const device = request.deviceData;
    const { userId, direction } = request.body;
    const date = new Date();

    if (device.isEnabled === false) {
        throw new APIError({
            code: 24,
            request
        });
    }

    const user = await DB.cache.getUser(userId);

    if (user === null) {
        throw new APIError({
            code: 7,
            request
        });
    }

    const allowed = (log: Omit<TPassLogBox, "id">): boolean => {
        void addLog(log);
        return true;
    };
    const denied = (): void => {
        throw new APIError({
            code: 25,
            request
        });
    };

    const prevAreaId = direction === "next" ? device.prevAreaId : device.nextAreaId;
    const nextAreaId = direction === "prev" ? device.prevAreaId : device.nextAreaId;

    if (nextAreaId === null) {
        // Handle prev area FUUUUUUUCK
        return true;
    }

    const area = await DB.cache.getArea(nextAreaId);

    if (area.isLocked) {
        return denied();
    }

    const userGroups = await DB.groups.find({
        id: { $in: user.groups },
        areas: { $in: [nextAreaId] },
    });

    if (userGroups.length === 0) {
        return denied();
    }

    const currentDay = date.getDay();
    const schedules = await DB.schedules.find({
        id: { $in: userGroups.map(x => x.scheduleId) },
        "week.day": currentDay,
        isDisable: false
    });

    if (schedules.length === 0) {
        return denied();
    }

    const days = schedules.map(x => x.week).flat().filter(x => x.day === currentDay);

    if (days.some(x => x.start === undefined && x.end === undefined)) {
        return allowed({
            date,
            prevAreaId,
            nextAreaId,
            userId
        });
    }

    const totalCurrentMinutes = date.getHours() * 60 + date.getMinutes();

    for (const day of days) {
        if (!day.start || !day.end) {
            continue;
        }

        if (day.start <= totalCurrentMinutes && totalCurrentMinutes <= day.end) {
            return allowed({
                date,
                prevAreaId,
                nextAreaId,
                userId
            });
        }
    }

    return denied();
});
