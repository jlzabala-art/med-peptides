/* eslint-disable no-unused-vars */
import { db } from '../firebase.js';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  deleteDoc,
  writeBatch,
  startAfter
} from 'firebase/firestore';
import { logAction } from './auditLogger.js';

/**
 * NEW PROTOCOL VERSIONING STORAGE (v5.0)
 * Complies with systematic protocol versioning, authorship tracking, and status management.
 */

const COLLECTION_NAME = 'protocols';

/**
 * Save or Create a New Version of a Protocol
 * @param {Object} protocolData - The generated protocol snapshot
 * @param {Object} formData - The patient inputs
 * @param {Object} options - metadata like userId, userName, existingId, isNewVersion
 */
export const saveProtocol = async (protocolData, formData, options = {}) => {
  const { 
    userId = 'guest', 
    userName = 'Jose', 
    role = 'clinician',
    existingId = null, 
    isNewVersion = false,
    status = 'draft'
  } = options;

  try {
    const timestamp = new Date().toISOString();
    
    let version = 1;
    let prevId = null;
    let originalCreatedBy = { user_id: userId, user_name: userName, role: role };

    if (existingId) {
      const docRef = doc(db, COLLECTION_NAME, existingId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const current = snap.data();
        originalCreatedBy = current.created_by || originalCreatedBy;
        
        if (isNewVersion) {
          version = (current.version_number || 1) + 1;
          prevId = existingId;
        } else {
          // Update existing doc (e.g. for autosave or status change)
          const updatePayload = {
            updated_at: serverTimestamp(),
            updated_by: { user_id: userId, user_name: userName },
            patient_inputs: {
                ...current.patient_inputs,
                ...formData
            },
            phases: protocolData.blueprint?.phases || protocolData.phases || [],
            products: protocolData.costData?.aggregateVials || [],
            cost_summary: protocolData.costData || {}
          };
          await updateDoc(docRef, updatePayload);
          await logAction(userId, role, 'PROTOCOL_UPDATE', existingId, {
            protocolName: current.protocol_name || current.name
          });
          return existingId;
        }
      }
    }

    // New Document Payload
    const payload = {
      protocol_name: protocolData.blueprint?.title || protocolData.protocol_name || "New Protocol",
      therapeutic_category: formData.primaryCondition || "general",
      
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      
      version_number: version,
      previous_version_id: prevId,
      
      created_by: originalCreatedBy,
      updated_by: { user_id: userId, user_name: userName },
      
      provenance: protocolData.blueprint?.provenance || {
        source_type: "Clinical Reference",
        author: userName,
        review_status: "Draft"
      },
      
      patient_inputs: {
        demographic: formData.patientType || "General Wellness",
        age_group: formData.ageGroup || "Adult",
        primary_focus: formData.primaryCondition || "Wellness",
        start_date: formData.startDate || new Date().toISOString().split('T')[0],
        preferences: formData.guidelines || {},
        constraints: formData.lifestyleConstraints || {}
      },
      
      phases: protocolData.blueprint?.phases || protocolData.phases || [],
      products: protocolData.costData?.aggregateVials || [],
      cost_summary: protocolData.costData || {},
      
      status: status || "draft",
      visibility: options.visibility || "public",
      is_latest: true
    };



    // Sanitize payload with clinical strictness (remove undefined, preserve null/empty)
    const sanitize = (obj, depth = 0) => {
        if (depth > 10) return obj; // Avoid recursion overflow
        if (obj === undefined) return null; // Convert undefined to null for Firestore
        if (!obj || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return obj.toISOString();
        
        const isArr = Array.isArray(obj);
        const newObj = isArr ? [] : {};
        
        Object.keys(obj).forEach(key => {
            const val = obj[key];
            if (val === undefined) {
                // Skip undefined in objects, but might need null in arrays to keep indices?
                // Actually, Firestore prefers stripping them.
                return;
            }
            const sanitizedVal = sanitize(val, depth + 1);
            if (isArr) {
                newObj.push(sanitizedVal);
            } else {
                newObj[key] = sanitizedVal;
            }
        });
        return newObj;
    };
    
    const sanitizedPayload = sanitize(payload);
    console.group("Persistence: Save Protocol");
    console.log("Payload:", sanitizedPayload);
    
    try {
        if (prevId) {
            const batch = writeBatch(db);
            const prevRef = doc(db, COLLECTION_NAME, prevId);
            batch.update(prevRef, { is_latest: false });

            const newDocRef = doc(collection(db, COLLECTION_NAME));
            batch.set(newDocRef, sanitizedPayload);

            await batch.commit();
            console.log("Success (Batch)! Document ID:", newDocRef.id);
            console.groupEnd();
            await logAction(userId, role, 'PROTOCOL_VERSION_CREATE', newDocRef.id, {
              protocolName: sanitizedPayload.protocol_name,
              previousVersionId: prevId
            });
            return newDocRef.id;
        } else {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedPayload);
            console.log("Success! Document ID:", docRef.id);
            console.groupEnd();
            await logAction(userId, role, 'PROTOCOL_CREATE', docRef.id, {
              protocolName: sanitizedPayload.protocol_name
            });
            return docRef.id;
        }
    } catch (fireError) {
        console.error("Firestore specific error:", fireError);
        console.groupEnd();
        throw new Error(`Firestore rejection: ${fireError.message}`);
    }
  } catch (error) {
    console.error("Protocol persistence logic failure:", error);
    throw error;
  }
};

