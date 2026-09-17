/**
 * src/utils/logisticsEstimator.js
 *
 * Intelligent Predictive Logistics & Shipping Cost Estimator
 * Computes realistic delivery costs based on:
 * 1. Supplier Warehouse Origin Hub with correct geolocations
 *    - Lotusland: Poland (default), Hong Kong, Shenzhen
 *    - Europeptides: Bulgaria
 *    - Magenta: Dubai, UAE
 * 2. Recipient Destination Region (Spain, EU, UK, UAE, USA, International)
 * 3. Cargo Format Requirements (Lyophilized vials vs liquid/pen cartridges)
 * 4. Multi-Option Provider Registry (with smart default + operator selection)
 */

// ── 1. SUPPLIER WAREHOUSE REGISTRY & SERVICE TIERS ─────────────────────────
export const SUPPLIER_HUBS = {
  lotusland: {
    name: 'Lotusland Limited',
    originCity: 'Warsaw, Poland',
    originCountry: 'PL',
    region: 'EU',
    warehouses: [
      { id: 'poland', city: 'Warsaw, Poland', country: 'PL', isDefault: true },
      { id: 'hongkong', city: 'Hong Kong', country: 'HK', isDefault: false },
      { id: 'shenzhen', city: 'Shenzhen, China', country: 'CN', isDefault: false },
    ],
    options: [
      {
        id: 'pl_express_cold',
        name: 'Poland EU Express (Pharma-grade packaging)',
        courier: 'DHL Express / FedEx Priority EU',
        transitTime: '2–4 days',
        isCold: true,
        baseCost: 45,
        defaultForCold: true,
        warehouseId: 'poland',
      },
      {
        id: 'pl_standard',
        name: 'Poland Standard EU Courier (Tracked)',
        courier: 'DPD / GLS Europe',
        transitTime: '3–5 days',
        isCold: false,
        baseCost: 25,
        defaultForAmbient: true,
        warehouseId: 'poland',
      },
      {
        id: 'hk_air_express',
        name: 'Hong Kong Air Express (Direct Intercontinental)',
        courier: 'DHL Medical Express / FedEx Priority',
        transitTime: '3–5 days',
        isCold: true,
        baseCost: 75,
        defaultForCold: false,
        warehouseId: 'hongkong',
      },
      {
        id: 'sz_economy',
        name: 'Shenzhen Economy Air (Bulk / Freeze-dried Vials)',
        courier: 'FedEx / UPS Worldwide Economy',
        transitTime: '7–10 days',
        isCold: false,
        baseCost: 30,
        defaultForAmbient: false,
        warehouseId: 'shenzhen',
      },
    ],
  },
  europeptides: {
    name: 'Europeptides',
    originCity: 'Sofia, Bulgaria',
    originCountry: 'BG',
    region: 'EU',
    warehouses: [
      { id: 'bulgaria', city: 'Sofia, Bulgaria', country: 'BG', isDefault: true },
    ],
    options: [
      {
        id: 'bg_express_cold',
        name: 'Bulgaria EU Express (Pharma-grade packaging)',
        courier: 'DHL Express Pharma EU',
        transitTime: '24–48h',
        isCold: true,
        baseCost: 40,
        defaultForCold: true,
        warehouseId: 'bulgaria',
      },
      {
        id: 'bg_std_courier',
        name: 'Standard EU Courier (Tracked Delivery)',
        courier: 'GLS / DPD Europe',
        transitTime: '2–3 days',
        isCold: false,
        baseCost: 20,
        defaultForAmbient: true,
        warehouseId: 'bulgaria',
      },
    ],
  },
  magenta: {
    name: 'Magenta',
    originCity: 'Dubai, UAE',
    originCountry: 'AE',
    region: 'UAE',
    warehouses: [
      { id: 'dubai', city: 'Dubai, UAE', country: 'AE', isDefault: true },
    ],
    options: [
      {
        id: 'ae_express_cold',
        name: 'Dubai Express International (Pharma-grade)',
        courier: 'Emirates Post / Aramex Priority',
        transitTime: '2–4 days',
        isCold: true,
        baseCost: 55,
        defaultForCold: true,
        warehouseId: 'dubai',
      },
      {
        id: 'ae_standard',
        name: 'Dubai Standard International',
        courier: 'Aramex / FedEx',
        transitTime: '4–7 days',
        isCold: false,
        baseCost: 30,
        defaultForAmbient: true,
        warehouseId: 'dubai',
      },
      {
        id: 'ae_local_pickup',
        name: 'Dubai Hub Pickup (In-Person Collection)',
        courier: 'On-site facility pickup',
        transitTime: 'Immediate',
        isCold: false,
        baseCost: 0,
        defaultForAmbient: false,
        warehouseId: 'dubai',
      },
    ],
  },
  pharmapolis: {
    name: 'Pharmapolis',
    legalName: 'Krasota i zdrave 2017 Ltd.',
    vatNumber: 'BG204441460',
    contactPerson: 'Nikolay Aleksandrov',
    originCity: 'Plovdiv, Bulgaria',
    originCountry: 'BG',
    region: 'EU',
    fullAddress: '1A Arhimandrit Evlogi Str, Plovdiv, Bulgaria',
    warehouses: [
      { id: 'plovdiv', city: 'Plovdiv, Bulgaria', country: 'BG', isDefault: true },
    ],
    options: [
      {
        id: 'pv_express_cold',
        name: 'Plovdiv EU Express (Pharma-grade packaging)',
        courier: 'DHL Express / Speedy International',
        transitTime: '24–48h',
        isCold: true,
        baseCost: 38,
        defaultForCold: true,
        warehouseId: 'plovdiv',
      },
      {
        id: 'pv_std_courier',
        name: 'Standard EU Courier (Tracked Delivery)',
        courier: 'Econt / DPD Europe',
        transitTime: '2–4 days',
        isCold: false,
        baseCost: 18,
        defaultForAmbient: true,
        warehouseId: 'plovdiv',
      },
      {
        id: 'pv_economy',
        name: 'Economy EU Ground (Budget-Friendly)',
        courier: 'Bulgarian Posts / GLS Economy',
        transitTime: '5–7 days',
        isCold: false,
        baseCost: 10,
        defaultForAmbient: false,
        warehouseId: 'plovdiv',
      },
    ],
  },
  generic: {
    name: 'Standard Global Partner Hub',
    originCity: 'International Logistics Hub',
    originCountry: 'GLOBAL',
    region: 'GLOBAL',
    warehouses: [
      { id: 'global', city: 'International', country: 'GLOBAL', isDefault: true },
    ],
    options: [
      {
        id: 'generic_cold',
        name: 'International Pharma-Grade Express',
        courier: 'Specialized Medical Courier',
        transitTime: '3–5 days',
        isCold: true,
        baseCost: 65,
        defaultForCold: true,
        warehouseId: 'global',
      },
      {
        id: 'generic_express',
        name: 'Standard International Air Express',
        courier: 'Air Courier Tracked',
        transitTime: '4–6 days',
        isCold: false,
        baseCost: 35,
        defaultForAmbient: true,
        warehouseId: 'global',
      },
      {
        id: 'generic_economy',
        name: 'Economy Regional Freight',
        courier: 'Tracked Ground / Postal',
        transitTime: '5–9 days',
        isCold: false,
        baseCost: 15,
        defaultForAmbient: false,
        warehouseId: 'global',
      },
    ],
  },
};

