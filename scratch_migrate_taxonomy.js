import { adminDb } from './src/lib/firebaseAdmin.js';
import { PRODUCT_FORMATS } from './src/config/formats.js';
import { PRODUCT_CATEGORIES } from './src/config/categories.js';
import { ACTIVE_INGREDIENTS } from './src/config/ingredients.js';

const categoryMap = {
  'Peptides': 'peptide',
  'Supplements': 'supplement',
  'Equipment': 'equipment',
  'Tests': 'test_kit',
  'APIs': 'api_raw_material',
  'Biomarker Tests': 'test_kit',
  'DNA Test': 'test_kit',
  'Pharma': 'pharma',
  'Consumables': 'equipment',
  'API Peptide': 'api_raw_material',
  'Packaging & Devices': 'equipment'
};

const formatMap = {
  'Vial': 'vial',
  'vial': 'vial',
  'Pre-filled Pen': 'prefilled_pen',
  'Prefilled Pen': 'prefilled_pen',
  'Capsule': 'capsule',
  'capsule': 'capsule',
  'Tablet': 'tablet',
  'tablet': 'tablet',
  'Cream': 'cream',
  'cream': 'cream',
  'Nasal Spray': 'nasal_spray',
  'nasal spray': 'nasal_spray',
  'Troche': 'troche',
  'troche': 'troche'
};

const ingredientMap = {
  'BPC-157': 'bpc_157',
  'BPC 157': 'bpc_157',
  'TB-500': 'tb_500',
  'Semaglutide': 'semaglutide',
  'Tirzepatide': 'tirzepatide',
  'Ipamorelin': 'ipamorelin',
  'CJC-1295': 'cjc_1295',
  'Tesamorelin': 'tesamorelin',
  'NAD+': 'nad_plus',
  'Glutathione': 'glutathione',
  'Melanotan II': 'melanotan_ii',
  'PT-141': 'pt_141',
  'DSIP': 'dsip',
  'Epitalon': 'epitalon',
  'MOTS-c': 'motsc',
  'SS-31': 'ss_31',
  '5-HTP': '5_htp',
  'L-Theanine': 'l_theanine'
};

async function migrateProducts() {
  console.log('Migrating products (Categories, Ingredients, and Variant Formats/Suppliers)...');
  const snapshot = await adminDb.collection('products').get();
  const batch = adminDb.batch();
  let updatedCount = 0;

  // Fetch suppliers to map name to id
  const suppliersSnap = await adminDb.collection('suppliers').get();
  const supplierIdMap = {};
  suppliersSnap.forEach(s => {
    supplierIdMap[s.data().name?.toLowerCase() || s.id] = s.id;
    supplierIdMap[s.data().companyName?.toLowerCase()] = s.id;
  });

  snapshot.forEach(doc => {
    const data = doc.data();
    let updates = {};

    // 1. Category
    if (data.category && categoryMap[data.category]) {
      updates.category = categoryMap[data.category];
    }

    // 2. Ingredients (components) -> ingredientIds
    if (data.components && Array.isArray(data.components)) {
      let ingredientIds = Array.isArray(data.ingredientIds) ? [...data.ingredientIds] : [];
      let changed = false;
      data.components.forEach(comp => {
        const mappedId = ingredientMap[comp.name];
        if (mappedId && !ingredientIds.includes(mappedId)) {
          ingredientIds.push(mappedId);
          changed = true;
        }
      });
      if (changed) updates.ingredientIds = ingredientIds;
    }

    // 3. Formats & Suppliers in Variants
    if (data.variants && Array.isArray(data.variants)) {
      let variantsChanged = false;
      const newVariants = data.variants.map(v => {
        let vUpdates = { ...v };
        
        // Format
        if (v.presentation && formatMap[v.presentation]) {
          vUpdates.presentation = formatMap[v.presentation];
          if (vUpdates.presentation !== v.presentation) variantsChanged = true;
        }

        // Supplier
        if (!v.supplierId && v.supplier) {
          const sName = v.supplier.toLowerCase();
          if (supplierIdMap[sName]) {
            vUpdates.supplierId = supplierIdMap[sName];
            variantsChanged = true;
          }
        }

        return vUpdates;
      });

      if (variantsChanged) {
        updates.variants = newVariants;
      }
    }

    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`Successfully migrated ${updatedCount} products.`);
  } else {
    console.log(`No products needed migration.`);
  }
}

async function migrateProtocols() {
  console.log('Migrating protocols (Ingredients/Peptides)...');
  const snapshot = await adminDb.collection('protocols').get();
  const batch = adminDb.batch();
  let updatedCount = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    let updates = {};

    if (data.peptides && Array.isArray(data.peptides)) {
      let ingredientIds = Array.isArray(data.ingredientIds) ? [...data.ingredientIds] : [];
      let changed = false;
      data.peptides.forEach(pep => {
        const mappedId = ingredientMap[pep];
        if (mappedId && !ingredientIds.includes(mappedId)) {
          ingredientIds.push(mappedId);
          changed = true;
        }
      });
      if (changed) updates.ingredientIds = ingredientIds;
    }

    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`Successfully migrated ${updatedCount} protocols.`);
  } else {
    console.log(`No protocols needed migration.`);
  }
}

async function main() {
  try {
    await migrateProducts();
    await migrateProtocols();
    console.log('Taxonomy migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

main();
