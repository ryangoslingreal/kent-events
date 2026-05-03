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

    it("returns 200 and sends a new verification code when the account exists, old code becomes invalid", async () => {
        // Register a new user
        const { email } = await registerTestUser(agent, makeTestEmail(), "testpassword");
        const code1 = inbox.last()?.code;
        expect(code1).toMatch(/^\d{6}$/);

        inbox.reset();

        // Request resend
        const { res } = await requestNewVerification(agent, email);
        expect(res.status).toBe(200);

        const code2 = inbox.last()?.code;
        expect(code2).toMatch(/^\d{6}$/);
        expect(code2).not.toBe(code1); // Should be a new code

        // Old code should fail
        const { res: resOld } = await verifyTestUser(agent, email, code1);
        expect(resOld.status).toBe(400);

        // New code should succeed
        const { res: resNew } = await verifyTestUser(agent, email, code2);
        expect(resNew.status).toBe(200);
    });

    it("returns 200 and does NOT send an email when the account does not exist", async () => {
        // Attempt verification with nonexistent account
        const { res } = await requestNewVerification(agent, "not-an-account@example.com");
        expect(res.status).toBe(200);
        expect(inbox.all().length).toBe(0);
    });
});