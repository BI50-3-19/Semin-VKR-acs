import server from "../..";

server.post("/account.getStats", (request) => {
    return {
        passwordUpdatedAt: request.userData.auth?.passwordUpdatedAt,
        has2FA: !!(request.userData.auth?.otp)
    };
});
