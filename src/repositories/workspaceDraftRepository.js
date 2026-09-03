import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import notifier from '../services/NotificationService';

/**
 * workspaceDraftRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages cloud persistence of multi-session workspace drafts in Firestore.
 */

/**
 * Saves or updates a named workspace draft in Firestore
 */
export async function saveWorkspaceDraft(userId, {
  draftId = null,
  name = 'Untitled Workspace Draft',
  items = [],
  metadata = {},
  targetType = 'quotation',
  clientOrPatientName = '',
  currency = 'USD'
}) {
  if (!userId) {
    throw new Error('User ID is required to save a workspace draft.');
  }

  try {
    const id = draftId || `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const draftRef = doc(db, 'workspace_drafts', id);

    const draftData = {
      id,
      userId,
      name: name.trim() || 'Untitled Draft',
      items: items || [],
      metadata: metadata || {},
      targetType, // 'quotation' | 'rfq' | 'prescription' | 'catalog'
      clientOrPatientName: clientOrPatientName || '',
      currency,
      itemCount: items.length,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    await setDoc(draftRef, draftData, { merge: true });
    notifier.success(`Workspace draft "${draftData.name}" saved!`);
    return { success: true, id, name: draftData.name };
  } catch (error) {
    console.error('[workspaceDraftRepository] Error saving draft:', error);
    notifier.error(`Failed to save draft: ${error.message}`);
    throw error;
  }
}

/**
 * Retrieves all workspace drafts for a user
 */
export async function getUserWorkspaceDrafts(userId) {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, 'workspace_drafts'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    // Fallback without orderBy if index is missing
    try {
      const qFallback = query(
        collection(db, 'workspace_drafts'),
        where('userId', '==', userId)
      );
      const snap = await getDocs(qFallback);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('[workspaceDraftRepository] Error getting drafts:', err);
      return [];
    }
  }
}

/**
 * Deletes a workspace draft by ID
 */
export async function deleteWorkspaceDraft(draftId) {
  if (!draftId) return;
  try {
    await deleteDoc(doc(db, 'workspace_drafts', draftId));
    notifier.success('Workspace draft deleted');
    return { success: true };
  } catch (error) {
    console.error('[workspaceDraftRepository] Error deleting draft:', error);
    notifier.error('Failed to delete draft: ' + error.message);
    throw error;
  }
}
