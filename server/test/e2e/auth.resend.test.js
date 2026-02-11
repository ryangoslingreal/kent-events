import { beforeEach, describe, it, expect, afterEach } from "vitest";
const request = require("supertest");
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbCleanup.js");
const { makeTestEmail } = require("../helpers/emailUtils.js");

describe("api/auth/resend", () => {
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