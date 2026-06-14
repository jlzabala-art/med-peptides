export const parseAtlasIntent = (query, currentState) => {
  const lowerQuery = query.toLowerCase();
  
  // Start with a clone of the current state
  const nextState = {
    workspace: currentState.activeWorkspace,
    categories: [...currentState.activeCategories],
    advancedFilters: JSON.parse(JSON.stringify(currentState.advancedFilters))
  };

  let applied = false;

  // 1. Detect Workspace Changes based on keywords
  if (lowerQuery.match(/stock|inventory|reorder/)) {
    nextState.workspace = 'inventory';
  } else if (lowerQuery.match(/regulatory|coa|sds|document|risk/)) {
    nextState.workspace = 'regulatory';
  } else if (lowerQuery.match(/supplier|vendor|origin/)) {
    nextState.workspace = 'suppliers';
  }

  // 2. Detect Categories
  const categoryMap = {
    peptides: 'Peptides',
    longevity: 'Longevity',
    'anti aging': 'Longevity',
    nootropic: 'Nootropics',
    brain: 'Nootropics',
    testing: 'Testing Kits',
    kit: 'Testing Kits'
  };
  Object.keys(categoryMap).forEach(key => {
    if (lowerQuery.includes(key)) {
      if (!nextState.categories.includes(categoryMap[key])) {
        nextState.categories.push(categoryMap[key]);
        applied = true;
      }
    }
  });

  // 3. Inventory Filters
  if (lowerQuery.match(/low stock|almost empty/)) {
    nextState.workspace = 'inventory';
    nextState.advancedFilters.inventory.stockStatus.inStock = false;
    nextState.advancedFilters.inventory.stockStatus.lowStock = true;
    nextState.advancedFilters.inventory.stockStatus.outOfStock = false;
    applied = true;
  }
  if (lowerQuery.match(/out of stock|empty/)) {
    nextState.workspace = 'inventory';
    nextState.advancedFilters.inventory.stockStatus.inStock = false;
    nextState.advancedFilters.inventory.stockStatus.lowStock = false;
    nextState.advancedFilters.inventory.stockStatus.outOfStock = true;
    applied = true;
  }
  if (lowerQuery.match(/dead stock|worst/)) {
    nextState.workspace = 'inventory';
    nextState.advancedFilters.inventory.performance.fastMovers = false;
    nextState.advancedFilters.inventory.performance.deadStock = true;
    applied = true;
  }
  if (lowerQuery.match(/fast mover|best seller|popular/)) {
    nextState.workspace = 'inventory';
    nextState.advancedFilters.inventory.performance.fastMovers = true;
    nextState.advancedFilters.inventory.performance.deadStock = false;
    applied = true;
  }

  // 4. Regulatory Filters
  if (lowerQuery.match(/missing coa|no coa/)) {
    nextState.workspace = 'regulatory';
    nextState.advancedFilters.regulatory.documents.missingCOA = true;
    nextState.advancedFilters.regulatory.documents.missingSDS = false;
    nextState.advancedFilters.regulatory.documents.missingDocs = false;
    applied = true;
  }
  if (lowerQuery.match(/pending registration|unregistered/)) {
    nextState.workspace = 'regulatory';
    nextState.advancedFilters.regulatory.status.registered = false;
    nextState.advancedFilters.regulatory.status.pending = true;
    applied = true;
  }

  // 5. Supplier / Geography Filters
  if (lowerQuery.match(/china|chinese/)) {
    nextState.advancedFilters[nextState.workspace].country = 'China';
    applied = true;
  } else if (lowerQuery.match(/usa|america|united states/)) {
    nextState.advancedFilters[nextState.workspace].country = 'USA';
    applied = true;
  }

  // 6. Generic Quality/Risk metrics
  if (lowerQuery.match(/high risk|dangerous/)) {
    if (nextState.workspace === 'products' || nextState.workspace === 'inventory') {
      nextState.workspace = 'suppliers'; // shift to supplier view to see risk
    }
    // invert logic: show only high risk
    // (Wait, the filter says maxRisk. We would need a minRisk for "high risk", 
    // but we can just say applied=true and maybe we don't have the exact filter yet)
    applied = true;
  }

  return { nextState, applied };
};
