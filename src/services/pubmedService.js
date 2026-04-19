import { db } from '../firebase';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';

const API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * SINGLETON MEMORY CACHE
 * Evita múltiples consultas a Firebase/API en la misma sesión de usuario.
 */
const MEMORY_CACHE = new Map();

/**
 * PHARMA-CLEANER: Normalización agresiva de nombres de productos.
 * Elimina ruido comercial para maximizar aciertos en PubMed.
 */
const getPharmaBaseName = (name) => {
  if (!name) return '';
  return name
    .replace(/\s*\d+(mg|mcg|ml|g|iu|ui)\b/gi, '') // Elimina dosis
    .replace(/\/?\s?vial\b/gi, '')               // Elimina formato
    .replace(/\b(pure|grade|research|grade|lyophilized|acetate)\b/gi, '') // Ruido comercial
    .trim();
};

/**
 * PUBMED SERVICE - ANTIGRAVITY VERSION
 * Implementa 'Stale-While-Revalidate' para carga instantánea en móviles.
 */
export async function getPubMedLiterature(product) {
  if (!product?.name) return [];

  const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');
  const baseName = getPharmaBaseName(product.name);

  // 1. MEMORY CACHE LOOKUP (Instantáneo)
  if (MEMORY_CACHE.has(slug)) return MEMORY_CACHE.get(slug);

  let cachedDoc = null;
  let cachedId = null;

  try {
    // 2. FIREBASE CACHE LOOKUP
    const q = query(collection(db, 'pubmed_cache'), where('productSlug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      cachedDoc = docSnap.data();
      cachedId = docSnap.id;

      const now = new Date();
      const expiresAt = cachedDoc.expiresAt instanceof Timestamp
        ? cachedDoc.expiresAt.toDate()
        : new Date(cachedDoc.expiresAt);

      // ESTRATEGIA: Stale-While-Revalidate
      // Si la caché existe, la devolvemos inmediatamente para no hacer esperar al móvil
      if (cachedDoc.articles?.length > 0) {
        // Si ha expirado, disparamos la actualización en segundo plano (asíncrono)
        if (now > expiresAt) {
          refreshPubMedCache(slug, baseName, cachedId);
        }
        MEMORY_CACHE.set(slug, cachedDoc.articles);
        return cachedDoc.articles;
      }
    }

    // 3. FETCH SI NO HAY CACHÉ (Primer acceso)
    return await refreshPubMedCache(slug, baseName, cachedId);

  } catch (error) {
    console.error('PubMed Service Error:', error);
    return cachedDoc?.articles || [];
  }
}

/**
 * Función interna para actualizar la caché sin bloquear el hilo principal.
 */
async function refreshPubMedCache(slug, searchQuery, existingId) {
  try {
    // AbortController para optimización de red en móvil
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3`;
    const searchRes = await fetch(searchUrl, { signal: controller.signal });
    const searchData = await searchRes.json();
    clearTimeout(timeoutId);

    const ids = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const summaryUrl = `${API_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    const articles = ids.map(id => {
      const info = summaryData.result?.[id];
      if (!info) return null;
      return {
        pmid: id,
        title: (info.title || 'Scientific Publication').replace(/<\/?[^>]+(>|$)/g, ""), // Clean HTML tags
        journal: (info.fulljournalname || info.source || 'Medical Journal').toUpperCase(),
        year: info.pubdate ? parseInt(info.pubdate.substring(0, 4)) : 'N/D',
        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      };
    }).filter(Boolean);

    // Guardar en Firestore (7 días de validez)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const docRef = existingId ? doc(db, 'pubmed_cache', existingId) : doc(collection(db, 'pubmed_cache'));

    await setDoc(docRef, {
      productSlug: slug,
      queryUsed: searchQuery,
      articles,
      expiresAt: expires,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    MEMORY_CACHE.set(slug, articles);
    return articles;

  } catch (err) {
    console.warn('Background Refresh Failed', err);
    return [];
  }
}