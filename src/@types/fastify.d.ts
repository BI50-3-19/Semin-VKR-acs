/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */

import "fastify";

import { TDeviceBox } from "../lib/DB/schemes/device";
import { TRoleBox } from "../lib/DB/schemes/role";
import { TSessionBox } from "../lib/DB/schemes/session";
import { TUserBox } from "../lib/DB/schemes/user";

import { DB } from "../lib/DB";

declare module "fastify" {
    interface FastifyRequest {
        deviceData: TDeviceBox;
        userData: TUserBox;
        userRole: TRoleBox;
        userHasAccess: (right: keyof DB["config"]["accessRights"]) => boolean;
        jwtToken: string;
        session: TSessionBox;
    }
}
