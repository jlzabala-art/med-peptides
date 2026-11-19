"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';

/**
 * Extracts numeric mg value from a presentation or strength string (e.g. "10 mg", "5mg Vial").
 * Returns fallback (default 10) when no numeric mg token is present.
 */
export function parseMgFromPresentation(raw, fallback = 10) {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
  const match = String(raw || '').match(/(\d+(?:\.\d+)?)\s*mg/i);
  return match ? parseFloat(match[1]) : fallback;
}

/**
 * Recommended sterile Bacteriostatic Water (BAC) volume (mL) for safe, easy-to-read
 * U-100 syringe draws based on lyophilized vial strength.
 */
export function getRecommendedBacWaterMl(strengthMg = 10) {
  const mg = Number(strengthMg) || 10;
  if (mg <= 2) return 1.0;
  if (mg <= 5) return 2.0;
  if (mg <= 15) return 2.0;
  if (mg <= 30) return 3.0;
  return 3.0;
}

/**
 * Clinical Phase-1 starter dose defaults by compound so patients immediately see a
 * realistic, safe starting dose when switching peptides.
 */
export function getClinicalStarterDose(peptideName = '', strengthMg = 10) {
  const name = String(peptideName || '').toLowerCase();
  const mg = Number(strengthMg) || 10;

  if (name.includes('tirzepatide')) return { value: 2.5, unit: 'mg', presetsMg: [2.5, 5, 7.5, 10, 12.5, 15], presetsMcg: [500, 1000, 2500] };
  if (name.includes('retatrutide')) return { value: mg <= 10 ? 1.0 : 2.0, unit: 'mg', presetsMg: [1, 2, 4, 6, 8, 12], presetsMcg: [500, 1000, 2000] };
  if (name.includes('semaglutide')) return { value: 0.25, unit: 'mg', presetsMg: [0.25, 0.5, 1.0, 1.7, 2.4], presetsMcg: [250, 500, 1000] };
  if (name.includes('tb-500') || name.includes('tb500') || name.includes('tb-4')) return { value: 2.0, unit: 'mg', presetsMg: [1, 2, 2.5, 5], presetsMcg: [500, 1000, 2000] };
  if (name.includes('ghk')) return { value: 1.0, unit: 'mg', presetsMg: [1, 1.5, 2, 3], presetsMcg: [500, 1000, 2000] };
  if (name.includes('nad')) return { value: 25, unit: 'mg', presetsMg: [25, 50, 100], presetsMcg: [1000, 5000] };
  if (name.includes('mots')) return { value: 5, unit: 'mg', presetsMg: [2.5, 5, 10], presetsMcg: [1000, 2500, 5000] };
  if (name.includes('epithalon')) return { value: 1.0, unit: 'mg', presetsMg: [1, 2, 5, 10], presetsMcg: [500, 1000, 2000] };
  if (name.includes('bpc') || name.includes('ipamorelin') || name.includes('cjc') || name.includes('sermorelin') || name.includes('dsip') || name.includes('kpv') || mg <= 2) {
    return { value: 250, unit: 'mcg', presetsMg: [0.25, 0.5, 1.0], presetsMcg: [100, 200, 250, 300, 500] };
  }
  const safeMg = +(Math.max(0.25, Math.min(2.5, mg * 0.1))).toFixed(2);
  return { value: safeMg, unit: 'mg', presetsMg: [0.25, 0.5, 1, 2, 2.5], presetsMcg: [100, 250, 500, 1000] };
}

/**
 * Pure calculation helper shared across all reconstitution UIs and hooks.
 * Single mathematical source of truth across `/calculator`, `/proto/*`, and `/p/*`.
 */
