require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const ordersRouter = require('./api/orders');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/orders', ordersRouter);

// Serve static files from the public directory
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
