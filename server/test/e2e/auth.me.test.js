import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser, getMe } = require("../helpers/authTestingUtils.js");

describe.sequential("api/auth/me", () => {
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

    it("returns 200 and user object when authenticated", async () => {
        // Register, verify, and log in a new user
        const { email: email } = await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res } = await getMe(agent);
        expect(res.status).toBe(200);

        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user).toHaveProperty("email", email);
        expect(res.body.user).toHaveProperty("account_type");
    });

    it("returns 401 when not authenticated", async () => {
        const { res } = await getMe(agent);
        expect(res.status).toBe(401);
    });
});