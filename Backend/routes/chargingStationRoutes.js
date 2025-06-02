// backend/routes/chargingStationRoutes.js
const express = require('express');
const router = express.Router();
// Import controller functions, including updateCharger and deleteCharger
const { getChargers, setCharger, updateCharger, deleteCharger } = require('../controllers/chargerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getChargers).post(protect, setCharger);

// Add routes for updating and deleting a specific charger by ID
router.route('/:id')
    .put(protect, updateCharger) // Added this line for the PUT (update) route
    .delete(protect, deleteCharger); // Existing delete route

module.exports = router;