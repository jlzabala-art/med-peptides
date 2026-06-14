import React, { useState } from 'react';
import { X, UploadCloud, ChevronRight, ChevronLeft, Save, Bot, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { extractApiPeptidesFromImage } from '../../../services/atlasAiService';

export default function SmartProductIntakeWizard({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Peptides',
    pricePerGram: 0,
    costPerGram: 0,
    supplier: 'Medipharm',
    stock: 0,
    reorderPoint: 20,
    missingCOA: false,
    missingSDS: false
  });

  if (!isOpen) return null;

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleAiUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessingAI(true);
    const loadingToast = toast.loading("Atlas AI is scanning the document...");
    
    try {
      const items = await extractApiPeptidesFromImage(file);
      if (items && items.length > 0) {
        // Auto-fill with the first item found
        const first = items[0];
        setFormData(prev => ({
          ...prev,
          name: first.peptideName || prev.name,
          pricePerGram: first.pricePerGram || prev.pricePerGram,
          sku: first.peptideName ? `AUTO-${first.peptideName.substring(0,3).toUpperCase()}-001` : prev.sku
        }));
        toast.success("Atlas AI extracted data successfully!", { id: loadingToast });
        handleNext(); // Move to step 2 automatically
      } else {
        toast.error("Atlas AI couldn't find peptide data.", { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to process image.", { id: loadingToast });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleSave = () => {
    toast.success("Product added successfully!");
    onClose();
    // Here we would typically call addProduct(formData)
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', width: '90%', maxWidth: '600px', borderRadius: '12px',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {step === 1 && <Bot size={20} color="#8b5cf6" />}
            {step === 1 ? 'Atlas AI Auto-Fill' : step === 2 ? 'Basic Details' : 'Regulatory & Inventory'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', height: '4px', background: '#f3f4f6' }}>
          <div style={{ width: `${(step / 3) * 100}%`, background: '#8b5cf6', transition: 'width 0.3s ease' }}></div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: '#4b5563', margin: 0 }}>
                Upload a COA, Supplier Invoice, or Label. Atlas AI will extract the peptide name, purity, and pricing for you.
              </p>
              
              <label style={{
                border: '2px dashed #d1d5db', borderRadius: '8px', padding: '3rem 2rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                cursor: 'pointer', width: '100%', background: '#f9fafb', transition: 'all 0.2s'
              }}>
                {isProcessingAI ? (
                  <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid #e5e7eb', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  <>
                    <UploadCloud size={40} color="#9ca3af" />
                    <span style={{ color: '#4b5563', fontWeight: 500 }}>Click or drag file to upload</span>
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>PNG, JPG, PDF up to 10MB</span>
                  </>
                )}
                <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleAiUpload} disabled={isProcessingAI} />
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: 500 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              </div>

              <button onClick={handleNext} className="btn btn-outline" style={{ width: '100%', padding: '0.75rem' }}>
                Skip Auto-Fill (Manual Entry)
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Product Name</label>
                  <input type="text" className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. BPC-157" style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>SKU</label>
                  <input type="text" className="input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="PEP-001" style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Category</label>
                <select className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                  <option>Peptides</option>
                  <option>Longevity</option>
                  <option>Nootropics</option>
                  <option>Testing Kits</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Cost /g ($)</label>
                  <input type="number" className="input" value={formData.costPerGram} onChange={e => setFormData({...formData, costPerGram: parseFloat(e.target.value)})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Retail Price /g ($)</label>
                  <input type="number" className="input" value={formData.pricePerGram} onChange={e => setFormData({...formData, pricePerGram: parseFloat(e.target.value)})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Supplier</label>
                <select className="input" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                  <option>Medipharm</option>
                  <option>Atlas Bio Labs</option>
                  <option>SinoPeptides</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Initial Stock</label>
                  <input type="number" className="input" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Reorder Point</label>
                  <input type="number" className="input" value={formData.reorderPoint} onChange={e => setFormData({...formData, reorderPoint: parseInt(e.target.value)})} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
              </div>

              <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid #fde68a' }}>
                <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#92400e' }}>Regulatory Compliance</h4>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#92400e' }}>
                  <input type="checkbox" checked={formData.missingCOA} onChange={e => setFormData({...formData, missingCOA: e.target.checked})} />
                  Flag as Missing COA (Will lower Health Score)
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#92400e' }}>
                  <input type="checkbox" checked={formData.missingSDS} onChange={e => setFormData({...formData, missingSDS: e.target.checked})} />
                  Flag as Missing SDS
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', background: '#f9fafb' }}>
          <button 
            onClick={handlePrev} 
            disabled={step === 1}
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', 
              background: 'white', color: step === 1 ? '#9ca3af' : '#374151', cursor: step === 1 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 3 ? (
            <button 
              onClick={handleNext}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', 
                background: '#8b5cf6', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              onClick={handleSave}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', 
                background: '#10b981', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <Save size={16} /> Save Product
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
