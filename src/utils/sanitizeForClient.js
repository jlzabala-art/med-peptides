/**
 * Deeply sanitizes any server-side data structure (Firestore documents, Timestamps, Sets, Maps)
 * into 100% plain JSON-serializable primitives for safe passing across the React Server Component (RSC) boundary.
 */
export function sanitizeForClient(obj) {
  if (obj === null || obj === undefined) return obj;

  // Handle Firestore Timestamp class instance (with toDate / toMillis)
  if (typeof obj.toDate === 'function') {
    try {
      return obj.toDate().toISOString();
    } catch {
      return null;
    }
  }
  if (typeof obj.toMillis === 'function') {
    try {
      return new Date(obj.toMillis()).toISOString();
    } catch {
      return null;
    }
  }

  // Handle raw Firestore Timestamp format {_seconds, _nanoseconds}
  if (typeof obj === 'object' && typeof obj._seconds === 'number') {
    const ms = obj._seconds * 1000 + Math.round((obj._nanoseconds || 0) / 1000000);
    return new Date(ms).toISOString();
  }

  // Handle Date instance
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForClient);
  }

  // Handle Map
  if (obj instanceof Map) {
    const plain = {};
    obj.forEach((v, k) => {
      plain[String(k)] = sanitizeForClient(v);
    });
    return plain;
  }

  // Handle Set
  if (obj instanceof Set) {
    return Array.from(obj).map(sanitizeForClient);
  }

  // Handle Objects
  if (typeof obj === 'object') {
    const clean = {};
    for (const key of Object.keys(obj)) {
      clean[key] = sanitizeForClient(obj[key]);
    }
    return clean;
  }

  // Primitives (string, number, boolean)
  return obj;
}
