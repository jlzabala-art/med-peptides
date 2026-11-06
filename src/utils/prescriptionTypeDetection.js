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

  // 1. Pre-filled Pen (SubQ Pen, ready-to-inject, no reconstitution)
  const isPen = Boolean(
    firstForm?.isPen ||
    firstForm?.isPrefilledPen ||
    formType === 'prefilled_pen' ||
    rxDispensingForm === 'prefilled_pen' ||
    rxFormat.includes('pen') ||
    dosageForm.includes('pen') ||
    container.includes('pen') ||
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
    forms.some(f => f.isPen || f.type === 'prefilled_pen' || String(f.container || '').toLowerCase().includes('pen'))
  );

  // 2. Injectable Vial (Lyophilized vial + diluent requiring reconstitution)
  const isInjectable = !isPen && Boolean(
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
  const isOral = !isPen && !isInjectable && Boolean(
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
  const isTopical = !isPen && !isInjectable && !isOral && Boolean(
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
  const isTransdermal = !isPen && !isInjectable && !isOral && !isTopical && Boolean(
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
  if (isPen) primaryCategory = 'prefilled_pen';
  else if (isInjectable) primaryCategory = 'injectable_vial';
  else if (isTopical) primaryCategory = 'topical';
  else if (isTransdermal) primaryCategory = 'transdermal';

  return {
    isPen,
    isInjectable,
    isOral: isOral || (!isPen && !isInjectable && !isTopical && !isTransdermal),
    isTopical,
    isTransdermal,
    primaryCategory,
    requiresReconstitution: isInjectable && !isPen,

    // Formatted GCP Console Ribbon attributes helper
    getAttributes: (isEs = false) => ({
      routeDisplay: isPen
        ? (isEs ? '💉 SubQ · Semanal' : '💉 SubQ · Weekly')
        : isInjectable
          ? (isEs ? '💉 SubQ · Titulado' : '💉 SubQ · Titrated')
          : isTopical
            ? (isEs ? '💧 Tópica · Nocturna' : '💧 Topical · Nightly')
            : isTransdermal
              ? (isEs ? '⚡ Transdérmica · Diaria' : '⚡ Transdermal · Daily')
              : (isEs ? '💊 Vía Oral · Diario' : '💊 Oral · Daily'),

      deviceDisplay: isPen
        ? (isEs ? '🖊️ Pluma Precargada (Multidosis)' : '🖊️ Pre-filled Pen (Multi-dose)')
        : isInjectable
          ? (isEs ? '🧪 Vial Liofilizado + Diluyente' : '🧪 Lyophilized Vial + Diluent')
          : isTopical
            ? (isEs ? '🧴 Solución Tópica' : '🧴 Topical Solution')
            : isTransdermal
              ? (isEs ? '🧴 Dispensador Airless (BHRT)' : '🧴 Airless Dispenser (BHRT)')
              : (isEs ? '💊 Cápsulas Vegetales HPMC' : '💊 HPMC Vegetable Capsules'),

      storageDisplay: (isPen || isInjectable)
        ? (isEs ? '❄️ 2°C – 8°C Nevera' : '❄️ 2°C – 8°C Refrigerated')
        : (isEs ? '🏠 15°C – 25°C Ambiente' : '🏠 15°C – 25°C Room Temp'),

      cycleDisplay: rx?.duration
        ? `⏱️ ${rx.duration}`
        : (isEs ? `⏱️ ${rx?.cycleDays || 84} Días de Suministro` : `⏱️ ${rx?.cycleDays || 84} Days Supply`),

      categoryBadge: isPen
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

