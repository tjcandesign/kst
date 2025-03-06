const path = require('path');
const result = require('dotenv').config();

// Debug: Print dotenv result and environment variables
console.log('Dotenv config result:', result);
console.log('Current working directory:', process.cwd());
console.log('Expected .env path:', path.join(process.cwd(), '.env'));
console.log('All environment variables:', process.env);
console.log('Environment variables we need:', {
    TEST_MODE: process.env.TEST_MODE,
    AUTHORIZED_NUMBERS: process.env.AUTHORIZED_PHONE_NUMBERS
});

// Copy the phone numbers to the expected variable name
process.env.AUTHORIZED_NUMBERS = process.env.AUTHORIZED_PHONE_NUMBERS;
const express = require('express');
const app = express();
const menuStatusRouter = require('./api/menu-status');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Serve static files from root directory
app.use(express.static('.'));

// API routes
app.use('/api/menu-status', menuStatusRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (process.env.TEST_MODE === 'true') {
        console.log('Running in TEST MODE');
        console.log('Use test number +15005550006 for testing');
    }
});
