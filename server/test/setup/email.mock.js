import { vi } from "vitest";

vi.mock("../../src/services/emailService", async () => {
    const inbox = await import("../helpers/emailInbox.js");

    return {
        sendVerificationEmail(to, token) {
            const verifyUrl = `${process.env.VITE_API_TARGET}/api/auth/verify-email?token=${token}`;

            inbox.record({ to, token, verifyUrl });
            return Promise.resolve();
        },
    };
});