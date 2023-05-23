/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */

import fastify, { FastifyRequest } from "fastify";

import { TUserBox } from "../lib/DB/schemes/user";
import { TRoleBox } from "../lib/DB/schemes/role";
import { DB } from "../lib/DB";

declare module "fastify" {
    interface FastifyRequest {
        userData: TUserBox;
        userRole: TRoleBox;
        userHasAccess: (right: keyof DB["config"]["accessRights"]) => boolean;
    }
}
