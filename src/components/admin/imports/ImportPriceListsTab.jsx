import React, { useState, useRef, useEffect } from 'react';
import { db, storage, functions } from '../../../firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { UploadCloud, CheckCircle, AlertCircle, Loader, DollarSign, Percent, PlusCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useShop } from '../../../context/ShopProvider';

export default function ImportPriceListsTab() {
  const { user } = useAuth();
  const { products } = useShop();
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const [extractedData, setExtractedData] = useState(null);
  const [globalDiscount, setGlobalDiscount] = useState(null);
  const [shippingCost, setShippingCost] = useState(null);
  const [vatPercentage, setVatPercentage] = useState(null);
  const [mappings, setMappings] = useState({});
  const [isApplying, setIsApplying] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      setStatus({ type: 'error', message: 'Please upload an image (PNG, JPG) or PDF of the price list.' });
      return;
    }
    setStatus({ type: '', message: '' });
    setFile(selectedFile);
  };

  const startExtraction = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    setStatus({ type: 'info', message: 'Starting read process...' });
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      setProgress(50);
      setStatus({ type: 'info', message: 'Connecting to AI engine...' });
      try {
        const parsePriceListImage = httpsCallable(functions, 'parsePriceListImage', { timeout: 300000 });
        const aiResult = await parsePriceListImage({
          imageBase64: reader.result,
          mimeType: selectedFile.type,
          instructions: aiInstructions
        });
        
        setProgress(100);
        
        if (aiResult.data?.success) {
          setExtractedData(aiResult.data.items || []);
          setGlobalDiscount(aiResult.data.global_discount_percentage);
          setShippingCost(aiResult.data.shipping_cost);
          setVatPercentage(aiResult.data.vat_percentage);
          
          const initialMappings = {};
          (aiResult.data.items || []).forEach((item, idx) => {
            if (item.suggested_matches && item.suggested_matches.length > 0) {
              initialMappings[idx] = item.suggested_matches[0].productId;
            }
          });
          setMappings(initialMappings);
          setStatus({ type: 'success', message: 'Analysis complete!' });
          
        } else {
          setStatus({ type: 'error', message: 'Error processing the document with AI.' });
        }
      } catch (e) {
        console.error("AI Parse failed:", e);
        setStatus({ type: 'error', message: 'Connection error with the AI engine.' });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMappingChange = (idx, productId) => {
    setMappings(prev => ({ ...prev, [idx]: productId }));
  };

  const handleApply = async () => {
    if (!extractedData) return;
    setIsApplying(true);
    
    try {
      const promises = extractedData.map((item, idx) => {
        const selectedProductId = mappings[idx];
        if (!selectedProductId) return null;
        
        const finalCost = parseFloat(item.unit_price);
        if (isNaN(finalCost)) return null;

        if (selectedProductId === '__CREATE_NEW__') {
          return addDoc(collection(db, 'products'), {
            name: item.peptide_name || item.original_text,
            guestVialPrice: finalCost,
            isActive: false, // Draft by default
            createdAt: serverTimestamp()
          });
        }

        const productRef = doc(db, 'products', selectedProductId);
        return updateDoc(productRef, {
          guestVialPrice: finalCost,
          updatedAt: new Date().toISOString()
        });
      }).filter(Boolean);
      
      await Promise.all(promises);
      setStatus({ type: 'success', message: 'Prices updated successfully!' });
      setExtractedData(null);
      setFile(null);
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'An error occurred while applying prices.' });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>Advanced Price Importer</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Upload invoices or price lists in image or PDF format. The AI will extract quantities, unit prices, totals and map the products to your catalog using fuzzy matching.</p>
        </div>
      </div>

      {status.message && (
        <div style={{
          padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px',
          backgroundColor: status.type === 'error' ? '#fef2f2' : status.type === 'success' ? '#f0fdf4' : '#f0f9ff',
          color: status.type === 'error' ? '#991b1b' : status.type === 'success' ? '#166534' : '#075985',
          border: `1px solid ${status.type === 'error' ? '#fecaca' : status.type === 'success' ? '#bbf7d0' : '#bae6fd'}`,
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {status.type === 'error' ? <X size={20} /> : status.type === 'success' ? <CheckCircle size={20} /> : <Loader size={20} className={uploading || isApplying ? "spin" : ""} />}
          <span style={{ fontWeight: 500 }}>{status.message}</span>
        </div>
      )}

      {!extractedData && (
        <>
          <div 
            style={{
              padding: '3rem 2rem',
              backgroundColor: dragActive ? 'rgba(0,113,189,0.05)' : 'white',
              border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '16px',
              textAlign: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" onChange={(e) => { if(e.target.files[0]) processFile(e.target.files[0]); }} style={{ display: 'none' }} accept=".png,.jpg,.jpeg,.pdf" />
            
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Loader size={40} className="spin" color="var(--primary)" />
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Analyzing with Visual AI...</div>
                <div style={{ width: '200px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s' }}></div>
                </div>
              </div>
            ) : file ? (
              <div>
                <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <strong style={{ display: 'block', fontSize: '1.1rem', color: '#10b981' }}>{file.name}</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <>
                <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Drag your price list here</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Supports screenshots, JPG/PNG photos, or PDF documents</p>
              </>
            )}
          </div>

          {!uploading && (
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
                disabled={uploading}
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
              <button 
                onClick={startExtraction} 
                disabled={!file || uploading}
                className="gcp-btn gcp-btn--primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!file || uploading) ? 0.5 : 1 }}
              >
                {uploading ? <Loader size={16} className="spin" /> : <UploadCloud size={16} />}
                Start AI Extraction
              </button>
            </div>
          )}
        </>
      )}

      {extractedData && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '50%', color: '#22c55e' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Extracted Items</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{extractedData.length}</div>
              </div>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: '#ef4444' }}>
                <Percent size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Global Discount</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{globalDiscount !== null ? `${globalDiscount}%` : 'None'}</div>
              </div>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#3b82f6' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Shipping Cost</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{shippingCost !== null ? `$${shippingCost}` : 'None'}</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Product Mapping</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => { setExtractedData(null); setFile(null); setMappings({}); }}
                  className="gcp-btn gcp-btn--secondary"
                  disabled={isApplying}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApply}
                  className="gcp-btn gcp-btn--primary"
                  disabled={isApplying}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isApplying ? <Loader size={18} className="spin" /> : <Save size={18} />}
                  Apply Import
                </button>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto', padding: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                    <th>Status</th>
                    <th>Original Item (Image)</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Partial Dcto</th>
                    <th>Mapped Catalog Product</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedData.map((item, idx) => {
                    const mappingComplete = !!mappings[idx];
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ textAlign: 'center' }}>
                          {mappingComplete ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                              <CheckCircle size={12} /> Mapped
                            </div>
                          ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                              <AlertCircle size={12} /> Needs Review
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.peptide_name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>"{item.original_text}"</div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{item.quantity || '-'}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>${item.unit_price || '0.00'}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444' }}>{item.partial_discount_percentage ? `-${item.partial_discount_percentage}%` : '-'}</td>
                        <td style={{ padding: '1rem' }}>
                          <select 
                            value={mappings[idx] || ''} 
                            onChange={(e) => handleMappingChange(idx, e.target.value)}
                            style={{ 
                              width: '100%', 
                              padding: '0.6rem', 
                              borderRadius: '8px', 
                              border: `1px solid ${mappings[idx] ? '#4ade80' : '#f59e0b'}`,
                              backgroundColor: mappings[idx] ? '#f0fdf4' : '#fffbeb',
                              outline: 'none',
                              fontWeight: 500
                            }}
                          >
                            <option value="">-- Select Product --</option>
                            <option value="__CREATE_NEW__" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                              + Create as New Product
                            </option>
                            
                            {item.suggested_matches && item.suggested_matches.length > 0 && (
                              <optgroup label="AI Suggestions">
                                {item.suggested_matches.map(sug => {
                                  const prod = products.find(p => p.id === sug.productId);
                                  return prod ? (
                                    <option key={`sug-${sug.productId}`} value={sug.productId}>✨ {prod.name} ({sug.confidence})</option>
                                  ) : null;
                                })}
                              </optgroup>
                            )}
                            
                            <optgroup label="All Catalog">
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </optgroup>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
