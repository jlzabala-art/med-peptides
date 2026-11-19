'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, FilePlus2, User, Stethoscope, FlaskConical, Search,
  Check, Loader2, Plus, Zap, ChevronDown, Clock, Pill,
  Tag, Trash2, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { searchAlgoliaFederated } from '../../../services/algoliaSearch';

// ── Volume / Quantity Grouped Presets (Compounding & Peptide Standard) ───────

const VOLUME_QTY_GROUPS = [
  {
    groupEn: '💉 Pens, Cartridges & Vials',
    groupEs: '💉 Pens, Cartuchos y Viales',
    options: [
      { value: '2 mL', hintEn: 'Pre-filled Pen / Vial', hintEs: 'Pen precargado / Vial' },
      { value: '2.4 mL', hintEn: 'Pre-filled Pen', hintEs: 'Pen precargado' },
      { value: '3 mL', hintEn: 'Pre-filled Pen / Cartridge', hintEs: 'Pen precargado / Cartucho' },
      { value: '5 mL', hintEn: 'Multi-dose Vial', hintEs: 'Vial multidosis' },
      { value: '10 mL', hintEn: 'Multi-dose Vial', hintEs: 'Vial multidosis' },
      { value: '1 Vial', hintEn: 'Lyophilized Powder Vial', hintEs: 'Vial liofilizado' },
      { value: '3 Vials', hintEn: 'Multi-vial Pack', hintEs: 'Pack 3 viales' },
    ],
  },
  {
    groupEn: '🧴 Topicals, Lotions & Shampoos',
    groupEs: '🧴 Tópicos, Lociones y Champús',
    options: [
      { value: '15 mL', hintEn: 'Dropper / Serum', hintEs: 'Gotero / Sérum' },
      { value: '30 mL', hintEn: 'Dropper / Airless Pump', hintEs: 'Gotero / Bomba airless' },
      { value: '50 mL', hintEn: 'Spray / Foam / Airless', hintEs: 'Spray / Espuma / Airless' },
      { value: '60 mL', hintEn: 'Topical Solution / TrichoSol', hintEs: 'Solución tópica / TrichoSol' },
      { value: '100 mL', hintEn: 'Lotion / TrichoSol / Foam', hintEs: 'Loción / TrichoSol / Espuma' },
      { value: '120 mL', hintEn: 'Topical Solution', hintEs: 'Solución tópica' },
      { value: '200 mL', hintEn: 'Compounded Shampoo', hintEs: 'Champú magistral' },
      { value: '250 mL', hintEn: 'Shampoo / TrichoWash', hintEs: 'Champú / TrichoWash' },
    ],
  },
  {
    groupEn: '🧪 Creams, Gels & Ointments',
    groupEs: '🧪 Cremas, Geles y Pomadas',
    options: [
      { value: '15 g', hintEn: 'Tube / Eye / Topical', hintEs: 'Tubo / Contorno / Tópico' },
      { value: '30 g', hintEn: 'Airless Pump / Cream / Gel', hintEs: 'Airless / Crema / Gel' },
      { value: '50 g', hintEn: 'Airless Pump / Cream / Gel', hintEs: 'Airless / Crema / Gel' },
      { value: '100 g', hintEn: 'Jar / Pump Dispenser', hintEs: 'Tarro / Dosificador' },
    ],
  },
  {
    groupEn: '💊 Oral Capsules & Sublingual Troches',
    groupEs: '💊 Cápsulas Orales y Troches Sublinguales',
    options: [
      { value: '30 Caps', hintEn: '1-month supply (1×/day)', hintEs: 'Suministro 1 mes (1×/día)' },
      { value: '60 Caps', hintEn: '1–2 month supply', hintEs: 'Suministro 1–2 meses' },
      { value: '90 Caps', hintEn: '3-month supply', hintEs: 'Suministro 3 meses' },
      { value: '100 Caps', hintEn: 'Fagron Oral Protocol', hintEs: 'Protocolo oral Fagron' },
      { value: '120 Caps', hintEn: '2-month supply (2×/day)', hintEs: 'Suministro 2 meses (2×/día)' },
      { value: '180 Caps', hintEn: '3-month supply (2×/day)', hintEs: 'Suministro 3 meses (2×/día)' },
      { value: '30 Troches', hintEn: 'Sublingual Lozenge Pack', hintEs: 'Pastillas sublinguales' },
      { value: '60 Troches', hintEn: 'Sublingual Lozenge Pack', hintEs: 'Pastillas sublinguales' },
    ],
  },
  {
    groupEn: '🔹 Pellets, Nasal & Other',
    groupEs: '🔹 Pellets, Nasal y Otros',
    options: [
      { value: '1 Pellet', hintEn: 'EU GMP Sterile Blister', hintEs: 'Blíster estéril EU GMP' },
      { value: '2 Pellets', hintEn: 'Sterile BHRT Implants', hintEs: 'Implantes BHRT estériles' },
      { value: '10 mL Nasal Spray', hintEn: 'Metered Nasal Spray', hintEs: 'Spray nasal dosificador' },
      { value: '15 mL Nasal Spray', hintEn: 'Metered Nasal Spray', hintEs: 'Spray nasal dosificador' },
      { value: '30 Sachets', hintEn: 'Oral Powder Packets', hintEs: 'Sobres de polvo oral' },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateLot() {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `PHARM-${new Date().getFullYear()}-MAN-${rand}`;
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Autocomplete Dropdown ─────────────────────────────────────────────────────

function AutoDropdown({ items, onSelect, onCreateNew, createLabel, loading, visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10000,
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(15,23,42,0.14)', overflow: 'hidden',
      marginTop: '2px', maxHeight: '240px', overflowY: 'auto',
    }}>
      {loading && (
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.78rem' }}>
          <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Buscando...
        </div>
      )}
      {!loading && items.length === 0 && onCreateNew && (
        <button type="button" onClick={onCreateNew}
          style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid #f1f5f9' }}>
          <Plus size={13} /> {createLabel}
        </button>
      )}
      {items.map((item, i) => (
        <button key={item.id || i} type="button" onClick={() => onSelect(item)}
          style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: i < items.length - 1 ? '1px solid #f8fafc' : 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          {item._avatar ? (
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: item._avatarColor || '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#3730a3', flexShrink: 0 }}>
              {item._avatar}
            </span>
          ) : item._icon ? (
            <span style={{ width: 28, height: 28, borderRadius: '6px', background: item._iconBg || '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item._icon}
            </span>
          ) : null}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
            {item.sub && <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.sub}</div>}
          </div>
          {item.badge && (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>{item.badge}</span>
          )}
        </button>
      ))}
      {items.length > 0 && onCreateNew && (
        <button type="button" onClick={onCreateNew}
          style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: '#f8fafc', border: 'none', borderTop: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.78rem', color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={12} /> {createLabel}
        </button>
      )}
    </div>
  );
}

// ── SmartField (reutilizable con autocomplete) ────────────────────────────────

function SmartField({ label, icon, iconColor = '#1a73e8', value, onChange, onSelect, onClear, selectedItem, placeholder, dropdownItems, loading, dropdownVisible, onFocus, onCreateNew, createLabel, required = false }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155', position: 'relative' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {React.cloneElement(icon, { size: 12, color: iconColor })}
        {label}{required && ' *'}
      </span>
      <div style={{ position: 'relative' }}>
        {selectedItem ? (
          <div style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
            {selectedItem._avatar && (
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: selectedItem._avatarColor || '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#3730a3', flexShrink: 0 }}>
                {selectedItem._avatar}
              </span>
            )}
            <Check size={12} color="#16a34a" />
            <span style={{ flex: 1, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedItem.label}</span>
            {selectedItem.badge && <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>{selectedItem.badge}</span>}
            <button type="button" onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0', display: 'flex' }}>
              <X size={12} />
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={12} style={{ position: 'absolute', left: '8px', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="text"
              required={required}
              value={value}
              onChange={e => onChange(e.target.value)}
              onFocus={onFocus}
              placeholder={placeholder}
              style={{ width: '100%', padding: '7px 10px 7px 26px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
            />
            {loading && <Loader2 size={12} style={{ position: 'absolute', right: '8px', color: '#94a3b8', animation: 'spin 1s linear infinite' }} />}
          </div>
        )}
        <AutoDropdown
          items={dropdownItems}
          onSelect={onSelect}
          onCreateNew={onCreateNew}
          createLabel={createLabel}
          loading={loading}
          visible={dropdownVisible && !selectedItem}
        />
      </div>
    </label>
  );
}

// ── Ingredient Chip ────────────────────────────────────────────────────────────

function IngredientChips({ chips, onRemove }) {
  if (!chips.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '4px' }}>
      {chips.map((c, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.74rem', fontWeight: 600, color: '#1d4ed8' }}>
          <Pill size={10} />
          {c}
          <button type="button" onClick={() => onRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#93c5fd', display: 'flex' }}>
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function QuickManualRxModal({ isOpen, onClose, onCreated, isEs = false }) {
  // ── Patient
  const [patientQuery, setPatientQuery] = useState('');
  const [patientItems, setPatientItems] = useState([]);
  const [patientSelected, setPatientSelected] = useState(null);
  const [patientDropdown, setPatientDropdown] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);

  // ── Doctor
  const [doctorQuery, setDoctorQuery] = useState('');
  const [doctorItems, setDoctorItems] = useState([]);
  const [doctorSelected, setDoctorSelected] = useState(null);
  const [doctorDropdown, setDoctorDropdown] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);

  // ── Formula
  const [formulaQuery, setFormulaQuery] = useState('');
  const [formulaItems, setFormulaItems] = useState([]);
  const [formulaSelected, setFormulaSelected] = useState(null);
  const [formulaDropdown, setFormulaDropdown] = useState(false);
  const [formulaLoading, setFormulaLoading] = useState(false);

  // ── Active Ingredients (chips)
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientChips, setIngredientChips] = useState([]);
  const [ingredientItems, setIngredientItems] = useState([]);
  const [ingredientDropdown, setIngredientDropdown] = useState(false);
  const [ingredientLoading, setIngredientLoading] = useState(false);

  // ── Other fields
  const [volume, setVolume] = useState('30 mL');
  const [volumeDropdown, setVolumeDropdown] = useState(false);
  const [volumeFilter, setVolumeFilter] = useState('');
  const [directions, setDirections] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const debounceRef = useRef({});
  const modalRef = useRef(null);
  const volumeBoxRef = useRef(null);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    function handler(e) {
      if (volumeBoxRef.current && !volumeBoxRef.current.contains(e.target)) {
        setVolumeDropdown(false);
        setVolumeFilter('');
      }
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setPatientDropdown(false);
        setDoctorDropdown(false);
        setFormulaDropdown(false);
        setIngredientDropdown(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // ── Debounced Algolia search ────────────────────────────────────────────────
  const debouncedSearch = useCallback((key, fn, delay = 280) => {
    clearTimeout(debounceRef.current[key]);
    debounceRef.current[key] = setTimeout(fn, delay);
  }, []);

  // ── Patient search ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (patientQuery.length < 2) { setPatientItems([]); return; }
    setPatientLoading(true);
    debouncedSearch('patient', async () => {
      try {
        const res = await searchAlgoliaFederated(patientQuery, ['atlas_patients'], 8);
        setPatientItems((res.patients || []).map(h => ({
          id: h.objectID || h.id,
          label: h.name || h.patientName || h.fullName || h.objectID,
          sub: [h.fileNumber || h.mrn, h.email || h.phone, h.city].filter(Boolean).join(' · '),
          badge: h.fileNumber || h.mrn,
          doctorId: h.doctorId,
          doctorName: h.doctorName || h.prescribingDoctor,
          _avatar: getInitials(h.name || h.patientName || ''),
          _avatarColor: '#e0e7ff',
          _raw: h,
        })));
      } catch { setPatientItems([]); } finally { setPatientLoading(false); }
    });
  }, [patientQuery, debouncedSearch]);

  // ── Doctor search ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (doctorQuery.length < 2) { setDoctorItems([]); return; }
    setDoctorLoading(true);
    debouncedSearch('doctor', async () => {
      try {
        const res = await searchAlgoliaFederated(doctorQuery, ['atlas_users'], 8);
        setDoctorItems((res.users || []).map(h => ({
          id: h.objectID || h.id,
          label: h.displayName || h.name || h.email,
          sub: [h.specialty || 'Physician', h.clinicName || h.clinic, h.license ? `Lic: ${h.license}` : null].filter(Boolean).join(' · '),
          badge: h.license ? '✓ Lic.' : null,
          _avatar: getInitials(h.displayName || h.name || ''),
          _avatarColor: '#d1fae5',
          _raw: h,
        })));
      } catch { setDoctorItems([]); } finally { setDoctorLoading(false); }
    });
  }, [doctorQuery, debouncedSearch]);

  // ── Formula/Protocol search ────────────────────────────────────────────────
  useEffect(() => {
    if (formulaQuery.length < 2) { setFormulaItems([]); return; }
    setFormulaLoading(true);
    debouncedSearch('formula', async () => {
      try {
        const res = await searchAlgoliaFederated(formulaQuery, ['products', 'protocols'], 6);
        const protocols = (res.protocols || []).map(h => ({
          id: h.objectID || h.id,
          label: h.name || h.title || h.protocolName,
          sub: h.description || h.activeIngredients || h.summary,
          badge: isEs ? 'Protocolo' : 'Protocol',
          _icon: <FlaskConical size={14} color="#7c3aed" />,
          _iconBg: '#f5f3ff',
          _type: 'protocol',
          _raw: h,
        }));
        const products = (res.products || []).map(h => ({
          id: h.objectID || h.id,
          label: h.name || h.productName || h.title,
          sub: [h.volume || h.presentation, h.activeIngredients || h.composition].filter(Boolean).join(' · '),
          badge: isEs ? 'Producto' : 'Product',
          _icon: <Pill size={14} color="#1a73e8" />,
          _iconBg: '#eff6ff',
          _type: 'product',
          _raw: h,
        }));
        setFormulaItems([...protocols, ...products]);
      } catch { setFormulaItems([]); } finally { setFormulaLoading(false); }
    });
  }, [formulaQuery, isEs, debouncedSearch]);

  // ── Ingredient search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (ingredientInput.length < 2) { setIngredientItems([]); return; }
    setIngredientLoading(true);
    debouncedSearch('ingredient', async () => {
      try {
        const res = await searchAlgoliaFederated(ingredientInput, ['products'], 8, { distinct: false });
        setIngredientItems((res.products || []).map(h => ({
          id: h.objectID,
          label: h.name || h.productName,
          sub: h.concentration || h.dose || h.activeIngredient,
          _icon: <Pill size={12} color="#7c3aed" />,
          _iconBg: '#f5f3ff',
          _raw: h,
        })));
      } catch { setIngredientItems([]); } finally { setIngredientLoading(false); }
    });
  }, [ingredientInput, debouncedSearch]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function selectPatient(item) {
    setPatientSelected(item);
    setPatientDropdown(false);
    // Smart-fill doctor if patient has one
    if (item.doctorName && !doctorSelected) {
      setDoctorSelected({ id: item.doctorId || '', label: item.doctorName, _avatar: getInitials(item.doctorName), _avatarColor: '#d1fae5' });
    }
    toast.success(isEs ? `Paciente: ${item.label}` : `Patient: ${item.label}`, { duration: 1800 });
  }

  function selectDoctor(item) {
    setDoctorSelected(item);
    setDoctorDropdown(false);
  }

  function selectFormula(item) {
    setFormulaSelected(item);
    setFormulaDropdown(false);
    const raw = item._raw || {};
    // Smart-fill from product/protocol
    if (raw.volume || raw.presentation) setVolume(raw.volume || raw.presentation || '30 mL');
    const actives = raw.activeIngredients || raw.composition || raw.apis || '';
    if (actives && typeof actives === 'string') {
      const chips = actives.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
      if (chips.length) setIngredientChips(chips);
    } else if (Array.isArray(actives) && actives.length) {
      setIngredientChips(actives.map(a => (typeof a === 'string' ? a : (a.name + (a.dose || a.concentration ? ': ' + (a.dose || a.concentration) : '')))));
    }
    if (raw.directions || raw.posology || raw.instructions) {
      setDirections(raw.directions || raw.posology || raw.instructions);
    }
    toast.success(isEs ? `Fórmula cargada: ${item.label}` : `Formula loaded: ${item.label}`, { duration: 2000 });
  }

  function addIngredientChip(label) {
    if (!label.trim() || ingredientChips.includes(label.trim())) return;
    setIngredientChips(prev => [...prev, label.trim()]);
    setIngredientInput('');
    setIngredientItems([]);
    setIngredientDropdown(false);
  }

  function handleIngredientKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && ingredientInput.trim()) {
      e.preventDefault();
      addIngredientChip(ingredientInput);
    }
    if (e.key === 'Backspace' && !ingredientInput && ingredientChips.length) {
      setIngredientChips(prev => prev.slice(0, -1));
    }
  }

  function appendPosology(text) {
    setDirections(prev => (prev ? prev + ' ' + text : text).trim());
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    const pName = patientSelected?.label || patientQuery.trim();
    const fTitle = formulaSelected?.label || formulaQuery.trim();
    if (!pName || !fTitle) {
      toast.error(isEs ? 'Nombre del paciente y fórmula son obligatorios' : 'Patient name and formula title are required');
      return;
    }

    setSubmitting(true);
    try {
      const code = `RX-${Math.floor(10000 + Math.random() * 90000)}`;
      const activesText = ingredientChips.join(', ');
      const apis = ingredientChips.map(c => {
        const [name, dose] = c.split(':').map(s => s.trim());
        return { name, dose: dose || '' };
      });

      const labelObj = {
        phaseNumber: 1, partKey: 'part_1',
        productTitle: fTitle, productName: fTitle,
        volume: volume.trim() || '30 mL',
        directions: directions.trim() || 'Apply or administer as directed by physician.',
        apis, composition: activesText, activesSummary: activesText,
        batchNumber: batchNumber.trim() || undefined,
        expiryDate: expiryDate || undefined,
        approvalStatus: 'draft',
      };

      const rxPayload = {
        code, prescriptionCode: code,
        patientName: pName,
        patientId: patientSelected?.id || undefined,
        doctorName: doctorSelected?.label || doctorQuery.trim() || 'Prescribing Physician',
        doctorId: doctorSelected?.id || undefined,
        title: fTitle, treatmentTitle: fTitle,
        status: 'draft',
        parts: [{ title: fTitle, volume: labelObj.volume, directions: labelObj.directions, apis }],
        pharmacyLabels: [labelObj],
      };

      const res = await fetch('/api/labels/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptions: [rxPayload] }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not create prescription');

      toast.success(isEs ? `Prescripción #${code} creada` : `Prescription #${code} created`);
      // Reset
      setPatientQuery(''); setPatientSelected(null);
      setDoctorQuery(''); setDoctorSelected(null);
      setFormulaQuery(''); setFormulaSelected(null);
      setIngredientChips([]); setIngredientInput('');
      setDirections(''); setBatchNumber(''); setExpiryDate(''); setVolume('30 mL');
      onCreated?.(data.created || [{ code }]);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error creating prescription');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  // ── Posology quick chips ───────────────────────────────────────────────────
  const posologyChips = isEs
    ? [{ label: '☀️ Mañana', val: 'Aplicar por la mañana.' }, { label: '🌙 Noche', val: 'Aplicar antes de dormir.' }, { label: '🍽️ Con comida', val: 'Tomar con alimentos.' }, { label: '🚿 Pre-lavado', val: 'Aplicar como pre-shampoo, masajear 2 min y aclarar.' }, { label: '1× semana', val: 'Una vez a la semana.' }]
    : [{ label: '☀️ Morning', val: 'Apply once in the morning.' }, { label: '🌙 Bedtime', val: 'Apply before bedtime.' }, { label: '🍽️ With food', val: 'Take with food.' }, { label: '🚿 Pre-wash', val: 'Apply as pre-shampoo, massage 2 min and rinse.' }, { label: '1×/week', val: 'Once weekly.' }];

  // ── Styles ─────────────────────────────────────────────────────────────────
  const fieldLabel = { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#334155' };
  const input = { padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .qmrx-chip-btn:hover { background: #e0e7ff !important; }
        .qmrx-posology-chip:hover { background: #f1f5f9 !important; border-color: #94a3b8 !important; }
        .qmrx-bud-btn:hover { background: #eff6ff !important; }
      `}</style>
      <div
        role="dialog" aria-modal="true"
        aria-label={isEs ? 'Nueva Prescripción Manual' : 'Quick Manual Prescription'}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15,23,42,0.58)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      >
        <div ref={modalRef} onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto', background: '#ffffff', borderRadius: '14px', border: '1px solid #cbd5e1', boxShadow: '0 20px 45px rgba(15,23,42,0.22)' }}>

          {/* ── Header ── */}
          <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilePlus2 size={18} color="#1a73e8" />
              <div>
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Nueva Prescripción Manual (Sin PDF)' : 'Quick Manual Prescription (No PDF)'}
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {isEs ? 'Busca pacientes, médicos y fórmulas existentes · Alta rápida si no existen' : 'Search existing patients, doctors & formulas · Quick register if not found'}
                </div>
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Patient + Doctor row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <SmartField
                label={isEs ? 'Paciente' : 'Patient Name'}
                icon={<User />} iconColor="#1a73e8" required
                value={patientQuery} onChange={v => { setPatientQuery(v); setPatientDropdown(true); }}
                onFocus={() => { if (patientQuery.length >= 2) setPatientDropdown(true); }}
                onSelect={selectPatient} onClear={() => { setPatientSelected(null); setPatientQuery(''); }}
                selectedItem={patientSelected}
                dropdownItems={patientItems} loading={patientLoading} dropdownVisible={patientDropdown}
                placeholder={isEs ? 'Nombre, MRN, teléfono...' : 'Name, MRN, phone, email…'}
                onCreateNew={() => {
                  const name = patientQuery.trim();
                  if (name) { setPatientSelected({ id: null, label: name, _avatar: getInitials(name), badge: isEs ? 'Nuevo' : 'New', _avatarColor: '#fef9c3' }); setPatientDropdown(false); }
                }}
                createLabel={isEs ? `➕ Dar de alta nuevo paciente: "${patientQuery}"` : `➕ Add new patient: "${patientQuery}"`}
              />
              <SmartField
                label={isEs ? 'Médico Prescriptor' : 'Prescribing Physician'}
                icon={<Stethoscope />} iconColor="#16a34a"
                value={doctorQuery} onChange={v => { setDoctorQuery(v); setDoctorDropdown(true); }}
                onFocus={() => { if (doctorQuery.length >= 2) setDoctorDropdown(true); }}
                onSelect={selectDoctor} onClear={() => { setDoctorSelected(null); setDoctorQuery(''); }}
                selectedItem={doctorSelected}
                dropdownItems={doctorItems} loading={doctorLoading} dropdownVisible={doctorDropdown}
                placeholder={isEs ? 'Dr. Nombre, especialidad, clínica…' : 'Dr. Name, specialty, clinic…'}
                onCreateNew={() => {
                  const name = doctorQuery.trim();
                  if (name) { setDoctorSelected({ id: null, label: name.startsWith('Dr') ? name : `Dr. ${name}`, _avatar: getInitials(name), _avatarColor: '#d1fae5', badge: isEs ? 'Externo' : 'Ext.' }); setDoctorDropdown(false); }
                }}
                createLabel={isEs ? `➕ Registrar nuevo médico externo: "${doctorQuery}"` : `➕ Register new external doctor: "${doctorQuery}"`}
              />
            </div>

            {/* Formula + Volume row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <SmartField
                label={isEs ? 'Fórmula / Protocolo' : 'Formula / Protocol'}
                icon={<FlaskConical />} iconColor="#7c3aed" required
                value={formulaQuery} onChange={v => { setFormulaQuery(v); setFormulaDropdown(true); }}
                onFocus={() => { if (formulaQuery.length >= 2) setFormulaDropdown(true); }}
                onSelect={selectFormula} onClear={() => { setFormulaSelected(null); setFormulaQuery(''); }}
                selectedItem={formulaSelected}
                dropdownItems={formulaItems} loading={formulaLoading} dropdownVisible={formulaDropdown}
                placeholder={isEs ? 'GHK-Cu, BPC-157, TrichoWash, Minoxidil…' : 'GHK-Cu, BPC-157, TrichoWash, Minoxidil…'}
                onCreateNew={() => {
                  const name = formulaQuery.trim();
                  if (name) { setFormulaSelected({ id: null, label: name, _icon: <FlaskConical size={14} color="#7c3aed" />, _iconBg: '#f5f3ff', badge: isEs ? 'Ad-hoc' : 'Custom' }); setFormulaDropdown(false); }
                }}
                createLabel={isEs ? `⚙️ Crear fórmula magistral ad-hoc: "${formulaQuery}"` : `⚙️ Create custom ad-hoc formula: "${formulaQuery}"`}
              />
              <div ref={volumeBoxRef} style={{ ...fieldLabel, position: 'relative' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{isEs ? 'Volumen / Cant.' : 'Volume / Qty'}</span>
                </span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={volume}
                    onChange={e => {
                      setVolume(e.target.value);
                      setVolumeFilter(e.target.value);
                      setVolumeDropdown(true);
                    }}
                    onFocus={() => {
                      setVolumeFilter('');
                      setVolumeDropdown(true);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Escape') {
                        setVolumeDropdown(false);
                        setVolumeFilter('');
                      } else if (e.key === 'Enter' && volumeDropdown) {
                        e.preventDefault();
                        setVolumeDropdown(false);
                        setVolumeFilter('');
                      }
                    }}
                    placeholder={isEs ? 'Ej. 30 mL, 60 Caps…' : 'e.g. 30 mL, 60 Caps…'}
                    style={{ ...input, paddingRight: '28px', fontWeight: 600 }}
                  />
                  <button
                    type="button"
                    aria-label={isEs ? 'Abrir opciones de volumen y cantidad' : 'Toggle volume and quantity options'}
                    onClick={() => {
                      setVolumeFilter('');
                      setVolumeDropdown(prev => !prev);
                    }}
                    style={{
                      position: 'absolute',
                      right: '4px',
                      width: '24px',
                      height: '24px',
                      border: 'none',
                      background: 'transparent',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                    }}
                  >
                    <ChevronDown size={14} style={{ transform: volumeDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                  </button>
                </div>

                {volumeDropdown && (() => {
                  const q = volumeFilter.trim().toLowerCase();
                  const filteredGroups = VOLUME_QTY_GROUPS.map(g => ({
                    ...g,
                    options: g.options.filter(opt =>
                      !q ||
                      opt.value.toLowerCase().includes(q) ||
                      opt.hintEn.toLowerCase().includes(q) ||
                      opt.hintEs.toLowerCase().includes(q) ||
                      g.groupEn.toLowerCase().includes(q) ||
                      g.groupEs.toLowerCase().includes(q)
                    ),
                  })).filter(g => g.options.length > 0);
                  const exactMatch = VOLUME_QTY_GROUPS.some(g => g.options.some(o => o.value.toLowerCase() === volume.trim().toLowerCase()));

                  return (
                    <div
                      role="listbox"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        minWidth: '240px',
                        width: '100%',
                        zIndex: 10002,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        boxShadow: '0 10px 28px rgba(15, 23, 42, 0.16)',
                        marginTop: '3px',
                        maxHeight: '260px',
                        overflowY: 'auto',
                      }}
                    >
                      {filteredGroups.map(group => (
                        <div key={group.groupEn}>
                          <div style={{
                            padding: '5px 10px 3px',
                            fontSize: '0.64rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: '#64748b',
                            background: '#f8fafc',
                            borderTop: '1px solid #f1f5f9',
                            borderBottom: '1px solid #f1f5f9',
                            position: 'sticky',
                            top: 0,
                          }}>
                            {isEs ? group.groupEs : group.groupEn}
                          </div>
                          {group.options.map(opt => {
                            const isSelected = volume.trim().toLowerCase() === opt.value.toLowerCase();
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setVolume(opt.value);
                                  setVolumeDropdown(false);
                                  setVolumeFilter('');
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '6px 10px',
                                  background: isSelected ? '#eff6ff' : '#ffffff',
                                  border: 'none',
                                  borderBottom: '1px solid #f8fafc',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px',
                                }}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#ffffff'; }}
                              >
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? '#1a73e8' : '#0f172a', whiteSpace: 'nowrap' }}>
                                  {opt.value}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {isEs ? opt.hintEs : opt.hintEn}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ))}

                      {volume.trim() && !exactMatch && (
                        <button
                          type="button"
                          onClick={() => {
                            setVolume(volume.trim());
                            setVolumeDropdown(false);
                            setVolumeFilter('');
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 10px',
                            background: '#f8fafc',
                            border: 'none',
                            borderTop: '1px solid #e2e8f0',
                            color: '#1a73e8',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Plus size={12} />
                          <span>{isEs ? `Usar personalizado: "${volume.trim()}"` : `Use custom: "${volume.trim()}"`}</span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Ingredients chips */}
            <label style={fieldLabel}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} color="#7c3aed" />
                {isEs ? 'Principios Activos' : 'Active Ingredients'}
                <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.7rem' }}>
                  {isEs ? '(Enter o coma para añadir)' : '(Enter or comma to add)'}
                </span>
              </span>
              <IngredientChips chips={ingredientChips} onRemove={i => setIngredientChips(prev => prev.filter((_, idx) => idx !== i))} />
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Pill size={12} style={{ position: 'absolute', left: '8px', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={ingredientInput}
                    onChange={e => { setIngredientInput(e.target.value); setIngredientDropdown(true); }}
                    onFocus={() => { if (ingredientInput.length >= 2) setIngredientDropdown(true); }}
                    onKeyDown={handleIngredientKeyDown}
                    placeholder={isEs ? 'GHK-Cu: 1mg, BPC-157: 200mcg…' : 'GHK-Cu: 1mg, BPC-157: 200mcg…'}
                    style={{ ...input, paddingLeft: '26px' }}
                  />
                  {ingredientLoading && <Loader2 size={12} style={{ position: 'absolute', right: '8px', color: '#94a3b8', animation: 'spin 1s linear infinite' }} />}
                </div>
                <AutoDropdown
                  items={ingredientItems}
                  onSelect={item => addIngredientChip(item.label + (item.sub ? ': ' + item.sub : ''))}
                  onCreateNew={() => addIngredientChip(ingredientInput)}
                  createLabel={isEs ? `➕ Añadir: "${ingredientInput}"` : `➕ Add: "${ingredientInput}"`}
                  loading={ingredientLoading}
                  visible={ingredientDropdown && ingredientInput.length >= 2}
                />
              </div>
            </label>

            {/* Directions + Posology chips */}
            <label style={fieldLabel}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} color="#d97706" />
                {isEs ? 'Posología / Instrucciones' : 'Directions / Posology'}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '5px' }}>
                {posologyChips.map(c => (
                  <button key={c.label} type="button" className="qmrx-posology-chip" onClick={() => appendPosology(c.val)}
                    style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {c.label}
                  </button>
                ))}
              </div>
              <textarea rows={2} value={directions} onChange={e => setDirections(e.target.value)}
                placeholder={isEs ? 'Aplicar 1 mL cada noche…' : 'Apply 1 mL once nightly…'}
                style={{ ...input, resize: 'vertical', fontFamily: 'inherit' }} />
            </label>

            {/* Lot + BUD */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label style={fieldLabel}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={12} color="#d97706" />
                  {isEs ? 'Lote (opcional)' : 'Lot # (optional)'}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input type="text" value={batchNumber} onChange={e => setBatchNumber(e.target.value)}
                    placeholder="PHARM-2026-MAN-…" style={{ ...input, fontFamily: 'monospace', fontSize: '0.76rem', flex: 1 }} />
                  <button type="button" onClick={() => setBatchNumber(generateLot())}
                    title={isEs ? 'Auto-generar lote' : 'Auto-generate lot'}
                    style={{ padding: '0 8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Zap size={13} color="#d97706" />
                  </button>
                </div>
              </label>
              <label style={fieldLabel}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} color="#7c3aed" />
                  {isEs ? 'Caducidad BUD (opcional)' : 'BUD / Expiry (optional)'}
                </span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
                    style={{ ...input, flex: 1, minWidth: '110px', fontSize: '0.78rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {[{ label: '+30d', days: 30 }, { label: '+60d', days: 60 }, { label: '+6m', days: 180 }, { label: '+1yr', days: 365 }].map(b => (
                    <button key={b.label} type="button" className="qmrx-bud-btn" onClick={() => setExpiryDate(addDays(b.days))}
                      style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <button type="button" onClick={onClose} disabled={submitting}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
              <button type="submit" disabled={submitting}
                style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: submitting ? '#93c5fd' : '#1a73e8', color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {submitting
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />{isEs ? 'Creando…' : 'Creating…'}</>
                  : <><FilePlus2 size={14} />{isEs ? 'Crear y Abrir en Estudio' : 'Create & Open Studio'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
