import { storage } from '../firebase.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads an imported prescription document (PDF, PNG, JPG) to Firebase Storage.
 *
 * @param {File|Blob} file - The file to upload
 * @param {Object} options - Metadata options
 * @param {string} [options.sessionId] - Session ID for multi-formulation groups
 * @param {string} [options.patientName] - Patient name for file labeling
 * @returns {Promise<{ downloadUrl: string, fileName: string, fileSize: number, fileType: string, storagePath: string }|null>}
 */
export async function uploadPrescriptionDocument(file, options = {}) {
  if (!file) return null;

  try {
    const rawName = file.name || `prescription_${Date.now()}.pdf`;
    const cleanName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = options.sessionId ? `sessions/${options.sessionId}` : 'imported';
    const storagePath = `prescriptions/${folder}/${Date.now()}_${cleanName}`;

    const fileRef = ref(storage, storagePath);
    const metadata = {
      contentType: file.type || 'application/pdf',
      customMetadata: {
        originalName: rawName,
        uploadedAt: new Date().toISOString(),
        patientName: options.patientName || 'Unknown',
        source: 'clinical_intake_ai'
      }
    };

    const snapshot = await uploadBytes(fileRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      downloadUrl,
      fileName: rawName,
      fileSize: file.size || 0,
      fileType: file.type || 'application/pdf',
      storagePath
    };
  } catch (err) {
    console.warn('[prescriptionStorageService] Upload to Firebase Storage failed, continuing with AI metadata:', err);
    return null;
  }
}
