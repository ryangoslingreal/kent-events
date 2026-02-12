import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbTestingUtils.js");
const { registerTestUser } = require("../helpers/authTestingUtils.js");

describe.sequential("api/auth/resend", () => {
    let app;
        
    // Reset inbox and mock email service before each test
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

    it.todo("returns 200 and sends verification email if the account exists", () => {
        // ! placeholder test
    });
});