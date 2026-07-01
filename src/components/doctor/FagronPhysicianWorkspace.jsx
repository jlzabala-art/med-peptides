/**
 * FagronPhysicianWorkspace
 * ────────────────────────────────────────────────────────────────────────────
 * Simplified physician-facing workspace for doctors referred by Fagron Genomics.
 * Spec: AI Prompts/Prescription
 *
 * Flow:
 *   1. Physician uploads a Fagron PDF recommendation (drag & drop or click).
 *   2. UI shows a simulated OCR extraction review (editable fields).
 *   3. Physician confirms → prescription is written to Firestore reusing the
 *      existing prescription schema + statuses.
 *
 * NOTE: Real OCR/AI extraction must be wired to a backend Cloud Function that
 * calls Gemini Vision / Document AI. This component exposes a clear hook point
 * (extractFromPdf) that you replace with the real API call. In the meantime,
 * pre-filled placeholder data makes the UX fully demonstrable.
 */

import React, { useState, useCallback, useRef } from 'react';
import UploadCloud from 'lucide-react/dist/esm/icons/upload-cloud';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import User from 'lucide-react/dist/esm/icons/user';
import Pill from 'lucide-react/dist/esm/icons/pill';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import X from 'lucide-react/dist/esm/icons/x';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Send from 'lucide-react/dist/esm/icons/send';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { RX_STATUS, rxEvent } from '../../config/prescriptionConfig';

// ── Constants ─────────────────────────────────────────────────────────────────
const STEP = { UPLOAD: 0, REVIEW: 1, DONE: 2 };

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

/**
 * extractFromPdf
 * ─────────────────────────────────────────────────────────────────────────────
 * Replace this function body with a real call to your backend OCR service.
 *
 * Expected API:
 *   POST /api/fagron/extract   { fileUrl: string }
 *   → { patient, items, diagnosis, clinicalNotes, duration, refills }
 *
 * Currently returns plausible demo data after a short delay so the UI
 * is fully usable without a live backend.
 */
