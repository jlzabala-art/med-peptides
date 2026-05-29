
import fs from 'fs';

const filePath = '/Users/joseluiszabala/Documents/Antigravity/Atlas Health-web/src/data/products.js';
let content = fs.readFileSync(filePath, 'utf-8');

const mapping = {
    'BPC-157': 'bpc157.png',
    'TB-500 (Thymosin β4)': 'tb500.png',
    'KPV': 'kpv.png',
    'ARA-290': 'ara290.png',
    'Tirzepatide': 'tirzepatide.png',
    'Retatrutide': 'retatrutide.png',
    'Semaglutide': 'semaglutide.png',
    'Cagrilintide': 'cagrilintide.png',
    'AOD-9604': 'aod9604.png',
    'MOTS-C': 'motsc.png',
    'SLU PP-332': 'slupp332.png',
    'GW-501516': 'gw501516.png',
    'Epithalon': 'epithalon.png',
    'NAD+': 'nadplus.png',
    'SS-31': 'ss31.png'
};

// We need to be careful to only replace the image field within the correct object
// Since the file is large and has many objects, we'll use a regex that matches the name and then the next image field

for (const [name, filename] of Object.entries(mapping)) {
    // Regex explanation:
    // "name":\s*"NAME" -> find the name
    // [\s\S]*? -> match any character (including newlines) lazily
    // "image":\s*"[^"]*" -> until we find the image field
    // We use a function replacement to ensure we only replace the image part
    
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`("name":\\s*"${escapedName}"[\\s\\S]*?"image":\\s*")[^"]*(")`, 'g');
    content = content.replace(regex, `$1/assets/vials/${filename}$2`);
}

// For all other products, ensure they use generic-vial.png if they were using standard-vial or peptide-placeholder
content = content.replace(/\/assets\/vials\/standard-vial\.png/g, '/assets/vials/generic-vial.png');
content = content.replace(/\/peptide-placeholder\.png/g, '/assets/vials/generic-vial.png');

fs.writeFileSync(filePath, content);
console.log('Updated image paths in products.js');
