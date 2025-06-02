// backend/Controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to generate JWT
// ... (other code)

const generateToken = (id) => {
    // Add this line temporarily:
    console.log('User Controller JWT_SECRET (signing):', process.env.JWT_SECRET);
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// ... (rest of the file)

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields.' });
    }

    try {
        // Check if user exists
        // --- FIX: Use 'where' clause for Sequelize finder methods ---
        const userExists = await User.findOne({ where: { email } });
        // --- END FIX ---

        if (userExists) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // The pre-save hook in User.js will hash the password
        // Create user
        const user = await User.create({
            name,
            email,
            password, // Send plain password, pre-save hook will hash it
        });

        if (user) {
            res.status(201).json({
                _id: user.id, // Sequelize uses 'id' for primary key, not '_id'
                name: user.name,
                email: user.email,
                token: generateToken(user.id), // --- FIX: Use user.id for token generation ---
            });
        } else {
            res.status(400).json({ message: 'Invalid user data.' });
        }
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Server Error: Could not register user.' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // --- START NEW CONSOLE LOGS (THESE ARE CRITICAL!) ---
    console.log('--- Login Attempt Details ---');
    console.log('1. Email received from frontend:', email);
    console.log('2. Password received from frontend:', password);
    // --- END NEW CONSOLE LOGS ---

    // Check for user email
    // --- FIX: Use 'where' clause for Sequelize finder methods ---
    const user = await User.findOne({ where: { email } });
    // --- END FIX ---

    if (!user) {
        // --- START NEW CONSOLE LOGS ---
        console.log('3. User NOT found in database for email:', email);
        // --- END NEW CONSOLE LOGS ---
        return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // --- START NEW CONSOLE LOGS ---
    console.log('4. User found in database. User Email:', user.email);
    console.log('5. Hashed password retrieved from DB (user.password):', user.password);
    // --- END NEW CONSOLE LOGS ---

    // Check password using the method defined in the User model
    // Assuming 'matchPassword' is a method you added to your User model instance
    // or you are using bcrypt.compare directly here.
    // If you haven't added 'matchPassword' to your User model, you would use:
    // const isPasswordMatched = await bcrypt.compare(password, user.password);
    const isPasswordMatched = await user.matchPassword(password); // Keep this if matchPassword is defined on User model

    // --- START NEW CONSOLE LOGS (THIS SHOWS THE COMPARISON RESULT!) ---
    console.log('6. Result of password comparison (isPasswordMatched):', isPasswordMatched);
    console.log('--- End Login Attempt Details ---');
    // --- END NEW CONSOLE LOGS ---

    if (isPasswordMatched) { // Use the boolean result
        res.json({
            _id: user.id, // Sequelize uses 'id' for primary key, not '_id'
            name: user.name,
            email: user.email,
            token: generateToken(user.id), // --- FIX: Use user.id for token generation ---
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials.' });
    }
};

module.exports = {
    registerUser,
    loginUser,
};