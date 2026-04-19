import { db } from '../firebase';
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
  deleteDoc
} from 'firebase/firestore';

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

    // If this is a new version, mark previous versions as not latest
    if (prevId) {
        // This is a simplified approach; in production we might want to update all previous versions
        const prevRef = doc(db, COLLECTION_NAME, prevId);
        await updateDoc(prevRef, { is_latest: false });
    }

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
        const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedPayload);
        console.log("Success! Document ID:", docRef.id);
        console.groupEnd();
        return docRef.id;
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

// ── Admin-only functions ───────────────────────────────────────────────────────

/**
 * Fetch ALL protocols (all users) ordered by created_at desc.
 * For use in AdminProtocolsTab only.
 */
export const getAllProtocols = async () => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            orderBy('created_at', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('[protocolStorage] getAllProtocols:', error);
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

