"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { usePageMeta } from '../hooks/usePageMeta';
import PublicUnifiedHeader from '../components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '../components/shared/PublicUnifiedFooter';
import PublicStickyActionBar from '../components/shared/PublicStickyActionBar';
import DiagnosticReportVisualPreview from '../components/diagnostic/DiagnosticReportVisualPreview';
import BloodoCollectionSidebar from '../components/diagnostic/BloodoCollectionSidebar';
import EternaCollectionSidebar from '../components/diagnostic/EternaCollectionSidebar';
import UltraPersonCollectionSidebar from '../components/diagnostic/UltraPersonCollectionSidebar';
import ColwayCollectionSidebar from '../components/diagnostic/ColwayCollectionSidebar';
import ColwayMainSections from '../components/collection/ColwayMainSections';
import PublicInstitutionalInquiryDrawer from '../components/shared/PublicInstitutionalInquiryDrawer';
import PublicAtlasAIDrawer from '../components/shared/PublicAtlasAIDrawer';
import ColwayTrichologyStemCellShowcase from '../components/product/ColwayTrichologyStemCellShowcase';
import ClinicalPortfolioSuiteSwitcher from '../components/navigation/ClinicalPortfolioSuiteSwitcher';
import GenericCollectionSidebar from '../components/diagnostic/GenericCollectionSidebar';
import ProductTechnicalDetailsPanel from '../components/collection/ProductTechnicalDetailsPanel';
import CopyableId from '../components/ui/CopyableId';
import StatusBadge from '../components/ui/StatusBadge';
import GlobalSearchBar from '../components/ui/GlobalSearchBar';
import EmptyState from '../components/ui/EmptyState';
import TieredPriceShield from '../components/pricing/TieredPriceShield';
import { resolvePhysicalCapsuleSize, CAPSULE_BOTTLE_SIZES } from '../services/pharmapolisCostEngine.js';
import FrictionFreeUnlockModal from '../components/pricing/FrictionFreeUnlockModal';
import InlineOrderButton from '../components/orders/InlineOrderButton';
import UnifiedOrderDrawer from '../components/orders/UnifiedOrderDrawer';
import { useAuth } from '../context/AuthContext';
import {
  Search, SlidersHorizontal, LayoutGrid, List, Sparkles, Shield, Activity,
  Zap, HeartPulse, Check, ArrowRight, ExternalLink, Dna,
  Droplets, Microscope, FileText, FlaskConical, Award, ShieldCheck, CheckCircle2, ChevronRight,
  ChevronDown, Layers, Eye, Lock, LogIn, User, MessageSquare, BookOpen, Package, Mail, Download
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import { getTeletestCatalog } from '../data/teletestRegistry';
import ClinicalWorksExplorer from '../components/collection/ClinicalWorksExplorer';
import { getWorksByClinicalArea, getWorksByBrand } from '../data/clinicalWorksRegistry';
import '../styles/collection_shared.css';

// Brand configurations with clinical metadata and 4 KPIs (Regla Golden #22)
const BRAND_CONFIGS = {
  colway: {
    name: 'Colway',
    title: 'Colway® Bioactive Native Collagen',
    tagline: 'Bioactive Freshwater Tropocollagen, Cellular Dermocosmetics & Trichology',
    badge: 'Clinical Nutriceuticals, Dermocosmetics & Trichology Desk',
    badgeColor: '#0d9488',
    subtitle: 'Polish pioneer in biologically active native freshwater fish tropocollagen (triple-helix preserved), cellular oral nutriceuticals, advanced diamond cosmeceuticals, and medical follicular trichology.',
    heroImage: '/images/products/colway/colway-dermatology-clinic-hero-v2.jpg',
    accentColor: '#0d9488',
    kpis: [
      { label: 'Active Tropocollagen', value: 'Triple Helix', sub: 'Sublimation Freeze-Dried Active Form', icon: Sparkles, color: '#0d9488' },
      { label: 'Diamond Peptides', value: 'VEP-Carrier', sub: 'Cellular Neocollagenesis & Remodeling', icon: Award, color: '#2563eb' },
      { label: 'Scalp Trichology', value: 'Baicapil™ 2%', sub: 'Follicular Anchorage & Diosmin', icon: Zap, color: '#d97706' },
      { label: 'Regulatory Compliance', value: 'EU Reg. & GMP', sub: 'CPNP Registered & Dermatologically Tested', icon: ShieldCheck, color: '#16a34a' }
    ],
    categories: [
      { id: 'all', label: 'All Formulations' },
      { id: 'epigenetic', label: 'Epigenetic & Blue Diamond' },
      { id: 'native-dermal', label: 'Native Dermal & Barrier' },
      { id: 'trichology', label: 'Trichology & Scalp System' },
      { id: 'nutricosmetics', label: 'Inside-Out Nutricosmetics' },
      { id: 'bundles', label: 'Clinical Protocol Bundles' }
    ]
  },
  bloodo: {
    name: 'Bloodo™ Diagnostics',
    title: 'Bloodo™ Capillary Blood Diagnostics & CE-IVDR Test Kits',
    badge: 'CE-IVDR Certified Laboratory Diagnostics',
    badgeColor: '#dc2626',
    subtitle: 'Precision Dried Blood Spot (DBS) tests analyzing intracellular cellular bioenergetics, diurnal endocrine rhythms, and 90-day metabolic glycation with ISO 15189 European laboratory validation.',
    heroImage: '/images/products/bloodo/nad.jpg',
    accentColor: '#e11d48',
    kpis: [
      { label: 'Accredited Biomarkers', value: '6 CE-IVDR Panels', sub: 'NAD+, Testosterone, Cortisol, HbA1c', icon: Microscope, color: '#e11d48' },
      { label: 'Laboratory Quality', value: 'ISO 15189', sub: 'European Reference Diagnostic Lab', icon: Award, color: '#0284c7' },
      { label: 'Sample Technology', value: 'Capillary DBS', sub: '100% Painless Finger-Prick Collection', icon: Droplets, color: '#d97706' },
      { label: 'Result Turnaround', value: '48 – 72 Hours', sub: 'Direct Quantitative Portal Delivery', icon: HeartPulse, color: '#16a34a' }
    ],
    categories: [
      { id: 'all', label: 'All Tests (6)' },
      { id: 'nad', label: 'Bioenergetics (NAD+)' },
      { id: 'cortisol', label: 'Endocrine & Cortisol CAR' },
      { id: 'testosterone', label: 'Androgens & Testosterone+' },
      { id: 'hba1c', label: 'Glycation & HbA1c' },
      { id: 'omega', label: 'Lipidomics & Omega-3' },
      { id: 'vitamin-d', label: 'Micronutrients & Vit D3' }
    ]
  },
  ultraperson: {
    name: 'UltraPerson™ Personalization',
    title: 'UltraPerson™ Personalization Protocols & Clinical Supplements',
    badge: 'Atlas Precision Clinical Formulations',
    badgeColor: '#7c3aed',
    subtitle: 'Medical-grade targeted nutritional cofactors engineered for direct synergy with precision peptide protocols, mitochondrial rejuvenation, and sustained daily physiological resilience.',
    heroImage: '/assets/vials/eterna-longevity.png',
    accentColor: '#7c3aed',
    kpis: [
      { label: 'Targeted Protocols', value: '6 Formulations', sub: 'Synergistic with Peptide Therapies', icon: FlaskConical, color: '#7c3aed' },
      { label: 'Capsule Technology', value: 'Vegan HPMC', sub: 'Acid-Resistant Delayed Release', icon: ShieldCheck, color: '#0284c7' },
      { label: 'Clean Standard', value: '0% Allergens', sub: 'Non-GMO, Gluten-Free, 100% Vegan', icon: Award, color: '#16a34a' },
      { label: 'AAA Protocol', value: '3-Month Formulations', sub: 'Standardized 500 mg Active Actives/Day', icon: Zap, color: '#ea580c' }
    ],
    categories: [
      { id: 'all', label: 'All Formulations' },
      { id: 'energy', label: 'Energy & Metabolic' },
      { id: 'cognitive', label: 'Cognitive & Clarity' },
      { id: 'stress', label: 'Stress & Cortisol' },
      { id: 'sleep', label: 'Sleep & Circadian' },
      { id: 'longevity', label: 'Longevity & Cellular' }
    ]
  },
  eterna: {
    name: 'ETERNA® Longevity DX',
    title: 'ETERNA® Multi-Omics Diagnostics & Organ Proteomics',
    badge: 'High-Throughput Multi-Omics Platform',
    badgeColor: '#0284c7',
    subtitle: 'Integrated longevity platform combining fixed genomic baseline (+700,000 SNPs), organ-specific biological age proteomics, and longitudinal blood telemetry processed by Eurofins.',
    heroImage: '/images/products/eterna/eterna-kit-box.png',
    accentColor: '#0284c7',
    kpis: [
      { label: 'Genetic Scope', value: '+700,000 SNPs', sub: 'High-Throughput Saliva DNA Array', icon: Dna, color: '#0284c7' },
      { label: 'Organ Proteomics', value: 'Blood Serum/Plasma', sub: 'Organ-Specific Biological Age Clocks', icon: Droplets, color: '#e11d48' },
      { label: 'Laboratory Partner', value: 'Eurofins Genomics', sub: 'ISO 17025 Clinical NGS Processing', icon: Award, color: '#16a34a' },
      { label: 'Wearable Sync', value: 'Continuous Telemetry', sub: 'Apple Health, Oura, Garmin Integration', icon: HeartPulse, color: '#7c3aed' }
    ],
    categories: [
      { id: 'all', label: 'All Tests & Services' },
      { id: 'genomics', label: 'Genomics & Saliva DNA' },
      { id: 'proteomics', label: 'Organ Proteomics & Blood' },
      { id: 'platform', label: 'Digital Platform & Pro' }
    ]
  },
  teletest: {
    name: 'TeleTest Analytika®',
    title: 'TeleTest Analytika® Clinical Genomics & Laboratory Diagnostics',
    badge: 'ISO 17025 European Reference Laboratory',
    badgeColor: '#0284c7',
    subtitle: 'European reference clinical laboratory authorized by Generalitat de Catalunya (E08750211) & ISO 17025 accredited. High-precision HLA immunogenetics, autoimmune celiac predisposition, and ICP-MS/MS hair tissue mineral & heavy metals toxicology.',
    heroImage: '/images/products/teletest/hla-autoinmunidad.svg',
    accentColor: '#0284c7',
    kpis: [
      { label: 'Laboratory Quality', value: 'ISO 17025', sub: 'Generalitat de Catalunya E08750211', icon: Award, color: '#16a34a' },
      { label: 'Analytical Method', value: 'ICP-MS/MS & qPCR', sub: 'High-Resolution Mass Spectrometry', icon: Microscope, color: '#0284c7' },
      { label: 'Diagnostic Scope', value: '36+ Elements & HLA', sub: 'Hair Toxicology & Immunogenetics', icon: Dna, color: '#d97706' },
      { label: 'Digital Reports', value: 'FNMT Signed', sub: 'Digital Validation 5-7 Workdays', icon: ShieldCheck, color: '#7c3aed' }
    ],
    categories: [
      { id: 'all', label: 'All Diagnostic Panels (5)' },
      { id: 'genomics', label: 'Genomics & Autoimmunity (HLA)' },
      { id: 'toxicology', label: 'Hair Mineral Analysis (HTMA)' },
      { id: 'metabolic', label: 'Omega Fatty Acids & Inflammatory Balance' },
      { id: 'detox', label: 'Pharmacogenetics & Metabolizer Detox' }
    ]
  },
  peptides: {
    name: 'Lotusland Peptides',
    title: 'Lotusland • Clinical Peptide Portfolio',
    tagline: 'High-Purity Reference Standards & Lyophilized Vials',
    badge: 'Lotusland EU Lyophilization Hub',
    badgeColor: '#003666',
    subtitle: 'Official monograph collection of verified lyophilized clinical peptides (≥99.0% HPLC purity, certified mass spectrometry, endotoxin-tested < 0.05 EU/mg) in sealed 10R borosilicate vials.',
    heroImage: '/images/og-peptides.png',
    accentColor: '#003666',
    kpis: [
      { label: 'Analytical Purity', value: '≥99.0% HPLC', sub: 'Certified Lot Analysis & Mass Spec', icon: ShieldCheck, color: '#16a34a' },
      { label: 'Sourcing Hub', value: 'Lotusland EU', sub: 'Verified Lyophilization Logistics', icon: Award, color: '#003666' },
      { label: 'Form Factor', value: '10R Borosilicate', sub: 'Sealed Lyophilized Cake with Septum', icon: FlaskConical, color: '#2563eb' },
      { label: 'Monograph Specs', value: 'Full COA Included', sub: 'Sequence, MW & Net Peptide Content', icon: FileText, color: '#7c3aed' }
    ],
    categories: [
      { id: 'all', label: 'All Peptides' },
      { id: 'recovery-repair', label: 'Recovery & Tissue Repair' },
      { id: 'metabolic', label: 'Metabolic & GLP-1/GIP' },
      { id: 'longevity', label: 'Longevity & Cellular' },
      { id: 'cognitive', label: 'Neuro & Cognitive' },
      { id: 'hormonal', label: 'Hormonal & GH Axis' }
    ]
  },
  'hair-treatments': {
    name: 'Hair Treatments & Clinical Trichology',
    title: 'Hair Treatments & Clinical Trichology • Integrated Follicular Protocols',
    tagline: 'Colway® Scalp Stem Cells, Bioactive Copper Peptides & HTMA Diagnostics',
    badge: 'Integrated Clinical Trichology & Scalp Regeneration',
    badgeColor: '#0d9488',
    subtitle: 'Comprehensive multi-modal trichological ecosystem uniting Colway® Baicapil™ stem cell topicals & native tropocollagen, Lotusland GHK-Cu & Zinc Thymulin peptide mesotherapy, and TeleTest® HTMA intracellular trace element diagnostics.',
    heroImage: '/images/products/colway/colway-trichology-banner.jpg',
    accentColor: '#0d9488',
    isAreaCollection: true,
    kpis: [
      { label: 'Hair Loss Arrest', value: '−60.6%', sub: 'Documented in 84-Day Baicapil In-Vivo RCT', icon: Zap, color: '#0d9488' },
      { label: 'Density & Anagen', value: '+49% Density', sub: 'Anagen/Telogen Ratio Improved 2.3 ➔ 4.7', icon: Sparkles, color: '#2563eb' },
      { label: 'Bioactive Peptides', value: 'GHK-Cu & ZT', sub: 'VEGF Follicular Angiogenesis & Pigment', icon: Dna, color: '#7c3aed' },
      { label: 'Regulatory & Lab', value: 'EU CPNP & ISO', sub: 'CPNP Cosmetic Reg. & ISO 17025 HTMA Lab', icon: ShieldCheck, color: '#16a34a' }
    ],
    categories: [
      { id: 'all', label: 'All Treatments & Diagnostics' },
      { id: 'colway-trichology', label: 'Colway® Topical Trichology' },
      { id: 'peptides', label: 'Bioactive Peptides (GHK-Cu)' },
      { id: 'diagnostic', label: 'HTMA Hair Mineral Diagnostics' },
      { id: 'nutricosmetics', label: 'Systemic Matrix (Colvita)' },
      { id: 'bundles', label: 'Clinical Protocol Bundles' }
    ]
  },
  'weight-loss': {
    name: 'Weight Loss & Metabolic Health',
    title: 'Weight Loss & Metabolic Health • Incretin Agonists & Body Composition',
    tagline: 'Dual/Triple GLP-1/GIP Incretins, Selective Lipolysis & HbA1c Telemetry',
    badge: 'Clinical Incretin Agonists & Metabolic Architecture',
    badgeColor: '#16a34a',
    subtitle: 'Comprehensive medical weight management ecosystem integrating dual/triple incretin mimetics (Tirzepatide, Semaglutide, Retatrutide), visceral lipolytic peptides (Tesamorelin, AOD-9604), and CE-IVDR capillary glycation diagnostics (Bloodo™ HbA1c).',
    heroImage: '/images/products/bloodo/nad.jpg',
    accentColor: '#16a34a',
    isAreaCollection: true,
    kpis: [
      { label: 'Weight Reduction', value: 'Up to −20.9%', sub: 'SURMOUNT-1 Phase 3 Tirzepatide (72w)', icon: Zap, color: '#16a34a' },
      { label: 'Visceral Fat Loss', value: '−18% to −24%', sub: 'Selective VAT Reduction via Tesamorelin', icon: Sparkles, color: '#2563eb' },
      { label: 'Lean Mass Sparing', value: 'Zero Sarcopenia', sub: 'Preserves Skeletal Muscle & Bone Density', icon: ShieldCheck, color: '#0d9488' },
      { label: 'Glycation Control', value: 'HbA1c & CE-IVDR', sub: '90-Day Integrated Insulin Sensitivity', icon: Microscope, color: '#dc2626' }
    ],
    categories: [
      { id: 'all', label: 'All Formulations & Tests' },
      { id: 'dual-incretins', label: 'Dual & Triple Agonists (Tirzepatide / Retatrutide)' },
      { id: 'glp1', label: 'GLP-1 Agonists (Semaglutide)' },
      { id: 'lipolytic', label: 'Visceral Lipolysis (Tesamorelin / AOD-9604)' },
      { id: 'metabolic-diagnostics', label: 'Metabolic Diagnostics (Bloodo™ HbA1c)' }
    ]
  },
  'tissue-repair': {
    name: 'Tissue Repair & Rapid Recovery',
    title: 'Tissue Repair & Rapid Recovery • Musculoskeletal & Dermal Regeneration',
    tagline: 'Angiogenesis Peptides, Tendon-Bone Healing & Native Tropocollagen',
    badge: 'Cellular Reconstruction & Musculoskeletal Desk',
    badgeColor: '#2563eb',
    subtitle: 'Accelerated regenerative recovery combining microvascular angiogenesis peptides (BPC-157, TB-500, KPV), native freshwater fish tropocollagen matrix (Colway®), and musculoskeletal mineral balancing.',
    heroImage: '/images/og-protocols.png',
    accentColor: '#2563eb',
    isAreaCollection: true,
    kpis: [
      { label: 'Collagen Synthesis', value: '3x Type I/III', sub: 'Organized Extracellular Matrix Remodeling', icon: Sparkles, color: '#2563eb' },
      { label: 'Microvascular Growth', value: 'VEGF / VEGFR2', sub: 'Early Revascularization of Ischemic Tissue', icon: Zap, color: '#16a34a' },
      { label: 'Analytical Standard', value: 'HPLC ≥99.0%', sub: 'Certified Mass Spectrometry & Low Endotoxin', icon: ShieldCheck, color: '#003666' },
      { label: 'Tissue Sparing', value: 'Anti-Fibrotic', sub: 'Prevents Disorganized Scarring & Adhesions', icon: Award, color: '#7c3aed' }
    ],
    categories: [
      { id: 'all', label: 'All Repair Formulations' },
      { id: 'peptides', label: 'Regenerative Peptides (BPC-157 / TB-500)' },
      { id: 'collagen', label: 'Tropocollagen & Dermal Matrix (Colway®)' },
      { id: 'oral-matrix', label: 'Systemic Matrix Repair (Colvita)' }
    ]
  },
  'longevity-cellular': {
    name: 'Cellular Longevity & Epigenetics',
    title: 'Cellular Longevity & Telomeres • Biological Age Reversal & Multi-Omics',
    tagline: 'Telomerase Activation, Mitochondrial Biogenesis & Senolytic Clearance',
    badge: 'Biogerontology & Multi-Omics Architecture',
    badgeColor: '#0369a1',
    subtitle: 'Precision biogerontology platform combining telomerase-activating peptides (Epithalon), mitochondrial hormetins (MOTS-c), targeted senolytics (FOXO4-DRI), ETERNA® 700k Multi-Omics, and Bloodo™ intracellular NAD+ telemetry.',
    heroImage: '/images/products/eterna/eterna-kit-box.png',
    accentColor: '#0369a1',
    isAreaCollection: true,
    kpis: [
      { label: 'Telomerase Activity', value: 'hTERT Induction', sub: 'Supera el Límite de Hayflick en +33%', icon: Sparkles, color: '#0369a1' },
      { label: 'Multi-Omics Scope', value: '+700k SNPs & Clocks', sub: 'Proteómica de Edad Biológica por Órganos', icon: Dna, color: '#7c3aed' },
      { label: 'Mitochondrial Bioenergetics', value: 'MOTS-c & AMPK', sub: 'Mimetismo Celular del Ejercicio Físico', icon: Zap, color: '#16a34a' },
      { label: 'Diagnostic Precision', value: 'CE-IVDR NAD+', sub: 'Medición Intracelular en Sangre Seca (DBS)', icon: Microscope, color: '#e11d48' }
    ],
    categories: [
      { id: 'all', label: 'All Longevity Therapies' },
      { id: 'telomeres', label: 'Telomeres & Biogerontology (Epithalon)' },
      { id: 'mitochondrial', label: 'Mitochondrial Bioenergetics (MOTS-c)' },
      { id: 'diagnostics', label: 'Multi-Omics & NAD+ (ETERNA / Bloodo)' },
      { id: 'supplements', label: 'Cellular Supplements (UltraPerson)' }
    ]
  },
  'neuro-performance': {
    name: 'Neuro-Performance, Focus & Sleep',
    title: 'Neuro-Performance & Sleep • BDNF Nootropics & Delta Architecture',
    tagline: 'Neurotrophic BDNF Peptides, Non-Sedative Anxiolysis & Sleep Normalization',
    badge: 'Clinical Neuro-Cognitive & Circadian Desk',
    badgeColor: '#7c3aed',
    subtitle: 'Comprehensive brain optimization suite uniting neurotrophic cognitive peptides (Semax, Selank), slow-wave sleep inducers (DSIP), Bloodo™ diurnal cortisol telemetry, and UltraPerson™ botanical adaptogens.',
    heroImage: '/images/longevity_supps.png',
    accentColor: '#7c3aed',
    isAreaCollection: true,
    kpis: [
      { label: 'Neurotrophic Upregulation', value: '3x BDNF / NGF', sub: 'Plasticidad Sináptica y Memoria de Trabajo', icon: Dna, color: '#7c3aed' },
      { label: 'Anxiolytic Modulation', value: 'GABAérgica Pura', sub: 'Ansiólisis sin Sedación ni Tolerancia (Selank)', icon: ShieldCheck, color: '#0284c7' },
      { label: 'Delta Sleep Time', value: '+59% Fase III/IV', sub: 'Arquitectura del Sueño Profundo Restaurador', icon: Sparkles, color: '#16a34a' },
      { label: 'Endocrine Telemetry', value: 'Cortisol CAR', sub: 'Curva Circadiana Suprarrenal en 4 Puntos', icon: Microscope, color: '#ea580c' }
    ],
    categories: [
      { id: 'all', label: 'All Neuro & Sleep Formulations' },
      { id: 'nootropics', label: 'Neurotrophic Nootropics (Semax / Selank)' },
      { id: 'sleep', label: 'Circadian & Sleep (DSIP)' },
      { id: 'diagnostics', label: 'Endocrine Telemetry (Bloodo™ Cortisol)' },
      { id: 'botanicals', label: 'Botanical Neuro-Supplements (UltraPerson)' }
    ]
  },
  'dermal-aesthetics': {
    name: 'Dermal Aesthetics & Skin Barrier',
    title: 'Dermal Aesthetics & Epigenetic Skin Barrier • VEP Peptides & Tropocollagen',
    tagline: 'Epigenetic mRNA Neocollagenesis, Triple-Helix Tropocollagen & GHK-Cu',
    badge: 'Advanced Medical Dermocosmetics & Skin Architecture',
    badgeColor: '#0284c7',
    subtitle: 'Cellular dermocosmetics and skin rejuvenation uniting Colway® Blue Diamond epigenetic peptides, biologically active freshwater tropocollagen, and Lotusland GHK-Cu copper remodeling peptides.',
    heroImage: '/images/products/colway/colway-dermatology-clinic-hero-v2.jpg',
    accentColor: '#0284c7',
    isAreaCollection: true,
    kpis: [
      { label: 'Active Tropocollagen', value: 'Triple-Helix 100%', sub: 'Estructura Cuaternaria de Sostén Dérmico', icon: Sparkles, color: '#0284c7' },
      { label: 'Extracellular Remodeling', value: 'Decorina & GHK-Cu', sub: 'Upregulación de Síntesis de Colágeno I/III', icon: Award, color: '#16a34a' },
      { label: 'Transdermal Carrier', value: 'VEP-Carrier', sub: 'Permeación a través del Estrato Córneo', icon: Zap, color: '#7c3aed' },
      { label: 'Regulatory Standard', value: 'EU CPNP Reg.', sub: 'Reglamento (CE) 1223/2009 & GMP Cosmético', icon: ShieldCheck, color: '#003666' }
    ],
    categories: [
      { id: 'all', label: 'All Dermal Formulations' },
      { id: 'epigenetic', label: 'Epigenetic & Blue Diamond (Colway®)' },
      { id: 'copper-peptides', label: 'Copper Peptides (GHK-Cu)' },
      { id: 'native-collagen', label: 'Native Tropocollagen & Vege' },
      { id: 'oral-matrix', label: 'Inside-Out Nutricosmetics (Colvita)' }
    ]
  }
};

BRAND_CONFIGS.ultraman = BRAND_CONFIGS.ultraperson;
BRAND_CONFIGS['hair-treatment'] = BRAND_CONFIGS['hair-treatments'];
BRAND_CONFIGS['trichology'] = BRAND_CONFIGS['hair-treatments'];
BRAND_CONFIGS['hair'] = BRAND_CONFIGS['hair-treatments'];
BRAND_CONFIGS['trichotest'] = BRAND_CONFIGS['hair-treatments'];
BRAND_CONFIGS['weight'] = BRAND_CONFIGS['weight-loss'];
BRAND_CONFIGS['metabolic'] = BRAND_CONFIGS['weight-loss'];
BRAND_CONFIGS['repair'] = BRAND_CONFIGS['tissue-repair'];
BRAND_CONFIGS['recovery'] = BRAND_CONFIGS['tissue-repair'];
BRAND_CONFIGS['longevity'] = BRAND_CONFIGS['longevity-cellular'];
BRAND_CONFIGS['neuro'] = BRAND_CONFIGS['neuro-performance'];
BRAND_CONFIGS['cognitive'] = BRAND_CONFIGS['neuro-performance'];
BRAND_CONFIGS['dermal'] = BRAND_CONFIGS['dermal-aesthetics'];

function resolveBrandProductImage(product, brandSlug) {
  if (product.image_url) return product.image_url;
  if (product.imageUrl) return product.imageUrl;
  if (product.image) return product.image;

  if (brandSlug === 'peptides') {
    if (product.image) return product.image;
    if (product.image_url) return product.image_url;
    if (product.imageUrl) return product.imageUrl;
    const pid = (product.id || product.slug || '').toLowerCase();
    if (pid.includes('bpc')) return '/images/products/lotusland/bpc-157.png';
    if (pid.includes('tb-500') || pid.includes('tb500')) return '/images/products/lotusland/tb-500.png';
    if (pid.includes('ghk')) return '/images/products/lotusland/ghk-cu.png';
    if (pid.includes('epithalon')) return '/images/products/lotusland/epithalon.png';
    if (pid.includes('mots')) return '/images/products/lotusland/mots-c.png';
    return '/images/products/lotusland/bpc-157.png';
  }

  const id = (product.id || '').toLowerCase();
  const name = (product.name || product.title || '').toLowerCase();

  if (brandSlug === 'teletest') {
    if (id.includes('hla') || id.includes('gnt')) return '/images/products/teletest/hla-autoinmunidad.svg';
    if (id.includes('celiac') || id.includes('gluten')) return '/images/products/teletest/celiac-genetics.svg';
    if (id.includes('omega') || name.includes('omega')) return '/images/products/teletest/omega-test.svg';
    if (id.includes('detox') || id.includes('metabolizer') || name.includes('detox')) return '/images/products/teletest/metabolizer-detox.svg';
    if (id.includes('tox') || id.includes('pesados')) return '/images/products/teletest/heavy-metals.svg';
    return '/images/products/teletest/mineralograma-cabello.svg';
  }

  if (brandSlug === 'hair-treatments' || brandSlug === 'hair' || brandSlug === 'trichology' || brandSlug === 'trichotest') {
    if (id.includes('shampoo') || name.includes('shampoo')) return '/images/products/colway/shampoo.png';
    if (id.includes('conditioner') || name.includes('conditioner')) return '/images/products/colway/conditioner.png';
    if (id.includes('colvita') || name.includes('colvita')) return '/images/products/colway/colvita.png';
    if (id.includes('trichology') || name.includes('trichology')) return '/images/products/colway/bundle-colway-trichology.jpg';
    if (id.includes('ghk') || name.includes('ghk')) return '/images/products/lotusland/ghk-cu.png';
    if (id.includes('tb-500') || id.includes('tb500')) return '/images/products/lotusland/tb-500.png';
    if (id.includes('bpc-157') || id.includes('bpc157') || id.includes('bpc')) return '/images/products/lotusland/bpc-157.png';
    if (id.includes('teletest') || id.includes('mineral') || id.includes('cabello') || id.includes('htma')) return '/images/products/teletest/mineralograma-cabello.svg';
    return '/images/products/colway/bundle-colway-trichology.jpg';
  }

  if (brandSlug === 'colway') {
    if (id.includes('colway-trichology') || id === 'colway-trichology') return '/images/products/colway/bundle-colway-trichology.jpg';
    if (id.includes('bundle-blue-diamond') || id.includes('blue-diamond-ritual')) return '/images/products/colway/bundle-blue-diamond-ritual.jpg';
    if (id.includes('bundle-inside-out') || id.includes('inside-out-collagen')) return '/images/products/colway/bundle-inside-out-collagen.jpg';
    if (id.includes('colvita') || name.includes('colvita')) return '/images/products/colway/colvita.png';
    if (id.includes('trichology') || name.includes('trichology')) return '/images/products/colway/bundle-colway-trichology.jpg';
    if (id.includes('vege') || name.includes('vege') || name.includes('vegan')) return '/images/products/colway/vege-collagen.png';
    if (id.includes('peeling') || name.includes('peeling')) return '/images/products/colway/blue-diamond-peeling.png';
    if (id.includes('blue-diamond') || id.includes('diamond') || name.includes('diamond') || name.includes('diament')) return '/images/products/colway/blue-diamond-cream.png';
    if (id.includes('lip') || name.includes('lip') || id.includes('balm') || name.includes('balm') || name.includes('pomadka')) return '/images/products/colway/lip-care.png';
    if (id.includes('wash') || name.includes('wash') || id.includes('gel') || name.includes('gel') || name.includes('zel')) return '/images/products/colway/washing-gel.png';
    if (id.includes('conditioner') || name.includes('conditioner')) return '/images/products/colway/conditioner.png';
    return '/images/products/colway/shampoo.png';
  }

  if (brandSlug === 'bloodo') {
    if (id.includes('nad') || name.includes('nad')) return '/images/products/bloodo/nad.jpg';
    if (id.includes('testosterone') || name.includes('testosterone')) return '/images/products/bloodo/testosterone.jpg';
    if (id.includes('cortisol') || name.includes('cortisol')) return '/images/products/bloodo/cortisol.jpg';
    if (id.includes('hba1c') || name.includes('hba1c') || name.includes('hemoglobin')) return '/images/products/bloodo/hba1c.jpg';
    if (id.includes('omega') || name.includes('omega')) return '/images/products/bloodo/omega.jpg';
    if (id.includes('vitamin-d') || name.includes('vitamin d')) return '/images/products/bloodo/vitamin-d.jpg';
    return '/images/products/bloodo/nad.jpg';
  }

  if (brandSlug === 'eterna') {
    return '/images/products/eterna/eterna-kit-box.png';
  }

  return '/images/longevity_supps.png';
}

function resolveProductDatasheet(product, brandSlug) {
  if (brandSlug !== 'colway') return null;
  const id = (product.id || product.slug || '').toLowerCase();
  const name = (product.name || product.title || '').toLowerCase();

  if (id.includes('wash') || name.includes('wash') || id.includes('zel') || name.includes('cleansing')) {
    return {
      title: 'Collagen Wash Gel Datasheet',
      url: '/docs/colway/colway-collagen-wash-gel-datasheet.pdf',
      filename: 'Colway-Collagen-Wash-Gel-Datasheet.pdf',
      badge: 'Wash Gel Monograph (PDF)',
      size: '362 KB'
    };
  }

  if (id.includes('shampoo') || name.includes('shampoo') || id.includes('conditioner') || name.includes('conditioner') || id === 'colway-trichology') {
    return {
      title: 'Trichology Duo Protocol & Datasheet',
      url: '/docs/colway/colway-shampoo-conditioner-trichology-datasheet.pdf',
      filename: 'Colway-Trichology-Shampoo-Conditioner-Dossier.pdf',
      badge: 'Trichology Dossier (PDF)',
      size: '1.1 MB'
    };
  }

  if (id.includes('vege') || name.includes('vege') || name.includes('vegan')) {
    return {
      title: 'Vege Collagen 100% Fitocosmetic Datasheet',
      url: '/docs/colway/colway-vege-collagen-datasheet.pdf',
      filename: 'Colway-Vege-Collagen-100-Fitocosmetic-Datasheet.pdf',
      badge: 'Fitocosmetic Monograph (PDF)',
      size: '4.3 MB'
    };
  }

  return null;
}

function getItemUnitLabel(slug, count, isEs) {
  const isOne = count === 1;
  if (slug === 'hair-treatments' || slug === 'hair' || slug === 'trichology' || slug === 'trichotest') {
    return isOne ? (isEs ? 'tratamiento' : 'treatment') : (isEs ? 'tratamientos' : 'treatments');
  }
  if (slug === 'colway' || slug === 'ultraperson' || slug === 'ultraman') {
    return isOne ? (isEs ? 'formulación' : 'formulation') : (isEs ? 'formulaciones' : 'formulations');
  }
  if (slug === 'peptides') {
    return isOne ? (isEs ? 'péptido' : 'peptide') : (isEs ? 'péptidos' : 'peptides');
  }
  return isOne ? (isEs ? 'prueba' : 'test') : (isEs ? 'pruebas' : 'tests');
}

function resolveProductRegulatoryBadges(product, brandSlug) {
  const id = (product.id || product.slug || '').toLowerCase();
  const name = (product.name || product.title || '').toLowerCase();

  if (brandSlug === 'hair-treatments' || brandSlug === 'hair' || brandSlug === 'trichology' || brandSlug === 'trichotest') {
    if (id.includes('shampoo') || name.includes('shampoo') || id.includes('conditioner') || name.includes('conditioner') || id.includes('colway')) {
      return [
        { label: '🇪🇺 EU CPNP Reg.', color: '#15803d', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.25)', title: 'European Union CPNP & Regulation (EC) No 1223/2009 Registered' },
        { label: 'Baicapil™ 2%', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.12)', border: 'rgba(3, 105, 161, 0.25)', title: 'Patented Hair Follicle Stem Cell Activator' }
      ];
    }
    if (id.includes('ghk') || id.includes('tb-500') || id.includes('bpc') || product.category === 'peptides') {
      return [
        { label: 'HPLC ≥99.0%', color: '#15803d', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.25)', title: 'HPLC Verified Analytical Monograph Standard' },
        { label: 'Lotusland Hub', color: '#003666', bg: 'rgba(0, 54, 102, 0.10)', border: 'rgba(0, 54, 102, 0.25)', title: 'Official Lotusland Lyophilization Logistics Hub' }
      ];
    }
    if (id.includes('teletest') || id.includes('mineral') || id.includes('htma')) {
      return [
        { label: 'ISO 17025', color: '#15803d', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.25)', title: 'ISO 17025 European Reference Laboratory' },
        { label: 'Generalitat E08750211', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.12)', border: 'rgba(3, 105, 161, 0.25)', title: 'Departament de Salut de la Generalitat de Catalunya' }
      ];
    }
    return [
      { label: 'Clinical Grade', color: '#15803d', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.25)', title: 'Clinical Formulation Standard' }
    ];
  }
  if (brandSlug === 'teletest') {
    return [
      { label: 'ISO 17025', color: '#15803d', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.25)', title: 'ISO 17025 European Reference Laboratory' },
      { label: 'Generalitat E08750211', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.12)', border: 'rgba(3, 105, 161, 0.25)', title: 'Departament de Salut de la Generalitat de Catalunya' }
    ];
  }

  if (brandSlug !== 'colway') {
    if (brandSlug === 'peptides') {
      return [
        { label: 'HPLC ≥99.0%', color: '#15803d', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.25)', title: 'HPLC Verified Analytical Monograph Standard' },
        { label: 'Lotusland Hub', color: '#003666', bg: 'rgba(0, 54, 102, 0.10)', border: 'rgba(0, 54, 102, 0.25)', title: 'Official Lotusland Lyophilization Logistics Hub' }
      ];
    }
    const badgeLabel = brandSlug === 'eterna'
      ? 'CAP / CLIA'
      : (brandSlug === 'ultraperson' || brandSlug === 'ultraman')
      ? 'EU GMP'
      : 'CE-IVDR';
    return [
      { label: badgeLabel, color: '#15803d', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.25)', title: 'Laboratory & Quality Standard' }
    ];
  }

  // All Colway products registered in European Union (Regulation EC No 1223/2009 & CPNP)
  const badges = [
    { label: '🇪🇺 EU CPNP Reg.', color: '#15803d', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.25)', title: 'European Union CPNP & Regulation (EC) No 1223/2009 Registered' }
  ];

  const isShampooOrConditioner = id.includes('shampoo') || name.includes('shampoo') || id.includes('conditioner') || name.includes('conditioner') || id === 'colway-trichology';
  const isLipBalmOrWashGel = id.includes('lip') || name.includes('lip') || id.includes('balm') || name.includes('pomadka') || id.includes('wash') || name.includes('wash') || id.includes('gel');

  if (isShampooOrConditioner) {
    badges.push(
      { label: '🇦🇪 UAE MoHAP / Montaji', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.12)', border: 'rgba(3, 105, 161, 0.25)', title: 'Registered in the United Arab Emirates (MoHAP / Dubai Montaji)' },
      { label: '🇶🇦 Qatar MoPH', color: '#831843', bg: 'rgba(131, 24, 67, 0.12)', border: 'rgba(131, 24, 67, 0.25)', title: 'Registered in Qatar (Ministry of Public Health)' }
    );
  } else if (isLipBalmOrWashGel) {
    badges.push(
      { label: '🇦🇪 UAE MoHAP / Montaji', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.12)', border: 'rgba(3, 105, 161, 0.25)', title: 'Registered in the United Arab Emirates (MoHAP / Dubai Montaji)' }
    );
  }

  return badges;
}

export default function BrandCollectionPage({
  brandSlug = 'bloodo',
  products: initialProducts = [],
  onSelectProduct,
  updateCart,
  toggleCompare
}) {
  const router = useRouter();
  const config = BRAND_CONFIGS[brandSlug] || BRAND_CONFIGS.bloodo;
  const { user, activeRole, isProfessional, loginWithGoogle } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atlas_portal_lang') || 'en';
    }
    return 'en';
  });
  const isEs = lang === 'es';

  const products = useMemo(() => {
    if (brandSlug === 'teletest' && (!initialProducts || initialProducts.length === 0)) {
      return getTeletestCatalog();
    }
    return initialProducts || [];
  }, [brandSlug, initialProducts]);

  const brandCategories = useMemo(() => {
    return (config.categories || []).map((cat) => {
      const isAll = cat.id === 'all';
      const catId = cat.id.toLowerCase();
      const count = isAll
        ? products.length
        : products.filter(p => {
            const str = `${p.id} ${p.name || ''} ${p.title || ''} ${p.category || ''} ${p.subcategory || ''} ${p.clinical_line || ''} ${p.description || ''} ${JSON.stringify(p.activeIngredients || [])}`.toLowerCase();
            if (brandSlug === 'teletest') {
              if (catId === 'genomics') return str.includes('genom') || str.includes('hla') || str.includes('celiac') || str.includes('celiaca') || str.includes('gnt') || str.includes('autoimmun');
              if (catId === 'toxicology') return str.includes('toxic') || str.includes('mineral') || str.includes('htma') || str.includes('hair') || str.includes('cabello') || str.includes('metales') || str.includes('heavy metal');
              if (catId === 'metabolic') return str.includes('omega') || str.includes('metabol') || str.includes('fatty acid') || str.includes('acidos grasos');
              if (catId === 'detox') return str.includes('detox') || str.includes('saliva') || str.includes('metabolizer') || str.includes('pharmacogen') || str.includes('farmacogen');
            }
            return str.includes(catId);
          }).length;
      return {
        id: cat.id,
        label: cat.label,
        count
      };
    });
  }, [config.categories, products, brandSlug]);

  const colwayCategories = brandCategories;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeMainTab, setActiveMainTab] = useState('products'); // 'products' | 'works' | 'protocols'

  const collectionWorks = useMemo(() => {
    const areaMap = {
      'hair-treatments': 'hair-treatments',
      'hair-treatment': 'hair-treatments',
      'trichology': 'hair-treatments',
      'hair': 'hair-treatments',
      'trichotest': 'hair-treatments',
      'weight-loss': 'weight-loss',
      'weight': 'weight-loss',
      'metabolic': 'weight-loss',
      'tissue-repair': 'tissue-repair',
      'repair': 'tissue-repair',
      'recovery': 'tissue-repair',
      'longevity-cellular': 'longevity-cellular',
      'longevity': 'longevity-cellular',
      'neuro-performance': 'neuro-performance',
      'neuro': 'neuro-performance',
      'cognitive': 'neuro-performance',
      'dermal-aesthetics': 'dermal-aesthetics',
      'dermal': 'dermal-aesthetics'
    };
    if (areaMap[brandSlug]) {
      return getWorksByClinicalArea(areaMap[brandSlug]);
    }
    return getWorksByBrand(brandSlug);
  }, [brandSlug]);

  const [viewMode, setViewMode] = useState('table'); // 'table' (rows/lines - GCP UX) | 'grid'
  const [sortOption, setSortOption] = useState('featured');
  const [addedItem, setAddedItem] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [scopeMode, setScopeMode] = useState('filtered'); // 'filtered' | 'global'
  const [isHeroExpanded, setIsHeroExpanded] = useState(false); // Fase 1: descripción colapsable en móvil
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isAtlasAiOpen, setIsAtlasAiOpen] = useState(false);
  const [activeColwaySection, setActiveColwaySection] = useState('overview'); // 'overview' | 'catalog' | 'advantage' | 'protocols' | 'calculator'
  const [activeProtocolId, setActiveProtocolId] = useState(null);

  // Dynamic Tiered Pricing & Unlock Modal (Golden Rule #14 & #22)
  const [activeCurrency, setActiveCurrency] = useState('EUR'); // 'EUR' | 'USD' | 'AED'
  const [adminSimulationTier, setAdminSimulationTier] = useState('clinic'); // 'cost' | 'wholesaler' | 'clinic' | 'retail'
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [selectedCapsulesMap, setSelectedCapsulesMap] = useState({});

  const handleCapsuleSelect = (productId, count, e) => {
    if (e) e.stopPropagation();
    triggerHaptic('light');
    setSelectedCapsulesMap(prev => ({ ...prev, [productId]: count }));
  };

  const canonicalUrl = `https://www.atlashealth-services.com/collection/${brandSlug}`;

  // Direct Institutional WhatsApp Inquiry with pre-filled clinical context (Fase 1)
  const getWhatsAppInquiryUrl = (product = null) => {
    const cleanPhone = process.env.NEXT_PUBLIC_ATLAS_WHATSAPP || '971564179256';
    let text;
    if (brandSlug === 'peptides') {
      if (product) {
        text = `Hello Atlas Health Services Medical Affairs, I am inquiring about *${product.name || product.title}* from the Lotusland Peptides Collection. Please provide institutional wholesale pricing, COA and technical specifications.`;
      } else if (selectedCategory && selectedCategory !== 'all') {
        text = `Hello Atlas Health Services Medical Affairs, I am reviewing the *Lotusland Peptides (${selectedCategory})* catalog. Please share the wholesale catalog and supply terms.`;
      } else {
        text = `Hello Atlas Health Services Medical Affairs, I am reviewing the *Lotusland Peptides Collection* (HPLC ≥99.0% Lyophilized Vials). Please share the wholesale catalog and supply terms.`;
      }
    } else if (brandSlug === 'teletest') {
      if (product) {
        text = `Hello Atlas Health Services Medical Affairs, I am inquiring about *${product.name || product.title}* from the TeleTest Analytika® Collection (ISO 17025 European Reference Laboratory). Please provide institutional wholesale pricing and clinical technical documentation.`;
      } else if (selectedCategory && selectedCategory !== 'all') {
        const catMeta = colwayCategories.find(c => c.id === selectedCategory);
        text = `Hello Atlas Health Services Medical Affairs, I am reviewing the *TeleTest Analytika® ${catMeta?.label || selectedCategory}* diagnostic panel line. I would like to request clinical protocols and B2B pricing for medical clinics.`;
      } else {
        text = `Hello Atlas Health Services Medical Affairs, I am reviewing the *TeleTest Analytika® Clinical Diagnostics Collection* (HTMA Hair Mineral Toxicology, HLA Autoimmunity, Celiac Predisposition, Omega-3 Index, Saliva Metabolizer). Please share the wholesale catalog and laboratory onboarding guidelines.`;
      }
    } else if (brandSlug === 'hair-treatments' || brandSlug === 'hair' || brandSlug === 'trichology' || brandSlug === 'trichotest') {
      if (product) {
        text = `Hello Atlas Health Services Medical Affairs, I am inquiring about *${product.name || product.title}* from the Hair Treatments & Clinical Trichology Collection. Please provide clinical protocols, B2B pricing and technical dossier.`;
      } else {
        text = `Hello Atlas Health Services Medical Affairs, I am reviewing the *Hair Treatments & Clinical Trichology Collection* (Colway® Baicapil™ stem cells, GHK-Cu copper peptides & TeleTest® HTMA diagnostics). Please share the wholesale catalog and clinical application protocols.`;
      }
    } else if (product) {
      text = `Hello Atlas Health Services Medical Affairs, I am inquiring about *${product.name || product.title}* from the Colway® Collection. Please provide institutional wholesale pricing and clinical technical documentation.`;
    } else if (selectedCategory && selectedCategory !== 'all') {
      const catMeta = colwayCategories.find(c => c.id === selectedCategory);
      text = `Hello Atlas Health Services Medical Affairs, I am reviewing the *Colway® ${catMeta?.label || selectedCategory}* line. I would like to request clinical protocols and B2B pricing for medical clinics.`;
    } else {
      text = `Hello Atlas Health Services Medical Affairs, I am reviewing the *Colway® Bioactive Native Collagen Collection* (8 formulations + clinical bundles). Please share the wholesale catalog and clinical onboarding guidelines.`;
    }
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  // SEO & structured data
  usePageMeta({
    title: `${config.title} | Atlas Collections`,
    description: config.subtitle,
    path: `/collection/${brandSlug}`,
  });

  // Google Cloud UX Rule #7: Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('catalog-search-input');
        if (input) {
          input.focus();
          input.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const breadcrumbs = [
    { label: 'Collections', path: '/collection/peptides' },
    { label: config.name }
  ];

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Colway collection: individual formulations vs bundles
    if (brandSlug === 'colway') {
      if (selectedCategory === 'bundles') {
        list = [
          {
            id: 'colway-trichology',
            slug: 'colway-strengthening-shampoo',
            name: 'Colway Trichology Hair Strengthening System (2-Step Duo)',
            category: 'trichology',
            presentation: '2-Step System (250 mL Shampoo + 200 mL Conditioner)',
            overview_summary: 'Dual-action medical trichology protocol: ostium cleansing with Baicapil™ 2% + Diosmin followed by cuticular sealing and keratin reinforcement.',
            image: '/images/products/colway/bundle-colway-trichology.jpg',
            routine_badge: 'Complete 2-Step Trichological System',
            step_number: 99,
            price: 92.00,
            landedCostAed: 200,
            wholesalePriceAed: 230,
            retailPriceAed: 340
          },
          {
            id: 'bundle-blue-diamond-ritual',
            slug: 'colway-blue-diamond-cream',
            name: 'Blue Diamond Complete Cellular Epigenetic Ritual',
            category: 'epigenetic-cellular',
            presentation: '2-Step Cellular Ritual (75 mL Peeling + 50 mL Cream)',
            overview_summary: 'Enzymatic diamond pre-exfoliation to triple skin permeability, followed by VEP-carrier diamond peptide cream for deep neocollagenesis.',
            image: '/images/products/colway/bundle-blue-diamond-ritual.jpg',
            routine_badge: 'Complete Epigenetic Rejuvenation Kit',
            step_number: 99,
            price: 155.00,
            landedCostAed: 335,
            wholesalePriceAed: 385.25,
            retailPriceAed: 580
          },
          {
            id: 'bundle-inside-out-collagen',
            slug: 'colway-colvita',
            name: 'Inside-Out Complete Neocollagenesis Protocol',
            category: 'nutricosmetics',
            presentation: 'Dual-Action Protocol (Colvita 60 Caps + Blue Diamond Cream 50 mL)',
            overview_summary: 'The ultimate dual-action protocol: oral freeze-dried tropocollagen supplying building amino acids from the bloodstream, combined with topical diamond peptides.',
            image: '/images/products/colway/bundle-inside-out-collagen.jpg',
            routine_badge: 'Inside-Out Clinical Protocol',
            step_number: 99,
            price: 150.00,
            landedCostAed: 325,
            wholesalePriceAed: 373.75,
            retailPriceAed: 560
          }
        ];
      } else {
        // Exclude all bundle/protocol products from individual formulations view
        list = list.filter(p => {
          const pid = p.id || '';
          return pid !== 'colway-trichology' &&
                 !pid.startsWith('bundle-') &&
                 p.slug !== 'colway-trichology';
        });
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const text = `${p.id} ${p.name || ''} ${p.title || ''} ${p.description || ''} ${p.desc || ''} ${p.sampleType || ''} ${JSON.stringify(p.activeIngredients || [])}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Category filter
    if (selectedCategory !== 'all' && selectedCategory !== 'bundles') {
      const cat = selectedCategory.toLowerCase();
      list = list.filter(p => {
        const str = `${p.id} ${p.name || ''} ${p.title || ''} ${p.category || ''} ${p.subcategory || ''} ${p.clinical_line || ''} ${p.description || ''} ${JSON.stringify(p.activeIngredients || [])}`.toLowerCase();
        if (brandSlug === 'hair-treatments' || brandSlug === 'hair' || brandSlug === 'trichology' || brandSlug === 'trichotest') {
          if (cat === 'colway-trichology') return (str.includes('shampoo') || str.includes('conditioner') || str.includes('trichology') || str.includes('colway')) && !str.includes('colvita');
          if (cat === 'peptides') return str.includes('ghk') || str.includes('tb-500') || str.includes('tb500') || str.includes('bpc') || str.includes('peptide') || p.category === 'peptides';
          if (cat === 'diagnostic') return str.includes('htma') || str.includes('teletest') || str.includes('mineral') || str.includes('cabello');
          if (cat === 'nutricosmetics') return str.includes('colvita') || str.includes('capsule');
        }
        if (brandSlug === 'colway') {
          if (cat === 'epigenetic') return str.includes('diamond') || str.includes('diament') || str.includes('peeling') || str.includes('epigenetic');
          if (cat === 'native-dermal') return (str.includes('vege') || str.includes('wash') || str.includes('lip') || str.includes('dermal')) && !str.includes('diamond');
          if (cat === 'trichology' || cat === 'hair') return str.includes('hair') || str.includes('shampoo') || str.includes('conditioner') || str.includes('trichology') || str.includes('szampon') || str.includes('odzywka');
          if (cat === 'nutricosmetics' || cat === 'nutraceutical') return str.includes('colvita') || str.includes('supplement') || str.includes('capsule') || str.includes('suplement');
        }
        if (brandSlug === 'teletest') {
          if (cat === 'genomics') return str.includes('genom') || str.includes('hla') || str.includes('celiac') || str.includes('celiaca') || str.includes('gnt') || str.includes('autoimmun');
          if (cat === 'toxicology') return str.includes('toxic') || str.includes('mineral') || str.includes('htma') || str.includes('hair') || str.includes('cabello') || str.includes('metales') || str.includes('heavy metal');
          if (cat === 'metabolic') return str.includes('omega') || str.includes('metabol') || str.includes('fatty acid') || str.includes('acidos grasos');
          if (cat === 'detox') return str.includes('detox') || str.includes('saliva') || str.includes('metabolizer') || str.includes('pharmacogen') || str.includes('farmacogen');
        }
        if (brandSlug === 'peptides') {
          if (cat === 'recovery-repair') return str.includes('recovery') || str.includes('repair') || str.includes('bpc') || str.includes('tb-500') || str.includes('tb500') || str.includes('ghk') || str.includes('healing');
          if (cat === 'metabolic') return str.includes('metabolic') || str.includes('weight') || str.includes('glp') || str.includes('gip') || str.includes('semaglutide') || str.includes('tirzepatide') || str.includes('aod') || str.includes('tesamorelin');
          if (cat === 'longevity') return str.includes('longevity') || str.includes('cellular') || str.includes('epithalon') || str.includes('mots') || str.includes('nad');
          if (cat === 'cognitive') return str.includes('cognitive') || str.includes('neuro') || str.includes('semax') || str.includes('selank') || str.includes('brain');
          if (cat === 'hormonal') return str.includes('hormon') || str.includes('cjc') || str.includes('ipamorelin') || str.includes('gh') || str.includes('growth hormone');
        }
        if (brandSlug === 'ultraperson' || brandSlug === 'ultraman') {
          if (cat === 'energy') return str.includes('energy') || str.includes('metabolic') || str.includes('coq10') || str.includes('pqq');
          if (cat === 'cognitive') return str.includes('cognitive') || str.includes('clarity') || str.includes('focus') || str.includes('stress') || str.includes('theanine');
          if (cat === 'stress') return str.includes('stress') || str.includes('cortisol') || str.includes('resilience') || str.includes('ashwagandha');
          if (cat === 'sleep') return str.includes('sleep') || str.includes('circadian') || str.includes('restoration') || str.includes('apigenin');
          if (cat === 'longevity') return str.includes('longevity') || str.includes('cellular') || str.includes('renewal') || str.includes('resveratrol');
        }
        return str.includes(cat);
      });
    }

    // Sorting
    if (sortOption === 'name-asc') {
      list.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
    } else if (sortOption === 'name-desc') {
      list.sort((a, b) => (b.name || b.title || '').localeCompare(a.name || a.title || ''));
    }

    return list;
  }, [products, searchQuery, selectedCategory, sortOption]);

  // ── Fase 2 · Sincronización de filtros con la URL (?q=...&cat=...) (Reglas #24/#29) ──
  const [isUrlHydrated, setIsUrlHydrated] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const cat = params.get('cat');
    if (q) setSearchQuery(q);
    if (cat) setSelectedCategory(cat);
    setIsUrlHydrated(true);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined' || !isUrlHydrated) return;
    const params = new URLSearchParams(window.location.search);
    if (searchQuery.trim()) params.set('q', searchQuery.trim()); else params.delete('q');
    if (selectedCategory !== 'all') params.set('cat', selectedCategory); else params.delete('cat');
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, '', next);
    }
  }, [searchQuery, selectedCategory, isUrlHydrated]);

  // ── Fase 3 · KPIs calculados según el alcance (Filtered vs Entire collection) (Regla #22) ──
  const kpiCards = useMemo(() => {
    const isFiltered = scopeMode === 'filtered';
    const shown = isFiltered ? filteredProducts.length : products.length;
    const total = products.length;
    const realCategories = brandCategories.filter(c => c.id !== 'all' && c.id !== 'bundles');
    // Si hay búsqueda activa o categoría seleccionada, contar categorías únicas presentes en filteredProducts
    const filteredCategoriesCount = isFiltered && searchQuery.trim()
      ? new Set(filteredProducts.map(p => (p.category || p.clinical_line || 'other').toLowerCase())).size
      : realCategories.length;
    const activeCategoryLabel = selectedCategory === 'all'
      ? (searchQuery.trim() ? `${filteredCategoriesCount}` : null)
      : (brandCategories.find(c => c.id === selectedCategory)?.label || selectedCategory);
    const coverage = total > 0 ? Math.round((shown / total) * 100) : 0;
    const attribute = (config.kpis && (config.kpis[1] || config.kpis[0])) || null;
    return [
      {
        label: isEs ? 'Elementos' : 'Items',
        value: String(shown),
        sub: isFiltered ? (isEs ? 'Coinciden con los filtros' : 'Matching active filters') : (isEs ? 'Colección completa' : 'Entire collection'),
        icon: Layers
      },
      {
        label: isEs ? 'Categorías' : 'Categories',
        value: isFiltered && activeCategoryLabel ? activeCategoryLabel : String(realCategories.length),
        sub: isFiltered && activeCategoryLabel ? (isEs ? 'Categoría activa' : 'Active category') : (isEs ? 'Líneas disponibles' : 'Available lines'),
        icon: SlidersHorizontal
      },
      {
        label: isEs ? 'Cobertura' : 'Coverage',
        value: `${isFiltered ? coverage : 100}%`,
        sub: isEs ? `de ${total} en la colección` : `of ${total} in collection`,
        icon: Activity
      },
      ...(attribute ? [{ label: attribute.label, value: attribute.value, sub: attribute.sub, icon: attribute.icon || ShieldCheck }] : [])
    ];
  }, [scopeMode, filteredProducts.length, products.length, brandCategories, selectedCategory, config, isEs]);

  const activeSectionContext = useMemo(() => {
    if (brandSlug === 'teletest') {
      return {
        sectionId: selectedCategory,
        sectionTitle: selectedCategory === 'toxicology'
          ? 'ICP-MS/MS Hair Tissue Mineral & Heavy Metals Toxicology'
          : selectedCategory === 'genomics'
          ? 'High-Resolution HLA Immunogenetics & Celiac Predisposition'
          : selectedCategory === 'metabolic'
          ? 'Erythrocyte Membrane Omega-3 Index & Cellular Silent Inflammation'
          : selectedCategory === 'detox'
          ? 'Phase I/II Cytochrome P450 Hepatic Detoxification & Pharmacogenetics'
          : 'TeleTest Analytika® ISO 17025 Clinical Diagnostic Panels',
        products: filteredProducts.map(p => p.name || p.title),
        keyActives: 'Accreditation: Generalitat de Catalunya E08750211 · ISO 17025 European Reference Laboratory (Barcelona, EU). FNMT Digitally Signed Certified Reports.',
        mechanisms: 'Quantitative clinical laboratory determinations utilizing tandem mass spectrometry (ICP-MS/MS), capillary gas chromatography (GC-FID), and high-resolution multiplex real-time PCR.',
      };
    }

    if (brandSlug !== 'colway') {
      return {
        sectionId: selectedCategory,
        sectionTitle: `${config.name} Clinical Portfolio`,
        products: filteredProducts.map(p => p.name || p.title),
        keyActives: config.subtitle,
        mechanisms: 'Analytical clinical specifications and verified standard parameters.',
      };
    }

    if (selectedCategory === 'epigenetic') {
      return {
        sectionId: 'epigenetic',
        sectionTitle: 'Epigenetic Rejuvenation & Blue Diamond Line',
        products: [
          'Colway Blue Diamond Cellular Rejuvenation Cream (50 mL)',
          'Colway Blue Diamond Exfoliating & Micro-Resurfacing Peeling (75 mL)',
          'Blue Diamond Cellular Rejuvenation Protocol Duo'
        ],
        keyActives: 'MATRIGENICS 14G (Undaria pinnatifida stipes extract), VEP-Endorphin Peptides, Acetyl Hexapeptide-8, Diamond Micro-Crystals, Intact Fish Tropocollagen',
        mechanisms: 'Epigenetic reactivation of 14 youth genes regulating synthesis of Collagen I, III, IV, VII and Hyaluronic Acid. Reverses the "Triangle of Beauty" inversion in perimenopausal skin.',
      };
    }

    if (selectedCategory === 'trichology') {
      return {
        sectionId: 'trichology',
        sectionTitle: 'Follicular Trichology & Scalp Anti-DHT System',
        products: [
          'Colway Hair Strengthening Bio-Collagen Shampoo (200 mL)',
          'Colway Hair Strengthening Bio-Collagen Conditioner (200 mL)',
          'Colway Complete Trichology Follicular System Duo'
        ],
        keyActives: 'Baicapil™ 2% (Scutellaria baicalensis, Glycine soja & Triticum vulgare germ), Kerascalp™ (Phyllanthus emblica / Amla), Hydrafeel® (Pantotrophin 3 / Vit B5), Horsetail Extract (natural organic silica), Cottonseed & Sweet Almond oils',
        mechanisms: 'Stimulates hair follicle stem cells, activates Wnt/β-catenin signaling pathway, prolongs anagen (growth) phase while shortening telogen (shedding) phase. Protects scalp microcirculation and inhibits follicular miniaturization.',
      };
    }

    if (selectedCategory === 'native-dermal') {
      return {
        sectionId: 'native-dermal',
        sectionTitle: 'Native Tropocollagen Dermal Regeneration & Barrier Support',
        products: [
          'Colway Collagen Wash Gel (250 mL)',
          'Colway Vege Collagen 100% Fitocosmetic (45 mL)',
          'Colway Bioactive Collagen Lip Care Balm (4.2 g)'
        ],
        keyActives: 'Intact 3D Triple-Helix Freshwater Fish Tropocollagen, 100% Plant-Derived Collagen Amino Acids in Young Coconut Water, Aosain, Niacinamide, D-Panthenol, Aloe Vera, Noni Extract',
        mechanisms: 'Biologically active hydration and transdermal signal peptides stimulating dermal fibroblast neocollagenesis. SLS/SLES-free barrier preservation of skin hydrolipidic film.',
      };
    }

    if (selectedCategory === 'nutricosmetics') {
      return {
        sectionId: 'nutricosmetics',
        sectionTitle: 'Inside-Out Cellular Nutricosmetics',
        products: [
          'Colvita Freeze-Dried Bioactive Collagen Capsules (60/120 Caps)',
          'Inside-Out Dual-Phase Collagen Protocol'
        ],
        keyActives: 'Cryogenically freeze-dried fish tropocollagen (-40°C), Bladderwrack (Fucus vesiculosus algae, rich in organic iodine, selenium & zinc), Natural D-alpha-tocopheryl acetate (Vitamin E from cold-pressed grains)',
        mechanisms: 'Systemic neocollagenesis activating dermal fibroblasts and chondrocytes from within. Clinical ITA-TEST #B-89146 confirms +90% skin elasticity and cellular regeneration in 110 days.',
      };
    }

    if (selectedCategory === 'bundles') {
      return {
        sectionId: 'bundles',
        sectionTitle: 'Clinical Protocol Bundles & Dual-Phase Kits',
        products: [
          'Blue Diamond Cellular Rejuvenation Protocol',
          'Inside-Out Dual-Phase Collagen Protocol',
          'Colway Complete Trichology Follicular System'
        ],
        keyActives: 'Integrated topical + oral multi-target formulations combining cellular exfoliation, dermal replenishment, and oral chondro-dermal support.',
        mechanisms: 'Synergistic protocol combinations designed for clinical practitioners and aesthetic medicine doctors.',
      };
    }

    // Default 'all' collection context:
    return {
      sectionId: 'all',
      sectionTitle: 'Colway® European Biotechnology Collection (Complete Portfolio)',
      products: [
        'Colway Blue Diamond Cellular Rejuvenation Cream (50 mL)',
        'Colway Blue Diamond Exfoliating & Micro-Resurfacing Peeling (75 mL)',
        'Colvita Freeze-Dried Bioactive Collagen Capsules (60/120 Caps)',
        'Colway Vege Collagen 100% Fitocosmetic (45 mL)',
        'Colway Hair Strengthening Bio-Collagen Shampoo (200 mL)',
        'Colway Hair Strengthening Bio-Collagen Conditioner (200 mL)',
        'Colway Collagen Wash Gel (250 mL)',
        'Colway Bioactive Collagen Lip Care Balm (4.2 g)'
      ],
      keyActives: 'Intact 3D Triple Helix Freshwater Tropocollagen, Baicapil™ 2%, Kerascalp™, MATRIGENICS 14G, VEP-Endorphin Peptides, Cryogenic Freeze-Drying (-40°C)',
      mechanisms: 'Patented European biotechnology preserving native biological activity without thermal denaturation. Certified under ISO 22716 GMP, EU CPNP (1223/2009), UAE MoHAP / Dubai Montaji, and Qatar MoPH.',
    };
  }, [brandSlug, selectedCategory, config.name, config.subtitle, filteredProducts]);

  const toggleExpand = (productId, e) => {
    e?.stopPropagation();
    setExpandedDetails(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleProductClick = (product) => {
    const slug = product.slug || product.id;
    if (slug) {
      router.push(`/p/${slug}`);
    } else if (onSelectProduct) {
      onSelectProduct(product.name || product.title);
    }
  };

  const handleQuickAdd = (product, e) => {
    e?.stopPropagation();
    if (updateCart) {
      const variant = product.variants?.[0] || { id: `${product.id}-default`, presentation: product.presentation || 'Standard Kit' };
      updateCart({
        id: product.id,
        name: product.name || product.title,
        price: product.price || 0,
        variant
      }, 1);
      setAddedItem(product.id);
      setTimeout(() => setAddedItem(null), 2200);
    } else {
      handleProductClick(product);
    }
  };

  return (
    <div
      className="brand-collection-root"
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 16px))'
      }}
    >
      {/* ── 1. Unified Public Header (Sticky top) ── */}
      <PublicUnifiedHeader
        track="products"
        lang={lang}
        onLangChange={setLang}
        copyUrl={canonicalUrl}
        shortUrl={canonicalUrl}
        brandHref="/c/CAT-MU9L9GBN"
        brandTitle="Atlas Health Services Clinical & Healthcare Intelligence"
        hideTier2={true}
        hideAccountManager={true}
        hideAiButton={true}
        collectionScope={brandSlug}
        collectionProducts={filteredProducts}
        collectionTitle={config.name}
        onSelectCollectionProduct={handleProductClick}
        inquiryContextType="brand_collection"
        onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
      />

      {/* ── 2. Atlas Clinical Portfolio Suites Navigation Bar ── */}
      <ClinicalPortfolioSuiteSwitcher currentSlug={brandSlug} />

      {/* ── 3. Breadcrumbs Bar (GCP Light Theme - Regla #17) ── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.65rem clamp(1rem, 3vw, 2rem) 0' }}>
        <Breadcrumbs items={breadcrumbs} theme="light" />
      </div>

      {/* ── 3. Google Cloud Authoritative Service Header ── */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        marginTop: '0.25rem',
        padding: 'clamp(0.75rem, 1.5vw, 1.15rem) 0'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 clamp(1rem, 3vw, 2rem)', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '100%' }}>
            
            {/* GCP Service Eyebrow + Certifications Badge Strip */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: `${config.badgeColor}12`,
                  border: `1px solid ${config.badgeColor}30`,
                  color: config.badgeColor,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.66rem',
                  fontWeight: 750,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  <Sparkles size={11} />
                  <span>{config.badge}</span>
                </div>
                <span className="gcp-hero-iso" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.66rem',
                  fontWeight: 650
                }}>
                  {brandSlug === 'colway' ? 'EU CPNP Reg. · ISO 22716' : 'ISO Accredited · European Lab'}
                </span>
              </div>

              {/* Action buttons on desktop header (Clinical Desk & TrichoTest PDF) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {(brandSlug === 'hair-treatments' || brandSlug === 'hair' || brandSlug === 'trichology' || brandSlug === 'trichotest') && (
                  <a
                    href={isEs ? "/docs/trichotest/Atlas-TrichoTest-Hair-Treatments-Dossier-ES.pdf?v=2" : "/docs/trichotest/Atlas-TrichoTest-Hair-Treatments-Dossier-EN.pdf?v=2"}
                    download={isEs ? "Atlas-TrichoTest-Tratamientos-Capilares-Dossier-Clinico.pdf" : "Atlas-TrichoTest-Hair-Treatments-Clinical-Dossier.pdf"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      color: '#15803d',
                      fontSize: '0.74rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title={isEs ? 'Descargar Dossier Clínico TrichoTest™ en PDF' : 'Download TrichoTest™ Clinical PDF Dossier'}
                  >
                    <Download size={12} />
                    <span>{isEs ? 'Dossier PDF TrichoTest' : 'TrichoTest PDF Dossier'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setIsInquiryDrawerOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#003666',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Mail size={12} />
                  <span>{isEs ? 'Mesa Clínica' : 'Clinical Desk'}</span>
                </button>
              </div>
            </div>

            {/* GCP Authoritative Title & Domain Subtitle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{
                fontSize: 'clamp(1.15rem, 2.2vw, 1.65rem)',
                fontWeight: 800,
                color: '#003666',
                letterSpacing: '-0.025em',
                margin: 0,
                lineHeight: 1.2,
                textWrap: 'balance'
              }}>
                {config.title}
              </h1>
              {config.tagline && (
                <div style={{
                  fontSize: 'clamp(0.78rem, 1.2vw, 0.92rem)',
                  fontWeight: 650,
                  color: config.accentColor || '#0d9488',
                  letterSpacing: '-0.01em'
                }}>
                  {config.tagline}
                </div>
              )}
            </div>

            {/* Subtitle / Descriptive Scope with Inline Details Toggle */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
              <p
                className="gcp-hero-desc"
                data-expanded={isHeroExpanded ? 'true' : 'false'}
                style={{
                  fontSize: 'clamp(0.78rem, 1.0vw, 0.88rem)',
                  color: '#475569',
                  lineHeight: 1.45,
                  margin: 0,
                  fontWeight: 450,
                  maxWidth: '1150px'
                }}
              >
                {config.subtitle}
              </p>
              <button
                type="button"
                className="gcp-hero-desc-toggle"
                onClick={() => setIsHeroExpanded(v => !v)}
                aria-expanded={isHeroExpanded}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0369a1',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                {isHeroExpanded ? (isEs ? '• Ocultar' : '• Less') : (isEs ? '• Detalles' : '• Details')}
              </button>
            </div>

            {/* Architecture Metadata Badges (GCP Standard) — scroll horizontal en móvil */}
            <div className="gcp-hero-badges" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '0.15rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#334155', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>
                🧬 {filteredProducts.length} {brandSlug === 'colway' ? 'Formulations' : brandSlug === 'peptides' ? 'Peptides' : 'Items'}
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: config.accentColor, background: `${config.accentColor}10`, border: `1px solid ${config.accentColor}30`, padding: '2px 8px', borderRadius: '4px' }}>
                {brandSlug === 'colway' ? '🏛️ Colway sp.j. (Poland / EU)' : brandSlug === 'eterna' ? '🏛️ Eurofins Genomics' : brandSlug === 'peptides' ? '🏛️ Lotusland EU Lyophilization Hub' : brandSlug === 'teletest' ? '🏛️ Generalitat de Catalunya E08750211' : (brandSlug === 'ultraperson' || brandSlug === 'ultraman') ? '🏛️ Atlas Compounding Network' : '🏛️ LifeLab1 Diagnostics'}
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px' }}>
                {brandSlug === 'colway' ? '🛡️ ISO 22716 & EU CPNP Compliant' : brandSlug === 'peptides' ? '🛡️ HPLC ≥99.0% & Endotoxin Tested' : brandSlug === 'teletest' ? '🛡️ ISO 17025 Accredited' : (brandSlug === 'ultraperson' || brandSlug === 'ultraman') ? '🛡️ EU GMP Certified' : '🛡️ CE-IVDR & ISO 15189'}
              </span>
              {brandSlug === 'peptides' && (
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#003666', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px' }}>
                  ✨ 10R Sealed Lyophilized Vials
                </span>
              )}
              {brandSlug === 'colway' && (
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
                  ✨ Native Freshwater Tropocollagen (3D Helix)
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── 4. Unified Metric Ribbon & Scope Switcher (Regla Golden #22) ── */}
      <section style={{ maxWidth: '1440px', margin: '0.65rem auto 1.0rem', padding: '0 clamp(1rem, 3vw, 2rem)' }}>
        <div className="gcp-metric-ribbon">
          {/* Left: Scope Switcher (Regla #22): filtrado vs base global */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div role="group" aria-label={isEs ? 'Alcance de métricas' : 'Metrics scope'} className="gcp-scope-switch">
              {[
                { id: 'filtered', label: isEs ? `Filtrado (${filteredProducts.length})` : `Filtered (${filteredProducts.length})` },
                { id: 'global', label: isEs ? `Todo (${products.length})` : `All (${products.length})` }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={scopeMode === opt.id}
                  data-active={scopeMode === opt.id ? 'true' : 'false'}
                  onClick={() => setScopeMode(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: scopeMode === 'filtered' ? '#e0f2fe' : '#f1f5f9',
              border: '1px solid',
              borderColor: scopeMode === 'filtered' ? '#bae6fd' : '#e2e8f0',
              color: scopeMode === 'filtered' ? '#0369a1' : '#64748b',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: scopeMode === 'filtered' ? '#0284c7' : '#94a3b8' }} />
              {scopeMode === 'filtered' 
                ? (isEs ? `Resultados Filtrados (${filteredProducts.length} ${getItemUnitLabel(brandSlug, filteredProducts.length, true)})` : `Matching Active Filters (${filteredProducts.length} items)`)
                : (isEs ? `Colección Completa (${products.length} ${getItemUnitLabel(brandSlug, products.length, true)})` : `Entire Collection (${products.length} items)`)}
            </span>
          </div>

          {/* Right: 4 Micro-Metric Items (GCP Style) */}
          <div className="gcp-metric-items">
            {kpiCards.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="gcp-metric-item" title={`${kpi.label}: ${kpi.sub}`}>
                  <div className="gcp-metric-item-icon">
                    <Icon size={14} />
                  </div>
                  <div className="gcp-metric-item-content">
                    <span className="gcp-metric-item-value">{kpi.value}</span>
                    <span className="gcp-metric-item-label">{kpi.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. MAIN WORKSPACE (Left Sidebar 320px + Right Main Content) ── */}
      <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 clamp(1rem, 3vw, 2rem) 5rem' }}>
        <div className="gcp-collection-workspace">
          {/* ── LEFT COLUMN: STICKY DEDICATED SIDEBAR PER BRAND ── */}
          {brandSlug === 'bloodo' ? (
            <BloodoCollectionSidebar lang={lang} onOpenInquiry={() => setIsInquiryDrawerOpen(true)} />
          ) : brandSlug === 'eterna' ? (
            <EternaCollectionSidebar lang={lang} onOpenInquiry={() => setIsInquiryDrawerOpen(true)} />
          ) : (brandSlug === 'ultraperson' || brandSlug === 'ultraman') ? (
            <UltraPersonCollectionSidebar
              lang={lang}
              categories={brandCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                const el = document.getElementById('colway-main-content');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              totalCount={products.length}
              onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
              onOpenAi={() => setIsAtlasAiOpen(true)}
            />
          ) : brandSlug === 'colway' ? (
            <ColwayCollectionSidebar
              lang={lang}
              onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                const el = document.getElementById('colway-main-content');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              onSearchKeyword={(kw) => {
                setSearchQuery(kw);
                const el = document.getElementById('colway-main-content');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          ) : (
            <GenericCollectionSidebar
              brandSlug={brandSlug}
              config={config}
              categories={brandCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                const el = document.getElementById('colway-main-content');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              totalCount={products.length}
              onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
            />
          )}

          {/* ── RIGHT COLUMN: MAIN CONTENT (DIRECT UNIFIED CATALOG & TREATMENT LINES) ── */}
          <main
            id="colway-main-content"
            style={{
              minWidth: 0,
              gridColumn: '2',
              order: 2,
              width: '100%'
            }}
          >
            {/* Google Cloud Main Navigation Tabs: Products / Works / Protocols */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: '2px solid #e2e8f0',
              marginBottom: '1.25rem',
              paddingBottom: '0',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveMainTab('products');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '9px 16px',
                  border: 'none',
                  borderBottom: activeMainTab === 'products' ? `3px solid ${config.accentColor || '#0d9488'}` : '3px solid transparent',
                  background: 'none',
                  color: activeMainTab === 'products' ? (config.accentColor || '#0d9488') : '#64748b',
                  fontSize: '0.86rem',
                  fontWeight: activeMainTab === 'products' ? 800 : 600,
                  cursor: 'pointer',
                  marginBottom: '-2px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Package size={16} />
                <span>{isEs ? 'Catálogo & Formulaciones' : 'Formulations & Products'}</span>
                <span style={{
                  fontSize: '0.70rem',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: activeMainTab === 'products' ? `${config.accentColor || '#0d9488'}18` : '#f1f5f9',
                  color: activeMainTab === 'products' ? (config.accentColor || '#0d9488') : '#64748b',
                  fontWeight: 700
                }}>
                  {filteredProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveMainTab('works');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '9px 16px',
                  border: 'none',
                  borderBottom: activeMainTab === 'works' ? `3px solid ${config.accentColor || '#0d9488'}` : '3px solid transparent',
                  background: 'none',
                  color: activeMainTab === 'works' ? (config.accentColor || '#0d9488') : '#64748b',
                  fontSize: '0.86rem',
                  fontWeight: activeMainTab === 'works' ? 800 : 600,
                  cursor: 'pointer',
                  marginBottom: '-2px',
                  transition: 'all 0.15s ease'
                }}
              >
                <BookOpen size={16} />
                <span>{isEs ? 'Trabajos & Evidencia Clínica' : 'Clinical Works & Evidence'}</span>
                <span style={{
                  fontSize: '0.70rem',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: activeMainTab === 'works' ? '#ecfdf5' : '#f1f5f9',
                  color: activeMainTab === 'works' ? '#047857' : '#64748b',
                  border: activeMainTab === 'works' ? '1px solid #a7f3d0' : 'none',
                  fontWeight: 700
                }}>
                  {collectionWorks.length}
                </span>
              </button>

              {(brandSlug === 'colway' || brandSlug === 'hair-treatments' || brandSlug === 'trichology' || brandSlug === 'hair' || brandSlug === 'trichotest' || brandSlug === 'weight-loss' || brandSlug === 'tissue-repair') && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveMainTab('protocols');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 16px',
                    border: 'none',
                    borderBottom: activeMainTab === 'protocols' ? `3px solid ${config.accentColor || '#0d9488'}` : '3px solid transparent',
                    background: 'none',
                    color: activeMainTab === 'protocols' ? (config.accentColor || '#0d9488') : '#64748b',
                    fontSize: '0.86rem',
                    fontWeight: activeMainTab === 'protocols' ? 800 : 600,
                    cursor: 'pointer',
                    marginBottom: '-2px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Layers size={16} />
                  <span>{isEs ? 'Protocolos de Aplicación' : 'Application Protocols'}</span>
                </button>
              )}
            </div>

            {activeMainTab === 'works' && (
              <ClinicalWorksExplorer
                works={collectionWorks}
                isEs={isEs}
                accentColor={config.accentColor || '#0d9488'}
                title={isEs ? `Trabajos Científicos & Evidencia • ${config.name}` : `Clinical Research & Evidence Dossiers • ${config.name}`}
                subtitle={isEs ? 'Ensayos clínicos controlados, monografías analíticas y evaluaciones regulatorias.' : 'Controlled clinical trials, analytical monographs, and regulatory evaluations.'}
              />
            )}

            {activeMainTab === 'protocols' && (
              <div style={{ marginBottom: '2rem' }}>
                {(brandSlug === 'hair-treatments' || brandSlug === 'colway' || brandSlug === 'trichology' || brandSlug === 'hair' || brandSlug === 'trichotest') && (
                  <ColwayTrichologyStemCellShowcase lang={lang} />
                )}
                {brandSlug === 'weight-loss' && (
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '1.75rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                          {isEs ? 'Protocolo de Recomposición Metabólica en 3 Fases' : 'Atlas 3-Phase Metabolic Recomposition Protocol'}
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                          {isEs ? 'Titulación progresiva de incretinas, preservación muscular con tesamorelina y monitorización HbA1c.' : 'Progressive incretin titration, visceral fat lipolysis with tesamorelin, and HbA1c telemetry.'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                        <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>{isEs ? 'Fase I (Semanas 1–4)' : 'Phase I (Weeks 1–4)'}</span>
                        <h4 style={{ margin: '4px 0 6px', fontSize: '0.90rem', fontWeight: 750, color: '#0f172a' }}>{isEs ? 'Calibración & Adaptación' : 'Calibration & Adaptation'}</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>{isEs ? 'Test Bloodo™ HbA1c basal. Inicio con microdosis semanal de Tirzepatida 2.5 mg + UltraPerson CoQ10.' : 'Baseline Bloodo™ HbA1c DBS test. Initiate low-dose Tirzepatide 2.5 mg/week + UltraPerson CoQ10.'}</p>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                        <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>{isEs ? 'Fase II (Semanas 5–12)' : 'Phase II (Weeks 5–12)'}</span>
                        <h4 style={{ margin: '4px 0 6px', fontSize: '0.90rem', fontWeight: 750, color: '#0f172a' }}>{isEs ? 'Déficit & Lipólisis Visceral' : 'Deficit & Visceral Lipolysis'}</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>{isEs ? 'Titulación a Tirzepatida 5–7.5 mg. Adición de Tesamorelina o AOD-9604 para proteger masa magra.' : 'Titration to Tirzepatide 5–7.5 mg. Addition of Tesamorelin or AOD-9604 to preserve lean mass.'}</p>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                        <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>{isEs ? 'Fase III (Semanas 13+)' : 'Phase III (Weeks 13+)'}</span>
                        <h4 style={{ margin: '4px 0 6px', fontSize: '0.90rem', fontWeight: 750, color: '#0f172a' }}>{isEs ? 'Fijación de Set-Point' : 'Set-Point Maintenance'}</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>{isEs ? 'Segundo test HbA1c. Espaciamiento progresivo de dosis y transición a MOTS-c mitocondrial.' : 'Follow-up HbA1c test. Dose tapering and transition to mitochondrial MOTS-c maintenance.'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeMainTab === 'products' && (
              <>
            {/* Google Cloud Filter Bar */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              {/* Row 1: Search Input (Google Cloud Standard - Regla #7) + Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: '1 1 320px', maxWidth: '640px', minWidth: 0 }}>
                  <GlobalSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={`Search in ${config.name} (e.g. ${brandSlug === 'colway' ? 'collagen, cream' : brandSlug === 'peptides' ? 'BPC-157, GHK-Cu' : brandSlug === 'teletest' ? 'HLA, metals' : 'NAD+, cortisol'})...`}
                    resultCount={filteredProducts.length}
                    namespace={`collection-${brandSlug}`}
                    size="lg"
                    filters={[
                      selectedCategory !== 'all' && {
                        key: 'category',
                        label: isEs ? 'Categoría' : 'Category',
                        value: config.categories?.find(c => c.id === selectedCategory)?.label || selectedCategory,
                        onRemove: () => setSelectedCategory('all')
                      }
                    ].filter(Boolean)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                    {filteredProducts.length} {getItemUnitLabel(brandSlug, filteredProducts.length, isEs)}
                  </span>

                  {/* Incoterm EXW Badge */}
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#0d9488',
                    background: '#f0fdfa',
                    border: '1px solid #ccfbf1',
                    padding: '3px 7px',
                    borderRadius: '5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    📦 Terms: <strong>EXW</strong>
                  </span>

                  {/* Multi-Currency Selector */}
                  <select
                    value={activeCurrency}
                    onChange={(e) => setActiveCurrency(e.target.value)}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#003666',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                    title="Select display currency"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>

                  {/* B2B Pricing Access Pill */}
                  {!user ? (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setIsUnlockModalOpen(true);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#0d9488',
                        fontSize: '0.74rem',
                        fontWeight: 750,
                        cursor: 'pointer'
                      }}
                    >
                      <Lock size={12} />
                      <span>{isEs ? 'Tarifas' : 'Pricing'}</span>
                    </button>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#16a34a',
                      fontSize: '0.70rem',
                      fontWeight: 750
                    }}>
                      <ShieldCheck size={12} />
                      <span>{isEs ? 'Tarifas Activas' : 'Pricing Active'}</span>
                    </span>
                  )}

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#334155', background: '#fff' }}
                  >
                    <option value="featured">{isEs ? 'Destacados' : 'Featured'}</option>
                    <option value="name-asc">{isEs ? 'Nombre A-Z' : 'Name A-Z'}</option>
                    <option value="name-desc">{isEs ? 'Nombre Z-A' : 'Name Z-A'}</option>
                  </select>

                  <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                      style={{ padding: '6px 10px', background: viewMode === 'grid' ? '#f1f5f9' : '#ffffff', border: 'none', cursor: 'pointer', color: viewMode === 'grid' ? '#0f172a' : '#94a3b8' }}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      title="Master-Detail List"
                      style={{ padding: '6px 10px', background: viewMode === 'table' ? '#f1f5f9' : '#ffffff', border: 'none', cursor: 'pointer', color: viewMode === 'table' ? '#0f172a' : '#94a3b8' }}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Reset (Regla #24/#29) — chips activos viven dentro del GlobalSearchBar */}
              {(selectedCategory !== 'all' || searchQuery.trim()) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    style={{ minHeight: '44px', padding: '0 4px', background: 'none', border: 'none', color: '#0369a1', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {isEs ? 'Limpiar filtros' : 'Clear filters'}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Categories Navigation Strip (Golden Rule #23) */}
            <div className="gcp-mobile-categories-strip" style={{
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '1rem',
              width: '100%'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                >
                  <SlidersHorizontal size={14} color="#0d9488" />
                  <span>{isEs ? 'Filtros & Categorías' : 'Categories & Filters'}</span>
                  <span style={{
                    fontSize: '0.70rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 800
                  }}>
                    {brandCategories?.length || config.categories?.length || 0}
                  </span>
                </button>

                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  {filteredProducts.length} {isEs ? 'formulaciones' : 'formulations'}
                </span>
              </div>

              {/* Swipeable Category Pills (Universal Across All Collections) */}
              {brandCategories && brandCategories.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom: '4px',
                  msOverflowStyle: 'none',
                  scrollbarWidth: 'none'
                }}>
                  {brandCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const accent = config.accentColor || '#0d9488';
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          flexShrink: 0,
                          height: '32px',
                          padding: '0 12px',
                          borderRadius: '9999px',
                          background: isSelected ? accent : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334155',
                          border: isSelected ? `1px solid ${accent}` : '1px solid #cbd5e1',
                          fontSize: '0.74rem',
                          fontWeight: isSelected ? 700 : 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: isSelected ? `0 2px 6px ${accent}40` : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{cat.label}</span>
                        {cat.count > 0 && (
                          <span style={{
                            fontSize: '0.66rem',
                            padding: '1px 5px',
                            borderRadius: '9999px',
                            background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#64748b',
                            fontWeight: 700
                          }}>
                            {cat.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>



            {/* Quick Clinical Protocol Routines (Colway Fast Protocols) */}
            {brandSlug === 'colway' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflowX: 'auto',
                padding: '8px 12px',
                background: '#f0fdfa',
                border: '1px solid #ccfbf1',
                borderRadius: '10px',
                marginBottom: '1rem',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch'
              }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} color="#0d9488" />
                  <span>{isEs ? 'Rutinas Clínicas' : 'Clinical Routines'}:</span>
                </span>
                {[
                  { id: 'all', label: isEs ? 'Ver Todo' : 'All Formulations', cat: 'all' },
                  { id: 'epigenetic', label: isEs ? '💎 Diamante Azul (3 pasos)' : '💎 Blue Diamond Ritual', cat: 'epigenetic' },
                  { id: 'trichology', label: isEs ? '🧬 Anticaída Capilar Anti-DHT' : '🧬 Anti-DHT Hair System', cat: 'trichology' },
                  { id: 'native-dermal', label: isEs ? '🛡️ Barrera Dérmica & Vege' : '🛡️ Dermal Barrier & Vege', cat: 'native-dermal' },
                  { id: 'nutricosmetics', label: isEs ? '💊 Colvita Nutricosmética' : '💊 Inside-Out Colvita', cat: 'nutricosmetics' },
                  { id: 'bundles', label: isEs ? '📦 Packs & Bundles' : '📦 Clinical Bundles', cat: 'bundles' }
                ].map(r => {
                  const isSelected = selectedCategory === r.cat;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedCategory(r.cat);
                        setSearchQuery('');
                      }}
                      style={{
                        padding: '4px 11px',
                        borderRadius: '9999px',
                        border: isSelected ? '1px solid #0d9488' : '1px solid #99f6e4',
                        background: isSelected ? '#0d9488' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#0f766e',
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 1px 3px rgba(13, 148, 136, 0.25)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty State (Regla #20/#29) */}
            {filteredProducts.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <EmptyState
                  icon={FlaskConical}
                  title={isEs ? 'No hay resultados para estos filtros' : 'No results for these filters'}
                  subtitle={isEs ? 'Prueba limpiando los filtros o utilizando otros términos de búsqueda.' : 'Try adjusting your search criteria or resetting filters.'}
                  action={{ label: isEs ? 'Limpiar filtros' : 'Clear filters', onClick: () => { setSearchQuery(''); setSelectedCategory('all'); } }}
                />
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: viewMode === 'grid' ? '1.25rem' : '0.75rem',
                width: '100%'
              }}>
                {/* Google Cloud UX Table Header (when in table mode) */}
                {viewMode === 'table' && (
                  <div className="gcp-collection-table-header">
                    <div>
                      <span>{brandSlug === 'peptides' ? 'Compound / Specification' : 'Resource & Specification'}</span>
                    </div>
                    <div>
                      <span>{isEs ? 'Acreditación & Formato' : 'Accreditation & Format'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span>{isEs ? 'Tarifa B2B (EXW)' : 'Wholesale Tier'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span>{isEs ? 'Acciones' : 'Actions'}</span>
                    </div>
                  </div>
                )}

                {filteredProducts.map(product => {
                  const imageSrc = resolveBrandProductImage(product, brandSlug);
                  const displayName = product.canonicalName || product.name || product.title || product.id;
                  const desc = product.overview_summary || product.description || product.desc || '';
                  const sampleType = brandSlug === 'bloodo'
                    ? (product.sampleType || 'Capillary Dried Blood Spot (DBS)')
                    : brandSlug === 'colway'
                    ? (product.volume || product.presentation || (product.is_supplement || product.id?.includes('colvita') ? '60 / 120 Capsules (Box)' : 'Dermocosmetic Formulation'))
                    : brandSlug === 'peptides'
                    ? (product.dosage ? `${product.dosage} • 10R Lyophilized Vial` : (product.presentation || '10R Lyophilized Vial'))
                    : (product.sampleType || product.presentation || product.volume || 'Clinical Formulation');
                  const isExpanded = !!expandedDetails[product.id];
                  const isAdded = addedItem === product.id;

                  const isColvita = brandSlug === 'colway' && (product.id?.toLowerCase().includes('colvita') || product.name?.toLowerCase().includes('colvita'));
                  const isTrichologyItem = brandSlug === 'colway' && (product.id?.toLowerCase().includes('shampoo') || product.id?.toLowerCase().includes('conditioner'));
                  const currentCaps = isColvita ? (selectedCapsulesMap[product.id] || 60) : (selectedCapsulesMap[product.id] || 60);

                  let selectedVariant = product.variants?.[0] || null;
                  if (isColvita && Array.isArray(product.variants) && product.variants.length > 0) {
                    const match = product.variants.find(v => {
                      const str = `${v.id || ''} ${v.name || ''} ${v.dosage || ''} ${v.size || ''} ${v.volume || ''}`.toLowerCase();
                      return str.includes(String(currentCaps));
                    });
                    if (match) selectedVariant = match;
                  }

                  if (viewMode === 'table') {
                    return (
                      <div
                        key={product.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div className="gcp-collection-table-row">
                          {/* Col 1: Thumbnail, Commercial Name & Description */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                            <div
                              onClick={() => handleProductClick(product)}
                              style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '8px',
                                background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                            >
                              <img
                                src={imageSrc}
                                alt={displayName}
                                style={{ maxHeight: '50px', maxWidth: '85%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))' }}
                              />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h3
                                onClick={() => handleProductClick(product)}
                                style={{
                                  fontSize: '0.94rem',
                                  fontWeight: 800,
                                  color: '#0f172a',
                                  margin: '0 0 2px 0',
                                  lineHeight: 1.3,
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#0284c7'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#0f172a'; }}
                              >
                                {displayName}
                              </h3>
                              {/* Clinical therapeutic category / short active focus (clean clinical glance, no duplicate text) */}
                              {product.therapeutic_category ? (
                                <p style={{
                                  fontSize: '0.73rem',
                                  color: '#0284c7',
                                  fontWeight: 650,
                                  margin: '0 0 2px 0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {product.therapeutic_category}
                                </p>
                              ) : (product.shortDescription && product.shortDescription.toLowerCase().trim() !== desc.toLowerCase().trim()) ? (
                                <p style={{
                                  fontSize: '0.73rem',
                                  color: '#0284c7',
                                  fontWeight: 650,
                                  margin: '0 0 2px 0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {product.shortDescription}
                                </p>
                              ) : null}
                              {desc && (
                                <p style={{
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  margin: '0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {desc}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Col 2: Regulatory Badges & Posology / Presentation */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              {resolveProductRegulatoryBadges(product, brandSlug).map((rb, idx) => (
                                <span
                                  key={idx}
                                  title={rb.title}
                                  style={{
                                    fontSize: '0.64rem',
                                    fontWeight: 800,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: rb.bg,
                                    color: rb.color,
                                    border: `1px solid ${rb.border}`,
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {rb.label}
                                </span>
                              ))}
                              {brandSlug === 'colway' && (product.routine_badge || product.step_number != null) && (
                                <span style={{
                                  fontSize: '0.64rem',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: '#f0fdfa',
                                  color: '#0d9488',
                                  border: '1px solid #99f6e4'
                                }}>
                                  {product.routine_badge || `Step ${product.step_number}`}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Sparkles size={11} color="#0d9488" />
                              <span>{sampleType}</span>
                            </span>

                            {/* Colvita 60 / 120 Capsule Selector (Patrón Ultraman) */}
                            {isColvita && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px', background: '#f1f5f9', borderRadius: '6px', marginTop: '2px' }}>
                                <button
                                  type="button"
                                  onClick={(e) => handleCapsuleSelect(product.id, 60, e)}
                                  style={{
                                    padding: '2px 7px',
                                    fontSize: '0.66rem',
                                    fontWeight: currentCaps === 60 ? 800 : 600,
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: currentCaps === 60 ? '#ffffff' : 'transparent',
                                    color: currentCaps === 60 ? '#0d9488' : '#64748b',
                                    boxShadow: currentCaps === 60 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                    cursor: 'pointer'
                                  }}
                                >
                                  60 Caps (30d)
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleCapsuleSelect(product.id, 120, e)}
                                  style={{
                                    padding: '2px 7px',
                                    fontSize: '0.66rem',
                                    fontWeight: currentCaps === 120 ? 800 : 600,
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: currentCaps === 120 ? '#ffffff' : 'transparent',
                                    color: currentCaps === 120 ? '#0d9488' : '#64748b',
                                    boxShadow: currentCaps === 120 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                                    cursor: 'pointer'
                                  }}
                                >
                                  120 Caps (60d)
                                </button>
                              </div>
                            )}

                            {/* Trichology Duo Guide */}
                            {isTrichologyItem && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategory('bundles');
                                  setSearchQuery('Duo');
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  fontSize: '0.66rem',
                                  color: '#0284c7',
                                  fontWeight: 650,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                                title="Ver Pack Dúo Folicular con Ahorro"
                              >
                                <span>✨ {isEs ? 'Ver en Dúo Folicular' : 'Available in Duo Pack'} →</span>
                              </button>
                            )}
                          </div>

                          {/* Col 3: Wholesale Tier Price */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <TieredPriceShield
                              product={product}
                              currency={activeCurrency}
                              compact={true}
                              isEs={isEs}
                              capsCount={currentCaps}
                              onUnlockRequest={() => setIsUnlockModalOpen(true)}
                              adminSimulationTier={adminSimulationTier}
                              onSelectAdminSimulationTier={setAdminSimulationTier}
                            />
                          </div>

                          {/* Col 4: Procurement Actions (Unified Primary Order + Secondary Ficha Toggle) */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                            {brandSlug === 'colway' && (
                              <a
                                href={getWhatsAppInquiryUrl(product)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`WhatsApp consultation for ${displayName}`}
                                style={{
                                  padding: '5px 8px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  border: '1px solid #bbf7d0',
                                  background: '#f0fdf4',
                                  color: '#15803d',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <MessageSquare size={12} color="#16a34a" />
                                <span>WA</span>
                              </a>
                            )}

                            <InlineOrderButton
                              product={product}
                              variant={selectedVariant}
                              isEs={isEs}
                              compact={true}
                              role={activeRole || 'clinic'}
                              brandSlug={brandSlug}
                              onUnlockRequest={() => setIsUnlockModalOpen(true)}
                            />

                            <button
                              type="button"
                              onClick={(e) => toggleExpand(product.id, e)}
                              style={{
                                padding: '5px 10px',
                                height: '28px',
                                borderRadius: '6px',
                                border: isExpanded ? '1px solid #0d9488' : '1px solid #cbd5e1',
                                background: isExpanded ? '#f0fdfa' : '#ffffff',
                                color: isExpanded ? '#0d9488' : '#0f172a',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease'
                              }}
                              title={isEs ? 'Ver bioactivos, INCI y ficha técnica' : 'View bioactives, INCI & datasheet'}
                            >
                              <span>{isExpanded ? (isEs ? 'Ficha ▲' : 'Specs ▲') : (isEs ? 'Ficha ▾' : 'Specs ▾')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Expandable Details in Table mode */}
                        {isExpanded && (
                          <ProductTechnicalDetailsPanel
                            product={product}
                            brandSlug={brandSlug}
                            isEs={isEs}
                            datasheet={resolveProductDatasheet(product, brandSlug)}
                            onViewProduct={() => handleProductClick(product)}
                          />
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={product.id}
                      className="gcp-collection-card"
                    >
                      {/* Card Visual / Showcase (Left Column on Desktop) */}
                      <div
                        className="gcp-collection-card-visual"
                        onClick={() => handleProductClick(product)}
                      >
                        <img
                          src={imageSrc}
                          alt={displayName}
                        />

                        {/* Top Badges: Multi-country Regulatory Registration */}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '85%' }}>
                          {resolveProductRegulatoryBadges(product, brandSlug).map((rb, idx) => (
                            <span
                              key={idx}
                              title={rb.title}
                              style={{
                                fontSize: '0.64rem',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: rb.bg,
                                color: rb.color,
                                border: `1px solid ${rb.border}`,
                                backdropFilter: 'blur(4px)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {rb.label}
                            </span>
                          ))}
                        </div>

                        {/* Formulation Line Badge (Below image, aligned to left) */}
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          background: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.67rem',
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase'
                        }}>
                          {brandSlug === 'colway' ? (
                            product.category?.toLowerCase().includes('trichology') || product.slug?.includes('shampoo') || product.slug?.includes('conditioner')
                              ? 'Bio-Collagen Trichology'
                              : product.category?.toLowerCase().includes('nutricosmetic') || product.slug?.includes('colvita')
                              ? 'Bioactive Nutricosmetic'
                              : 'Native Bio-Collagen'
                          ) : brandSlug === 'eterna' ? 'Genomic Multi-Omics' : (brandSlug === 'ultraperson' || brandSlug === 'ultraman') ? 'Longevity Formula' : brandSlug === 'peptides' ? 'Peptide Monograph' : brandSlug === 'teletest' ? 'Clinical Genomics' : 'Laboratory Diagnostic'}
                        </div>
                      </div>

                      {/* Card Content Area (Right Column on Desktop) */}
                      <div className="gcp-collection-card-body">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {product.therapeutic_category || (brandSlug === 'ultraperson' ? 'Precision Nutraceutical' : brandSlug === 'colway' ? 'Bioactive Collagen' : 'Clinical Protocol')}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> {brandSlug === 'eterna' ? 'Eurofins Genomics' : (brandSlug === 'ultraperson' || brandSlug === 'ultraman') ? 'Atlas Compounding Network' : brandSlug === 'colway' ? 'Colway Dermocosmetics' : brandSlug === 'peptides' ? 'Lotusland EU Hub' : brandSlug === 'teletest' ? 'TeleTest Reference Lab' : 'LifeLab1'}
                          </span>
                        </div>

                        <h3
                          onClick={() => handleProductClick(product)}
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 6px 0',
                            lineHeight: 1.3,
                            cursor: 'pointer'
                          }}
                        >
                          {displayName}
                        </h3>

                        {brandSlug === 'colway' && (product.routine_badge || product.step_number != null) && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#f0fdfa',
                            border: '1px solid #99f6e4',
                            color: '#0d9488',
                            fontSize: '0.69rem',
                            fontWeight: 700,
                            marginBottom: '6px',
                            width: 'fit-content'
                          }}>
                            <Sparkles size={11} />
                            <span>{product.routine_badge || `Step ${product.step_number}`}</span>
                          </div>
                        )}

                        <div style={{
                          fontSize: '0.75rem',
                          color: brandSlug === 'colway' ? '#0d9488' : '#0284c7',
                          fontWeight: 600,
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          {brandSlug === 'bloodo' ? <Droplets size={13} /> : <Sparkles size={13} />}
                          <span>{sampleType}</span>
                        </div>

                        <p style={{
                          fontSize: '0.82rem',
                          color: '#475569',
                          lineHeight: 1.5,
                          margin: '0 0 1rem 0',
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {desc}
                        </p>

                        {/* Master-Detail Expandable Drawer (Regla #4) */}
                        {isExpanded && (
                          <ProductTechnicalDetailsPanel
                            product={product}
                            brandSlug={brandSlug}
                            isEs={isEs}
                            datasheet={resolveProductDatasheet(product, brandSlug)}
                            onViewProduct={() => handleProductClick(product)}
                          />
                        )}

                        {/* Colway Colvita 2-Tier Capsule Selector (Patrón Ultraman) */}
                        {isColvita && (() => {
                          const caps = selectedCapsulesMap[product.id] || 60;
                          return (
                            <div style={{ marginBottom: '0.65rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  color: '#0d9488',
                                  background: 'rgba(13, 148, 136, 0.1)',
                                  border: '1px solid rgba(13, 148, 136, 0.25)',
                                  padding: '2px 7px',
                                  borderRadius: '5px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  💊 Liofilizado Puro · 100% Fish Gelatin
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                                  {caps === 60 ? (isEs ? '30 Días' : '30-Day Supply') : (isEs ? '60 Días (Ahorro)' : '60-Day Supply')}
                                </span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                                {[
                                  { count: 60, label: isEs ? '60 Cápsulas' : '60 Capsules', sub: isEs ? '30 Días' : '30-Day Supply' },
                                  { count: 120, label: isEs ? '120 Cápsulas' : '120 Capsules', sub: isEs ? '60 Días (-15%)' : '60 Days (-15%)' }
                                ].map(b => {
                                  const isActive = caps === b.count;
                                  return (
                                    <button
                                      key={b.count}
                                      type="button"
                                      onClick={(e) => handleCapsuleSelect(product.id, b.count, e)}
                                      style={{
                                        padding: '5px 4px',
                                        fontSize: '0.72rem',
                                        fontWeight: isActive ? 800 : 600,
                                        borderRadius: '6px',
                                        border: isActive ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
                                        background: isActive ? '#f0fdfa' : '#ffffff',
                                        color: isActive ? '#0f766e' : '#475569',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        textAlign: 'center'
                                      }}
                                    >
                                      {b.label}
                                      <span style={{ display: 'block', fontSize: '0.60rem', color: isActive ? '#0d9488' : '#64748b' }}>
                                        {b.sub}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {/* UltraPerson / Ultraman 3-Tier Capsule Selector & Galenic Spec */}
                        {(brandSlug === 'ultraperson' || brandSlug === 'ultraman') && (() => {
                          const currentCaps = selectedCapsulesMap[product.id] || 60;
                          const physicalCap = resolvePhysicalCapsuleSize(product.activeIngredients || product.ingredients || []);

                          return (
                            <div style={{ marginBottom: '0.65rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {/* 1. Galenic Physical Capsule Size Badge */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  color: physicalCap.badgeColor,
                                  background: `${physicalCap.badgeColor}12`,
                                  border: `1px solid ${physicalCap.badgeColor}30`,
                                  padding: '2px 7px',
                                  borderRadius: '5px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  💊 {physicalCap.size} · Vegan HPMC ({physicalCap.totalMg} mg)
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                                  {currentCaps === 30 ? (isEs ? '15–30 Días' : '15–30 Days') : currentCaps === 60 ? (isEs ? '30–60 Días' : '30–60 Days') : (isEs ? '60–120 Días' : '60–120 Days')}
                                </span>
                              </div>

                              {/* 2. 3 Commercial Bottle Size Selector */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                                {CAPSULE_BOTTLE_SIZES.map(b => {
                                  const isActive = currentCaps === b.count;
                                  return (
                                    <button
                                      key={b.count}
                                      type="button"
                                      onClick={(e) => handleCapsuleSelect(product.id, b.count, e)}
                                      style={{
                                        padding: '4px 2px',
                                        fontSize: '0.72rem',
                                        fontWeight: isActive ? 800 : 600,
                                        borderRadius: '6px',
                                        border: isActive ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                                        background: isActive ? '#f5f3ff' : '#ffffff',
                                        color: isActive ? '#6d28d9' : '#475569',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        textAlign: 'center'
                                      }}
                                    >
                                      {b.count} caps
                                      {b.savingsPercent && (
                                        <span style={{ display: 'block', fontSize: '0.58rem', color: '#16a34a', fontWeight: 800 }}>
                                          -{b.savingsPercent}%
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Tiered Pricing Shield with Lock & Role Authorization (Golden Rule #14 & #22) */}
                        <TieredPriceShield
                          product={product}
                          currency={activeCurrency}
                          compact={false}
                          isEs={isEs}
                          capsCount={currentCaps}
                          onUnlockRequest={() => setIsUnlockModalOpen(true)}
                          adminSimulationTier={adminSimulationTier}
                          onSelectAdminSimulationTier={setAdminSimulationTier}
                        />

                        {/* Card Action Strip (Streamlined & Anti-Fatigue) */}
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(product.id, e)}
                            style={{
                              background: isExpanded ? '#f0fdfa' : '#f8fafc',
                              border: isExpanded ? '1px solid #99f6e4' : '1px solid #e2e8f0',
                              borderRadius: '6px',
                              color: isExpanded ? '#0d9488' : '#475569',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 9px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>
                              {isExpanded
                                ? (isEs ? 'Ocultar Ficha' : 'Hide Specs')
                                : (isEs ? 'Ficha & INCI' : 'Specs & INCI')}
                            </span>
                            <ChevronDown size={13} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                          </button>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {brandSlug === 'colway' && (
                              <a
                                href={getWhatsAppInquiryUrl(product)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`WhatsApp consultation for ${product.name || product.title}`}
                                style={{
                                  padding: '6px 9px',
                                  borderRadius: '6px',
                                  border: '1px solid #bbf7d0',
                                  background: '#f0fdf4',
                                  color: '#15803d',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <MessageSquare size={13} color="#16a34a" />
                                <span>WA</span>
                              </a>
                            )}

                            {/* Inline B2B Order / Purchase Action */}
                            <InlineOrderButton
                              product={product}
                              variant={selectedVariant}
                              isEs={isEs}
                              compact={false}
                              role={activeRole || 'clinic'}
                              brandSlug={brandSlug}
                              onUnlockRequest={() => setIsUnlockModalOpen(true)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </>
            )}
          </main>
        </div>
      </section>

      {/* ── MOBILE SIDEBAR DRAWER (Golden Rule #23) ── */}
      {isMobileSidebarOpen && brandSlug !== 'ultraperson' && brandSlug !== 'ultraman' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-start'
        }}
        onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '360px',
              height: '100%',
              background: '#ffffff',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              position: 'sticky',
              top: 0,
              background: '#ffffff',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} color={config.accentColor} />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {isEs ? 'Departamentos & Filtros' : 'Departments & Filters'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Drawer Body: Sidebar per brand */}
            <div style={{ padding: '1rem' }}>
              {brandSlug === 'bloodo' ? (
                <BloodoCollectionSidebar lang={lang} onOpenInquiry={() => { setIsMobileSidebarOpen(false); setIsInquiryDrawerOpen(true); }} />
              ) : brandSlug === 'eterna' ? (
                <EternaCollectionSidebar lang={lang} onOpenInquiry={() => { setIsMobileSidebarOpen(false); setIsInquiryDrawerOpen(true); }} />
              ) : (brandSlug === 'ultraperson' || brandSlug === 'ultraman') ? (
                <UltraPersonCollectionSidebar
                  lang={lang}
                  categories={brandCategories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(catId) => {
                    setSelectedCategory(catId);
                    setIsMobileSidebarOpen(false);
                    const el = document.getElementById('colway-main-content');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  totalCount={products.length}
                  onOpenInquiry={() => { setIsMobileSidebarOpen(false); setIsInquiryDrawerOpen(true); }}
                  onOpenAi={() => { setIsMobileSidebarOpen(false); setIsAtlasAiOpen(true); }}
                />
              ) : brandSlug === 'colway' ? (
                <ColwayCollectionSidebar
                  lang={lang}
                  onOpenInquiry={() => { setIsMobileSidebarOpen(false); setIsInquiryDrawerOpen(true); }}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(catId) => {
                    setSelectedCategory(catId);
                    setIsMobileSidebarOpen(false);
                    const el = document.getElementById('colway-main-content');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  onSearchKeyword={(kw) => {
                    setSearchQuery(kw);
                    setIsMobileSidebarOpen(false);
                    const el = document.getElementById('colway-main-content');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
              ) : (
                <GenericCollectionSidebar
                  brandSlug={brandSlug}
                  config={config}
                  categories={brandCategories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(catId) => {
                    setSelectedCategory(catId);
                    setIsMobileSidebarOpen(false);
                    const el = document.getElementById('colway-main-content');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  totalCount={products.length}
                  onOpenInquiry={() => { setIsMobileSidebarOpen(false); setIsInquiryDrawerOpen(true); }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Friction-Free Professional Access Modal ── */}
      {isAuthModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: 1
              }}
            >
              ✕
            </button>

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${config.accentColor}18`,
              color: config.accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={26} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                {isEs ? 'Acceso Profesional & Clínicas' : 'Professional & Clinical Access'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {isEs
                  ? `Consulta baremos mayoristas, protocolos CPNP y expedición directa para centros médicos y especialistas de ${config.name}.`
                  : `Access wholesale tiers, official CPNP clinical monographs, and direct clinic dispatch for ${config.name}.`}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '0.25rem' }}>
              {/* Option 1: 1-Click Google Sign-In */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                    setIsAuthModalOpen(false);
                  } catch (err) {
                    console.error('Google Sign In error:', err);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{isEs ? 'Acceder con Google (1 clic directo)' : 'Continue with Google (1-Click)'}</span>
              </button>

              {/* Option 2: Direct Consultation without Account */}
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsInquiryDrawerOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'rgba(13, 148, 136, 0.08)',
                  border: '1px solid rgba(13, 148, 136, 0.25)',
                  color: '#0d9488',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={15} />
                <span>{isEs ? '💬 Consultar sin Registro (Mesa Clínica)' : '💬 Inquire without Account (Clinical Desk)'}</span>
              </button>

              {/* Option 3: Traditional Email/Password Link */}
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => router.push(`/auth/login?redirect=/collection/${brandSlug}`)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isEs ? 'O acceder con email y contraseña' : 'Or sign in with email & password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Context-Aware Clinical Inquiry Drawer ── */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="brand_collection"
        brandType={brandSlug}
        initialEntity={{
          name: config.name || `${config.title || 'Brand'} Portfolio`,
          code: (brandSlug === 'ultraperson' || brandSlug === 'ultraman') ? 'ULTRAPERSON-CATALOG' : (brandSlug ? `${brandSlug.toUpperCase()}-CATALOG` : undefined),
          strength: (brandSlug === 'ultraperson' || brandSlug === 'ultraman') ? (isEs ? 'Fórmulas Galénicas Estandarizadas EU GMP' : 'Standardized EU GMP Galenics') : undefined,
          brandSlug,
          brandName: config.name,
          catalogCount: filteredProducts.length
        }}
        lang={lang}
      />

      {/* ── Public Atlas AI Copilot Drawer (Unified in single footer dock) ── */}
      <PublicAtlasAIDrawer
        isOpenControlled={isAtlasAiOpen}
        onCloseControlled={() => setIsAtlasAiOpen(false)}
        isOpen={isAtlasAiOpen}
        onClose={() => setIsAtlasAiOpen(false)}
        hideFloatingTrigger={true}
        contextType="brand_collection"
        contextAnchor={activeSectionContext}
        collectionProducts={filteredProducts}
        storageKey={`brand_collection_${brandSlug}_${selectedCategory}`}
        lang={lang}
      />

      {/* ── Friction-Free B2B Unlock Modal (Golden Rule #14 & #22) ── */}
      <FrictionFreeUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        isEs={isEs}
        brandName={config.name}
      />

      {/* ── Institutional Unified Public Footer ── */}
      <PublicUnifiedFooter lang={lang} />

      {/* ── Persistent Google Cloud Console Sticky Bottom Action Bar ── */}
      <PublicStickyActionBar
        title={config.name || (isEs ? 'Colección Lotusland Peptides' : 'Lotusland Peptides Collection')}
        subtitle={
          (brandSlug === 'ultraperson' || brandSlug === 'ultraman')
            ? `${filteredProducts.length} ${isEs ? 'Formulaciones Clínicas' : 'Targeted Formulations'} • Vegan HPMC · EU GMP`
            : brandSlug === 'colway'
            ? `${filteredProducts.length} ${isEs ? 'Formulaciones de Tropocolágeno' : 'Tropocollagen Formulations'} • EU CPNP · ISO 22716`
            : (brandSlug === 'bloodo' || brandSlug === 'eterna' || brandSlug === 'teletest')
            ? `${filteredProducts.length} ${isEs ? 'Paneles Diagnósticos y Biomarcadores' : 'Diagnostic Biomarker Panels'} • ISO 15189 / CE-IVDR`
            : `${filteredProducts.length} ${isEs ? 'Monografías y Referencias' : 'Reference Peptides & Monographs'} • HPLC ≥99.0%`
        }
        badge={
          (brandSlug === 'ultraperson' || brandSlug === 'ultraman')
            ? 'Nutraceuticals'
            : brandSlug === 'peptides'
            ? 'HPLC ≥99.0%'
            : (config.badge || 'Clinical Portfolio')
        }
        badgeType={
          (brandSlug === 'ultraperson' || brandSlug === 'ultraman')
            ? 'protocol'
            : brandSlug === 'peptides'
            ? 'teal'
            : 'default'
        }
        inquireLabel={isEs ? 'Consultar Catálogo' : 'Inquire Catalog'}
        onInquire={() => setIsInquiryDrawerOpen(true)}
        showClinicalAI={true}
        onOpenClinicalAI={() => setIsAtlasAiOpen(true)}
        compactMobile={true}
        showSections={false}
        sectionsCount={brandCategories?.length || 0}
        sectionsLabel={isEs ? 'Categorías' : 'Categories'}
        onOpenSections={() => setIsMobileSidebarOpen(true)}
        lang={lang}
      />

      {/* ── Unified B2B Order Drawer (Single SSOT across all collections) ── */}
      <UnifiedOrderDrawer lang={lang} />
    </div>
  );
}
