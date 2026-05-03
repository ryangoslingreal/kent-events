const crypto = require('crypto');
const bcrypt = require("bcrypt");
const authRepo = require("../repos/authRepo");
const emailService = require("./emailService");

const VERIFY_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const VERIFY_CODE_LENGTH = 6;

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
    const user = await authRepo.findUser(email);

    if (!user) return undefined;

    if (!await verifyPassword(password, user.password_hash)) return undefined;

    if (!user.email_verified_at) {
        return { status: "UNVERIFIED", user };
    }

    // VERIFIED
    return { status: "VERIFIED", user };
}

/**
 * Registers a new user with the provided email and password hash.
 * 
 * @param {string} email - The email address of the user to register
 * @param {string} password - The plaintext password for the user
 * @param {string} account_type - The type of account to be registered, either "student" or "society"
 * 
 * @returns {Promise<Object>} The newly created user object
 * 
 * @throws {Error} Throws an error with code 'DUPLICATE_USER' if a user with the email already exists
 * @throws {Error} Throws any other database or unexpected errors
 */
async function register(email, password, account_type) {
    const { code, codeHash, expiresAt } = makeVerificationCode(email);
        
    try {
        const user = await authRepo.register(
            email,
            await hashPassword(password),
            account_type,
            codeHash,
            expiresAt
        );

        await emailService.sendVerificationEmail(email, code);

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
 * Verifies a user's email using their email address and verification code.
 *
 * @param {string} email - The email address of the user to verify
 * @param {string} code - The raw 6-digit email verification code
 * 
 * @throws {Error} If the code is invalid, expired, or does not match the email
 * 
 * @returns {Promise<void>}
 */
async function verifyEmail(email, code) {
    const codeHash = hashVerificationCode(email, code);

    const updated = await authRepo.verifyEmail(email, codeHash);
    if (!updated) {
        throw new Error("Invalid or expired verification code");
    }
}

/**
 * Regenerates and resends an email verification code to the specified user.
 * 
 * If no user exists, or user is already verified, silently returns.
 * 
 * @param {string} email - The email address of the user requesting verification
 * 
 * @returns {Promise<void>}
 */
async function resendVerification(email) {
    const user = await authRepo.findUser(email);
    if (!user) return;

    if (user.email_verified_at) return;

    const { code, codeHash, expiresAt } = makeVerificationCode(user.email);
    await authRepo.setVerificationCode(user.id, codeHash, expiresAt);

    await emailService.sendVerificationEmail(user.email, code);
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

function makeVerificationCode(email) {
    const max = 10 ** VERIFY_CODE_LENGTH;
    const code = String(crypto.randomInt(0, max)).padStart(VERIFY_CODE_LENGTH, "0");
    const codeHash = hashVerificationCode(email, code);
    const expiresAt = new Date(Date.now() + VERIFY_CODE_TTL_MS);

    return { code, codeHash, expiresAt };
}

function hashVerificationCode(email, code) {
    const secret = process.env.SESSION_SECRET;

    if (!secret) {
        throw new Error("Missing SESSION_SECRET");
    }

    const normEmail = email.trim().toLowerCase();
    const normCode = code.trim();

    return crypto
        .createHmac("sha256", secret)
        .update(`${normEmail}:${normCode}`)
        .digest("hex");
}

module.exports = {
    login,
    register,
    verifyEmail,
    resendVerification
};