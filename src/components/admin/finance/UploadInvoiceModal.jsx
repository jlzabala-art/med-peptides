import React, { useState, useRef } from 'react';
import { FileUp, X, CheckCircle, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { storage, functions } from '../../../firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../context/AuthContext';

export default function UploadInvoiceModal({ onClose, onComplete }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('Bill'); // 'Bill' or 'Invoice'
  
  const [step, setStep] = useState(1); // 1: Upload, 2: Parsing, 3: Review, 4: Success
  const [parsedData, setParsedData] = useState(null);
  const [isPushing, setIsPushing] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setStep(2);
    setError(null);

    try {
      // 1. Upload to temporary storage
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const storagePath = `temp_imports/${user?.uid || 'anonymous'}/${Date.now()}_${safeName}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, file);

      // 2. Call parseUniversalDocument
      const parseUniversalDocument = httpsCallable(functions, 'parseUniversalDocument');
      const response = await parseUniversalDocument({
        storagePath,
        mimeType: file.type,
        context: 'Invoice',
        instructions: `Expected type: ${docType === 'Bill' ? 'Supplier Bill' : 'Customer Invoice'}. Pay attention to totals and line items.`
      });

      if (response.data && response.data.success && response.data.items && response.data.items.length > 0) {
        let extracted = response.data.items[0];
        // Ensure type matches user selection
        extracted.type = docType; 
        setParsedData(extracted);
        setStep(3);
      } else {
        throw new Error("Failed to extract invoice data. The AI returned empty results.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while parsing the document.");
      setStep(1); // Go back to upload step
    }
  };

  const handlePushToZoho = async () => {
    setIsPushing(true);
    setError(null);
    try {
      const pushZohoInvoice = httpsCallable(functions, 'pushZohoInvoice');
      const response = await pushZohoInvoice(parsedData);
      
      if (response.data && response.data.success) {
        setStep(4);
      } else {
        throw new Error("Failed to push to Zoho Books.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error communicating with Zoho Books.");
    } finally {
      setIsPushing(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setParsedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '42rem', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'zoom-in 0.2s ease-out' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary)' }} />
            Upload {docType === 'Bill' ? 'Supplier Bill' : 'Customer Invoice'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}>
            <X style={{ width: '1.5rem', height: '1.5rem' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', maxHeight: '70vh' }}>
          {error && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-error-bg, #fef2f2)', color: 'var(--color-error, #b91c1c)', borderRadius: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{error}</div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Document Type</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="docType" 
                      value="Bill" 
                      checked={docType === 'Bill'} 
                      onChange={() => setDocType('Bill')}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>Supplier Bill (Accounts Payable)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="docType" 
                      value="Invoice" 
                      checked={docType === 'Invoice'} 
                      onChange={() => setDocType('Invoice')}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>Customer Invoice (Accounts Receivable)</span>
                  </label>
                </div>
              </div>

              <div 
                style={{ border: `2px dashed ${file ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', transition: 'colors 0.2s', backgroundColor: file ? 'rgba(59, 130, 246, 0.05)' : 'transparent', cursor: file ? 'default' : 'pointer' }}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }}
                  accept="application/pdf,image/*" 
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText style={{ width: '3rem', height: '3rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
                    <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{file.name}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-error, #ef4444)', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <FileUp style={{ width: '3rem', height: '3rem', color: 'var(--color-text-tertiary)', marginBottom: '0.5rem' }} />
                    <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Click to upload or drag & drop</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>PDF, JPG, PNG (Max 10MB)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem' }}>
              <Loader2 style={{ width: '3rem', height: '3rem', color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>Extracting Data with AI</h3>
              <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '28rem', fontSize: '0.875rem', margin: 0 }}>
                Our Gemini-powered engine is reading the document, mapping line items, and identifying totals. This usually takes a few seconds.
              </p>
            </div>
          )}

          {step === 3 && parsedData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'var(--color-success-bg, #ecfdf5)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-success, #059669)', marginTop: '0.125rem' }} />
                <div>
                  <h4 style={{ fontWeight: 'bold', color: 'var(--color-success-dark, #064e3b)', margin: 0 }}>Extraction Successful</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-success-text, #047857)', marginTop: '0.25rem', marginBottom: 0 }}>
                    AI Confidence Score: <strong>{parsedData.confidence_score}%</strong>. Please review the details below before pushing to Zoho Books.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Entity Name</label>
                  <input 
                    type="text" 
                    value={parsedData.entity_name || ''} 
                    onChange={(e) => handleFieldChange('entity_name', e.target.value)}
                    style={{ width: '100%', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: '500', outline: 'none', color: 'var(--color-text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Invoice/Bill #</label>
                  <input 
                    type="text" 
                    value={parsedData.invoice_number || ''} 
                    onChange={(e) => handleFieldChange('invoice_number', e.target.value)}
                    style={{ width: '100%', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: '500', outline: 'none', color: 'var(--color-text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Date</label>
                  <input 
                    type="date" 
                    value={parsedData.date || ''} 
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    style={{ width: '100%', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: '500', outline: 'none', color: 'var(--color-text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Amount ({parsedData.currency})</label>
                  <input 
                    type="number" 
                    value={parsedData.total_amount || 0} 
                    onChange={(e) => handleFieldChange('total_amount', parseFloat(e.target.value))}
                    style={{ width: '100%', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--color-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Extracted Line Items</label>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  <table style={{ width: '100%', fontSize: '0.875rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '0.75rem' }}>
                      <tr>
                        <th style={{ padding: '0.5rem 1rem' }}>Description</th>
                        <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>Rate</th>
                        <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid var(--color-border)' }}>
                      {(parsedData.line_items || []).map((item, idx) => (
                         <tr key={idx} style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '0.5rem 1rem', fontWeight: '500', color: 'var(--color-text-primary)' }}>{item.description}</td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right', color: 'var(--color-text-secondary)' }}>{item.quantity}</td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right', color: 'var(--color-text-secondary)' }}>{item.rate}</td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: '500', color: 'var(--color-text-primary)' }}>{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '1rem' }}>
              <div style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--color-success-bg, #ecfdf5)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <CheckCircle style={{ width: '2rem', height: '2rem', color: 'var(--color-success, #059669)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>Successfully Synced!</h3>
              <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '28rem', fontSize: '0.875rem', margin: 0 }}>
                The document has been fully parsed and pushed to Zoho Books as a <strong>{docType}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: 'var(--color-bg-secondary)' }}>
          {step === 1 && (
            <button 
              onClick={handleParse}
              disabled={!file}
              style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', cursor: file ? 'pointer' : 'not-allowed', opacity: file ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Parse Document
            </button>
          )}
          {step === 3 && (
            <>
              <button 
                onClick={() => setStep(1)}
                disabled={isPushing}
                style={{ padding: '0.5rem 1rem', color: 'var(--color-text-secondary)', fontWeight: 'bold', backgroundColor: 'transparent', border: 'none', borderRadius: '0.5rem', cursor: isPushing ? 'not-allowed' : 'pointer' }}
              >
                Start Over
              </button>
              <button 
                onClick={handlePushToZoho}
                disabled={isPushing}
                style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--color-success, #059669)', color: 'white', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isPushing ? 'not-allowed' : 'pointer', opacity: isPushing ? 0.5 : 1 }}
              >
                {isPushing && <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />}
                {isPushing ? 'Syncing to Zoho...' : 'Push to Zoho Books'}
              </button>
            </>
          )}
          {step === 4 && (
            <button 
              onClick={() => {
                onComplete();
                onClose();
              }}
              style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--color-text-primary)', color: 'white', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
