/**
 * Authentication Routes
 * 
 * This module handles user authentication and account verification endpoints,
 * including login, registration, email verification, and verification resends.
 * All requests/responses are JSON unless otherwise noted.
 */

const { Router } = require("express");
const authService = require("../services/authService");
const { isValidEmail } = require("../utils/utils");

const router = Router();

/**
 * POST /login
 * Authenticates a user with email and password credentials.
 *
 * @param {string} email - The email address of the user to login
 * @param {string} password - The plaintext password for the user
 * 
 * @returns {Object} JSON response with message and user object (id, email, account_type)
 * 
 * @status 200 - Login successful
 * @status 400 - Already logged in
 * @status 401 - Invalid credentials
 * @status 403 - Email not verified
 * @status 500 - Server error
 */
router.post("/login", async (req, res) => { // * NOTE: Ensure HTTPS.
    if (req.session.user) {
        return res.status(400).json({ message: "Already logged in." });
    }

    const { email, password } = req.body;

    if (!email || !password || !isValidEmail(email)) {
        return res.status(401).json({ message: "Invalid request data." })
    }

    let result;
    try {
        result = await authService.login(email, password);
    } catch (error) {
        return res.status(500).json({ message: "Server error.", error: error.message });
    }

    if (!result) {
        return res.status(401).json({ message: "Invalid credentials." });
    }
            
    if (result.status === "UNVERIFIED") {
        return res.status(403).json({ message: "Email not verified." });
    } 
            
    // VERIFIED
    req.session.user = { // Store user in session
        id: result.user.id,
        email: result.user.email,
        account_type: result.user.account_type
    }

    return res.status(200).json({ 
        message: "User logged in successfully", 
        user: req.session.user
    });
});

/**
 * POST /register
 * Registers a new user with the provided email and plaintext password.
 * 
 * @param {string} email - The email address of the user to register
 * @param {string} password - The plaintext password for the user
 * 
 * @returns {Object} JSON response with message and user object (id, email, account_type)
 * 
 * @status 201 - User registered successfully
 * @status 409 - User with this email already exists
 * @status 500 - Server error
 */
router.post("/register", async (req, res) => { // * NOTE: Ensure HTTPS.
    const { email, password } = req.body;

    if (!email || !password || !isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid request data." })
    }

    let user;
    try {
        user = await authService.register(email, password);
    } catch (error) {
        if (error.code === 'DUPLICATE_USER') {
            return res.status(409).json({ message: "User with this email already exists." });
        }

        return res.status(500).json({ message: "Server error.", error: error.message });
    }

    return res.status(201).json({
        message: "User registered successfully, verification required.",
        user: {
            id: user.id,
            email: user.email,
            account_type: user.account_type
        }
    });
});

/**
 * GET /verify
 * Verifies a user's email address using a token provided as a query parameter.
 * 
 * @param {string} token - The authentication token passed as a query parameter
 * 
 * @returns {Object} JSON response with message
 * 
 * @status 200 - Email verified successfully
 * @status 400 - Invalid or expired verification link
 */
router.get("/verify", async (req, res) => {
    const { token } = req.query;

    // Either redirect or return JSON
    try {
        await authService.verifyEmail(token);
        return res.status(200).json({ message: "Email verified successfully." });
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired verification link." });
    }
});

/**
 * POST /request-verify
 * Resends the email verification link to the user's email address.
 * 
 * @param {string} email - The user's email address
 * 
 * @returns {Object} JSON response with message
 * 
 * @status 200 - Verification email sent (if account exists)
 * @status 500 - Server error
 */
router.post("/request-verify", async (req, res) => {
    const { email } = req.body;

    try {
        await authService.resendVerification(email);
        return res.status(200).json({ message: "If the account exists, a verification email has been sent." });
    } catch (error) {
        return res.status(500).json({ message: "Server error.", error: error.message });
    }
});

/**
 * POST /logout
 * Logs out the currently authenticated user.
 * 
 * @returns {Object} JSON response with message
 * 
 * @status 200 - Logout successful
 * @status 500 - Server error
 */
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Server error.", error: err });
        }

        res.clearCookie('connect.sid');
        return res.status(200).json({ message: "Logged out successfully." });
    });
});

/**
 * GET /me
 * Returns the currently authenticated user.
 * 
 * @returns {Object} JSON response with message and user object (id, email, account_type)
 * 
 * @status 200 - User authenticated
 * @status 401 - Not authenticated
 */
router.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated." });
    }

    return res.status(200).json({
        message: "Authenticated.",
        user: req.session.user
    });
});

module.exports = router;