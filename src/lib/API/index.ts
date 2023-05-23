import fs from "node:fs";
import Fastify from "fastify";
import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";

import rateLimit from "@fastify/rate-limit";
import formBody from "@fastify/formbody";
import multiPart from "@fastify/multipart";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

import DB from "../DB";
import APIError from "./Error";
import sectionManager from "./SectionManager";

const server = Fastify({
    https: (DB.config.server.cert !== "" && DB.config.server.key !== "") ? {
        key: fs.readFileSync(DB.config.server.key),
        cert: fs.readFileSync(DB.config.server.cert),
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
        void reply.status(200).send({
            error: new APIError({
                code: 2,
                request,
            }).toJSON(),
        });
    }

    if (err instanceof APIError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        void reply.status(200).send({ error: err.toJSON() });
    } else {
        if (reply.statusCode === 429) {
            const error = new APIError({
                code: 3, request
            });
            void reply.status(200).send({ error: error.toJSON() });
        } else {
            console.log(err);
            const error = new APIError({
                code: 0, request
            });
            void reply.status(200).send({ error: error.toJSON() });
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

    if (!sectionClass || !sectionClass.methods.includes(method)) {
        throw new APIError({
            code: 1, request
        });
    }
});

export default server;
