/**
 * Authentication Routes
 * 
 * This module handles user authentication and account verification endpoints,
 * including login, registration, email verification, and verification resends.
 * All requests/responses are JSON unless otherwise noted.
 */

const { Router } = require("express");
const authService = require("../services/authService");

const router = Router();

/**
 * POST /login
 * Authenticates a user with email and password credentials.
 *
 * @param {string} email - The email address of the user to login
 * @param {string} password_hash - The hashed password for the user
 * 
 * @returns {Object} JSON response with message and user object (id, email)
 * 
 * @status 200 - Login successful
 * @status 401 - Invalid credentials
 * @status 403 - Email not verified
 * @status 500 - Server error
 */
router.post("/login", async (req, res) => { // ! Should hash password client-side and send over HTTPS.
    const { email, password_hash } = req.body;

    try {
        const result = await authService.login(email, password_hash);

        if (!result) {
            return res.status(401).json({message: "Invalid credentials"});
        }
        
        if (result.status == "UNVERIFIED") {
            return res.status(403).json({message: "Email not verified"});
        } 
        
        // VERIFIED
        return res.status(200).json({ 
            message: "User logged in successfully", 
            user: { id: result.user.id, email: result.user.email } 
        });
    } catch (error) {
        return res.status(500).json({message: "Server error", error: error.message});
    }
});

/**
 * POST /register
 * Registers a new user with the provided email and hashed password.
 * 
 * @param {string} email - The email address of the user to register
 * @param {string} password_hash - The hashed password for the user
 * 
 * @returns {Object} JSON response with message and user object (id, email)
 * 
 * @status 201 - User registered successfully
 * @status 409 - User with this email already exists
 * @status 500 - Server error
 */
router.post("/register", async (req, res) => { // ! Should hash password client-side and send over HTTPS.
	const { email, password_hash } = req.body;

	try {
		const user = await authService.register(email, password_hash);

		return res.status(201).json({
			message: "User registered successfully, verification required",
			user: { id: user.id, email: user.email }
		});
	} catch (error) {
		if (error.code === 'DUPLICATE_USER') {
			return res.status(409).json({message: "User with this email already exists"});
		}

		return res.status(500).json({message: "Server error", error: error.message});
	}
});

/**
 * GET /verify-email
 * Verifies a user's email address using a token provided as a query parameter.
 * 
 * @param {string} token - The authentication token passed as a query parameter
 * 
 * @returns {Object} JSON response with message
 * 
 * @status 200 - Email verified successfully
 * @status 400 - Invalid or expired verification link
 */
router.get("/verify-email", async (req, res) => {
    const { token } = req.query;

    // Either redirect or return JSON
    try {
        await authService.verifyEmail(token);
        return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        return res.status(400).json({ message: "Invalid or expired verification link" });
    }
});

/**
 * POST /resend-verification
 * Resends the email verification link to the user's email address.
 * 
 * @param {string} email - The user's email address
 * 
 * @returns {Object} JSON response with message
 * 
 * @status 200 - Verification email sent (if account exists)
 * @status 500 - Server error
 */
router.post("/resend-verification", async (req, res) => {
    const { email } = req.body;

    try {
        await authService.resendVerification(email);
        return res.status(200).json({ message: "If the account exists, a verification email has been sent." });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;