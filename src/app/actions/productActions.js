"use server";

import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Fetches products that have a canonicalName, groups them by canonicalName,
 * and sorts the variants in each group by price_per_mg_usd.
 */
export async function getComparisonDataAction() {
  try {
    const productsRef = adminDb.collection('products');
    
    // We only want products that have been normalized (have canonicalName)
    // To do this efficiently without composite index on every field, we just fetch them all
    // and filter in memory, since the normalized catalog is relatively small (< 1000 items).
    // Or we can just query the whole catalog and group.
    const [productsSnap, wholesellersSnap] = await Promise.all([
      adminDb.collection('products').get(),
      adminDb.collection('wholesellers').get()
    ]);
    
    // Build supplier logistics map
    const supplierLogistics = {};
    wholesellersSnap.docs.forEach(doc => {
      const wData = doc.data();
      const name = (wData.name || '').toLowerCase();
      supplierLogistics[name] = {
        lead_time_days: wData.lead_time_days || null,
        flat_shipping_cost_usd: wData.flat_shipping_cost_usd || 0
      };
    });

    const molecules = {};

    productsSnap.docs.forEach(doc => {
      const data = doc.data();
      // Skip products that haven't been normalized yet
      if (!data.canonicalName || !data.canonical_price_usd) return;

      const groupKey = data.canonicalName;
      if (!molecules[groupKey]) {
        molecules[groupKey] = {
          canonicalName: groupKey,
          variants: []
        };
      }
      
      const supplierName = (data.supplier || 'Unknown').toLowerCase();
      const logistics = supplierLogistics[supplierName] || { lead_time_days: null, flat_shipping_cost_usd: 0 };
      
      molecules[groupKey].variants.push({
        id: doc.id,
        supplier: data.supplier || 'Unknown',
        dosage_form: data.dosage_form || 'N/A',
        total_active_mg: data.total_active_mg || null,
        price_usd: data.canonical_price_usd,
        price_per_mg_usd: data.price_per_mg_usd || null,
        components: data.components || [],
        requires_vat_confirmation: data.requires_vat_confirmation || false,
        container_volume_ml: data.container_volume_ml || data.container_volume || null,
        presentation: data.presentation || data.dosage_form,
        pricing_tiers: data.pricing_tiers || null,
        has_coa_verified: data.has_coa_verified || false,
        purity_percentage: data.purity_percentage || null,
        lead_time_days: logistics.lead_time_days,
        flat_shipping_cost_usd: logistics.flat_shipping_cost_usd
      });
    });

    // Sort variants within each molecule by price_per_mg_usd
    Object.values(molecules).forEach(mol => {
      mol.variants.sort((a, b) => {
        if (a.price_per_mg_usd === null) return 1;
        if (b.price_per_mg_usd === null) return -1;
        return a.price_per_mg_usd - b.price_per_mg_usd;
      });
    });

    // Convert to array and sort molecules alphabetically
    const sortedMolecules = Object.values(molecules).sort((a, b) => 
      a.canonicalName.localeCompare(b.canonicalName)
    );

    return { success: true, data: sortedMolecules };

  } catch (error) {
    console.error("Error in getComparisonDataAction:", error);
    return { success: false, error: error.message };
  }
}
