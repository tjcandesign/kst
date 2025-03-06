const path = require('path');
const result = require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const menuStatusRouter = require('./api/menu-status');

// Debug: Print dotenv result and environment variables
console.log('Dotenv config result:', result);
console.log('Current working directory:', process.cwd());
console.log('Expected .env path:', path.join(process.cwd(), '.env'));

// Copy the phone numbers to the expected variable name
process.env.AUTHORIZED_NUMBERS = process.env.AUTHORIZED_PHONE_NUMBERS;

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true }));

// Force HTTPS in production
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

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

// HTTPS configuration
require('greenlock-express')
    .init({
        packageRoot: __dirname,
        configDir: './greenlock.d',
        maintainerEmail: 'admin@kennedystreettacos.com',
        cluster: false
    })
    .serve(app, () => {
        const PORT = process.env.PORT || 3000;
        console.log(`Server is running on HTTPS`);
        if (process.env.TEST_MODE === 'true') {
            console.log('Running in TEST MODE');
            console.log('Use test number +15005550006 for testing');
        }
    });

