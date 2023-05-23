import DB from "./lib/DB";

void (async function main(): Promise<void> {
    await DB.connect();
    console.log("DB connected");

})();
