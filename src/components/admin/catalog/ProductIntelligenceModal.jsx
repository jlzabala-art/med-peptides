import React, { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, AlertTriangle, FileText, CheckCircle, Brain } from 'lucide-react';

export default function ProductIntelligenceModal({ isOpen, onClose, product }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(t);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const cost = product.costPerGram || 0;
  const price = product.pricePerGram || 0;
  const margin = price > 0 ? ((price - cost) / price * 100).toFixed(1) : 0;

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
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f46e5' }}>
            <Sparkles size={20} color="#8b5cf6" />
            Atlas AI Insights for {product.name}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
            <X size={20} color="#6b7280" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {loading ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 0' }}>
                <Brain size={40} color="#8b5cf6" style={{ animation: 'pulse 2s infinite' }} />
                <p style={{ color: '#6b7280', margin: 0 }}>Analyzing clinical data, pricing, and inventory trends...</p>
             </div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Pricing Intelligence */}
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
                   <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                     <TrendingUp size={18} color="#3b82f6" /> Pricing & Market Position
                   </h3>
                   <p style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '0.9rem' }}>
                     Current margin is <strong>{margin}%</strong>. 
                     {margin < 40 ? " Atlas AI warns this margin is below the 40% industry average for research peptides." : " This is a healthy margin."}
                   </p>
                </div>

                {/* Regulatory / Compliance */}
                <div style={{ background: product.missingCOA || product.missingSDS ? '#fef2f2' : '#f0fdf4', borderRadius: '8px', padding: '1.25rem', border: `1px solid ${product.missingCOA || product.missingSDS ? '#fecaca' : '#bbf7d0'}` }}>
                   <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: product.missingCOA || product.missingSDS ? '#991b1b' : '#166534' }}>
                     {product.missingCOA || product.missingSDS ? <AlertTriangle size={18} /> : <CheckCircle size={18} />} 
                     Regulatory Compliance
                   </h3>
                   {product.missingCOA || product.missingSDS ? (
                     <p style={{ margin: '0 0 0.5rem 0', color: '#991b1b', fontSize: '0.9rem' }}>
                       Critical documents missing! {product.missingCOA && "COA is missing. "} {product.missingSDS && "SDS is missing."}
                       You cannot sell this product to professional channels until uploaded.
                     </p>
                   ) : (
                     <p style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '0.9rem' }}>
                       All required clinical and safety documents (COA, SDS) are present. Health score is optimal.
                     </p>
                   )}
                </div>

                {/* Recommendations */}
                <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '1.25rem', border: '1px solid #fde68a' }}>
                   <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e' }}>
                     <FileText size={18} color="#d97706" /> Clinical Suggestions
                   </h3>
                   <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400e', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <li>Atlas AI identified this as a <strong>{product.category || 'Peptide'}</strong>. Suggested to bundle with synergistic compounds.</li>
                     <li>Auto-generate a Patient Protocol for this item to increase adoption by prescribers.</li>
                   </ul>
                </div>

             </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
