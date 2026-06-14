import X from "lucide-react/dist/esm/icons/x";
import UploadCloud from "lucide-react/dist/esm/icons/upload-cloud";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Database from "lucide-react/dist/esm/icons/database";
import Link from "lucide-react/dist/esm/icons/link";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import React, { useState } from 'react';







export default function CatalogImportWizard({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState(null);

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Import Catalog Data</h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Step {step} of 3</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
            {step === 1 && (
              <>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Select Import Source</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div 
                    onClick={() => setSource('csv')}
                    style={{ border: `2px solid ${source === 'csv' ? 'var(--color-primary)' : 'var(--border)'}`, padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: source === 'csv' ? 'rgba(168, 85, 247, 0.05)' : 'white' }}
                  >
                    <FileText size={32} color={source === 'csv' ? 'var(--color-primary)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>CSV / Excel</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload standard spreadsheet templates.</p>
                  </div>

                  <div 
                    onClick={() => setSource('erp')}
                    style={{ border: `2px solid ${source === 'erp' ? 'var(--color-primary)' : 'var(--border)'}`, padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: source === 'erp' ? 'rgba(168, 85, 247, 0.05)' : 'white' }}
                  >
                    <Database size={32} color={source === 'erp' ? 'var(--color-primary)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>ERP Connect</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sync directly from Zoho or SAP.</p>
                  </div>

                  <div 
                    onClick={() => setSource('api')}
                    style={{ border: `2px solid ${source === 'api' ? 'var(--color-primary)' : 'var(--border)'}`, padding: '1.5rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: source === 'api' ? 'rgba(168, 85, 247, 0.05)' : 'white' }}
                  >
                    <Link size={32} color={source === 'api' ? 'var(--color-primary)' : 'var(--text-muted)'} style={{ marginBottom: '1rem' }} />
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Supplier API</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live feed from registered suppliers.</p>
                  </div>

                </div>
              </>
            )}

            {step === 2 && source === 'csv' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <UploadCloud size={40} color="var(--color-primary)" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Upload your file</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Drag and drop your .csv or .xlsx file here.</p>
                <button className="btn btn-outline" style={{ display: 'inline-block' }}>Browse Files</button>
              </div>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Import Successful!</h3>
                <p style={{ color: 'var(--text-muted)' }}>423 items have been added to your catalog intelligence hub.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
            {step > 1 && step < 3 ? (
              <button className="btn btn-outline" onClick={() => setStep(step - 1)}>Back</button>
            ) : <div />}
            {step < 3 ? (
              <button 
                className="btn btn-primary" 
                disabled={!source}
                onClick={() => setStep(step + 1)}
              >
                Continue
              </button>
            ) : (
              <button className="btn btn-primary" onClick={onClose}>Done</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}