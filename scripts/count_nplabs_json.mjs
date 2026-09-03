import fs from 'fs';
['./public/data/catalog.v2.json', './public/data/products.json', './public/data/products.v2.json', './src/data/wholesale_parsed.json'].forEach(f => {
    try {
        const data = JSON.parse(fs.readFileSync(f));
        let count = 0;
        data.forEach(p => {
            let isNp = false;
            if ((p.supplier || '').toLowerCase().includes('np lab')) isNp = true;
            if ((p.supplierId || '').toLowerCase().includes('np lab')) isNp = true;
            if (isNp) count++;
        });
        console.log(`${f}: ${count}`);
    } catch(e) {}
});
