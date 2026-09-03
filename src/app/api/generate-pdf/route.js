/**
 * @deprecated EMERGENCY FALLBACK ONLY
 *
 * The primary PDF generation path is now:
 *   Client → Firestore 'quotations/{id}' (status: 'pending')
 *           → Cloud Function `generateQuotationPdf` (functions/src/triggers/pdfGenerator.js)
 *           → Cloud Storage upload → Firestore update (status: 'generated', url: ...)
 *           → Client onSnapshot → UI updates
 *
 * This HTTP route is kept as a direct fallback for local development
 * (when Cloud Functions are not deployed) or emergencies.
 * DO NOT use it as the primary generation path.
 */
import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import QRCode from 'qrcode';
import { adminDb } from '../../../lib/firebaseAdmin';
import { getStorage } from 'firebase-admin/storage';
import { FieldPath } from 'firebase-admin/firestore';
import { resolveVariantPrice } from '@/utils/resolvePrice';
import { PRESENTATION_LABELS } from '@/constants/presentationTypes';
import { isVariantMatchingFilter, sanitizePdfText } from '@/utils/strictFilterEngine';
import { generateSignedQuoteToken } from '@/services/dynamicPricingEngine';
import { generatePdfSchema } from '@/schemas/apiSchemas';

const TIER_MAPPING = { cost: 'master', wholeseller: 'wholesale', clinic: 'clinic', retail: 'retail' };
const TIER_LABELS = { master: 'Supplier Cost (Master)', wholesale: 'Wholesaler Price', clinic: 'Clinic Price', retail: 'Retail Price (Web Public)' };
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', MXN: '$' };
const FALLBACK_FX = { USD: 1, EUR: 0.92, MXN: 17.5 };

// Fetch live FX rates; falls back to hardcoded rates on failure
async function fetchFxRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('FX API error');
    const data = await res.json();
    return { rates: data.rates || FALLBACK_FX, date: data.time_last_update_utc || new Date().toUTCString(), isLive: true };
  } catch {
    return { rates: FALLBACK_FX, date: 'indicative only', isLive: false };
  }
}

async function saveQuotationMetadata({ 
  refNumber, clientId, recipientName, tier, currency, docType, productCount, variantCount, 
  filename, url, configSnapshot, items = [], subtotal = 0, taxTotal = 0, grandTotal = 0, recipientType = 'clinic'
}) {
  try {
    await adminDb.collection('quotations').doc(refNumber).set({
      refNumber,
      quotationNumber: refNumber,
      clientId: clientId || null,
      clientName: recipientName || 'Direct Client',
      recipientName: recipientName || null,
      recipientType: recipientType || 'clinic',
      category: recipientType || 'clinic',
      tier,
      currency: currency || 'USD',
      docType,
      productCount,
      variantCount,
      filename,
      url: url || null,
      items: Array.isArray(items) ? items : [],
      subtotal: Number(subtotal || 0),
      taxTotal: Number(taxTotal || 0),
      grandTotal: Number(grandTotal || 0),
      marginPercent: 48.5,
      requiresColdChain: true,
      configSnapshot: configSnapshot || null,
      generatedAt: new Date().toISOString(),
      createdAt: new Date(),
      status: 'pending',
    });
  } catch (err) {
    console.warn('[generate-pdf] Failed to save quotation record:', err.message);
    // Non-fatal — PDF still generates
  }
}

async function saveToCloudStorage(pdfBytes, filename) {
  try {
    // Attempt to upload to default bucket
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'regenpept-app';
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;
    const bucket = getStorage().bucket(bucketName);
    
    const file = bucket.file(`pdfs/${filename}`);
    await file.save(pdfBytes, {
      metadata: { contentType: 'application/pdf' },
    });
    
    // Get a signed URL valid for 30 days
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    });
    
    return url;
  } catch (err) {
    console.warn('[generate-pdf] Failed to upload to Cloud Storage:', err.message);
    return null;
  }
}


const LABELS = {
  en: { product: 'Product', dosage: 'Dosage / Spec', supplier: 'Supplier', price: 'Unit Price', kitPrice: 'Kit (×10)', protocols: '# Protocols', page: 'Page', of: 'of', preparedFor: 'Prepared for', validUntil: 'Prices valid until', confidential: 'Confidential — For Internal Use Only', date: 'Date', quotation: 'QUOTATION', priceList: 'PRICE LIST', catalog: 'PRODUCT CATALOG', ref: 'Ref' },
  es: { product: 'Producto', dosage: 'Dosis / Especificación', supplier: 'Proveedor', price: 'Precio Unitario', kitPrice: 'Kit (×10)', protocols: '# Protocolos', page: 'Página', of: 'de', preparedFor: 'Preparado para', validUntil: 'Precios válidos hasta', confidential: 'Confidencial — Solo Uso Interno', date: 'Fecha', quotation: 'COTIZACIÓN', priceList: 'LISTA DE PRECIOS', catalog: 'CATÁLOGO DE PRODUCTOS', ref: 'Ref' }
};

const WATERMARK_TEXTS = { confidential: 'CONFIDENTIAL', draft: 'DRAFT', sample: 'SAMPLE', internal: 'INTERNAL USE ONLY' };

function generateRefNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `RFQ-${y}${m}${d}-${Math.floor(Math.random() * 9000) + 1000}`;
}

const SUPPLIER_WAREHOUSES = {
  'lotusland': 'Asia / HK Hub (Hong Kong)',
  'np labs': 'EU Hub (Athens, Greece)',
  'nplabs': 'EU Hub (Athens, Greece)',
  'pod poland': 'EU Central (Warsaw, Poland)',
  'europeptides': 'EU Hub (Sofia, Bulgaria)',
  '24genetics': 'EU South (Madrid, Spain)',
  'fagron': 'EU South (Madrid, Spain)',
  'eterna': 'EU South (Madrid, Spain)',
  'bioniq': 'UK Hub (London)',
  'vallida': 'UK Hub (London)',
  'bloodo': 'EU North (Vilnius, Lithuania)',
};

function getSupplierWarehouse(supplierName, country, catalogBrand) {
  const normCat = (catalogBrand || '').toLowerCase().trim();
  if (normCat.includes('regenpept')) return 'Poland, USA, and UK';

  const norm = (supplierName || '').toLowerCase().trim();
  for (const [k, v] of Object.entries(SUPPLIER_WAREHOUSES)) {
    if (norm.includes(k)) return v;
  }
  if (country) return `Regional Warehouse (${country})`;
  return 'EU Verified Logistics Hub';
}

function getProductRefCode(name, id, sku) {
  if (sku) return String(sku).toUpperCase();
  const clean = (name || id || 'PEP').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const prefix = clean.length >= 3 ? clean.substring(0, 3) : 'PEP';
  const idHash = (id || '').slice(-3).toUpperCase() || '01';
  return `PEP-${prefix}-${idHash}`;
}

function trunc(text, maxLen) {
  if (!text) return '';
  const s = String(text);
  return s.length > maxLen ? s.substring(0, maxLen - 3) + '...' : s;
}

/**
 * Normalizes dosage string for PDF output:
 * - Converts per-ml concentrations (e.g., 7500 mcg/ml in 15 ml -> 112.5 mg)
 * - Converts raw mcg to mg when >= 1000
 * - Handles combinations cleanly ("15 mg + 15 mg")
 */
/**
 * Normalizes dosage string and numeric total mg for PDF output:
 * - Converts per-ml concentrations (e.g., 7500 mcg/ml in 15 ml -> 112.5 mg)
 * - Converts raw mcg to mg when >= 1000
 * - Handles combinations cleanly ("15 mg + 15 mg")
 * - Returns { display: string, numMg: number }
 */
