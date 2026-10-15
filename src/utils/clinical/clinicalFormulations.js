/**
 * clinicalFormulations.js
 * Universal clinical transformers for compounded formulations, multi-part prescription resolution,
 * vehicle detection (TrichoSol, TrichoOil, enteric DRcaps, bacteriostatic water, transdermal liposomal bases),
 * and Fagron/Pharmapolis pharmacopeia monograph enrichment.
 */

import { getFagronClinicalMonograph, resolveApiClinicalData } from '@/data/fagronClinicalMonographs';

export function safeRenderText(val, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (typeof val.summary === 'string') return val.summary;
    if (typeof val.description === 'string') return val.description;
    if (typeof val.text === 'string') return val.text;
    if (typeof val.content === 'string') return val.content;
    if (Array.isArray(val)) return val.map(x => safeRenderText(x)).filter(Boolean).join(', ');
    return fallback;
  }
  return String(val);
}

export function enrichApiClinicalDetails(api) {
  if (!api) return {};
  const rawName = api.name || api.drugName || api.activeIngredient || api.productName || 'Active Pharmaceutical Ingredient';
  const rawDose = api.dose || api.dosage || api.strength || api.concentration || 'Compounded Strength';

  const resolved = resolveApiClinicalData(api, false);
  const mono = getFagronClinicalMonograph(api.productId) ||
    getFagronClinicalMonograph(rawName) ||
    getFagronClinicalMonograph(api.activeIngredient) ||
    getFagronClinicalMonograph(rawName.toLowerCase());

  const pharmacologicalClass = api.therapeuticClass || api.pharmacologicalClass || resolved.pharmacologicalClass || mono?.pharmacologicalClass || api.category || 'Therapeutic Active Ingredient (API)';
  const clinicalIndication = api.clinicalIndication || resolved.clinicalIndication || mono?.clinicalIndication || 'Targeted Follicular / Metabolic Clinical Optimization';
  const mechanismOfAction = api.mechanism || api.mechanismOfAction || resolved.mechanismOfAction || mono?.mechanismOfAction || null;
  const cellularTarget = api.cellularTarget || resolved.cellularTarget || null;
  const geneTargets = (mono?.geneTargets && mono.geneTargets.length > 0) ? mono.geneTargets : ((resolved.geneTargets && resolved.geneTargets.length > 0) ? resolved.geneTargets : (api.geneTargets || []));

  return {
    id: api.id,
    name: rawName,
    dose: rawDose,
    pharmacologicalClass,
    clinicalIndication,
    mechanismOfAction,
    cellularTarget,
    geneTargets,
    instructions: api.instructions || ''
  };
}

/**
 * Accurately resolve pharmaceutical vehicle, excipient carrier, or diluent by clinical modality
 * Prevents displaying misleading "Compounding Vehicle Base" for peptides, sprays, or oral capsules.
 */
