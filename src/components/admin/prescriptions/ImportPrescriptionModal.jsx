import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle2, Activity, AlertCircle } from 'lucide-react';
import { usePrescriptionAI } from '../../../hooks/shared/usePrescriptionAI';
import toast from 'react-hot-toast';

export default function ImportPrescriptionModal({ 
  isOpen, 
  onClose, 
  context = {}, 
  title = "Import Prescription" 
}) {
  const [uploading, setUploading] = useState(false);
  const { queuePrescription } = usePrescriptionAI();

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    try {
      setUploading(true);
      toast.loading('Uploading and queueing document...', { id: 'upload-toast' });

      // Queue for processing, passing the metadata context
      await queuePrescription(file, 'b2b_portal', context);

      toast.success('Prescription queued for AI processing successfully!', { id: 'upload-toast' });
      onClose(); // Automatically close after successful queueing
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || 'Failed to upload document', { id: 'upload-toast' });
    } finally {
      setUploading(false);
    }
  }, [queuePrescription, context, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
      'application/pdf': ['.pdf'], 
      'image/*': ['.png', '.jpg', '.jpeg'] 
    },
    disabled: uploading
  });

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>{title}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Upload a document to automatically parse and create a draft prescription.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none', border: 'none', padding: '0.5rem',
              cursor: 'pointer', color: '#64748b', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          
          <div 
            {...getRootProps()}
            style={{ 
              background: isDragActive ? '#f0f9ff' : '#fff', 
              border: `2px dashed ${isDragActive ? '#0ea5e9' : '#cbd5e1'}`, 
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.5 : 1,
              transition: 'all 0.2s'
            }}>
            <input {...getInputProps()} />
            
            {uploading ? (
              <>
                <Activity size={48} color="#0ea5e9" style={{ marginBottom: '16px', animation: 'pulse 2s infinite' }} />
                <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1rem' }}>Processing Document...</h3>
                <p style={{ margin: 0, color: '#64748b', textAlign: 'center', fontSize: '0.85rem' }}>
                  Please wait while we upload and queue this for AI extraction.
                </p>
              </>
            ) : (
              <>
                <Upload size={48} color={isDragActive ? '#0ea5e9' : '#94a3b8'} style={{ marginBottom: '16px' }} />
                <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1rem' }}>Drag & Drop or Click to Upload</h3>
                <p style={{ margin: 0, color: '#64748b', textAlign: 'center', fontSize: '0.85rem', marginBottom: '24px' }}>
                  Supported formats: PDF, PNG, JPG, JPEG
                </p>
                <div style={{ 
                  background: '#f0fdfa', 
                  border: '1px solid #14b8a6', 
                  color: '#0f766e', 
                  padding: '6px 12px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px' 
                }}>
                  <CheckCircle2 size={14} /> AI Extraction Enabled
                </div>
              </>
            )}
          </div>
          
          <div style={{
            marginTop: '1.25rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <AlertCircle size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
              <strong>Note:</strong> Uploaded prescriptions will be queued for AI extraction. You can review and approve them in the <strong>Prescription Intake</strong> tab once processing is complete. The document will automatically be linked to the current context.
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
}