export function computeReconstitutionMetrics({
  vialMg = 10,
  bacWaterMl = 2.0,
  desiredDoseMcg = 2500,
  syringeCapacityMl = 1.0,
  format = 'vial', // 'vial' | 'pen' | 'cartridge' | 'spray' | 'capsule' | 'topical'
  penVolumeMl = 3.0,
  sprayVolumeMl = 10.0,
  sprayPuffs = 1,
}) {
  const isPen = format === 'pen';
  const isCartridge = format === 'cartridge';
  const isSpray = format === 'spray';
  const isCapsule = format === 'capsule';
  const isTopical = format === 'topical';
  const isPenOrCartridge = isPen || isCartridge;
  const isVial = !isPenOrCartridge && !isSpray && !isCapsule && !isTopical;

  const safeMg = Math.max(0.01, Number(vialMg) || 10);
  const effectiveLiquidMl = isPenOrCartridge
    ? Math.max(0.5, Number(penVolumeMl) || 3.0)
    : isSpray
    ? Math.max(1.0, Number(sprayVolumeMl) || 10.0)
    : Math.max(0.05, Number(bacWaterMl) || 2.0);
  const safeDose = Math.max(0.1, Number(desiredDoseMcg) || 250);
  const safeSyringeMl = [0.3, 0.5, 1.0].includes(Number(syringeCapacityMl)) ? Number(syringeCapacityMl) : 1.0;

  const totalMcg = safeMg * 1000;
  const concentrationMgMl = safeMg / effectiveLiquidMl;
  const concentrationMcgMl = totalMcg / effectiveLiquidMl;
  const concentrationMcgUnit = concentrationMcgMl / 100; // 1 U-100 unit or 1 pen click = 0.01 mL
  const unitsToInject = concentrationMcgUnit > 0 ? safeDose / concentrationMcgUnit : 0;
  const volumeMl = unitsToInject * 0.01;
  const totalDoses = safeDose > 0 ? Math.floor(totalMcg / safeDose) : 0;
  const penClicks = Math.max(1, Math.round(unitsToInject));
  const maxSyringeUnits = Math.round(safeSyringeMl * 100);
  const syringeFillPct = maxSyringeUnits > 0 ? Math.min(100, (unitsToInject / maxSyringeUnits) * 100) : 0;
  const exceedsSyringe = isVial && unitsToInject > maxSyringeUnits;
  const exceedsPenSingleDial = isPenOrCartridge && penClicks > 60;

  // Metered nasal spray math (0.1 mL per actuation -> ~100 sprays per 10 mL bottle)
  const sprayTotalPuffs = Math.round(effectiveLiquidMl / 0.1);
  const sprayMcgPerPuff = Math.round(concentrationMcgMl * 0.1);
  const safePuffs = Math.max(1, Math.round(Number(sprayPuffs) || 1));
  const sprayDoseMcg = sprayMcgPerPuff * safePuffs;
  const sprayRemainingDoses = Math.floor(sprayTotalPuffs / safePuffs);

  return {
    format,
    isVial,
    isPen,
    isCartridge,
    isSpray,
    isCapsule,
    isTopical,
    isPenOrCartridge,
    vialMg: safeMg,
    bacWaterMl: effectiveLiquidMl,
    effectiveLiquidMl,
    desiredDoseMcg: safeDose,
    syringeCapacityMl: safeSyringeMl,
    totalMcg,
    concentrationMgMl: parseFloat(concentrationMgMl.toFixed(3)),
    concentrationMcgMl: parseFloat(concentrationMcgMl.toFixed(1)),
    concentrationMcgUnit: parseFloat(concentrationMcgUnit.toFixed(2)),
    unitsToInject: parseFloat(unitsToInject.toFixed(1)),
    volumeMl: parseFloat(volumeMl.toFixed(3)),
    totalDoses,
    penClicks,
    maxSyringeUnits,
    syringeFillPct: parseFloat(syringeFillPct.toFixed(1)),
    exceedsSyringe,
    exceedsPenSingleDial,
    sprayTotalPuffs,
    sprayMcgPerPuff,
    sprayDoseMcg,
    sprayRemainingDoses,
  };
}

/**
 * Bilingual (EN default / ES) patient-friendly step-by-step protocol generator.
 * Guarantees ZERO mention of vials/syringes when format is Pen, Cartridge, Spray, Capsule, or Topical.
 */