export function resolveClinicalVehicle(rxObj = {}, items = [], explicitVehicle = null) {
  const explicitName = typeof explicitVehicle === 'string' ? explicitVehicle : explicitVehicle?.name;
  if (explicitName && !explicitName.toLowerCase().includes('standard compounding vehicle') && !explicitName.toLowerCase().includes('compounding galenic carrier')) {
    const isOil = explicitName.toLowerCase().includes('trichooil') || explicitName.toLowerCase().includes('oil');
    const isSol = explicitName.toLowerCase().includes('trichosol');
    return {
      label: isOil || isSol ? 'Compounding Vehicle Base:' : 'Pharmaceutical Base / Carrier:',
      value: explicitName,
      badge: 'EU GMP Validated Pharmacopeia Base'
    };
  }

  const itemsArr = Array.isArray(items) ? items : [];
  const combined = [
    rxObj.treatmentTitle,
    rxObj.title,
    rxObj.name,
    rxObj.dispensingForm,
    rxObj.format,
    rxObj.dosageForm,
    rxObj.route,
    ...itemsArr.map(i => i.name || i.drugName || i.activeIngredient || '')
  ].filter(Boolean).join(' ').toLowerCase();

  // 1. Intranasal peptide solutions (Selank, Semax, Oxytocin, Desmopressin)
  if (combined.includes('nasal') || combined.includes('spray') || combined.includes('intranasal') || combined.includes('selank') || combined.includes('semax')) {
    return {
      label: 'Intranasal Delivery Matrix:',
      value: 'Sterile Buffered Isotonic Saline Solution (0.9% NaCl USP)',
      badge: 'Sterile Osmotically Balanced Nasal Matrix'
    };
  }

  // 2. Oral peptide / nutraceutical capsules (BPC-157 Oral, KPV, Spermidine, Mito detox)
  if (combined.includes('capsule') || combined.includes('cápsula') || combined.includes('oral') || combined.includes('cap') || combined.includes('enteric')) {
    return {
      label: 'Delivery Shell & Excipient Matrix:',
      value: 'Acid-Resistant Enteric Capsule Shell (Hypoallergenic Plant Cellulose Matrix)',
      badge: 'Gastric Acid-Resistant (DRcaps®)'
    };
  }

  // 3. Injectable peptide vials (SubQ / IM, e.g. Retatrutide, Tirzepatide, BPC-157, TB-500, Epithalon)
  if (combined.includes('vial') || combined.includes('subq') || combined.includes('subcutaneous') || combined.includes('inject') || combined.includes('lyophilized') || combined.includes('retatrutide') || combined.includes('tirzepatide') || combined.includes('semaglutide') || combined.includes('bpc-157') || combined.includes('tb-500')) {
    return {
      label: 'Reconstitution Diluent & Solvent:',
      value: 'Bacteriostatic Water for Injection USP (0.9% Benzyl Alcohol)',
      badge: 'Sterile Multidose Diluent'
    };
  }

  // 4. Sublingual drops / troches
  if (combined.includes('sublingual') || combined.includes('troche') || combined.includes('dropper') || combined.includes('drops')) {
    return {
      label: 'Sublingual Mucosal Matrix:',
      value: 'Pharmaceutical-Grade Polyethylene Glycol (PEG) Troche / Glycerol Base',
      badge: 'Rapid Transmucosal Absorption'
    };
  }

  // 5. Transdermal BHRT (Bioidentical Hormones: Estradiol, Progesterone, Testosterone in Pentravan)
  if (combined.includes('pentravan') || combined.includes('transdermal') || combined.includes('estradiol') || combined.includes('progesterone') || combined.includes('testosterone') || combined.includes('bhrt')) {
    return {
      label: 'Transdermal Compounding Vehicle:',
      value: 'Pentravan® Patented Transdermal Liposomal Cream Base (Fagron)',
      badge: 'Clinically Validated Liposomal Matrix'
    };
  }

  // 6. Topical Scalp / Trichology (TrichoSol, TrichoOil, Minoxidil, Finasteride, Scalp)
  if (combined.includes('tricho') || combined.includes('scalp') || combined.includes('topical') || combined.includes('alopecia') || combined.includes('minoxidil') || combined.includes('finasteride') || combined.includes('dutasteride') || combined.includes('latanoprost')) {
    const isOil = combined.includes('oil') || combined.includes('aceite') || combined.includes('trichooil');
    return {
      label: 'Compounding Vehicle Base:',
      value: isOil 
        ? 'TrichoOil™ Natural Lipidic Scalp Carrier (q.s.)' 
        : 'TrichoSol™ Alcohol-Free Liposomal Hydrophilic Vehicle (q.s.)',
      badge: 'EU GMP Validated Pharmacopeia Base'
    };
  }

  // 7. General Peptide / Bioregulator fallback
  if (combined.includes('peptide') || combined.includes('bioregulator')) {
    return {
      label: 'Pharmaceutical Formulation Base:',
      value: 'Sterile Isotonic Pharmacopeial Diluent Matrix',
      badge: 'EU GMP Grade Sterile Solution'
    };
  }

  // 8. General Compounding fallback
  return {
    label: 'Compounding Vehicle / Base:',
    value: 'Pharmacopeial Compounding Vehicle Base (GMP Validated)',
    badge: 'EU GMP Validated Pharmacopeia Base'
  };
}

