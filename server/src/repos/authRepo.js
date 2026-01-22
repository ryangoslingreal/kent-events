const db = require('../db/pool');

/**
 * Authenticates a user by verifying their email and password hash.
 * 
 * @param {string} email - The user's email address
 * @param {string} password_hash - The hashed password to verify
 * 
 * @returns {Object | undefined} The user object if authentication is successful, or undefined if no user is found
 * 
 * @throws {Error} Throws an error if the database query fails
 */
async function login(email, password_hash) {
    const query = 'SELECT * FROM users WHERE email = $1 AND password_hash = $2';
    const values = [email, password_hash];
    const { rows } = await db.query(query, values);
    return rows[0];
}

/**
 * Registers a new user with the provided email and password hash.
 * 
 * @param {string} email - The email address of the user to register
 * @param {string} password_hash - The hashed password of the user
 * 
 * @returns {Object} The newly created user object
 * 
 * @throws {Error} Throws an error if the database query fails or if the email already exists (unique constraint)
 */
async function register(email, password_hash) {
    const query = 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *';
    const values = [email, password_hash];
    const { rows } = await db.query(query, values);
    return rows[0];
}

module.exports = { login, register};