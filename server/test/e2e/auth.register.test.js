import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerTestUser } = require("../helpers/authTestingUtils.js");

describe.sequential("api/auth/register", () => {
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

    it("returns 201 with student user payload and sends verification code email on successful registration", async () => {
        // Regisistration should succeed
        const { res, email, account_type } = await registerTestUser(
            agent,
            makeTestEmail(),
            "testpassword",
            "student"
        );

        expect(res.status).toBe(201);
        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user).toHaveProperty("email", email);
        expect(res.body.user).toHaveProperty("account_type", account_type);

        // Check email sent
        const sentEmail = inbox.last();
        expect(sentEmail).toBeTruthy();
        expect(sentEmail.to).toBe(email);

        // Check verification code
        expect(sentEmail.code).toEqual(expect.any(String));
        expect(sentEmail.code).toMatch(/^\d{6}$/);
    });

    it("returns 201 with society user payload and sends verification code email on successful registration", async () => {
        // Regisistration should succeed
        const { res, email, account_type } = await registerTestUser(
            agent,
            makeTestEmail(),
            "testpassword",
            "society"
        );

        expect(res.status).toBe(201);
        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user).toHaveProperty("email", email);
        expect(res.body.user).toHaveProperty("account_type", account_type);

        // Check email sent
        const sentEmail = inbox.last();
        expect(sentEmail).toBeTruthy();
        expect(sentEmail.to).toBe(email);

        // Check verification code
        expect(sentEmail.code).toEqual(expect.any(String));
        expect(sentEmail.code).toMatch(/^\d{6}$/);
    });

    it("returns 400 when missing or invalid fields are provided", async () => {
        const testCases = [
            { email: "", password: "testpassword", account_type: "student" }, // Missing email
            { email: makeTestEmail(), password: "", account_type: "student" }, // Missing password
            { email: "not-an-email", password: "testpassword", account_type: "student" }, // Invalid email
            { email: makeTestEmail(), password: "testpassword", account_type: "" }, // Missing account type
            { email: makeTestEmail(), password: "testpassword", account_type: "kentUni" } // Invalid public account type
        ];

        for (const t of testCases) {
            const { res } = await registerTestUser(agent, t.email, t.password, t.account_type);
            expect(res.status).toBe(400);
        }
    });

    it("returns 409 and does not send verification email when email already exists", async () => {
        // First registration should succeed
        const { res: res1, email: email1 } = await registerTestUser(
            agent,
            makeTestEmail(),
            "testpassword",
            "student"
        );
        expect(res1.status).toBe(201);

        inbox.reset(); // Clear inbox

        // Second registration should fail
        const { res: res2 } = await registerTestUser(
            agent,
            email1, // Same email
            "testpassword",
            "society"
        );
        expect(res2.status).toBe(409);
        expect(inbox.all()).toHaveLength(0); // Check email is NOT sent
    });
});