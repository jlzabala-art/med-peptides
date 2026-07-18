"use client";

import React, { useState, useEffect } from 'react';

import { Tabs, StatusChip } from '../../ui';
import GlobalRelationshipPanel from '../../shared/GlobalRelationshipPanel';
import styles from './PatientProfileWorkspace.module.css';
import UniversalTimeline from '../../shared/UniversalTimeline';
import TasksEngine from '../../shared/TasksEngine';
import CommunicationHub from '../../shared/CommunicationHub';
import RevenueWidget from '../../shared/RevenueWidget';
import ClinicalTimeline from './ClinicalTimeline';
import { usePrescriptions } from '../../../hooks/admin/usePrescriptions';
import { useFirestoreCollection } from '../../../hooks/data/useFirestoreCollection';
import UniversalOrderBuilder from '../../shared/order-builder/UniversalOrderBuilder';
import { X, User, MapPin, Phone, Mail, Activity, FileText, ShoppingCart, ShieldPlus, Dna, Clock, MailOpen, AlertCircle, ShieldCheck, ShieldAlert, Search, ExternalLink } from '@/lib/icons';
import { linkPatientToUser, unlinkPatientFromUser, findLinkedUser } from '../../../services/patientLinkService';
import { db } from '../../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// --- Sub-components ---

