import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { sanitizeForClient } from '../../../../utils/sanitizeForClient';

// ── In-Memory Server RAM Cache (L1 Cache: 0ms response) ───────────────────────
const catalogSummaryCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes TTL

/**
 * Busts the server-side catalog summary cache.
 */
export function invalidateCatalogSummaryCache() {
  catalogSummaryCache.clear();
}

// Utility: split array into chunks of size n (Firestore 'in' supports max 30)
function chunk(arr, n) {
  const result = [];
  for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n));
  return result;
}

export async function buildCatalogSummary(searchParams) {
  if (!adminDb) throw new Error('Database unavailable.');

  // 1. Check L1 Server Cache
  const forceRefresh = searchParams.get('fresh') === 'true' || Boolean(searchParams.get('_t'));
  const cacheKey = Array.from(searchParams.entries())
    .filter(([k]) => k !== '_t' && k !== 'fresh')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  if (!forceRefresh && catalogSummaryCache.has(cacheKey)) {
    const cached = catalogSummaryCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { payload: cached.payload, ttl: cached.ttl };
    }
    catalogSummaryCache.delete(cacheKey);
  }

  try {
    const limitParam        = parseInt(searchParams.get('limit') || '50', 10);
    const offsetParam       = parseInt(searchParams.get('offset') || '0', 10);
    const qParam            = (searchParams.get('q') || '').trim();
    const timeframeParam    = (searchParams.get('timeframe') || '').trim().toLowerCase();
    const includeInactive   = searchParams.get('includeInactive') === 'true';

    const parseMulti = (key) => {
      const val = searchParams.get(key);
      if (!val || val === 'all') return [];
      return val.split(',').map(s => s.trim()).filter(Boolean);
    };

    const catParams           = parseMulti('category');
    const subcatParams        = parseMulti('subcategory');
    const goalParams          = parseMulti('goals');
    const formatParams        = parseMulti('formatId');
    const presentationParams  = parseMulti('presentation');
    const supplierParams      = parseMulti('supplier');
    const pTypeParams         = parseMulti('productType');
    const statusParams        = parseMulti('status');
    const tagParams           = Array.from(new Set([...parseMulti('tag'), ...parseMulti('tags'), ...parseMulti('program')]));
    const priorityParams      = parseMulti('priority');
    const availabilityParam   = searchParams.get('availability') || '';

    const hasSupplierFilter     = supplierParams.length > 0;
    const hasPresentationFilter = presentationParams.length > 0;
    const hasTimeframeFilter    = timeframeParam.length > 0 && timeframeParam !== 'all';
    const hasTagFilter          = tagParams.length > 0;
    const hasPriorityFilter     = priorityParams.length > 0 && !priorityParams.includes('all');

    const hasActiveFilters =
      catParams.length > 0 || subcatParams.length > 0 || goalParams.length > 0 ||
      presentationParams.length > 0 || formatParams.length > 0 ||
      supplierParams.length > 0 || qParam.length > 0 || availabilityParam.length > 0 ||
      pTypeParams.length > 0 || statusParams.length > 0 || hasTimeframeFilter ||
      hasTagFilter || hasPriorityFilter;

    let metaFacets = null;
    let productsList = []; // Array of { id, ref, data }
    const variantsByProduct = {};

    // ── 2. FETCH CATALOG FACETS (L1 Metadata read) ───────────────────────────
    try {
      const metaDoc = await adminDb.collection('_meta').doc('catalog_facets').get();
      if (metaDoc.exists) metaFacets = metaDoc.data();
    } catch (err) {
      console.warn('catalog_facets metaDoc read note:', err.message);
    }

    const useOptimizedPaging = !hasActiveFilters && Boolean(metaFacets?.totals?.activeProducts);

    // ── 3. FETCH CATALOG PRODUCTS (Strict Limit & Embedded-First Variants) ───
    const fetchLimit = useOptimizedPaging ? (offsetParam + limitParam) : 500;

    let productsSnap;
    try {
      productsSnap = await adminDb.collection('products')
        .orderBy('updatedAt', 'desc')
        .limit(fetchLimit)
        .get()
        .catch(() => adminDb.collection('products').limit(fetchLimit).get());
    } catch (e) {
      productsSnap = await adminDb.collection('products').limit(fetchLimit).get();
    }

    productsSnap.forEach(doc => {
      productsList.push({ id: doc.id, ref: doc.ref, data: doc.data() });
    });

    // Helper to format variant metrics
    const formatVariant = (v = {}, fallbackId) => {
      let doseValue = parseFloat(v.dosage || v.dose || 0);
      if (isNaN(doseValue) || doseValue <= 0) doseValue = 1;
      const basePrice = v.unit_price ?? v.price;
      const kitPrice = v.cost_tiers?.cost_10 ?? v.price_per_kit_10;
      const pricePerMg = basePrice != null ? (basePrice / doseValue) : null;
      const kitPricePerMg = kitPrice != null ? (kitPrice / (doseValue * 10)) : null;

      return {
        id: v.id || fallbackId,
        pricePerMg,
        kitPricePerMg,
        ...v,
        supplierId: v.supplierId || v.supplier || null
      };
    };

    // Fast O(1) embedded variants resolution; query subcollection in parallel only if product lacks embedded variants
    const missingVariantsProducts = [];
    productsList.forEach(p => {
      const pData = p.data || {};
      if (pData.variants && Array.isArray(pData.variants) && pData.variants.length > 0) {
        variantsByProduct[p.id] = pData.variants.map((v, idx) => formatVariant(v, `v_${idx}`));
      } else {
        missingVariantsProducts.push(p);
      }
    });

    if (missingVariantsProducts.length > 0) {
      const subcollectionFetches = await Promise.all(
        missingVariantsProducts.map(async (p) => {
          try {
            const snap = await p.ref.collection('variants').get();
            return { id: p.id, docs: snap.docs };
          } catch {
            return { id: p.id, docs: [] };
          }
        })
      );
      subcollectionFetches.forEach(({ id, docs }) => {
        variantsByProduct[id] = docs.map((vd, idx) => formatVariant(vd.data(), vd.id || `v_${idx}`));
      });
    }

    // ── 6. AGGREGATE INTO CANONICAL PRODUCT GROUPS ───────────────────────────
    const groupsMap        = new Map();
    let kpiCategorySet     = new Set();
    let kpiSupplierSet     = new Set();
    let kpiSupplierNameMap = new Map();
    let kpiTotalCanonical  = 0;
    let kpiTotalVariants   = 0;
    let kpiApiProducts     = 0;
    let kpiApiVariants     = 0;
    let kpiFinishedProducts = 0;
    let kpiFinishedVariants = 0;
    let kpiFormatCounts    = { vial: 0, pen: 0, spray: 0, oral: 0, topical: 0 };

    productsList.forEach(item => {
      const data  = item.data;
      const docId = item.id;
      const cName = data.canonicalName || data.name || docId;

      const isInactive = (data.status && ['inactive', 'archived', 'draft'].includes(data.status)) || data.isActive === false;
      const computedStatus = data.status || (isInactive ? 'archived' : 'active');

      // Search term filter (case-insensitive substring match with tags/aliases/programs)
      if (qParam.length > 0) {
        const term = qParam.toLowerCase();
        const docId = item.id.toLowerCase();
        const pName = (data.name || '').toLowerCase();
        const cName = (data.canonicalName || '').toLowerCase();
        const dName = (data.displayName || '').toLowerCase();
        const pSlug = (data.slug || '').toLowerCase();
        const pSku  = (data.sku || '').toLowerCase();
        const pCas  = (data.casNumber || data.molecular?.casNumber || '').toLowerCase();
        const pDesc = (data.description || '').toLowerCase();
        const pTokens = Array.isArray(data.searchTokens) ? data.searchTokens.map(t => String(t).toLowerCase()) : [];
        const pTags = Array.isArray(data.tags) ? data.tags.map(t => String(t).toLowerCase()) : [];
        const pAliases = Array.isArray(data.searchAliases) ? data.searchAliases.map(a => String(a).toLowerCase()) : [];
        const pPrograms = Array.isArray(data.programs) ? data.programs : [];
        const pProgNames = pPrograms.map(p => (p.name || '').toLowerCase());
        const pProgSlugs = pPrograms.map(p => (p.slug || p.id || '').toLowerCase());

        const matchesSearch = 
          docId.includes(term) ||
          pName.includes(term) ||
          cName.includes(term) ||
          dName.includes(term) ||
          pSlug.includes(term) ||
          pSku.includes(term) ||
          pCas.includes(term) ||
          pDesc.includes(term) ||
          pTokens.some(t => t.includes(term)) ||
          pTags.some(t => t.includes(term)) ||
          pAliases.some(a => a.includes(term)) ||
          pProgNames.some(pn => pn.includes(term)) ||
          pProgSlugs.some(ps => ps.includes(term));

        if (!matchesSearch) return;
      }

      // Status Filter
      if (statusParams.length > 0) {
        if (!statusParams.includes(computedStatus)) return;
      } else {
        if (!includeInactive && isInactive) return;
      }

      // Tag & Program filter (supports ANY vs ALL matching)
      if (hasTagFilter) {
        const tagMode = (searchParams.get('tagMode') || searchParams.get('match') || 'any').toLowerCase();
        const pTags = (Array.isArray(data.tags) ? data.tags : []).map(t => String(t).toLowerCase());
        const pPrograms = Array.isArray(data.programs) ? data.programs : [];
        const pProgSlugs = pPrograms.map(p => String(p.slug || p.id || '').toLowerCase());
        const pProgNames = pPrograms.map(p => String(p.name || '').toLowerCase());

        const checkMatch = (tp) => {
          const cleanTp = String(tp).toLowerCase();
          return pTags.includes(cleanTp) || 
                 pProgSlugs.includes(cleanTp) || 
                 pProgNames.includes(cleanTp) ||
                 pTags.some(t => t.includes(cleanTp)) ||
                 pProgSlugs.some(s => s.includes(cleanTp)) ||
                 pProgNames.some(n => n.includes(cleanTp));
        };

        const matchesTag = tagMode === 'all' 
          ? tagParams.every(checkMatch)
          : tagParams.some(checkMatch);

        if (!matchesTag) return;
      }

      // Priority filter (Association-based)
      if (hasPriorityFilter) {
        const pPrograms = Array.isArray(data.programs) ? data.programs : [];
        const matchesPriority = priorityParams.some(pri => {
          if (pri === 'all') return true;
          const cleanPri = String(pri).toUpperCase();
          return pPrograms.some(prog => {
            if (hasTagFilter) {
              const progSlug = String(prog.slug || prog.id || '').toLowerCase();
              const progName = String(prog.name || '').toLowerCase();
              const matchesProg = tagParams.some(tp => {
                const cleanTp = String(tp).toLowerCase();
                return progSlug.includes(cleanTp) || progName.includes(cleanTp) || cleanTp.includes(progSlug);
              });
              if (!matchesProg) return false;
            }
            return String(prog.priority || '').toUpperCase() === cleanPri;
          });
        });
        if (!matchesPriority) return;
      }

      // Category filter (supports singular/plural e.g. peptide/peptides)
      if (catParams.length > 0) {
        const itemCat = (data.categoryId || data.category || '').toLowerCase();
        const matchesCat = catParams.some(c => {
          const cLow = c.toLowerCase();
          return itemCat === cLow ||
                 itemCat === cLow.replace(/s$/, '') ||
                 itemCat + 's' === cLow;
        });
        if (!matchesCat) return;
      }

      // ProductType filter (supports availableTypes[] and primaryType)
      if (pTypeParams.length > 0) {
        const productAvailableTypes = Array.isArray(data.availableTypes) && data.availableTypes.length > 0
          ? data.availableTypes
          : [data.primaryType || data.productType || data.type || 'finished_product'];

        const matchesPType = pTypeParams.some(pt => {
          if (pt === 'api_raw_material' || pt === 'raw_material') {
            return productAvailableTypes.includes('raw_material') || productAvailableTypes.includes('api_raw_material');
          }
          return productAvailableTypes.includes(pt);
        });
        if (!matchesPType) return;
      }

      // Subcategory filter
      if (subcatParams.length > 0) {
        if (!data.subcategoryId || !subcatParams.includes(data.subcategoryId)) return;
      }

      let productVariants = variantsByProduct[docId] || [];
      if (!includeInactive) {
        productVariants = productVariants.filter(v =>
          v.isActive !== false && !['inactive', 'archived', 'draft'].includes(v.status)
        );
      }

      // Supplier filter (supports supplier- prefix and clean name matching)
      if (hasSupplierFilter) {
        const itemSuppliers = [
          data.supplierId,
          data.supplier,
          ...(Array.isArray(data.supplierIds) ? data.supplierIds : []),
          ...productVariants.map(v => v.supplierId || v.supplier)
        ].filter(Boolean).map(s => String(s).toLowerCase().replace(/^supplier-/, ''));

        const matchedSupplier = supplierParams.some(sp => {
          const cleanSp = String(sp).toLowerCase().replace(/^supplier-/, '');
          return itemSuppliers.includes(cleanSp);
        });

        if (!matchedSupplier) return;

        if (productVariants.length > 0) {
          productVariants = productVariants.filter(v => {
            const vSup = String(v.supplierId || v.supplier || '').toLowerCase().replace(/^supplier-/, '');
            return supplierParams.some(sp => String(sp).toLowerCase().replace(/^supplier-/, '') === vSup);
          });
        }
      }

      // Presentation filter
      if (hasPresentationFilter) {
        productVariants = productVariants.filter(v => {
          const pres = v.presentation || v.format || 'vial';
          return presentationParams.includes(pres);
        });
      }

      // Goals filter
      if (goalParams.length > 0) {
        const productGoals = data.goalIds || data.goals || [];
        if (!goalParams.some(g => productGoals.includes(g))) return;
      }

      // Allow products with subcollection variants (variantsCount > 0) even when
      // the embedded array is empty — they will show the correct count from variantsCount.
      const effectiveVariantCount = productVariants.length || (data.variantsCount || 0);
      if (effectiveVariantCount === 0 && !includeInactive) return;

      let minPrice = Infinity, maxPrice = 0, totalStock = null;
      const suppliers = new Map();

      productVariants.forEach(v => {
        const pres = v.presentation || 'vial';
        if (pres === 'pen' || pres === 'cartridge') {
          kpiFormatCounts.pen++;
        } else if (pres === 'nasal_spray') {
          kpiFormatCounts.spray++;
        } else if (pres === 'capsule' || pres === 'tablet') {
          kpiFormatCounts.oral++;
        } else if (pres === 'cream' || pres === 'bottle') {
          kpiFormatCounts.topical++;
        } else {
          kpiFormatCounts.vial++;
        }

        const stock = typeof v.stock === 'number' ? v.stock : (parseInt(v.stock, 10) || null);
        if (stock !== null) { totalStock = (totalStock ?? 0) + stock; }

        const price = typeof v.unit_price === 'number'
          ? v.unit_price : (typeof v.price === 'number' ? v.price : parseFloat(v.price));
        if (!isNaN(price) && price > 0) {
          if (price < minPrice) minPrice = price;
          if (price > maxPrice) maxPrice = price;
        }

        const sId = v.supplierId;
        if (sId && !suppliers.has(sId)) {
          const kitVal      = v.cost_tiers?.cost_10 ?? v.price_per_kit_10;
          const kitPriceRaw = typeof kitVal === 'number' ? kitVal : parseFloat(kitVal);
          suppliers.set(sId, {
            id: sId,
            name: v.supplierName || v.supplier || 'Unknown',
            price: !isNaN(price) ? price : null,
            kitPrice: !isNaN(kitPriceRaw) ? kitPriceRaw : null,
            stock
          });
        }
      });

      // Also ingest supplier IDs directly from product document metadata (e.g. supplierIds, suppliers, supplierId)
      const rawDocSuppliers = [
        ...(Array.isArray(data.supplierIds) ? data.supplierIds : []),
        ...(Array.isArray(data.suppliers) ? data.suppliers : []),
        data.supplierId,
        data.supplier
      ].filter(Boolean);

      rawDocSuppliers.forEach(item => {
        const sId = typeof item === 'string' ? item : item.id;
        if (sId && !suppliers.has(sId)) {
          const sName = typeof item === 'string' ? (item.replace(/^supplier-/, '').toUpperCase()) : (item.name || item.id);
          suppliers.set(sId, {
            id: sId,
            name: typeof item === 'object' && item.name ? item.name : sName,
            price: null,
            kitPrice: null,
            stock: null
          });
        }
      });

      kpiTotalCanonical++;
      kpiTotalVariants += productVariants.length;

      const isApi = (
        data.primaryType === 'raw_material' || 
        data.primaryType === 'api_raw_material' || 
        data.productType === 'raw_material' || 
        data.productType === 'api_raw_material' || 
        (data.category && String(data.category).toLowerCase().includes('raw')) || 
        (data.categoryId && String(data.categoryId).toLowerCase().includes('raw'))
      );

      if (isApi) {
        kpiApiProducts++;
        kpiApiVariants += productVariants.length;
      } else {
        kpiFinishedProducts++;
        kpiFinishedVariants += productVariants.length;
      }

      if (data.category) kpiCategorySet.add(data.category);
      suppliers.forEach((sv, sid) => {
        kpiSupplierSet.add(sid);
        if (!kpiSupplierNameMap.has(sid)) {
          kpiSupplierNameMap.set(sid, sv.name || sid);
        }
      });

      const key = cName.trim().toLowerCase();
      const pCount = typeof data.protocolCount === 'number' ? data.protocolCount : 0;
      const rxCount = typeof data.prescriptionCount === 'number' ? data.prescriptionCount : 0;

      if (groupsMap.has(key)) {
        const ex = groupsMap.get(key);
        const existingIds = new Set(ex.variants.map(v => v.id));
        productVariants.forEach(v => { if (!existingIds.has(v.id)) ex.variants.push(v); });
        suppliers.forEach((sv, sid) => { if (!ex._supplierMap.has(sid)) ex._supplierMap.set(sid, sv); });
        if (minPrice !== Infinity) ex.minPrice = ex.minPrice === null ? minPrice : Math.min(ex.minPrice, minPrice);
        ex.maxPrice  = Math.max(ex.maxPrice, maxPrice);
        if (totalStock !== null) ex.totalStock = (ex.totalStock ?? 0) + totalStock;
        ex.protocolCount += pCount;
        ex.prescriptionCount += rxCount;
        if (!ex.molecular && data.molecular) ex.molecular = data.molecular;
        if (!ex.apiSpecs && data.apiSpecs) ex.apiSpecs = data.apiSpecs;
        if (!ex.scientificData && data.scientificData) ex.scientificData = data.scientificData;
        if (!ex.molecularWeight && (data.molecularWeight || data.scientificData?.molecularWeight)) ex.molecularWeight = data.molecularWeight || data.scientificData?.molecularWeight;
        if (!ex.casNumber && (data.casNumber || data.scientificData?.casNumber)) ex.casNumber = data.casNumber || data.scientificData?.casNumber;
        if (!ex.pubchemCid && (data.pubchemCid || data.scientificData?.pubchemCid)) ex.pubchemCid = data.pubchemCid || data.scientificData?.pubchemCid;
        if (!ex.purity && data.purity) ex.purity = data.purity;
        if (!ex.hasCOA && (data.hasCOA || data.coaUrl)) { ex.hasCOA = true; ex.coaUrl = data.coaUrl || 'Verified CoA'; }
        if (!ex.primaryGoal && data.primaryGoal) ex.primaryGoal = data.primaryGoal;
      } else {
        groupsMap.set(key, {
          ...data,
          id: docId, name: cName, canonicalName: cName,
          canonicalId: data.canonicalId || docId,
          category: data.category || '',
          goalIds:  Array.isArray(data.goalIds) ? data.goalIds : (Array.isArray(data.goals) ? data.goals : []),
          description: data.description || '',
          imageUrl: data.imageUrl || null,
          molecular: data.molecular || null,
          apiSpecs: data.apiSpecs || null,
          scientificData: data.scientificData || null,
          molecularWeight: data.molecularWeight || data.scientificData?.molecularWeight || null,
          casNumber: data.casNumber || data.scientificData?.casNumber || null,
          pubchemCid: data.pubchemCid || data.scientificData?.pubchemCid || null,
          aiDescription: data.aiDescription || data.summary || null,
          purity: data.purity || null,
          primaryGoal: data.primaryGoal || data.goal || null,
          hasCOA: data.hasCOA || Boolean(data.coaUrl),
          coaUrl: data.coaUrl || null,
          _supplierMap: suppliers,
          minPrice: minPrice === Infinity ? null : minPrice,
          maxPrice, totalStock,
          variants: productVariants,
          // variantsCount from Firestore doc is the authoritative count when
          // variants live in a subcollection (not embedded).
          variantsCount: productVariants.length > 0 ? productVariants.length : (data.variantsCount || 0),
          protocolCount: pCount, prescriptionCount: rxCount, isActive: true
        });
      }
    });

    const groups = Array.from(groupsMap.values()).map(g => {
      const supplierList = Array.from(g._supplierMap.values());
      const supplierIdsList = Array.from(g._supplierMap.keys());
      const out = { 
        ...g, 
        suppliers: supplierList,
        supplierIds: (Array.isArray(g.supplierIds) && g.supplierIds.length > 0) ? g.supplierIds : supplierIdsList,
        supplierCount: Math.max(supplierList.length, supplierIdsList.length, (Array.isArray(g.supplierIds) ? g.supplierIds.length : 0))
      };
      delete out._supplierMap;
      return out;
    });

    let results = groups;

    if (formatParams.length > 0 && !hasPresentationFilter) {
      results = results.filter(p =>
        p.variants.some(v =>
          formatParams.includes(v.presentation) ||
          formatParams.includes(v.formatId) ||
          formatParams.includes(v.format)
        )
      );
    }

    if (availabilityParam === 'in_stock') {
      results = results.filter(p => p.totalStock > 0);
    } else if (availabilityParam === 'out_of_stock') {
      results = results.filter(p => !p.totalStock || p.totalStock <= 0);
    }

    results.sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));

    const goalFacetMap         = new Map(); 
    const categoryFacetMap     = new Map(); 
    const presentationFacetMap = new Map(); 
    const supplierFacetMap     = new Map(); 
    const productTypeFacetMap  = new Map();

    if (hasActiveFilters || !metaFacets) {
      for (const g of results) {
        const pType = g.productType || (g.isApiPlaceholder ? 'api_raw_material' : 'finished_product');
        productTypeFacetMap.set(pType, (productTypeFacetMap.get(pType) || 0) + 1);

        const goalIds = Array.isArray(g.goalIds) ? g.goalIds : [];
        for (const goalId of goalIds) {
          goalFacetMap.set(goalId, (goalFacetMap.get(goalId) || 0) + 1);
        }
        if (g.category) {
          categoryFacetMap.set(g.category, (categoryFacetMap.get(g.category) || 0) + 1);
        }
        const gSuppliers = new Set();
        for (const v of (g.variants || [])) {
          const pres = v.presentation || 'vial';
          if (pres) presentationFacetMap.set(pres, (presentationFacetMap.get(pres) || 0) + 1);
          if (v.supplierId || v.supplier) {
            gSuppliers.add(v.supplierId || v.supplier);
          }
        }
        for (const sid of gSuppliers) {
          supplierFacetMap.set(sid, (supplierFacetMap.get(sid) || 0) + 1);
        }
      }
    } else {
      (metaFacets.goals || []).forEach(f => goalFacetMap.set(f.value, f.count));
      (metaFacets.categories || []).forEach(f => categoryFacetMap.set(f.value, f.count));
      (metaFacets.formats || []).forEach(f => presentationFacetMap.set(f.value, f.count));
      (metaFacets.suppliers || []).forEach(f => supplierFacetMap.set(f.value, f.count));
      if (metaFacets.productTypes) {
        (metaFacets.productTypes || []).forEach(f => productTypeFacetMap.set(f.value, f.count));
      }
    }

    // ── Apply timeframe filter on results if specified ────────────────────
    if (hasTimeframeFilter) {
      const now = new Date();
      const todayDateStr = now.toISOString().split('T')[0];
      const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)).getTime();
      const ms7d = 7 * 24 * 60 * 60 * 1000;
      const ms30d = 30 * 24 * 60 * 60 * 1000;

      results = results.filter(row => {
        const qDateStr = typeof row.supplierPricing?.lastQuotationDate === 'string' ? row.supplierPricing.lastQuotationDate : (row.lastQuotationDate || '');
        const updatedTime = new Date(row.updatedAt || row.createdAt || 0).getTime();
        const createdTime = new Date(row.createdAt || 0).getTime();

        if (timeframeParam === 'today') {
          if (qDateStr === todayDateStr) return true;
          if (updatedTime >= startOfToday) return true;
          if (createdTime >= startOfToday) return true;
          return false;
        } else if (timeframeParam === '7d') {
          return (now.getTime() - updatedTime) <= ms7d || (now.getTime() - createdTime) <= ms7d;
        } else if (timeframeParam === '30d') {
          return (now.getTime() - updatedTime) <= ms30d || (now.getTime() - createdTime) <= ms30d;
        }
        return true;
      });
    }

    // ── Sort results: most recently updated / quoted first ─────────────────
    results.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.supplierPricing?.lastQuotationDate || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.supplierPricing?.lastQuotationDate || b.createdAt || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;
      return (a.canonicalName || '').localeCompare(b.canonicalName || '');
    });

    const ttl = hasActiveFilters ? 15 : 60;
    const payloadItems = results.slice(offsetParam, offsetParam + limitParam);
    const totalGroups = useOptimizedPaging 
      ? (metaFacets?.totals?.activeProducts || metaFacets?.totals?.products || results.length)
      : results.length;
    const hasMore = (offsetParam + limitParam) < totalGroups;

    const payload = {
      items:       payloadItems,
      totalGroups: totalGroups,
      hasMore:     hasMore,
      kpis: {
        totalProducts:    hasActiveFilters || !metaFacets ? kpiTotalCanonical : (metaFacets.totals?.activeProducts || kpiTotalCanonical),
        totalVariants:    hasActiveFilters || !metaFacets ? kpiTotalVariants : (metaFacets.totals?.variants || kpiTotalVariants),
        apisProducts:     kpiApiProducts,
        apisVariants:     kpiApiVariants,
        finishedProducts: kpiFinishedProducts,
        finishedVariants: kpiFinishedVariants,
        activeSuppliers:  hasSupplierFilter ? supplierParams.length : (hasActiveFilters || !metaFacets ? kpiSupplierSet.size : (metaFacets.suppliers?.length || kpiSupplierSet.size)),
        activeCategories: hasActiveFilters || !metaFacets ? kpiCategorySet.size : (metaFacets.categories?.length || kpiCategorySet.size),
        productTypeFacets: Object.fromEntries(productTypeFacetMap),
        formatCounts: hasActiveFilters || !metaFacets ? kpiFormatCounts : (() => {
          const fmts = metaFacets.formats || [];
          const fc = { vial: 0, pen: 0, spray: 0, oral: 0, topical: 0 };
          for (const f of fmts) {
            const id = f.value || '';
            if (id === 'vial' || id === 'kit' || id === 'bundle' || id === 'box') fc.vial += (f.count || 0);
            else if (id === 'pen' || id === 'cartridge') fc.pen += (f.count || 0);
            else if (id === 'nasal_spray' || id === 'sublingual_drops') fc.spray += (f.count || 0);
            else if (id === 'capsule' || id === 'tablet') fc.oral += (f.count || 0);
            else if (id === 'cream' || id === 'bottle') fc.topical += (f.count || 0);
            else fc.vial += (f.count || 0);
          }
          return fc;
        })(),
        categoryList:     hasActiveFilters || !metaFacets ? Array.from(kpiCategorySet).sort() : (metaFacets.categories || []).map(c => c.value).sort(),
        supplierList:     hasActiveFilters || !metaFacets ? Array.from(kpiSupplierNameMap.values()).sort() : (metaFacets.suppliers || []).map(s => s.name).sort(),
        goalFacets:         Object.fromEntries(goalFacetMap),
        categoryFacets:     Object.fromEntries(categoryFacetMap),
        presentationFacets: Object.fromEntries(presentationFacetMap),
        supplierFacets:     Object.fromEntries(supplierFacetMap),
      },
    };

    // Ensure payload is 100% plain serializable JSON (no Firestore Timestamp class instances)
    const cleanPayload = sanitizeForClient(payload);

    // Store into L1 in-memory server cache
    if (catalogSummaryCache.size > 200) {
      const firstKey = catalogSummaryCache.keys().next().value;
      catalogSummaryCache.delete(firstKey);
    }
    catalogSummaryCache.set(cacheKey, { payload: cleanPayload, ttl, timestamp: Date.now() });

    return { payload: cleanPayload, ttl };

  } catch (error) {
    console.error('buildCatalogSummary error:', error);
    throw error;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { payload, ttl } = await buildCatalogSummary(searchParams);
    
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 4}`,
      },
    });
  } catch (error) {
    const isConnectionError = error.message?.includes('Connection') || error.code === 'UNAVAILABLE';
    return NextResponse.json(
      { error: isConnectionError ? 'Database connection failed. Please retry.' : error.message },
      { status: isConnectionError ? 503 : 500 }
    );
  }
}
