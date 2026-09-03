export function serializeFirestoreData(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj.toDate === 'function') {
    return obj.toDate().toISOString();
  }
  if (obj._seconds !== undefined && obj._nanoseconds !== undefined) {
    return new Date(obj._seconds * 1000).toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeFirestoreData);
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = serializeFirestoreData(obj[key]);
    }
    return newObj;
  }
  return obj;
}
