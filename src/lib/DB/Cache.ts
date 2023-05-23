import NodeCache from "node-cache";
import { DB } from ".";
import { TRoleBox } from "./schemes/role";

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

    public async getRole(id: number): Promise<TRoleBox> {
        let role = this._cache.get<TRoleBox | null>(`role-${id}`);

        if (role === undefined) {
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
