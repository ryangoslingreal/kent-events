const db = require('../db/pool');

/**
 * Retrieves a user record by email address.
 * * NOTE: User record contains the user's password hash. Ensure it is not accidentally leaked.
 * 
 * @param {string} email - The user's email address to search for
 * 
 * @returns {Promise<Object | undefined>} 
 *   The user object containing id, email, account_type, password_hash,
 *   and email_verified_at, or undefined if no user is found
 * 
 * @throws {Error} Throws an error if the database query fails
 */
async function findUser(email) {
    const query = 'SELECT id, email, account_type, password_hash, email_verified_at FROM users WHERE email = ? LIMIT 1';
    const values = [email];

    const [rows] = await db.query(query, values);

    return rows[0];
}

/**
 * Registers a new user with the provided email and password hash.
 * 
 * @param {string} email - The email address of the user to register
 * @param {string} password_hash - The hashed password of the user
 * @param {string} code_hash - The hashed email verification code
 * @param {Date | string} expires_at - The expiry date of the email verification code
 * 
 * @returns {Promise<Object>} The newly created user object containing id, email, account_type, and email_verified_at
 * 
 * @throws {Error} Throws an error if the database query fails or if the email already exists
 */
async function register(email, password_hash, account_type, code_hash, expires_at) {
    const query = `
        INSERT INTO users (
            email,
            password_hash,
            account_type,
            email_verification_code_hash,
            email_verification_expires_at
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [email, password_hash, account_type, code_hash, expires_at];

    const [result] = await db.query(query, values);

    const [rows] = await db.query('SELECT id, email, account_type, email_verified_at FROM users WHERE id = ? LIMIT 1', [result.insertId]);

    return rows[0];
}

/**
 * Sets the email verification code and expiration time for a user.
 * 
 * @param {int} user_id - The id of the user to update
 * @param {string} code_hash - The hashed verification code
 * @param {Date | string} expires_at - The expiration timestamp for the verification code
 * 
 * @returns {Promise<void>}
 * 
 * @throws {Error} If the database query fails
 */
async function setVerificationCode(user_id, code_hash, expires_at) {
    const query = 'UPDATE users SET email_verification_code_hash = ?, email_verification_expires_at = ? WHERE id = ?';
    const values = [code_hash, expires_at, user_id];

    await db.query(query, values);
}

/**
 * Verifies a user's email by consuming a verification code hash.
 *
 * Updates the users table setting email_verified_at = NOW() and clearing
 * email_verification_code_hash and email_verification_expires_at for a row that
 * matches the provided code hash, has an expires time in the future,
 * and is not already verified.
 *
 * @param {string} email - The email address of the user to verify
 * @param {string} code_hash - The hashed email verification code to consume
 * 
 * @returns {Promise<boolean>} 
 *   Resolves to true if email was successfully verified,
 *   or false if no rows were affected
 * 
 * @throws {Error} If the database query fails
 */
async function verifyEmail(email, code_hash) {
    const query = `
        UPDATE users
        SET
            email_verified_at = NOW(),
            email_verification_code_hash = NULL,
            email_verification_expires_at = NULL
        WHERE email = ?
            AND email_verification_code_hash = ?
            AND email_verification_expires_at > NOW()
            AND email_verified_at IS NULL
    `;

    const values = [email, code_hash];

    const [result] = await db.query(query, values);

    return result.affectedRows === 1;
}

module.exports = { 
    findUser,
    register,
    setVerificationCode,
    verifyEmail
};