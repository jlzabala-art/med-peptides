const fs = require('fs');

const content = fs.readFileSync('src/routes/AdminRoutes.jsx', 'utf8');
const routes = [];

const regex = /<Route\s+path="([^"]+)"\s+element=\{[\s\S]*?<AdminTabErrorBoundary tabId="([^"]+)"[^>]*>[\s\S]*?<([A-Z][a-zA-Z0-9_]+)[\s\S]*?<\/AdminTabErrorBoundary>/g;
let match;
while ((match = regex.exec(content)) !== null) {
  routes.push({
    path: match[1],
    tabId: match[2],
    component: match[3],
  });
}

// Special case for root (index)
const indexRegex = /<Route\s+index\s+element=\{[\s\S]*?<AdminTabErrorBoundary tabId="([^"]+)"[^>]*>[\s\S]*?<([A-Z][a-zA-Z0-9_]+)[\s\S]*?<\/AdminTabErrorBoundary>/;
const indexMatch = indexRegex.exec(content);
if (indexMatch) {
  routes.push({ path: '', tabId: indexMatch[1], component: indexMatch[2] });
}

console.log(JSON.stringify(routes, null, 2));
