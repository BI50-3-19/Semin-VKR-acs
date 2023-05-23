import mongoose from "mongoose";

import IConfig from "../../DB/IConfig";
import config from "../../DB/config";

import userSchema, { TUserBox } from "./schemes/user";
import areaSchema, { TAreaBox } from "./schemes/area";

class DB {
    public readonly config: IConfig;
    private readonly _connection: mongoose.Connection;

    public readonly users: mongoose.Model<TUserBox>;
    public readonly areas: mongoose.Model<TAreaBox>;

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
    }

    public connect(): Promise<unknown> {
        return this._connection.asPromise();
    }
}

export type { DB };

export default new DB();
