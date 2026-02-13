const inbox = require("../helpers/emailInbox.js");
const emailService = require("../../src/services/emailService.js");

export function mockEmail() {
    emailService.sendVerificationEmail = async (to, token) => {
        const verifyUrl = `${process.env.VITE_API_TARGET}/api/auth/verify?token=${token}`;
        inbox.record({ to, token, verifyUrl });
    }
}

module.exports = {
    mockEmail
};