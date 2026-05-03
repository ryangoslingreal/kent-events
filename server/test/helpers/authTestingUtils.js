const crypto = require("crypto");
const inbox = require("./emailInbox.js");

const TEST_PREFIX = process.env.TEST_PREFIX;
const TEST_DOMAIN = process.env.TEST_DOMAIN;

function makeTestEmail() {
    const random = crypto.randomBytes(6).toString("hex");
    return `${TEST_PREFIX}${random}${TEST_DOMAIN}`;
}

async function registerTestUser(
    agent,
    email = makeTestEmail(),
    password = "testpassword",
    account_type = "student"
) {
    const res = await agent
        .post("/api/auth/register")
        .send({ email, password, account_type });

    return { res, email, account_type };
}

async function verifyTestUser(agent, email, code) {
    const res = await agent
        .post("/api/auth/verify")
        .send({ email, code });

    return { res, email, code };
}

async function loginTestUser(agent, email, password = "testpassword") {
    const res = await agent
        .post("/api/auth/login")
        .send({ email, password });

    return { res, email };
}

async function registerAndLoginTestUser(
    agent,
    email = makeTestEmail(),
    password = "testpassword",
    account_type = "student"
) {
    await registerTestUser(agent, email, password, account_type);

    const code = inbox.last()?.code;
    await verifyTestUser(agent, email, code);

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
        .post("/api/auth/logout");

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