import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileCheck, Download, FileText, CheckCircle2, Loader2, Eye } from '@/lib/icons';
import DocumentPreviewModal from '../../ui/DocumentPreviewModal';
import * as fb from '../../../firebase';
const storage = fb?.storage;
import {
  enqueuePrescriptionDocReview,
  subscribeToDocAiJob,
  attachDocumentToPrescription
} from '../../../services/prescriptionsService';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

// ── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const ACCEPTED_EXT   = '.pdf,.jpg,.jpeg,.png';
const ACCEPTED_LABEL = 'PDF, JPEG, PNG';

// ── Full Comparison Builder ──────────────────────────────────────────────────
// Each row has a `status`:
//   'match'      → AI read it AND it equals current value (green)
//   'diff'       → AI read it AND it differs (red, actionable)
//   'unverified' → AI did NOT extract a value for this field (grey, neutral)

function fieldStatus(aiVal, currentVal, compareFn) {
  if (!aiVal || aiVal === '—') return 'unverified'; // AI could not extract
  if (!currentVal || currentVal === '—') return 'match'; // AI found something, nothing to compare against
  const equal = compareFn ? compareFn(aiVal, currentVal) : aiVal.toLowerCase().trim() === currentVal.toLowerCase().trim();
  return equal ? 'match' : 'diff';
}

function buildFullComparison(rx, aiData) {
  if (!aiData) return [];
  const rows = [];

  const aiPatient = aiData.patientName || aiData.rxDetails?.patientName;
  const rxPatient = rx?.patientName || rx?.patient?.name;
  if (aiPatient || rxPatient) {
    const status = fieldStatus(aiPatient, rxPatient);
    rows.push({ field: 'patientName', label: 'Patient Name', current: rxPatient || '—', ai: aiPatient || '—', status, isDiff: status === 'diff' });
  }

  const aiDoctor = aiData.doctorName || aiData.rxDetails?.doctorName;
  const rxDoctor = rx?.doctorName || rx?.doctor?.name;
  if (aiDoctor || rxDoctor) {
    const status = fieldStatus(aiDoctor, rxDoctor);
    rows.push({ field: 'doctorName', label: 'Prescribing Doctor', current: rxDoctor || '—', ai: aiDoctor || '—', status, isDiff: status === 'diff' });
  }

  const aiProducts = aiData.matchedProducts || [];
  const rxItems = rx?.items || rx?.compounds || [];
  aiProducts.forEach((aiProd, idx) => {
    const rxItem = rxItems[idx] || rxItems.find(r =>
      r.name?.toLowerCase().includes(aiProd.name?.toLowerCase().split(' ')[0])
    );
    const itemName = rxItem?.name || aiProd.name || `Compound ${idx + 1}`;

    // Dosage — compare AI dosage OR concentration against current dosage/concentration
    const aiDosage = aiProd.dosage || aiProd.concentration;
    const rxDosage = rxItem?.dosage || rxItem?.concentration;
    if (aiDosage || rxDosage) {
      const status = fieldStatus(aiDosage, rxDosage);
      rows.push({ field: `items[${idx}].dosage`, label: `Dosage/Concentration — ${itemName}`, current: rxDosage || '—', ai: aiDosage || '—', status, isDiff: status === 'diff', _itemIdx: idx, _itemKey: 'dosage' });
    }

    // Frequency
    if (aiProd.frequency || rxItem?.frequency) {
      const status = fieldStatus(aiProd.frequency, rxItem?.frequency);
      rows.push({ field: `items[${idx}].frequency`, label: `Frequency — ${itemName}`, current: rxItem?.frequency || '—', ai: aiProd.frequency || '—', status, isDiff: status === 'diff', _itemIdx: idx, _itemKey: 'frequency' });
    }
  });

  return rows;
}

// ── DiffReviewPanel ───────────────────────────────────────────────────────────

