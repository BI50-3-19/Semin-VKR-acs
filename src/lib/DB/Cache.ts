import { PipelineStage } from "mongoose";
import NodeCache from "node-cache";
import { DB } from ".";
import { TAreaBox } from "./schemes/area";
import { TDeviceBox } from "./schemes/device";
import { TSecurityReasonBox } from "./schemes/reason";
import { TRoleBox } from "./schemes/role";
import { TSessionBox } from "./schemes/session";
import { TUserBox } from "./schemes/user";

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
    public lastKeyId = 0;

    constructor(db: DB) {
        this._db = db;
        this.data = new NodeCache({
            stdTTL: 300,
            checkperiod: 300
        });
    }

    public async getTokenInfo(token: string, force = false): Promise<TSessionBox | null> {
        let tokenInfo = this.data.get<TSessionBox | null>(`jwt-token-${token}`);

        if (tokenInfo === undefined || force) {
            tokenInfo = await this._db.sessions.findOne({
                accessToken: token
            }).lean();

            if (tokenInfo === null || tokenInfo === undefined) {
                this.data.del(`jwt-token-${token}`);
                return null;
            }

            this.data.set(`jwt-token-${token}`, tokenInfo, 60);
        }
        this.data.ttl(`jwt-token-${token}`, 60);

        return tokenInfo as unknown as TSessionBox;
    }

    public async getUser(id: number, force = false): Promise<TUserBox | null> {
        let user = this.data.get<TUserBox | null>(`user-${id}`);

        if (user === undefined || force) {
            user = await this._db.users.findOne({
                id,
                isDeleted: false
            }).lean();

            if (user === null || user === undefined) {
                this.data.del(`user-${id}`);
                return null;
            }

            this.data.set(`user-${id}`, user);
        }

        return user as unknown as TUserBox;
    }

    public async getRole(id: number, force = false): Promise<TRoleBox | null> {
        let role = this.data.get<TRoleBox | null>(`role-${id}`);

        if (role === undefined || force) {
            role = await this._db.roles.findOne({
                id
            }).lean();

            if (role === null || role === undefined) {
                this.data.del(`role-${id}`);
                return null;
            }

            this.data.set(`role-${id}`, role, 0);
        }

        return role as TRoleBox;
    }

    public async getSecurityReason(id: number, force = false): Promise<TSecurityReasonBox | null> {
        let reason = this.data.get<TSecurityReasonBox | null>(`security-reason-${id}`);

        if (reason === undefined || force) {
            reason = await this._db.securityReasons.findOne({
                id
            }).lean();

            if (reason === null || reason === undefined) {
                this.data.del(`security-reason-${id}`);
                return null;
            }

            this.data.set(`security-reason-${id}`, reason, 0);
        }

        return reason as TSecurityReasonBox;
    }

    public async getArea(id: number, force = false): Promise<TAreaBox | null> {
        let area = this.data.get<TAreaBox | null>(`area-${id}`);

        if (area === undefined || force) {
            area = await this._db.areas.findOne({
                id
            }).lean();

            if (area === null || area === undefined) {
                this.data.del(`area-${id}`);
                return null;
            }

            this.data.set(`area-${id}`, area, 0);
        }

        return area as TAreaBox;
    }

    public async getDevice(id: number, force = false): Promise<TDeviceBox | null> {
        let device = this.data.get<TDeviceBox | null>(`device-${id}`);

        if (device === undefined || force) {
            device = await this._db.devices.findOne({
                id
            }).lean();

            if (device === null || device === undefined) {
                this.data.del(`device-${id}`);
                return null;
            }

            this.data.set(`device-${id}`, device, 0);
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
            lastSecurityReasonId,
            lastKeyId
        ]= await Promise.all([
            this._getMaxId("roles"),
            this._getMaxId("users"),
            this._getMaxId("groups"),
            this._getMaxId("schedules"),
            this._getMaxId("areas"),
            this._getMaxId("passLogs"),
            this._getMaxId("securityIncidents"),
            this._getMaxId("securityReasons"),
            this._getMaxId("keys"),
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
        this.lastKeyId = lastKeyId;
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
        "securityReasons" |
        "keys"
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
