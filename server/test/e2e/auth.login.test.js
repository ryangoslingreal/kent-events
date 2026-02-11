import { beforeEach, describe, it, expect, afterEach } from "vitest";
const request = require("supertest");
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbCleanup.js");

import "../setup/email.mock.js"; // Mock email
import app from "../../src/app.js"; // Import app after mock

describe("api/auth/login", () => {
    // Reset inbox before each test
    beforeEach( () => {
        inbox.reset();
    });

    // Clean up db after each test
    afterEach( async () => {
        await cleanupTestUsers();
    });

    it("placeholder test", () => {
        // placeholder test
    });
});