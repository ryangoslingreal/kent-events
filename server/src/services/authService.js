const authRepo = require('../repos/authRepo');

/**
 * Authenticates a user with the provided email and password hash.
 *
 * @param {string} email - The user's email address
 * @param {string} password_hash - The hashed password to verify
 * 
 * @returns {Object | undefined} The user object if authentication is successful, or undefined if no user is found
 * 
 * @throws {Error} Throws an error if the database query fails
 */
async function login(email, password_hash) {
    return await authRepo.login(email, password_hash);
}

/**
 * Registers a new user with the provided email and password hash.
 * 
 * @param {string} email - The email address of the user to register
 * @param {string} password_hash - The hashed password for the user
 * 
 * @returns {Object} The newly created user object
 * 
 * @throws {Error} Throws an error with code 'DUPLICATE_USER' if a user with the email already exists
 * @throws {Error} Throws any other database or unexpected errors
 */
async function register(email, password_hash) {
    try {
        return await authRepo.register(email, password_hash);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') { // MySQL duplicate entry error code
            const duplicateError = new Error('User with this email already exists');
            duplicateError.code = 'DUPLICATE_USER'; // Repackage as custom error code
            throw duplicateError;
        }

        throw error;
    }
}

module.exports = { login, register };