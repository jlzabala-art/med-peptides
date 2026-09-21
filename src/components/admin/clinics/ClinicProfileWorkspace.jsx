"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { StatusChip, CopyableId, Skeleton } from '../../ui';
import StructuredApiCompositionView from '../../prescriptions/StructuredApiCompositionView';
import GlobalRelationshipPanel from '../../shared/GlobalRelationshipPanel';
import UniversalTimeline from '../../shared/UniversalTimeline';
import TasksEngine from '../../shared/TasksEngine';
import CommunicationHub from '../../shared/CommunicationHub';
import RevenueWidget from '../../shared/RevenueWidget';
import ImportPrescriptionModal from '../../../features/prescriptions/components/ImportPrescriptionModal';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import notifier from '../../../services/NotificationService';
import { fetchClinicWorkspaceBundle } from '../../../actions/clinicsActions';
import {
  X,
  Building2,
  MapPin,
  Users,
  Briefcase,
  Activity,
  ShoppingCart,
  ShieldPlus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Navigation,
  FileUp,
  FileText,
  RefreshCw,
  Stethoscope,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet
} from '@/lib/icons';

/**
 * ClinicProfileWorkspace
 * Accordion-driven institutional drawer optimized for mobile and desktop screens.
 * Eliminates double-column squeezing, text collision, and missing contact data.
 */
