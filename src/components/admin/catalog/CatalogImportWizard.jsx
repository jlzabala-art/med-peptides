import X from "lucide-react/dist/esm/icons/x";
import UploadCloud from "lucide-react/dist/esm/icons/upload-cloud";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Database from "lucide-react/dist/esm/icons/database";
import Link from "lucide-react/dist/esm/icons/link";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import React, { useState } from 'react';
import GadgetImportTab from '../../../gadgets/GadgetImportTab';
import { db } from '../../../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function CatalogImportWizard({ isOpen, onClose }) {
  const [step, setStep] = useState(2);
  const [source, setSource] = useState('ai');
  const [importedCount, setImportedCount] = useState(0);

  if (!isOpen) return null;

  const handleAISave = async (items) => {
    try {
      for (const item of items) {
        const docRef = doc(collection(db, 'products'));
        // Clean up the confidence_score and _sourceFile before saving
        const { confidence_score, _sourceFile, ...cleanItem } = item;
        
        // Ensure SKU is unique if not provided
        if (!cleanItem.sku || cleanItem.sku.trim() === '') {
          const prefix = (cleanItem.name || 'UNK').replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
          const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
          cleanItem.sku = `SKU-${prefix}-${randomCode}`;
        }

        await setDoc(docRef, {
          ...cleanItem,
          status: 'Active',
          inventoryLevel: 0,
          createdAt: new Date().toISOString()
        });
      }
      setImportedCount(items.length);
      setStep(3);
    } catch (err) {
      console.error("Save error: ", err);
      throw new Error("Failed to write to database: " + err.message);
    }
  };

  const handleClose = () => {
    setStep(2);
    setSource('ai');
    setImportedCount(0);
    onClose();
  };

  return (
    <>
      <div 
        onClick={handleClose}
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
            maxWidth: source === 'ai' && step === 2 ? '1000px' : '600px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            transition: 'max-width 0.3s ease',
            animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Import Catalog Data</h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>Step {step} of 3</p>
            </div>
            <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #64748b)' }}>
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
            {step === 2 && source === 'ai' && (
              <div style={{ margin: '-1rem' }}>
                <GadgetImportTab 
                  title="Atlas AI Parser"
                  description="Upload vendor price lists, product catalogs, or unstructured data."
                  context="Catalog Import"
                  apiUrl="https://us-central1-med-peptides-app.cloudfunctions.net/apiParseDocument"
                  onSave={handleAISave}
                />
              </div>
            )}

            {step === 2 && source !== 'ai' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <UploadCloud size={40} color="var(--color-primary, #6366f1)" />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Upload your file</h3>
                <p style={{ color: 'var(--text-muted, #64748b)', marginBottom: '2rem' }}>Drag and drop your file here.</p>
                <button className="btn btn-outline" style={{ display: 'inline-block' }}>Browse Files</button>
              </div>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem', display: 'inline-block' }} />
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Import Successful!</h3>
                <p style={{ color: 'var(--text-muted, #64748b)' }}>{importedCount} items have been securely added to your catalog intelligence hub.</p>
              </div>
            )}
          </div>

          {/* Footer (Only show generic buttons if not in AI step, because AI gadget has its own action bar) */}
          {!(step === 2 && source === 'ai') && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', borderTop: '1px solid var(--color-border, #e2e8f0)', backgroundColor: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
              {step > 1 && step < 3 ? (
                <button 
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 600 }} 
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
              ) : <div />}
              {step < 3 ? (
                <button 
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: source ? 'var(--color-primary, #6366f1)' : '#cbd5e1', color: 'white', cursor: source ? 'pointer' : 'not-allowed', fontWeight: 600 }} 
                  disabled={!source}
                  onClick={() => setStep(step + 1)}
                >
                  Continue
                </button>
              ) : (
                <button 
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--color-primary, #6366f1)', color: 'white', cursor: 'pointer', fontWeight: 600 }} 
                  onClick={handleClose}
                >
                  Done
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}