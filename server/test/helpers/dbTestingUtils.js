const db = require("../../src/db/pool.js");

const TEST_EMAIL_PREFIX = "vitest+";
const TEST_EMAIL_DOMAIN = "@example.com";

function assertIsTesting() {
    if (process.env.NODE_ENV !== "test") {
        throw new Error(
            "Database cleanup can only be run in a test environment. Aborting to prevent data loss."
        );
    }
}

async function cleanupTestUsers() {
    assertIsTesting();

    const pattern = `${TEST_EMAIL_PREFIX}%${TEST_EMAIL_DOMAIN}`;

    const [result] = await db.query(
        "DELETE FROM users WHERE email LIKE ?",
        [pattern]
    );

    return { deleted: result?.affectedRows ?? 0 };
};

async function ageVerificationToken(email) {
    assertIsTesting();

    const query = "UPDATE users SET email_verification_expires_at = DATE_SUB(NOW(), INTERVAL 1 YEAR) WHERE email = ?"
    await db.query(query, [email]);
}

module.exports = { 
    cleanupTestUsers,
    ageVerificationToken
};