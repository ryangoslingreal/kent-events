const crypto = require("crypto");

function makeTestEmail() {
    const random = crypto.randomBytes(6).toString("hex");
    return `vitest+${random}@example.com`;
}

module.exports = {
    makeTestEmail
};