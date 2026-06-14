import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import User from "lucide-react/dist/esm/icons/user";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  createRelationship,
  getAllRelationships,
  updateRelationshipStatus,
} from '../../services/assignmentService';








import toast from 'react-hot-toast';
import notifier from '../../services/NotificationService';

// ─── helpers ────────────────────────────────────────────────────────────────
const displayName = (u) =>
  u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || u.id;

const statusBadge = (status) => {
  const map = {
    active: { bg: '#dcfce7', color: 'var(--color-success)', label: 'Active' },
    pending: { bg: '#fef9c3', color: '#a16207', label: 'Pending' },
    paused: { bg: '#e0f2fe', color: '#0369a1', label: 'Paused' },
    revoked: { bg: '#fee2e2', color: '#b91c1c', label: 'Revoked' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: 'var(--color-text-secondary)', label: status };
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '99px',
      }}
    >
      {s.label}
    </span>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminAssignPhysicianTab({ adminUid }) {
  const [users, setUsers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRels, setLoadingRels] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // form
  const [patientId, setPatientId] = useState('');
  const [doctorId, setPhysicianId] = useState('');
  const [notes, setNotes] = useState('');

  // ── fetch all users ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingUsers(true);
      try {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('AdminAssignPhysicianTab: fetch users', e);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  // ── fetch all relationships ───────────────────────────────────────────────
  async function fetchRels() {
    setLoadingRels(true);
    try {
      const all = await getAllRelationships();
      // sort newest first
      all.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setRelationships(all);
    } catch (e) {
      console.error('AdminAssignPhysicianTab: fetch rels', e);
    } finally {
      setLoadingRels(false);
    }
  };

  useEffect(() => {
    fetchRels();
  }, []);

  // ── derived lists ─────────────────────────────────────────────────────────
  const patients = users.filter((u) => u.role === 'patient' || (!u.role && !u.isPhysician));
  const doctors = users.filter((u) => u.role === 'doctor' || u.isPhysician);

  // ── assign ────────────────────────────────────────────────────────────────
  async function handleAssign(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!patientId || !doctorId) return setError('Select both a patient and a doctor.');
    if (patientId === doctorId) return setError('Patient and doctor must be different users.');
    setSaving(true);
    try {
      await createRelationship({
        patientId,
        doctorId,
        initiatedBy: adminUid,
        initiatedByRole: 'admin',
        notes,
        status: 'active', // admin creates directly as active
      });
      setSuccess('✅ Assignment created and activated.');
      setPatientId('');
      setPhysicianId('');
      setNotes('');
      await fetchRels();
    } catch (e) {
      setError(e.message || 'Error creating assignment.');
    } finally {
      setSaving(false);
    }
  };

  // ── revoke ────────────────────────────────────────────────────────────────
  async function handleRevoke(relId) {
    notifier.confirmCritical('Revoke this relationship?', async () => {
      try {
        await updateRelationshipStatus(relId, 'revoked');
        await fetchRels();
      } catch (e) {
        toast.error(e.message);
      }
    });
  };

  // ── name lookups ──────────────────────────────────────────────────────────
  const userName = (uid) => {
    const u = users.find((u) => u.id === uid);
    return u ? displayName(u) : uid;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="anim-slide-up"
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* ── Assign form ── */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h2
          style={{
            fontSize: '1.1rem',
            fontWeight: 900,
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Link2 size={18} color="var(--secondary)" /> Assign Physician to Patient
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Creates an active doctor-patient relationship immediately.
        </p>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            <AlertTriangle size={14} style={{ marginRight: 6 }} />
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: '#dcfce7',
              color: 'var(--color-success)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {success}
          </div>
        )}

        <form
          onSubmit={handleAssign}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Patient */}
            <div>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '0.4rem',
                }}
              >
                <User size={12} style={{ marginRight: 4 }} />
                PATIENT
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={loadingUsers}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.88rem',
                  backgroundColor: 'white',
                }}
              >
                <option value="">— Select patient —</option>
                {patients.map((u) => (
                  <option key={u.id} value={u.id}>
                    {displayName(u)}
                  </option>
                ))}
              </select>
            </div>

            {/* Physician */}
            <div>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: '0.4rem',
                }}
              >
                <Stethoscope size={12} style={{ marginRight: 4 }} />
                DOCTOR
              </label>
              <select
                value={doctorId}
                onChange={(e) => setPhysicianId(e.target.value)}
                disabled={loadingUsers}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.88rem',
                  backgroundColor: 'white',
                }}
              >
                <option value="">— Select doctor —</option>
                {doctors.map((u) => (
                  <option key={u.id} value={u.id}>
                    {displayName(u)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                display: 'block',
                marginBottom: '0.4rem',
              }}
            >
              NOTES (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. referred by clinic, protocol: BPC-157"
              style={{
                width: '100%',
                padding: '0.6rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.88rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving || !patientId || !doctorId}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: !patientId || !doctorId ? 0.5 : 1,
              }}
            >
              {saving ? <RefreshCw size={15} className="spin" /> : <CheckCircle2 size={15} />}
              {saving ? 'Assigning…' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Relationships table ── */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>All Assignments</h2>
          <button
            onClick={fetchRels}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {loadingRels ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</p>
        ) : relationships.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No assignments yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="gcp-table">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Patient', 'Physician', 'Status', 'Initiated By', 'Date', 'Notes', ''].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {relationships.map((rel) => (
                  <tr key={rel.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700 }}>
                      {userName(rel.patientId)}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>{userName(rel.doctorId)}</td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>{statusBadge(rel.status)}</td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)' }}>
                      {rel.initiatedByRole}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.65rem 0.75rem',
                        color: 'var(--text-muted)',
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {rel.notes || '—'}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      {rel.status !== 'revoked' && (
                        <button
                          onClick={() => handleRevoke(rel.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-danger)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          <XCircle size={14} /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminAssignDoctorTab | Props: none
      </div>
</div>
  );
}