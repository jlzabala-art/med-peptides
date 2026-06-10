export function normalizeText(txt) {
  return (txt || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function findMatchingProduct(itemName, catalogProducts) {
  if (!itemName || !catalogProducts) return null;
  const itemNorm = normalizeText(itemName);
  
  let match = catalogProducts.find(p => normalizeText(p.name) === itemNorm);
  
  if (!match) {
    match = catalogProducts.find(p => normalizeText(p.id) === itemNorm);
  }
  
  if (!match) {
    match = catalogProducts.find(p => 
      normalizeText(p.name).includes(itemNorm) || 
      itemNorm.includes(normalizeText(p.name))
    );
  }
  
  return match;
}

export function getFuzzySuggestions(itemName, catalogProducts) {
  if (!itemName || !catalogProducts) return [];
  const itemWords = itemName.toLowerCase().split(/[^a-z0-9]+/);
  
  return catalogProducts
    .map(p => {
      const prodName = (p.name || '').toLowerCase();
      const prodWords = prodName.split(/[^a-z0-9]+/);
      const overlap = itemWords.filter(w => w.length > 2 && prodWords.includes(w)).length;
      return { product: p, score: overlap };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.product);
}

export function calculateAILeadScore(lead) {
  // Mock AI Opportunity Score (0-100)
  let score = 50;
  if (lead.temperature === 'HOT') score += 30;
  if (lead.temperature === 'WARM') score += 15;
  if (lead.type === 'rfq') {
    const items = lead.originalData?.items || [];
    if (items.length > 50) score += 20;
    else if (items.length > 10) score += 10;
  }
  if (lead.status === 'new') score += 5;
  if (lead.status === 'completed' || lead.status === 'won') score = 100;
  if (lead.status === 'lost') score = 0;
  
  return Math.min(100, Math.max(0, score));
}

export function calculateDetailedAIScore(lead) {
  const baseScore = calculateAILeadScore(lead);
  let strength = 'Medium';
  if (baseScore >= 80) strength = 'High';
  else if (baseScore < 50) strength = 'Low';

  const items = lead.originalData?.items || [];
  const itemQty = items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  
  const requestedProductsScore = lead.type === 'rfq' ? Math.min(100, items.length * 8 + 40) : 55;
  const historicalActivityScore = lead.status === 'new' ? 50 : 85;
  const supplierMatchScore = lead.type === 'rfq' ? 92 : 60;
  const volumeScore = lead.type === 'rfq' ? Math.min(100, itemQty * 0.1 + 35) : 48;
  const urgencyScore = lead.temperature === 'HOT' ? 95 : lead.temperature === 'WARM' ? 75 : 50;
  const conversionProbability = Math.round(baseScore * 0.95);

  return {
    score: baseScore,
    strength,
    factors: {
      requestedProducts: requestedProductsScore,
      historicalActivity: historicalActivityScore,
      supplierMatch: supplierMatchScore,
      volume: volumeScore,
      urgency: urgencyScore,
      conversionProbability
    }
  };
}
