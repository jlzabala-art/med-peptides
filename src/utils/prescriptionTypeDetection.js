/**
 * Prescription Presentation & Route Type Detection Engine
 * Atlas Clinical Platform / Regenpept Standard
 * 
 * Centralized, authoritative classifier for formulation device types,
 * dispensing presentations, posology frequency, and storage standards.
 */

export function detectPrescriptionType(rx = {}, formulations = []) {
  const forms = Array.isArray(formulations) ? formulations : [];
  const firstForm = forms[0] || {};

  // Normalize string signals from rx document
  const rxDispensingForm = String(rx?.dispensingForm || '').toLowerCase();
  const rxFormat = String(rx?.format || '').toLowerCase();
  const rxTitle = String(rx?.title || rx?.regimenName || '').toLowerCase();
  const rxRoute = String(rx?.route || '').toLowerCase();

  // Normalize string signals from formulations & vehicle
  const formType = String(firstForm?.type || '').toLowerCase();
  const formTitle = String(firstForm?.title || '').toLowerCase();
  const formRoute = String(firstForm?.route || '').toLowerCase();
  const vehicleName = String(firstForm?.vehicle?.name || '').toLowerCase();
  const dosageForm = String(rx?.pharmacyLabels?.[0]?.dosageForm || firstForm?.dosageForm || '').toLowerCase();
  const container = String(firstForm?.container || '').toLowerCase();

  // Inspect APIs if present
  const apis = firstForm?.apis || rx?.apis || [];
  const hasPenApiSignal = apis.some(a => {
    const n = String(a.name || a.productName || '').toLowerCase();
    const f = String(a.format || a.presentation || '').toLowerCase();
    return (
      (n.includes('retatrutide') || n.includes('tirzepatide') || n.includes('semaglutide') || n.includes('glp-3') || n.includes('glp3') || n.includes('glp-1') || n.includes('glp1') || n.includes('cagrilintide')) &&
      (f.includes('pen') || n.includes('pen') || f.includes('pluma'))
    );
  });

  // 0. Metered Nasal Spray (Intranasal peptide / hormone spray)
  const isNasalSpray = Boolean(
    firstForm?.isNasalSpray ||
    formType === 'nasal_spray' ||
    rxDispensingForm === 'nasal_spray' ||
    /\b(nasal\s*spray|intranasal|in\s+each\s+nostril|nostril)\b/i.test(
      `${rxTitle} ${rxRoute} ${formTitle} ${formRoute} ${dosageForm} ${vehicleName} ${container}`
    ) ||
    forms.some((f) => f.isNasalSpray || f.type === 'nasal_spray')
  );

  // 1. Pre-filled Pen (SubQ Pen, ready-to-inject, no reconstitution; use word-boundary \bpen\b so "dispensing" never matches)
  const hasWordPen = (s) => /\b(pre-?filled\s*pen|subq\s*pen|pluma\s*precargada|pen\s*injector|pen)\b/i.test(String(s || ''));
  const isPen = !isNasalSpray && Boolean(
    firstForm?.isPen ||
    firstForm?.isPrefilledPen ||
    formType === 'prefilled_pen' ||
    rxDispensingForm === 'prefilled_pen' ||
    hasWordPen(rxFormat) ||
    hasWordPen(dosageForm) ||
    hasWordPen(container) ||
    vehicleName.includes('ready-to-use pen') ||
    vehicleName.includes('solución tampón') ||
    vehicleName.includes('sterile buffer') ||
    rxTitle.includes('pre-filled pen') ||
    rxTitle.includes('prefilled pen') ||
    rxTitle.includes('pluma precargada') ||
    formTitle.includes('pre-filled pen') ||
    formTitle.includes('prefilled pen') ||
    formTitle.includes('pluma precargada') ||
    formTitle.includes('subq pen') ||
    hasPenApiSignal ||
    forms.some(f => f.isPen || f.type === 'prefilled_pen' || hasWordPen(f.container))
  );

  // 2. Injectable Vial (Lyophilized vial + diluent requiring reconstitution)
  const isInjectable = !isNasalSpray && !isPen && Boolean(
    firstForm?.isInjectable ||
    rxDispensingForm === 'vial' ||
    rxDispensingForm.includes('inject') ||
    formType === 'injectable_vial' ||
    rxFormat.includes('vial') ||
    rxRoute.includes('subq') ||
    rxRoute.includes('inject') ||
    rxRoute.includes('inyect') ||
    formRoute.includes('subq') ||
    formRoute.includes('inject') ||
    formRoute.includes('inyect') ||
    formTitle.includes('vial') ||
    formTitle.includes('liofilizado') ||
    formTitle.includes('lyophilized') ||
    forms.some(f => f.isInjectable || f.type === 'injectable_vial')
  );

  // 3. Oral (Capsules, tablets, oral drops)
  const isOral = !isNasalSpray && !isPen && !isInjectable && Boolean(
    firstForm?.isOral ||
    rxDispensingForm.includes('capsule') ||
    rxDispensingForm.includes('cápsula') ||
    rxDispensingForm.includes('oral') ||
    rxFormat.includes('capsule') ||
    rxRoute.includes('oral') ||
    formRoute.includes('oral') ||
    formTitle.includes('capsule') ||
    formTitle.includes('cápsula') ||
    formTitle.includes('oral') ||
    vehicleName.includes('capsule') ||
    vehicleName.includes('cápsula') ||
    forms.some(f => f.isOral)
  );

  // 4. Topical (Hair lotions, foams, scalp solutions, tricho-oils)
  const isTopical = !isNasalSpray && !isPen && !isInjectable && !isOral && Boolean(
    firstForm?.isTopical ||
    firstForm?.isTrichoOil ||
    rxDispensingForm.includes('topical') ||
    rxDispensingForm.includes('lotion') ||
    rxRoute.includes('topical') ||
    rxRoute.includes('tópic') ||
    formRoute.includes('topical') ||
    formRoute.includes('tópic') ||
    formTitle.includes('trichosol') ||
    formTitle.includes('trichofoam') ||
    formTitle.includes('lotion') ||
    formTitle.includes('loción') ||
    forms.some(f => f.isTopical || f.isTrichoOil)
  );

  // 5. Transdermal / BHRT (Creams, lipoderm, pentravan)
  const isTransdermal = !isNasalSpray && !isPen && !isInjectable && !isOral && !isTopical && Boolean(
    firstForm?.isBHRT ||
    firstForm?.isTransdermal ||
    rxDispensingForm.includes('transdermal') ||
    rxDispensingForm.includes('cream') ||
    rxRoute.includes('transdermal') ||
    formTitle.includes('bhrt') ||
    formTitle.includes('cream') ||
    formTitle.includes('crema') ||
    vehicleName.includes('lipoderm') ||
    vehicleName.includes('pentravan') ||
    forms.some(f => f.isBHRT)
  );

  // Primary category designation
  let primaryCategory = 'oral';
  if (isNasalSpray) primaryCategory = 'nasal_spray';
  else if (isPen) primaryCategory = 'prefilled_pen';
  else if (isInjectable) primaryCategory = 'injectable_vial';
  else if (isTopical) primaryCategory = 'topical';
  else if (isTransdermal) primaryCategory = 'transdermal';

  return {
    isNasalSpray,
    isPen,
    isInjectable,
    isOral: isOral || (!isNasalSpray && !isPen && !isInjectable && !isTopical && !isTransdermal),
    isTopical,
    isTransdermal,
    primaryCategory,
    requiresReconstitution: isInjectable && !isPen && !isNasalSpray,

    // Formatted GCP Console Ribbon attributes helper
    getAttributes: (isEs = false) => ({
      routeDisplay: isNasalSpray
        ? (isEs ? '💧 Intranasal · Diario' : '💧 Intranasal · Daily')
        : isPen
          ? (isEs ? '💉 SubQ · Semanal' : '💉 SubQ · Weekly')
          : isInjectable
            ? (isEs ? '💉 SubQ · Titulado' : '💉 SubQ · Titrated')
            : isTopical
              ? (isEs ? '💧 Tópica · Nocturna' : '💧 Topical · Nightly')
              : isTransdermal
                ? (isEs ? '⚡ Transdérmica · Diaria' : '⚡ Transdermal · Daily')
                : (isEs ? '💊 Vía Oral · Diario' : '💊 Oral · Daily'),

      deviceDisplay: isNasalSpray
        ? (isEs ? '💧 Spray Nasal Dosificado' : '💧 Metered Nasal Spray')
        : isPen
          ? (isEs ? '🖊️ Pluma Precargada (Multidosis)' : '🖊️ Pre-filled Pen (Multi-dose)')
          : isInjectable
            ? (isEs ? '🧪 Vial Liofilizado + Diluyente' : '🧪 Lyophilized Vial + Diluent')
            : isTopical
              ? (isEs ? '🧴 Solución Tópica' : '🧴 Topical Solution')
              : isTransdermal
                ? (isEs ? '🧴 Dispensador Airless (BHRT)' : '🧴 Airless Dispenser (BHRT)')
                : (isEs ? '💊 Cápsulas Vegetales HPMC' : '💊 HPMC Vegetable Capsules'),

      storageDisplay: (isNasalSpray || isPen || isInjectable)
        ? (isEs ? '❄️ 2°C – 8°C Nevera' : '❄️ 2°C – 8°C Refrigerated')
        : (isEs ? '🏠 15°C – 25°C Ambiente' : '🏠 15°C – 25°C Room Temp'),

      cycleDisplay: rx?.duration
        ? `⏱️ ${rx.duration}`
        : (isEs ? `⏱️ ${rx?.cycleDays || (isNasalSpray ? 30 : 84)} Días de Suministro` : `⏱️ ${rx?.cycleDays || (isNasalSpray ? 30 : 84)} Days Supply`),

      categoryBadge: isNasalSpray
        ? (isEs ? 'SPRAY NASAL DOSIFICADO (INTRANASAL)' : 'METERED INTRANASAL SPRAY')
        : isPen
          ? (isEs ? 'PLUMA PRECARGADA DE PÉPTIDOS (SUBQ PEN)' : 'PRE-FILLED PEPTIDE PEN (SUBQ PEN)')
          : isInjectable
            ? (isEs ? 'PÉPTIDO INYECTABLE (SUBQ)' : 'INJECTABLE PEPTIDE (SUBQ)')
            : isTopical
              ? (isEs ? 'LOCIÓN CAPILAR / TÓPICA' : 'TOPICAL SCALP / DERMAL LOTION')
              : isTransdermal
                ? (isEs ? 'CREMA TRANSDÉRMICA (BHRT)' : 'TRANSDERMAL CREAM (BHRT)')
                : (isEs ? 'SUPLEMENTO / NUTRACÉUTICO ORAL' : 'ORAL SUPPLEMENT / NUTRACEUTICAL')
    })
  };
}

