import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const navRegistryPath = path.join(rootDir, 'src/config/navigationRegistry.js');
const adminPagePath = path.join(rootDir, 'src/app/admin/[[...slug]]/page.jsx');

console.log('🔍 [Route Linter] Validating navigation routes between registry and admin dispatcher...');

if (!fs.existsSync(navRegistryPath)) {
  console.error(`❌ Navigation registry not found at: ${navRegistryPath}`);
  process.exit(1);
}

if (!fs.existsSync(adminPagePath)) {
  console.error(`❌ Admin page dispatcher not found at: ${adminPagePath}`);
  process.exit(1);
}

const navRegistryContent = fs.readFileSync(navRegistryPath, 'utf8');
const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');

// 1. Extract ALL IDs from NAVIGATION_REGISTRY (both groups and items)
// We extract the NAVIGATION_REGISTRY block up to "export const getNavigationForRole"
const registryBlockMatch = navRegistryContent.match(/export const NAVIGATION_REGISTRY = \[([\s\S]*?)\];\s*export const getNavigationForRole/);
const registryBlock = registryBlockMatch ? registryBlockMatch[1] : navRegistryContent;

const idMatches = [...registryBlock.matchAll(/id:\s*['"]([^'"]*)['"]/g)].map(m => m[1].trim());
const allRegistryIds = new Set(idMatches.map(id => id || 'dashboard'));

// 2. Extract ROUTE_ALIASES
const aliasBlockMatch = navRegistryContent.match(/ROUTE_ALIASES\s*=\s*\{([\s\S]*?)\};/);
const routeAliases = new Map();
if (aliasBlockMatch) {
  const aliasEntries = [...aliasBlockMatch[1].matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g)];
  aliasEntries.forEach(entry => {
    routeAliases.set(entry[1], entry[2]);
  });
}

// 3. Extract case labels from getTabComponent in admin/[[...slug]]/page.jsx
const caseMatches = [...adminPageContent.matchAll(/case\s+['"]([^'"]+)['"]\s*:/g)];
const implementedTabs = new Set(caseMatches.map(m => m[1]));

// Known global redirects/interceptors or composite hubs
const SYSTEM_HANDLED = new Set(['dashboard', 'b2c-shop', 'pending-apis', 'overview']);

let missingCount = 0;
const report = [];

allRegistryIds.forEach(id => {
  const isDirectlyImplemented = implementedTabs.has(id);
  const aliasTarget = routeAliases.get(id);
  const isAliasImplemented = aliasTarget && implementedTabs.has(aliasTarget);
  const isSystemHandled = SYSTEM_HANDLED.has(id);

  if (isDirectlyImplemented || isAliasImplemented || isSystemHandled) {
    report.push({
      id,
      status: 'OK',
      target: isDirectlyImplemented ? id : (aliasTarget || 'system-handled')
    });
  } else {
    missingCount++;
    report.push({ id, status: 'MISSING', target: 'NONE' });
  }
});

// Sort report alphabetically for readability
report.sort((a, b) => a.id.localeCompare(b.id));

console.log(`\n📋 Navigation Registry Audit Results (${allRegistryIds.size} total entries):`);
console.table(report);

if (missingCount > 0) {
  console.error(`\n❌ Validation FAILED: ${missingCount} route(s) in navigationRegistry.js lack handlers in src/app/admin/[[...slug]]/page.jsx!`);
  process.exit(1);
}

console.log('\n✅ Route Manifest Validation PASSED: All registered navigation items have verified dispatcher handlers.\n');
process.exit(0);
