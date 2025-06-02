const mongoose = require('mongoose');

const ChargingStationSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    // You might want to add more fields here, e.g., type of chargers, availability, etc.
    owner: { // To link stations to the user who created them
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // References the User model
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const ChargingStation = mongoose.model('ChargingStation', ChargingStationSchema);

module.exports = ChargingStation;