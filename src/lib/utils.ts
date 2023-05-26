import CryptoJS, { SHA512 } from "crypto-js";
import DB from "./DB";
import { TSessionBox } from "./DB/schemes/session";

class Utils {
    public hasAccess(
        right: keyof typeof DB["config"]["accessRights"],
        mask: number
    ): boolean {
        return Boolean(DB.config.accessRights[right] & mask);
    }

    public async createSession(accessToken: string, userId: number): Promise<TSessionBox> {
        let token: string | null = null;

        while (token === null) {
            token = SHA512(Date.now().toString()).toString(CryptoJS.enc.Base64);

            if (await (DB.sessions.exists({
                refreshToken: token
            }))) {
                token = null;
            }
        }

        const refreshToken: TSessionBox = {
            refreshToken: token,
            accessToken,
            userId,
            lastUsedAt: new Date(),
            createdAt: new Date()
        };

        await DB.sessions.insertMany([
            refreshToken
        ]);

        return refreshToken;
    }

    public async updateSessionTokens(refreshToken: string, accessToken: string): Promise<TSessionBox> {
        let token: string | null = null;

        while (token === null) {
            token = SHA512(Date.now().toString()).toString(CryptoJS.enc.Base64);

            if (await (DB.sessions.exists({
                refreshToken: token
            }))) {
                token = null;
            }
        }

        const session = await DB.sessions.findOneAndUpdate({
            refreshToken
        }, {
            $set: {
                refreshToken: token,
                accessToken
            }
        });

        if (session === null) {
            throw new Error("Session not found");
        }

        return {
            ...session,
            refreshToken: token
        };
    }
}

export default new Utils();
