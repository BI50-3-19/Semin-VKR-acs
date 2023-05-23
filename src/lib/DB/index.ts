import mongoose from "mongoose";

import IConfig from "../../DB/IConfig";
import config from "../../DB/config";

import userSchema, { TUserBox } from "./schemes/user";
import areaSchema, { TAreaBox } from "./schemes/area";
import deviceSchema, { TDeviceBox } from "./schemes/device";
import groupSchema, { TGroupBox } from "./schemes/group";
import roleSchema, { TRoleBox } from "./schemes/role";
import scheduleSchema, { TScheduleBox } from "./schemes/schedule";

class DB {
    public readonly config: IConfig;
    private readonly _connection: mongoose.Connection;

    public readonly users: mongoose.Model<TUserBox>;
    public readonly areas: mongoose.Model<TAreaBox>;
    public readonly devices: mongoose.Model<TDeviceBox>;
    public readonly groups: mongoose.Model<TGroupBox>;
    public readonly roles: mongoose.Model<TRoleBox>;
    public readonly schedules: mongoose.Model<TScheduleBox>;

    constructor() {
        this.config = Object.freeze(config);

        this._connection = mongoose.createConnection(
            `${config.db.protocol}://${config.db.login}:${config.db.password}@${config.db.address}/`,
            {
                autoCreate: true,
                autoIndex: true,
                dbName: config.db.database,
            }
        );

        const createModel = <Doc>(collection: string, schema: mongoose.Schema<Doc>): mongoose.Model<Doc> => {
            return this._connection.model<Doc>(collection, schema, collection);
        };

        this.users = createModel("users", userSchema);
        this.areas = createModel("areas", areaSchema);
        this.devices = createModel("devices", deviceSchema);
        this.groups = createModel("groups", groupSchema);
        this.roles = createModel("roles", roleSchema);
        this.schedules = createModel("schedules", scheduleSchema);
    }

    public connect(): Promise<unknown> {
        return this._connection.asPromise();
    }
}

export type { DB };

export default new DB();
