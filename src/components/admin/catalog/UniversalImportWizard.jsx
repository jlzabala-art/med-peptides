import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, FileText, CheckCircle, Package, FlaskConical, Receipt, AlertCircle } from 'lucide-react';

export default function UniversalImportWizard({ isOpen, onClose }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            style={{
              backgroundColor: 'white',
              width: '100%',
              maxWidth: '450px',
              height: '100vh',
              position: 'absolute',
              right: 0,
              top: 0,
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 600 }}>Universal Import Wizard</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>Drop a document and Atlas AI will automatically extract the data.</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
              <div 
                style={{
                  border: `2px dashed ${dragActive ? '#3b82f6' : '#cbd5e1'}`,
                  borderRadius: '16px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: dragActive ? '#eff6ff' : '#f8fafc',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  marginBottom: '24px'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <UploadCloud size={48} color={dragActive ? '#3b82f6' : '#94a3b8'} style={{ margin: '0 auto 16px auto' }} />
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0f172a' }}>
                  {file ? file.name : "Drag & Drop or click to upload"}
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  Supports PDF, PNG, JPG, and Excel
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#334155' }}>Atlas AI can automatically process:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                    <Package size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: '#0f172a' }}>Price Lists</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Creates products & variants</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                    <FlaskConical size={20} color="#8b5cf6" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: '#0f172a' }}>COAs</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Updates batch purity & results</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                    <Receipt size={20} color="#10b981" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: '#0f172a' }}>Supplier Invoices</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Logs purchases & inventory</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                    <FileText size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: '#0f172a' }}>RFQs & Orders</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Extracts requested items</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'auto', background: '#fff' }}>
              <button 
                onClick={onClose}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  backgroundColor: '#fff', 
                  color: '#64748b', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
              <button 
                disabled={!file}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  backgroundColor: file ? '#3b82f6' : '#cbd5e1', 
                  color: '#fff', 
                  fontWeight: 600, 
                  cursor: file ? 'pointer' : 'not-allowed', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}
              >
                Process Document
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
