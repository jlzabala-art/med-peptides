/**
 * Formats a number for display.
 * If the absolute value is >= 100, it formats without decimals.
 * If the absolute value is < 100, it formats with 2 decimals.
 * 
 * @param {number|string} value The value to format
 * @returns {string} The formatted string (e.g. "1,200", "50.00")
 */
export function formatNumberAdaptive(value) {
  const num = Number(value);
  if (isNaN(num)) return '-';
  
  const absNum = Math.abs(num);
  const fractionDigits = absNum >= 100 ? 0 : 2;
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });
}

/**
 * Formats a currency value for display.
 * Uses adaptive formatting rules (no decimals if >= 100).
 * 
 * @param {number|string} value The value to format
 * @param {string} currencyCode The currency code ('USD', 'EUR', 'AED', etc)
 * @returns {string} The formatted currency string
 */
export function formatCurrencyAdaptive(value, currencyCode = 'USD') {
  const num = Number(value);
  if (isNaN(num)) return '-';
  
  const absNum = Math.abs(num);
  const fractionDigits = absNum >= 100 ? 0 : 2;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(num);
}
