const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/preorders.json');

// Ensure data directory and file exist
async function initializeDataFile() {
    try {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.writeFile(DATA_FILE, JSON.stringify({ emails: [] }));
        }
    } catch (error) {
        console.error('Error initializing data file:', error);
    }
}

initializeDataFile();

router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Read existing data
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
        
        // Check if email already exists
        if (data.emails.includes(email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Add new email
        data.emails.push(email);
        
        // Save updated data
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        
        res.json({ message: 'Email registered successfully' });
    } catch (error) {
        console.error('Error handling preorder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
