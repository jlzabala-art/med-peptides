import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../../firebase';
import {
  ref,
  listAll,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  uploadString,
} from 'firebase/storage';
import {
  Database,
  Folder,
  File as FileIcon,
  UploadCloud,
  FolderPlus,
  Trash2,
  ChevronRight,
  HardDrive,
  FileText,
  Download,
  AlertTriangle,
  X,
} from 'lucide-react';

const ROOT_FOLDER = 'knowledge_base';

export default function AdminStorageTab() {
  const [currentPath, setCurrentPath] = useState(ROOT_FOLDER);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Inline error state for fetch failures

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [toast, setToast] = useState(null);

  // Custom modals state
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(null);

  const fileInputRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function fetchFiles(path) {
    setLoading(true);
    setError(null);
    try {
      const listRef = ref(storage, path);
      const res = await listAll(listRef);
      setFolders(res.prefixes);
      // Filter out empty placeholder files used for folders
      setFiles(res.items.filter((item) => item.name !== '.keep'));
    } catch (err) {
      console.error('Error fetching files:', err);
      // Determine if it's a permission issue
      if (err.code === 'storage/retry-limit-exceeded' || err.code === 'storage/unauthorized') {
        setError(
          "Permission denied: Cannot access Firebase Storage. Please check your storage.rules to ensure you have 'list' and 'read' permissions."
        );
      } else {
        setError(`Failed to load directory: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  async function handleCreateFolder(e) {
    e.preventDefault();
    if (!newFolderName || newFolderName.trim() === '') return;

    // Clean name
    const safeName = newFolderName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const newFolderPath = `${currentPath}/${safeName}/.keep`;

    setShowFolderDialog(false);
    setNewFolderName('');

    try {
      setLoading(true);
      const newFolderRef = ref(storage, newFolderPath);
      await uploadString(newFolderRef, '');
      showToast('Folder created successfully');
      fetchFiles(currentPath);
    } catch (err) {
      console.error('Error creating folder:', err);
      showToast('Failed to create folder', 'error');
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    const fileRef = ref(storage, `${currentPath}/${file.name}`);

    setUploading(true);
    setUploadProgress(0);

    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (err) => {
        console.error('Upload error:', err);
        showToast(`Upload failed: ${err.message}`, 'error');
        setUploading(false);
      },
      () => {
        // Complete
        setUploading(false);
        showToast('File uploaded successfully');
        fetchFiles(currentPath);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    );
  };

  async function executeDelete() {
    if (!confirmDelete) return;
    const fileRef = confirmDelete;
    setConfirmDelete(null);

    try {
      setLoading(true);
      await deleteObject(fileRef);
      showToast('File deleted successfully');
      fetchFiles(currentPath);
    } catch (err) {
      console.error('Delete error:', err);
      showToast(`Failed to delete: ${err.message}`, 'error');
      setLoading(false);
    }
  };

  async function handleDownload(fileRef) {
    try {
      const url = await getDownloadURL(fileRef);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Failed to download file', 'error');
    }
  };

  // Breadcrumbs logic
  const pathParts = currentPath.split('/').filter((p) => p);
  const breadcrumbs = [];
  let buildPath = '';
  pathParts.forEach((part, index) => {
    buildPath += index === 0 ? part : '/' + part;
    breadcrumbs.push({ name: part, path: buildPath });
  });

  return (
    <div
      style={{
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Header & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: '0 0 0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Database size={24} style={{ color: 'var(--primary)' }} />
            Knowledge Base
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage RAG files and PDFs for AI Agents. Restricted to <strong>{ROOT_FOLDER}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowFolderDialog(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: 'var(--bg-light)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <FolderPlus size={16} /> New Folder
          </button>

          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={uploading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: 'var(--primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.7 : 1,
            }}
          >
            <UploadCloud size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            multiple={false}
          />
        </div>
      </div>

      {uploading && (
        <div
          style={{
            background: 'var(--bg-light)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'var(--bg-app)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'var(--primary)',
                width: `${uploadProgress}%`,
                transition: 'width 0.2s',
              }}
            />
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem',
          background: 'white',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <HardDrive size={18} style={{ color: 'var(--text-muted)' }} />
        {breadcrumbs.map((bc, idx) => (
          <React.Fragment key={bc.path}>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            <span
              onClick={() => setCurrentPath(bc.path)}
              style={{
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: idx === breadcrumbs.length - 1 ? 700 : 500,
                color: idx === breadcrumbs.length - 1 ? 'var(--text-main)' : 'var(--primary)',
                textDecoration: idx === breadcrumbs.length - 1 ? 'none' : 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              {bc.name === ROOT_FOLDER ? 'Knowledge Base' : bc.name}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* File Explorer */}
      <div
        style={{
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            Loading contents...
          </div>
        ) : error ? (
          /* GCP-style Inline Error Alert */
          <div
            style={{
              margin: '1rem',
              padding: '1.5rem',
              background: '#fef2f2',
              border: '1px solid #f87171',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <h4
                style={{
                  margin: '0 0 0.5rem 0',
                  color: '#b91c1c',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                System Error
              </h4>
              <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {error}
              </p>
              <button
                onClick={() => fetchFiles(currentPath)}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: 'white',
                  border: '1px solid #f87171',
                  color: '#b91c1c',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Retry Request
              </button>
            </div>
          </div>
        ) : (
          <div>
            {folders.length === 0 && files.length === 0 && (
              <div
                style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                }}
              >
                This folder is empty.
              </div>
            )}

            {/* Folders */}
            {folders.map((folderRef, idx) => (
              <div
                key={folderRef.fullPath}
                onClick={() => setCurrentPath(folderRef.fullPath)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-light)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Folder
                  size={20}
                  style={{ color: '#FCD34D', marginRight: '1rem', fill: '#FCD34D' }}
                />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {folderRef.name}
                </span>
              </div>
            ))}

            {/* Files */}
            {files.map((fileRef) => (
              <div
                key={fileRef.fullPath}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-light)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {fileRef.name.toLowerCase().endsWith('.pdf') ? (
                    <FileText size={20} style={{ color: '#EF4444', marginRight: '1rem' }} />
                  ) : (
                    <FileIcon
                      size={20}
                      style={{ color: 'var(--text-muted)', marginRight: '1rem' }}
                    />
                  )}
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {fileRef.name}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleDownload(fileRef)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '0.4rem',
                      borderRadius: '4px',
                    }}
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(fileRef)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--error)',
                      padding: '0.4rem',
                      borderRadius: '4px',
                    }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALS & NOTIFICATIONS --- */}

      {/* Create Folder Dialog */}
      {showFolderDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              width: '90%',
              maxWidth: '400px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: 'var(--text-main)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                }}
              >
                New Folder
              </h3>
              <button
                onClick={() => setShowFolderDialog(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateFolder}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-light)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  marginBottom: '1.5rem',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowFolderDialog(false)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: newFolderName.trim() ? 'pointer' : 'not-allowed',
                    opacity: newFolderName.trim() ? 1 : 0.5,
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              width: '90%',
              maxWidth: '400px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                color: 'var(--text-main)',
                fontSize: '1.1rem',
                fontWeight: 700,
              }}
            >
              Confirm Deletion
            </h3>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to permanently delete <strong>{confirmDelete.name}</strong>?
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 1.5rem',
            background: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease',
          }}
        >
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminStorageTab | Props: none
      </div>
    
</div>
  );
}
