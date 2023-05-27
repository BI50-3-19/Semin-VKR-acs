import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import Fastify from "fastify";
import fs from "node:fs";

import cors from "@fastify/cors";
import formBody from "@fastify/formbody";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import multiPart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import CryptoJS, { MD5 } from "crypto-js";

import DB from "../DB";
import APIError from "./Error";
import sectionManager from "./SectionManager";

import ACS from "../ACS";
import { SecurityIncidents } from "../DB/schemes/securityIncident";
import utils from "../utils";

const server = Fastify({
    https: (DB.config.server.web.cert !== "" && DB.config.server.web.key !== "") ? {
        key: fs.readFileSync(DB.config.server.web.key),
        cert: fs.readFileSync(DB.config.server.web.cert),
    } : null,
}).withTypeProvider<TypeBoxTypeProvider>();
server.setValidatorCompiler(TypeBoxValidatorCompiler);

void server.register(rateLimit, {
    max: 25,
    ban: 3,
});
void server.register(formBody);
void server.register(multiPart);
void server.register(cors, { origin: "*" });
void server.register(helmet);
void server.register(jwt, {
    secret: DB.config.server.jwtSecret
});

server.setReplySerializer((payload) => {
    if (Object.prototype.hasOwnProperty.call(payload, "error")) {
        return JSON.stringify(payload);
    } else {
        return JSON.stringify({ response: payload });
    }
});

server.setNotFoundHandler((request) => {
    throw new APIError({
        code: 1, request
    });
});

server.setErrorHandler((err, request, reply) => {
    if (err.validation) {
        return reply.status(200).send({
            error: new APIError({
                code: 2,
                request,
            }).toJSON(),
        });
    }

    if (err instanceof APIError) {
        return reply.status(200).send({ error: err.toJSON() as unknown });
    } else {
        if (reply.statusCode === 429) {
            const error = new APIError({
                code: 3, request
            });
            return reply.status(200).send({ error: error.toJSON() });
        } else {
            console.log(err);
            const error = new APIError({
                code: 0, request
            });
            return reply.status(200).send({ error: error.toJSON() });
        }
    }
});

server.addHook<{
    Body?: {
        token?: string;
    };
    Headers?: {
        sign?: string;
    };
}>("preValidation", async (request) => {
    const url = request.url.substring(1);
    const [section, method] = url.split(".");

    if (!section || !method) {
        throw new APIError({
            code: 1, request
        });
    }

    const sectionClass = sectionManager.getSection(section);

    if (!sectionClass || !sectionClass.methods.includes(method.split("?")[0])) {
        throw new APIError({
            code: 1, request
        });
    }

    if (sectionClass.auth === "jwt") {
        try {
            await request.jwtVerify();
        } catch (err) {
            throw new APIError({
                code: 4, request
            });
        }

        request.jwtToken = request.headers["authorization"]?.split(" ")[1] as string;
        const tokenInfo = await DB.cache.getTokenInfo(request.jwtToken);
        if (tokenInfo === null) {
            throw new APIError({
                code: 4, request
            });
        }
        request.session = tokenInfo;
        request.session.lastUsedAt = new Date();
        void DB.sessions.updateOne({
            refreshToken: request.session.refreshToken
        }, {
            $set: {
                lastUsedAt: new Date()
            }
        });

        const user = await DB.cache.getUser(request.user.id);
        if (user === null) {
            void ACS.addSecurityIncident({
                type: SecurityIncidents.UserNotFound,
                userId: request.user.id,
                creator: {
                    type: "user",
                    userId: request.user.id
                }
            });
            throw new APIError({
                code: 7, request
            });
        }
        request.userData = user;

        if (request.user.createdAt + (DB.config.server.accessTokenTTL * 1000) < Date.now()) {
            throw new APIError({
                code: 30, request
            });
        }

        if (!user.auth) {
            throw new APIError({
                code: 4, request
            });
        }
        const hash = MD5(user.auth.password).toString(CryptoJS.enc.Base64);

        if (hash !== request.user.hash) {
            throw new APIError({
                code: 4, request
            });
        }

        const role = await DB.cache.getRole(request.userData.roleId);
        if (role === null) {
            throw new APIError({
                code: 9, request
            });
        }
        request.userRole = role;

        request.userHasAccess = (right: keyof typeof DB["config"]["accessRights"]): boolean => {
            return utils.hasAccess(right, request.userRole.mask);
        };
    }

    if (sectionClass.auth === "device-token") {
        if (!request.body?.token) {
            throw new APIError({
                code: 4,
                request
            });
        }

        const device = await DB.devices.findOne({
            token: request.body.token
        }).lean();

        if (device === null) {
            throw new APIError({
                code: 4,
                request
            });
        }

        void DB.devices.updateOne({
            id: device.id
        }, { $set: { lastRequestDate: Date.now() } });

        request.deviceData = device;
    }
});

export default server;
