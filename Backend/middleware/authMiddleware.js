const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Add this console.log to see the raw Authorization header
    console.log('Authorization Header from Request:', req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Add this console.log to see the extracted token
            console.log('Extracted Token (after split):', token);
            // And this one for the secret
            console.log('Auth Middleware JWT_SECRET (verifying):', process.env.JWT_SECRET);


            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to the request
            req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });

            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message); // Log the specific error message
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else { // This block will run if Authorization header is missing or doesn't start with 'Bearer'
        console.log('No Authorization header or not starting with Bearer.');
        res.status(401);
        throw new Error('Not authorized, no token'); // Or a more specific message
    }
});

module.exports = { protect };