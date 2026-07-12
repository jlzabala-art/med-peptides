import fs from 'fs/promises';
import path from 'path';

async function checkFile(filePath) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 200);
    try {
        await fs.readFile(filePath, { signal: controller.signal });
        clearTimeout(timeout);
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log("WEDGED:", filePath);
            // Rename it!
            import('fs').then(syncFs => {
                syncFs.renameSync(filePath, filePath + '.locked');
                console.log("Renamed", filePath, "to .locked");
            });
        }
    }
}

async function walk(dir) {
    const list = await fs.readdir(dir);
    for (const file of list) {
        const full = path.join(dir, file);
        const stat = await fs.stat(full);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                await walk(full);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            await checkFile(full);
        }
    }
}

console.log("Checking for wedged files...");
walk('./src').then(() => console.log("Done checking!")).catch(console.error);
