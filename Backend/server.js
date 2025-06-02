const express = require('express');
const dotenv = require('dotenv').config();
const colors = require('colors'); // For console log styling
const cors = require('cors'); // CORS middleware

// --- PostgreSQL Database Connection ---
// Ensure this path is correct for your db.js file
const { connectDB, sequelize } = require('./Config/db'); 

// --- Middleware Imports ---
const { errorHandler } = require('./middleware/errorMiddleware'); // Your custom error handler

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const chargingStationRoutes = require('./routes/chargingStationRoutes');
const userRoutes = require('./routes/userRoutes'); // Keep if needed, otherwise remove

const app = express();

// --- Connect to PostgreSQL and Synchronize Models ---
// For Vercel Serverless Functions:
// The database connection and sync will run on 'cold starts' of the function.
// This is generally acceptable for development/testing.
// For production, consider connection pooling or more robust serverless database patterns.
const initializeDatabase = async () => {
    try {
        await connectDB(); // Connect to the database
        // Synchronize Sequelize models (creates tables if they don't exist)
        // IMPORTANT: { force: true } will DROP ALL EXISTING TABLES AND RECREATE THEM.
        // Ensure this is { force: false } for production to avoid data loss!
        await sequelize.sync({ force: false }); 
        console.log('Database synchronized successfully (tables created/updated if needed).'.green.underline);
    } catch (err) {
        console.error('Database initialization error:', err);
        // In a serverless function, you might not want to process.exit(1) here,
        // but rather log the error and let the function fail gracefully.
        // For now, we'll just log.
    }
};

// Call database initialization immediately when the function loads (cold start)
initializeDatabase();

// --- CORS middleware to allow requests from your frontend ---
// For Vercel deployment, you'll need to allow your Vercel frontend URL.
// For initial testing, you can allow all origins, but restrict it in production.
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-frontend-vercel-url.vercel.app' // REPLACE with your actual Vercel frontend URL
        : 'http://localhost:8081', // Your Vue.js frontend's local address
    credentials: true, // If you send cookies/auth headers
}));

// --- Middleware to parse JSON and URL-encoded data ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Define Routes ---
// Vercel automatically maps files in the 'api' directory to '/api' paths.
// So, if your backend is in 'api/server.js', routes defined as '/auth' will be '/api/auth'.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // General user routes (if distinct from auth)
app.use('/api/chargers', chargingStationRoutes);

// Error handling middleware (should be last middleware)
app.use(errorHandler);

// --- EXPORT THE EXPRESS APP FOR VERCEL ---
// This is the crucial change for Vercel Serverless Functions.
// Vercel will import this 'app' instance and use it to handle requests.
module.exports = app;

// Removed app.listen() as Vercel handles the server listening.
// The startServer() function is no longer needed to wrap app.listen().
// The database initialization is now called directly.
