"use client";
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Command, Loader, Clock, ChevronDown, Filter, QrCode, ArrowUpRight, User, Edit3, Repeat } from '@/lib/icons';
import '../../styles/search.css';
import MultiSelectFilter from './MultiSelectFilter';
import SingleSelectFilter from './SingleSelectFilter';
import MobileFiltersSheet from '../mobile/MobileFiltersSheet';
import QrScannerModal from '../shared/QrScannerModal';
import { searchAlgolia, searchAlgoliaFederated } from '@/services/algoliaSearch';
import { trackSearchClick } from '@/services/algoliaInsights';

/**
 * GlobalSearchBar
 * ─────────────────────────────────────────────────────────────────────────────
 * A premium, modular search bar component. Designed to be visually prominent
 * and used across ALL modules as the FIRST element users see (Golden Rule #7).
 *
 * Features:
 * - ⌘K / Ctrl+K keyboard shortcut to focus
 * - Recent searches stored in localStorage per namespace
 * - Instant feedback with debouncing
 * - Result count badge
 * - Loading/searching state
 * - Clear button (×) and Escape key
 * - Integrated filter chips/pills (prop: `filters`) — visually attached below input
 * - Configurable placeholder, size, and namespace
 *
 * @param {string}    value           — Controlled search term value
 * @param {Function}  onChange        — Called on every keystroke with the new term
 * @param {string}    placeholder     — Input placeholder text
 * @param {number}    resultCount     — If set, shows a "N results" badge
 * @param {boolean}   isLoading       — Shows a spinner if true
 * @param {string}    namespace       — Key for localStorage recent searches (e.g. 'products')
 * @param {string}    size            — 'sm' | 'md' | 'lg'. Default: 'md'
 * @param {boolean}   showShortcut    — Show ⌘K hint. Default: true
 * @param {boolean}   showRecent      — Show recent searches dropdown. Default: true
 * @param {string}    className       — Extra CSS class
 * @param {Function}  onFocus         — Called when input is focused
 * @param {Function}  onBlur          — Called when input is blurred
 *
 * @param {Array}     filters         — Active filter chips to display below the bar.
 *   Each filter: { key: string, label: string, value: string, onRemove: () => void }
 *   Example: [{ key: 'status', label: 'Estado', value: 'Activo', onRemove: () => setStatus(null) }]
 *
 * @param {Array}     filterOptions   — Optional quick-filter buttons shown inside the bar to the right.
 *   Each option: { key: string, label: string, options: [{label, value}], value: any, onChange: (val) => void }
 *   Renders as compact dropdown pills inside the search bar row.
 *
 * @example — Main module usage:
 * <GlobalSearchBar
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   placeholder="Search clients, status, email..."
 *   resultCount={totalClients}
 *   namespace="admin-clients"
 *   size="lg"
 *   filters={[
 *     statusFilter && { key: 'status', label: 'Estado', value: statusFilter, onRemove: () => setStatusFilter(null) }
 *   ].filter(Boolean)}
 *   filterOptions={[
 *     { key: 'status', label: 'Estado', options: [{label:'Todos',value:''},{label:'Activo',value:'active'}], value: statusFilter, onChange: setStatusFilter }
 *   ]}
 * />
 */
const CONTEXTUAL_PLACEHOLDERS = {
  labels: {
    desktop: {
      en: 'Search patient, Rx code (#BOX..., #RX...), test or formula...',
      es: 'Buscar paciente, código (#BOX..., #RX...), test o fórmula...',
    },
    mobile: {
      en: 'Patient, Rx code, formula...',
      es: 'Paciente, receta, fórmula...',
    },
  },
  prescriptions: {
    desktop: {
      en: 'Search prescriptions by patient, doctor, #RX or diagnosis...',
      es: 'Buscar recetas por paciente, médico, #RX o diagnóstico...',
    },
    mobile: {
      en: 'Patient, doctor, #RX...',
      es: 'Paciente, médico, #RX...',
    },
  },
  patients: {
    desktop: {
      en: 'Search patients by full name, file #, email or phone...',
      es: 'Buscar pacientes por nombre, expediente, email o tel...',
    },
    mobile: {
      en: 'Patient name, file #...',
      es: 'Nombre, expediente...',
    },
  },
  users: {
    desktop: {
      en: 'Search users, doctors or clients by name, email, company...',
      es: 'Buscar usuarios, médicos o clientes por nombre, email...',
    },
    mobile: {
      en: 'User, doctor, email...',
      es: 'Usuario, médico, email...',
    },
  },
  suppliers: {
    desktop: {
      en: 'Search suppliers, GMP labs or orders by company, country...',
      es: 'Buscar proveedores, laboratorios GMP u órdenes...',
    },
    mobile: {
      en: 'Supplier, lab, country...',
      es: 'Proveedor, laboratorio...',
    },
  },
  protocols: {
    desktop: {
      en: 'Search protocols by clinical indication, title, biomarker...',
      es: 'Buscar protocolos por indicación clínica, título...',
    },
    mobile: {
      en: 'Protocol, indication...',
      es: 'Protocolo, indicación...',
    },
  },
  pellets: {
    desktop: {
      en: 'Search pellets by hormone, dose, trocar or SKU (Estradiol, 12.5mg)...',
      es: 'Buscar pellets por hormona, dosis, trócar o SKU (Estradiol, 12.5mg)...',
    },
    mobile: {
      en: 'Hormone, dose, trocar...',
      es: 'Hormona, dosis, trócar...',
    },
  },
  dnlabPens: {
    desktop: {
      en: 'Search pens by peptide, category, clicks or dose (BPC-157, GHK-Cu)...',
      es: 'Buscar pens por péptido, categoría, clics o dosis (BPC-157, GHK-Cu)...',
    },
    mobile: {
      en: 'Peptide, category, dose...',
      es: 'Péptido, categoría, dosis...',
    },
  },
  genomics: {
    desktop: {
      en: 'Search DNA panels by name, genes or category (Health, CYP450)...',
      es: 'Buscar paneles ADN por nombre, genes o categoría...',
    },
    mobile: {
      en: 'DNA panel, gene...',
      es: 'Panel ADN, gen...',
    },
  },
  products: {
    desktop: {
      en: 'Search peptides by molecule, sequence, CAS # or vial format...',
      es: 'Buscar péptidos por molécula, secuencia, CAS o vial...',
    },
    mobile: {
      en: 'Peptide, CAS, vial...',
      es: 'Péptido, CAS, vial...',
    },
  },
  local: {
    desktop: {
      en: 'Filter table records by any term, ID, status or date...',
      es: 'Filtrar registros por término, ID, estado o fecha...',
    },
    mobile: {
      en: 'Filter records by ID...',
      es: 'Filtrar por ID, estado...',
    },
  },
};

