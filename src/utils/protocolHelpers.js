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
  const hasRationale = !!(protocol?.clinical_rationale || protocol?.summary || protocol?.description || protocol?.overview || protocol?.overview_summary);

  const checks = [
    { id: 'overview', label: 'Overview', done: hasName && (hasCategory || hasRationale) },
    { id: 'treatment', label: 'Treatment', done: !!(protocol?.phases?.length > 0 || protocol?.duration_weeks || protocol?.durationWeeks || protocol?.peptides?.length > 0 || protocol?.items?.length > 0) },
    { id: 'dosage', label: 'Dosage',    done: !!(protocol?.dosage_schedule?.length > 0 || protocol?.weekly_doses || protocol?.dosing_instructions || (Array.isArray(protocol?.phases) && protocol.phases.some(p => (p.compounds && p.compounds.length > 0) || (p.drugs && p.drugs.length > 0)))) },
    { id: 'monitoring', label: 'Monitoring', done: !!(protocol?.monitoring_cadence || protocol?.check_in_weeks || protocol?.monitoring || protocol?.safetyGuidelines) },
    { id: 'labs', label: 'Labs',      done: !!(protocol?.required_labs?.length > 0 || protocol?.biomarkers?.length > 0 || protocol?.labs) },
    { id: 'progress', label: 'Progress Tracker', done: !!(protocol?.clinical_biomarker_data || protocol?.progress_tracker || protocol?.kpis || protocol?.expected_outcomes) },
  ];
  const completed = checks.filter(c => c.done).length;
  const total = checks.length;
  const pct = Math.round((completed / total) * 100);

  // Evaluate 3-month (>90 days) freshness rule
  const lastUpdateRaw = protocol?.updatedAt || protocol?.updated_at || protocol?.lastReviewedAt || protocol?.createdAt || protocol?.created_at || null;
  let isStale = false;
  let daysSinceUpdate = 0;
  let monthsSinceUpdate = 0;

  if (lastUpdateRaw) {
    const timestamp = typeof lastUpdateRaw === 'object' && lastUpdateRaw._seconds 
      ? lastUpdateRaw._seconds * 1000 
      : new Date(lastUpdateRaw).getTime();
    if (!isNaN(timestamp)) {
      const now = Date.now();
      daysSinceUpdate = Math.max(0, Math.floor((now - timestamp) / (1000 * 60 * 60 * 24)));
      monthsSinceUpdate = Math.floor(daysSinceUpdate / 30);
      if (daysSinceUpdate > 90) {
        isStale = true;
      }
    }
  }

  // Color rules per user requirements:
  // - If > 90 days (more than 3 months), color is ORANGE (#f59e0b) - not because incomplete, but because it needs clinical review!
  // - If <= 90 days and 100% complete, color is GREEN (#10b981)
  // - If incomplete (< 60%), color is RED (#ef4444)
  // - If 60-99%, color is AMBER (#f59e0b)
  let color = '#ef4444';
  let statusText = `${pct}% Complete`;
  let statusBadge = 'incomplete';

  if (isStale) {
    color = '#f59e0b'; // Amber / Orange for > 3 months!
    statusText = pct === 100 ? 'Review Due (>90d)' : `${pct}% • Review Due`;
    statusBadge = 'review_due';
  } else if (pct === 100) {
    color = '#10b981'; // Green
    statusText = '100% Optimized';
    statusBadge = 'optimized';
  } else if (pct >= 60) {
    color = '#f59e0b';
    statusText = `${pct}% In Progress`;
    statusBadge = 'in_progress';
  } else {
    statusBadge = 'incomplete';
  }

  return { 
    checks, 
    completed, 
    total, 
    pct, 
    color, 
    isStale, 
    daysSinceUpdate, 
    monthsSinceUpdate,
    statusText,
    statusBadge
  };
}
