const { Sequelize } = require('sequelize');

// IMPORTANT: Replace these placeholders with YOUR ACTUAL PostgreSQL credentials
const DB_NAME = 'ev_charger_db';      // The database name you will create in PostgreSQL
const DB_USER = 'ev_charger_user';    // The username you will create in PostgreSQL
const DB_PASSWORD = 'anushka2002'; // The password for that user

// C:\Users\user\Desktop\Jobs\Main\Backend\Config\db.js


const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.PG_URI, {
  dialect: 'postgres',
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  logging: console.log, // <-- THIS IS THE IMPORTANT CHANGE HERE!
  // Add any other options you might have had here, if applicable
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connection has been established successfully.'.blue.underline);
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:'.red.underline, error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };