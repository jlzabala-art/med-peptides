// src/repositories/protocolRepository.js
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// Primary collection — seeded by src/scripts/seedBlueprints.mjs
const COL = 'blueprints';

/**
 * Protocol Repository
 * Responsible for loading protocol templates, variants, and profiles from Firebase.
 */
export const protocolRepository = {
  /**
   * Fetch ALL protocol templates natively without status filtering.
   * Useful for exhaustive exports and audits.
   */
  async getAllProtocols() {
    try {
      const snapshot = await getDocs(collection(db, COL));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('[protocolRepository] getAllProtocols failed:', error);
      throw error;
    }
  },

  /**
   * Fetch all approved protocol templates.
   * @returns {Promise<Array>} List of protocol templates.
   */
  async getProtocolTemplates() {
    // Single-field query avoids compound index requirement on the new collection.
    // Status filter is applied client-side for flexibility.
    const q = query(collection(db, COL), where('active', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => !p.status || p.status === 'approved');
  },

  /**
   * Filter protocol templates by a specific clinical objective.
   * @param {string} objective - The clinical objective name
   * @returns {Promise<Array>} Compatible protocol templates.
   */
  async getTemplatesByObjective(objective) {
    const q = query(
      collection(db, COL),
      where('active', '==', true),
      where('primary_goal', '==', objective)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => !p.status || p.status === 'approved');
  },

  /**
   * Get a specific protocol template by ID or slug.
   * @param {string} id - The protocol ID or slug.
   * @returns {Promise<Object|null>} The matched template or null.
   */
  async getProtocolTemplate(id) {
    // The blueprints collection uses protocol_id as the document ID — try direct lookup first.
    const directRef = doc(db, COL, id);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) return { id: directSnap.id, ...directSnap.data() };

    // Fallback: query by protocol_id field (handles doc IDs that differ)
    const q1 = query(collection(db, COL), where('protocol_id', '==', id));
    const snapshot1 = await getDocs(q1);
    if (!snapshot1.empty) return { id: snapshot1.docs[0].id, ...snapshot1.docs[0].data() };

    // Fallback: query by slug
    const q2 = query(collection(db, COL), where('protocol_slug', '==', id));
    const snapshot2 = await getDocs(q2);
    if (!snapshot2.empty) return { id: snapshot2.docs[0].id, ...snapshot2.docs[0].data() };

    return null;
  },

  /**
   * Fetch protocol variants.
   */
  async getProtocolVariants(protocolId) {
    // In future, load from protocol_variants collection
    return [];
  },

  /**
   * Load monitoring templates associated with a protocol or objective.
   */
  async getMonitoringProfile(objectiveId) {
    const docId = objectiveId === "DEFAULT" 
        ? "default_profile" 
        : objectiveId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const docRef = doc(db, 'monitoring_profiles', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().schedule || [];
    }
    
    // Fallback to default if not found
    const defaultRef = doc(db, 'monitoring_profiles', 'default_profile');
    const defaultSnap = await getDoc(defaultRef);
    return defaultSnap.exists() ? defaultSnap.data().schedule : [];
  }
};
