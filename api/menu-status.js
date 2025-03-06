require('dotenv').config();
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const twilio = require('twilio');

const MENU_STATUS_FILE = path.join(__dirname, '../data/menu-status.json');
const AUTHORIZED_NUMBERS = process.env.AUTHORIZED_PHONE_NUMBERS ? process.env.AUTHORIZED_PHONE_NUMBERS.split(',') : [];
const TEST_MODE = process.env.TEST_MODE === 'true';
const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER;

if (!TWILIO_NUMBER) {
    console.error('TWILIO_PHONE_NUMBER environment variable is not set!');
}

// Test phone numbers that always work in test mode
const TEST_NUMBERS = [
    '+15005550006',  // Always succeeds
    '+15005550007',  // Always fails
];

function isAuthorizedNumber(number) {
    console.log('Checking authorization for:', {
        number,
        authorized_numbers: AUTHORIZED_NUMBERS,
        test_mode: TEST_MODE,
        test_numbers: TEST_NUMBERS
    });
    // In test mode, accept test numbers and authorized numbers
    if (TEST_MODE) {
        const isTestNumber = TEST_NUMBERS.includes(number);
        const isAuthorized = AUTHORIZED_NUMBERS.includes(number);
        console.log(`Test mode: number ${number} is ${isTestNumber ? 'a test number' : 'not a test number'} and ${isAuthorized ? 'is authorized' : 'is not authorized'}`);
        return isTestNumber || isAuthorized;
    }
    return AUTHORIZED_NUMBERS.includes(number);
}

// Commands:
// weekly: Set weekly special (e.g., "weekly Birria Tacos | Beef birria with consomme | 13")
// soldout: Mark items as sold out (e.g., "soldout Shrimp,Salmon")
// available: Mark items as available (e.g., "available Shrimp")
// status: Get current menu status

async function updateMenuStatus(data) {
    await fs.writeFile(MENU_STATUS_FILE, JSON.stringify(data, null, 2));
}

async function getMenuStatus() {
    try {
        const data = await fs.readFile(MENU_STATUS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {
            weeklySpecial: { name: "TBD", description: "Check back for weekly special updates!", price: null },
            soldOutItems: []
        };
    }
}

// Format phone number to E.164 format (+1XXXXXXXXXX)
function formatPhoneNumber(number) {
    // Remove any non-digit characters
    const digits = number.replace(/\D/g, '');
    // For US numbers, add +1 if not present
    return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

router.post('/sms', async (req, res) => {
    console.log('Full request body:', req.body);
    console.log('Environment:', {
        TEST_MODE,
        AUTHORIZED_NUMBERS
    });
    const twiml = new twilio.twiml.MessagingResponse();
    const { Body } = req.body;
    const From = formatPhoneNumber(req.body.From || '');
    
    console.log('Processing request:', {
        Body,
        From,
        rawFrom: req.body.From,
        isAuthorized: isAuthorizedNumber(From)
    });

    // Check if the number is authorized
    if (!isAuthorizedNumber(From)) {
        twiml.message('Unauthorized phone number.');
        return res.type('text/xml').send(twiml.toString());
    }

    // Log in test mode
    if (TEST_MODE) {
        console.log(`Test mode: Received command '${Body}' from ${From}`);
    }

    const command = Body.toLowerCase().trim();
    const menuStatus = await getMenuStatus();

    try {
        if (command.startsWith('weekly')) {
            // Format: weekly Name | Description | Price
            const [_, ...parts] = command.split(' ');
            const [name, description, price] = parts.join(' ').split('|').map(s => s.trim());
            
            menuStatus.weeklySpecial = {
                name: name || 'TBD',
                description: description || 'Check back for weekly special updates!',
                price: price ? parseFloat(price) : null
            };
            
            twiml.message('Weekly special updated!');
        }
        else if (command.startsWith('soldout')) {
            // Format: soldout Item1,Item2,Item3
            const [_, items] = command.split(' ');
            const newItems = items.split(',').map(i => i.trim());
            
            menuStatus.soldOutItems = [...new Set([...menuStatus.soldOutItems, ...newItems])];
            twiml.message(`Marked as sold out: ${newItems.join(', ')}`);
        }
        else if (command.startsWith('available')) {
            // Format: available Item1,Item2,Item3
            const [_, items] = command.split(' ');
            const availableItems = items.split(',').map(i => i.trim());
            
            menuStatus.soldOutItems = menuStatus.soldOutItems.filter(
                item => !availableItems.includes(item)
            );
            twiml.message(`Marked as available: ${availableItems.join(', ')}`);
        }
        else if (command === 'status') {
            const status = `Weekly Special: ${menuStatus.weeklySpecial.name}\nSold Out: ${menuStatus.soldOutItems.join(', ') || 'Nothing'}`
            twiml.message(status);
        }
        else {
            twiml.message('Invalid command. Use:\nweekly Name | Desc | Price\nsoldout Item1,Item2\navailable Item1,Item2\nstatus');
        }

        await updateMenuStatus(menuStatus);
    } catch (error) {
        console.error('Error:', error);
        twiml.message('Error processing command. Please try again.');
    }

    res.type('text/xml').send(twiml.toString());
});

module.exports = router;
