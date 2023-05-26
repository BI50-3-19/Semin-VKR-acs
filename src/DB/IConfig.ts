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
        tempKeySecret: string;
        tempKeySignSecret: string;
        tempKeyTTL: number;
        jwtSecret: FastifyJWTOptions["secret"];
        otpSecret: string;
        accessTokenTTL: number;
        refreshTokenTTL: number;
        web: {
            key: string;
            cert: string;
        };
    };
}

export default IConfig;
