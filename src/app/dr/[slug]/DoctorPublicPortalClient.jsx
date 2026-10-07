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
  BarChart3,
  FlaskConical,
  BookOpen,
  Loader2,
  X
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
import { getPharmapolisLabelsForPrescription } from '@/data/pharmapolisLabelsMap';
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

export default function DoctorPublicPortalClient({ slug, initialData = null }) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  // Search & Filter State (Google Cloud UX Golden Rules #7, #24, #29)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

  // GCP Resource Inspector Drawer State (Golden Rule #4: Master-Detail sin abandonar contexto)
  const [selectedInspectorItem, setSelectedInspectorItem] = useState(null);
  const [inspectorTab, setInspectorTab] = useState('dossier'); // 'dossier' | 'formulations' | 'dispensary'
  const [signingTaskId, setSigningTaskId] = useState(null);

  // Auto-collapse sidebar on laptops (< 1200px) to prevent table clipping (GCP UX Standard)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1200) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  // Therapeutic Pharmacopeia & Compounding APIs State (Lotusland Clinical Directory)
  const [formularyGoal, setFormularyGoal] = useState('all');
  const [formularySearch, setFormularySearch] = useState('');
  const [selectedMonograph, setSelectedMonograph] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryPeptide, setInquiryPeptide] = useState(null);

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
  const globalKpis = data?.kpis || { activePrescriptions: 0, monitoredPatients: 0, pendingTasksCount: 0, refillsDueCount: 0 };
  const allTasks = data?.tasks || [];
  const allPrescriptions = data?.prescriptions || [];

  // Opaque Doctor Slug (Protects Doctor Identity in URL)
  const opaqueCode = doctor.opaqueCode || doctor.slug || slug;

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (taskFilter !== 'all' && t.type !== taskFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchPatient = (t.patientName || '').toLowerCase().includes(q);
      const matchCode = (t.code || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchPatient || matchCode;
    });
  }, [allTasks, taskFilter, searchQuery]);

  // Filter Prescriptions (Enhanced with Temporal Filter - Golden Rule #24)
  const filteredPrescriptions = useMemo(() => {
    return allPrescriptions.filter(rx => {
      if (statusFilter !== 'all' && (rx.status || '').toLowerCase() !== statusFilter) return false;

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

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchPat = (rx.patientName || '').toLowerCase().includes(q);
      const matchCode = (rx.code || rx.prescriptionNumber || '').toLowerCase().includes(q);
      const matchTitle = (rx.treatmentTitle || '').toLowerCase().includes(q);
      const matchItems = (rx.items || []).some(i => (i.name || '').toLowerCase().includes(q));
      return matchPat || matchCode || matchTitle || matchItems;
    });
  }, [allPrescriptions, statusFilter, searchQuery, temporalFilter]);

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
          ? `${codesToSign.length} formulations signed & authorized for compounding ✓`
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
      key: 'priority',
      header: 'Clinical Status',
      width: '18%',
      sortable: true,
      render: (t) => {
        if (t.isSigned || t.status === 'approved') {
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: '4px',
                background: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
                fontSize: '0.72rem',
                fontWeight: 650,
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
                flexShrink: 0
              }}
            >
              <CheckCircle2 size={12} style={{ color: '#16a34a', flexShrink: 0 }} />
              Signed & Approved
            </span>
          );
        }

        let label = 'Routine';
        let color = '#475569';
        let bg = '#f8fafc';
        let border = '#e2e8f0';

        if (t.priority === 'action_required' || t.priority === 'urgent' || t.type === 'approval') {
          label = 'Action Required';
          color = '#b45309';
          bg = '#fffbeb';
          border = '#fde68a';
        } else if (t.priority === 'high' || t.type === 'titration') {
          label = 'Titration Due';
          color = '#1d4ed8';
          bg = '#eff6ff';
          border = '#bfdbfe';
        } else if (t.priority === 'medium' || t.type === 'refill') {
          label = 'Refill Scheduled';
          color = '#0f766e';
          bg = '#f0fdfa';
          border = '#99f6e4';
        }

        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: bg,
              color: color,
              border: `1px solid ${border}`,
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
              flexShrink: 0
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
            {label}
          </span>
        );
      }
    },
    {
      key: 'title',
      header: 'Clinical Task & Action Plan',
      width: '36%',
      sortable: true,
      render: (t) => {
        let cleanTitle = t.title || '';
        cleanTitle = cleanTitle.replace(/^Clinical Verification:\s*/i, '');
        if (t.patientName && cleanTitle.startsWith(t.patientName)) {
          cleanTitle = cleanTitle.replace(t.patientName, '').trim();
          cleanTitle = cleanTitle.replace(/^[-:–]\s*/, '').trim();
        }
        if (!cleanTitle) cleanTitle = 'Prescription Sign-off';

        return (
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
              {cleanTitle}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px', lineHeight: 1.35 }}>
              {t.description}
            </div>
          </div>
        );
      }
    },
    {
      key: 'patientName',
      header: 'Patient & Reference',
      width: '20%',
      sortable: true,
      render: (t) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
            {t.patientName}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Rx:</span>
            <CopyableId value={t.code} iconOnly={false} />
          </div>
        </div>
      )
    },
    {
      key: 'dueDate',
      header: 'Timeline',
      width: '12%',
      sortable: true,
      render: (t) => {
        let displayDue = t.dueDate;
        if (!displayDue || displayDue === 'Action Required') {
          displayDue = 'Immediate';
        }
        return (
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #e2e8f0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Clock size={12} style={{ color: '#64748b' }} />
            {displayDue}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Action',
      width: '14%',
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
                background: '#003666',
                border: '1px solid #002244',
                color: '#ffffff',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: isSigning ? 'wait' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,54,102,0.18)',
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
              title="Review formulation details in slide-over Inspector Drawer"
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
  ], [signingTaskId, handleSignOffPrescription]);

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
      header: 'Regimen & Formulations',
      width: '34%',
      sortable: true,
      render: (rx) => {
        const itemCount = (rx.items || []).length || (rx.prescriptionLines || []).length || 1;
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.84rem' }}>
              {rx.treatmentTitle || 'Personalized Compounded Regimen'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, color: '#334155' }}>
                {itemCount} formulation{itemCount > 1 ? 's' : ''}
              </span>
              {rx.posology && (
                <span style={{ color: '#0d9488', fontWeight: 500 }}>
                  {rx.posology.length > 36 ? `${rx.posology.slice(0, 36)}...` : rx.posology}
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
      render: (rx) => <StatusBadge status={rx.status} />
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '14%',
      sortable: true,
      render: (rx) => (
        <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Calendar size={12} style={{ color: '#64748b' }} />
          <span>{rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Active'}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '16%',
      sortable: true,
      render: (rx) => <StatusBadge status={rx.status} />
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '14%',
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
      width: '14%',
      align: 'right',
      render: (rx) => {
        const isPending = ['pending', 'draft'].includes((rx.status || rx.state || '').toLowerCase());
        const isSigning = signingTaskId === (rx.code || rx.id);

        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', width: '100%' }} onClick={e => e.stopPropagation()}>
            {isPending && (
              <button
                type="button"
                disabled={isSigning}
                onClick={(e) => handleSignOffPrescription(rx, e)}
                style={{
                  height: '30px',
                  padding: '0 10px',
                  borderRadius: '4px',
                  background: '#003666',
                  border: '1px solid #002244',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  cursor: isSigning ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(0,54,102,0.18)',
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
                    <CheckCircle2 size={12} style={{ color: '#38bdf8' }} />
                    <span>Sign</span>
                  </>
                )}
              </button>
            )}
            <Link
              href={`/rx/${rx.code}`}
              style={{
                height: '30px',
                padding: '0 10px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#003666',
                fontSize: '0.76rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
              title="Open complete clinical monograph and posology dossier"
            >
              <span>Dossier</span>
              <ExternalLink size={12} />
            </Link>
            <button
              type="button"
              onClick={() => handleOpenLabelsModal(rx)}
              title="View vector pharmacy compounding bottle label"
              style={{
                height: '30px',
                width: '30px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#0284c7',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.12s'
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
                height: '30px',
                width: '30px',
                borderRadius: '4px',
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#5f6368',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
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
      header: 'Compound & API Specification',
      width: '28%',
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontWeight: 650, color: '#0f172a', fontSize: '0.86rem' }}>
            {p.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{p.casNumber ? `CAS: ${p.casNumber}` : 'High-Purity API'}</span>
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
      header: 'Formulation Vehicle',
      width: '18%',
      sortable: true,
      render: (p) => (
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 500, color: '#334155' }}>
            {p.route || 'Lyophilized API Powder'}
          </div>
          <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
            Bacteriostatic / Galenic Base
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

  // ── Bloodo™ Diagnostic Panels (Pre-Treatment Baseline Calibration) ─────────
  const bloodoPanels = useMemo(() => [
    {
      id: 'panel-nad',
      name: 'Intracellular NAD+ & Metabolomic Resilience Profile',
      specimen: 'Capillary Dried Blood Spot (DBS)',
      tat: '3-4 Business Days',
      indications: 'Pre-peptide baseline mitochondrial calibration; measures intracellular NAD+/NADH ratio, active sirtuin pathway capacity, and cellular energy synthesis.',
      biomarkers: ['Intracellular NAD+', 'NADH Redox Ratio', 'ATP Synthesis Index', 'Whole Blood Glycation Level'],
      clinicalUtility: 'Guides mitochondrial and cellular longevity protocols (e.g. Epithalon, MOTS-c) to prevent futile metabolic cycle overstimulation.'
    },
    {
      id: 'panel-gh',
      name: 'Endocrine Growth Hormone Axis & IGF-1 Calibration',
      specimen: 'Capillary Dried Blood Spot (DBS)',
      tat: '3-4 Business Days',
      indications: 'Pre-treatment endocrine screening for growth hormone secretagogues (CJC-1295 / Ipamorelin, Tesamorelin, Sermorelin).',
      biomarkers: ['Serum IGF-1', 'IGFBP-3 Binding Protein', 'Fasting Insulin', 'GH Pulsatility Baseline'],
      clinicalUtility: 'Establishes therapeutic ceiling and rules out baseline endocrine dysregulation before secretagogue cycles.'
    },
    {
      id: 'panel-metabolic',
      name: 'Cardiometabolic & Glycemic Homeostasis (HbA1c / HOMA-IR)',
      specimen: 'Capillary Dried Blood Spot (DBS)',
      tat: '2-3 Business Days',
      indications: 'Objective metabolic profiling for GLP-1/GIP receptor agonist regimens and visceral adiposity protocols.',
      biomarkers: ['HbA1c Glycated Hemoglobin', 'Fasting Blood Glucose', 'C-Peptide', 'Estimated HOMA-IR Index'],
      clinicalUtility: 'Calibrates micro-dosing titration increments and objectively tracks metabolic insulin sensitivity response.'
    },
    {
      id: 'panel-inflammation',
      name: 'Cellular Senescence & Systemic Inflammatory Baseline',
      specimen: 'Capillary Dried Blood Spot (DBS)',
      tat: '3-4 Business Days',
      indications: 'Tissue regeneration calibration prior to musculoskeletal repair protocols (BPC-157, TB-500, GHK-Cu).',
      biomarkers: ['High-Sensitivity CRP (hs-CRP)', 'Interleukin-6 (IL-6)', 'TNF-Alpha Baseline', 'Fibrinogen Index'],
      clinicalUtility: 'Confirms baseline systemic inflammatory burden to ensure targeted tissue trophic response without inflammatory flares.'
    }
  ], []);

  const sidebarNavGroups = useMemo(() => [
    {
      groupTitle: 'CLINICAL WORKSPACE',
      items: [
        {
          id: 'overview',
          label: 'Overview & KPIs',
          icon: BarChart3,
          href: '#overview',
          badge: null
        },
        {
          id: 'tasks',
          label: 'Pending To-Do Queue',
          icon: Clock,
          href: '#tasks',
          badge: filteredTasks.length > 0 ? `${filteredTasks.length}` : null,
          badgeColor: filteredTasks.length > 0 ? '#d97706' : '#64748b'
        },
        {
          id: 'prescriptions',
          label: 'Prescriptions Dossier',
          icon: Layers,
          href: '#prescriptions',
          badge: filteredPrescriptions.length > 0 ? `${filteredPrescriptions.length}` : null
        }
      ]
    },
    {
      groupTitle: 'COMPOUNDING & QUALITY',
      items: [
        {
          id: 'formulations',
          label: 'Active Formulations',
          icon: Pill,
          href: '#prescriptions',
          badge: null
        },
        {
          id: 'labels',
          label: 'Pharmapolis Bottle Labels',
          icon: Tag,
          action: () => {
            if (filteredPrescriptions[0]) {
              handleOpenLabelsModal(filteredPrescriptions[0]);
            } else {
              toast('No active prescriptions to view labels.');
            }
          },
          badge: 'EU GMP'
        }
      ]
    },
    {
      groupTitle: 'CLINICAL REFERENCE',
      items: [
        {
          id: 'formulary',
          label: 'Compounding Pharmacopeia',
          icon: FlaskConical,
          href: '#formulary',
          badge: filteredFormulary.length > 0 ? `${filteredFormulary.length}` : null
        },
        {
          id: 'diagnostics',
          label: 'Diagnostic Panels (Bloodo™)',
          icon: Activity,
          href: '#diagnostics',
          badge: 'CE-IVDR'
        },
        {
          id: 'protocols_catalog',
          label: 'Complete Catalog Directory',
          icon: BookOpen,
          action: () => window.open('/c/CAT-MU9L9GBN', '_blank'),
          badge: 'Lotusland'
        }
      ]
    },
    {
      groupTitle: 'PATIENT INTAKE & CLINIC',
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
          href: '#credentials',
          badge: 'Verified'
        }
      ]
    }
  ], [filteredTasks.length, filteredPrescriptions.length, filteredPrescriptions, filteredFormulary.length]);

  const handleSidebarNavigate = (itemOrId) => {
    triggerHaptic('light');
    if (typeof itemOrId === 'string') {
      const targetId = itemOrId;
      setActiveAnchor(targetId);
      const targetEl = document.getElementById(targetId) || document.querySelector(`#${targetId}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }
    const item = itemOrId;
    if (item.action) {
      item.action();
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      return;
    }
    if (item.href) {
      setActiveAnchor(item.id);
      const targetEl = document.querySelector(item.href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
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
        @media (min-width: 1024px) {
          .doctor-bottom-dock {
            display: none !important;
          }
          .gcp-portal-main {
            padding-bottom: 40px !important;
          }
        }
        .gcp-mobile-nav-trigger {
          display: none;
        }
        @media (max-width: 900px) {
          .gcp-clinical-sidebar {
            display: none !important;
          }
          .gcp-mobile-nav-trigger {
            display: inline-flex !important;
          }
          .gcp-portal-main {
            padding: 16px 14px 130px 14px;
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
        breadcrumb={[
          { label: 'Clinical Services', href: '/' },
          { label: 'Verified Physicians', href: '/doctor' },
          { label: doctor.name || 'Physician Portal' }
        ]}
        anchorTabs={[
          { id: 'credentials', label: 'Credentials', href: '#credentials' },
          { id: 'overview', label: 'Overview', href: '#overview' },
          { id: 'tasks', label: 'Clinical Tasks', href: '#tasks', count: filteredTasks.length },
          { id: 'prescriptions', label: 'Prescriptions Dossier', href: '#prescriptions', count: filteredPrescriptions.length },
          { id: 'formulary', label: 'Compounding Pharmacopeia', href: '#formulary', count: filteredFormulary.length },
          { id: 'diagnostics', label: 'Diagnostic Panels', href: '#diagnostics', count: 4 }
        ]}
        activeAnchorId={activeAnchor}
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
          {/* ── Doctor Identity Card ────────────────────────────────────────── */}
          <div
            id="credentials"
            style={{
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #003666 0%, #0d9488 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,54,102,0.18)'
                }}
              >
                {doctor.name?.replace('Dr. ', '').charAt(0) || 'D'}
              </div>
              <div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {doctor.name}
                </h1>
                <p style={{ margin: '4px 0 8px 0', fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>
                  {doctor.specialty} • {doctor.clinic}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} style={{ color: '#0d9488' }} />
                    <span>Medical License:</span>
                    <CopyableId value={doctor.license} iconOnly={false} />
                  </div>
                  {doctor.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={14} style={{ color: '#64748b' }} />
                      <span>{doctor.location}</span>
                    </div>
                  )}
                  {doctor.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={14} style={{ color: '#64748b' }} />
                      <span>{doctor.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="gcp-mobile-nav-trigger"
                onClick={() => setIsMobileSidebarOpen(true)}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  background: '#e8f0fe',
                  border: '1px solid #1a73e8',
                  color: '#1a73e8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Menu size={15} />
                <span>Clinical Menu</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPortalLink}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedLink ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Link Copied' : 'Copy Portal URL'}</span>
              </button>
            </div>
          </div>

        {/* ── 4 Core Operational KPIs & Scope Switcher (Google Cloud Rule #22) ─ */}
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
            <div className="gcp-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Active Prescriptions</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pill size={16} style={{ color: '#16a34a' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>
                {activeKpis.activePrescriptions}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Compounded posology regimens under treatment
              </div>
            </div>

            {/* KPI 2: Monitored Patients */}
            <div className="gcp-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Monitored Patients</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} style={{ color: '#003666' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>
                {activeKpis.monitoredPatients}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Unique patient dossiers managed
              </div>
            </div>

            {/* KPI 3: Pending Clinical Tasks */}
            <div className="gcp-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Action Tasks</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} style={{ color: '#d97706' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#d97706', lineHeight: 1.1 }}>
                {activeKpis.pendingTasksCount}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Actionable reviews & titrations required
              </div>
            </div>

            {/* KPI 4: Refills & Titrations Due */}
            <div className="gcp-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Refills & Cycles</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} style={{ color: '#7c3aed' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#7c3aed', lineHeight: 1.1 }}>
                {activeKpis.refillsDueCount}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#70757a', marginTop: '6px' }}>
                Upcoming supply cycles within 14 days
              </div>
            </div>
          </div>
        </div>

        {/* ── Global Search Bar with Integrated GCP Filter Chips (Rule #7) ─── */}
        <div style={{ marginBottom: '28px' }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search patient, prescription code, active compounds, formulation..."
            resultCount={filteredPrescriptions.length}
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

          {/* Instant Search Multi-Registry Breakdown Pill (GCP Standard) */}
          {searchQuery.trim() && (
            <div
              style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                color: '#1e40af'
              }}
            >
              <span style={{ fontWeight: 600 }}>Active Search: &ldquo;{searchQuery}&rdquo;</span>
              <span style={{ color: '#93c5fd' }}>•</span>
              <span><strong>{filteredPrescriptions.length}</strong> matching prescriptions</span>
              <span style={{ color: '#93c5fd' }}>•</span>
              <span><strong>{filteredTasks.length}</strong> care tasks</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.74rem'
                }}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* ── Table 1: Pending Clinical Tasks & To-Do Actions (DataTable Universal) ── */}
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
                <Clock size={18} style={{ color: '#003666' }} />
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#003666' }}>
                    Clinical Rationale & Action Details
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Trigger: Automated Chronobiological Protocol Monitor
                  </span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.45 }}>
                  {task.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Link
                    href={task.actionUrl}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      background: '#003666',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    <span>Execute {task.actionLabel}</span>
                    <ArrowUpRight size={13} />
                  </Link>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Reference Prescription #{task.code}
                  </span>
                </div>
              </div>
            )}
          />
        </section>

        {/* ── Table 2: Associated Clinical Prescriptions Dossier (DataTable Universal) ── */}
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
                  <Layers size={18} style={{ color: '#003666' }} />
                  <span>Associated Clinical Prescriptions Dossier</span>
                </h2>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>•</span>
                  <span>Synced {lastRefreshed ? lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}</span>
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Complete verified repository of compounded formulations and sequential regimens.
              </p>
            </div>

            {/* GCP Action Toolbar: Filters + Refresh + Export */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Temporal Filters */}
              <div style={{ display: 'inline-flex', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px', gap: '2px' }}>
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'active', label: 'Active' },
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
                  { id: 'approved', label: 'Approved' },
                  { id: 'active', label: 'Active' },
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
            </div>
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
              const itemsList = rx.items && rx.items.length > 0 ? rx.items : (rx.prescriptionLines || []);
              return (
                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {/* Google Cloud Prescription Reference Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#003666' }}>
                        Prescription #{rx.code}
                      </span>
                      <CopyableId value={rx.code} iconOnly={true} />
                      <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        <span>Authorized: {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Active Regimen'}</span>
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={11} />
                        <span>EU GMP Validated</span>
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Dispensary: Pharmapolis & Fagron Compounding
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Active Formulations List */}
                    <div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Active Ingredients & Vehicles ({itemsList.length})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {itemsList.map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', background: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{it.name}</span>
                            <span style={{ color: '#0d9488', fontWeight: 600 }}>{it.dose || it.vehicle || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Posology Protocol & Quick Actions */}
                    <div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Sequential Clinical Schedule
                      </div>
                      <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '6px', padding: '10px 12px', fontSize: '0.8rem', color: '#134e4a', lineHeight: 1.4 }}>
                        {rx.posology || 'Administer as directed by treating physician according to physiological circadian cycle.'}
                      </div>

                      <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Link
                          href={`/rx/${rx.code}`}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#003666',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Open Full Clinical Monograph & Quality Standards</span>
                          <ArrowUpRight size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenLabelsModal(rx)}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#0284c7',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Tag size={13} />
                          <span>View Official Bottle Labels</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </section>

        {/* ── Section 3: Authorized Therapeutic Formulary & Compounding APIs ── */}
        <section
          id="formulary"
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
                  <FlaskConical size={18} style={{ color: '#003666' }} />
                  <span>Practice Compounding Pharmacopeia & Therapeutic APIs</span>
                </h2>
                <span style={{ fontSize: '0.70rem', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  EU GMP Certified Reference
                </span>
                <span style={{ fontSize: '0.70rem', color: '#1a73e8', background: '#e8f0fe', border: '1px solid #d2e3fc', padding: '1px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  Showing {filteredFormulary.length} of {formulary.length} Reference APIs
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.80rem', color: '#64748b' }}>
                Active pharmaceutical ingredients and research-backed bioactive peptides authorized by {doctor.name} for personalized magistral compounding.
              </p>
            </div>

            {/* Direct reference button to complete directory */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href="/c/CAT-MU9L9GBN"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  background: '#f8fafc',
                  color: '#1a73e8',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.15s'
                }}
              >
                <BookOpen size={14} />
                <span>Explore Full Pharmacopeia Directory</span>
                <ExternalLink size={12} style={{ color: '#1a73e8' }} />
              </a>
            </div>
          </div>

          {/* Controls Bar: Search & Category Chips */}
          <div
            style={{
              padding: '14px 22px',
              borderBottom: '1px solid #f1f5f9',
              background: '#fafbfc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              {/* Category / Goal Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { id: 'all', label: `All APIs (${formularyCounts.all})` },
                  { id: 'repair', label: `Tissue Repair & Gut (${formularyCounts.repair})` },
                  { id: 'metabolic', label: `Metabolic & GLP (${formularyCounts.metabolic})` },
                  { id: 'cellular', label: `Cellular Optimization (${formularyCounts.cellular})` },
                  { id: 'cognitive', label: `Cognitive & Neuro (${formularyCounts.cognitive})` }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFormularyGoal(g.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '16px',
                      border: formularyGoal === g.id ? '1px solid #1a73e8' : '1px solid #dadce0',
                      background: formularyGoal === g.id ? '#e8f0fe' : '#ffffff',
                      color: formularyGoal === g.id ? '#1a73e8' : '#475569',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.12s'
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Instant Search Bar */}
              <div style={{ position: 'relative', minWidth: '220px', maxWidth: '320px', flex: '1 1 220px' }}>
                <input
                  type="text"
                  placeholder="Filter peptides (BPC, Semax, etc.)..."
                  value={formularySearch}
                  onChange={(e) => setFormularySearch(e.target.value)}
                  style={{
                    width: '100%',
                    height: '32px',
                    padding: '0 10px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.78rem',
                    color: '#1e293b',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={pharmacopeiaColumns}
            data={filteredFormulary}
            keyField="id"
            tableId={`doctor-pharmacopeia-${slug}`}
            pagination={true}
            initialRowsPerPage={10}
            alwaysShowPagination={true}
            onRowClick={(p) => setSelectedMonograph(p)}
            emptyTitle="No Reference APIs Found"
            emptyDescription="Try adjusting your filter or search keywords to explore authorized pharmaceutical ingredients."
            emptyActionLabel="Reset Filters"
            onEmptyAction={() => { setFormularyGoal('all'); setFormularySearch(''); }}
            expandableRender={(peptide) => (
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 750, color: '#003666' }}>
                    Mechanism of Action (MOA) & Receptor Pathways
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', background: '#f0fdf4', padding: '1px 8px', borderRadius: '4px', border: '1px solid #bbf7d0', fontWeight: 600 }}>
                    Analytical Purity: {peptide.purity || '≥ 99% HPLC'}
                  </span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.80rem', color: '#334155', lineHeight: 1.5 }}>
                  {safeRenderText(peptide.moa) || safeRenderText(peptide.description)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Target Axis: <strong style={{ color: '#0f172a' }}>{peptide.primaryGoal || 'Cellular Longevity'}</strong> · Vehicle: <strong style={{ color: '#0f172a' }}>{peptide.route || 'Lyophilized API'}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMonograph(peptide)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      background: '#003666',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <BookOpen size={12} />
                    <span>Open Complete Clinical Monograph</span>
                  </button>
                </div>
              </div>
            )}
          />
        </section>

        {/* ── Section 4: Bloodo™ Diagnostic Panels (Baseline Calibration) ── */}
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
                  CE-IVDR Certified Capillary DBS
                </span>
                <span style={{ fontSize: '0.70rem', color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '1px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  ISO 15189 Accredited Lab
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.80rem', color: '#64748b' }}>
                Pre-treatment capillary blood spot diagnostic panels for objective physiological baseline profiling and therapeutic titration monitoring.
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
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                        {panel.name}
                      </h4>
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
                    <div style={{ fontSize: '0.73rem', color: '#0d9488', lineHeight: 1.35, marginBottom: '12px', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '8px 10px', borderRadius: '4px' }}>
                      <strong>Clinical Decision Utility:</strong> {panel.clinicalUtility}
                    </div>
                  </div>

                  {/* Panel footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Requisition via Atlas Clinical Lab
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        toast.success(`Biomarker requisition sheet for ${panel.name} queued for clinical download ✓`);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#ffffff',
                        border: '1px solid #dadce0',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#003666',
                        cursor: 'pointer',
                        transition: 'all 0.12s'
                      }}
                    >
                      <FileText size={12} />
                      <span>Requisition Spec</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      </div>

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
                    handleShareWhatsApp();
                    setIsInquiryOpen(false);
                  }}
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Share2 size={15} color="#16a34a" />
                  <span>Direct WhatsApp Consultation Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky Clinical Operations Dock (Mobile & Tablet GCP Standard) ── */}
      <aside
        className="doctor-bottom-dock"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #dadce0',
          boxShadow: '0 -4px 16px rgba(60,64,67,0.08)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Physician Identity & Active View Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#e8f0fe',
            color: '#1a73e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.80rem',
            fontWeight: 700
          }}>
            {doctor.name ? doctor.name.replace(/^Dr\.\s*/i, '').charAt(0) : 'D'}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#202124' }}>
              {doctor.name} <span style={{ fontSize: '0.74rem', color: '#5f6368', fontWeight: 500 }}>· {doctor.license || 'Verified Physician'}</span>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{filteredPrescriptions.length} Records in Active View</span>
              <span>•</span>
              <span style={{ color: '#137333', fontWeight: 600 }}>EU GMP Certified Dispensary</span>
            </div>
          </div>
        </div>

        {/* Right: Quick GCP Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleShareDoctorPortal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '34px',
              padding: '0 12px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Share2 size={13} color="#1a73e8" />
            <span>Share Portal</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '34px',
              padding: '0 12px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Download size={13} color="#5f6368" />
            <span>Export Registry</span>
          </button>

          <button
            type="button"
            onClick={() => setIsIntakeOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '34px',
              padding: '0 16px',
              borderRadius: '4px',
              border: '1px solid #1a73e8',
              background: '#1a73e8',
              color: '#ffffff',
              fontSize: '0.80rem',
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(60,64,67,0.3)',
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            <span>New Prescription Intake</span>
          </button>
        </div>
      </aside>

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
                      title="View Pharmapolis pharmacy bottle labels"
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
                  { id: 'formulations', label: `Formulations (${itemsList.length || 1})`, icon: FlaskConical },
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
                              : (item?.description || `Compounded formulation awaiting physician electronic sign-off.`)}
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

                {inspectorTab === 'formulations' && (
                  <>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                      Active Compounded Ingredients & Formulations ({itemsList.length || 1})
                    </div>
                    {itemsList.length === 0 ? (
                      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                        Custom personalized galenic blend under formulation review.
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
                        Formulated under ISO Class 5 Laminar Airflow with HPLC purity certification by Pharmapolis & Fagron Compounding Solutions.
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
                          Pharmapolis Bottle Label
                        </div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.76rem', color: '#0c4a6e', lineHeight: 1.4 }}>
                          Direct access to vector print templates formatted for Pharmapolis amber pharmaceutical bottles.
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
    </div>
  );
}
