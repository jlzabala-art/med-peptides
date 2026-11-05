/**
 * createOrderPrefetchSlice.js
 * 
 * Atomic slice for background Firestore prefetching of patient prescription history.
 * Normalizes multi-part/Fagron formulations into refillable items and computes refill cycle intelligence.
 */

export function normalizeRxRefillItems(rx) {
  if (!rx) return [];
  if (Array.isArray(rx.items) && rx.items.length > 0) {
    return rx.items.map((it, idx) => ({
      ...it,
      id: it.id || it.productId || `rx_item_${rx.id}_${idx}`,
      productId: it.productId || it.id || `rx_prod_${rx.id}_${idx}`,
      name: it.productName || it.name || it.drugName || it.title || `Formula ${idx + 1}`,
      productName: it.productName || it.name || it.drugName || it.title || `Formula ${idx + 1}`,
      dosage: it.dosage || it.dose || it.concentration || it.volume || '',
      format: it.format || it.dispensingForm || it.vehicle || '',
      posology: typeof it.posology === 'string' ? it.posology : (it.instructions || it.posology?.regimen || ''),
      price: Number(it.price || it.unitPrice || it.rate || 145),
      quantity: Number(it.quantity || 1),
    }));
  }

  if (Array.isArray(rx.formulations) && rx.formulations.length > 0) {
    return rx.formulations.map((f, idx) => {
      const ingList = Array.isArray(f.ingredients) ? f.ingredients : [];
      const activeIngs = ingList.filter((i) => !i.isVehicle);
      const ingSummary = (activeIngs.length ? activeIngs : ingList)
        .map((i) => `${i.name}${i.dose ? ' ' + i.dose : ''}`)
        .join(' + ');
      const label = `Formula ${idx + 1} (${f.treatmentType || f.dispensingForm || 'Compounded'}): ${ingSummary || f.treatmentProgram || 'Custom Formula'}${f.vehicle ? ' in ' + f.vehicle : ''}`;
      return {
        id: `item-${rx.id || 'rx'}-f${idx + 1}`,
        productId: `compounded-${(f.treatmentType || 'formula').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${idx + 1}`,
        name: label,
        productName: label,
        treatmentType: f.treatmentType || '',
        treatmentProgram: f.treatmentProgram || '',
        activeIngredient: ingSummary,
        dosage: f.volume || '',
        dose: f.posology || f.volume || '',
        format: f.dispensingForm || f.vehicle || 'Compounded',
        dispensingForm: f.dispensingForm || '',
        volume: f.volume || '',
        vehicle: f.vehicle || '',
        posology: typeof f.posology === 'string' ? f.posology : '',
        instructions: typeof f.posology === 'string' ? f.posology : '',
        quantity: 1,
        price: Number(f.price || 145),
        unitPrice: Number(f.price || 145),
        category: rx.regimenCategoryShort || 'Compounded Formulation',
        ingredients: ingList,
      };
    });
  }

  if (Array.isArray(rx.formulationBlocks) && rx.formulationBlocks.length > 0) {
    return rx.formulationBlocks.map((b, idx) => {
      const blockItems = Array.isArray(b.items) ? b.items : [];
      const ingSummary = blockItems
        .filter((i) => !i.isVehicleOrBase)
        .map((i) => `${i.productName || i.name || i.activeIngredient}${i.dosage || i.dose ? ' ' + (i.dosage || i.dose) : ''}`)
        .join(' + ');
      const label = `Formula ${idx + 1} (${b.title || b.treatmentType || 'Compounded'}): ${ingSummary || b.treatmentProgram || 'Custom Formula'}`;
      return {
        id: `block-${rx.id || 'rx'}-b${idx + 1}`,
        productId: `compounded-block-${idx + 1}`,
        name: label,
        productName: label,
        treatmentType: b.treatmentType || b.title || '',
        activeIngredient: ingSummary,
        dosage: b.volume || '',
        format: b.dispensingForm || '',
        posology: typeof b.posology === 'string' ? b.posology : (b.instructions || ''),
        instructions: typeof b.posology === 'string' ? b.posology : (b.instructions || ''),
        quantity: 1,
        price: Number(b.price || 145),
      };
    });
  }

  const fallbackArr = rx.compounds || rx.prescriptionLines || rx.products || [];
  if (Array.isArray(fallbackArr) && fallbackArr.length > 0) {
    return fallbackArr.map((it, idx) => ({
      ...it,
      id: it.id || it.productId || `rx_comp_${rx.id}_${idx}`,
      productId: it.productId || it.id || `rx_comp_prod_${rx.id}_${idx}`,
      name: it.productName || it.name || it.drugName || `Compound ${idx + 1}`,
      productName: it.productName || it.name || it.drugName || `Compound ${idx + 1}`,
      dosage: it.dosage || it.dose || '',
      format: it.format || it.dispensingForm || '',
      posology: typeof it.posology === 'string' ? it.posology : (it.instructions || ''),
      price: Number(it.price || it.unitPrice || 145),
      quantity: Number(it.quantity || 1),
    }));
  }

  return [];
}

function parseRxTimestampMs(rx) {
  const candidates = [rx?.dateIssued, rx?.resultsDate, rx?.createdAt, rx?.date, rx?.prescriptionDate];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c.toDate === 'function') return c.toDate().getTime();
    if (c._seconds || c.seconds) return (c._seconds || c.seconds) * 1000;
    if (typeof c === 'number') return c;
    if (typeof c === 'string') {
      const dmy = c.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (dmy) {
        const parsed = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])).getTime();
        if (!isNaN(parsed)) return parsed;
      }
      const parsed = Date.parse(c);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

