import mongoose from "mongoose";

import config from "../../DB/config";

import userSchema, { TUserBox } from "./schemes/user";
import areaSchema, { TAreaBox } from "./schemes/area";
import deviceSchema, { TDeviceBox } from "./schemes/device";
import groupSchema, { TGroupBox } from "./schemes/group";
import roleSchema, { TRoleBox } from "./schemes/role";
import scheduleSchema, { TScheduleBox } from "./schemes/schedule";
import tempPassSchema, { TTempPassBox } from "./schemes/temporaryPasses";
import passLogSchema, { TPassFullLogBox } from "./schemes/passLog";
import securityReasonSchema, { TSecurityReasonBox } from "./schemes/reason";
import securityIncidentSchema, { TFullSecurityIncidentBox } from "./schemes/securityIncident";
import refreshTokenSchema, { TRefreshTokenBox } from "./schemes/refreshTokens";

import Cache from "./Cache";
import Storage from "./Storage";

class DB {
    public readonly config = config;
    private readonly _connection: mongoose.Connection;

    public readonly users: mongoose.Model<TUserBox>;
    public readonly areas: mongoose.Model<TAreaBox>;
    public readonly devices: mongoose.Model<TDeviceBox>;
    public readonly groups: mongoose.Model<TGroupBox>;
    public readonly roles: mongoose.Model<TRoleBox>;
    public readonly schedules: mongoose.Model<TScheduleBox>;
    public readonly tempPasses: mongoose.Model<TTempPassBox>;
    public readonly passLogs: mongoose.Model<TPassFullLogBox>;
    public readonly securityIncidents: mongoose.Model<TFullSecurityIncidentBox>;
    public readonly securityReasons: mongoose.Model<TSecurityReasonBox>;
    public readonly refreshTokens: mongoose.Model<TRefreshTokenBox>;

    public readonly files: Storage;

    public readonly cache: Cache;

    constructor() {
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
        this.tempPasses = createModel("temp-passes", tempPassSchema);
        this.passLogs = createModel("pass-logs", passLogSchema);
        this.securityIncidents = createModel("security-incidents", securityIncidentSchema);
        this.securityReasons = createModel("security-reasons", securityReasonSchema);
        this.refreshTokens = createModel("refresh-tokens", refreshTokenSchema);

        this.cache = new Cache(this);
        this.files = new Storage(this);
    }

    public async connect(): Promise<void> {
        await this._connection.asPromise();
        await this.cache.load();
    }
}

export type { DB };

export default new DB();
