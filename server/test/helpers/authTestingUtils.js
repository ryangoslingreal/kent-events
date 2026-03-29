const crypto = require("crypto");
const inbox = require("./emailInbox.js");

const TEST_PREFIX = process.env.TEST_PREFIX;
const TEST_DOMAIN = process.env.TEST_DOMAIN;

function makeTestEmail() {
    const random = crypto.randomBytes(6).toString("hex");
    return `${TEST_PREFIX}${random}${TEST_DOMAIN}`;
}

async function registerTestUser(agent, email, password) {
    const res = await agent
        .post("/api/auth/register")
        .send({ email, password });

    return { res, email };
}

async function verifyTestUser(agent, token) {
    const res = await agent
        .get("/api/auth/verify")
        .query({ token });

    return { res };
}

async function loginTestUser(agent, email, password) {
    const res = await agent
        .post("/api/auth/login")
        .send({ email, password });

    return { res, email };
}

async function registerAndLoginTestUser(agent, email, password) {
    await registerTestUser(agent, email, password);

    const token = inbox.last()?.token;
    await verifyTestUser(agent, token);

    return await loginTestUser(agent, email, password);
}

async function requestNewVerification(agent, email) {
    const res = await agent
        .post("/api/auth/request-verify")
        .send({ email });

    return { res };
}

async function getMe(agent) {
    const res = await agent.get("/api/auth/me");
    return { res };
}

async function logoutTestUser(agent) {
    const res = await agent
        .post("/api/auth/logout")

    return { res };
}

module.exports = {
    makeTestEmail,
    registerTestUser,
    verifyTestUser,
    loginTestUser,
    logoutTestUser,
    registerAndLoginTestUser,
    requestNewVerification,
    getMe
};