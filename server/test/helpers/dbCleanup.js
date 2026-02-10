const pool = require("../../src/db/pool.js");

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

    const [result] = await pool.query(
        "DELETE FROM users WHERE email LIKE ?",
        [pattern]
    );

    return { deleted: result?.affectedRows ?? 0 };
};

module.exports = { 
    cleanupTestUsers
};