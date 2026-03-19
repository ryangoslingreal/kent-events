import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbTestingUtils.js");
const { createTestAgent, makeTestEmail, registerAndLoginTestUser, getMe, logoutTestUser } = require("../helpers/authTestingUtils.js");

describe.sequential("api/auth/logout", () => {
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

    it("returns 200 and clears session when authenticated", async () => {
        // Register, verify, and log in a new user
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: resLogout } = await logoutTestUser(agent);
        expect(resLogout.status).toBe(200);

        const { res: resMe } = await getMe(agent)
        expect(resMe.status).toBe(401); // Session should be clear
    });

    it("returns 200 when unauthenticated", async () => {
        const { res } = await logoutTestUser(agent);
        expect(res.status).toBe(200);
    });
});