const { DataTypes, Sequelize } = require('sequelize'); // Import Sequelize itself for Op
const { sequelize } = require('../Config/db'); // IMPORTANT: Adjust path if your config/db.js is elsewhere
const User = require('./User'); // Import the User model for association

const Charger = sequelize.define('Charger', {
  id: {
    type: DataTypes.UUID, // Use UUID for IDs
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Foreign key for User (defines the relationship)
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User, // This is the User model
      key: 'id',   // This is the primary key of the User model
    },
    allowNull: false,
  },
  name: { // Add 'name' field as per assignment
    type: DataTypes.STRING,
    allowNull: false, // Name is typically required
  },
  latitude: { // Use latitude for location
    type: DataTypes.FLOAT, // Use FLOAT for geographical coordinates
    allowNull: false,
  },
  longitude: { // Use longitude for location
    type: DataTypes.FLOAT, // Use FLOAT for geographical coordinates
    allowNull: false,
  },
  status: { // Use 'status' field as per assignment (e.g., 'available', 'charging', 'maintenance')
    type: DataTypes.ENUM('active', 'inactive', 'available', 'charging', 'maintenance'),
    defaultValue: 'available', // Set a default value
    allowNull: false,
  },
  powerOutput: { // Use 'powerOutput' field as per assignment (kW)
    type: DataTypes.FLOAT, // Use FLOAT for power ratings
    allowNull: false,
  },
  connectorType: { // Use 'connectorType' field as per assignment
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: { // 'description' can remain
    type: DataTypes.STRING,
    allowNull: true, // Make nullable as it's optional
  },
  // Remove the old 'location', 'type', 'availability', 'powerRating', and 'locationCoordinates' fields
  // as they are replaced by the new ones above.
}, {
  timestamps: true, // This adds createdAt and updatedAt columns
});

// Define the association: A User can have many Chargers
User.hasMany(Charger, { foreignKey: 'userId' });
Charger.belongsTo(User, { foreignKey: 'userId' });

module.exports = Charger;