const resolveSuggestionPartsCount = (r = {}) => {
  if (typeof r.partsCount === 'number' && r.partsCount > 0) {
    const removedLen = Array.isArray(r.removedParts) ? r.removedParts.length : 0;
    return Math.max(1, r.partsCount - removedLen);
  }
  if (Array.isArray(r.formulationBlocks) && r.formulationBlocks.length > 0) return r.formulationBlocks.length;
  if (Array.isArray(r.pharmacyLabels) && r.pharmacyLabels.length > 0) return r.pharmacyLabels.length;
  if (Array.isArray(r.parts) && r.parts.length > 0) return r.parts.length;
  if (Array.isArray(r.phases) && r.phases.length > 0) return r.phases.length;
  if (typeof r.parts === 'number' && r.parts > 0) return r.parts;
  return 1;
};

const formatClinicalDate = (raw, lang = 'en') => {
  if (!raw) return '';
  try {
    const d = typeof raw === 'number'
      ? new Date(raw)
      : typeof raw?.toDate === 'function'
      ? raw.toDate()
      : typeof raw?._seconds === 'number'
      ? new Date(raw._seconds * 1000)
      : new Date(raw);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
};

export default function GlobalSearchBar({
  value,
  searchTerm,
  onChange,
  onSearchChange,
  placeholder = 'Search...',
  resultCount,
  isLoading = false,
  namespace = 'global',
  size = 'md',
  showShortcut = true,
  showRecent = true,
  className = '',
  onFocus,
  onBlur,
  lang = 'en',
  searchScope,           // 'clinical' | 'patients' | 'users' | 'suppliers' | 'protocols' | 'products' | 'local'
  disableAlgolia = false,// explicitly disable Algolia queries (pure local filter)
  // Integrated filters (Golden Rule #7)
  filters = [],          // Active filter chips rendered below the bar
  filterOptions = [],    // Quick-filter dropdowns rendered inside the bar
}) {
  const effectiveValue = value !== undefined ? value : (searchTerm !== undefined ? searchTerm : '');
  const effectiveOnChange = onChange || onSearchChange;
  const router = useRouter();
  const inputRef = useRef(null);
  const skipNextSuggestionsRef = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  // Scope & Context Resolution (Strict Relevance Audit)
  const isExplicitLocal = disableAlgolia || searchScope === 'local';
  const inferredLocal =
    (namespace || '').includes('-logs') ||
    (namespace || '').includes('-costs') ||
    (namespace || '').includes('-templates') ||
    (namespace || '').includes('-backups') ||
    (namespace || '').includes('-gadgets') ||
    (namespace || '').includes('-approvals') ||
    (namespace || '').includes('-commissions') ||
    (namespace || '').includes('payables');
  const isLocalOnly = isExplicitLocal || inferredLocal;

  const isLabelsPage = searchScope === 'clinical' || (namespace || '').includes('label') || currentPath.includes('/labels');
  const isPatientsPage = searchScope === 'patients' || (namespace || '').includes('patient') || currentPath.includes('/patients');
  const isSuppliersPage = searchScope === 'suppliers' || (namespace || '').includes('supplier') || (namespace || '').includes('procurement') || currentPath.includes('/procurement') || currentPath.includes('/suppliers');
  const isPrescriptionsPage = searchScope === 'clinical' || (namespace || '').includes('prescription') || currentPath.includes('/prescriptions') || currentPath.includes('/rx') || isLabelsPage;
  const isProtocolsPage = searchScope === 'protocols' || (namespace || '').includes('protocol') || currentPath.includes('/proto');
  const isUsersPage = !isPatientsPage && (searchScope === 'users' || (namespace || '').includes('user') || (namespace || '').includes('customer') || currentPath.includes('/users') || currentPath.includes('/customers'));
  const isProductsPage = searchScope === 'products' || (namespace || '').includes('product') || (namespace || '').includes('vial') || (namespace || '').includes('catalog') || currentPath.includes('/vials') || currentPath.includes('/pricing/peptides') || currentPath.includes('/admin/products');
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`atlas-search-${namespace}`) || '[]');
    } catch {
      return [];
    }
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [openFilterKey, setOpenFilterKey] = useState(null); // For filter dropdowns
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debounced Algolia instant suggestions query & Natural Language /ai support
  useEffect(() => {
    if (skipNextSuggestionsRef.current) {
      skipNextSuggestionsRef.current = false;
      setShowDropdown(false);
      return;
    }

    if (isLocalOnly) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    const trimmedVal = (effectiveValue || '').trim();
    if (trimmedVal.startsWith('/ai') || trimmedVal.startsWith('/copilot')) {
      const q = trimmedVal.replace(/^\/(ai|copilot)\s*/i, '').trim();
      setSuggestions([
        {
          key: 'ai_prompt_entry',
          id: 'atlas_ai',
          name: q ? `Ask Atlas AI: "${q}"` : 'Ask Atlas AI (type question & press Enter)',
          category: 'AI Omnibar',
          isAiPrompt: true,
          query: q,
        }
      ]);
      setShowDropdown(true);
      setIsSearchingSuggestions(false);
      setSelectedIndex(0);
      return;
    }

    if (!effectiveValue || effectiveValue.trim().length < 2) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    let isMounted = true;
    setIsSearchingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        if (isPatientsPage) {
          const res = await searchAlgoliaFederated(effectiveValue.trim(), ['atlas_patients'], 8);
          if (isMounted) {
            const patientHits = (res.patients || []).map((p) => ({
              key: p.objectID || p.id,
              id: p.objectID || p.id,
              name: (p.name || p.fullName || 'Patient').trim(),
              email: p.email || '',
              phone: p.phone || '',
              category: 'PATIENT',
              status: p.status || 'active',
              indexName: 'atlas_patients'
            }));
            setSuggestions(patientHits);
            if (patientHits.length > 0 && isFocused) {
              setShowDropdown(true);
            }
          }
        } else if (isSuppliersPage) {
          const res = await searchAlgoliaFederated(effectiveValue.trim(), ['suppliers'], 8);
          if (isMounted) {
            const supplierHits = (res.suppliers || []).map((s) => ({
              key: s.objectID || s.id,
              id: s.objectID || s.id,
              name: (s.name || s.companyName || s.displayName || 'Supplier').trim(),
              country: s.country || '',
              category: (s.category || 'SUPPLIER').toUpperCase(),
              status: s.status || s.statusB2B || 'active',
              indexName: 'suppliers'
            }));
            setSuggestions(supplierHits);
            if (supplierHits.length > 0 && isFocused) {
              setShowDropdown(true);
            }
          }
        } else if (isLabelsPage || isPrescriptionsPage) {
          const res = await searchAlgoliaFederated(effectiveValue.trim(), ['atlas_patients', 'prescriptions'], 10);
          if (isMounted) {
            // ── PATIENTS: deduplicate by normalized name, sort alphabetically ──
            const seenPatients = new Set();
            const patientHits = [];
            for (const p of (res.patients || [])) {
              const pName = (p.name || p.fullName || '').trim();
              const normName = pName.toLowerCase();
              if (!normName || seenPatients.has(normName)) continue;
              seenPatients.add(normName);
              patientHits.push({
                key: `patient_${p.objectID || p.id}`,
                id: p.objectID || p.id,
                name: pName,
                email: p.email || '',
                phone: p.phone || '',
                location: [p.city, p.country].filter(Boolean).join(', '),
                category: 'PATIENT',
                status: p.status || 'active',
                indexName: 'atlas_patients',
                _group: 'patient'
              });
              if (patientHits.length >= 4) break;
            }
            patientHits.sort((a, b) => a.name.localeCompare(b.name));

            // ── PRESCRIPTIONS: enrich with dates, rootCode, partsCount ──
            const seenRx = new Set();
            const rxRaw = [];
            for (const r of (res.prescriptions || [])) {
              const codeStr = (r.prescriptionCode || r.code || r.fileNumber || `RX-${(r.id || '').slice(0, 6)}`).trim();
              const normCode = codeStr.toLowerCase();
              if (!normCode || seenRx.has(normCode)) continue;
              seenRx.add(normCode);
              // Extract root kit code (e.g. "BOX03048" from "BOX03048AATRI", "RX-BOX03048AATEL", or "BOX03048AATRI-R1")
              const rootCode = codeStr
                .replace(/^RX-/i, '')
                .replace(/-R\d+$/i, '')
                .replace(/[A-Z]{2,}$/i, '');
              // Format dates
              const importedDateStr = formatClinicalDate(r.importedAt || r.createdAt || r.uploadedAt, lang);
              const sampleDateStr = formatClinicalDate(r.prescriptionDate || r.sampleDate || r.reportDate || r.date, lang);
              const dateTs = r.importedAt
                ? (typeof r.importedAt === 'string' ? new Date(r.importedAt).getTime() : r.importedAt?._seconds ? r.importedAt._seconds * 1000 : Number(r.importedAt))
                : 0;
              rxRaw.push({
                key: `rx_${r.objectID || r.id}`,
                id: r.objectID || r.id,
                code: codeStr,
                name: codeStr,
                rootCode,
                patientName: (r.patientName || '').trim(),
                title: r.treatmentTitle || r.medication || r.title || '',
                doctorName: r.doctorName || '',
                partsCount: resolveSuggestionPartsCount(r),
                importedDateStr,
                sampleDateStr,
                dateTs,
                category: 'PRESCRIPTION',
                status: r.status || 'approved',
                indexName: 'prescriptions',
                _group: 'prescription'
              });
              if (rxRaw.length >= 6) break;
            }
            // Sort: by patientName asc → rootCode asc → dateTs desc (sister rx adjacent)
            rxRaw.sort((a, b) =>
              a.patientName.localeCompare(b.patientName) ||
              a.rootCode.localeCompare(b.rootCode) ||
              b.dateTs - a.dateTs
            );

            const combined = [...patientHits, ...rxRaw];
            setSuggestions(combined);
            if (combined.length > 0 && isFocused) {
              setShowDropdown(true);
            }
          }
        } else if (isUsersPage) {
          const res = await searchAlgoliaFederated(effectiveValue.trim(), ['atlas_users'], 8);
          if (isMounted) {
            const userHits = (res.users || []).map((u) => {
              const displayName = (u.name || u.fullName || u.displayName || u.email || 'User').trim();
              const roleStr = (u.role || (Array.isArray(u.roles) && u.roles[0]) || 'user').toUpperCase();
              return {
                key: u.objectID || u.id,
                id: u.objectID || u.id,
                name: displayName,
                email: u.email || '',
                phone: u.phone || '',
                company: u.companyName || u.institution || '',
                category: roleStr,
                role: u.role || 'user',
                status: u.status || 'active',
                indexName: 'atlas_users'
              };
            });
            setSuggestions(userHits);
            if (userHits.length > 0 && isFocused) {
              setShowDropdown(true);
            }
          }
        } else if (isProductsPage || isProtocolsPage || namespace === 'global') {
          const res = await searchAlgolia(effectiveValue.trim());
          if (isMounted) {
            // Products are now natively deduplicated by Algolia (attributeForDistinct: canonicalKey)
            const seenProdKeys = new Set();
            const prods = [];
            for (const p of (res.products || [])) {
              let key = (p.canonicalKey || p.canonicalName || '').trim().toLowerCase();
              if (!key) {
                const rawName = (p.name || p.productName || '').toLowerCase().trim();
                key = rawName
                  .replace(/^api[-_\s]+/i, '')
                  .replace(/\b(bulk\s+api\s+powder|bulk\s+api|api\s+powder|api|bulk|powder|raw\s+material)\b/gi, '')
                  .trim();
              }
              if (!key || seenProdKeys.has(key)) continue;
              seenProdKeys.add(key);

              let displayName = (p.canonicalName || p.name || p.productName || '').trim();
              if (displayName.toLowerCase().includes('bulk api powder')) {
                displayName = displayName.replace(/\s*bulk\s*api\s*powder/i, '').trim();
              }
              const varCount = Number(p.variantsCount || p.variantCount || 1);

              prods.push({
                key,
                id: p.productId || p.objectID || p.id,
                name: displayName,
                category: p.category === 'api_peptide' ? 'Peptide' : (p.category || 'Peptide'),
                variantCount: varCount,
                indexName: 'products'
              });
              if (prods.length >= (isProtocolsPage ? 4 : 8)) break;
            }

            // Deduplicate protocols by title
            const seenProtoKeys = new Set();
            const protos = [];
            for (const p of (res.protocols || [])) {
              const rawTitle = (p.title || p.name || '').trim();
              const key = rawTitle.toLowerCase();
              if (!key || seenProtoKeys.has(key)) continue;
              seenProtoKeys.add(key);

              protos.push({
                key,
                id: p.objectID || p.id,
                name: rawTitle,
                category: 'Protocol',
                indexName: 'protocols'
              });
              if (protos.length >= (isProtocolsPage ? 8 : 4)) break;
            }

            // Contextual ordering: if on protocols page, show protocols first; otherwise products first
            const combined = (isProtocolsPage ? [...protos, ...prods] : [...prods, ...protos]).slice(0, 10);
            setSuggestions(combined);
            if (combined.length > 0 && isFocused) {
              setShowDropdown(true);
            }
          }
        } else {
          // Internal operational tabs (audit, logs, costs, commissions, etc.) do NOT show catalog APIs
          if (isMounted) setSuggestions([]);
        }
      } catch {
        if (isMounted) setSuggestions([]);
      } finally {
        if (isMounted) setIsSearchingSuggestions(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [effectiveValue, isFocused]);

  const effectivePlaceholder = useMemo(() => {
    const lc = lang === 'es' ? 'es' : 'en';
    const mode = isMobile ? 'mobile' : 'desktop';
    const ns = (namespace || '').toLowerCase();
    const path = (currentPath || '').toLowerCase();

    const isPelletsContext = ns.includes('pellet') || path.includes('/pricing/pellets');
    const isDnLabPensContext = ns.includes('dnlab') || path.includes('/pricing/dnlab-pens');
    const isGenomicsContext = ns.includes('genomic') || ns.includes('genetic') || path.includes('/pricing/24genetics');

    // Explicit contextual resolution from the unified matrix (Desktop detailed vs Mobile ≤ 28 chars)
    if (isPelletsContext) return CONTEXTUAL_PLACEHOLDERS.pellets[mode][lc];
    if (isDnLabPensContext) return CONTEXTUAL_PLACEHOLDERS.dnlabPens[mode][lc];
    if (isGenomicsContext) return CONTEXTUAL_PLACEHOLDERS.genomics[mode][lc];
    if (isLabelsPage) return CONTEXTUAL_PLACEHOLDERS.labels[mode][lc];
    if (isPrescriptionsPage) return CONTEXTUAL_PLACEHOLDERS.prescriptions[mode][lc];
    if (isPatientsPage) return CONTEXTUAL_PLACEHOLDERS.patients[mode][lc];
    if (isSuppliersPage) return CONTEXTUAL_PLACEHOLDERS.suppliers[mode][lc];
    if (isUsersPage) return CONTEXTUAL_PLACEHOLDERS.users[mode][lc];
    if (isProtocolsPage) return CONTEXTUAL_PLACEHOLDERS.protocols[mode][lc];
    if (isProductsPage) return CONTEXTUAL_PLACEHOLDERS.products[mode][lc];

    // If a non-default explicit placeholder was supplied, use it on desktop and intelligently condense for mobile
    const isGenericPlaceholder = !placeholder || /^(search|buscar)\.{0,3}$/i.test(placeholder.trim());
    if (!isGenericPlaceholder) {
      if (isMobile && placeholder.length > 28) {
        const cleaned = placeholder
          .replace(/^(search|buscar|filter|filtrar)\s+(by|por|for|para)?\s*/i, '')
          .replace(/\s*\(.*?\)\s*/g, '')
          .trim();
        const shortened = cleaned.length > 26 ? `${cleaned.slice(0, 25).trim()}…` : `${cleaned}…`;
        return shortened.charAt(0).toUpperCase() + shortened.slice(1);
      }
      return placeholder;
    }

    return CONTEXTUAL_PLACEHOLDERS.local[mode][lc];
  }, [isMobile, placeholder, namespace, currentPath, isLabelsPage, isPrescriptionsPage, isPatientsPage, isSuppliersPage, isUsersPage, isProductsPage, isProtocolsPage, lang]);

  // ⌘K / Ctrl+K global shortcut & focus-global-search event listener
  useEffect(() => {
    const keyHandler = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    const focusHandler = () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    document.addEventListener('keydown', keyHandler);
    window.addEventListener('focus-global-search', focusHandler);
    return () => {
      document.removeEventListener('keydown', keyHandler);
      window.removeEventListener('focus-global-search', focusHandler);
    };
  }, []);

  // Close filter dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.atlas-search__filter-pill')) {
        setOpenFilterKey(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if ((showRecent && recentSearches.length > 0 && !value) || (value && suggestions.length > 0)) {
      setShowDropdown(true);
    }
    onFocus?.();
  }, [recentSearches, value, showRecent, suggestions.length, onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTimeout(() => setShowDropdown(false), 200);
    onBlur?.();
  }, [onBlur]);

  const handleChange = useCallback(
    (e) => {
      skipNextSuggestionsRef.current = false;
      const term = e.target.value;
      effectiveOnChange?.(term);
      if (!term) {
        setShowDropdown(showRecent && recentSearches.length > 0);
      } else if (term.trim().length >= 2) {
        setShowDropdown(true);
      }
    },
    [effectiveOnChange, showRecent, recentSearches]
  );

  const handleClear = useCallback(() => {
    skipNextSuggestionsRef.current = false;
    effectiveOnChange?.('');
    inputRef.current?.focus();
    if (showRecent && recentSearches.length > 0) {
      setShowDropdown(true);
    }
  }, [effectiveOnChange, showRecent, recentSearches]);

  const saveRecentSearch = useCallback(
    (term) => {
      if (!term || !term.trim()) return;
      const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
      setRecentSearches(updated);
      try {
        localStorage.setItem(`atlas-search-${namespace}`, JSON.stringify(updated));
      } catch (err) {
        console.debug('Failed to save recent search:', err);
      }
    },
    [recentSearches, namespace]
  );

  const handleSuggestionClick = useCallback(
    (item) => {
      skipNextSuggestionsRef.current = true;
      setShowDropdown(false);
      setSuggestions([]);
      setSelectedIndex(-1);

      // Natural Language /ai suggestion click
      if (item.isAiPrompt) {
        window.dispatchEvent(new CustomEvent('open-atlas-ai', { detail: { query: item.query } }));
        saveRecentSearch(item.name);
        effectiveOnChange?.('');
        return;
      }

      saveRecentSearch(item.name);
      trackSearchClick({
        indexName: item.indexName || (isUsersPage ? 'atlas_users' : isPatientsPage ? 'atlas_patients' : isSuppliersPage ? 'suppliers' : 'products'),
        objectID: item.id,
        eventName: 'GlobalSearchBar Suggestion Clicked'
      });

      // User & Patient suggestions: select directly into search input without navigating
      if (item.indexName === 'atlas_users' || item.indexName === 'atlas_patients') {
        effectiveOnChange?.(item.name || item.email || '');
        inputRef.current?.focus();
        return;
      }

      // Suppliers in procurement
      if (item.indexName === 'suppliers') {
        effectiveOnChange?.(item.name || '');
        inputRef.current?.focus();
        return;
      }

      // Prescriptions in prescriptions tab
      if (item.indexName === 'prescriptions') {
        effectiveOnChange?.(item.name || '');
        inputRef.current?.focus();
        return;
      }

      // Cross-entity navigation between Products and Protocols
      if (!isProtocolsPage && item.indexName === 'protocols') {
        router.push(`/admin/protocols?selected=${encodeURIComponent(item.id)}&q=${encodeURIComponent(item.name)}`);
        return;
      }
      if (isProtocolsPage && item.indexName === 'products') {
        router.push(`/admin/products?selected=${encodeURIComponent(item.id)}&q=${encodeURIComponent(item.name)}`);
        return;
      }

      // In-page selection
      effectiveOnChange?.(item.name);
      inputRef.current?.focus();
    },
    [effectiveOnChange, saveRecentSearch, isProtocolsPage, isUsersPage, isPatientsPage, isSuppliersPage, router]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        setShowDropdown(true);
        return;
      }
      if (e.key === 'ArrowUp' && suggestions.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        return;
      }
      if (e.key === 'Enter') {
        const trimmed = (effectiveValue || '').trim();
        if (trimmed.startsWith('/ai') || trimmed.startsWith('/copilot')) {
          e.preventDefault();
          const query = trimmed.replace(/^\/(ai|copilot)\s*/i, '').trim();
          window.dispatchEvent(new CustomEvent('open-atlas-ai', { detail: { query } }));
          saveRecentSearch(trimmed);
          setShowDropdown(false);
          setSelectedIndex(-1);
          effectiveOnChange?.('');
          return;
        }

        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
          return;
        }
        if (trimmed) {
          saveRecentSearch(trimmed);
          setShowDropdown(false);
        }
      }
      if (e.key === 'Escape') {
        handleClear();
      }
    },
    [effectiveValue, suggestions, selectedIndex, handleSuggestionClick, saveRecentSearch, handleClear, effectiveOnChange]
  );

  const handleRecentClick = useCallback(
    (term) => {
      effectiveOnChange?.(term);
      setShowDropdown(false);
      inputRef.current?.focus();
    },
    [effectiveOnChange]
  );

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(`atlas-search-${namespace}`);
    } catch (err) {
      console.debug('Failed to clear recent searches:', err);
    }
    setShowDropdown(false);
  }, [namespace]);

  const sizeConfig = {
    sm: { height: '34px', fontSize: '0.8rem',  iconSize: 15 },
    md: { height: '40px', fontSize: '0.875rem', iconSize: 17 },
    lg: { height: '48px', fontSize: '0.95rem',  iconSize: 18 },
  };
  const { height, iconSize } = sizeConfig[size] || sizeConfig.md;

  const hasActiveFilters = filters && filters.length > 0;
  const hasFilterOptions  = filterOptions && filterOptions.length > 0;

  return (
    <>
      <div className={`search-bar-wrap atlas-search-size-${size} ${className}`} style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>

        {/* ── INPUT ROW ──────────────────────────────────────────────────── */}
        <div
          className={`atlas-search__input-wrap ${isFocused ? 'focused' : ''} ${hasActiveFilters ? 'has-active-filters' : ''}`}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Interactive search icon button / micro-spinner (GCP Standard) */}
          <button
            type="button"
            className={`atlas-search__icon-btn ${isFocused || Boolean(effectiveValue) ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.focus();
              inputRef.current?.select();
            }}
            aria-label={lang === 'es' ? 'Enfocar buscador' : 'Focus search'}
            title={lang === 'es' ? 'Buscar (⌘K)' : 'Search (⌘K)'}
          >
            {isLoading || isSearchingSuggestions ? (
              <Loader size={iconSize} color="#1a73e8" className="atlas-search__spinner" />
            ) : (
              <Search size={iconSize} />
            )}
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            className="atlas-search__input"
            placeholder={effectivePlaceholder}
            value={effectiveValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Result count badge */}
          {resultCount !== undefined && !isLoading && (
            <span className="atlas-search__count">
              {resultCount.toLocaleString()} {lang === 'es' ? (resultCount === 1 ? 'resultado' : 'resultados') : (resultCount === 1 ? 'result' : 'results')}
            </span>
          )}

          {/* Clear button */}
          {effectiveValue && (
            <button
              type="button"
              className="atlas-search__clear"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              aria-label={lang === 'es' ? 'Limpiar búsqueda' : 'Clear search'}
              title={lang === 'es' ? 'Limpiar búsqueda (Esc)' : 'Clear search (Esc)'}
            >
              <X size={14} />
            </button>
          )}

          {/* QR / Barcode Scanner trigger button */}
          <button
            type="button"
            className="atlas-search__qr-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsQrModalOpen(true);
            }}
            title="Scan vial or product QR barcode"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.3rem',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <QrCode size={15} />
          </button>

          {/* ── Quick-filter inline pills (separated by a divider) ── */}
          {hasFilterOptions && (
            <>
              <div className="atlas-search__divider" />
              {isMobile ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileSheetOpen(true);
                  }}
                  aria-label="Open filter options"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0 0.65rem',
                    height: '36px',
                    borderRadius: '4px',
                    backgroundColor: hasActiveFilters ? '#e8f0fe' : '#ffffff',
                    border: hasActiveFilters ? '1px solid #1a73e8' : '1px solid #dadce0',
                    color: hasActiveFilters ? '#1a73e8' : '#3c4043',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
                  }}
                >
                  <Filter size={13} color={hasActiveFilters ? '#1a73e8' : '#5f6368'} />
                  <span>Filters</span>
                  {filters.length > 0 && (
                    <span style={{
                      background: '#1a73e8',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.62rem',
                      fontWeight: 700
                    }}>
                      {filters.length}
                    </span>
                  )}
                </button>
              ) : (
                filterOptions.map((fo, idx) => {
                  const uniqueKey = fo.id || fo.key || fo.label || `fo-${idx}`;

                  // Multi-select mode — uses MultiSelectFilter component
                  if (fo.multiSelect) {
                    return (
                      <MultiSelectFilter
                        key={uniqueKey}
                        label={fo.label}
                        values={fo.values || []}
                        options={fo.options || []}
                        onChange={fo.onChange}
                        maxWidth={fo.maxWidth || 240}
                      />
                    );
                  }

                  // Modern single-select pill with portal & micro-badges
                  return (
                    <SingleSelectFilter
                      key={uniqueKey}
                      label={fo.label}
                      value={fo.value || ''}
                      options={fo.options || []}
                      onChange={fo.onChange}
                      maxWidth={fo.maxWidth || 200}
                    />
                  );
                })
              )}
            </>
          )}

          {/* ⌘K shortcut hint */}
          {showShortcut && !value && !isFocused && !hasFilterOptions && (
            <span
              className="atlas-search__shortcut"
              onClick={() => inputRef.current?.focus()}
              title="Press ⌘K or Ctrl+K to search"
            >
              <Command size={10} />K
            </span>
          )}
        </div>

        {/* ── ACTIVE FILTER CHIPS ZONE (attached below input) ──────────── */}
        {hasActiveFilters && (
          <div
            className="atlas-search__chips-zone"
            style={{ position: 'absolute', top: height, left: 0, right: 0, zIndex: 10 }}
          >
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem', flexShrink: 0 }}>
              ACTIVE FILTERS:
            </span>
            {filters.map((filter, idx) => {
              if (!filter) return null;
              const rawLabel = (filter.label || '').trim();
              const hasValue = filter.value !== undefined && filter.value !== null && filter.value !== '';
              const cleanLabel = rawLabel.endsWith(':') ? rawLabel.slice(0, -1) : rawLabel;

              return (
                <span key={filter.key || filter.id || `filter-${idx}`} className="atlas-search__chip">
                  {cleanLabel && (
                    <span className="atlas-search__chip-label">
                      {cleanLabel}{hasValue ? ':' : ''}
                    </span>
                  )}
                  {hasValue && <span>{filter.value}</span>}
                  {filter.onRemove && (
                    <button className="atlas-search__chip-remove" onClick={filter.onRemove} title={`Remove ${cleanLabel || filter.value} filter`}>
                      <X size={10} />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* ── ALGLOLIA INSTANT SUGGESTIONS DROPDOWN ───────────────────── */}
        {showDropdown && (effectiveValue || '').trim().length >= 2 && (
          <div className="atlas-search__dropdown" style={{ zIndex: 100 }}>
            <div style={{ padding: '0.5rem 1rem 0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {(effectiveValue || '').trim().startsWith('/ai')
                  ? '🤖 Atlas AI'
                  : isLabelsPage
                  ? (lang === 'es' ? 'Pacientes y Recetas (Algolia)' : 'Patients & Prescriptions (Algolia)')
                  : isPatientsPage
                  ? 'Patients (Algolia)'
                  : isSuppliersPage
                  ? 'Suppliers (Algolia)'
                  : isPrescriptionsPage
                  ? (lang === 'es' ? 'Recetas y Pacientes (Algolia)' : 'Prescriptions & Patients (Algolia)')
                  : isProtocolsPage
                  ? 'Protocols (Algolia)'
                  : isUsersPage
                  ? 'Users & Accounts (Algolia)'
                  : 'Algolia Suggestions'}
              </span>
              {isSearchingSuggestions && <Loader size={12} className="atlas-search__spinner" />}
            </div>
            {suggestions.length === 0 && !isSearchingSuggestions ? (
              <div style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isLabelsPage || isPrescriptionsPage
                  ? (lang === 'es' ? 'No se encontraron pacientes ni recetas coincidentes' : 'No patient or prescription matches found')
                  : isPatientsPage
                  ? 'No patient matches found'
                  : isSuppliersPage
                  ? 'No supplier matches found'
                  : isUsersPage
                  ? 'No user matches found'
                  : 'No clinical matches found'}
              </div>
            ) : (isLabelsPage || isPrescriptionsPage) ? (() => {
              // ── 2-GROUP CLINICAL DROPDOWN ──────────────────────────────
              const patientItems = suggestions.filter(s => s._group === 'patient');
              const rxItems = suggestions.filter(s => s._group === 'prescription');

              const renderGroupHeader = (label, count, color, bg) => (
                <div key={label} style={{
                  padding: '0.3rem 1rem 0.15rem',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color,
                  background: bg,
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  {label}
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, opacity: 0.7 }}>({count})</span>
                </div>
              );

              const renderPatientItem = (item, itemIdx) => {
                const isSelected = selectedIndex === itemIdx;
                return (
                  <div
                    key={item.key}
                    className={`atlas-search__dropdown-item ${isSelected ? 'atlas-search__dropdown-item--selected' : ''}`}
                    onClick={() => handleSuggestionClick(item)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f5f0ff' : 'transparent',
                      paddingLeft: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        backgroundColor: '#faf5ff', border: '1px solid #e9d5ff',
                        color: '#7c3aed', display: 'inline-flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0
                      }}>
                        <User size={12} />
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                        {(item.email || item.phone || item.location) && (
                          <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {[item.email || item.phone, item.location].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '6px',
                      backgroundColor: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff',
                      textTransform: 'uppercase', flexShrink: 0
                    }}>
                      {lang === 'es' ? 'Paciente' : 'Patient'}
                    </span>
                  </div>
                );
              };

              const renderRxItem = (item, itemIdx) => {
                const isSelected = selectedIndex === itemIdx;
                const partsLabel = item.partsCount === 1
                  ? (lang === 'es' ? '1 Parte' : '1 Part')
                  : (lang === 'es' ? `${item.partsCount} Partes` : `${item.partsCount} Parts`);
                return (
                  <div
                    key={item.key}
                    className={`atlas-search__dropdown-item ${isSelected ? 'atlas-search__dropdown-item--selected' : ''}`}
                    onClick={() => handleSuggestionClick(item)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      paddingLeft: '1rem', gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', minWidth: 0, flex: 1 }}>
                      <Search size={13} color="#003666" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                            #{item.code}
                          </span>
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px',
                            borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd'
                          }}>
                            📦 {partsLabel}
                          </span>
                        </div>
                        {item.patientName && (
                          <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lang === 'es' ? 'Paciente:' : 'Patient:'} {item.patientName}
                          </span>
                        )}
                        {item.title && (
                          <span style={{ fontSize: '0.71rem', color: '#475569', lineHeight: 1.35, wordBreak: 'break-word' }}>
                            {item.title}
                          </span>
                        )}
                        {(item.importedDateStr || item.sampleDateStr) && (
                          <span style={{ fontSize: '0.67rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '1px' }}>
                            {item.importedDateStr && (
                              <span>📥 {lang === 'es' ? 'Importado:' : 'Imported:'} <strong>{item.importedDateStr}</strong></span>
                            )}
                            {item.importedDateStr && item.sampleDateStr && <span>·</span>}
                            {item.sampleDateStr && (
                              <span>🧪 {lang === 'es' ? 'Muestra:' : 'Sample:'} <strong>{item.sampleDateStr}</strong></span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`/rx/${encodeURIComponent(item.code)}?edit=true`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#1a73e8', fontSize: '0.63rem', fontWeight: 700, textDecoration: 'none' }}
                        title="Edit Prescription"
                      >
                        <Edit3 size={9} color="#1a73e8" /><span>Edit</span>
                      </a>
                      <a
                        href={`/labels?rx=${encodeURIComponent(item.code)}&refill=true`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', borderRadius: '4px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: '0.63rem', fontWeight: 700, textDecoration: 'none' }}
                        title="Issue Refill"
                      >
                        <Repeat size={9} color="#059669" /><span>Refill</span>
                      </a>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', textTransform: 'uppercase', flexShrink: 0 }}>
                        {lang === 'es' ? 'Receta' : 'Rx'}
                      </span>
                    </div>
                  </div>
                );
              };

              return (
                <>
                  {patientItems.length > 0 && (
                    <>
                      {renderGroupHeader('👤 ' + (lang === 'es' ? 'Pacientes' : 'Patients'), patientItems.length, '#6d28d9', '#faf5ff')}
                      {patientItems.map(item => renderPatientItem(item, suggestions.indexOf(item)))}
                    </>
                  )}
                  {rxItems.length > 0 && (
                    <>
                      {renderGroupHeader('📄 ' + (lang === 'es' ? 'Prescripciones Clínicas' : 'Clinical Prescriptions'), rxItems.length, '#1d4ed8', '#eff6ff')}
                      {rxItems.map(item => renderRxItem(item, suggestions.indexOf(item)))}
                    </>
                  )}
                </>
              );
            })() : (
              suggestions.map((item, idx) => {
                const isCrossJump = (!isProtocolsPage && item.indexName === 'protocols') || (isProtocolsPage && item.indexName === 'products');
                const isUserItem = item.indexName === 'atlas_users';

                let roleColor = '#1e40af';
                let roleBg = '#eff6ff';
                let roleBorder = '#bfdbfe';
                if (item.role === 'wholesaler' || item.role === 'distributor') {
                  roleColor = '#c2410c';
                  roleBg = '#fff7ed';
                  roleBorder = '#ffedd5';
                } else if (item.role === 'doctor') {
                  roleColor = '#0d9488';
                  roleBg = '#f0fdfa';
                  roleBorder = '#ccfbf1';
                } else if (item.role === 'patient') {
                  roleColor = '#7c3aed';
                  roleBg = '#faf5ff';
                  roleBorder = '#f3e8ff';
                }

                return (
                  <div
                    key={item.id || idx}
                    className={`atlas-search__dropdown-item ${selectedIndex === idx ? 'atlas-search__dropdown-item--selected' : ''}`}
                    onClick={() => handleSuggestionClick(item)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      backgroundColor: selectedIndex === idx ? (item.isAiPrompt ? '#eff6ff' : '#f1f5f9') : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                      {item.isAiPrompt ? (
                        <span style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(37, 99, 235, 0.12)',
                          color: '#2563eb',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          flexShrink: 0
                        }}>
                          ✨
                        </span>
                      ) : (isUserItem || item.indexName === 'atlas_patients') ? (
                        <span style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: item.indexName === 'atlas_patients' ? '#faf5ff' : roleBg,
                          border: item.indexName === 'atlas_patients' ? '1px solid #e9d5ff' : `1px solid ${roleBorder}`,
                          color: item.indexName === 'atlas_patients' ? '#7c3aed' : roleColor,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <User size={12} />
                        </span>
                      ) : (
                        <Search size={13} color="#003666" style={{ flexShrink: 0 }} />
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontWeight: 600, color: item.isAiPrompt ? '#1d4ed8' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                        {(item.email || item.company || item.patientName || item.country) && (
                          <span style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.email || item.country || (item.patientName ? `Patient: ${item.patientName}` : '')}{item.company ? ` · ${item.company}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '0.5rem' }}>
                      {/* Direct Prescription Shortcuts (Edit / Refill - Rule #4 & #26) */}
                      {item.indexName === 'prescriptions' && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`/rx/${encodeURIComponent(item.code || item.name)}?edit=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#1a73e8',
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                            title="Edit Prescription"
                          >
                            <Edit3 size={10} color="#1a73e8" />
                            <span>Edit</span>
                          </a>
                          <a
                            href={`/labels?rx=${encodeURIComponent(item.code || item.name)}&refill=true`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#059669',
                              fontSize: '0.66rem',
                              fontWeight: 750,
                              textDecoration: 'none'
                            }}
                            title="Issue Refill / Duplicate"
                          >
                            <Repeat size={10} color="#059669" />
                            <span>Refill</span>
                          </a>
                        </div>
                      )}
                      {item.variantCount > 1 && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            padding: '2px 5px',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          {item.variantCount} vars
                        </span>
                      )}
                      {isUserItem ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            backgroundColor: roleBg,
                            color: roleColor,
                            border: `1px solid ${roleBorder}`,
                            textTransform: 'uppercase'
                          }}
                        >
                          {item.category}
                        </span>
                      ) : isCrossJump ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            backgroundColor: item.indexName === 'protocols' ? '#ecfdf5' : '#eff6ff',
                            color: item.indexName === 'protocols' ? '#047857' : '#1d4ed8',
                            border: item.indexName === 'protocols' ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            textTransform: 'uppercase'
                          }}
                          title={item.indexName === 'protocols' ? 'Open in Protocols' : 'Open in Catalog'}
                        >
                          {item.indexName === 'protocols' ? 'Protocol' : 'Product'}
                          <ArrowUpRight size={11} />
                        </span>
                      ) : item.indexName === 'atlas_patients' ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            backgroundColor: '#faf5ff',
                            color: '#7c3aed',
                            border: '1px solid #e9d5ff',
                            textTransform: 'uppercase'
                          }}
                        >
                          Patient
                        </span>
                      ) : item.indexName === 'prescriptions' ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            textTransform: 'uppercase'
                          }}
                        >
                          Prescription
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '6px',
                            backgroundColor: item.category === 'Protocol' ? '#ecfdf5' : '#eff6ff',
                            color: item.category === 'Protocol' ? '#065f46' : '#1e40af',
                            textTransform: 'uppercase'
                          }}
                        >
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── RECENT SEARCHES DROPDOWN ──────────────────────────────────── */}
        {showDropdown && !value && showRecent && recentSearches.length > 0 && (
          <div className="atlas-search__dropdown">
            <div style={{ padding: '0.5rem 1rem 0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recent Searches
              </span>
              <button style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={clearRecent}>
                Clear all
              </button>
            </div>
            {recentSearches.map((term, i) => (
              <div key={i} className="atlas-search__dropdown-item" onClick={() => handleRecentClick(term)}>
                <Clock size={13} color="var(--text-muted)" />
                {term}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spacer so content below accounts for the chips zone height */}
      {hasActiveFilters && <div style={{ height: '38px' }} />}

      {/* Mobile Filters Bottom Sheet */}
      {isMobile && hasFilterOptions && (
        <MobileFiltersSheet
          isOpen={isMobileSheetOpen}
          onClose={() => setIsMobileSheetOpen(false)}
          filterOptions={filterOptions}
          activeFilters={filters}
          onResetAll={() => {
            filters.forEach(f => f?.onRemove?.());
            filterOptions.forEach(fo => {
              if (fo.multiSelect) fo.onChange?.([]);
              else fo.onChange?.('');
            });
            setIsMobileSheetOpen(false);
          }}
        />
      )}

      {/* Camera QR & Barcode Scanner Modal */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onDetected={(code) => {
          onChange?.(code);
        }}
      />
    </>
  );
}
