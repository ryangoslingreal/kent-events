const request = require("supertest");
const crypto = require("crypto");

function makeTestEmail() {
    const random = crypto.randomBytes(6).toString("hex");
    return `vitest+${random}@example.com`;
}

async function registerTestUser(app, email = makeTestEmail(), password_hash = "testpassword") { // Currently hashed client-side
    const res = await request(app)
        .post("/api/auth/register")
        .send({ email, password_hash });

    return { res, email };
}

module.exports = {
    registerTestUser
};