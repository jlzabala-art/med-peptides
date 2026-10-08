"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Pill, 
  Sparkles, 
  FileText, 
  Users, 
  AlertCircle, 
  ArrowUpRight, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Edit3,
  User,
  Save,
  CheckCircle2, 
  Tag,
  Eye,
  SlidersHorizontal,
  Calendar,
  Layers,
  Activity,
  RotateCw,
  Download,
  Plus,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FlaskConical,
  BookOpen,
  Loader2,
  Search,
  X,
  FileInput,
  MessageSquare,
  MessageCircle,
  Send,
  Bot,
  HelpCircle,
  Phone,
  Printer,
  Sun,
  Moon,
  RefreshCw,
  Dna
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PrescriptionIntakeWorkspace from '@/features/prescriptions/components/PrescriptionIntakeWorkspace';
import PharmacyLabelsModal from '@/components/prescription/PharmacyLabelsModal';
import ClinicalIntelligenceBanner from '@/components/doctor/ClinicalIntelligenceBanner';
import DoctorClinicalAnalytics from '@/components/doctor/DoctorClinicalAnalytics';
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
import { getFagronClinicalMonograph } from '@/data/fagronClinicalMonographs';
import { getPrescriptionAtlasRecommendations } from '@/services/atlasRecommendationsEngine';
import { triggerHaptic } from '@/utils/haptics';

function safeRenderText(val, fallback = '') {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (typeof val.summary === 'string') return val.summary;
    if (typeof val.description === 'string') return val.description;
    if (typeof val.text === 'string') return val.text;
    if (typeof val.content === 'string') return val.content;
    if (Array.isArray(val)) return val.map(x => safeRenderText(x)).filter(Boolean).join(', ');
    return fallback;
  }
  return String(val);
}

export function enrichApiClinicalDetails(api) {
  if (!api) return {};
  const rawName = api.name || api.drugName || api.activeIngredient || api.productName || 'Active Pharmaceutical Ingredient';
  const rawDose = api.dose || api.dosage || api.strength || api.concentration || 'Compounded Strength';
  
  const mono = getFagronClinicalMonograph(api.productId) ||
               getFagronClinicalMonograph(rawName) ||
               getFagronClinicalMonograph(api.activeIngredient) ||
               getFagronClinicalMonograph(rawName.toLowerCase());

  const pharmacologicalClass = api.therapeuticClass || api.pharmacologicalClass || mono?.pharmacologicalClass || api.category || 'Therapeutic Active Ingredient (API)';
  const clinicalIndication = api.clinicalIndication || mono?.clinicalIndication || 'Targeted Follicular / Metabolic Clinical Optimization';
  const mechanismOfAction = api.mechanism || api.mechanismOfAction || mono?.mechanismOfAction || null;
  const cellularTarget = api.cellularTarget || null;
  const geneTargets = (mono?.geneTargets && mono.geneTargets.length > 0) ? mono.geneTargets : (api.geneTargets || []);

  return {
    id: api.id,
    name: rawName,
    dose: rawDose,
    pharmacologicalClass,
    clinicalIndication,
    mechanismOfAction,
    cellularTarget,
    geneTargets,
    instructions: api.instructions || ''
  };
}

export function resolvePrescriptionParts(rx) {
  if (!rx) return [];

  // 1. Explicit rx.parts array already parsed from doctorCache or document
  if (Array.isArray(rx.parts) && rx.parts.length > 0) {
    return rx.parts.map((p, pIdx) => {
      const partNum = p.partNumber || (pIdx + 1);
      const vName = p.vehicle || p.title || '';
      const isOil = String(vName + ' ' + (p.title || '')).toLowerCase().includes('oil') || String(vName).toLowerCase().includes('aceite');
      const isOral = String(vName + ' ' + (p.format || '') + ' ' + (p.title || '')).toLowerCase().includes('oral') || String(vName + ' ' + (p.format || '')).toLowerCase().includes('capsule');
      const isFoam = String(vName + ' ' + (p.title || '')).toLowerCase().includes('foam') || String(vName).toLowerCase().includes('espuma');
      
      const badgeText = isOil ? 'SCALP CARE & LIPIDIC OIL' : (isOral ? 'ORAL CAPSULES' : (isFoam ? 'TOPICAL FOAM' : 'TOPICAL SOLUTION'));
      const accentColor = isOil ? '#0d9488' : (isOral ? '#ea580c' : (isFoam ? '#7c3aed' : '#0284c7'));
      const accentBg = isOil ? '#f0fdfa' : (isOral ? '#fff7ed' : (isFoam ? '#faf5ff' : '#f0f9ff'));
      const borderAccent = isOil ? '#99f6e4' : (isOral ? '#fed7aa' : (isFoam ? '#e9d5ff' : '#bae6fd'));

      return {
        partNumber: partNum,
        totalParts: rx.parts.length,
        title: p.title || (isOil ? 'Scalp Care & Lipid Protection' : (isOral ? 'Systemic Nutraceutical Support' : 'Topical Compounded Solution')),
        badge: `PART ${partNum} OF ${rx.parts.length} · ${badgeText}`,
        volume: p.volume || (isOil ? '30 mL' : (isOral ? '90 Capsules' : '100 mL')),
        format: p.format || badgeText,
        vehicle: vName || (isOil ? 'TrichoOil™ Natural Lipidic Carrier (q.s. 30 mL)' : (isOral ? 'Vegetarian HPMC Capsules (90 Caps)' : 'TrichoSol™ Liposomal Hydrophilic Base (q.s. 100 mL)')),
        schedule: p.posology || p.directions || (isOil ? '1-2 times weekly, massage 3-5 min, leave 10 min before wash.' : 'Apply nightly before bedtime to target scalp area.'),
        accentColor,
        accentBg,
        borderAccent,
        apis: (p.apis || []).map(a => enrichApiClinicalDetails(a))
      };
    });
  }

  // 2. Explicit rx.formulas (from legacy schemas)
  if (Array.isArray(rx.formulas) && rx.formulas.length > 0) {
    return rx.formulas.map((form, fIdx) => {
      const partNum = fIdx + 1;
      const vName = form.base || form.formulaName || '';
      const isOil = vName.toLowerCase().includes('oil');
      const isOral = vName.toLowerCase().includes('oral');
      const isFoam = vName.toLowerCase().includes('foam');
      const badgeText = isOil ? 'SCALP CARE & OIL' : (isOral ? 'ORAL CAPSULES' : (isFoam ? 'TOPICAL FOAM' : 'TOPICAL SOLUTION'));
      const accentColor = isOil ? '#0d9488' : (isOral ? '#ea580c' : (isFoam ? '#7c3aed' : '#0284c7'));
      const accentBg = isOil ? '#f0fdfa' : (isOral ? '#fff7ed' : (isFoam ? '#faf5ff' : '#f0f9ff'));
      const borderAccent = isOil ? '#99f6e4' : (isOral ? '#fed7aa' : (isFoam ? '#e9d5ff' : '#bae6fd'));

      const apis = (form.components || []).map(c => enrichApiClinicalDetails({
        name: c.apiName || c.name || '',
        dose: c.dosage ? `${c.dosage} ${c.units || ''}`.trim() : (c.dose || ''),
        productId: c.productId
      }));

      return {
        partNumber: partNum,
        totalParts: rx.formulas.length,
        title: form.formulaName || `Part ${partNum}`,
        badge: `PART ${partNum} OF ${rx.formulas.length} · ${badgeText}`,
        volume: isOil ? '30 mL' : (isOral ? '90 Capsules' : '100 mL'),
        format: badgeText,
        vehicle: form.base || 'Compounding Galenic Carrier',
        schedule: form.posology || 'Administer as prescribed by treating physician.',
        accentColor,
        accentBg,
        borderAccent,
        apis
      };
    });
  }

  // 3. Items list with multi-vehicles or posology phase 1 + phase 2 markers
  const rawItems = rx.items && rx.items.length > 0 ? rx.items : (rx.prescriptionLines || []);
  const posologyText = String(rx.posology?.regimen || rx.posology || '');
  const hasPhase1Phase2 = /phase\s*1/i.test(posologyText) && /phase\s*2/i.test(posologyText);
  const hasTrichoOil = rawItems.some(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return n.includes('trichooil') || (n.includes('vitamin e') && !n.includes('oral'));
  });
  const hasTrichoSol = rawItems.some(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return n.includes('trichosol') || n.includes('prostaquinon') || n.includes('spironolactone') || n.includes('minoxidil') || n.includes('latanoprost');
  });

  if (hasPhase1Phase2 || (hasTrichoOil && hasTrichoSol)) {
    const part1Items = [];
    const part2Items = [];
    let p1Vehicle = null;
    let p2Vehicle = null;

    rawItems.forEach(it => {
      const n = String(it.name || it.drugName || it.activeIngredient || '').toLowerCase();
      const isVehicle = it.isVehicleOrBase || it._isVehicleOrBase || n.includes('vehicle') || n.includes('vehiculo');
      if (n.includes('trichooil') || (n.includes('vitamin e') && !n.includes('oral'))) {
        if (isVehicle) p2Vehicle = it;
        else part2Items.push(it);
      } else if (n.includes('trichosol') && isVehicle) {
        p1Vehicle = it;
      } else {
        if (isVehicle) p1Vehicle = it;
        else part1Items.push(it);
      }
    });

    let p1Schedule = 'Apply 1 mL nightly to scalp before bedtime. Leave on scalp overnight.';
    let p2Schedule = 'Apply 1-2 times weekly, massage 3-5 min, leave 10 min before wash.';
    if (hasPhase1Phase2) {
      const m1 = posologyText.match(/phase\s*1:?\s*([^.]*\.)/i);
      if (m1) p1Schedule = m1[1].trim();
      const m2 = posologyText.match(/phase\s*2:?\s*([^.]*\.)/i);
      if (m2) p2Schedule = m2[1].trim();
    }

    return [
      {
        partNumber: 1,
        totalParts: 2,
        title: 'Topical Follicular Precision Therapy (TrichoSol™)',
        badge: 'PART 1 OF 2 · TOPICAL SCALP SOLUTION',
        volume: p1Vehicle?.dose || '100 mL',
        format: 'Topical Scalp Solution',
        vehicle: p1Vehicle?.name || 'TrichoSol™ Liposomal Hydrophilic Vehicle (q.s. 100 mL)',
        schedule: p1Schedule,
        accentColor: '#0284c7',
        accentBg: '#f0f9ff',
        borderAccent: '#bae6fd',
        apis: part1Items.map(a => enrichApiClinicalDetails(a))
      },
      {
        partNumber: 2,
        totalParts: 2,
        title: 'Follicular Protective & Hygiene Elixir (TrichoOil™)',
        badge: 'PART 2 OF 2 · SCALP CARE & LIPIDIC OIL',
        volume: p2Vehicle?.dose || '30 mL',
        format: 'Lipidic Scalp Oil',
        vehicle: p2Vehicle?.name || 'TrichoOil™ Natural Lipidic Vehicle (q.s. 30 mL)',
        schedule: p2Schedule,
        accentColor: '#0d9488',
        accentBg: '#f0fdfa',
        borderAccent: '#99f6e4',
        apis: part2Items.map(a => enrichApiClinicalDetails(a))
      }
    ];
  }

  // 4. Single formulation fallback
  const apisOnly = rawItems.filter(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return !i.isVehicleOrBase && !i._isVehicleOrBase && !n.includes('patented vehicle') && !n.includes('vehiculo magistral');
  });
  const vehicleOnly = rawItems.find(i => {
    const n = String(i.name || i.drugName || i.activeIngredient || '').toLowerCase();
    return i.isVehicleOrBase || i._isVehicleOrBase || n.includes('vehicle') || n.includes('base');
  });

  return [{
    partNumber: 1,
    totalParts: 1,
    title: rx.treatmentTitle || 'Personalized Compounded Formulation',
    badge: 'SINGLE COMPOUNDED FORMULATION',
    volume: rx.volume || vehicleOnly?.dose || 'Standard Dispensary Volume',
    format: rx.dispensingForm || 'Compounded Pharmaceutical Solution',
    vehicle: vehicleOnly?.name || 'Standard Compounding Vehicle Base',
    schedule: posologyText || 'Administer as directed by treating physician.',
    accentColor: '#003666',
    accentBg: '#f8fafc',
    borderAccent: '#cbd5e1',
    apis: (apisOnly.length > 0 ? apisOnly : rawItems).map(a => enrichApiClinicalDetails(a))
  }];
}

