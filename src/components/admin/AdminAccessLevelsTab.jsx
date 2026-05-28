import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle, Cpu, Eye, X, Edit2, Edit } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import AppDataTable from '../ui/AppDataTable';
import AppEntityCell from '../ui/AppEntityCell';
import AppActionGroup from '../ui/AppActionGroup';


const ROLE_LABELS = {
  admin: { name: 'Admin', color: 'var(--color-danger)', desc: 'Full System Control & Settings' },
  clinic: { name: 'Clinic / Group', color: '#8b5cf6', desc: 'Multi-practitioner Clinic Management' },
  doctor: { name: 'Practitioner', color: 'var(--color-success)', desc: 'Prescribing Physician & Protocols' },
  wholesaler: { name: 'Wholesaler', color: '#f59e0b', desc: 'Bulk Peptide Sourcing & Logistics' },
  sales_agent: { name: 'Sales Agent', color: 'var(--color-primary)', desc: 'Commission & Client Portfolio Tracking' },
  staff: { name: 'Clinic Staff', color: '#06b6d4', desc: 'Operational Support & Scheduling' },
  patient: { name: 'Patient', color: '#ec4899', desc: 'Direct Peptide Protocol Adherence' },
  guest: { name: 'Guest / Visitor', color: 'var(--color-text-secondary)', desc: 'Anonymous Public Portal Access' }
};

const ACTION_PERMISSIONS = [
  { key: 'canRecommend', label: 'Recommend Protocols', desc: 'Create tailored recommendations for patients' },
  { key: 'canBulkOrder', label: 'Bulk Orders', desc: 'Authorize and execute wholesale bulk transactions' },
  { key: 'customSynthesis', label: 'Custom Peptide Synthesis', desc: 'Access proprietary custom synthesis forms' },
  { key: 'clinicalLogs', label: 'Access Clinical Logs', desc: 'Review AI system logs and diagnostic audits' },
  { key: 'manageStaff', label: 'Staff Management', desc: 'Invite, delegate, and manage supporting roles' },
  { key: 'trackCommission', label: 'Commission Tracking', desc: 'Track sales commissions and agent performance' }
];

const VIEW_PERMISSIONS = [
  { key: 'canAccessAdminDashboard', label: 'Access Admin Dashboard', desc: 'Full core operations, settings, and logs' },
  { key: 'canAccessPhysicianDashboard', label: 'Access Physician Dashboard', desc: 'Patient rosters, prescriptions, and timeline logs' },
  { key: 'canAccessCalculator', label: 'Dose Calculator', desc: 'Access reconstituted peptide dose utilities' },
  { key: 'canAccessAcademy', label: 'Knowledge Hub & Academy', desc: 'Access scientific blogs and training modules' },
  { key: 'canAccessClinicalAI', label: 'ClinicalAI Assistant', desc: 'Access the conversational ClinicalAI engine' },
  { key: 'canAccessCustomSynthesis', label: 'Custom Synthesis Portal', desc: 'Request customized sequence synthesis' }
];

