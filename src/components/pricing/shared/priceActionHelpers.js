'use client';

const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  AED: 'AED ',
  GBP: '£',
};

/**
 * Normalizes a price-list row into a safe, Wholeseller-clean payload
 * shared by both row actions and expanded-panel actions.
 * Never exposes internal cost or supplier fields.
 */
export function buildPriceActionPayload(
  item,
  {
    currency = 'EUR',
    unitPrice = null,
    formattedPrice = '',
    monographUrl = null,
    categoryLabel = '',
  } = {}
) {
  const safeItem = item || {};
  const sku = String(
    safeItem.sku || safeItem.code || safeItem.refCode || safeItem.id || ''
  ).trim();
  const key = String(
    safeItem.id || safeItem.sku || safeItem.code || safeItem.slug || safeItem.name || ''
  ).trim();
  const name = String(
    safeItem.name || safeItem.productName || safeItem.title || 'Product'
  ).trim();
  const brand = String(
    safeItem.brand || safeItem.manufacturer || categoryLabel || ''
  ).trim();
  const packSize = String(
    safeItem.packSize ||
      safeItem.presentation ||
      safeItem.volume ||
      safeItem.vialSize ||
      safeItem.strength ||
      ''
  ).trim();

  const numericPrice =
    unitPrice !== null && unitPrice !== undefined && Number.isFinite(Number(unitPrice))
      ? Number(unitPrice)
      : null;

  const symbol = CURRENCY_SYMBOLS[String(currency).toUpperCase()] || `${currency} `;
  const resolvedFormattedPrice =
    formattedPrice ||
    (numericPrice !== null && numericPrice > 0 ? `${symbol}${numericPrice.toFixed(2)}` : '');

  const skuTag = sku && sku.toLowerCase() !== name.toLowerCase() ? ` (${sku})` : '';
  const packTag = packSize ? ` · ${packSize}` : '';
  const priceTag = resolvedFormattedPrice ? ` · ${resolvedFormattedPrice} ${currency}` : '';
  const b2bSummaryText = `${name}${skuTag}${packTag}${priceTag}`;

  const resolvedMonographUrl =
    monographUrl ||
    (safeItem.slug
      ? `/p/${encodeURIComponent(safeItem.slug)}`
      : safeItem.id
        ? `/p/${encodeURIComponent(safeItem.id)}`
        : null);

  const rfqPayload = {
    id: key || name,
    sku: sku || key || name,
    name,
    brand,
    packSize,
    unitPrice: numericPrice ?? 0,
    currency,
    category: categoryLabel || safeItem.category || safeItem.categoryName || '',
    slug: safeItem.slug || '',
    qty: 1,
  };

  const atlasContext = {
    activeSku: sku || key,
    activeProduct: {
      id: key,
      sku: sku || key,
      name,
      brand,
      packSize,
      price: resolvedFormattedPrice ? `${resolvedFormattedPrice} ${currency}` : undefined,
      indication: safeItem.indication || safeItem.clinicalIndication || safeItem.description || '',
    },
    prompt: `Explain clinical profile, usage, and B2B presentation details for ${name}${skuTag}.`,
  };

  return {
    key,
    sku,
    name,
    brand,
    packSize,
    numericPrice,
    formattedPrice: resolvedFormattedPrice,
    b2bSummaryText,
    resolvedMonographUrl,
    rfqPayload,
    atlasContext,
  };
}
