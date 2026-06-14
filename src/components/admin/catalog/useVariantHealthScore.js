export function calculateVariantHealthScore(variant) {
  let score = 100;
  const flags = [];

  if (!variant.supplier) {
    score -= 20;
    flags.push({ label: 'Missing Supplier', penalty: -20 });
  }

  if (!variant.stock || variant.stock <= 0) {
    score -= 20;
    flags.push({ label: 'Out of Stock', penalty: -20 });
  } else if (variant.stock < (variant.reorderPoint || 20)) {
    score -= 10;
    flags.push({ label: 'Low Stock', penalty: -10 });
  }

  // We can treat coa missing as -30 as suggested in the plan
  if (!variant.coa) {
    score -= 30;
    flags.push({ label: 'Missing COA', penalty: -30 });
  }

  if (variant.registrationStatus !== 'Registered' && !variant.gmp) {
    score -= 10;
    flags.push({ label: 'Missing Regulatory Data', penalty: -10 });
  }

  if (!variant.sku) {
    score -= 5;
    flags.push({ label: 'Missing SKU', penalty: -5 });
  }

  if (!variant.msrp && !variant.wholesalePrice) {
    score -= 15;
    flags.push({ label: 'Missing Pricing', penalty: -15 });
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  let color = '#10b981'; // Green
  let status = 'Healthy';
  if (score < 60) {
    color = '#ef4444'; // Red
    status = 'Critical';
  } else if (score < 80) {
    color = '#f59e0b'; // Orange
    status = 'At Risk';
  }

  return { score, flags, color, status };
}

export function useVariantHealthScore() {
  return { calculateVariantHealthScore };
}
