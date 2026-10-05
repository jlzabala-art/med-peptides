"use client";
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FileText, FilePlus, ScanText, Stethoscope, Box, Download, RefreshCw, Share2, Phone, Sparkles, Merge } from 'lucide-react';
import PrescriptionDetailModal from '../../features/prescriptions/components/PrescriptionDetailModal';
import ProtocolDrawerContent from '../admin/protocols/ProtocolDrawerContent';
import ProductDetailsDrawer from '../admin/products/ProductDetailsDrawer';
import StandardDrawer from '../ui/StandardDrawer';
import { useFirestorePaginatedCollection } from '../../hooks/data/useFirestorePaginatedCollection';
import { usePrescriptionsRealtimeSync } from '../../hooks/data/usePrescriptionsRealtimeSync';
import { useAlgoliaSearch } from '../../hooks/data/useAlgoliaSearch';
import PageHeader from '../ui/PageHeader';
import DataTableSkeleton from '../ui/skeletons/DataTableSkeleton';
import PrescriptionsKPIs from '../admin/prescriptions/PrescriptionsKPIs';
import UniversalOrderBuilder from './order-builder/UniversalOrderBuilder';
import ImportPrescriptionModal from '../../features/prescriptions/components/ImportPrescriptionModal';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { getPrescriptionColumns, formatDoctorName } from '../admin/prescriptions/prescriptionColumns';
import { classifyPrescription, PRESCRIPTION_TYPE_CONFIG } from '../../data/prescriptionTypeClassifier';
import DataModule from '../ui/DataModule';
import { useAuth } from '../../context/AuthContext';
import PrescriptionIntakeWorkspace from '../../features/prescriptions/components/PrescriptionIntakeWorkspace';
import ShareIntakeWhatsAppModal from './ShareIntakeWhatsAppModal';
import PrimarySplitButton from '../ui/PrimarySplitButton';
import AIQuickActionButton from '../ui/AIQuickActionButton';
import SourceSelectorModal from '../../features/prescriptions/SourceSelectorModal';
import { useDrawer } from '../../context/DrawerContext';
import { PRESCRIPTION_SOURCES } from '../../schemas/prescriptionSchema';
import BuilderProtocolSearch from './order-builder/BuilderProtocolSearch';
import MobilePrescriptionCard from './mobile/MobilePrescriptionCard';
import MobileActionSheet from '../ui/MobileActionSheet';
import { Eye, Edit3, XCircle, Tag, Package } from '@/lib/icons';
import notifier from '../../services/NotificationService';
import { exportToCSV, triggerServerExport } from '../../utils/universalExporter';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useWorkspaceStore } from '../../stores/useWorkspaceStore';
import PatientAdministrationGuideModal from '../doctor/PatientAdministrationGuideModal';

