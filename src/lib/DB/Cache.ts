import NodeCache from "node-cache";
import { DB } from ".";
import { TRoleBox } from "./schemes/role";
import { TUserBox } from "./schemes/user";

class Cache {
    private _db: DB;
    private _cache: NodeCache;

    constructor(db: DB) {
        this._db = db;
        this._cache = new NodeCache({
            stdTTL: 300,
            checkperiod: 300
        });
    }

    public async getUser(id: number, force = false): Promise<TUserBox | null> {
        let user = this._cache.get<TRoleBox | null>(`user-${id}`);

        if (user === undefined || force) {
            user = await this._db.users.findOne({
                id
            }).lean();

            if (user === null) {
                return null;
            }

            this._cache.set(`user-${id}`, user);
        }

        return user as unknown as TUserBox;
    }

    public async getRole(id: number, force = false): Promise<TRoleBox> {
        let role = this._cache.get<TRoleBox | null>(`role-${id}`);

        if (role === undefined || force) {
            role = await this._db.roles.findOne({
                id
            }).lean();

            if (role === null) {
                throw new Error("Role not found");
            }

            this._cache.set(`role-${id}`, role);
        }

        return role as TRoleBox;
    }

    public async load(): Promise<void> {
        await this._loadAllRoles();
    }

    private async _loadAllRoles(): Promise<void> {
        for await (const role of this._db.roles.find().lean()) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            this._cache.set(`role-${role.id}`, role);
        }
    }
}

export default Cache;