/**
 * Load a protocol by ID
 */
export const getProtocolById = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching protocol:", error);
    return null;
  }
};

/**
 * Fetch list of saved protocols (Latest versions only by default)
 */
export const getSavedProtocolsList = async (filters = {}) => {
  try {
    const { userId = null, category = null, status = null, latestOnly = true } = filters;
    
    let q = query(collection(db, COLLECTION_NAME), orderBy("created_at", "desc"));
    
    if (latestOnly) {
        q = query(q, where("is_latest", "==", true));
    }
    
    if (userId) {
        q = query(q, where("created_by.user_id", "==", userId));
    }
    
    if (category) {
        q = query(q, where("therapeutic_category", "==", category));
    }
    
    if (status) {
        q = query(q, where("status", "==", status));
    }

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error listing protocols:", error);
    return [];
  }
};

/**
 * Duplicate a protocol as v1
 */
export const duplicateProtocol = async (id, userId, userName) => {
    try {
        const protocol = await getProtocolById(id);
        if (!protocol) throw new Error("Protocol not found");
        
        const { id: _, created_at, updated_at, ...rest } = protocol;
        const payload = {
            ...rest,
            protocol_name: `${protocol.protocol_name} (Copy)`,
            version_number: 1,
            previous_version_id: null,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
            created_by: { user_id: userId, user_name: userName, role: 'clinician' },
            updated_by: { user_id: userId, user_name: userName },
            status: "draft",
            is_latest: true
        };
        
        const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
        return docRef.id;
    } catch (error) {
        console.error("Error duplicating protocol:", error);
        throw error;
    }
};

/**
 * Get Version History for a specific protocol (searching by lineage)
 * lineage is defined by shared original ID or previous_version_id chain
 */
export const getProtocolHistory = async (originalProtocolName, createdByUserId) => {
    try {
        // Simplified: find all with same name and author
        const q = query(
            collection(db, COLLECTION_NAME),
            where("protocol_name", "==", originalProtocolName),
            where("created_by.user_id", "==", createdByUserId),
            orderBy("version_number", "desc")
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
};

/**
 * Delete protocol
 */
export const deleteProtocol = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        return true;
    } catch (error) {
        console.error("Error deleting protocol:", error);
        return false;
    }
};

/**
 * Alias: Get all protocols for a user (used by ProtocolHistory)
 */
export const getUserProtocols = async (userId = null) => {
    return getSavedProtocolsList({ userId, latestOnly: false });
};

/**
 * Update a specific field set on a protocol document (used by ProtocolHistory)
 */
export const updateProtocol = async (id, fields) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { ...fields, updated_at: serverTimestamp() });
        return true;
    } catch (error) {
        console.error("Error updating protocol:", error);
        return false;
    }
};

/**
 * Generate or retrieve a lightweight session ID for anonymous users.
 * Stored in sessionStorage so it resets on browser close.
 */
export const getSessionId = () => {
    try {
        let sessionId = sessionStorage.getItem('rp_session_id');
        if (!sessionId) {
            sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            sessionStorage.setItem('rp_session_id', sessionId);
        }
        return sessionId;
    } catch (e) {
        return `sess_${Date.now()}`;
    }
};

// ── DTO (Phase 7) ──────────────────────────────────────────────────────────────
/**
 * Minimal shape needed by homepage cards.
 * Keeps components decoupled from raw Firestore schema.
 *
 * @typedef {Object} ProtocolCardDTO
 * @property {string}  id
 * @property {string}  title
 * @property {string}  category
 * @property {string}  primary_goal
 * @property {number|null} duration_weeks
 * @property {number|null} phase_count
 * @property {number|null} compound_count
 * @property {string}  tagline
 * @property {string}  status
 * @property {string}  short_code
 * @property {string}  version
 * @property {number|null} total_cost
 * @property {string}  currency
 * @property {string}  intensity
 * @property {string[]} tags
 * @property {Object}  metadata
 * @property {Object}  timeline
 * @property {Array}   phase_blueprints
 * @property {Array}   phases
 */