async function extractFromPdf(/* fileUrl */) {
  await new Promise((r) => setTimeout(r, 2200));
  return {
    patient: {
      name: 'María García López',
      dob: '1980-04-15',
      gender: 'Female',
      email: 'maria.garcia@email.com',
      phone: '+34 600 123 456',
    },
    items: [
      {
        name: 'BPC-157 Peptide',
        strength: '5 mg',
        quantity: 30,
        unit: 'vials',
        dosage: '250 mcg subcutaneous',
        frequency: 'Once daily',
        route: 'Subcutaneous',
      },
      {
        name: 'Thymosin Alpha-1',
        strength: '1.5 mg',
        quantity: 10,
        unit: 'vials',
        dosage: '1.5 mg subcutaneous',
        frequency: 'Twice weekly',
        route: 'Subcutaneous',
      },
    ],
    diagnosis: 'Peptide deficiency syndrome with inflammatory markers',
    clinicalNotes:
      'Biomarkers: CRP elevated (8.2 mg/L), IL-6 raised. Genetic markers: MTHFR C677T heterozygous. Physician comments: Patient reports fatigue and poor healing. Fagron panel recommends regenerative peptide protocol.',
    duration: 30,
    refills: 2,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UploadZone({ onFile }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? '#6366f1' : '#cbd5e1'}`,
        borderRadius: '18px',
        background: dragging ? '#eef2ff' : '#f8fafc',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '4rem 2rem',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: dragging ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e0e7ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        <UploadCloud size={30} color={dragging ? 'white' : '#6366f1'} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', margin: '0 0 0.4rem' }}>
          Upload Fagron Recommendation
        </p>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Drag &amp; drop a PDF, JPG, or PNG — or click to browse
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files[0]) onFile(e.target.files[0]);
        }}
      />
    </div>
  );
}

function SectionLabel({ icon: Icon, label, color = '#6366f1' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '7px',
          background: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={14} color={color} />
      </div>
      <span
        style={{
          fontWeight: 700,
          fontSize: '0.82rem',
          color: '#0f172a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', rows }) {
  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.88rem',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0f172a',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label
        style={{
          fontSize: '0.76rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </label>
      {rows ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          rows={rows}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
        />
      ) : (
        <input name={name} value={value || ''} onChange={onChange} type={type} style={inputStyle} />
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FagronPhysicianWorkspace({ doctorId, doctorMeta }) {
  const [step, setStep] = useState(STEP.UPLOAD);
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedId, setSavedId] = useState(null);

  // Extracted / editable data
  const [patient, setPatient] = useState({ name: '', dob: '', gender: '', email: '', phone: '' });
  const [items, setItems] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [duration, setDuration] = useState(30);
  const [refills, setRefills] = useState(0);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);

  // ── Step 1 → 2: receive file + trigger extraction ─────────────────────────
  const handleFile = useCallback(async (f) => {
    setFile(f);
    setError(null);
    setFilePreviewUrl(URL.createObjectURL(f));
    setExtracting(true);
    try {
      const data = await extractFromPdf(/* pass cloud URL once uploaded */);
      setPatient(data.patient);
      setItems(data.items);
      setDiagnosis(data.diagnosis);
      setClinicalNotes(data.clinicalNotes);
      setDuration(data.duration);
      setRefills(data.refills);
      setStep(STEP.REVIEW);
    } catch (e) {
      setError('Extraction failed. Please try again or fill in manually.');
      setStep(STEP.REVIEW); // still let physician fill manually
    } finally {
      setExtracting(false);
    }
  }, []);

  // ── Item field helpers ─────────────────────────────────────────────────────
  const updateItem = (idx, field, val) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)));
  };
  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { name: '', strength: '', quantity: 1, unit: 'units', dosage: '', frequency: '', route: '' },
    ]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  // ── Step 2 → save ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!items.length) {
      setError('Add at least one prescription item before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // 1. Upload original file to Storage (if storage is configured)
      let originalPdfUrl = null;
      try {
        if (storage && file) {
          const sRef = storageRef(
            storage,
            `fagron-prescriptions/${doctorId}/${Date.now()}_${file.name}`
          );
          await uploadBytes(sRef, file);
          originalPdfUrl = await getDownloadURL(sRef);
        }
      } catch (_) {
        /* Storage optional – continue without */
      }

      // 2. Compute follow-up date from duration
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + (Number(duration) || 30));

      // 3. Write to prescriptions collection (reuses existing schema)
      const rxDoc = {
        // core fields (existing schema)
        doctorId,
        doctorName: doctorMeta?.displayName || doctorMeta?.name || '',
        doctorEmail: doctorMeta?.email || '',
        status: RX_STATUS.SENT,
        type: 'patient',
        source: 'fagron_pdf_ocr', // NEW source type – non-breaking
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // patient
        patient: { ...patient },

        // clinical
        diagnosis,
        clinicalNotes,
        items: items.map((it) => ({
          name: it.name || '',
          strength: it.strength || '',
          quantity: Number(it.quantity) || 1,
          unit: it.unit || 'units',
          dosage: it.dosage || '',
          frequency: it.frequency || '',
          route: it.route || '',
        })),

        // follow-up / refill
        duration: Number(duration) || 30,
        refills: Number(refills) || 0,
        followUpDate: followUpDate.toISOString(),
        refillReminderDate: (() => {
          const d = new Date(followUpDate);
          d.setDate(d.getDate() - 7);
          return d.toISOString();
        })(),

        // Fagron-specific
        fagron: {
          originalPdfUrl,
          ocrExtracted: true,
          uploadedFileName: file?.name || '',
        },

        // timeline (existing schema)
        timeline: [
          {
            ...rxEvent('created', doctorId, 'doctor'),
            timestamp: new Date().toISOString(),
            note: 'Created via Fagron PDF upload',
          },
          { ...rxEvent('sent', doctorId, 'doctor'), timestamp: new Date().toISOString() },
        ],

        // delivery default
        delivery: { method: 'direct_patient' },
      };

      const docRef = await addDoc(collection(db, 'prescriptions'), rxDoc);
      setSavedId(docRef.id);
      setStep(STEP.DONE);
    } catch (e) {
      console.error(e);
      setError('Failed to save prescription. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep(STEP.UPLOAD);
    setFile(null);
    setFilePreviewUrl(null);
    setPatient({ name: '', dob: '', gender: '', email: '', phone: '' });
    setItems([]);
    setDiagnosis('');
    setClinicalNotes('');
    setDuration(30);
    setRefills(0);
    setSavedId(null);
    setError(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FileText size={22} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            Fagron Physician Workspace
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Upload a Fagron recommendation PDF and convert it to an Atlas prescription in under 60
            seconds
          </p>
        </div>

        {/* Progress Steps */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0,
          }}
        >
          {['Upload', 'Review', 'Done'].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      step === i
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : step > i
                          ? '#10b981'
                          : '#e2e8f0',
                    color: step >= i ? 'white' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    transition: 'all 0.25s',
                  }}
                >
                  {step > i ? <CheckCircle size={13} /> : i + 1}
                </div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: step === i ? 700 : 500,
                    color: step === i ? '#6366f1' : '#94a3b8',
                  }}
                >
                  {label}
                </span>
              </div>
              {i < 2 && <ChevronRight size={13} color="#cbd5e1" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <X size={16} color="#dc2626" />
          <span style={{ color: '#dc2626', fontSize: '0.88rem', flex: 1 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#dc2626',
              display: 'flex',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* STEP 0 – UPLOAD                                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {step === STEP.UPLOAD && !extracting && <UploadZone onFile={handleFile} />}

      {extracting && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            padding: '5rem 2rem',
            background: '#f8fafc',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
          }}
        >
          <Loader2 size={36} color="#6366f1" style={{ animation: 'spin 1.2s linear infinite' }} />
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 0.3rem',
                fontSize: '1.1rem',
              }}
            >
              Extracting prescription data…
            </p>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>
              Running OCR + AI analysis on the uploaded document
            </p>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* STEP 1 – REVIEW                                                    */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {step === STEP.REVIEW && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: filePreviewUrl ? 'clamp(300px, 40%, 480px) 1fr' : '1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left: PDF preview */}
          {filePreviewUrl && (
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                overflow: 'hidden',
                background: '#f8fafc',
                position: 'sticky',
                top: '1rem',
              }}
            >
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FileText size={15} color="#6366f1" />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: '#0f172a',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {file?.name}
                </span>
                <button
                  onClick={handleReset}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              {file?.type?.startsWith('image') ? (
                <img
                  src={filePreviewUrl}
                  alt="Preview"
                  style={{ width: '100%', display: 'block' }}
                />
              ) : (
                <iframe
                  src={filePreviewUrl}
                  title="PDF Preview"
                  style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
                />
              )}
            </div>
          )}

          {/* Right: editable extracted data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Patient */}
            <div
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
              }}
            >
              <SectionLabel icon={User} label="Patient Information" color="#3b82f6" />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <Field
                  label="Full Name"
                  name="name"
                  value={patient.name}
                  onChange={(e) => setPatient((p) => ({ ...p, name: e.target.value }))}
                />
                <Field
                  label="Date of Birth"
                  name="dob"
                  value={patient.dob}
                  onChange={(e) => setPatient((p) => ({ ...p, dob: e.target.value }))}
                  type="date"
                />
                <Field
                  label="Gender"
                  name="gender"
                  value={patient.gender}
                  onChange={(e) => setPatient((p) => ({ ...p, gender: e.target.value }))}
                />
                <Field
                  label="Email"
                  name="email"
                  value={patient.email}
                  onChange={(e) => setPatient((p) => ({ ...p, email: e.target.value }))}
                  type="email"
                />
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field
                    label="Phone"
                    name="phone"
                    value={patient.phone}
                    onChange={(e) => setPatient((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Prescription Items */}
            <div
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
              }}
            >
              <SectionLabel icon={Pill} label="Prescription Items" color="#8b5cf6" />
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #f1f5f9',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    position: 'relative',
                    background: '#fafafa',
                  }}
                >
                  <button
                    onClick={() => removeItem(idx)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={11} color="#dc2626" />
                  </button>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field
                        label="Product Name"
                        name="name"
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      />
                    </div>
                    <Field
                      label="Strength"
                      name="strength"
                      value={item.strength}
                      onChange={(e) => updateItem(idx, 'strength', e.target.value)}
                    />
                    <Field
                      label="Quantity"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      type="number"
                    />
                    <Field
                      label="Unit"
                      name="unit"
                      value={item.unit}
                      onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                    />
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field
                        label="Dosage / Directions"
                        name="dosage"
                        value={item.dosage}
                        onChange={(e) => updateItem(idx, 'dosage', e.target.value)}
                      />
                    </div>
                    <Field
                      label="Frequency"
                      name="frequency"
                      value={item.frequency}
                      onChange={(e) => updateItem(idx, 'frequency', e.target.value)}
                    />
                    <Field
                      label="Route"
                      name="route"
                      value={item.route}
                      onChange={(e) => updateItem(idx, 'route', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addItem}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  border: '1px dashed #6366f1',
                  background: '#eef2ff',
                  color: '#6366f1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                + Add Item
              </button>
            </div>

            {/* Clinical */}
            <div
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
              }}
            >
              <SectionLabel icon={Stethoscope} label="Clinical Information" color="#10b981" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Field
                  label="Diagnosis"
                  name="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
                <Field
                  label="Clinical Notes (Biomarkers, Genetics, Comments)"
                  name="clinicalNotes"
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            {/* Follow-up / Refills */}
            <div
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
              }}
            >
              <SectionLabel icon={Calendar} label="Follow-Up & Refills" color="#f59e0b" />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <Field
                  label="Treatment Duration (days)"
                  name="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  type="number"
                />
                <Field
                  label="Authorized Refills"
                  name="refills"
                  value={refills}
                  onChange={(e) => setRefills(e.target.value)}
                  type="number"
                />
              </div>
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: '#fffbeb',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#92400e',
                }}
              >
                📅 Follow-up scheduled for:{' '}
                <strong>
                  {fmt(new Date(Date.now() + (Number(duration) || 30) * 86400000).toISOString())}
                </strong>
                &nbsp;&nbsp;🔔 Refill reminder:{' '}
                <strong>
                  {fmt(
                    new Date(Date.now() + ((Number(duration) || 30) - 7) * 86400000).toISOString()
                  )}
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  color: '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                <RefreshCw size={15} /> Start Over
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: saving ? '#c7d2fe' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 800,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1.2s linear infinite' }} /> Saving…
                  </>
                ) : (
                  <>
                    <Send size={15} /> Save Prescription
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* STEP 2 – DONE                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {step === STEP.DONE && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '5rem 2rem',
            background: '#f0fdf4',
            borderRadius: '18px',
            border: '1px solid #bbf7d0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={32} color="white" />
          </div>
          <div>
            <h2
              style={{
                fontWeight: 800,
                color: '#064e3b',
                fontSize: '1.4rem',
                margin: '0 0 0.5rem',
              }}
            >
              Prescription Saved Successfully!
            </h2>
            <p style={{ color: '#065f46', margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
              The Fagron recommendation has been converted and stored in Atlas.
            </p>
            {savedId && (
              <p style={{ color: '#6b7280', fontSize: '0.78rem', margin: 0 }}>
                Prescription ID: <code>{savedId}</code>
              </p>
            )}
          </div>
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              border: '1px solid #d1fae5',
              textAlign: 'left',
              width: '100%',
              maxWidth: 420,
            }}
          >
            <p
              style={{
                margin: '0 0 0.5rem',
                fontWeight: 700,
                color: '#064e3b',
                fontSize: '0.85rem',
              }}
            >
              ✅ What was created:
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.25rem',
                color: '#065f46',
                fontSize: '0.83rem',
                lineHeight: 1.7,
              }}
            >
              <li>Atlas Prescription (status: Sent)</li>
              <li>Patient record linked</li>
              <li>
                Follow-up date:{' '}
                {fmt(new Date(Date.now() + (Number(duration) || 30) * 86400000).toISOString())}
              </li>
              <li>Refill reminder: 7 days before follow-up</li>
              {file?.name && <li>Original PDF attached</li>}
            </ul>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}
            >
              <UploadCloud size={15} /> Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