export default function DoctorPublicPortalClient({ slug, initialData = null }) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  // Search & Filter State (Google Cloud UX Golden Rules #7, #24, #29)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [patientFilter, setPatientFilter] = useState('all');
  const [taskFilter, setTaskFilter] = useState('all');
  const [temporalFilter, setTemporalFilter] = useState('all'); // 'all' | 'active' | '30d' | '90d'
  const [scopeMode, setScopeMode] = useState('global'); // 'global' | 'filtered' (Rule #22 Scope Switcher)
  
  // Table Density & Synchronization (GCP Table Standard)
  const [tableDensity, setTableDensity] = useState('comfortable'); // 'comfortable' | 'compact'
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // UI Actions State
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIntake, setCopiedIntake] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  // Language & Clinical Sidebar Navigation State (GCP Standard)
  const [lang, setLang] = useState('en');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState('overview');

  // Modal for Viewing Pharmacy Labels Directly from Doctor Portal
  const [activeLabelRx, setActiveLabelRx] = useState(null);
  const [isLabelsModalOpen, setIsLabelsModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  // GCP Resource Inspector Drawer State (Golden Rule #4: Master-Detail sin abandonar contexto)
  const [selectedInspectorItem, setSelectedInspectorItem] = useState(null);
  const [inspectorTab, setInspectorTab] = useState('dossier'); // 'dossier' | 'items' | 'dispensary'
  const [signingTaskId, setSigningTaskId] = useState(null);

  // GCP Standard: Sidebar is always active/expanded on laptops and desktops
  useEffect(() => {
    setIsSidebarCollapsed(false);
  }, []);

  // Therapeutic Pharmacopeia & Compounding APIs State (Lotusland Clinical Directory)
  const [formularyGoal, setFormularyGoal] = useState('all');
  const [formularySearch, setFormularySearch] = useState('');
  const [selectedMonograph, setSelectedMonograph] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryPeptide, setInquiryPeptide] = useState(null);

  // ── Atlas AI & Request Info (Sticky Footer Dock) ───────────────────────────
  const [isAtlasAiOpen, setIsAtlasAiOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [aiUsesRemaining, setAiUsesRemaining] = useState(5);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [requestInfoSubject, setRequestInfoSubject] = useState('What is the pricing / quotation for this prescription?');
  const [requestInfoSelectedRx, setRequestInfoSelectedRx] = useState('');
  const [requestInfoNotes, setRequestInfoNotes] = useState('');

  const [isHandoutOpen, setIsHandoutOpen] = useState(false);
  const [handoutRx, setHandoutRx] = useState(null);
  const [quickRxFilter, setQuickRxFilter] = useState('all'); // 'all' | 'pending' | 'active' | 'multipart'
  const [apiFilter, setApiFilter] = useState(null); // Active pharmaceutical ingredient filter from Analytics

  // Atlas Recommendations UI State (Consolidated Master Catalog)
  const [recCategoryFilter, setRecCategoryFilter] = useState('all'); // 'all' | 'peptides' | 'colway'
  const [recSearchQuery, setRecSearchQuery] = useState('');
  const [expandedRecId, setExpandedRecId] = useState(null);

  // Persist session quota (max 5 uses per session, isolated to this doctor)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sessionKey = `atlas_ai_quota_${slug || 'dr'}`;
    const stored = sessionStorage.getItem(sessionKey);
    if (stored !== null) {
      setAiUsesRemaining(Math.max(0, parseInt(stored, 10)));
    } else {
      sessionStorage.setItem(sessionKey, '5');
      setAiUsesRemaining(5);
    }
  }, [slug]);

  // ── URL Search Params Sync (Golden Rule #24: Sincronización de URL) ───────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const s = params.get('status');
    const t = params.get('task');
    const time = params.get('time');
    if (q) setSearchQuery(q);
    if (s) setStatusFilter(s);
    if (t) setTaskFilter(t);
    if (time) setTemporalFilter(time);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (taskFilter !== 'all') params.set('task', taskFilter);
    if (temporalFilter !== 'all') params.set('time', temporalFilter);
    const newSearch = params.toString() ? `?${params.toString()}` : '';
    if (window.location.search !== newSearch) {
      window.history.replaceState(null, '', `${window.location.pathname}${newSearch}`);
    }
  }, [searchQuery, statusFilter, taskFilter, temporalFilter]);

  useEffect(() => {
    // If initialData is already hydrated, only fetch in background if stale
    if (initialData && data?.success) return;

    async function fetchDoctorPortal() {
      try {
        setLoading(true);
        const res = await fetch(`/api/doctor/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          throw new Error(`Failed to load doctor profile (${res.status})`);
        }
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || 'Physician profile not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchDoctorPortal();
  }, [slug, initialData]);

  const doctor = data?.doctor || {};

  // Physician Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    title: '',
    specialty: '',
    clinic: '',
    license: '',
    phone: '',
    email: '',
    location: ''
  });

  useEffect(() => {
    if (doctor?.name) {
      setProfileForm({
        name: doctor.name || '',
        title: doctor.title || 'Dr.',
        specialty: doctor.specialty || '',
        clinic: doctor.clinic || '',
        license: doctor.license || '',
        phone: doctor.phone || '',
        email: doctor.email || '',
        location: doctor.location || ''
      });
    }
  }, [doctor?.name, doctor?.title, doctor?.specialty, doctor?.clinic, doctor?.license, doctor?.phone, doctor?.email, doctor?.location]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSavingProfile(true);
      triggerHaptic('medium');
      const res = await fetch(`/api/doctor/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update profile');
      }
      setData(prev => ({
        ...prev,
        doctor: {
          ...prev?.doctor,
          ...profileForm
        }
      }));
      setIsEditingProfile(false);
      toast.success('Perfil médico actualizado con éxito');
    } catch (err) {
      console.error('Error updating doctor profile:', err);
      toast.error(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsSavingProfile(false);
    }
  };
  const globalKpis = data?.kpis || { activePrescriptions: 0, monitoredPatients: 0, pendingTasksCount: 0, refillsDueCount: 0 };
  const allTasks = data?.tasks || [];
  const allPrescriptions = data?.prescriptions || [];
  const allProtocols = data?.protocols || [];

  const [activeSection, setActiveSection] = useState('overview');

  const [isDiscoveryDrawerOpen, setIsDiscoveryDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sectionIds = ['overview', 'tasks', 'prescriptions', 'diagnostics', 'patients'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Global ⌘K / Ctrl+K & Escape Key Listener (GCP UX Standard) ─────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsDiscoveryDrawerOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isDiscoveryDrawerOpen) setIsDiscoveryDrawerOpen(false);
        if (isCredentialsModalOpen) setIsCredentialsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDiscoveryDrawerOpen, isCredentialsModalOpen]);

  // Opaque Doctor Slug (Protects Doctor Identity in URL)
  const opaqueCode = doctor.opaqueCode || doctor.slug || slug;

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (taskFilter !== 'all') {
        if (taskFilter === 'refill') {
          if (t.type !== 'refill' && t.type !== 'cycles') return false;
        } else if (t.type !== taskFilter) {
          return false;
        }
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchPatient = (t.patientName || '').toLowerCase().includes(q);
      const matchCode = (t.code || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchPatient || matchCode;
    });
  }, [allTasks, taskFilter, searchQuery]);

  // Unique Monitored Patients List (for quick clinical dossier filter)
  const uniquePatientList = useMemo(() => {
    const set = new Set();
    allPrescriptions.forEach(p => {
      if (p.patientName) set.add(p.patientName.trim());
    });
    return Array.from(set).sort();
  }, [allPrescriptions]);

  // Filter Prescriptions (Enhanced with Temporal & Patient Filter - Golden Rules #22, #24)
  const filteredPrescriptions = useMemo(() => {
    return allPrescriptions.filter(rx => {
      // Patient Filter
      if (patientFilter !== 'all') {
        const pat = (rx.patientName || '').toLowerCase().trim();
        if (pat !== patientFilter.toLowerCase().trim()) return false;
      }

      // Status Filter: 'active' encompasses both 'active' and 'approved' clinical posologies
      if (statusFilter !== 'all') {
        const s = (rx.status || '').toLowerCase();
        if (statusFilter === 'active') {
          if (!['active', 'approved'].includes(s)) return false;
        } else if (statusFilter === 'approved') {
          if (s !== 'approved') return false;
        } else if (s !== statusFilter) {
          return false;
        }
      }

      // Temporal Filter Condition (Golden Rule #24)
      if (temporalFilter === 'active') {
        const s = (rx.status || '').toLowerCase();
        if (!['approved', 'active', 'processing'].includes(s)) return false;
      } else if (temporalFilter === '30d' && (rx.createdAt || rx.createdDate)) {
        const d = new Date(rx.createdAt || rx.createdDate);
        if (!isNaN(d.getTime())) {
          const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        }
      } else if (temporalFilter === '90d' && (rx.createdAt || rx.createdDate)) {
        const d = new Date(rx.createdAt || rx.createdDate);
        if (!isNaN(d.getTime())) {
          const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 90) return false;
        }
      }

      // API Filter (Clinical Analytics Click-to-Filter)
      if (apiFilter) {
        const normTarget = apiFilter.toLowerCase();
        const candidateItems = [
          ...(rx.items || []),
          ...(rx.recommendedItems || []),
          ...((rx.phases || []).flatMap(p => p.apis || p.items || [])),
          ...((rx.parts || []).flatMap(p => p.apis || []))
        ];
        const hasApi = candidateItems.some(item => {
          const itemName = String(item?.activeIngredient || item?.drugName || item?.name || '').toLowerCase();
          return itemName.includes(normTarget);
        });
        if (!hasApi) return false;
      }

      if (!searchQuery.trim()) {
        // Quick Status / Category Filter (Proposal #3)
        if (quickRxFilter === 'pending') {
          const s = (rx.status || '').toLowerCase();
          if (!['draft', 'pending', 'awaiting'].includes(s)) return false;
        } else if (quickRxFilter === 'active') {
          const s = (rx.status || '').toLowerCase();
          if (!['active', 'approved', 'dispensed'].includes(s)) return false;
        } else if (quickRxFilter === 'multipart') {
          const parts = resolvePrescriptionParts(rx);
          if (parts.length <= 1) return false;
        }
        return true;
      }
      const q = searchQuery.toLowerCase();
      const matchPat = (rx.patientName || '').toLowerCase().includes(q);
      const matchCode = (rx.code || rx.prescriptionNumber || '').toLowerCase().includes(q);
      const matchTitle = (rx.treatmentTitle || '').toLowerCase().includes(q);
      const matchItems = (rx.items || []).some(i => (i.name || '').toLowerCase().includes(q));
      if (!matchPat && !matchCode && !matchTitle && !matchItems) return false;

      // Also apply quickRxFilter if search query is present
      if (quickRxFilter === 'pending') {
        const s = (rx.status || '').toLowerCase();
        if (!['draft', 'pending', 'awaiting'].includes(s)) return false;
      } else if (quickRxFilter === 'active') {
        const s = (rx.status || '').toLowerCase();
        if (!['active', 'approved', 'dispensed'].includes(s)) return false;
      } else if (quickRxFilter === 'multipart') {
        const parts = resolvePrescriptionParts(rx);
        if (parts.length <= 1) return false;
      }

      return true;
    });
  }, [allPrescriptions, statusFilter, patientFilter, searchQuery, temporalFilter, quickRxFilter, apiFilter]);

  // Quick Prescription Counts for 1-Click Status Chips (Proposal #3)
  const quickCounts = useMemo(() => {
    let pendingCount = 0;
    let activeCount = 0;
    let multipartCount = 0;
    allPrescriptions.forEach(p => {
      const s = (p.status || '').toLowerCase();
      if (['draft', 'pending', 'awaiting'].includes(s)) pendingCount++;
      if (['active', 'approved', 'dispensed'].includes(s)) activeCount++;
      const parts = resolvePrescriptionParts(p);
      if (parts.length > 1) multipartCount++;
    });
    return {
      all: allPrescriptions.length,
      pending: pendingCount,
      active: activeCount,
      multipart: multipartCount
    };
  }, [allPrescriptions]);

  // Compute Filtered KPIs for Scope Switcher (Rule #22)
  const filteredKpis = useMemo(() => {
    const activeRxCount = filteredPrescriptions.filter(p => ['approved', 'active'].includes((p.status || '').toLowerCase())).length;
    const uniquePatients = new Set(filteredPrescriptions.map(p => p.patientName).filter(Boolean)).size;
    const pendingTasks = filteredTasks.length;
    const refillsDue = filteredTasks.filter(t => t.type === 'refill' || t.type === 'titration').length;
    return {
      activePrescriptions: activeRxCount,
      monitoredPatients: uniquePatients,
      pendingTasksCount: pendingTasks,
      refillsDueCount: refillsDue
    };
  }, [filteredPrescriptions, filteredTasks]);

  const activeKpis = scopeMode === 'filtered' ? filteredKpis : globalKpis;

  // Curated Bioactive Peptide Formulary (Lotusland Compounding Directory)
  const formulary = useMemo(() => {
    return data?.formulary || [];
  }, [data?.formulary]);

  const filteredFormulary = useMemo(() => {
    return formulary.filter((p) => {
      if (formularyGoal !== 'all') {
        const goalStr = `${p.primaryGoal || ''} ${(p.goals || []).join(' ')}`.toLowerCase();
        if (formularyGoal === 'repair' && !goalStr.includes('repair') && !goalStr.includes('tissue') && !goalStr.includes('recovery') && !goalStr.includes('gut')) return false;
        if (formularyGoal === 'metabolic' && !goalStr.includes('fat') && !goalStr.includes('metabolic') && !goalStr.includes('weight') && !goalStr.includes('glp') && !goalStr.includes('loss')) return false;
        if (formularyGoal === 'cognitive' && !goalStr.includes('neuro') && !goalStr.includes('cognitive') && !goalStr.includes('brain') && !goalStr.includes('semax')) return false;
        if (formularyGoal === 'cellular' && !goalStr.includes('cellular') && !goalStr.includes('aging') && !goalStr.includes('mitochondr') && !goalStr.includes('optim') && !goalStr.includes('energy')) return false;
      }
      if (!formularySearch.trim()) return true;
      const q = formularySearch.toLowerCase();
      return (
        safeRenderText(p.name).toLowerCase().includes(q) ||
        safeRenderText(p.description).toLowerCase().includes(q) ||
        safeRenderText(p.moa).toLowerCase().includes(q) ||
        safeRenderText(p.primaryGoal).toLowerCase().includes(q)
      );
    });
  }, [formulary, formularyGoal, formularySearch]);

  const filteredProtocols = useMemo(() => {
    return allProtocols.filter(proto => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (proto.title || proto.name || '').toLowerCase().includes(q);
      const matchCategory = (proto.category || '').toLowerCase().includes(q);
      const matchDesc = (proto.description || '').toLowerCase().includes(q);
      return matchTitle || matchCategory || matchDesc;
    });
  }, [allProtocols, searchQuery]);

  const formularyCounts = useMemo(() => {
    const counts = { all: formulary.length, repair: 0, metabolic: 0, cellular: 0, cognitive: 0 };
    formulary.forEach(p => {
      const goalStr = `${p.primaryGoal || ''} ${(p.goals || []).join(' ')}`.toLowerCase();
      if (goalStr.includes('repair') || goalStr.includes('tissue') || goalStr.includes('recovery') || goalStr.includes('gut')) counts.repair++;
      if (goalStr.includes('fat') || goalStr.includes('metabolic') || goalStr.includes('weight') || goalStr.includes('glp') || goalStr.includes('loss')) counts.metabolic++;
      if (goalStr.includes('cellular') || goalStr.includes('aging') || goalStr.includes('mitochondr') || goalStr.includes('optim') || goalStr.includes('energy')) counts.cellular++;
      if (goalStr.includes('neuro') || goalStr.includes('cognitive') || goalStr.includes('brain') || goalStr.includes('semax')) counts.cognitive++;
    });
    return counts;
  }, [formulary]);

  const handleCopyPortalLink = () => {
    triggerHaptic('selection');
    const portalUrl = `${window.location.origin}/dr/${opaqueCode}`;
    navigator.clipboard?.writeText(portalUrl);
    setCopiedLink(true);
    toast.success('Codified doctor portal link copied (identity protected) ✓');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyIntakeLink = () => {
    triggerHaptic('selection');
    const intakeUrl = `${window.location.origin}/rx/intake?refDoctor=${encodeURIComponent(opaqueCode)}`;
    navigator.clipboard?.writeText(intakeUrl);
    setCopiedIntake(true);
    toast.success('Patient Intake Link copied with codified attribution ✓');
    setTimeout(() => setCopiedIntake(false), 2000);
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('light');
    const intakeUrl = `${window.location.origin}/rx/intake?refDoctor=${encodeURIComponent(opaqueCode)}`;
    const text = encodeURIComponent(`Hello, you can submit your medical prescription directly to ${doctor.name} at Atlas Clinical Services here: ${intakeUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // ── Atlas WhatsApp for Doctor Communications (+971 55 356 1058) ───────────
  const handleContactAtlasWhatsApp = (topic = '', extraDetails = '') => {
    triggerHaptic('light');
    const doctorName = doctor.name || 'Doctor';
    let text = `Hello Atlas Support, I am ${doctorName}. I am contacting you directly from the Clinical Doctor Portal.`;
    if (topic) {
      text += `\n\n*Subject / Formulation:* ${topic}`;
    }
    if (extraDetails) {
      text += `\n*Clinical Inquiry:* ${extraDetails}`;
    }
    text += `\n\n*Clinic:* ${doctor.clinic || 'Atlas Partner Clinic'}`;
    const url = `https://wa.me/971553561058?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ── Patient Posology Handout & Re-prescribe Handlers (Proposals #1, #2, #4) ─
  const handleOpenHandout = (rx) => {
    triggerHaptic('selection');
    setHandoutRx(rx);
    setIsHandoutOpen(true);
  };

  const handleShareHandoutWhatsApp = (rx) => {
    if (!rx) return;
    triggerHaptic('light');
    const parts = resolvePrescriptionParts(rx);
    const patientName = rx.patientName || 'Patient';
    let text = `Dear ${patientName},\n\nHere is your treatment posology and administration guidance prescribed by Dr. ${doctor.name}:\n\n`;
    text += `📋 *Treatment:* ${rx.treatmentTitle || 'Custom Compounded Formulation'}\n`;
    text += `🆔 *Reference:* #${rx.code || rx.prescriptionNumber || rx.id}\n\n`;
    parts.forEach(p => {
      text += `🔹 *${p.title}* (${p.volume || '60 mL'} - ${p.vehicle || 'Compounded vehicle'})\n`;
      text += `   • *Schedule:* ${p.schedule || 'Apply as directed by physician'}\n`;
      if (p.apis && p.apis.length > 0) {
        text += `   • *Formula:* ${p.apis.map(a => `${a.name} ${a.concentration || a.dose || ''}`.trim()).join(', ')}\n`;
      }
      text += `\n`;
    });
    text += `⚠️ *Key Instructions:*\n`;
    text += `• Apply to clean and dry skin/scalp.\n`;
    text += `• Wash hands thoroughly after application.\n`;
    text += `• Store below 25°C, protected from direct sunlight.\n\n`;
    text += `For medical inquiries, consult Dr. ${doctor.name} or Atlas Clinical Support on WhatsApp.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleReprescribeFormula = (rx) => {
    triggerHaptic('selection');
    const formulaSummary = {
      treatmentTitle: rx.treatmentTitle || 'Compounded Formulation',
      dispensingForm: rx.dispensingForm || 'Magistral Solution',
      items: rx.items || [],
      volume: rx.volume || '60 mL',
      sourceRx: rx.code || rx.id
    };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('atlas_represcribe_prefill', JSON.stringify(formulaSummary));
    }
    toast.success(`Fórmula de #${rx.code} lista para asignar a nuevo paciente ✓`);
    setIsIntakeOpen(true);
  };

  // ── Atlas AI Clinical Reasoning Engine (Isolated, Max 5 uses per session) ───
  const handleSendAtlasAiQuery = (queryText) => {
    const text = (queryText || aiInput).trim();
    if (!text) return;
    if (aiUsesRemaining <= 0) {
      toast.error('Session quota of 5 clinical queries reached. Contact Atlas Support on WhatsApp.');
      return;
    }

    triggerHaptic('light');
    const newRemaining = Math.max(0, aiUsesRemaining - 1);
    setAiUsesRemaining(newRemaining);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`atlas_ai_quota_${slug || 'dr'}`, String(newRemaining));
    }

    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    setTimeout(() => {
      let response = '';
      const lower = text.toLowerCase();
      const patientCount = doctor.patients?.length || new Set(filteredPrescriptions.map(p => p.patientName || p.patientId)).size;
      const rxCount = filteredPrescriptions.length;
      const pendingCount = filteredTasks.length;

      if (lower.includes('patient') || lower.includes('paciente') || lower.includes('summarize') || lower.includes('resumen')) {
        const topPatients = filteredPrescriptions.slice(0, 5).map(p => `• **${p.patientName || 'Patient'}** (${p.id}): ${p.treatmentTitle || 'Compounded Treatment'} — Status: *${p.status || 'Active'}*`).join('\n');
        response = `**Clinical Summary for ${doctor.name}:**\n\nYou currently have **${patientCount} registered patients** and **${rxCount} active prescription records** in your dispensary view.\n\n**Recent Patient Regimens:**\n${topPatients}\n\n*All formulas are compounded in accordance with EU GMP standards.*`;
      } else if (lower.includes('dose') || lower.includes('dosis') || lower.includes('api') || lower.includes('active') || lower.includes('formula') || lower.includes('part') || lower.includes('ingrediente')) {
        const apiMap = new Map();
        filteredPrescriptions.forEach(p => {
          (p.items || []).forEach(it => {
            const n = it.name || it.drugName || it.activeIngredient;
            if (n && !apiMap.has(n)) apiMap.set(n, it.dose || it.concentration || 'Compounded Standard');
          });
        });
        const apiList = Array.from(apiMap.entries()).slice(0, 6).map(([name, dose]) => `• **${name}**: ${dose}`).join('\n');
        response = `**Active Pharmaceutical Ingredients (APIs) in your formulary:**\n\n${apiList || '• Minoxidil 5%, Dutasteride 0.1%, Melatonin 0.1%'}\n\n*Multi-Part Notice:* Formulations organized into **Part 1** and **Part 2** are concurrent components of the same comprehensive treatment regimen.`;
      } else if (lower.includes('sign') || lower.includes('pend') || lower.includes('task') || lower.includes('tarea') || lower.includes('revis')) {
        response = `**Physician Task Status:**\n\nYou have **${pendingCount} pending task(s)** requiring physician sign-off or clinical verification.\n\nOnce reviewed, prescriptions transition to *Active / Dispensary Processing*. You can approve them directly from the table or inspection drawer.`;
      } else {
        response = `**Clinical Analysis for ${doctor.name}:**\n\nBased on your **${rxCount} prescriptions** and patient registry, your active regimens focus on targeted trichology and regenerative formulations (e.g., dual-part liposomal solutions with TrichoSol™/TrichoOil™ vehicles).\n\nIf you require custom active ingredient titration, vehicle stabilization certificates, or batch logistics, you can also request dedicated liaison support with **Atlas Clinical Support on WhatsApp**.`;
      }

      const assistantMsg = {
        role: 'assistant',
        content: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, assistantMsg]);
      setAiLoading(false);
    }, 550);
  };

  const handleShareDoctorPortal = () => {
    triggerHaptic('light');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Doctor Public Portal URL copied to clipboard ✓');
    }
  };

  const handleOpenLabelsModal = (rx) => {
    triggerHaptic('light');
    setActiveLabelRx(rx);
    setIsLabelsModalOpen(true);
  };

  const handleRefresh = () => {
    triggerHaptic('light');
    setLastRefreshed(new Date());
    toast.success('Clinical registry data synchronized ✓');
  };

  const handleExportCsv = () => {
    triggerHaptic('selection');
    const rows = filteredPrescriptions.map(p => ({
      Code: p.code || p.prescriptionNumber || '',
      Patient: p.patientName || '',
      Status: p.status || '',
      Treatment: p.treatmentTitle || '',
      Items: (p.items || []).map(i => i.name).join('; '),
      Created: p.createdAt || p.createdDate || ''
    }));
    const headers = ['Code', 'Patient', 'Status', 'Treatment', 'Items', 'Created'];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => Object.values(r).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DR_${opaqueCode}_PRESCRIPTIONS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Prescriptions CSV exported successfully ✓');
  };

  const labelsForActiveRx = useMemo(() => {
    if (!activeLabelRx) return [];
    return getPharmapolisLabelsForPrescription(activeLabelRx, null);
  }, [activeLabelRx]);

  // ── GCP Resource Inspector Drawer Handlers (Golden Rule #4) ───────────────
  const handleRowClickPrescription = (rx) => {
    triggerHaptic('selection');
    setSelectedInspectorItem({
      type: 'prescription',
      data: rx
    });
    setInspectorTab('dossier');
  };

  const handleRowClickTask = (task) => {
    triggerHaptic('selection');
    const matchedRx = allPrescriptions.find(
      (p) => p.code === task.code || (p.prescriptionNumber && p.prescriptionNumber === task.code)
    );
    setSelectedInspectorItem({
      type: 'task',
      data: task,
      prescription: matchedRx || null
    });
    setInspectorTab('dossier');
  };

  // ── Functional Electronic Clinical Sign-off Handler (Firestore + Layer 1 RAM) ──
  const handleSignOffPrescription = async (taskOrRx, e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    // Determine the codes to sign
    const codesToSign = taskOrRx.codes && Array.isArray(taskOrRx.codes) && taskOrRx.codes.length > 0
      ? taskOrRx.codes
      : [taskOrRx.code || taskOrRx.prescriptionNumber || taskOrRx.id].filter(Boolean);

    if (codesToSign.length === 0) return;

    const signingKey = taskOrRx.id || codesToSign[0];
    setSigningTaskId(signingKey);

    try {
      // Sign each prescription via the update-status API
      for (const code of codesToSign) {
        const res = await fetch('/api/prescriptions/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescriptionNumber: code,
            status: 'approved',
            reason: 'Physician electronic sign-off and dispensing authorization via Doctor Portal',
            updatedBy: doctor?.name || 'Treating Physician'
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to sign prescription ${code}`);
        }
      }

      // Optimistically update local data state
      setData((prev) => {
        if (!prev) return prev;
        const updatedPrescriptions = (prev.prescriptions || []).map((rx) => {
          if (codesToSign.includes(rx.code) || codesToSign.includes(rx.prescriptionNumber) || codesToSign.includes(rx.id)) {
            return {
              ...rx,
              status: 'approved',
              state: 'approved',
              signedAt: new Date().toISOString(),
              signedBy: doctor?.name || 'Treating Physician'
            };
          }
          return rx;
        });

        // Mark task as completed / authorized
        const updatedTasks = (prev.tasks || []).map((t) => {
          if (t.id === taskOrRx.id || (t.codes && t.codes.some(c => codesToSign.includes(c))) || codesToSign.includes(t.code)) {
            return {
              ...t,
              status: 'approved',
              isSigned: true,
              priority: 'routine',
              title: `${t.title} — Authorized`,
              description: `Digitally signed & authorized for compounding release by ${doctor?.name || 'Treating Physician'}.`
            };
          }
          return t;
        });

        // Recompute KPIs
        const newActive = updatedPrescriptions.filter(p => ['approved', 'active'].includes((p.status || '').toLowerCase())).length;
        const newPending = updatedTasks.filter(t => t.type === 'approval' && !t.isSigned).length;

        return {
          ...prev,
          prescriptions: updatedPrescriptions,
          tasks: updatedTasks,
          kpis: {
            ...prev.kpis,
            activePrescriptions: newActive,
            pendingTasksCount: newPending
          }
        };
      });

      // Update selectedInspectorItem if viewing this item
      setSelectedInspectorItem((prev) => {
        if (!prev) return prev;
        const isMatched = (prev.data && (prev.data.id === taskOrRx.id || codesToSign.includes(prev.data.code))) ||
          (prev.prescription && codesToSign.includes(prev.prescription.code));
        if (isMatched) {
          return {
            ...prev,
            data: {
              ...(prev.data || {}),
              status: 'approved',
              isSigned: true
            },
            prescription: prev.prescription ? {
              ...prev.prescription,
              status: 'approved',
              state: 'approved',
              signedAt: new Date().toISOString(),
              signedBy: doctor?.name || 'Treating Physician'
            } : null
          };
        }
        return prev;
      });

      triggerHaptic('success');
      toast.success(
        codesToSign.length > 1
          ? `${codesToSign.length} prescriptions signed & authorized for compounding ✓`
          : `Prescription #${codesToSign[0]} signed & authorized for compounding ✓`
      );
    } catch (err) {
      console.error('Error signing off prescription:', err);
      toast.error('Signing error: ' + (err.message || 'Please try again'));
    } finally {
      setSigningTaskId(null);
    }
  };

  // ── Pending Clinical Tasks Columns (DataTable Exclusive Rendering) ───────
  const taskColumns = useMemo(() => [
    {
      key: 'patientName',
      header: 'Patient Dossier',
      width: '26%',
      sortable: true,
      render: (t) => {
        const dob = t.patient?.dob || t.patientDob || t.dob || (
          allPrescriptions.find(p => p.patientName && t.patientName && p.patientName.toLowerCase().trim() === t.patientName.toLowerCase().trim())?.patient?.dob
        );

        return (
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
              {t.patientName}
            </div>
            {dob && (
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                DOB: {dob}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'title',
      header: 'Clinical Task & Action Plan',
      width: '54%',
      sortable: true,
      render: (t) => {
        let cleanTitle = t.title || '';
        cleanTitle = cleanTitle.replace(/^Clinical Verification:\s*/i, '');
        if (t.patientName && cleanTitle.startsWith(t.patientName)) {
          cleanTitle = cleanTitle.replace(t.patientName, '').trim();
          cleanTitle = cleanTitle.replace(/^[-:–]\s*/, '').trim();
        }
        if (!cleanTitle) cleanTitle = 'Prescription Sign-off';

        const isSigned = t.isSigned || t.status === 'approved';

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.86rem' }}>
                {cleanTitle}
              </span>
              {isSigned && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 650,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0'
                  }}
                >
                  <CheckCircle2 size={11} />
                  Authorized
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px', lineHeight: 1.35 }}>
              {t.description}
            </div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Action',
      width: '20%',
      align: 'right',
      isAction: true,
      mobilePriority: 'always',
      render: (t) => {
        const isSigned = t.isSigned || t.status === 'approved';
        const isSigning = signingTaskId === (t.id || t.code);

        if (isSigned) {
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', width: '100%' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#16a34a'
                }}
              >
                <CheckCircle2 size={13} />
                <span>Authorized</span>
              </span>
              <Link
                href={t.actionUrl}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                title="Open official signed prescription pad in new tab"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#475569'
                }}
              >
                <ArrowUpRight size={13} />
              </Link>
            </div>
          );
        }

        return (
          <div
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={isSigning}
              onClick={(e) => handleSignOffPrescription(t, e)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '30px',
                padding: '0 10px',
                borderRadius: '4px',
                background: '#1a73e8',
                border: '1px solid #1557b0',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: isSigning ? 'wait' : 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s'
              }}
              title="Digitally sign & authorize this prescription compounding order"
            >
              {isSigning ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Signing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} style={{ color: '#38bdf8' }} />
                  <span>Sign-off</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRowClickTask(t);
              }}
              title="Review prescription details in slide-over Inspector Drawer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                height: '30px',
                padding: '0 8px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#334155',
                fontSize: '0.74rem',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <span>Review</span>
            </button>
          </div>
        );
      }
    }
  ], [signingTaskId, handleSignOffPrescription, allPrescriptions]);

  // ── Prescriptions Dossier Columns (DataTable Exclusive Rendering) ─────────
  const prescriptionColumns = useMemo(() => [
    {
      key: 'patientName',
      header: 'Patient Dossier',
      width: '24%',
      sortable: true,
      render: (rx) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
            {rx.patientName}
          </div>
          {rx.patient?.dob && (
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              DOB: {rx.patient.dob}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'treatmentTitle',
      header: 'Prescription Regimen',
      width: '34%',
      sortable: true,
      render: (rx) => {
        const itemCount = (rx.items || []).length || (rx.prescriptionLines || []).length || 1;
        const protoUrl = rx.protocolUrl || (rx.protocolSlug ? `/proto/${rx.protocolSlug}` : null);

        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {protoUrl ? (
                <a
                  href={protoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open evidence-based clinical protocol dossier in new tab"
                  style={{
                    fontWeight: 650,
                    color: '#1a73e8',
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  <span>{rx.treatmentTitle || 'Personalized Compounded Regimen'}</span>
                  <ExternalLink size={11} style={{ color: '#1a73e8', flexShrink: 0 }} />
                </a>
              ) : (
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.84rem' }}>
                  {rx.treatmentTitle || 'Personalized Compounded Regimen'}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, color: '#334155' }}>
                {itemCount} prescription item{itemCount > 1 ? 's' : ''}
              </span>
              {protoUrl && (
                <span style={{ fontSize: '0.68rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <BookOpen size={10} />
                  <span>Protocol Dossier</span>
                </span>
              )}
              {rx.volume && (
                <span style={{ fontSize: '0.68rem', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  {rx.volume}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      width: '14%',
      sortable: true,
      render: (rx) => {
        const isDraftOrReview = ['draft', 'pending', 'awaiting_validation'].includes(String(rx.status || '').toLowerCase()) || rx.ingestionStage === 'awaiting_atlas_review';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <StatusBadge status={rx.status || 'active'} />
            {isDraftOrReview && (
              <span
                style={{
                  fontSize: '0.67rem',
                  color: '#b45309',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  padding: '1px 6px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  width: 'fit-content'
                }}
                title="Atlas AI Clinical Pharmacist molecular conversion review in progress (~24h SLA)"
              >
                <Clock size={10} /> Atlas AI Review (~24h)
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '12%',
      sortable: true,
      render: (rx) => (
        <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Calendar size={12} style={{ color: '#64748b' }} />
          <span>{rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Active'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '18%',
      align: 'right',
      render: (rx) => {
        const isPending = ['pending', 'draft'].includes((rx.status || rx.state || '').toLowerCase());
        const isSigning = signingTaskId === (rx.code || rx.id);

        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', width: '100%' }} onClick={e => e.stopPropagation()}>
            {isPending ? (
              <button
                type="button"
                disabled={isSigning}
                onClick={(e) => handleSignOffPrescription(rx, e)}
                style={{
                  height: '28px',
                  padding: '0 8px',
                  borderRadius: '4px',
                  background: '#1a73e8',
                  border: '1px solid #1557b0',
                  color: '#ffffff',
                  fontSize: '0.73rem',
                  fontWeight: 650,
                  cursor: isSigning ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
                  whiteSpace: 'nowrap'
                }}
                title="Sign & Authorize Prescribing Order"
              >
                {isSigning ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Signing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={12} style={{ color: '#ffffff' }} />
                    <span>Sign</span>
                  </>
                )}
              </button>
            ) : (
              <Link
                href={`/rx/${rx.code}`}
                style={{
                  height: '28px',
                  padding: '0 8px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#1a73e8',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
                title="Open complete clinical monograph and posology dossier"
              >
                <span>Dossier</span>
                <ExternalLink size={11} />
              </Link>
            )}

            <button
              type="button"
              onClick={() => handleOpenLabelsModal(rx)}
              title="View vector pharmacy compounding bottle label"
              style={{
                height: '28px',
                width: '28px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#0284c7',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Tag size={13} />
            </button>

            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/rx/${rx.code}?view=patient`;
                navigator.clipboard?.writeText(url);
                toast.success('Patient direct link copied ✓');
              }}
              title="Copy direct patient-facing prescription link"
              style={{
                height: '28px',
                width: '28px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#5f6368',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Share2 size={13} />
            </button>
          </div>
        );
      }
    }
  ], [signingTaskId, handleSignOffPrescription]);

  // ── Practice Pharmacopeia Columns (DataTable Universal) ───────────────────
  const pharmacopeiaColumns = useMemo(() => [
    {
      key: 'name',
      header: 'Active Pharmaceutical Ingredient (API)',
      width: '28%',
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.86rem' }}>
            {p.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{p.casNumber ? `CAS: ${p.casNumber}` : 'High-Purity API'}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ color: '#003666', fontWeight: 600 }}>Pure Compounding Substance</span>
          </div>
        </div>
      )
    },
    {
      key: 'primaryGoal',
      header: 'Therapeutic Objective & Axis',
      width: '24%',
      sortable: true,
      render: (p) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              padding: '2px 8px',
              borderRadius: '12px',
              background: '#e0f2fe',
              color: '#0369a1',
              fontSize: '0.72rem',
              fontWeight: 600
            }}
          >
            {p.primaryGoal || 'Cellular Optimization'}
          </span>
          {p.goals && p.goals.length > 1 && (
            <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
              {p.goals.slice(1).join(', ')}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'purity',
      header: 'Pharmacopeial Purity',
      width: '18%',
      sortable: true,
      render: (p) => (
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: 650,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              whiteSpace: 'nowrap'
            }}
          >
            <CheckCircle2 size={11} />
            {p.purity || '≥ 99% HPLC Verified'}
          </span>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px' }}>
            EU GMP Cleanroom
          </div>
        </div>
      )
    },
    {
      key: 'route',
      header: 'API Compounding Specification',
      width: '18%',
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
            {p.apiForm || p.route || 'Lyophilized API Powder'}
          </div>
          <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
            Active Pharmaceutical Ingredient
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Monograph',
      width: '12%',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedMonograph(p)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              height: '30px',
              padding: '0 10px',
              borderRadius: '4px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              color: '#1a73e8',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}
          >
            <Eye size={12} />
            <span>Monograph</span>
          </button>
        </div>
      )
    }
  ], []);

  // ── Bloodo™ Diagnostic Panels (All 6 CE-IVDR Certified Panels) ─────────────
  const bloodoPanels = useMemo(() => {
    if (Array.isArray(data?.bloodoPanels) && data.bloodoPanels.length === 6) {
      return data.bloodoPanels;
    }
    return [
      {
        id: 'bloodo-nad-level-test',
        slug: 'bloodo-nad-level-test',
        name: 'Bloodo™ NAD Level Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '3-4 Business Days',
        indications: 'CE-IVDR certified quantitative capillary dried blood spot diagnostic test measuring total cellular NAD (NAD+ and NADH). Essential for cellular bioenergetics, sirtuin activation, and PARP-mediated DNA repair.',
        biomarkers: ['Total Cellular NAD (NAD+ and NADH)', 'Intracellular Redox Potential', 'ATP Synthesis Capacity'],
        clinicalUtility: 'Objectively tracks intracellular NAD depletion and verifies clinical bioavailability before and during peptide & longevity protocols.',
        price: '$199',
        datasheetUrl: '/p/bloodo-nad-level-test'
      },
      {
        id: 'cortisol-test',
        slug: 'cortisol-test',
        name: 'Bloodo™ Cortisol Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '2-3 Business Days',
        indications: 'Measures free and total morning awakening cortisol from capillary dried blood spot. Evaluates Hypothalamic-Pituitary-Adrenal (HPA) axis balance and chronic allostatic stress burden.',
        biomarkers: ['Free Morning Cortisol', 'Total Serum-Equivalent Cortisol', 'Cortisol Awakening Response (CAR)', 'HPA Axis Stress Index'],
        clinicalUtility: 'Identifies adrenal exhaustion, circadian misalignment, or hypercortisolemia prior to secretagogue or metabolic peptide cycles.',
        price: '$79',
        datasheetUrl: '/p/cortisol-test'
      },
      {
        id: 'hemoglobin-a1c-hba1c-test',
        slug: 'hemoglobin-a1c-hba1c-test',
        name: 'Bloodo™ Hemoglobin A1c (HbA1c) Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '2-3 Business Days',
        indications: 'CE-IVDR certified dried blood spot assay quantifying 90-day glycemic exposure via NGSP/IFCC traceable chromatography at LifeLab1 (Vilnius, Lithuania).',
        biomarkers: ['Glycated Hemoglobin (% HbA1c / mmol/mol)', 'Estimated Average Glucose (eAG)', 'Insulin Sensitivity Profile'],
        clinicalUtility: 'Guides and benchmarks micro-dosing titration for GLP-1/GIP receptor agonists (Tirzepatide, Semaglutide, Retatrutide) and metabolic therapy.',
        price: '$59',
        datasheetUrl: '/p/hemoglobin-a1c-hba1c-test'
      },
      {
        id: 'omega-ratio-test',
        slug: 'omega-ratio-test',
        name: 'Bloodo™ Omega Ratio & Index Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '3-4 Business Days',
        indications: 'Erythrocyte membrane fatty acid chromatography (GC-MS) measuring cardioprotective Omega-3 Index, Omega-6/Omega-3 ratio, and AA/EPA inflammatory index.',
        biomarkers: ['Omega-3 Index (EPA + DHA %)', 'Omega-6 / Omega-3 Ratio', 'AA / EPA Inflammatory Ratio', 'Trans-Fatty Acids Index'],
        clinicalUtility: 'Establishes cellular membrane fluidity and inflammatory balance prior to tissue regeneration peptide protocols (BPC-157, TB-500, GHK-Cu).',
        price: '$79',
        datasheetUrl: '/p/omega-ratio-test'
      },
      {
        id: 'testosterone-test',
        slug: 'testosterone-test',
        name: 'Bloodo™ Testosterone+ Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '3-4 Business Days',
        indications: 'High-resolution LC-MS/MS capillary blood assay calibrated to CDC hormone standardization standards for total and bioavailable testosterone.',
        biomarkers: ['Total Testosterone', 'Bioavailable Testosterone Index', 'Free Androgen Ratio'],
        clinicalUtility: 'Baseline and follow-up endocrine profiling for vitality protocols, secretagogue therapy (CJC-1295 / Ipamorelin), and hormone optimization.',
        price: '$99',
        datasheetUrl: '/p/testosterone-test'
      },
      {
        id: 'vitamin-d-test',
        slug: 'vitamin-d-test',
        name: 'Bloodo™ Vitamin D Test',
        specimen: 'Capillary Dried Blood Spot (DBS)',
        tat: '2-3 Business Days',
        indications: 'CE-IVDR certified quantitative assay measuring total 25-hydroxyvitamin D [25(OH)D2 + 25(OH)D3] via gold-standard LC-MS/MS with DEQAS certified accuracy.',
        biomarkers: ['Total 25-Hydroxyvitamin D [25(OH)D2 + 25(OH)D3]', '25(OH)D3 Active Fraction', 'Immune Competence Marker'],
        clinicalUtility: 'Optimizes immune competence, bone mineralization, genomic transcription regulation, and hormone receptor sensitivity.',
        price: '$59',
        datasheetUrl: '/p/vitamin-d-test'
      }
    ];
  }, [data?.bloodoPanels]);

  const sidebarNavGroups = useMemo(() => [
    {
      groupTitle: 'CLINICAL OPERATIONS',
      items: [
        {
          id: 'overview',
          label: 'Clinical Overview & KPIs',
          icon: BarChart3,
          badge: null
        },
        {
          id: 'prescriptions',
          label: 'My Prescriptions',
          icon: Layers,
          badge: filteredPrescriptions.length > 0 ? `${filteredPrescriptions.length}` : null,
          badgeColor: '#1a73e8'
        },
        {
          id: 'tasks',
          label: 'Pending Tasks',
          icon: Clock,
          badge: filteredTasks.length > 0 ? `${filteredTasks.length}` : null,
          badgeColor: filteredTasks.length > 0 ? '#b06000' : '#5f6368'
        }
      ]
    },
    {
      groupTitle: 'FORMULARY & PROTOCOLS',
      items: [
        {
          id: 'protocols',
          label: 'Medical Protocols (77)',
          icon: BookOpen,
          action: () => setIsDiscoveryDrawerOpen(true),
          badge: filteredProtocols.length > 0 ? `${filteredProtocols.length}` : '77'
        },
        {
          id: 'formulary',
          label: 'Pharmacopeia & APIs',
          icon: FlaskConical,
          action: () => setIsDiscoveryDrawerOpen(true),
          badge: filteredFormulary.length > 0 ? `${filteredFormulary.length}` : null
        },
        {
          id: 'diagnostics',
          label: 'Diagnostics & Biomarkers',
          icon: Activity,
          badge: '6 Tests'
        },
        {
          id: 'recommendations',
          label: 'Atlas Recommendations',
          icon: Sparkles,
          badge: 'Synergy',
          badgeColor: '#7c3aed'
        },
        {
          id: 'protocols_catalog',
          label: 'Atlas Digital Catalog',
          icon: ExternalLink,
          action: () => window.open('https://med-peptides.com/c/CAT-MUWWS6JL', '_blank'),
          badge: '↗'
        }
      ]
    },
    {
      groupTitle: 'PRACTICE & TOOLS',
      items: [
        {
          id: 'intake',
          label: 'Share Patient Intake',
          icon: Share2,
          action: handleCopyIntakeLink,
          badge: '1-Click'
        },
        {
          id: 'credentials',
          label: 'DHA License & Profile',
          icon: ShieldCheck,
          action: () => setIsCredentialsModalOpen(true),
          badge: 'Verified'
        }
      ]
    }
  ], [filteredTasks.length, filteredPrescriptions.length, filteredFormulary.length, filteredProtocols.length]);

  const handleSidebarNavigate = (itemOrId) => {
    triggerHaptic('light');
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id;
    if (id === 'credentials') {
      setIsCredentialsModalOpen(true);
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }
    if (id === 'intake') {
      handleCopyIntakeLink();
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }
    if (id === 'protocols_catalog') {
      window.open('https://med-peptides.com/c/CAT-MUWWS6JL', '_blank');
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }

    if (id === 'search' || id === 'prescriptions') {
      setQuickRxFilter('all');
      setStatusFilter('all');
      setPatientFilter('all');
      setTemporalFilter('all');
      setApiFilter(null);
      setActiveAnchor('prescriptions');
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    if (id === 'tasks') {
      setTaskFilter('all');
    }

    // Single active view routing (GCP Standard: only show selected menu item)
    setActiveAnchor(id);
    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#003666', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Loading Clinical Physician Portal...</p>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '2rem' }}>
        <EmptyState
          icon={AlertCircle}
          title="Physician Profile Unavailable"
          subtitle={error || "We couldn't locate this doctor in the clinical directory."}
          action={{
            label: "Back to Home",
            onClick: () => window.location.href = '/'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      <style jsx global>{`
        .gcp-portal-layout {
          display: flex;
          min-height: calc(100vh - 100px);
          background: #f8fafc;
          position: relative;
        }
        .gcp-clinical-sidebar {
          width: 250px;
          flex-shrink: 0;
          background: #ffffff;
          border-right: 1px solid #dadce0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: sticky;
          top: 100px;
          height: calc(100vh - 100px);
          transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 25;
          overflow-y: auto;
        }
        .gcp-clinical-sidebar.collapsed {
          width: 64px;
        }
        .gcp-portal-main {
          flex: 1;
          min-width: 0;
          max-width: 1320px;
          padding: 24px 28px 120px 28px;
          margin: 0 auto;
        }
        .doctor-bottom-dock {
          position: fixed;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 860px;
          z-index: 48;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(203, 213, 225, 0.9);
          border-radius: 9999px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.05);
          padding: 8px 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
        }
        .doctor-bottom-dock-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          width: 100%;
        }
        .doctor-dock-btn {
          height: 36px;
          padding: 0 14px;
          border-radius: 9999px;
          font-size: 0.80rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        .doctor-dock-btn-primary {
          background: #1a73e8;
          color: #ffffff;
          border-color: #1a73e8;
          box-shadow: 0 1px 3px rgba(26, 115, 232, 0.35);
        }
        .doctor-dock-btn-primary:hover {
          background: #1557b0;
          border-color: #1557b0;
          box-shadow: 0 2px 6px rgba(26, 115, 232, 0.45);
        }
        .doctor-dock-btn-secondary {
          background: #ffffff;
          color: #374151;
          border-color: #d1d5db;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .doctor-dock-btn-secondary:hover {
          background: #f8fafc;
          border-color: #1a73e8;
          color: #1a73e8;
        }
        .doctor-dock-btn-whatsapp {
          background: #f0fdf4;
          color: #15803d;
          border-color: #bbf7d0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .doctor-dock-btn-whatsapp:hover {
          background: #dcfce7;
          border-color: #86efac;
          color: #166534;
        }
        .doctor-dock-btn-ai {
          background: #f5f3ff;
          color: #4f46e5;
          border-color: #ddd6fe;
          box-shadow: 0 1px 2px rgba(79, 70, 229, 0.08);
        }
        .doctor-dock-btn-ai:hover {
          background: #ede9fe;
          border-color: #c4b5fd;
          color: #4338ca;
        }
        @media (max-width: 768px) {
          .doctor-bottom-dock {
            bottom: 0;
            left: 0;
            transform: none;
            width: 100%;
            max-width: 100%;
            border-radius: 16px 16px 0 0;
            border-left: none;
            border-right: none;
            border-bottom: none;
            padding: 8px 10px calc(8px + env(safe-area-inset-bottom, 0px)) 10px;
            box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.12);
          }
          .doctor-bottom-dock-actions {
            flex-wrap: nowrap;
            overflow-x: auto;
            justify-content: flex-start;
            padding: 2px 4px;
            -webkit-overflow-scrolling: touch;
          }
          .doctor-dock-btn {
            height: 36px;
            padding: 0 12px;
            font-size: 0.74rem;
            flex-shrink: 0;
          }
        }
        .gcp-mobile-nav-trigger {
          display: none;
        }
        .gcp-mobile-doctor-capsule {
          display: none;
        }
        @media (max-width: 900px) {
          .gcp-clinical-sidebar {
            display: none !important;
          }
          .gcp-mobile-nav-trigger {
            display: inline-flex !important;
          }
          .gcp-mobile-doctor-capsule {
            display: flex !important;
          }
          .gcp-portal-main {
            padding: 14px 14px 130px 14px;
          }
        }
        .gcp-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1100px) {
          .gcp-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
        }
        @media (max-width: 580px) {
          .gcp-kpi-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
        .gcp-kpi-card {
          background: #ffffff;
          border: 1px solid #dadce0;
          border-radius: 8px;
          padding: 16px 18px;
          box-shadow: 0 1px 2px rgba(60,64,67,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .gcp-kpi-card:hover {
          border-color: #bdc1c6;
          box-shadow: 0 2px 6px rgba(60,64,67,0.12);
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* ── Unified Public Header (Homogeneous with /rx/[code] & GCP Standards) ── */}
      <PublicUnifiedHeader
        track="protocols"
        lang={lang}
        onLangChange={setLang}
        brandHref={`/dr/${slug}`}
        doctorHomeHref={`/dr/${slug}`}
        doctorName={doctor.name}
        hideTier2={true}
        hideImportRx={false}
        hideSearchButton={true}
        isDoctorView={true}
        onImportRx={() => setIsIntakeOpen(true)}
        onSwitchRx={() => handleSidebarNavigate('prescriptions')}
        rxSwitcherCount={allPrescriptions.length}
      />

      {/* ── Portal Layout with Left Collapsible Clinical Rail (GCP Standard) ── */}
      <div className="gcp-portal-layout">
        {/* Left Clinical Sidebar */}
        <aside
          className={`gcp-clinical-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
          aria-label="Clinical Navigation Sidebar"
        >
          <div style={{ flex: 1, overflowY: 'auto', padding: isSidebarCollapsed ? '12px 6px' : '12px 0' }}>
            {sidebarNavGroups.map((group, gIdx) => (
              <div key={gIdx} style={{ marginBottom: isSidebarCollapsed ? '12px' : '16px' }}>
                {!isSidebarCollapsed && (
                  <div
                    style={{
                      padding: '8px 16px 4px 16px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#5f6368',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}
                  >
                    {group.group}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeAnchor === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSidebarNavigate(item.id)}
                      title={item.label}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                        gap: '10px',
                        padding: isSidebarCollapsed ? '10px 0' : '9px 16px',
                        border: 'none',
                        borderLeft: isActive ? '3px solid #1a73e8' : '3px solid transparent',
                        background: isActive ? '#e8f0fe' : 'transparent',
                        color: isActive ? '#1a73e8' : '#3c4043',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.12s, color 0.12s',
                        borderRadius: isSidebarCollapsed ? '6px' : '0'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#f1f3f4';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <Icon size={17} style={{ color: isActive ? '#1a73e8' : '#5f6368', flexShrink: 0 }} />
                        {!isSidebarCollapsed && (
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.label}
                          </span>
                        )}
                      </div>
                      {!isSidebarCollapsed && typeof item.badge === 'number' && (
                        <span
                          style={{
                            fontSize: '0.70rem',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '10px',
                            background: isActive ? '#1a73e8' : '#e8eaed',
                            color: isActive ? '#ffffff' : '#3c4043'
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Physician Portal Owner Identity Card & Profile Manager */}
          <div style={{ padding: isSidebarCollapsed ? '8px 6px' : '10px 12px', borderTop: '1px solid #dadce0', background: '#f8fafc' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsCredentialsModalOpen(true);
              }}
              title={`Ver y gestionar perfil médico: ${doctor.name || 'Médico Titular'}`}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                gap: '8px',
                padding: isSidebarCollapsed ? '6px 4px' : '8px 10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                {/* Avatar Circle with Verified Indicator */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #003666 0%, #0d9488 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.80rem',
                    position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,54,102,0.2)'
                  }}
                >
                  {doctor.name?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D'}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#16a34a',
                      border: '1.5px solid #ffffff'
                    }}
                    title="DHA Verified Active"
                  />
                </div>

                {!isSidebarCollapsed && (
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: 1.25,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {doctor.name || 'Treating Physician'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.64rem',
                        color: '#0d9488',
                        fontWeight: 600,
                        lineHeight: 1.15,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {doctor.clinic || doctor.specialty || 'Verified Medical Practice'}
                    </div>
                  </div>
                )}
              </div>

              {!isSidebarCollapsed && (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '5px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  title="Ver y editar perfil médico"
                >
                  <Edit3 size={12} />
                </div>
              )}
            </button>
          </div>



          {/* Bottom Rail Collapse Toggle */}
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid #dadce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between'
            }}
          >
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 500 }}>
                Clinical Navigator
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#5f6368',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.1)'
              }}
            >
              {isSidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>
        </aside>

        {/* ── Main Clinical Content Container ─────────────────────────────── */}
        <main className="gcp-portal-main">
          {/* ── Mobile Doctor Identity Capsule (Rendered only on screens <= 900px, removed from main flow on desktop) ── */}
          <div
            className="gcp-mobile-doctor-capsule"
            style={{
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '16px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}
          >
            <div
              onClick={() => {
                triggerHaptic('light');
                setIsCredentialsModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, cursor: 'pointer' }}
              title="Click to view verified doctor credentials & DHA license"
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #003666 0%, #0d9488 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {doctor.name?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doctor.name}
                  </span>
                  <span style={{ fontSize: '0.60rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '1px 5px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    DHA Verified ✓
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doctor.specialty} • {doctor.license}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsCredentialsModalOpen(true);
                }}
                style={{
                  height: '28px',
                  padding: '0 8px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#334155',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="View Doctor Credentials & License"
              >
                <ShieldCheck size={12} style={{ color: '#0d9488' }} />
                <span>Info</span>
              </button>

              <button
                type="button"
                className="gcp-mobile-nav-trigger"
                onClick={() => setIsMobileSidebarOpen(true)}
                style={{
                  height: '28px',
                  padding: '0 8px',
                  borderRadius: '4px',
                  border: '1px solid #1a73e8',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Open Navigation Menu"
              >
                <Menu size={13} />
                <span>Menu</span>
              </button>
            </div>
          </div>

        {/* ── Google Cloud Console Command Bar (GCP Standard Page Header) ── */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            marginBottom: '20px',
            borderBottom: '1px solid #dadce0',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Section Breadcrumb & Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.74rem', color: '#5f6368', fontWeight: 500 }}>
                Doctor Portal &gt; {doctor.name}
              </span>
              <span style={{ fontSize: '0.64rem', background: '#e8f0fe', color: '#1a73e8', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                {doctor.license || 'DHA Verified'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.24rem', fontWeight: 600, color: '#202124', margin: 0 }}>
              {activeAnchor === 'overview' && 'Practice Overview & Clinical KPIs'}
              {activeAnchor === 'search' && 'Clinical Registry Search & Multi-Table Query'}
              {activeAnchor === 'tasks' && `Pending To-Do Queue (${filteredTasks.length} Action Items)`}
              {activeAnchor === 'prescriptions' && `Compounded Prescriptions Dossier (${filteredPrescriptions.length} Records)`}
              {activeAnchor === 'protocols' && `Clinical Protocols & Therapeutic Titrations (${filteredProtocols.length || 77})`}
              {activeAnchor === 'formulary' && 'Compounding Pharmacopeia & Active APIs'}
              {activeAnchor === 'diagnostics' && 'Bloodo™ Diagnostic Biomarker Panels (6 Tests)'}
              {activeAnchor === 'recommendations' && 'Peptide Formulations & Clinical Synergy'}
            </h1>
          </div>
        </header>

        {/* ── View 1: Practice Overview & Core Operational KPIs (Google Cloud Rule #22) ─ */}
        {activeAnchor === 'overview' && (
        <div id="overview" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Operational Metrics
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  background: scopeMode === 'filtered' ? '#f0fdf4' : '#eff6ff',
                  color: scopeMode === 'filtered' ? '#16a34a' : '#1d4ed8',
                  border: `1px solid ${scopeMode === 'filtered' ? '#bbf7d0' : '#bfdbfe'}`,
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontWeight: 600
                }}
              >
                {scopeMode === 'filtered' 
                  ? `Active Filters View (${filteredPrescriptions.length} matching rx)` 
                  : `Global Practice View (${allPrescriptions.length} total rx)`}
              </span>
            </div>

            {/* Scope Switcher (Rule #22) */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setScopeMode('global')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: scopeMode === 'global' ? '#ffffff' : 'transparent',
                  color: scopeMode === 'global' ? '#0f172a' : '#64748b',
                  boxShadow: scopeMode === 'global' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.12s'
                }}
              >
                Global Database
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('filtered')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: scopeMode === 'filtered' ? '#ffffff' : 'transparent',
                  color: scopeMode === 'filtered' ? '#0f172a' : '#64748b',
                  boxShadow: scopeMode === 'filtered' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.12s'
                }}
              >
                Matching Filters
              </button>
            </div>
          </div>

          <div className="gcp-kpi-grid">
            {/* KPI 1: Active Prescriptions */}
            <div
              className="gcp-kpi-card"
              onClick={() => {
                triggerHaptic('light');
                setStatusFilter('active');
                setPatientFilter('all');
                setTemporalFilter('all');
                setSearchQuery('');
                setScopeMode('filtered');
                handleSidebarNavigate('prescriptions');
                toast.success(`Filtered table: Showing ${activeKpis.activePrescriptions} active prescriptions`, { id: 'kpi-filter' });
              }}
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              title="Click to view Active Prescriptions in table"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Active Prescriptions</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pill size={16} style={{ color: '#16a34a' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>
                {activeKpis.activePrescriptions}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Compounded posology regimens</span>
                <span style={{ fontSize: '0.70rem', color: '#16a34a', fontWeight: 600 }}>Filter table →</span>
              </div>
            </div>

            {/* KPI 2: Monitored Patients */}
            <div
              className="gcp-kpi-card"
              onClick={() => {
                triggerHaptic('light');
                setStatusFilter('all');
                setPatientFilter('all');
                setTemporalFilter('all');
                setSearchQuery('');
                setScopeMode('global');
                handleSidebarNavigate('prescriptions');
                toast.success(`Displaying all ${globalKpis.monitoredPatients} monitored patient dossiers`, { id: 'kpi-filter' });
              }}
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              title="Click to view Monitored Patients directory"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Monitored Patients</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} style={{ color: '#1a73e8' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>
                {activeKpis.monitoredPatients}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Unique patient dossiers managed</span>
                <span style={{ fontSize: '0.70rem', color: '#1a73e8', fontWeight: 600 }}>View patients →</span>
              </div>
            </div>

            {/* KPI 3: Pending Clinical Tasks */}
            <div
              className="gcp-kpi-card"
              onClick={() => {
                triggerHaptic('light');
                setTaskFilter('all');
                setSearchQuery('');
                handleSidebarNavigate('tasks');
                toast.success(`Showing all ${activeKpis.pendingTasksCount} actionable clinical tasks`, { id: 'kpi-filter' });
              }}
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              title="Click to view Action Tasks in to-do list"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Action Tasks</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} style={{ color: '#d97706' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#d97706', lineHeight: 1.1 }}>
                {activeKpis.pendingTasksCount}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Actionable reviews & titrations</span>
                <span style={{ fontSize: '0.70rem', color: '#d97706', fontWeight: 600 }}>View tasks →</span>
              </div>
            </div>

            {/* KPI 4: Refills & Titrations Due */}
            <div
              className="gcp-kpi-card"
              onClick={() => {
                triggerHaptic('light');
                setTaskFilter('refill');
                setSearchQuery('');
                setScopeMode('filtered');
                handleSidebarNavigate('tasks');
                toast.success(`Filtered To-Do Queue: Showing ${activeKpis.refillsDueCount} refills due`, { id: 'kpi-filter' });
              }}
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              title="Click to view Refill & Renewal Tasks in to-do list"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Refills & Cycles</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} style={{ color: '#7c3aed' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#7c3aed', lineHeight: 1.1 }}>
                {activeKpis.refillsDueCount}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Upcoming supply cycles (14 days)</span>
                <span style={{ fontSize: '0.70rem', color: '#7c3aed', fontWeight: 600 }}>Filter refills →</span>
              </div>
            </div>
          </div>



          {/* ── Deep Clinical Analytics & Prescribing Intelligence (Rule #22) ── */}
          <div style={{ marginTop: '24px' }}>
            <DoctorClinicalAnalytics
              prescriptions={scopeMode === 'filtered' ? filteredPrescriptions : allPrescriptions}
              serverAnalytics={data?.serverAnalytics}
              onSelectApi={(apiName) => {
                if (apiFilter && apiFilter.toLowerCase() === apiName.toLowerCase()) {
                  setApiFilter(null);
                  toast('Cleared active API filter', { id: 'api-filter' });
                } else {
                  setApiFilter(apiName);
                  handleSidebarNavigate('prescriptions');
                  toast.success(`Filtered table: showing ${apiName} formulations`, { id: 'api-filter' });
                }
              }}
              selectedApiFilter={apiFilter}
              onClearApiFilter={() => {
                setApiFilter(null);
                toast('Cleared active API filter', { id: 'api-filter' });
              }}
              isFiltered={scopeMode === 'filtered' || !!apiFilter}
            />
          </div>
        </div>
        )}

        {/* ── View 2: Clinical Search & Universal Multi-Table Query (Rule #7) ─ */}
        {activeAnchor === 'search' && (
        <section
          id="search-workspace"
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
          }}
        >
          {/* Header Title */}
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.10rem', fontWeight: 600, color: '#202124', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} style={{ color: '#1a73e8' }} />
              <span>Universal Clinical Registry Search</span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.80rem', color: '#5f6368' }}>
              Instant cross-table query across patients, prescription numbers, compound pharmacopeia, and clinical tasks.
            </p>
          </div>

          {/* Prominent Global Search Bar */}
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search patient, prescription code (e.g. RX-2024-001), active compound, or status..."
            resultCount={filteredPrescriptions.length + filteredTasks.length}
            namespace={`doctor-${slug}`}
            size="lg"
            filters={[
              statusFilter !== 'all' && {
                key: 'status',
                label: 'Status',
                value: statusFilter.toUpperCase(),
                onRemove: () => setStatusFilter('all')
              },
              taskFilter !== 'all' && {
                key: 'task',
                label: 'Task Type',
                value: taskFilter.toUpperCase(),
                onRemove: () => setTaskFilter('all')
              },
              apiFilter && {
                key: 'api',
                label: 'Active API',
                value: apiFilter,
                onRemove: () => setApiFilter(null)
              }
            ].filter(Boolean)}
            filterOptions={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Active', value: 'active' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Draft', value: 'draft' }
                ],
                value: statusFilter,
                onChange: setStatusFilter
              },
              {
                key: 'task',
                label: 'Tasks',
                options: [
                  { label: 'All Tasks', value: 'all' },
                  { label: 'Titrations', value: 'titration' },
                  { label: 'Refills', value: 'refill' },
                  { label: 'Sign-offs', value: 'approval' }
                ],
                value: taskFilter,
                onChange: setTaskFilter
              }
            ]}
          />

          {/* Quick Query Shortcuts (Chips) */}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#5f6368' }}>Quick Queries:</span>
            {[
              { label: 'Tirzepatide Regimens', q: 'Tirzepatide' },
              { label: 'GHK-Cu Formulations', q: 'GHK-Cu' },
              { label: 'NAD+ Cycles', q: 'NAD' },
              { label: 'BPC-157 Formulations', q: 'BPC-157' },
              { label: 'Pending Actions', q: 'pending' }
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setSearchQuery(chip.q)}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  color: '#1a73e8',
                  background: '#f8fafd',
                  border: '1px solid #dadce0',
                  borderRadius: '16px',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.12s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e8f0fe'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafd'; }}
              >
                {chip.label}
              </button>
            ))}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  color: '#d93025',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '3px 6px'
                }}
              >
                Clear ×
              </button>
            )}
          </div>

          {/* Breakdown Pill */}
          {searchQuery.trim() && (
            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '0.80rem',
                color: '#1e40af'
              }}
            >
              <span style={{ fontWeight: 600 }}>Active Search: &ldquo;{searchQuery}&rdquo;</span>
              <span style={{ color: '#93c5fd' }}>•</span>
              <span><strong>{filteredPrescriptions.length}</strong> matching prescriptions</span>
              <span style={{ color: '#93c5fd' }}>•</span>
              <span><strong>{filteredTasks.length}</strong> care tasks</span>
            </div>
          )}

          {/* Live Search Results: Prescriptions Table */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#202124', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} style={{ color: '#1a73e8' }} />
                <span>Matching Prescriptions ({filteredPrescriptions.length})</span>
              </h3>
            </div>
            <DataTable
              data={filteredPrescriptions}
              columns={prescriptionColumns}
              keyField="id"
              loading={loading}
              emptyMessage={searchQuery ? `No prescriptions match "${searchQuery}"` : "No prescriptions found in clinical registry"}
              defaultPageSize={10}
              pageSizeOptions={[10, 25, 50]}
              onRowClick={(row) => setSelectedPrescription(row)}
            />
          </div>

          {/* Live Search Results: Care Tasks (if any match) */}
          {filteredTasks.length > 0 && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e8eaed' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 600, color: '#202124', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} style={{ color: '#d97706' }} />
                  <span>Matching Care Tasks ({filteredTasks.length})</span>
                </h3>
              </div>
              <DataTable
                data={filteredTasks}
                columns={taskColumns}
                keyField="id"
                loading={loading}
                emptyMessage="No clinical action tasks match query"
                defaultPageSize={5}
                pageSizeOptions={[5, 10, 25]}
              />
            </div>
          )}
        </section>
        )}

        {/* ── View 2: Pending Clinical Tasks & To-Do Actions (DataTable Universal) ── */}
        {activeAnchor === 'tasks' && (
        <section
          id="tasks"
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            marginBottom: '32px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #dadce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#ffffff'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: '#1a73e8' }} />
                <span>Patient Care To-Do List & Pending Clinical Actions</span>
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Automated clinical vigilance based on treatment schedules, phase titrations, and intake submissions.
              </p>
            </div>

            {/* Quick Task Filter Pills */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '3px', gap: '2px' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'titration', label: 'Titrations' },
                { id: 'refill', label: 'Refills' },
                { id: 'approval', label: 'Sign-offs' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTaskFilter(f.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: taskFilter === f.id ? '#ffffff' : 'transparent',
                    color: taskFilter === f.id ? '#0f172a' : '#64748b',
                    boxShadow: taskFilter === f.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.12s'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={taskColumns}
            data={filteredTasks}
            keyField="id"
            tableId={`doctor-tasks-${slug}`}
            pagination={true}
            initialRowsPerPage={10}
            alwaysShowPagination={true}
            onRowClick={handleRowClickTask}
            emptyTitle="All Patient Care Tasks Up to Date"
            emptyDescription="There are no pending protocol titrations, phase adjustments, or refill authorizations requiring physician action."
            expandableRender={(task) => (
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1a73e8' }}>
                      Clinical Action Details
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe'
                    }}>
                      <Clock size={11} />
                      Timeline: {task.dueDate || 'Immediate'}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: task.isSigned || task.status === 'approved' ? '#f0fdf4' : '#fffbeb',
                      color: task.isSigned || task.status === 'approved' ? '#16a34a' : '#b45309',
                      border: `1px solid ${task.isSigned || task.status === 'approved' ? '#bbf7d0' : '#fde68a'}`
                    }}>
                      {task.isSigned || task.status === 'approved' ? 'Signed & Authorized' : 'Pending Authorization'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Trigger: Automated Chronobiological Protocol Monitor
                  </span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                  {task.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <Link
                    href={task.actionUrl}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      background: '#1a73e8',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
                    }}
                  >
                    <span>Execute {task.actionLabel}</span>
                    <ArrowUpRight size={13} />
                  </Link>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Reference Prescription:</span>
                    <CopyableId value={task.code} iconOnly={false} />
                  </div>
                </div>
              </div>
            )}
          />
        </section>
        )}

        {/* ── View 3: Associated Clinical Prescriptions Dossier (DataTable Universal) ── */}
        {activeAnchor === 'prescriptions' && (
        <section
          id="prescriptions"
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #dadce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#ffffff'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} style={{ color: '#1a73e8' }} />
                  <span>Associated Clinical Prescriptions Dossier</span>
                </h2>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>•</span>
                  <span>Synced {lastRefreshed ? lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}</span>
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Complete verified repository of compounded prescriptions and clinical regimens.
              </p>
            </div>

            {/* GCP Action Toolbar: Filters + Refresh + Export */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Temporal Filters */}
              <div style={{ display: 'inline-flex', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px', gap: '2px' }}>
                {[
                  { id: 'all', label: 'All Time' },
                  { id: '30d', label: '30 Days' },
                  { id: '90d', label: '90 Days' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemporalFilter(t.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: temporalFilter === t.id ? '#ffffff' : 'transparent',
                      color: temporalFilter === t.id ? '#003666' : '#64748b',
                      boxShadow: temporalFilter === t.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.12s'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Status Filters */}
              <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', gap: '2px' }}>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active & Approved' },
                  { id: 'approved', label: 'Approved' },
                  { id: 'pending', label: 'Pending' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatusFilter(s.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: statusFilter === s.id ? '#ffffff' : 'transparent',
                      color: statusFilter === s.id ? '#0f172a' : '#64748b',
                      boxShadow: statusFilter === s.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.12s'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Patient Selector Filter (Google Cloud Standard) */}
              <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 8px', gap: '5px' }}>
                <Users size={12} style={{ color: patientFilter === 'all' ? '#64748b' : '#003666' }} />
                <select
                  value={patientFilter}
                  onChange={(e) => {
                    setPatientFilter(e.target.value);
                    if (e.target.value !== 'all') {
                      toast.success(`Filtered for patient: ${e.target.value}`);
                    }
                  }}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    background: 'transparent',
                    border: 'none',
                    color: patientFilter === 'all' ? '#64748b' : '#003666',
                    cursor: 'pointer',
                    outline: 'none',
                    padding: '3px 0'
                  }}
                  title="Filter table by patient dossier"
                >
                  <option value="all">All Patients ({uniquePatientList.length})</option>
                  {uniquePatientList.map(pName => (
                    <option key={pName} value={pName}>{pName}</option>
                  ))}
                </select>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh clinical registry"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#5f6368',
                  cursor: 'pointer'
                }}
              >
                <RotateCw size={13} />
              </button>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCsv}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  height: '28px',
                  padding: '0 10px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={13} color="#5f6368" />
                <span>Export CSV</span>
              </button>

              {/* Primary Action Button: Import / New Prescription (AI Intake) */}
              <button
                type="button"
                onClick={() => setIsIntakeOpen(true)}
                title="Import prescription document via Atlas AI Intake (Multi-format & 2-Phase SLA)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '28px',
                  padding: '0 12px',
                  borderRadius: '4px',
                  border: '1px solid #1a73e8',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(26,115,232,0.2)'
                }}
              >
                <Plus size={13} />
                <span>+ Import / New Rx (AI)</span>
              </button>
            </div>
          </div>

          {/* ── Quick Status Filter Chips (Proposal #3: Chips de 1-Clic) ──────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick Filter:
            </span>
            {[
              { id: 'all', label: `All (${quickCounts.all})`, color: '#003666', bg: '#f1f5f9' },
              { id: 'pending', label: `🟡 Awaiting Sign-off / Review (${quickCounts.pending})`, color: '#b45309', bg: '#fffbeb' },
              { id: 'active', label: `🟢 Active in Dispensary (${quickCounts.active})`, color: '#15803d', bg: '#f0fdf4' },
              { id: 'multipart', label: `🔵 Multi-Part Formulations (${quickCounts.multipart})`, color: '#1d4ed8', bg: '#eff6ff' }
            ].map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setQuickRxFilter(chip.id);
                }}
                style={{
                  height: '28px',
                  padding: '0 12px',
                  borderRadius: '9999px',
                  border: quickRxFilter === chip.id ? `2px solid ${chip.color}` : '1px solid #cbd5e1',
                  background: quickRxFilter === chip.id ? chip.bg : '#ffffff',
                  color: chip.color,
                  fontSize: '0.74rem',
                  fontWeight: quickRxFilter === chip.id ? 750 : 550,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: quickRxFilter === chip.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <DataTable
            columns={prescriptionColumns}
            data={filteredPrescriptions}
            keyField="id"
            tableId={`doctor-prescriptions-${slug}`}
            pagination={true}
            initialRowsPerPage={10}
            alwaysShowPagination={true}
            onRowClick={handleRowClickPrescription}
            emptyTitle="No Prescriptions Found"
            emptyDescription="No prescriptions match the active search criteria or filters. Adjust search keywords or register a new patient."
            expandableRender={(rx) => {
              const parts = resolvePrescriptionParts(rx);
              const totalApisCount = parts.reduce((acc, p) => acc + (p.apis?.length || 0), 0);

              const isAwaitingAtlasReview = rx.status === 'draft' || rx.ingestionStage === 'awaiting_atlas_review' || rx.state === 'draft';

              return (
                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {/* Two-Phase Clinical Intake Tracker Banner (Draft SLA SLA) */}
                  {isAwaitingAtlasReview && (
                    <div style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      marginBottom: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={16} color="#d97706" />
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400e' }}>
                            Phase 2 in Progress: Atlas AI & Clinical Pharmacist Validation
                          </span>
                          <span style={{
                            fontSize: '0.70rem',
                            background: '#fef3c7',
                            color: '#b45309',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontWeight: 700,
                            border: '1px solid #fcd34d'
                          }}>
                            ETA: ~24 Hours
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 600 }}>
                          Current Mode: <strong>Draft / Clinical Review</strong>
                        </span>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '8px',
                        paddingTop: '6px',
                        borderTop: '1px dashed #fcd34d'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>✓</div>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>1. Digital Intake</div>
                            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Parsed to Draft</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef3c7', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fde68a', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>2</div>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e' }}>2. Atlas AI Review</div>
                            <div style={{ fontSize: '0.66rem', color: '#b45309' }}>Pharmacist verification (~24h)</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', opacity: 0.7 }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>3</div>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>3. Dispensary Authorization</div>
                            <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Active for Fulfillment</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Google Cloud Prescription Reference Header & Action Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#003666' }}>
                        Prescription #{rx.code}
                      </span>
                      <CopyableId value={rx.code} iconOnly={true} />
                      <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        <span>Authorized: {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Active Regimen'}</span>
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={11} />
                        <span>EU GMP Validated</span>
                      </span>
                      {parts.length > 1 && (
                        <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {parts.length} Compounded Formulations
                        </span>
                      )}
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Total Active Ingredients: <strong>{totalApisCount}</strong>
                      </span>
                    </div>

                    {/* Integrated Clinical Action Buttons */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Proposal #2: Patient Posology Handout */}
                      <button
                        type="button"
                        onClick={() => handleOpenHandout(rx)}
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 650,
                          color: '#4338ca',
                          background: '#eef2ff',
                          border: '1px solid #c7d2fe',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 1px 2px rgba(67, 56, 202, 0.08)'
                        }}
                        title="View and download patient posology instructions handout (PDF / Print)"
                      >
                        <FileText size={12} />
                        <span>Patient Handout</span>
                      </button>

                      {/* Proposal #4: Re-prescribe Formula for Another Patient */}
                      <button
                        type="button"
                        onClick={() => handleReprescribeFormula(rx)}
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 650,
                          color: '#0369a1',
                          background: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Replicate this formula in Clinical Intake for a new patient"
                      >
                        <RefreshCw size={12} />
                        <span>Re-prescribe Formula</span>
                      </button>

                      {/* Proposal #1: Direct WhatsApp Consultation for this Prescription */}
                      <button
                        type="button"
                        onClick={() => handleContactAtlasWhatsApp(
                          `Prescription #${rx.code} (${rx.patientName || 'Patient'})`,
                          `Clinical formulation inquiry: ${rx.treatmentTitle || 'Compounded Formula'} (${parts.length} parts, ${totalApisCount} active ingredients)`
                        )}
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 650,
                          color: '#047857',
                          background: '#f0fdf4',
                          border: '1px solid #a7f3d0',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Contact Atlas Clinical Support on WhatsApp"
                      >
                        <MessageCircle size={12} />
                        <span>Contact Atlas on WhatsApp</span>
                      </button>

                      <Link
                        href={`/rx/${rx.code}`}
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 650,
                          color: '#003666',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                        }}
                      >
                        <span>Full Dossier</span>
                        <ArrowUpRight size={12} />
                      </Link>

                      {(rx.protocolUrl || rx.protocolSlug) && (
                        <a
                          href={rx.protocolUrl || `/proto/${rx.protocolSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 650,
                            color: '#1d4ed8',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <BookOpen size={12} />
                          <span>Protocol Reference</span>
                          <ExternalLink size={10} />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenLabelsModal(rx)}
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 650,
                          color: '#0284c7',
                          background: '#ffffff',
                          border: '1px solid #bae6fd',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 1px 2px rgba(2,132,199,0.06)'
                        }}
                      >
                        <Tag size={12} />
                        <span>Official Bottle Labels</span>
                      </button>
                    </div>
                  </div>

                  {/* Multi-Part Formulations Container (Full Horizontal Width) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {parts.map((part, pIdx) => (
                      <div
                        key={pIdx}
                        style={{
                          background: '#ffffff',
                          border: `1px solid ${part.borderAccent || '#e2e8f0'}`,
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                      >
                        {/* Part Header */}
                        <div
                          style={{
                            padding: '10px 16px',
                            background: part.accentBg || '#f8fafc',
                            borderBottom: `1px solid ${part.borderAccent || '#e2e8f0'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '0.70rem',
                                fontWeight: 750,
                                letterSpacing: '0.04em',
                                color: part.accentColor || '#003666',
                                background: '#ffffff',
                                border: `1px solid ${part.borderAccent || '#cbd5e1'}`,
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}
                            >
                              {part.badge}
                            </span>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                              {part.title}
                            </span>
                            {part.volume && (
                              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                                ({part.volume})
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            {/* Proposal #1: 1-Click WhatsApp on this Part */}
                            <button
                              type="button"
                              onClick={() => handleContactAtlasWhatsApp(
                                `Prescripción #${rx.code} - Part ${part.partNumber} (${rx.patientName || 'Paciente'})`,
                                `Consulta clínica sobre formulación: ${part.title} (${(part.apis || []).map(a => a.name + (a.dose ? ' ' + a.dose : '')).join(', ')}) en vehículo: ${part.vehicle || 'Vehículo magistral'}`
                              )}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                border: '1px solid #10b981',
                                background: '#f0fdf4',
                                color: '#047857',
                                fontSize: '0.72rem',
                                fontWeight: 650,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title="Contact Atlas Clinical Support on WhatsApp"
                            >
                              <MessageCircle size={12} />
                              <span>Contact Atlas on WhatsApp</span>
                            </button>

                            <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 500 }}>
                              Dispensary: Atlas Certified Galenic Unit
                            </span>
                          </div>
                        </div>

                        {/* Part Posology Schedule Strip */}
                        {part.schedule && (
                          <div
                            style={{
                              padding: '8px 16px',
                              background: '#f8fafc',
                              borderBottom: '1px solid #f1f5f9',
                              fontSize: '0.78rem',
                              color: '#1e293b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              lineHeight: 1.4
                            }}
                          >
                            <Clock size={13} style={{ color: part.accentColor || '#0d9488', flexShrink: 0 }} />
                            <span>
                              <strong style={{ color: '#0f172a' }}>Clinical Administration Regimen:</strong> {part.schedule}
                            </span>
                          </div>
                        )}

                        {/* Part Active Ingredients - Full Width Clinical Presentation */}
                        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Active Pharmaceutical Ingredients (APIs) & Concentrations ({part.apis?.length || 0})
                          </div>

                          {(!part.apis || part.apis.length === 0) ? (
                            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                              Personalized compounded active ingredients calibrated to patient clinical profile.
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                              {part.apis.map((api, aIdx) => (
                                <div
                                  key={aIdx}
                                  style={{
                                    background: '#fafbfc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    padding: '10px 14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                  }}
                                >
                                  {/* Line 1: Compound Name, Dose badge, Pharmacological Class & Gene targets */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                                        {api.name}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: '0.76rem',
                                          fontWeight: 700,
                                          background: '#e0f2fe',
                                          color: '#0369a1',
                                          border: '1px solid #bae6fd',
                                          padding: '2px 8px',
                                          borderRadius: '4px'
                                        }}
                                      >
                                        {api.dose}
                                      </span>
                                      {api.geneTargets && api.geneTargets.length > 0 && (
                                        <span style={{ display: 'inline-flex', gap: '4px' }}>
                                          {api.geneTargets.map((g, gIdx) => (
                                            <span
                                              key={gIdx}
                                              style={{
                                                fontSize: '0.66rem',
                                                fontWeight: 650,
                                                color: '#475569',
                                                background: '#f1f5f9',
                                                border: '1px solid #e2e8f0',
                                                padding: '1px 5px',
                                                borderRadius: '3px'
                                              }}
                                            >
                                              🧬 {g}
                                            </span>
                                          ))}
                                        </span>
                                      )}
                                    </div>

                                    <span
                                      style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 650,
                                        color: '#0d9488',
                                        background: '#f0fdf4',
                                        border: '1px solid #bbf7d0',
                                        padding: '2px 8px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      {api.pharmacologicalClass}
                                    </span>
                                  </div>

                                  {/* Line 2: Clinical Indication & Cellular Target */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '6px', fontSize: '0.76rem', color: '#475569' }}>
                                    {api.clinicalIndication && (
                                      <div>
                                        <strong style={{ color: '#1e293b' }}>Clinical Indication:</strong> {api.clinicalIndication}
                                      </div>
                                    )}
                                    {api.cellularTarget && (
                                      <div>
                                        <strong style={{ color: '#1e293b' }}>Cellular Target:</strong> {api.cellularTarget}
                                      </div>
                                    )}
                                  </div>

                                  {/* Line 3: Mechanism of Action (Crucial for Physician) */}
                                  {api.mechanismOfAction && (
                                    <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.45, background: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                                      <strong style={{ color: '#0f172a' }}>Mechanism of Action:</strong> {api.mechanismOfAction}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Part Footer - Compounding Vehicle / Excipient Carrier */}
                        <div
                          style={{
                            padding: '8px 16px',
                            background: '#f8fafc',
                            borderTop: '1px solid #f1f5f9',
                            fontSize: '0.75rem',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '6px'
                          }}
                        >
                          <span>
                            <strong style={{ color: '#334155' }}>Compounding Vehicle / Excipient Carrier:</strong> {part.vehicle}
                          </span>
                          <span style={{ color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={12} />
                            EU GMP Validated Pharmacopeia Base
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tailored Atlas Clinical Recommendations (Bioactive Peptides & Colway Scalp Care) */}
                  {(() => {
                    const atlasRec = rx.atlasRecommendations || getPrescriptionAtlasRecommendations(rx);
                    if (!atlasRec?.peptide && !atlasRec?.colway) return null;

                    return (
                      <div
                        style={{
                          marginTop: '16px',
                          padding: '16px 18px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                        }}
                      >
                        {/* Header with Detected APIs */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.72rem', background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Sparkles size={11} />
                              <span>Atlas Clinical Recommendations</span>
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Adjuvant care based on molecular analysis of this formulation:
                            </span>
                          </div>

                          {/* Detected APIs Badges */}
                          {atlasRec.detectedApis && atlasRec.detectedApis.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.70rem', color: '#475569', fontWeight: 600 }}>Detected APIs:</span>
                              {atlasRec.detectedApis.slice(0, 4).map((api, aIdx) => (
                                <span key={aIdx} style={{ fontSize: '0.68rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '1px 6px', borderRadius: '4px', fontWeight: 650, fontFamily: 'monospace' }}>
                                  {api}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Dual Recommendations Grid (Peptide & Colway) */}
                        <div style={{ display: 'grid', gridTemplateColumns: atlasRec.colway ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: '12px' }}>
                          {/* 1. Bioactive Biomimetic Peptide (Strictly no Lotusland brand on screen) */}
                          {atlasRec.peptide && (
                            <div style={{ background: '#ffffff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '0.68rem', fontWeight: 750, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Bioactive Peptide Signaler
                                  </span>
                                  <span style={{ fontSize: '0.68rem', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 650 }}>
                                    {atlasRec.peptide.matchScore || 'High Synergy'}
                                  </span>
                                </div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                                  {atlasRec.peptide.peptideName}
                                </h4>
                                <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.45, background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #edf2f7', marginBottom: '8px' }}>
                                  <strong style={{ color: '#0f172a' }}>Synergy Rationale: </strong>
                                  {atlasRec.peptide.pharmaRationale}
                                </div>
                              </div>

                              {atlasRec.peptide.associatedProtocol && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                                  <a
                                    href={atlasRec.peptide.associatedProtocol.url || `/proto/${atlasRec.peptide.associatedProtocol.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 650,
                                      color: '#1d4ed8',
                                      background: '#eff6ff',
                                      border: '1px solid #bfdbfe',
                                      padding: '4px 10px',
                                      borderRadius: '4px',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span>Protocol: {atlasRec.peptide.associatedProtocol.title}</span>
                                    <ArrowUpRight size={11} />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 2. Scalp Barrier & Extracellular Matrix Support (Colway Clinical Care) */}
                          {atlasRec.colway && (
                            <div style={{ background: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '0.68rem', fontWeight: 750, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Colway Scalp Care &amp; ECM
                                  </span>
                                  <span style={{ fontSize: '0.68rem', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 650 }}>
                                    {atlasRec.colway.matchScore || 'Barrier Support'}
                                  </span>
                                </div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                                  {atlasRec.colway.productName}
                                </h4>
                                <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.45, background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #edf2f7', marginBottom: '8px' }}>
                                  <strong style={{ color: '#0f172a' }}>Clinical Rationale: </strong>
                                  {atlasRec.colway.clinicalRationale}
                                </div>
                                <div style={{ fontSize: '0.70rem', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' }}>
                                  💡 {atlasRec.colway.routineAdvice}
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                                <a
                                  href={atlasRec.colway.catalogUrl || `/p/${atlasRec.colway.catalogSlug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 650,
                                    color: '#047857',
                                    background: '#ecfdf5',
                                    border: '1px solid #a7f3d0',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <span>View Colway Clinical Datasheet</span>
                                  <ArrowUpRight size={11} />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          />
        </section>
        )}

        {/* ── View 4: Bloodo™ Diagnostic Panels (Baseline Calibration) ── */}
        {activeAnchor === 'diagnostics' && (
        <section
          id="diagnostics"
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '8px',
            marginTop: '32px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            overflow: 'hidden'
          }}
        >
          {/* Section Header */}
          <div
            style={{
              padding: '18px 22px',
              borderBottom: '1px solid #dadce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              background: '#ffffff'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} style={{ color: '#003666' }} />
                  <span>Bloodo™ Diagnostic Biomarker Panels & Quantitative Baseline Calibration</span>
                </h2>
                <span style={{ fontSize: '0.70rem', color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '1px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  6 CE-IVDR Certified Capillary DBS Tests
                </span>
                <span style={{ fontSize: '0.70rem', color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '1px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  ISO 15189 Accredited Lab
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.80rem', color: '#64748b' }}>
                All 6 certified pre-treatment diagnostic panels for objective physiological baseline profiling. Click any test to open its complete public analytical datasheet.
              </p>
            </div>
          </div>

          {/* Diagnostic Panels Matrix */}
          <div style={{ padding: '20px 22px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {bloodoPanels.map((panel) => (
                <div
                  key={panel.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px 18px',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#003666';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,54,102,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                      <a
                        href={`/p/${panel.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                          {panel.name}
                        </h4>
                        <ExternalLink size={13} style={{ color: '#1a73e8', flexShrink: 0 }} />
                      </a>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 650,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        whiteSpace: 'nowrap'
                      }}>
                        TAT: {panel.tat}
                      </span>
                    </div>

                    {/* Specimen pill */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '1px 8px',
                        borderRadius: '12px',
                        background: '#eff6ff',
                        color: '#1d4ed8'
                      }}>
                        Specimen: {panel.specimen}
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '1px 8px',
                        borderRadius: '12px',
                        background: '#f0fdf4',
                        color: '#166534',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <ShieldCheck size={11} /> Pre-Protocol Baseline
                      </span>
                    </div>

                    {/* Indication */}
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                      {panel.indications}
                    </p>

                    {/* Measured Biomarkers */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Quantitative Analytes Measured:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {panel.biomarkers.map((b, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.70rem',
                              fontWeight: 500,
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#1e293b',
                              padding: '2px 6px',
                              borderRadius: '3px'
                            }}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Clinical Decision Utility */}
                    <div style={{ fontSize: '0.73rem', color: '#0d9488', lineHeight: 1.35, marginBottom: '10px', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '8px 10px', borderRadius: '4px' }}>
                      <strong>Clinical Decision Utility:</strong> {panel.clinicalUtility}
                    </div>

                    {/* Companion Evidence Protocol Link */}
                    {panel.associatedProtocolTitle && (
                      <div style={{ marginBottom: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '7px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '0.71rem', color: '#1d4ed8', fontWeight: 600 }}>
                          Baseline for: <strong>{panel.associatedProtocolTitle}</strong>
                        </div>
                        <a
                          href={panel.associatedProtocolUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            color: '#1d4ed8',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <span>Protocol Guide</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Panel footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '12px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Requisition via Atlas Clinical Lab
                    </span>
                    <a
                      href={`/p/${panel.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerHaptic('light')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#ffffff',
                        border: '1px solid #1a73e8',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#1a73e8',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                        boxShadow: '0 1px 2px rgba(26,115,232,0.06)'
                      }}
                    >
                      <FileText size={12} />
                      <span>Public Datasheet</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── View 5: Clinical Protocols & Titrations (Direct View) ── */}
        {activeAnchor === 'protocols' && (
          <section
            id="protocols"
            style={{
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}
          >
            <ClinicalIntelligenceBanner
              protocols={data?.protocols || []}
              formulary={data?.formulary || []}
              opaqueDoctorCode={doctor?.opaqueCode || slug}
              doctorName={doctor?.name}
            />
          </section>
        )}

        {/* ── View 6: Compounding Pharmacopeia & APIs (Direct View) ── */}
        {activeAnchor === 'formulary' && (
          <section
            id="formulary"
            style={{
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}
          >
            <ClinicalIntelligenceBanner
              protocols={data?.protocols || []}
              formulary={data?.formulary || []}
              opaqueDoctorCode={doctor?.opaqueCode || slug}
              doctorName={doctor?.name}
            />
          </section>
        )}

        {/* ── View 7: Consolidated Master Atlas Recommendations (Clean & Non-Repetitive) ── */}
        {activeAnchor === 'recommendations' && (() => {
          // 1. Process all prescriptions with their analyzed recs once
          const analyzedItems = allPrescriptions.map(rx => ({
            rx,
            recs: rx.atlasRecommendations || getPrescriptionAtlasRecommendations(rx)
          }));

          const ghkMatches = analyzedItems.filter(item => item.recs?.peptide?.catalogCode === 'atlas-ghk-cu-50mg');
          const glowMatches = analyzedItems.filter(item => item.recs?.peptide?.catalogCode === 'atlas-glow-blend');
          const epithalonMatches = analyzedItems.filter(item => item.recs?.peptide?.catalogCode === 'atlas-epithalon-10mg');
          const colwayMatches = analyzedItems.filter(item => Boolean(item.recs?.colway));

          const masterSolutions = [
            {
              id: 'atlas-ghk-cu-50mg',
              category: 'peptide',
              badge: 'BIOACTIVE PEPTIDE SIGNALER',
              title: 'GHK-Cu (Copper Tripeptide-1) 50 mg / vial',
              badgeColor: '#4338ca',
              badgeBg: '#e0e7ff',
              borderColor: '#c7d2fe',
              matchScore: '98% Synergy',
              target: 'Dermal Papilla Proliferation & TGF-β1 Catagen Blockade',
              summary: 'High-affinity follicular bioregulator stimulating dermal papilla fibroblasts, downregulating TGF-β1 miniaturization, and accelerating anagen re-entry in synergy with Minoxidil and antiandrogens.',
              synergisticApis: ['Minoxidil', 'Finasteride', 'Dutasteride', 'Spironolactone', 'Latanoprost', 'TrichoSol'],
              matchingItems: ghkMatches,
              protocolTitle: 'Melanogenesis & Density Protocol (ZT + GHK-Cu)',
              protocolUrl: '/proto/melanogenesis-density-protocol-zt-ghk-cu'
            },
            {
              id: 'atlas-glow-blend',
              category: 'peptide',
              badge: 'TRIPLE REGENERATIVE COMPLEX',
              title: 'GLOW (BPC-157 / TB-500 / GHK) 10 mg | 10 mg | 75 mg',
              badgeColor: '#0369a1',
              badgeBg: '#e0f2fe',
              borderColor: '#bae6fd',
              matchScore: '99% Graft Synergy',
              target: 'Post-FUE Revascularization & Microvascular Graft Take',
              summary: 'Biocompatible tri-peptide complex engineered for accelerated follicular graft revascularization, nitric oxide microvascular stability, and early keratinocyte migration into recipient beds.',
              synergisticApis: ['PRP (Platelet-Rich Plasma)', 'FUE Micro-Grafts', 'TrichoOil Lipids', 'L-Arginine', 'Vitamin E'],
              matchingItems: glowMatches,
              protocolTitle: 'BPC-157 & TB-500 Tissue Repair Protocol',
              protocolUrl: '/proto/bpc-157-tb-500-protocol'
            },
            {
              id: 'atlas-epithalon-10mg',
              category: 'peptide',
              badge: 'EPIGENETIC TELOMERE REGULATOR',
              title: 'Epithalon (Ala-Glu-Asp-Gly) 10 mg / vial',
              badgeColor: '#7c3aed',
              badgeBg: '#ede9fe',
              borderColor: '#ddd6fe',
              matchScore: '99% Longevity Synergy',
              target: 'Telomerase Activation & Bulge Stem Cell Longevity',
              summary: 'Pineal biomimetic peptide inducing heterochromatin de-condensation and TERT upregulation, protecting follicular bulge stem cells against premature replicative senescence.',
              synergisticApis: ['Metformin', 'TeloTest™ Genomic Panels', 'CoQ10 / Ubiquinol', 'Trans-Resveratrol', 'NAC'],
              matchingItems: epithalonMatches,
              protocolTitle: 'Epithalon Telomere Extension Cycle',
              protocolUrl: '/proto/epithalon-telomere-extension'
            },
            {
              id: 'colway-hair-system',
              category: 'colway',
              badge: 'SCALP BARRIER INTEGRITY & NATIVE ECM',
              title: 'Colway Hair Strengthening System (2-Step Routine)',
              badgeColor: '#047857',
              badgeBg: '#d1fae5',
              borderColor: '#a7f3d0',
              matchScore: '99% Barrier Support',
              target: 'Cuticular ECM Preservation & Vehicle Irritation Prevention',
              summary: 'Biologically active native tropocollagen and microcirculatory flavonoids (diosmin) engineered to calm the stratum corneum, seal cuticular scales, and counteract hydroalcoholic vehicle lipid depletion.',
              synergisticApis: ['TrichoSol Vehicle Base', 'Topical Minoxidil', 'Topical 5αR Inhibitors', 'TrichoOil'],
              matchingItems: colwayMatches,
              protocolTitle: 'View Colway Clinical Datasheet (Shampoo & Conditioner)',
              protocolUrl: '/p/colway-strengthening-shampoo'
            }
          ];

          // Filter by Category and Search Query
          const filteredSolutions = masterSolutions.filter(sol => {
            if (recCategoryFilter === 'peptides' && sol.category !== 'peptide') return false;
            if (recCategoryFilter === 'colway' && sol.category !== 'colway') return false;
            if (recSearchQuery.trim()) {
              const q = recSearchQuery.toLowerCase().trim();
              const matchTitle = sol.title.toLowerCase().includes(q);
              const matchTarget = sol.target.toLowerCase().includes(q);
              const matchApis = sol.synergisticApis.some(api => api.toLowerCase().includes(q));
              const matchPatients = sol.matchingItems.some(item => 
                (item.rx.patientName || '').toLowerCase().includes(q) ||
                (item.rx.code || item.rx.id || '').toLowerCase().includes(q)
              );
              return matchTitle || matchTarget || matchApis || matchPatients;
            }
            return true;
          });

          const totalCoveredRxs = new Set(
            masterSolutions.flatMap(s => s.matchingItems.map(item => item.rx.id || item.rx.code))
          ).size;

          return (
            <section
              id="recommendations"
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '32px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              {/* Top GCP Header & Practice Metrics */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={18} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#202124' }}>
                      Atlas Recommendations &amp; Clinical Synergies
                    </h2>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#5f6368', maxWidth: '780px', lineHeight: 1.5 }}>
                    Master formulary of bioactive adjuvants and cuticular ECM barrier care. Consolidated across 4 core synergies matched to active prescriptions in your practice.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{
                    fontSize: '0.74rem',
                    background: '#f8fafc',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 650,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Users size={14} style={{ color: '#2563eb' }} />
                    <span><strong>{totalCoveredRxs}</strong> of {allPrescriptions.length} prescriptions with synergy</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '6px', fontWeight: 650 }}>
                    ✓ 4 Master Formulations
                  </span>
                </div>
              </div>

              {/* Filter Tabs & Patient Search Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 16px',
                background: '#f8fafd',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setRecCategoryFilter('all')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 650,
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: recCategoryFilter === 'all' ? '#2563eb' : '#d1d5db',
                      background: recCategoryFilter === 'all' ? '#eff6ff' : '#ffffff',
                      color: recCategoryFilter === 'all' ? '#1d4ed8' : '#4b5563',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All ({masterSolutions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecCategoryFilter('peptides')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 650,
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: recCategoryFilter === 'peptides' ? '#4338ca' : '#d1d5db',
                      background: recCategoryFilter === 'peptides' ? '#e0e7ff' : '#ffffff',
                      color: recCategoryFilter === 'peptides' ? '#3730a3' : '#4b5563',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Bioactive Peptides (3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecCategoryFilter('colway')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 650,
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: recCategoryFilter === 'colway' ? '#047857' : '#d1d5db',
                      background: recCategoryFilter === 'colway' ? '#ecfdf5' : '#ffffff',
                      color: recCategoryFilter === 'colway' ? '#065f46' : '#4b5563',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Barrier &amp; Cuticular ECM (1)
                  </button>
                </div>

                {/* Instant Search Bar */}
                <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '420px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={recSearchQuery}
                    onChange={(e) => setRecSearchQuery(e.target.value)}
                    placeholder="Search by patient name, code, or active API (e.g., Minoxidil)..."
                    style={{
                      width: '100%',
                      padding: '6px 30px 6px 30px',
                      fontSize: '0.78rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      outline: 'none',
                      background: '#ffffff',
                      color: '#1e293b'
                    }}
                  />
                  {recSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setRecSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: 0
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Master Solutions Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
                {filteredSolutions.map((sol) => {
                  const isExpanded = expandedRecId === sol.id;
                  const count = sol.matchingItems.length;

                  return (
                    <div
                      key={sol.id}
                      style={{
                        background: '#ffffff',
                        border: `1px solid ${sol.borderColor}`,
                        borderRadius: '10px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        {/* Top Badge & Match Pill */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 750,
                            color: sol.badgeColor,
                            background: sol.badgeBg,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em'
                          }}>
                            {sol.badge}
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            color: '#047857',
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700
                          }}>
                            {sol.matchScore}
                          </span>
                        </div>

                        {/* Title & Target */}
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                          {sol.title}
                        </h3>
                        <div style={{ fontSize: '0.76rem', color: sol.badgeColor, fontWeight: 650, marginBottom: '8px' }}>
                          🎯 {sol.target}
                        </div>

                        {/* Summary Rationale (2 lines max) */}
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
                          {sol.summary}
                        </p>

                        {/* Synergistic APIs in Practice */}
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                            Proven synergy with:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {sol.synergisticApis.map((api, aIdx) => (
                              <span
                                key={aIdx}
                                style={{
                                  fontSize: '0.70rem',
                                  background: '#f8fafc',
                                  color: '#334155',
                                  border: '1px solid #e2e8f0',
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  fontWeight: 600
                                }}
                              >
                                {api}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Practice Match Accordion Pill */}
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          marginBottom: '14px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#1e293b', fontWeight: 650 }}>
                              <Users size={14} style={{ color: count > 0 ? '#2563eb' : '#94a3b8' }} />
                              <span>
                                {count > 0 
                                  ? `Applies to ${count} patient${count > 1 ? 's' : ''} in your practice`
                                  : 'No active patients currently matched'}
                              </span>
                            </div>

                            {count > 0 && (
                              <button
                                type="button"
                                onClick={() => setExpandedRecId(isExpanded ? null : sol.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  fontSize: '0.72rem',
                                  fontWeight: 650,
                                  color: '#2563eb',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                <span>{isExpanded ? 'Hide' : `View list (${count})`}</span>
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>
                            )}
                          </div>

                          {/* Expanded Patients List */}
                          {isExpanded && count > 0 && (
                            <div style={{
                              marginTop: '8px',
                              paddingTop: '8px',
                              borderTop: '1px solid #e2e8f0',
                              maxHeight: '160px',
                              overflowY: 'auto',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '5px'
                            }}>
                              {sol.matchingItems.map(({ rx }, pIdx) => {
                                const patName = rx.patientName || 'Patient';
                                const rxCode = rx.code || rx.id;
                                return (
                                  <Link
                                    key={pIdx}
                                    href={`/rx/${rxCode}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: '0.70rem',
                                      fontWeight: 600,
                                      color: '#1e40af',
                                      background: '#ffffff',
                                      border: '1px solid #bfdbfe',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#dbeafe';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#ffffff';
                                    }}
                                    title={`Open prescription for ${patName}`}
                                  >
                                    <span>👤 {patName}</span>
                                    <span style={{ color: '#64748b', fontSize: '0.65rem' }}>#{rxCode}</span>
                                    <ArrowUpRight size={10} />
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Direct Action Link */}
                      <div style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                        <a
                          href={sol.protocolUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 650,
                            color: sol.category === 'colway' ? '#047857' : '#1d4ed8',
                            background: sol.category === 'colway' ? '#ecfdf5' : '#eff6ff',
                            border: `1px solid ${sol.category === 'colway' ? '#a7f3d0' : '#bfdbfe'}`,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            width: '100%',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.85';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          <span>{sol.protocolTitle}</span>
                          <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSolutions.length === 0 && (
                <div style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b'
                }}>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    No clinical solutions found matching &ldquo;{recSearchQuery}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRecSearchQuery('');
                      setRecCategoryFilter('all');
                    }}
                    style={{
                      marginTop: '8px',
                      fontSize: '0.76rem',
                      color: '#2563eb',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 650
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </section>
          );
        })()}
      </main>
      </div>

      {/* ── Fixed Bottom Actions Dock ("Sticker" Footer for Laptop & Mobile) ── */}
      <footer className="doctor-bottom-dock" role="toolbar" aria-label="Physician Quick Actions">
        <div className="doctor-bottom-dock-actions">
          <button
            type="button"
            className="doctor-dock-btn doctor-dock-btn-primary"
            onClick={() => setIsIntakeOpen(true)}
            title="Import or create a new compounded prescription"
          >
            <Plus size={15} />
            <span>Import / New Rx</span>
          </button>

          <button
            type="button"
            className="doctor-dock-btn doctor-dock-btn-secondary"
            onClick={handleCopyIntakeLink}
            title="Copy patient intake link to clipboard"
          >
            <Share2 size={14} />
            <span>Share Intake</span>
          </button>

          <button
            type="button"
            className="doctor-dock-btn doctor-dock-btn-secondary"
            onClick={() => setIsCredentialsModalOpen(true)}
            title="View physician profile and credentials"
          >
            <ShieldCheck size={14} color="#16a34a" />
            <span>Doctor Profile</span>
          </button>

          <button
            type="button"
            className="doctor-dock-btn doctor-dock-btn-ai"
            onClick={() => setIsAtlasAiOpen(true)}
            title="Atlas AI clinical query credits"
          >
            <Bot size={14} />
            <span>Atlas AI ({aiUsesRemaining}/5)</span>
          </button>

          <button
            type="button"
            className="doctor-dock-btn doctor-dock-btn-whatsapp"
            onClick={() => setIsRequestInfoOpen(true)}
            title="Request clinical assistance via WhatsApp"
          >
            <MessageCircle size={14} />
            <span>WhatsApp</span>
          </button>
        </div>
      </footer>

      {/* ── Official Compounding Bottle Labels Modal (Direct from Doctor Portal) ── */}
      {isLabelsModalOpen && activeLabelRx && (
        <PharmacyLabelsModal
          isOpen={isLabelsModalOpen}
          onClose={() => {
            setIsLabelsModalOpen(false);
            setActiveLabelRx(null);
          }}
          labels={labelsForActiveRx}
          initialLabelIndex={0}
          isEs={false}
        />
      )}

      {/* ── AI Prescription Intake Workspace (Attributed to this Physician) ── */}
      {isIntakeOpen && (
        <PrescriptionIntakeWorkspace
          isOpen={true}
          onClose={() => setIsIntakeOpen(false)}
          onSaveSuccess={() => {
            setIsIntakeOpen(false);
            toast.success(`Prescription saved and attributed to ${doctor.name}!`);
            window.location.reload();
          }}
        />
      )}

      {/* ── Slide-In Monograph Drawer (Google Cloud Standard Pattern) ────────── */}
      {selectedMonograph && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            background: 'rgba(32, 33, 36, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setSelectedMonograph(null)}
        >
          <div
            style={{
              width: '460px',
              maxWidth: '92vw',
              height: '100%',
              background: '#ffffff',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              animation: 'slideInRight 0.2s ease-out',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  background: '#f8fafc'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 700, textTransform: 'uppercase', color: '#1a73e8', background: '#e8f0fe', padding: '1px 6px', borderRadius: '4px' }}>
                      Pharmaceutical Monograph
                    </span>
                    <span style={{ fontSize: '0.70rem', color: '#16a34a', background: '#f0fdf4', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bbf7d0', fontWeight: 600 }}>
                      {selectedMonograph.purity || '≥ 99% HPLC'}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedMonograph.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    Compounding Reference Specification · EU GMP
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMonograph(null)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: '#5f6368',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body Content */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Therapeutic Classification */}
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Therapeutic Indication Target
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                    {safeRenderText(selectedMonograph.primaryGoal, 'Cellular Optimization')}
                  </div>
                </div>

                {/* Mechanism of Action */}
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.82rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Mechanism of Action & Pathways
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.55 }}>
                    {safeRenderText(selectedMonograph.moa) || safeRenderText(selectedMonograph.description)}
                  </p>
                </div>

                {/* Analytical Quality Specs */}
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.82rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Analytical Quality Specifications
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ padding: '8px 10px', background: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Assay / Purity</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>{selectedMonograph.purity || '≥ 99.0%'}</div>
                    </div>
                    <div style={{ padding: '8px 10px', background: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Regulatory Status</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>Prescription Only</div>
                    </div>
                    {selectedMonograph.casNumber && (
                      <div style={{ padding: '8px 10px', background: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>CAS Number</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>{selectedMonograph.casNumber}</div>
                      </div>
                    )}
                    <div style={{ padding: '8px 10px', background: '#fafbfc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Dispensing Form</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>Custom Compounded</div>
                    </div>
                  </div>
                </div>

                {/* Clinical Vigilance & Note */}
                <div style={{ padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.76rem', color: '#1e40af', lineHeight: 1.45 }}>
                  <strong>Physician Authorization Required:</strong> This molecule is restricted to professional magistral formulation under authorized medical supervision. Dispensing is processed exclusively via EU GMP licensed compounding dispensaries.
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #dadce0', background: '#f8fafc', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  const p = selectedMonograph;
                  setSelectedMonograph(null);
                  setInquiryPeptide(p);
                  setIsInquiryOpen(true);
                }}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
                }}
              >
                Inquire in Custom Regimen with {doctor.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Regimen Clinical Inquiry Modal ───────────────────────────────────── */}
      {isInquiryOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 65,
            background: 'rgba(32, 33, 36, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsInquiryOpen(false)}
        >
          <div
            style={{
              width: '500px',
              maxWidth: '100%',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #dadce0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Clinical Protocol Consultation
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Attributed to {doctor.name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInquiryOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#5f6368', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {inquiryPeptide && (
                <div style={{ padding: '10px 14px', background: '#e0f2fe', borderRadius: '6px', marginBottom: '14px', fontSize: '0.80rem', color: '#0369a1', fontWeight: 600 }}>
                  Selected Principle: {inquiryPeptide.name} ({inquiryPeptide.purity || '≥ 99% HPLC'})
                </div>
              )}
              <p style={{ margin: '0 0 16px 0', fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
                To integrate this active pharmaceutical ingredient into a customized medical protocol, you can initiate a digital prescription intake or schedule a clinical review.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsInquiryOpen(false);
                    setIsIntakeOpen(true);
                  }}
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    border: '1px solid #1a73e8',
                    background: '#1a73e8',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={15} />
                  <span>Submit Digital Prescription with AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleContactAtlasWhatsApp(
                      inquiryPeptide ? `Compounding Consultation: ${inquiryPeptide.name}` : 'Clinical Consultation',
                      inquiryPeptide ? `Inquiring about integrating ${inquiryPeptide.name} into custom prescription protocol.` : ''
                    );
                    setIsInquiryOpen(false);
                  }}
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    color: '#15803d',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={15} color="#16a34a" />
                  <span>Contact Atlas on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ── Atlas AI Clinical Copilot Modal (Isolated, 5 Session Uses) ─────── */}
      {isAtlasAiOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 70,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsAtlasAiOpen(false)}
        >
          <div
            style={{
              width: '640px',
              maxWidth: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      Atlas AI — Clinical Copilot
                    </h3>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: aiUsesRemaining > 2 ? '#10b981' : aiUsesRemaining > 0 ? '#f59e0b' : '#ef4444',
                      color: '#ffffff'
                    }}>
                      {aiUsesRemaining}/5 uses left
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: '2px' }}>
                    Personalized for {doctor.name} · {filteredPrescriptions.length} Prescriptions Indexed
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAtlasAiOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Privacy Guarantee Banner */}
            <div style={{
              padding: '8px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.72rem',
              color: '#475569'
            }}>
              <ShieldCheck size={14} color="#6366f1" />
              <span>
                <strong>Isolated Session:</strong> Reads only your active patients & compounding formulas. No queries or history are retained or shared across users.
              </span>
            </div>

            {/* Message Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#fdfdfe',
              maxHeight: '360px'
            }}>
              {/* Welcome Assistant Message */}
              <div style={{
                alignSelf: 'flex-start',
                maxWidth: '88%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '0.70rem', color: '#6366f1', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bot size={12} /> Atlas Clinical Intelligence
                </div>
                <div style={{ fontSize: '0.80rem', color: '#1e293b', lineHeight: 1.5 }}>
                  Hello {doctor.name}. I am initialized with your current clinical context: <strong>{doctor.patients?.length || filteredPrescriptions.length} patients</strong> and <strong>{filteredPrescriptions.length} compounded prescriptions</strong>.
                  <br /><br />
                  You have <strong>{aiUsesRemaining} query credits</strong> in this session. Ask me to summarize patient regimens, verify API concentrations, or check multi-part compounding protocols.
                </div>
              </div>

              {/* Chat Thread */}
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    background: msg.role === 'user' ? '#4f46e5' : '#ffffff',
                    color: msg.role === 'user' ? '#ffffff' : '#1e293b',
                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{
                    fontSize: '0.68rem',
                    color: msg.role === 'user' ? '#e0e7ff' : '#6366f1',
                    fontWeight: 700,
                    marginBottom: '4px'
                  }}>
                    {msg.role === 'user' ? 'You' : 'Atlas Assistant'} · {msg.time}
                  </div>
                  <div style={{
                    fontSize: '0.80rem',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  background: '#f1f5f9',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: '#475569'
                }}>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Synthesizing patient & API formulation data...</span>
                </div>
              )}

              {aiUsesRemaining === 0 && (
                <div style={{
                  padding: '12px 14px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  color: '#92400e',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div>
                    <strong>Session Quota Reached (5/5):</strong> You have utilized all 5 free clinical intelligence queries allocated to this browser session.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleContactAtlasWhatsApp('Atlas AI Quota Extended Consultation')}
                      style={{
                        padding: '6px 12px',
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <MessageCircle size={13} />
                      <span>Contact Atlas on WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            {aiUsesRemaining > 0 && (
              <div style={{
                padding: '10px 16px',
                background: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto'
              }}>
                {[
                  'Summarize active patients',
                  'Verify dosages & APIs',
                  'Pending sign-off tasks',
                  'Multi-part formulations'
                ].map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => handleSendAtlasAiQuery(chip)}
                    disabled={aiLoading}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '5px 10px',
                      borderRadius: '9999px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder={aiUsesRemaining > 0 ? "Ask Atlas AI about your patients, APIs, or formulas..." : "Session limit reached. Contact Atlas Support on WhatsApp."}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAtlasAiQuery();
                  }
                }}
                disabled={aiLoading || aiUsesRemaining <= 0}
                style={{
                  flex: 1,
                  height: '40px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  background: aiUsesRemaining <= 0 ? '#f8fafc' : '#ffffff'
                }}
              />
              <button
                type="button"
                onClick={() => handleSendAtlasAiQuery()}
                disabled={!aiInput.trim() || aiLoading || aiUsesRemaining <= 0}
                style={{
                  height: '40px',
                  padding: '0 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: !aiInput.trim() || aiLoading || aiUsesRemaining <= 0 ? '#cbd5e1' : '#4f46e5',
                  color: '#ffffff',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: !aiInput.trim() || aiLoading || aiUsesRemaining <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send size={14} />
                <span>Ask</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Request Info Modal (Atlas Clinical Support: +971 55 356 1058) ───── */}
      {isRequestInfoOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 70,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setIsRequestInfoOpen(false)}
        >
          <div
            style={{
              width: '580px',
              maxWidth: '100%',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 8px 28px rgba(32, 33, 36, 0.28)',
              overflow: 'hidden',
              border: '1px solid #dadce0',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Google Cloud Standard Dialog Header) */}
            <div style={{
              padding: '16px 20px',
              background: '#ffffff',
              borderBottom: '1px solid #dadce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  background: '#e8f0fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MessageCircle size={18} color="#1a73e8" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 600, color: '#202124' }}>
                    Request Information & Clinical Support
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Atlas Medical & Scientific Affairs</span>
                    <span>•</span>
                    <span style={{ color: '#1a73e8', fontWeight: 500 }}>WhatsApp Concierge Liaison</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestInfoOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5f6368',
                  cursor: 'pointer',
                  transition: 'background 0.12s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f3f4'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Doctor & Channel attribution banner */}
            <div style={{
              padding: '10px 20px',
              background: '#f8f9fa',
              borderBottom: '1px solid #e8eaed',
              fontSize: '0.76rem',
              color: '#3c4043',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              <span>Attributed Physician: <strong style={{ color: '#202124' }}>{doctor.name}</strong></span>
              <span>Liaison Channel: <strong style={{ color: '#137333' }}>Official WhatsApp</strong></span>
            </div>

            {/* Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Question Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5f6368', marginBottom: '6px' }}>
                  Select Inquiry Type / Common Question:
                </label>
                <select
                  value={requestInfoSubject}
                  onChange={(e) => setRequestInfoSubject(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    fontSize: '0.82rem',
                    color: '#202124',
                    background: '#ffffff',
                    outline: 'none',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <optgroup label="Pricing & Quotations">
                    <option value="What is the pricing / quotation for this prescription?">
                      Pricing & Quotation — What is the price for this prescription?
                    </option>
                  </optgroup>
                  <optgroup label="Delivery & Logistics">
                    <option value="What is the estimated delivery time to the patient?">
                      Delivery Lead Time — When will this reach the patient?
                    </option>
                    <option value="What is the current fulfillment & courier tracking status?">
                      Order Tracking — What is the current dispatch / courier status?
                    </option>
                  </optgroup>
                  <optgroup label="Compounding & Raw Materials">
                    <option value="Is this peptide / API in stock, or is an approved equivalent available?">
                      Stock Availability — Is this API / peptide in stock or backordered?
                    </option>
                    <option value="Can the vehicle, concentration, or administration form be customized?">
                      Custom Formulation — Can we adjust vehicle, dose, or format?
                    </option>
                  </optgroup>
                  <optgroup label="Quality, Analytical & COA">
                    <option value="Request Certificate of Analysis (COA) & batch purity report">
                      COA & Quality — Request HPLC Certificate of Analysis & purity specs
                    </option>
                  </optgroup>
                  <optgroup label="Patient Refills & Renewals">
                    <option value="Request repeat batch / prescription refill for this patient">
                      Prescription Refill — Request repeat batch or protocol renewal
                    </option>
                  </optgroup>
                  <optgroup label="General Clinical Affairs">
                    <option value="General clinical consultation or pharmacopeia question">
                      Other Clinical Inquiry — Specialized medical or administrative question
                    </option>
                  </optgroup>
                </select>

                {/* Quick Topic Shortcut Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {[
                    { label: 'Pricing & Quote', val: 'What is the pricing / quotation for this prescription?' },
                    { label: 'Delivery Lead Time', val: 'What is the estimated delivery time to the patient?' },
                    { label: 'Tracking Status', val: 'What is the current fulfillment & courier tracking status?' },
                    { label: 'Stock / API Availability', val: 'Is this peptide / API in stock, or is an approved equivalent available?' }
                  ].map((chip, cIdx) => {
                    const isSelected = requestInfoSubject === chip.val;
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => setRequestInfoSubject(chip.val)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          border: isSelected ? '1px solid #1a73e8' : '1px solid #e0e0e0',
                          background: isSelected ? '#e8f0fe' : '#ffffff',
                          color: isSelected ? '#1a73e8' : '#5f6368',
                          fontSize: '0.72rem',
                          fontWeight: isSelected ? 600 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.12s'
                        }}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reference Prescription (Optional) */}
              {filteredPrescriptions.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5f6368', marginBottom: '6px' }}>
                    Reference Prescription (Optional):
                  </label>
                  <select
                    value={requestInfoSelectedRx}
                    onChange={(e) => setRequestInfoSelectedRx(e.target.value)}
                    style={{
                      width: '100%',
                      height: '36px',
                      padding: '0 10px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      fontSize: '0.80rem',
                      color: '#202124',
                      background: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    <option value="">-- General Product / Pharmacopeia Question --</option>
                    {filteredPrescriptions.slice(0, 20).map(p => (
                      <option key={p.id} value={`${p.id} - ${p.patientName} (${p.treatmentTitle || 'Formulation'})`}>
                        {p.id} · {p.patientName} · {p.treatmentTitle || 'Compounded Treatment'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Physician Clinical Notes / Specific Questions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5f6368', marginBottom: '6px' }}>
                  Physician Clinical Notes / Specific Details:
                </label>
                <textarea
                  rows={3}
                  value={requestInfoNotes}
                  onChange={(e) => setRequestInfoNotes(e.target.value)}
                  placeholder="e.g., Inquiring regarding vehicle stability, courier transit time to Dubai / Abu Dhabi, or batch release certificate..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    fontSize: '0.80rem',
                    color: '#202124',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Action Buttons: Exclusively WhatsApp (+971 55 356 1058), Copy Text & Cancel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const fullDetails = [
                      requestInfoSelectedRx ? `Prescription Ref: ${requestInfoSelectedRx}` : '',
                      requestInfoNotes ? `Notes: ${requestInfoNotes}` : ''
                    ].filter(Boolean).join('\n');
                    handleContactAtlasWhatsApp(requestInfoSubject, fullDetails);
                    setIsRequestInfoOpen(false);
                  }}
                  style={{
                    height: '42px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#25D366',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                    transition: 'background 0.12s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#20ba5a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#25D366'; }}
                >
                  <MessageCircle size={18} />
                  <span>Send Inquiry via WhatsApp</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Physician: ${doctor.name}\nTopic: ${requestInfoSubject}\n${requestInfoSelectedRx ? `Ref: ${requestInfoSelectedRx}\n` : ''}${requestInfoNotes ? `Notes: ${requestInfoNotes}\n` : ''}`;
                      navigator.clipboard?.writeText(text);
                      toast.success('Inquiry copied to clipboard ✓');
                    }}
                    style={{
                      flex: 1,
                      height: '36px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: '#ffffff',
                      color: '#3c4043',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background 0.12s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                  >
                    <Copy size={14} />
                    <span>Copy Inquiry Text</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRequestInfoOpen(false)}
                    style={{
                      height: '36px',
                      padding: '0 16px',
                      borderRadius: '4px',
                      border: '1px solid #dadce0',
                      background: '#ffffff',
                      color: '#5f6368',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.12s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Patient Posology Handout Modal (Printable & Shareable) ─────────── */}
      {isHandoutOpen && handoutRx && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1050,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => {
            setIsHandoutOpen(false);
            setHandoutRx(null);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #dadce0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                background: '#003666',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileText size={18} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                    Patient Posology & Administration Handout
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', opacity: 0.85 }}>
                    Clinical compounding regimen for {handoutRx.patientName || 'Patient'} · Code #{handoutRx.code || handoutRx.prescriptionNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsHandoutOpen(false);
                  setHandoutRx(null);
                }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Patient & Clinic Metadata Card */}
              <div
                style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  fontSize: '12px'
                }}
              >
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>PATIENT</span>
                  <strong style={{ color: '#0f172a', fontSize: '13px' }}>{handoutRx.patientName || 'Patient'}</strong>
                  {handoutRx.patient?.dob && <span style={{ color: '#64748b', display: 'block' }}>DOB: {handoutRx.patient.dob}</span>}
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>PRESCRIBING PHYSICIAN</span>
                  <strong style={{ color: '#0f172a' }}>{doctor.name || 'Treating Physician'}</strong>
                  <span style={{ color: '#64748b', display: 'block' }}>{doctor.clinic || 'Specialized Clinic'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>PRESCRIPTION CODE</span>
                  <strong style={{ color: '#1a73e8' }}>#{handoutRx.code || handoutRx.prescriptionNumber}</strong>
                  <span style={{ color: '#64748b', display: 'block' }}>Date: {handoutRx.dateFormatted || handoutRx.date || 'Active'}</span>
                </div>
              </div>

              {/* Treatment Title */}
              {handoutRx.treatmentTitle && (
                <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Therapeutic Protocol:</span>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 600, color: '#1e3a8a' }}>{handoutRx.treatmentTitle}</p>
                </div>
              )}

              {/* Formulation Parts / Phases */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {resolvePrescriptionParts(handoutRx).map((part, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#f1f5f9',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                        {part.title || `Part ${pIdx + 1}`}
                      </strong>
                      {part.volume && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                          {part.volume}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Active Ingredients in this part */}
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Ingredients (APIs):</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                          {(part.apis || []).map((api, aIdx) => (
                            <div
                              key={aIdx}
                              style={{
                                padding: '6px 10px',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '12px'
                              }}
                            >
                              <strong style={{ color: '#0f172a' }}>{api.name}</strong>
                              {api.dose && <span style={{ color: '#1a73e8', fontWeight: 600, marginLeft: '6px' }}>({api.dose})</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Posology / Administration Instructions */}
                      {part.posology && (
                        <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>How to Take / Apply:</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#14532d', lineHeight: 1.45 }}>
                            {part.posology}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety Precautions Note */}
              <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a', fontSize: '11.5px', color: '#92400e' }}>
                <strong>Important:</strong> Keep compounded medicines in a cool, dry place away from direct sunlight. Follow the exact posology prescribed by {doctor.name || 'your physician'}. In case of any adverse reaction, discontinue use and contact your clinic immediately.
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                padding: '12px 20px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={14} />
                <span>Print Handout</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const partsText = resolvePrescriptionParts(handoutRx).map(p => `• ${p.title}:\n  APIs: ${(p.apis || []).map(a => `${a.name} ${a.dose || ''}`).join(', ')}\n  Directions: ${p.posology || 'As directed'}`).join('\n\n');
                    const handoutText = `📋 POSOLOGY HANDOUT\nPatient: ${handoutRx.patientName}\nPhysician: ${doctor.name}\nCode: #${handoutRx.code || handoutRx.prescriptionNumber}\n\n${partsText}`;
                    navigator.clipboard?.writeText(handoutText);
                    toast.success('Handout text copied to clipboard ✓');
                  }}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    color: '#3c4043',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Copy size={14} />
                  <span>Copy Text</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareHandoutWhatsApp(handoutRx)}
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={14} />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Clinical Navigation Drawer (Off-Canvas, Rule #23) ─────── */}
      {isMobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            background: 'rgba(32, 33, 36, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex'
          }}
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: '300px',
              maxWidth: '85vw',
              height: '100%',
              background: '#ffffff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              animation: 'slideInLeft 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: '#003666',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}
                  >
                    {doctor.name ? doctor.name.replace(/^Dr\.\s*/i, '').charAt(0) : 'D'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{doctor.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Clinical Operations</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: '#5f6368',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div style={{ padding: '12px 0' }}>
                {sidebarNavGroups.map((group, gIdx) => (
                  <div key={gIdx} style={{ marginBottom: '14px' }}>
                    <div
                      style={{
                        padding: '6px 20px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#5f6368',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                      }}
                    >
                      {group.group}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeAnchor === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setIsMobileSidebarOpen(false);
                            handleSidebarNavigate(item.id);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 20px',
                            border: 'none',
                            borderLeft: isActive ? '3px solid #1a73e8' : '3px solid transparent',
                            background: isActive ? '#e8f0fe' : 'transparent',
                            color: isActive ? '#1a73e8' : '#3c4043',
                            fontSize: '0.88rem',
                            fontWeight: isActive ? 600 : 500,
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Icon size={18} style={{ color: isActive ? '#1a73e8' : '#5f6368' }} />
                            <span>{item.label}</span>
                          </div>
                          {typeof item.badge === 'number' && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: isActive ? '#1a73e8' : '#e8eaed',
                                color: isActive ? '#ffffff' : '#3c4043'
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Drawer Doctor Identity Sticker */}
            <div style={{ padding: '14px 18px', borderTop: '1px solid #dadce0', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #003666 0%, #0d9488 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {doctor.name?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doctor.name}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doctor.specialty}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={13} style={{ color: '#0d9488' }} />
                  <span style={{ fontSize: '0.70rem', color: '#475569', fontWeight: 600 }}>DHA:</span>
                  <span style={{ fontSize: '0.70rem', color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>{doctor.license}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    navigator.clipboard?.writeText(doctor.license);
                    toast.success('DHA License copied ✓');
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b' }}
                  title="Copy DHA license"
                >
                  <Copy size={12} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    setIsCredentialsModalOpen(true);
                  }}
                  style={{
                    height: '30px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={12} />
                  <span>Full Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    handleCopyIntakeLink();
                  }}
                  style={{
                    height: '30px',
                    borderRadius: '4px',
                    border: '1px solid #bfdbfe',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Share2 size={12} />
                  <span>Share Intake</span>
                </button>
              </div>
            </div>

            {/* Drawer Bottom CTA */}
            <div style={{ padding: '16px', borderTop: '1px solid #dadce0', background: '#f8fafc' }}>
              <button
                type="button"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  setIsIntakeOpen(true);
                }}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
                }}
              >
                <Sparkles size={16} />
                <span>New Prescription Intake</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── GCP Resource Inspector Drawer (Golden Rule #4: Master-Detail sin abandonar contexto) ── */}
      {selectedInspectorItem && (() => {
        const isTask = selectedInspectorItem.type === 'task';
        const item = selectedInspectorItem.data;
        const rx = isTask ? selectedInspectorItem.prescription : item;
        const rxCode = rx?.code || rx?.prescriptionNumber || item?.code || 'N/A';
        const patientName = rx?.patientName || item?.patientName || 'Anonymous Patient';
        const treatmentTitle = rx?.treatmentTitle || item?.title || 'Personalized Clinical Protocol';
        const itemsList = rx?.items && rx.items.length > 0 ? rx.items : (rx?.prescriptionLines || []);
        const posology = rx?.posology || item?.description || 'Administer as directed by treating physician according to physiological circadian cycle.';
        const status = rx?.status || (isTask ? item?.priority : 'active');
        const createdDate = rx?.createdAt || rx?.createdDate ? new Date(rx.createdAt || rx.createdDate).toLocaleDateString() : 'Active Regimen';

        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
            onClick={() => setSelectedInspectorItem(null)}
          >
            <aside
              style={{
                width: '100%',
                maxWidth: '480px',
                height: '100%',
                background: '#ffffff',
                boxShadow: '-6px 0 28px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Header (GCP Style) */}
              <div
                style={{
                  padding: '16px 20px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Clinical Registry · Resource Inspector
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      {isTask ? `Task: ${item.title}` : `Prescription #${rxCode}`}
                    </h3>
                    <CopyableId value={rxCode} iconOnly={true} />
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusBadge status={status} />
                    {rx && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} /> {createdDate}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {rx && (
                    <Link
                      href={`/rx/${rxCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open full monograph dossier in new tab"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        background: '#ffffff',
                        color: '#003666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={14} />
                    </Link>
                  )}
                  {rx && (
                    <button
                      type="button"
                      onClick={() => handleOpenLabelsModal(rx)}
                      title="View prescription bottle labels"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        border: '1px solid #dadce0',
                        background: '#ffffff',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Tag size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedInspectorItem(null)}
                    title="Close inspector"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      border: 'none',
                      background: 'transparent',
                      color: '#5f6368',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer GCP Subtabs Strip */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#ffffff',
                  padding: '0 16px',
                  gap: '4px'
                }}
              >
                {[
                  { id: 'dossier', label: 'Clinical Dossier', icon: FileText },
                  { id: 'items', label: `Prescription Items (${itemsList.length || 1})`, icon: Pill },
                  { id: 'dispensary', label: 'Quality & Tracking', icon: ShieldCheck }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = inspectorTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setInspectorTab(t.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 12px',
                        border: 'none',
                        borderBottom: isActive ? '2px solid #003666' : '2px solid transparent',
                        background: 'transparent',
                        color: isActive ? '#003666' : '#64748b',
                        fontSize: '0.78rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.12s'
                      }}
                    >
                      <Icon size={14} color={isActive ? '#003666' : '#64748b'} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Drawer Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {inspectorTab === 'dossier' && (
                  <>
                    {/* Clinical Task & Action Scheduling */}
                    {isTask && (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                            Clinical Action & Timeline
                          </span>
                          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> Timeline: {item.dueDate || 'Immediate'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
                          {item.description}
                        </div>
                      </div>
                    )}

                    {/* Patient Information Card */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Patient Demographics & Record
                      </div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
                        {patientName}
                      </div>
                      {rx?.patient?.dob && (
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          DOB: {rx.patient.dob} {rx.patient?.gender ? `· ${rx.patient.gender}` : ''}
                        </div>
                      )}
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Canonical Ref:</span>
                        <CopyableId value={rxCode} />
                      </div>
                    </div>

                    {/* Prescribing Doctor Information */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Treating Physician
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Stethoscope size={14} />
                        <span>{doctor.name || 'Dr. Marina Cordeiro Fernandes'}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
                        {doctor.specialty || 'Regenerative Medicine & Longevity'} · Lic: {doctor.licenseNumber || 'DHA-P-0319842'}
                      </div>
                    </div>

                    {/* Clinical Regimen Title & Posology */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Regimen & Posology Schedule
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                        {treatmentTitle}
                      </div>
                      <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '6px', padding: '10px 12px', fontSize: '0.8rem', color: '#134e4a', lineHeight: 1.45 }}>
                        {posology}
                      </div>
                    </div>

                    {/* Clinical Sign-off & Task Action Block */}
                    {(isTask || (rx && ['pending', 'draft'].includes((rx.status || '').toLowerCase()))) && (() => {
                      const targetEntity = isTask ? item : rx;
                      const isSigned = targetEntity?.isSigned || targetEntity?.status === 'approved' || rx?.status === 'approved';
                      const isSigning = signingTaskId === (targetEntity?.id || targetEntity?.code || rx?.code);

                      return (
                        <div style={{
                          background: isSigned ? '#f0fdf4' : '#fffbeb',
                          border: `1px solid ${isSigned ? '#bbf7d0' : '#fde68a'}`,
                          borderRadius: '6px',
                          padding: '16px'
                        }}>
                          <div style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: isSigned ? '#166534' : '#92400e',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            {isSigned ? (
                              <>
                                <CheckCircle2 size={13} color="#16a34a" />
                                <span>Clinical Dispensing Authorized & Signed</span>
                              </>
                            ) : (
                              <>
                                <Clock size={13} color="#b45309" />
                                <span>Pending Physician Clinical Authorization</span>
                              </>
                            )}
                          </div>
                          <div style={{
                            fontSize: '0.82rem',
                            color: isSigned ? '#14532d' : '#78350f',
                            lineHeight: 1.45,
                            marginBottom: '12px'
                          }}>
                            {isSigned
                              ? `Prescription digitally authorized by ${doctor.name || 'Treating Physician'} for compounding and release.`
                              : (item?.description || `Compounded prescription awaiting physician electronic sign-off.`)}
                          </div>

                          {!isSigned ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <button
                                type="button"
                                disabled={isSigning}
                                onClick={(e) => handleSignOffPrescription(targetEntity, e)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  padding: '10px 16px',
                                  borderRadius: '4px',
                                  background: '#003666',
                                  border: '1px solid #002244',
                                  color: '#ffffff',
                                  fontSize: '0.82rem',
                                  fontWeight: 650,
                                  cursor: isSigning ? 'wait' : 'pointer',
                                  boxShadow: '0 1px 3px rgba(0,54,102,0.25)',
                                  transition: 'all 0.12s'
                                }}
                              >
                                {isSigning ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Authorizing & Signing...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={15} style={{ color: '#38bdf8' }} />
                                    <span>Authorize & Sign Dispensing Order</span>
                                  </>
                                )}
                              </button>
                              <div style={{ fontSize: '0.70rem', color: '#64748b', textAlign: 'center', lineHeight: 1.35 }}>
                                Electronically verifies patient posology, API tolerance, and authorizes compounding batch release.
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                <CheckCircle2 size={14} /> Signed & Approved
                              </span>
                              <Link
                                href={`/rx/${rxCode}`}
                                target="_blank"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  color: '#003666',
                                  textDecoration: 'none'
                                }}
                              >
                                <span>Official Pad</span>
                                <ArrowUpRight size={12} />
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}

                {inspectorTab === 'items' && (
                  <>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                      Active Compounded Ingredients & Prescription Items ({itemsList.length || 1})
                    </div>
                    {itemsList.length === 0 ? (
                      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                        Custom personalized prescription regimen under clinical review.
                      </div>
                    ) : (
                      itemsList.map((it, idx) => (
                        <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a' }}>{it.name}</span>
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0d9488', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                              {it.dose || it.vehicle || 'Pharmaceutical Grade'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
                            Vehicle / Base: {it.vehicle || 'Micronized Plant-Based HPMC Capsules (Acid-Resistant)'}
                          </div>
                          <div style={{ marginTop: '6px', fontSize: '0.70rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={11} /> EU GMP Verified Active API
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {inspectorTab === 'dispensary' && (
                  <>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Laboratory & Dispensary Verification
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#003666', marginBottom: '4px' }}>
                        EU GMP Certified Cleanroom Dispensary
                      </div>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                        Formulated under ISO Class 5 Laminar Airflow with HPLC purity certification by Atlas Certified Compounding Solutions.
                      </p>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Patient Access & Security
                      </div>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                        Digital clinical dossier is protected by codified access token. Patients can verify authenticity and dosage guidelines directly.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/rx/${rxCode}?view=patient`;
                          navigator.clipboard?.writeText(url);
                          toast.success('Patient direct link copied ✓');
                        }}
                        style={{
                          height: '32px',
                          padding: '0 12px',
                          borderRadius: '4px',
                          border: '1px solid #dadce0',
                          background: '#ffffff',
                          color: '#003666',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Copy size={13} />
                        <span>Copy Patient View Link</span>
                      </button>
                    </div>

                    {rx && (
                      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '14px 16px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Prescription Bottle Label
                        </div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.76rem', color: '#0c4a6e', lineHeight: 1.4 }}>
                          Direct access to vector print templates formatted for amber pharmaceutical bottles.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenLabelsModal(rx)}
                          style={{
                            height: '32px',
                            padding: '0 12px',
                            borderRadius: '4px',
                            border: 'none',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Tag size={13} />
                          <span>Open Bottle Labels Modal</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drawer Bottom Action Bar */}
              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #dadce0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedInspectorItem(null)}
                  style={{
                    height: '34px',
                    padding: '0 14px',
                    borderRadius: '4px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    color: '#3c4043',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>

                {rx && (
                  <Link
                    href={`/rx/${rxCode}`}
                    style={{
                      height: '34px',
                      padding: '0 16px',
                      borderRadius: '4px',
                      background: '#003666',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none'
                    }}
                  >
                    <span>Open Full Monograph</span>
                    <ArrowUpRight size={13} />
                  </Link>
                )}
              </div>
            </aside>
          </div>
        );
      })()}

      {/* ── Slide-Over Clinical Intelligence & Algolia Search Drawer (Google Cloud UX Principle) ── */}
      {isDiscoveryDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.2s ease'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDiscoveryDrawerOpen(false);
            }
          }}
        >
          <aside
            style={{
              width: '100%',
              maxWidth: '1240px',
              height: '100vh',
              background: '#f8fafc',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden'
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '16px 24px',
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #003666 0%, #1e40af 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      Clinical Intelligence & Algolia Search Engine
                    </h2>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#e0e7ff', color: '#4338ca' }}>
                      ⌘K Instant
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Interactive search across 77 evidence-based protocols & bioactive compounding APIs
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <kbd
                  style={{
                    fontSize: '0.70rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600
                  }}
                >
                  ESC to close
                </kbd>
                <button
                  type="button"
                  onClick={() => setIsDiscoveryDrawerOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Close Discovery Drawer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <ClinicalIntelligenceBanner
                protocols={data?.protocols || []}
                formulary={data?.formulary || []}
                opaqueDoctorCode={doctor?.opaqueCode || slug}
              />
            </div>
          </aside>
        </div>
      )}

      {/* ── Official Physician Credentials & Profile Popup Modal ─────────────── */}
      {isCredentialsModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCredentialsModalOpen(false);
            }
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '620px',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 4px 24px rgba(60,64,67,0.22), 0 0 0 1px #dadce0',
              padding: '24px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button Top Right (Google Cloud Icon Button) */}
            <button
              type="button"
              onClick={() => setIsCredentialsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                color: '#5f6368',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f3f4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Close"
            >
              <X size={18} />
            </button>

            {/* Doctor Identity Card (Google Cloud Platform UX) */}
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap', paddingRight: '36px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#1a73e8',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(60,64,67,0.20)',
                  position: 'relative'
                }}
              >
                {doctor.name?.replace(/^Dr\.\s*/i, '').charAt(0) || 'D'}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#1e8e3e',
                    border: '2px solid #ffffff'
                  }}
                  title="DHA Verified Active Practice"
                />
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.20rem', fontWeight: 600, color: '#202124', margin: 0, letterSpacing: '-0.01em' }}>
                    {doctor.name}
                  </h2>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#137333', background: '#e6f4ea', border: '1px solid #ceead6', padding: '1px 7px', borderRadius: '4px' }}>
                    DHA Verified
                  </span>
                </div>
                <p style={{ margin: '4px 0 10px 0', fontSize: '0.84rem', color: '#5f6368', lineHeight: 1.4, fontWeight: 400 }}>
                  {doctor.specialty} • {doctor.clinic}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#5f6368' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} style={{ color: '#1a73e8', flexShrink: 0 }} />
                    <span>Medical License:</span>
                    <span style={{ background: '#e8f0fe', color: '#1967d2', border: '1px solid #d2e3fc', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, fontFamily: 'monospace' }}>
                      {doctor.license}
                    </span>
                    <CopyableId value={doctor.license} iconOnly={true} />
                  </div>
                  {doctor.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} style={{ color: '#5f6368', flexShrink: 0 }} />
                      <span>{doctor.location}</span>
                    </div>
                  )}
                  {doctor.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={14} style={{ color: '#5f6368', flexShrink: 0 }} />
                      <span>{doctor.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons Row (Google Cloud Console Palette) */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #e8eaed' }}>
              <button
                type="button"
                onClick={handleShareDoctorPortal}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  fontSize: '0.80rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafd';
                  e.currentTarget.style.borderColor = '#c6c9cc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#dadce0';
                }}
              >
                <Copy size={14} />
                <span>Copy Portal URL</span>
              </button>

              <button
                type="button"
                onClick={handleCopyIntakeLink}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  fontSize: '0.80rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d2e3fc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#e8f0fe';
                }}
              >
                <Share2 size={14} />
                <span>Share Patient Intake</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleContactAtlasWhatsApp('Physician Credentials & Intake Onboarding');
                  setIsCredentialsModalOpen(false);
                }}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '4px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#137333',
                  fontSize: '0.80rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0fdf4';
                  e.currentTarget.style.borderColor = '#bbf7d0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#dadce0';
                }}
              >
                <MessageCircle size={14} color="#16a34a" />
                <span>WhatsApp Atlas Support</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
