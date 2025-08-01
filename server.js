const path = require('path');
const result = require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const menuStatusRouter = require('./api/menu-status');

// Initialize Square client
const SquareConnect = require('square-connect');

const defaultClient = SquareConnect.ApiClient.instance;
const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = process.env.SQUARE_ACCESS_TOKEN;

const paymentsApi = new SquareConnect.PaymentsApi();

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

// Square payment endpoints
app.post('/api/create-payment', async (req, res) => {
    try {
        const { amount, items } = req.body;

        // Create a unique idempotency key for this payment attempt
        const idempotencyKey = require('crypto').randomBytes(32).toString('hex');

        // Create payment request
        const response = await squareClient.paymentsApi.createPayment({
            sourceId: req.body.sourceId,
            idempotencyKey,
            amountMoney: {
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'USD'
            },
            metadata: {
                order_items: JSON.stringify(items)
            }
        });

        res.json(response.result);
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            error: {
                message: 'Failed to process payment',
                details: error.message
            }
        });
    }
});

// Square webhook endpoint
app.post('/api/webhook', express.json(), async (req, res) => {
    const notification = req.body;

    // Verify webhook signature
    const squareSignature = req.headers['x-square-signature'];
    if (!squareSignature) {
        return res.status(400).send('No signature found');
    }

    try {
        // Handle different webhook event types
        switch (notification.type) {
            case 'payment.created':
                console.log('Payment created:', notification.data.id);
                break;
            case 'payment.updated':
                console.log('Payment updated:', notification.data.id);
                break;
            case 'payment.failed':
                console.error('Payment failed:', notification.data.id);
                break;
            default:
                console.log(`Unhandled notification type: ${notification.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook Error:', error.message);
        res.status(400).json({ error: error.message });
    }
});

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

