import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const loadSource = (path, varName) => {
  const raw = readFileSync(path, 'utf-8');
  const evalSource = raw
    .replace(/export const productCategories[\s\S]*?];/, '')
    .replace(new RegExp(`export const ${varName} = `), `const ${varName} = `)
    .replace(/export default/, '// export default');
  
  try {
    const fn = new Function(`${evalSource}; return ${varName};`);
    return fn();
  } catch (err) {
    console.error(`❌ Failed to parse ${path}:`, err.message);
    return [];
  }
};

const peptideProducts = loadSource(join(rootDir, 'src/data/products.js'), 'products');
const supplementProducts = loadSource(join(rootDir, 'src/data/supplements.js'), 'supplements');

console.log(`Loaded ${peptideProducts.length} peptides and ${supplementProducts.length} supplements.`);

const auditProduct = (p) => {
  const issues = [];
  if (!p.desc && !p.description) issues.push('missing desc/description');
  if (!p.mechanisms || p.mechanisms.length === 0) issues.push('missing mechanisms');
  if (!p.clinical_benefits || p.clinical_benefits.length === 0) issues.push('missing clinical_benefits');
  
  const typeData = p.typeData || {};
  if (!typeData.halfLife) issues.push('missing typeData.halfLife');
  if (!typeData.contraindications || typeData.contraindications.length === 0) issues.push('missing typeData.contraindications');
  if (!typeData.dosageRange) issues.push('missing typeData.dosageRange');
  if (!typeData.evidenceLevel) issues.push('missing typeData.evidenceLevel');
  
  return issues;
};

console.log('\n--- PEPTIDES AUDIT ---');
let peptidesWithIssues = 0;
peptideProducts.forEach(p => {
  const issues = auditProduct(p);
  if (issues.length > 0) {
    peptidesWithIssues++;
    console.log(`- ${p.name} (${p.slug}): ${issues.join(', ')}`);
  }
});

console.log('\n--- SUPPLEMENTS AUDIT ---');
let supplementsWithIssues = 0;
supplementProducts.forEach(p => {
  const issues = auditProduct(p);
  if (issues.length > 0) {
    supplementsWithIssues++;
    console.log(`- ${p.name} (${p.slug}): ${issues.join(', ')}`);
  }
});

console.log(`\nAudit finished.`);
console.log(`Peptides with issues: ${peptidesWithIssues}/${peptideProducts.length}`);
console.log(`Supplements with issues: ${supplementsWithIssues}/${supplementProducts.length}`);
