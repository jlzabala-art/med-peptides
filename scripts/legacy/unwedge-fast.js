import fs from 'fs/promises';
import path from 'path';
import { renameSync } from 'fs';

async function checkFile(filePath) {
    let resolved = false;
    const readPromise = fs.readFile(filePath).then(() => { resolved = true; });
    
    // Wait 100ms
    await new Promise(r => setTimeout(r, 100));
    
    if (!resolved) {
        console.log("WEDGED:", filePath);
        try {
            renameSync(filePath, filePath + '.locked');
            console.log("Renamed", filePath);
        } catch (e) {
            console.log("Failed to rename:", e);
        }
    }
}

async function walk(dir) {
    const list = await fs.readdir(dir);
    const promises = [];
    for (const file of list) {
        const full = path.join(dir, file);
        const stat = await fs.stat(full);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                promises.push(walk(full));
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            promises.push(checkFile(full));
        }
    }
    await Promise.allSettled(promises);
}

console.log("Checking for wedged files extremely fast...");
walk('./src').then(() => {
    console.log("Done fast unwedge!");
    process.exit(0);
});
