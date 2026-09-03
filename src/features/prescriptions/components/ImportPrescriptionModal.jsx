import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle2, Activity, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { prescriptionSchema } from '../../../schemas/prescriptionSchema';
import { resolveIngredients } from '../../../services/apiIngredientMatcher';

export default function ImportPrescriptionModal({ 
  isOpen, 
  onClose, 
  context = {}, 
  title = "Import Prescription",
  onExtractionComplete
}) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    try {
      setUploading(true);
      toast.loading('Analyzing prescription via AI...', { id: 'upload-toast' });

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/ai-extract-prescription', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to analyze document');
      }

      const extractedData = await res.json();
      
      // Save directly to Firestore if no onExtractionComplete callback is provided
      if (onExtractionComplete) {
        onExtractionComplete(extractedData);
        toast.success('Extraction complete!', { id: 'upload-toast' });
      } else {
        // Handle multi-formulation blocks (e.g., Trichotest → TrichoSol + TrichoOil)
        const blocks = extractedData.formulationBlocks && extractedData.formulationBlocks.length > 0 
          ? extractedData.formulationBlocks 
          : [{ 
              treatmentType: null,
              treatmentProgram: null,
              ingredients: extractedData.ingredients || [],
              posology: extractedData.posology || '',
              volume: null,
              dispensingForm: null
            }];

        let totalNewPlaceholders = 0;
        let totalMatchedCatalog = 0;
        const sessionId = blocks.length > 1 ? crypto.randomUUID() : null;

        for (const block of blocks) {
          /**
           * Resolve each ingredient against the product catalog (Algolia).
           * - Match found (≥75% similarity) → use existing productId
           * - No match → create a placeholder 'draft' product in Firestore
           *   with isApiPlaceholder:true for admin follow-up
           */
          const resolved = await resolveIngredients(
            block.ingredients || [],
            { supplierHint: 'Fagron Iberia', importSource: 'fagron_genemocis' }
          );

          const blockNewPlaceholders = resolved.filter(r => r.isPlaceholder && r.isNew).length;
          const blockMatched = resolved.filter(r => !r.isPlaceholder).length;
          totalNewPlaceholders += blockNewPlaceholders;
          totalMatchedCatalog += blockMatched;

          const allResolved = resolved.every(r => r.productId && !r.isPlaceholder);
          const anyUnresolved = resolved.some(r => !r.productId || r.isPlaceholder);

          const mappedItems = resolved.map((r, idx) => ({
            id: `ai_item_${Date.now()}_${idx}`,
            productId: r.productId || null,
            variantId: null,
            productName: r.matchedName || r.original?.name || '',
            sku: '',
            activeIngredient: r.original?.name || '',
            concentration: r.original?.dose || '',
            dosage: r.original?.dose || '',
            dose: r.original?.dose || '',
            quantity: r.original?.quantity || 1,
            price: 0,
            instructions: block.posology || extractedData.posology || '',
            _aiRawName: r.original?.name,
            _aiRawDose: r.original?.dose,
            _isPlaceholder: r.isPlaceholder,
            _needsProductMapping: !r.productId || r.isPlaceholder,
            _matchScore: r.score,
            status: 'Pending',
          }));

          const newRx = {
            ...prescriptionSchema,
            ...context,
            patientName: extractedData.patient || context.patientName || 'Unknown Patient',
            doctorName: extractedData.doctor || context.doctorName || 'Unknown Doctor',
            clinicName: extractedData.clinic || null,
            doctorLicense: extractedData.doctorLicense || null,
            sourceType: 'fagron_genemocis',
            source: 'fagron',
            status: 'draft',
            // 'Ready' if every item was matched to catalog; 'Needs Review' if any placeholder
            validationStatus: anyUnresolved ? 'Needs Review' : 'Ready',
            sessionId,
            treatmentProgram: block.treatmentProgram || null,
            treatmentType: block.treatmentType || null,
            importSource: 'fagron_genemocis',
            posology: block.posology || extractedData.posology || '',
            clinicalIndication: block.posology || '',
            volume: block.volume || null,
            dispensingForm: block.dispensingForm || null,
            items: mappedItems,
            prescriptionLines: mappedItems,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            aiExtraction: {
              completeness: extractedData.completeness || 0,
              missing: extractedData.missing || [],
              rawDate: extractedData.date || null,
              extractedAt: new Date().toISOString(),
              matchSummary: {
                total: resolved.length,
                matched: blockMatched,
                newPlaceholders: blockNewPlaceholders,
              },
            },
          };

          await addDoc(collection(db, 'prescriptions'), newRx);
        }

        // Final toast summary
        const baseMsg = blocks.length > 1
          ? `${blocks.length} formulaciones importadas (${blocks.map(b => b.treatmentType || 'Form.').join(', ')})`
          : 'Prescripción importada';
        const matchMsg = totalMatchedCatalog > 0
          ? ` · ${totalMatchedCatalog} API${totalMatchedCatalog > 1 ? 's' : ''} en catálogo`
          : '';
        const placeholderMsg = totalNewPlaceholders > 0
          ? ` · ${totalNewPlaceholders} placeholder${totalNewPlaceholders > 1 ? 's' : ''} creado${totalNewPlaceholders > 1 ? 's' : ''} (completar en Catálogo)`
          : '';

        toast.success(`${baseMsg}${matchMsg}${placeholderMsg}`, { id: 'upload-toast' });
      }
      
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || 'Failed to analyze document', { id: 'upload-toast' });
    } finally {
      setUploading(false);
    }
  }, [context, onClose, onExtractionComplete]);

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
              Upload a document to automatically parse and extract details instantly.
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
                  Please wait while Gemini Flash analyzes the document.
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
              <strong>Note:</strong> Uploaded prescriptions will be immediately analyzed and mapped into the creation flow.
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
