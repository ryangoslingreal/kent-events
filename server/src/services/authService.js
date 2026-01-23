const authRepo = require('../repos/authRepo');
const crypto = require('crypto');

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Authenticates a user with the provided email and password hash.
 *
 * @param {string} email - The user's email address
 * @param {string} password_hash - The hashed password to verify
 * 
 * @returns {Promise<{status: string, user?: object} | undefined>} 
 *   Returns an object with status "VERIFIED" and user data if authentication succeeds,
 *   an object with status "UNVERIFIED" if email is not verified,
 *   or undefined if user is not found
 * 
 * @throws {Error} Throws an error if the database query fails
 */
async function login(email, password_hash) {
    const user = await authRepo.login(email, password_hash);

    if (!user) return undefined;

    if (!user.email_verified_at) {
        return { status: "UNVERIFIED" };
    }

    // VERIFIED
    return { status: "VERIFIED", user };
}

/**
 * Registers a new user with the provided email and password hash.
 * 
 * @param {string} email - The email address of the user to register
 * @param {string} password_hash - The hashed password for the user
 * 
 * @returns {Promise<Object>} The newly created user object
 * 
 * @throws {Error} Throws an error with code 'DUPLICATE_USER' if a user with the email already exists
 * @throws {Error} Throws any other database or unexpected errors
 */
async function register(email, password_hash) {
    const { token, tokenHash, expiresAt } = makeVerifyToken();
    
    try {
        const user = await authRepo.register(email, password_hash, tokenHash, expiresAt);

        // TODO: send verification email with token

        return user;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') { // MySQL duplicate entry error code
            const duplicateError = new Error('User with this email already exists');
            duplicateError.code = 'DUPLICATE_USER'; // Repackage as custom error code
            throw duplicateError;
        }

        throw error;
    }
}

/**
 * Verifies a user's email using a provided token string.
 *
 * The function hashes the provided token using SHA-256 and attempts to
 * mark the corresponding account as verified.
 *
 * @param {string} token - The raw email verification token
 * 
 * @throws {Error} If the token is missing or not a string
 * @throws {Error} If the token is invalid or expired (verification failed)
 * 
 * @returns {Promise<void>} Resolves when verification succeeds
 */
async function verifyEmail(token) {
    if (!token || typeof token !== "string") {
        throw new Error("Missing token");
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const updated = await authRepo.verifyEmail(tokenHash);
    if (!updated) {
        throw new Error("Invalid or expired token");
    }
}

async function resendVerification(email) {
    const user = await authRepo.findByEmail(email);
    if (!user) return;

    if (user.email_verified_at) return;

    const { token, tokenHash, expiresAt } = makeVerifyToken();
    await authRepo.setVerificationToken(user.id, tokenHash, expiresAt);

    // TODO: send email with token
}

/**
 * Generates a verification token with its hash and expiration time.
 * 
 * @returns {string} .token - The raw verification token (32 byte hex string)
 * @returns {string} .tokenHash - The SHA256 hash of the token
 * @returns {Date} .expiresAt - The expiration time of the token
 */
function makeVerifyToken() {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);
    return { token, tokenHash, expiresAt };
}

module.exports = { 
    login, 
    register,
    verifyEmail,
    resendVerification
};