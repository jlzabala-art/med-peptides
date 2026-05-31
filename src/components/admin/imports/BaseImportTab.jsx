import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../firebase';
import { UploadCloud, FileText, Loader2, Save, X } from 'lucide-react';
import { Card } from '../../ui';
import * as XLSX from 'xlsx';

export default function BaseImportTab({ title, description, context, renderDiffTable, onSave }) {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
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
      setFile(pastedFile);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setIsParsing(true);
    setStatus({ type: 'info', message: 'Starting read process...' });
    setProgressText('Preparing file...');
    
    try {
      let base64Data = '';
      let mimeType = file.type;

      if (
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimeType === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') || file.name.endsWith('.csv')
      ) {
        setProgressText('Reading Excel/CSV...');
        setStatus({ type: 'info', message: 'Converting tabular data...' });
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        const validRows = rows.filter(r => Object.values(r).some(v => v !== null && v !== undefined && v.toString().trim() !== ''));
        
        const cleanWorksheet = XLSX.utils.json_to_sheet(validRows);
        const csvContent = XLSX.utils.sheet_to_csv(cleanWorksheet);
        
        base64Data = btoa(unescape(encodeURIComponent(csvContent)));
        mimeType = 'text/csv';
      } else {
        setProgressText('Reading Document...');
        setStatus({ type: 'info', message: 'Converting document to base64...' });
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setProgressText('AI Analyzing Document...');
      setStatus({ type: 'info', message: 'Connecting to AI Engine...' });
      const parseUniversal = httpsCallable(functions, 'parseUniversalDocument');
      const response = await parseUniversal({ base64Data, mimeType, context, instructions: aiInstructions });
      
      if (response.data.success) {
        const items = response.data.items.map(item => ({
          ...item,
          diffStatus: Math.random() > 0.7 ? 'NEW' : (Math.random() > 0.5 ? 'MODIFIED' : 'UNCHANGED')
        }));
        setParsedData(items);
        setSelectedRows(new Set(items.map((_, i) => i)));
        setStatus({ type: 'success', message: `Analysis complete! Found ${items.length} items.` });
      } else {
        setStatus({ type: 'error', message: 'AI could not process the document correctly.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: "Error processing document: " + err.message });
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
      setFile(null);
      setSelectedRows(new Set());
      setStatus({ type: 'success', message: 'Data successfully imported and saved!' });
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    } catch (err) {
      setStatus({ type: 'error', message: "Error saving: " + err.message });
    }
    setIsSaving(false);
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
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', textAlign: 'center' }}>Upload Document</h3>
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
                accept=".csv, .xlsx, application/pdf, image/jpeg, image/png"
                onChange={(e) => { if(e.target.files.length > 0) setFile(e.target.files[0]) }}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                disabled={isParsing}
              />
              
              {isParsing ? (
                <div>
                  <Loader2 size={48} className="spin" color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
                  <strong style={{ color: 'var(--color-primary)', display: 'block', fontSize: '1.1rem' }}>{progressText}</strong>
                </div>
              ) : file ? (
                <div>
                  <FileText size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: '#10b981' }}>{file.name}</strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
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
                Instructions for AI (Optional)
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
                disabled={!file || isParsing}
                className="gcp-btn gcp-btn--primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!file || isParsing) ? 0.5 : 1 }}
              >
                {isParsing ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
                Start AI Extraction
              </button>
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
              <button onClick={() => setParsedData(null)} className="gcp-btn gcp-btn--secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={isSaving}>
                <X size={16} /> Discard
              </button>
              <button onClick={handleSave} className="gcp-btn gcp-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={isSaving}>
                {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} 
                {isSaving ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
          
          <div style={{ padding: '1rem' }}>
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
        </Card>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}


