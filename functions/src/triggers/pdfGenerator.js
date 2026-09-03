'use strict';
/**
 * PDF Generator — Firebase Cloud Function (Firestore Trigger)
 *
 * Triggered by: onDocumentCreated('quotations/{refNumber}')
 * where doc has status: 'pending' and a configSnapshot.
 *
 * This moves heavy PDF generation off the Next.js API route (stream-based)
 * to a background worker, eliminating timeout risk and memory pressure
 * from large base64 payloads.
 *
 * Progress is written back to the same Firestore doc so the client
 * (PriceListPdfDrawer) can subscribe with onSnapshot and track progress.
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const db = admin.firestore;

// ─── Constants ────────────────────────────────────────────────────────────────
const TIER_MAPPING = { cost: 'master', wholeseller: 'wholesale', clinic: 'clinic', retail: 'retail' };
const FALLBACK_FX  = { USD: 1, EUR: 0.92, MXN: 17.5 };
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', MXN: '$' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function fetchFxRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('FX API error');
    const data = await res.json();
    return { rates: data.rates || FALLBACK_FX, isLive: true, date: data.time_last_update_utc };
  } catch {
    return { rates: FALLBACK_FX, isLive: false, date: 'indicative only' };
  }
}

function convertPrice(usdPrice, currency, fxRates) {
  if (!usdPrice) return 0;
  const rate = fxRates[currency] || 1;
  return Math.round(usdPrice * rate * 100) / 100;
}

function resolveVariantPrice(variant, { tier }) {
  const t = TIER_MAPPING[tier] || 'master';
  const pricing = variant.pricing || {};
  
  const extractNum = (val) => {
    if (val == null) return null;
    if (typeof val === 'number') return isNaN(val) ? null : val;
    if (typeof val === 'string') {
      const n = parseFloat(val);
      return isNaN(n) ? null : n;
    }
    if (typeof val === 'object') {
      const sub = val.perUnit ?? val.unitPrice ?? val.unitCost ?? val.price ?? val.base ?? val.tiers?.[0]?.price ?? val.tiers?.[0]?.unitPrice ?? val.tiers?.[0]?.unitCost;
      if (sub != null) return extractNum(sub);
    }
    return null;
  };

  let perUnit = extractNum(pricing[t]) ?? extractNum(pricing.master) ?? extractNum(pricing.retail) ?? extractNum(pricing.acquisition);
  
  if (perUnit == null) {
    perUnit = extractNum(variant.unit_price) ??
              extractNum(variant.price) ??
              extractNum(variant.cost_tiers?.cost_1) ??
              extractNum(variant.cost_1) ??
              extractNum(variant.unitPrice) ??
              extractNum(variant.price_eur) ??
              extractNum(variant.price_aed) ??
              extractNum(variant.supplierUnitCostUSD) ??
              0;
  }

  let kit = extractNum(pricing[`${t}_kit`]) ?? extractNum(pricing.kit);
  if (kit == null) {
    kit = extractNum(variant.cost_tiers?.cost_10) ??
          extractNum(variant.cost_10) ??
          extractNum(variant.price_per_kit_10) ??
          extractNum(variant.supplierKitCostUSD) ??
          (perUnit ? perUnit * 10 * 0.85 : 0);
  }

  return { perUnit: Number(perUnit || 0), kit: Number(kit || 0) };
}

function sanitizeWinAnsi(str) {
  if (typeof str !== 'string') return String(str || '');
  return str.replace(/[\u0000-\u001F\u007F-\uFFFF]/g, char => {
    switch(char) {
      case 'β': return 'beta';
      case 'α': return 'alpha';
      case 'γ': return 'gamma';
      case 'μ': return 'mc';
      case '–': return '-'; 
      case '—': return '-'; 
      case '’': return "'";
      case '“': return '"';
      case '”': return '"';
      case '™': return 'TM';
      case '®': return '(R)';
      case '©': return '(C)';
      case '°': return ' deg';
      case 'é': return 'e';
      case 'è': return 'e';
      case 'í': return 'i';
      case 'ó': return 'o';
      case 'ú': return 'u';
      case 'á': return 'a';
      case 'ñ': return 'n';
      case 'Ñ': return 'N';
      default: return ''; 
    }
  });
}

async function saveToCloudStorage(pdfBytes, filename) {
  try {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET ||
      `${process.env.GCLOUD_PROJECT || 'med-peptides-app'}.firebasestorage.app`;
    const bucket = getStorage().bucket(bucketName);
    const file   = bucket.file(`pdfs/${filename}`);
    await file.save(Buffer.from(pdfBytes), { metadata: { contentType: 'application/pdf' } });
    // Make the file publicly readable so we get a stable URL without IAM signBlob
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucketName}/pdfs/${encodeURIComponent(filename)}`;
    return publicUrl;
  } catch (err) {
    console.warn('[pdfGenerator] Cloud Storage upload failed:', err.message);
    return null;
  }
}


async function progress(docRef, step, message, meta = {}) {
  await docRef.update({ progress: { step, message, meta, updatedAt: admin.firestore.FieldValue.serverTimestamp() } });
}

// ─── Main trigger ─────────────────────────────────────────────────────────────
exports.generateQuotationPdf = onDocumentCreated(
  { document: 'quotations/{refNumber}', timeoutSeconds: 300, memory: '512MiB' },
  async (event) => {
    const snap      = event.data;
    const docRef    = snap.ref;
    const data      = snap.data();
    const refNumber = event.params.refNumber;

    // Only process pending jobs
    if (data.status !== 'pending' || !data.configSnapshot) {
      return null;
    }

    const {
      productIds = [], variantIds = [], priceOverrides = {}, docType = 'pricelist',
      priceTier = 'wholeseller', currency = 'USD', groupBy = 'category',
      language = 'en', watermark, coverPage, validUntil,
      showSupplier = false, showDosage = true, showKitPrice = true,
      onlyInStock = false, recipientName, clientId,
    } = data.configSnapshot;

    const canonicalTier = TIER_MAPPING[priceTier] || 'wholesale';

    try {
      // Mark as processing
      await docRef.update({ status: 'processing' });

      // ── Step 1: FX rates ──────────────────────────────────────────────────
      await progress(docRef, 'fx_rates', 'Fetching exchange rates...');
      const fxData = await fetchFxRates();
      const fxRates = fxData.rates;
      await progress(docRef, 'fx_rates', 'Exchange rates ready', { isLive: fxData.isLive, rate: fxRates[currency], rateDate: fxData.date });

      // ── Step 2: Load products (parallel) ──────────────────────────────────
      await progress(docRef, 'products_loaded', 'Loading products...');
      const t0 = Date.now();
      let productDocs = [];
      const allSearchIds = Array.from(new Set([...productIds, ...variantIds]));
      if (allSearchIds.length > 0) {
        const chunks = [];
        for (let i = 0; i < allSearchIds.length; i += 30) chunks.push(allSearchIds.slice(i, i + 30));
        const snaps = await Promise.all(chunks.map(chunk => admin.firestore().collection('products').where(admin.firestore.FieldPath.documentId(), 'in', chunk).get()));
        productDocs = snaps.flatMap(s => s.docs);

        // Fallback: If productDocs is empty or fewer than requested, check if IDs are variant IDs or subcollections
        if (productDocs.length === 0) {
          const varSnaps = await Promise.all(chunks.map(chunk => admin.firestore().collectionGroup('variants').where(admin.firestore.FieldPath.documentId(), 'in', chunk).get()));
          const parentRefs = new Map();
          varSnaps.flatMap(s => s.docs).forEach(vd => {
            const parent = vd.ref.parent.parent;
            if (parent && !parentRefs.has(parent.id)) {
              parentRefs.set(parent.id, parent);
            }
          });
          if (parentRefs.size > 0) {
            const pSnaps = await Promise.all(Array.from(parentRefs.values()).map(ref => ref.get()));
            productDocs = pSnaps.filter(s => s.exists);
          }
        }
      } else {
        const snap = await admin.firestore().collection('products').where('status', '!=', 'archived').limit(300).get();
        productDocs = snap.docs;
      }
      await progress(docRef, 'products_loaded', `${productDocs.length} products loaded`, { count: productDocs.length, ms: Date.now() - t0 });

      // ── Step 3: Resolve variants + prices (parallel) ───────────────────────
      await progress(docRef, 'prices_resolved', 'Resolving prices...');
      const productsWithVariants = await Promise.all(productDocs.map(async docSnap => {
        if (!docSnap.exists) return null;
        const product  = { id: docSnap.id, ...docSnap.data() };
        const varSnap  = await docSnap.ref.collection('variants').get();
        const variants = varSnap.docs.map(vd => ({ id: vd.id, ...vd.data() }));
        return { product, variants };
      }));

      const selectedVariantSet = new Set(variantIds.length > 0 ? variantIds : []);
      const allItems = [];
      for (const pv of productsWithVariants) {
        if (!pv) continue;
        const { product, variants } = pv;
        let rows = variants.length > 0 ? variants : [product];
        if (selectedVariantSet.size > 0) {
          const filtered = rows.filter(v => selectedVariantSet.has(v.id) || selectedVariantSet.has(product.id));
          if (filtered.length > 0) rows = filtered;
        }
        rows.forEach(v => {
          if (onlyInStock) {
            const stock = parseInt(v.stock ?? product.stock ?? 0, 10);
            if (isNaN(stock) || stock <= 0) return;
          }
          const resolved = resolveVariantPrice(v, { tier: canonicalTier });
          const safeOverrides = priceOverrides || {};
          let basePriceUSD = resolved.perUnit;
          if (safeOverrides[v.id] != null)      basePriceUSD = Number(safeOverrides[v.id]);
          else if (safeOverrides[product.id] != null) basePriceUSD = Number(safeOverrides[product.id]);
          allItems.push({
            name: product.name || product.canonicalName || v.name || 'Unknown',
            category: product.category || v.category || 'Other',
            dosage: v.dosage || v.dose || product.dosage || '-',
            supplier: v.supplierName || v.supplier || product.supplier || 'Unassigned',
            priceUSD: basePriceUSD,
            price: convertPrice(basePriceUSD, currency, fxRates),
            kitPrice: showKitPrice ? convertPrice(resolved.kit, currency, fxRates) : null,
            currency,
          });
        });
      }
      await progress(docRef, 'prices_resolved', `${allItems.length} variants resolved`, { count: allItems.length });

      // ── Step 4: Build PDF ─────────────────────────────────────────────────
      await progress(docRef, 'building_pdf', 'Building PDF...');
      const grouped = {};
      allItems.forEach(item => {
        const key = groupBy === 'supplier' ? (item.supplier || 'Unassigned')
          : groupBy === 'alpha' ? (item.name[0] || '#').toUpperCase()
          : (item.category || 'Other');
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });

      const pdfDoc        = await PDFDocument.create();
      const helvetica     = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const W = 595.28, H = 841.89, MRG = 40, BTM = 60;
      const BRAND = rgb(0, 0.21, 0.4);
      const SYM   = CURRENCY_SYMBOLS[currency] || '$';
      let totalPages = 0;

      const addPage = () => {
        totalPages++;
        const p = pdfDoc.addPage([W, H]);
        // Header bar
        p.drawRectangle({ x: 0, y: H - 50, width: W, height: 50, color: BRAND });
        p.drawText('ATLAS SOLUTIONS', { x: MRG, y: H - 34, size: 14, font: helveticaBold, color: rgb(1,1,1) });
        // Footer
        p.drawLine({ start: { x: MRG, y: BTM }, end: { x: W - MRG, y: BTM }, thickness: 0.5, color: rgb(0.8,0.8,0.8) });
        p.drawText(`Page ${totalPages} · Generated ${new Date().toLocaleDateString()} · ${currency} prices${currency !== 'USD' ? ' are indicative; USD is the reference currency' : ''}`,
          { x: MRG, y: BTM - 14, size: 7, font: helvetica, color: rgb(0.5,0.5,0.5) });
        if (watermark) {
          p.drawText(sanitizeWinAnsi(watermark.toUpperCase()), { x: W/2 - 80, y: H/2, size: 48, font: helveticaBold, color: rgb(0.9,0.9,0.9), rotate: { type: 'degrees', angle: 45 } });
        }
        return p;
      };

      let page = addPage();
      let y    = H - 70;
      const rowH = 20, colW = [200, 80, 70, 70, 70];

      const drawTableHeader = (p, yPos) => {
        const headers = ['Product', 'Dosage', `Price (${SYM})`, showKitPrice ? `Kit (${SYM})` : null, showSupplier ? 'Supplier' : null].filter(Boolean);
        p.drawRectangle({ x: MRG, y: yPos - rowH, width: W - MRG * 2, height: rowH, color: rgb(0.95, 0.97, 0.99) });
        let cx = MRG + 4;
        headers.forEach((h, i) => {
          p.drawText(sanitizeWinAnsi(h), { x: cx, y: yPos - rowH + 6, size: 8, font: helveticaBold, color: BRAND });
          cx += colW[i] || 70;
        });
        return yPos - rowH;
      };

      y = drawTableHeader(page, y);

      let rowCount = 0;
      for (const [groupName, items] of Object.entries(grouped)) {
        if (y < BTM + rowH * 3) { page = addPage(); y = H - 70; y = drawTableHeader(page, y); }
        page.drawText(sanitizeWinAnsi(groupName.toUpperCase()), { x: MRG, y: y - rowH + 6, size: 8, font: helveticaBold, color: BRAND });
        y -= rowH;

        for (const item of items) {
          if (y < BTM + rowH + 5) { page = addPage(); y = H - 70; y = drawTableHeader(page, y); }
          if (rowCount % 2 === 0) page.drawRectangle({ x: MRG, y: y - rowH, width: W - MRG * 2, height: rowH, color: rgb(0.98,0.98,0.98) });
          let cx = MRG + 4;
          const cols = [
            (item.name || '').substring(0, 30),
            (item.dosage || '-').substring(0, 15),
            item.price ? `${SYM}${item.price.toFixed(2)}` : '-',
            showKitPrice && item.kitPrice ? `${SYM}${item.kitPrice.toFixed(2)}` : null,
            showSupplier ? (item.supplier || '').substring(0, 18) : null,
          ].filter(v => v !== null);
          cols.forEach((col, i) => {
            page.drawText(sanitizeWinAnsi(String(col)), { x: cx, y: y - rowH + 6, size: 8, font: helvetica, color: rgb(0.1,0.1,0.1) });
            cx += colW[i] || 70;
          });
          y -= rowH;
          rowCount++;
        }
      }

      // ── Step 5: Save to Cloud Storage ─────────────────────────────────────
      await progress(docRef, 'saving_pdf', 'Uploading to Cloud Storage...');
      const pdfBytes = await pdfDoc.save();
      const filename = `pricelist_${refNumber}_${Date.now()}.pdf`;
      const url      = await saveToCloudStorage(pdfBytes, filename);

      // ── Step 6: Update Firestore doc as done ──────────────────────────────
      await docRef.update({
        status: 'generated',
        filename,
        url: url || null,
        progress: { step: 'done', message: 'PDF ready', meta: { pages: totalPages, variants: allItems.length, url } },
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[pdfGenerator] ${refNumber} done: ${totalPages} pages, ${allItems.length} items.`);
      return null;

    } catch (err) {
      console.error(`[pdfGenerator] ${refNumber} failed:`, err);
      await docRef.update({ status: 'error', errorMessage: err.message });
      return null;
    }
  }
);
