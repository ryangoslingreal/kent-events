import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerTestUser, verifyTestUser, requestNewVerification } = require("../helpers/authTestingUtils.js");

describe.sequential("api/auth/resend", () => {
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

    it("returns 200 and sends a new verification email when the account exists, old token comes invalid", async () => {
        // Register a new user
        const { email } = await registerTestUser(agent, makeTestEmail(), "testpassword");
        const token1 = inbox.last()?.token;
        expect(token1).toBeTruthy();

        inbox.reset(); // Clear inbox

        // Request resend
        const { res } = await requestNewVerification(agent, email);
        expect(res.status).toBe(200);

        const token2 = inbox.last()?.token;
        expect(token2).toBeTruthy();
        expect(token2).not.toBe(token1); // Should be a new token

        // Old token should fail
        const { res: resOld } = await verifyTestUser(agent, token1);
        expect(resOld.status).toBe(400);

        // New token should succeed
        const { res: resNew } = await verifyTestUser(agent, token2);
        expect(resNew.status).toBe(200);
    });

    it("returns 200 and does NOT send an email when the account does not exist", async () => {
        // Attempt verification with nonexistent account
        const { res } = await requestNewVerification(agent, "not-an-account@example.com");
        expect(res.status).toBe(200);
        expect(inbox.all().length).toBe(0);
    });
});