export function getFormatProtocolSteps(format = 'vial', {
  lang = 'en',
  unitsToInject = 25,
  penClicks = 15,
  volumeMl = 0.15,
  bacWaterMl = 2.0,
  sprayPuffs = 1,
} = {}) {
  const isEs = lang === 'es';
  const volStr = Number(volumeMl || 0).toFixed(2);
  const unitsStr = Math.round(Number(unitsToInject || 0));

  if (format === 'spray') {
    return [
      {
        step: 1,
        title: isEs ? 'Purga el Pulverizador (Primer Uso)' : 'Prime the Nasal Pump (First Use)',
        desc: isEs
          ? 'Retira la tapa protectora y acciona la bomba 1–2 veces al aire hasta ver una niebla fina y uniforme.'
          : 'Remove the protective cap and press the pump 1–2 times into the air until a fine, even mist appears.',
      },
      {
        step: 2,
        title: isEs ? 'Mantén la Cabeza Recta (No Hacia Atrás)' : 'Keep Head Level (Do Not Tilt Back)',
        desc: isEs
          ? 'Limpia suavemente la nariz antes de aplicar. Mantén la cabeza recta o ligeramente inclinada hacia adelante para que el líquido se absorba en la mucosa nasal.'
          : 'Gently clear your nose first. Keep your head level or tilted slightly forward so the mist absorbs in the nasal mucosa instead of dripping down the throat.',
      },
      {
        step: 3,
        title: isEs ? `Aplica ${sprayPuffs} Pulverización(es) con Inhalación Suave` : `Deliver ${sprayPuffs} Spray(s) with Gentle Breath`,
        desc: isEs
          ? `Introduce la boquilla apuntando ligeramente hacia el borde externo del ojo. Pulsa ${sprayPuffs} vez/veces mientras inhalas suavemente por la nariz (sin aspirar con fuerza).`
          : `Insert nozzle angled slightly toward the outer corner of your eye. Press ${sprayPuffs} time(s) while breathing in gently through your nose (do not snort hard).`,
      },
      {
        step: 4,
        title: isEs ? 'Limpia la Boquilla y Guarda Vertical (2°C–8°C)' : 'Wipe Nozzle & Store Upright (2°C–8°C)',
        desc: isEs
          ? 'Limpia la punta con un pañuelo limpio, coloca la tapa y guarda el frasco en posición vertical en nevera (2°C–8°C).'
          : 'Wipe the nozzle tip with a clean tissue, replace the cap tightly, and store the bottle upright in the fridge (2°C–8°C).',
      },
    ];
  }

  if (format === 'capsule') {
    return [
      {
        step: 1,
        title: isEs ? 'Toma con el Estómago Vacío' : 'Take on an Empty Stomach',
        desc: isEs
          ? 'Para máxima absorción oral, tómala 30 minutos antes del desayuno (o 2 horas después de comer) con un vaso completo de agua natural.'
          : 'For optimal oral absorption, take 30 minutes before breakfast (or 2 hours after a meal) with a full glass of plain water.',
      },
      {
        step: 2,
        title: isEs ? 'Traga Entera (No Masticar ni Abrir)' : 'Swallow Intact (Do Not Crush or Open)',
        desc: isEs
          ? 'Las cápsulas gastrorresistentes protegen el péptido del ácido gástrico. Si usas troche sublingual, déjalo disolver bajo la lengua 5–10 minutos sin tragar.'
          : 'Enteric capsules shield delicate peptides from stomach acid. If using a sublingual troche, allow it to dissolve fully under the tongue for 5–10 minutes.',
      },
      {
        step: 3,
        title: isEs ? 'Mantén el Mismo Horario Diario' : 'Keep a Consistent Daily Time',
        desc: isEs
          ? 'Administra a la misma hora cada día para sostener niveles constantes. Si olvidas una toma, continúa con la siguiente sin duplicar dosis.'
          : 'Take at roughly the same time every day for steady levels. If you miss a dose, resume normally without doubling up.',
      },
      {
        step: 4,
        title: isEs ? 'Conservación Seca (15°C–25°C)' : 'Cool, Dry Storage (15°C–25°C)',
        desc: isEs
          ? 'Guarda el envase bien cerrado en un lugar fresco y seco, protegido de la luz y lejos de la humedad del baño.'
          : 'Keep tightly sealed in a cool, dry cabinet away from direct sunlight and bathroom humidity.',
      },
    ];
  }

  if (format === 'topical') {
    return [
      {
        step: 1,
        title: isEs ? 'Limpia y Seca la Zona de Aplicación' : 'Clean & Dry Application Area',
        desc: isEs
          ? 'Lava la piel o el cuero cabelludo con limpiador suave y seca completamente antes de aplicar la fórmula para maximizar la penetración.'
          : 'Wash the target skin or scalp area gently and pat completely dry before applying to maximize absorption.',
      },
      {
        step: 2,
        title: isEs ? 'Aplica la Cantidad Medida (Sin Exceso)' : 'Apply Measured Amount Evenly',
        desc: isEs
          ? 'Aplica la cantidad exacta indicada (1–2 pulsaciones o 1 mL) y distribuye uniformemente con masaje suave con la yema de los dedos.'
          : 'Dispense the exact measured amount (1–2 pumps or 1 mL) and spread evenly with gentle fingertip massage.',
      },
      {
        step: 3,
        title: isEs ? 'Deja Absorber (No Aclarar Salvo Champú)' : 'Allow Full Absorption',
        desc: isEs
          ? 'Espera 5–10 minutos antes de aplicar otros cosméticos o acostarte. Lávate las manos tras la aplicación.'
          : 'Wait 5–10 minutes before layering other skincare or going to sleep. Wash hands thoroughly after application.',
      },
      {
        step: 4,
        title: isEs ? 'Cierra Bien y Protege de la Luz' : 'Cap Tightly & Protect from Heat/Light',
        desc: isEs
          ? 'Mantén el envase airless o gotero bien cerrado a temperatura fresca (15°C–25°C) o según indicación de la etiqueta.'
          : 'Keep airless dispenser or dropper tightly capped in a cool place (15°C–25°C) or as directed on your pharmacy label.',
      },
    ];
  }

  if (format === 'cartridge') {
    return [
      {
        step: 1,
        highlight: true,
        title: isEs ? 'Fase 1 · Inserta el Cartucho en tu Pluma Reutilizable' : 'Phase 1 · Load Cartridge into Reusable Pen',
        desc: isEs
          ? 'Desenrosca el portacartuchos de tu pluma reutilizable, gira o retrae el émbolo interno hasta cero, introduce el cartucho de vidrio de 3 mL (goma hacia la punta) y enrosca firmemente hasta hacer tope.'
          : 'Unscrew the cartridge holder of your reusable pen, retract the internal plunger rod completely to zero, slide the sterile 3 mL glass cartridge in (rubber septum facing front), and screw the barrel firmly back until locked.',
      },
      {
        step: 2,
        title: isEs ? 'Coloca una Aguja Nueva (31G / 32G)' : 'Attach a Fresh Pen Needle (31G / 32G)',
        desc: isEs
          ? 'Comprueba que el líquido del cartucho esté totalmente transparente, limpia la goma con alcohol y enrosca una aguja estéril nueva (31G/32G × 4–5 mm) para cada uso.'
          : 'Check that the liquid in the cartridge is completely clear, swab the rubber septum with alcohol, and screw on a new sterile ISO pen needle (31G/32G × 4–5 mm).',
      },
      {
        step: 3,
        title: isEs ? 'Purga el Aire (1–2 Clics)' : 'Prime Air Out (1–2 Test Clicks)',
        desc: isEs
          ? 'Marca 1–2 clics de prueba, apunta la aguja hacia arriba y pulsa el botón hasta ver salir una pequeña gota transparente en la punta.'
          : 'Dial 1–2 test clicks, point the needle straight up, and press the button until a tiny clear droplet appears at the tip.',
      },
      {
        step: 4,
        title: isEs ? `Gira hasta ${penClicks} Clics e Inyecta` : `Dial ${penClicks} Clicks & Inject`,
        desc: isEs
          ? `Gira el dial hasta ver ${penClicks} (${volStr} mL). Pellizca suavemente la piel del abdomen, inserta a 90°, pulsa a fondo y cuenta despacio hasta 8 antes de retirar.`
          : `Turn the dial window to ${penClicks} (${volStr} mL). Gently pinch abdominal skin, insert at 90°, press fully, and count slowly to 8 before removing.`,
      },
      {
        step: 5,
        title: isEs ? 'Quita la Aguja y Guarda en Nevera (2°C–8°C)' : 'Remove Needle & Refrigerate (2°C–8°C)',
        desc: isEs
          ? 'Desenrosca y desecha la aguja inmediatamente. Pon el capuchón y guarda la pluma cargada (y cartuchos de reserva) en la nevera entre 2°C y 8°C. Nunca congelar ni guardar con la aguja puesta.'
          : 'Unscrew and safely discard the needle immediately. Replace the cap and refrigerate the loaded pen (and spare cartridges) at 2°C–8°C. Never freeze or store with a needle attached.',
      },
    ];
  }

  if (format === 'pen') {
    return [
      {
        step: 1,
        title: isEs ? 'Coloca una Aguja Nueva (31G / 32G)' : 'Attach a Fresh Pen Needle (31G / 32G)',
        desc: isEs
          ? 'Verifica que el líquido se vea claro a través de la ventana de la pluma, limpia el tapón con alcohol y enrosca una aguja estéril nueva (31G/32G × 4–5 mm).'
          : 'Check that the liquid looks clear through the pen window, swab the rubber septum with alcohol, and screw on a new sterile pen needle (31G/32G × 4–5 mm).',
      },
      {
        step: 2,
        title: isEs ? 'Purga el Aire (1–2 Clics)' : 'Prime Air Out (1–2 Test Clicks)',
        desc: isEs
          ? 'Marca 1–2 clics de prueba, apunta la pluma hacia arriba y pulsa el botón hasta que aparezca una gotita en la punta de la aguja.'
          : 'Dial 1–2 test clicks, hold the pen pointing straight up, and press the button until a tiny clear droplet appears at the needle tip.',
      },
      {
        step: 3,
        title: isEs ? `Gira hasta ${penClicks} Clics e Inyecta` : `Dial ${penClicks} Clicks & Inject`,
        desc: isEs
          ? `Gira el dial hasta marcar ${penClicks} (${volStr} mL). Pellizca suavemente la piel del abdomen, inserta a 90°, pulsa a fondo y cuenta despacio hasta 8 antes de retirar.`
          : `Turn the dial until it reads ${penClicks} (${volStr} mL). Gently pinch abdominal skin, insert at 90°, depress fully, and count slowly to 8 before withdrawing.`,
      },
      {
        step: 4,
        title: isEs ? 'Retira la Aguja y Refrigera (2°C–8°C)' : 'Discard Needle & Refrigerate (2°C–8°C)',
        desc: isEs
          ? 'Desenrosca y tira la aguja usada inmediatamente. Coloca la tapa y guarda la pluma en nevera (2°C–8°C). Nunca congelar ni guardar con aguja puesta.'
          : 'Unscrew and discard the used needle immediately. Replace the cap and refrigerate your pen at 2°C–8°C. Never freeze or store with a needle attached.',
      },
    ];
  }

  // Lyophilized Vial
  return [
    {
      step: 1,
      title: isEs ? 'Limpia el Tapón con Alcohol' : 'Clean Both Rubber Stoppers',
      desc: isEs
        ? 'Retira la tapa plástica del vial de péptido y del agua bacteriostática (BAC). Limpia ambos tapones de goma con toallita de alcohol 70% y deja secar 30 segundos.'
        : 'Pop off the plastic caps on your peptide vial and bacteriostatic (BAC) water. Wipe both rubber stoppers with 70% alcohol and let air-dry for 30 seconds.',
    },
    {
      step: 2,
      title: isEs ? `Añade ${Number(bacWaterMl).toFixed(1)} mL de Agua BAC Despacio` : `Add ${Number(bacWaterMl).toFixed(1)} mL BAC Water Gently`,
      desc: isEs
        ? `Carga ${Number(bacWaterMl).toFixed(1)} mL de agua BAC e inyéctala lentamente deslizando el líquido por la pared de vidrio (45°), sin disparar el chorro directamente sobre el polvo.`
        : `Draw ${Number(bacWaterMl).toFixed(1)} mL of BAC water and inject slowly down the inside glass wall at a 45° angle — never squirt directly onto the powder cake.`,
    },
    {
      step: 3,
      title: isEs ? 'Disuelve Sin Agitar (Girar Suavemente)' : 'Swirl Gently — Never Shake',
      desc: isEs
        ? 'Haz girar el vial suavemente entre las palmas hasta que el líquido quede 100% transparente. No agites nunca el vial para no dañar la estructura del péptido.'
        : 'Roll the vial gently between your palms until 100% clear. Never shake vigorously, as agitation can damage delicate peptide chains.',
    },
    {
      step: 4,
      title: isEs ? `Carga hasta la Marca ${unitsStr} (${volStr} mL) y Refrigera` : `Draw to the ${unitsStr} Mark (${volStr} mL) & Refrigerate`,
      desc: isEs
        ? `Con una jeringa de insulina U-100 nueva, alinea el borde frontal del émbolo negro exactamente en la marca ${unitsStr}. Guarda el vial vertical en nevera (2°C–8°C) hasta 28–30 días.`
        : `With a fresh U-100 insulin syringe, align the top edge of the black plunger exactly with the ${unitsStr} mark. Store the vial upright in the fridge (2°C–8°C) for up to 28–30 days.`,
    },
  ];
}

