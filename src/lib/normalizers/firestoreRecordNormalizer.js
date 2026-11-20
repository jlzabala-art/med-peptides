/**
 * Canonical Firestore Record Normalizer
 * Single source of truth for normalizing heterogeneous Firestore timestamps,
 * product types (raw_api -> raw_material), and deterministic patient IDs.
 */

export function toIsoDate(val, fallback = null) {
  if (!val) return fallback;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    if (trimmed.includes('/')) {
      const p = trimmed.split('/');
      if (p.length === 3) {
        const dt = new Date(`${p[2]}-${p[1]}-${p[0]}`);
        if (!Number.isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
      }
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString().slice(0, 10);
  }
  if (typeof val === 'object') {
    if (typeof val.toDate === 'function') return val.toDate().toISOString().slice(0, 10);
    if (typeof val.seconds === 'number') return new Date(val.seconds * 1000).toISOString().slice(0, 10);
    if (typeof val._seconds === 'number') return new Date(val._seconds * 1000).toISOString().slice(0, 10);
  }
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }
  return fallback;
}

export function normalizeProductType(type) {
  const t = String(type || '').toLowerCase().trim();
  if (t === 'raw_api') return 'raw_material';
  return t || 'finished_product';
}

export function normalizePatientId(rx) {
  if (!rx) return '';
  if (rx.patientId) return String(rx.patientId);
  if (rx.patient?.id) return String(rx.patient.id);
  const name = rx.patientName || rx.patient?.name || '';
  const slug = String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  return slug ? `pt_${slug}` : '';
}
