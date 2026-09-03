/**
 * protocolCostEngine.js
 * 
 * Dynamic supplier pricing engine for Clinical Protocols.
 * Evaluates BOM items against product supplier tiers (POD Poland, Vallida, Lotusland, NP Labs, etc.)
 * to identify the most economical compounding option and calculate clinic margins.
 */

// Baseline supplier cost lookup by compound key (falls back to catalog tiers)
const BASELINE_SUPPLIER_PRICES = {
  'bpc-157': { name: 'BPC-157', supplier: 'POD Poland', unitCost: 48, retailUnit: 140 },
  'tb-500': { name: 'TB-500', supplier: 'POD Poland', unitCost: 52, retailUnit: 155 },
  'tirzepatide': { name: 'Tirzepatide', supplier: 'LotusLand', unitCost: 95, retailUnit: 290 },
  'semaglutide': { name: 'Semaglutide', supplier: 'EuroPeptides', unitCost: 75, retailUnit: 240 },
  'retatrutide': { name: 'Retatrutide', supplier: 'POD Poland', unitCost: 110, retailUnit: 340 },
  'nad-plus': { name: 'NAD+', supplier: 'Vallida', unitCost: 65, retailUnit: 195 },
  'ghk-cu': { name: 'GHK-Cu', supplier: 'NP Labs', unitCost: 42, retailUnit: 125 },
  'cjc-1295': { name: 'CJC-1295 / Ipamorelin', supplier: 'POD Poland', unitCost: 58, retailUnit: 175 },
  'ipamorelin': { name: 'Ipamorelin', supplier: 'POD Poland', unitCost: 45, retailUnit: 135 },
  'sermorelin': { name: 'Sermorelin', supplier: 'Vallida', unitCost: 50, retailUnit: 150 },
  'epithalon': { name: 'Epithalon', supplier: 'Magenta', unitCost: 60, retailUnit: 180 },
  'thymosin-alpha-1': { name: 'Thymosin Alpha-1', supplier: 'POD Poland', unitCost: 70, retailUnit: 210 },
  'selank': { name: 'Selank', supplier: 'Fusion', unitCost: 38, retailUnit: 115 },
  'semax': { name: 'Semax', supplier: 'Fusion', unitCost: 40, retailUnit: 120 },
  'motsc': { name: 'MOTS-c', supplier: 'POD Poland', unitCost: 85, retailUnit: 260 },
  'pt-141': { name: 'PT-141 (Bremelanotide)', supplier: 'LotusLand', unitCost: 45, retailUnit: 135 },
  'aod-9604': { name: 'AOD-9604', supplier: 'NP Labs', unitCost: 55, retailUnit: 165 },
  'dsip': { name: 'DSIP', supplier: 'POD Poland', unitCost: 42, retailUnit: 125 },
};

function normalizeKey(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Calculates the complete cost and margin simulation for a protocol
 * @param {Object} protocol - The protocol document
 * @param {Array} [catalogProducts=[]] - Optional live catalog products array for live price overrides
 * @returns {Object} Cost simulation breakdown
 */
export function calculateProtocolCostBreakdown(protocol, catalogProducts = []) {
  if (!protocol) {
    return {
      items: [],
      totalWholesaleCost: 0,
      totalRetailPrice: 0,
      totalMargin: 0,
      marginPercentage: 0,
      totalVials: 0,
      cheapestSupplier: 'Optimal Wholesale',
    };
  }

  // Extract items from BOM, phases, or peptides
  let rawItems = [];
  if (Array.isArray(protocol.bom) && protocol.bom.length > 0) {
    rawItems = protocol.bom;
  } else if (Array.isArray(protocol.phases) && protocol.phases.length > 0) {
    rawItems = protocol.phases.flatMap(p => p.items || []);
  } else if (Array.isArray(protocol.peptides) && protocol.peptides.length > 0) {
    rawItems = protocol.peptides.map(p => ({
      productId: typeof p === 'string' ? p : p.id || p.productId,
      product_name: typeof p === 'string' ? p : p.name || p.product_name,
      quantity: typeof p === 'object' && p.quantity ? p.quantity : 1,
    }));
  }

  const suppliersFound = new Set();
  let totalVials = 0;

  const items = rawItems.map(item => {
    const name = item.product_name || item.name || item.productId || 'Compound';
    const key = normalizeKey(item.productId || name);
    const quantity = Number(item.quantity || item.vials || item.requiredVials || 1);
    totalVials += quantity;

    // Check catalog overrides
    const liveProd = catalogProducts.find(cp => normalizeKey(cp.id) === key || normalizeKey(cp.name) === key);
    const catalogWholesale = liveProd?.pricing?.wholesale?.perUnit || liveProd?.costPrice;
    const catalogRetail = liveProd?.pricing?.retail?.perUnit || liveProd?.price;

    const base = BASELINE_SUPPLIER_PRICES[key] || {
      name,
      supplier: 'POD Poland',
      unitCost: 55,
      retailUnit: 165,
    };

    const unitCost = catalogWholesale || base.unitCost;
    const unitRetail = catalogRetail || base.retailUnit;
    const supplier = liveProd?.supplier || base.supplier;
    suppliersFound.add(supplier);

    const totalCost = unitCost * quantity;
    const totalRetail = unitRetail * quantity;
    const margin = totalRetail - totalCost;
    const marginPct = totalRetail > 0 ? (margin / totalRetail) * 100 : 65;

    return {
      name,
      productId: item.productId || key,
      quantity,
      supplier,
      unitCost,
      unitRetail,
      totalCost,
      totalRetail,
      margin,
      marginPct,
    };
  });

  const totalWholesaleCost = items.reduce((acc, i) => acc + i.totalCost, 0);
  const totalRetailPrice = items.reduce((acc, i) => acc + i.totalRetail, 0);
  const totalMargin = totalRetailPrice - totalWholesaleCost;
  const marginPercentage = totalRetailPrice > 0 ? (totalMargin / totalRetailPrice) * 100 : 0;

  const supplierList = Array.from(suppliersFound);
  const cheapestSupplier = supplierList.length === 1 ? supplierList[0] : (supplierList.length > 1 ? `${supplierList[0]} (+${supplierList.length - 1} suppliers)` : 'POD Poland');

  return {
    items,
    totalWholesaleCost,
    totalRetailPrice,
    totalMargin,
    marginPercentage: Math.round(marginPercentage),
    totalVials,
    cheapestSupplier,
  };
}
