import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db, storage } from '../../firebase';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';
import { FileText, UploadCloud, CheckCircle, Clock, AlertCircle, X, ExternalLink, Database, Search, Filter, Calendar, Trash2, Share2, Mail, ChevronDown, ChevronRight, Download, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Archive, ArchiveRestore } from 'lucide-react';

export default function DocumentUploadModule() {
  const { user } = useAuth();
  
  // Data states
  const [documents, setDocuments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [documentType, setDocumentType] = useState('COA');
  const fileInputRef = useRef(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Selection & Bulk Ops
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [showArchived, setShowArchived] = useState(false);
  
  // Inline Edit
  const [editingDocId, setEditingDocId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Drawer
  const [drawerDoc, setDrawerDoc] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsSnap, prodsSnap] = await Promise.all([
          getDocs(query(collection(db, 'uploaded_documents'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'products'), orderBy('name')))
        ]);
        setDocuments(docsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setProducts(prodsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // -- Upload Logic --
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `uploads/admin/documents/${Date.now()}_${safeName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => { setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100); },
      (error) => {
        console.error('Upload failed:', error);
        setUploading(false);
        alert('File upload failed: ' + error.message);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const newDocData = {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            url: downloadURL,
            storagePath: storageRef.fullPath,
            uploadedBy: user.uid,
            uploaderName: user.displayName || user.email,
            status: 'processing',
            documentType: documentType,
            createdAt: serverTimestamp(),
            extractedData: null
          };
          const docRef = await addDoc(collection(db, 'uploaded_documents'), newDocData);
          setDocuments(prev => [{ id: docRef.id, ...newDocData, createdAt: { toDate: () => new Date() } }, ...prev]);
        } catch (dbError) {
          console.error("Error adding to Firestore:", dbError);
        } finally {
          setUploading(false);
          setProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    );
  };

  // -- Grouping Logic --
  const getBaseName = (fileName) => {
    return fileName.replace(/\(\d+\)/g, '').replace(/\.pdf$/i, '').trim();
  };

  const guessProductId = (fileName) => {
    if (!products || products.length === 0) return null;
    const lowerName = fileName.toLowerCase();
    // Sort products by name length descending so we match the most specific product first
    const sortedProducts = [...products].sort((a, b) => b.name.length - a.name.length);
    const match = sortedProducts.find(p => lowerName.includes(p.name.toLowerCase()));
    return match ? match.id : null;
  };

  const groupedDocuments = useMemo(() => {
    const groups = {};
    documents.forEach(doc => {
       const base = getBaseName(doc.fileName);
       if (!groups[base]) groups[base] = [];
       groups[base].push(doc);
    });
    return Object.values(groups).map(group => {
       group.sort((a,b) => {
         const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.toDate?.()?.getTime?.() || 0);
         const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.toDate?.()?.getTime?.() || 0);
         return timeB - timeA;
       });
       return { main: group[0], variants: group.slice(1), allIds: group.map(g => g.id) };
    });
  }, [documents]);

  // -- Filtering Logic --
  const filteredGroups = useMemo(() => {
    return groupedDocuments.filter(({ main }) => {
       if (!showArchived && main.isArchived) return false;
       if (showArchived && !main.isArchived) return false;
       if (filterType !== 'ALL' && main.documentType !== filterType) return false;
       if (dateFrom) {
         const d = main.createdAt?.toDate?.() || new Date();
         if (d < new Date(dateFrom)) return false;
       }
       if (dateTo) {
         const d = main.createdAt?.toDate?.() || new Date();
         // Add 1 day to dateTo to include the whole day
         const end = new Date(dateTo);
         end.setDate(end.getDate() + 1);
         if (d > end) return false;
       }
       if (searchQuery) {
         const q = searchQuery.toLowerCase();
         const matchName = main.fileName.toLowerCase().includes(q);
         const productName = main.productId ? products.find(p => p.id === main.productId)?.name?.toLowerCase() || '' : '';
         const matchProduct = productName.includes(q);
         const matchExtracted = main.extractedData ? JSON.stringify(main.extractedData).toLowerCase().includes(q) : false;
         if (!matchName && !matchProduct && !matchExtracted) return false;
       }
       return true;
    });
  }, [groupedDocuments, searchQuery, filterType, dateFrom, dateTo, products]);

  // -- Pagination --
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // -- Event Handlers --
  const handleAssignProduct = async (docId, productId) => {
    try {
      await updateDoc(doc(db, 'uploaded_documents', docId), { productId });
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, productId } : d));
    } catch(err) {
      console.error("Error assigning product:", err);
      alert("Error assigning product");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedDocs.size} documents?`)) return;
    try {
      for (const docId of selectedDocs) {
        const d = documents.find(x => x.id === docId);
        if (d) {
          if (d.storagePath) await deleteObject(ref(storage, d.storagePath)).catch(e => console.warn(e));
          await deleteDoc(doc(db, 'uploaded_documents', docId));
        }
      }
      setDocuments(prev => prev.filter(d => !selectedDocs.has(d.id)));
      setSelectedDocs(new Set());
    } catch(err) {
      console.error("Error bulk deleting:", err);
    }
  };

  const handleBulkArchive = async (archive) => {
    try {
      for (const docId of selectedDocs) {
        await updateDoc(doc(db, 'uploaded_documents', docId), { isArchived: archive });
      }
      setDocuments(prev => prev.map(d => selectedDocs.has(d.id) ? { ...d, isArchived: archive } : d));
      setSelectedDocs(new Set());
    } catch(err) {
      console.error("Error archiving:", err);
    }
  };

  const toggleSelection = (id) => {
    const newSet = new Set(selectedDocs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDocs(newSet);
  };

  const toggleGroupSelection = (allIds) => {
    const newSet = new Set(selectedDocs);
    const allSelected = allIds.every(id => newSet.has(id));
    if (allSelected) {
      allIds.forEach(id => newSet.delete(id));
    } else {
      allIds.forEach(id => newSet.add(id));
    }
    setSelectedDocs(newSet);
  };

  const toggleGroupExpand = (baseName) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(baseName)) newSet.delete(baseName);
    else newSet.add(baseName);
    setExpandedGroups(newSet);
  };

  // WhatsApp/Email Sharing logic
  const handleShareWhatsApp = (docsToShare) => {
    const docsText = docsToShare.map(d => {
      const prodName = d.productId ? products.find(p => p.id === d.productId)?.name || 'Unknown' : 'Unassigned';
      return `- ${d.fileName} (Product: ${prodName}): ${d.url}`;
    }).join('%0A');
    const text = `Hello! Please find attached the requested document(s):%0A%0A${docsText}%0A%0ABest regards.`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareEmail = (docsToShare) => {
    const docsText = docsToShare.map(d => {
      const prodName = d.productId ? products.find(p => p.id === d.productId)?.name || 'Unknown' : 'Unassigned';
      return `- ${d.fileName} (Product: ${prodName}):%0A${d.url}`;
    }).join('%0A%0A');
    const subject = encodeURIComponent("Requested Documents / Certificates of Analysis");
    const body = `Hello!%0A%0APlease find attached the requested document(s):%0A%0A${docsText}%0A%0ABest regards.`;
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const startEditing = (docId, currentName, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setEditingDocId(docId);
    setEditingName(currentName);
  };

  const saveEditing = async () => {
    if (!editingDocId) return;
    const newName = editingName.trim();
    if (newName !== '') {
      try {
        await updateDoc(doc(db, 'uploaded_documents', editingDocId), { fileName: newName });
        setDocuments(prev => prev.map(d => d.id === editingDocId ? { ...d, fileName: newName } : d));
        if (drawerDoc && drawerDoc.id === editingDocId) {
          setDrawerDoc(prev => ({ ...prev, fileName: newName }));
        }
      } catch (err) {
        console.error("Error renaming document:", err);
        alert("Failed to rename document.");
      }
    }
    setEditingDocId(null);
  };

  const handleRename = async (docId, currentName) => {
    startEditing(docId, currentName);
  };

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      
      {/* Upload Header Area */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 2rem auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div 
          style={{
            padding: '2rem',
            backgroundColor: dragActive ? 'rgba(0,113,189,0.05)' : 'var(--surface)',
            border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '24px',
            textAlign: 'center',
            transition: 'all 0.2s',
          }}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        >
          <input ref={fileInputRef} type="file" onChange={handleChange} style={{ display: 'none' }} accept=".pdf,.csv,.xlsx,.xls" />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(0,113,189,0.1)', borderRadius: '50%', color: 'var(--primary)' }}>
              <UploadCloud size={32} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Upload Documents for AI Processing</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Drag and drop PDF Certificates of Analysis (CoA) or Pricing Lists.
          </p>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tipo de Documento:</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <option value="COA">Certificado de Análisis (CoA)</option>
              <option value="PRICING_LIST">Lista de Precios</option>
              <option value="CLINICAL_STUDY">Estudio Clínico</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer' }}>
            {uploading ? `Uploading... ${Math.round(progress)}%` : 'Browse Files'}
          </button>
        </div>
        
        {/* AI Cost Notification */}
        <div style={{ padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={20} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>AI Data Extraction enabled</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Files uploaded are automatically routed to the Document Processing Agent. Est. cost: ~$0.0025 per page (Gemini 2.5 Flash).</div>
            </div>
          </div>
          <Link to="/admin/agents" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>
            Manage Agents <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Main Table Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        
        {/* Sticky Bulk Action Bar */}
        {selectedDocs.size > 0 && (
          <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(239, 246, 255, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--primary)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{selectedDocs.size} item(s) selected</span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleShareWhatsApp(documents.filter(d => selectedDocs.has(d.id)))} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #25D366', color: '#25D366', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <Share2 size={16} /> WhatsApp
              </button>
              <button onClick={() => handleShareEmail(documents.filter(d => selectedDocs.has(d.id)))} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <Mail size={16} /> Email
              </button>
              {showArchived ? (
                <button onClick={() => handleBulkArchive(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <ArchiveRestore size={16} /> Restore
                </button>
              ) : (
                <button onClick={() => handleBulkArchive(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <Archive size={16} /> Archive
                </button>
              )}
              <button onClick={handleBulkDelete} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--error)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Toolbar (Filters) */}
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'white' }}>
          <div style={{ flex: '1 1 300px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem' }} />
            <input 
              type="text" 
              placeholder="Search by file name, product, lab, batch..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.95rem', outlineColor: 'var(--primary)' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <Filter size={16} color="var(--text-muted)" style={{ marginLeft: '0.5rem' }} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ border: 'none', backgroundColor: 'transparent', padding: '0.5rem', outline: 'none' }}>
              <option value="ALL">All Types</option>
              <option value="COA">COA</option>
              <option value="PRICING_LIST">Pricing List</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <Calendar size={16} color="var(--text-muted)" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ border: 'none', backgroundColor: 'transparent', outline: 'none' }} />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ border: 'none', backgroundColor: 'transparent', outline: 'none' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowArchived(!showArchived)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: showArchived ? '#f1f5f9' : 'white', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}>
              {showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />} 
              {showArchived ? 'View Active' : 'View Archived'}
            </button>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading documents...</div>
        ) : paginatedGroups.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No documents match your filters.</div>
        ) : (
          <div>
            {/* Headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px 3fr 2fr 1.5fr 40px', padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <div></div>
              <div>Document</div>
              <div>Associated Product</div>
              <div>AI Status</div>
              <div></div>
            </div>

            {/* Rows */}
            {paginatedGroups.map(({ main, variants, allIds }) => {
              const baseName = getBaseName(main.fileName);
              const isExpanded = expandedGroups.has(baseName);
              const hasVariants = variants.length > 0;
              const allSelected = allIds.every(id => selectedDocs.has(id));
              const someSelected = allIds.some(id => selectedDocs.has(id));
              const suggestedId = !main.productId ? guessProductId(main.fileName) : null;
              const suggestedProduct = suggestedId ? products.find(p => p.id === suggestedId) : null;

              return (
                <div key={main.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  {/* Master Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '40px 3fr 2fr 1.5fr 40px', padding: '1rem 1.5rem', alignItems: 'center', backgroundColor: someSelected && !allSelected ? 'rgba(0,113,189,0.02)' : allSelected ? 'rgba(0,113,189,0.05)' : 'white' }}>
                    <div>
                      <input type="checkbox" checked={allSelected} ref={input => { if (input) input.indeterminate = someSelected && !allSelected; }} onChange={() => toggleGroupSelection(allIds)} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {hasVariants && (
                        <button onClick={() => toggleGroupExpand(baseName)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-muted)' }}>
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      )}
                      {!hasVariants && <div style={{ width: '18px' }} />}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div onClick={() => !editingDocId && setDrawerDoc(main)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={18} color="var(--primary)" />
                            {editingDocId === main.id ? (
                              <input 
                                autoFocus 
                                value={editingName} 
                                onChange={(e) => setEditingName(e.target.value)} 
                                onBlur={saveEditing}
                                onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                                style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--primary)', outline: 'none', fontWeight: 600, color: 'var(--primary)' }}
                              />
                            ) : (
                              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{baseName}</span>
                            )}
                          </div>
                          {!editingDocId && (
                            <button onClick={(e) => startEditing(main.id, main.fileName, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }} title="Rename Document">
                              <Edit2 size={14} />
                            </button>
                          )}
                          {hasVariants && <span onClick={() => toggleGroupExpand(baseName)} style={{ cursor: 'pointer', fontSize: '0.75rem', padding: '0.1rem 0.5rem', backgroundColor: '#e2e8f0', borderRadius: '12px', color: '#475569', fontWeight: 700 }}>+{variants.length} var</span>}
                        </div>
                        <div onClick={() => setDrawerDoc(main)} style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {new Date(main.createdAt?.toDate?.() || Date.now()).toLocaleDateString()} • {main.fileSize ? (main.fileSize / 1024 / 1024).toFixed(2) : '0.00'} MB
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {main.productId ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <select 
                              value={main.productId} 
                              onChange={(e) => handleAssignProduct(main.id, e.target.value)}
                              style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', maxWidth: '180px' }}
                            >
                              <option value="">-- Unassigned --</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <Link to={`/admin/products/${main.productId}`} style={{ color: 'var(--primary)' }} title="Go to Product">
                              <ExternalLink size={16} />
                            </Link>
                          </div>
                        ) : suggestedProduct ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f0fdf4', padding: '0.4rem', borderRadius: '6px', border: '1px dashed #4ade80' }}>
                            <span style={{ fontSize: '0.8rem', color: '#166534' }}>Asociar a: <b>{suggestedProduct.name}</b>?</span>
                            <button onClick={() => handleAssignProduct(main.id, suggestedId)} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }} title="Confirmar">
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={() => handleAssignProduct(main.id, 'rejected')} style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }} title="Rechazar">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <select 
                              value="" 
                              onChange={(e) => handleAssignProduct(main.id, e.target.value)}
                              style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', maxWidth: '180px' }}
                            >
                              <option value="">-- Unassigned --</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div title={main.status === 'completed' ? 'Extracted' : 'Processing'} style={{ cursor: 'help', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {main.status === 'completed' ? <CheckCircle size={18} color="var(--success)" /> : <Clock size={18} color="#d97706" />}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button onClick={() => setDrawerDoc(main)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} title="Preview">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Variants Dropdown */}
                  {isExpanded && variants.map((variant, index) => (
                    <div key={variant.id} style={{ display: 'grid', gridTemplateColumns: '40px 3fr 2fr 1.5fr 40px', padding: '0.75rem 1.5rem 0.75rem 3rem', alignItems: 'center', backgroundColor: '#f8fafc', borderTop: '1px dashed var(--border)' }}>
                      <div>
                        <input type="checkbox" checked={selectedDocs.has(variant.id)} onChange={() => toggleSelection(variant.id)} style={{ cursor: 'pointer' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div onClick={() => setDrawerDoc(variant)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Variant #{index + 1}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{variant.fileName}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleRename(variant.id, variant.fileName); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }} title="Rename Variant">
                          <Edit2 size={14} />
                        </button>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(variant.createdAt?.toDate?.() || Date.now()).toLocaleString()}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Variant Copy</div>
                      <div style={{ textAlign: 'right' }}>
                        <button onClick={() => setDrawerDoc(variant)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} title="Preview"><ExternalLink size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: currentPage === 1 ? '#e2e8f0' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: currentPage === totalPages ? '#e2e8f0' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Right Drawer PDF Preview */}
      {drawerDoc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '800px', maxWidth: '90vw', backgroundColor: 'var(--background)', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease-out' }}>
            
            {/* Drawer Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'white' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {editingDocId === drawerDoc.id ? (
                    <input 
                      autoFocus 
                      value={editingName} 
                      onChange={(e) => setEditingName(e.target.value)} 
                      onBlur={saveEditing}
                      onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                      style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid var(--primary)', outline: 'none', fontSize: '1.25rem', fontWeight: 800 }}
                    />
                  ) : (
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{drawerDoc.fileName}</h2>
                  )}
                  {!editingDocId && (
                    <button onClick={() => startEditing(drawerDoc.id, drawerDoc.fileName)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Rename Document">
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span>{new Date(drawerDoc.createdAt?.toDate?.() || Date.now()).toLocaleString()}</span>
                  <span>{drawerDoc.fileSize ? (drawerDoc.fileSize / 1024 / 1024).toFixed(2) : '0.00'} MB</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{drawerDoc.documentType}</span>
                </div>
              </div>
              <button onClick={() => setDrawerDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '50%' }}>
                <X size={20} />
              </button>
            </div>

            {/* Drawer Actions */}
            <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <a href={drawerDoc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
                <Download size={16} /> Download PDF
              </a>
              <button onClick={() => handleShareWhatsApp([drawerDoc])} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', border: '1px solid #25D366', color: '#25D366', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <Share2 size={16} /> Share via WhatsApp
              </button>
              <button onClick={() => handleShareEmail([drawerDoc])} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', border: '1px solid var(--border)', color: 'var(--text-main)', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <Mail size={16} /> Email
              </button>
            </div>

            {/* PDF Viewer */}
            <div style={{ flex: 1, backgroundColor: '#e2e8f0', padding: '1rem', overflow: 'hidden' }}>
              {(drawerDoc.fileType?.includes('pdf') || drawerDoc.fileName?.toLowerCase().endsWith('.pdf')) && drawerDoc.url ? (
                <object data={drawerDoc.url} type="application/pdf" width="100%" height="100%" style={{ border: 'none', borderRadius: '8px', backgroundColor: 'white' }}>
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: '8px', color: 'var(--text-muted)' }}>
                    <p style={{ marginBottom: '1rem' }}>El navegador no permite previsualizar este archivo online (quizás porque los permisos de descarga bloquean el visor de Chrome).</p>
                    <a href={drawerDoc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
                      <Download size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} /> Descargar PDF
                    </a>
                  </div>
                </object>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  {drawerDoc.url ? 'Preview no disponible para este formato.' : 'Enlace de descarga no encontrado para este documento.'}
                  {drawerDoc.url && (
                    <a href={drawerDoc.url} target="_blank" rel="noopener noreferrer" style={{ marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: 'white', border: '1px solid var(--border)', color: 'var(--primary)', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
                      Descargar archivo
                    </a>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
      
      {/* Required CSS for slide animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
