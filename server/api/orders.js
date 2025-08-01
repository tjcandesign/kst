const express = require('express');
const router = express.Router();
const { Client } = require('square');

// Initialize Square client
const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
});

// Create a new order
router.post('/create', async (req, res) => {
    try {
        const { 
            items,
            customerDetails,
            shippingAddress,
            sourceId // payment source ID from Square.js
        } = req.body;

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Create payment with Square
        const payment = await client.paymentsApi.createPayment({
            sourceId: sourceId,
            amountMoney: {
                amount: Math.round(totalAmount * 100), // Convert to cents
                currency: 'USD'
            },
            locationId: process.env.SQUARE_LOCATION_ID,
            idempotencyKey: Date.now().toString()
        });

        // Store order details in database
        // TODO: Implement database storage

        // Send confirmation email
        // TODO: Implement email sending

        res.json({
            success: true,
            orderId: payment.result.payment.id,
            message: 'Order placed successfully'
        });

    } catch (error) {
        console.error('Order creation failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process order'
        });
    }
});

// Get order status
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const payment = await client.paymentsApi.getPayment(orderId);
        
        res.json({
            success: true,
            order: payment.result.payment
        });

    } catch (error) {
        console.error('Failed to fetch order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order details'
        });
    }
});

module.exports = router;
