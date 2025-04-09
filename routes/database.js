const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataPath = process.env.DB_PATH || path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

console.log(`Database files will be stored in: ${dataPath}`);

module.exports = {
  dataPath
};