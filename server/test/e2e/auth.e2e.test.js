import { vi, beforeEach, describe, it, expect } from "vitest";
const request = require("supertest");
const inbox = require("../helpers/emailInbox.js");

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

describe("Auth API", () => {
    // Reset inbox before each test
    beforeEach( () => {
        inbox.reset();
    });

    // Sanity check to ensure test setup is working
    it("App boots", async () => {
        const res = await request(app).get("/api/health");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true });
    });
});