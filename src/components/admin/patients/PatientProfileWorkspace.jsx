"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tabs, StatusChip, CopyableId } from '../../ui';
import styles from './PatientProfileWorkspace.module.css';
import UniversalPrescriptionsTable from '../../shared/UniversalPrescriptionsTable';
import PatientCalendar from './PatientCalendar';
import BiomarkersPanel from './BiomarkersPanel';
import TasksEngine from '../../shared/TasksEngine';
import CommunicationHub from '../../shared/CommunicationHub';
import { usePrescriptions } from '../../../hooks/admin/usePrescriptions';
import { useDrawer } from '../../../context/DrawerContext';
import { useWorkspaceStore } from '../../../stores/useWorkspaceStore';
import { useFirestoreCollection } from '../../../hooks/data/useFirestoreCollection';
import { X, User, Phone, Mail, Activity, FileText, ShoppingCart, FilePlus, AlertCircle, Clock, Calendar as CalendarIcon, ClipboardList, FlaskConical, Edit2, Check, Briefcase, ChevronDown, ChevronUp, Stethoscope, Building2, Tag, MoreVertical, MessageCircle, Sparkles } from '@/lib/icons';
import { linkPatientToUser, unlinkPatientFromUser, findLinkedUser } from '../../../services/patientLinkService';
import PatientLabelSheetModal from '../prescriptions/PatientLabelSheetModal';

import { patientRepository } from '../../../repositories/patientRepository';
import { UniversalForm } from '../../shared/UniversalFormDrawer';
import notifier from '../../../services/NotificationService';
import { logger } from '../../../utils/logger';

import EntityLink from '../../ui/EntityLink';
import ClinicPicker from './ClinicPicker';
import PhysicianPicker from './PhysicianPicker';
import { fetchPatientDetailsBundleAction } from '../../../actions/patientsActions';
import { useRoleAccess } from '../../../hooks/useRoleAccess';

