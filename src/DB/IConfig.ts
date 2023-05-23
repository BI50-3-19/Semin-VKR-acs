interface IConfig {
    accessRights: Record<string, number>;
    db: {
        database: string;
        protocol: string;
        address: string;
        login: string;
        password: string;
    };
    server: {
        key: string;
        cert: string;
    };
}

export default IConfig;
