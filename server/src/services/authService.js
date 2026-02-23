const crypto = require('crypto');
const bcrypt = require("bcrypt");
const authRepo = require("../repos/authRepo");
const emailService = require("./emailService");

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Authenticates a user with the provided email and password.
 *
 * @param {string} email - The user's email address
 * @param {string} password - The plaintext password to verify
 * 
 * @returns {Promise<{status: string, user?: object} | undefined>} 
 *   Returns an object with status "VERIFIED" and user data if authentication succeeds,
 *   an object with status "UNVERIFIED" if email is not verified,
 *   or undefined if user is not found
 * 
 * @throws {Error} Throws an error if the database query fails
 */
async function login(email, password) {
    const user = await authRepo.login(email);

    if (!user) return undefined;

    if (!await verifyPassword(password, user.password_hash)) return undefined;

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
 * @param {string} password - The plaintext password for the user
 * 
 * @returns {Promise<Object>} The newly created user object
 * 
 * @throws {Error} Throws an error with code 'DUPLICATE_USER' if a user with the email already exists
 * @throws {Error} Throws any other database or unexpected errors
 */
async function register(email, password) {
    const { token, tokenHash, expiresAt } = makeVerifyToken();
        
    try {
        const user = await authRepo.register(email, await hashPassword(password), tokenHash, expiresAt);

        await emailService.sendVerificationEmail(email, token);

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

    // TODO: Should redirect on successful verification
}

/**
 * Regenerated and resends an email verification link to the specified user.
 * 
 * If no user exists, or user is already verified, silently returns.
 * 
 * @param {string} email - The email address of the user requesting verification
 * 
 * @returns {Promise<void>} Resolves when verification email is sent
 */
async function resendVerification(email) {
    const user = await authRepo.findByEmail(email);
    if (!user) return;

    if (user.email_verified_at) return;

    const { token, tokenHash, expiresAt } = makeVerifyToken();
    await authRepo.setVerificationToken(user.id, tokenHash, expiresAt);

    await emailService.sendVerificationEmail(user.email, token);
}

/**
 * Hashes a plaintext password using bcrypt.
 *
 * @param {string} password - The plaintext password to hash
 * @returns {Promise<string>} The bcrypt hash of the password
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

/**
 * Compares a paintext password to a password hash.
 * 
 * @param {string} password - The plaintext password to verify
 * @param {string} hash - The bcrypt hash to compare against
 * 
 * @return {Promise<boolean>} True if the password matches the hash, false otherwise
 */
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
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