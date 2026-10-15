/**
 * prescriptionConsolidator.js
 *
 * Consolidates multi-part prescription documents sharing the same sessionId
 * or patient into a single master prescription record with all parts and items.
 */

export function consolidateMultiPartPrescriptions(rawPrescriptions = []) {
  if (!Array.isArray(rawPrescriptions) || rawPrescriptions.length === 0) return [];

  const consolidatedMap = new Map();
  const result = [];

  rawPrescriptions.forEach((rx) => {
    const rawSessionId = rx.sessionId || rx.groupSessionId;
    const isExplicitGroup = rawSessionId && (String(rawSessionId).startsWith('group_') || String(rawSessionId).length > 5);
    const multiPartKey = isExplicitGroup
      ? `session_${rawSessionId}`
      : (rx.patientName && rx.totalParts && rx.totalParts > 1 && rx.partNumber
          ? `pat_${String(rx.patientName).toLowerCase().trim()}_${rx.totalParts}_${rx.treatmentTitle || ''}`
          : null);

    if (!multiPartKey) {
      result.push(rx);
      return;
    }

    if (!consolidatedMap.has(multiPartKey)) {
      const masterRx = {
        ...rx,
        isMultiPart: true,
        totalParts: rx.totalParts || 1,
        parts: Array.isArray(rx.parts) && rx.parts.length > 0 ? [...rx.parts] : [],
        items: Array.isArray(rx.items) ? [...rx.items] : [],
        allDocIds: [rx.id],
        allCodes: [rx.code || rx.prescriptionNumber || rx.id]
      };
      if (masterRx.parts.length === 0) {
        masterRx.parts.push({
          partNumber: rx.partNumber || 1,
          totalParts: rx.totalParts || 1,
          title: rx.treatmentTitle || rx.regimenShortTitle || `Part ${rx.partNumber || 1}`,
          vehicle: rx.volume || rx.vehicle || '',
          posology: rx.posology || '',
          apis: (rx.items || []).map(i => ({
            name: i.name || i.drugName || '',
            dose: i.dose || i.dosage || ''
          }))
        });
      }
      consolidatedMap.set(multiPartKey, masterRx);
      result.push(masterRx);
    } else {
      const master = consolidatedMap.get(multiPartKey);
      master.allDocIds.push(rx.id);
      const code = rx.code || rx.prescriptionNumber || rx.id;
      if (!master.allCodes.includes(code)) master.allCodes.push(code);
      if (rx.totalParts && rx.totalParts > (master.totalParts || 1)) {
        master.totalParts = rx.totalParts;
      }
      (rx.items || []).forEach(newItem => {
        const alreadyHas = master.items.some(existing =>
          existing.name === newItem.name && existing.dose === newItem.dose
        );
        if (!alreadyHas) {
          master.items.push(newItem);
        }
      });
      const newPartNum = rx.partNumber || (master.parts.length + 1);
      const existingPartIdx = master.parts.findIndex(p => p.partNumber === newPartNum);
      const partObj = {
        partNumber: newPartNum,
        totalParts: master.totalParts,
        title: rx.treatmentTitle || rx.regimenShortTitle || `Part ${newPartNum}`,
        vehicle: rx.volume || rx.vehicle || '',
        posology: rx.posology || '',
        apis: (rx.items || []).map(i => ({
          name: i.name || i.drugName || '',
          dose: i.dose || i.dosage || ''
        }))
      };
      if (existingPartIdx >= 0) {
        master.parts[existingPartIdx] = { ...master.parts[existingPartIdx], ...partObj };
      } else {
        master.parts.push(partObj);
      }
      master.parts.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
    }
  });

  return result;
}
