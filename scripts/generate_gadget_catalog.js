import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src/components');
const PUBLIC_JSON_PATH = path.join(__dirname, '../public/gadgets-catalog.json');

// Helper to recursively read all JSX files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  
  arrayOfFiles = arrayOfFiles || [];
  
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      if (fullPath.endsWith('.jsx')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });
  
  return arrayOfFiles;
}

// Convert PascalCase to Normal Words (e.g., AdminFinanceWidget -> Admin Finance)
function pascalToWords(text) {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace('Widget', '')
    .replace('Gadget', '')
    .trim();
}

// Map directory names to Portal names
function getPortalName(filePath) {
  if (filePath.includes('/admin/')) return 'Admin Portal';
  if (filePath.includes('/doctor/')) return 'Doctor Portal';
  if (filePath.includes('/patient/')) return 'Patient Portal';
  if (filePath.includes('/wholesaler/')) return 'Wholesaler Portal';
  if (filePath.includes('/finder/')) return 'Finder Application';
  return 'Shared / Foundation';
}

console.log('Scanning for Gadgets/Widgets...');

const allFiles = getAllFiles(SRC_DIR);
const gadgets = [];

// Step 1: Find all Gadget definitions
allFiles.forEach(filePath => {
  const fileName = path.basename(filePath);
  if (fileName.endsWith('Widget.jsx') || fileName.endsWith('Gadget.jsx')) {
    const id = fileName.replace('.jsx', '');
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Fallbacks
    let name = pascalToWords(id);
    let category = 'Operational';
    let description = 'Dynamically discovered platform widget.';
    let iconName = 'Box';
    
    // Try to extract category if present in comments or static properties
    if (content.toLowerCase().includes('finance') || content.toLowerCase().includes('payout')) category = 'Finance';
    if (content.toLowerCase().includes('logistics') || content.toLowerCase().includes('supply')) category = 'Operations';
    if (content.toLowerCase().includes('audit') || content.toLowerCase().includes('security')) category = 'Security';
    
    gadgets.push({
      id,
      name,
      category,
      description,
      iconName,
      status: 'Auto-discovered',
      filePath, // Store temporarily for cross-reference
      usedIn: new Set()
    });
  }
});

console.log(`Found ${gadgets.length} gadgets. Analyzing usage...`);

// Step 2: Scan all files to see where these gadgets are imported/used
allFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  gadgets.forEach(gadget => {
    // If the file imports the gadget, or mentions it in a component (avoiding the file itself)
    if (filePath !== gadget.filePath && content.includes(gadget.id)) {
      gadget.usedIn.add(getPortalName(filePath));
    }
  });
});

// Step 3: Format and write to JSON
const catalog = gadgets.map(g => ({
  id: g.id,
  name: g.name,
  category: g.category,
  description: g.description,
  iconName: g.iconName,
  status: g.status,
  usedIn: Array.from(g.usedIn).sort()
}));

fs.writeFileSync(PUBLIC_JSON_PATH, JSON.stringify(catalog, null, 2), 'utf-8');

console.log(`Catalog successfully written to public/gadgets-catalog.json`);
