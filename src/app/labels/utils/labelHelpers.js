/**
 * labelHelpers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure helper functions for Compounding Label Studio (code sanitization,
 * localStorage recents/labeled persistence, doctor slug formatting).
 */

export const RECENT_KEY = 'pls_recent_prescriptions_v1';
export const QUEUE_STORAGE_KEY = 'pls_patient_queue_formats_v2';
export const ACTIVE_RX_KEY = 'pls_last_active_rx_code';
export const LABELED_STORAGE_KEY = 'pls_labeled_parts_v1';

export const FEATURED_PATIENTS = [
  { code: 'BOX01399AATRI', name: 'Haya Hassen Al-Haidose', title: 'TrichoSol 100mL & TrichoWash 250mL' },
  { code: '51812', name: 'Abdulla Sultan Alotaiba', title: 'Metabolic & Longevity (Parts 1 & 2)' },
  { code: '51857', name: 'Amna Sultan Alotaiba', title: 'Metabolic & Lipid Optimization' },
  { code: '50957', name: 'Alan Maclean Rutledge', title: 'Proteolytic & Mitochondrial' },
  { code: '51861', name: 'Basma Haitham Bouzo', title: 'Topical Scalp & Metabolic' },
  { code: '51811', name: 'Sarah Al Nuaimi', title: 'Hormonal & Transdermal' },
];

export function getInitialLabeledSet() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LABELED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function sanitizeRecentCode(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  const boxMatch = str.match(/\b(BOX[0-9]{4,6}[A-Z0-9]+)\b/i);
  if (boxMatch) return boxMatch[1].toUpperCase();
  const rxMatch = str.match(/\b(RX-[A-Z0-9-]+)\b/i);
  if (rxMatch) return rxMatch[1].toUpperCase();
  const digitMatch = str.match(/\b\d{4,8}\b/);
  if (digitMatch) return digitMatch[0];
  return str.replace(/\s*\(.*?\)/g, '').split(/[;,\n]/)[0].trim().slice(0, 24);
}

export function cleanRecentTitle(raw) {
  if (!raw) return 'Compounded Formula';
  return String(raw)
    .replace(/\s*\(Sample Code.*?\)/gi, '')
    .replace(/No specific Rx number.*$/gi, '')
    .trim() || 'Compounded Formula';
}

export function getRecentPrescriptions() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    const seenPatients = new Map();
    for (const item of list) {
      if (!item) continue;
      const cleanCode = sanitizeRecentCode(item.code);
      const cleanName = String(item.patientName || item.name || 'Patient').trim();
      const normName = cleanName.toLowerCase();

      if (seenPatients.has(normName)) {
        const existing = seenPatients.get(normName);
        if (cleanCode.startsWith('BOX') && !existing.code.startsWith('BOX')) {
          seenPatients.set(normName, {
            ...item,
            code: cleanCode,
            patientName: cleanName,
            title: cleanRecentTitle(item.title)
          });
        }
      } else {
        seenPatients.set(normName, {
          ...item,
          code: cleanCode,
          patientName: cleanName,
          title: cleanRecentTitle(item.title)
        });
      }
    }

    const cleaned = Array.from(seenPatients.values()).slice(0, 5);
    if (JSON.stringify(cleaned) !== raw) {
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(cleaned));
      } catch { /* ignore */ }
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveRecentPrescription(item) {
  if (typeof window === 'undefined' || !item?.code) return [];
  try {
    const list = getRecentPrescriptions();
    const cleanCode = sanitizeRecentCode(item.code);
    const cleanName = String(item.patientName || item.name || 'Patient').trim();
    const cleanTitle = cleanRecentTitle(item.title || item.treatmentTitle);

    const filtered = list.filter(p => {
      const pCode = sanitizeRecentCode(p.code);
      const pName = String(p.patientName || p.name || '').trim().toLowerCase();
      return pCode !== cleanCode && pName !== cleanName.toLowerCase();
    });

    const updated = [
      {
        code: cleanCode,
        patientName: cleanName,
        title: cleanTitle,
        date: item.date || item.prodDate || item.prescriptionDate || null,
        timestamp: Date.now()
      },
      ...filtered
    ].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save recent prescription to localStorage:', e);
    return [];
  }
}

export function getDoctorSlug(rx, fallbackDocName) {
  if (rx?.doctorSlug) return rx.doctorSlug;
  if (rx?.doctor?.slug) return rx.doctor.slug;
  if (rx?.doctor?.opaqueCode) return rx.doctor.opaqueCode;
  if (rx?.treatingDoctor?.slug) return rx.treatingDoctor.slug;
  if (rx?.treatingDoctor?.opaqueCode) return rx.treatingDoctor.opaqueCode;
  if (rx?.doctorCode) return rx.doctorCode;

  const name = rx?.doctorName || rx?.physician || rx?.doctor?.name || rx?.treatingDoctor?.name || fallbackDocName || 'Marina Cordeiro Fernandes';
  return String(name)
    .toLowerCase()
    .replace(/^dr[a]?\.\s*/i, '')
    .replace(/^dr[a]?\s*/i, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function formatResultDate(raw) {
  if (!raw) return null;
  try {
    let d;
    if (typeof raw === 'object' && raw.seconds) {
      d = new Date(raw.seconds * 1000);
    } else {
      d = new Date(raw);
    }
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}
