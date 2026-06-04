import React, { useState } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { extractApiPeptidesFromImage } from '../../services/atlasAiService';
import { X, Upload, Loader2, CheckCircle2, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { Card } from '../../components/ui';

export default function PriceListImportModal({ onClose, onImportSuccess, onAddToRfq, openRfq }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'extracting', 'saving', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStatus('idle');
      setErrorMsg('');
      setExtractedData(null);
      setLogs([]);
    }
  };

  const handleRunAtlasAI = async () => {
    if (!file) return;

    try {
      setStatus('extracting');
      addLog("Initializing Atlas AI Vision Model...");
      
      const data = await extractApiPeptidesFromImage(file);
      
      if (!data || data.length === 0) {
        throw new Error("No peptides were detected in the image.");
      }
      
      addLog(`Atlas AI successfully extracted ${data.length} peptides.`);
      // Attach a default quantity of 1 to each item for the user to edit
      setExtractedData(data.map(item => ({ ...item, quantity: 1, unit: 'g' })));
      setStatus('review');

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to extract data using Atlas AI.");
      setStatus('error');
    }
  };

  const handleSaveToCatalog = async () => {
    if (!extractedData) return;
    
    try {
      setStatus('saving');
      addLog("Starting database cataloging process...");
      let newCount = 0;
      let updateCount = 0;

      const productsRef = collection(db, 'products');

      for (const item of extractedData) {
        addLog(`Processing ${item.peptideName}...`);
        
        // Search for existing API peptide (case insensitive approx via multiple queries or manual filter)
        // Since Firebase doesn't do case-insensitive natively well, we'll fetch all API Peptides and filter in JS
        // for safety and speed given small expected catalog size
        const q = query(productsRef, where('category', '==', 'API Peptide'));
        const snap = await getDocs(q);
        
        const existingDoc = snap.docs.find(d => 
          d.data().name?.toLowerCase() === item.peptideName.toLowerCase()
        );

        if (existingDoc) {
          // Update existing
          await updateDoc(doc(db, 'products', existingDoc.id), {
            supplier: 'Lotusland',
            cost_per_gram: item.pricePerGram,
            updatedAt: new Date()
          });
          updateCount++;
          addLog(`Updated existing API Peptide: ${item.peptideName}`);
        } else {
          // Create new
          await addDoc(productsRef, {
            name: item.peptideName,
            category: 'API Peptide',
            supplier: 'Lotusland',
            unit: 'gram',
            cost_per_gram: item.pricePerGram,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          newCount++;
          addLog(`Created new API Peptide: ${item.peptideName}`);
        }
      }

      addLog(`Process complete. Created: ${newCount}, Updated: ${updateCount}.`);
      setStatus('success');
      
      setTimeout(() => {
        if (onImportSuccess) onImportSuccess();
        onClose();
      }, 3000);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save products to database.");
      setStatus('error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={24} color="#8b5cf6" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Atlas AI Import</h2>
          </div>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* File Selection */}
          {!previewUrl && (
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <input
                type="file"
                id="atlas-image-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="atlas-image-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}>
                  <Upload size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Upload Price List Image</h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>PNG, JPG or JPEG. Atlas AI will automatically extract API Peptides.</p>
                </div>
              </label>
            </div>
          )}

          {/* Preview & Status */}
          {previewUrl && (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: '1' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>

              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Card style={{ padding: '1rem', backgroundColor: '#f8fafc' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Extraction Logs
                  </h4>
                  <div style={{ minHeight: '150px', maxHeight: '200px', overflowY: 'auto', fontSize: '0.85rem', fontFamily: 'monospace', color: '#334155' }}>
                    {logs.length === 0 && <span style={{ color: '#94a3b8' }}>Waiting to start...</span>}
                    {logs.map((log, i) => (
                      <div key={i} style={{ marginBottom: '4px' }}>
                        <span style={{ color: '#94a3b8', marginRight: '8px' }}>[{log.time}]</span>
                        {log.msg}
                      </div>
                    ))}
                  </div>
                </Card>

                {errorMsg && (
                  <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {status === 'idle' && (
                  <button onClick={handleRunAtlasAI} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}>
                    <Sparkles size={18} />
                    Extract Data with Atlas AI
                  </button>
                )}

                {status === 'extracting' && (
                  <button disabled className="btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <Loader2 size={18} className="spin" />
                    Analyzing Image...
                  </button>
                )}

                {status === 'review' && extractedData && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {onAddToRfq && (
                      <button onClick={() => onAddToRfq(extractedData)} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#2563eb', borderColor: '#2563eb' }}>
                        <FileText size={18} />
                        {openRfq ? `Add to Open RFQ` : 'Open in New RFQ'}
                      </button>
                    )}
                    <button onClick={handleSaveToCatalog} className="btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#f3e8ff', color: '#7e22ce', borderColor: '#d8b4fe' }}>
                      Save to Product Catalog
                    </button>
                  </div>
                )}

                {status === 'saving' && (
                  <button disabled className="btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <Loader2 size={18} className="spin" />
                    Cataloging Products...
                  </button>
                )}

                {status === 'success' && (
                  <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    <CheckCircle2 size={20} />
                    Import Complete!
                  </div>
                )}

                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => { setFile(null); setPreviewUrl(null); setStatus('idle'); setExtractedData(null); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                    Upload a different image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Data Preview Table */}
          {extractedData && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                Extracted API Peptides ({extractedData.length})
              </h3>
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>Peptide Name</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>Qty</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>Unit</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>Price/g (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#1e293b', fontWeight: 500 }}>{item.peptideName}</td>
                        <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                          <input
                            type="number" min="1" step="0.001"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...extractedData];
                              updated[idx] = { ...updated[idx], quantity: parseFloat(e.target.value) || 1 };
                              setExtractedData(updated);
                            }}
                            style={{ width: '70px', padding: '0.25rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right' }}
                          />
                        </td>
                        <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                          <select
                            value={item.unit}
                            onChange={(e) => {
                              const updated = [...extractedData];
                              updated[idx] = { ...updated[idx], unit: e.target.value };
                              setExtractedData(updated);
                            }}
                            style={{ padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="vial">vial</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#64748b' }}>${item.pricePerGram?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
