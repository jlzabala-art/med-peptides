import React, { useState, useRef, useEffect } from 'react';
import { User, ArrowUpRight, Stethoscope, Edit, Save, X, Building2, UserCheck, Search, ChevronDown } from '@/lib/icons';
import { updatePrescription, fetchCareTeamUsers } from '../../../services/prescriptionsService';
import notifier from '../../../services/NotificationService';
import { toast } from 'react-hot-toast';

const TOP_DOCTORS = [
  { name: 'Dr. Anitathurasini Rajoo', title: 'Trichology & Peptide Therapy' },
  { name: 'Dr. Sezgin Cagatay', title: 'Dermatology Specialist' },
  { name: 'Dr. Vibhor Devendra', title: 'Genomic Medicine' },
  { name: 'Dr. Maria Santos', title: 'Anti-Aging Medicine' },
  { name: 'Dr. Ahmed Al-Mansoori', title: 'Clinical Director' }
];

const TOP_MANAGERS = [
  { name: 'Kasia', title: 'Senior Account Manager & Ops Lead' },
  { name: 'Kasia Mediluxe', title: 'Account Manager' },
  { name: 'Jose Luis Zabala', title: 'Managing Director' },
  { name: 'Carlos Méndez', title: 'Clinical Operations Manager' },
  { name: 'Sarah Connor', title: 'Key Account Manager' }
];

const TOP_WHOLESELLERS = [
  { name: 'Mediluxe Health Solutions', title: 'Primary Compounding & Wholeseller Partner (UAE)' },
  { name: 'Fagron Genomics UAE', title: 'Genomic Test & Compounding' },
  { name: 'Fagron Genomics', title: 'Primary Compounding Partner' },
  { name: 'Olympia Compounding Pharmacy', title: 'Peptides & Topical Formulations' },
  { name: 'Medca Health Logistics', title: 'Cold-Chain Delivery' }
];

