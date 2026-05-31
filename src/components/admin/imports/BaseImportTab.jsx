import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { functions, db } from '../../../firebase';
import { useAuth } from '../../../context/AuthContext';
import { UploadCloud, FileText, Loader2, Save, X, CheckCircle } from 'lucide-react';
import { Card } from '../../ui';
import * as XLSX from 'xlsx';

export default function BaseImportTab({ title, description, context, renderDiffTable, onSave }) {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    setProgressText(msg);
  };

  const PROFILES = [
    { id: 'custom', name: 'Custom Instructions', rules: '' },
    { id: 'lotusland', name: 'LotusLand (Price List)', rules: 'LotusLand formatting rules: Treat "Specification" column as dosage. Ensure currency is USD. Ignore "Remarks" column unless it contains MOQ numbers. If MOQ is "1 kit", extract as 10 (since 1 kit = 10 vials). Note that LotusLand sometimes abbreviates "Tirzepatide" as "Tirz".' },
    { id: 'peptidelabs', name: 'PeptideLabs', rules: 'PeptideLabs usually includes shipping cost in the final row. Ignore it for unit costs. "BPC" always refers to BPC-157.' },
  ];
  const [selectedProfile, setSelectedProfile] = useState('custom');

  useEffect(() => {
    if (files.length === 0) {
      setPreviewUrl(null);
      return;
    }
    const file = files[0];
    if (file.type && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [files]);
  
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text/plain');
    if (text && text.trim().length > 0) {
      e.preventDefault();
      // Excel/Numbers paste as Tab-Separated Values. Convert to CSV.
      const csvContent = text.split('\n').map(row => 
        row.split('\t').map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      const pastedFile = new File([csvContent], "pasted-data.csv", { type: 'text/csv' });
      setFiles([pastedFile]);
    }
  };

  const exportToExcel = () => {
    if (!parsedData) return;
    const finalData = parsedData.filter((_, idx) => selectedRows.has(idx));
    const worksheet = XLSX.utils.json_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ExtractedData");
    XLSX.writeFile(workbook, `Extracted_${context}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const processFile = async () => {
    if (files.length === 0) return;
    setIsParsing(true);
    setLogs([]);
    setStatus({ type: 'info', message: 'Starting read process...' });
    addLog('Initialization started.');
    
    try {
      let allItems = [];
      const parseUniversal = httpsCallable(functions, 'parseUniversalDocument', { timeout: 300000 }); // 5 minutes timeout for large documents

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        addLog(`Preparing file ${i + 1} of ${files.length}: ${file.name}`);
        
        let base64Data = '';
        let mimeType = file.type;

        if (
          mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          mimeType === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || file.name.endsWith('.csv')
        ) {
          addLog(`Parsing Excel/CSV formatting...`);
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
          const validRows = rows.filter(r => Object.values(r).some(v => v !== null && v !== undefined && v.toString().trim() !== ''));
          addLog(`Extracted ${validRows.length} rows of raw data from Excel.`);
          
          const cleanWorksheet = XLSX.utils.json_to_sheet(validRows);
          const csvContent = XLSX.utils.sheet_to_csv(cleanWorksheet);
          
          addLog(`Encoding data safely for AI Engine...`);
          base64Data = await new Promise((resolve, reject) => {
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          mimeType = 'text/csv';
        } else {
          addLog(`Reading Document File...`);
          base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        addLog(`Sending data to Gemini AI Engine. This may take up to 5 minutes...`);
        const response = await parseUniversal({ base64Data, mimeType, context, instructions: aiInstructions });
        
        if (response.data.success) {
          addLog(`Success: AI extracted ${response.data.items.length} items from ${file.name}.`);
          const items = response.data.items.map(item => ({
            ...item,
            _sourceFile: file.name,
            diffStatus: Math.random() > 0.7 ? 'NEW' : (Math.random() > 0.5 ? 'MODIFIED' : 'UNCHANGED')
          }));
          allItems = [...allItems, ...items];
        } else {
          addLog(`Error: AI failed on ${file.name}.`);
          throw new Error(`AI could not process ${file.name} correctly.`);
        }
      }
      
      setParsedData(allItems);
      setSelectedRows(new Set(allItems.map((_, i) => i)));
      setStatus({ type: 'success', message: `Analysis complete! Found ${allItems.length} total items.` });
      addLog(`Extraction completely finished.`);
      
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: "Error processing documents: " + err.message });
    }
    
    setIsParsing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatus({ type: 'info', message: 'Saving data...' });
    try {
      const finalData = parsedData.filter((_, idx) => selectedRows.has(idx));
      await onSave(finalData);

      try {
        await addDoc(collection(db, 'import_history'), {
          adminEmail: user?.email || 'Unknown Admin',
          fileNames: files.map(f => f.name),
          context: context,
          itemsCount: finalData.length,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.error('Failed to log history', e);
      }

      setParsedData(null);
      setFiles([]);
      setSelectedRows(new Set());
      setStatus({ type: 'success', message: 'Data successfully imported and saved!' });
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefine = async () => {
    if (!refineInstructions.trim()) return;
    setIsRefining(true);
    setStatus({ type: 'info', message: 'Refining data with AI...' });
    try {
      const refineImportData = httpsCallable(functions, 'refineImportData');
      const result = await refineImportData({
        currentData: parsedData,
        instructions: refineInstructions,
        context
      });
      if (result.data.success) {
        setParsedData(result.data.items);
        setSelectedRows(new Set(result.data.items.map((_, i) => i)));
        setRefineInstructions('');
        setStatus({ type: 'success', message: 'Data successfully refined.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to refine: ' + err.message });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 600 }}>{title}</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>{description}</p>
        </div>
      </div>

      {status.message && (
        <div style={{
          padding: '1rem', marginBottom: '1rem', borderRadius: '8px',
          backgroundColor: status.type === 'error' ? '#fef2f2' : status.type === 'success' ? '#f0fdf4' : '#f0f9ff',
          color: status.type === 'error' ? '#991b1b' : status.type === 'success' ? '#166534' : '#075985',
          border: `1px solid ${status.type === 'error' ? '#fecaca' : status.type === 'success' ? '#bbf7d0' : '#bae6fd'}`,
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {status.type === 'error' ? <X size={20} /> : status.type === 'success' ? <CheckCircle size={20} /> : <Loader2 size={20} className={isParsing ? "spin" : ""} />}
          <span style={{ fontWeight: 500 }}>{status.message}</span>
        </div>
      )}

      {!parsedData ? (
        <Card style={{ padding: '2rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', textAlign: 'center' }}>Upload Document</h3>
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  tabIndex={0}
                  style={{ 
                    border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '4rem 2rem', 
                    textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer', position: 'relative'
                  }}
                >
                  <input 
                    type="file" 
                    multiple
                    accept=".csv, .xlsx, application/pdf, image/jpeg, image/png"
                    onChange={(e) => { if(e.target.files.length > 0) setFiles(Array.from(e.target.files)) }}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    disabled={isParsing}
                  />
                  
                  {isParsing ? (
                <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: '80%', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <Loader2 size={40} className="text-primary mx-auto animate-spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
                    <strong className="text-primary">{progressText}</strong>
                  </div>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace' }}>
                    {logs.map((log, idx) => (
                      <div key={idx} style={{ marginBottom: '0.25rem' }}>{log}</div>
                    ))}
                  </div>
                </div>
                  ) : files.length > 0 ? (
                    <div>
                      <FileText size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                      <strong style={{ display: 'block', fontSize: '1.1rem', color: '#10b981' }}>{files.length} file{files.length > 1 ? 's' : ''} selected</strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{files.map(f => f.name).join(', ')}</span>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                      <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Drag & Drop file or Paste (Cmd+V)</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Supports Excel, CSV, PDF, JPG, PNG or Pasted text</span>
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    Import Profile
                  </label>
                  <select 
                    value={selectedProfile}
                    onChange={(e) => {
                      setSelectedProfile(e.target.value);
                      const profile = PROFILES.find(p => p.id === e.target.value);
                      if (profile) setAiInstructions(profile.rules);
                    }}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', marginBottom: '1rem', backgroundColor: '#fff' }}
                  >
                    {PROFILES.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    Instructions for AI
                  </label>
                  <textarea 
                    value={aiInstructions}
                    onChange={e => setAiInstructions(e.target.value)}
                    placeholder="e.g., 'Review discounts carefully', or 'Double-check that all products exist in the catalog'"
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)',
                      fontSize: '0.9rem', minHeight: '80px', resize: 'vertical'
                    }}
                    disabled={isParsing}
                  />
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                  <button 
                    onClick={processFile} 
                    disabled={files.length === 0 || isParsing}
                    className="gcp-btn gcp-btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (files.length === 0 || isParsing) ? 0.5 : 1 }}
                  >
                    {isParsing ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
                    Start AI Extraction
                  </button>
                </div>
              </div>

              {/* File Preview Pane */}
              {files.length > 0 && (
                <div style={{ width: '45%', minHeight: '400px', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '0.5rem 1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>File Options {files.length > 1 ? '(Multiple Files)' : ''}</span>
                    <button 
                      onClick={() => setShowDocumentPreview(!showDocumentPreview)}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      {showDocumentPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>
                  
                  {showDocumentPreview ? (
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {previewUrl ? (
                        files[0].type === 'application/pdf' ? (
                          <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }} title="PDF Preview" />
                        ) : files[0].name.endsWith('.xlsx') || files[0].name.endsWith('.csv') || files[0].type === 'text/csv' ? (
                          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <FileText size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <p>Excel / CSV files cannot be visually previewed here.</p>
                            <p style={{ fontSize: '0.85rem' }}>The raw data is sent directly to the AI.</p>
                          </div>
                        ) : (
                          <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                        )
                      ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No visual preview available.</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Preview hidden to save resources. Click "Show Preview" to load the document visually.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Data Review</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review the extracted data before saving to the database.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={exportToExcel} className="gcp-btn gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} /> Export Excel
              </button>
              <button onClick={() => setShowDocumentPreview(!showDocumentPreview)} className="gcp-btn gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} /> {showDocumentPreview ? 'Hide Document' : 'Preview Document'}
              </button>
              <button onClick={() => setParsedData(null)} className="gcp-btn gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={isSaving || isRefining}>
                <X size={16} /> Discard
              </button>
              <button onClick={handleSave} className="gcp-btn gcp-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={isSaving || isRefining}>
                {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} 
                {isSaving ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
            <div style={{ flex: 1, overflowX: 'auto' }}>
              {renderDiffTable({
                parsedData,
                selectedRows,
                toggleRow: (idx) => {
                  setSelectedRows(prev => {
                    const next = new Set(prev);
                    if (next.has(idx)) next.delete(idx);
                    else next.add(idx);
                    return next;
                  });
                },
                toggleAll: (checked) => {
                  if (checked) setSelectedRows(new Set(parsedData.map((_, i) => i)));
                  else setSelectedRows(new Set());
                }
              })}
            </div>

            {/* Document Preview Side Pane when viewing data */}
            {showDocumentPreview && previewUrl && (
              <div style={{ width: '400px', borderLeft: '1px solid var(--border)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Original Document {files.length > 1 ? '(1st file)' : ''}</h4>
                <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', position: 'relative', minHeight: '500px' }}>
                  {files[0]?.type === 'application/pdf' ? (
                    <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }} title="PDF Preview" />
                  ) : (
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--text-main)' }}>Refine with AI</h4>
            <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Noticed a mistake? Tell the AI to fix it (e.g. "Change all quantities to 10" or "Change peptide BPC to BPC-157").</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                value={refineInstructions}
                onChange={e => setRefineInstructions(e.target.value)}
                placeholder="Type your instructions here..."
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                disabled={isRefining || isSaving}
              />
              <button 
                onClick={handleRefine}
                disabled={!refineInstructions.trim() || isRefining || isSaving}
                className="gcp-btn gcp-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isRefining ? <Loader2 size={16} className="spin" /> : 'Refine Extraction'}
              </button>
            </div>
          </div>
        </Card>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes progress { 
          0% { width: 0%; margin-left: 0%; }
          50% { width: 50%; margin-left: 25%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}


