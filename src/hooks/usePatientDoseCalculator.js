import { useMemo } from 'react';

function parseMgAndMl(text = '') {
  const s = String(text || '');
  const mgMatch = s.match(/(\d+(?:[.,]\d+)?)\s*mg\b/i);
  const mlMatch = s.match(/(\d+(?:[.,]\d+)?)\s*m[lL]\b/);
  const mcgMatch = s.match(/(\d+(?:[.,]\d+)?)\s*(?:mcg|µg)\b/i);
  return {
    mg: mgMatch ? parseFloat(mgMatch[1].replace(',', '.')) : null,
    ml: mlMatch ? parseFloat(mlMatch[1].replace(',', '.')) : null,
    mcg: mcgMatch ? parseFloat(mcgMatch[1].replace(',', '.')) : null,
  };
}

/**
 * Computes a locked, read-only dose breakdown for any prescription item
 * that benefits from a dosing calculation (vial, prefilled pen, nasal spray, or transdermal pump).
 */
export function computePatientDoseBreakdown(item = {}, rx = {}, isEs = false) {
  const hay = `${rx?.dispensingForm || ''} ${item?.title || ''} ${rx?.treatmentTitle || ''} ${item?.vehicle?.name || ''}`.toLowerCase();
  const regimenText = `${item?.posology?.dosageInstructions || ''} ${item?.posology?.regimen || ''}`;
  const isNasal = hay.includes('nasal');
  const isPen = item?.category?.type === 'prefilled_pen' || item?.category?.type === 'peptide_pen';
  const isVial = Boolean(item?.category?.requiresReconstitution || item?.category?.type === 'peptide');
  const isPump = !isNasal && !isPen && !isVial && Boolean(
    item?.category?.isTransdermal || /\b(topiclick|pentravan|pump|cream|crema|gel)\b/i.test(`${hay} ${regimenText}`)
  );

  if (!isNasal && !isPen && !isVial && !isPump) {
    return { needsCalculator: false, mode: 'none' };
  }

  const firstApi = Array.isArray(item?.apis) && item.apis.length > 0 ? item.apis[0] : null;
  const strengthText = `${firstApi?.dosage || ''} ${item?.title || ''} ${item?.volume || ''}`;
  const { mg: parsedMg, ml: parsedMl } = parseMgAndMl(strengthText);

  if (isVial) {
    const vialMg = Number(item?.estimatedVialMg || parsedMg || 5);
    const diluentMl = Number(item?.diluentVolumeMl || 2.0);
    const doseMcg = Number(item?.estimatedDoseMcg || 250);
    const concMcgPerMl = (vialMg * 1000) / diluentMl;
    const mcgPerUnit = concMcgPerMl / 100;
    const unitsToInject = mcgPerUnit > 0 ? Math.round((doseMcg / mcgPerUnit) * 10) / 10 : 10;
    const volumeMl = Math.round((doseMcg / concMcgPerMl) * 100) / 100;
    const totalDoses = doseMcg > 0 ? Math.floor((vialMg * 1000) / doseMcg) : 20;

    return {
      needsCalculator: true,
      mode: 'vial',
      requiresMixingSteps: true,
      vialDoseMg: vialMg,
      diluentVolumeMl: diluentMl,
      prescribedDoseMcg: doseMcg,
      unitsToInject,
      volumeMl,
      totalDoses,
      cards: [
        {
          label: isEs ? 'Vial prescrito' : 'Prescribed vial',
          value: `${vialMg} mg`,
          sub: isEs ? 'Contenido fijo' : 'Fixed strength',
        },
        {
          label: isEs ? 'Diluyente estéril' : 'Sterile diluent',
          value: `${diluentMl.toFixed(1)} mL`,
          sub: isEs ? 'Volumen de mezcla' : 'Mixing volume',
        },
        {
          label: isEs ? 'Marca jeringa U-100' : 'Exact U-100 mark',
          value: `${unitsToInject} ${isEs ? 'uds' : 'units'}`,
          sub: `${volumeMl} mL · ~${totalDoses} ${isEs ? 'dosis/vial' : 'doses/vial'}`,
          highlight: true,
        },
      ],
      fillPct: Math.min(100, Math.max(5, Math.round(unitsToInject))),
      scaleLabel: isEs ? `Escala U-100 (0–100 unidades)` : `U-100 Syringe Scale (0–100 units)`,
    };
  }

  if (isPen) {
    const totalMg = parsedMg || 600;
    const totalMl = parsedMl || 3;
    const clicksMatch = regimenText.match(/(\d+(?:[.,]\d+)?)\s*(?:clicks?|clics?)/i);
    const { ml: doseMlParsed, mg: doseMgParsed } = parseMgAndMl(regimenText);

    const clicks = clicksMatch
      ? parseFloat(clicksMatch[1].replace(',', '.'))
      : doseMlParsed
      ? Math.round(doseMlParsed * 100)
      : 10;
    const volumeMl = Math.round((clicks / 100) * 100) / 100;
    const doseMg = doseMgParsed || Math.round(((totalMg / totalMl) * volumeMl) * 10) / 10;
    const totalDoses = volumeMl > 0 ? Math.floor(totalMl / volumeMl) : 20;

    return {
      needsCalculator: true,
      mode: 'pen',
      requiresMixingSteps: false,
      cards: [
        {
          label: isEs ? 'Pluma prescrita' : 'Prescribed pen',
          value: `${totalMg} mg / ${totalMl} mL`,
          sub: isEs ? 'Lista para usar' : 'Ready-to-use',
        },
        {
          label: isEs ? 'Ajuste exacto del dial' : 'Exact dial setting',
          value: `${clicks} ${isEs ? 'clics' : 'clicks'}`,
          sub: `${volumeMl} mL (${doseMg} mg)`,
          highlight: true,
        },
        {
          label: isEs ? 'Dosis por pluma' : 'Doses per pen',
          value: `~${totalDoses} ${isEs ? 'dosis' : 'doses'}`,
          sub: isEs ? 'Aguja nueva cada vez' : 'Fresh needle per dose',
        },
      ],
      fillPct: Math.min(100, Math.max(8, Math.round((clicks / 60) * 100))),
      scaleLabel: isEs ? `Dial de pluma (${clicks} clics por toma)` : `Pen Dial (${clicks} clicks per dose)`,
    };
  }

  if (isNasal) {
    const totalMg = parsedMg || 75;
    const totalMl = parsedMl || 10;
    const sprayMatch = regimenText.match(/(\d+)\s*(?:spray|sprays|pulverizaci[oó]n|pulsaci[oó]n)/i);
    const perNostril = /each\s*nostril|cada\s*fosa/i.test(regimenText);
    const baseSprays = sprayMatch ? Number(sprayMatch[1]) : 1;
    const spraysPerDose = perNostril ? baseSprays * 2 : baseSprays;
    const mlPerDose = Math.round(spraysPerDose * 0.1 * 100) / 100;
    const mgPerDose = Math.round(((totalMg / totalMl) * mlPerDose) * 100) / 100;
    const totalDoses = mlPerDose > 0 ? Math.floor(totalMl / mlPerDose) : 50;

    return {
      needsCalculator: true,
      mode: 'nasal',
      requiresMixingSteps: false,
      cards: [
        {
          label: isEs ? 'Frasco dosificador' : 'Metered bottle',
          value: `${totalMg} mg / ${totalMl} mL`,
          sub: isEs ? '0.10 mL por pulsación' : '0.10 mL per spray',
        },
        {
          label: isEs ? 'Dosis exacta' : 'Exact dose',
          value: `${spraysPerDose} ${spraysPerDose === 1 ? 'spray' : 'sprays'}`,
          sub: `${mlPerDose} mL (${mgPerDose} mg)`,
          highlight: true,
        },
        {
          label: isEs ? 'Tomas por frasco' : 'Doses per bottle',
          value: `~${totalDoses} ${isEs ? 'tomas' : 'doses'}`,
          sub: isEs ? 'Conservar 2°C–8°C' : 'Store at 2°C–8°C',
        },
      ],
      fillPct: null,
      scaleLabel: null,
    };
  }

  // Transdermal / Topiclick Pump
  const pumpsMatch = regimenText.match(/(\d+(?:[.,]\d+)?)\s*(?:pumps?|clicks?|clics?)/i);
  const { ml: pumpMlParsed } = parseMgAndMl(regimenText);
  const unitsCount = pumpsMatch ? parseFloat(pumpsMatch[1].replace(',', '.')) : (pumpMlParsed || 1);
  const mlPerDose = pumpMlParsed || Math.round(unitsCount * 0.25 * 100) / 100;
  const totalMl = parsedMl || 30;
  const totalDoses = mlPerDose > 0 ? Math.floor(totalMl / mlPerDose) : 30;

  return {
    needsCalculator: true,
    mode: 'pump',
    requiresMixingSteps: false,
    cards: [
      {
        label: isEs ? 'Envase dosificador' : 'Dispenser volume',
        value: `${totalMl} mL`,
        sub: isEs ? 'Uso transdérmico' : 'Transdermal dispenser',
      },
      {
        label: isEs ? 'Cantidad exacta' : 'Exact application',
        value: pumpsMatch ? `${unitsCount} ${/click|clic/i.test(pumpsMatch[0]) ? (isEs ? 'clics' : 'clicks') : 'pumps'}` : `${mlPerDose} mL`,
        sub: `${mlPerDose} mL ${isEs ? 'por toma' : 'per dose'}`,
        highlight: true,
      },
      {
        label: isEs ? 'Duración estimada' : 'Estimated doses',
        value: `~${totalDoses} ${isEs ? 'tomas' : 'doses'}`,
        sub: isEs ? 'Lavar manos tras aplicar' : 'Wash hands after applying',
      },
    ],
    fillPct: null,
    scaleLabel: null,
  };
}

export function usePatientDoseCalculator(item, rx, isEs = false) {
  return useMemo(
    () => computePatientDoseBreakdown(item, rx, isEs),
    [item, rx, isEs]
  );
}
