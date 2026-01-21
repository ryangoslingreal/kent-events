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
 * Authenticates a user with username and password credentials.
 * 
 * @param {Object} req - Express request object with body containing username and password
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with message and user object (id, email)
 * 
 * @status 200 - Login successful
 * @status 401 - Invalid credentials
 * @status 500 - Server error
 */
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await authService.login(username, password);
        if (user) {
            res.status(200).json({ 
                message: "Login successful", 
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

module.exports = router;