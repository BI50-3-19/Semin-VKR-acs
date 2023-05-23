import server from "../..";

server.post("/status.get", () => {
    return {
        status: "ok",
        time: Date.now()
    };
});
