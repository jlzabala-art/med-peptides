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
  Download,
  LayoutDashboard
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';
import CopyableId from '../ui/CopyableId';
import StatusBadge from '../ui/StatusBadge';
import GCPSplitDrawer from './GCPSplitDrawer';
import DataTable from '../ui/DataTable';
import { getCachedAMData, setCachedAMData, purgeAMCache } from '../../services/accountManagerCache';

export default function AdminToolsTab() {
  const router = useRouter();

  // Navigation Views for Account Manager Hub:
  // 'overview' | 'doctors' | 'patients' | 'products' | 'public' | 'ops'
  const [activeView, setActiveView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Side Drawer Split-View state (GCP Master-Detail)
  const [drawerItem, setDrawerItem] = useState(null);
  const [drawerType, setDrawerType] = useState('doctor'); // 'doctor' | 'patient' | 'product'

  // Dynamic state from Firestore APIs
  const [dynamicDoctors, setDynamicDoctors] = useState([]);
  const [dynamicPrescriptions, setDynamicPrescriptions] = useState([]);

  // Auto-purge stale cache on refresh/load & fetch fresh doctors from Firestore API
  useEffect(() => {
    let isMounted = true;
    
    // Automatically purge stale local/memory cache on page refresh / load
    purgeAMCache();

    fetch('/api/prescriptions/doctors-list', { cache: 'no-store' })
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

  // ── Unified DataTable Columns for Doctors (Golden Rule #3 & #30) ─────────
  const doctorColumns = useMemo(() => [
    {
      key: 'name',
      title: 'Doctor & Specialty',
      width: '32%',
      sortable: true,
      render: (doc) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.82rem',
            flexShrink: 0
          }}>
            {doc.name?.replace(/^(Dr\.|Dra\.)\s*/, '').charAt(0) || 'D'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1rem' }}>{doc.countryFlag}</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{doc.name}</span>
              {doc.verified && (
                <span style={{
                  fontSize: '0.62rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  fontWeight: 700,
                  border: '1px solid #bbf7d0'
                }}>
                  VERIFIED
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              {doc.specialty}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'clinicName',
      title: 'Clinic & Territory',
      width: '24%',
      sortable: true,
      render: (doc) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.84rem' }}>{doc.clinicName}</div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
            {doc.city}, {doc.country} · Lic: <span style={{ fontFamily: 'monospace', color: '#475569' }}>{doc.license}</span>
          </div>
        </div>
      )
    },
    {
      key: 'slug',
      title: 'Public Portal Endpoint',
      width: '20%',
      render: (doc) => (
        <div>
          <div style={{ fontSize: '0.76rem', fontFamily: 'monospace', color: '#0284c7', background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <span>/dr/{doc.slug}</span>
          </div>
          <div>
            <CopyableId value={`${typeof window !== 'undefined' ? window.location.origin : ''}/dr/${doc.slug}`} label="Copy link" />
          </div>
        </div>
      )
    },
    {
      key: 'activity',
      title: 'Activity',
      width: '12%',
      sortable: true,
      render: (doc) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
            {doc.activePrescriptionsCount} Prescriptions
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {doc.patientsCount} Active Patients
          </span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      width: '8%',
      render: () => <StatusBadge status="active" />
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '140px',
      render: (doc) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openDrawer(doc, 'doctor');
            }}
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.74rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Inspect traceability drawer"
          >
            <Eye size={13} />
            <span>Detail</span>
          </button>

          <Link
            href={`/dr/${doc.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: '#059669',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)'
            }}
            title="Open doctor portal in new tab"
          >
            <span>Open</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      )
    }
  ], []);

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

  const openDrawer = (item, type) => {
    triggerHaptic('selection');
    setDrawerItem(item);
    setDrawerType(type);
  };

  return (
    <div style={{ padding: '1.25rem 1.5rem 5rem', maxWidth: '1440px', margin: '0 auto', color: '#0f172a' }}>
      
      {/* ── Page Header (Golden Rule #9) ── */}
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
            Single-click console for Account Managers: inspect and open <strong>Public Screens</strong>, verified <strong>Doctor Portals</strong>, <strong>Patient Dossiers</strong>, and <strong>Product Monographs</strong> with zero credential barriers.
          </p>
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
              <span>Account Manager Mode Active · Instant Credential-Free Access</span>
              <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '999px', background: '#10b981', color: '#ffffff', fontWeight: 800 }}>NO LOGIN REQUIRED</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Audit and launch real-time clinical experiences for patients, attending physicians, compounding labs, and public monographs with 1 single click.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', color: '#cbd5e1' }}>GCC: Qatar 🇶🇦 · UAE 🇦🇪</span>
          <span style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', color: '#cbd5e1' }}>EU: Spain 🇪🇸 · UK 🇬🇧</span>
        </div>
      </div>

      {/* ── Responsive Google Cloud Layout: Sidebar + Main Content ── */}
      <style jsx>{`
        .am-hub-layout {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }
        .am-hub-sidebar {
          width: 250px;
          flex-shrink: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.85rem 0.65rem;
          position: sticky;
          top: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .am-sidebar-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.25rem 0.5rem 0.65rem;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 0.5rem;
        }
        .am-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .am-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 650;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }
        .am-nav-item:hover {
          background: #f8fafc;
          color: #0f172a;
        }
        .am-nav-item.active {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #0284c7;
          font-weight: 700;
        }
        .am-nav-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .am-nav-badge {
          font-size: 0.7rem;
          padding: 2px 7px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #64748b;
          font-weight: 700;
        }
        .am-nav-item.active .am-nav-badge {
          background: #0284c7;
          color: #ffffff;
        }
        .am-hub-content {
          flex: 1;
          min-width: 0;
        }
        @media (max-width: 899px) {
          .am-hub-layout {
            flex-direction: column;
            gap: 1rem;
          }
          .am-hub-sidebar {
            width: 100%;
            position: static;
            padding: 0.5rem;
            border-radius: 8px;
          }
          .am-sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
            gap: 6px;
            padding-bottom: 4px;
          }
          .am-nav-item {
            width: auto;
            flex-shrink: 0;
            padding: 7px 12px;
          }
        }
      `}</style>

      <div className="am-hub-layout">
        {/* ── Left Sidebar (Google Cloud Style) ── */}
        <aside className="am-hub-sidebar">
          <div className="am-sidebar-header">
            <Sliders size={13} />
            <span>Navigation Hub</span>
          </div>
          <nav className="am-sidebar-nav">
            <button
              type="button"
              className={`am-nav-item ${activeView === 'overview' ? 'active' : ''}`}
              onClick={() => { triggerHaptic('selection'); setActiveView('overview'); }}
            >
              <LayoutDashboard size={15} />
              <span className="am-nav-label">1. Overview & KPIs</span>
              <span className="am-nav-badge">GCP</span>
            </button>

            <button
              type="button"
              className={`am-nav-item ${activeView === 'doctors' ? 'active' : ''}`}
              onClick={() => { triggerHaptic('selection'); setActiveView('doctors'); }}
            >
              <Stethoscope size={15} />
              <span className="am-nav-label">2. Doctors Directory</span>
              <span className="am-nav-badge">{doctorsList.length}</span>
            </button>

            <button
              type="button"
              className={`am-nav-item ${activeView === 'patients' ? 'active' : ''}`}
              onClick={() => { triggerHaptic('selection'); setActiveView('patients'); }}
            >
              <User size={15} />
              <span className="am-nav-label">3. Patient Dossiers</span>
              <span className="am-nav-badge">{patientsList.length}</span>
            </button>

            <button
              type="button"
              className={`am-nav-item ${activeView === 'products' ? 'active' : ''}`}
              onClick={() => { triggerHaptic('selection'); setActiveView('products'); }}
            >
              <FlaskConical size={15} />
              <span className="am-nav-label">4. Product Catalog</span>
              <span className="am-nav-badge">{productsList.length}+</span>
            </button>

            <button
              type="button"
              className={`am-nav-item ${activeView === 'public' ? 'active' : ''}`}
              onClick={() => { triggerHaptic('selection'); setActiveView('public'); }}
            >
              <Globe size={15} />
              <span className="am-nav-label">5. Public Portals</span>
              <span className="am-nav-badge">{publicScreens.length}</span>
            </button>

            <a
              href="/labels"
              target="_blank"
              rel="noopener noreferrer"
              className="am-nav-item"
              onClick={() => triggerHaptic('selection')}
              style={{ textDecoration: 'none' }}
              title="Open Compounding Label Studio in a new tab"
            >
              <Tag size={15} />
              <span className="am-nav-label">6. Labels Studio</span>
              <ExternalLink size={12} style={{ color: '#94a3b8', marginLeft: 'auto' }} />
            </a>
          </nav>
        </aside>

        {/* ── Main Work Area ── */}
        <main className="am-hub-content">
          
          {/* ───────────────────────────────────────────────────────────────────────────
              VIEW 0: OVERVIEW & KPIS (Google Cloud Rule #22)
          ─────────────────────────────────────────────────────────────────────────── */}
          {activeView === 'overview' && (
            <div>
              {/* 4 Google Cloud KPIs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div
                  onClick={() => setActiveView('public')}
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0284c7'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Public Portals</span>
                    <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={14} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{publicScreens.length}</div>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600, marginTop: '4px' }}>Portals & Public Views</div>
                </div>

                <div
                  onClick={() => setActiveView('doctors')}
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Verified Doctors</span>
                    <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Stethoscope size={14} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{doctorsList.length}</div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>Active /dr/[slug] Portals</div>
                </div>

                <div
                  onClick={() => setActiveView('patients')}
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Patient Dossiers</span>
                    <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={14} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{patientsList.length}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 600, marginTop: '4px' }}>Prescriptions /rx & Lab</div>
                </div>

                <div
                  onClick={() => setActiveView('products')}
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d97706'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Peptides & Formulas</span>
                    <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FlaskConical size={14} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{productsList.length}+</div>
                  <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600, marginTop: '4px' }}>Monographs with HPLC</div>
                </div>
              </div>

              {/* Executive Launchpad: Quick Direct Jump */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Quick Directory Launchpad
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
                  Select an operational workspace to explore records, audit clinical workflows, or generate prescription orders:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                  <div
                    onClick={() => setActiveView('doctors')}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.background = '#ecfdf5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Stethoscope size={16} color="#059669" />
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Doctors Table</strong>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      Verified physician directory formatted as an editable Google Cloud table with 1-click portal open.
                    </p>
                    <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Open Table →
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveView('patients')}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#f5f3ff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <User size={16} color="#7c3aed" />
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Patient Dossiers</strong>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      Active patients with Fagron TrichoTest DNA kits, prescription numbers, and lab certificates.
                    </p>
                    <span style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Explore Patients →
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveView('products')}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.background = '#fffbeb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <FlaskConical size={16} color="#d97706" />
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Product Catalog</strong>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      HPLC-tested peptides, bulk APIs, compounding bases, and vial label specifications.
                    </p>
                    <span style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Browse Catalog →
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveView('public')}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#eff6ff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Globe size={16} color="#0284c7" />
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Public Portals</strong>
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      Direct public entry points to the storefront, clinical protocols, and batch verifiers.
                    </p>
                    <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      View Links →
                    </span>
                  </div>

                  <a
                    href="/labels"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc', textDecoration: 'none', display: 'block', transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#f0f9ff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={16} color="#0284c7" />
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Labels Studio</strong>
                      </div>
                      <ExternalLink size={14} color="#0284c7" />
                    </div>
                    <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      EU GMP vector label designer, 300 DPI thermal Zebra & A4 sheet printing studio.
                    </p>
                    <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Open Labels App ↗
                    </span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── Search & Filter Bar for List Views (Regla Golden #7) ── */}
          {activeView !== 'overview' && activeView !== 'ops' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeView === 'public' ? 'Filter public portal views...' :
                    activeView === 'doctors' ? 'Filter doctors by name, clinic, specialty, license...' :
                    activeView === 'patients' ? 'Filter patients by name, sample code, RX code or doctor...' :
                    'Filter products by name, concentration, batch, category...'
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
                  <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Territory:</span>
                  {[
                    { code: 'all', label: 'All' },
                    { code: 'QA', label: 'Qatar 🇶🇦' },
                    { code: 'AE', label: 'UAE 🇦🇪' },
                    { code: 'ES', label: 'Spain 🇪🇸' },
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
          )}

          {/* ───────────────────────────────────────────────────────────────────────────
              VIEW 1: PANTALLA PÚBLICA (Public Views)
          ─────────────────────────────────────────────────────────────────────────── */}
          {activeView === 'public' && (
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 650, marginBottom: '0.85rem' }}>
                AVAILABLE PUBLIC SCREENS & PORTALS ({filteredPublic.length} views)
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
                          <span>Open View</span>
                          <ExternalLink size={13} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleCopy(`${typeof window !== 'undefined' ? window.location.origin : ''}${screen.path}`, screen.id)}
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
                          title="Copy Full URL"
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
              VIEW 2: DOCTORS DIRECTORY (DataTable Exclusive - Golden Rule #3)
          ─────────────────────────────────────────────────────────────────────────── */}
          {activeView === 'doctors' && (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 650 }}>
                  ATLAS MEDICAL NETWORK DIRECTORY ({filteredDoctors.length} registered practitioners)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                  ● 100% Direct Impersonation Available (No Credentials Required)
                </div>
              </div>

              <DataTable
                columns={doctorColumns}
                data={filteredDoctors}
                keyField="id"
                pagination={true}
                initialRowsPerPage={15}
                mobileView="cards"
                emptyTitle="No doctors found"
                emptyDescription="No physicians match the selected search query or territory filter."
              />
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

        </main>
      </div>

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
