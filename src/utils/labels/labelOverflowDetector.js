/**
 * labelOverflowDetector.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Estimates whether key pharmaceutical label fields are likely to overflow or
 * wrap excessively inside a given physical label dimension (widthMm x heightMm).
 * Used by the pre-flight checklist in Compounding Label Studio.
 */

export function detectLabelOverflow(labelItem = {}, widthMm = 75, heightMm = 45) {
  const area = Math.max(1, Number(widthMm || 75) * Number(heightMm || 45));
  // Reference baseline: 75x45mm = 3375 mm2
  const scaleFactor = Math.min(1.6, Math.max(0.55, Math.sqrt(area / 3375)));

  const patientLimit = Math.round(34 * scaleFactor);
  const productLimit = Math.round(44 * scaleFactor);
  const compositionLimit = Math.round(145 * scaleFactor);
  const posologyLimit = Math.round(135 * scaleFactor);

  const patientName = String(labelItem.patientName || '').trim();
  const productName = String(labelItem.productName || labelItem.title || labelItem.formulaName || '').trim();
  const composition = String(
    labelItem.composition ||
    labelItem.activesSummary ||
    (Array.isArray(labelItem.actives) ? labelItem.actives.map(a => `${a.name || a} ${a.concentration || ''}`).join(', ') : '') ||
    ''
  ).trim();
  const posology = String(labelItem.posology || labelItem.dosage || labelItem.instructions || '').trim();

  const warnings = [];

  if (patientName.length > patientLimit) {
    warnings.push({
      field: 'patientName',
      labelEs: 'Nombre del paciente',
      labelEn: 'Patient name',
      chars: patientName.length,
      limit: patientLimit,
      severity: patientName.length > patientLimit * 1.25 ? 'high' : 'medium'
    });
  }

  if (productName.length > productLimit) {
    warnings.push({
      field: 'productName',
      labelEs: 'Nombre de fórmula',
      labelEn: 'Formula title',
      chars: productName.length,
      limit: productLimit,
      severity: productName.length > productLimit * 1.25 ? 'high' : 'medium'
    });
  }

  if (composition.length > compositionLimit) {
    warnings.push({
      field: 'composition',
      labelEs: 'Composición / Activos',
      labelEn: 'Composition / Actives',
      chars: composition.length,
      limit: compositionLimit,
      severity: composition.length > compositionLimit * 1.3 ? 'high' : 'medium'
    });
  }

  if (posology.length > posologyLimit) {
    warnings.push({
      field: 'posology',
      labelEs: 'Posología / Uso',
      labelEn: 'Posology / Directions',
      chars: posology.length,
      limit: posologyLimit,
      severity: posology.length > posologyLimit * 1.3 ? 'high' : 'medium'
    });
  }

  const maxRatio = warnings.reduce((acc, w) => Math.max(acc, w.chars / Math.max(1, w.limit)), 1);
  const recommendedScale = warnings.length > 0
    ? Math.max(0.75, Math.min(0.95, Number((1 / Math.sqrt(maxRatio)).toFixed(2))))
    : 1;

  return {
    hasOverflow: warnings.length > 0,
    warnings,
    recommendedScale
  };
}