export default function AdminAccessLevelsTab() {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const [editingRole, setEditingRole] = useState(null); // role key

  // Sync permissions live from Firestore
  useEffect(() => {
    const docRef = doc(db, 'settings', 'permissions');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setPermissions(snap.data());
      } else {
        setError('Permissions document /settings/permissions not found in Firestore.');
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('Insufficient permission to read access control rules.');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleToggle = async (roleKey, permissionKey) => {
    if (!permissions) return;
    setError(null);
    setSuccessMsg(null);

    const currentVal = permissions[roleKey]?.[permissionKey] || false;
    const updatedRolePerms = {
      ...(permissions[roleKey] || {}),
      [permissionKey]: !currentVal
    };

    const updatedPermissions = {
      ...permissions,
      [roleKey]: updatedRolePerms
    };

    try {
      await setDoc(doc(db, 'settings', 'permissions'), updatedPermissions, { merge: true });
      setSuccessMsg(`Successfully updated permissions for ${ROLE_LABELS[roleKey]?.name}!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update Firestore permissions matrix.');
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Are you sure you want to reset all role permissions to standard default settings?')) return;
    setLoading(true);
    setError(null);

    const DEFAULT_PERMS = {
      admin: {
        canRecommend: true, canBulkOrder: true, customSynthesis: true, clinicalLogs: true, manageStaff: true, trackCommission: true,
        canAccessAdminDashboard: true, canAccessPhysicianDashboard: true, canAccessCalculator: true, canAccessAcademy: true, canAccessClinicalAI: true, canAccessCustomSynthesis: true
      },
      clinic: {
        canRecommend: true, canBulkOrder: true, customSynthesis: true, clinicalLogs: true, manageStaff: true, trackCommission: false,
        canAccessAdminDashboard: false, canAccessPhysicianDashboard: true, canAccessCalculator: true, canAccessAcademy: true, canAccessClinicalAI: true, canAccessCustomSynthesis: true
      },
      doctor: {
        canRecommend: true, canBulkOrder: false, customSynthesis: true, clinicalLogs: true, manageStaff: false, trackCommission: true,
        canAccessAdminDashboard: false, canAccessPhysicianDashboard: true, canAccessCalculator: true, canAccessAcademy: true, canAccessClinicalAI: true, canAccessCustomSynthesis: true
      },
      wholesaler: {
        canRecommend: false, canBulkOrder: true, customSynthesis: true, clinicalLogs: false, manageStaff: false, trackCommission: false,
        canAccessAdminDashboard: false, canAccessPhysicianDashboard: false, canAccessCalculator: true, canAccessAcademy: true, canAccessClinicalAI: false, canAccessCustomSynthesis: true
      },
      sales_agent: {
        canRecommend: false, canBulkOrder: false, customSynthesis: false, clinicalLogs: false, manageStaff: false, trackCommission: true,
        canAccessAdminDashboard: false, canAccessPhysicianDashboard: false, canAccessCalculator: false, canAccessAcademy: true, canAccessClinicalAI: false, canAccessCustomSynthesis: false
      },
      staff: {
        canRecommend: false, canBulkOrder: false, customSynthesis: false, clinicalLogs: true, manageStaff: false, trackCommission: false,
        canAccessAdminDashboard: false, canAccessPhysicianDashboard: false, canAccessCalculator: true, canAccessAcademy: true, canAccessClinicalAI: true, canAccessCustomSynthesis: false
      },
      patient: {
        canRecommend: false, canBulkOrder: false, customSynthesis: false, clinicalLogs: false, manageStaff: false, trackCommission: false,
        canAccessAdminDashboard: false, canAccessPhysicianDashboard: false, canAccessCalculator: false, canAccessAcademy: true, canAccessClinicalAI: false, canAccessCustomSynthesis: false
      },
      guest: {
        canRecommend: false, canBulkOrder: false, customSynthesis: false, clinicalLogs: false, manageStaff: false, trackCommission: false,
        canAccessAdminDashboard: false, canAccessPhysicianDashboard: false, canAccessCalculator: false, canAccessAcademy: true, canAccessClinicalAI: false, canAccessCustomSynthesis: false
      }
    };

    try {
      await setDoc(doc(db, 'settings', 'permissions'), DEFAULT_PERMS);
      setSuccessMsg('Permissions successfully reset to factory defaults.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to reset default permissions.');
    } finally {
      setLoading(false);
    }
  };

  const countActivePermissions = (roleKey) => {
    if (!permissions || !permissions[roleKey]) return 0;
    const validKeys = [...ACTION_PERMISSIONS, ...VIEW_PERMISSIONS].map(p => p.key);
    return validKeys.filter(key => permissions[roleKey][key] === true).length;
  };

  const totalPossiblePermissions = ACTION_PERMISSIONS.length + VIEW_PERMISSIONS.length;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '1rem' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 650 }}>Loading Permissions Matrix...</span>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* Tab Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-main)' }}>
            Access Levels & RBAC Matrix
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure granular action controls and dashboard gates per role.
          </p>
        </div>
        <button
          onClick={handleResetToDefault}
          className="gcp-btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          Reset Defaults
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          color: 'var(--color-danger)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600,
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {successMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
          color: 'var(--color-success)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600,
        }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Main Table */}
      <AppDataTable
        data={Object.entries(ROLE_LABELS).map(([roleKey, details]) => ({ roleKey, ...details }))}
        keyField="roleKey"
        columns={[
          {
            key: 'role',
            header: 'Role Profile',
            sortKey: 'role',
            sortValue: (row) => row.name.toLowerCase(),
            render: (row) => (
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{row.name}</span>
            )
          },
          // Description moved to expanded view to enforce 3-column paradigm.
          {
            key: 'permissions',
            header: 'Active Permissions',
            align: 'center',
            hideOnMobile: true,
            render: (row) => {
              const activeCount = countActivePermissions(row.roleKey);
              const percentage = Math.round((activeCount / totalPossiblePermissions) * 100) || 0;
              return (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#1a73e8', borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', minWidth: '40px', textAlign: 'right' }}>
                    {activeCount} / {totalPossiblePermissions}
                  </span>
                </div>
              );
            }
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row) => (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <AppActionGroup actions={[
                  { type: 'edit', onClick: () => setEditingRole(row.roleKey) }
                ]} />
              </div>
            )
          }
        ]}
        expandableRender={(row) => (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '1.5rem', 
            borderLeft: '3px solid var(--primary)',
            paddingLeft: '1.25rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Role Scope:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{row.desc}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Active Permissions:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {[...ACTION_PERMISSIONS, ...VIEW_PERMISSIONS]
                    .filter(p => permissions && permissions[row.roleKey] && permissions[row.roleKey][p.key])
                    .map(p => (
                      <span key={p.key} style={{ padding: '2px 6px', backgroundColor: 'var(--color-bg-hover)', color: 'var(--text-main)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {p.label}
                      </span>
                    ))}
                  {countActivePermissions(row.roleKey) === 0 && (
                    <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No permissions assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      />

      {/* Modal for Editing Permissions */}
      {editingRole && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)',
          zIndex: 9999, display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch'
        }}>
          <div style={{
            backgroundColor: 'var(--background)',
            width: '100%', maxWidth: '850px', height: '100%',
            boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            {/* Modal Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                    {ROLE_LABELS[editingRole].name} Permissions
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {ROLE_LABELS[editingRole].desc}
                  </div>
                </div>
              </div>
              <button onClick={() => setEditingRole(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', backgroundColor: 'var(--color-bg-surface)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Left Column: Actions */}
              <div>
                <div style={{ 
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', 
                  color: '#5f6368', borderBottom: '1px solid #e0e0e0', 
                  paddingBottom: '0.25rem', marginBottom: '0.75rem', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <Cpu size={12} />
                  <span>Action & Task Approvals</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {ACTION_PERMISSIONS.map(item => {
                    const hasPerm = permissions?.[editingRole]?.[item.key] || false;
                    return (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '0.25rem 0', borderBottom: '1px solid #f1f3f4' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#202124' }}>{item.label}</div>
                          <div style={{ fontSize: '0.7rem', color: '#5f6368', marginTop: '2px' }}>{item.desc}</div>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '28px', height: '16px', flexShrink: 0, cursor: 'pointer', marginTop: '2px' }}>
                          <input type="checkbox" checked={hasPerm} onChange={() => handleToggle(editingRole, item.key)} style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: hasPerm ? '#1a73e8' : '#dadce0', transition: '.2s', borderRadius: '8px' }}>
                            <span style={{ position: 'absolute', left: '2px', bottom: '2px', backgroundColor: 'white', width: '12px', height: '12px', borderRadius: '50%', transition: '.2s', transform: hasPerm ? 'translateX(12px)' : 'translateX(0)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Views */}
              <div>
                <div style={{ 
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', 
                  color: '#5f6368', borderBottom: '1px solid #e0e0e0', 
                  paddingBottom: '0.25rem', marginBottom: '0.75rem', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <Eye size={12} />
                  <span>Page & View Dashboard Routing</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {VIEW_PERMISSIONS.map(item => {
                    const hasPerm = permissions?.[editingRole]?.[item.key] || false;
                    return (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '0.25rem 0', borderBottom: '1px solid #f1f3f4' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#202124' }}>{item.label}</div>
                          <div style={{ fontSize: '0.7rem', color: '#5f6368', marginTop: '2px' }}>{item.desc}</div>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '28px', height: '16px', flexShrink: 0, cursor: 'pointer', marginTop: '2px' }}>
                          <input type="checkbox" checked={hasPerm} onChange={() => handleToggle(editingRole, item.key)} style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: hasPerm ? '#1a73e8' : '#dadce0', transition: '.2s', borderRadius: '8px' }}>
                            <span style={{ position: 'absolute', left: '2px', bottom: '2px', backgroundColor: 'white', width: '12px', height: '12px', borderRadius: '50%', transition: '.2s', transform: hasPerm ? 'translateX(12px)' : 'translateX(0)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
