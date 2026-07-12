"use client";

/**
 * DoctorPrescriptionBuilder.jsx
 *
 * Doctor's prescription builder — type-cart with Firestore persistence.
 * Two modes: patient prescription | clinic supply order.
 *
 * Features:
 *   - Product/Protocol search + add
 *   - Per-item: quantity, dosage, frequency, duration, notes
 *   - Patient selector (registered patients or free-text)
 *   - Delivery: direct to patient | via wholesaler | clinic supply
 *   - Save draft (auto-save on change) + Send action
 *   - Timeline events on status changes
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import userRepository from '../../../repositories/userRepository';
import { prescriptionRepository } from '../../../repositories/prescriptionRepository';
import { productRepository } from '../../../repositories/productRepository';
import { protocolRepository } from '../../../repositories/protocolRepository';

import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { logAction } from '../../../services/auditLogger';




















import {
  RX_TYPE, DELIVERY_METHOD, RX_STATUS, newRxDraft,
  ITEM_UNITS, FREQUENCIES, DURATIONS, RX_STATUS_META, rxEvent
} from '../../../config/prescriptionConfig';
import { apiCatalog } from '../../../data/apis';
import CatalogPreviewPanel from '../../wholesaler/CatalogPreviewPanel';
import PharmacokineticsSimulator from './PharmacokineticsSimulator';
import DrugInteractionChecker from './DrugInteractionChecker';


import StatusChip from "./StatusChip";
import ShareConfirmation from "./ShareConfirmation";

import PrescriptionItemRow from "./PrescriptionItemRow";
import ProductSearchBar from "./ProductSearchBar";

// ── Main Builder ──────────────────────────────────────────────────────────────
// No direct firestore imports
import { resolveVariantPrice, formatPrice } from '../../../utils/resolvePrice';
import { SUPPLEMENT_APIS, FORMATS, VEHICLES } from '../../../data/supplementApis';
import { ClipboardList, Plus, Trash2, Send, Save, Search, User, Building, ChevronDown, FlaskConical, PackageSearch, AlertCircle, CheckCircle2, Clock, X, ArrowRight, Loader2, Stethoscope, ShoppingBag, UploadCloud } from '@/lib/icons';

const calculateCompoundPricing = (ingredients, servings, formatId, marginPct) => {
  const format = FORMATS.find(f => f.id === formatId) || FORMATS[0];
  const baseFee = format.baseFee;
  let ingredientCost = 0;
  ingredients.forEach(ing => {
    const api = SUPPLEMENT_APIS.find(a => a.id === ing.apiId);
    if (api) {
      ingredientCost += Number(ing.dose || 0) * api.costPerUnit * Number(servings || 0);
    }
  });

  const b2bCost = baseFee + ingredientCost;
  const markup = b2bCost * (Number(marginPct || 30) / 100);
  const b2cPrice = b2bCost + markup;

  return {
    b2bCost,
    b2cPrice,
    markup
  };
};

export default function DoctorPrescriptionBuilder({ doctorId, doctorMeta, patients = [], onSaved, prefilledData }) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [ocrFile, setOcrFile] = useState(null);
  const [isUploadingOcr, setIsUploadingOcr] = useState(false);
  const { user, userProfile } = useAuth();

  // RBAC GUARD
  const isAuthorized = ['doctor', 'medical_director', 'pharmacist', 'clinic_manager', 'admin'].includes(userProfile?.role);
  const isAssistant = userProfile?.role === 'clinic_manager';

  if (!isAuthorized) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#d93025', background: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid #fca5a5' }}>
        <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
        <h2 style={{ margin: '0 0 0.5rem 0' }}>Acceso Clínico Restringido</h2>
        <p style={{ margin: 0 }}>No tienes los permisos necesarios para acceder al generador de prescripciones.</p>
      </div>
    );
  }

  const doctorName  = doctorMeta?.doctorName || user?.displayName || 'Dr.';
  const doctorEmail = user?.email || '';

  const [rx, setRx]           = useState(() => ({
    ...newRxDraft(doctorId, doctorName, doctorEmail),
    shippingAddressType: 'patient',
    shippingAddress: { address: '', city: '', zip: '', country: '' },
    delegatedAssistantId: '',
    kitStatus: 'none',
    ...prefilledData,
  }));

  useEffect(() => {
    if (prefilledData) {
      setRx(prev => ({
        ...prev,
        ...prefilledData,
      }));
    }
  }, [prefilledData]);
  const [saving, setSaving]   = useState(false);
  const [sending, setSending] = useState(false);
  const [savedId, setSavedId] = useState(null);  // Firestore doc ID once saved
  const [toast, setToast]     = useState(null);  // { msg, ok }
  const [wholesalers, setWholesalers] = useState([]);

  // Patient creation states
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [newPatientFirstName, setNewPatientFirstName] = useState('');
  const [newPatientLastName, setNewPatientLastName] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [creatingPatientLoading, setCreatingPatientLoading] = useState(false);

  // Catalog browser states
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogProtocols, setCatalogProtocols] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showCatalogBrowser, setShowCatalogBrowser] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');

  // Markup and margin configuration states
  const [showMarginModal, setShowMarginModal] = useState(false);
  const [markupMargin, setMarkupMargin] = useState(30);

  // Compounding Supplement States
  const [builderTab, setBuilderTab] = useState('catalog'); // 'catalog' | 'compounding'
  const [compoundName, setCompoundName] = useState('');
  const [compoundFormat, setCompoundFormat] = useState('capsules');
  const [compoundExcipient, setCompoundExcipient] = useState('cellulose_capsule');
  const [compoundServings, setCompoundServings] = useState(60);
  const [compoundInstructions, setCompoundInstructions] = useState('');
  const [compoundIngredients, setCompoundIngredients] = useState([]); // Array of { apiId, dose }

  useEffect(() => {
    if (doctorMeta?.defaultMarkupMargin != null) {
      setMarkupMargin(doctorMeta.defaultMarkupMargin);
    } else if (userProfile?.defaultMarkupMargin != null) {
      setMarkupMargin(userProfile.defaultMarkupMargin);
    }
  }, [doctorMeta, userProfile]);

  // Load wholesalers list for assignment
  useEffect(() => {
    userRepository.getUsersByRole('wholesaler', 30)
      .then(users => setWholesalers(users))
      .catch(() => {});
  }, []);

  // Load linked assistants list for delegation
  const [assistantsList, setAssistantsList] = useState([]);
  useEffect(() => {
    if (!doctorId) return;
    const fetchAssistants = async () => {
      try {
        const staff = await userRepository.getStaffByDoctor(doctorId);
        setAssistantsList(staff);
      } catch (err) {
        console.error('Error fetching assistants for builder:', err);
      }
    };
    fetchAssistants();
  }, [doctorId]);

  // Recent prescriptions history states
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loadingRecentRx, setLoadingRecentRx] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    const fetchRecentRx = async () => {
      setLoadingRecentRx(true);
      try {
        const list = await prescriptionRepository.getRecentPrescriptionsByDoctor(doctorId, 5);
        setRecentPrescriptions(list);
      } catch (err) {
        console.error('Error fetching recent prescriptions:', err);
      } finally {
        setLoadingRecentRx(false);
      }
    };
    fetchRecentRx();
  }, [doctorId]);

  // Fetch full store catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      setCatalogLoading(true);
      try {
        const prods = await productRepository.getAllProducts({ limitCount: 150 });
        const protos = await protocolRepository.getAllProtocols();
        setCatalogProducts(prods.map(p => ({ type: 'product', ...p })));
        setCatalogProtocols(protos.map(p => ({ type: 'protocol', ...p })));
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Field helpers ──────────────────────────────────────────────────────────
  const setField = (path, val) => setRx(prev => {
    const updated = { ...prev };
    const parts = path.split('.');
    let cur = updated;
    for (let i = 0; i < parts.length - 1; i++) { cur = cur[parts[i]] = { ...cur[parts[i]] }; }
    cur[parts[parts.length - 1]] = val;
    return updated;
  });

  const setType = (type) => {
    setRx(prev => ({
      ...prev,
      type,
      delivery: {
        ...prev.delivery,
        method: type === RX_TYPE.CLINIC_SUPPLY
          ? DELIVERY_METHOD.CLINIC_SUPPLY
          : DELIVERY_METHOD.DIRECT_PATIENT,
      },
    }));
  };

  const addItem = (item) => setRx(prev => {
    // Avoid duplicates in items list
    if (prev.items.some(i => i.id === item.id)) {
      showToast(t('doctor.builder.duplicate_item'));
      return prev;
    }
    return { ...prev, items: [...prev.items, item] };
  });

  const updateItem = (i, updated) => setRx(prev => {
    const items = [...prev.items];
    items[i] = updated;
    return { ...prev, items };
  });

  const removeItem = (i) => setRx(prev => ({
    ...prev, items: prev.items.filter((_, idx) => idx !== i)
  }));

  // Patient creation flow
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!newPatientEmail.trim()) {
      showToast(t('doctor.builder.email_req'), false);
      return;
    }
    setCreatingPatientLoading(true);
    try {
      const emailClean = newPatientEmail.trim().toLowerCase();
      // Check existing patient
      const existUsers = await userRepository.getUsersByEmail(emailClean);
      let patientUid = '';
      let patientFullName = `${newPatientFirstName} ${newPatientLastName}`.trim();
      
      if (existUsers && existUsers.length > 0) {
        const existingUser = existUsers[0];
        patientUid = existingUser.id;
        patientFullName = `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim() || patientFullName;
        await userRepository.updateUser(patientUid, {
          assignedDoctorIds: [...(existingUser.assignedDoctorIds || []), doctorId] // Very basic append, in a real app would deduplicate
        });
      } else {
        patientUid = await userRepository.createPatient({
          firstName: newPatientFirstName.trim(),
          lastName: newPatientLastName.trim(),
          email: emailClean,
          phone: newPatientPhone.trim(),
          assignedDoctorIds: [doctorId]
        });
      }

      // Create relationship
      await userRepository.createDoctorPatientRelationship({
        doctorId,
        patientId: patientUid,
        patientEmail: emailClean,
        patientName: patientFullName,
        status: 'active',
        initiatedBy: doctorId,
        initiatedByRole: 'doctor'
      });

      // Select patient in the prescription draft
      setField('patient.uid', patientUid);
      setField('patient.name', patientFullName);
      setField('patient.email', emailClean);
      setField('patient.phone', newPatientPhone.trim());

      showToast(t('doctor.builder.create_success'));
      setIsCreatingPatient(false);
      setNewPatientFirstName('');
      setNewPatientLastName('');
      setNewPatientEmail('');
      setNewPatientPhone('');
    } catch (err) {
      console.error('Error creating patient:', err);
      showToast(t('doctor.builder.create_error'), false);
    } finally {
      setCreatingPatientLoading(false);
    }
  };

  // ── Save draft ─────────────────────────────────────────────────────────────
  const saveDraft = async () => {
    if (rx.items.length === 0) { showToast(t('doctor.builder.add_item_alert'), false); return; }
    setSaving(true);
    try {
      const payload = {
        ...rx,
        status:    RX_STATUS.DRAFT,
        markupMargin: Number(markupMargin),
        updatedAt: serverTimestamp(),
        timeline:  [
          ...rx.timeline,
          { event: 'draft_saved', actorId: doctorId, actorRole: 'doctor', note: `Borrador guardado con margen de ${markupMargin}%`, timestamp: new Date().toISOString() },
        ],
      };

      if (savedId) {
        await prescriptionRepository.updatePrescription(savedId, payload);
        await logAction(user?.uid, 'doctor', 'PRESCRIPTION_UPDATE_DRAFT', savedId, { itemsCount: rx.items.length });
        showToast(t('doctor.builder.draft_saved'));
      } else {
        const newId = await prescriptionRepository.createPrescription({
          ...payload, createdAt: new Date().toISOString(),
        });
        setSavedId(newId);
        await logAction(user?.uid, 'doctor', 'PRESCRIPTION_CREATE_DRAFT', newId, { itemsCount: rx.items.length });
        showToast(t('doctor.builder.saved_draft_success'));
      }
      onSaved?.(true);
    } catch (err) {
      console.error('[DoctorPrescriptionBuilder] save error', err);
      showToast(t('doctor.builder.save_error'), false);
    } finally {
      setSaving(false);
    }
  };

  // ── Wholesaler toggle helper ──────────────────────────────────────────────
  const toggleWholesaler = (ws) => {
    setRx(prev => {
      const alreadyIn = prev.wholesalerIds.includes(ws.uid);
      const wsArr     = alreadyIn
        ? prev.wholesalers.filter(w => w.uid !== ws.uid)
        : [...prev.wholesalers, { uid: ws.uid, name: `${ws.firstName||''} ${ws.lastName||''}`.trim(), email: ws.email||'', phone: ws.phone||'' }];
      return {
        ...prev,
        wholesalers:   wsArr,
        wholesalerIds: wsArr.map(w => w.uid),
        // keep legacy delivery field in sync with first selected wholesaler
        delivery: { ...prev.delivery, wholesalerId: wsArr[0]?.uid||'', wholesalerName: wsArr[0]?.name||'', wholesalerEmail: wsArr[0]?.email||'' },
      };
    });
  };

  // ── Send (multi-recipient) ────────────────────────────────────────────────
  const send = () => {
    if (rx.items.length === 0) { showToast(t('doctor.builder.add_item_before_send'), false); return; }

    const hasPatient     = rx.shareWithPatient && (rx.patient.email || rx.patient.uid);
    const hasWholesalers = rx.wholesalerIds.length > 0;
    if (!hasPatient && !hasWholesalers) {
      showToast(t('doctor.builder.select_recipient_alert'), false); return;
    }
    if (rx.shareWithPatient && !rx.patient.email && !rx.patient.uid) {
      showToast(t('doctor.builder.specify_patient_alert'), false); return;
    }

    // Trigger margin configuration modal
    setShowMarginModal(true);
  };

  const confirmAndSend = async () => {
    setShowMarginModal(false);
    setSending(true);
    try {
      const hasPatient     = rx.shareWithPatient && (rx.patient.email || rx.patient.uid);
      
      let newStatus = hasPatient ? RX_STATUS.SENT : RX_STATUS.ASSIGNED_TO_WS;
      if (isAssistant) {
        newStatus = 'DRAFT_PENDING_SIGNATURE';
      }

      const recipients = [];
      if (hasPatient)     recipients.push('sent_to_patient');
      if (rx.wholesalerIds.length > 0) recipients.push(`sent_via_wholesaler(${rx.wholesalerIds.join(',')})`);

      const event = {
        event: hasPatient && rx.wholesalerIds.length > 0 ? 'sent_to_all'
             : hasPatient ? 'sent_to_patient' : 'sent_via_wholesaler',
        actorId: doctorId, actorRole: 'doctor',
        note: `Compartido con: ${[hasPatient ? rx.patient.name||rx.patient.email : null, ...rx.wholesalers.map(w=>w.name)].filter(Boolean).join(', ')} (Margen: ${markupMargin}%)`,
        timestamp: new Date().toISOString(),
      };

      const payload = {
        ...rx,
        status:       newStatus,
        markupMargin: Number(markupMargin),
        updatedAt:    serverTimestamp(),
        expiresAt:    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        timeline:     [...rx.timeline, event],
      };

      if (savedId) {
        await prescriptionRepository.updatePrescription(savedId, payload);
      } else {
        const newId = await prescriptionRepository.createPrescription({ ...payload, createdAt: new Date().toISOString() });
        setSavedId(newId);
      }

      setRx(prev => ({ ...prev, status: newStatus, markupMargin: Number(markupMargin) }));
      const total = (hasPatient ? 1 : 0) + rx.wholesalerIds.length;
      showToast(
        total > 1
          ? t('doctor.builder.sent_success_plural', { count: total })
          : t('doctor.builder.sent_success', { count: total })
      );
      onSaved?.(false);
    } catch (err) {
      console.error('[DoctorPrescriptionBuilder] send error', err);
      showToast(t('doctor.builder.send_error'), false);
    } finally {
      setSending(false);
    }
  };

  const isSent = rx.status !== RX_STATUS.DRAFT;

  // Filter products/protocols for catalog browser
  const filteredCatalogItems = [
    ...catalogProducts.map(p => ({ ...p, typeLabel: p.productType === 'testing' || p.type === 'testing' ? 'Prueba Diagnóstico' : 'Producto' })),
    ...catalogProtocols.map(p => ({ ...p, typeLabel: 'Protocolo' }))
  ].filter(item => {
    if (!catalogSearchQuery) return true;
    const q = catalogSearchQuery.toLowerCase();
    return (
      (item.name || item.displayName || '').toLowerCase().includes(q) ||
      (item.sku || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '0.75rem 1.25rem', borderRadius: '4px',
          background: toast.ok ? '#0f172a' : '#d93025', color: 'var(--color-bg-surface)',
          fontSize: '0.82rem', fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'rxFadeIn 0.2s ease',
        }}>
          {toast.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '4px', background: '#e8f0fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={16} color="#1a73e8" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#202124' }}>
              {t('doctor.builder.title')}
            </h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#5f6368' }}>
              {savedId ? t('doctor.builder.draft_id', { id: savedId.slice(0, 8) }) : t('doctor.builder.new_rx_order')}
            </p>
          </div>
        </div>
        <StatusChip status={rx.status} />
      </div>

      {/* ── Type selector ── */}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[
          { id: RX_TYPE.PATIENT,       label: t('doctor.builder.rx_patient'),   icon: User,       color: '#1a73e8' },
          { id: RX_TYPE.CLINIC_SUPPLY, label: t('doctor.builder.clinic_supply'), icon: Building, color: '#137333' },
        ].map(t => {
          const active = rx.type === t.id;
          return (
            <button key={t.id} onClick={() => setType(t.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              padding: '0.6rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit',
              border: `1px solid ${active ? t.color : '#dadce0'}`,
              background: active ? `${t.color}0a` : 'var(--color-bg-surface)',
              color: active ? t.color : '#5f6368',
              fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.15s',
            }}>
              <t.icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* --- Stepper UI --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', marginTop: '0.5rem', background: 'var(--color-bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid #dadce0', flexWrap: 'wrap', gap: '0.5rem' }}>
        {[
          { step: 1, label: t('doctor.builder.step_origin') },
          { step: 2, label: t('doctor.builder.step_prescription') },
          { step: 3, label: t('doctor.builder.step_logistics') },
          { step: 4, label: t('doctor.builder.step_summary') }
        ].map(s => (
          <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: currentStep === s.step ? 1 : 0.5, cursor: 'pointer' }} onClick={() => setCurrentStep(s.step)}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: currentStep === s.step ? '#1a73e8' : 'var(--color-border)', color: currentStep === s.step ? 'var(--color-bg-surface)' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
              {s.step}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: currentStep === s.step ? 600 : 500, color: currentStep === s.step ? '#1a73e8' : 'var(--color-text-secondary)' }}>{s.label}</span>
          </div>
        ))}
      </div>


      {currentStep === 1 && (
        <div className="gcp-card" style={{ marginBottom: '1rem', border: '1.5px dashed #cbd5e1', background: 'var(--color-bg-app)' }}>
          <div className="gcp-header" style={{ color: '#0f172a' }}>📷 {t('doctor.builder.scan_ocr')}</div>
          <p style={{ fontSize: '0.75rem', color: '#5f6368', marginBottom: '1rem' }}>
            {t('doctor.builder.scan_desc')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ cursor: 'pointer' }} className="gcp-btn-secondary">
              <UploadCloud size={14} /> {t('doctor.builder.select_file')}
              <input type="file" style={{ display: 'none' }} accept="image/*,.pdf" onChange={(e) => {
                if(e.target.files && e.target.files[0]) {
                  setOcrFile(e.target.files[0]);
                  setIsUploadingOcr(true);
                  // Mock OCR processing
                  setTimeout(() => setIsUploadingOcr(false), 2000);
                }
              }} />
            </label>
            {ocrFile && (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {isUploadingOcr ? <><Loader2 size={14} style={{ animation: 'rxSpin 1s linear infinite' }} /> {t('doctor.builder.analyzing')}</> : <><CheckCircle2 size={14} /> {t('doctor.builder.file_processed')}</>}
              </span>
            )}
          </div>
        </div>
      )}


      {/* ── PATIENT section ── */}
      {rx.type === RX_TYPE.PATIENT && (
        <div className="gcp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="gcp-header"><User size={14} /> {t('doctor.builder.recipient_patient')}</div>
            <button 
              onClick={() => setIsCreatingPatient(!isCreatingPatient)}
              style={{
                background: 'none', border: 'none', color: '#1a73e8', fontWeight: 600,
                fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              {isCreatingPatient ? t('doctor.builder.back_selector') : t('doctor.builder.register_new')}
            </button>
          </div>

          {isCreatingPatient ? (
            <form onSubmit={handleCreatePatient} className="form-grid-2col" style={{ gap: '0.75rem' }}>
              <label className="gcp-label">
                {t('doctor.builder.first_name')}
                <input required value={newPatientFirstName} onChange={e => setNewPatientFirstName(e.target.value)}
                  placeholder="Ej: Juan" className="gcp-input" />
              </label>
              <label className="gcp-label">
                {t('doctor.builder.last_name')}
                <input required value={newPatientLastName} onChange={e => setNewPatientLastName(e.target.value)}
                  placeholder="Ej: Pérez" className="gcp-input" />
              </label>
              <label className="gcp-label">
                {t('doctor.builder.email')}
                <input required type="email" value={newPatientEmail} onChange={e => setNewPatientEmail(e.target.value)}
                  placeholder="juan.perez@ejemplo.com" className="gcp-input" />
              </label>
              <label className="gcp-label">
                {t('doctor.builder.phone')}
                <input value={newPatientPhone} onChange={e => setNewPatientPhone(e.target.value)}
                  placeholder="+34 600 000 000" className="gcp-input" />
              </label>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setIsCreatingPatient(false)} className="gcp-btn-secondary">
                  {t('doctor.prescriptions_list.cancel')}
                </button>
                <button type="submit" disabled={creatingPatientLoading} className="gcp-btn-primary">
                  {creatingPatientLoading && <Loader2 size={12} className="animate-spin" />}
                  {t('doctor.builder.register_btn')}
                </button>
              </div>
            </form>
          ) : (
            <div className="form-grid-2col" style={{ gap: '0.75rem' }}>
              <label className="gcp-label">
                {t('doctor.builder.select_from_patients')}
                <select value={rx.patient.uid || ''} onChange={e => {
                  const p = patients.find(pt => pt.uid === e.target.value);
                  if (p) {
                    setField('patient.uid',   p.uid);
                    setField('patient.name',  `${p.firstName||''} ${p.lastName||''}`.trim());
                    setField('patient.email', p.email||'');
                    setField('patient.phone', p.phone||'');
                  } else { setField('patient.uid', ''); }
                }} className="gcp-input">
                  <option value="">— {t('doctor.builder.select_from_patients')} —</option>
                  {patients.map(p => (
                    <option key={p.uid} value={p.uid}>
                      {`${p.firstName||''} ${p.lastName||''}`.trim() || p.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="gcp-label">
                {t('doctor.builder.patient_name')}
                <input value={rx.patient.name} onChange={e => setField('patient.name', e.target.value)}
                  placeholder="Nombre y Apellidos" className="gcp-input" />
              </label>
              <label className="gcp-label">
                {t('doctor.builder.email')}
                <input value={rx.patient.email} type="email" onChange={e => setField('patient.email', e.target.value)}
                  placeholder="paciente@correo.com" className="gcp-input" />
              </label>
              <label className="gcp-label">
                {t('doctor.builder.phone')}
                <input value={rx.patient.phone} onChange={e => setField('patient.phone', e.target.value)}
                  placeholder="+34 600 000 000" className="gcp-input" />
              </label>
            </div>
          )}
        </div>
      )}

      {/* ── DIRECCIÓN DE ENVÍO Y DELEGACIÓN LOGÍSTICA ── */}
<div className="gcp-card">
        <div className="gcp-header">📦 Envío y Delegación Logística</div>
        <div className="form-grid-2col" style={{ gap: '0.75rem' }}>
          {/* Shipping Address Type */}
          <label className="gcp-label">
            Destinatario de Envío
            <select 
              value={rx.shippingAddressType || 'patient'} 
              onChange={e => setRx(p => ({ ...p, shippingAddressType: e.target.value }))}
              className="gcp-input"
            >
              <option value="patient">Dirección del Paciente</option>
              <option value="clinic">Dirección de la Clínica</option>
            </select>
          </label>

          {/* Assistant delegation select */}
          <label className="gcp-label">
            {t('doctor.builder.delegate_to_assistant')}
            <select 
              value={rx.delegatedAssistantId || ''} 
              onChange={e => setRx(p => ({ ...p, delegatedAssistantId: e.target.value }))}
              className="gcp-input"
            >
              <option value="">— {t('doctor.builder.no_delegation')} —</option>
              {assistantsList.map(ass => (
                <option key={ass.id} value={ass.id}>
                  {ass.firstName} {ass.lastName} ({ass.email})
                </option>
              ))}
            </select>
          </label>

          {/* Inline warning notification if patient address details are missing */}
          {rx.shippingAddressType === 'patient' && (!rx.shippingAddress?.address || !rx.shippingAddress?.city) && (
            <div style={{
              gridColumn: '1 / -1',
              background: 'var(--color-warning-bg)',
              border: '1px solid #fef3c7',
              borderRadius: '6px',
              padding: '0.6rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#b45309'
            }}>
              <span>{t('doctor.builder.no_full_address_warning')}</span>
              <button 
                type="button"
                onClick={() => setRx(p => ({ ...p, shippingAddressType: 'clinic' }))}
                style={{
                  background: '#f59e0b', color: 'var(--color-bg-surface)', border: 'none', borderRadius: '4px',
                  padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.7rem'
                }}
              >
                {t('doctor.builder.ship_to_clinic_btn')}
              </button>
            </div>
          )}

          {/* Address fields if patient shipping is selected */}
          {rx.shippingAddressType === 'patient' && (
            <div className="address-grid-4col" style={{ gridColumn: '1 / -1', gap: '0.5rem', background: 'var(--color-bg-app)', padding: '0.75rem', borderRadius: '6px', border: '1px solid #dadce0' }}>
              <label className="gcp-label">
                {t('doctor.builder.patient_address_lbl')}
                <input 
                  value={rx.shippingAddress?.address || ''} 
                  onChange={e => setRx(p => ({ ...p, shippingAddress: { ...(p.shippingAddress || {}), address: e.target.value } }))}
                  placeholder="Calle, número, piso"
                  className="gcp-input"
                />
              </label>
              <label className="gcp-label">
                {t('doctor.builder.city_lbl')}
                <input 
                  value={rx.shippingAddress?.city || ''} 
                  onChange={e => setRx(p => ({ ...p, shippingAddress: { ...(p.shippingAddress || {}), city: e.target.value } }))}
                  placeholder="Ej: Madrid"
                  className="gcp-input"
                />
              </label>
              <label className="gcp-label">
                {t('doctor.builder.zip_lbl')}
                <input 
                  value={rx.shippingAddress?.zip || ''} 
                  onChange={e => setRx(p => ({ ...p, shippingAddress: { ...(p.shippingAddress || {}), zip: e.target.value } }))}
                  placeholder="28001"
                  className="gcp-input"
                />
              </label>
              <label className="gcp-label">
                {t('doctor.builder.country_lbl')}
                <input 
                  value={rx.shippingAddress?.country || t('doctor.builder.spain_lbl')} 
                  onChange={e => setRx(p => ({ ...p, shippingAddress: { ...(p.shippingAddress || {}), country: e.target.value } }))}
                  placeholder={t('doctor.builder.spain_lbl')}
                  className="gcp-input"
                />
              </label>
            </div>
          )}

          {/* Clinic Address confirmation note */}
          {rx.shippingAddressType === 'clinic' && (
            <div style={{
              gridColumn: '1 / -1',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.75rem',
              color: '#1e40af'
            }}>
              {t('doctor.builder.clinic_ship_info')}
            </div>
          )}
        </div>
      </div>

      {/* ── COMPARTIR CON (multi-recipient) ── */}
      <div className="gcp-card">
        <div className="gcp-header">📤 {t('doctor.builder.share_rx_with')}</div>
        <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '-0.25rem' }}>
          {t('doctor.builder.share_rx_desc')}
        </div>

        {/* Patient toggle */}
        {rx.type === RX_TYPE.PATIENT && (
          <div style={{
            padding: '0.6rem 0.8rem', borderRadius: '4px',
            border: `1px solid ${rx.shareWithPatient ? '#1a73e8' : '#dadce0'}`,
            background: rx.shareWithPatient ? '#e8f0fe30' : 'var(--color-bg-surface)',
            transition: 'all 0.15s', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }} onClick={() => setRx(p => ({ ...p, shareWithPatient: !p.shareWithPatient }))}>
            <div style={{
              width: 18, height: 18, borderRadius: '4px', flexShrink: 0,
              border: `2px solid ${rx.shareWithPatient ? '#1a73e8' : 'var(--color-border)'}`,
              background: rx.shareWithPatient ? '#1a73e8' : 'var(--color-bg-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s',
            }}>
              {rx.shareWithPatient && <CheckCircle2 size={12} color="var(--color-bg-surface)" strokeWidth={3} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: rx.shareWithPatient ? '#1a73e8' : '#3c4043' }}>
                👤 {t('doctor.builder.share_with_patient_checkbox')}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '0.05rem' }}>
                {rx.shareWithPatient
                  ? (rx.patient.name || rx.patient.email || 'Ver y pagar aparecerá en su perfil')
                  : t('doctor.builder.patient_wont_see_rx')}
              </div>
            </div>
          </div>
        )}

        {/* Wholesalers multi-select */}
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#70757a',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
            🏭 {t('doctor.builder.wholesalers_lbl', { count: rx.wholesalerIds.length })}
          </div>
          {wholesalers.length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: '#9aa0a6', fontStyle: 'italic', padding: '0.25rem 0' }}>
              {t('doctor.builder.no_wholesalers_registered')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {wholesalers.map(ws => {
                const selected = rx.wholesalerIds.includes(ws.uid);
                return (
                  <div key={ws.uid} style={{
                    padding: '0.5rem 0.75rem', borderRadius: '4px',
                    border: `1px solid ${selected ? '#6366f1' : '#dadce0'}`,
                    background: selected ? '#6366f108' : 'var(--color-bg-surface)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem',
                    transition: 'all 0.12s',
                  }} onClick={() => toggleWholesaler(ws)}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '3px', flexShrink: 0,
                      border: `2px solid ${selected ? '#6366f1' : 'var(--color-border)'}`,
                      background: selected ? '#6366f1' : 'var(--color-bg-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected && <CheckCircle2 size={10} color="var(--color-bg-surface)" strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.78rem',
                        color: selected ? '#4338ca' : '#3c4043' }}>
                        {`${ws.firstName||''} ${ws.lastName||''}`.trim() || ws.email}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#5f6368' }}>
                        {ws.email}{ws.phone ? ` · ${ws.phone}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RECETAS ANTERIORES DEL HISTORIAL ── */}
      <div className="gcp-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="gcp-header"><Clock size={14} /> {t('doctor.builder.history_and_templates')}</div>
          <button 
            type="button"
            onClick={() => setShowHistoryPanel(v => !v)}
            style={{
              background: 'none', border: 'none', color: '#1a73e8', fontWeight: 600,
              fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            {showHistoryPanel ? t('doctor.builder.hide_history') : t('doctor.builder.show_history')}
          </button>
        </div>
        {showHistoryPanel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {loadingRecentRx ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '0.5rem' }}>
                {t('doctor.builder.loading_history')}
              </div>
            ) : recentPrescriptions.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>
                {t('doctor.builder.no_history_found')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '200px', overflowY: 'auto' }}>
                {recentPrescriptions.map(prevRx => (
                  <div key={prevRx.id} className="history-rx-row" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.5rem 0.65rem', border: '1px solid #e2e8f0', borderRadius: '6px',
                    background: 'var(--color-bg-app)', fontSize: '0.75rem', gap: '0.5rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>📄 {prevRx.patient?.name || prevRx.patient?.email || 'Suministro Clínica'}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                          ({prevRx.createdAt ? new Date(prevRx.createdAt.seconds ? prevRx.createdAt.seconds * 1000 : prevRx.createdAt).toLocaleDateString() : '—'})
                        </span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>
                        {prevRx.items?.map(it => `${it.name} (${it.quantity} ${it.unit})`).join(', ')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (prevRx.items && prevRx.items.length > 0) {
                          prevRx.items.forEach(it => {
                            addItem({
                              ...it,
                              id: it.type === 'supplement_compounding' ? `COMP-${it.format.substring(0, 3).toUpperCase()}-${it.servings || 60}-${Math.floor(1000 + Math.random() * 9000)}` : it.id,
                              sku: it.type === 'supplement_compounding' ? `COMP-${it.format.substring(0, 3).toUpperCase()}-${it.servings || 60}-${Math.floor(1000 + Math.random() * 9000)}` : (it.sku || '')
                            });
                          });
                          if (prevRx.patient && prevRx.type === 'patient') {
                            setField('patient.uid', prevRx.patient.uid || '');
                            setField('patient.name', prevRx.patient.name || '');
                            setField('patient.email', prevRx.patient.email || '');
                            setField('patient.phone', prevRx.patient.phone || '');
                          }
                          if (prevRx.diagnosis) {
                            setRx(prev => ({ ...prev, diagnosis: prevRx.diagnosis }));
                          }
                          showToast(t('doctor.builder.previous_items_loaded'));
                        }
                      }}
                      style={{
                        background: '#e8f0fe', color: '#1a73e8', border: 'none', borderRadius: '4px',
                        padding: '0.3rem 0.6rem', fontWeight: 700, fontSize: '0.68rem', cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {t('doctor.builder.duplicate_btn')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Item search + list ── */}
      <div className="gcp-card">
        {/* Toggle between Catalog and Compounding */}
        <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '0.75rem', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => setBuilderTab('catalog')}
            style={{
              background: 'none', border: 'none', borderBottom: builderTab === 'catalog' ? '2px solid #1a73e8' : 'none',
              color: builderTab === 'catalog' ? '#1a73e8' : 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.78rem',
              padding: '0.25rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s'
            }}
          >
            📦 {t('doctor.builder.catalog_tab')}
          </button>
          <button
            type="button"
            onClick={() => setBuilderTab('compounding')}
            style={{
              background: 'none', border: 'none', borderBottom: builderTab === 'compounding' ? '2px solid #0d9488' : 'none',
              color: builderTab === 'compounding' ? '#0d9488' : 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.78rem',
              padding: '0.25rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s'
            }}
          >
            🧪 {t('doctor.builder.compounding_tab')}
          </button>
        </div>

        {builderTab === 'compounding' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔬 {t('doctor.builder.compounding_title')}</span>
              <span style={{ fontSize: '0.68rem', color: '#115e59', background: '#ccfbf1', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Compounding</span>
            </div>

            {/* Presets Plantillas Rápidas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'var(--color-bg-surface)', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #ccfbf1' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                💡 Plantillas Populares de Suplementos (Carga Rápida)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  {
                    name: 'Fórmula Celular Antienvejecimiento',
                    format: 'capsules',
                    excipient: 'cellulose_capsule',
                    servings: 60,
                    instructions: 'Tomar 2 cápsulas al día con el desayuno.',
                    ingredients: [
                      { apiId: 'nmn', dose: '500' },
                      { apiId: 'resveratrol', dose: '250' },
                      { apiId: 'nad_pure', dose: '50' }
                    ]
                  },
                  {
                    name: 'Soporte Cognitivo & Relajación',
                    format: 'capsules',
                    excipient: 'cellulose_capsule',
                    servings: 60,
                    instructions: 'Tomar 2 cápsulas por la noche 30 minutos antes de dormir.',
                    ingredients: [
                      { apiId: 'magnesium_glycinate', dose: '400' },
                      { apiId: 'zinc_picolinate', dose: '15' },
                      { apiId: 'vitamin_b12', dose: '1000' }
                    ]
                  },
                  {
                    name: 'Soporte Inmune & Energía',
                    format: 'powder',
                    excipient: 'flavored_powder_base',
                    servings: 30,
                    instructions: 'Disolver 1 toma (cucharada) en un vaso de agua por la mañana.',
                    ingredients: [
                      { apiId: 'vitamin_c', dose: '1000' },
                      { apiId: 'vitamin_d3', dose: '5000' },
                      { apiId: 'coq10', dose: '100' }
                    ]
                  }
                ].map((tmpl, tIdx) => (
                  <button
                    key={tIdx}
                    type="button"
                    onClick={() => {
                      setCompoundName(tmpl.name);
                      setCompoundFormat(tmpl.format);
                      setCompoundExcipient(tmpl.excipient);
                      setCompoundServings(tmpl.servings);
                      setCompoundInstructions(tmpl.instructions);
                      setCompoundIngredients(tmpl.ingredients);
                      showToast(t('doctor.builder.template_loaded', { name: tmpl.name }));
                    }}
                    style={{
                      background: '#e6fffa', color: '#0d9488', border: '1px solid #99f6e4',
                      borderRadius: '4px', padding: '0.3rem 0.5rem', fontSize: '0.68rem',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = 'var(--color-bg-surface)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#e6fffa'; e.currentTarget.style.color = '#0d9488'; }}
                  >
                    🚀 {tmpl.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="compounding-grid">
              <label className="gcp-label">
                Nombre de la Fórmula
                <input 
                  value={compoundName} 
                  onChange={e => setCompoundName(e.target.value)} 
                  placeholder="Ej: Fórmula Celular Antienvejecimiento" 
                  style={{ ...fieldInput, borderColor: '#5eead4' }} 
                />
              </label>
              <label className="gcp-label">
                Formato
                <select 
                  value={compoundFormat} 
                  onChange={e => {
                    const fmt = e.target.value;
                    setCompoundFormat(fmt);
                    const compatibleExc = VEHICLES.find(v => v.formats.includes(fmt));
                    if (compatibleExc) setCompoundExcipient(compatibleExc.id);
                    const formatDef = FORMATS.find(f => f.id === fmt);
                    if (formatDef) setCompoundServings(formatDef.defaultServings);
                  }} 
                  style={{ ...fieldInput, borderColor: '#5eead4', cursor: 'pointer' }}
                >
                  {FORMATS.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </label>
              <label className="gcp-label">
                Excipiente / Vehículo
                <select 
                  value={compoundExcipient} 
                  onChange={e => setCompoundExcipient(e.target.value)} 
                  style={{ ...fieldInput, borderColor: '#5eead4', cursor: 'pointer' }}
                >
                  {VEHICLES.filter(v => v.formats.includes(compoundFormat)).map(v => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </label>
              <label className="gcp-label">
                Cantidad ({compoundFormat === 'capsules' ? 'Cápsulas' : 'Tomas'})
                <input 
                  type="number" 
                  min="1" 
                  value={compoundServings} 
                  onChange={e => setCompoundServings(Number(e.target.value))} 
                  style={{ ...fieldInput, borderColor: '#5eead4' }} 
                />
              </label>
            </div>

            <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #ccfbf1', borderRadius: '6px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e6fffa', paddingBottom: '0.35rem', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🧬 Ingredientes Activos de Suplementación (APIs)</span>
                <button
                  type="button"
                  onClick={() => {
                    setCompoundIngredients(p => [...p, { apiId: SUPPLEMENT_APIS[0].id, dose: '' }]);
                  }}
                  style={{
                    background: '#0d9488', color: 'white', border: 'none', borderRadius: '4px',
                    padding: '0.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  + Añadir Ingrediente
                </button>
              </div>

              {compoundIngredients.length === 0 ? (
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1rem', fontStyle: 'italic' }}>
                  Añade ingredientes activos para componer tu suplemento personalizado.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {compoundIngredients.map((ing, idx) => {
                    const selectedApi = SUPPLEMENT_APIS.find(a => a.id === ing.apiId) || SUPPLEMENT_APIS[0];
                    return (
                      <div key={idx} className="ingredients-grid-row">
                        <select
                          value={ing.apiId}
                          onChange={e => {
                            const newIngredients = [...compoundIngredients];
                            newIngredients[idx] = { ...newIngredients[idx], apiId: e.target.value };
                            setCompoundIngredients(newIngredients);
                          }}
                          style={{ ...fieldInput, flex: 2, padding: '0.25rem 0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          {SUPPLEMENT_APIS.map(api => (
                            <option key={api.id} value={api.id}>{api.name} ({api.category})</option>
                          ))}
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
                          <input
                            type="number"
                            placeholder="Dosis"
                            value={ing.dose}
                            onChange={e => {
                              const newIngredients = [...compoundIngredients];
                              newIngredients[idx] = { ...newIngredients[idx], dose: e.target.value };
                              setCompoundIngredients(newIngredients);
                            }}
                            style={{ ...fieldInput, width: '100%', padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                          />
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', minWidth: '30px' }}>
                            {selectedApi.unit}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', minWidth: '80px', textAlign: 'right' }}>
                          {(Number(ing.dose || 0) * selectedApi.costPerUnit).toFixed(4)}€ / toma
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCompoundIngredients(p => p.filter((_, i) => i !== idx));
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '0.25rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <label className="gcp-label">
              Pauta de uso sugerida para la fórmula
              <input
                value={compoundInstructions}
                onChange={e => setCompoundInstructions(e.target.value)}
                placeholder="Ej: Tomar 2 cápsulas diarias por la mañana con el desayuno."
                style={{ ...fieldInput, borderColor: '#5eead4' }}
              />
            </label>

            {(() => {
              const format = FORMATS.find(f => f.id === compoundFormat) || FORMATS[0];
              const pricingInfo = calculateCompoundPricing(compoundIngredients, compoundServings, compoundFormat, markupMargin);
              const totalB2B = pricingInfo.b2bCost;
              const totalB2C = pricingInfo.b2cPrice;
              const marginAmt = pricingInfo.markup;

              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #ccfbf1', paddingTop: '0.85rem', marginTop: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.65rem', display: 'block', fontWeight: 600 }}>COSTO CLÍNICA (B2B)</span>
                      <strong style={{ color: '#0f172a' }}>{totalB2B.toFixed(2)} EUR</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-success)', fontSize: '0.65rem', display: 'block', fontWeight: 600 }}>MARGEN MÉDICO ({markupMargin}%)</span>
                      <strong style={{ color: '#0f766e' }}>+{marginAmt.toFixed(2)} EUR</strong>
                    </div>
                    <div>
                      <span style={{ color: '#0d9488', fontSize: '0.65rem', display: 'block', fontWeight: 600 }}>P.V.P. PACIENTE (B2C)</span>
                      <strong style={{ color: '#0d9488', fontSize: '0.82rem' }}>{totalB2C.toFixed(2)} EUR</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!compoundName.trim()) {
                        showToast(t('doctor.builder.formula_name_req'), false);
                        return;
                      }
                      if (compoundIngredients.length === 0) {
                        showToast(t('doctor.builder.formula_ingredient_req'), false);
                        return;
                      }
                      if (compoundIngredients.some(ing => !ing.dose || isNaN(Number(ing.dose)) || Number(ing.dose) <= 0)) {
                        showToast(t('doctor.builder.formula_dose_req'), false);
                        return;
                      }

                      const formulaSku = `COMP-${compoundFormat.substring(0, 3).toUpperCase()}-${compoundServings}-${Math.floor(1000 + Math.random() * 9000)}`;
                      const resolvedIngredients = compoundIngredients.map(ing => {
                        const api = SUPPLEMENT_APIS.find(a => a.id === ing.apiId);
                        return {
                          apiId: ing.apiId,
                          name: api.name,
                          dose: ing.dose,
                          unit: api.unit,
                          costPerUnit: api.costPerUnit
                        };
                      });

                      addItem({
                        type: 'supplement_compounding',
                        id: formulaSku,
                        sku: formulaSku,
                        name: compoundName.trim(),
                        format: compoundFormat,
                        excipient: compoundExcipient,
                        quantity: 1,
                        unit: 'fórmula',
                        ingredients: resolvedIngredients,
                        dosage: compoundInstructions || `Tomar según indicación del profesional. (${compoundServings} ${format.unitLabel})`,
                        pricing: {
                          retail: {
                            perUnit: totalB2C,
                            currency: 'EUR'
                          },
                          clinic: {
                            perUnit: totalB2B,
                            currency: 'EUR'
                          }
                        }
                      });

                      setCompoundName('');
                      setCompoundIngredients([]);
                      setCompoundInstructions('');
                      showToast(t('doctor.builder.formula_added'));
                    }}
                    style={{
                      background: '#0d9488', color: 'white', border: 'none', borderRadius: '4px',
                      padding: '0.45rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0f766e'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0d9488'}
                  >
                    ➕ Agregar Fórmula a Prescripción
                  </button>
                </div>
              );
            })()}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="gcp-header"><PackageSearch size={14} /> Productos y Protocolos</div>
              <button 
                onClick={() => setShowCatalogBrowser(!showCatalogBrowser)}
                style={{
                  background: 'none', border: 'none', color: '#1a73e8', fontWeight: 600,
                  fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                {showCatalogBrowser ? 'Ocultar Catálogo completo' : 'Ver Catálogo completo'}
              </button>
            </div>

            <ProductSearchBar onAdd={addItem} catalogProducts={catalogProducts} catalogProtocols={catalogProtocols} />

            {/* Catalog Panel (Collapsible Grid) */}
            {showCatalogBrowser && (
              <div style={{
                background: '#f8f9fa',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '0.75rem',
                marginTop: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#202124' }}>
                    Catálogo de la Aplicación ({filteredCatalogItems.length} items)
                  </div>
                  <input 
                    value={catalogSearchQuery}
                    onChange={e => setCatalogSearchQuery(e.target.value)}
                    placeholder="Filtrar catálogo..."
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.25rem 0.5rem',
                      border: '1px solid #dadce0',
                      borderRadius: '3px',
                      width: '150px'
                    }}
                  />
                </div>
                {catalogLoading ? (
                  <div style={{ fontSize: '0.75rem', color: '#5f6368', textAlign: 'center', padding: '1rem' }}>
                    Cargando catálogo...
                  </div>
                ) : filteredCatalogItems.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: '#9aa0a6', textAlign: 'center', padding: '1rem', fontStyle: 'italic' }}>
                    No se encontraron productos en el catálogo.
                  </div>
                ) : (
                  <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                    <CatalogPreviewPanel 
                      catalog={{
                        heroTitle: "Catálogo Clínico Integral",
                        heroSubtitle: "Vademécum interactivo para formulación",
                        sections: [
                          {
                            title: "Tratamientos y Protocolos",
                            products: filteredCatalogItems.filter(i => i.type !== 'protocol').map(i => i.id),
                            protocols: filteredCatalogItems.filter(i => i.type === 'protocol').map(i => i.id)
                          }
                        ]
                      }}
                      products={filteredCatalogItems.filter(i => i.type !== 'protocol')}
                      protocols={filteredCatalogItems.filter(i => i.type === 'protocol')}
                      onAdd={addItem}
                    />
                  </div>
                )}
              </div>
            )}
{rx.items.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#5f6368', fontSize: '0.78rem',
            padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <ClipboardList size={24} strokeWidth={1.5} style={{ color: 'var(--color-border)' }} />
            <span>Busca en la barra de arriba o despliega el catálogo para añadir ítems de prescripción (Rx)</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
            {rx.items.map((item, i) => (
              <PrescriptionItemRow key={i} item={item} index={i}
                onChange={updateItem} onRemove={removeItem}
                onAddTest={addItem} catalogProducts={catalogProducts} />
            ))}
            <div style={{ textAlign: 'right', fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', marginTop: '0.25rem' }}>
              {rx.items.length} items agregados
            </div>
          </div>
        )}
      </>
    )}
    
    <PharmacokineticsSimulator selectedItems={rx.items} />
    <DrugInteractionChecker rxItems={rx.items} />
  </div>
      {currentStep === 4 && (
      <>
{/* ── LIVE PRICING ESTIMATION PANEL ── */}
      {rx.items.length > 0 && (
        <div className="gcp-card" style={{ border: "1.5px solid #cbd5e1", background: "var(--color-bg-app)" }}>
          <div className="gcp-header">📊 Resumen de Precios y Margen Clínico</div>
          {(() => {
            let totalClinic = 0;
            let hasPricing = false;
            let hasCompounding = false;
            rx.items.forEach(item => {
              if (item.type === 'supplement_compounding') {
                hasCompounding = true;
              }
              if (item.pricing) {
                const clinicVal = resolveVariantPrice({ pricing: item.pricing }, { tier: 'clinic' });
                if (clinicVal?.perUnit) {
                  totalClinic += clinicVal.perUnit * (item.quantity || 1);
                  hasPricing = true;
                }
              }
            });
            if (!hasPricing && !hasCompounding) {
              return (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', textAlign: 'center' }}>
                  Añade productos con precio para ver la estimación de costes.
                </div>
              );
            }

            if (!hasPricing && hasCompounding) {
              return (
                <div style={{ fontSize: '0.75rem', color: '#0f766e', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '0.85rem', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                  🧪 Tu receta contiene Fórmulas Magistrales puras. <br/>
                  <span style={{ fontSize: '0.68rem', color: '#134e4a', fontWeight: 400 }}>El costo total B2B y el margen B2C sugerido serán calculados y enviados por tu Account Manager una vez se solicite la cotización.</span>
                </div>
              );
            }

            const markupVal = totalClinic * (Number(markupMargin) / 100);
            const totalPatient = totalClinic + markupVal;
            const currency = rx.items.find(i => i.pricing)?.pricing?.clinic?.currency || 'EUR';
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {hasCompounding && (
                  <div style={{ fontSize: '0.7rem', color: '#b45309', background: 'var(--color-warning-bg)', border: '1px solid #fde68a', padding: '0.5rem 0.75rem', borderRadius: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={14} />
                    <span><strong>Atención:</strong> El total estimado excluye las Fórmulas Magistrales. Su costo se cotizará por separado.</span>
                  </div>
                )}
                {/* Margin Slider */}
                <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3c4043', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Ajustar Margen Clínico Global
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0d9488', background: '#f0fdfa', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #99f6e4' }}>
                      {markupMargin}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="range" 
                      min="0" 
                      max="150" 
                      step="5"
                      value={markupMargin} 
                      onChange={e => setMarkupMargin(Number(e.target.value))}
                      style={{ flex: 1, height: '6px', borderRadius: '3px', accentColor: '#0d9488', cursor: 'pointer' }}
                    />
                    <input 
                      type="number"
                      min="0" 
                      max="150"
                      value={markupMargin}
                      onChange={e => setMarkupMargin(Math.min(150, Math.max(0, Number(e.target.value))))}
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', textAlign: 'center' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                    * Ajusta el slider para recalcular el PVP de venta al paciente y tu beneficio clínico.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
                  <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.62rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      Costo Clínica (B2B)
                    </span>
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{formatPrice(totalClinic, currency)}</strong>
                  </div>
                  <div style={{ background: 'var(--color-bg-surface)', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '0.6rem' }}>
                    <span style={{ color: '#0f766e', fontSize: '0.62rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      Tu Margen Médico
                    </span>
                    <strong style={{ color: '#0d9488', fontSize: '0.95rem' }}>+{formatPrice(markupVal, currency)}</strong>
                  </div>
                  <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '0.6rem' }}>
                    <span style={{ color: '#0f766e', fontSize: '0.62rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                      Total Paciente (B2C)
                    </span>
                    <strong style={{ color: '#0d9488', fontSize: '1rem' }}>{formatPrice(totalPatient, currency)}</strong>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Clinical notes ── */}
      <div className="gcp-card">
        <div className="gcp-header"><Stethoscope size={14} /> Notas clínicas</div>
        <div className="form-grid-2col" style={{ gap: '0.75rem' }}>
          <label className="gcp-label">
            Diagnóstico / Indicación principal
            <input value={rx.diagnosis} onChange={e => setRx(p => ({ ...p, diagnosis: e.target.value }))}
              placeholder="Ej: Recuperación muscular, antienvejecimiento..." className="gcp-input" />
          </label>
          <label style={{ ...fieldLabel, gridColumn: '1 / -1' }}>
            Instrucciones para el paciente / wholesaler
            <textarea value={rx.clinicalNotes}
              onChange={e => setRx(p => ({ ...p, clinicalNotes: e.target.value }))}
              placeholder="Dosis total, pautas de almacenamiento, contraindicaciones..."
              rows={3}
              style={{ ...fieldInput, resize: 'vertical', lineHeight: 1.4 }} />
          </label>
        </div>
      </div>

      </>
      )}
{/* ── Navigation Buttons ── */}
      {!isSent && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', background: 'var(--color-bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid #dadce0', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            {currentStep > 1 && (
              <button onClick={() => setCurrentStep(s => s - 1)} className="gcp-btn-secondary">
                ← Previous
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button onClick={saveDraft} disabled={saving} className="gcp-btn-secondary">
              {saving ? <Loader2 size={14} style={{ animation: 'rxSpin 1s linear infinite' }} /> : <Save size={14} />}
              Save Draft
            </button>
            {currentStep < 4 ? (
              <button onClick={() => setCurrentStep(s => s + 1)} className="gcp-btn-primary">
                Next →
              </button>
            ) : (
              <button 
                onClick={send} 
                disabled={sending || isAssistant} 
                className="gcp-btn-primary"
                title={isAssistant ? "Solo un médico puede firmar y enviar esta prescripción." : ""}
              >
                {sending ? <Loader2 size={14} style={{ animation: 'rxSpin 1s linear infinite' }} /> : <Send size={14} />}
                {isAssistant 
                  ? "Req. Firma de Doctor" 
                  : (rx.items.some(i => i.type === 'supplement_compounding') ? "Request Quote" : "Send Prescription")}
              </button>
            )}
          </div>
        </div>
      )}
{isSent && (
        <ShareConfirmation
          rxId={savedId}
          rx={rx}
          onNewPrescription={() => {
            setRx({
              ...newRxDraft(doctorId, doctorName, doctorEmail),
              shippingAddressType: 'patient',
              shippingAddress: { address: '', city: '', zip: '', country: '' },
              delegatedAssistantId: '',
              kitStatus: 'none',
            });
            setSavedId(null);
          }}
          onClose={() => onSaved?.(true)}
        />
      )}

      {showMarginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-bg-surface)', borderRadius: '4px', width: '100%', maxWidth: '440px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', border: '1px solid #dadce0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#202124', margin: '0 0 0.5rem' }}>Configuración de Margen Clínico (Rx)</h3>
            <p style={{ fontSize: '0.75rem', color: '#5f6368', margin: '0 0 1rem', lineHeight: 1.4 }}>
              Configura el porcentaje de margen que deseas aplicar sobre el precio clínico para este pedido de prescripción.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#202124', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                  Porcentaje de Margen (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={markupMargin}
                    onChange={e => setMarkupMargin(e.target.value)}
                    style={{ width: '100px', background: 'var(--color-bg-surface)', border: '1px solid #dadce0', borderRadius: '4px', padding: '0.45rem 0.6rem', fontSize: '0.8rem', color: '#202124', outline: 'none', fontFamily: 'inherit' }}
                    onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                    onBlur={(e) => e.target.style.borderColor = '#dadce0'}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3c4043' }}>%</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#5f6368', marginTop: '0.35rem', fontStyle: 'italic' }}>
                  * Este margen se aplica sobre el precio clínico y no incluye el costo de envío (shipping).
                </div>
              </div>

              {/* Estimate preview */}
              {rx.items.length > 0 && (
                <div style={{ background: '#f8f9fa', border: '1px solid #dadce0', borderRadius: '4px', padding: '0.6rem 0.8rem', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#202124', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.3rem', marginBottom: '0.4rem', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.04em' }}>
                    Estimación del Pedido
                  </div>
                  {(() => {
                    let totalClinic = 0;
                    let hasPricing = false;
                    rx.items.forEach(item => {
                      if (item.pricing) {
                        const clinicVal = resolveVariantPrice({ pricing: item.pricing }, { tier: 'clinic' });
                        if (clinicVal?.perUnit) {
                          totalClinic += clinicVal.perUnit * (item.quantity || 1);
                          hasPricing = true;
                        }
                      }
                    });

                    if (!hasPricing) {
                      return <span style={{ color: '#70757a', fontStyle: 'italic' }}>Precio no resuelto para los ítems</span>;
                    }

                    const markupVal = totalClinic * (Number(markupMargin) / 100);
                    const totalPatient = totalClinic + markupVal;
                    const currency = rx.items[0]?.pricing?.clinic?.currency || 'EUR';

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#5f6368' }}>Total Clínica (Base B2B):</span>
                          <strong>{formatPrice(totalClinic, currency)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                          <span>Margen Médico ({markupMargin}%):</span>
                          <strong>+{formatPrice(markupVal, currency)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e0e0e0', paddingTop: '0.25rem', marginTop: '0.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                          <span style={{ color: '#202124' }}>Total Estimado Paciente:</span>
                          <span style={{ color: '#1a73e8' }}>{formatPrice(totalPatient, currency)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowMarginModal(false)} className="gcp-btn-secondary">
                Cancelar
              </button>
              <button type="button" onClick={confirmAndSend} className="gcp-btn-primary">
                Confirmar y Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rxSpin    { to { transform: rotate(360deg); } }
        @keyframes rxFadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rxSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .form-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .address-grid-4col {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
        }
        .compounding-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 0.65rem;
        }
        .ingredients-grid-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .history-rx-row {
          transition: all 0.15s ease;
        }
        .history-rx-row:hover {
          background: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
        }
        @media (max-width: 768px) {
          .form-grid-2col {
            grid-template-columns: 1fr !important;
          }
          .address-grid-4col {
            grid-template-columns: 1fr !important;
          }
          .compounding-grid {
            grid-template-columns: 1fr !important;
          }
          .ingredients-grid-row {
            flex-direction: column !important;
            align-items: stretch !important;
            background: #ffffff;
            padding: 0.75rem;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            position: relative;
          }
          .ingredients-grid-row > button {
            align-self: flex-end;
            margin-top: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}

