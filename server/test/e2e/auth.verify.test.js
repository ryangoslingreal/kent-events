import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbCleanup.js");
const { registerTestUser } = require("../helpers/authTestingUtils.js");

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

    it("placeholder test", () => {
        // placeholder test
    });
});