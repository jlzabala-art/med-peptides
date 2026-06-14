export function calculateProductHealthScore(product) {
  let score = 100;
  const flags = [];

  if (!product.supplier) {
    score -= 20;
    flags.push('Missing Supplier');
  }
  
  if (!product.stock || product.stock <= 0) {
    score -= 20;
    flags.push('Out of Stock');
  } else if (product.stock < 20) {
    score -= 10;
    flags.push('Low Stock');
  }

  if (product.registrationStatus !== 'Registered') {
    score -= 10;
    flags.push('Missing Regulatory Data');
  }

  if (!product.category) {
    score -= 5;
    flags.push('Missing Category');
  }

  if (!product.sku) {
    score -= 5;
    flags.push('Missing SKU');
  }

  if (!product.guestVialPrice && !product.proVialPrice) {
    score -= 10;
    flags.push('Missing Pricing');
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  let color = 'var(--color-success)'; // Green
  if (score < 60) color = 'var(--color-error)'; // Red
  else if (score < 80) color = 'var(--color-warning)'; // Orange

  return { score, flags, color };
}

export function useProductHealthScore() {
  return { calculateProductHealthScore };
}
