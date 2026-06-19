import { db } from '../../../../firebase';
import { collection, doc, setDoc, updateDoc, getDocs } from 'firebase/firestore';
import { pdfData, normalize, customMappings, getSubcategory } from '../regenpept_data';

export const MigrationService = {
  runRegenPeptMigration: async () => {
    const snap = await getDocs(collection(db, 'products'));
    const dbProducts = snap.docs.map(d => ({ id: d.id, name: d.data().name, ref: d.ref }));

    let createdCount = 0;
    let updatedCount = 0;

    for (const item of pdfData) {
      const normName = normalize(item.name);
      let matchedProduct = dbProducts.find(p => {
        const normDbName = normalize(p.name);
        return normDbName.includes(normName) || normName.includes(normDbName) || customMappings[normName] === p.id;
      });

      if (!matchedProduct) {
        const newDocRef = doc(collection(db, 'products'));
        await setDoc(newDocRef, {
          name: item.name,
          slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          createdAt: new Date().toISOString(),
          supplier: "LotusLand",
          category: "Lyophilized Peptides",
          subcategory: getSubcategory(item.name),
          status: 'Active',
          visibility: 'Public'
        });
        matchedProduct = { id: newDocRef.id, name: item.name, ref: newDocRef };
        dbProducts.push(matchedProduct);
      } else {
        await updateDoc(matchedProduct.ref, { 
          supplier: "LotusLand",
          category: "Lyophilized Peptides",
          subcategory: getSubcategory(item.name)
        });
      }

      const variantsSnap = await getDocs(collection(db, 'products', matchedProduct.id, 'variants'));
      
      for (const v of item.variants) {
        const cleanSize = v.size.replace(/\s+/g, '');
        const expectedSku = `SKU-${matchedProduct.id.substring(0,8).toUpperCase()}-${cleanSize}-LOTUS`;
        
        let existingVariant = variantsSnap.docs.find(d => {
          const dData = d.data();
          return dData.sku === expectedSku || (dData.size && dData.size.replace(/\s+/g, '') === cleanSize && (dData.supplier === "Lotusland Limited" || dData.supplier === "LotusLand" || !dData.supplier || dData.supplier === "Unassigned"));
        });

        let dosageNum = v.size;
        let unitStr = "";
        const match = v.size.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
        if (match) {
           dosageNum = parseFloat(match[1]);
           unitStr = match[2].toLowerCase();
        } else if (v.size.includes("|")) {
           const parts = v.size.split("|").map(s => s.trim());
           const m1 = parts[0].match(/^([\d.]+)\s*([a-zA-Z]+)$/);
           if (m1) {
              dosageNum = v.size.replace(/[a-zA-Z]+/g, '').replace(/\s+/g, '');
              unitStr = m1[2].toLowerCase();
           }
        }

        const payload = {
          sku: expectedSku,
          supplier: "LotusLand",
          format: v.format,
          size: v.size,
          dosage: dosageNum,
          dosage_unit: unitStr,
          pricing: {
            cost: v.price
          },
          updatedAt: new Date().toISOString()
        };

        if (existingVariant) {
          await updateDoc(existingVariant.ref, payload);
          updatedCount++;
        } else {
          const vRef = doc(collection(db, 'products', matchedProduct.id, 'variants'));
          await setDoc(vRef, {
            ...payload,
            status: 'Active',
            inventory: 0,
            createdAt: new Date().toISOString()
          });
          createdCount++;
        }
      }
    }
    return { updatedCount, createdCount };
  },

  migrateLotuslandWarehouses: async (onProgress) => {
    try {
      if (onProgress) onProgress('Starting Lotusland warehouse migration...', 0);
      
      const productsSnap = await getDocs(collection(db, 'products'));
      let processed = 0;
      let updated = 0;
      const total = productsSnap.size;

      for (const pDoc of productsSnap.docs) {
        const variantsSnap = await getDocs(collection(db, 'products', pDoc.id, 'variants'));
        
        for (const vDoc of variantsSnap.docs) {
          const vData = vDoc.data();
          if (vData.supplier && vData.supplier.toLowerCase().includes('lotusland')) {
            const currentStock = typeof vData.stock === 'object' ? vData.stock?.available || 0 : vData.stock || vData.inventory || 0;
            
            const warehouses = [
              { location: "Hong Kong (HK)", stock: currentStock, leadTime: "7 days" },
              { location: "Poland (EU)", stock: 0, leadTime: "3 days" },
              { location: "USA", stock: 0, leadTime: "2 days" }
            ];

            await updateDoc(vDoc.ref, { 
              warehouses,
              stock: currentStock,
              inventory: currentStock
            });
            updated++;
          }
        }
        processed++;
        if (onProgress) onProgress(`Scanning variants... (${processed}/${total} products)`, Math.round((processed / total) * 100));
      }
      
      if (onProgress) onProgress(`Migration complete! Updated ${updated} Lotusland variants.`, 100);
      return { success: true, updated };
    } catch (error) {
      console.error("Lotusland migration error:", error);
      throw error;
    }
  },

  migrateLotuslandFormatAndDosage: async (logger = console.log) => {
    logger('Starting Lotusland Format and Dosage Migration...');
    let updatedCount = 0;
    try {
      const productsRef = collection(db, 'products');
      const productsSnap = await getDocs(productsRef);

      for (const pDoc of productsSnap.docs) {
        const variantsRef = collection(db, 'products', pDoc.id, 'variants');
        const variantsSnap = await getDocs(variantsRef);

        for (const vDoc of variantsSnap.docs) {
          const vData = vDoc.data();
          if (vData.supplier && vData.supplier.toLowerCase().includes('lotusland')) {
            let needsUpdate = false;
            let updateData = {};
            
            // Extract dosage from SKU (e.g. HP-MET-FRZOPA-5MG-BOX)
            const sku = vData.sku || '';
            const mgMatch = sku.match(/(\d+)MG/i);
            if (mgMatch) {
              const dosage = `${mgMatch[1]} mg`;
              if (vData.dosage !== dosage) {
                updateData.dosage = dosage;
                updateData.size = dosage;
                needsUpdate = true;
              }
            }
            
            // Set format to "vial" for lyophilized peptides
            if (!vData.format || vData.format.toLowerCase() !== 'vial') {
              updateData.format = 'vial';
              needsUpdate = true;
            }

            if (needsUpdate) {
              await updateDoc(vDoc.ref, updateData);
              updatedCount++;
              logger(`Updated ${sku}: format=${updateData.format || vData.format}, dosage=${updateData.dosage || vData.dosage}`);
            }
          }
        }
      }
      logger(`Lotusland Format & Dosage Migration Complete! Updated ${updatedCount} variants.`);
    } catch (e) {
      logger(`Migration Failed: ${e.message}`);
    }
  },

  migrateFilterSchema: async (logger = console.log) => {
    logger('Starting Filter Schema Migration...');
    let updatedCount = 0;
    try {
      const productsRef = collection(db, 'products');
      const productsSnap = await getDocs(productsRef);

      for (const pDoc of productsSnap.docs) {
        const pData = pDoc.data();
        let pUpdate = {};
        
        // --- 1. Product Type & Goals mapping from old category ---
        const oldCat = (pData.category || '').toLowerCase();
        const oldSubCat = (pData.subcategory || pData.subCategory || '').toLowerCase();
        const nameStr = (pData.name || '').toLowerCase();
        
        let pType = 'lyophilized_peptide'; // default fallback
        let goals = [];

        if (oldCat.includes('api') || oldCat.includes('raw')) {
          pType = nameStr.includes('supplement') ? 'api_supplement' : 'api_peptide';
        } else if (oldCat.includes('test') || oldCat.includes('genomics') || oldCat.includes('biomarker')) {
          pType = nameStr.includes('dna') || nameStr.includes('genomic') ? 'dna_testing_kit' : 'biomarker_testing_kit';
        } else if (oldCat.includes('pellet')) {
          pType = 'pellet';
        } else if (oldCat.includes('injectable') && !oldCat.includes('lyo')) {
          pType = 'injectable';
        } else if (oldCat.includes('capsule') || oldCat.includes('tablet')) {
          pType = 'capsule_tablet';
        } else if (oldCat.includes('device')) {
          pType = 'medical_device';
        } else if (oldCat.includes('consumable')) {
          pType = 'consumable';
        } else if (oldCat.includes('service')) {
          pType = 'service';
        } else {
          pType = 'lyophilized_peptide';
        }

        // Map goals
        const goalMapping = [
          { keyword: 'weight loss', goal: 'weight_loss_glp1' },
          { keyword: 'glp-1', goal: 'weight_loss_glp1' },
          { keyword: 'metabolic', goal: 'metabolic_health' },
          { keyword: 'anti-aging', goal: 'anti_aging_longevity' },
          { keyword: 'longevity', goal: 'anti_aging_longevity' },
          { keyword: 'recovery', goal: 'recovery_healing' },
          { keyword: 'healing', goal: 'recovery_healing' },
          { keyword: 'cognitive', goal: 'cognitive_mood' },
          { keyword: 'mood', goal: 'cognitive_mood' },
          { keyword: 'nootropic', goal: 'cognitive_mood' },
          { keyword: 'hormon', goal: 'hormonal_optimization' },
          { keyword: 'fertility', goal: 'fertility' },
          { keyword: 'immune', goal: 'immune_support' },
          { keyword: 'skin', goal: 'skin_hair_aesthetics' },
          { keyword: 'hair', goal: 'skin_hair_aesthetics' },
          { keyword: 'aesthetic', goal: 'skin_hair_aesthetics' },
          { keyword: 'performance', goal: 'performance_muscle' },
          { keyword: 'muscle', goal: 'performance_muscle' },
          { keyword: 'growth', goal: 'performance_muscle' },
          { keyword: 'biomarker', goal: 'biomarkers' },
          { keyword: 'genomics', goal: 'genomics' },
        ];

        const combineStr = `${oldCat} ${oldSubCat} ${nameStr}`;
        goalMapping.forEach(m => {
          if (combineStr.includes(m.keyword) && !goals.includes(m.goal)) {
            goals.push(m.goal);
          }
        });
        if (goals.length === 0) goals.push('general_wellness');

        // --- 2. Commercial Status ---
        const commercialStatus = {
          inStock: pData.stock > 0,
          priceMissing: pData.isMissingPricing || false,
          supplierMissing: pData.isMissingSupplier || false,
          singleSourceRisk: true // default to true, refined if needed
        };

        // --- 3. Regulatory Status ---
        const regulatoryStatus = {
          registered: pData.registration === 'Active',
          coaAvailable: pData.coa === 'Valid',
          missingCOA: pData.coa === 'Missing',
          regulatoryRisk: pData.gmp === 'Missing' || pData.coa === 'Missing',
          researchUseOnly: pData.researchOnly === true || oldCat.includes('research')
        };

        pUpdate = {
          productType: pType,
          goals,
          commercialStatus,
          regulatoryStatus
        };

        await updateDoc(pDoc.ref, pUpdate);
        updatedCount++;

        // --- 4. Variants update ---
        const variantsRef = collection(db, 'products', pDoc.id, 'variants');
        const variantsSnap = await getDocs(variantsRef);

        for (const vDoc of variantsSnap.docs) {
          const vData = vDoc.data();
          const vCommStatus = {
            priceMissing: !vData.cost || !vData.wholesalePrice,
            supplierMissing: !vData.supplier
          };
          const vRegStatus = {
            coaAvailable: vData.coa === 'Valid',
            registered: vData.registrationStatus === 'Registered'
          };
          await updateDoc(vDoc.ref, {
            productType: pType,
            stockStatus: vData.stock > 0 ? 'in_stock' : 'out_of_stock',
            commercialStatus: vCommStatus,
            regulatoryStatus: vRegStatus
          });
          updatedCount++;
        }
      }
      logger(`Filter Schema Migration Complete! Updated ${updatedCount} records.`);
    } catch (e) {
      logger(`Migration Failed: ${e.message}`);
    }
  }
};

// Expose to window for easy execution via browser console
if (typeof window !== 'undefined') {
  window.MigrationService = MigrationService;
}
