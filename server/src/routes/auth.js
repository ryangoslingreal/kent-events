/**
 * Authentication Routes
 * 
 * This module handles user authentication endpoints including login and session management.
 * All requests/responses are in JSON format.
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
 * @status 500 - Server error
 */
router.post("/login", async (req, res) => {
    const { email, password_hash } = req.body;

    try {
        const user = await authService.login(email, password_hash);
        if (user) {
            res.status(200).json({ 
                message: "User logged in successfully", 
                user: { id: user.id, email: user.email } 
            });
        } else {
            res.status(401).json({
                message: "Invalid credentials"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Server error", error: error.message
        });
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
router.post("/register", async (req, res) => {
	const { email, password_hash } = req.body;

	try {
		const user = await authService.register(email, password_hash);
		res.status(201).json({
			message: "User registered successfully",
			user: { id: user.id, email: user.email }
		});
	} catch (error) {
		if (error.code === 'DUPLICATE_USER') {
			res.status(409).json({
				message: "User with this email already exists"
			});
		} else {
			res.status(500).json({
				message: "Server error", error: error.message
			});
		}
	}
});

module.exports = router;