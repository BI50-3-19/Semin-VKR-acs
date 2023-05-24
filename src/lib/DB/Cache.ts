import NodeCache from "node-cache";
import { DB } from ".";
import { TRoleBox } from "./schemes/role";
import { TUserBox } from "./schemes/user";
import { PipelineStage } from "mongoose";

class Cache {
    private _db: DB;

    public data: NodeCache;
    public lastRoleId = 0;
    public lastUserId = 0;
    public lastGroupId = 0;

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

    public async load(): Promise<void> {
        const [lastRoleId, lastUserId, lastGroupId] = await Promise.all([
            this._getMaxRoleId(),
            this._getMaxUserId(),
            this._getMaxGroupId()
        ]);

        this.lastRoleId = lastRoleId;
        this.lastUserId = lastUserId;
        this.lastGroupId = lastGroupId;

        await this._loadAllRoles();
    }

    private async _loadAllRoles(): Promise<void> {
        for await (const role of this._db.roles.find().lean()) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this.data.set(`role-${role.id}`, role);
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

        const [{ _id: max }] = await this._db.roles.aggregate<{_id: number}>(aggregation);
        return max;
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

        const [{ _id: max }] = await this._db.users.aggregate<{_id: number}>(aggregation);
        return max;
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

        const [{ _id: max }] = await this._db.groups.aggregate<{_id: number}>(aggregation);
        return max;
    }
}

export default Cache;
