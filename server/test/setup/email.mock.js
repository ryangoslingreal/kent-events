const inbox = require("../helpers/emailInbox.js");
const emailService = require("../../src/services/emailService.js");

export function mockEmail() {
    emailService.sendVerificationEmail = async (to, code) => {
        inbox.record({ to, code });
    }
}

module.exports = {
    mockEmail
};