export default function UniversalPrescriptionsTable({ doctorId, patientId, readOnly = false, hideHeader = false, title = 'Prescriptions', subtitle = 'System of record for all patient prescriptions and recommendations.', serverKPIs, enableAskAtlas = false, initialData }) {
  const { openDrawer } = useDrawer();
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileActionRx, setMobileActionRx] = useState(null);

  const handleMobileQuickAction = useCallback((action, rx) => {
    if (action === 'menu') setMobileActionRx(rx);
  }, []);

  const mobileCardPropsForTable = useMemo(() => ({
    onQuickAction: handleMobileQuickAction,
  }), [handleMobileQuickAction]);
  const [linkedProtocol, setLinkedProtocol] = useState(null);
  const [linkedProduct, setLinkedProduct] = useState(null);
  
  // Track the prescription being edited (if any). If 'new', we are creating a new one.
  const [editingRx, setEditingRx] = useState(null);
  // Builder open state (was missing — caused runtime error for 'From Items' and 'Manual' sources)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isShareIntakeWhatsAppOpen, setIsShareIntakeWhatsAppOpen] = useState(false);
  const [selectedShareRx, setSelectedShareRx] = useState(null);
  const [isSourceSelectorOpen, setIsSourceSelectorOpen] = useState(false);
  const [isProtocolSearchOpen, setIsProtocolSearchOpen] = useState(false);
  const [initialBuilderItems, setInitialBuilderItems] = useState([]);
  const [patientGuideRx, setPatientGuideRx] = useState(null);
  // Protocol context passed from BuilderProtocolSearch to the builder
  const [builderProtocolId, setBuilderProtocolId] = useState(null);
  const [builderProtocolName, setBuilderProtocolName] = useState(null);
  const [builderDoctorId, setBuilderDoctorId] = useState(null);
  const [builderDoctorName, setBuilderDoctorName] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  // URL Sync
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const statusFilter = searchParams.get('status') || '';
  const rangeFilter = searchParams.get('range') || 'all';
  const sourceFilter = searchParams.get('source') || '';
  const typeFilter = searchParams.get('type') || '';
  const doctorFilter = searchParams.get('doctor') || searchParams.get('doctorName') || '';
  const patientFilter = searchParams.get('patient') || '';
  const urlDoctorId = searchParams.get('doctorId') || '';
  const urlDoctorName = searchParams.get('doctorName') || '';
  const urlRxId = searchParams.get('id') || '';

  const [loadingUrlItem, setLoadingUrlItem] = useState(false);

  const { is, effectiveRole } = useRoleAccess();
  const isDoctor = is('doctor') || effectiveRole === 'doctor';
  const canGenerateLabels = !isDoctor && effectiveRole !== 'doctor';

  const effectiveDoctorId = doctorId || urlDoctorId;

  const updateUrlParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);
  
  // ── Lazy product loader — only fetches when a detail modal is opened ──────
  // Previously loaded 1000 products eagerly on mount (major perf hit).
  const [products, setProducts] = useState([]);
  const productsLoadedRef = useRef(false);
  const loadProductsLazy = useCallback(async () => {
    if (productsLoadedRef.current) return;
    productsLoadedRef.current = true;
    try {
      const { getActiveProductsPaginated } = await import('../../repositories/productRepository');
      const snap = await getActiveProductsPaginated(200);
      setProducts(snap?.items || []);
    } catch (err) {
      console.warn('[UniversalPrescriptionsTable] lazy product load failed:', err);
      productsLoadedRef.current = false; // Allow retry on next open
    }
  }, []);


  // Convert filters to whereConditions
  const whereConditions = useMemo(() => {
    const conditions = [];
    if (effectiveDoctorId) conditions.push(['doctorId', '==', effectiveDoctorId]);
    if (patientId) conditions.push(['patientId', '==', patientId]);
    
    if (statusFilter) {
      conditions.push(['status', '==', statusFilter]);
    }
    
    if (rangeFilter !== 'all') {
      const date = new Date();
      if (rangeFilter === '7d') date.setDate(date.getDate() - 7);
      else if (rangeFilter === '30d') date.setDate(date.getDate() - 30);
      else if (rangeFilter === '90d') date.setDate(date.getDate() - 90);
      conditions.push(['createdAt', '>=', date]);
    }
    
    return conditions;
  }, [statusFilter, rangeFilter, effectiveDoctorId, patientId]);

  // 1. Data Fetching (Server-Side Paginated)
  // initialData from RSC pre-fetch — table renders immediately with no client round-trip.
  const { 
    data: paginatedPrescriptions, 
    isLoading: loading, 
    hasMore, 
    loadMore,
    isFetchingMore,
    refresh
  } = useFirestorePaginatedCollection('prescriptions', {
    whereConditions,
    orderByFields: [['createdAt', 'desc']],
    pageSize: 50,
    initialData: initialData?.length > 0 ? initialData : undefined,
  });

  const displayPrescriptions = paginatedPrescriptions;

  const algoliaFacetFilters = useMemo(() => {
    const filters = [];
    if (statusFilter) filters.push(`status:${statusFilter.toLowerCase()}`);
    return filters;
  }, [statusFilter]);

  const algoliaNumericFilters = useMemo(() => {
    const filters = [];
    if (rangeFilter && rangeFilter !== 'all') {
      const date = new Date();
      if (rangeFilter === '7d') date.setDate(date.getDate() - 7);
      else if (rangeFilter === '30d') date.setDate(date.getDate() - 30);
      else if (rangeFilter === '90d') date.setDate(date.getDate() - 90);
      filters.push(`createdAt_ts>=${date.getTime()}`);
    }
    return filters;
  }, [rangeFilter]);

  const { hits: algoliaHits, isAlgoliaActive, loading: algoliaLoading } = useAlgoliaSearch(
    'prescriptions',
    searchTerm,
    { 
      hitsPerPage: 50,
      facetFilters: algoliaFacetFilters.length > 0 ? algoliaFacetFilters : undefined,
      numericFilters: algoliaNumericFilters.length > 0 ? algoliaNumericFilters : undefined
    },
    300
  );

  const realtimeWhereConditions = useMemo(() => {
    const conds = [];
    if (effectiveDoctorId) conds.push(['doctorId', '==', effectiveDoctorId]);
    if (patientId) conds.push(['patientId', '==', patientId]);
    return conds;
  }, [effectiveDoctorId, patientId]);

  // Real-time synchronization (GCP UX standard: replaces manual Refresh button)
  const { hasNewData, clearNewData } = usePrescriptionsRealtimeSync({
    whereConditions: realtimeWhereConditions,
    enabled: !isAlgoliaActive,
  });

  // Sync selectedItem with live data updates
  useEffect(() => {
    if (selectedItem) {
      const activeList = isAlgoliaActive ? algoliaHits : displayPrescriptions;
      const updatedItem = activeList.find(p => p.id === selectedItem.id);
      if (updatedItem && JSON.stringify(updatedItem) !== JSON.stringify(selectedItem)) {
        setSelectedItem(updatedItem);
      }
    }
  }, [displayPrescriptions, algoliaHits, isAlgoliaActive]);

  // Group data by sessionId with deep search support
  const groupedData = useMemo(() => {
    let rawData = [];
    if (isAlgoliaActive && searchTerm.trim()) {
      rawData = algoliaHits.map(h => ({ ...h, id: h.objectID || h.id }));
    } else if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rawData = (displayPrescriptions || []).filter(rx => {
        const matchesPatient = (rx.patientName || rx.patient?.name || '').toLowerCase().includes(q);
        const matchesDoctor = (rx.doctorName || rx.doctor?.name || '').toLowerCase().includes(q);
        const matchesBoxId = (rx.fagron?.boxId || '').toLowerCase().includes(q);
        const matchesProtocol = (rx.protocolName || rx.treatmentProgram || '').toLowerCase().includes(q);
        const matchesId = (rx.id || '').toLowerCase().includes(q);
        const lines = rx.prescriptionLines || rx.items || [];
        const matchesLine = lines.some(l => 
          (l.productName || l.name || '').toLowerCase().includes(q) ||
          (l.activeIngredient || '').toLowerCase().includes(q)
        );
        return matchesPatient || matchesDoctor || matchesBoxId || matchesProtocol || matchesId || matchesLine;
      });
    } else {
      rawData = displayPrescriptions || [];
    }

    if (!rawData || rawData.length === 0) return [];

    // Filter by source (Fagron/NutriGen vs Manual)
    if (sourceFilter) {
      if (sourceFilter === 'fagron') {
        rawData = rawData.filter(rx => Boolean(rx.fagron || rx.source === 'fagron' || rx.importSource === 'fagron' || rx.testName === 'NutriGen' || rx.fagron?.boxId));
      } else if (sourceFilter === 'manual') {
        rawData = rawData.filter(rx => !rx.fagron && rx.source !== 'fagron' && !rx.importSource && rx.testName !== 'NutriGen');
      }
    }

    // Filter by clinical program / type (TrichoTest, NutriGen, Hormones, Peptides, Compounding)
    if (typeFilter) {
      rawData = rawData.filter(rx => {
        const info = classifyPrescription(rx);
        return info.key === typeFilter;
      });
    }

    // Filter by doctor
    if (doctorFilter) {
      const docQ = doctorFilter.toLowerCase();
      rawData = rawData.filter(rx => {
        const docName = (rx.doctor?.name || rx.doctorName || '').toLowerCase();
        return docName.includes(docQ);
      });
    }

    // Filter by patient
    if (patientFilter) {
      const patQ = patientFilter.toLowerCase();
      rawData = rawData.filter(rx => {
        const pName = (rx.patient?.name || rx.patientName || '').toLowerCase();
        return pName.includes(patQ);
      });
    }

    // Filter by status
    if (statusFilter) {
      const stQ = statusFilter.toLowerCase();
      rawData = rawData.filter(rx => {
        const st = (normalizeRxStatus(rx.status) || 'draft').toLowerCase();
        return st === stQ;
      });
    }

    // Filter by date range
    if (rangeFilter && rangeFilter !== 'all') {
      const now = new Date();
      let cutoff = new Date();
      if (rangeFilter === '7d') cutoff.setDate(now.getDate() - 7);
      else if (rangeFilter === '30d') cutoff.setDate(now.getDate() - 30);
      else if (rangeFilter === '90d') cutoff.setDate(now.getDate() - 90);
      else if (rangeFilter === 'year') cutoff = new Date(now.getFullYear(), 0, 1);

      rawData = rawData.filter(rx => {
        const d = rx.createdAt?.seconds ? new Date(rx.createdAt.seconds * 1000) : (rx.createdAt ? new Date(rx.createdAt) : null);
        return !d || d >= cutoff;
      });
    }

    const groups = {};
    const result = [];
    
    for (const rx of rawData) {
      const groupKey = rx.rxGroupId || rx.sessionId || rx.groupCode || (rx.fagron?.boxId ? `box_${rx.fagron.boxId}` : null);
      if (groupKey) {
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(rx);
      } else {
        result.push(rx);
      }
    }
    
    for (const groupKey in groups) {
      const members = groups[groupKey];
      if (members.length === 1) {
        result.push(members[0]);
      } else {
        // Sort parts by partNumber or createdAt asc
        members.sort((a, b) => {
          if (a.partNumber && b.partNumber) return a.partNumber - b.partNumber;
          const ta = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
          const tb = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
          return ta - tb;
        });

        const first = members[0];
        const isFagronGroup = members.some(m => Boolean(m.fagron || m.source === 'fagron' || m.importSource === 'fagron' || m.testName === 'NutriGen'));
        result.push({
          ...first,
          id: `multipart_${groupKey}`,
          _isSessionGroup: true,
          _sessionCount: members.length,
          _sessionMembers: members,
          source: isFagronGroup ? 'fagron' : first.source,
          items: members.flatMap(m => m.prescriptionLines || m.items || []),
          prescriptionLines: members.flatMap(m => m.prescriptionLines || m.items || []),
        });
      }
    }
    
    // Sort result again by createdAt desc since we might have appended groups at the end
    result.sort((a, b) => {
      const ta = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
      const tb = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
      return tb - ta;
    });
    
    return result;
  }, [displayPrescriptions, algoliaHits, isAlgoliaActive, searchTerm, sourceFilter, typeFilter, doctorFilter, patientFilter, statusFilter, rangeFilter]);

  const finalData = groupedData;

  const handleEdit = (rx) => {
    setSelectedItem(null);
    setInitialBuilderItems(rx.items || []);
    setEditingRx(rx);
  };

  // Listen for View Prescription action dispatched from prescriptionColumns
  useEffect(() => {
    const handleViewEvent = (e) => {
      if (e.detail?.rx) {
        setSelectedItem(e.detail.rx);
        loadProductsLazy();
      }
    };
    const handleShareEvent = (e) => {
      setSelectedShareRx(e.detail?.rx || null);
      setIsShareIntakeWhatsAppOpen(true);
    };
    window.addEventListener('OPEN_PRESCRIPTION_VIEW', handleViewEvent);
    window.addEventListener('OPEN_SHARE_PUBLIC_PAGE', handleShareEvent);
    return () => {
      window.removeEventListener('OPEN_PRESCRIPTION_VIEW', handleViewEvent);
      window.removeEventListener('OPEN_SHARE_PUBLIC_PAGE', handleShareEvent);
    };
  }, [loadProductsLazy]);

  const prescriptionExpandableRender = useCallback((row) => {
    // ── MULTI-PART / SESSION GROUP: list each sequential formulation/part ───────────
    if (row._isSessionGroup) {
      return (
        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f8fafc', borderTop: '1px dashed #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
              Prescription Parts & Formulations ({row._sessionMembers.length} parts)
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Linked multi-part patient treatment sequence
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {row._sessionMembers.map((member, idx) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                onClick={() => { setSelectedItem(member); loadProductsLazy(); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {member.partNumber || idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                      {member.treatmentType || `Part ${member.partNumber || idx + 1}`}
                      <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.75rem', marginLeft: '8px' }}>
                        #{member.prescriptionCode || member.id?.slice(0, 8)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {(member.items || member.compounds || []).map(i => i.name || i.productName).filter(Boolean).join(', ') || 'No compounds listed'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button style={{
                    padding: '4px 10px',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    View Part
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── REGULAR ROW: show source details, items, and imported file ───────────────────
    const rawSource = (row.source || 'manual').toLowerCase().trim();
    const isImport = rawSource !== 'manual';
    const items = row.items || row.compounds || row.products || [];
    const importedFileUrl = row.fagron?.originalFileUrl || row.importedFileUrl || row.sourceFileUrl || null;
    const importedFileName = row.fagron?.originalFileName || row.importedFileName || row.sourceFileName || null;
    const sourceLabel = isImport
      ? (rawSource === 'fagron' ? 'Fagron Genomics Report' :
         rawSource === 'document' ? 'Scanned Document' :
         rawSource === 'ai_report' ? 'AI Report' :
         rawSource === 'protocol' ? 'Clinical Protocol' :
         'Import')
      : 'Manual Entry';

    if (items.length === 0 && !importedFileUrl) return null;

    return (
      <div style={{
        padding: '12px 16px',
        background: '#f8fafc',
        borderTop: '1px dashed #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {/* Source chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
            background: isImport ? '#eff6ff' : '#f8fafc',
            color: isImport ? '#2563eb' : '#64748b',
            border: isImport ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
          }}>
            {isImport ? '↑ Import' : '✏ Manual'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{sourceLabel}</span>
        </div>

        {/* Items list */}
        {items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
              Compounded APIs ({items.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {items.map((item, idx) => (
                <span key={idx} style={{
                  padding: '2px 8px', borderRadius: '5px',
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  fontSize: '0.76rem', color: '#334155', fontWeight: 500,
                }}>
                  {item.name || item.productName || `Item ${idx + 1}`}
                  {item.dosage || item.dose ? <span style={{ color: '#94a3b8', marginLeft: '4px' }}>{item.dosage || item.dose}</span> : null}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Imported file link */}
        {importedFileUrl && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', background: '#ffffff',
            border: '1px solid #e2e8f0', borderRadius: '8px',
          }}>
            <FileText size={13} style={{ color: '#2563eb', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Source file</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {importedFileName || 'Imported document'}
              </div>
            </div>
            <a
              href={importedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '3px 8px', borderRadius: '5px',
                background: '#eff6ff', color: '#2563eb',
                border: '1px solid #bfdbfe',
                fontSize: '0.7rem', fontWeight: 700,
                textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              Open file
            </a>
          </div>
        )}
      </div>
    );
  }, [loadProductsLazy]);

  // URL-driven prescription loading
  useEffect(() => {
    if (urlRxId && !selectedItem && !loadingUrlItem) {
      // Don't trigger if it's currently editing a new one or another one
      if (editingRx) return;
      
      const existing = displayPrescriptions.find(p => p.id === urlRxId);
      if (existing) {
        setSelectedItem(existing);
      } else {
        setLoadingUrlItem(true);
        getDoc(doc(db, 'prescriptions', urlRxId)).then(snap => {
          if (snap.exists()) {
            setSelectedItem({ id: snap.id, ...snap.data() });
          } else {
            toast.error("Prescription not found");
            updateUrlParam('id', '');
          }
        }).catch(err => {
          console.error("Error fetching direct prescription:", err);
          updateUrlParam('id', '');
        }).finally(() => {
          setLoadingUrlItem(false);
        });
      }
    }
  }, [urlRxId, displayPrescriptions, selectedItem, loadingUrlItem, editingRx, updateUrlParam]);

  useEffect(() => {
    const handleOpenGuide = (e) => {
      if (e.detail?.rx) setPatientGuideRx(e.detail.rx);
    };
    window.addEventListener('OPEN_PATIENT_GUIDE_MODAL', handleOpenGuide);
    return () => window.removeEventListener('OPEN_PATIENT_GUIDE_MODAL', handleOpenGuide);
  }, []);

  const handleRefill = useCallback((rx) => {
    if (!rx) return;
    openDrawer('rx-builder', 'new', {
      initialPatient: rx.patient?.id ? rx.patient : (rx.patientId ? { id: rx.patientId, name: rx.patientName } : null),
      initialDoctor: rx.doctor?.id ? rx.doctor : (rx.doctorId ? { id: rx.doctorId, name: rx.doctorName } : null),
      initialItems: (rx.items || rx.compounds || rx.products || []).map(item => ({
        ...item,
        id: item.id || item.productId || crypto.randomUUID(),
        productId: item.productId || item.id,
        productName: item.productName || item.name || 'Item',
      })),
      initialProtocolId: rx.protocolId || null,
      initialProtocolName: rx.protocolName || null,
    });
  }, [openDrawer]);

  const handleEnrichPrescription = useCallback(async (rx) => {
    if (!rx) return;
    const rxId = rx.id;
    const toastId = toast.loading(`Enriqueciendo prescripción con IA #${rxId?.slice(0, 6)}…`);
    try {
      const res = await fetch('/api/prescriptions/enrich-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: rxId, currentRx: rx })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al enriquecer prescripción');
      }
      toast.success(`✨ Prescripción enriquecida (${data.completeness?.score || 100}% calidad clínica)`, { id: toastId });
      refresh && refresh();
    } catch (err) {
      console.error('Prescription enrichment error:', err);
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  }, [refresh]);

  const columns = useMemo(() => getPrescriptionColumns({
    onEdit: handleEdit,
    onRefresh: refresh,
    onRefill: handleRefill,
    onEnrich: handleEnrichPrescription,
    onOpenPatientGuide: (rx) => setPatientGuideRx(rx),
    isDoctor,
    role: effectiveRole
  }), [handleEdit, refresh, handleRefill, handleEnrichPrescription, isDoctor, effectiveRole]);

  const bulkActions = useMemo(() => {
    const actions = [
      {
        label: '📦 Send to Workspace',
        icon: Package,
        onClick: (selectedRows) => {
          if (!selectedRows || selectedRows.length === 0) return;
          
          let allItems = [];
          let targetPatient = null;
          
          selectedRows.forEach(rx => {
            const patientName = rx.patient?.name || rx.patientName || 'Patient';
            const pId = rx.patientId || rx.patient?.id || '';
            if (!targetPatient && (pId || patientName !== 'Patient')) {
              targetPatient = {
                type: 'patient',
                id: pId,
                name: patientName,
                email: rx.patient?.email || rx.patientEmail || '',
                phone: rx.patient?.phone || rx.patientPhone || '',
                fileNumber: rx.patient?.fileNumber || rx.patientFileNumber || rx.patient?.mrn || '',
              };
            }
            const rawItems = rx.items || rx.compounds || rx.products || [];
            rawItems.forEach((i, idx) => {
              allItems.push({
                id: i.id || i.variantId || i.productId || `rx_${rx.id}_item_${idx}`,
                productId: i.productId || i.id,
                variantId: i.variantId || i.id,
                canonicalName: i.name || i.productName || i.product_title || 'Medication',
                sku: i.sku || '',
                dosage: i.dosage || i.dose || '',
                format: i.format || i.dosage_form || 'Vial',
                quantity: parseInt(i.quantity, 10) || 1,
                unitPrice: parseFloat(i.unitPrice || i.rate || i.price || 0),
                price: parseFloat(i.unitPrice || i.rate || i.price || 0),
                unitRate: parseFloat(i.unitPrice || i.rate || i.price || 0),
                supplierCost: parseFloat(i.supplierCost || 0),
                supplierName: rx.supplierName || 'Pharmapolis Ltd',
                category: i.category || 'Prescription Biologics',
                prescriptionId: rx.id,
                prescriptionCode: rx.prescriptionCode || rx.id,
                patientName,
                patientId: pId,
              });
            });
          });
          
          if (allItems.length === 0) {
            toast.error('Selected prescriptions have no items to send');
            return;
          }
          
          const { addItems, setTargetEntity, setOperationType, setWorkspaceIntent, activeWorkspaceId, setDrawerOpen } = useWorkspaceStore.getState();
          addItems(allItems, activeWorkspaceId, { openDrawer: true });
          if (targetPatient) {
            setTargetEntity(targetPatient, activeWorkspaceId);
          }
          setOperationType('sell_prescription', activeWorkspaceId);
          setWorkspaceIntent('sell', activeWorkspaceId);
          setDrawerOpen(true);
          toast.success(`${allItems.length} compounds from ${selectedRows.length} prescriptions added to workspace`);
        }
      },
      {
        label: 'Merge Prescriptions',
        icon: Merge,
        onClick: async (selectedRows) => {
          if (!selectedRows || selectedRows.length < 2) {
            toast.error('Select at least 2 prescriptions to merge');
            return;
          }

          const patientNames = Array.from(new Set(selectedRows.map(r => (r.patient?.name || r.patientName || '').toLowerCase().trim()).filter(Boolean)));
          if (patientNames.length > 1) {
            const confirmed = window.confirm(`The selected prescriptions belong to different patient names (${patientNames.join(', ')}). Are you sure you want to merge them into one?`);
            if (!confirmed) return;
          }

          const toastId = toast.loading(`Merging ${selectedRows.length} prescriptions...`);
          try {
            const sorted = [...selectedRows].sort((a, b) => {
              const ta = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
              const tb = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
              return ta - tb;
            });

            const targetRx = sorted[0];
            const secondaryRxs = sorted.slice(1);

            const existingItems = targetRx.items || targetRx.prescriptionLines || [];
            const mergedItems = [...existingItems];

            secondaryRxs.forEach(sec => {
              const secItems = sec.items || sec.prescriptionLines || [];
              secItems.forEach(sItem => {
                const sName = (sItem.name || sItem.productName || '').toLowerCase().trim();
                const sDose = (sItem.dosage || sItem.dose || '').toLowerCase().trim();
                const alreadyExists = mergedItems.some(m => {
                  const mName = (m.name || m.productName || '').toLowerCase().trim();
                  const mDose = (m.dosage || m.dose || '').toLowerCase().trim();
                  return mName === sName && (!sDose || mDose === sDose);
                });
                if (!alreadyExists) {
                  mergedItems.push(sItem);
                }
              });
            });

            const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('../../firebase');

            await updateDoc(doc(db, 'prescriptions', targetRx.id), {
              items: mergedItems,
              prescriptionLines: mergedItems,
              mergedFrom: secondaryRxs.map(s => s.id),
              updatedAt: serverTimestamp(),
              notes: `${targetRx.notes || ''}\n[Merged with duplicates: ${secondaryRxs.map(s => '#' + s.id.slice(0, 6)).join(', ')}]`.trim()
            });

            for (const sec of secondaryRxs) {
              await updateDoc(doc(db, 'prescriptions', sec.id), {
                status: 'cancelled',
                mergedInto: targetRx.id,
                updatedAt: serverTimestamp(),
                internalNotes: `Merged into prescription #${targetRx.id}`
              });
            }

            toast.success(`Successfully merged into Rx #${targetRx.id.slice(-6)}`, { id: toastId });
            setSelectedIds(new Set());
            clearNewData();
            refresh && refresh();
          } catch (err) {
            console.error('Merge prescriptions error:', err);
            toast.error('Failed to merge prescriptions: ' + err.message, { id: toastId });
          }
        }
      },
      {
        label: '📄 Export CSV',
        icon: Download,
        onClick: (selectedRows) => {
          if (!selectedRows || selectedRows.length === 0) return;
          const exportCols = [
            { key: 'id', header: 'ID', accessor: rx => rx.id || '' },
            { key: 'patientName', header: 'Patient', accessor: rx => rx.patient?.name || rx.patientName || '' },
            { key: 'doctorName', header: 'Doctor', accessor: rx => rx.doctor?.name || rx.doctorName || '' },
            { key: 'status', header: 'Status', accessor: rx => rx.status || 'draft' },
            { key: 'total', header: 'Total ($)', accessor: rx => Number(rx.total || 0).toFixed(2) }
          ];
          exportToCSV(selectedRows, exportCols, `prescriptions_selected_${Date.now()}.csv`);
          toast.success(`Exported ${selectedRows.length} prescriptions to CSV`);
        }
      },
      {
        label: '✨ Enrich with AI',
        icon: Sparkles,
        onClick: async (selectedRows) => {
          if (!selectedRows || selectedRows.length === 0) return;
          const toastId = toast.loading(`Enriqueciendo ${selectedRows.length} prescripciones con IA…`);
          let successCount = 0;
          for (const rx of selectedRows) {
            try {
              const res = await fetch('/api/prescriptions/enrich-single', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prescriptionId: rx.id, currentRx: rx })
              });
              if (res.ok) successCount++;
            } catch (err) {
              console.warn('Bulk enrich error for', rx.id, err);
            }
          }
          toast.success(`✨ ${successCount} de ${selectedRows.length} prescripciones enriquecidas con éxito`, { id: toastId });
          refresh && refresh();
        }
      }
    ];

    if (canGenerateLabels) {
      actions.push({
        label: '🏷️ Pharmapolis Stickers',
        icon: Tag,
        onClick: async (selectedRows) => {
          if (!selectedRows || selectedRows.length === 0) return;
          const toastId = toast.loading('Generating bulk Pharmapolis stickers…');
          try {
            const { generatePharmapolisStickersPDF } = await import('../../services/pharmapolisLabelService');
            const first = selectedRows[0];
            const patientObj = first.patient || {
              name: first.patientName || 'Multiple Patients',
              dob: first.patientDob || first.dob || '—',
              fileNumber: first.fileNumber || first.patientId || first.id?.slice(0, 8),
            };
            await generatePharmapolisStickersPDF(patientObj, selectedRows);
            toast.success(`Pharmapolis stickers generated for ${selectedRows.length} prescriptions`, { id: toastId });
          } catch (err) {
            console.error('Bulk sticker generation error:', err);
            toast.error('Failed to generate stickers: ' + err.message, { id: toastId });
          }
        }
      });
    }

    return actions;
  }, [canGenerateLabels]);

  // Dynamic filter options based on prescriptions in the database
  const doctorOptions = useMemo(() => {
    const docMap = new Map();
    (displayPrescriptions || []).forEach(rx => {
      const name = rx.doctor?.name || rx.doctorName;
      if (name && name !== '—') {
        const cleaned = formatDoctorName(name);
        docMap.set(cleaned, cleaned);
      }
    });
    const opts = [{ label: 'All Doctors', value: '' }];
    Array.from(docMap.keys()).sort().forEach(d => {
      opts.push({ label: d, value: d });
    });
    return opts;
  }, [displayPrescriptions]);

  const patientOptions = useMemo(() => {
    const patMap = new Map();
    (displayPrescriptions || []).forEach(rx => {
      const name = rx.patient?.name || rx.patientName;
      if (name && name !== 'Unknown Patient') {
        patMap.set(name, name);
      }
    });
    const opts = [{ label: 'All Patients', value: '' }];
    Array.from(patMap.keys()).sort().forEach(p => {
      opts.push({ label: p, value: p });
    });
    return opts;
  }, [displayPrescriptions]);

  // GCP UX Standard Filter Dimensions (Attached directly to GlobalSearchBar)
  const filterOptions = useMemo(() => [
    {
      key: 'range',
      label: 'Date Range',
      pluralLabel: 'Date Ranges',
      multiSelect: false,
      value: rangeFilter || 'all',
      onChange: (val) => updateUrlParam('range', val === 'all' ? '' : val),
      options: [
        { label: 'All Time', value: 'all' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'Last 90 Days', value: '90d' },
        { label: 'This Year', value: 'year' },
      ]
    },
    {
      key: 'type',
      label: 'Program',
      pluralLabel: 'Programs',
      multiSelect: false,
      value: typeFilter,
      onChange: (val) => updateUrlParam('type', val),
      options: [
        { label: 'All Programs', value: '' },
        { label: '🧬 TrichoTest™ (Follicular DNA)', value: 'trichotest' },
        { label: '🧬 NutriGen™ (Oral Chrono)', value: 'nutrigen' },
        { label: '⚡ Hormones · BHRT / TRT', value: 'hormone' },
        { label: '💉 Peptides · SubQ Vials', value: 'peptide' },
        { label: '💊 Compounding Rx (Galenic)', value: 'compounding' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      pluralLabel: 'Statuses',
      multiSelect: false,
      value: statusFilter,
      onChange: (val) => updateUrlParam('status', val),
      options: [
        { label: 'All Statuses', value: '' },
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Processing', value: 'processing' },
        { label: 'Draft', value: 'draft' },
        { label: 'In Transit', value: 'in_transit' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    },
    {
      key: 'doctor',
      label: 'Doctor',
      pluralLabel: 'Doctors',
      multiSelect: false,
      value: doctorFilter,
      onChange: (val) => updateUrlParam('doctor', val),
      options: doctorOptions
    },
    {
      key: 'patient',
      label: 'Patient',
      pluralLabel: 'Patients',
      multiSelect: false,
      value: patientFilter,
      onChange: (val) => updateUrlParam('patient', val),
      options: patientOptions
    },
    {
      key: 'source',
      label: 'Source',
      pluralLabel: 'Sources',
      multiSelect: false,
      value: sourceFilter,
      onChange: (val) => updateUrlParam('source', val),
      options: [
        { label: 'All Sources', value: '' },
        { label: '🧬 Imported (NutriGen / Fagron)', value: 'fagron' },
        { label: '✏️ Manual Entry', value: 'manual' }
      ]
    }
  ], [rangeFilter, typeFilter, statusFilter, doctorFilter, patientFilter, sourceFilter, doctorOptions, patientOptions, updateUrlParam]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (statusFilter) {
      chips.push({ key: 'status', label: 'Status', value: statusFilter, onRemove: () => updateUrlParam('status', '') });
    }
    if (rangeFilter && rangeFilter !== 'all') {
      const rangeMap = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', 'year': 'This Year' };
      chips.push({ key: 'range', label: 'Date', value: rangeMap[rangeFilter] || rangeFilter, onRemove: () => updateUrlParam('range', 'all') });
    }
    if (doctorFilter) {
      chips.push({ key: 'doctor', label: 'Doctor', value: doctorFilter, onRemove: () => updateUrlParam('doctor', '') });
    }
    if (patientFilter) {
      chips.push({ key: 'patient', label: 'Patient', value: patientFilter, onRemove: () => updateUrlParam('patient', '') });
    }
    if (typeFilter) {
      const typeLabel = PRESCRIPTION_TYPE_CONFIG[typeFilter]?.label || typeFilter;
      chips.push({ key: 'type', label: 'Program', value: typeLabel, onRemove: () => updateUrlParam('type', '') });
    }
    if (sourceFilter) {
      const srcMap = { 'fagron': 'Imported (NutriGen)', 'manual': 'Manual Entry' };
      chips.push({ key: 'source', label: 'Source', value: srcMap[sourceFilter] || sourceFilter, onRemove: () => updateUrlParam('source', '') });
    }
    if (urlDoctorId) {
      chips.push({ 
        key: 'doctorId', 
        label: 'Doctor ID', 
        value: urlDoctorName || urlDoctorId, 
        onRemove: () => {
          updateUrlParam('doctorId', '');
          updateUrlParam('doctorName', '');
        } 
      });
    }
    return chips;
  }, [statusFilter, rangeFilter, doctorFilter, patientFilter, sourceFilter, typeFilter, urlDoctorId, urlDoctorName, updateUrlParam]);

  const handleClearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('range');
    params.delete('doctor');
    params.delete('doctorName');
    params.delete('doctorId');
    params.delete('patient');
    params.delete('source');
    params.delete('type');
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const handleExportCsv = useCallback(async () => {
    const list = (isAlgoliaActive ? algoliaHits : displayPrescriptions) || [];
    if (list.length === 0) {
      notifier.info('Downloading complete prescriptions database via server stream...');
      try {
        await triggerServerExport({
          entity: 'prescriptions',
          format: 'csv',
          doctorId: doctorId || undefined
        });
        notifier.success('Prescriptions export completed.');
      } catch (err) {
        notifier.error('Failed to export prescriptions: ' + err.message);
      }
      return;
    }

    const columns = [
      { key: 'id', header: 'ID', accessor: rx => rx.id || '' },
      { key: 'patientName', header: 'Patient', accessor: rx => rx.patientName || '' },
      { key: 'doctorName', header: 'Doctor', accessor: rx => rx.doctorName || rx.physicianName || '' },
      { key: 'status', header: 'Status', accessor: rx => rx.status || 'draft' },
      {
        key: 'createdAt',
        header: 'Date',
        accessor: rx => (rx.createdAt?.seconds ? new Date(rx.createdAt.seconds * 1000).toISOString() : (rx.createdAt || ''))
      },
      { key: 'total', header: 'Total ($)', accessor: rx => Number(rx.total || 0).toFixed(2) }
    ];

    exportToCSV(list, columns, `prescriptions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    notifier.success(`Exported ${list.length} prescriptions to CSV.`);
  }, [displayPrescriptions, isAlgoliaActive, algoliaHits, doctorId]);

  return (
    <>
      <DataModule
        title={title}
        subtitle={subtitle}
        icon={FileText}

        mobileOverflowActions={[
          { label: 'Share Intake Portal', icon: Share2, onClick: () => setIsShareIntakeWhatsAppOpen(true) },
          { label: 'Import with AI', icon: Sparkles, onClick: () => setIsIntakeOpen(true) },
          { label: 'New Prescription', icon: FilePlus, onClick: () => openDrawer('rx-builder', 'new') },
          { label: 'From Clinical Protocol', icon: Stethoscope, onClick: () => setIsProtocolSearchOpen(true) },
          { label: 'Export CSV', icon: Download, onClick: handleExportCsv }
        ]}
        actions={!readOnly ? (
          <div className="prescriptions-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Secondary Action: Share Intake Portal (Link, WhatsApp, QR) */}
            <button
              type="button"
              onClick={() => setIsShareIntakeWhatsAppOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 14px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
              title="Share public prescription intake link (WhatsApp, direct URL, QR with attribution)"
            >
              <Share2 size={15} style={{ color: '#003666' }} />
              <span>Share Intake Portal</span>
            </button>

            {/* AI Action: Import with AI (PDF / Fagron Report) */}
            <button
              type="button"
              onClick={() => setIsIntakeOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '36px',
                padding: '0 14px',
                borderRadius: '8px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(29,78,216,0.05)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dbeafe';
                e.currentTarget.style.borderColor = '#93c5fd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#bfdbfe';
              }}
              title="Import and digitize medical prescription or Fagron Genomics report with Atlas AI"
            >
              <Sparkles size={15} style={{ color: '#2563eb' }} />
              <span>Import with AI</span>
            </button>

            {/* Primary Action: New Prescription with Non-Redundant Creation Options */}
            <PrimarySplitButton 
              mainAction={{
                label: "New Prescription",
                icon: <FilePlus size={16} />,
                onClick: () => {
                  openDrawer('rx-builder', 'new');
                }
              }}
              dropdownActions={[
                {
                  label: "From Clinical Protocol",
                  icon: <Stethoscope size={15} style={{ color: '#003666' }} />,
                  onClick: () => setIsProtocolSearchOpen(true)
                }
              ]}
            />
            <style jsx>{`
              @media (max-width: 640px) {
                .prescriptions-header-actions {
                  width: 100%;
                  flex-direction: column;
                  align-items: stretch !important;
                }
                .prescriptions-header-actions > :global(*) {
                  width: 100% !important;
                }
              }
            `}</style>
          </div>
        ) : null}
        searchPlaceholder="Search by patient, doctor, protocol or ID..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        enableAskAtlas={enableAskAtlas}
        askAtlasTopic="Prescription"
        resultCount={!loading && !algoliaLoading ? finalData.length : undefined}
        searchLoading={algoliaLoading}
        kpis={
          <>
            {hasNewData && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 16px',
                  marginBottom: '12px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1e40af',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  boxShadow: '0 1px 3px rgba(37,99,235,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                  <span><strong>New Prescriptions Available:</strong> A new prescription was recently saved or imported.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearNewData();
                    refresh?.();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Update view
                </button>
              </div>
            )}
            <PrescriptionsKPIs 
              serverKPIs={serverKPIs} 
              filteredCount={finalData.length} 
              isFiltered={isAlgoliaActive || (filterStatus && filterStatus.length > 0) || activeChips.length > 0} 
              doctorId={effectiveDoctorId}
            />
          </>
        }
        filters={activeChips}
        filterOptions={filterOptions}
        onClearAllFilters={handleClearAllFilters}
        data={finalData}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        isFetchingMore={isFetchingMore}
        isSearchActive={isAlgoliaActive}
        columns={columns}
        bulkActions={bulkActions}
        expandableRender={prescriptionExpandableRender}
        selectedIds={Array.from(selectedIds)}
        onSelectionChange={(newArr) => {
          setSelectedIds(new Set(newArr));
        }}
        onRowClick={(rx, toggleExpand) => { 
          if (rx._isSessionGroup && toggleExpand) {
            toggleExpand();
          } else {
            setSelectedItem(rx); 
            loadProductsLazy(); 
          }
        }}
        mobileCardComponent={MobilePrescriptionCard}
        mobileCardProps={mobileCardPropsForTable}
        emptyState={{
          title: "No prescriptions found",
          description: statusFilter || rangeFilter !== 'all' ? "No results match these filters. Try clearing them." : "Import your first prescription (PDF / Fagron) with AI or create one manually.",
          actionLabel: statusFilter || rangeFilter !== 'all' ? "Clear Filters" : "✨ Import with AI (PDF / Fagron)",
          onAction: () => {
            if (statusFilter || rangeFilter !== 'all') {
              router.replace(pathname);
            } else {
              setIsIntakeOpen(true);
            }
          }
        }}
      >
        {/* Mobile quick-action sheet for prescriptions */}
        <MobileActionSheet
          isOpen={!!mobileActionRx}
          onClose={() => setMobileActionRx(null)}
          title={`Rx #${mobileActionRx?.id?.slice(-6).toUpperCase() || ''}`}
          items={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: () => { setSelectedItem(mobileActionRx); loadProductsLazy(); },
            },
            {
              label: 'View Prescription',
              icon: Eye,
              onClick: () => { setSelectedItem(mobileActionRx); loadProductsLazy(); setMobileActionRx(null); },
            },
            {
              label: 'Refill / Re-prescribe',
              icon: RefreshCw,
              onClick: () => handleRefill(mobileActionRx),
            },
            {
              label: 'Cancel Prescription',
              icon: XCircle,
              variant: 'danger',
              onClick: () => {
                notifier?.confirmCritical(
                  `Cancel prescription for ${mobileActionRx?.patientName || 'this patient'}?`,
                  async () => {
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const { db } = await import('../../firebase');
                    await updateDoc(doc(db, 'prescriptions', mobileActionRx.id), { status: 'cancelled' });
                    toast.success('Prescription cancelled.');
                    refresh();
                  }
                );
              },
            },
          ]}
        />

        {/* Drawers and Modals */}

        {/* Skeleton Loader for URL-driven item */}
        {loadingUrlItem && !selectedItem && (
          <StandardDrawer
            title="Loading Prescription..."
            isOpen={true}
            onClose={() => {
              setLoadingUrlItem(false);
              updateUrlParam('id', '');
            }}
            width="60vw"
          >
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--surface-active)', animation: 'pulse 1.5s infinite' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ height: '24px', width: '40%', background: 'var(--surface-active)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ height: '16px', width: '25%', background: 'var(--surface-active)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                </div>
              </div>
              <div style={{ marginTop: '2rem', flex: 1, background: 'var(--surface-active)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
            </div>
          </StandardDrawer>
        )}

        {selectedItem && (
          <PrescriptionDetailModal 
            rx={selectedItem} 
            products={products}
            onClose={() => {
              setSelectedItem(null);
              updateUrlParam('id', '');
            }}
            onProtocolClick={(p) => setLinkedProtocol(p)}
            onProductClick={(prod) => setLinkedProduct(prod)}
            onEdit={handleEdit}
            onUpdateRx={(updatedRx) => {
              setSelectedItem(updatedRx);
              refresh();
            }}
          />
        )}

        {patientGuideRx && (
          <PatientAdministrationGuideModal
            isOpen={!!patientGuideRx}
            onClose={() => setPatientGuideRx(null)}
            rx={patientGuideRx}
            isDoctor={isDoctor}
          />
        )}

        {linkedProtocol && (
          <StandardDrawer
            title="Protocol Summary"
            isOpen={true}
            onClose={() => setLinkedProtocol(null)}
          >
            <ProtocolDrawerContent protocol={linkedProtocol} />
          </StandardDrawer>
        )}

        {linkedProduct && (
          <ProductDetailsDrawer
            isOpen={true}
            onClose={() => setLinkedProduct(null)}
            product={linkedProduct}
          />
        )}

        {editingRx && (
          <StandardDrawer
            isOpen={true}
            onClose={() => {
              setEditingRx(null);
              setInitialBuilderItems([]);
              setBuilderProtocolId(null);
              setBuilderProtocolName(null);
              setBuilderDoctorId(null);
              setBuilderDoctorName(null);
            }}
            title={editingRx === 'new' ? 'New Prescription' : `Edit Prescription #${editingRx.id?.slice(0, 6) || ''}`}
            subtitle={builderProtocolName ? `Based on protocol: ${builderProtocolName}` : undefined}
            width="85vw"
          >
            <div style={{ padding: '1rem' }}>
              <UniversalOrderBuilder
                mode="prescription"
                initialItems={initialBuilderItems}
                initialTarget={
                  editingRx !== 'new' && editingRx.patient
                    ? { id: editingRx.patient.id || editingRx.patientId, name: editingRx.patient.name || editingRx.patientName, type: 'patient' }
                    : null
                }
                initialProtocolId={builderProtocolId}
                initialProtocolName={builderProtocolName}
                initialDoctorId={builderDoctorId}
                initialDoctorName={builderDoctorName}
                onSaved={() => {
                  setEditingRx(null);
                  setInitialBuilderItems([]);
                  setBuilderProtocolId(null);
                  setBuilderProtocolName(null);
                  setBuilderDoctorId(null);
                  setBuilderDoctorName(null);
                  refresh();
                }}
                onCanceled={() => {
                  setEditingRx(null);
                  setInitialBuilderItems([]);
                  setBuilderProtocolId(null);
                  setBuilderProtocolName(null);
                  setBuilderDoctorId(null);
                  setBuilderDoctorName(null);
                }}
              />
            </div>
          </StandardDrawer>
        )}

        {isSourceSelectorOpen && (
          <SourceSelectorModal 
            onClose={() => setIsSourceSelectorOpen(false)}
            onSelectSource={(sourceId) => {
              setIsSourceSelectorOpen(false);
              // Clear previous builder context
              setInitialBuilderItems([]);
              setBuilderProtocolId(null);
              setBuilderProtocolName(null);
              setBuilderDoctorId(null);
              setBuilderDoctorName(null);

              if (sourceId === PRESCRIPTION_SOURCES.PROTOCOL) {
                setIsProtocolSearchOpen(true);
              } else if (sourceId === PRESCRIPTION_SOURCES.ITEMS || sourceId === PRESCRIPTION_SOURCES.MANUAL) {
                // Open builder directly with no pre-loaded items
                openDrawer('rx-builder', 'new');
              } else {
                // Import / AI / Fagron flows use the intake workspace
                setIsIntakeOpen(true);
              }
            }}
          />
        )}

        {isProtocolSearchOpen && (
          <StandardDrawer
            isOpen={true}
            onClose={() => setIsProtocolSearchOpen(false)}
            title="Select Base Protocol"
            subtitle="Doses and quantities will be calculated automatically."
          >
            <div style={{ padding: '1rem' }}>
              <BuilderProtocolSearch 
                onSelectProtocol={(protocolData) => {
                  setIsProtocolSearchOpen(false);
                  openDrawer('rx-builder', 'new', { 
                    initialProtocolId: protocolData.protocolId,
                    initialProtocolName: protocolData.protocolName,
                    initialDoctorId: protocolData.doctorId,
                    initialDoctorName: protocolData.doctorName,
                    initialItems: protocolData.prescriptionLines 
                  });
                }} 
              />
            </div>
          </StandardDrawer>
        )}

        {isIntakeOpen && (
          <PrescriptionIntakeWorkspace
            isOpen={true}
            onClose={() => setIsIntakeOpen(false)}
            onSaveSuccess={() => {
              clearNewData();
              refresh?.();
            }}
          />
        )}

        <ShareIntakeWhatsAppModal
          isOpen={isShareIntakeWhatsAppOpen}
          onClose={() => {
            setIsShareIntakeWhatsAppOpen(false);
            setSelectedShareRx(null);
          }}
          rx={selectedShareRx}
        />
      </DataModule>
    </>
  );
}