function PatientJourney({ status }) {
  const steps = ['Lead', 'Assessment', 'Program', 'Follow-Up', 'Retention'];
  const currentIndex = steps.indexOf(status) > -1 ? steps.indexOf(status) : 2;

  return (
    <div className={styles.journeyContainer}>
      <h3
        style={{
          margin: '0 0 1rem 0',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          fontWeight: 800,
        }}
      >
        Clinical Journey
      </h3>
      <div className={styles.journeySteps}>
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '20px',
            right: '20px',
            height: '2px',
            backgroundColor: 'var(--border)',
            zIndex: 0,
            minWidth: '400px', // Ensures the line doesn't crush too small on horizontal scroll
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '20px',
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            height: '2px',
            backgroundColor: 'var(--primary)',
            zIndex: 0,
            transition: 'width 0.4s',
            minWidth: `${(currentIndex / (steps.length - 1)) * 400}px`,
          }}
        ></div>
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={step}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
                gap: '0.5rem',
                minWidth: '80px', // Ensures text has space when scrolling
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? 'var(--primary)' : 'var(--background)',
                  border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isCompleted && (
                  <div
                    style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white' }}
                  ></div>
                )}
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)',
                  textAlign: 'center',
                }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DigitalTwin({ patient }) {
  return (
    <div className={styles.digitalTwinCard}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: 'var(--text-main)',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Dna size={20} color="var(--primary)" /> Patient Digital Twin
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Live metabolic indicators and protocol adherence
          </p>
        </div>
        <div
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#1d4ed8',
              textTransform: 'uppercase',
            }}
          >
            Biological Age
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>
            {patient.age - 4} <span style={{ fontSize: '1rem', color: '#3b82f6' }}>yrs</span>
          </div>
        </div>
      </div>

      <div className={styles.metricGrid}>
        {/* Metric 1 */}
        <div
          style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px' }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            HbA1c
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            5.2% <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>↓ 0.3%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#f1f5f9',
              borderRadius: '2px',
              marginTop: '0.75rem',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '40%', height: '100%', backgroundColor: '#16a34a' }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px' }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            Testosterone (Free)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            14.2 <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>↑ 2.1</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#f1f5f9',
              borderRadius: '2px',
              marginTop: '0.75rem',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '70%', height: '100%', backgroundColor: '#16a34a' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px' }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            Inflammation (hs-CRP)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            0.8 <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>↓ 1.2</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#f1f5f9',
              borderRadius: '2px',
              marginTop: '0.75rem',
              overflow: 'hidden',
            }}
          >
            <div style={{ width: '20%', height: '100%', backgroundColor: '#16a34a' }}></div>
          </div>
        </div>
      </div>

      <div>
        <h3
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          Active Protocol Regimen
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            style={{
              padding: '1rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>Tirzepatide 5mg</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Weekly • Subcutaneous
              </div>
            </div>
            <div
              style={{
                padding: '4px 12px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Adherence: 100%
            </div>
          </div>
          <div
            style={{
              padding: '1rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>NAD+ 200mg</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Bi-Weekly • Subcutaneous
              </div>
            </div>
            <div
              style={{
                padding: '4px 12px',
                backgroundColor: '#fefce8',
                color: '#ca8a04',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Adherence: 80%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Portal Access Panel ---

function PortalAccessPanel({ patient, onLinked }) {
  const [linkedUser, setLinkedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);

  // Load linked user on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    findLinkedUser(patient)
      .then(u => { if (!cancelled) setLinkedUser(u); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [patient.id, patient.linkedUserId]);

  async function handleSearch() {
    if (!search.trim()) return;
    setSearching(true);
    try {
      // Search by displayName or email (basic Firestore contains-like via prefix)
      const snap = await getDocs(collection(db, 'users'));
      const term = search.trim().toLowerCase();
      const results = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u =>
          (u.displayName || '').toLowerCase().includes(term) ||
          (u.email || '').toLowerCase().includes(term)
        )
        .slice(0, 8);
      setCandidates(results);
    } finally {
      setSearching(false);
    }
  }

  async function handleLink(user) {
    setLinking(true);
    try {
      await linkPatientToUser(patient.id, user.id);
      setLinkedUser(user);
      setCandidates([]);
      setSearch('');
      if (onLinked) onLinked(user);
    } finally {
      setLinking(false);
    }
  }

  async function handleUnlink() {
    if (!linkedUser) return;
    if (!window.confirm(`Desvincular el acceso al portal de ${patient.name}?`)) return;
    setLinking(true);
    try {
      await unlinkPatientFromUser(patient.id, linkedUser.id);
      setLinkedUser(null);
    } finally {
      setLinking(false);
    }
  }

  const cardStyle = {
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '1.25rem',
    backgroundColor: 'var(--color-bg-surface)',
  };

  if (loading) return <div style={cardStyle}><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Checking portal access…</span></div>;

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldCheck size={16} /> Portal Access
      </h3>

      {linkedUser ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="var(--color-success)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{linkedUser.displayName || linkedUser.email}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{linkedUser.email} · {linkedUser.role}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href={`/admin/users?search=${encodeURIComponent(linkedUser.email)}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
            >
              <ExternalLink size={14} /> Ver en Users
            </a>
            <button
              onClick={handleUnlink}
              disabled={linking}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-danger)', background: 'none', border: '1px solid var(--color-danger)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
            >
              <ShieldAlert size={14} /> Desvincular
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldAlert size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sin acceso al portal vinculado.</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar usuario por nombre o email…"
              style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.85rem', outline: 'none', color: 'var(--text-main)', backgroundColor: 'var(--color-bg-app)' }}
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'white', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '6px', padding: '0.4rem 0.85rem', cursor: 'pointer', fontWeight: 600 }}
            >
              <Search size={14} /> {searching ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
          {candidates.length > 0 && (
            <div style={{ marginTop: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
              {candidates.map(u => (
                <div
                  key={u.id}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.displayName || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email} · {u.role}</div>
                  </div>
                  <button
                    onClick={() => handleLink(u)}
                    disabled={linking}
                    style={{ fontSize: '0.78rem', color: 'var(--primary)', background: 'none', border: '1px solid var(--primary)', borderRadius: '6px', padding: '0.25rem 0.6rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Vincular
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Main Workspace ---

export default function PatientProfileWorkspace({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Fetch transactions for this patient
  const { prescriptions, loading: loadingPrescriptions } = usePrescriptions({
    whereConditions: [['patientId', '==', patient.id]],
    limitCount: 20,
  });

  const { data: orders, isLoading: loadingOrders } = useFirestoreCollection('orders', {
    whereConditions: [['patientId', '==', patient.id]],
    orderByFields: [['createdAt', 'desc']],
    limitCount: 20,
  });

  // Mocks for relationships
  const mockPhysician = { id: 'phy_1', name: patient.physician };
  const mockClinic = { id: 'cln_1', name: patient.clinic };
  const mockManager = { id: 'mgr_1', name: patient.manager };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <PatientJourney status="Program" />
          <div className={styles.overviewGrid}>
            <div className={`${styles.infoCard} ${styles.colSpan4}`}>
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
                <User size={16} /> Basic Info
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Email
                  </div>
                  <div style={{ fontWeight: 600 }}>{patient.email}</div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Phone
                  </div>
                  <div style={{ fontWeight: 600 }}>{patient.phone || '—'}</div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    National ID
                  </div>
                  <div style={{ fontWeight: 600 }}>{patient.nationalId || '—'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Address
                  </div>
                  <div style={{ fontWeight: 600 }}>{patient.address || '—'}</div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Age / Gender
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {patient.age || '—'} / {patient.gender || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.aiCard} ${styles.colSpan8}`}>
              <h3
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#0369a1',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Activity size={16} /> AI Insights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={14} color="#0284c7" style={{ marginTop: '2px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>
                    Program compliance is high. Ready for peptide protocol up-sell.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Clock size={14} color="#0284c7" style={{ marginTop: '2px' }} />
                  <span style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>
                    Blood work is due in 14 days. Automated reminder scheduled.
                  </span>
                </div>
              </div>
            </div>
            
            {/* Relationship Graph inside Overview */}
            <div className={styles.colSpan12}>
              <GlobalRelationshipPanel
                patient={patient}
                physician={mockPhysician}
                clinic={mockClinic}
                manager={mockManager}
                activeEntity="patient"
              />
            </div>

            {/* Portal Access */}
            <div className={styles.colSpan12}>
              <PortalAccessPanel patient={patient} />
            </div>

            {/* Revenue and Risk Score */}
            <div className={styles.colSpan8} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <RevenueWidget entityId={patient.id} entityType="patient" />
            </div>

            
            <div className={`${styles.infoCard} ${styles.colSpan4}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  marginBottom: '0.5rem'
                }}
              >
                Overall Risk Score
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: patient.riskScore === 'High' ? 'var(--color-danger)' : 'var(--color-success)',
                }}
              >
                {patient.riskScore}
              </div>
            </div>

          </div>
        </div>
      ),
    },
    {
      id: 'records',
      label: 'Clinical Records',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: 0
                }}
              >
                <FileText size={16} /> Prescriptions
              </h3>
              <button 
                className="gcp-btn-primary" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => setIsBuilderOpen(true)}
              >
                New
              </button>
            </div>
            {loadingPrescriptions ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Loading prescriptions...
              </div>
            ) : prescriptions && prescriptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{rx.id.slice(0, 8)}</span>
                      <StatusChip status={rx.status || 'Active'} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {(rx.items || []).length} items prescribed
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No prescriptions found.
              </div>
            )}
          </div>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: '1.5rem',
            }}
          >
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
              <ShoppingCart size={16} /> Orders
            </h3>
            {loadingOrders ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Loading orders...
              </div>
            ) : orders && orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{order.id.slice(0, 8)}</span>
                      <StatusChip status={order.status || 'Processing'} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Total: ${order.total || order.amount || 0}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No orders found.
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'activity',
      label: 'Timeline',
      content: (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            padding: '2rem',
          }}
        >
          <ClinicalTimeline patientId={patient.id} patientName={patient.name} patientCreatedAt={patient.createdAt} />
        </div>
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      content: (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            height: '600px',
          }}
        >
          <TasksEngine entityId={patient.id} />
        </div>
      ),
    },
    {
      id: 'communications',
      label: 'Communications',
      content: (
        <div style={{ height: '600px' }}>
          <CommunicationHub
            entityId={patient.id}
            entityType="patient"
            entityName={patient.name}
            email={patient.email}
            phone={patient.phone}
          />
        </div>
      ),
    },
    {
      id: 'digital-twin',
      label: 'Digital Twin',
      content: <DigitalTwin patient={patient} />,
    },
    {
      id: 'programs',
      label: 'Programs',
      content: (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Program management view goes here.
        </div>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      content: (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Commercial order history goes here.
        </div>
      ),
    },
  ];

  return (
    <div className={styles.workspaceContainer}>
      {/* Header */}
      <div className={styles.workspaceHeader}>
        <div className={styles.headerPatientInfo}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'var(--color-bg-hover)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
            }}
          >
            {patient.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '0.25rem',
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                }}
              >
                {patient.name}
              </h1>
              <StatusChip status={patient.status} />
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} /> {patient.clinic}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Activity size={14} /> {patient.program}
              </span>
              <span>Patient ID: {patient.id}</span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className="gcp-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <MailOpen size={16} /> Contact
          </button>
          <button
            className="gcp-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ShoppingCart size={16} /> New Order
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainLayout}>
        <div className={styles.contentArea}>
          <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
        </div>
      </div>

      {isBuilderOpen && (
        <PrescriptionBuilder 
          onClose={() => setIsBuilderOpen(false)}
          onComplete={() => {
            setIsBuilderOpen(false);
          }}
          patient={patient}
        />
      )}
    </div>
  );
}
