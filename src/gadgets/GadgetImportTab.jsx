import React, { useState, useEffect } from 'react';
import { Checkbox } from '../components/ui';
import { UploadCloud, FileText, Loader2, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function GadgetImportTab({ title, description, context, apiUrl, apiKey, onSave }) {
  const [files, setFiles] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    setProgressText(msg);
  };
  const [aiInstructions, setAiInstructions] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('custom');

  const PROFILES = [
    { id: 'custom', name: 'Custom Instructions', rules: '' },
    { id: 'lotusland', name: 'LotusLand (Price List)', rules: 'LotusLand formatting rules: Treat "Specification" column as dosage. Ensure currency is USD. Ignore "Remarks" column unless it contains MOQ numbers.' },
  ];

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

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        addLog(`Preparing file ${i + 1} of ${files.length}: ${file.name}`);
        
        let base64Data = '';
        let mimeType = file.type;

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv') || mimeType.includes('spreadsheet')) {
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
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: apiKey,
            base64Data,
            mimeType,
            context,
            instructions: aiInstructions
          })
        });

        if (!response.ok) throw new Error("API request failed: " + await response.text());
        
        const responseData = await response.json();

        if (responseData.success) {
          addLog(`Success: AI extracted ${responseData.items.length} items from ${file.name}.`);
          const items = responseData.items.map(item => ({
            ...item,
            _sourceFile: file.name
          }));
          allItems = [...allItems, ...items];
        } else {
          addLog(`Error: AI failed on ${file.name}.`);
          throw new Error(`AI could not process ${file.name} correctly: ${responseData.error}`);
        }
      }
      
      setParsedData(allItems);
      setSelectedRows(new Set(allItems.map((_, i) => i)));
      setStatus({ type: 'success', message: `Analysis complete! Found ${allItems.length} total items.` });
      addLog(`Extraction completely finished.`);
      
    } catch (err) {
      console.error(err);
      addLog(`FATAL ERROR: ${err.message}`);
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

  const toggleRow = (idx) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setSelectedRows(newSet);
  };

  const toggleAll = (check) => {
    if (check) setSelectedRows(new Set(parsedData.map((_, i) => i)));
    else setSelectedRows(new Set());
  };

  // Basic styling for the gadget so it doesn't break external portals
  const gadgetStyles = {
    container: { fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '1200px', margin: '0 auto' },
    btn: { padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    btnPrimary: { backgroundColor: '#0ea5e9', color: 'white' },
    btnSecondary: { backgroundColor: '#e2e8f0', color: '#1e293b' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' },
    th: { backgroundColor: '#f1f5f9', padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' },
    td: { padding: '0.75rem', borderBottom: '1px solid #e2e8f0' },
    input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%' }
  };

  return (
    <div style={gadgetStyles.container}>
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>{title || "AI Data Importer"}</h2>
      <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>{description || "Upload documents to extract data using AI."}</p>

      {status.message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', backgroundColor: status.type === 'error' ? '#fef2f2' : status.type === 'success' ? '#f0fdf4' : '#f0f9ff', color: status.type === 'error' ? '#991b1b' : status.type === 'success' ? '#166534' : '#075985' }}>
          <strong>{status.message}</strong>
        </div>
      )}

      {!parsedData && (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <div 
              style={{ padding: '3rem 2rem', backgroundColor: 'white', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}
              onDragEnter={handleDragOver} onDragLeave={handleDragOver} onDragOver={handleDragOver} onDrop={handleDrop}
            >
              <input 
                type="file" multiple accept=".csv, .xlsx, application/pdf, image/jpeg, image/png"
                onChange={(e) => { if(e.target.files.length > 0) setFiles(Array.from(e.target.files)) }}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                disabled={isParsing}
              />
              
              {isParsing ? (
                <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: '80%', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <Loader2 size={40} color="#0ea5e9" style={{ margin: '0 auto 1rem', display: 'block', animation: 'spin 1s linear infinite' }} />
                    <strong style={{ color: '#0ea5e9' }}>{progressText}</strong>
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
                  <strong style={{ display: 'block', color: '#10b981' }}>{files.length} files selected</strong>
                </div>
              ) : (
                <div>
                  <UploadCloud size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                  <strong>Drag & Drop or Click to Upload</strong>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Supports PDF, Images, Excel, CSV</p>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>Import Profile</label>
              <select 
                value={selectedProfile}
                onChange={(e) => {
                  setSelectedProfile(e.target.value);
                  const profile = PROFILES.find(p => p.id === e.target.value);
                  if (profile) setAiInstructions(profile.rules);
                }}
                style={{ ...gadgetStyles.input, marginBottom: '1rem' }}
              >
                {PROFILES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>Instructions for AI</label>
              <textarea 
                value={aiInstructions}
                onChange={e => setAiInstructions(e.target.value)}
                rows={3}
                style={{ ...gadgetStyles.input, resize: 'vertical' }}
                placeholder="Optional custom instructions..."
              />
            </div>

            <button 
              onClick={processFile} 
              disabled={files.length === 0 || isParsing}
              style={{ ...gadgetStyles.btn, ...gadgetStyles.btnPrimary, marginTop: '1.5rem', opacity: (files.length === 0 || isParsing) ? 0.5 : 1 }}
            >
              Start AI Extraction
            </button>
          </div>

          {files.length > 0 && (
            <div style={{ flex: '1 1 300px', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #cbd5e1' }}>
              <div style={{ padding: '0.5rem 1rem', backgroundColor: 'white', borderBottom: '1px solid #cbd5e1', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>File Options</span>
                <button 
                  onClick={() => setShowDocumentPreview(!showDocumentPreview)}
                  style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  {showDocumentPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              
              {showDocumentPreview ? (
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {previewUrl ? (
                    files[0].type === 'application/pdf' ? (
                      <iframe src={previewUrl} style={{ width: '100%', height: '300px', border: 'none' }} title="PDF Preview" />
                    ) : files[0].name.endsWith('.xlsx') || files[0].name.endsWith('.csv') ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        <FileText size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>Excel data sent to AI.</p>
                      </div>
                    ) : (
                      <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                    )
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No visual preview available.</div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Preview hidden to save resources.<br/>Click "Show Preview" to load.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {parsedData && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button onClick={exportToExcel} style={{ ...gadgetStyles.btn, ...gadgetStyles.btnSecondary }}><FileText size={16} /> Export Excel</button>
            <button onClick={() => setParsedData(null)} style={{ ...gadgetStyles.btn, ...gadgetStyles.btnSecondary }}>Cancel / Upload New</button>
            <div style={{ flex: 1 }}></div>
            <button 
              onClick={handleSave} 
              disabled={selectedRows.size === 0 || isSaving}
              style={{ ...gadgetStyles.btn, ...gadgetStyles.btnPrimary, opacity: selectedRows.size === 0 ? 0.5 : 1 }}
            >
              {isSaving ? 'Saving...' : `Import ${selectedRows.size} Selected Items`}
            </button>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <table style={gadgetStyles.table}>
              <thead>
                <tr>
                  <th style={{ ...gadgetStyles.th, width: '40px', textAlign: 'center' }}>
                    <Checkbox checked={selectedRows.size === parsedData.length} onChange={(e) => toggleAll(e.target.checked)} />
                  </th>
                  <th style={gadgetStyles.th}>Confidence</th>
                  <th style={gadgetStyles.th}>Item Data</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((item, idx) => {
                  const score = item.confidence_score || 0;
                  let confColor = '#10b981';
                  if (score < 50) confColor = '#ef4444';
                  else if (score < 80) confColor = '#f59e0b';

                  return (
                    <tr key={idx} style={{ opacity: selectedRows.has(idx) ? 1 : 0.5, backgroundColor: score < 50 && selectedRows.has(idx) ? '#fef2f2' : 'transparent' }}>
                      <td style={{ ...gadgetStyles.td, textAlign: 'center' }}>
                        <Checkbox checked={selectedRows.has(idx)} onChange={() => toggleRow(idx)} />
                      </td>
                      <td style={{ ...gadgetStyles.td, fontWeight: 'bold', color: confColor }}>{score}%</td>
                      <td style={gadgetStyles.td}>
                        <pre style={{ margin: 0, fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
