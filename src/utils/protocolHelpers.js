/**
 * Retorna el nombre canónico de un protocolo.
 *
 * NOTA: Después de pasar por normalizeProtocol() (mappers.js), todos los protocolos
 * tienen garantizado el campo `name`. Esta función es un guard defensivo para
 * objetos crudos que aún no hayan pasado por el mapper.
 */
export function getProtocolDisplayName(protocol) {
  if (!protocol) return 'Untitled Protocol';
  // `name` es el campo canónico — el ACL en mappers.js siempre lo define.
  // Los fallbacks legacy son solo para objetos crudos pre-normalizados.
  const rawName =
    protocol.name ||
    protocol.protocol_name ||
    protocol.title ||
    protocol.protocol_title ||
    protocol.displayName ||
    protocol.canonicalName;
  if (!rawName || typeof rawName !== 'string') return 'Untitled Protocol';
  const trimmed = rawName.trim();
  return trimmed || 'Untitled Protocol';
}

export function calculateClinicalCompleteness(protocol) {
  // Tras la normalización, `name` es el único campo canónico.
  const hasName = !!(protocol?.name);
  const hasCategory = !!(protocol?.therapeutic_category || protocol?.category);
  const hasRationale = !!(protocol?.clinical_rationale || protocol?.summary || protocol?.description || protocol?.overview);

  const checks = [
    { id: 'overview', label: 'Overview', done: hasName && (hasCategory || hasRationale) },
    { id: 'treatment', label: 'Treatment', done: !!(protocol?.phases?.length > 0 || protocol?.duration_weeks || protocol?.peptides?.length > 0) },
    { id: 'dosage', label: 'Dosage',    done: !!(protocol?.dosage_schedule?.length > 0 || protocol?.weekly_doses || protocol?.dosing_instructions) },
    { id: 'monitoring', label: 'Monitoring', done: !!(protocol?.monitoring_cadence || protocol?.check_in_weeks || protocol?.monitoring) },
    { id: 'labs', label: 'Labs',      done: !!(protocol?.required_labs?.length > 0 || protocol?.biomarkers?.length > 0 || protocol?.labs) },
    { id: 'progress', label: 'Progress Tracker', done: !!(protocol?.clinical_biomarker_data || protocol?.progress_tracker || protocol?.kpis) },
  ];
  const completed = checks.filter(c => c.done).length;
  const total = checks.length;
  const pct = Math.round((completed / total) * 100);
  const color = pct === 100 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';

  return { checks, completed, total, pct, color };
}