// --- Portal Access Subcomponent ---
function PortalAccessPanel({ patient }) {
  const [linkedUser, setLinkedUser] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!patient?.id) return;
    setLoading(true);
    findLinkedUser(patient.id)
      .then(user => setLinkedUser(user))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patient?.id]);

  const handleSearchCandidates = async () => {
    setShowSearch(true);
    setLoading(true);
    try {
      const users = await findLinkedUser(patient.id, true);
      setCandidates(Array.isArray(users) ? users : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (user) => {
    setLinking(true);
    try {
      await linkPatientToUser(patient.id, user.id);
      setLinkedUser(user);
      setShowSearch(false);
      notifier.success(`Linked to user ${user.email || user.displayName}`);
    } catch (err) {
      notifier.error(err.message || 'Linking failed');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!linkedUser) return;
    setLinking(true);
    try {
      await unlinkPatientFromUser(patient.id, linkedUser.id);
      setLinkedUser(null);
      notifier.success('User unlinked from patient chart');
    } catch (err) {
      notifier.error(err.message || 'Unlink failed');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
          Patient Portal Access
        </h3>
        {linkedUser ? (
          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: 700 }}>
            Active Portal Account
          </span>
        ) : (
          <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 700 }}>
            Unlinked
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Checking portal status...</div>
      ) : linkedUser ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{linkedUser.displayName || linkedUser.email}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{linkedUser.email} · Role: {linkedUser.role || 'patient'}</div>
          </div>
          <button
            onClick={handleUnlink}
            disabled={linking}
            style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Unlink
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
            No auth user account linked to this patient registry record.
          </p>
          {!showSearch ? (
            <button
              onClick={handleSearchCandidates}
              style={{ fontSize: '0.78rem', color: 'var(--primary, #0d9488)', background: 'none', border: '1px solid var(--primary, #0d9488)', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontWeight: 700 }}
            >
              Search & Link User Account
            </button>
          ) : (
            <div>
              {candidates.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No matching user accounts found by email.</div>
              ) : (
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  {candidates.map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', backgroundColor: '#fff' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{u.displayName || u.email}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                      <button
                        onClick={() => handleLink(u)}
                        disabled={linking}
                        style={{ fontSize: '0.75rem', color: '#0d9488', background: 'none', border: '1px solid #0d9488', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Link
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Main Patient Profile Workspace ---
export default function PatientProfileWorkspace({ patient: initialPatient, initialTab: propInitialTab, onClose, readOnly = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab = propInitialTab || searchParams?.get('tab') || 'overview';

  const { is, role } = useRoleAccess();
  const isDoctor = role === 'doctor' || is('doctor') || pathname?.startsWith('/doctor');
  const isCommercial = role === 'admin' || is('admin') || role === 'wholesaler' || is('wholesaler');
  const canEditCareTeam = !readOnly && !isDoctor && (is('admin') || role === 'admin' || is('medical_director'));

  const [activeTab, setActiveTab] = useState(initialTab);
  const { openDrawer } = useDrawer();
  const [patient, setPatient] = useState(initialPatient || {});
  const [serverBundle, setServerBundle] = useState(null);
  const [isEditingCareTeam, setIsEditingCareTeam] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  useEffect(() => {
    if (initialPatient) {
      setPatient(initialPatient);
    }
  }, [initialPatient]);

  // Load server-accelerated data bundle
  useEffect(() => {
    const patientId = initialPatient?.id || patient?.id;
    if (!patientId) return;

    let isMounted = true;
    fetchPatientDetailsBundleAction(patientId).then(bundle => {
      if (isMounted && bundle) {
        setServerBundle(bundle);
        if (bundle.patient) {
          setPatient(prev => ({ ...bundle.patient, ...prev }));
        }
      }
    }).catch(err => {
      console.warn('[PatientProfileWorkspace] bundle load error:', err);
    });

    return () => { isMounted = false; };
  }, [initialPatient?.id, patient?.id]);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const patientSchema = [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'text', required: false },
    { name: 'age', label: 'Age', type: 'text', required: false },
    { name: 'gender', label: 'Gender', type: 'select', options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }] },
    { name: 'country', label: 'Country / City', type: 'text', required: false },
    { name: 'nationalId', label: 'National ID / Emirates ID', type: 'text', required: false },
    { name: 'address', label: 'Street Address', type: 'text', required: false },
    { name: 'notes', label: 'Clinical Intake Notes', type: 'textarea', required: false },
  ];

  const handleUpdatePatient = async (formData) => {
    try {
      if (!patient?.id) return;
      await patientRepository.updatePatient(patient.id, formData);
      setPatient((prev) => ({ ...prev, ...formData }));
      notifier.success('Patient chart updated successfully.');
    } catch (err) {
      logger.error('Failed to update patient details in PatientProfileWorkspace', { error: err.message });
      notifier.error('Failed to update patient details.');
      throw err;
    }
  };


  // Real data fetching for this patient (instant fallback from serverBundle)
  const { prescriptions: clientPrescriptions, loading: loadingPrescriptions } = usePrescriptions({
    whereConditions: [['patientId', '==', patient.id]],
    limitCount: 50,
  });

  const { data: clientOrders, isLoading: loadingOrders } = useFirestoreCollection('orders', {
    whereConditions: [['patientId', '==', patient.id]],
    orderByFields: [['createdAt', 'desc']],
    limitCount: 50,
  });

  const prescriptions = (clientPrescriptions && clientPrescriptions.length > 0) 
    ? clientPrescriptions 
    : (serverBundle?.prescriptions || []);

  const orders = (clientOrders && clientOrders.length > 0) 
    ? clientOrders 
    : (serverBundle?.orders || []);

  const displayName = patient?.name || `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() || patient?.email || 'Patient';
  const [openSections, setOpenSections] = useState({
    demographics: true,
    careTeam: false,
    prescriptions: false,
    orders: false,
    biomarkers: false,
    activity: false,
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => {
      const isCurrentlyOpen = prev[sec];
      return {
        demographics: !isCurrentlyOpen && sec === 'demographics',
        careTeam: !isCurrentlyOpen && sec === 'careTeam',
        prescriptions: !isCurrentlyOpen && sec === 'prescriptions',
        orders: !isCurrentlyOpen && sec === 'orders',
        biomarkers: !isCurrentlyOpen && sec === 'biomarkers',
        activity: !isCurrentlyOpen && sec === 'activity',
      };
    });
  };

  const collapseAll = () => {
    setOpenSections({
      demographics: false,
      careTeam: false,
      prescriptions: false,
      orders: false,
      biomarkers: false,
      activity: false,
    });
  };

  const expandAll = () => {
    setOpenSections({
      demographics: true,
      careTeam: true,
      prescriptions: true,
      orders: true,
      biomarkers: true,
      activity: true,
    });
  };

  return (
    <div className={styles.workspaceContainer}>
      {/* Clean Single Header */}
      <div className={styles.workspaceHeader}>
        <div className={styles.headerPatientInfo}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.15rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {displayName}
              </h1>
              <StatusChip status={patient.status || 'active'} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
              {patient.phone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Phone size={12} /> {patient.phone}
                </span>
              )}
              {patient.email && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mail size={12} /> {patient.email}
                </span>
              )}
              {patient.clinic && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#0369a1', fontWeight: 600 }}>
                  🏥 {patient.clinic}
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                ID: <CopyableId value={patient.id} />
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Action Buttons */}
        <div className={styles.desktopActions}>
          <button
            onClick={() => {
              openDrawer('rx-builder', 'new', {
                initialPatient: { id: patient.id, name: displayName, email: patient.email },
                sourceModule: 'patient-profile',
              });
            }}
            className="gcp-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#0d9488', borderColor: '#0d9488', fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}
          >
            <FilePlus size={14} /> New Prescription
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-ai-chat', { 
                detail: { 
                  mode: 'patient', 
                  moduleMode: 'patient',
                  productMode: false,
                  clearHistory: true,
                  context: { 
                    patientId: patient.id, 
                    name: displayName,
                    patientName: displayName,
                    clinic: patient.clinic || '',
                    physician: patient.physician || '',
                    mode: 'patient',
                    isPatientContext: true
                  } 
                } 
              }));
            }}
            className="gcp-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: '#0d9488', color: '#0d9488', fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}
            title="Ask Patient Copilot"
          >
            <Activity size={14} /> Ask Patient AI
          </button>

          <button
            onClick={() => {
              const { setWorkspaceIntent, setTargetEntity, setDrawerOpen, activeWorkspaceId } = useWorkspaceStore.getState();
              setWorkspaceIntent('sell', activeWorkspaceId);
              setTargetEntity(activeWorkspaceId, {
                id: patient.id,
                name: displayName,
                email: patient.email || '',
                type: 'patient'
              });
              setDrawerOpen(true);
              notifier.success(`Configured Workspace for Patient "${displayName}"!`);
            }}
            className="gcp-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}
            title="Stage and prescribe compounds in Workspace (⌥W)"
          >
            <Briefcase size={14} /> Stage
          </button>

          {isCommercial && (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
                  detail: {
                    type: 'patient',
                    patientId: patient.id,
                    patientName: displayName,
                    clinicName: patient.clinic || '',
                    doctorName: patient.physician || ''
                  }
                }));
              }}
              className="gcp-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}
              title="Create commercial quotation for this patient"
            >
              <FileText size={14} /> Create Quote
            </button>
          )}

          {!is('doctor') && role !== 'doctor' && (
            <button
              onClick={() => setIsLabelModalOpen(true)}
              className="gcp-btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#f0fdfa',
                color: '#0f766e',
                borderColor: '#99f6e4',
                fontSize: '0.8125rem',
                padding: '0.4rem 0.8rem',
                fontWeight: 600,
              }}
              title="Generate Pharmapolis A4 Stickers (7.5 × 4.5 cm) in PDF & PNG"
            >
              <Tag size={14} /> Stickers (7.5x4.5cm)
            </button>
          )}

          <button
            onClick={onClose}
            title="Close patient chart"
            style={{
              padding: '0.4rem',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className={styles.mobileActions}>
          <button
            onClick={() => {
              openDrawer('rx-builder', 'new', {
                initialPatient: { id: patient.id, name: displayName, email: patient.email },
                sourceModule: 'patient-profile',
              });
            }}
            className="gcp-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#0d9488', borderColor: '#0d9488', fontSize: '0.76rem', padding: '0.4rem 0.65rem' }}
          >
            <FilePlus size={13} /> Rx
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMobileActions(!showMobileActions)}
              style={{
                padding: '0.38rem 0.5rem',
                background: showMobileActions ? '#f1f5f9' : '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="More Actions"
            >
              <MoreVertical size={16} />
            </button>

            {showMobileActions && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '200px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.18)',
                  padding: '6px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <button
                  onClick={() => {
                    setShowMobileActions(false);
                    window.dispatchEvent(new CustomEvent('open-ai-chat', { 
                      detail: { 
                        mode: 'patient', 
                        moduleMode: 'patient', 
                        clearHistory: true, 
                        context: { patientId: patient.id, name: displayName, clinic: patient.clinic, physician: patient.physician } 
                      } 
                    }));
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'none', border: 'none', borderRadius: '6px', fontSize: '0.80rem', color: '#0d9488', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}
                >
                  <Activity size={14} /> Ask Patient AI
                </button>
                <button
                  onClick={() => {
                    setShowMobileActions(false);
                    const { setWorkspaceIntent, setTargetEntity, setDrawerOpen, activeWorkspaceId } = useWorkspaceStore.getState();
                    setWorkspaceIntent('sell', activeWorkspaceId);
                    setTargetEntity(activeWorkspaceId, { id: patient.id, name: displayName, email: patient.email || '', type: 'patient' });
                    setDrawerOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'none', border: 'none', borderRadius: '6px', fontSize: '0.80rem', color: '#1d4ed8', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}
                >
                  <Briefcase size={14} /> Stage in Workspace
                </button>
                {isCommercial && (
                  <button
                    onClick={() => {
                      setShowMobileActions(false);
                      window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
                        detail: { type: 'patient', patientId: patient.id, patientName: displayName, clinicName: patient.clinic || '', doctorName: patient.physician || '' }
                      }));
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'none', border: 'none', borderRadius: '6px', fontSize: '0.80rem', color: 'var(--text-main)', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}
                  >
                    <FileText size={14} /> Create Quote
                  </button>
                )}
                {!is('doctor') && role !== 'doctor' && (
                  <button
                    onClick={() => {
                      setShowMobileActions(false);
                      setIsLabelModalOpen(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'none', border: 'none', borderRadius: '6px', fontSize: '0.80rem', color: '#0f766e', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}
                  >
                    <Tag size={14} /> Print Stickers
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            title="Close patient chart"
            style={{
              padding: '0.38rem',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainLayout}>
        <div className={styles.contentArea} style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          
          {/* ── Compact Metrics Strip (Desktop Row, Mobile 2x2 Grid) ── */}
          <div className={styles.metricsStrip}>
            <div className={styles.metricItem}>
              <div className={styles.metricItemLabel}>
                <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={12} />
                </div>
                <span>Prescriptions:</span>
              </div>
              <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#1e40af', backgroundColor: '#eff6ff', padding: '1px 6px', borderRadius: '6px' }}>
                {prescriptions.length} Protocol{prescriptions.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricItemLabel}>
                <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShoppingCart size={12} />
                </div>
                <span>Dispensations:</span>
              </div>
              <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#15803d', backgroundColor: '#f0fdf4', padding: '1px 6px', borderRadius: '6px' }}>
                {orders.length} Order{orders.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricItemLabel}>
                <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Stethoscope size={12} />
                </div>
                <span>Attending:</span>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0e7490', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {patient.physician || 'Direct Medical Desk'}
              </span>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricItemLabel}>
                <div style={{ width: '22px', height: '22px', borderRadius: '5px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Activity size={12} />
                </div>
                <span>Status:</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
                {patient.status || 'Active'} • Verified
              </span>
            </div>
          </div>

          {/* ── Toolbar: Focus Mode & Actions ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 2px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Patient Clinical Record & Operations
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={expandAll}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  color: '#475569',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 7px'
                }}
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  color: '#475569',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 7px'
                }}
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* ── Accordion 1: Demographics, Contact & Portal Access ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <button
              type="button"
              onClick={() => toggleSection('demographics')}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: openSections.demographics ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#003666', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Demographics, Contact & Portal Access
                  </div>
                  <div className={styles.accordionSubtitle}>
                    Personal identification, residential address, emergency phone, and portal linking
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                  Verified Record
                </span>
                {openSections.demographics ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>
            </button>

            {openSections.demographics && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                {/* ── Direct Patient Contact Shortcuts (Mobile-First) ── */}
                <div className={styles.contactChipsBar}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Contact:</span>
                  {patient.phone ? (
                    <>
                      <a
                        href={`tel:${patient.phone}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.74rem', fontWeight: 700, textDecoration: 'none' }}
                        title="Direct telephone call"
                      >
                        <Phone size={12} /> Call: {patient.phone}
                      </a>
                      <a
                        href={`https://wa.me/${patient.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', fontSize: '0.74rem', fontWeight: 700, textDecoration: 'none' }}
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic' }}>No phone logged</span>
                  )}
                  {patient.email ? (
                    <a
                      href={`mailto:${patient.email}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '0.74rem', fontWeight: 700, textDecoration: 'none' }}
                      title="Send email"
                    >
                      <Mail size={12} /> {patient.email}
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic' }}>No email logged</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {/* Left Column: Demographics Form */}
                  <div className={styles.infoCard}>
                    <UniversalForm
                      schema={patientSchema}
                      initialData={patient}
                      initialMode="view"
                      onSubmit={handleUpdatePatient}
                      submitLabel="Save Changes"
                      customHeader={
                        <h3
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <User size={16} /> Demographics & Identity
                        </h3>
                      }
                    />
                  </div>

                  {/* Right Column: Portal Link & AI Summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <PortalAccessPanel patient={patient} />
                    
                    <div className={styles.aiCard}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={16} /> Clinical Prescription Overview
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {prescriptions && prescriptions.length > 0 ? (
                          <>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                              <FileText size={14} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>
                                {prescriptions.length} active prescription(s) registered. Latest status: <strong>{prescriptions[0]?.status || 'Active'}</strong>.
                              </span>
                            </div>
                            <button
                              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.25rem' }}
                              onClick={() => {
                                window.dispatchEvent(new CustomEvent('open-ai-chat', { 
                                  detail: { 
                                    mode: 'patient', 
                                    context: { 
                                      patientId: patient.id, 
                                      name: displayName,
                                      clinic: patient.clinic,
                                      prescriptionCount: prescriptions.length,
                                      lastPrescriptionStatus: prescriptions[0]?.status
                                    } 
                                  } 
                                }));
                              }}
                            >
                              <Activity size={14} /> Open AI Clinical Analysis
                            </button>
                          </>
                        ) : (
                          <>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                              <AlertCircle size={14} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>
                                No active prescriptions logged. You can draft an initial protocol.
                              </span>
                            </div>
                            <button
                              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.25rem' }}
                              onClick={() => openDrawer('rx-builder', 'new', { initialPatient: { id: patient.id, name: displayName, email: patient.email } })}
                            >
                              <FilePlus size={14} /> Create First Prescription
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Accordion 2: Clinic Assignment & Care Team ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <button
              type="button"
              onClick={() => toggleSection('careTeam')}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: openSections.careTeam ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Stethoscope size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Supervisory Doctor & Clinic Assignment
                  </div>
                  <div className={styles.accordionSubtitle}>
                    Assigned clinical center, supervisory practitioner, and direct medical responsibilities
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', backgroundColor: '#ecfeff', color: '#0e7490' }}>
                  {patient.clinic || 'Affiliated Clinic'}
                </span>
                {openSections.careTeam ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>
            </button>

            {openSections.careTeam && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Care Team Configuration
                  </h4>
                  {canEditCareTeam && (
                    <button
                      type="button"
                      onClick={() => setIsEditingCareTeam(!isEditingCareTeam)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        color: isEditingCareTeam ? '#dc2626' : '#0284c7',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      {isEditingCareTeam ? <><X size={12} /> Done</> : <><Edit2 size={12} /> Edit Care Team Assignment</>}
                    </button>
                  )}
                </div>

                {isEditingCareTeam ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>Primary Clinic</label>
                      <ClinicPicker
                        value={patient.clinicId || patient.clinic}
                        clinicName={patient.clinic}
                        onChange={async (selected) => {
                          if (selected) {
                            await handleUpdatePatient({
                              clinicId: selected.clinicId || '',
                              clinic: selected.clinicName || '',
                              clinicName: selected.clinicName || ''
                            });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>Attending Physician</label>
                      <PhysicianPicker
                        value={patient.physicianId || patient.physician}
                        physicianName={patient.physician}
                        clinicFilter={patient.clinicId || patient.clinic}
                        onChange={async (selected) => {
                          if (selected) {
                            await handleUpdatePatient({
                              physicianId: selected.physicianId || '',
                              physician: selected.physicianName || '',
                              physicianName: selected.physicianName || ''
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    {patient.clinic && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                        🏥 {patient.clinic}
                      </span>
                    )}
                    {patient.physicianId ? (
                      <EntityLink type="physician" id={patient.physicianId} label={patient.physician || 'View Primary Doctor'} size="md" />
                    ) : patient.physician ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                        🩺 {patient.physician}
                      </span>
                    ) : null}
                    {prescriptions && prescriptions.length > 0 && (
                      <EntityLink type="prescription" id={prescriptions[0].id} label={`Latest Rx: ${prescriptions[0].protocolName || 'View'}`} size="md" />
                    )}
                    {!patient.clinic && !patient.physician && (!prescriptions || prescriptions.length === 0) && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No clinic or doctor assigned yet</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Accordion 3: Prescriptions & Magistral Formulations ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <button
              type="button"
              onClick={() => toggleSection('prescriptions')}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: openSections.prescriptions ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Prescriptions & Magistral Formulations
                  </div>
                  <div className={styles.accordionSubtitle}>
                    Active compound formulations, API dosages, posology schedules, and dispensing status
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                  {prescriptions.length} Active Rx
                </span>
                {openSections.prescriptions ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>
            </button>

            {openSections.prescriptions && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => {
                      openDrawer('rx-builder', 'new', {
                        initialPatient: { id: patient.id, name: displayName, email: patient.email },
                        sourceModule: 'patient-profile',
                      });
                    }}
                    className="gcp-btn-primary"
                    style={{ fontSize: '0.80rem', padding: '5px 12px' }}
                  >
                    <FilePlus size={14} /> Create New Prescription
                  </button>
                </div>
                <UniversalPrescriptionsTable
                  patientId={patient.id}
                  title="Patient Prescriptions"
                  subtitle={`All authorized medical protocols issued for ${displayName}`}
                  hideHeader={true}
                  readOnly={readOnly}
                />
              </div>
            )}
          </div>

          {/* ── Accordion 4: Pharmacy Orders & Cold-Chain Delivery ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '8px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <button
              type="button"
              onClick={() => toggleSection('orders')}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: openSections.orders ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShoppingCart size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Pharmacy Orders & Insulated Logistics
                  </div>
                  <div className={styles.accordionSubtitle}>
                    Fulfilled pharmacy deliveries, cold-chain packaging (2-8°C), and tracking history
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', backgroundColor: '#f0fdf4', color: '#15803d' }}>
                  {orders.length} Dispensations
                </span>
                {openSections.orders ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>
            </button>

            {openSections.orders && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                {loadingOrders ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading pharmacy orders...</div>
                ) : orders && orders.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {orders.map((order) => (
                      <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>PO #{order.code || order.orderCode || order.id.slice(0, 8)}</span>
                            <CopyableId value={order.id} displayValue={order.id.slice(0, 8)} />
                          </div>
                          <StatusChip status={order.status || 'processing'} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.80rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span>Total: <strong>${order.total || order.amount || 0}</strong></span>
                          <span>Delivery: ❄️ 2-8°C Insulated Express</span>
                          <span>Date: {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem 0' }}>
                    No pharmacy orders logged yet for this patient.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Accordion 5: Lab Biomarkers & Clinical Diagnostics ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '8px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('biomarkers')}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: openSections.biomarkers ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FlaskConical size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Laboratory Biomarkers & Clinical Diagnostics
                  </div>
                  <div className={styles.accordionSubtitle}>
                    Chronological blood biomarkers, hormone profiles, and therapy progression analytics
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#faf5ff', color: '#7e22ce' }}>
                  Diagnostic Panel
                </span>
                {openSections.biomarkers ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>
            </button>

            {openSections.biomarkers && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
                <BiomarkersPanel 
                  patientId={patient.id} 
                  patientName={displayName} 
                  prescriptions={prescriptions || []} 
                />
              </div>
            )}
          </div>

          {/* ── Accordion 6: Appointments & Clinical Tasks ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '8px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('activity')}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: openSections.activity ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarIcon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Appointments & Clinical Action Items
                  </div>
                  <div className={styles.accordionSubtitle}>
                    Scheduled follow-up consultations, calendar events, and operational reminders
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fffbeb', color: '#b45309' }}>
                  Schedule & Tasks
                </span>
                {openSections.activity ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
              </div>
            </button>

            {openSections.activity && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <PatientCalendar 
                  patient={patient} 
                  prescriptions={prescriptions || []} 
                  orders={orders || []} 
                />
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border)', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Clinical Tasks & Reminders
                  </h4>
                  <div style={{ height: '360px' }}>
                    <TasksEngine entityId={patient.id} />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Mobile Sticky Bottom Action Bar (Thumb-Zone Optimization) ── */}
      <div className={styles.mobileBottomBar}>
        <button
          onClick={() => {
            openDrawer('rx-builder', 'new', {
              initialPatient: { id: patient.id, name: displayName, email: patient.email },
              sourceModule: 'patient-profile',
            });
          }}
          style={{
            flex: '1 1 60%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: '#0d9488',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '11px 14px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)'
          }}
        >
          <FilePlus size={15} /> Prescribe Protocol
        </button>

        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-ai-chat', { 
              detail: { 
                mode: 'patient', 
                moduleMode: 'patient',
                productMode: false,
                clearHistory: true,
                context: { 
                  patientId: patient.id, 
                  name: displayName,
                  patientName: displayName,
                  clinic: patient.clinic || '',
                  physician: patient.physician || '',
                  mode: 'patient',
                  isPatientContext: true
                } 
              } 
            }));
          }}
          style={{
            flex: '1 1 40%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: '#f0fdfa',
            color: '#0f766e',
            border: '1px solid #99f6e4',
            borderRadius: '10px',
            padding: '11px 12px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Sparkles size={14} /> Ask AI
        </button>
      </div>

      {/* Pharmapolis A4 Stickers Modal (7.5 × 4.5 cm) */}
      <PatientLabelSheetModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        patient={patient}
        prescriptions={clientPrescriptions || []}
      />
    </div>
  );
}