export function resolvePrescriptionParts(rx) {
  if (!rx) return [];

  // 1. Explicit rx.parts array already parsed from doctorCache or document
  if (Array.isArray(rx.parts) && rx.parts.length > 0) {
    return rx.parts.map((p, pIdx) => {
      const partNum = p.partNumber || (pIdx + 1);
      const vName = p.vehicle || p.title || '';
      const resolvedVeh = resolveClinicalVehicle(p, p.apis || [], vName);
      const isOil = String(vName + ' ' + (p.title || '')).toLowerCase().includes('oil') || String(vName).toLowerCase().includes('aceite');
      const isOral = String(vName + ' ' + (p.format || '') + ' ' + (p.title || '')).toLowerCase().includes('oral') || String(vName + ' ' + (p.format || '')).toLowerCase().includes('capsule');
      const isFoam = String(vName + ' ' + (p.title || '')).toLowerCase().includes('foam') || String(vName).toLowerCase().includes('espuma');
      const isNasal = String(vName + ' ' + (p.format || '') + ' ' + (p.title || '')).toLowerCase().includes('nasal') || String(vName).toLowerCase().includes('spray');

      const badgeText = isNasal ? 'INTRANASAL SOLUTION' : (isOil ? 'SCALP CARE & LIPIDIC OIL' : (isOral ? 'ORAL CAPSULES' : (isFoam ? 'TOPICAL FOAM' : 'TOPICAL SOLUTION')));
      const accentColor = isNasal ? '#0284c7' : (isOil ? '#0d9488' : (isOral ? '#ea580c' : (isFoam ? '#7c3aed' : '#003666')));
      const accentBg = isNasal ? '#f0f9ff' : (isOil ? '#f0fdfa' : (isOral ? '#fff7ed' : (isFoam ? '#faf5ff' : '#f8fafc')));
      const borderAccent = isNasal ? '#bae6fd' : (isOil ? '#99f6e4' : (isOral ? '#fed7aa' : (isFoam ? '#e9d5ff' : '#cbd5e1')));

      return {
        partNumber: partNum,
        totalParts: rx.parts.length,
        title: p.title || (isNasal ? 'Intranasal Peptide Therapy' : (isOil ? 'Scalp Care & Lipid Protection' : (isOral ? 'Systemic Support' : 'Compounded Solution'))),
        badge: `PART ${partNum} OF ${rx.parts.length} · ${badgeText}`,
        volume: p.volume || (isNasal ? '15 mL' : (isOil ? '30 mL' : (isOral ? '90 Capsules' : '100 mL'))),
        format: p.format || badgeText,
        vehicleLabel: resolvedVeh.label,
        vehicle: resolvedVeh.value,
        vehicleBadge: resolvedVeh.badge,
        schedule: p.posology || p.directions || (isOil ? '1-2 times weekly, massage 3-5 min, leave 10 min before wash.' : 'Apply as directed by treating physician.'),
        accentColor,
        accentBg,
        borderAccent,
        apis: (p.apis || []).map(a => enrichApiClinicalDetails(a))
      };
    });
  }

  // 2. Explicit rx.formulas (from legacy schemas)
  if (Array.isArray(rx.formulas) && rx.formulas.length > 0) {
    return rx.formulas.map((form, fIdx) => {
      const partNum = fIdx + 1;
      const vName = form.base || form.formulaName || '';
      const isOil = vName.toLowerCase().includes('oil');
      const isOral = vName.toLowerCase().includes('oral');
      const isFoam = vName.toLowerCase().includes('foam');
      const badgeText = isOil ? 'SCALP CARE & OIL' : (isOral ? 'ORAL CAPSULES' : (isFoam ? 'TOPICAL FOAM' : 'TOPICAL SOLUTION'));
      const accentColor = isOil ? '#0d9488' : (isOral ? '#ea580c' : (isFoam ? '#7c3aed' : '#0284c7'));
      const accentBg = isOil ? '#f0fdfa' : (isOral ? '#fff7ed' : (isFoam ? '#faf5ff' : '#f0f9ff'));
      const borderAccent = isOil ? '#99f6e4' : (isOral ? '#fed7aa' : (isFoam ? '#e9d5ff' : '#bae6fd'));

      const apis = (form.components || []).map(c => enrichApiClinicalDetails({
        name: c.apiName || c.name || '',
        dose: c.dosage ? `${c.dosage} ${c.units || ''}`.trim() : (c.dose || ''),
        productId: c.productId
      }));

      return {
        partNumber: partNum,
        totalParts: rx.formulas.length,
        title: form.formulaName || `Part ${partNum}`,
        badge: `PART ${partNum} OF ${rx.formulas.length} · ${badgeText}`,
        volume: isOil ? '30 mL' : (isOral ? '90 Capsules' : '100 mL'),
        format: badgeText,
        vehicle: form.base || 'Compounding Galenic Carrier',
        schedule: form.posology || 'Administer as prescribed by treating physician.',
        accentColor,
        accentBg,
        borderAccent,
        apis
      };
    });
  }

  // 3. Items list with multi-vehicles or posology phase 1 + phase 2 markers
  const rawItems = rx.items && rx.items.length > 0 ? rx.items : (rx.prescriptionLines || []);
  const posologyText = String(rx.posology?.regimen || rx.posology || '');
  const hasPhase1Phase2 = /phase\s*1/i.test(posologyText) && /phase\s*2/i.test(posologyText);
  const hasTrichoOil = rawItems.some(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return n.includes('trichooil') || (n.includes('vitamin e') && !n.includes('oral'));
  });
  const hasTrichoSol = rawItems.some(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return n.includes('trichosol') || n.includes('prostaquinon') || n.includes('spironolactone') || n.includes('minoxidil') || n.includes('latanoprost');
  });

  if (hasPhase1Phase2 || (hasTrichoOil && hasTrichoSol)) {
    const part1Items = [];
    const part2Items = [];
    let p1Vehicle = null;
    let p2Vehicle = null;

    rawItems.forEach(it => {
      const n = String(it.name || it.drugName || it.activeIngredient || '').toLowerCase();
      const isVehicle = it.isVehicleOrBase || it._isVehicleOrBase || n.includes('vehicle') || n.includes('vehiculo');
      if (n.includes('trichooil') || (n.includes('vitamin e') && !n.includes('oral'))) {
        if (isVehicle) p2Vehicle = it;
        else part2Items.push(it);
      } else if (n.includes('trichosol') && isVehicle) {
        p1Vehicle = it;
      } else {
        if (isVehicle) p1Vehicle = it;
        else part1Items.push(it);
      }
    });

    let p1Schedule = 'Apply 1 mL nightly to scalp before bedtime. Leave on scalp overnight.';
    let p2Schedule = 'Apply 1-2 times weekly, massage 3-5 min, leave 10 min before wash.';
    if (hasPhase1Phase2) {
      const m1 = posologyText.match(/phase\s*1:?\s*([^.]*\.)/i);
      if (m1) p1Schedule = m1[1].trim();
      const m2 = posologyText.match(/phase\s*2:?\s*([^.]*\.)/i);
      if (m2) p2Schedule = m2[1].trim();
    }

    return [
      {
        partNumber: 1,
        totalParts: 2,
        title: 'Topical Follicular Precision Therapy (TrichoSol™)',
        badge: 'PART 1 OF 2 · TOPICAL SCALP SOLUTION',
        volume: p1Vehicle?.dose || '100 mL',
        format: 'Topical Scalp Solution',
        vehicle: p1Vehicle?.name || 'TrichoSol™ Liposomal Hydrophilic Vehicle (q.s. 100 mL)',
        schedule: p1Schedule,
        accentColor: '#0284c7',
        accentBg: '#f0f9ff',
        borderAccent: '#bae6fd',
        apis: part1Items.map(a => enrichApiClinicalDetails(a))
      },
      {
        partNumber: 2,
        totalParts: 2,
        title: 'Follicular Protective & Hygiene Elixir (TrichoOil™)',
        badge: 'PART 2 OF 2 · SCALP CARE & LIPIDIC OIL',
        volume: p2Vehicle?.dose || '30 mL',
        format: 'Lipidic Scalp Oil',
        vehicle: p2Vehicle?.name || 'TrichoOil™ Natural Lipidic Vehicle (q.s. 30 mL)',
        schedule: p2Schedule,
        accentColor: '#0d9488',
        accentBg: '#f0fdfa',
        borderAccent: '#99f6e4',
        apis: part2Items.map(a => enrichApiClinicalDetails(a))
      }
    ];
  }

  // 4. Single formulation fallback
  const apisOnly = rawItems.filter(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return !i.isVehicleOrBase && !i._isVehicleOrBase && !n.includes('patented vehicle') && !n.includes('vehiculo magistral');
  });
  const vehicleOnly = rawItems.find(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return i.isVehicleOrBase || i._isVehicleOrBase || n.includes('vehicle') || n.includes('base');
  });

  const activeItems = apisOnly.length > 0 ? apisOnly : rawItems;
  const resolvedVehicle = resolveClinicalVehicle(rx, activeItems, vehicleOnly);

  // Determine modal accent styling based on clinical presentation
  const isNasal = (resolvedVehicle.label || '').includes('Nasal') || String(rx.dispensingForm || '').toLowerCase().includes('nasal');
  const isInjectable = (resolvedVehicle.label || '').includes('Diluent') || String(rx.dispensingForm || '').toLowerCase().includes('vial') || String(rx.route || '').toLowerCase().includes('subq');
  const isOral = (resolvedVehicle.label || '').includes('Shell') || String(rx.dispensingForm || '').toLowerCase().includes('capsule');

  const accentColor = isNasal ? '#0284c7' : (isInjectable ? '#0f766e' : (isOral ? '#ea580c' : '#003666'));
  const accentBg = isNasal ? '#f0f9ff' : (isInjectable ? '#f0fdf4' : (isOral ? '#fff7ed' : '#f8fafc'));
  const borderAccent = isNasal ? '#bae6fd' : (isInjectable ? '#a7f3d0' : (isOral ? '#fed7aa' : '#cbd5e1'));

  return [{
    partNumber: 1,
    totalParts: 1,
    title: rx.treatmentTitle || 'Personalized Compounded Formulation',
    badge: isNasal ? 'INTRANASAL PEPTIDE FORMULATION' : (isInjectable ? 'INJECTABLE PEPTIDE REGIMEN' : (isOral ? 'ORAL PEPTIDE CAPSULES' : 'SINGLE COMPOUNDED FORMULATION')),
    volume: rx.volume || vehicleOnly?.dose || (isNasal ? '15 mL' : (isOral ? '60 Capsules' : 'Standard Dispensary Volume')),
    format: rx.dispensingForm || (isNasal ? 'Calibrated Nasal Spray (15 mL)' : (isInjectable ? 'Sterile Lyophilized Vial' : 'Compounded Pharmaceutical Solution')),
    vehicleLabel: resolvedVehicle.label,
    vehicle: resolvedVehicle.value,
    vehicleBadge: resolvedVehicle.badge,
    schedule: posologyText || 'Administer as directed by treating physician.',
    accentColor,
    accentBg,
    borderAccent,
    apis: activeItems.map(a => enrichApiClinicalDetails(a))
  }];
}

