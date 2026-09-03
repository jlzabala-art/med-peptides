"use client";

import Database from "lucide-react/dist/esm/icons/database";
import Folder from "lucide-react/dist/esm/icons/folder";
import FileIcon from "lucide-react/dist/esm/icons/file";
import UploadCloud from "lucide-react/dist/esm/icons/upload-cloud";
import FolderPlus from "lucide-react/dist/esm/icons/folder-plus";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import HardDrive from "lucide-react/dist/esm/icons/hard-drive";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Download from "lucide-react/dist/esm/icons/download";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import X from "lucide-react/dist/esm/icons/x";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { storage } from '../../firebase';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTable from '../ui/DataTable';
import EmptyState from '../ui/EmptyState';
import toast from 'react-hot-toast';
import notifier from '../../services/NotificationService';
import AppActionGroup from '../ui/AppActionGroup';

import {
  ref,
  listAll,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  uploadString,
} from 'firebase/storage';

const ROOT_FOLDER = 'knowledge_base';

export default function AdminStorageTab() {
  const [currentPath, setCurrentPath] = useState(ROOT_FOLDER);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  async function fetchFiles(path) {
    setLoading(true);
    setError(null);
    try {
      const listRef = ref(storage, path);
      const res = await listAll(listRef);
      setFolders(res.prefixes);
      setFiles(res.items.filter((item) => item.name !== '.keep'));
    } catch (err) {
      console.error('Error fetching files:', err);
      if (err.code === 'storage/retry-limit-exceeded' || err.code === 'storage/unauthorized') {
        setError("Permission denied: Cannot access Firebase Storage. Please check your storage.rules.");
      } else {
        setError(`Failed to load directory: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  async function handleCreateFolder(e) {
    e.preventDefault();
    if (!newFolderName || newFolderName.trim() === '') return;

    const safeName = newFolderName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const newFolderPath = `${currentPath}/${safeName}/.keep`;

    setShowFolderDialog(false);
    setNewFolderName('');

    const createPromise = async () => {
      const newFolderRef = ref(storage, newFolderPath);
      await uploadString(newFolderRef, '');
      await fetchFiles(currentPath);
    };

    toast.promise(createPromise(), {
      loading: 'Creating folder...',
      success: 'Folder created successfully',
      error: 'Failed to create folder'
    });
  }

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
        toast.error(`Upload failed: ${err.message}`);
        setUploading(false);
      },
      () => {
        setUploading(false);
        toast.success('File uploaded successfully');
        fetchFiles(currentPath);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    );
  };

  async function executeDelete(fileRef) {
    notifier.confirmCritical(`Are you sure you want to delete ${fileRef.name}?`, async () => {
      const deletePromise = async () => {
        await deleteObject(fileRef);
        await fetchFiles(currentPath);
      };
      toast.promise(deletePromise(), {
        loading: 'Deleting...',
        success: 'Deleted successfully',
        error: 'Failed to delete'
      });
    });
  }

  async function handleDownload(fileRef) {
    try {
      const url = await getDownloadURL(fileRef);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  }

  const pathParts = currentPath.split('/').filter((p) => p);
  const breadcrumbs = [];
  let buildPath = '';
  pathParts.forEach((part, index) => {
    buildPath += index === 0 ? part : '/' + part;
    breadcrumbs.push({ name: part, path: buildPath });
  });

  const tableData = useMemo(() => {
    const data = [];
    folders.forEach(folder => {
      data.push({
        id: folder.fullPath,
        type: 'folder',
        name: folder.name,
        ref: folder
      });
    });
    files.forEach(file => {
      data.push({
        id: file.fullPath,
        type: 'file',
        name: file.name,
        ref: file
      });
    });
    return data;
  }, [folders, files]);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      width: '60%',
      render: (row) => (
        <div 
          style={{ display: 'inline-flex', alignItems: 'center', cursor: row.type === 'folder' ? 'pointer' : 'default' }}
          onClick={() => row.type === 'folder' && setCurrentPath(row.ref.fullPath)}
        >
          {row.type === 'folder' ? (
            <Folder size={18} style={{ color: '#FCD34D', marginRight: '0.75rem', fill: '#FCD34D' }} />
          ) : row.name.toLowerCase().endsWith('.pdf') ? (
            <FileText size={18} style={{ color: '#EF4444', marginRight: '0.75rem' }} />
          ) : (
            <FileIcon size={18} style={{ color: 'var(--text-muted)', marginRight: '0.75rem' }} />
          )}
          <span style={{ fontWeight: row.type === 'folder' ? 600 : 500, color: 'var(--text-main)' }}>
            {row.name}
          </span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      width: '20%',
      render: (row) => (
        <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {row.type}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '20%',
      align: 'right',
      render: (row) => {
        if (row.type !== 'file') return null;
        return (
          <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
            <AppActionGroup
              actions={[
                { type: 'download', onClick: (e) => { e.stopPropagation(); handleDownload(row.ref); } },
                { type: 'delete', onClick: (e) => { e.stopPropagation(); executeDelete(row.ref); } }
              ]}
            />
          </div>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      <PageHeader
        title="Knowledge Base"
        subtitle={`Manage RAG files and PDFs for AI Agents. Restricted to ${ROOT_FOLDER}.`}
        icon={Database}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowFolderDialog(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FolderPlus size={16} /> New Folder
            </button>
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={uploading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: uploading ? 0.7 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
            >
              <UploadCloud size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} multiple={false} />
          </div>
        }
      />

      {uploading && (
        <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--primary)', width: `${uploadProgress}%`, transition: 'width 0.2s' }} />
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

      <GlobalSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search files and folders..."
        resultCount={tableData.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length}
        namespace="admin-storage"
        size="lg"
      />

      {error ? (
        <div style={{ margin: '1rem', padding: '1.5rem', background: '#fef2f2', border: '1px solid #f87171', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#b91c1c', fontSize: '1rem', fontWeight: 600 }}>System Error</h4>
            <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem', lineHeight: 1.5 }}>{error}</p>
            <button
              onClick={() => fetchFiles(currentPath)}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'white', border: '1px solid #f87171', color: '#b91c1c', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
            >
              Retry Request
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          {tableData.length === 0 && !loading ? (
            <EmptyState 
              icon={Database} 
              title="Folder is empty" 
              subtitle="Upload files or create folders to get started." 
              action={{ label: 'Upload File', onClick: () => fileInputRef.current && fileInputRef.current.click() }}
            />
          ) : (
            <DataTable
              data={tableData}
              columns={columns}
              searchQuery={searchTerm}
              onSearchChange={setSearchTerm}
              isLoading={loading}
              pageSize={50}
            />
          )}
        </div>
      )}

      {/* Create Folder Dialog */}
      {showFolderDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-md)', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 600 }}>Create New Folder</h3>
              <button onClick={() => setShowFolderDialog(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateFolder}>
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', marginBottom: '1.5rem' }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowFolderDialog(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={!newFolderName.trim() || loading} className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}