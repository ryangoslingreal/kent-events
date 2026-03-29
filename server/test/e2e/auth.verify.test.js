import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers, ageVerificationToken } = require("../helpers/dbTestingUtils.js");
const { createTestAgent, makeTestEmail, registerTestUser, verifyTestUser } = require("../helpers/authTestingUtils.js");

describe.sequential("api/auth/verify", () => {
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

    it("returns 200 when a valid verification token is provided, token becomes unusable", async () => {
        // Register user to generate token
        await registerTestUser(agent, makeTestEmail(), "testpassword");
        const token = inbox.last()?.token;

        // First verification attempt should succeed
        const { res: res1 } = await verifyTestUser(agent, token);
        expect(res1.status).toBe(200);

        // Second verification attempt should fail
        const { res: res2 } = await verifyTestUser(agent, token);
        expect(res2.status).toBe(400);
    });

    it("returns 400 when verification token is invalid or expired", async () => {
        // Register user to generate token
        const { email: email } = await registerTestUser(agent, makeTestEmail(), "testpassword");
        const token = inbox.last()?.token;

        const { res: res1 } = await verifyTestUser(agent, "invalid-token"); // Invalid token
        expect(res1.status).toBe(400);

        await ageVerificationToken(email);
        const { res: res2 } = await verifyTestUser(agent, token) // Expired token
        expect(res2.status).toBe(400);
    });
});