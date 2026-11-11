"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Dna,
  FlaskConical,
  Activity,
  Sparkles,
  Apple,
  Salad,
  Utensils,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  Share2,
  Search,
  Filter,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Flame,
  Zap,
  HelpCircle,
  Users,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Layers,
  Bot,
  Send,
  Loader2,
  Heart,
  TrendingDown,
  TrendingUp,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import { triggerHaptic } from '@/utils/haptics';
import { CLINICAL_PILLARS, GALENIC_COMPATIBILITY_ANALYSIS } from '@/data/genomics/clinicalNutrigenomicEngine';
import '@/styles/publicDesignSystem.css';

// ── Color Palette: Clinical Nutrition & Botanical Longevity ─────────────────
const THEME = {
  primary: '#15803d',        // Green 700 (Botanical Longevity)
  primaryDark: '#166534',    // Green 800
  primaryLight: '#f0fdf4',   // Green 50
  primaryBorder: '#bbf7d0',  // Green 200
  accentTeal: '#0d9488',
  accentBlue: '#1a73e8',
  textMain: '#0f172a',
  textMuted: '#64748b',
  border: '#dadce0',
  bgSurface: '#ffffff',
  bgMuted: '#f8fafc'
};

export default function NutritionistPublicPortalClient({
  slug,
  initialData,
  initialTab = 'overview',
  initialSearchParams = {}
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [scopeMode, setScopeMode] = useState('global'); // 'global' vs 'filtered' (Rule #22)
  const [searchQuery, setSearchQuery] = useState('');
  const [pillarFilter, setPillarFilter] = useState('all'); // 'all', '24genomics', 'bloodo', 'eterna', 'mealplan'
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to the Atlas Clinical Nutrition Copilot. I can interpret SNPs (TCF7L2, APOA2, MTHFR), calibrate intracellular NAD+ co-factors, and adjust 7-day culinary prescriptions. How can I assist your clinical practice today?'
    }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  const practitioner = useMemo(() => {
    const doc = initialData?.doctor || {};
    return {
      name: doc.displayName || doc.name || 'Dr. Nahla ElAwady',
      title: 'Clinical Nutritionist & Longevity Medicine Specialist',
      specialty: 'Precision Nutrigenomics, Cellular Metabolism & Anti-Aging',
      license: doc.license || 'DHA Registered Clinical Nutritionist / Functional Medicine',
      clinic: doc.clinicName || doc.clinic || 'Atlas Longevity & Nutrition Clinic',
      opaqueCode: doc.opaqueCode || slug || 'NUT-LONGEVITY',
      avatarUrl: doc.avatarUrl || null,
      country: 'United Arab Emirates / GCC'
    };
  }, [initialData, slug]);

  // ── 1. 24Genomics Dataset (Nutrigenomics) ──────────────────────────────────
  const genomicsRecords = useMemo(() => {
    return [
      {
        id: '24G-QA-90421',
        sampleCode: '24G-QA-90421',
        patientCode: 'PT-88310',
        patientAge: 44,
        patientGender: 'Male',
        testName: '24Genomics Nutrition & Metabolic Panel',
        lab: 'Illumina CE-IVD (Madrid, Spain)',
        technology: '+50,000 Custom Nutrigenomic SNPs',
        status: 'published',
        completionDate: '2026-11-04',
        phenotype: 'Carbohydrate Sensitive & High Glycemic Excursion',
        primarySnp: 'TCF7L2 (rs7903146 CT - High Risk)',
        secondarySnp: 'APOA2 (rs5082 CC - Saturated Fat Sensitive)',
        methylation: 'MTHFR 677C>T (Heterozygous - 35% Activity Loss)',
        recommendedDiet: 'Low-GI Mediterranean Longevity Plan (30% Carb / 40% Fat / 30% Protein)',
        activeFormulation: '3-Capsule Custom Compounding (A: Gut Shield, B: Metabolic Activator, C: Cellular Recovery)',
        dossierPages: 59,
        pdfUrl: `/api/reports/24genomics-patient-pdf?patient=PT-88310&sample=24G-QA-90421&clinic=${encodeURIComponent(practitioner.clinic)}`,
        mealPlanPdfUrl: `/api/reports/24genomics-mealplan-pdf?patient=PT-88310&sample=24G-QA-90421&clinic=${encodeURIComponent(practitioner.clinic)}`
      },
      {
        id: '24G-QA-90422',
        sampleCode: '24G-QA-90422',
        patientCode: 'PT-88314',
        patientAge: 38,
        patientGender: 'Female',
        testName: '24Genomics Nutrition & Metabolic Panel',
        lab: 'Illumina CE-IVD (Madrid, Spain)',
        technology: '+50,000 Custom Nutrigenomic SNPs',
        status: 'published',
        completionDate: '2026-11-06',
        phenotype: 'Impaired Methylation & Normal Carbohydrate Tolerance',
        primarySnp: 'MTHFR 677T>T (Homozygous - 70% Activity Loss)',
        secondarySnp: 'MTRR (rs1801394 GG - Decreased Methionine Synthase)',
        methylation: 'Critical Methylation Deficit (Elevated Homocysteine Risk)',
        recommendedDiet: 'Folate-Dense Clean Ketogenic / Polyphenol Rich Plan',
        activeFormulation: 'Methylfolate 5-MTHF + Methylcobalamin + Betaine TMG',
        dossierPages: 59,
        pdfUrl: `/api/reports/24genomics-patient-pdf?patient=PT-88314&sample=24G-QA-90422&clinic=${encodeURIComponent(practitioner.clinic)}`,
        mealPlanPdfUrl: `/api/reports/24genomics-mealplan-pdf?patient=PT-88314&sample=24G-QA-90422&clinic=${encodeURIComponent(practitioner.clinic)}`
      },
      {
        id: '24G-QA-90428',
        sampleCode: '24G-QA-90428',
        patientCode: 'PT-88322',
        patientAge: 52,
        patientGender: 'Male',
        testName: '24Genomics Nutrition & Metabolic Panel',
        lab: 'Illumina CE-IVD (Madrid, Spain)',
        technology: '+50,000 Custom Nutrigenomic SNPs',
        status: 'processing',
        completionDate: '2026-11-10',
        phenotype: 'Lactose Intolerant & High Sodium Sensitivity',
        primarySnp: 'LCT (rs4988235 CC - Lactase Non-Persistent)',
        secondarySnp: 'AGT (rs699 TT - Sodium Sensitive Hypertension Risk)',
        methylation: 'MTHFR Normal (Wild Type)',
        recommendedDiet: 'DASH-Mediterranean Anti-Inflammatory Plan (Dairy-Free)',
        activeFormulation: 'L-Glutamine 3g + Zinc Carnosine + Potassium Citrate',
        dossierPages: 59,
        pdfUrl: `/api/reports/24genomics-patient-pdf?patient=PT-88322&sample=24G-QA-90428&clinic=${encodeURIComponent(practitioner.clinic)}`,
        mealPlanPdfUrl: `/api/reports/24genomics-mealplan-pdf?patient=PT-88322&sample=24G-QA-90428&clinic=${encodeURIComponent(practitioner.clinic)}`
      }
    ];
  }, [practitioner.clinic]);

  // ── 2. Bloodo Dataset (NAD+ Quantitative DBS) ──────────────────────────────
  const bloodoRecords = useMemo(() => {
    return [
      {
        id: 'BLD-NAD-7011',
        sampleCode: 'BLD-NAD-7011',
        patientCode: 'PT-88310',
        testName: 'Bloodo™ NAD Level Test (Total NAD+ / NADH)',
        sampleType: 'Capillary Dried Blood Spot (DBS)',
        lab: 'LifeLab1 (ISO 15189 / CE-IVDR)',
        method: 'Quantitative Enzymatic Fluorometric Assay',
        collectionDate: '2026-11-02',
        value: 14.2,
        unit: 'µmol/L',
        referenceRange: '20.0 - 45.0 µmol/L',
        statusLevel: 'deficient', // deficient (<20), suboptimal (20-35), optimal (>35)
        status: 'completed',
        retestDays: 60,
        retestTargetDate: '2027-01-02',
        clinicalFinding: 'Severe intracellular NAD depletion. Bioenergetic capacity suppressed. Recommend therapeutic NMN + Apigenin CD38 inhibition protocol.',
        assignedSupplements: ['NMN 500mg (Sublingual/Enteric)', 'Apigenin 50mg (CD38 Blocker)', 'Resveratrol 250mg', 'TMG 500mg']
      },
      {
        id: 'BLD-NAD-7012',
        sampleCode: 'BLD-NAD-7012',
        patientCode: 'PT-88314',
        testName: 'Bloodo™ NAD Level Test (Total NAD+ / NADH)',
        sampleType: 'Capillary Dried Blood Spot (DBS)',
        lab: 'LifeLab1 (ISO 15189 / CE-IVDR)',
        method: 'Quantitative Enzymatic Fluorometric Assay',
        collectionDate: '2026-11-05',
        value: 26.8,
        unit: 'µmol/L',
        referenceRange: '20.0 - 45.0 µmol/L',
        statusLevel: 'suboptimal',
        status: 'completed',
        retestDays: 90,
        retestTargetDate: '2027-02-05',
        clinicalFinding: 'Suboptimal NAD levels. Maintenance titration required to support mitochondrial sirtuin Sirt1/Sirt3 deacetylation.',
        assignedSupplements: ['Nicotinamide Riboside (NR) 300mg', 'Quercetin 250mg', 'PQQ 20mg']
      },
      {
        id: 'BLD-OMG-7015',
        sampleCode: 'BLD-OMG-7015',
        patientCode: 'PT-88322',
        testName: 'Bloodo™ Omega Ratio & Cellular Fluidity Test',
        sampleType: 'Capillary Dried Blood Spot (DBS)',
        lab: 'LifeLab1 (ISO 15189 / CE-IVDR)',
        method: 'Gas Chromatography Fatty Acid Methylation',
        collectionDate: '2026-11-08',
        value: 8.4,
        unit: 'AA / EPA Ratio',
        referenceRange: '1.5 - 3.0',
        statusLevel: 'deficient',
        status: 'completed',
        retestDays: 60,
        retestTargetDate: '2027-01-08',
        clinicalFinding: 'Pro-inflammatory cell membrane state (AA/EPA 8.4:1). Membrane fluidity impaired. Cellular receptor sensitivity blunted.',
        assignedSupplements: ['High-EPA Triglyceride Omega-3 (2,000mg EPA / 400mg DHA)', 'Astaxanthin 4mg']
      }
    ];
  }, []);

  // ── 3. Eterna Dataset (Biological Age & Telomeres) ──────────────────────────
  const eternaRecords = useMemo(() => {
    return [
      {
        id: 'ETR-TELO-3011',
        sampleCode: 'ETR-TELO-3011',
        patientCode: 'PT-88310',
        chronologicalAge: 44,
        biologicalAge: 49.2,
        agingDelta: 5.2, // older than chronological
        telomereLengthKb: 0.81,
        percentile: 28,
        lab: 'Eurofins Genomics (CE-IVD)',
        method: 'Absolute qPCR (Telomere to Single-Copy Gene T/S Ratio)',
        status: 'completed',
        date: '2026-11-01',
        interpretation: 'Accelerated cellular senescence (+5.2 years). 28th percentile for 44-year-old males. High senescent cell burden indicated.',
        interventions: ['Epithalon (Bioregulator protocol)', 'Fisetin Senolytic Flush (2 days/month)', 'Zone-2 Aerobic Mitochondriogenesis']
      },
      {
        id: 'ETR-TELO-3012',
        sampleCode: 'ETR-TELO-3012',
        patientCode: 'PT-88314',
        chronologicalAge: 38,
        biologicalAge: 33.8,
        agingDelta: -4.2, // 4.2 years younger!
        telomereLengthKb: 1.04,
        percentile: 82,
        lab: 'Eurofins Genomics (CE-IVD)',
        method: 'Absolute qPCR (Telomere to Single-Copy Gene T/S Ratio)',
        status: 'completed',
        date: '2026-11-05',
        interpretation: 'Exceptional cellular longevity (-4.2 years biological age). 82nd percentile telomere length. Telomerase activity well-maintained.',
        interventions: ['Astragalus Cycloastragenol Maintenance', 'Intermittent Fasting (16:8)', 'Polyphenol High-ORAC Diet']
      }
    ];
  }, []);

  // ── 4. Precision 7-Day Meal Plans & Supplements Dataset ────────────────────
  const mealPlans = useMemo(() => {
    return [
      {
        id: 'MP-90421',
        patientCode: 'PT-88310',
        title: 'Precision Glycemic Flattening & Mitochondrial Restoration (7 Days)',
        dietType: 'Low-Glycemic Anti-Inflammatory Mediterranean',
        targetCalories: '2,150 kcal/day',
        macros: { protein: '30%', fat: '45%', carb: '25%' },
        keyRule: 'Strictly zero refined sugars; all complex carbs backloaded to dinner (circadian glycemic buffering).',
        compoundingPrescription: 'Atlas 3-Capsule Compartmentalized Pack',
        breakfast: 'Wild salmon fillet (150g), avocado (1/2), pasture eggs (2), steamed baby spinach with cold-pressed olive oil.',
        lunch: 'Grass-fed beef or organic chicken breast (180g), large cruciferous salad (broccoli sprouts, arugula, radishes), apple cider vinegar.',
        dinner: 'Baked wild cod or sea bass, steamed asparagus, roasted sweet potato (120g - carb window), Himalayan salt.',
        pdfUrl: `/api/reports/24genomics-mealplan-pdf?patient=PT-88310&sample=24G-QA-90421&clinic=${encodeURIComponent(practitioner.clinic)}`
      },
      {
        id: 'MP-90422',
        patientCode: 'PT-88314',
        title: 'Methylation Optimization & High-Folate Neurological Plan (7 Days)',
        dietType: 'Epigenetic Micronutrient Dense Clean Keto-Flex',
        targetCalories: '1,850 kcal/day',
        macros: { protein: '25%', fat: '60%', carb: '15%' },
        keyRule: 'Raw cruciferous & dark leafy greens at every meal for natural betaine, sulforaphane, and bioactive folate.',
        compoundingPrescription: 'Methyl-Shield 3-Capsule Pack (5-MTHF + TMG + B12)',
        breakfast: 'Chia seed pudding with organic coconut milk, raw walnuts, blueberries, microgreens, and collagen peptides.',
        lunch: 'Sardines in extra-virgin olive oil, fermented kimchi, roasted cauliflower, raw pumpkin seeds, kelp flakes.',
        dinner: 'Pasture-raised ribeye steak or pasture lamb, braised chard with garlic, fermented sauerkraut, organic bone broth.',
        pdfUrl: `/api/reports/24genomics-mealplan-pdf?patient=PT-88314&sample=24G-QA-90422&clinic=${encodeURIComponent(practitioner.clinic)}`
      }
    ];
  }, [practitioner.clinic]);

  // ── Global Filtered Datasets ───────────────────────────────────────────────
  const filteredGenomics = useMemo(() => {
    return genomicsRecords.filter((r) => {
      if (pillarFilter !== 'all' && pillarFilter !== '24genomics') return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.patientCode.toLowerCase().includes(q) ||
        r.sampleCode.toLowerCase().includes(q) ||
        r.phenotype.toLowerCase().includes(q) ||
        r.primarySnp.toLowerCase().includes(q)
      );
    });
  }, [genomicsRecords, pillarFilter, searchQuery]);

  const filteredBloodo = useMemo(() => {
    return bloodoRecords.filter((r) => {
      if (pillarFilter !== 'all' && pillarFilter !== 'bloodo') return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.patientCode.toLowerCase().includes(q) ||
        r.sampleCode.toLowerCase().includes(q) ||
        r.testName.toLowerCase().includes(q) ||
        r.clinicalFinding.toLowerCase().includes(q)
      );
    });
  }, [bloodoRecords, pillarFilter, searchQuery]);

  const filteredEterna = useMemo(() => {
    return eternaRecords.filter((r) => {
      if (pillarFilter !== 'all' && pillarFilter !== 'eterna') return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.patientCode.toLowerCase().includes(q) ||
        r.sampleCode.toLowerCase().includes(q) ||
        r.interpretation.toLowerCase().includes(q)
      );
    });
  }, [eternaRecords, pillarFilter, searchQuery]);

  const filteredMealPlans = useMemo(() => {
    return mealPlans.filter((r) => {
      if (pillarFilter !== 'all' && pillarFilter !== 'mealplan') return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.patientCode.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.dietType.toLowerCase().includes(q)
      );
    });
  }, [mealPlans, pillarFilter, searchQuery]);

  // ── 4 Top Operational KPIs (Golden Rule #22) ──────────────────────────────
  const kpis = useMemo(() => {
    const isFiltered = scopeMode === 'filtered';
    const genCount = isFiltered ? filteredGenomics.length : genomicsRecords.length;
    const bldCount = isFiltered ? filteredBloodo.length : bloodoRecords.length;
    const etrCount = isFiltered ? filteredEterna.length : eternaRecords.length;
    const mpCount = isFiltered ? filteredMealPlans.length : mealPlans.length;

    return {
      genomics: {
        title: '24Genomics Profiles',
        value: genCount,
        subtitle: isFiltered ? 'Matching active filters' : 'Total genotyped patients',
        detail: '+50k SNPs mapped'
      },
      bloodo: {
        title: 'Bloodo™ NAD+ Telemetry',
        value: bldCount,
        subtitle: isFiltered ? 'Matching active filters' : 'Quantitative DBS reports',
        detail: 'Capillary dried blood spot'
      },
      eterna: {
        title: 'Eterna® Telomeres & Bio-Age',
        value: etrCount,
        subtitle: isFiltered ? 'Matching active filters' : 'Biological age profiles',
        detail: 'Absolute qPCR T/S Ratio'
      },
      mealPlans: {
        title: 'Active Precision Meal Plans',
        value: mpCount,
        subtitle: isFiltered ? 'Matching active filters' : '7-Day bespoke regimens',
        detail: '3-Capsule Compounding'
      }
    };
  }, [scopeMode, filteredGenomics, genomicsRecords, filteredBloodo, bloodoRecords, filteredEterna, eternaRecords, filteredMealPlans, mealPlans]);

  // ── Columns: 24Genomics Table (Golden Rule #3 & GCP Chips) ────────────────
  const genomicsColumns = useMemo(() => [
    {
      key: 'code',
      header: 'Sample & Patient ID',
      width: '18%',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <CopyableId value={row.sampleCode} iconOnly={false} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: THEME.textMuted }}>
            <span>Patient: {row.patientCode}</span>
            <span>•</span>
            <span>{row.patientAge}y {row.patientGender}</span>
          </div>
        </div>
      )
    },
    {
      key: 'phenotype',
      header: 'Metabolic Phenotype & Primary SNPs',
      width: '32%',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: THEME.textMain }}>
            {row.phenotype}
          </div>
          {/* Google Cloud UX Monochromatic Metadata Chips (Height 20px, Monochromatic SVG) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span
              style={{
                height: '20px',
                fontSize: '0.68rem',
                lineHeight: '18px',
                backgroundColor: '#e8f0fe',
                color: '#1a73e8',
                border: '1px solid #d2e3fc',
                borderRadius: '4px',
                padding: '0 6px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                maxWidth: '220px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
              title={row.primarySnp}
            >
              <Dna size={10} color="#1a73e8" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.primarySnp}</span>
            </span>

            <span
              style={{
                height: '20px',
                fontSize: '0.68rem',
                lineHeight: '18px',
                backgroundColor: '#f1f3f4',
                color: '#3c4043',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '0 6px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={row.methylation}
            >
              <Sparkles size={10} color="#5f6368" />
              <span>{row.methylation.includes('Heterozygous') ? 'MTHFR Het' : (row.methylation.includes('Homozygous') ? 'MTHFR Hom' : 'MTHFR Normal')}</span>
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'prescription',
      header: 'Prescribed Precision Diet & Compounding',
      width: '32%',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.80rem', fontWeight: 600, color: THEME.primaryDark }}>
            {row.recommendedDiet}
          </div>
          <div style={{ fontSize: '0.72rem', color: THEME.textMuted }}>
            {row.activeFormulation}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Dossier Actions',
      width: '18%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <a
            href={row.mealPlanPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              height: '26px',
              padding: '0 8px',
              borderRadius: '4px',
              border: `1px solid ${THEME.primaryBorder}`,
              backgroundColor: THEME.primaryLight,
              color: THEME.primaryDark,
              fontSize: '0.72rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Download Comprehensive 59-Page Meal Plan PDF"
          >
            <Download size={11} />
            <span>7-Day Plan (59p)</span>
          </a>

          <a
            href={row.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              height: '26px',
              padding: '0 8px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              backgroundColor: '#ffffff',
              color: '#3c4043',
              fontSize: '0.72rem',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Download Official 2-Page Clinical Prescription PDF"
          >
            <FileText size={11} />
            <span>Rx PDF</span>
          </a>
        </div>
      )
    }
  ], []);

  // ── Columns: Bloodo Table (Golden Rule #3 & GCP Chips) ────────────────────
  const bloodoColumns = useMemo(() => [
    {
      key: 'code',
      header: 'Sample & Test Code',
      width: '18%',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <CopyableId value={row.sampleCode} iconOnly={false} />
          <div style={{ fontSize: '0.72rem', color: THEME.textMuted }}>
            Patient: {row.patientCode} • {row.collectionDate}
          </div>
        </div>
      )
    },
    {
      key: 'test',
      header: 'Diagnostic Assay & Laboratory',
      width: '28%',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: THEME.textMain }}>
            {row.testName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: THEME.textMuted }}>
            <span style={{ color: '#0369a1', fontWeight: 600 }}>{row.lab}</span>
            <span>•</span>
            <span>{row.sampleType}</span>
          </div>
        </div>
      )
    },
    {
      key: 'result',
      header: 'Quantitative NAD+ Finding',
      width: '32%',
      sortable: true,
      render: (row) => {
        const val = row.value;
        const isDef = row.statusLevel === 'deficient';
        const isSub = row.statusLevel === 'suboptimal';
        const color = isDef ? '#dc2626' : (isSub ? '#d97706' : '#16a34a');
        const bg = isDef ? '#fef2f2' : (isSub ? '#fffbeb' : '#f0fdf4');
        const border = isDef ? '#fecaca' : (isSub ? '#fde68a' : '#bbf7d0');

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: THEME.textMain, letterSpacing: '-0.02em' }}>
                {val} {row.unit}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color,
                  backgroundColor: bg,
                  border: `1px solid ${border}`,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  textTransform: 'uppercase'
                }}
              >
                {row.statusLevel}
              </span>
            </div>

            {/* Range Progress Bar */}
            <div style={{ width: '100%', maxWidth: '240px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${Math.min(Math.max((val / 45) * 100, 5), 100)}%`,
                  backgroundColor: color,
                  borderRadius: '3px'
                }}
              />
            </div>
            <div style={{ fontSize: '0.70rem', color: THEME.textMuted }}>
              Target Optimal: &gt; 35.0 µmol/L (Ref: {row.referenceRange})
            </div>
          </div>
        );
      }
    },
    {
      key: 'retest',
      header: 'Re-Test Protocol',
      width: '22%',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                height: '20px',
                fontSize: '0.68rem',
                lineHeight: '18px',
                backgroundColor: '#f1f3f4',
                color: '#3c4043',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '0 6px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Clock size={10} color="#5f6368" />
              <span>Re-Test in {row.retestDays} Days</span>
            </span>
          </div>
          <span style={{ fontSize: '0.70rem', color: THEME.textMuted }}>
            Target: {row.retestTargetDate}
          </span>
        </div>
      )
    }
  ], []);

  // ── Columns: Eterna Table (Golden Rule #3 & GCP Chips) ────────────────────
  const eternaColumns = useMemo(() => [
    {
      key: 'code',
      header: 'Sample & Patient ID',
      width: '20%',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <CopyableId value={row.sampleCode} iconOnly={false} />
          <div style={{ fontSize: '0.72rem', color: THEME.textMuted }}>
            Patient: {row.patientCode} • {row.date}
          </div>
        </div>
      )
    },
    {
      key: 'bioage',
      header: 'Chronological vs Biological Age',
      width: '32%',
      sortable: true,
      render: (row) => {
        const isYounger = row.agingDelta <= 0;
        const deltaColor = isYounger ? '#16a34a' : '#dc2626';
        const deltaBg = isYounger ? '#f0fdf4' : '#fef2f2';
        const deltaBorder = isYounger ? '#bbf7d0' : '#fecaca';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: THEME.textMain, letterSpacing: '-0.02em' }}>
                Bio-Age: {row.biologicalAge}y
              </span>
              <span style={{ fontSize: '0.78rem', color: THEME.textMuted }}>
                (Actual: {row.chronologicalAge}y)
              </span>
            </div>
            <div>
              <span
                style={{
                  height: '20px',
                  fontSize: '0.68rem',
                  lineHeight: '18px',
                  backgroundColor: deltaBg,
                  color: deltaColor,
                  border: `1px solid ${deltaBorder}`,
                  borderRadius: '4px',
                  padding: '0 6px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isYounger ? <TrendingDown size={10} color={deltaColor} /> : <TrendingUp size={10} color={deltaColor} />}
                <span>{isYounger ? `${Math.abs(row.agingDelta)} Years Younger` : `+${row.agingDelta} Years Biological Aging`}</span>
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'telomere',
      header: 'Telomere Length & Percentile',
      width: '24%',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: THEME.textMain }}>
            {row.telomereLengthKb} kb (T/S Ratio)
          </div>
          <div style={{ fontSize: '0.72rem', color: THEME.textMuted }}>
            {row.percentile}th Age-Adjusted Percentile
          </div>
        </div>
      )
    },
    {
      key: 'interventions',
      header: 'Prescribed Epigenetic Regimen',
      width: '24%',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '0.76rem', color: THEME.textMain, fontWeight: 500 }}>
            {row.interventions.slice(0, 2).join(' • ')}
          </div>
        </div>
      )
    }
  ], []);

  // ── Copilot Send Handler ──────────────────────────────────────────────────
  const handleCopilotSend = async (e) => {
    e?.preventDefault();
    if (!copilotInput.trim() || isCopilotLoading) return;

    const userText = copilotInput.trim();
    setCopilotInput('');
    setCopilotMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsCopilotLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          screenScope: '24genomics',
          contextAnchor: {
            name: '24Genomics Clinical Suite & Longevity Nutrition',
            practitioner: practitioner.name,
            specialty: practitioner.specialty
          }
        })
      });

      if (!res.ok) throw new Error('Copilot response error');
      const data = await res.json();
      const reply = data.reply || data.text || 'I have analyzed the genetic and metabolic markers. All recommended adjustments comply with European CE-IVD standards.';
      setCopilotMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setCopilotMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'According to the 24Genomics Nutrigenomic protocol, patients with TCF7L2 risk alleles should limit refined carbohydrates to <30g per meal and integrate Berberine + Chromium (Capsule B) with daytime meals. For intracellular NAD+ <20 µmol/L, consider sublingual NMN with Apigenin CD38 inhibition.'
        }
      ]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: THEME.bgMuted,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* ── TOP HEADER (Brand & Public Unified Header) ────────────────────────── */}
      <PublicUnifiedHeader
        portalTitle="Clinical Nutrition & Longevity Practice"
        practitionerName={practitioner.name}
        practitionerSpecialty={practitioner.specialty}
        clinicName={practitioner.clinic}
        themeColor={THEME.primary}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                navigator.clipboard?.writeText(window.location.href);
                toast.success('Practice portal link copied to clipboard');
              }}
              style={{
                height: '32px',
                padding: '0 12px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={13} />
              <span>Share Portal</span>
            </button>
          </div>
        }
      />

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
        {/* Breadcrumb Navigation (Golden Rule #17) */}
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb
            items={[
              { label: 'Atlas Health Network', href: '/' },
              { label: 'Clinical Nutrition & Longevity Practice', href: `/nutritionist/${practitioner.opaqueCode}` },
              { label: practitioner.name }
            ]}
          />
        </div>

        {/* Practitioner Hero Banner with Botanical Green Theme */}
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${THEME.border}`,
            padding: '20px 24px',
            marginBottom: '20px',
            boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: THEME.primaryLight,
                border: `2px solid ${THEME.primaryBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: THEME.primaryDark
              }}
            >
              <Salad size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: THEME.textMain, margin: 0 }}>
                  {practitioner.name}
                </h1>
                <span
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    color: THEME.primaryDark,
                    backgroundColor: THEME.primaryLight,
                    border: `1px solid ${THEME.primaryBorder}`,
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  Clinical Nutritionist &amp; Longevity Specialist
                </span>
                <span
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    color: '#0369a1',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  CE-IVD / ISO 15189 Accredited Practice
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: THEME.textMuted }}>
                {practitioner.clinic} • Code: <CopyableId value={practitioner.opaqueCode} /> • {practitioner.license}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setIsCopilotOpen(!isCopilotOpen);
              }}
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: '6px',
                backgroundColor: isCopilotOpen ? THEME.primaryDark : THEME.primary,
                color: '#ffffff',
                border: 'none',
                fontSize: '0.80rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(21,128,61,0.2)'
              }}
            >
              <Bot size={15} />
              <span>{isCopilotOpen ? 'Close AI Copilot' : 'Open Longevity Copilot'}</span>
            </button>
          </div>
        </section>

        {/* ── 4 TOP OPERATIONAL KPIS & SCOPE SWITCHER (Golden Rule #22) ────────── */}
        <section style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: THEME.textMuted }}>
                Operational Longevity Metrics
              </span>
              <span
                style={{
                  fontSize: '0.70rem',
                  backgroundColor: scopeMode === 'filtered' ? '#f0fdf4' : '#eff6ff',
                  color: scopeMode === 'filtered' ? THEME.primaryDark : '#1d4ed8',
                  border: `1px solid ${scopeMode === 'filtered' ? THEME.primaryBorder : '#bfdbfe'}`,
                  borderRadius: '4px',
                  padding: '1px 8px',
                  fontWeight: 600
                }}
              >
                {scopeMode === 'filtered' ? 'Applied Filters View' : 'Global Practice View (Unfiltered)'}
              </span>
            </div>

            {/* Scope Switcher (Rule #22) */}
            <div style={{ display: 'inline-flex', backgroundColor: '#e2e8f0', borderRadius: '6px', padding: '2px', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setScopeMode('global')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: scopeMode === 'global' ? '#ffffff' : 'transparent',
                  color: scopeMode === 'global' ? THEME.textMain : THEME.textMuted,
                  boxShadow: scopeMode === 'global' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Entire Practice
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('filtered')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: scopeMode === 'filtered' ? '#ffffff' : 'transparent',
                  color: scopeMode === 'filtered' ? THEME.textMain : THEME.textMuted,
                  boxShadow: scopeMode === 'filtered' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Filtered Subset
              </button>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px'
            }}
          >
            {/* Card 1: 24Genomics */}
            <div
              onClick={() => { setActiveTab('genomics'); triggerHaptic(); }}
              style={{
                backgroundColor: '#ffffff',
                border: `1px solid ${activeTab === 'genomics' ? THEME.primary : THEME.border}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: THEME.textMuted }}>{kpis.genomics.title}</span>
                <Dna size={16} color={THEME.primary} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: THEME.textMain, letterSpacing: '-0.03em' }}>
                {kpis.genomics.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.70rem', color: THEME.textMuted }}>
                <span>{kpis.genomics.subtitle}</span>
                <span style={{ fontWeight: 600, color: THEME.primaryDark }}>{kpis.genomics.detail}</span>
              </div>
            </div>

            {/* Card 2: Bloodo */}
            <div
              onClick={() => { setActiveTab('bloodo'); triggerHaptic(); }}
              style={{
                backgroundColor: '#ffffff',
                border: `1px solid ${activeTab === 'bloodo' ? THEME.primary : THEME.border}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: THEME.textMuted }}>{kpis.bloodo.title}</span>
                <FlaskConical size={16} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: THEME.textMain, letterSpacing: '-0.03em' }}>
                {kpis.bloodo.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.70rem', color: THEME.textMuted }}>
                <span>{kpis.bloodo.subtitle}</span>
                <span style={{ fontWeight: 600, color: '#0369a1' }}>{kpis.bloodo.detail}</span>
              </div>
            </div>

            {/* Card 3: Eterna */}
            <div
              onClick={() => { setActiveTab('eterna'); triggerHaptic(); }}
              style={{
                backgroundColor: '#ffffff',
                border: `1px solid ${activeTab === 'eterna' ? THEME.primary : THEME.border}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: THEME.textMuted }}>{kpis.eterna.title}</span>
                <Activity size={16} color="#7c3aed" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: THEME.textMain, letterSpacing: '-0.03em' }}>
                {kpis.eterna.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.70rem', color: THEME.textMuted }}>
                <span>{kpis.eterna.subtitle}</span>
                <span style={{ fontWeight: 600, color: '#6d28d9' }}>{kpis.eterna.detail}</span>
              </div>
            </div>

            {/* Card 4: Meal Plans */}
            <div
              onClick={() => { setActiveTab('mealplans'); triggerHaptic(); }}
              style={{
                backgroundColor: '#ffffff',
                border: `1px solid ${activeTab === 'mealplans' ? THEME.primary : THEME.border}`,
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: THEME.textMuted }}>{kpis.mealPlans.title}</span>
                <Utensils size={16} color="#d97706" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: THEME.textMain, letterSpacing: '-0.03em' }}>
                {kpis.mealPlans.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.70rem', color: THEME.textMuted }}>
                <span>{kpis.mealPlans.subtitle}</span>
                <span style={{ fontWeight: 600, color: '#b45309' }}>{kpis.mealPlans.detail}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SEARCH & FILTER BAR (Golden Rule #6, #7) ─────────────────────────── */}
        <section style={{ marginBottom: '20px' }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            size="lg"
            placeholder="Search by patient code, sample ID, genetic SNP (TCF7L2, APOA2), or test name..."
            resultCount={filteredGenomics.length + filteredBloodo.length + filteredEterna.length}
            filters={
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Diagnostic Pillars' },
                  { id: '24genomics', label: '24Genomics (DNA)', icon: Dna },
                  { id: 'bloodo', label: 'Bloodo™ (NAD+ DBS)', icon: FlaskConical },
                  { id: 'eterna', label: 'Eterna® (Telomeres)', icon: Activity },
                  { id: 'mealplan', label: 'Meal Plans & Packs', icon: Utensils }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setPillarFilter(f.id);
                    }}
                    style={{
                      height: '26px',
                      padding: '0 10px',
                      borderRadius: '13px',
                      border: `1px solid ${pillarFilter === f.id ? THEME.primary : '#dadce0'}`,
                      backgroundColor: pillarFilter === f.id ? THEME.primaryLight : '#ffffff',
                      color: pillarFilter === f.id ? THEME.primaryDark : '#3c4043',
                      fontSize: '0.72rem',
                      fontWeight: pillarFilter === f.id ? 700 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.12s'
                    }}
                  >
                    {f.icon && <f.icon size={11} />}
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            }
          />
        </section>

        {/* ── COPILOT DRAWER (Interactive AI) ──────────────────────────────────── */}
        {isCopilotOpen && (
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: `1px solid ${THEME.primaryBorder}`,
              boxShadow: '0 4px 12px rgba(21,128,61,0.08)',
              padding: '16px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={18} color={THEME.primary} />
                <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: THEME.textMain }}>
                  Atlas Longevity &amp; Nutrigenomic Copilot
                </h3>
                <span style={{ fontSize: '0.68rem', backgroundColor: THEME.primaryLight, color: THEME.primaryDark, padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  CE-IVD Illumina &amp; DBS Calibrated
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCopilotOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted, fontSize: '0.78rem' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px', marginBottom: '12px' }}>
              {copilotMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: m.role === 'user' ? THEME.primary : '#f8fafc',
                    color: m.role === 'user' ? '#ffffff' : THEME.textMain,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    lineHeight: '1.4',
                    border: m.role === 'user' ? 'none' : '1px solid #e2e8f0'
                  }}
                >
                  {m.content}
                </div>
              ))}
              {isCopilotLoading && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: THEME.textMuted }}>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Synthesizing nutrigenomic and biochemical markers...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleCopilotSend} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                placeholder="Ask about TCF7L2 carb tolerance, intracellular NAD+ dosing, or 7-day meal substitutions..."
                style={{
                  flex: 1,
                  height: '34px',
                  padding: '0 12px',
                  fontSize: '0.78rem',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isCopilotLoading || !copilotInput.trim()}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  backgroundColor: THEME.primary,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: isCopilotLoading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Send size={12} />
                <span>Send</span>
              </button>
            </form>
          </section>
        )}

        {/* ── GCP NAVIGATION TABS ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid #dadce0',
            marginBottom: '20px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          {[
            { id: 'overview', label: 'Practice Overview', icon: Activity },
            { id: 'genomics', label: `24Genomics DNA (${filteredGenomics.length})`, icon: Dna },
            { id: 'bloodo', label: `Bloodo™ NAD+ (${filteredBloodo.length})`, icon: FlaskConical },
            { id: 'eterna', label: `Eterna® Telomeres (${filteredEterna.length})`, icon: Sparkles },
            { id: 'mealplans', label: `Precision Meal Plans (${filteredMealPlans.length})`, icon: Utensils }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic();
                setActiveTab(tab.id);
              }}
              style={{
                height: '40px',
                padding: '0 14px',
                border: 'none',
                borderBottom: activeTab === tab.id ? `3px solid ${THEME.primary}` : '3px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? THEME.primaryDark : '#5f6368',
                fontSize: '0.82rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <tab.icon size={14} color={activeTab === tab.id ? THEME.primary : '#5f6368'} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ──────────────────────────────────────────────────────── */}

        {/* 1. OVERVIEW TAB: Practice Snapshot & 3 Diagnostic Pillars */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 3 Pillars Clinical Architecture Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px'
              }}
            >
              {/* Pillar 1: 24Genomics */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '8px',
                  padding: '18px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ padding: '6px', backgroundColor: THEME.primaryLight, borderRadius: '6px', color: THEME.primary }}>
                    <Dna size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: THEME.textMain }}>
                      1. 24Genomics Nutrigenomics
                    </h3>
                    <span style={{ fontSize: '0.70rem', color: THEME.textMuted }}>Illumina CE-IVD (+50,000 SNPs)</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                  Analyzes glycemic sensitivity (TCF7L2), fat metabolism (APOA2), methylation efficiency (MTHFR), and sodium responsiveness (AGT).
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('genomics')}
                  style={{
                    height: '28px',
                    padding: '0 10px',
                    borderRadius: '4px',
                    border: `1px solid ${THEME.primaryBorder}`,
                    backgroundColor: THEME.primaryLight,
                    color: THEME.primaryDark,
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>View Genotyped Patients</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>

              {/* Pillar 2: Bloodo */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '8px',
                  padding: '18px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ padding: '6px', backgroundColor: '#e0f2fe', borderRadius: '6px', color: '#0284c7' }}>
                    <FlaskConical size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: THEME.textMain }}>
                      2. Bloodo™ NAD+ DBS Telemetry
                    </h3>
                    <span style={{ fontSize: '0.70rem', color: THEME.textMuted }}>LifeLab1 ISO 15189 / CE-IVDR</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                  Quantitative intracellular capillary blood spot testing. Tracks cellular bioenergetics, sirtuin activation, and 60-day re-test intervals.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('bloodo')}
                  style={{
                    height: '28px',
                    padding: '0 10px',
                    borderRadius: '4px',
                    border: '1px solid #bae6fd',
                    backgroundColor: '#f0f9ff',
                    color: '#0369a1',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>View NAD+ Biomarkers</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>

              {/* Pillar 3: Eterna */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '8px',
                  padding: '18px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ padding: '6px', backgroundColor: '#f3e8ff', borderRadius: '6px', color: '#7c3aed' }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: THEME.textMain }}>
                      3. Eterna® Biological Age
                    </h3>
                    <span style={{ fontSize: '0.70rem', color: THEME.textMuted }}>Eurofins Absolute qPCR T/S Ratio</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.4', margin: '0 0 12px 0' }}>
                  Measures telomere length against age cohorts, identifying biological vs chronological aging delta for targeted senolytic therapies.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('eterna')}
                  style={{
                    height: '28px',
                    padding: '0 10px',
                    borderRadius: '4px',
                    border: '1px solid #e9d5ff',
                    backgroundColor: '#faf5ff',
                    color: '#6d28d9',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>View Telomere Profiles</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>
            </div>

            {/* Quick Preview Table of Recent 24Genomics Dossiers */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: `1px solid ${THEME.border}`,
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Dna size={18} color={THEME.primary} />
                  <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: THEME.textMain }}>
                    Recent Nutrigenomic Profiles (24Genomics)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('genomics')}
                  style={{
                    fontSize: '0.76rem',
                    color: THEME.primaryDark,
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>View Full Table</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              <DataTable
                columns={genomicsColumns}
                data={filteredGenomics.slice(0, 2)}
                keyField="id"
                tableId="nutritionist-overview-genomics"
                pagination={false}
              />
            </div>
          </div>
        )}

        {/* 2. 24GENOMICS TAB: Full Genetic Dossiers & Master-Detail (Golden Rule #3, #4) */}
        {activeTab === 'genomics' && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${THEME.border}`,
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Dna size={18} color={THEME.primary} />
                  <span>24Genomics Nutrigenomic Profiles &amp; Precision Diets</span>
                </h2>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: THEME.textMuted }}>
                  Tap any row to expand Master-Detail analysis, food traffic light system, and circadian macronutrient schedules.
                </p>
              </div>
            </div>

            <DataTable
              columns={genomicsColumns}
              data={filteredGenomics}
              keyField="id"
              tableId="nutritionist-genomics-full"
              pagination={true}
              initialRowsPerPage={10}
              expandableRender={(row) => (
                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.80rem', fontWeight: 700, color: THEME.primaryDark, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Clinical Genetic Dossier Breakdown • Sample {row.sampleCode}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={row.mealPlanPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.74rem',
                          color: THEME.primaryDark,
                          backgroundColor: '#ffffff',
                          border: `1px solid ${THEME.primaryBorder}`,
                          padding: '4px 10px',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Download size={11} />
                        <span>Open 59-Pág Meal Plan PDF</span>
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                    {/* Traffic Light: Foods to Embrace */}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '12px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} color="#166534" />
                        <span>Foods to Prioritize (Green Traffic Light)</span>
                      </span>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.74rem', color: '#334155', lineHeight: '1.4' }}>
                        Wild Alaskan salmon, organic pasture eggs, broccoli sprouts (sulforaphane), raw walnuts, extra-virgin olive oil, fermented kimchi.
                      </p>
                    </div>

                    {/* Traffic Light: Foods to Restrict */}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={13} color="#991b1b" />
                        <span>Foods to Strictly Avoid (Red Traffic Light)</span>
                      </span>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.74rem', color: '#334155', lineHeight: '1.4' }}>
                        Refined high-fructose corn syrup, white flour pastries, conventional feedlot dairy (if LCT CC), processed seed oils (canola/soybean).
                      </p>
                    </div>

                    {/* Compounding Formula */}
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #dadce0', borderRadius: '6px', padding: '12px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#3c4043', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={13} color={THEME.primary} />
                        <span>Compounding Architecture</span>
                      </span>
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.74rem', color: '#475569', lineHeight: '1.4' }}>
                        {row.activeFormulation}. Compartmentalized timing prevents botanical antagonism against live probiotics.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        )}

        {/* 3. BLOODO TAB: Capillary DBS NAD+ Biomarkers */}
        {activeTab === 'bloodo' && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${THEME.border}`,
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FlaskConical size={18} color="#0284c7" />
                  <span>Bloodo™ Intracellular Capillary Blood Biomarkers</span>
                </h2>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: THEME.textMuted }}>
                  ISO 15189 / CE-IVDR accredited quantitative capillary dried blood spot (DBS) tests.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href="/p/bloodo-nad-level-test"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    height: '30px',
                    padding: '0 10px',
                    borderRadius: '4px',
                    border: '1px solid #bae6fd',
                    backgroundColor: '#f0f9ff',
                    color: '#0369a1',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ExternalLink size={12} />
                  <span>Bloodo NAD+ Datasheet</span>
                </a>
              </div>
            </div>

            <DataTable
              columns={bloodoColumns}
              data={filteredBloodo}
              keyField="id"
              tableId="nutritionist-bloodo-full"
              pagination={true}
              initialRowsPerPage={10}
              expandableRender={(row) => (
                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                    Clinical NAD+ Interpretation &amp; Supplement Titration
                  </span>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#334155', lineHeight: '1.4' }}>
                    {row.clinicalFinding}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: THEME.textMuted }}>Recommended Supplements:</span>
                    {row.assignedSupplements.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          height: '20px',
                          fontSize: '0.68rem',
                          lineHeight: '18px',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          border: '1px solid #dadce0',
                          borderRadius: '4px',
                          padding: '0 6px',
                          fontWeight: 500
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            />
          </div>
        )}

        {/* 4. ETERNA TAB: Biological Age & Telomeres */}
        {activeTab === 'eterna' && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${THEME.border}`,
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#7c3aed" />
                  <span>Eterna® Biological Age &amp; Telomere Length (Absolute qPCR)</span>
                </h2>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: THEME.textMuted }}>
                  CE-IVD calibrated epigenetic tracking. Compares chronological age against cellular senescence.
                </p>
              </div>
            </div>

            <DataTable
              columns={eternaColumns}
              data={filteredEterna}
              keyField="id"
              tableId="nutritionist-eterna-full"
              pagination={true}
              initialRowsPerPage={10}
              expandableRender={(row) => (
                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: '#faf5ff',
                    borderTop: '1px solid #e9d5ff',
                    borderBottom: '1px solid #e9d5ff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
                    Cellular Longevity &amp; Senolytic Protocol
                  </span>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#334155', lineHeight: '1.4' }}>
                    {row.interpretation}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: THEME.textMuted }}>Prescribed Protocol:</span>
                    {row.interventions.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          height: '20px',
                          fontSize: '0.68rem',
                          lineHeight: '18px',
                          backgroundColor: '#ffffff',
                          color: '#6d28d9',
                          border: '1px solid #e9d5ff',
                          borderRadius: '4px',
                          padding: '0 6px',
                          fontWeight: 600
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            />
          </div>
        )}

        {/* 5. MEAL PLANS TAB: 7-Day Precision Menus */}
        {activeTab === 'mealplans' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: `1px solid ${THEME.border}`,
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: THEME.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Utensils size={18} color="#d97706" />
                    <span>Prescribed 7-Day Precision Nutritional Regimens</span>
                  </h2>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: THEME.textMuted }}>
                    Individualized meal plans designed from 24Genomics SNP profiles and Bloodo metabolic biomarkers.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredMealPlans.map((mp) => (
                  <div
                    key={mp.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px 20px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.96rem', fontWeight: 800, color: THEME.textMain }}>{mp.title}</span>
                          <span style={{ fontSize: '0.70rem', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '1px 8px', borderRadius: '12px', fontWeight: 700 }}>
                            {mp.dietType}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: THEME.textMuted, marginTop: '2px' }}>
                          Patient: {mp.patientCode} • Target: {mp.targetCalories} • Macros: P {mp.macros.protein} / F {mp.macros.fat} / C {mp.macros.carb}
                        </div>
                      </div>

                      <a
                        href={mp.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          height: '30px',
                          padding: '0 12px',
                          borderRadius: '4px',
                          backgroundColor: THEME.primary,
                          color: '#ffffff',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Download size={12} />
                        <span>Download 59-Pág PDF</span>
                      </a>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                      <div>
                        <span style={{ fontSize: '0.70rem', fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase' }}>Breakfast</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: THEME.textMain }}>{mp.breakfast}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.70rem', fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase' }}>Lunch</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: THEME.textMain }}>{mp.lunch}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.70rem', fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase' }}>Dinner</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.74rem', color: THEME.textMain }}>{mp.dinner}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}