export function computeRxRefillIntelligence(rx) {
  const issuedMs = parseRxTimestampMs(rx);
  const cycleDays = Number(
    rx?.durationDays ||
    rx?.refillCycleDays ||
    (String(rx?.duration || '').includes('90') ||
     String(rx?.duration || '').toLowerCase().includes('3 month') ||
     rx?.sourceType === 'fagron_genomics' ||
     rx?.clinicalType?.includes('trichotest')
      ? 90
      : 30)
  );

  if (!issuedMs) {
    return {
      issuedDateStr: null,
      cycleDays,
      daysElapsed: null,
      daysRemaining: null,
      status: 'unknown',
      badgeLabel: `${cycleDays}-Day Regimen`,
      detailText: 'Previous prescription available for selective refill',
    };
  }

  const nowMs = Date.now();
  const daysElapsed = Math.max(0, Math.floor((nowMs - issuedMs) / (1000 * 60 * 60 * 24)));
  const daysRemaining = cycleDays - daysElapsed;
  const issuedDateStr = new Date(issuedMs).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const dueDateStr = new Date(issuedMs + cycleDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (daysElapsed >= cycleDays) {
    const overdueDays = daysElapsed - cycleDays;
    return {
      issuedDateStr,
      dueDateStr,
      cycleDays,
      daysElapsed,
      daysRemaining: 0,
      overdueDays,
      status: 'overdue',
      badgeLabel: `Refill Due · ${cycleDays}d Cycle Completed`,
      detailText: `Issued ${issuedDateStr} · ${cycleDays}-day supply completed (${overdueDays}d past due date ${dueDateStr})`,
    };
  }

  if (daysRemaining <= 14) {
    return {
      issuedDateStr,
      dueDateStr,
      cycleDays,
      daysElapsed,
      daysRemaining,
      status: 'due_soon',
      badgeLabel: `Refill Window Open · ${daysRemaining}d left`,
      detailText: `Issued ${issuedDateStr} · Day ${daysElapsed} of ${cycleDays} (Due ${dueDateStr})`,
    };
  }

  return {
    issuedDateStr,
    dueDateStr,
    cycleDays,
    daysElapsed,
    daysRemaining,
    status: 'active',
    badgeLabel: `Active Cycle · Day ${Math.max(1, daysElapsed)} of ${cycleDays}`,
    detailText: `Issued ${issuedDateStr} · ${daysRemaining} days remaining in current cycle`,
  };
}

export const createOrderPrefetchSlice = (set, get) => ({
  patientHistoryCache: {},

  prefetchPatientHistory: async (patientId, patientName = null) => {
    if (!patientId && !patientName) return;
    const cacheKey = patientId || patientName;

    const { patientHistoryCache } = get();
    const cached = patientHistoryCache[cacheKey];
    const TTL_MS = 5 * 60 * 1000; // 5 minutes

    // Skip if recently fetched and non-empty
    if (cached && !cached.loading && cached.prescriptions?.length > 0 && Date.now() - cached.lastFetched < TTL_MS) {
      return;
    }

    // Mark as loading
    set((state) => ({
      patientHistoryCache: {
        ...state.patientHistoryCache,
        [cacheKey]: { prescriptions: cached?.prescriptions || [], loading: true, lastFetched: 0 },
      },
    }));

    try {
      const { collection, query, where, limit, getDocs } = await import('firebase/firestore');
      const { db } = await import('../../firebase');

      const docsMap = new Map();

      if (patientId) {
        try {
          const qById = query(
            collection(db, 'prescriptions'),
            where('patientId', '==', patientId),
            limit(15)
          );
          const snapById = await getDocs(qById);
          snapById.docs.forEach((d) => docsMap.set(d.id, { id: d.id, ...d.data() }));
        } catch (e) {
          console.warn('[orderBuilderStore] Query by patientId failed:', e);
        }
      }

      if (docsMap.size === 0 && patientName) {
        try {
          const qByName = query(
            collection(db, 'prescriptions'),
            where('patientName', '==', patientName),
            limit(15)
          );
          const snapByName = await getDocs(qByName);
          snapByName.docs.forEach((d) => docsMap.set(d.id, { id: d.id, ...d.data() }));
        } catch (e) {
          console.warn('[orderBuilderStore] Query by patientName failed:', e);
        }
      }

      const prescriptions = Array.from(docsMap.values())
        .map((rx) => {
          const normalizedItems = normalizeRxRefillItems(rx);
          const refillIntel = computeRxRefillIntelligence(rx);
          return {
            ...rx,
            items: normalizedItems,
            _refillIntel: refillIntel,
          };
        })
        .sort((a, b) => parseRxTimestampMs(b) - parseRxTimestampMs(a))
        .slice(0, 10);

      set((state) => ({
        patientHistoryCache: {
          ...state.patientHistoryCache,
          [cacheKey]: { prescriptions, loading: false, lastFetched: Date.now() },
        },
      }));
    } catch (err) {
      console.warn('[orderBuilderStore] Failed to prefetch patient history:', err);
      set((state) => ({
        patientHistoryCache: {
          ...state.patientHistoryCache,
          [cacheKey]: { prescriptions: [], loading: false, lastFetched: Date.now() },
        },
      }));
    }
  },
});
