"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ExternalLink,
  User,
  Stethoscope,
  FileText,
  FlaskConical,
  Shield,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Tag,
  Globe,
  Sliders,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Building2,
  Eye,
  Box,
  ShoppingBag,
  Pill,
  Zap,
  ChevronRight,
  Download
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';
import CopyableId from '../ui/CopyableId';
import StatusBadge from '../ui/StatusBadge';
import GCPSplitDrawer from './GCPSplitDrawer';
import { getCachedAMData, setCachedAMData, purgeAMCache } from '../../services/accountManagerCache';

export default function AdminToolsTab() {
  const router = useRouter();

  // 4 Primary Views for Account Manager (Sin Password):
  // 'public' | 'doctors' | 'patients' | 'products' | 'ops'
  const [activeView, setActiveView] = useState('public');
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [isClearingCache, setIsClearingCache] = useState(false);

  // Side Drawer Split-View state (GCP Master-Detail)
  const [drawerItem, setDrawerItem] = useState(null);
  const [drawerType, setDrawerType] = useState('doctor'); // 'doctor' | 'patient' | 'product'

  // Dynamic state from Firestore APIs
  const [dynamicDoctors, setDynamicDoctors] = useState([]);
  const [dynamicPrescriptions, setDynamicPrescriptions] = useState([]);

  // Fetch real doctors from Cache / Firestore API
  useEffect(() => {
    let isMounted = true;
    const cached = getCachedAMData();
    if (cached.data?.doctors && Array.isArray(cached.data.doctors)) {
      setDynamicDoctors(cached.data.doctors);
    }

    fetch('/api/prescriptions/doctors-list')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.doctors)) {
          setDynamicDoctors(data.doctors);
          setCachedAMData({ doctors: data.doctors });
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // ── 1. PANTALLA PÚBLICA (Public Views Catalog) ─────────────────────────────
  const publicScreens = useMemo(() => [
    {
      id: 'pub-home',
      title: 'Storefront & Portal Principal',
      path: '/',
      category: 'General',
      badge: 'Público',
      desc: 'Página de inicio institucional, navegación principal, buscador semántico Algolia y acceso a las áreas clínicas.',
      icon: Globe,
      color: '#0284c7',
      bg: '#eff6ff'
    },
    {
      id: 'pub-catalog',
      title: 'Catálogo de Péptidos & Fórmulas',
      path: '/catalog',
      category: 'Catálogo',
      badge: 'Public Catalog',
      desc: 'Catálogo completo de péptidos puros, combinaciones sinérgicas, reactivos de investigación y nutracéuticos.',
      icon: Box,
      color: '#7c3aed',
      bg: '#f5f3ff'
    },
    {
      id: 'pub-protocols',
      title: 'Biblioteca de Protocolos Clínicos',
      path: '/protocols',
      category: 'Clínica',
      badge: 'Protocols',
      desc: 'Guías de dosificación clínica, ciclos semanales, fases de inducción y pautas de optimización metabólica.',
      icon: FlaskConical,
      color: '#059669',
      bg: '#ecfdf5'
    },
    {
      id: 'pub-what-are-peptides',
      title: 'Monografías de Educación Médica',
      path: '/what-are-peptides',
      category: 'Educación',
      badge: 'Evidence Base',
      desc: 'Guía científica sobre mecanismos de acción celular, estabilidad molecular y aplicaciones biomédicas.',
      icon: FileText,
      color: '#d97706',
      bg: '#fffbeb'
    },
    {
      id: 'pub-mediluxe',
      title: 'Mediluxe Corporate Profile',
      path: '/mediluxe',
      category: 'Corporativo',
      badge: 'Institutional',
      desc: 'Presentación de la entidad matriz, compliance regulatorio, acreditaciones ISO/GMP y centros en GCC y Europa.',
      icon: Building2,
      color: '#0f172a',
      bg: '#f1f5f9'
    },
    {
      id: 'pub-b2b',
      title: 'B2B Showcase & Portales Corporativos',
      path: '/b2b/corporate-wellness',
      category: 'Comercial',
      badge: 'B2B Tier',
      desc: 'Presentación comercial con márgenes de distribución, paquetes mayoristas y esquemas de dispensación clínica.',
      icon: ShoppingBag,
      color: '#ea580c',
      bg: '#fff7ed'
    },
    {
      id: 'pub-verify',
      title: 'Verificador de Viales & Lotes QR',
      path: '/verify/RP-LOT-RT10-2609',
      category: 'Trazabilidad',
      badge: 'Certificados CoA',
      desc: 'Herramienta pública de auditoría de lote, pureza HPLC por cromatografía y verificación de autenticidad.',
      icon: QrCode,
      color: '#2563eb',
      bg: '#eff6ff'
    },
    {
      id: 'pub-intake',
      title: 'Formulario de Ingesta de Pacientes',
      path: '/rx/intake',
      category: 'Clínica',
      badge: 'Patient Intake',
      desc: 'Formulario de entrada digital para pacientes referidos por médicos y clínicas de la red Atlas Health.',
      icon: User,
      color: '#0d9488',
      bg: '#f0fdfa'
    }
  ], []);

  // ── 2. PANTALLA DE DOCTORES (Doctor Portals) ──────────────────────────────
  const doctorsList = useMemo(() => {
    const seed = [
      {
        id: 'raffanie-lucenio',
        name: 'Dr. Raffanie Lucenio',
        slug: 'raffanie-lucenio',
        specialty: 'Dermatology & Clinical Trichology',
        clinicName: 'The Masters Medical Center',
        city: 'Doha',
        country: 'Qatar',
        countryCode: 'QA',
        countryFlag: '🇶🇦',
        license: 'QA-MOPH-DERM-4891',
        activePrescriptionsCount: 9,
        patientsCount: 9,
        verified: true
      },
      {
        id: 'dr-cagatay-sezgin',
        name: 'Dr. Çağatay Sezgin',
        slug: 'dr-cagatay-sezgin',
        specialty: 'Hair Restoration Surgery & Regenerative Medicine',
        clinicName: 'Hortman Clinics / Novomed',
        city: 'Dubai',
        country: 'United Arab Emirates',
        countryCode: 'AE',
        countryFlag: '🇦🇪',
        license: 'DHA-P-029418',
        activePrescriptionsCount: 16,
        patientsCount: 24,
        verified: true
      },
      {
        id: 'dr-jay-alkhatib',
        name: 'Dr. M Jay Alkhatib',
        slug: 'dr-jay-alkhatib',
        specialty: 'Laboratory Medicine & Molecular Diagnostics',
        clinicName: 'York Diagnostic Laboratories DMCC (YDL)',
        city: 'Dubai',
        country: 'United Arab Emirates',
        countryCode: 'AE',
        countryFlag: '🇦🇪',
        license: 'DHA-LAB-206212',
        activePrescriptionsCount: 4,
        patientsCount: 4,
        verified: true
      },
      {
        id: 'dr-sobia-mirza',
        name: 'Dr. Sobia Mirza',
        slug: 'dr-sobia-mirza',
        specialty: 'Aesthetic & Longevity Medicine',
        clinicName: 'My London Skin Clinic (MLSC)',
        city: 'Dubai',
        country: 'United Arab Emirates',
        countryCode: 'AE',
        countryFlag: '🇦🇪',
        license: 'DHA-P-031148',
        activePrescriptionsCount: 7,
        patientsCount: 12,
        verified: true
      },
      {
        id: 'haydee-camacho',
        name: 'Dra. Haydee Camacho Gamboa',
        slug: 'haydee-camacho',
        specialty: 'Medicina Estética & Regenerativa',
        clinicName: 'Clínica Dra. Haydee Camacho',
        city: 'Madrid',
        country: 'Spain',
        countryCode: 'ES',
        countryFlag: '🇪🇸',
        license: 'COL-MED-28491',
        activePrescriptionsCount: 8,
        patientsCount: 15,
        verified: true
      },
      {
        id: 'carlos-mendez',
        name: 'Dr. Carlos Méndez',
        slug: 'carlos-mendez',
        specialty: 'Tricología Médica & Terapia Celular',
        clinicName: 'Clínica Regenerativa Capilar',
        city: 'Barcelona',
        country: 'Spain',
        countryCode: 'ES',
        countryFlag: '🇪🇸',
        license: 'COL-MED-08291',
        activePrescriptionsCount: 11,
        patientsCount: 19,
        verified: true
      },
      {
        id: 'frank-silva',
        name: 'Dr. Frank Silva',
        slug: 'frank-silva',
        specialty: 'Longevity Medicine & Cellular Optimization',
        clinicName: 'Silva Longevity Institute',
        city: 'London',
        country: 'United Kingdom',
        countryCode: 'GB',
        countryFlag: '🇬🇧',
        license: 'GMC-7892144',
        activePrescriptionsCount: 5,
        patientsCount: 9,
        verified: true
      },
      {
        id: 'dr-marina-cordeiro',
        name: 'Dr. Marina Cordeiro Fernandes',
        slug: 'dr-marina-cordeiro',
        specialty: 'Aesthetic & Anti-Aging Medicine',
        clinicName: 'The Nova Clinic (Dubai)',
        city: 'Dubai',
        country: 'United Arab Emirates',
        countryCode: 'AE',
        countryFlag: '🇦🇪',
        license: 'DHA-P-028491',
        activePrescriptionsCount: 6,
        patientsCount: 8,
        verified: true
      }
    ];

    const existingSlugs = new Set(seed.map(s => (s.slug || s.id).toLowerCase()));
    const extra = (dynamicDoctors || []).filter(d => {
      const s = (d.slug || d.id || '').toLowerCase();
      return s && !existingSlugs.has(s);
    }).map(d => ({
      id: d.id || d.slug,
      name: d.name,
      slug: d.slug || d.id,
      specialty: d.specialty || 'General & Regenerative Medicine',
      clinicName: d.clinicName || d.clinic || 'Affiliated Clinical Center',
      city: d.city || 'Dubai',
      country: d.country || 'United Arab Emirates',
      countryCode: d.countryCode || 'AE',
      countryFlag: d.countryCode === 'QA' ? '🇶🇦' : d.countryCode === 'ES' ? '🇪🇸' : d.countryCode === 'GB' ? '🇬🇧' : '🇦🇪',
      license: d.license || 'COL-MED-VERIFIED',
      activePrescriptionsCount: d.activePrescriptionsCount || d.prescriptionsCount || 1,
      patientsCount: d.patientsCount || 1,
      verified: true
    }));

    return [...seed, ...extra];
  }, [dynamicDoctors]);

  // ── 3. PANTALLA DE PACIENTES (Patient Dossiers & Lab Results) ──────────────
  const patientsList = useMemo(() => [
    // Qatar TrichoTests (Dra. Raffanie Lucenio)
    {
      id: 'pt-turky-shahwani',
      name: 'Turky Bakhit S A Al-shahwani',
      sampleCode: 'BOX02574AATRI',
      rxCode: 'RX-BOX02574AATRI',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'raffanie-lucenio',
      clinicName: 'The Masters Medical Center (Doha)',
      country: 'Qatar',
      countryCode: 'QA',
      countryFlag: '🇶🇦',
      testEndDate: '09-07-2025',
      testType: 'Fagron TrichoTest™',
      status: 'ordered',
      pdfName: 'Fagron_TrichoTest_Turky_Bakhit_Al_Shahwani_BOX02574AATRI.pdf'
    },
    {
      id: 'pt-aisha-alsulaiti',
      name: 'Aisha Mohammed Alsulaiti',
      sampleCode: 'BOX02550AATRI',
      rxCode: 'RX-BOX02550AATRI',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'raffanie-lucenio',
      clinicName: 'The Masters Medical Center (Doha)',
      country: 'Qatar',
      countryCode: 'QA',
      countryFlag: '🇶🇦',
      testEndDate: '22-11-2024',
      testType: 'Fagron TrichoTest™',
      status: 'ordered',
      pdfName: 'Fagron_TrichoTest_Aisha_Mohammed_Alsulaiti_BOX02550AATRI.pdf'
    },
    {
      id: 'pt-maryam-alsulaiti',
      name: 'Maryam Mohammed Al-Sulaiti',
      sampleCode: 'BOX02571AATRI',
      rxCode: 'RX-BOX02571AATRI',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'raffanie-lucenio',
      clinicName: 'The Masters Medical Center (Doha)',
      country: 'Qatar',
      countryCode: 'QA',
      countryFlag: '🇶🇦',
      testEndDate: '09-07-2025',
      testType: 'Fagron TrichoTest™',
      status: 'ordered',
      pdfName: 'Fagron_TrichoTest_Maryam_Mohammed_Al_Sulaiti_BOX02571AATRI.pdf'
    },
    {
      id: 'pt-abdulrahman-fakhro',
      name: 'Abdulrahman Darwish Fakhro',
      sampleCode: 'BOX03054AATRI',
      rxCode: 'RX-BOX03054AATRI',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'raffanie-lucenio',
      clinicName: 'The Masters Medical Center (Doha)',
      country: 'Qatar',
      countryCode: 'QA',
      countryFlag: '🇶🇦',
      testEndDate: '03-10-2025',
      testType: 'Fagron TrichoTest™',
      status: 'ordered',
      pdfName: 'Fagron_TrichoTest_Abdulrahman_Darwish_Fakhro_BOX03054AATRI.pdf'
    },
    {
      id: 'pt-mohammed-alkhulaifi',
      name: 'Mohammed Yousuf Al-khulaifi',
      sampleCode: 'BOX03044AATRI',
      rxCode: 'RX-BOX03044AATRI',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'raffanie-lucenio',
      clinicName: 'The Masters Medical Center (Doha)',
      country: 'Qatar',
      countryCode: 'QA',
      countryFlag: '🇶🇦',
      testEndDate: '03-10-2025',
      testType: 'Fagron TrichoTest™',
      status: 'approved',
      pdfName: 'Fagron_TrichoTest_Mohammed_Yousuf_Al_Khulaifi_BOX03044AATRI.pdf'
    },
    {
      id: 'pt-moza-almatwi',
      name: 'Moza Ahmad Almatwi',
      sampleCode: 'BOX03041AATRI',
      rxCode: 'RX-BOX03041AATRI',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'raffanie-lucenio',
      clinicName: 'The Masters Medical Center (Doha)',
      country: 'Qatar',
      countryCode: 'QA',
      countryFlag: '🇶🇦',
      testEndDate: '26-11-2025',
      testType: 'Fagron TrichoTest™',
      status: 'approved',
      pdfName: 'Fagron_TrichoTest_Moza_Ahmad_Almatwi_BOX03041AATRI.pdf'
    },
    {
      id: 'pt-azza-almejali',
      name: 'Azza Awad Al-mejali',
      sampleCode: 'BOX03051AATRI',
      rxCode: 'RX-BOX03051AATRI',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'raffanie-lucenio',
      clinicName: 'The Masters Medical Center (Doha)',
      country: 'Qatar',
      countryCode: 'QA',
      countryFlag: '🇶🇦',
      testEndDate: '02-02-2026',
      testType: 'Fagron TrichoTest™',
      status: 'approved',
      pdfName: 'Fagron_TrichoTest_Azza_Awad_Al_Mejali_BOX03051AATRI.pdf'
    },
    {
      id: 'pt-salwa-alkubaisi',
      name: 'Salwa Saeed Alkubaisi',
      sampleCode: 'BOX03055AATRI',
      rxCode: 'RX-BOX03055AATRI',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'raffanie-lucenio',
      clinicName: 'The Masters Medical Center (Doha)',
      country: 'Qatar',
      countryCode: 'QA',
      countryFlag: '🇶🇦',
      testEndDate: '11-11-2025',
      testType: 'Fagron TrichoTest™',
      status: 'approved',
      pdfName: 'Fagron_TrichoTest_Salwa_Saeed_Alkubaisi_BOX03055AATRI.pdf'
    },
    {
      id: 'pt-sara-almeadadi',
      name: 'Sara Khalid Al-Meadadi',
      sampleCode: 'BOX02566AATRI',
      rxCode: 'RX-BOX02566AATRI',
      doctorName: 'Dr. Raffanie Lucenio',
      doctorSlug: 'raffanie-lucenio',
      clinicName: 'The Masters Medical Center (Doha)',
      country: 'Qatar',
      countryCode: 'QA',
      countryFlag: '🇶🇦',
      testEndDate: '14-05-2025',
      testType: 'Fagron TrichoTest™',
      status: 'approved',
      pdfName: 'Fagron_TrichoTest_Sara_Khalid_Al_Meadadi_BOX02566AATRI.pdf'
    },
    // YDL Dubai TrichoTests (Dr. M Jay Alkhatib)
    {
      id: 'pt-saadat-valiyeva',
      name: 'Saadat Valiyeva',
      sampleCode: 'BOX02831AATRI',
      rxCode: 'RX-FAG-YDL-001',
      doctorName: 'Dr. M Jay Alkhatib',
      doctorSlug: 'dr-jay-alkhatib',
      clinicName: 'York Diagnostic Laboratories (YDL)',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      countryFlag: '🇦🇪',
      testEndDate: '17-11-2025',
      testType: 'Fagron TrichoTest™',
      status: 'approved',
      pdfName: 'Fagron_TrichoTest_Saadat_Valiyeva.pdf'
    },
    {
      id: 'pt-rouba-akiki',
      name: 'Rouba Aref Akiki',
      sampleCode: 'BOX02598AATRI',
      rxCode: 'RX-FAG-YDL-002',
      doctorName: 'Dr. M Jay Alkhatib',
      doctorSlug: 'dr-jay-alkhatib',
      clinicName: 'York Diagnostic Laboratories (YDL)',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      countryFlag: '🇦🇪',
      testEndDate: '03-02-2025',
      testType: 'Fagron TrichoTest™',
      status: 'approved',
      pdfName: 'Fagron_TrichoTest_Rouba_Aref_Akiki.pdf'
    },
    {
      id: 'pt-menelaos-panagiotakis',
      name: 'Menelaos Panagiotakis',
      sampleCode: 'BOX02979AATRI',
      rxCode: 'RX-FAG-YDL-003',
      doctorName: 'Dr. M Jay Alkhatib',
      doctorSlug: 'dr-jay-alkhatib',
      clinicName: 'York Diagnostic Laboratories (YDL)',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      countryFlag: '🇦🇪',
      testEndDate: '06-08-2025',
      testType: 'Fagron TrichoTest™',
      status: 'approved',
      pdfName: 'Fagron_TrichoTest_Menelaos_Panagiotakis.pdf'
    },
    {
      id: 'pt-artur-gerasimenko',
      name: 'Artur Gerasimenko',
      sampleCode: 'BOX00418AATRI',
      rxCode: 'RX-FAG-YDL-004',
      doctorName: 'Dr. M Jay Alkhatib',
      doctorSlug: 'dr-jay-alkhatib',
      clinicName: 'York Diagnostic Laboratories (YDL)',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      countryFlag: '🇦🇪',
      testEndDate: '07-02-2024',
      testType: 'Fagron TrichoTest™',
      status: 'approved',
      pdfName: 'Fagron_TrichoTest_Artur_Gerasimenko.pdf'
    },
    // UAE TeloTests & Hortman (Dr. Sezgin & Dr. Sobia)
    {
      id: 'pt-rashid-malalla',
      name: 'Rashid Shahin Malalla',
      sampleCode: 'BOX03484AATRI',
      rxCode: 'RX-BOX03484AATRI',
      doctorName: 'Dr. Çağatay Sezgin',
      doctorSlug: 'dr-cagatay-sezgin',
      clinicName: 'Hortman Clinics (Dubai)',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      countryFlag: '🇦🇪',
      testEndDate: '14-04-2026',
      testType: 'Fagron TrichoTest™',
      status: 'approved'
    },
    {
      id: 'pt-melissa-nel',
      name: 'Melissa Nel',
      sampleCode: 'BOX03531AATEL',
      rxCode: 'RX-BOX03531AATEL',
      doctorName: 'Dr. Sobia Mirza',
      doctorSlug: 'dr-sobia-mirza',
      clinicName: 'Mediluxe Health Solutions',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      countryFlag: '🇦🇪',
      testEndDate: '27-04-2026',
      testType: 'Fagron TeloTest™',
      status: 'approved',
      pdfName: 'Fagron_TeloTest_Melissa_Nel_BOX03531AATEL.pdf'
    },
    {
      id: 'pt-maria-nosal',
      name: 'Maria Nosal',
      sampleCode: 'BOX00621AATEL',
      rxCode: 'RX-BOX00621AATEL',
      doctorName: 'Dr. Sobia Mirza',
      doctorSlug: 'dr-sobia-mirza',
      clinicName: 'Mediluxe Health Solutions',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      countryFlag: '🇦🇪',
      testEndDate: '06-09-2023',
      testType: 'Fagron TeloTest™',
      status: 'approved',
      pdfName: 'Fagron_TeloTest_Maria_Nosal_BOX00621AATEL.pdf'
    },
    {
      id: 'pt-saeed-maktoum',
      name: 'Saeed Al Maktoum',
      sampleCode: 'BOX03533AATEL',
      rxCode: 'RX-BOX03533AATEL',
      doctorName: 'Dr. Sobia Mirza',
      doctorSlug: 'dr-sobia-mirza',
      clinicName: 'Mediluxe Health Solutions',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      countryFlag: '🇦🇪',
      testEndDate: '27-04-2026',
      testType: 'Fagron TeloTest™',
      status: 'approved',
      pdfName: 'Fagron_TeloTest_Saeed_Al_Maktoum_BOX03533AATEL.pdf'
    }
  ], []);

  // ── 4. PANTALLA DE PRODUCTOS (Product Monographs & Batch Quality) ──────────
  const productsList = useMemo(() => [
    {
      id: 'retatrutide',
      name: 'Retatrutide (GLP-1/GIP/Glucagon Triple Agonist)',
      slug: 'retatrutide',
      dose: '10 mg',
      format: 'Lyophilized Sterile Vial',
      purity: '99.6%',
      batch: 'RP-LOT-RT10-2609',
      category: 'Metabolic & Longevity',
      status: 'In Stock',
      coaAvailable: true
    },
    {
      id: 'tirzepatide',
      name: 'Tirzepatide (Dual GLP-1/GIP Incretin)',
      slug: 'tirzepatide',
      dose: '10 mg / 15 mg',
      format: 'Lyophilized Sterile Vial',
      purity: '99.4%',
      batch: 'RP-LOT-TZ15-2611',
      category: 'Metabolic & Longevity',
      status: 'In Stock',
      coaAvailable: true
    },
    {
      id: 'semaglutide',
      name: 'Semaglutide (Selective GLP-1 RA)',
      slug: 'semaglutide',
      dose: '5 mg',
      format: 'Lyophilized Sterile Vial',
      purity: '99.5%',
      batch: 'RP-LOT-SM05-2608',
      category: 'Metabolic & Longevity',
      status: 'In Stock',
      coaAvailable: true
    },
    {
      id: 'bpc-157-tb-500',
      name: 'BPC-157 & TB-500 Synergistic Healing Blend',
      slug: 'bpc-157-tb-500',
      dose: '10 mg (5mg/5mg)',
      format: 'Lyophilized Dual Vial',
      purity: '99.7%',
      batch: 'RP-LOT-BPCTB-2610',
      category: 'Tissue Regeneration',
      status: 'In Stock',
      coaAvailable: true
    },
    {
      id: 'nad-plus',
      name: 'NAD+ Pure API (Nicotinamide Adenine Dinucleotide)',
      slug: 'nad-plus',
      dose: '500 mg / 1000 mg',
      format: 'Sterile Powder Infusion',
      purity: '99.8%',
      batch: 'RP-LOT-NAD1000-2607',
      category: 'Mitochondrial Energy',
      status: 'In Stock',
      coaAvailable: true
    },
    {
      id: 'ghk-cu',
      name: 'GHK-Cu Pure Copper Tripeptide-1',
      slug: 'ghk-cu',
      dose: '50 mg',
      format: 'Lyophilized Blue Complex',
      purity: '99.3%',
      batch: 'RP-LOT-GHK50-2605',
      category: 'Skin & Follicular Remodeling',
      status: 'In Stock',
      coaAvailable: true
    },
    {
      id: 'epithalon',
      name: 'Epithalon (Epithalamin Pineal Tetrapeptide)',
      slug: 'epithalon',
      dose: '10 mg',
      format: 'Lyophilized Sterile Vial',
      purity: '99.5%',
      batch: 'RP-LOT-EPI10-2604',
      category: 'Telomeric Longevity',
      status: 'In Stock',
      coaAvailable: true
    },
    {
      id: 'colway-stem-cell',
      name: 'Colway Trichology Stem Cell Scalp Complex',
      slug: 'colway-trichology',
      dose: 'Baicapil™ 2% + Stem Cells',
      format: 'Liposomal Topical 100 mL',
      purity: 'Medical Grade',
      batch: 'COL-TR-2026-01',
      category: 'Follicular Regimen',
      status: 'In Stock',
      coaAvailable: true
    }
  ], []);

  // Filtered Lists
  const filteredPublic = useMemo(() => {
    if (!searchQuery) return publicScreens;
    const q = searchQuery.toLowerCase().trim();
    return publicScreens.filter(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  }, [publicScreens, searchQuery]);

  const filteredDoctors = useMemo(() => {
    return doctorsList.filter(d => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || `${d.name} ${d.specialty} ${d.clinicName} ${d.city} ${d.country} ${d.license}`.toLowerCase().includes(q);
      const matchesCountry = countryFilter === 'all' || d.countryCode === countryFilter;
      return matchesQuery && matchesCountry;
    });
  }, [doctorsList, searchQuery, countryFilter]);

  const filteredPatients = useMemo(() => {
    return patientsList.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || `${p.name} ${p.sampleCode} ${p.rxCode} ${p.doctorName} ${p.clinicName} ${p.country} ${p.testType}`.toLowerCase().includes(q);
      const matchesCountry = countryFilter === 'all' || p.countryCode === countryFilter;
      return matchesQuery && matchesCountry;
    });
  }, [patientsList, searchQuery, countryFilter]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return productsList;
    const q = searchQuery.toLowerCase().trim();
    return productsList.filter(pr => pr.name.toLowerCase().includes(q) || pr.dose.toLowerCase().includes(q) || pr.category.toLowerCase().includes(q) || pr.batch.toLowerCase().includes(q));
  }, [productsList, searchQuery]);

  const handleCopy = async (text, id) => {
    triggerHaptic('selection');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Enlace copiado al portapapeles ✓');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Error al copiar enlace');
    }
  };

  const handlePurgeAllCaches = async () => {
    triggerHaptic('impact');
    setIsClearingCache(true);
    try {
      purgeAMCache();
      await new Promise(r => setTimeout(r, 400));
      toast.success('Todas las cachés de memoria y localStorage purgadas ✓');
    } catch {
      toast.error('Error al purgar cachés');
    } finally {
      setIsClearingCache(false);
    }
  };

  const openDrawer = (item, type) => {
    triggerHaptic('selection');
    setDrawerItem(item);
    setDrawerType(type);
  };

  return (
    <div style={{ padding: '1.5rem 2rem 5rem', maxWidth: '1440px', margin: '0 auto', color: '#0f172a' }}>
      
      {/* ── Page Header (Regla Golden #9) ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#0284c7', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            <Sliders size={12} />
            <span>Atlas Health · Account Manager Operations Console</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#0f172a' }}>
            Account Manager Multi-Portal Hub
          </h1>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Consola para Account Managers: selecciona y abre con 1 clic la <strong>Pantalla Pública</strong>, portales de <strong>Doctores</strong>, dossiers de <strong>Pacientes</strong> y catálogo de <strong>Productos</strong> sin necesidad de contraseñas.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handlePurgeAllCaches}
            disabled={isClearingCache}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.78rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <RefreshCw size={14} className={isClearingCache ? 'animate-spin' : ''} />
            <span>{isClearingCache ? 'Purgando...' : 'Purgar Caché'}</span>
          </button>
        </div>
      </div>

      {/* ── Reassurance Banner: Zero Password Required ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Modo Account Manager Activo · Acceso Directo Sin Contraseña</span>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '999px', background: '#10b981', color: '#ffffff', fontWeight: 800 }}>SIN LOGIN</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Como Account Manager puedes auditar y abrir en tiempo real la experiencia del paciente, médico tratante, laboratorio o catálogo público con 1 solo clic.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', color: '#cbd5e1' }}>GCC: Qatar 🇶🇦 · EAU 🇦🇪</span>
          <span style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', color: '#cbd5e1' }}>EU: España 🇪🇸 · UK 🇬🇧</span>
        </div>
      </div>

      {/* ── 4 Google Cloud KPIs (Regla Golden #22) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pantalla Pública</span>
            <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{publicScreens.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, marginTop: '4px' }}>Portales y Vistas Públicas</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Médicos Verificados</span>
            <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{doctorsList.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>Portales /dr/[slug] Activos</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Dossiers de Pacientes</span>
            <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{patientsList.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 600, marginTop: '4px' }}>Recetas /rx/[code] & Lab</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Péptidos & Fórmulas</span>
            <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={14} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{productsList.length}+</div>
          <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600, marginTop: '4px' }}>Monografías /p/[slug] con HPLC</div>
        </div>
      </div>

      {/* ── 4-Mode Selector (Golden UX Requirement) ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <button
          type="button"
          onClick={() => { triggerHaptic('selection'); setActiveView('public'); }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: activeView === 'public' ? '1px solid #0284c7' : '1px solid transparent',
            background: activeView === 'public' ? '#eff6ff' : '#ffffff',
            color: activeView === 'public' ? '#0284c7' : '#475569',
            boxShadow: activeView === 'public' ? '0 1px 3px rgba(2,132,199,0.1)' : 'none'
          }}
        >
          <Globe size={16} />
          <span>1. Pantalla Pública</span>
          <span style={{ fontSize: '0.72rem', background: activeView === 'public' ? '#0284c7' : '#e2e8f0', color: activeView === 'public' ? '#fff' : '#64748b', padding: '2px 6px', borderRadius: '999px' }}>{publicScreens.length}</span>
        </button>

        <button
          type="button"
          onClick={() => { triggerHaptic('selection'); setActiveView('doctors'); }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: activeView === 'doctors' ? '1px solid #059669' : '1px solid transparent',
            background: activeView === 'doctors' ? '#ecfdf5' : '#ffffff',
            color: activeView === 'doctors' ? '#059669' : '#475569',
            boxShadow: activeView === 'doctors' ? '0 1px 3px rgba(5,150,105,0.1)' : 'none'
          }}
        >
          <Stethoscope size={16} />
          <span>2. Pantalla de Doctores</span>
          <span style={{ fontSize: '0.72rem', background: activeView === 'doctors' ? '#059669' : '#e2e8f0', color: activeView === 'doctors' ? '#fff' : '#64748b', padding: '2px 6px', borderRadius: '999px' }}>{doctorsList.length}</span>
        </button>

        <button
          type="button"
          onClick={() => { triggerHaptic('selection'); setActiveView('patients'); }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: activeView === 'patients' ? '1px solid #7c3aed' : '1px solid transparent',
            background: activeView === 'patients' ? '#f5f3ff' : '#ffffff',
            color: activeView === 'patients' ? '#7c3aed' : '#475569',
            boxShadow: activeView === 'patients' ? '0 1px 3px rgba(124,58,237,0.1)' : 'none'
          }}
        >
          <User size={16} />
          <span>3. Pantalla de Pacientes</span>
          <span style={{ fontSize: '0.72rem', background: activeView === 'patients' ? '#7c3aed' : '#e2e8f0', color: activeView === 'patients' ? '#fff' : '#64748b', padding: '2px 6px', borderRadius: '999px' }}>{patientsList.length}</span>
        </button>

        <button
          type="button"
          onClick={() => { triggerHaptic('selection'); setActiveView('products'); }}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: activeView === 'products' ? '1px solid #d97706' : '1px solid transparent',
            background: activeView === 'products' ? '#fffbeb' : '#ffffff',
            color: activeView === 'products' ? '#d97706' : '#475569',
            boxShadow: activeView === 'products' ? '0 1px 3px rgba(217,119,6,0.1)' : 'none'
          }}
        >
          <FlaskConical size={16} />
          <span>4. Pantalla de Productos</span>
          <span style={{ fontSize: '0.72rem', background: activeView === 'products' ? '#d97706' : '#e2e8f0', color: activeView === 'products' ? '#fff' : '#64748b', padding: '2px 6px', borderRadius: '999px' }}>{productsList.length}</span>
        </button>

        <div style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={() => { triggerHaptic('selection'); setActiveView('ops'); }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.76rem',
              fontWeight: 650,
              cursor: 'pointer',
              border: '1px solid #cbd5e1',
              background: activeView === 'ops' ? '#0f172a' : '#ffffff',
              color: activeView === 'ops' ? '#ffffff' : '#64748b'
            }}
          >
            Aduanas & Etiquetas
          </button>
        </div>
      </div>

      {/* ── Search Bar (Regla Golden #7) ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeView === 'public' ? 'Filtrar pantallas públicas...' :
              activeView === 'doctors' ? 'Buscar doctor por nombre, clínica, especialidad, licencia...' :
              activeView === 'patients' ? 'Buscar paciente por nombre, BOX code, RX code o doctor...' :
              'Buscar producto por nombre, concentración, lote, categoría...'
            }
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.85rem',
              color: '#0f172a',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ×
            </button>
          )}
        </div>

        {(activeView === 'doctors' || activeView === 'patients') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Territorio:</span>
            {[
              { code: 'all', label: 'Todos' },
              { code: 'QA', label: 'Qatar 🇶🇦' },
              { code: 'AE', label: 'EAU 🇦🇪' },
              { code: 'ES', label: 'España 🇪🇸' },
              { code: 'GB', label: 'UK 🇬🇧' }
            ].map(c => (
              <button
                key={c.code}
                onClick={() => setCountryFilter(c.code)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  border: countryFilter === c.code ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  background: countryFilter === c.code ? '#eff6ff' : '#ffffff',
                  color: countryFilter === c.code ? '#0284c7' : '#64748b'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────────
          VIEW 1: PANTALLA PÚBLICA (Public Views)
      ─────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'public' && (
        <div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 650, marginBottom: '0.85rem' }}>
            VISTAS PÚBLICAS Y PORTALES DISPONIBLES ({filteredPublic.length} pantallas)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {filteredPublic.map(screen => {
              const IconComp = screen.icon;
              return (
                <div
                  key={screen.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '8px', background: screen.bg, color: screen.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp size={18} />
                      </div>
                      <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontWeight: 700 }}>
                        {screen.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
                      {screen.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px' }}>
                      {screen.desc}
                    </p>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#0284c7', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', marginBottom: '12px' }}>
                      {screen.path}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <Link
                      href={screen.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#0284c7',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Abrir Pantalla</span>
                      <ExternalLink size={13} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopy(`${window.location.origin}${screen.path}`, screen.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Copiar URL completa"
                    >
                      {copiedId === screen.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────
          VIEW 2: PANTALLA DE DOCTORES (Doctor Portals & Impersonation)
      ─────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'doctors' && (
        <div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 650, marginBottom: '0.85rem' }}>
            MÉDICOS DE LA RED ATLAS ({filteredDoctors.length} profesionales registrados)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {filteredDoctors.map(doc => (
              <div
                key={doc.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{doc.countryFlag}</span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                          {doc.name}
                        </h3>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 650, marginTop: '2px' }}>
                        {doc.specialty}
                      </div>
                    </div>

                    <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                      VERIFICADO
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px' }}>
                    <strong>Clínica:</strong> {doc.clinicName}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>
                    {doc.city}, {doc.country} · Licencia: <code>{doc.license}</code>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px' }}>
                    <div><strong>{doc.activePrescriptionsCount}</strong> Recetas emitidas</div>
                    <div>•</div>
                    <div><strong>{doc.patientsCount}</strong> Pacientes activos</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => openDrawer(doc, 'doctor')}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Abrir Split Drawer de Trazabilidad"
                    >
                      <Eye size={13} />
                      <span>Detalle</span>
                    </button>

                    <Link
                      href={`/dr/${doc.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        borderRadius: '6px',
                        background: '#059669',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Abrir Portal (/dr)</span>
                      <ExternalLink size={13} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopy(`${window.location.origin}/dr/${doc.slug}`, doc.id)}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                      title="Copiar URL del Portal Doctor"
                    >
                      {copiedId === doc.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <Link
                    href={`/doctor/prescriptions?impersonate=doctor&doc=${doc.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      color: '#334155',
                      fontSize: '0.74rem',
                      fontWeight: 650,
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Entrar al Workspace Clínico (/doctor)</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────
          VIEW 3: PANTALLA DE PACIENTES (Patient Dossiers & Lab Results)
      ─────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'patients' && (
        <div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 650, marginBottom: '0.85rem' }}>
            PACIENTES CON DOSSIER ACTIVO ({filteredPatients.length} pacientes registrados)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
            {filteredPatients.map(pt => (
              <div
                key={pt.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{pt.countryFlag}</span>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                          {pt.name}
                        </h3>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                        Dr: <strong>{pt.doctorName}</strong> ({pt.clinicName})
                      </div>
                    </div>

                    <StatusBadge status={pt.status} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0 12px' }}>
                    <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 650 }}>
                      Muestra: <CopyableId value={pt.sampleCode} />
                    </div>
                    <div style={{ background: '#f5f3ff', color: '#6d28d9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 650 }}>
                      Receta: <CopyableId value={pt.rxCode} />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: '#475569', marginBottom: '12px' }}>
                    Test: <strong>{pt.testType}</strong> · Fecha informe: <code>{pt.testEndDate}</code>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => openDrawer(pt, 'patient')}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Abrir Split Drawer de Trazabilidad"
                    >
                      <Eye size={13} />
                      <span>Detalle</span>
                    </button>

                    <Link
                      href={`/rx/${pt.rxCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: '#7c3aed',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Ver Receta (/rx)</span>
                      <ExternalLink size={13} />
                    </Link>

                    <Link
                      href={`/lab/${pt.sampleCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: '#eff6ff',
                        color: '#0284c7',
                        border: '1px solid #bfdbfe',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Ver Lab (/lab)</span>
                      <ExternalLink size={13} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopy(`${window.location.origin}/rx/${pt.rxCode}`, pt.id)}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                      title="Copiar URL del Paciente"
                    >
                      {copiedId === pt.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {pt.pdfName && (
                    <div style={{ fontSize: '0.72rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <CheckCircle2 size={12} />
                      <span>PDF Original Fagron adjunto en Storage</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────
          VIEW 4: PANTALLA DE PRODUCTOS (Product Monographs & Compounding)
      ─────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'products' && (
        <div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 650, marginBottom: '0.85rem' }}>
            PÉPTIDOS, FÓRMULAS & ACTIVOS FARMACÉUTICOS ({filteredProducts.length} productos)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {filteredProducts.map(prod => (
              <div
                key={prod.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>
                        {prod.category}
                      </span>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '2px 0 0', color: '#0f172a' }}>
                        {prod.name}
                      </h3>
                    </div>

                    <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', fontWeight: 700 }}>
                      HPLC {prod.purity}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 8px' }}>
                    Dosis: <strong>{prod.dose}</strong> · Formato: {prod.format}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', fontSize: '0.74rem', color: '#64748b', marginBottom: '12px' }}>
                    Lote Activo: <CopyableId value={prod.batch} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => openDrawer(prod, 'product')}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Abrir Split Drawer de Trazabilidad"
                    >
                      <Eye size={13} />
                      <span>Detalle</span>
                    </button>

                    <Link
                      href={`/p/${prod.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        borderRadius: '6px',
                        background: '#d97706',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Ver Monografía (/p)</span>
                      <ExternalLink size={13} />
                    </Link>

                    <Link
                      href={`/vial-label/${prod.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 650,
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Generar Etiqueta 300 DPI"
                    >
                      <Tag size={13} />
                      <span>Etiqueta</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopy(`${window.location.origin}/p/${prod.slug}`, prod.id)}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                      title="Copiar URL del Producto"
                    >
                      {copiedId === prod.id ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────
          AUXILIARY: ADUANAS & ETIQUETAS
      ─────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'ops' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>
            Operaciones de Exportación y Cumplimiento Aduanero
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 1.5rem' }}>
            Reglas de etiquetado clínico de viales (DHA / MOPH / EMA) y valoración aduanera para envíos internacionales.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: '4px' }}>
                Reglas de Impresión de Etiquetas 300 DPI
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                <li>Dimensiones estándar: 50mm x 25mm para viales de 2mL y 3mL.</li>
                <li>QR Code con micro-URL encriptada dirigida a <code>/verify/[code]</code>.</li>
                <li>Purity HPLC, Batch ID y Fecha de Caducidad obligatorios en cada vial.</li>
              </ul>
              <div style={{ marginTop: '12px' }}>
                <Link
                  href="/labels"
                  target="_blank"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    textDecoration: 'none'
                  }}
                >
                  <span>Abrir Administrador de Etiquetas (/labels)</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: '4px' }}>
                Declaración Aduanera GCC / EAU / Qatar
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                <li>HS Code Declarado: <strong>2937.19.00</strong> (Péptidos y derivados hormonales).</li>
                <li>Temperatura de Cadena Fría: 2°C - 8°C con indicador térmico certificado.</li>
                <li>Carta de exención clínica adjunta con firma del médico supervisor.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── GCP Contextual Split Drawer (Phases 3, 5 & 6) ── */}
      {drawerItem && (
        <GCPSplitDrawer
          item={drawerItem}
          type={drawerType}
          onClose={() => setDrawerItem(null)}
        />
      )}

    </div>
  );
}
