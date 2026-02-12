import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbCleanup.js");
const { registerTestUser, verifyTestUser } = require("../helpers/authTestingUtils.js");

describe("api/auth/verify", () => {
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

    it("returns 200 when a valid verification token is provided, token becomes unusable", async () => {
        // Register user to generate token
        const { email } = await registerTestUser(app);
        const sentEmail = inbox.last();
        const token = sentEmail.token;

        // First verification attempt should succeed
        const res1 = await verifyTestUser(app, token);
        expect(res1.status).toBe(200);

        // Second verification attempt should fail
        const res2 = await verifyTestUser(app, token);
        expect(res2.status).toBe(400);
    });
});