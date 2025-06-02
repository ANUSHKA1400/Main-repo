// backend/Routes/userroutes.js
const express = require('express');
const router = express.Router();
// Import the functions from userController.js
const { registerUser, loginUser } = require('../controllers/UserController'); // Ensure this path and casing ('Controllers') are correct

// Define the routes for user registration and login
// These routes are public, meaning they don't require a token to access
router.post('/register', registerUser); // Handles POST requests to /api/users/register
router.post('/login', loginUser);       // Handles POST requests to /api/users/login

// If you add protected user routes later, you would include your 'protect' middleware here.
// Example:
// const protect = require('../middleware/authMiddleware'); // Import your protect middleware
// router.get('/profile', protect, (req, res) => res.send('User Profile')); // Example protected route

module.exports = router;