import { vi, beforeEach, describe, it, expect, afterEach } from "vitest";
const request = require("supertest");
const inbox = require("../helpers/emailInbox.js");
const { cleanupTestUsers } = require("../helpers/dbCleanup.js");

// Mock email
vi.mock("../../src/services/emailService", () => {
    return {
        sendVerificationEmail: async (to, token) => {
            const verifyUrl = `${process.env.VITE_API_TARGET}/api/auth/verify-email?token=${token}`;
            inbox.record({ to, token, verifyUrl });
        },
    };
});

// Import app after mock
import app from "../../src/app.js";

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