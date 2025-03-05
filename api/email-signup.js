const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3001;

// Enable CORS for development
app.use(cors());

app.use(express.json());

// Store emails in a JSON file
const dataFile = path.join(__dirname, '..', 'data', 'preorders.json');

// Ensure data directory and file exist
async function initializeDataFile() {
    try {
        await fs.access(path.dirname(dataFile));
    } catch {
        await fs.mkdir(path.dirname(dataFile), { recursive: true });
    }

    try {
        await fs.access(dataFile);
    } catch {
        await fs.writeFile(dataFile, JSON.stringify({ emails: [] }, null, 2));
    }
}

// Initialize when server starts
initializeDataFile();

app.post('/api/signup', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Read existing data
        const data = JSON.parse(await fs.readFile(dataFile, 'utf8'));
        
        // Check if email already exists
        if (data.emails.includes(email)) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Add new email
        data.emails.push(email);
        
        // Save updated data
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
        
        res.json({ message: 'Email registered successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Email signup server running on port ${port}`);
});
