const request = require("supertest");
const crypto = require("crypto");

function makeTestEmail() {
    const random = crypto.randomBytes(6).toString("hex");
    return `vitest+${random}@example.com`;
}

// Helper to register a normal user
async function registerTestUser(app, email = makeTestEmail(), password_hash = "testpassword") { // Currently hashed client-side
    const res = await request(app)
        .post("/api/auth/register")
        .send({ email, password_hash });

    return { res, email };
}

// Helper to register a user with a missing email
async function registerTestUserNoEmail(app) {
    const res = await request(app)
        .post("/api/auth/register")
        .send({ password_hash: "testpassword" });

    return { res };
}

// Helper to register a user with a missing password
async function registerTestUserNoPassword(app) {
    const res = await request(app)
        .post("/api/auth/register")
        .send({ email: makeTestEmail() });

    return { res };
}

// Helper to register a user with an invalid email
async function registerTestUserInvalidEmail(app) {
    const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "not-an-email", password_hash: "testpassword" });

    return { res };
}

module.exports = {
    registerTestUser,
    registerTestUserNoEmail,
    registerTestUserNoPassword,
    registerTestUserInvalidEmail
};