function DiffReviewPanel({ docMeta, rx, aiData, onApply, onCancel }) {
  const rows = buildFullComparison(rx, aiData);
  const diffs = rows.filter(r => r.isDiff);
  const [accepted, setAccepted] = useState(() => {
    const m = {};
    diffs.forEach(d => { m[d.field] = false; });
    return m;
  });

  const toggleField = field => setAccepted(prev => ({ ...prev, [field]: !prev[field] }));
  const anyAccepted = Object.values(accepted).some(Boolean);

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(15,23,42,0.10)' }}>
      {/* Header */}
      <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={20} color="#3b82f6" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{docMeta.name}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
              {rows.length === 0
                ? 'AI could not extract readable data from this document'
                : diffs.length > 0
                  ? <>AI detected <strong style={{ color: '#ef4444' }}>{diffs.length} difference{diffs.length !== 1 ? 's' : ''}</strong> · <span style={{ color: '#10b981' }}>{rows.length - diffs.length} matching</span></>
                  : <><strong style={{ color: '#10b981' }}>All {rows.length} fields match</strong> — document is consistent with the current prescription</>}
            </div>
          </div>
          {rows.length > 0 && diffs.length === 0 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <CheckCircle2 size={13} /> Verified
            </div>
          )}
          {rows.length === 0 && (
            <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#92400e', flexShrink: 0 }}>
              ⚠️ No AI data
            </div>
          )}
        </div>
      </div>

      {/* Full Comparison Table — always shown */}
      {rows.length > 0 ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 60px', padding: '0.55rem 1.5rem', background: '#f1f5f9', fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <div>Field</div><div>Current Value</div><div>Document Value (AI)</div><div style={{ textAlign: 'center' }}>Apply</div>
          </div>
          {rows.map((row, i) => {
            const getDotColor = (status) => {
              if (status === 'match') return '#10b981';
              if (status === 'diff') return '#ef4444';
              return '#94a3b8'; // unverified (gray)
            };
            const isMatch = row.status === 'match';
            const isUnverified = row.status === 'unverified';
            return (
              <div
                key={row.field}
                onClick={() => row.isDiff && toggleField(row.field)}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 60px',
                  padding: '0.75rem 1.5rem',
                  borderBottom: i < rows.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'center',
                  cursor: row.isDiff ? 'pointer' : 'default',
                  background: row.isDiff
                    ? (accepted[row.field] ? '#f0fdf4' : '#fff7f7')
                    : (isUnverified ? '#f8fafc' : '#fafffe'),
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: getDotColor(row.status), flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{row.label}</span>
                </div>
                <div style={{ fontSize: '0.83rem', color: isMatch ? '#374151' : '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: '5px', display: 'inline-block' }}>
                  {row.current}
                </div>
                <div style={{
                  fontSize: '0.83rem', fontWeight: isMatch ? 500 : 700,
                  color: isMatch ? '#374151' : (isUnverified ? '#64748b' : '#0f172a'),
                  background: isMatch ? '#f0fdf4' : (isUnverified ? '#f1f5f9' : '#eff6ff'),
                  padding: '3px 8px', borderRadius: '5px', display: 'inline-block',
                  border: isMatch ? '1px solid #bbf7d0' : (isUnverified ? '1px solid #cbd5e1' : '1px solid #bfdbfe')
                }}>
                  {row.ai}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {row.isDiff ? (
                    <div style={{ width: 20, height: 20, borderRadius: '5px', border: accepted[row.field] ? '2px solid #10b981' : '2px solid #cbd5e1', background: accepted[row.field] ? '#10b981' : 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {accepted[row.field] && <CheckCircle2 size={12} color="white" />}
                    </div>
                  ) : (
                    isUnverified ? (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>
                    ) : (
                      <CheckCircle2 size={16} color="#10b981" />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem', marginBottom: '0.35rem' }}>AI analysis unavailable</div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: 300, margin: '0 auto' }}>
            Atlas AI could not extract structured data from this document. You can still save it as a reference attachment.
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '0.55rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
          Cancel
        </button>
        <button
          onClick={() => onApply(diffs, accepted)}
          style={{ padding: '0.55rem 1.4rem', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          {anyAccepted ? `Apply ${Object.values(accepted).filter(Boolean).length} change(s) & Save` : 'Save Document'}
        </button>
      </div>
    </div>
  );
}

// ── Main DocumentsTab ────────────────────────────────────────────────────────

export default function DocumentsTab({ rx, onUpdateRx }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | uploading | processing | reviewing
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingDoc, setPendingDoc] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null); // { url, name }
  const unsubRef = useRef(null);
  const timeoutRef = useRef(null);
  const [docs, setDocs] = useState(rx?.documents || rx?.attachments || []);

  useEffect(() => { setDocs(rx?.documents || rx?.attachments || []); }, [rx?.id]);

  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDrag = e => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = e => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileInput = e => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async file => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`Unsupported file type. Accepted: ${ACCEPTED_LABEL}`);
      return;
    }
    setPhase('uploading');
    setUploadProgress(0);

    try {
      const rxId = rx?.id || 'unknown';
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `prescriptions/${rxId}/docs/${Date.now()}_${safeName}`;
      const storRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', snap => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100), reject, resolve);
      });

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      const docMeta = {
        name: file.name,
        url: downloadURL,
        storagePath,
        type: file.type.includes('pdf') ? 'PDF' : 'Image',
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.displayName || user?.email || 'Admin'
      };
      setPendingDoc(docMeta);
      setPhase('processing');

      // Queue AI job
      const jobId = `rx_doc_${Date.now()}_${rxId}`;
      await enqueuePrescriptionDocReview(jobId, {
        from: user?.email || 'admin@regenpept.com',
        to: 'system@regenpept.com',
        subject: `Prescription Document Review: ${file.name}`,
        textBody: `Analyze document and compare with prescription ${rxId}.`,
        htmlBody: '',
        attachments: [{ name: file.name, contentType: file.type, path: storagePath, url: downloadURL }],
        prescriptionId: rxId,
        patientName: rx?.patientName || rx?.patient?.name || ''
      });

      // Timeout fallback after 45s
      timeoutRef.current = setTimeout(() => {
        if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
        setAiResult(null);
        setPhase('reviewing');
        toast('AI did not respond in time. You can still save the document.', { icon: '⏱️' });
      }, 45000);

      // Listen for AI completion
      unsubRef.current = subscribeToDocAiJob(jobId, data => {
        if (['ai_processed', 'completed', 'needs_review'].includes(data.status)) {
          clearTimeout(timeoutRef.current);
          if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
          const aiInterp = data.aiInterpretation || {};
          const extracted = aiInterp.extractedData || {};
          let rxDetails = extracted.prescriptionDetails || {};
          let products = extracted.products || [];
          if (extracted.prescriptions?.length > 0) {
            rxDetails = extracted.prescriptions[0].prescriptionDetails || rxDetails;
            products = extracted.prescriptions[0].products || products;
          }
          setAiResult({
            patientName: rxDetails.patientName || data.customerDetection?.name,
            doctorName: rxDetails.doctorName,
            matchedProducts: products.map(p => ({
              name: p.name,
              dosage: p.dosage,
              concentration: p.concentration, // ← now passed through
              frequency: p.frequency
            })),
            rxDetails
          });
          setPhase('reviewing');
        } else if (data.status === 'ai_failed') {
          clearTimeout(timeoutRef.current);
          if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
          setAiResult(null);
          setPhase('reviewing');
          toast('AI could not analyze the document. You can still save it.', { icon: '⚠️' });
        }
      });

    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed: ' + err.message);
      setPhase('idle');
    }
  };

  const handleApplyDiff = async (diffs, accepted) => {
    try {
      const rxId = rx?.id;
      if (!rxId) throw new Error('No prescription ID');
      const updates = {};
      const appliedFields = [];

      diffs.forEach(d => {
        if (!accepted[d.field]) return;
        appliedFields.push(d.label);
        if (d._itemKey) {
          const updatedItems = [...(rx?.items || rx?.compounds || [])];
          if (updatedItems[d._itemIdx]) updatedItems[d._itemIdx] = { ...updatedItems[d._itemIdx], [d._itemKey]: d.ai };
          updates.items = updatedItems;
        } else {
          updates[d.field] = d.ai;
        }
      });

      const author = user?.displayName || user?.email || 'Admin';
      const { newDoc } = await attachDocumentToPrescription(rxId, pendingDoc, !!aiResult, appliedFields, updates, author);

      const updatedDocs = [...docs, newDoc];
      setDocs(updatedDocs);
      if (onUpdateRx) onUpdateRx({ ...rx, documents: updatedDocs, ...updates });

      toast.success(`Document saved${appliedFields.length > 0 ? ` · ${appliedFields.length} field(s) updated` : ''}!`);
      setPendingDoc(null); setAiResult(null); setPhase('idle');
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save: ' + err.message);
    }
  };

  const handleCancelReview = () => {
    setPendingDoc(null); setAiResult(null); setPhase('idle');
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (phase === 'reviewing' && pendingDoc) {
    return <DiffReviewPanel docMeta={pendingDoc} rx={rx} aiData={aiResult} onApply={handleApplyDiff} onCancel={handleCancelReview} />;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Document Count Header */}
        {docs.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)', borderRadius: '12px', border: '1px solid #c7d2fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#3730a3', fontSize: '0.95rem' }}>
                  {docs.length} Document{docs.length !== 1 ? 's' : ''} Attached
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6366f1' }}>
                  {docs.length > 1 ? `${docs.length} versions uploaded — latest is v${docs.length}` : 'v1 · First upload'}
                </div>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: '#6366f1', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Upload size={13} /> Add Version
            </button>
          </div>
        )}

        {/* Upload Zone */}
        <div
          style={{ padding: '2.5rem 2rem', border: `2px dashed ${dragActive ? '#6366f1' : '#e2e8f0'}`, borderRadius: '14px', background: dragActive ? 'rgba(99,102,241,0.04)' : '#fafafa', textAlign: 'center', transition: 'all 0.2s', cursor: phase === 'idle' ? 'pointer' : 'default' }}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => phase === 'idle' && fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept={ACCEPTED_EXT} onChange={handleFileInput} style={{ display: 'none' }} />

          {phase === 'idle' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Upload size={26} color="#6366f1" />
              </div>
              <h3 style={{ margin: '0 0 0.35rem', color: '#334155', fontWeight: 700, fontSize: '1rem' }}>
                {docs.length > 0 ? 'Upload New Version' : 'Attach Clinical Document'}
              </h3>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.83rem', color: '#94a3b8', maxWidth: 320, marginInline: 'auto' }}>
                Drag & drop a file or click to browse. Accepts <strong>{ACCEPTED_LABEL}</strong>.
                {docs.length > 0 && <> Each upload is saved as a new version (v{docs.length + 1}).</>}
              </p>
              <button onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }} style={{ padding: '0.6rem 1.35rem', borderRadius: '8px', background: '#6366f1', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={14} /> Select File
              </button>
            </>
          )}

          {phase === 'uploading' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Loader2 size={32} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ fontWeight: 700, color: '#334155' }}>Uploading file...</div>
              <div style={{ width: '100%', maxWidth: 320, height: 8, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#6366f1', transition: 'width 0.3s', borderRadius: 10 }} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{Math.round(uploadProgress)}%</div>
            </div>
          )}

          {phase === 'processing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid #e0e7ff', borderTop: '3px solid #6366f1', animation: 'spin 1s linear infinite', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✨</div>
              </div>
              <div style={{ fontWeight: 700, color: '#334155' }}>Atlas AI analyzing document...</div>
              <div style={{ fontSize: '0.82rem', color: '#6366f1', background: '#eff6ff', padding: '0.4rem 1rem', borderRadius: '20px' }}>
                Extracting clinical data and comparing with current prescription
              </div>
            </div>
          )}
        </div>

        {/* Documents List */}
        {docs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[...docs].reverse().map((d, revIdx) => {
              const versionNum = docs.length - revIdx; // newest first = highest version
              const isLatest = revIdx === 0;
              return (
                <div
                  key={revIdx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.85rem 1.25rem',
                    background: isLatest ? '#fafffe' : 'white',
                    border: `1px solid ${isLatest ? '#a7f3d0' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    position: 'relative'
                  }}
                >
                  {/* Version Badge */}
                  <div style={{
                    width: 38, height: 38, borderRadius: '9px',
                    background: isLatest ? '#10b981' : '#f1f5f9',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: isLatest ? 'rgba(255,255,255,0.8)' : '#94a3b8', lineHeight: 1 }}>v</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: isLatest ? 'white' : '#475569', lineHeight: 1 }}>{versionNum}</span>
                  </div>

                  {/* File Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.87rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                        {d.name || `Document ${versionNum}`}
                      </span>
                      {isLatest && (
                        <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.63rem', fontWeight: 700, padding: '1px 7px', borderRadius: '10px', whiteSpace: 'nowrap' }}>Latest</span>
                      )}
                      {d.analyzedByAI && (
                        <span style={{ background: '#eff6ff', color: '#6366f1', fontSize: '0.63rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>✨ AI</span>
                      )}
                      {d.appliedFields?.length > 0 && (
                        <span style={{ background: '#f0fdf4', color: '#10b981', fontSize: '0.63rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>{d.appliedFields.length} field(s) applied</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span>{d.type || 'File'}</span>
                      <span>·</span>
                      <span>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown date'}</span>
                      {d.uploadedBy && <><span>·</span><span>{d.uploadedBy}</span></>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    {d.url && (
                      <button
                        onClick={() => setPreviewDoc({ url: d.url, name: d.name || `v${versionNum}` })}
                        title="Preview"
                        style={{ padding: '0.4rem 0.65rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        <Eye size={13} /> Preview
                      </button>
                    )}
                    {d.url && (
                      <a
                        href={d.url} target="_blank" rel="noreferrer"
                        title="Download"
                        style={{ padding: '0.4rem 0.55rem', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {docs.length === 0 && phase === 'idle' && (
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#cbd5e1', marginTop: '-0.5rem' }}>
            No documents attached yet.
          </p>
        )}

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        fileUrl={previewDoc?.url}
        title={previewDoc?.name || 'Document Preview'}
      />
    </>
  );
}
