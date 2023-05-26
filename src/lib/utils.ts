import CryptoJS, { SHA512 } from "crypto-js";
import DB from "./DB";
import { TRefreshTokenBox } from "./DB/schemes/refreshTokens";

class Utils {
    public hasAccess(
        right: keyof typeof DB["config"]["accessRights"],
        mask: number
    ): boolean {
        return Boolean(DB.config.accessRights[right] & mask);
    }

    public async createRefreshToken(accessToken: string): Promise<TRefreshTokenBox> {
        let token: string | null = null;

        while (token === null) {
            token = SHA512(Date.now().toString()).toString(CryptoJS.enc.Base64);

            if (await (DB.refreshTokens.exists({
                token
            }))) {
                token = null;
            }
        }

        const refreshToken: TRefreshTokenBox = {
            token,
            accessToken,
            createdAt: new Date()
        };

        await DB.refreshTokens.insertMany([
            refreshToken
        ]);

        return refreshToken;
    }
}

export default new Utils();
