/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */

import fastifyJwt, { FastifyJWTOptions } from "@fastify/jwt";

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: {
            id: number;
            hash: string;
            createdAt: number;
        };
        user: {
            id: number;
            hash: string;
            createdAt: number;
        };
    }
}
