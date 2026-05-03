import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, ageVerificationCode } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerTestUser, verifyTestUser } = require("../helpers/authTestingUtils.js");

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

    it("returns 200 when a valid verification code is provided, then code becomes unusable", async () => {
        // Register user to generate code
        const { email } = await registerTestUser(agent, makeTestEmail(), "testpassword");
        const code = inbox.last()?.code;

        // First verification attempt should succeed
        const { res: res1 } = await verifyTestUser(agent, email, code);
        expect(res1.status).toBe(200);

        // Second verification attempt should fail
        const { res: res2 } = await verifyTestUser(agent, email, code);
        expect(res2.status).toBe(400);
    });

    it("returns 400 when verification code is invalid, incorrect, or expired", async () => {
        // Register user to generate code
        const { email } = await registerTestUser(agent, makeTestEmail(), "testpassword");
        const code = inbox.last()?.code;

        const wrongCode = code === "000000" ? "111111" : "000000";

        const testCases = [
            { email: "", code }, // Missing email
            { email: "not-at-email", code }, // Invalid email
            { email, code: "" }, // Missing code
            { email, code: "invalid-code" }, // Invalid code
            { email, code: wrongCode } // Incorrect code
        ];

        for (const t of testCases) {
            const { res } = await verifyTestUser(agent, t.email, t.code);
            expect(res.status).toBe(400);
        }

        await ageVerificationCode(email);

        const { res: expiredRes } = await verifyTestUser(agent, email, code); // Expired code
        expect(expiredRes.status).toBe(400);
    });
});