function CareTeamLookupInput({ label, value, onChange, placeholder, defaultItems = [], icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = defaultItems.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    (item.title && item.title.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.5rem 2rem 0.5rem 0.75rem',
            borderRadius: '8px',
            border: isOpen ? '1px solid #3b82f6' : '1px solid #cbd5e1',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#0f172a',
            outline: 'none',
            boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
            transition: 'all 0.15s'
          }}
        />
        <ChevronDown
          size={14}
          color="#94a3b8"
          style={{
            position: 'absolute',
            right: '0.6rem',
            pointerEvents: 'none',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s'
          }}
        />
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            zIndex: 9999,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '0.35rem 0'
          }}
        >
          <div style={{ padding: '0.35rem 0.75rem', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>
            ⚡ Top 5 Frequent Candidates
          </div>
          {filteredItems.length === 0 ? (
            <div
              onClick={() => setIsOpen(false)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#64748b', cursor: 'pointer' }}
            >
              Use custom value: <strong>"{query}"</strong>
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setQuery(item.name);
                  onChange(item.name);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderBottom: idx < filteredItems.length - 1 ? '1px solid #f8fafc' : 'none',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                  {item.title && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.title}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function OverviewTab({ rx, refreshPrescription }) {
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [doctorName, setDoctorName] = useState(rx?.doctorName || rx?.doctor?.name || '');
  const [accountManager, setAccountManager] = useState(rx?.accountManager || rx?.manager || '');
  const [wholesellerName, setWholesellerName] = useState(rx?.wholesellerName || rx?.wholeseller || '');
  const [doctorsList, setDoctorsList] = useState(TOP_DOCTORS);
  const [managersList, setManagersList] = useState(TOP_MANAGERS);
  const [wholesellersList, setWholesellersList] = useState(TOP_WHOLESELLERS);

  useEffect(() => {
    async function loadRealData() {
      try {
        const usersList = await fetchCareTeamUsers();
        const dynamicDocs = [...TOP_DOCTORS];
        const dynamicMgrs = [...TOP_MANAGERS];
        const dynamicWholesellers = [...TOP_WHOLESELLERS];

        usersList.forEach((u) => {
          const name = u.name || u.displayName || u.fullName || u.email;
          if (!name) return;
          const role = (u.role || u.userType || '').toLowerCase();

          if (role === 'doctor' || role === 'physician' || name.toLowerCase().includes('dr.')) {
            if (!dynamicDocs.some((d) => d.name.toLowerCase() === name.toLowerCase())) {
              dynamicDocs.unshift({ name, title: u.specialty || u.clinic || 'Physician' });
            }
          }
          if (role === 'account_manager' || role === 'admin' || name.toLowerCase().includes('kasia')) {
            if (!dynamicMgrs.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
              dynamicMgrs.unshift({ name, title: role === 'admin' ? 'Admin / Account Manager' : 'Account Manager' });
            }
          }
          if (role === 'wholeseller' || role === 'supplier' || role === 'pharmacy') {
            if (!dynamicWholesellers.some((w) => w.name.toLowerCase() === name.toLowerCase())) {
              dynamicWholesellers.unshift({ name, title: u.companyName || 'Wholeseller / Pharmacy' });
            }
          }
        });

        setDoctorsList(dynamicDocs);
        setManagersList(dynamicMgrs);
        setWholesellersList(dynamicWholesellers);
      } catch (err) {
        console.warn("Notice loading dynamic care team data:", err);
      }
    }
    loadRealData();
  }, []);

  const handleSaveCareTeam = async () => {
    setIsSavingTeam(true);
    try {
      const nowIso = new Date().toISOString();
      const changes = [];

      const oldDoctor = doctor || 'Unassigned';
      if (doctorName && doctorName !== oldDoctor) {
        changes.push(`Doctor changed from '${oldDoctor}' to '${doctorName}'`);
      }

      const oldManager = manager || 'Unassigned';
      if (accountManager && accountManager !== oldManager) {
        changes.push(`Account Manager changed from '${oldManager}' to '${accountManager}'`);
      }

      const oldWholeseller = wholeseller || 'Unassigned';
      if (wholesellerName && wholesellerName !== oldWholeseller) {
        changes.push(`Wholeseller/Pharmacy changed from '${oldWholeseller}' to '${wholesellerName}'`);
        
        // Notify wholeseller role
        try {
          notifier.send({
            to: ['wholeseller'],
            message: `Prescription ${rx.id} for ${patient} assigned to ${wholesellerName}`,
            type: 'prescription_assignment'
          });
        } catch (e) {
          console.warn("Notification notice:", e);
        }
      }

      if (changes.length === 0) {
        setIsEditingTeam(false);
        setIsSavingTeam(false);
        return;
      }

      const changeSummary = `Care Team Reassigned: ${changes.join('. ')}.`;

      const newTimelineEvent = {
        id: `evt_team_${Date.now()}`,
        event: 'Care Team Reassigned',
        description: changeSummary,
        timestamp: nowIso,
        user: 'Admin / Doctor'
      };

      const newAuditLog = {
        timestamp: nowIso,
        action: 'care_team_reassigned',
        user: 'Admin / Doctor',
        details: changeSummary
      };

      const payload = {
        doctorName: doctorName || rx.doctorName || '',
        doctor: { ...(typeof rx.doctor === 'object' && rx.doctor !== null ? rx.doctor : {}), name: doctorName || rx.doctorName || '' },
        accountManager: accountManager || '',
        wholesellerName: wholesellerName || '',
        wholeseller: wholesellerName || '',
        clinic: wholesellerName || rx.clinic || '',
        timeline: [...(rx.timeline || []), newTimelineEvent],
        auditTrail: [...(rx.auditTrail || []), newAuditLog],
        updatedAt: new Date()
      };

      await updatePrescription(rx.id, payload);
      if (onUpdateRx) onUpdateRx({ ...rx, ...payload });
      toast.success("Care Team updated & logged in timeline!");
      setIsEditingTeam(false);
    } catch (err) {
      console.error("Error updating care team:", err);
      toast.error("Failed to update Care Team: " + err.message);
    } finally {
      setIsSavingTeam(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, color = '#64748b' }) =>
    value ? (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.6rem 0',
          borderBottom: '1px solid #f8fafc',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={14} color={color} />
        </div>
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </div>
          <div
            style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, marginTop: '0.1rem' }}
          >
            {value}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      {/* Left: Patient & Team */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.75rem',
            }}
          >
            Patient
          </div>
          <InfoRow icon={User} label="Name" value={patient} color="#6366f1" />
          <InfoRow icon={ArrowUpRight} label="Email" value={patEmail} color="#3b82f6" />
          <InfoRow icon={ArrowUpRight} label="Phone" value={patPhone} color="#3b82f6" />
        </div>

        {/* Care Team Card */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              Care Team
            </div>
            {!isEditingTeam ? (
              <button
                onClick={() => setIsEditingTeam(true)}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#2563eb',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '0.2rem 0.5rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Edit size={11} /> Reassign Team
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button
                  onClick={() => setIsEditingTeam(false)}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#64748b',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0.2rem 0.45rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCareTeam}
                  disabled={isSavingTeam}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    background: '#16a34a',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.2rem 0.6rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Save size={11} /> {isSavingTeam ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {!isEditingTeam ? (
            <>
              <InfoRow icon={Stethoscope} label="Prescribing Doctor" value={doctor || 'Unassigned'} color="#10b981" />
              {docEmail && <InfoRow icon={ArrowUpRight} label="Doctor Email" value={docEmail} color="#10b981" />}
              <InfoRow icon={UserCheck} label="Account Manager" value={manager || 'Unassigned'} color="#f59e0b" />
              <InfoRow icon={Building2} label="Wholeseller / Pharmacy" value={wholeseller || 'Unassigned'} color="#8b5cf6" />
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              <CareTeamLookupInput
                label="Prescribing Doctor"
                value={doctorName}
                onChange={setDoctorName}
                placeholder="Search physician or select candidate..."
                defaultItems={doctorsList}
                icon={Stethoscope}
              />

              <CareTeamLookupInput
                label="Account Manager"
                value={accountManager}
                onChange={setAccountManager}
                placeholder="Search account manager or select candidate..."
                defaultItems={managersList}
                icon={UserCheck}
              />

              <CareTeamLookupInput
                label="Wholeseller / Compounding Pharmacy"
                value={wholesellerName}
                onChange={setWholesellerName}
                placeholder="Search wholeseller / pharmacy or select candidate..."
                defaultItems={wholesellersList}
                icon={Building2}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right: Clinical Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: '0.75rem',
            }}
          >
            Clinical Information
          </div>
          {diagnosis ? (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.3rem',
                }}
              >
                Diagnosis
              </div>
              <div
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  fontWeight: 600,
                }}
              >
                {diagnosis}
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                fontStyle: 'italic',
                marginBottom: '0.75rem',
              }}
            >
              No diagnosis specified
            </div>
          )}
          {protocol && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.3rem',
                }}
              >
                Protocol
              </div>
              <div
                onClick={() => {
                  if (onProtocolClick && rx.protocolId) {
                    onProtocolClick({ id: rx.protocolId, protocol_title: protocol });
                  }
                }}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.7rem 1rem',
                  fontSize: '0.9rem',
                  color: rx.protocolId && onProtocolClick ? '#2563eb' : '#6366f1',
                  fontWeight: 700,
                  cursor: rx.protocolId && onProtocolClick ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { if (rx.protocolId && onProtocolClick) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { if (rx.protocolId && onProtocolClick) e.currentTarget.style.background = 'white'; }}
              >
                {protocol}
                {rx.protocolId && onProtocolClick && <ArrowUpRight size={14} color="#2563eb" />}
              </div>
            </div>
          )}
        </div>
        {notes && (
          <div
            style={{
              background: '#fffbeb',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #fde68a',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#92400e',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: '0.5rem',
              }}
            >
              Clinical Notes
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '0.88rem',
                color: '#78350f',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
