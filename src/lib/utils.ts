import DB from "./DB";

class Utils {
    public hasAccess(
        right: keyof typeof DB["config"]["accessRights"],
        mask: number
    ): boolean {
        return Boolean(DB.config.accessRights[right] & mask);
    }
}

export default new Utils();