function normalizePdfDosage(rawDose, variant = null) {
  if (!rawDose) return { display: '-', numMg: 0 };
  const str = String(rawDose).trim();

  // If already custom/magistral or kit
  if (/^custom(\s*\/\s*magistral)?$/i.test(str) || /^magistral$/i.test(str) || /^api\s+bulk$/i.test(str)) {
    return { display: 'Custom / Magistral', numMg: 0 };
  }
  if (/^(\d+\s+)?test(\s+kit)?$/i.test(str) || /^kit$/i.test(str)) {
    return { display: '1 Test Kit', numMg: 0 };
  }
  if (/^standard(\s+clinical(\s+strength)?)?$/i.test(str)) {
    return { display: 'Clinical Std', numMg: 0 };
  }

  const parts = str.split(/\s*\+\s*/);
  let totalCalculatedMg = 0;

  const normalizedParts = parts.map(part => {
    const match = part.trim().match(/^([\d.,]+)\s*([a-zA-Zµ/%]+(?:\/[a-zA-Zµ]+)?)/);
    if (!match || !match[2]) return part.trim();

    let numVal = parseFloat(match[1].replace(',', '.'));
    let unit = match[2].toLowerCase();

    // Check if unit is per-ml (mcg/ml, mg/ml)
    if (unit === 'mcg/ml' || unit === 'µg/ml' || unit === 'mg/ml') {
      const mgPerMl = (unit === 'mcg/ml' || unit === 'µg/ml') ? (numVal / 1000) : numVal;
      let volumeMl = null;
      if (variant) {
        const searchStr = `${variant.volume || ''} ${variant.size || ''} ${variant.quantity || ''} ${variant.name || ''} ${variant.title || ''} ${variant.presentation || ''} ${variant.format || ''}`;
        const volMatch = searchStr.match(/(\d+(?:\.\d+)?)\s*(?:ml|cc)\b/i);
        if (volMatch) {
          volumeMl = parseFloat(volMatch[1]);
        } else if (variant.format === 'nasal_spray' || variant.presentation === 'nasal_spray' || (variant.presentationName || '').toLowerCase().includes('nasal')) {
          volumeMl = 15;
        } else if (variant.format === 'sublingual_drops' || variant.presentation === 'sublingual_drops' || (variant.presentationName || '').toLowerCase().includes('sublingual')) {
          volumeMl = 30;
        }
      }
      if (!volumeMl && numVal === 7500) {
        // Known NP Labs formulation volume
        volumeMl = (variant?.presentationName || '').toLowerCase().includes('sublingual') ? 30 : 15;
      }

      if (volumeMl && volumeMl > 0) {
        const totalMg = parseFloat((mgPerMl * volumeMl).toFixed(2));
        totalCalculatedMg += totalMg;
        return `${totalMg} mg`;
      }
      totalCalculatedMg += mgPerMl;
      return `${mgPerMl} mg/ml`;
    }

    // Convert raw mcg to mg
    if ((unit === 'mcg' || unit === 'µg')) {
      const mgVal = numVal / 1000;
      totalCalculatedMg += mgVal;
      return numVal >= 1000 ? `${parseFloat(mgVal.toFixed(2))} mg` : `${numVal} mcg`;
    }

    if (unit === 'g') {
      totalCalculatedMg += numVal * 1000;
      return `${numVal} g`;
    }

    if (unit === 'mg') {
      totalCalculatedMg += numVal;
      return `${numVal} mg`;
    }

    return `${numVal} ${unit}`;
  });

  return {
    display: normalizedParts.join(' + '),
    numMg: totalCalculatedMg
  };
}

function convertPrice(usdPrice, currency, rates) {
  if (usdPrice == null || isNaN(usdPrice)) return null;
  const rate = (rates && rates[currency]) || FALLBACK_FX[currency] || 1;
  return usdPrice * rate;
}

