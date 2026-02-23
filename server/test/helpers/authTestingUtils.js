const request = require("supertest");
const crypto = require("crypto");

function makeTestEmail() {
    const random = crypto.randomBytes(6).toString("hex");
    return `vitest+${random}@example.com`;
}

async function registerTestUser(app, email, password) {
    const res = await request(app)
        .post("/api/auth/register")
        .send({ email, password });

    return { res, email };
}

async function verifyTestUser(app, token) {
    const res = await request(app)
        .get("/api/auth/verify")
        .query({ token });

    return { res };
}

async function loginTestUser(app, email, password) {
    const res = await request(app)
        .post("/api/auth/login")
        .send({ email, password });

    return { res };
}

async function requestNewVerification(app, email) {
    const res = await request(app)
        .post("/api/auth/request-verify")
        .send({ email })

    return { res };
}

module.exports = {
    makeTestEmail,
    registerTestUser,
    verifyTestUser,
    loginTestUser,
    requestNewVerification
};