import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runZohoCategorizationSync } from '../src/services/zohoCategorization.js';
import { PROTOCOL_BLUEPRINTS } from '../src/data/protocolBlueprints.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the sync payload generator using local static mock data (Phase 1 & 2)
console.log('Initiating Zoho Inventory Categorization Test...');

// Convert PROTOCOL_BLUEPRINTS object to array for the mapping function
const protocolsArray = Object.keys(PROTOCOL_BLUEPRINTS).map(key => ({
  id: key,
  ...PROTOCOL_BLUEPRINTS[key]
}));

const payload = runZohoCategorizationSync(protocolsArray);

// Dump Item Groups Preview
const itemGroupsPath = path.join(__dirname, 'zoho_item_groups_preview.json');
fs.writeFileSync(itemGroupsPath, JSON.stringify(payload.itemGroups, null, 2));

// Dump Composite Items Preview
const compositeItemsPath = path.join(__dirname, 'zoho_composite_items_preview.json');
fs.writeFileSync(compositeItemsPath, JSON.stringify(payload.compositeItems, null, 2));

console.log(`\nTest completed successfully!`);
console.log(`- Item Groups Preview saved to: ${itemGroupsPath}`);
console.log(`- Composite Items Preview saved to: ${compositeItemsPath}`);
