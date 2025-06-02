const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize'); // Import Op for Sequelize operators
const Charger = require('../models/Charger');
const User = require('../models/User'); // Ensure User model is also used if needed for joins

// @desc    Get all chargers for the logged-in user, with optional filters
// @route   GET /api/chargers
// @access  Private
// @desc    Get all chargers for the logged-in user, with optional filters
// @route   GET /api/chargers
// @access  Private
const getChargers = asyncHandler(async (req, res) => {
    // Ensure user is authenticated and ID is available from the token
    if (!req.user || !req.user.id) {
        res.status(401);
        throw new Error('Not authorized, user ID missing from token');
    }

    // Initialize the base filter with the user's ID
    const whereClause = {
        userId: req.user.id
    };

    // Apply filters from query parameters
    if (req.query.status) {
        whereClause.status = req.query.status;
    }

    if (req.query.connectorType) {
        whereClause.connectorType = req.query.connectorType;
    }

    if (req.query.powerOutput_min || req.query.powerOutput_max) {
        whereClause.powerOutput = {};

        if (req.query.powerOutput_min) {
            const minPower = Number(req.query.powerOutput_min);
            if (!isNaN(minPower)) {
                whereClause.powerOutput[Op.gte] = minPower;
            } else {
                return res.status(400).json({ message: "Minimum power output must be a valid number." });
            }
        }

        if (req.query.powerOutput_max) {
            // FIX THIS LINE: Change from powerRating_max to powerOutput_max
            const maxPower = Number(req.query.powerOutput_max); // <--- CORRECTED LINE
            if (!isNaN(maxPower)) {
                whereClause.powerOutput[Op.lte] = maxPower;
            } else {
                return res.status(400).json({ message: "Maximum power output must be a valid number." });
            }
        }
    }

    const chargers = await Charger.findAll({
        where: whereClause
    });

    res.status(200).json(chargers);
});

// ... (rest of your controller functions like setCharger, updateCharger, deleteCharger) ...

// @desc    Set new charger (add a charger)
// @route   POST /api/chargers
// @access  Private
const setCharger = asyncHandler(async (req, res) => {
    // Destructure the expected fields from req.body based on your Charger model
    const { name, latitude, longitude, status, powerOutput, connectorType, description } = req.body;

    // Check if all REQUIRED fields are present
    if (!name || !latitude || !longitude || !powerOutput || !connectorType) {
        res.status(400);
        // Updated error message to reflect the actual missing fields
        throw new Error('Please add name, latitude, longitude, power output, and connector type for the charger.');
    }

    // Add console logs for debugging before creation
    console.log('User ID from Auth Middleware (req.user.id):', req.user ? req.user.id : 'req.user is undefined');
    console.log('Request Body for Charger Creation:', req.body);

    const charger = await Charger.create({
        userId: req.user.id, // Assign the logged-in user's ID
        name, // Use the destructured 'name'
        latitude, // Use the destructured 'latitude'
        longitude, // Use the destructured 'longitude'
        status: status || 'available', // Use the destructured 'status', with default
        powerOutput, // Use the destructured 'powerOutput'
        connectorType, // Use the destructured 'connectorType'
        description: description || 'No description provided.', // Use the destructured 'description', with default
    });

    res.status(201).json(charger); // 201 Created for successful resource creation
});

// @desc    Update charger
// @route   PUT /api/chargers/:id
// @access  Private
const updateCharger = asyncHandler(async (req, res) => {
    // Find the charger by primary key (ID)
    const charger = await Charger.findByPk(req.params.id);

    if (!charger) {
        res.status(404);
        throw new Error('Charger not found');
    }

    // Check for user (from protect middleware)
    if (!req.user) {
        res.status(401);
        throw new Error('User not found'); // Should theoretically not happen if protect works
    }

    // Make sure the logged-in user matches the charger's owner
    // Compare req.user.id (from token) with charger.userId (from database)
    if (charger.userId !== req.user.id) { // Corrected field name for Sequelize
        res.status(401);
        throw new Error('User not authorized to update this charger');
    }

    // Update the charger record
    // Use req.body directly here, Sequelize will only update fields present in req.body
    // and matching model attributes.
    const [updatedRows] = await Charger.update(req.body, {
        where: { id: req.params.id },
        returning: true, // For PostgreSQL, return the updated object
    });

    if (updatedRows === 0) {
        res.status(400);
        throw new Error('Charger not updated');
    }

    // Fetch the updated charger to return it
    const updatedCharger = await Charger.findByPk(req.params.id);

    res.status(200).json(updatedCharger);
});

// @desc    Delete charger
// @route   DELETE /api/chargers/:id
// @access  Private
const deleteCharger = asyncHandler(async (req, res) => {
    // Find the charger by primary key (ID)
    const charger = await Charger.findByPk(req.params.id);

    if (!charger) {
        res.status(404);
        throw new Error('Charger not found');
    }

    // Check for user (from protect middleware)
    if (!req.user) {
        res.status(401);
        throw new Error('User not found'); // Should theoretically not happen if protect works
    }

    // Make sure the logged-in user matches the charger's owner
    // Compare req.user.id (from token) with charger.userId (from database)
    if (charger.userId !== req.user.id) { // Corrected field name for Sequelize
        res.status(401);
        throw new Error('User not authorized to delete this charger');
    }

    // Delete the charger record
    await Charger.destroy({
        where: { id: req.params.id }
    });

    res.status(200).json({ id: req.params.id, message: 'Charger removed successfully' });
});

module.exports = {
    getChargers,
    setCharger, // Renamed from createCharger to setCharger as per your code
    updateCharger,
    deleteCharger,
};
