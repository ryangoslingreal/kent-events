const request = require("supertest");
const crypto = require("crypto");

const DEFAULT_PASSWORD = "testpassword"; // Currently hashed client-side

function makeTestEmail() {
    const random = crypto.randomBytes(6).toString("hex");
    return `vitest+${random}@example.com`;
}

async function registerTestUser(app, email, password_hash) {
    const res = await request(app)
        .post("/api/auth/register")
        .send({ email, password_hash });

    return { res, email };
}

async function verifyTestUser(app, token) {
    const res = await request(app)
        .get("/api/auth/verify")
        .query({ token });

    return { res };
}

async function loginTestUser(app, email, password_hash) {
    const res = await request(app)
        .post("/api/auth/login")
        .send({ email, password_hash });

    return { res };
}

module.exports = {
    makeTestEmail,
    registerTestUser,
    verifyTestUser,
    loginTestUser
};