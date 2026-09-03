/**
 * calculateTotalMg.js
 *
 * Comprehensive utility function to calculate total active milligrams and grams from:
 * 1. An object (variant, product) reading dosage, dose, scale, mg, totalMg, etc.
 * 2. A string ('10 mg', '500 mcg', '1000 mg', '1g', '15 mg + 15 mg')
 * 3. A number (direct milligrams)
 *
 * Rules:
 * - If multiple components exist separated by '+', sums ALL components converted to milligrams (mg).
 * - Converts 'mcg'/'µg' to mg (val / 1000).
 * - Converts 'g' to mg (val * 1000).
 * - Converts 'kg' to mg (val * 1,000,000).
 * - Returns total milligrams (number) or null if unparseable.
 */

export function calculateTotalMg(input) {
  if (!input) return null;

  // 1. Direct numeric milligrams
  if (typeof input === 'number' && !isNaN(input)) {
    return input > 0 ? input : null;
  }

  // 2. Object (variant or product)
  if (typeof input === 'object') {
    if (typeof input.totalMg === 'number' && input.totalMg > 0) return input.totalMg;
    if (typeof input.mg === 'number' && input.mg > 0) return input.mg;

    // Check string fields on object
    const candidateStr = input.dosage 
      || input.dose 
      || input.scale 
      || input.dosage_scale 
      || input.quantity 
      || input.size 
      || input.presentation 
      || input.format 
      || input.name 
      || input.title 
      || '';

    if (typeof candidateStr === 'string' && candidateStr.trim()) {
      const res = parseDosageStringToMg(candidateStr);
      if (res) {
        // If dosage was expressed per ml (e.g., '7500 mcg/ml' or '10 mg/ml') and volume is present, compute total active mg
        if (candidateStr.toLowerCase().includes('/ml') || candidateStr.toLowerCase().includes('/cc')) {
          const volStr = `${input.volume || ''} ${input.size || ''} ${input.quantity || ''} ${input.name || ''} ${input.title || ''}`;
          const volMatch = volStr.match(/(\d+(?:\.\d+)?)\s*(?:ml|cc)\b/i);
          if (volMatch && parseFloat(volMatch[1]) > 0) {
            return parseFloat((res * parseFloat(volMatch[1])).toFixed(4));
          }
        }
        return res;
      }
    }
    return null;
  }

  // 3. String input
  if (typeof input === 'string') {
    return parseDosageStringToMg(input);
  }

  return null;
}

function parseDosageStringToMg(dosageStr) {
  if (!dosageStr || typeof dosageStr !== 'string') return null;

  // Split by '+' if it's a multi-component dosage string
  const parts = dosageStr.split('+');
  let totalMg = 0;
  let validCount = 0;

  for (const part of parts) {
    const match = part.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|µg|g|kg|iu)/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2].toLowerCase();

      let valInMg = val;
      if (unit === 'mcg' || unit === 'µg') valInMg = val / 1000;
      else if (unit === 'g') valInMg = val * 1000;
      else if (unit === 'kg') valInMg = val * 1000 * 1000;

      totalMg += valInMg;
      validCount++;
    } else {
      // Fallback: If it's a standalone number without explicit unit
      const pureNumMatch = part.match(/(\d+(?:\.\d+)?)/);
      if (pureNumMatch) {
        const val = parseFloat(pureNumMatch[1]);
        if (val > 0) {
          totalMg += val;
          validCount++;
        }
      }
    }
  }

  return validCount > 0 ? parseFloat(totalMg.toFixed(4)) : null;
}

export function calculatePricePerMg(price, input) {
  if (typeof price !== 'number' || isNaN(price) || price <= 0) return null;
  const totalMg = calculateTotalMg(input);
  if (!totalMg || totalMg <= 0) return null;
  return parseFloat((price / totalMg).toFixed(4));
}

export function calculatePricePerGram(price, input) {
  if (typeof price !== 'number' || isNaN(price) || price <= 0) return null;
  const totalMg = calculateTotalMg(input);
  if (!totalMg || totalMg <= 0) return null;
  const totalGrams = totalMg / 1000;
  return parseFloat((price / totalGrams).toFixed(2));
}
