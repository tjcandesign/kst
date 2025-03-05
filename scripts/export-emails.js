const fs = require('fs');
const path = require('path');

// Read the preorders file
const dataFile = path.join(__dirname, '..', 'data', 'preorders.json');
const exportFile = path.join(__dirname, '..', 'data', `email-list-${new Date().toISOString().split('T')[0]}.csv`);

try {
    // Read and parse the JSON file
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Create CSV content
    const csvContent = ['Email,Signup Date'].concat(
        data.emails.map(email => `${email},${new Date().toISOString().split('T')[0]}`)
    ).join('\n');
    
    // Write to CSV file
    fs.writeFileSync(exportFile, csvContent);
    
    console.log(`Successfully exported ${data.emails.length} emails to: ${exportFile}`);
} catch (error) {
    console.error('Error exporting emails:', error.message);
}
