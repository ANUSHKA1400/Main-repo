// backend/models/User.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../Config/db');
const bcrypt = require('bcryptjs'); // <--- Make sure bcryptjs is required here!

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true, // This adds createdAt and updatedAt columns
});

// --- ADD THIS CODE SNIPPET BELOW THE User.define BLOCK ---

// Hash password before saving (pre-save hook for creation/update)
User.beforeCreate(async (user) => {
    if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

// Method to compare entered password with hashed password
User.prototype.matchPassword = async function (enteredPassword) {
    // 'this.password' refers to the hashed password stored in the database for the current user instance
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- END OF NEW CODE ---

module.exports = User;