function fmtPrice(price, currency) {
  if (price == null || isNaN(price)) return '-';
  return `${CURRENCY_SYMBOLS[currency] || '$'}${Number(price).toFixed(2)}`;
}


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    if (!type || !id) return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    if (!adminDb) return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    let collectionName = type === 'prescription' ? 'prescriptions' : type === 'protocol' ? 'protocols' : null;
    if (!collectionName) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    const docSnap = await adminDb.collection(collectionName).doc(id).get();
    if (!docSnap.exists) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    const data = docSnap.data();
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([595, 841]);
    const { width, height } = page.getSize();
    page.drawText(type.toUpperCase() + ' DOCUMENT', { x: 40, y: height - 60, size: 18, font: fontBold, color: rgb(0, 0.21, 0.4) });
    page.drawText(`ID: ${id}`, { x: 40, y: height - 85, size: 10, font });
    let y = height - 130;
    Object.entries(data).slice(0, 30).forEach(([k, v]) => {
      if (y < 60) return;
      const val = typeof v === 'object' ? JSON.stringify(v).substring(0, 80) : String(v).substring(0, 80);
      page.drawText(`${k}: ${val}`, { x: 40, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
      y -= 15;
    });
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${type}_${id}.pdf"` } });
  } catch (err) {
    console.error('[/api/generate-pdf] GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  const parseResult = generatePdfSchema.safeParse(body);
  if (!parseResult.success) {
    console.warn('[generate-pdf] Schema validation warnings:', parseResult.error.issues);
  }
  const {
    productIds = [], variantIds = [], priceTier = 'retail', docType = 'pricelist',
    isExWorks = false, incoterm = 'EXW', bestSourcingOnly = false,
    includePrices = true, currency = 'USD', groupBy = 'category', sortBy = 'name',
    showSupplier = true, showDosage = true, showPresentation = true,
    showPurity = false, showReconstitution = false, showGauge = true,
    showPackSize = true, showSampleType = true, showBiomarkers = false,
    showDescription = false, showKitPrice = false, kitSize = 10,
    showProtocols = false, onlyInStock = false, includeBibliography = false,
    supplierMasking = 'real', showPricePerMg = true, showWarehouse = true,
    watermark = 'none', language = 'en', pdfLanguage = 'en',
    coverPage = false, recipientName = '', validUntil = '',
    clientId = null, priceOverrides = null, commercialNotes = '',
    recipientType = 'custom', recipientId = null, recipientEmail = '',
    accountManagerId = null, accountManagerName = '', accountManagerEmail = '', accountManagerPhone = '',
    followUpNotes = '',
    // ── NEW PARAMS (v2) ───────────────────────────────────────────────────────
    // supplierFilter: restrict catalog to products from a specific supplier.
    //   - Supply the supplier name fragment, e.g. 'lotusland'. Case-insensitive substring match
    //     against variant.supplierName || product.supplierName || product.supplier.
    //   - null / '' = no filtering (all suppliers).
    supplierFilter = null,
    // priceMarkupPercent: apply a global markup % over the resolved base price.
    //   - Applied AFTER priceTier resolution and BEFORE currency conversion.
    //   - 20 = +20% over cost. 0 = no markup (default).
    //   - Commonly used with priceTier='cost' to generate client-facing prices from supplier costs.
    priceMarkupPercent = 0,
    // shippingNote: prominent shipping disclaimer rendered in the footer of every page
    //   and in the cover page "Commercial Terms" block.
    //   - Example: "+ €60 flat-rate shipping on packages up to 2 kg — Ex-Works Europe"
    //   - Empty string = no shipping note displayed.
    shippingNote = '',
    // productTypeFilter: scope document to a specific presentation type for hybrid products.
    //   Values: 'all' | 'finished_product' | 'raw_material' | 'diagnostic' | 'service'
    productTypeFilter = 'all',
    // catalogueFilter: scope document to a specific source catalogue / brand (e.g. 'RegenPept')
    catalogueFilter = null,
  } = body;

  const anonymousSupplierMap = new Map();
  let anonymousCounter = 1;
  const getSupplierDisplayName = (rawSupplier) => {
    if (!rawSupplier || rawSupplier === 'Unassigned') return 'Unassigned Supplier';
    if (supplierMasking !== 'anonymous') return rawSupplier;
    if (!anonymousSupplierMap.has(rawSupplier)) {
      anonymousSupplierMap.set(rawSupplier, `Supplier ${anonymousCounter++}`);
    }
    return anonymousSupplierMap.get(rawSupplier);
  };

  const effectiveIncoterm = (incoterm && incoterm !== 'NONE') ? incoterm : (isExWorks ? 'EXW' : null);

  const allSearchIds = Array.from(new Set([...(productIds || []), ...(variantIds || [])]));
  // When supplierFilter or catalogueFilter is provided, we can fetch all products server-side and filter.
  // Skip the productIds guard in that case.
  const hasSupplierFilter = (supplierFilter && supplierFilter.trim()) || (catalogueFilter && catalogueFilter.trim());
  if (allSearchIds.length === 0 && !hasSupplierFilter)
    return NextResponse.json({ error: 'Missing or invalid productIds' }, { status: 400 });
  if (!adminDb)
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });

  // All headers and document labels strictly in English
  const L = LABELS.en;
  const canonicalTier = TIER_MAPPING[priceTier] || priceTier;
  const tierLabel = TIER_LABELS[canonicalTier] || canonicalTier;
  const tierHeaderBadge = `${tierLabel}${effectiveIncoterm ? ` • ${effectiveIncoterm}` : ''}`;
  const refNumber = generateRefNumber();
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const TIER_SHORT_LABELS = {
    cost: 'Master Cost',
    master: 'Master Cost',
    wholeseller: 'Wholesale',
    wholesale: 'Wholesale',
    clinic: 'Clinic Price',
    retail: 'Retail Price',
  };
  const priceColShort = `${TIER_SHORT_LABELS[canonicalTier] || 'Price'}${effectiveIncoterm ? ` ${effectiveIncoterm}` : ''}`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));

      try {
        // Step 1 — Validate
        emit({ type: 'progress', step: 'validating', message: `Validating ${allSearchIds.length} product IDs`, meta: { count: allSearchIds.length } });

        // Step 2 — Live FX rates
        const { rates: fxRates, date: fxDate, isLive: fxIsLive } = await fetchFxRates();
        const appliedRate = currency === 'USD' ? 1 : (fxRates[currency] || FALLBACK_FX[currency] || 1);
        emit({
          type: 'progress', step: 'fx_rates',
          message: fxIsLive ? `Live rate: 1 USD = ${appliedRate.toFixed(4)} ${currency}` : `Fallback rate: 1 USD = ${appliedRate.toFixed(4)} ${currency}`,
          meta: { rate: appliedRate, rateDate: fxDate, isLive: fxIsLive, currency },
        });

        // Step 3 — Fetch products
        const t0 = Date.now();
        const CHUNK = 30;
        let productDocs = [];
        if (allSearchIds.length > 0) {
          for (let i = 0; i < allSearchIds.length; i += CHUNK) {
            const chunk = allSearchIds.slice(i, i + CHUNK);
            const snap = await adminDb.collection('products').where(FieldPath.documentId(), 'in', chunk).get();
            snap.docs.forEach(d => productDocs.push(d));
          }

          // Fallback for variant IDs
          if (productDocs.length === 0) {
            for (let i = 0; i < allSearchIds.length; i += CHUNK) {
              const chunk = allSearchIds.slice(i, i + CHUNK);
              const varSnap = await adminDb.collectionGroup('variants').where(FieldPath.documentId(), 'in', chunk).get();
              const parentRefs = new Map();
              varSnap.docs.forEach(vd => {
                const parent = vd.ref.parent.parent;
                if (parent && !parentRefs.has(parent.id)) parentRefs.set(parent.id, parent);
              });
              if (parentRefs.size > 0) {
                const pSnaps = await Promise.all(Array.from(parentRefs.values()).map(ref => ref.get()));
                productDocs = pSnaps.filter(s => s.exists);
              }
            }
          }
        } else if (hasSupplierFilter) {
          const allSnap = await adminDb.collection('products').get();
          productDocs = allSnap.docs;
        }
        emit({ type: 'progress', step: 'products_loaded', message: `${productDocs.length} records loaded`, meta: { count: productDocs.length, ms: Date.now() - t0 } });

        // Step 4 — Resolve prices
        const allItems = [];
        
        // Fetch variants in parallel to avoid N+1 queries
        const variantsPromises = productDocs.map(async (docSnap) => {
          if (!docSnap.exists) return null;
          const product = { id: docSnap.id, ...docSnap.data() };
          const variantsSnap = await docSnap.ref.collection('variants').get();
          const variants = variantsSnap.docs.map(vd => ({ id: vd.id, ...vd.data() }));
          return { product, variants };
        });
        
        const productsWithVariants = await Promise.all(variantsPromises);
        const selectedVariantSet = new Set(variantIds && variantIds.length > 0 ? variantIds : []);
        
        for (const itemData of productsWithVariants) {
          if (!itemData) continue;
          const { product, variants } = itemData;
          let rows = variants.length > 0 ? variants : [product];
          if (selectedVariantSet.size > 0) {
            const filtered = rows.filter(v => selectedVariantSet.has(v.id) || selectedVariantSet.has(product.id));
            if (filtered.length > 0) rows = filtered;
          }
          rows.forEach(v => {
            if (!isVariantMatchingFilter(v, product, { supplierFilter, productTypeFilter, onlyInStock, catalogueFilter })) {
              return;
            }
            const resolved = resolveVariantPrice(v, { tier: canonicalTier });

            // Apply ephemeral price overrides (never saved to Firestore)
            let basePriceUSD = resolved.perUnit;
            if (priceOverrides && priceOverrides[v.id] != null) {
              basePriceUSD = Number(priceOverrides[v.id]);
            } else if (priceOverrides && priceOverrides[product.id] != null) {
              basePriceUSD = Number(priceOverrides[product.id]);
            }

            // ── Global price markup (e.g. +20% over supplier cost) ───────────
            if (priceMarkupPercent && priceMarkupPercent !== 0 && basePriceUSD != null) {
              basePriceUSD = basePriceUSD * (1 + Number(priceMarkupPercent) / 100);
            }
            
            const catStr = (product.category || v.category || '').toLowerCase();
            let techSpecs = [];

            if (catStr.includes('suppl') || catStr.includes('device') || catStr.includes('insumo')) {
              if (showGauge && (v.gauge || v.size)) techSpecs.push(v.gauge || v.size);
              if (showPackSize && (v.packSize || v.boxQuantity)) techSpecs.push(v.packSize || v.boxQuantity);
            } else if (catStr.includes('test') || catStr.includes('diag') || catStr.includes('lab')) {
              if (showSampleType && v.sampleType) techSpecs.push(v.sampleType);
              if (showBiomarkers && v.biomarkers) techSpecs.push(v.biomarkers);
            } else {
              // Default to Peptide/API specs — clean deduplication
              const rawDose = (v.dosage || v.dose || product.dosage || '').trim();
              const rawPres = PRESENTATION_LABELS[v.presentation] || v.presentationName || v.presentation || '';
              
              if (showDosage && rawDose) techSpecs.push(rawDose);
              if (showPresentation && rawPres && !rawDose.toLowerCase().includes(rawPres.toLowerCase())) {
                techSpecs.push(rawPres);
              }
              if (showPurity && (v.purity || product.purity)) techSpecs.push(`Purity: ${v.purity || product.purity}%`);
              if (showReconstitution && (v.reconstitutionGuide || product.reconstitutionGuide)) techSpecs.push(v.reconstitutionGuide || product.reconstitutionGuide);
            }

            // ── Preserve explicit kit price from source catalogue ─────────────
            let effectiveKitPriceUSD = resolved.kit;
            if (effectiveKitPriceUSD == null && basePriceUSD != null) {
              effectiveKitPriceUSD = basePriceUSD * (kitSize || 10);
            } else if (priceMarkupPercent && priceMarkupPercent !== 0 && effectiveKitPriceUSD != null) {
              effectiveKitPriceUSD = effectiveKitPriceUSD * (1 + Number(priceMarkupPercent) / 100);
            }

            // Separate dosage and presentation format cleanly without repetition
            let rawDoseInput = (v.dosage || v.dose || product.dosage || '').trim();
            rawDoseInput = rawDoseInput.replace(/[/·-]\s*(?:vial|pen|bottle|ampoule|cap|tab|powder|spray|cartridge|syringe).*$/i, '').trim();

            const normalizedDoseObj = normalizePdfDosage(rawDoseInput, v);
            const pureDose = normalizedDoseObj.display;
            const numDose = normalizedDoseObj.numMg > 0 ? normalizedDoseObj.numMg : 0;

            // Use canonical PRESENTATION_LABELS dictionary — no ad-hoc string mapping
            const cleanFormat = PRESENTATION_LABELS[v.presentation] || v.presentationName || (v.presentation === 'bottle' ? 'Bottle' : v.presentation === 'box' ? 'Box' : v.presentation === 'kit' ? 'Kit' : 'Vial');

            // Humanize goal strings
            let productGoal = product.primary_goal || (Array.isArray(product.goals) ? product.goals.join(', ') : product.goal) || '';
            if (productGoal) {
              productGoal = productGoal
                .replace(/fat_loss/gi, 'Fat Loss & Metabolic Health')
                .replace(/tissue_repair/gi, 'Tissue Repair & Recovery')
                .replace(/muscle_growth/gi, 'Muscle & Body Composition')
                .replace(/anti_aging/gi, 'Longevity & Cellular Repair')
                .replace(/cognitive/gi, 'Cognitive & Neuro-Protection')
                .replace(/immune/gi, 'Immune Modulation')
                .replace(/_/g, ' ');
              productGoal = productGoal.replace(/\b\w/g, l => l.toUpperCase());
            }

            let productCas = product.casNumber || product.cas || v.cas || '';
            if (productCas && (productCas.toLowerCase().includes('request') || productCas.toLowerCase().includes('n/a') || productCas.toLowerCase().includes('available'))) {
              productCas = '';
            }

            const productCategory = product.category || product.therapeutic_category || v.category || 'Peptides';
            const productTarget = product.target || product.mechanism || '';
            const productDesc = product.description || product.short_description || v.description || '';
            const productRefCode = product.sku || product.refCode || getProductRefCode(product.name, product.id, null);
            const productSlug = product.slug || (product.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || product.id;

            const sRawName = v.supplierName || v.supplier || product.supplier || 'Unassigned';

            // Unit-aware Rate Calculation (supporting mg, ml, etc.):
            // Do not compute rate for non-measurable presentations (IU, Box of syringes, Bottle without dose, Bundles)
            const doseLower = String(rawDoseInput || '').toLowerCase();
            const presLower = String(v.presentation || cleanFormat || '').toLowerCase();
            const isMl = doseLower.includes('ml') || String(v.fill_volume || '').includes('ml') || v.unitOfMeasurement === 'ml';
            const isNonMeasurable = doseLower.includes('iu') || 
                            presLower.includes('box') || 
                            presLower.includes('bundle') || 
                            doseLower.includes('starter') || 
                            doseLower.includes('syringe') || 
                            doseLower.includes('count') ||
                            (presLower.includes('bottle') && !doseLower.includes('mg') && !doseLower.includes('mcg') && !doseLower.includes('ml'));

            let rateUnitLabel = '/mg';
            let numUnit = numDose;
            if (isMl) {
              rateUnitLabel = '/ml';
              const mlMatch = doseLower.match(/([\d.]+)\s*ml/i) || String(v.fill_volume || '').match(/([\d.]+)\s*ml/i);
              numUnit = mlMatch ? parseFloat(mlMatch[1]) : numDose;
            }

            const pricePerUnitUSD = (!isNonMeasurable && numUnit > 0 && basePriceUSD != null) ? basePriceUSD / numUnit : null;
            const effectivePricePerUnit = pricePerUnitUSD != null ? convertPrice(pricePerUnitUSD, currency, fxRates) : null;
            const catBrand = v.catalogBrand || v.sourceCatalogue || product.catalogBrand || product.sourceCatalogue || catalogueFilter;
            const sWarehouse = v.warehouse || product.warehouse || getSupplierWarehouse(sRawName, v.country || product.country, catBrand);

            allItems.push({
              productId: product.id,
              name: product.name || v.name || 'Unknown Product',
              refCode: productRefCode,
              slug: productSlug,
              variantName: v.name || v.presentation || v.dosage || 'Standard Variant',
              category: productCategory,
              goal: productGoal,
              casNumber: productCas,
              target: productTarget,
              description: productDesc,
              doseOnly: pureDose || '-',
              presentationOnly: cleanFormat,
              dosage: techSpecs.filter(Boolean).join(' · ') || '-',
              numDose,
              supplier: sRawName,
              warehouse: sWarehouse,
              price: includePrices ? convertPrice(basePriceUSD, currency, fxRates) : null,
              priceUSD: basePriceUSD,
              pricePerMg: effectivePricePerUnit,
              rateUnitLabel: pricePerUnitUSD != null ? rateUnitLabel : '',
              kitPrice: (includePrices && showKitPrice) ? convertPrice(effectiveKitPriceUSD, currency, fxRates) : null,
              currency,
              protocolCount: product.protocolCount || 0,
            });
          });
        }

        // Best Sourcing Option: Retain only the lowest cost variant per product dosage
        let finalItems = allItems;
        if (bestSourcingOnly) {
          const bestMap = new Map();
          allItems.forEach(item => {
            const key = `${item.productId || item.name}::${item.dosage || item.variantName}`;
            const existing = bestMap.get(key);
            if (!existing || (item.priceUSD != null && (existing.priceUSD == null || item.priceUSD < existing.priceUSD))) {
              bestMap.set(key, item);
            }
          });
          finalItems = Array.from(bestMap.values());
        }

        // Sorting
        finalItems.sort((a, b) => {
          if (sortBy === 'dosage') return (a.numDose || 0) - (b.numDose || 0);
          if (sortBy === 'price_asc') return (a.priceUSD || 0) - (b.priceUSD || 0);
          if (sortBy === 'price_desc') return (b.priceUSD || 0) - (a.priceUSD || 0);
          if (sortBy === 'supplier') return (a.supplier || '').localeCompare(b.supplier || '');
          return (a.name || '').localeCompare(b.name || '');
        });

        emit({ type: 'progress', step: 'prices_resolved', message: `${finalItems.length} variants processed`, meta: { count: finalItems.length, tier: tierLabel } });

        // Step 3.5 — Optional PubMed Literature & Scientific Evidence
        const pubmedArticlesMap = new Map();
        if (includeBibliography) {
          emit({ type: 'progress', step: 'fetching_bibliography', message: 'Fetching PubMed peer-reviewed clinical studies...', meta: {} });
          const lookupKeys = Array.from(new Set(allItems.flatMap(i => [i.slug, i.productId, (i.name || '').toLowerCase().replace(/\s+/g, '-')]).filter(Boolean)));
          
          const cachePromises = lookupKeys.map(async (key) => {
            try {
              const snap = await adminDb.collection('pubmed_cache').doc(key).get();
              if (snap.exists) {
                const data = snap.data();
                if (data.articles && data.articles.length > 0) {
                  return { key, articles: data.articles };
                }
              }
            } catch {
              // Ignore cache lookup errors
            }
            return null;
          });

          const cacheResults = await Promise.all(cachePromises);
          cacheResults.filter(Boolean).forEach(res => {
            pubmedArticlesMap.set(res.key, res.articles);
          });
        }

        // Batch fetch clinical protocols from Firestore for interactive linking
        const productProtocolsMap = new Map();
        try {
          const protocolsSnap = await adminDb.collection('protocols').where('status', '==', 'active').get();
          protocolsSnap.forEach(d => {
            const pData = d.data();
            const protId = d.id;
            const protName = pData.name || pData.title || protId;
            const protSlug = pData.slug || protId;
            const boms = pData.bom || [];
            boms.forEach(b => {
              const pKey = (b.productId || b.product_name || '').toLowerCase().trim();
              if (pKey) {
                if (!productProtocolsMap.has(pKey)) productProtocolsMap.set(pKey, []);
                productProtocolsMap.get(pKey).push({ id: protId, name: protName, slug: protSlug });
              }
            });
          });
        } catch {
          // Fallback if protocols query fails
        }

        // Step 4 — Build PDF
        emit({ type: 'progress', step: 'building_pdf', message: 'Building PDF layout...', meta: {} });

        // Group by high level (category/supplier/none)
        const grouped = {};
        finalItems.forEach(item => {
          const key = groupBy === 'supplier' ? (item.supplier || 'Unassigned')
            : groupBy === 'product' ? (item.name || 'Unassigned')
            : groupBy === 'none' ? 'All Products'
            : (item.category || 'Other');
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        });

        // Compute Best Value per category based on lowest price per mg (strictly 1 per category)
        const categoryMinPricePerMg = new Map();
        finalItems.forEach(item => {
          const catKey = (item.category || 'Other').toLowerCase().trim();
          const pPerMg = (item.numDose > 0 && item.priceUSD != null) ? (item.priceUSD / item.numDose) : null;
          if (pPerMg != null && pPerMg > 0) {
            const currentMin = categoryMinPricePerMg.get(catKey);
            if (!currentMin || pPerMg < currentMin.minRate) {
              categoryMinPricePerMg.set(catKey, {
                minRate: pPerMg,
                variantId: item.id || `${item.productId}_${item.supplier}_${item.numDose}_${item.presentationOnly}`,
                itemKey: `${item.productId}::${item.supplier}::${item.numDose}::${item.presentationOnly}`,
              });
            }
          }
        });

        // PDF constants
        const pdfDoc = await PDFDocument.create();
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Universal WinAnsi font and page text sanitization wrapper
        const sanitizeText = (t) => sanitizePdfText(String(t ?? ''));
        const origWidthOfTextAtSize = helvetica.widthOfTextAtSize.bind(helvetica);
        helvetica.widthOfTextAtSize = (t, s) => origWidthOfTextAtSize(sanitizeText(t), s);

        const origBoldWidthOfTextAtSize = helveticaBold.widthOfTextAtSize.bind(helveticaBold);
        helveticaBold.widthOfTextAtSize = (t, s) => origBoldWidthOfTextAtSize(sanitizeText(t), s);

        const origAddPage = pdfDoc.addPage.bind(pdfDoc);
        pdfDoc.addPage = (dims) => {
          const pg = origAddPage(dims);
          const origDrawText = pg.drawText.bind(pg);
          pg.drawText = (text, options) => origDrawText(sanitizeText(text), options);
          return pg;
        };

        const W = 595.28, H = 841.89, MRG = 40, BTM = 60;
        const BRAND = rgb(0, 0.21, 0.4);
        const ACCENT = rgb(0.08, 0.58, 0.52);
        const MUTED = rgb(0.45, 0.45, 0.45);
        const RIGHT_LIMIT = W - MRG; // 555.28
        const RIGHT_PAD = 10;
        const RIGHT_X = RIGHT_LIMIT - RIGHT_PAD; // 545.28

        const BRAND_NAME = 'ATLAS SOLUTIONS';
        const BRAND_SUBTITLE = 'Peptide API & Specialty Life Sciences Portfolio';
        const wmText = WATERMARK_TEXTS[watermark];

        const applyWatermark = (p) => {
          if (!wmText) return;
          p.drawText(wmText, { x: 120, y: H / 2 - 30, size: 62, font: helveticaBold, color: rgb(0.88, 0.88, 0.88), rotate: degrees(45), opacity: 0.18 });
        };

        const cols = [
          { key: 'dosage', label: 'Dosage', x: MRG + 10, align: 'left', maxLen: 16 },
          { key: 'presentation', label: 'Presentation / Format', x: MRG + 95, align: 'left', maxLen: 22 },
        ];
        if (showPricePerMg) {
          cols.push({
            key: 'pricePerMg',
            label: `Rate (${CURRENCY_SYMBOLS[currency] || currency})`,
            rightX: RIGHT_X - (includePrices ? (showKitPrice ? 190 : 95) : 0),
            align: 'right',
            maxLen: 15,
          });
        }
        if (includePrices && showKitPrice) {
          cols.push({
            key: 'kitPrice',
            label: `Kit (x${kitSize})${effectiveIncoterm ? ` ${effectiveIncoterm}` : ''}`,
            rightX: RIGHT_X - 95,
            align: 'right',
            maxLen: 16,
          });
        }
        if (includePrices) {
          cols.push({
            key: 'price',
            label: `${priceColShort} (${CURRENCY_SYMBOLS[currency] || currency})`,
            rightX: RIGHT_X,
            align: 'right',
            maxLen: 20,
          });
        }

        // Generate interactive QR Code pointing to shared web catalog
        let qrImage = null;
        try {
          const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const catalogPayload = {
            catalogId: refNumber || `CAT-${Date.now().toString(36).toUpperCase()}`,
            supplierId: null,
            productIds: productIds || [],
            variantIds: variantIds || [],
            category: 'all',
            priceSource: priceTier || 'clinic',
            priceMarkupPercent: 0,
            currency: currency || 'USD',
            recipientName: recipientName || 'Valued Partner',
            recipientType: recipientType || 'clinic',
            accountManagerName: accountManagerName || 'Atlas Commercial Desk',
            accountManagerEmail: accountManagerEmail || 'orders@atlas-solutions.com',
            validityDays: 30,
            notes: shippingNote || '',
            issuedAt: new Date().toISOString()
          };
          const shareToken = generateSignedQuoteToken(catalogPayload, 30 * 24);
          const interactiveWebUrl = `${origin}/shared/catalog/${shareToken}`;
          const qrDataUrl = await QRCode.toDataURL(interactiveWebUrl, { margin: 1, width: 260 });
          const qrBase64 = qrDataUrl.split(',')[1];
          qrImage = await pdfDoc.embedPng(Buffer.from(qrBase64, 'base64'));
        } catch (qrErr) {
          console.warn('[generate-pdf] QR generation error:', qrErr.message);
        }

        const drawHeader = (p) => {
          p.drawRectangle({ x: 0, y: H - 14, width: W, height: 14, color: BRAND });
          const docLabel = docType === 'quotation' ? L.quotation : docType === 'catalog' ? L.catalog : L.priceList;
          p.drawText(BRAND_NAME, { x: MRG, y: H - 38, size: 13, font: helveticaBold, color: BRAND });
          const brandW = helveticaBold.widthOfTextAtSize(BRAND_NAME, 13);
          p.drawText(docLabel, { x: MRG + brandW + 12, y: H - 38, size: 10.5, font: helvetica, color: ACCENT });
          
          const badgeText = tierHeaderBadge;
          const badgeW = Math.max(160, helveticaBold.widthOfTextAtSize(badgeText, 7.5) + 14);
          p.drawRectangle({ x: MRG, y: H - 56, width: badgeW, height: 13, color: isExWorks ? rgb(0.92, 0.96, 1) : rgb(0.94, 0.97, 1) });
          p.drawText(badgeText, { x: MRG + 5, y: H - 53, size: 7.5, font: helveticaBold, color: BRAND });
          
          p.drawText(`${L.date}: ${dateStr}`, { x: W - MRG - 140, y: H - 38, size: 8, font: helvetica, color: MUTED });
          if (docType === 'quotation') p.drawText(`${L.ref}: ${refNumber}`, { x: W - MRG - 140, y: H - 48, size: 8, font: helveticaBold, color: BRAND });
          if (recipientName) p.drawText(`${L.preparedFor}: ${trunc(recipientName, 35)}`, { x: W - MRG - 180, y: H - 58, size: 8, font: helvetica, color: MUTED });
          p.drawLine({ start: { x: MRG, y: H - 64 }, end: { x: W - MRG, y: H - 64 }, thickness: 0.8, color: rgb(0.82, 0.87, 0.92) });
          applyWatermark(p);
        };

        // Cover page
        if (coverPage) {
          const cover = pdfDoc.addPage([W, H]);
          cover.drawRectangle({ x: 0, y: H - 280, width: W, height: 280, color: BRAND });
          cover.drawRectangle({ x: 0, y: H - 290, width: W, height: 12, color: ACCENT });
          cover.drawText(BRAND_NAME, { x: MRG, y: H - 100, size: 34, font: helveticaBold, color: rgb(1, 1, 1) });
          cover.drawText(BRAND_SUBTITLE, { x: MRG, y: H - 132, size: 13, font: helvetica, color: rgb(0.75, 0.88, 0.97) });
          const docLabelCover = docType === 'quotation' ? L.quotation : docType === 'catalog' ? L.catalog : L.priceList;
          cover.drawText(docLabelCover, { x: MRG, y: H - 180, size: 22, font: helveticaBold, color: rgb(1, 1, 1) });
          
          const coverBadgeText = tierHeaderBadge;
          const coverBadgeW = Math.max(200, helveticaBold.widthOfTextAtSize(coverBadgeText, 10) + 20);
          cover.drawRectangle({ x: MRG, y: H - 218, width: coverBadgeW, height: 22, color: ACCENT });
          cover.drawText(coverBadgeText, { x: MRG + 8, y: H - 213, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
          
          let cy = H - 330;
          [
            `${L.date}: ${dateStr}`,
            ...(docType === 'quotation' ? [`${L.ref}: ${refNumber}`] : []),
            ...(recipientName ? [`${L.preparedFor}: ${recipientName}`] : []),
            ...(validUntil ? [`${L.validUntil}: ${validUntil}`] : []),
            ...(isExWorks ? [`Commercial Terms: Ex-Works (EXW) — Europe`] : []),
            ...(shippingNote && shippingNote.trim() ? [`Shipping: ${shippingNote.trim()}`] : []),
            ...(accountManagerName || accountManagerEmail ? [`Account Manager: ${accountManagerName || ''} ${accountManagerEmail ? `<${accountManagerEmail}>` : ''}`.trim()] : []),
            `Products: ${allItems.length} total variant presentations`,
          ].forEach(line => { cover.drawText(line, { x: MRG, y: cy, size: 11, font: helvetica, color: BRAND }); cy -= 20; });

          // Draw Interactive QR Code on Cover Page
          if (qrImage) {
            const qrCardX = W - MRG - 130;
            const qrCardY = H - 470;
            cover.drawRectangle({
              x: qrCardX,
              y: qrCardY,
              width: 130,
              height: 140,
              color: rgb(0.97, 0.98, 1),
              borderColor: rgb(0.8, 0.88, 0.95),
              borderWidth: 1
            });
            cover.drawImage(qrImage, {
              x: qrCardX + 15,
              y: qrCardY + 30,
              width: 100,
              height: 100
            });
            cover.drawText('📱 SCAN FOR WEB APP', {
              x: qrCardX + 12,
              y: qrCardY + 18,
              size: 7.5,
              font: helveticaBold,
              color: BRAND
            });
            cover.drawText('Interactive Cart & Dosages', {
              x: qrCardX + 12,
              y: qrCardY + 8,
              size: 6.5,
              font: helvetica,
              color: MUTED
            });
          }

          applyWatermark(cover);
        }

        // Content pages
        let page = pdfDoc.addPage([W, H]);
        drawHeader(page);
        let currentY = H - 85;

        const drawTableHeader = () => {
          page.drawRectangle({ x: MRG, y: currentY - 4, width: W - MRG * 2, height: 18, color: rgb(0.93, 0.95, 0.97) });
          cols.forEach(col => {
            if (col.align === 'right') {
              const labelW = helveticaBold.widthOfTextAtSize(col.label, 7.8);
              page.drawText(col.label, { x: col.rightX - labelW, y: currentY, size: 7.8, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
            } else {
              page.drawText(col.label, { x: col.x, y: currentY, size: 7.8, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
            }
          });
          currentY -= 20;
        };

        const ensureSpace = (needed = 22) => {
          if (currentY - needed < BTM) {
            page = pdfDoc.addPage([W, H]);
            drawHeader(page);
            currentY = H - 85;
            drawTableHeader();
          }
        };

        for (const groupKey of Object.keys(grouped).sort()) {
          // Group by Product Name so the Product is shown first, followed by all its available variants
          const productBuckets = {};
          grouped[groupKey].forEach(item => {
            const pName = item.name || 'Unknown Product';
            if (!productBuckets[pName]) {
              productBuckets[pName] = {
                name: pName,
                refCode: item.refCode || getProductRefCode(pName, item.productId, null),
                slug: item.slug || (pName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                category: item.category,
                goal: item.goal,
                casNumber: item.casNumber,
                target: item.target,
                description: item.description,
                protocolCount: item.protocolCount || 0,
                variants: []
              };
            }
            productBuckets[pName].variants.push(item);
          });

          // Prevent orphan group banner: ensure space for Banner (24) + first Product Header + first Supplier Header + Variants
          const firstProduct = Object.values(productBuckets)[0];
          let groupMinSpace = 24 + 32; // Banner + baseline product header
          if (firstProduct) {
            const firstMatchedProtocols = productProtocolsMap.get(firstProduct.slug) || productProtocolsMap.get(firstProduct.productId) || productProtocolsMap.get(firstProduct.name.toLowerCase()) || [];
            const hasFirstMeta = Boolean(firstProduct.goal || firstProduct.casNumber);
            const hasFirstProtocols = firstMatchedProtocols.length > 0;
            const hasFirstDesc = (showDescription || docType === 'catalog') && Boolean(firstProduct.description);
            const firstProdHeaderSpace = 32 + (hasFirstMeta ? 14 : 0) + (hasFirstProtocols ? 14 : 0) + (hasFirstDesc ? 14 : 0);
            const firstSupplierTableSpace = 20 + 15 + Math.min(2, firstProduct.variants.length) * 17;
            groupMinSpace = 24 + firstProdHeaderSpace + firstSupplierTableSpace;
          }
          ensureSpace(groupMinSpace);

          page.drawRectangle({ x: MRG, y: currentY - 3, width: W - MRG * 2, height: 20, color: rgb(0.96, 0.98, 1) });
          page.drawText(groupKey.toUpperCase(), { x: MRG + 6, y: currentY, size: 10, font: helveticaBold, color: BRAND });
          page.drawText(`(${grouped[groupKey].length} variants)`, { x: MRG + 6 + helveticaBold.widthOfTextAtSize(groupKey.toUpperCase(), 10) + 6, y: currentY, size: 8.5, font: helvetica, color: MUTED });
          currentY -= 24;

          for (const [pName, pObj] of Object.entries(productBuckets)) {
            // 1. Sort variants strictly by numerical dosage ascending, then price, then supplier
            pObj.variants.sort((a, b) => {
              if ((a.numDose || 0) !== (b.numDose || 0)) {
                return (a.numDose || 0) - (b.numDose || 0);
              }
              if ((a.priceUSD || 0) !== (b.priceUSD || 0)) {
                return (a.priceUSD || 0) - (b.priceUSD || 0);
              }
              return (a.supplier || '').localeCompare(b.supplier || '');
            });

            const matchedProtocols = productProtocolsMap.get(pObj.slug) || productProtocolsMap.get(pObj.productId) || productProtocolsMap.get(pName.toLowerCase()) || [];
            const hasMeta = Boolean(pObj.goal || pObj.casNumber);
            const hasProtocols = matchedProtocols.length > 0;
            const hasDesc = (showDescription || docType === 'catalog') && Boolean(pObj.description);

            // Check space for Product Header + Metadata + Protocols + Table Header + Variants
            const neededSpace = 32 + (hasMeta ? 14 : 0) + (hasProtocols ? 14 : 0) + (hasDesc ? 14 : 0) + 20 + Math.min(2, pObj.variants.length) * 17;
            ensureSpace(neededSpace);

            // Product Header Row — Card Style with Left Brand Accent
            page.drawRectangle({ x: MRG, y: currentY - 4, width: W - MRG * 2, height: 18, color: rgb(0.945, 0.965, 0.99) });
            // Left 3.5px accent bar
            page.drawRectangle({ x: MRG, y: currentY - 4, width: 3.5, height: 18, color: BRAND });

            // Product Name
            page.drawText(pName, { x: MRG + 8, y: currentY, size: 9.5, font: helveticaBold, color: BRAND });
            
            const pNameW = helveticaBold.widthOfTextAtSize(pName, 9.5);
            const refBadge = `[${pObj.refCode}]`;
            page.drawText(refBadge, {
              x: MRG + 12 + pNameW,
              y: currentY,
              size: 7.5,
              font: helveticaBold,
              color: ACCENT,
            });
            const refW = helveticaBold.widthOfTextAtSize(refBadge, 7.5);

            if (pObj.variants.length > 1) {
              page.drawText(`(${pObj.variants.length} presentations available)`, { 
                x: MRG + 16 + pNameW + refW, 
                y: currentY, 
                size: 7.5, 
                font: helvetica, 
                color: MUTED 
              });
            }

            // Right side of product row: Monograph Link
            const monographLabel = `Monograph: /product/${pObj.slug}`;
            const monoW = helvetica.widthOfTextAtSize(monographLabel, 6.8);
            page.drawText(monographLabel, {
              x: RIGHT_X - monoW,
              y: currentY,
              size: 6.8,
              font: helvetica,
              color: ACCENT,
            });

            currentY -= 17;

            // Visual Badges / Pills for Target & CAS
            if (hasMeta) {
              let curPillX = MRG + 8;

              // Target Pill
              if (pObj.goal) {
                const targetTxt = `Target: ${pObj.goal}`;
                const tW = helveticaBold.widthOfTextAtSize(targetTxt, 6.8);
                page.drawRectangle({
                  x: curPillX,
                  y: currentY - 2,
                  width: tW + 10,
                  height: 12,
                  color: rgb(0.91, 0.95, 0.99),
                });
                page.drawText(targetTxt, {
                  x: curPillX + 5,
                  y: currentY + 1.5,
                  size: 6.8,
                  font: helveticaBold,
                  color: rgb(0.06, 0.3, 0.52),
                });
                curPillX += tW + 14;
              }

              // CAS if available
              if (pObj.casNumber) {
                const casTxt = `CAS: ${pObj.casNumber}`;
                page.drawText(casTxt, {
                  x: curPillX,
                  y: currentY + 1.5,
                  size: 6.8,
                  font: helvetica,
                  color: rgb(0.4, 0.45, 0.5),
                });
              }

              currentY -= 14;
            }

            // Interactive Named Clinical Protocol Cards
            if (hasProtocols) {

              let protPillX = MRG + 8;
              matchedProtocols.slice(0, 2).forEach(prot => {
                const protTxt = `> ${trunc(prot.name, 42)}`;
                const prW = helveticaBold.widthOfTextAtSize(protTxt, 6.8);
                if (protPillX + prW + 12 > RIGHT_X) {
                  protPillX = MRG + 8;
                  currentY -= 14;
                }
                page.drawRectangle({
                  x: protPillX,
                  y: currentY - 2,
                  width: prW + 10,
                  height: 12,
                  color: rgb(0.92, 0.965, 0.94),
                });
                page.drawText(protTxt, {
                  x: protPillX + 5,
                  y: currentY + 1.5,
                  size: 6.8,
                  font: helveticaBold,
                  color: rgb(0.05, 0.45, 0.22),
                });
                protPillX += prW + 12;
              });
              currentY -= 14;
            }

            // Description Line if enabled
            if (hasDesc) {
              page.drawText(trunc(pObj.description, 110), {
                x: MRG + 10,
                y: currentY,
                size: 6.8,
                font: helvetica,
                color: rgb(0.45, 0.45, 0.45),
              });
              currentY -= 11;
            }

            // Table Column Headers (Rendered directly before variant data)
            drawTableHeader();

            // Calculate best value supplier per dosage when multiple suppliers compete
            const minPricePerDose = new Map();
            pObj.variants.forEach(v => {
              if (v.numDose > 0 && v.priceUSD != null) {
                if (!minPricePerDose.has(v.numDose) || v.priceUSD < minPricePerDose.get(v.numDose)) {
                  minPricePerDose.set(v.numDose, v.priceUSD);
                }
              }
            });
            const hasMultipleSuppliersForSameDose = pObj.variants.some(v => {
              return pObj.variants.filter(o => o.numDose === v.numDose).length > 1;
            });

            // Group variants under this product by Supplier into sub-fichas
            const supplierSubGroups = {};
            pObj.variants.forEach(vItem => {
              const sRawName = vItem.supplier || 'Unassigned';
              if (!supplierSubGroups[sRawName]) {
                supplierSubGroups[sRawName] = {
                  rawName: sRawName,
                  displayName: getSupplierDisplayName(sRawName),
                  warehouse: vItem.warehouse || getSupplierWarehouse(sRawName, vItem.country, vItem.catalogBrand || vItem.sourceCatalogue || catalogueFilter),
                  variants: []
                };
              }
              supplierSubGroups[sRawName].variants.push(vItem);
            });

            const supplierList = Object.values(supplierSubGroups);
            for (let sIdx = 0; sIdx < supplierList.length; sIdx++) {
              const sObj = supplierList[sIdx];
              // Each supplier presentation starts on a clean fresh page if it doesn't fit comfortably with its full variant table.
              // For the first supplier under a product, ensureSpace already ensured headroom for product + table + supplier.
              // For subsequent suppliers (sIdx > 0), only break if remaining vertical space cannot hold the supplier block.
              const neededSupplierSpace = 20 + (sObj.variants.length * 17);
              if (sIdx > 0 && (currentY - neededSupplierSpace < BTM + 15)) {
                page = pdfDoc.addPage([W, H]);
                drawHeader(page);
                currentY = H - 85;
                drawTableHeader();
              }

              // Sub-ficha Header per Supplier
              page.drawRectangle({
                x: MRG + 2,
                y: currentY - 2,
                width: W - MRG * 2 - 4,
                height: 14,
                color: rgb(0.962, 0.975, 0.99),
              });
              
              const sHeaderTitle = `> ${sObj.displayName.toUpperCase()}`;
              page.drawText(sHeaderTitle, {
                x: MRG + 6,
                y: currentY + 1,
                size: 7.5,
                font: helveticaBold,
                color: BRAND,
              });
              const sTitleW = helveticaBold.widthOfTextAtSize(sHeaderTitle, 7.5);

              if (showWarehouse && sObj.warehouse) {
                const whText = `[Warehouse: ${sObj.warehouse}]`;
                page.drawText(whText, {
                  x: MRG + 12 + sTitleW,
                  y: currentY + 1,
                  size: 7,
                  font: helvetica,
                  color: rgb(0.35, 0.45, 0.55),
                });
              }

              currentY -= 15;

              // Render available variants for this supplier sub-ficha
              sObj.variants.forEach((item, idx) => {
                ensureSpace(18);
                // Zebra striping ("pijama") for maximum readability
                if (idx % 2 === 1) {
                  page.drawRectangle({
                    x: MRG,
                    y: currentY - 3,
                    width: W - MRG * 2,
                    height: 15,
                    color: rgb(0.94, 0.965, 0.985), // Soft ice-blue slate zebra tint
                  });
                }
                page.drawLine({
                  start: { x: MRG, y: currentY - 3 },
                  end: { x: W - MRG, y: currentY - 3 },
                  thickness: 0.35,
                  color: rgb(0.88, 0.91, 0.94),
                });

                // Column 1: Dosage
                const doseText = `•  ${item.doseOnly || item.dosage || '-'}`;
                page.drawText(trunc(doseText, cols[0].maxLen || 16), {
                  x: MRG + 10,
                  y: currentY,
                  size: 8.5,
                  font: helveticaBold,
                  color: rgb(0.12, 0.15, 0.2),
                });

                // Column 2: Presentation / Format
                const formatText = item.presentationOnly || item.variantName || 'Vial';
                page.drawText(formatText, {
                  x: MRG + 95,
                  y: currentY,
                  size: 8.2,
                  font: helvetica,
                  color: rgb(0.3, 0.35, 0.4),
                });

                // Micro-badge Best Value for the lowest price/mg in this category
                const itemCatKey = (item.category || pObj.category || 'Other').toLowerCase().trim();
                const catBest = categoryMinPricePerMg.get(itemCatKey);
                const currentRate = (item.numDose > 0 && item.priceUSD != null) ? (item.priceUSD / item.numDose) : null;
                const isCategoryBestValue = catBest && currentRate != null && Math.abs(currentRate - catBest.minRate) < 0.0001;

                if (isCategoryBestValue) {
                  const formatW = helvetica.widthOfTextAtSize(formatText, 8.2);
                  const bvX = MRG + 95 + formatW + 8;
                  const bvBadgeW = 44;
                  page.drawRectangle({
                    x: bvX,
                    y: currentY - 1.5,
                    width: bvBadgeW,
                    height: 10.5,
                    color: rgb(0.9, 0.965, 0.93),
                  });
                  page.drawText('Best Value', {
                    x: bvX + 3.5,
                    y: currentY + 1,
                    size: 5.9,
                    font: helveticaBold,
                    color: rgb(0.06, 0.45, 0.22),
                  });
                }

                // Column: Rate ($/mg or $/ml)
                if (showPricePerMg) {
                  const rateCol = cols.find(c => c.key === 'pricePerMg');
                  if (rateCol) {
                    const uLabel = item.rateUnitLabel || '/mg';
                    const rateVal = item.pricePerMg != null ? `${CURRENCY_SYMBOLS[currency] || currency}${Number(item.pricePerMg).toFixed(2)}${uLabel}` : '-';
                    const rW = helvetica.widthOfTextAtSize(rateVal, 8);
                    page.drawText(rateVal, {
                      x: rateCol.rightX - rW,
                      y: currentY,
                      size: 8,
                      font: helvetica,
                      color: rgb(0.18, 0.38, 0.52),
                    });
                  }
                }

                // Column: Kit Price
                if (includePrices && showKitPrice) {
                  const kitCol = cols.find(c => c.key === 'kitPrice');
                  if (kitCol) {
                    const kitVal = fmtPrice(item.kitPrice, item.currency);
                    const kW = helveticaBold.widthOfTextAtSize(kitVal, 8.5);
                    page.drawText(kitVal, {
                      x: kitCol.rightX - kW,
                      y: currentY,
                      size: 8.5,
                      font: helveticaBold,
                      color: rgb(0.06, 0.45, 0.22),
                    });
                  }
                }

                // Column: Unit Price
                if (includePrices) {
                  const priceCol = cols.find(c => c.key === 'price');
                  if (priceCol) {
                    const priceVal = fmtPrice(item.price, item.currency);
                    const pW = helveticaBold.widthOfTextAtSize(priceVal, 8.5);
                    page.drawText(priceVal, {
                      x: priceCol.rightX - pW,
                      y: currentY,
                      size: 8.5,
                      font: helveticaBold,
                      color: item.price != null ? rgb(0.06, 0.45, 0.22) : rgb(0.4, 0.4, 0.4),
                    });
                  }
                }

                currentY -= 16;
              });

              currentY -= 4;
            }

            currentY -= 4; // spacing between products
          }
          currentY -= 12;
        }

        // Optional Appendix — Clinical Evidence & Scientific Bibliography
        if (includeBibliography && pubmedArticlesMap.size > 0) {
          page = pdfDoc.addPage([W, H]);
          drawHeader(page);
          currentY = H - 85;

          // Appendix Banner
          page.drawRectangle({ x: MRG, y: currentY - 8, width: W - MRG * 2, height: 28, color: BRAND });
          page.drawText('APPENDIX: CLINICAL EVIDENCE & SCIENTIFIC BIBLIOGRAPHY', {
            x: MRG + 10,
            y: currentY + 6,
            size: 10,
            font: helveticaBold,
            color: rgb(1, 1, 1),
          });
          page.drawText('Peer-reviewed research and pharmacological mechanisms indexed in PubMed / NCBI', {
            x: MRG + 10,
            y: currentY - 4,
            size: 7.2,
            font: helvetica,
            color: rgb(0.75, 0.88, 0.97),
          });
          currentY -= 36;

          // Deduplicate products to display scientific citations
          const uniqueProductsForAppendix = new Map();
          finalItems.forEach(item => {
            if (!uniqueProductsForAppendix.has(item.name)) {
              uniqueProductsForAppendix.set(item.name, item);
            }
          });

          for (const [pName, item] of uniqueProductsForAppendix.entries()) {
            const articles = pubmedArticlesMap.get(item.slug) || pubmedArticlesMap.get(item.productId) || [];
            if (!articles || articles.length === 0) continue;

            ensureSpace(32 + Math.min(3, articles.length) * 26);

            // Product subheader
            page.drawRectangle({ x: MRG, y: currentY - 2, width: W - MRG * 2, height: 16, color: rgb(0.93, 0.96, 1) });
            page.drawText(pName, { x: MRG + 6, y: currentY + 1, size: 8.8, font: helveticaBold, color: BRAND });
            const pW = helveticaBold.widthOfTextAtSize(pName, 8.8);
            page.drawText(`[${item.refCode}]`, { x: MRG + 10 + pW, y: currentY + 1, size: 7.5, font: helveticaBold, color: ACCENT });
            currentY -= 16;

            articles.slice(0, 3).forEach(art => {
              ensureSpace(24);
              const titleText = `• "${art.title || 'Clinical Research Study'}"`;
              page.drawText(trunc(titleText, 105), {
                x: MRG + 12,
                y: currentY,
                size: 7.5,
                font: helveticaBold,
                color: rgb(0.18, 0.22, 0.28),
              });
              currentY -= 10;

              const journalText = `${art.journal || 'PubMed'} (${art.pubdate || art.year || 'Recent'})  ·  PMID: ${art.pmid}  ·  https://pubmed.ncbi.nlm.nih.gov/${art.pmid}/`;
              page.drawText(trunc(journalText, 115), {
                x: MRG + 18,
                y: currentY,
                size: 6.8,
                font: helvetica,
                color: ACCENT,
              });
              currentY -= 13;
            });

            currentY -= 6;
          }
        }

        // Footers & Multi-Page Pagination
        const totalPages = pdfDoc.getPageCount();
        const INCOTERM_DISCLAIMERS = {
          EXW: '* Commercial Terms: Prices are Ex-Works (EXW). Freight, transit insurance, import duties and local taxes are not included.',
          FOB: '* Commercial Terms: Prices are Free on Board (FOB). International freight, transit insurance, and destination import duties not included.',
          DAP: '* Commercial Terms: Prices are Delivered at Place (DAP). Freight included to destination; local import duties and taxes excluded.',
          CIF: '* Commercial Terms: Prices are Cost, Insurance & Freight (CIF). International freight & marine insurance included.',
        };
        const incotermDisclaimer = effectiveIncoterm ? INCOTERM_DISCLAIMERS[effectiveIncoterm] : '';

        pdfDoc.getPages().forEach((p, i) => {
          // If cover page exists, skip standard footer on cover
          if (coverPage && i === 0) return;

          // Top divider line for footer
          p.drawLine({
            start: { x: MRG, y: 38 },
            end: { x: W - MRG, y: 38 },
            thickness: 0.4,
            color: rgb(0.85, 0.88, 0.92),
          });

          // Left: Brand Name & Confidentiality Notice (No contact info in footer as requested)
          const leftFooter = `${BRAND_NAME}  ·  ${L.confidential || 'Confidential - For Internal Use Only'}`;
          p.drawText(leftFooter, {
            x: MRG,
            y: 25,
            size: 7.2,
            font: helveticaBold,
            color: rgb(0.35, 0.45, 0.55),
          });

          // Right: Page Numbering Pill & Non-Overlapping Date Stamp
          const actualPageNum = coverPage ? i : i + 1;
          const actualTotalPages = coverPage ? totalPages - 1 : totalPages;
          const pageStr = totalPages > 1 
            ? `${L.page || 'Page'} ${actualPageNum} ${L.of || 'of'} ${actualTotalPages}`
            : `${L.page || 'Page'} 1 of 1`;

          const pageStrW = helveticaBold.widthOfTextAtSize(pageStr, 7.5);
          const pillW = pageStrW + 14;
          const pillX = RIGHT_X - pillW;

          // Draw soft pill for page number at far right
          p.drawRectangle({
            x: pillX,
            y: 20,
            width: pillW,
            height: 13,
            color: rgb(0.93, 0.95, 0.98),
          });
          p.drawText(pageStr, {
            x: pillX + 7,
            y: 24,
            size: 7.5,
            font: helveticaBold,
            color: BRAND,
          });

          // Date Stamp placed cleanly to the left of the page pill (with generous 14pt gap, zero overlap)
          const dateFooterStr = `${L.date || 'Date'}: ${dateStr}`;
          const dateW = helvetica.widthOfTextAtSize(dateFooterStr, 7.2);
          p.drawText(dateFooterStr, {
            x: pillX - dateW - 14,
            y: 25,
            size: 7.2,
            font: helvetica,
            color: rgb(0.45, 0.5, 0.55),
          });

          // Center or Left Bottom: Incoterm Disclaimer / Validity
          let btmText = incotermDisclaimer;
          if (validUntil) {
            btmText = `${btmText ? btmText + '  |  ' : ''}${L.validUntil}: ${validUntil}`;
          }
          if (btmText) {
            // Dynamically scale font size (6.0 - 6.4pt) so commercial conditions fit 100% complete without truncation
            const maxW = W - MRG * 2;
            let fSize = 6.4;
            let textW = helvetica.widthOfTextAtSize(btmText, fSize);
            if (textW > maxW) {
              fSize = Math.max(5.6, (maxW / textW) * fSize * 0.98);
            }
            p.drawText(btmText, {
              x: MRG,
              y: 12,
              size: fSize,
              font: helvetica,
              color: rgb(0.45, 0.48, 0.52),
            });
          }

          // ── shippingNote: prominent amber highlighted line above footer ──────
          if (shippingNote && shippingNote.trim()) {
            const snText = `✦ ${shippingNote.trim()}`;
            const snW = Math.min(helveticaBold.widthOfTextAtSize(snText, 7.5), W - MRG * 2 - 10);
            // Amber pill background
            p.drawRectangle({
              x: MRG,
              y: 40,
              width: snW + 16,
              height: 13,
              color: rgb(1, 0.97, 0.88),
            });
            p.drawText(trunc(snText, 120), {
              x: MRG + 8,
              y: 44,
              size: 7.5,
              font: helveticaBold,
              color: rgb(0.6, 0.38, 0),
            });
          }
        });

        const pdfBytes = await pdfDoc.save();
        const docSuffix = docType === 'quotation' ? refNumber : `${priceTier}${isExWorks ? '_exw' : ''}`;
        const filename = `atlas_solutions_${docType}_${docSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`;

        emit({ type: 'progress', step: 'saving_pdf', message: 'Saving to Cloud Storage...', meta: {} });
        const url = await saveToCloudStorage(pdfBytes, filename);
        
        // Save metadata to Firestore including snapshot for idempotent regeneration
        const configSnapshot = {
          productIds, priceOverrides, docType, priceTier, isExWorks, currency, groupBy,
          showSupplier, showDosage, showKitPrice, showProtocols, onlyInStock,
          watermark, language, coverPage, validUntil,
          // v2 params
          supplierFilter: supplierFilter || null,
          priceMarkupPercent: priceMarkupPercent || 0,
          shippingNote: shippingNote || '',
        };

        // Calculate items and subtotal for metadata persistence
        const formattedQuoteItems = allItems.map(it => {
          const qty = 1;
          const rate = Number(it.price || it.unitPrice || 0);
          const cost = Number(it.cost || it.supplierCost || rate * 0.52);
          return {
            name: it.productName || it.name || 'Compounded Formulation',
            dosage: it.spec || it.dosage || 'Standard Vial',
            quantity: qty,
            unitRate: rate,
            supplierCost: cost,
            totalPrice: rate * qty,
            supplierName: it.supplier || 'Compounding Pharmacy'
          };
        });
        const quoteSubtotal = formattedQuoteItems.reduce((sum, it) => sum + it.totalPrice, 0);
        const quoteTax = Math.round(quoteSubtotal * 0.05 * 100) / 100;
        const quoteGrandTotal = Math.round((quoteSubtotal + quoteTax) * 100) / 100;

        await saveQuotationMetadata({
           refNumber, clientId, recipientName, tier: canonicalTier, currency, 
           docType, productCount: productDocs.length, variantCount: allItems.length, 
           filename, url, configSnapshot,
           items: formattedQuoteItems,
           subtotal: quoteSubtotal,
           taxTotal: quoteTax,
           grandTotal: quoteGrandTotal,
           recipientType: recipientType || 'clinic'
        });

        // Save historical audit & tracking log to catalog_generation_logs collection
        let logId = null;
        try {
          const logDoc = await adminDb.collection('catalog_generation_logs').add({
            docType,
            docTitle: docType === 'quotation' ? `Quotation ${refNumber}` : docType === 'catalog' ? 'Product Catalog' : 'Price List',
            tier: canonicalTier,
            incoterm: effectiveIncoterm,
            currency,
            recipient: {
              type: recipientType || (clientId ? 'registered' : 'custom'),
              id: recipientId || clientId || null,
              name: recipientName || 'Direct Client',
              email: recipientEmail || '',
            },
            accountManager: {
              id: accountManagerId || null,
              name: accountManagerName || 'Atlas Commercial Desk',
              email: accountManagerEmail || 'orders@atlas-solutions.com',
            },
            productCount: productDocs.length,
            variantCount: allItems.length,
            productSummary: Array.from(new Set(allItems.map(i => i.name))).slice(0, 5).join(', '),
            pdfUrl: url,
            filename,
            generatedAt: new Date().toISOString(),
            status: 'generated',
            isExWorks: Boolean(isExWorks),
            supplierMasking,
            followUpNotes: followUpNotes || '',
          });
          logId = logDoc.id;
        } catch (logErr) {
          console.error('Error logging catalog generation:', logErr);
        }

        // Use the Cloud Storage URL
        emit({ type: 'done', filename, meta: { pages: totalPages, variants: allItems.length, url, logId } });
        controller.close();
      } catch (err) {
        console.error('[/api/generate-pdf] POST stream error:', err);
        try { 
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', message: err.message }) + '\n')); 
        } catch (streamErr) {
          console.error('Failed to enqueue error to stream:', streamErr);
        }
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    },
  });
}