export default function ClinicProfileWorkspace({ clinic, onClose }) {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [bundle, setBundle] = useState(null);
  const [loadingBundle, setLoadingBundle] = useState(true);

  // Accordion state: Exclusive single-open mode to prevent long scrolls
  const [openSections, setOpenSections] = useState({
    practice: true,
    physicians: false,
    prescriptions: false,
    commercial: false,
    orders: false,
    timeline: false
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => {
      const isCurrentlyOpen = prev[sec];
      return {
        practice: !isCurrentlyOpen && sec === 'practice',
        physicians: !isCurrentlyOpen && sec === 'physicians',
        prescriptions: !isCurrentlyOpen && sec === 'prescriptions',
        commercial: !isCurrentlyOpen && sec === 'commercial',
        orders: !isCurrentlyOpen && sec === 'orders',
        timeline: !isCurrentlyOpen && sec === 'timeline'
      };
    });
  };

  const collapseAll = () => {
    setOpenSections({
      practice: false,
      physicians: false,
      prescriptions: false,
      commercial: false,
      orders: false,
      timeline: false
    });
  };

  const loadBundle = async () => {
    if (!clinic?.id) return;
    setLoadingBundle(true);
    try {
      const data = await fetchClinicWorkspaceBundle(clinic.id);
      if (data) {
        setBundle(data);
      }
    } catch (err) {
      console.error("Failed to load clinic workspace bundle:", err);
      notifier.error("Could not load real-time clinic details");
    } finally {
      setLoadingBundle(false);
    }
  };

  useEffect(() => {
    loadBundle();
  }, [clinic?.id]);

  const effectiveClinic = bundle?.clinic || clinic;
  const physicians = bundle?.physicians || [];
  const recentOrders = bundle?.recentOrders || [];
  const recentPrescriptions = bundle?.recentPrescriptions || [];
  const manager = bundle?.accountManager || { id: 'mgr_assigned', name: effectiveClinic.manager || 'Assigned Account Manager' };
  const stats = bundle?.stats || {
    monthlyVolume: effectiveClinic.monthlyVolume || 0,
    activePatients: effectiveClinic.patients || 0,
    totalPrescriptions: recentPrescriptions.length,
    totalOrders: recentOrders.length
  };

  // Resolve complete formatted address
  const resolvedAddress =
    effectiveClinic.streetAddress ||
    effectiveClinic.address ||
    [effectiveClinic.streetAddress, effectiveClinic.city, effectiveClinic.state, effectiveClinic.country]
      .filter(Boolean)
      .join(', ') ||
    'Address not specified';

  const [generatingPdfRxId, setGeneratingPdfRxId] = useState(null);
  const [convertingRxId, setConvertingRxId] = useState(null);
  const [convertedOrders, setConvertedOrders] = useState({});
  const [selectedApiQuery, setSelectedApiQuery] = useState('ALL');
  const [apiSearchTerm, setApiSearchTerm] = useState('');

  // Extract all unique active ingredients / APIs across the clinic's prescriptions
  const clinicApis = useMemo(() => {
    const map = new Map();
    recentPrescriptions.forEach(rx => {
      const apis = rx.apiItems || rx.items || [];
      apis.forEach(it => {
        const rawName = it.genericName || it.name || '';
        const cleanName = rawName.replace(/ Fagron| TM/gi, '').trim();
        if (cleanName && cleanName !== 'Active Substance') {
          const currentCount = map.get(cleanName) || 0;
          map.set(cleanName, currentCount + 1);
        }
      });
      (rx.activeSubstances || []).forEach(sub => {
        const currentCount = map.get(sub) || 0;
        map.set(sub, currentCount + 1);
      });
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [recentPrescriptions]);

  // Filter prescriptions by selected API or text query
  const displayedPrescriptions = useMemo(() => {
    return recentPrescriptions.filter(rx => {
      if (selectedApiQuery !== 'ALL') {
        const matchesApi = 
          (rx.activeSubstances || []).some(s => s.toLowerCase().includes(selectedApiQuery.toLowerCase())) ||
          (rx.apiItems || rx.items || []).some(it => (it.name || it.genericName || '').toLowerCase().includes(selectedApiQuery.toLowerCase())) ||
          (rx.clinicalNotes || '').toLowerCase().includes(selectedApiQuery.toLowerCase());
        if (!matchesApi) return false;
      }
      if (apiSearchTerm.trim()) {
        const q = apiSearchTerm.toLowerCase();
        const matchesSearch =
          (rx.code || rx.prescriptionNumber || rx.id || '').toLowerCase().includes(q) ||
          (rx.patient?.name || rx.patientName || '').toLowerCase().includes(q) ||
          (rx.doctorName || '').toLowerCase().includes(q) ||
          (rx.clinicalNotes || '').toLowerCase().includes(q) ||
          (rx.apiItems || rx.items || []).some(it => (it.name || it.role || '').toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [recentPrescriptions, selectedApiQuery, apiSearchTerm]);

  // Calculate cumulative consumption totals across the clinic
  const clinicApiConsumption = useMemo(() => {
    const summary = {
      'Latanoprost': { totalMg: 0, count: 0, role: 'Anagen Inducer' },
      '17-α-Estradiol': { totalMg: 0, count: 0, role: 'Estrogen / 5AR Inhibitor' },
      'IGrantine-F1': { totalMg: 0, count: 0, role: 'Biomimetic Peptide' },
      'TrichoSol': { totalMl: 0, count: 0, role: 'Patented Vehicle Base' },
    };

    recentPrescriptions.forEach(rx => {
      const apis = rx.apiItems || rx.items || [];
      apis.forEach(it => {
        const name = it.name || it.genericName || '';
        if (/latanoprost/i.test(name)) {
          summary['Latanoprost'].totalMg += (it.totalCourseConsumptionMg || 15);
          summary['Latanoprost'].count += 1;
        } else if (/estradiol/i.test(name)) {
          summary['17-α-Estradiol'].totalMg += (it.totalCourseConsumptionMg || 150);
          summary['17-α-Estradiol'].count += 1;
        } else if (/igrantine/i.test(name)) {
          summary['IGrantine-F1'].totalMg += (it.totalCourseConsumptionMg || 1500);
          summary['IGrantine-F1'].count += 1;
        } else if (/trichosol|vehicle/i.test(name)) {
          summary['TrichoSol'].totalMl += (it.totalCourseConsumptionMl || 300);
          summary['TrichoSol'].count += 1;
        }
      });
    });

    return summary;
  }, [recentPrescriptions]);

  const handleGenerateMagistralPdf = async (rx) => {
    setGeneratingPdfRxId(rx.id);
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header Banner
      doc.setFillColor(0, 54, 102);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('REGENPEPT CLINICAL & MAGISTRAL PROTOCOL', 14, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(210, 230, 255);
      doc.text('Magistral Compounding Formulation & Dispensing Order', 14, 19);
      doc.text(`Doc Ref: #${rx.code || rx.prescriptionNumber || rx.id}`, 196, 13, { align: 'right' });
      doc.text(`Issue Date: ${rx.date || '2026-09-15'}`, 196, 19, { align: 'right' });

      // 2-Column Institutional Authority & Patient Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('PRESCRIBING CLINICAL AUTHORITY:', 14, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Clinic: ${effectiveClinic.name || 'Bedaya Polyclinic L.L.C.'}`, 14, 48);
      doc.text(`Address: ${resolvedAddress}`, 14, 53);
      const doctorObj = physicians[0];
      doc.text(`Prescribing Physician: ${rx.doctorName || doctorObj?.name || 'Dr. Hanieh Erdmann'}`, 14, 58);
      doc.text(`License / DHA ID: ${doctorObj?.dhaLicense || rx.doctorLicense || 'DHA-00013060-006'}`, 14, 63);
      if (doctorObj?.germanMedicalId || rx.doctorArztausweis) {
        doc.text(`German Medical ID (Arztausweis): ${doctorObj?.germanMedicalId || rx.doctorArztausweis || '802790100115715'}`, 14, 68);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('PATIENT IDENTIFICATION & CLINICAL RECORD:', 118, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Full Name: ${rx.patientName || rx.patient?.name || 'Matin Rahim Delavar Rafiei'}`, 118, 48);
      doc.text(`Clinical PIN: ${rx.patientPin || rx.patient?.pin || '11774'}`, 118, 53);
      doc.text(`Gender / DOB: Female • 1984-06-15`, 118, 58);
      doc.text(`Clinical Indication: ${rx.indication || 'Topical Hair Restoration'}`, 118, 63);
      doc.text(`Dispensing Status: APPROVED / ACCREDITED`, 118, 68);

      // Active Formula Table
      const formulaRows = [
        ['1', 'Latanoprost Fagron', '0.005% (50 mcg/ml)', 'TrichoSol Vehicle', '3x 100 ml'],
        ['2', '17-alpha-Estradiol', '0.05% (500 mcg/ml)', 'TrichoSol Vehicle', '3x 100 ml'],
        ['3', 'IGrantine-F1 TM', '0.50% (5 mg/ml)', 'TrichoSol Vehicle', '3x 100 ml'],
        ['4', 'TrichoSol Carrier Solution', 'q.s. 100 ml', 'Patented Scalp Vehicle', '3x 100 ml (N3 pack)']
      ];

      doc.autoTable({
        startY: 76,
        head: [['#', 'Compounded Substance / API', 'Target Concentration', 'Pharmaceutical Vehicle', 'Prescribed Quantity']],
        body: formulaRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 54, 102], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 55, fontStyle: 'bold' },
          2: { cellWidth: 40 },
          3: { cellWidth: 45 },
          4: { cellWidth: 32, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });

      const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : 140;

      // Posology & Instructions Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, finalY, 182, 34, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, finalY, 182, 34, 2, 2, 'S');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 54, 102);
      doc.text('POSOLOGY & SPECIAL COMPOUNDING INSTRUCTIONS:', 18, finalY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('• Dosage & Application: Apply exactly 1.0 ml once daily to affected dry scalp area. Gently massage for 60 seconds.', 18, finalY + 12);
      doc.text('• Packaging & Course: N3 = 3-month continuous supply (3 x 100ml amber dropper bottles with calibrated pipettes).', 18, finalY + 17);
      doc.text('• Storage & Handling: Store protected from direct sunlight at 2°C – 8°C (refrigerated). Do not freeze.', 18, finalY + 22);
      doc.text('• Quality Standard: Prepared according to European Pharmacopoeia (Ph. Eur.) & USP magistral compounding standards.', 18, finalY + 27);

      // Signatures
      const signY = finalY + 44;
      doc.setDrawColor(203, 213, 225);
      doc.line(14, signY + 20, 90, signY + 20);
      doc.line(120, signY + 20, 196, signY + 20);

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Prescribing Physician Signature & Medical Stamp', 14, signY + 25);
      doc.text(`${rx.doctorName || 'Dr. Hanieh Erdmann'} • DHA-00013060-006`, 14, signY + 29);

      doc.text('Dispensing Pharmacist / Quality Assurance Sign-Off', 120, signY + 25);
      doc.text('Med-Peptides Analytical Verification • Batch Accredited', 120, signY + 29);

      doc.save(`Magistral_Protocol_${rx.code || rx.prescriptionNumber || rx.id}.pdf`);
    } catch (err) {
      console.error('Failed to generate Magistral Rx PDF:', err);
      notifier.error('Failed to generate Compounding Sheet PDF.');
    } finally {
      setGeneratingPdfRxId(null);
    }
  };

  const handleConvertRxToOrder = async (rx) => {
    setConvertingRxId(rx.id);
    try {
      const res = await fetch('/api/orders/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: effectiveClinic.name || 'Bedaya Polyclinic L.L.C.',
          customerEmail: effectiveClinic.email || 'info@bedayaclinic.ae',
          customerPhone: effectiveClinic.phone || '+971 4 333 3955',
          customerAddress: resolvedAddress,
          customerNotes: `Converted from Prescription Ref #${rx.code || rx.id} for Patient ${rx.patientName || 'Matin Rahim Delavar Rafiei'} (PIN: ${rx.patientPin || '11774'}). Prescribed by ${rx.doctorName || 'Dr. Hanieh Erdmann'}.`,
          shippingDestination: 'United Arab Emirates',
          shippingCode: 'DXB',
          shippingCost: 0,
          currency: 'USD',
          currencySymbol: '$',
          cartItems: [
            {
              id: 'magistral-hair-rx-n3',
              name: 'Magistral Formula: Latanoprost + Estradiol + IGrantine-F1 in TrichoSol (3x 100ml)',
              productName: 'Magistral Formula: Latanoprost + Estradiol + IGrantine-F1 in TrichoSol (3x 100ml)',
              dosage: '3-Month Supply (N3)',
              presentation: 'Amber Glass Bottle 100ml',
              quantity: 1,
              price: 285.0,
              tier10UnitPrice: 240.0,
              posology: '1.0 ml once daily application to dry scalp at bedtime',
              apiItems: rx.apiItems || rx.items || [
                {
                  name: 'Latanoprost Fagron',
                  genericName: 'Latanoprost Pure API',
                  role: 'Prostaglandin F2α Analogue (Anagen Phase Induction)',
                  concentration: '0.005% (50 mcg/ml)',
                  totalBatchMass: '15 mg (3x 100ml)',
                  grade: 'Ph.Eur / USP Micronized'
                },
                {
                  name: '17-α-Estradiol',
                  genericName: 'Alfatradiol (Fagron)',
                  role: 'Estrogen Receptor Modulator (Aromatase Activator & 5AR Inhibition)',
                  concentration: '0.05% (500 mcg/ml)',
                  totalBatchMass: '150 mg (3x 100ml)',
                  grade: 'Ph.Eur Micronized'
                },
                {
                  name: 'IGrantine-F1™',
                  genericName: 'Bioactive Decapeptide Complex',
                  role: 'Wnt/β-Catenin Signaling & Dermal Papilla Proliferation',
                  concentration: '0.50% (5 mg/ml)',
                  totalBatchMass: '1,500 mg (3x 100ml)',
                  grade: 'Biotech Synthetic >98%'
                },
                {
                  name: 'TrichoSol™ Scalp Carrier',
                  genericName: 'TrichoSol Compounding Solution',
                  role: 'Patented Phyto-Lipidic Scalp Vehicle (Ethanol & PPG-free)',
                  concentration: 'q.s. 100 ml',
                  totalBatchMass: '300 ml (3x 100ml)',
                  grade: 'Fagron TrichoTech Standard'
                }
              ]
            }
          ],
          subtotal: 285.0,
          grandTotal: 285.0,
          totalUnits: 3,
          source: 'clinic_prescription_conversion'
        })
      });

      const data = await res.json();
      if (res.ok && data.orderCode) {
        setConvertedOrders(prev => ({ ...prev, [rx.id]: data.orderCode }));
        notifier.success(`Order Draft created: ${data.orderCode}`);
      } else {
        notifier.error(data.error || 'Failed to convert prescription to order.');
      }
    } catch (e) {
      console.error('Error converting Rx to order:', e);
      notifier.error('Network error while converting prescription to order.');
    } finally {
      setConvertingRxId(null);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {/* ── Fixed Header ── */}
      <div
        style={{
          flexShrink: 0,
          padding: '16px 20px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Left: Avatar & Titles */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0 }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {(effectiveClinic.name || 'CL').substring(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {effectiveClinic.name}
              </h1>
              {effectiveClinic.arabicName && (
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', direction: 'rtl' }}>
                  {effectiveClinic.arabicName}
                </span>
              )}
              <StatusChip status={effectiveClinic.status || 'approved'} />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}
              >
                {effectiveClinic.tier || 'Standard'} Tier
              </span>
            </div>
            {/* Metadata Subtitle Row (No Text Overlap) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
                flexWrap: 'wrap'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="#64748b" /> {effectiveClinic.city || effectiveClinic.territory || 'Dubai, UAE'}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Briefcase size={13} color="#64748b" /> {effectiveClinic.network || 'Independent Practice'}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Clinic ID: <CopyableId value={effectiveClinic.id} />
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={loadBundle}
            className="gcp-btn-secondary"
            style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
            title="Refresh Real-time Bundle Data"
          >
            <RefreshCw size={14} className={loadingBundle ? 'spin' : ''} />
            <span className="hide-mobile">Refresh</span>
          </button>
          <button
            onClick={() => {
              const { setWorkspaceIntent, setTargetEntity, setDrawerOpen, activeWorkspaceId } = useWorkspaceStore.getState();
              setWorkspaceIntent('sell', activeWorkspaceId);
              setTargetEntity(activeWorkspaceId, {
                id: effectiveClinic.id,
                name: effectiveClinic.name,
                type: 'clinic'
              });
              setDrawerOpen(true);
              notifier.success(`Configured Workspace for Clinic "${effectiveClinic.name}"!`);
            }}
            className="gcp-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontSize: '0.78rem', padding: '7px 12px' }}
            title="Create B2B Quote in Workspace (⌥W)"
          >
            <Briefcase size={14} /> Quote in Workspace
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="gcp-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd', fontSize: '0.78rem', padding: '7px 12px' }}
          >
            <FileUp size={14} /> Import Rx
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            title="Cerrar panel (Esc)"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e2e8f0)',
              backgroundColor: '#ffffff',
              color: '#64748b',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Scrollable Body with Accordions ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        
        {/* 4 KPI Metric Summary Cards (2x2 Grid on Laptop and Mobile) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {/* Volume */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={16} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attributed Vol.</span>
            </div>
            {loadingBundle ? (
              <Skeleton height="24px" width="100px" />
            ) : (
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e40af' }}>
                ${(stats.monthlyVolume || 0).toLocaleString()}
              </div>
            )}
          </div>

          {/* Active Patients */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Patients</span>
            </div>
            {loadingBundle ? (
              <Skeleton height="24px" width="60px" />
            ) : (
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                {stats.activePatients || 0}
              </div>
            )}
          </div>

          {/* Physicians */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={16} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Physicians</span>
            </div>
            {loadingBundle ? (
              <Skeleton height="24px" width="60px" />
            ) : (
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0e7490' }}>
                {physicians.length}
              </div>
            )}
          </div>

          {/* Prescriptions & Orders */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={16} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prescriptions</span>
            </div>
            {loadingBundle ? (
              <Skeleton height="24px" width="80px" />
            ) : (
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7e22ce' }}>
                {recentPrescriptions.length} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b21a8' }}>({recentOrders.length} Orders)</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Toolbar: Focus Mode & Collapse All ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 2px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Institutional Profile & Clinical Operations
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Single-section focus
            </span>
            <button
              type="button"
              onClick={collapseAll}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                color: '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '3px 8px'
              }}
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* ── Accordion 1: Practice & Contact Info ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('practice')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.practice ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.practice ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={18} color="#2563eb" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                🏥 Clinical Practice & Contact Information
              </span>
            </div>
            {openSections.practice ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.practice && (
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Physical Address</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{resolvedAddress}</div>
                  {effectiveClinic.poBox && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>PO Box: {effectiveClinic.poBox}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Phone & Direct Line</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>
                    {effectiveClinic.phone ? (
                      <a href={`tel:${effectiveClinic.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        📞 {effectiveClinic.phone}
                      </a>
                    ) : 'No phone specified'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Digital Portal & Web</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>
                    {effectiveClinic.website ? (
                      <a href={effectiveClinic.website.startsWith('http') ? effectiveClinic.website : `https://${effectiveClinic.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                        🌐 {effectiveClinic.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>No website specified</span>
                    )}
                  </div>
                  {effectiveClinic.email && (
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      <a href={`mailto:${effectiveClinic.email}`} style={{ color: '#0284c7' }}>
                        📧 {effectiveClinic.email}
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Jurisdiction & Network</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                    {effectiveClinic.city || 'Dubai'} • {effectiveClinic.country || 'United Arab Emirates'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Network: {effectiveClinic.network || 'Independent Specialist Clinic'}
                  </div>
                </div>
              </div>

              {/* Commercial Insights Pills */}
              <div style={{ backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd', padding: '12px 14px', marginTop: '4px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Commercial Intelligence & Pricing Tier
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(effectiveClinic.insights || ["Verified Practice • Ready for direct institutional orders.", "B2B Discount tier active."]).map((insight, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.8rem', color: '#0c4a6e' }}>
                      <Navigation size={13} color="#0284c7" style={{ flexShrink: 0 }} />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Accordion 2: Assigned Physicians ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('physicians')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.physicians ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.physicians ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Stethoscope size={18} color="#0891b2" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                🩺 Assigned Physicians & Practitioners ({physicians.length})
              </span>
            </div>
            {openSections.physicians ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.physicians && (
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Accredited physicians prescribing under this clinic licence
                </span>
                <button className="gcp-btn-secondary" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                  + Invite Physician
                </button>
              </div>

              {loadingBundle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Skeleton height="50px" width="100%" />
                </div>
              ) : physicians.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
                  <Stethoscope size={28} style={{ opacity: 0.35, margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>No physicians assigned yet</p>
                  <span style={{ fontSize: '0.75rem' }}>Invite medical practitioners to prescribe under this clinic.</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                  {physicians.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            flexShrink: 0
                          }}
                        >
                          {(doc.name || doc.displayName || 'DR').substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            {doc.name || doc.displayName || doc.email}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
                            {doc.speciality || doc.title || 'Dermatology & Hair Restoration'}
                          </div>
                        </div>
                        <StatusChip status="active" />
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '6px', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {doc.dhaLicense && (
                          <div>📋 <strong>DHA Registration:</strong> <code>{doc.dhaLicense}</code></div>
                        )}
                        {doc.germanMedicalId && (
                          <div>🇩🇪 <strong>Arztausweis:</strong> {doc.germanMedicalId} ({doc.germanChamber || 'Schleswig-Holstein'})</div>
                        )}
                        {doc.email && (
                          <div>📧 <a href={`mailto:${doc.email}`} style={{ color: '#2563eb' }}>{doc.email}</a></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Accordion 3: Active Prescriptions ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('prescriptions')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.prescriptions ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.prescriptions ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} color="#9333ea" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                📋 Active Prescriptions & Formulations ({recentPrescriptions.length})
              </span>
            </div>
            {openSections.prescriptions ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.prescriptions && (
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* ── API Query & Filter Bar ── */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.9rem' }}>🔬</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      API Query & Active Substance Filter
                    </span>
                  </div>
                  {selectedApiQuery !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setSelectedApiQuery('ALL')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Clear API Filter ✕
                    </button>
                  )}
                </div>

                {/* API Filter Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedApiQuery('ALL')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      backgroundColor: selectedApiQuery === 'ALL' ? '#003666' : '#ffffff',
                      color: selectedApiQuery === 'ALL' ? '#ffffff' : '#475569',
                      borderColor: selectedApiQuery === 'ALL' ? '#003666' : '#cbd5e1'
                    }}
                  >
                    All Formulations ({recentPrescriptions.length})
                  </button>

                  {clinicApis.map(({ name, count }) => {
                    const isSelected = selectedApiQuery.toLowerCase() === name.toLowerCase();
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSelectedApiQuery(isSelected ? 'ALL' : name)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '99px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid',
                          backgroundColor: isSelected ? '#2563eb' : '#eff6ff',
                          color: isSelected ? '#ffffff' : '#1d4ed8',
                          borderColor: isSelected ? '#2563eb' : '#bfdbfe',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>💊 {name}</span>
                        <span style={{
                          fontSize: '0.66rem',
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#dbeafe',
                          color: isSelected ? '#ffffff' : '#1e40af',
                          padding: '1px 5px',
                          borderRadius: '99px'
                        }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Cumulative Consumption Intelligence Strip */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Latanoprost API</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#003666', marginTop: '2px' }}>
                      {clinicApiConsumption['Latanoprost'].totalMg} mg
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#16a34a' }}>0.005% • 3x 100ml</div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>17-α-Estradiol API</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#003666', marginTop: '2px' }}>
                      {clinicApiConsumption['17-α-Estradiol'].totalMg} mg
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#16a34a' }}>0.05% • 3x 100ml</div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>IGrantine-F1 Peptide</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#7e22ce', marginTop: '2px' }}>
                      {clinicApiConsumption['IGrantine-F1'].totalMg} mg
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#9333ea' }}>0.50% • Bioactive</div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TrichoSol Vehicle</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                      {clinicApiConsumption['TrichoSol'].totalMl} ml
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#0284c7' }}>Phyto-Lipidic Base</div>
                  </div>
                </div>
              </div>

              {loadingBundle ? (
                <Skeleton height="60px" width="100%" />
              ) : displayedPrescriptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
                  <FileText size={28} style={{ opacity: 0.35, margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>No prescriptions match active API query</p>
                  <button
                    type="button"
                    onClick={() => { setSelectedApiQuery('ALL'); setApiSearchTerm(''); }}
                    style={{
                      marginTop: '6px',
                      background: 'none',
                      border: '1px solid #cbd5e1',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      color: '#003666',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Reset API Query Filters
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {displayedPrescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      style={{
                        padding: '14px 16px',
                        border: '1px solid #e9d5ff',
                        borderRadius: '12px',
                        backgroundColor: '#faf5ff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#6b21a8' }}>
                            {rx.code || rx.prescriptionNumber || rx.id}
                          </span>
                          <StatusChip status={rx.status || 'approved'} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#7e22ce' }}>
                          📅 {rx.date || 'Recent'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#1e293b' }}>
                        <strong>Patient:</strong> {rx.patient?.name || rx.patientName || 'Clinical Patient'}
                        {rx.patient?.pin && <span style={{ color: '#64748b' }}> (PIN: {rx.patient.pin})</span>}
                        <span style={{ marginLeft: '12px', color: '#64748b' }}>
                          • Prescribed by: <strong>{rx.doctorName || 'Dr. Hanieh Erdmann'}</strong>
                        </span>
                      </div>

                      {/* ── Structured API Composition View ── */}
                      <StructuredApiCompositionView
                        rx={rx}
                        onQueryApi={(apiName) => {
                          setSelectedApiQuery(apiName);
                          notifier.info(`Filtered for API substance: ${apiName}`);
                        }}
                      />

                      {/* Action buttons: Convert to Order & Compounding Protocol PDF */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f3e8ff', marginTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleGenerateMagistralPdf(rx)}
                            disabled={generatingPdfRxId === rx.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #c084fc',
                              color: '#7e22ce',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            📄 {generatingPdfRxId === rx.id ? 'Generating...' : 'Compounding Protocol (PDF)'}
                          </button>

                          {convertedOrders[rx.id] ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#15803d', backgroundColor: '#f0fdf4', padding: '5px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                              ✓ Order Draft: <strong>{convertedOrders[rx.id]}</strong>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConvertRxToOrder(rx)}
                              disabled={convertingRxId === rx.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: '#2563eb',
                                border: '1px solid #1d4ed8',
                                color: '#ffffff',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              🛒 {convertingRxId === rx.id ? 'Converting...' : 'Convert to Order (1-Click)'}
                            </button>
                          )}
                        </div>

                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Fagron Genomics Certified Formula
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Accordion 4: Account Hierarchy & Relationships ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('commercial')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.commercial ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.commercial ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={18} color="#d97706" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                🏢 Account Management & Relationship Hierarchy
              </span>
            </div>
            {openSections.commercial ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.commercial && (
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <GlobalRelationshipPanel
                    clinic={effectiveClinic}
                    manager={manager}
                    activeEntity="clinic"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <RevenueWidget entityId={effectiveClinic.id} entityType="clinic" />
                  <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Users size={16} color="#16a34a" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Enrolled Patient Roster
                      </span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                      {stats.activePatients || 0} Patients Linked
                    </div>
                    <button className="gcp-btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}>
                      View Full Patient Roster
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Accordion 5: Wholesale & Commercial Orders ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('orders')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.orders ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.orders ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={18} color="#16a34a" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                🛒 Commercial & Wholesale Orders ({recentOrders.length})
              </span>
            </div>
            {openSections.orders ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.orders && (
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Wholesale shipments, drafts, and invoices for this clinic
                </span>
                <button className="gcp-btn-primary" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                  + Create Wholesale Order
                </button>
              </div>

              {loadingBundle ? (
                <Skeleton height="60px" width="100%" />
              ) : recentOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
                  <ShoppingCart size={28} style={{ opacity: 0.35, margin: '0 auto 6px' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>No orders recorded for this clinic</p>
                  <span style={{ fontSize: '0.75rem' }}>Orders placed via B2B quotations will be tracked here.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recentOrders.map(order => (
                    <div
                      key={order.id}
                      style={{
                        padding: '10px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.825rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Order #{order.id}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'} • {order.items?.length || 1} items
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <StatusChip status={order.status || 'processing'} />
                        <span style={{ fontWeight: 800 }}>${(order.totalAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Accordion 6: Activity Timeline & Communications ── */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
          <button
            type="button"
            onClick={() => toggleSection('timeline')}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: openSections.timeline ? '#f8fafc' : '#ffffff',
              border: 'none',
              borderBottom: openSections.timeline ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="#64748b" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                ⏱️ Activity Timeline & Communications Hub
              </span>
            </div>
            {openSections.timeline ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
          </button>

          {openSections.timeline && (
            <div style={{ padding: '16px 18px' }}>
              <div style={{ marginBottom: '16px' }}>
                <UniversalTimeline entityId={clinic.id} entityType="clinic" />
              </div>
              <div style={{ minHeight: '350px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <CommunicationHub
                  entityId={clinic.id}
                  entityType="clinic"
                  entityName={effectiveClinic.name}
                  email={effectiveClinic.email}
                  phone={effectiveClinic.phone}
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Standard GCP Sticky Footer ── */}
      <div
        style={{
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
          zIndex: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.80rem', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{effectiveClinic.name}</span>
          <span>•</span>
          <span>Physicians: <strong style={{ color: '#15803d' }}>{physicians.length}</strong></span>
          <span>•</span>
          <span>Tier: <strong style={{ color: '#2563eb' }}>{effectiveClinic.tier || 'Standard'}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              const { setWorkspaceIntent, setTargetEntity, setDrawerOpen, activeWorkspaceId } = useWorkspaceStore.getState();
              setWorkspaceIntent('sell', activeWorkspaceId);
              setTargetEntity(activeWorkspaceId, {
                id: effectiveClinic.id,
                name: effectiveClinic.name,
                type: 'clinic'
              });
              setDrawerOpen(true);
              notifier.success(`Configured Workspace for Clinic "${effectiveClinic.name}"!`);
            }}
            className="gcp-btn-primary"
            style={{
              padding: '8px 20px',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Briefcase size={15} /> Quote in Workspace
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>

      <ImportPrescriptionModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        context={{ clinicId: effectiveClinic.id, clinicName: effectiveClinic.name }}
      />
    </div>
  );
}