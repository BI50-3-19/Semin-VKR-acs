import DB from "./DB";
import { TUserBox } from "./DB/schemes/user";
import {
    TPassFullLogBox,
    TPassLogBox
} from "./DB/schemes/passLog";
import { TAreaBox } from "./DB/schemes/area";
import {
    SecurityIncidents,
    TFullSecurityIncidentBox,
    TSecurityIncidentBox
} from "./DB/schemes/securityIncident";

class ACS {
    public async hasAccess({
        user,
        date,
        area,
    }: {
        user: TUserBox;
        date: Date;
        area: TAreaBox;
    }): Promise<boolean> {
        const userGroups = await DB.groups.find({
            id: { $in: user.groups },
            areas: { $in: [area.id] },
        });

        if (userGroups.length === 0) {
            return false;
        }

        const currentDay = date.getDay();
        const schedules = await DB.schedules.find({
            id: { $in: userGroups.map(x => x.scheduleId) },
            "week.day": currentDay,
            isDisable: false
        });

        if (schedules.length === 0) {
            return false;
        }

        const days = schedules.map(x => x.week).flat().filter(x => x.day === currentDay);

        if (days.some(x => x.start === undefined && x.end === undefined)) {
            return true;
        }

        const totalCurrentMinutes = date.getHours() * 60 + date.getMinutes();

        for (const day of days) {
            if (!day.start || !day.end) {
                continue;
            }

            if (day.start <= totalCurrentMinutes && totalCurrentMinutes <= day.end) {
                return true;
            }
        }

        return false;
    }

    public async addPassLog({
        user,
        log
    }: {
        user: TUserBox;
        log: TPassLogBox;
    }): Promise<TPassFullLogBox> {
        const id = ++DB.cache.lastPassLogId;
        const lastPassId = user.lastPassId;

        const fullLog: TPassFullLogBox = {
            ...log,
            userId: user.id,
            id,
            date: new Date()
        };

        await DB.passLogs.insertMany([fullLog]);

        if (log.type === "successful") {
            void DB.users.updateOne({
                id: user.id,
            }, {
                $set: {
                    lastPassId: id
                }
            }).then(() => {
                return DB.cache.getUser(user.id, true);
            });
        }

        if (lastPassId === undefined) {
            return fullLog;
        }

        const latest = await DB.passLogs.findOne({
            id: lastPassId
        }).lean();

        if (latest === null || latest.type === "unsuccessful" || log.type === "unsuccessful" || (
            latest.prevAreaId !== log.prevAreaId &&
            latest.nextAreaId !== log.nextAreaId
        )) {
            return fullLog;
        }

        void this.addSecurityIncident({
            type: SecurityIncidents.EnterWithoutExit,
            userId: user.id,
            creator: log.creator,
            passLogId: id,
            prevPassLogId: latest.id
        });

        return fullLog;
    }

    public async addSecurityIncident(incident: TSecurityIncidentBox): Promise<TFullSecurityIncidentBox> {
        const id = ++DB.cache.lastSecurityIncidentId;

        const fullIncident: TFullSecurityIncidentBox = {
            ...incident,
            id,
            createdAt: new Date()
        };

        await DB.securityIncidents.insertMany([fullIncident]);

        return fullIncident;
    }
}

export default new ACS();
