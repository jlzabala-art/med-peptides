import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2, Save, X } from 'lucide-react';
import { Card } from '../ui';
import * as XLSX from 'xlsx';

export default function AdminImportHubTab() {
  const [file, setFile] = useState(null);
  const [context, setContext] = useState('RFQ'); // 'RFQ', 'PriceList', 'COA'
  
  const [isParsing, setIsParsing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [parsedData, setParsedData] = useState(null); // Array of items
  
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;
    setIsParsing(true);
    setProgressText('Preparing file...');
    
    try {
      let base64Data = '';
      let mimeType = file.type;

      // Handle Excel locally to avoid sending massive binary blobs to Gemini
      if (
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimeType === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') || file.name.endsWith('.csv')
      ) {
        setProgressText('Reading Excel/CSV...');
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        const validRows = rows.filter(r => Object.values(r).some(v => v !== null && v !== undefined && v.toString().trim() !== ''));
        
        const cleanWorksheet = XLSX.utils.json_to_sheet(validRows);
        const csvContent = XLSX.utils.sheet_to_csv(cleanWorksheet);
        
        // Convert CSV string to base64 for Gemini inlineData
        base64Data = btoa(unescape(encodeURIComponent(csvContent)));
        mimeType = 'text/csv';
      } else {
        // Read PDF or Image as base64
        setProgressText('Reading Document...');
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setProgressText('AI Analyzing Document...');
      const parseUniversal = httpsCallable(functions, 'parseUniversalDocument');
      const response = await parseUniversal({ base64Data, mimeType, context });
      
      if (response.data.success) {
        // Mock reconciliation/diff engine against DB
        // In a real scenario, we'd fetch the DB and compare here
        const items = response.data.items.map(item => ({
          ...item,
          diffStatus: Math.random() > 0.7 ? 'NEW' : (Math.random() > 0.5 ? 'MODIFIED' : 'UNCHANGED')
        }));
        
        setParsedData(items);
      } else {
        alert("Parse Failed");
      }

    } catch (err) {
      console.error(err);
      alert("Error parsing document: " + err.message);
    }
    
    setIsParsing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', label: 'Nuevo' };
      case 'MODIFIED': return { bg: '#fef9c3', text: '#854d0e', border: '#fef08a', label: 'Cambio' };
      case 'UNCHANGED': return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', label: 'Intacto' };
      default: return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', label: 'Alerta' };
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Universal Import Hub
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Upload COAs, RFQs, or Price Lists in any format (Excel, PDF, Image). The AI will extract, normalize, and compare against the database.
          </p>
        </div>
      </div>

      {!parsedData ? (
        <Card style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
            {/* Context Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>1. Select Context</h3>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `2px solid ${context === 'RFQ' ? 'var(--color-primary)' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: context === 'RFQ' ? '#eff6ff' : 'white' }}>
                <input type="radio" name="context" checked={context === 'RFQ'} onChange={() => setContext('RFQ')} style={{ display: 'none' }} />
                <FileText size={20} color={context === 'RFQ' ? 'var(--color-primary)' : '#64748b'} />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-main)' }}>Client RFQ</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Request for Quote (B2B)</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `2px solid ${context === 'PriceList' ? 'var(--color-primary)' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: context === 'PriceList' ? '#eff6ff' : 'white' }}>
                <input type="radio" name="context" checked={context === 'PriceList'} onChange={() => setContext('PriceList')} style={{ display: 'none' }} />
                <FileText size={20} color={context === 'PriceList' ? 'var(--color-primary)' : '#64748b'} />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-main)' }}>Supplier Price List</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Update base catalog costs</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `2px solid ${context === 'COA' ? 'var(--color-primary)' : '#e2e8f0'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: context === 'COA' ? '#eff6ff' : 'white' }}>
                <input type="radio" name="context" checked={context === 'COA'} onChange={() => setContext('COA')} style={{ display: 'none' }} />
                <FileText size={20} color={context === 'COA' ? 'var(--color-primary)' : '#64748b'} />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-main)' }}>Certificate of Analysis</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Audit compliance & purity</span>
                </div>
              </label>
            </div>

            {/* Dropzone */}
            <div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>2. Upload Document</h3>
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ 
                  border: '2px dashed #cbd5e1', 
                  borderRadius: '12px', 
                  padding: '4rem 2rem', 
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative'
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
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Drag & Drop file here</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Supports Excel, CSV, PDF, JPG, PNG</span>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
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
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Reconciliation Diff</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review the extracted data before saving to the database.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setParsedData(null)} className="gcp-btn gcp-btn--secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <X size={16} /> Discard
              </button>
              <button className="gcp-btn gcp-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Confirm & Save
              </button>
            </div>
          </div>
          
          <table className="gcp-table" style={{ width: '100%', fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Extracted Item</th>
                {context === 'RFQ' && <th>Requested Qty</th>}
                {context === 'PriceList' && <th>Unit Cost</th>}
                {context === 'COA' && <th>Purity / Batch</th>}
                <th>Original Text</th>
              </tr>
            </thead>
            <tbody>
              {parsedData.map((item, idx) => {
                const colors = getStatusColor(item.diffStatus);
                return (
                  <tr key={idx}>
                    <td>
                      <span style={{ 
                        backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                        padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {colors.label}
                      </span>
                    </td>
                    <td>
                      <strong>{item.peptide_name}</strong>
                      {item.dosage && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.dosage}</div>}
                    </td>
                    
                    {context === 'RFQ' && (
                      <td>{item.quantity}</td>
                    )}
                    
                    {context === 'PriceList' && (
                      <td>
                        <strong>${item.unit_cost}</strong>
                        {item.moq && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MOQ: {item.moq}</div>}
                      </td>
                    )}
                    
                    {context === 'COA' && (
                      <td>
                        <strong>{item.purity_percentage}%</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Batch: {item.batch_number}</div>
                      </td>
                    )}
                    
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {item.original_text || item.test_results}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
