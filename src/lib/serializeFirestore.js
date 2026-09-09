/**
 * src/lib/serializeFirestore.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Firestore → Plain JS serializer for Server Actions.
 *
 * Handles:
 *   - Firestore Timestamp objects (toDate method)
 *   - Raw _seconds/_nanoseconds objects (Admin SDK representation)
 *   - Nested objects and arrays (recursive)
 *   - null / undefined / primitive passthrough
 *
 * Rule: Used ONLY in Server Actions (src/actions/*.js).
 *       Client SDK data is already plain JS — no serialization needed there.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Recursively converts Firestore Timestamp objects to ISO-8601 strings.
 * All other values are returned as-is.
 *
 * @param {*} obj - Any value from a Firestore document
 * @returns {*} Serialized, plain JS value safe for Client Component props
 */
export function serializeFirestoreData(obj) {
  // Primitives and null
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  // Firestore Timestamp (client SDK or admin SDK with .toDate())
  if (typeof obj.toDate === 'function') {
    return obj.toDate().toISOString();
  }

  // Admin SDK raw timestamp shape: { _seconds: number, _nanoseconds: number }
  if (typeof obj._seconds === 'number' && typeof obj._nanoseconds === 'number') {
    return new Date(obj._seconds * 1000 + Math.round(obj._nanoseconds / 1e6)).toISOString();
  }

  // Array
  if (Array.isArray(obj)) {
    return obj.map(serializeFirestoreData);
  }

  // Plain object — recurse into each key
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = serializeFirestoreData(obj[key]);
  }
  return result;
}

/**
 * Serializes a Firestore DocumentSnapshot to a plain JS object with `id`.
 * Handles both client SDK snapshots (.exists, .data()) and admin SDK snapshots (.exists).
 *
 * @param {FirebaseFirestore.DocumentSnapshot|FirebaseFirestore.QueryDocumentSnapshot} docSnap
 * @returns {{ id: string } & Record<string, *> | null}
 */
export function serializeDoc(docSnap) {
  if (!docSnap) return null;

  // Determine existence — Admin SDK uses .exists, Client SDK uses .exists property
  const exists = typeof docSnap.exists === 'function' ? docSnap.exists() : docSnap.exists;
  if (!exists) return null;

  const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
  return {
    id: docSnap.id,
    ...serializeFirestoreData(data),
  };
}

/**
 * Maps an array of Firestore document snapshots to serialized plain objects.
 * Filters out null results (non-existing docs).
 *
 * @param {Array<FirebaseFirestore.DocumentSnapshot>} docs
 * @returns {Array<{ id: string } & Record<string, *>>}
 */
export function serializeDocs(docs) {
  return docs.map(serializeDoc).filter(Boolean);
}
