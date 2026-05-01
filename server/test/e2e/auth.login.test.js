import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerTestUser, verifyTestUser, loginTestUser, registerAndLoginTestUser } = require("../helpers/authTestingUtils.js");

describe.sequential("api/auth/login", () => {
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

    it("returns 200 with user payload on successful login", async () => {
        // Register, verify, and log in a new user
        const { res, email } = await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        expect(res.status).toBe(200);
        
        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user).toHaveProperty("email", email);
        expect(res.body.user).toHaveProperty("account_type");
    });

    it("returns 400 if already logged in", async () => {
        // Register, verify, and log in a new user
        const { res: res1, email: email1 } = await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        expect(res1.status).toBe(200);

        // Second login with same session should fail
        const { res: res2 } = await loginTestUser(agent, email1, "testpassword")
        expect(res2.status).toBe(400);
    });

    it("returns 401 for invalid credentials", async () => {
        // Register and verify a new user
        const { email: email } = await registerTestUser(agent, makeTestEmail(), "testpassword");
        const token = inbox.last()?.token;
        await verifyTestUser(agent, token);

        const { res: res1 } = await loginTestUser(agent, undefined, "testpassword"); // Missing email
        expect(res1.status).toBe(401);

        const { res: res2 } = await loginTestUser(agent, email, undefined); // Missing password
        expect(res2.status).toBe(401);

        const { res: res3 } = await loginTestUser(agent, email, "wrongpassword"); // Wrong password
        expect(res3.status).toBe(401);
    });

    it("returns 403 for unverified email", async () => {
        // Register a new user but do not verify
        const { email: email } = await registerTestUser(agent, makeTestEmail(), "testpassword");

        // Attempt login
        const { res } = await loginTestUser(agent, email, "testpassword");
        expect(res.status).toBe(403);
    });
});