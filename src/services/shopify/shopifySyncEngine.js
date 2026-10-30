/**
 * shopifySyncEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mediluxe Health Solutions · Synchronization & Mapping Engine.
 * Converts Atlas Health product dossiers into validated Shopify GraphQL mutations,
 * generates side-by-side diffs, enforces dry-run simulation, and writes audit trails.
 */

import { shopifyClient } from './ShopifyClient';
import { evaluateProductCompliance, REGULATORY_TIERS } from './shopifySafetyGate';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Transforms an Atlas product into a compliant Shopify ProductInput payload.
 */
export function mapAtlasToShopifyPayload(atlasProduct, targetOptions = {}) {
  const compliance = evaluateProductCompliance(atlasProduct);
  if (!compliance.isAllowedOnShopify) {
    throw new Error(`Regulatory restriction: ${compliance.reasons.join(' ')}`);
  }

  const title = String(atlasProduct.name || atlasProduct.title || '').trim();
  const rawDescription = atlasProduct.description || atlasProduct.clinicalIndication || '';

  // Format HTML description highlighting clinical & quality standards
  const apisList = (atlasProduct.apis || []).map(a => `<li><strong>${a.name || a.productName}</strong> (${a.dosage || ''}): ${a.role || a.indication || ''}</li>`).join('');
  const descriptionHtml = `
    <div class="mediluxe-clinical-dossier">
      <p>${rawDescription}</p>
      ${apisList ? `<h4>Active Formulation Components</h4><ul>${apisList}</ul>` : ''}
      <div class="mediluxe-quality-seal" style="margin-top: 15px; padding: 10px; background: #f8fafc; border-left: 3px solid #1a73e8;">
        <small>Formulated under EU GMP cleanroom compounding standards for Mediluxe Health Solutions (UAE).</small>
      </div>
    </div>
  `.trim();

  // Price handling: AED explicit price > converted EUR/USD price > fallback
  let priceAed = 0;
  if (atlasProduct.shopifyPriceAed) {
    priceAed = parseFloat(atlasProduct.shopifyPriceAed);
  } else if (atlasProduct.price) {
    // Standard conversion EUR -> AED approx 4.0 if not specified
    const rawNum = typeof atlasProduct.price === 'number' ? atlasProduct.price : parseFloat(String(atlasProduct.price).replace(/[^0-9.]/g, ''));
    priceAed = !isNaN(rawNum) ? Number((rawNum * 4.0).toFixed(2)) : 195.0;
  } else {
    priceAed = 195.0;
  }

  const sku = atlasProduct.sku || `MLX-${String(atlasProduct.id).slice(0, 8).toUpperCase()}`;

  // Tags for indexing and smart collections
  const tags = [
    'Atlas_Health',
    'Mediluxe_UAE',
    'OTC_Retail',
    `Category_${String(atlasProduct.category || 'General').replace(/\s+/g, '_')}`
  ];

  if (atlasProduct.form) tags.push(`Form_${String(atlasProduct.form).replace(/\s+/g, '_')}`);
  if (atlasProduct.brand) tags.push(`Brand_${String(atlasProduct.brand).replace(/\s+/g, '_')}`);

  const payload = {
    title,
    descriptionHtml,
    vendor: atlasProduct.brand || 'Mediluxe Health Solutions',
    productType: atlasProduct.category || 'Nutraceutical',
    tags,
    status: targetOptions.status || 'DRAFT', // Default to DRAFT for review
    variants: [
      {
        sku,
        price: priceAed.toFixed(2),
        barcode: atlasProduct.barcode || undefined
      }
    ]
  };

  // Add existing Shopify ID if updating
  if (atlasProduct.shopify?.productId) {
    payload.id = atlasProduct.shopify.productId;
  }

  return {
    payload,
    priceAed,
    compliance
  };
}

/**
 * Computes side-by-side diff between Atlas and existing Shopify record.
 */
export function generateProductDiff(atlasProduct, existingShopifyProduct = null) {
  const compliance = evaluateProductCompliance(atlasProduct);
  const { payload, priceAed } = mapAtlasToShopifyPayload(atlasProduct);

  const diff = {
    productId: atlasProduct.id,
    title: {
      atlas: payload.title,
      shopify: existingShopifyProduct?.title || null,
      matches: payload.title === existingShopifyProduct?.title
    },
    sku: {
      atlas: payload.variants[0]?.sku,
      shopify: existingShopifyProduct?.sku || null,
      matches: payload.variants[0]?.sku === existingShopifyProduct?.sku
    },
    priceAed: {
      atlas: priceAed.toFixed(2),
      shopify: existingShopifyProduct?.price || null,
      matches: priceAed.toFixed(2) === existingShopifyProduct?.price
    },
    status: {
      atlasTarget: payload.status,
      shopifyCurrent: existingShopifyProduct?.status || 'UNLINKED'
    },
    compliance,
    isNewProduct: !existingShopifyProduct,
    hasChanges: !existingShopifyProduct || (payload.title !== existingShopifyProduct.title || priceAed.toFixed(2) !== existingShopifyProduct.price)
  };

  return diff;
}

