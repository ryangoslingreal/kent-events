import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbCleanup.js");
const { registerTestUser } = require("../helpers/authTestingUtils.js");

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

    it("returns 201 with user payload and sends verification email on successful registration", async () => {
        // Regisistration should succeed
        const { res, email } = await registerTestUser(app);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user).toHaveProperty("email", email);

        // Check email sent
        const sentEmail = inbox.last();
        expect(sentEmail).toBeTruthy();
        expect(sentEmail.to).toBe(email);

        // Check token and URL
        expect(sentEmail.token).toEqual(expect.any(String));
        expect(sentEmail.token).not.toHaveLength(0);
        expect(sentEmail.verifyUrl).toContain("/api/auth/verify?token=" + sentEmail.token);
    });

    it("returns 409 and does not send verification email when email already exists", async () => {
        // First registration should succeed
        const { res: res1, email: email1 } = await registerTestUser(app);
        expect(res1.status).toBe(201);

        inbox.reset(); // Clear inbox

        // Second registration should fail
        const { res: res2, email: email2 } = await registerTestUser(app, email1); // Override with same email
        expect(res2.status).toBe(409);
        expect(inbox.all()).toHaveLength(0); // Check email is NOT sent
    });
});