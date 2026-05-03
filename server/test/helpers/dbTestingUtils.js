const db = require("../../src/db/pool.js");

const TEST_PREFIX = process.env.TEST_PREFIX;
const TEST_DOMAIN = process.env.TEST_DOMAIN;

function assertIsTesting() {
    if (process.env.NODE_ENV !== "test") {
        throw new Error(
            "Database cleanup can only be run in a test environment. Aborting to prevent data loss."
        );
    }
}

async function cleanupTestUsers() {
    assertIsTesting();

    const pattern = `${TEST_PREFIX}%${TEST_DOMAIN}`;

    const [result] = await db.query(
        "DELETE FROM users WHERE email LIKE ?",
        [pattern]
    );

    return { deleted: result?.affectedRows ?? 0 };
};

async function cleanupTestEvents() {
    assertIsTesting();

    const pattern = `${TEST_PREFIX}%`;

    const [result] = await db.query(
        "DELETE FROM events WHERE title LIKE ?",
        [pattern]
    );

    return { deleted: result?.affectedRows ?? 0 };
}

async function ageVerificationCode(email) {
    assertIsTesting();

    const query = "UPDATE users SET email_verification_expires_at = DATE_SUB(NOW(), INTERVAL 1 YEAR) WHERE email = ?"
    await db.query(query, [email]);
}

module.exports = { 
    cleanupTestUsers,
    cleanupTestEvents,
    ageVerificationCode
};