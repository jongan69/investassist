const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Copy legacy worker file from node_modules to public directory
const sourceFile = path.join(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs');
const targetFile = path.join(publicDir, 'pdf.worker.min.js');

try {
  fs.copyFileSync(sourceFile, targetFile);
  console.log('PDF.js legacy worker file copied successfully!');
} catch (error) {
  console.error('Error copying PDF.js worker file:', error);
  process.exit(1);
} 