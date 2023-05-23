import server from "./lib/API";
import API from "./lib/API/SectionManager";
import DB from "./lib/DB";

void (async function main(): Promise<void> {
    await DB.connect();
    console.log("DB connected");
    await API.load();
    await server.listen({
        port: DB.config.server.port,
        host: "0.0.0.0"
    });
    console.log("Server started");
})();