// ── 2. DETECT SUPPLIER HUB FROM WORKSPACE ITEMS ──────────────────────────────
export function detectSupplierHub(items = []) {
  if (!items || items.length === 0) return SUPPLIER_HUBS.lotusland;

  const supplierNames = items.map((it) => (it.supplierName || it.supplier || '').toLowerCase());

  if (supplierNames.some((s) => s.includes('magenta') || s.includes('dubai'))) {
    return SUPPLIER_HUBS.magenta;
  }
  if (supplierNames.some((s) => s.includes('pharmapolis') || s.includes('krasota') || s.includes('plovdiv'))) {
    return SUPPLIER_HUBS.pharmapolis;
  }
  if (supplierNames.some((s) => s.includes('europeptide') || s.includes('sofia'))) {
    return SUPPLIER_HUBS.europeptides;
  }
  if (supplierNames.some((s) => s.includes('lotus') || s.includes('poland') || s.includes('shenzhen') || s.includes('hong kong') || s.includes('asia'))) {
    return SUPPLIER_HUBS.lotusland;
  }

  // Default to Lotusland Limited as primary catalog supplier
  return SUPPLIER_HUBS.lotusland;
}

// ── 3. DETECT DESTINATION REGION FROM RECIPIENT ─────────────────────────────
export function detectDestinationRegion(targetEntity = {}, shippingAddress = '') {
  const combined = [
    targetEntity?.country,
    targetEntity?.city,
    targetEntity?.address,
    targetEntity?.shippingAddress,
    targetEntity?.state,
    shippingAddress,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    combined.includes('spain') ||
    combined.includes('españa') ||
    combined.includes('madrid') ||
    combined.includes('barcelona') ||
    combined.includes('valencia') ||
    combined.includes('sevilla') ||
    combined.includes('baleares') ||
    combined.includes('canarias') ||
    combined.includes('alicante') ||
    combined.includes('malaga') ||
    combined.includes('bilbao') ||
    combined.includes('zaragoza')
  ) {
    return {
      code: 'ES',
      name: 'Spain / Iberian Peninsula',
      flag: '🇪🇸',
    };
  }

  if (
    combined.includes('uk') ||
    combined.includes('united kingdom') ||
    combined.includes('london') ||
    combined.includes('england') ||
    combined.includes('scotland') ||
    combined.includes('great britain')
  ) {
    return {
      code: 'UK',
      name: 'United Kingdom',
      flag: '🇬🇧',
    };
  }

  if (
    combined.includes('uae') ||
    combined.includes('united arab emirates') ||
    combined.includes('dubai') ||
    combined.includes('abu dhabi') ||
    combined.includes('sharjah')
  ) {
    return {
      code: 'UAE',
      name: 'United Arab Emirates / Middle East Hub',
      flag: '🇦🇪',
    };
  }

  if (
    combined.includes('usa') ||
    combined.includes('united states') ||
    combined.includes('florida') ||
    combined.includes('california') ||
    combined.includes('texas') ||
    combined.includes('new york')
  ) {
    return {
      code: 'US',
      name: 'United States / North America',
      flag: '🇺🇸',
    };
  }

  if (
    combined.includes('germany') ||
    combined.includes('france') ||
    combined.includes('italy') ||
    combined.includes('portugal') ||
    combined.includes('netherlands') ||
    combined.includes('belgium') ||
    combined.includes('austria') ||
    combined.includes('switzerland') ||
    combined.includes('poland') ||
    combined.includes('sweden') ||
    combined.includes('bulgaria') ||
    combined.includes('romania') ||
    combined.includes('greece') ||
    combined.includes('czech') ||
    combined.includes('europe') ||
    combined.includes('eu')
  ) {
    return {
      code: 'EU',
      name: 'European Union (Intra-Community)',
      flag: '🇪🇺',
    };
  }

  // Fallback default: European destination (primary market)
  return {
    code: 'ES',
    name: 'Spain / Western Europe (Default)',
    flag: '🇪🇸',
  };
}