/**
 * Unified Custom Hook for Peptide Reconstitution, U-100 Syringe Units & Micro-Click Pen/Cartridge Calculations.
 * Single source of truth across `/calculator`, `/proto/*`, `/p/*`, and `ReconstitutionCalculator`.
 */
export function useReconstitution(product = null, variant = null, options = {}) {
  const format = options.format || 'vial';
  const defaultMg = useMemo(() => {
    if (options.initialVialMg != null && Number(options.initialVialMg) > 0) {
      return Number(options.initialVialMg);
    }
    const raw = variant?.dosage || variant?.name || product?.dosage || product?.name || '10mg';
    return parseMgFromPresentation(raw, 10);
  }, [product, variant, options.initialVialMg]);

  const starter = useMemo(
    () => getClinicalStarterDose(product?.name || '', defaultMg),
    [product?.name, defaultMg]
  );

  const recommendedBacWaterMl = useMemo(
    () => getRecommendedBacWaterMl(defaultMg),
    [defaultMg]
  );

  const [vialMg, setVialMg] = useState(defaultMg);
  const [guidedMode, setGuidedMode] = useState(options.initialGuidedMode ?? true);
  const [customBacWaterMl, setCustomBacWaterMl] = useState(options.initialBacWaterMl ?? recommendedBacWaterMl);
  const [doseUnit, setDoseUnit] = useState(options.initialDoseUnit ?? starter.unit);
  const [doseDisplayValue, setDoseDisplayValue] = useState(() => {
    if (options.initialDoseMcg != null) {
      return (options.initialDoseUnit === 'mg' || options.initialDoseMcg >= 1000)
        ? +(options.initialDoseMcg / 1000).toFixed(2)
        : options.initialDoseMcg;
    }
    return starter.value;
  });
  const [syringeCapacityMl, setSyringeCapacityMl] = useState(options.initialSyringeMl ?? 1.0);
  const [sprayPuffs, setSprayPuffs] = useState(options.initialSprayPuffs ?? 1);
  const [sprayVolumeMl, setSprayVolumeMl] = useState(options.initialSprayVolumeMl ?? 10.0);
  const [oralUnitsPerDose, setOralUnitsPerDose] = useState(options.initialOralUnits ?? 1);
  const [topicalDoseLabel, setTopicalDoseLabel] = useState(options.initialTopicalDose ?? '1 mL / 2 pumps');

  // Sync defaults when peptide or strength changes
  useEffect(() => {
    setVialMg(defaultMg);
    setCustomBacWaterMl(getRecommendedBacWaterMl(defaultMg));
  }, [defaultMg]);

  useEffect(() => {
    if (options.autoSyncStarterDose) {
      setDoseUnit(starter.unit);
      setDoseDisplayValue(starter.value);
    }
  }, [starter.unit, starter.value, options.autoSyncStarterDose]);

  const bacWaterMl = guidedMode ? recommendedBacWaterMl : customBacWaterMl;

  const desiredDoseMcg = useMemo(() => {
    const val = Math.max(0.01, Number(doseDisplayValue) || 0.25);
    return doseUnit === 'mg' ? val * 1000 : val;
  }, [doseDisplayValue, doseUnit]);

  const setDesiredDoseMcg = useCallback((mcg) => {
    const num = Math.max(0.1, Number(mcg) || 250);
    if (doseUnit === 'mg') {
      setDoseDisplayValue(+(num / 1000).toFixed(3));
    } else {
      setDoseDisplayValue(num);
    }
  }, [doseUnit]);

  const switchDoseUnit = useCallback((nextUnit) => {
    if (nextUnit === doseUnit) return;
    setDoseUnit(nextUnit);
    setDoseDisplayValue((prev) => {
      const n = Number(prev) || 0;
      if (nextUnit === 'mg') return +(Math.max(0.05, n / 1000)).toFixed(2);
      return Math.round(Math.max(10, n * 1000));
    });
  }, [doseUnit]);

  const calculations = useMemo(
    () =>
      computeReconstitutionMetrics({
        vialMg,
        bacWaterMl,
        desiredDoseMcg,
        syringeCapacityMl,
        format,
        penVolumeMl: options.penVolumeMl ?? 3.0,
        sprayVolumeMl,
        sprayPuffs,
      }),
    [vialMg, bacWaterMl, desiredDoseMcg, syringeCapacityMl, format, options.penVolumeMl, sprayVolumeMl, sprayPuffs]
  );

  const getProtocolSteps = useCallback(
    (lang = 'en') =>
      getFormatProtocolSteps(format, {
        lang,
        unitsToInject: calculations.unitsToInject,
        penClicks: calculations.penClicks,
        volumeMl: calculations.volumeMl,
        bacWaterMl: calculations.effectiveLiquidMl,
        sprayPuffs,
      }),
    [format, calculations.unitsToInject, calculations.penClicks, calculations.volumeMl, calculations.effectiveLiquidMl, sprayPuffs]
  );

  return {
    vialMg,
    setVialMg,
    bacWaterMl,
    setBacWaterMl: (val) => {
      setGuidedMode(false);
      setCustomBacWaterMl(val);
    },
    recommendedBacWaterMl,
    guidedMode,
    setGuidedMode,
    desiredDoseMcg,
    setDesiredDoseMcg,
    doseUnit,
    setDoseUnit: switchDoseUnit,
    doseDisplayValue,
    setDoseDisplayValue,
    dosePresets: doseUnit === 'mg' ? starter.presetsMg : starter.presetsMcg,
    syringeCapacityMl,
    setSyringeCapacityMl,
    sprayPuffs,
    setSprayPuffs,
    sprayVolumeMl,
    setSprayVolumeMl,
    oralUnitsPerDose,
    setOralUnitsPerDose,
    topicalDoseLabel,
    setTopicalDoseLabel,
    getProtocolSteps,
    ...calculations,
  };
}
