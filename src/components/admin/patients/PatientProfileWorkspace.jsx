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
import { X, User, Phone, Mail, Activity, FileText, ShoppingCart, FilePlus, AlertCircle, Clock, Calendar as CalendarIcon, ClipboardList, FlaskConical, Edit2, Check, Briefcase } from '@/lib/icons';
import { linkPatientToUser, unlinkPatientFromUser, findLinkedUser } from '../../../services/patientLinkService';

import { patientRepository } from '../../../repositories/patientRepository';
import { UniversalForm } from '../../shared/UniversalFormDrawer';
import notifier from '../../../services/NotificationService';
import { logger } from '../../../utils/logger';

import EntityLink from '../../ui/EntityLink';
import ClinicPicker from './ClinicPicker';
import PhysicianPicker from './PhysicianPicker';
import { fetchPatientDetailsBundleAction } from '../../../actions/patientsActions';

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
export default function PatientProfileWorkspace({ patient: initialPatient, initialTab: propInitialTab, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab = propInitialTab || searchParams?.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(initialTab);
  const { openDrawer } = useDrawer();
  const [patient, setPatient] = useState(initialPatient || {});
  const [serverBundle, setServerBundle] = useState(null);
  const [isEditingCareTeam, setIsEditingCareTeam] = useState(false);

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

  const tabs = [
    {
      id: 'overview',
      label: 'Patient Profile & Clinical Info',
      icon: User,
      content: (
        <div className={styles.overviewGrid}>
          {/* Left Column: Demographics Form (colSpan5) */}
          <div className={styles.colSpan5} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                    <User size={16} /> Demographics & Contact
                  </h3>
                }
              />
            </div>

            {/* Portal Link */}
            <PortalAccessPanel patient={patient} />
          </div>

          {/* Right Column: Clinical Status, Care Team & AI Summary (colSpan7) */}
          <div className={styles.colSpan7} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Care Team & Clinic Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  Clinic Assignment & Care Team
                </h3>
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
                    fontWeight: 600
                  }}
                >
                  {isEditingCareTeam ? <><X size={12} /> Done</> : <><Edit2 size={12} /> Edit Assignment</>}
                </button>
              </div>

              {isEditingCareTeam ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
                  {patient.clinic && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                      🏥 {patient.clinic}
                    </span>
                  )}
                  {patient.physicianId ? (
                    <EntityLink type="physician" id={patient.physicianId} label={patient.physician || 'View Primary Doctor'} size="md" />
                  ) : patient.physician ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
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

            {/* AI Clinical Summary & Active Status */}
            <div className={styles.aiCard}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={16} /> Clinical Prescription Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {prescriptions && prescriptions.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <FileText size={14} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>
                        {prescriptions.length} prescription(s) registered. Last on {prescriptions[0]?.createdAt?.seconds ? new Date(prescriptions[0].createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}.
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <Clock size={14} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>
                        Current status: <strong>{prescriptions[0]?.status || 'pending'}</strong>.
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
                        No prescriptions on record. You can draft an initial protocol.
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
      ),
    },
    {
      id: 'records',
      label: 'Prescriptions & Orders',
      icon: FileText,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Universal Prescriptions Table */}
          <UniversalPrescriptionsTable
            patientId={patient.id}
            title="Prescriptions"
            subtitle={`All medical prescriptions on file for ${displayName}`}
            hideHeader={false}
            readOnly={false}
          />

          {/* Real Pharmacy Orders */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={16} /> Pharmacy Orders & Tracking
            </h3>
            {loadingOrders ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading orders...</div>
            ) : orders && orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.map((order) => (
                  <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <CopyableId value={order.id} displayValue={order.id.slice(0, 8)} />
                      <StatusChip status={order.status || 'processing'} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Total: ${order.total || order.amount || 0} · Date: {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No pharmacy orders logged yet for this patient.
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'biomarkers',
      label: 'Lab & Biomarkers',
      icon: FlaskConical || Activity,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <BiomarkersPanel 
            patientId={patient.id} 
            patientName={displayName} 
            prescriptions={prescriptions || []} 
          />
        </div>
      ),
    },
    {
      id: 'activity',
      label: 'Appointments & Tasks',
      icon: CalendarIcon,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <PatientCalendar 
            patient={patient} 
            prescriptions={prescriptions || []} 
            orders={orders || []} 
          />
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Clinical Tasks & Reminders
            </h3>
            <div style={{ height: '400px' }}>
              <TasksEngine entityId={patient.id} />
            </div>
          </div>
        </div>
      ),
    },
  ];


  return (
    <div className={styles.workspaceContainer}>
      {/* Clean Single Header */}
      <div className={styles.workspaceHeader}>
        <div className={styles.headerPatientInfo}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '12px',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {displayName}
              </h1>
              <StatusChip status={patient.status || 'active'} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
              {patient.phone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={13} /> {patient.phone}
                </span>
              )}
              {patient.email && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={13} /> {patient.email}
                </span>
              )}
              {patient.clinic && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#0369a1', fontWeight: 600 }}>
                  🏥 {patient.clinic}
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                ID: <CopyableId value={patient.id} />
              </span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
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
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: '#0d9488', color: '#0d9488' }}
            title="Ask Patient Copilot"
          >
            <Activity size={15} /> Ask Patient AI
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
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
            title="Stage and prescribe compounds in Workspace (⌥W)"
          >
            <Briefcase size={15} /> Stage in Workspace
          </button>

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
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Create commercial quotation for this patient"
          >
            <FileText size={15} /> Create Quote
          </button>

          <button
            onClick={() => {
              openDrawer('rx-builder', 'new', {
                initialPatient: { id: patient.id, name: displayName, email: patient.email },
                sourceModule: 'patient-profile',
              });
            }}
            className="gcp-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0d9488', borderColor: '#0d9488' }}
          >
            <FilePlus size={15} /> New Prescription
          </button>

          <button
            onClick={onClose}
            title="Close patient chart"
            style={{
              padding: '0.45rem',
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
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainLayout}>
        <div className={styles.contentArea}>
          <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
        </div>
      </div>
    </div>
  );
}
