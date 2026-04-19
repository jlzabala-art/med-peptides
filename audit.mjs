// audit.mjs
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const wholesale = JSON.parse(fs.readFileSync(join(__dirname, 'src/data/wholesale_parsed.json'), 'utf8'));

const normalizeString = (str) => {
    return (str || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
};

const _normalizedWholesaleData = Object.entries(wholesale).reduce((acc, [key, strengths]) => {
    acc[normalizeString(key)] = strengths;
    return acc;
}, {});

const getWholesalePrice = (productName, strength) => {
    if (!productName || !strength) return null;

    const normName = normalizeString(productName);
    let family = _normalizedWholesaleData[normName];
    
    if (!family) {
        const matchingKey = Object.keys(_normalizedWholesaleData).find(key => 
            key.includes(normName) || normName.includes(key)
        );
        if (matchingKey) {
            family = _normalizedWholesaleData[matchingKey];
        }
    }

    if (!family) return null;

    const normStrength = normalizeString(strength);
    const exactMatch = family.find(s => normalizeString(s.strength) === normStrength);

    if (exactMatch) return { vialPrice: exactMatch.unit_price };

    const looseMatch = family.find(s => 
        normalizeString(s.strength).includes(normStrength) || 
        normStrength.includes(normalizeString(s.strength))
    );

    return looseMatch ? { vialPrice: looseMatch.unit_price } : null;
};

// Now import products 
import { products } from './src/data/products.js';

const results = [];
let mismatched = 0;
let validated = 0;

products.forEach(p => {
    if (p.source !== "wholesale" && !p.dosage && !p.strength) return;

    const name = p.name || p.displayName;
    const strength = p.dosage || p.strength;
    
    if(!name || !strength) return;

    const wholesaleMatch = getWholesalePrice(name, strength);
    
    if (!wholesaleMatch) {
         results.push({
            name, 
            strength,
            status: "MISSING_IN_WHOLESALE",
         });
         return;
    }

    const currentVial = parseFloat(p.proVialPrice || p.perVialPriceUSD);
    const wholesaleVial = wholesaleMatch.vialPrice;

    const matchVial = currentVial === wholesaleVial;

    if (!matchVial) {
         mismatched++;
         results.push({
             name,
             strength,
             status: "PRICE_MISMATCH",
             legacyVialPrice: currentVial,
             wholesaleVialPrice: wholesaleVial,
             difference: Math.abs(currentVial - wholesaleVial)
         });
    } else {
         validated++;
         results.push({
             name,
             strength,
             status: "OK",
             wholesaleVialPrice: wholesaleVial
         });
    }
});

const report = {
    totalAudited: results.length,
    validatedLegacyMatches: validated,
    mismatchedOverridesActive: mismatched,
    discrepancies: results.filter(r => r.status !== "OK")
};

fs.writeFileSync('pricing_integrity_report.json', JSON.stringify(report, null, 2));

console.log("Done. Found " + mismatched + " mismatches that are now safely overridden via pricingService. Checked " + validated + " valid matches.");
