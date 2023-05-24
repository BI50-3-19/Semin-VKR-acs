import NodeCache from "node-cache";
import { DB } from ".";
import { TRoleBox } from "./schemes/role";
import { TUserBox } from "./schemes/user";
import { PipelineStage } from "mongoose";
import { TAreaBox } from "./schemes/area";
import { TDeviceBox } from "./schemes/device";

class Cache {
    private _db: DB;

    public data: NodeCache;
    public lastRoleId = 0;
    public lastUserId = 0;
    public lastGroupId = 0;
    public lastScheduleId = 0;
    public lastAreaId = 0;
    public lastPassLogId = 0;

    constructor(db: DB) {
        this._db = db;
        this.data = new NodeCache({
            stdTTL: 300,
            checkperiod: 300
        });
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
            lastPassLogId
        ]= await Promise.all([
            this._getMaxRoleId(),
            this._getMaxUserId(),
            this._getMaxGroupId(),
            this._getMaxScheduleId(),
            this._getMaxAreaId(),
            this._getMaxPassLogId(),
            this._loadAllRoles(),
            this._loadAllAreas(),
            this._loadAllDevices()
        ]);

        this.lastRoleId = lastRoleId;
        this.lastUserId = lastUserId;
        this.lastGroupId = lastGroupId;
        this.lastScheduleId = lastScheduleId;
        this.lastAreaId = lastAreaId;
        this.lastPassLogId = lastPassLogId;
    }

    private async _loadAllRoles(): Promise<void> {
        for await (const role of this._db.roles.find().lean()) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.data.set(`role-${role.id}`, role);
        }
    }

    private async _loadAllAreas(): Promise<void> {
        for await (const area of this._db.areas.find().lean()) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.data.set(`area-${area.id}`, area);
        }
    }

    private async _loadAllDevices(): Promise<void> {
        for await (const device of this._db.devices.find().lean()) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.data.set(`device-${device.id}`, device);
        }
    }

    private async _getMaxRoleId(): Promise<number> {
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

        const res = await this._db.roles.aggregate<{_id: number}>(aggregation);

        if (res.length === 0) {
            return 0;
        } else {
            return res[0]._id;
        }
    }

    private async _getMaxUserId(): Promise<number> {
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

        const res = await this._db.users.aggregate<{_id: number}>(aggregation);

        if (res.length === 0) {
            return 0;
        } else {
            return res[0]._id;
        }
    }

    private async _getMaxGroupId(): Promise<number> {
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

        const res = await this._db.groups.aggregate<{_id: number}>(aggregation);

        if (res.length === 0) {
            return 0;
        } else {
            return res[0]._id;
        }
    }

    private async _getMaxScheduleId(): Promise<number> {
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

        const res = await this._db.schedules.aggregate<{_id: number}>(aggregation);

        if (res.length === 0) {
            return 0;
        } else {
            return res[0]._id;
        }
    }

    private async _getMaxAreaId(): Promise<number> {
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

        const res = await this._db.areas.aggregate<{_id: number}>(aggregation);

        if (res.length === 0) {
            return 0;
        } else {
            return res[0]._id;
        }
    }

    private async _getMaxPassLogId(): Promise<number> {
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

        const res = await this._db.passLogs.aggregate<{_id: number}>(aggregation);

        if (res.length === 0) {
            return 0;
        } else {
            return res[0]._id;
        }
    }
}

export default Cache;