/** @param {Object} raw — raw Firestore document data + id */
function toProtocolCardDTO(raw) {
    // protocol_id is stored as a field in blueprints docs; raw.id is the Firestore doc key (same value).
    const protocolId = raw.protocol_id || raw.id;

    return {
        // identity — keep protocol_id so normalizeBlueprint / filter helpers work
        id:              protocolId,
        protocol_id:     protocolId,
        slug:            raw.protocol_slug || protocolId,
        short_code:      raw.short_code      || raw.metadata?.shortCode || protocolId || null,
        version:         raw.version         || raw.protocol_version || raw.metadata?.version || null,
        // display
        title:           raw.title || raw.protocol_title || raw.name || raw.protocol_name || 'Unnamed Protocol',
        category:        raw.category        || raw.metadata?.primary_condition || raw.primary_goal || raw.metadata?.primary_goal || '',
        primary_goal:    raw.primary_goal    || raw.metadata?.primary_goal || '',
        tagline:         raw.tagline         || raw.overview_summary || raw.summary || raw.description || raw.metadata?.description || '',
        intensity:       raw.intensity       || raw.complexity_level || raw.metadata?.intensity || raw.metadata?.complexity_level || '',
        status:          raw.approval_status || raw.status || raw.metadata?.review?.review_status || '',
        // stats
        duration_weeks:  raw.duration_weeks  || raw.protocol_duration_weeks || raw.timeline?.total_duration_weeks || null,
        phase_count:     (raw.phase_blueprints || raw.phases || []).length || raw.number_of_phases || null,
        compound_count:  (() => {
            const src = raw.phase_blueprints?.length ? raw.phase_blueprints : (raw.phases || []);
            const names = new Set(
                src.flatMap(ph => ph.drugs || ph.drugs_used || ph.compounds || ph.peptides || [])
                   .map(d => d.product_slug || d.product_title || d.name || d.compound || d.peptide_name)
                   .filter(Boolean)
            );
            return names.size || null;
        })(),
        total_cost:      raw.total_cost      || raw.estimated_cost || raw.economics?.total_protocol_cost_estimate || raw.economics?.estimated_total_cost || null,
        currency:        raw.currency        || raw.economics?.currency || 'USD',
        // pass-through for badge / filter logic
        tags:            raw.tags            || [],
        metadata:        raw.metadata        || {},
        timeline:        raw.timeline        || {},
        phase_blueprints: raw.phase_blueprints || [],
        phases:          raw.phases          || [],
        // raw fields needed by normalizeBlueprint in FeaturedProtocols
        overview_summary:        raw.overview_summary        || '',
        protocol_duration_weeks: raw.protocol_duration_weeks || null,
        legacy_compatibility:    raw.legacy_compatibility    || {},
        economics:               raw.economics               || {},
    };
}

// ── Admin-only functions ───────────────────────────────────────────────────────

/**
 * Fetch publicly-visible protocols from Firebase (no auth required).
 * Queries the `protocols` collection where active == true.
 * Used by homepage FeaturedProtocols section.
 *
 * No local fallback — if Firebase returns 0 docs, returns []; if it throws, re-throws.
 */
export const getPublicProtocols = async () => {
    const TIMEOUT_MS = 10_000;
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout: protocols')), TIMEOUT_MS)
    );

    try {
        const q = query(
            collection(db, 'protocols'),
            where('active', '==', true)
        );
        const snap = await Promise.race([getDocs(q), timeout]);
        return snap.docs.map(d => toProtocolCardDTO({ id: d.id, ...d.data() }));
    } catch (err) {
        console.error('[protocolStorage] getPublicProtocols failed:', err);
        throw err;   // Re-throw so FeaturedProtocols can show error state
    }
};

/**
 * Fetch ALL protocols (all users) ordered by created_at desc.
 * For use in AdminProtocolsTab only.
 */
export const getAllProtocols = async () => {
    try {
        const q = query(collection(db, COLLECTION_NAME));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
            const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at || 0);
            const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at || 0);
            return dateB - dateA;
        });
    } catch (error) {
        console.error('[protocolStorage] getAllProtocols:', error);
        throw error;
    }
};

/**
 * Fetch protocols with pagination
 */
export const getPaginatedProtocols = async (lastDocSnap = null, pageSize = 20) => {
    try {
        let q = query(
            collection(db, COLLECTION_NAME),
            orderBy('created_at', 'desc'),
            limit(pageSize)
        );
        if (lastDocSnap) {
            q = query(q, startAfter(lastDocSnap));
        }
        const snap = await getDocs(q);
        return {
            protocols: snap.docs.map(d => ({ id: d.id, ...d.data() })),
            lastDoc: snap.docs[snap.docs.length - 1] || null,
            hasMore: snap.docs.length === pageSize
        };
    } catch (error) {
        console.error('[protocolStorage] getPaginatedProtocols:', error);
        throw error;
    }
};

/**
 * Overwrite top-level metadata AND phases on a protocol document.
 * Used by admin panel for full phase editing.
 *
 * @param {string} id - Protocol document ID
 * @param {Object} updates - { protocol_name?, therapeutic_category?, status?, phases? }
 */
export const updateProtocolFull = async (id, updates) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...updates,
            updated_at: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('[protocolStorage] updateProtocolFull:', error);
        throw error;
    }
};