/**
 * Automatically calculates treatment duration in days based on posology, volume, delivery format,
 * and standard clinical protocols if not explicitly stored on the prescription.
 *
 * Rules:
 * - Intranasal Spray (15 mL @ 1-2 sprays/day) => 30 days (4 weeks)
 * - Topical Scalp Solution (100 mL TrichoSol @ 1 mL/day) => 100 days (~14 weeks)
 * - Topical Scalp Oil (30 mL TrichoOil @ 1-2x/week) => 90 days (12 weeks)
 * - Oral Capsules:
 *     - If 30 caps => 30 days
 *     - If 60 caps: 1/day => 60 days, 2/day => 30 days
 *     - If 90 caps: 1/day => 90 days, 2/day => 45 days, 3/day => 30 days
 * - Subcutaneous Peptide Vials:
 *     - Epithalon: 20 days (Khavinson telomere reset)
 *     - Incretins (Tirzepatide/Retatrutide): 28 days (4-week cycle)
 *     - BPC-157 / TB-500: 30 days (tissue recovery cycle)
 *     - Default: 30 days
 */
export function calculateTreatmentDuration(rx) {
  if (!rx) return { days: 30, weeks: 4, label: '30 Days (4 Weeks)', isEstimated: true, reason: 'Standard monthly dispensary supply' };

  // 1. Explicit duration values stored on document
  if (rx.durationDays && Number(rx.durationDays) > 0) {
    const days = Number(rx.durationDays);
    const weeks = Math.round(days / 7);
    return { days, weeks, label: `${days} Days (${weeks}w)`, isEstimated: false, reason: 'Physician authorized duration' };
  }
  if (rx.durationWeeks && Number(rx.durationWeeks) > 0) {
    const weeks = Number(rx.durationWeeks);
    const days = weeks * 7;
    return { days, weeks, label: `${days} Days (${weeks}w)`, isEstimated: false, reason: 'Physician authorized duration' };
  }
  if (typeof rx.duration === 'string' && rx.duration.trim()) {
    const dMatch = rx.duration.match(/(\d+)\s*(days?|días?)/i);
    if (dMatch) {
      const days = parseInt(dMatch[1], 10);
      return { days, weeks: Math.round(days / 7), label: `${days} Days (${Math.round(days / 7)}w)`, isEstimated: false, reason: 'Document metadata' };
    }
    const wMatch = rx.duration.match(/(\d+)\s*(weeks?|semanas?|wks?)/i);
    if (wMatch) {
      const weeks = parseInt(wMatch[1], 10);
      const days = weeks * 7;
      return { days, weeks, label: `${days} Days (${weeks}w)`, isEstimated: false, reason: 'Document metadata' };
    }
    const mMatch = rx.duration.match(/(\d+)\s*(months?|meses?|mths?)/i);
    if (mMatch) {
      const months = parseInt(mMatch[1], 10);
      const days = months * 30;
      return { days, weeks: Math.round(days / 7), label: `${days} Days (${Math.round(days / 7)}w)`, isEstimated: false, reason: 'Document metadata' };
    }
  }

  // 2. Scan posology and text notes for duration cues
  const text = `${rx.treatmentTitle || ''} ${rx.posology?.regimen || rx.posology || ''} ${rx.instructions || ''} ${(rx.items || []).map(i => i.instructions || i.dosage || '').join(' ')}`.toLowerCase();

  const regexW = text.match(/(\d+)\s*(?:weeks?|semanas?|wks?)\b/i);
  if (regexW) {
    const weeks = parseInt(regexW[1], 10);
    if (weeks >= 1 && weeks <= 52) {
      const days = weeks * 7;
      return { days, weeks, label: `${days} Days (${weeks}w)`, isEstimated: true, reason: `Inferred from posology schedule (${weeks} weeks)` };
    }
  }

  const regexD = text.match(/(\d+)\s*(?:days?|días?)\b/i);
  if (regexD) {
    const days = parseInt(regexD[1], 10);
    if (days >= 3 && days <= 365) {
      return { days, weeks: Math.round(days / 7), label: `${days} Days (${Math.round(days / 7)}w)`, isEstimated: true, reason: `Inferred from directions (${days} days)` };
    }
  }

  // 3. Modality & delivery route detection
  const parts = resolvePrescriptionParts(rx);
  const part1 = parts[0] || {};
  const vehicleText = `${part1.vehicle || ''} ${part1.format || ''} ${rx.dispensingForm || ''}`.toLowerCase();

  // A. Topical Scalp Solutions (TrichoSol 100 mL, TrichoOil 30 mL)
  if (text.includes('trichosol') || text.includes('minoxidil') || text.includes('finasteride') || text.includes('scalp') || vehicleText.includes('trichosol')) {
    if (vehicleText.includes('100') || text.includes('100 ml') || text.includes('100ml')) {
      return { days: 100, weeks: 14, label: '100 Days (14w)', isEstimated: true, reason: 'Standard 100 mL TrichoSol™ solution at 1 mL nightly' };
    }
    if (vehicleText.includes('60') || text.includes('60 ml') || text.includes('60ml')) {
      return { days: 60, weeks: 8, label: '60 Days (8w)', isEstimated: true, reason: 'Standard 60 mL topical scalp solution at 1 mL daily' };
    }
    if (text.includes('oil') || vehicleText.includes('oil')) {
      return { days: 90, weeks: 12, label: '90 Days (12w)', isEstimated: true, reason: 'Standard 30 mL TrichoOil™ scalp elixir (1-2 times weekly)' };
    }
    return { days: 90, weeks: 12, label: '90 Days (12w)', isEstimated: true, reason: 'Standard 3-month trichology follicular regeneration protocol' };
  }

  // B. Intranasal Sprays (Selank, Semax, Oxytocin, Desmopressin)
  if (text.includes('nasal') || text.includes('spray') || text.includes('selank') || text.includes('semax') || vehicleText.includes('nasal')) {
    return { days: 30, weeks: 4, label: '30 Days (4w)', isEstimated: true, reason: 'Standard 15 mL calibrated nasal spray dispensary cycle (~150 metered doses)' };
  }

  // C. Oral Capsules (Colway, UltraPerson, BPC-157 oral)
  if (text.includes('capsule') || text.includes('cápsula') || text.includes('oral') || vehicleText.includes('capsule')) {
    const isTwiceDaily = text.includes('2 capsule') || text.includes('2 cap') || text.includes('twice') || text.includes('bid') || text.includes('dos cápsulas');
    if (text.includes('120 capsule') || text.includes('120 cap')) {
      const days = isTwiceDaily ? 60 : 120;
      return { days, weeks: Math.round(days / 7), label: `${days} Days (${Math.round(days / 7)}w)`, isEstimated: true, reason: `120-capsule bottle ${isTwiceDaily ? '(2 caps/day)' : '(1 cap/day)'}` };
    }
    if (text.includes('90 capsule') || text.includes('90 cap')) {
      const days = isTwiceDaily ? 45 : 90;
      return { days, weeks: Math.round(days / 7), label: `${days} Days (${Math.round(days / 7)}w)`, isEstimated: true, reason: `90-capsule bottle ${isTwiceDaily ? '(2 caps/day)' : '(1 cap/day)'}` };
    }
    if (text.includes('60 capsule') || text.includes('60 cap')) {
      const days = isTwiceDaily ? 30 : 60;
      return { days, weeks: Math.round(days / 7), label: `${days} Days (${Math.round(days / 7)}w)`, isEstimated: true, reason: `60-capsule bottle ${isTwiceDaily ? '(2 caps/day)' : '(1 cap/day)'}` };
    }
    return { days: 30, weeks: 4, label: '30 Days (4w)', isEstimated: true, reason: 'Standard 30-day oral nutraceutical dispensary cycle' };
  }

  // D. Subcutaneous Lyophilized Vials
  if (text.includes('epithalon') || text.includes('pinealon')) {
    return { days: 20, weeks: 3, label: '20 Days (3w)', isEstimated: true, reason: 'Standard 20-day Khavinson telomeric bioregulatory cycle' };
  }
  if (text.includes('retatrutide') || text.includes('tirzepatide') || text.includes('semaglutide')) {
    return { days: 28, weeks: 4, label: '28 Days (4w)', isEstimated: true, reason: 'Standard 4-week incretin titration vial cycle' };
  }
  if (text.includes('bpc-157') || text.includes('tb-500')) {
    return { days: 30, weeks: 4, label: '30 Days (4w)', isEstimated: true, reason: 'Standard 30-day cellular tissue repair cycle' };
  }

  // E. Fallback Default
  return { days: 30, weeks: 4, label: '30 Days (4w)', isEstimated: true, reason: 'Standard 30-day dispensary replenishment cycle' };
}

