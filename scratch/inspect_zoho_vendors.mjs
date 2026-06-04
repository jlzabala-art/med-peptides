import { readFileSync } from 'fs';

const paths = {
  uae: '/Users/joseluiszabala/.gemini/antigravity/brain/fe479ca6-3520-4166-bbf6-4ae3804a0b0c/.system_generated/steps/2840/output.txt',
  spain: '/Users/joseluiszabala/.gemini/antigravity/brain/fe479ca6-3520-4166-bbf6-4ae3804a0b0c/.system_generated/steps/2854/output.txt'
};

for (const [orgName, path] of Object.entries(paths)) {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    console.log(`\n--- VENDORS IN ZOHO BOOKS ${orgName.toUpperCase()} (${data.contacts?.length || 0}) ---`);
    if (data.contacts) {
      data.contacts.forEach(c => {
        console.log(`- ID: ${c.contact_id} | Name: ${c.contact_name} | Type: ${c.contact_type} | Currency: ${c.currency_code} | Email: ${c.email}`);
      });
    }
  } catch (e) {
    console.error(`Error reading ${orgName}:`, e.message);
  }
}
