import { useState, useMemo } from 'react';
import { GOALS } from '../constants/catalogFilters';

export function useCatalogFilters() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState([]);
  const [activeKpis, setActiveKpis] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    goals: [],
    productTypes: [],
    suppliers: [],
    commercialStatus: {
      inStock: false,
      outOfStock: false,
      priceMissing: false,
      supplierMissing: false,
      singleSourceRisk: false,
    },
    regulatoryStatus: {
      registered: false,
      coaAvailable: false,
      missingCOA: false,
      regulatoryRisk: false,
      researchUseOnly: false,
    },
  });

  const clearAllFilters = () => {
    setActiveCategories([]);
    setActiveKpis([]);
    setAdvancedFilters({
      goals: [],
      productTypes: [],
      commercialStatus: { inStock: false, outOfStock: false, priceMissing: false, supplierMissing: false, singleSourceRisk: false },
      regulatoryStatus: { registered: false, coaAvailable: false, missingCOA: false, regulatoryRisk: false, researchUseOnly: false },
    });
    setSearchQuery('');
  };

  const removeFilter = (id) => {
    if (id.startsWith('category.')) {
      const cat = id.split('.')[1];
      setActiveCategories((prev) => prev.filter((c) => c !== cat));
    } else if (id.startsWith('kpi.')) {
      const kpi = id.split('.')[1];
      setActiveKpis((prev) => prev.filter((k) => k !== kpi));
    } else if (id.startsWith('goals.')) {
      const g = id.split('.')[1];
      setAdvancedFilters((prev) => ({ ...prev, goals: prev.goals.filter((x) => x !== g) }));
    } else if (id.startsWith('productTypes.')) {
      const t = id.split('.')[1];
      setAdvancedFilters((prev) => ({ ...prev, productTypes: prev.productTypes.filter((x) => x !== t) }));
    } else if (id.startsWith('suppliers.')) {
      const s = id.split('.')[1];
      setAdvancedFilters((prev) => ({ ...prev, suppliers: prev.suppliers.filter((x) => x !== s) }));
    } else if (id.startsWith('commercialStatus.')) {
      const k = id.split('.')[1];
      setAdvancedFilters((prev) => ({ ...prev, commercialStatus: { ...prev.commercialStatus, [k]: false } }));
    } else if (id.startsWith('regulatoryStatus.')) {
      const k = id.split('.')[1];
      setAdvancedFilters((prev) => ({ ...prev, regulatoryStatus: { ...prev.regulatoryStatus, [k]: false } }));
    }
  };

  const checkItemAgainstFilters = (item) => {
    // Goals — OR logic: product must match at least one selected goal
    if (advancedFilters.goals?.length > 0) {
      // PRIMARY: match against canonical goalIds[] (post-migration field)
      const itemGoalIds = Array.isArray(item.goalIds) ? item.goalIds : [];

      // FALLBACK: legacy items may not yet have goalIds[] — use dbKeys matching
      let hasMatch = advancedFilters.goals.some(selectedGoalId =>
        itemGoalIds.includes(selectedGoalId)
      );

      if (!hasMatch && itemGoalIds.length === 0) {
        // Legacy fallback: resolve selected goals to dbKeys and fuzzy-match
        const legacyFields = [
          ...(item.goals || []),
          ...(item.canonicalGoals || []),
          ...(item.tags || []),
          item.category || '',
        ].join(' ').toLowerCase();

        const activeDbKeys = advancedFilters.goals.flatMap(goalId => {
          const goalObj = GOALS.find(g => g.id === goalId);
          return goalObj ? goalObj.dbKeys : [goalId];
        });

        hasMatch = activeDbKeys.some(key => {
          const keySpace = key.replace(/_/g, ' ');
          const keyDash  = key.replace(/_/g, '-');
          return legacyFields.includes(key) || legacyFields.includes(keySpace) || legacyFields.includes(keyDash);
        });
      }

      if (!hasMatch) return false;
    }

    
    // Product Type (OR logic within types) — supports availableTypes[] with fallback to primaryType/productType
    if (advancedFilters.productTypes?.length > 0) {
      const itemTypes = Array.isArray(item.availableTypes) && item.availableTypes.length > 0
        ? item.availableTypes
        : [item.primaryType || item.productType || item.type].filter(Boolean);

      const matchesType = advancedFilters.productTypes.some(filterType => 
        itemTypes.includes(filterType) || (filterType === 'raw_material' && itemTypes.includes('api_raw_material'))
      );
      if (!matchesType) {
        return false;
      }
    }
    
    // Suppliers (OR logic within suppliers)
    if (advancedFilters.suppliers?.length > 0) {
      if (!item.supplier || !advancedFilters.suppliers.includes(item.supplier)) {
        return false;
      }
    }
    
    // Commercial Status (AND logic)
    const cStatus = advancedFilters.commercialStatus || {};
    const isItemAvailable = item.inStock !== false || item.stockType === 'on_demand' || item.isDemand === true || item.commercialStatus?.inStock || item.stock > 0;
    if (cStatus.inStock && !isItemAvailable) return false;
    if (cStatus.outOfStock && isItemAvailable) return false;
    if (cStatus.priceMissing && !(item.commercialStatus?.priceMissing || item.isMissingPricing)) return false;
    if (cStatus.supplierMissing && !(item.commercialStatus?.supplierMissing || item.isMissingSupplier)) return false;
    if (cStatus.singleSourceRisk && !(item.commercialStatus?.singleSourceRisk || item.suppliersCount === 1)) return false;

    // Regulatory Status (AND logic)
    const rStatus = advancedFilters.regulatoryStatus || {};
    if (rStatus.registered && !(item.regulatoryStatus?.registered || item.registration === 'Active')) return false;
    if (rStatus.coaAvailable && !(item.regulatoryStatus?.coaAvailable || item.coa === 'Valid')) return false;
    if (rStatus.missingCOA && !(item.regulatoryStatus?.missingCOA || item.coa === 'Missing')) return false;
    if (rStatus.regulatoryRisk && !(item.regulatoryStatus?.regulatoryRisk || item.gmp === 'Missing' || item.coa === 'Missing')) return false;
    if (rStatus.researchUseOnly && !(item.regulatoryStatus?.researchUseOnly || item.researchOnly || (item.category || '').toLowerCase().includes('research'))) return false;

    return true;
  };

  const filterProducts = (products, deferredSearchQuery) => {
    return products.filter((p) => {
      // 1. Text Search
      if (deferredSearchQuery) {
        const q = deferredSearchQuery.toLowerCase();
        const pName = (p.name || '').toLowerCase();
        const pDesc = (p.description || '').toLowerCase();
        const pCategory = (p.category || '').toLowerCase();
        const pGoals = [...(p.goals || []), ...(p.canonicalGoals || []), ...(p.tags || [])].join(' ').toLowerCase();
        if (!pName.includes(q) && !pDesc.includes(q) && !pGoals.includes(q) && !pCategory.includes(q)) {
          return false;
        }
      }

      // 2. Categories
      if (activeCategories.length > 0) {
        if (!activeCategories.includes(p.category)) return false;
      }

      // 3. Advanced Filters
      if (!checkItemAgainstFilters(p)) return false;

      // 4. KPI Filters
      if (activeKpis.length > 0) {
        const variants = p.variants || [];

        if (activeKpis.includes('missing_coa')) {
          const hasMissingCoa = !p.hasCoa || variants.some((v) => !v.hasCoa);
          if (!hasMissingCoa) return false;
        }
        if (activeKpis.includes('missing_supplier')) {
          const hasMissingSupplier = variants.length > 0 
            ? variants.some((v) => !v.supplier || v.supplier === 'Unassigned')
            : (!p.supplier || p.supplier === 'Unassigned');
          if (!hasMissingSupplier) return false;
        }
        if (activeKpis.includes('regulatory_risk')) {
          const hasRisk = p.registrationStatus !== 'Registered' || variants.some((v) => v.registrationStatus !== 'Registered');
          if (!hasRisk) return false;
        }
        if (activeKpis.includes('single_source')) {
          const isSingleSource = p.suppliersCount === 1 || !p.suppliersCount || variants.some((v) => v.suppliersCount === 1 || !v.suppliersCount);
          if (!isSingleSource) return false;
        }
        if (activeKpis.includes('low_health')) {
          const hasLowHealth = (p.healthScore || 100) < 70 || variants.some((v) => (v.healthScore || 100) < 70);
          if (!hasLowHealth) return false;
        }
        if (activeKpis.includes('out_of_stock')) {
          const hasOutOfStock = p.stock === 0 || p.inventoryLevel === 0 || variants.some((v) => v.stock === 0 || v.inventoryLevel === 0);
          if (!hasOutOfStock) return false;
        }
      }

      return true;
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    activeCategories,
    setActiveCategories,
    activeKpis,
    setActiveKpis,
    advancedFilters,
    setAdvancedFilters,
    clearAllFilters,
    removeFilter,
    checkItemAgainstFilters,
    filterProducts
  };
}