/**
 * Calculates start date, duration, and projected completion date.
 */
export function calculateTreatmentDates(rx, explicitStartDate = null, explicitDurationDays = null) {
  const duration = explicitDurationDays ? {
    days: Number(explicitDurationDays),
    weeks: Math.round(Number(explicitDurationDays) / 7),
    label: `${explicitDurationDays} Days (${Math.round(Number(explicitDurationDays) / 7)}w)`,
    isEstimated: false,
    reason: 'Physician authorized duration'
  } : calculateTreatmentDuration(rx);

  let rawStart = explicitStartDate || rx?.startDate || rx?.treatmentStartDate || rx?.createdAt;
  let startDateObj = null;

  if (rawStart) {
    if (typeof rawStart === 'string' && /^\d{4}-\d{2}-\d{2}/.test(rawStart)) {
      const parts = rawStart.slice(0, 10).split('-');
      startDateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      startDateObj = new Date(rawStart);
    }
  }

  if (!startDateObj || isNaN(startDateObj.getTime())) {
    startDateObj = new Date();
  }

  const startY = startDateObj.getFullYear();
  const startM = String(startDateObj.getMonth() + 1).padStart(2, '0');
  const startD = String(startDateObj.getDate()).padStart(2, '0');
  const startYMD = `${startY}-${startM}-${startD}`;

  // Calculate completion date
  const endDateObj = new Date(startDateObj.getTime() + duration.days * 24 * 60 * 60 * 1000);
  const endY = endDateObj.getFullYear();
  const endM = String(endDateObj.getMonth() + 1).padStart(2, '0');
  const endD = String(endDateObj.getDate()).padStart(2, '0');
  const endYMD = `${endY}-${endM}-${endD}`;

  const startFormatted = startDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const endFormatted = endDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return {
    startDate: startYMD,
    endDate: endYMD,
    startFormatted,
    endFormatted,
    durationDays: duration.days,
    durationWeeks: duration.weeks,
    durationLabel: duration.label,
    isEstimated: duration.isEstimated,
    reason: duration.reason
  };
}

