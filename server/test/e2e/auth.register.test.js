import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbTestingUtils.js");
const { createTestAgent, makeTestEmail, registerTestUser } = require("../helpers/authTestingUtils.js");

describe.sequential("api/auth/register", () => {
    let app;
    let agent;
    
    // Reset inbox and mock email service before each test
    beforeEach( async () => {
        inbox.reset();

        const {mockEmail} = await import("../setup/email.mock.js");
        mockEmail();

        app = (await import("../../src/app.js")).default; // Import app AFTER mock
        agent = createTestAgent(app);
    });

    // Clean up db after each test
    afterEach( async () => {
        await cleanupTestUsers();
    });

    it("returns 201 with user payload and sends verification email on successful registration", async () => {
        // Regisistration should succeed
        const { res, email } = await registerTestUser(agent, makeTestEmail(), "testpassword");
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

    it("returns 400 when missing or invalid fields are provided", async () => {
        const { res: res1 } = await registerTestUser(agent, undefined, "testpassword"); // Missing email
        expect(res1.status).toBe(400);

        const { res: res2 } = await registerTestUser(agent, makeTestEmail(), undefined); // Missing password
        expect(res2.status).toBe(400);

        const { res: res3 } = await registerTestUser(agent, "not-an-email", "testpassword"); // Invalid email
        expect(res3.status).toBe(400);
    });

    it("returns 409 and does not send verification email when email already exists", async () => {
        // First registration should succeed
        const { res: res1, email: email1 } = await registerTestUser(agent, makeTestEmail(), "testpassword");
        expect(res1.status).toBe(201);

        inbox.reset(); // Clear inbox

        // Second registration should fail
        const { res: res2, email: email2 } = await registerTestUser(agent, email1, "testpassword"); // Same email
        expect(res2.status).toBe(409);
        expect(inbox.all()).toHaveLength(0); // Check email is NOT sent
    });
});