// ── 4. CARGO FORMAT REQUIREMENT CHECK ────────────────────────────────────────
export function checkRequiresColdChain(items = []) {
  if (!items || items.length === 0) return false;

  return items.some((it) => {
    const fmt = (it.format || it.presentation || '').toLowerCase();
    const name = (it.canonicalName || it.name || '').toLowerCase();
    return (
      fmt.includes('pen') ||
      fmt.includes('cartridge') ||
      fmt.includes('liquid') ||
      fmt.includes('nasal') ||
      fmt.includes('drop') ||
      name.includes('pen') ||
      name.includes('cartridge') ||
      name.includes('reconstituted')
    );
  });
}

// ── 5. ROUTE COST MULTIPLIER ─────────────────────────────────────────────────
function getRouteMultiplier(originRegion, destinationCode) {
  const routes = {
    EU: {
      ES: 1.0,
      EU: 1.0,
      UK: 1.25, // Post-Brexit customs
      UAE: 1.5,
      US: 1.6,
    },
    UAE: {
      UAE: 0.3, // Local / domestic
      ES: 1.3,
      EU: 1.3,
      UK: 1.15,
      US: 1.5,
    },
    ASIA: {
      ES: 1.2,
      EU: 1.1,
      UAE: 0.88,
      US: 0.95,
      UK: 1.08,
    },
    GLOBAL: {
      ES: 1.0,
      EU: 1.0,
      UAE: 1.1,
      US: 1.0,
      UK: 1.1,
    },
  };

  return routes[originRegion]?.[destinationCode] ?? 1.0;
}