/**
 * Executes a Dry-Run simulation for a list of products.
 */
export async function simulateDryRun(products = []) {
  const results = [];

  for (const product of products) {
    const compliance = evaluateProductCompliance(product);
    if (!compliance.isAllowedOnShopify) {
      results.push({
        id: product.id,
        name: product.name || product.title,
        status: 'BLOCKED',
        allowed: false,
        reasons: compliance.reasons
      });
      continue;
    }

    try {
      const { payload, priceAed } = mapAtlasToShopifyPayload(product);
      results.push({
        id: product.id,
        name: payload.title,
        status: 'READY_TO_SYNC',
        allowed: true,
        sku: payload.variants[0]?.sku,
        priceAed,
        targetStatus: payload.status,
        operation: product.shopify?.productId ? 'UPDATE' : 'CREATE'
      });
    } catch (err) {
      results.push({
        id: product.id,
        name: product.name || product.title,
        status: 'ERROR',
        allowed: false,
        reasons: [err.message]
      });
    }
  }

  return {
    totalEvaluated: products.length,
    readyCount: results.filter(r => r.allowed).length,
    blockedCount: results.filter(r => !r.allowed).length,
    results
  };
}

/**
 * Executes real synchronization of a product to Shopify with audit logging.
 */
export async function syncProductToShopify(atlasProduct, adminUser = { uid: 'system' }) {
  const compliance = evaluateProductCompliance(atlasProduct);
  if (!compliance.isAllowedOnShopify) {
    throw new Error(`Cannot synchronize product to Shopify: ${compliance.reasons.join(', ')}`);
  }

  const { payload, priceAed } = mapAtlasToShopifyPayload(atlasProduct);
  let shopifyRes = null;
  let operation = 'CREATE';

  if (atlasProduct.shopify?.productId) {
    operation = 'UPDATE';
    shopifyRes = await shopifyClient.updateProduct(payload);
  } else {
    shopifyRes = await shopifyClient.createProduct(payload);
  }

  const createdOrUpdatedProduct = shopifyRes?.data?.productCreate?.product ||
    shopifyRes?.data?.productUpdate?.product ||
    null;

  const userErrors = shopifyRes?.data?.productCreate?.userErrors ||
    shopifyRes?.data?.productUpdate?.userErrors ||
    shopifyRes?.errors ||
    [];

  const isSuccess = Boolean(createdOrUpdatedProduct && userErrors.length === 0);

  // 1. Audit Log in Firestore
  const logRef = adminDb.collection('shopify_sync_logs').doc();
  const logEntry = {
    id: logRef.id,
    timestamp: new Date().toISOString(),
    adminUid: adminUser.uid,
    adminEmail: adminUser.email || null,
    atlasProductId: atlasProduct.id,
    operation,
    targetShopifyId: createdOrUpdatedProduct?.id || atlasProduct.shopify?.productId || null,
    success: isSuccess,
    userErrors,
    priceAed,
    isSimulated: Boolean(shopifyRes?.isSimulated)
  };
  await logRef.set(logEntry);

  // 2. Update Atlas Product Shopify Sub-object
  if (isSuccess || shopifyRes?.isSimulated) {
    const assignedShopifyId = createdOrUpdatedProduct?.id || `gid://shopify/Product/simulated-${Date.now()}`;
    const assignedHandle = createdOrUpdatedProduct?.handle || String(payload.title).toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await adminDb.collection('products').doc(atlasProduct.id).set({
      shopify: {
        productId: assignedShopifyId,
        handle: assignedHandle,
        status: payload.status,
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
        lastError: null,
        approvedForShopify: true,
        approvedBy: adminUser.uid,
        approvedAt: new Date().toISOString(),
        shopifyPriceAed: priceAed
      }
    }, { merge: true });
  } else {
    await adminDb.collection('products').doc(atlasProduct.id).set({
      shopify: {
        syncStatus: 'error',
        lastSyncedAt: new Date().toISOString(),
        lastError: userErrors.map(e => e.message).join('; ')
      }
    }, { merge: true });
  }

  return {
    success: isSuccess || Boolean(shopifyRes?.isSimulated),
    operation,
    shopifyProduct: createdOrUpdatedProduct,
    userErrors,
    logId: logRef.id
  };
}
