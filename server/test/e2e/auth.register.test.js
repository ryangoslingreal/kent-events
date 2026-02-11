import { beforeEach, describe, it, expect, afterEach } from "vitest";
const request = require("supertest");
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbCleanup.js");
const { makeTestEmail } = require("../helpers/emailUtils.js");

describe("api/auth/register", () => {
    let app;
    
    // Reset inbox  and mock email service before each test
    beforeEach( async () => {
        inbox.reset();

        const {mockEmail} = await import("../setup/email.mock.js");
        mockEmail();

        app = (await import("../../src/app.js")).default; // Import app AFTER mock
    });

    // Clean up db after each test
    afterEach( async () => {
        await cleanupTestUsers();
    });

    it("returns 201 and sends verification email", async () => {
        const email = makeTestEmail();
        const password_hash = "testpassword"; // Currently hashed client-side

        const res = await request(app)
            .post("/api/auth/register")
            .send({ email, password_hash });

        // Check response
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user).toHaveProperty("email", email);

        // Check email sent
        const sentEmail = inbox.last();
        expect(sentEmail).toBeTruthy();
        expect(sentEmail.to).toBe(email);

        // Check token
        expect(sentEmail.token).toEqual(expect.any(String));
        expect(sentEmail.token.length).toBeGreaterThan(0);

        // Check verify URL
        expect(sentEmail.verifyUrl).toContain("/api/auth/verify-email?token=" + sentEmail.token);
    });

    it("returns 409 for existing email", async () => {
        const email = makeTestEmail();
        const password_hash = "testpassword";

        // First registration should succeed
        const res1 = await request(app)
            .post("/api/auth/register")
            .send({ email, password_hash });

        // Check first response
        expect(res1.status).toBe(201);

        // Check first email sent
        const sentEmail1 = inbox.last();
        expect(sentEmail1).toBeTruthy();
        expect(sentEmail1.to).toBe(email); 

        inbox.reset(); // Clear inbox

        // Second registration should fail
        const res2 = await request(app)
            .post("/api/auth/register")
            .send({ email, password_hash });

        // Check second response
        expect(res2.status).toBe(409);

        // Check second email is NOT sent
        const sentEmail2 = inbox.last();
        expect(sentEmail2).toBeFalsy();
    });
});