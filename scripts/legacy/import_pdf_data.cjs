const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Extracted from PDF OCR pages 6 and 7
const pdfData = [
  { name: "Retatrutide", variants: [ { size: "10 mg", format: "vial", price: 90, kitPrice: 580 }, { size: "15 mg", format: "vial", price: 120, kitPrice: 720 }, { size: "20 mg", format: "vial", price: 130, kitPrice: 850 } ] },
  { name: "Tirzepatide", variants: [ { size: "5 mg", format: "vial", price: 40, kitPrice: 280 }, { size: "10 mg", format: "vial", price: 60, kitPrice: 390 }, { size: "15 mg", format: "vial", price: 90, kitPrice: 500 }, { size: "30 mg", format: "vial", price: 140, kitPrice: 850 }, { size: "60 mg", format: "vial", price: 270, kitPrice: 1550 } ] },
  { name: "Semaglutide", variants: [ { size: "2 mg", format: "vial", price: 25, kitPrice: 150 }, { size: "5 mg", format: "vial", price: 38, kitPrice: 280 }, { size: "10 mg", format: "vial", price: 70, kitPrice: 400 } ] },
  { name: "AOD-9604", variants: [ { size: "2 mg", format: "vial", price: 50, kitPrice: 280 }, { size: "5 mg", format: "vial", price: 90, kitPrice: 480 } ] },
  { name: "ARA-290", variants: [ { size: "10 mg", format: "vial", price: 60, kitPrice: 300 } ] },
  { name: "BPC-157", variants: [ { size: "2 mg", format: "vial", price: 15, kitPrice: 90 }, { size: "5 mg", format: "vial", price: 25, kitPrice: 150 }, { size: "10 mg", format: "vial", price: 40, kitPrice: 250 }, { size: "20 mg", format: "vial", price: 60, kitPrice: 350 } ] },
  { name: "BPC-157 + TB-500", variants: [ { size: "5 mg | 5 mg", format: "vial", price: 70, kitPrice: 380 }, { size: "10 mg | 10 mg", format: "vial", price: 130, kitPrice: 650 } ] },
  { name: "CJC-1295 with DAC", variants: [ { size: "2 mg", format: "vial", price: 30, kitPrice: 150 } ] },
  { name: "5-Amino-1MQ", variants: [ { size: "10 mg", format: "vial", price: 30, kitPrice: 150 } ] },
  { name: "CJC-1295 without DAC", variants: [ { size: "2 mg", format: "vial", price: 20, kitPrice: 100 }, { size: "5 mg", format: "vial", price: 30, kitPrice: 160 }, { size: "10 mg", format: "vial", price: 50, kitPrice: 270 } ] },
  { name: "CJC-1295 without DAC + Ipamorelin", variants: [ { size: "5 mg | 5mg", format: "vial", price: 90, kitPrice: 480 } ] },
  { name: "Cartalax", variants: [ { size: "25 mg", format: "vial", price: 70, kitPrice: 380 } ] },
  { name: "Cardiogen", variants: [ { size: "25 mg", format: "vial", price: 70, kitPrice: 380 } ] },
  { name: "Thymogen", variants: [ { size: "25 mg", format: "vial", price: 70, kitPrice: 380 } ] },
  { name: "Prostamax", variants: [ { size: "25 mg", format: "vial", price: 70, kitPrice: 380 } ] },
  { name: "Testagen", variants: [ { size: "25 mg", format: "vial", price: 70, kitPrice: 380 } ] },
  { name: "Cagrilintide", variants: [ { size: "5 mg", format: "vial", price: 40, kitPrice: 250 }, { size: "10 mg", format: "vial", price: 80, kitPrice: 450 } ] },
  { name: "DSIP", variants: [ { size: "2 mg", format: "vial", price: 40, kitPrice: 200 }, { size: "5 mg", format: "vial", price: 60, kitPrice: 300 } ] },
  { name: "Epithalon", variants: [ { size: "10 mg", format: "vial", price: 40, kitPrice: 200 } ] },
  { name: "FST344", variants: [ { size: "1 mg", format: "vial", price: 90, kitPrice: 130 } ] },
  { name: "GHK-Cu (Human Copper)", variants: [ { size: "50 mg", format: "vial", price: 25, kitPrice: 130 }, { size: "100 mg", format: "vial", price: 45, kitPrice: 220 } ] },
  { name: "GHRP - 2", variants: [ { size: "5 mg", format: "vial", price: 18, kitPrice: 750 } ] }, // Note: the PDF says $750 for kit of 10, that seems like a typo in their PDF but we copy it as is. Wait, $750 is probably $150? The OCR says $750.
  { name: "GLOW (BPC-157 / TB-500 / GHK)", variants: [ { size: "10 mg | 10 mg | 75 mg", format: "vial", price: 120, kitPrice: 750 } ] },
  { name: "KLOW (BPC-157 / TB-500 / GHKCu / KPV)", variants: [ { size: "10 mg | 10 mg | 75 mg | 10 mg", format: "vial", price: 140, kitPrice: 850 } ] },
  { name: "hCG", variants: [ { size: "5000iu", format: "vial", price: 70, kitPrice: 455 }, { size: "10000iu", format: "vial", price: 90, kitPrice: 585 } ] },
  { name: "Hexarelin", variants: [ { size: "2 mg", format: "vial", price: 20, kitPrice: 130 }, { size: "5 mg", format: "vial", price: 40, kitPrice: 260 } ] },
  { name: "HGH 10iu", variants: [ { size: "10 iu", format: "vial", price: 30, kitPrice: 150 } ] },
  { name: "HMG", variants: [ { size: "75 iu", format: "vial", price: 30, kitPrice: 120 } ] },
  { name: "IGF LR3", variants: [ { size: "0.1 mg", format: "vial", price: 30, kitPrice: 180 } ] },
  { name: "Ipamorelin", variants: [ { size: "10 mg", format: "vial", price: 35, kitPrice: 260 } ] },
  { name: "Kisspeptin-10", variants: [ { size: "5 mg", format: "vial", price: 40, kitPrice: 250 } ] },
  { name: "KPV", variants: [ { size: "10 mg", format: "vial", price: 30, kitPrice: 180 } ] },
  { name: "MK-677", variants: [ { size: "12 mg", format: "bottle", price: 120, kitPrice: 120 } ] },
  { name: "GW501516", variants: [ { size: "10 mg", format: "bottle", price: 80, kitPrice: 80 } ] },
  { name: "SLU-PP-332", variants: [ { size: "250 mcg", format: "bottle", price: 80, kitPrice: 80 } ] },
  { name: "MOTS-C", variants: [ { size: "5 mg", format: "vial", price: 50, kitPrice: 280 }, { size: "10 mg", format: "vial", price: 70, kitPrice: 380 } ] },
  { name: "MT2", variants: [ { size: "10 mg", format: "vial", price: 25, kitPrice: 150 } ] },
  { name: "NAD+", variants: [ { size: "500 mg", format: "vial", price: 30, kitPrice: 180 }, { size: "1000 mg", format: "vial", price: 50, kitPrice: 280 } ] },
  { name: "NMN", variants: [ { size: "50 mg", format: "bottle", price: 60, kitPrice: 60 } ] },
  { name: "Oxytocin Acetate", variants: [ { size: "2 mg", format: "vial", price: 30, kitPrice: 180 } ] },
  { name: "Pinealon", variants: [ { size: "16 mg", format: "vial", price: 40, kitPrice: 380 } ] },
  { name: "PE 22-28", variants: [ { size: "10 mg", format: "vial", price: 70, kitPrice: 380 } ] },
  { name: "PNC-27", variants: [ { size: "10 mg", format: "vial", price: 80, kitPrice: 420 } ] },
  { name: "PEG-MGF", variants: [ { size: "5 mg", format: "vial", price: 90, kitPrice: 680 } ] },
  { name: "PT-141", variants: [ { size: "5 mg", format: "vial", price: 25, kitPrice: 180 }, { size: "10 mg", format: "vial", price: 45, kitPrice: 350 } ] },
  { name: "Selank", variants: [ { size: "5 mg", format: "vial", price: 25, kitPrice: 180 }, { size: "10 mg", format: "vial", price: 90, kitPrice: 600 } ] },
  { name: "Semax", variants: [ { size: "10 mg", format: "vial", price: 40, kitPrice: 200 } ] },
  { name: "Sermorelin", variants: [ { size: "5 mg", format: "vial", price: 50, kitPrice: 270 }, { size: "10 mg", format: "vial", price: 90, kitPrice: 480 } ] },
  { name: "Snap-8", variants: [ { size: "10 mg", format: "vial", price: 30, kitPrice: 150 } ] },
  { name: "SS-31", variants: [ { size: "10 mg", format: "vial", price: 70, kitPrice: 380 } ] },
  { name: "Thymulin", variants: [ { size: "10 mg", format: "vial", price: 40, kitPrice: 280 } ] },
  { name: "Tesamorelin", variants: [ { size: "10 mg", format: "vial", price: 80, kitPrice: 580 } ] },
  { name: "Thymosin Alpha 1", variants: [ { size: "10 mg", format: "vial", price: 80, kitPrice: 380 } ] },
  { name: "Thymosin β4 (TB-500)", variants: [ { size: "2 mg", format: "vial", price: 25, kitPrice: 145 }, { size: "5 mg", format: "vial", price: 35, kitPrice: 200 }, { size: "10 mg", format: "vial", price: 60, kitPrice: 350 } ] }
];

