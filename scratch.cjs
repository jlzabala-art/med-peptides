const fs = require('fs');
const path = require('path');

function getClassesFromJSX(dir) {
    let classes = new Set();
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getClassesFromJSX(fullPath).forEach(c => classes.add(c));
        } else if (fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const regex = /className=["']([^"']+)["']/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                match[1].split(/\s+/).forEach(c => {
                    if (c) classes.add(c);
                });
            }
        }
    }
    return classes;
}

const allJSXClasses = getClassesFromJSX('./src');
console.log(`Found ${allJSXClasses.size} unique classes in JSX`);

function getClassesFromCSS(dir) {
    let classes = new Set();
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getClassesFromCSS(fullPath).forEach(c => classes.add(c));
        } else if (fullPath.endsWith('.css')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const regex = /\.([a-zA-Z0-9_-]+)/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                classes.add(match[1]);
            }
        }
    }
    return classes;
}

const allCSSClasses = getClassesFromCSS('./src/styles');
const indexCSSClasses = getClassesFromCSS('./src'); // includes index.css
allCSSClasses.forEach(c => indexCSSClasses.add(c));
console.log(`Found ${indexCSSClasses.size} unique classes in CSS`);

let missing = [];
for (const cls of allJSXClasses) {
    // Ignore dynamic classes or BEM syntax if not strictly tailwind-like
    if (cls.includes('{') || cls.includes('$') || cls.includes('__') || cls.includes('--')) continue;
    
    // Ignore classes starting with tw- if we aren't using them
    let searchCls = cls;
    if (cls.includes(':')) searchCls = cls.split(':').pop(); // Handle hover:, md:
    // Handle arbitrary values like w-[100px]
    if (searchCls.includes('[')) continue; 
    
    if (!indexCSSClasses.has(searchCls)) {
        missing.push(cls);
    }
}

// Group common tailwind prefixes
const tailwindPrefixes = ['flex', 'hidden', 'text-', 'bg-', 'border', 'rounded', 'p-', 'px-', 'py-', 'm-', 'mx-', 'my-', 'mt-', 'mb-', 'pt-', 'pb-', 'w-', 'h-', 'gap-', 'shadow', 'items-', 'justify-', 'font-', 'opacity-', 'transition'];
let missingTailwind = missing.filter(c => tailwindPrefixes.some(p => c.startsWith(p) || c.includes(':' + p) || c === p));

console.log(`Missing Tailwind-like classes: ${missingTailwind.length}`);
const topMissing = missingTailwind.sort((a,b) => a.localeCompare(b));
console.log(topMissing.slice(0, 100).join(', '));
