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
        port: number;
        key: string;
        cert: string;
    };
}

export default IConfig;