// Normalize strings for matching
const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const customMappings = {
  "thymogen": "thymagen",
  "fst344": "fst-344",
  "ghk-cuhumancopper": "ghk-cu",
  "glowbpc-157tb-500ghk": "glow",
  "hgh10iu": "hgh",
  "igflr3": "igf-1-lr3",
  "pe22-28": "pe-22-28",
  "pt-141": "pt-141",
  "thymosin4tb-500": "tb-500",
  "5-amino-1mq": "5-amino-1-mq",
  "cjc-1295withoutdacipamorelin": "cjc-1295withoutdac",
  "mk-677": "mk-677",
  "klowbpc-157tb-500ghkcukpv": "klow",
  "mt2": "mt2"
};

async function run() {
  console.log("Loading products from DB...");
  const snap = await db.collection('products').get();
  const dbProducts = snap.docs.map(d => ({ id: d.id, name: d.data().name, ref: d.ref }));

  let updatedCount = 0;
  let createdCount = 0;

  for (const item of pdfData) {
    const normName = normalize(item.name);
    let matchedProduct = dbProducts.find(p => {
      const normDbName = normalize(p.name);
      return normDbName.includes(normName) || normName.includes(normDbName) || customMappings[normName] === p.id;
    });

    if (!matchedProduct) {
      console.log(`[!] Not found in DB: ${item.name}. Creating product...`);
      const newRef = await db.collection('products').add({
        name: item.name,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        createdAt: new Date().toISOString(),
        status: 'Active',
        visibility: 'Public'
      });
      matchedProduct = { id: newRef.id, name: item.name, ref: newRef };
      dbProducts.push(matchedProduct);
    }

    // Now update/create variants
    for (const v of item.variants) {
      const variantsSnap = await matchedProduct.ref.collection('variants').get();
      
      const cleanSize = v.size.replace(/\s+/g, '');
      const expectedSku = `SKU-${matchedProduct.id.substring(0,8).toUpperCase()}-${cleanSize}-LOTUS`;
      
      let existingVariant = variantsSnap.docs.find(d => {
        const dData = d.data();
        return dData.sku === expectedSku || (dData.size && dData.size.replace(/\s+/g, '') === cleanSize && dData.supplier === "Lotusland Limited");
      });

      const payload = {
        sku: expectedSku,
        supplier: "Lotusland Limited",
        format: v.format,
        size: v.size,
        dosage: v.size,
        pricing: {
          cost: v.price,
          kitCost: v.kitPrice, // Add the 10-unit cost
          kitSize: 10
        },
        updatedAt: new Date().toISOString()
      };

      if (existingVariant) {
        // Merge pricing safely so we don't overwrite clinic/retail if they exist
        const oldData = existingVariant.data();
        const mergedPricing = {
          ...(oldData.pricing || {}),
          cost: v.price,
          kitCost: v.kitPrice,
          kitSize: 10
        };
        payload.pricing = mergedPricing;

        console.log(`    -> Updating variant: ${existingVariant.data().sku} (${v.size})`);
        await existingVariant.ref.update(payload);
        updatedCount++;
      } else {
        console.log(`    -> Creating variant: ${expectedSku} (${v.size})`);
        await matchedProduct.ref.collection('variants').add({
          ...payload,
          status: 'Active',
          inventory: 0,
          createdAt: new Date().toISOString()
        });
        createdCount++;
      }
    }
  }

  console.log(`Migration complete! Created ${createdCount} and updated ${updatedCount} variants.`);
}

run().catch(console.error);