// ── 6. COMPLETE PREDICTIVE LOGISTICS ENGINE ──────────────────────────────────
/**
 * estimateWorkspaceLogistics
 * Computes recommended and selectable shipping options for a workspace.
 *
 * @param {object} activeWs - Active workspace object
 * @param {array} items - Workspace items
 * @param {object} userOverrides - { selectedOptionId, selectedWarehouseId }
 * @returns {object} Full logistics estimate with options, costs, route info
 */
export function estimateWorkspaceLogistics(activeWs = {}, items = [], userOverrides = {}) {
  const targetEntity = activeWs.targetEntity || {};
  const shippingAddress = activeWs.shippingAddress || '';
  const chosenOptionId = userOverrides.selectedOptionId || activeWs.selectedShippingOptionId || null;
  const chosenWarehouseId = userOverrides.selectedWarehouseId || activeWs.selectedWarehouseId || null;
  const manualCost = activeWs.shippingCostOverride != null ? Number(activeWs.shippingCostOverride) : null;

  const supplierHub = detectSupplierHub(items);
  const destination = detectDestinationRegion(targetEntity, shippingAddress);
  const requiresColdChain = checkRequiresColdChain(items);

  // Resolve active warehouse (default or user-selected)
  const activeWarehouse =
    supplierHub.warehouses?.find((w) => w.id === chosenWarehouseId) ||
    supplierHub.warehouses?.find((w) => w.isDefault) ||
    supplierHub.warehouses?.[0];

  // Determine effective origin region based on selected warehouse
  let effectiveOriginRegion = supplierHub.region;
  if (activeWarehouse) {
    if (['CN', 'HK'].includes(activeWarehouse.country)) effectiveOriginRegion = 'ASIA';
    else if (['AE'].includes(activeWarehouse.country)) effectiveOriginRegion = 'UAE';
    else if (['GLOBAL'].includes(activeWarehouse.country)) effectiveOriginRegion = 'GLOBAL';
    else effectiveOriginRegion = 'EU';
  }

  // Multi-origin check (e.g. Lotusland + Europeptides in same cart)
  const uniqueSuppliers = new Set(
    items.map((it) => it.supplierName || it.supplier || 'Lotusland Limited').filter(Boolean)
  );
  const isMultiOrigin = uniqueSuppliers.size > 1;

  // Route adjustment multiplier
  const routeMultiplier = getRouteMultiplier(effectiveOriginRegion, destination.code);

  // Filter options by selected warehouse (if supplier has multi-warehouse)
  const filteredOptions = activeWarehouse
    ? supplierHub.options.filter(
        (opt) => !opt.warehouseId || opt.warehouseId === activeWarehouse.id
      )
    : supplierHub.options;

  // Map supplier options with adjusted costs
  const availableOptions = filteredOptions.map((opt) => {
    let finalCost = Math.round(opt.baseCost * routeMultiplier);
    if (opt.baseCost === 0) finalCost = 0;

    // If multi-origin, add small split freight fee
    if (isMultiOrigin && finalCost > 0) {
      finalCost += 15;
    }

    const isRecommended = requiresColdChain ? opt.defaultForCold : opt.defaultForAmbient;

    return {
      id: opt.id,
      name: opt.name,
      courier: opt.courier,
      transitTime: opt.transitTime,
      isCold: opt.isCold,
      cost: finalCost,
      isRecommended: Boolean(isRecommended),
      warehouseId: opt.warehouseId,
    };
  });

  // Pick default recommendation: recommended cold or ambient, or first option
  const defaultRecommendedOption =
    availableOptions.find((o) => o.isRecommended) || availableOptions[0];

  // Pick the active option
  const activeOption =
    availableOptions.find((o) => o.id === chosenOptionId) || defaultRecommendedOption;

  const effectiveCost = manualCost !== null ? manualCost : (activeOption?.cost ?? 0);

  const originLabel = activeWarehouse?.city || supplierHub.originCity;
  const routeDescription = `${originLabel} ➔ ${destination.name}`;

  return {
    estimatedCost: effectiveCost,
    calculatedBaseCost: activeOption?.cost ?? 0,
    isManualOverride: manualCost !== null,
    selectedOption: activeOption,
    defaultOption: defaultRecommendedOption,
    availableOptions,
    originHub: supplierHub,
    activeWarehouse,
    availableWarehouses: supplierHub.warehouses || [],
    destinationRegion: destination,
    requiresColdChain,
    routeDescription,
    isMultiOrigin,
    uniqueSuppliersCount: uniqueSuppliers.size,
  };
}
