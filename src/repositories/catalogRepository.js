/**
 * catalogRepository.js
 *
 * Single data-access layer for the Firestore Catalog and Lead collections.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { validateCatalog, validateLeadRequest, emptyCatalog } from '../schemas/catalogSchema';

const catalogsCol = () => collection(db, 'catalogs');
const leadsCol = () => collection(db, 'catalogLeadRequests');

export const catalogRepository = {
  /**
   * Fetch a catalog by its Firestore document ID.
   */
  async getCatalogById(id) {
    try {
      const snap = await getDoc(doc(db, 'catalogs', id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (err) {
      console.error('[catalogRepository] getCatalogById error:', err);
      throw err;
    }
  },

  /**
   * Fetch a catalog by its unique url-slug.
   */
  async getCatalogBySlug(slug) {
    try {
      const q = query(catalogsCol(), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return { id: d.id, ...d.data() };
    } catch (err) {
      console.error('[catalogRepository] getCatalogBySlug error:', err);
      throw err;
    }
  },

  /**
   * Fetch all catalogs matching owner credentials.
   */
  async getCatalogsByOwner(ownerId, ownerType = null) {
    try {
      let q = query(catalogsCol(), where('ownerId', '==', ownerId));
      if (ownerType) {
        q = query(catalogsCol(), where('ownerId', '==', ownerId), where('ownerType', '==', ownerType));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('[catalogRepository] getCatalogsByOwner error:', err);
      throw err;
    }
  },

  /**
   * Get all catalogs (for global admin view).
   */
  async getAllCatalogs() {
    try {
      const snap = await getDocs(catalogsCol());
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('[catalogRepository] getAllCatalogs error:', err);
      throw err;
    }
  },

  /**
   * Create or update a catalog, validating it against catalogSchema.
   */
  async saveCatalog(catalogData) {
    try {
      const validation = validateCatalog(catalogData);
      if (!validation.ok) {
        throw new Error(`Catalog Validation Failed: ${validation.errors.join(', ')}`);
      }

      const id = catalogData.id || doc(catalogsCol()).id;
      const cleanData = { ...catalogData, id, updatedAt: new Date().toISOString() };

      await setDoc(doc(db, 'catalogs', id), cleanData);
      return cleanData;
    } catch (err) {
      console.error('[catalogRepository] saveCatalog error:', err);
      throw err;
    }
  },

  /**
   * Delete a catalog.
   */
  async deleteCatalog(id) {
    try {
      await deleteDoc(doc(db, 'catalogs', id));
      return true;
    } catch (err) {
      console.error('[catalogRepository] deleteCatalog error:', err);
      throw err;
    }
  },

  /**
   * Increments the view counter for a catalog.
   */
  async incrementCatalogViews(id) {
    try {
      await updateDoc(doc(db, 'catalogs', id), {
        views: increment(1),
      });
    } catch (err) {
      console.error('[catalogRepository] incrementCatalogViews error:', err);
    }
  },

  /**
   * Save a Lead capture request (stamping owner routing)
   */
  async saveLeadRequest(leadData) {
    try {
      const id = leadData.id || doc(leadsCol()).id;
      const cleanData = {
        ...leadData,
        id,
        status: leadData.status || 'new',
        createdAt: leadData.createdAt || new Date().toISOString(),
      };

      const validation = validateLeadRequest(cleanData);
      if (!validation.ok) {
        throw new Error(`Lead Validation Failed: ${validation.errors.join(', ')}`);
      }

      await setDoc(doc(db, 'catalogLeadRequests', id), cleanData);

      // Increment lead count on the catalog document
      if (cleanData.catalogId) {
        await updateDoc(doc(db, 'catalogs', cleanData.catalogId), {
          leadCaptureCount: increment(1),
        });
      }

      return cleanData;
    } catch (err) {
      console.error('[catalogRepository] saveLeadRequest error:', err);
      throw err;
    }
  },

  /**
   * Fetch leads for a specific catalog, or for an owner.
   */
  async getLeadsByOwner(ownerId) {
    try {
      const q = query(leadsCol(), where('ownerId', '==', ownerId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('[catalogRepository] getLeadsByOwner error:', err);
      // fallback without orderby if index is building
      const q = query(leadsCol(), where('ownerId', '==', ownerId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  async getLeadsForCatalog(catalogId) {
    try {
      const q = query(leadsCol(), where('catalogId', '==', catalogId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('[catalogRepository] getLeadsForCatalog error:', err);
      const q = query(leadsCol(), where('catalogId', '==', catalogId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  }
};
