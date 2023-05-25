import NodeCache from "node-cache";
import { DB } from ".";
import { TRoleBox } from "./schemes/role";
import { TUserBox } from "./schemes/user";
import { PipelineStage } from "mongoose";
import { TAreaBox } from "./schemes/area";
import { TDeviceBox } from "./schemes/device";
import { TSecurityReasonBox } from "./schemes/reason";

class Cache {
    private _db: DB;

    public data: NodeCache;
    public lastRoleId = 0;
    public lastUserId = 0;
    public lastGroupId = 0;
    public lastScheduleId = 0;
    public lastAreaId = 0;
    public lastPassLogId = 0;
    public lastSecurityIncidentId = 0;
    public lastSecurityReasonId = 0;

    constructor(db: DB) {
        this._db = db;
        this.data = new NodeCache({
            stdTTL: 300,
            checkperiod: 300
        });
    }

    public getUserTempKey(id: number): string | undefined {
        return this.data.get<string>(`user-temp-key-${id}`);
    }

    public setUserTempKey(id: number, key: string): void {
        this.data.set(`user-temp-key-${id}`, key, 60);
    }

    public async getUser(id: number, force = false): Promise<TUserBox | null> {
        let user = this.data.get<TRoleBox | null>(`user-${id}`);

        if (user === undefined || force) {
            user = await this._db.users.findOne({
                id
            }).lean();

            if (user === null) {
                return null;
            }

            this.data.set(`user-${id}`, user);
        }

        return user as unknown as TUserBox;
    }

    public async getRole(id: number, force = false): Promise<TRoleBox> {
        let role = this.data.get<TRoleBox | null>(`role-${id}`);

        if (role === undefined || force) {
            role = await this._db.roles.findOne({
                id
            }).lean();

            if (role === null) {
                throw new Error("Role not found");
            }

            this.data.set(`role-${id}`, role);
        }

        return role as TRoleBox;
    }

    public async getSecurityReason(id: number, force = false): Promise<TSecurityReasonBox> {
        let reason = this.data.get<TSecurityReasonBox | null>(`security-reason-${id}`);

        if (reason === undefined || force) {
            reason = await this._db.securityReasons.findOne({
                id
            }).lean();

            if (reason === null) {
                throw new Error("SecurityReason not found");
            }

            this.data.set(`security-reason-${id}`, reason, 0);
        }

        return reason as TSecurityReasonBox;
    }

    public async getArea(id: number, force = false): Promise<TAreaBox> {
        let area = this.data.get<TAreaBox | null>(`area-${id}`);

        if (area === undefined || force) {
            area = await this._db.areas.findOne({
                id
            }).lean();

            if (area === null) {
                throw new Error("Area not found");
            }

            this.data.set(`area-${id}`, area);
        }

        return area as TAreaBox;
    }

    public async getDevice(id: number, force = false): Promise<TDeviceBox> {
        let device = this.data.get<TDeviceBox | null>(`device-${id}`);

        if (device === undefined || force) {
            device = await this._db.devices.findOne({
                id
            }).lean();

            if (device === null) {
                throw new Error("Device not found");
            }

            this.data.set(`device-${id}`, device);
        }

        return device as TDeviceBox;
    }

    public async load(): Promise<void> {
        const [
            lastRoleId,
            lastUserId,
            lastGroupId,
            lastScheduleId,
            lastAreaId,
            lastPassLogId,
            lastSecurityIncidentId,
            lastSecurityReasonId
        ]= await Promise.all([
            this._getMaxId("roles"),
            this._getMaxId("users"),
            this._getMaxId("groups"),
            this._getMaxId("schedules"),
            this._getMaxId("areas"),
            this._getMaxId("passLogs"),
            this._getMaxId("securityIncidents"),
            this._getMaxId("securityReasons"),
            this._loadAllRoles(),
            this._loadAllAreas(),
            this._loadAllDevices(),
            this._loadAllSecurityReasons()
        ]);

        this.lastRoleId = lastRoleId;
        this.lastUserId = lastUserId;
        this.lastGroupId = lastGroupId;
        this.lastScheduleId = lastScheduleId;
        this.lastAreaId = lastAreaId;
        this.lastPassLogId = lastPassLogId;
        this.lastSecurityIncidentId = lastSecurityIncidentId;
        this.lastSecurityReasonId = lastSecurityReasonId;
    }

    private async _loadAllRoles(): Promise<void> {
        for await (const role of this._db.roles.find().lean()) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.data.set(`role-${role.id}`, role, 0);
        }
    }

    private async _loadAllAreas(): Promise<void> {
        for await (const area of this._db.areas.find().lean()) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.data.set(`area-${area.id}`, area, 0);
        }
    }

    private async _loadAllDevices(): Promise<void> {
        for await (const device of this._db.devices.find().lean()) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.data.set(`device-${device.id}`, device, 0);
        }
    }

    private async _loadAllSecurityReasons(): Promise<void> {
        for await (const reason of this._db.securityReasons.find().lean()) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.data.set(`security-reason-${reason.id}`, reason, 0);
        }
    }

    public async _getMaxId(
        collection:
        "roles" |
        "users" |
        "groups" |
        "schedules" |
        "areas" |
        "passLogs" |
        "securityIncidents" |
        "securityReasons"
    ): Promise<number> {
        const aggregation: PipelineStage[] = [
            {
                $group: {
                    _id: "$id"
                }
            }, {
                $sort: {
                    _id: -1
                }
            }, {
                $limit: 1
            }
        ];

        const res = await this._db[collection].aggregate<{_id: number}>(aggregation);

        if (res.length === 0) {
            return 0;
        } else {
            return res[0]._id;
        }
    }
}

export default Cache;
