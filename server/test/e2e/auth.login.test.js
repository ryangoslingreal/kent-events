import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerTestUser, verifyTestUser, loginTestUser } = require("../helpers/authTestingUtils.js");

describe.sequential("api/auth/login", () => {
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

    it("returns 200 with user payload on successful login", async () => {
        // Register and verify a new user
        const { email: email } = await registerTestUser(app, makeTestEmail(), "testpassword");   
        const token = inbox.last()?.token;
        await verifyTestUser(app, token);

        // Attempt login
        const { res } = await loginTestUser(app, email, "testpassword");
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("id");
        expect(res.body.user).toHaveProperty("email", email);
    });

    it("returns 401 for invalid credentials", async () => {
        // Register and verify a new user
        const { email: email } = await registerTestUser(app, makeTestEmail(), "testpassword");
        const token = inbox.last()?.token;
        await verifyTestUser(app, token);

        const { res: res1 } = await loginTestUser(app, undefined, "testpassword"); // Missing email
        expect(res1.status).toBe(401);

        const { res: res2 } = await loginTestUser(app, email, undefined); // Missing password
        expect(res2.status).toBe(401);

        const { res: res3 } = await loginTestUser(app, email, "wrongpassword"); // Wrong password
        expect(res3.status).toBe(401);
    });

    it("returns 403 for unverified email", async () => {
        // Register a new user but do not verify
        const { email: email } = await registerTestUser(app, makeTestEmail(), "testpassword");

        // Attempt login
        const { res } = await loginTestUser(app, email, "testpassword");
        expect(res.status).toBe(403);
    });
});