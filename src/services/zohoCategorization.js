// Script for transforming Atlas Health data structures (Peptides, Protocols, Supplements)
// into Zoho Inventory compatible payloads for Item Groups, Items, and Composite Items.

import { products as peptides } from '../data/products.js';
import { supplements } from '../data/supplements.js';
import { apiCatalog as rawApis } from '../data/apis.js';

/**
 * Transforms standard items (peptides, supplements, APIs) into Zoho Item Groups.
 * Zoho Item Groups represent a product line (e.g., "Semaglutide") that has variants (e.g., 2mg, 5mg).
 */
export const generateZohoItemGroups = () => {
  const itemGroups = [];
  
  // 1. Process Peptides
  peptides.forEach((peptide) => {
    // Generate base SKU prefix (e.g. PEP-SEMA)
    const baseSku = `PEP-${peptide.name.replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase()}`;
    
    // We assume the "dosage" field implies the default variant, e.g. "5mg/vial"
    // In a real system, we'd iterate over an array of available variants if they existed.
    // Here we'll generate a single variant for the provided dosage to map it out.
    const sizeVariant = peptide.dosage || 'Standard';

    itemGroups.push({
      group_name: peptide.name,
      description: peptide.desc,
      unit: 'Box',
      category_name: 'Peptides (Single)', // Maps to Zoho Category
      brand: 'Atlas Health',
      is_taxable: true,
      items: [
        {
          name: `${peptide.name} ${sizeVariant}`,
          sku: `${baseSku}-${sizeVariant.replace(/[^A-Za-z0-9]/g, '').toUpperCase()}`,
          rate: peptide.price || 0, // Fallback if no price exists
          purchase_rate: (peptide.price || 0) * 0.4,
          product_type: 'goods',
          attribute_option_name1: 'Vial Size',
          attribute_option_value1: sizeVariant
        }
      ]
    });
  });

  // 2. Process Supplements
  supplements.forEach((supp) => {
    const baseSku = `SUP-${supp.name.replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase()}`;
    const sizeVariant = supp.size || 'Standard';
    
    itemGroups.push({
      group_name: supp.name,
      description: supp.description || '',
      unit: 'Bottle',
      category_name: 'Nutraceuticals / Supplements',
      brand: 'Atlas Health',
      is_taxable: true,
      items: [
        {
          name: `${supp.name} ${sizeVariant}`,
          sku: `${baseSku}-${sizeVariant.replace(/[^A-Za-z0-9]/g, '').toUpperCase()}`,
          rate: supp.price || 0,
          purchase_rate: (supp.price || 0) * 0.5,
          product_type: 'goods',
          attribute_option_name1: 'Size/Count',
          attribute_option_value1: sizeVariant
        }
      ]
    });
  });

  return itemGroups;
};

/**
 * Transforms Protocols into Zoho Composite Items (Bundles).
 * Requires the individual items to exist in Zoho first.
 */
export const generateZohoCompositeItems = (protocols) => {
  const compositeItems = [];

  protocols.forEach((protocol, index) => {
    // Generate SKU for Protocol
    const protocolSku = `PROT-${protocol.id || index.toString().padStart(3, '0')}`;
    
    // We map protocol components (peptides/supplements) into mapped_items
    const mapped_items = [];
    
    // Extract drugs from phase blueprints
    const blueprints = protocol.phase_blueprints || protocol.phases || [];
    blueprints.forEach(phase => {
      const drugs = phase.medications || phase.drugs || phase.compounds || [];
      drugs.forEach(drug => {
        // Construct the expected SKU or Name for the child item
        const childName = drug.product_title || drug.name || drug.compound;
        if (childName) {
           mapped_items.push({
             name: childName, // In actual API call, Zoho needs item_id, we map by name here for preview
             quantity: drug.dose_logic?.vials_required || drug.procurement?.vialCount || 1
           });
        }
      });
    });

    // Add generic medical supplies to every protocol
    mapped_items.push({ name: 'Bacteriostatic Water 30ml', quantity: 2 });
    mapped_items.push({ name: 'Insulin Syringes 100-pack', quantity: 1 });
    mapped_items.push({ name: 'Alcohol Swabs 100-pack', quantity: 1 });

    compositeItems.push({
      name: protocol.protocol_title || protocol.name,
      sku: protocolSku,
      description: protocol.summary || protocol.description || '',
      category_name: 'Clinical Protocols',
      unit: 'Kit',
      rate: protocol.economics?.estimated_total_cost || 0,
      is_combo_product: true,
      mapped_items: mapped_items
    });
  });

  return compositeItems;
};

export const runZohoCategorizationSync = (protocols) => {
  const itemGroups = generateZohoItemGroups();
  const compositeItems = generateZohoCompositeItems(protocols);
  
  console.log(`[Zoho Sync] Generated ${itemGroups.length} Item Groups (Peptides/Supplements/APIs).`);
  console.log(`[Zoho Sync] Generated ${compositeItems.length} Composite Items (Protocols).`);
  
  return { itemGroups, compositeItems };
};
