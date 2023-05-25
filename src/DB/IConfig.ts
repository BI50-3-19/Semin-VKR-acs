import { FastifyJWTOptions } from "@fastify/jwt";

interface IConfig {
    accessRights: Record<string, number>;
    db: {
        database: string;
        filesDatabase: string;
        protocol: string;
        address: string;
        login: string;
        password: string;
        salt: string;
    };
    server: {
        port: number;
        jwtSecret: FastifyJWTOptions["secret"];
        accessTokenTTL: number;
        refreshTokenTTL: number;
        otpSecret: string;
        key: string;
        cert: string;
    };
}

export default IConfig;
