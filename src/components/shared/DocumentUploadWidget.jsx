import FileText from "lucide-react/dist/esm/icons/file-text";
import UploadCloud from "lucide-react/dist/esm/icons/upload-cloud";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import X from "lucide-react/dist/esm/icons/x";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import Database from "lucide-react/dist/esm/icons/database";
import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';









/**
 * DocumentUploadWidget – reusable, parametric upload component.
 *
 * Props:
 *   collectionName   (string) – Firestore collection where docs are stored (default: 'uploaded_documents').
 *   storagePrefix    (string) – Storage folder prefix (e.g., 'uploads/admin/documents').
 *   title, description, accept, defaultDocumentType – UI customisation.
 *   extraMetadata    – additional fields saved alongside each document record.
 */
export default function DocumentUploadWidget({
  collectionName = 'uploaded_documents',
  storagePrefix = 'uploads/admin/documents',
  title = 'Upload Documents for AI Processing',
  description = 'Drag and drop files. The AI will automatically extract data and associate it with products.',
  accept = '.pdf,.csv,.xlsx,.xls',
  defaultDocumentType = 'UNKNOWN',
  onUploadComplete,
  extraMetadata = {},
}) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // Listen to the specified collection
  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collectionName]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) uploadFile(e.target.files[0]);
  };

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `${storagePrefix}/${Date.now()}_${safeName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      'state_changed',
      (snapshot) => setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      (error) => {
        console.error('Upload failed:', error);
        setUploading(false);
        alert('File upload failed: ' + error.message);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const docRef = await addDoc(collection(db, collectionName), {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            url: downloadURL,
            storagePath: storageRef.fullPath,
            uploadedBy: user.uid,
            uploaderName: user.displayName || user.email,
            status: 'processing',
            documentType: defaultDocumentType,
            createdAt: serverTimestamp(),
            extractedData: null,
            ...extraMetadata,
          });
          if (onUploadComplete) onUploadComplete(docRef.id);
        } catch (dbError) {
          console.error('Error adding to Firestore:', dbError);
        } finally {
          setUploading(false);
          setProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    );
  };

  const handleDelete = async (docId, storagePath) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      if (storagePath) {
        await deleteObject(ref(storage, storagePath)).catch(e => console.warn('Storage object missing', e));
      }
      await deleteDoc(doc(db, collectionName, docId));
    } catch (e) {
      console.error('Error deleting document:', e);
      alert('Error deleting document');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Upload Area */}
      <div
        style={{
          padding: '3rem 2rem',
          backgroundColor: dragActive ? 'rgba(0,113,189,0.05)' : 'var(--surface)',
          border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '24px',
          textAlign: 'center',
          transition: 'all 0.2s',
          position: 'relative',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          style={{ display: 'none' }}
          accept={accept}
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(0,113,189,0.1)', borderRadius: '50%', color: 'var(--primary)' }}>
            <UploadCloud size={32} />
          </div>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>{description}</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 700,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? `Uploading... ${Math.round(progress)}%` : 'Browse Files'}
        </button>
        {uploading && (
          <div style={{ marginTop: '1rem', width: '100%', maxWidth: '300px', margin: '1rem auto 0', height: '6px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--primary)', transition: 'width 0.2s' }} />
          </div>
        )}
      </div>

      {/* Documents List */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={20} color="var(--primary)" /> Recent Uploads &amp; AI Processing
        </h3>
        {loading ? (
          <div>Loading documents...</div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            No documents uploaded yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {documents.map(docData => (
              <div key={docData.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '12px', color: 'var(--text-muted)' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700 }}>{docData.fileName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>{new Date(docData.createdAt?.toDate?.() || Date.now()).toLocaleString()}</span>
                      <span>•</span>
                      <span>{(docData.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* AI Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                    backgroundColor: docData.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : docData.status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: docData.status === 'completed' ? 'var(--success)' : docData.status === 'error' ? 'var(--error)' : '#d97706' }}>
                    {docData.status === 'completed' ? <CheckCircle size={14} /> : docData.status === 'error' ? <AlertCircle size={14} /> : <Clock size={14} />}
                    {docData.status === 'completed' ? `Processed: ${docData.documentType}` : docData.status === 'error' ? 'Processing Failed' : 'AI Processing...'}
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={docData.url} target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem', color: 'var(--primary)', backgroundColor: 'rgba(0,113,189,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center' }} title="View Document">
                      <ExternalLink size={16} />
                    </a>
                    <button onClick={() => handleDelete(docData.id, docData.storagePath)} style={{ padding: '0.5rem', color: 'var(--error)', backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Delete">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}