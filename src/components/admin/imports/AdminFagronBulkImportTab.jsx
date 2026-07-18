"use client";
/* eslint-disable no-unused-vars */

/**
 * AdminFagronBulkImportTab.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Importación masiva de prescripciones Fagron Genomics.
 *
 * Flujo:
 *   1. Admin sube uno o varios archivos (PDF, Excel, CSV, imagen)
 *   2. Gemini AI (parseUniversalDocument Cloud Function) extrae los datos
 *   3. Se muestra tabla de preview con deduplicación en tiempo real
 *      - "Ya existe" si hay coincidencia por boxId o (patientName+reportDate)
 *      - "Nueva" si no existe
 *   4. Admin selecciona filas y confirma → escribe en `prescriptions/`
 *      y opcionalmente crea/vincula el paciente en `patients/`
 */

import React, { useState, useCallback, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import * as XLSX from 'xlsx';
import { functions, db, storage } from '../../../firebase';
import { useAuth } from '../../../context/AuthContext';
import { createPatient } from '../../../services/patientLinkService';
import {
  UploadCloud, FileText, Loader2, Save, X, CheckCircle, AlertTriangle,
  ShieldCheck, ShieldAlert, Users, ClipboardList
} from '@/lib/icons';
import PageHeader from '../../ui/PageHeader';
import DataTable from '../../ui/DataTable';

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const styles = {
    new:      { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', label: '✦ Nueva' },
    duplicate:{ bg: '#fef9c3', color: '#854d0e', border: '#fde68a', label: '⚠ Ya existe' },
    error:    { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: '✕ Error' },
  };
  const s = styles[status] || styles.new;
  return (
    <span style={{
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
      display: 'inline-block', whiteSpace: 'nowrap'
    }}>
      {s.label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminFagronBulkImportTab() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [logs, setLogs] = useState([]);
  const [parsedRows, setParsedRows] = useState(null);   // Array of enriched rows with dupStatus
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [status, setStatus] = useState({ type: '', message: '' });
  const [alsoCreatePatients, setAlsoCreatePatients] = useState(true);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    setProgressText(msg);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length > 0) setFiles(Array.from(e.dataTransfer.files));
  };

  // ── Step 1: Parse + Deduplicate ────────────────────────────────────────────

  async function processFiles() {
    if (!files.length) return;
    setIsParsing(true);
    setLogs([]);
    setStatus({ type: 'info', message: 'Leyendo archivos con Gemini AI…' });
    try {
      const parseUniversal = httpsCallable(functions, 'parseUniversalDocument', { timeout: 300000 });
      let allItems = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        addLog(`Procesando archivo ${i + 1}/${files.length}: ${file.name}`);

        let mimeType = file.type;
        let fileToUpload = file;

        // Convert Excel → CSV for AI
        if (
          mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          mimeType === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
        ) {
          addLog('Convirtiendo Excel a CSV…');
          const data = await file.arrayBuffer();
          const wb = XLSX.read(data);
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          const validRows = rows.filter(r => Object.values(r).some(v => String(v).trim()));
          const csv = XLSX.utils.sheet_to_csv(XLSX.utils.js_to_sheet(validRows));
          fileToUpload = new File([csv], file.name.replace(/\.[^/.]+$/, '.csv'), { type: 'text/csv' });
          mimeType = 'text/csv';
        }

        const storagePath = `temp_imports/${user.uid}/${Date.now()}_${fileToUpload.name}`;
        const fileRef = ref(storage, storagePath);
        addLog('Subiendo documento a Storage…');
        await uploadBytes(fileRef, fileToUpload);

        addLog('Enviando a Gemini AI Engine (puede tardar hasta 5 min)…');
        const instructions = `
          Este es un informe de prescripción de Fagron Genomics.
          Extrae los siguientes campos por cada prescripción encontrada:
          - patientName: Nombre completo del paciente
          - patientDob: Fecha de nacimiento (YYYY-MM-DD si es posible)
          - patientGender: Sexo del paciente
          - patientEmail: Email del paciente (si aparece)
          - patientPhone: Teléfono del paciente (si aparece)
          - doctorName: Nombre del médico prescriptor
          - reportDate: Fecha del informe (YYYY-MM-DD)
          - boxId: Código BOX o número de referencia de la prescripción (si aparece)
          - diagnosis: Diagnóstico o indicación clínica
          - clinicalNotes: Notas clínicas, biomarcadores, marcadores genéticos
          - items: Array de productos prescritos. Cada item tiene: name, strength, quantity, unit, dosage, frequency, route
          Devuelve un array de objetos JSON, uno por prescripción.
        `;
        const response = await parseUniversal({ storagePath, mimeType, context: 'FagronPrescription', instructions });
        if (response.data.success) {
          const items = response.data.items.map(item => ({
            ...item,
            _sourceFile: file.name,
          }));
          addLog(`✓ ${items.length} prescripciones extraídas de ${file.name}`);
          allItems = [...allItems, ...items];
        } else {
          addLog(`✗ Error en ${file.name}: ${response.data.error || 'desconocido'}`);
        }
      }

      // ── Deduplication ──────────────────────────────────────────────────────
      addLog('Comprobando duplicados en Firestore…');
      const enriched = await Promise.all(
        allItems.map(async (item) => {
          let dupStatus = 'new';
          let existingId = null;

          try {
            // Check by boxId first
            if (item.boxId) {
              const q = query(
                collection(db, 'prescriptions'),
                where('fagron.boxId', '==', item.boxId)
              );
              const snap = await getDocs(q);
              if (!snap.empty) {
                dupStatus = 'duplicate';
                existingId = snap.docs[0].id;
              }
            }

            // Fallback: check by patientName + reportDate
            if (dupStatus === 'new' && item.patientName && item.reportDate) {
              const q = query(
                collection(db, 'prescriptions'),
                where('fagron.reportDate', '==', item.reportDate),
                where('patient.name', '==', item.patientName)
              );
              const snap = await getDocs(q);
              if (!snap.empty) {
                dupStatus = 'duplicate';
                existingId = snap.docs[0].id;
              }
            }
          } catch {
            // Non-fatal
          }

          return { ...item, _dupStatus: dupStatus, _existingId: existingId };
        })
      );

      setParsedRows(enriched);
      // Auto-select only NEW rows
      const newIdxs = enriched.reduce((acc, r, i) => { if (r._dupStatus === 'new') acc.add(i); return acc; }, new Set());
      setSelectedRows(newIdxs);
      setStatus({
        type: 'success',
        message: `Extracción completa: ${enriched.length} prescripciones (${newIdxs.size} nuevas, ${enriched.length - newIdxs.size} duplicadas).`
      });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Error procesando archivos: ' + err.message });
    } finally {
      setIsParsing(false);
    }
  }

  // ── Step 2: Save to Firestore ──────────────────────────────────────────────

  async function handleSave() {
    const toSave = parsedRows.filter((_, i) => selectedRows.has(i));
    if (!toSave.length) return;
    setIsSaving(true);
    setStatus({ type: 'info', message: `Guardando ${toSave.length} prescripciones…` });
    let saved = 0;
    let errors = 0;

    for (const rx of toSave) {
      try {
        // 1. Optionally create/find patient
        let patientId = null;
        if (alsoCreatePatients && rx.patientName) {
          try {
            const result = await createPatient({
              name: rx.patientName,
              dob: rx.patientDob || '',
              gender: rx.patientGender || '',
              email: rx.patientEmail || '',
              phone: rx.patientPhone || '',
              source: 'fagron_import',
            });
            patientId = result.id;
          } catch {
            // Patient may already exist — non-fatal
          }
        }

        // 2. Build prescription document
        const rxDoc = {
          source: 'fagron_pdf_ocr',
          sourceType: 'Fagron Genomics',
          status: 'Imported',
          doctorName: rx.doctorName || '',
          patientId,
          patient: {
            name: rx.patientName || '',
            dob: rx.patientDob || '',
            gender: rx.patientGender || '',
            email: rx.patientEmail || '',
            phone: rx.patientPhone || '',
          },
          diagnosis: rx.diagnosis || '',
          clinicalNotes: rx.clinicalNotes || '',
          items: Array.isArray(rx.items) ? rx.items : [],
          fagron: {
            boxId: rx.boxId || null,
            reportDate: rx.reportDate || null,
            sourceFile: rx._sourceFile || null,
            ocrExtracted: true,
            importedAt: new Date().toISOString(),
            importedBy: user?.email || 'admin',
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          auditTrail: [{
            timestamp: new Date().toISOString(),
            action: 'imported',
            user: user?.email || 'admin',
            details: `Bulk imported from ${rx._sourceFile}`
          }]
        };

        await addDoc(collection(db, 'prescriptions'), rxDoc);
        saved++;
      } catch (err) {
        console.error('Error saving prescription:', err);
        errors++;
      }
    }

    // Log to import_history
    try {
      await addDoc(collection(db, 'import_history'), {
        adminEmail: user?.email || 'admin',
        fileNames: files.map(f => f.name),
        context: 'FagronPrescription',
        itemsCount: saved,
        errors,
        timestamp: serverTimestamp(),
      });
    } catch { /* non-fatal */ }

    setStatus({
      type: errors > 0 ? 'error' : 'success',
      message: `✓ ${saved} prescripciones importadas.${errors > 0 ? ` ✗ ${errors} errores.` : ''}`
    });
    setIsSaving(false);
    if (errors === 0) {
      setParsedRows(null);
      setFiles([]);
    }
  }

  // ── Toggle selection ───────────────────────────────────────────────────────
  const toggleRow = (i) => setSelectedRows(prev => {
    const next = new Set(prev);
    next.has(i) ? next.delete(i) : next.add(i);
    return next;
  });
  const toggleAll = (checked) => setSelectedRows(
    checked ? new Set(parsedRows.map((_, i) => i)) : new Set()
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        title="Importación Fagron Genomics"
        subtitle="Importación masiva de prescripciones desde informes Fagron. El sistema detecta duplicados automáticamente."
        icon={<ClipboardList size={20} />}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

        {/* Status Banner */}
        {status.message && (
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '8px',
            backgroundColor: status.type === 'error' ? '#fef2f2' : status.type === 'success' ? '#f0fdf4' : '#f0f9ff',
            color: status.type === 'error' ? '#991b1b' : status.type === 'success' ? '#166534' : '#075985',
            border: `1px solid ${status.type === 'error' ? '#fecaca' : status.type === 'success' ? '#bbf7d0' : '#bae6fd'}`,
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500
          }}>
            {status.type === 'error' ? <X size={18} /> : status.type === 'success' ? <CheckCircle size={18} /> : <Loader2 size={18} />}
            {status.message}
          </div>
        )}

        {!parsedRows ? (
          /* ── Upload Panel ── */
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '2rem', backgroundColor: 'var(--color-bg-surface)' }}>
            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fagron-file-input').click()}
              style={{
                border: '2px dashed var(--color-border)',
                borderRadius: '12px', padding: '4rem 2rem',
                textAlign: 'center', cursor: 'pointer',
                backgroundColor: 'var(--color-bg-app)',
                transition: 'all 0.2s',
              }}
            >
              <input
                id="fagron-file-input"
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,application/pdf,image/jpeg,image/png"
                style={{ display: 'none' }}
                onChange={(e) => { if (e.target.files?.length > 0) setFiles(Array.from(e.target.files)); }}
              />
              {isParsing ? (
                <div style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
                  <Loader2 size={32} style={{ display: 'block', margin: '0 auto 1rem', color: 'var(--primary)' }} />
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>{progressText}</div>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', lineHeight: 1.8 }}>
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                  </div>
                </div>
              ) : files.length > 0 ? (
                <div>
                  <FileText size={40} color="var(--color-success)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-success)' }}>
                    {files.length} archivo{files.length > 1 ? 's' : ''} seleccionado{files.length > 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {files.map(f => f.name).join(' • ')}
                  </div>
                </div>
              ) : (
                <div>
                  <UploadCloud size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Arrastra informes Fagron Genomics aquí</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    PDF, Excel (.xlsx), CSV, o imagen — varios archivos a la vez
                  </div>
                  <div style={{
                    marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    backgroundColor: '#f0fdfa', border: '1px solid #14b8a6', color: '#0f766e',
                    padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600
                  }}>
                    <CheckCircle size={14} /> Optimizado para informes Fagron Genomics
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={alsoCreatePatients}
                  onChange={e => setAlsoCreatePatients(e.target.checked)}
                />
                <Users size={15} />
                Crear paciente automáticamente si no existe
              </label>
              <button
                onClick={processFiles}
                disabled={!files.length || isParsing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  backgroundColor: (!files.length || isParsing) ? 'var(--color-border)' : 'var(--primary)',
                  color: 'white', border: 'none', borderRadius: '8px',
                  padding: '0.65rem 1.5rem', fontWeight: 700, fontSize: '0.9rem',
                  cursor: (!files.length || isParsing) ? 'not-allowed' : 'pointer',
                }}
              >
                {isParsing ? <Loader2 size={16} /> : <ClipboardList size={16} />}
                {isParsing ? 'Procesando…' : 'Analizar con IA'}
              </button>
            </div>
          </div>
        ) : (
          /* ── Preview Table ── */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-main)' }}>{parsedRows.length}</strong> prescripciones extraídas ·{' '}
                <strong style={{ color: 'var(--color-success)' }}>{parsedRows.filter(r => r._dupStatus === 'new').length}</strong> nuevas ·{' '}
                <strong style={{ color: '#854d0e' }}>{parsedRows.filter(r => r._dupStatus === 'duplicate').length}</strong> duplicadas
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => { setParsedRows(null); setFiles([]); setStatus({ type: '', message: '' }); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer' }}
                >
                  <X size={14} /> Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedRows.size || isSaving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    backgroundColor: (!selectedRows.size || isSaving) ? 'var(--color-border)' : '#10b981',
                    color: 'white', border: 'none', borderRadius: '8px',
                    padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.9rem',
                    cursor: (!selectedRows.size || isSaving) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSaving ? <Loader2 size={15} /> : <Save size={15} />}
                  {isSaving ? 'Guardando…' : `Importar ${selectedRows.size} seleccionadas`}
                </button>
              </div>
            </div>

            <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <DataTable
                data={parsedRows.map((r, i) => ({ ...r, _idx: i }))}
                keyField="_idx"
                selectedIds={Array.from(selectedRows)}
                onSelectionChange={(ids) => setSelectedRows(new Set(ids))}
                emptyTitle="No data available"
                columns={[
                  { key: '_dupStatus', header: 'Estado', render: (r) => <StatusBadge status={r._dupStatus} /> },
                  { key: 'patientName', header: 'Paciente', render: (r) => (
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.patientName || '—'}</div>
                        {r.patientEmail && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.patientEmail}</div>}
                      </div>
                    ) 
                  },
                  { key: 'doctorName', header: 'Médico', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.doctorName || '—'}</span> },
                  { key: 'reportDate', header: 'Fecha Informe', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.reportDate || '—'}</span> },
                  { key: 'boxId', header: 'BOX ID', render: (r) => <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.boxId || '—'}</span> },
                  { key: '_items', header: 'Productos', render: (r) => (
                      <span style={{ color: 'var(--text-muted)' }}>
                        {Array.isArray(r.items) ? r.items.length : '—'}
                        {Array.isArray(r.items) && r.items.length > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {r.items.slice(0, 2).map(it => it.name).join(', ')}{r.items.length > 2 ? '…' : ''}
                          </div>
                        )}
                      </span>
                    ) 
                  },
                  { key: '_sourceFile', header: 'Archivo', render: (r) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r._sourceFile}</span> }
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
