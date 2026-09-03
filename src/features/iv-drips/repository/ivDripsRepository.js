/**
 * ivDripsRepository.js
 * Capa de acceso a datos para IV Drips.
 * Cache: RAM (10min) → localStorage (30min) → Firestore
 */
import { collection, doc, getDocs, getDoc, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';

const CACHE_TTL_MS = 10 * 60 * 1000;
const LS_TTL_MS   = 30 * 60 * 1000;
const LS_VIALS_KEY = 'iv_vials_cache_v1';
const LS_INGS_KEY  = 'iv_ings_cache_v1';

let _memVials = null, _memVialsTTL = 0;
let _memIngs  = null, _memIngsTTL  = 0;

function lsSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch (_) {}
}
function lsGet(key, ttl) {
  try {
    const r = localStorage.getItem(key); if (!r) return null;
    const { ts, data } = JSON.parse(r);
    return Date.now() - ts > ttl ? null : data;
  } catch (_) { return null; }
}

export function invalidateIvDripsCache() {
  _memVials = null; _memVialsTTL = 0;
  _memIngs  = null; _memIngsTTL  = 0;
  try { localStorage.removeItem(LS_VIALS_KEY); localStorage.removeItem(LS_INGS_KEY); } catch (_) {}
}

export async function fetchIvVials({ forceRefresh = false, pageLimit = 100 } = {}) {
  if (!forceRefresh) {
    if (_memVials && Date.now() < _memVialsTTL) return _memVials;
    const ls = lsGet(LS_VIALS_KEY, LS_TTL_MS);
    if (ls) { _memVials = ls; _memVialsTTL = Date.now() + CACHE_TTL_MS; return ls; }
  }
  const q = query(collection(db, 'iv_vials'), where('active', '==', true), orderBy('sku'), limit(pageLimit));
  const snap = await getDocs(q);
  const vials = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  _memVials = vials; _memVialsTTL = Date.now() + CACHE_TTL_MS;
  lsSet(LS_VIALS_KEY, vials);
  return vials;
}

export async function fetchIvVialById(vialId) {
  if (_memVials) { const f = _memVials.find(v => v.vial_id === vialId || v.id === vialId); if (f) return f; }
  const snap = await getDoc(doc(db, 'iv_vials', vialId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function fetchIvIngredients({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    if (_memIngs && Date.now() < _memIngsTTL) return _memIngs;
    const ls = lsGet(LS_INGS_KEY, LS_TTL_MS);
    if (ls) { _memIngs = ls; _memIngsTTL = Date.now() + CACHE_TTL_MS; return ls; }
  }
  const snap = await getDocs(collection(db, 'iv_ingredients_master'));
  const ings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  _memIngs = ings; _memIngsTTL = Date.now() + CACHE_TTL_MS;
  lsSet(LS_INGS_KEY, ings);
  return ings;
}