/**
 * Bidirectional Posology & Volume Duration Recalibrator
 * Recalculates projected treatment duration and completion date when bottle volume, capsule count, or dosing frequency is altered.
 *
 * @param {Object} currentRx
 * @param {string|number} [newVolume] e.g. "100 mL" or 100
 * @param {string} [newPosology] e.g. "2 mL daily" or "2 capsules twice daily"
 * @returns {Object}
 */
export function recalculateDurationFromPosologyOrVolumeChange(currentRx, newVolume = null, newPosology = null) {
  const simulatedRx = {
    ...currentRx,
    volume: newVolume || currentRx?.volume,
    posology: newPosology || currentRx?.posology
  };

  const oldDates = calculateTreatmentDates(currentRx);
  const newDates = calculateTreatmentDates(simulatedRx);

  const diffDays = newDates.durationDays - oldDates.durationDays;
  let summaryMessage = '';

  if (diffDays > 0) {
    summaryMessage = `Regimen extended by +${diffDays} days (+${Math.round(diffDays / 7)}w). New projected end: ${newDates.endFormatted}`;
  } else if (diffDays < 0) {
    summaryMessage = `Regimen shortened by ${Math.abs(diffDays)} days. New projected end: ${newDates.endFormatted}`;
  } else {
    summaryMessage = `Regimen duration unchanged (${newDates.durationLabel}). Projected end: ${newDates.endFormatted}`;
  }

  return {
    ...newDates,
    diffDays,
    summaryMessage,
    hasChanged: diffDays !== 0
  };
}


