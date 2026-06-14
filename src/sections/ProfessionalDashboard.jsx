import PlusSquare from "lucide-react/dist/esm/icons/plus-square";
import Search from "lucide-react/dist/esm/icons/search";
import Library from "lucide-react/dist/esm/icons/library";
import Clock from "lucide-react/dist/esm/icons/clock";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Activity from "lucide-react/dist/esm/icons/activity";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import User from "lucide-react/dist/esm/icons/user";
import Bell from "lucide-react/dist/esm/icons/bell";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';











import { getSavedProtocolsList } from '../services/protocolStorage';
import { useAuth } from '../context/AuthContext';
import PowerSearch from './PowerSearch';
import AcademyBanner from './AcademyBanner';
import CustomSynthesisBanner from './CustomSynthesisBanner';

export default function ProfessionalDashboard({
  userProfile,
  onOpenSearch,
  searchQuery,
  setSearchQuery,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (user) {
        setLoading(true);
        const list = await getSavedProtocolsList({ userId: user.uid, limit: 5 });
        setProtocols(list);
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const stats = [
    { label: 'Active Protocols', value: protocols.length, icon: Activity, color: '#0ea5e9' },
    { label: 'Safety Alerts', value: '0', icon: ShieldAlert, color: '#f59e0b' },
    { label: 'Drafts', value: protocols.filter(p => p.status === 'draft').length, icon: Clock, color: '#6366f1' },
    { label: 'Project Savings', value: '$1,240', icon: BarChart3, color: 'var(--color-success)' },
  ];

  return (
    <section
      id="professional-dashboard"
      style={{ backgroundColor: 'var(--color-bg-app)', paddingBottom: '5rem' }}
    >
      {/* Header bar */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>
            Operational Dashboard
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
            {userProfile?.fullName || 'Practitioner'} &bull; {userProfile?.institution || 'Clinical Facility'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} color="var(--color-text-secondary)" />
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 8, height: 8,
              backgroundColor: 'var(--color-danger)',
              borderRadius: '50%',
              border: '2px solid white',
            }} />
          </div>
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '0.9rem',
          }}>
            {userProfile?.fullName?.charAt(0) || <User size={18} />}
          </div>
        </div>
      </div>

      {/* Inner container */}
      <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 2rem' }}>

        {/* Quick Workflows */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusSquare size={20} color="var(--primary)" /> Quick Workflows
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <button onClick={() => navigate('/protocol-finder')} style={actionButtonStyle}>
              <div style={iconBox('#eff6ff', 'var(--primary)')}><PlusSquare size={24} /></div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={actionTitleStyle}>Create New Protocol</h4>
                <p style={actionDescStyle}>Launch AI-assisted titration finder</p>
              </div>
              <ChevronRight size={20} color="var(--color-border)" style={{ marginLeft: 'auto' }} />
            </button>
            <button onClick={() => navigate('/search')} style={actionButtonStyle}>
              <div style={iconBox('var(--color-success-bg)', 'var(--color-success)')}><Search size={24} /></div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={actionTitleStyle}>Literature Search</h4>
                <p style={actionDescStyle}>Query 2,500+ clinical publications</p>
              </div>
              <ChevronRight size={20} color="var(--color-border)" style={{ marginLeft: 'auto' }} />
            </button>
            <button onClick={() => navigate('/products')} style={actionButtonStyle}>
              <div style={iconBox('#faf5ff', '#a855f7')}><Library size={24} /></div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={actionTitleStyle}>Open Library</h4>
                <p style={actionDescStyle}>Browse standardized peptide catalog</p>
              </div>
              <ChevronRight size={20} color="var(--color-border)" style={{ marginLeft: 'auto' }} />
            </button>
          </div>
        </section>

        {/* Clinical Search */}
        <section style={{ marginBottom: '2.5rem' }}>
          <PowerSearch
            onOpenSearch={onOpenSearch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </section>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <div style={{
                width: 48, height: 48,
                borderRadius: '12px',
                backgroundColor: stat.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color,
              }}>
                <stat.icon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Protocols + Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>

          {/* Protocol list */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>Recent Protocol Activities</h3>
              <button onClick={() => navigate('/protocol-finder')} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                View All
              </button>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading your clinical vault...</div>
              ) : protocols.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                  <div style={{ marginBottom: '1.5rem', opacity: 0.5 }}><PlusSquare size={48} color="var(--color-border)" /></div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>No Active Protocols</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                    Start your first multi-phase research protocol to see it here.
                  </p>
                  <button
                    onClick={() => navigate('/protocol-finder')}
                    style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Launch Finder
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <th style={thStyle}>Protocol Name</th>
                        <th style={thStyle}>Category</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Last Update</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {protocols.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: idx === protocols.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              {p.metadata?.scientificName || p.protocol_name}
                            </div>
                            {p.metadata?.scientificName && (
                              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>{p.protocol_name}</div>
                            )}
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>v{p.version_number || 1.0}</div>
                          </td>
                          <td style={tdStyle}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{p.therapeutic_category}</span>
                          </td>
                          <td style={tdStyle}>
                            <span style={{
                              padding: '4px 10px', borderRadius: '20px',
                              fontSize: '0.7rem', fontWeight: 800,
                              backgroundColor: p.status === 'approved' ? '#dcfce7' : '#fef9c3',
                              color: p.status === 'approved' ? '#166534' : '#854d0e',
                            }}>
                              {(p.status || 'draft').toUpperCase()}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                              {p.updated_at?.toDate ? new Date(p.updated_at.toDate()).toLocaleDateString() : 'Active Now'}
                            </div>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            <button
                              onClick={() => navigate('/protocol-finder?id=' + p.id)}
                              style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Open Workfile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--color-danger)' }}>
                <ShieldAlert size={22} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Safety Monitoring</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--color-danger-bg)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #ef4444', color: 'var(--color-text-primary)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Institutional Guidelines Updated</div>
                  <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>Verify PT-141 titration schedules against latest ethics review.</p>
                </div>
                <div style={{ backgroundColor: 'var(--color-success-bg)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #10b981', color: 'var(--color-text-primary)' }}>
                  <CheckCircle2 size={16} style={{ marginBottom: '0.25rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cold Chain Verification</div>
                  <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>All active logistics paths are within standard temp range.</p>
                </div>
              </div>
            </section>

            <section style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #001A35 100%)',
              color: 'white', padding: '1.5rem', borderRadius: '20px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}><BarChart3 size={100} /></div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', position: 'relative' }}>Commercial Summary</h3>
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Pending Procurement</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>$1,240.00</div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>CREDIT LIMIT</div>
                    <div style={{ fontWeight: 700 }}>$15,000</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>ACCOUNT TYPE</div>
                    <div style={{ fontWeight: 700 }}>{userProfile?.userType || 'Professional'}</div>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* Professional Resources */}
        <div style={{ marginTop: '4rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1.5rem' }}>Professional Resources</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <AcademyBanner onNavigate={navigate} compact={true} />
            <CustomSynthesisBanner onNavigate={navigate} compact={true} />
          </div>
        </div>

      </div>
    </section>
  );
}

// Style helpers (no template literals — Rolldown v8 safe)
const actionButtonStyle = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '1.25rem',
  display: 'flex', alignItems: 'center', gap: '1.25rem',
  cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  width: '100%',
};

const iconBox = (bg, color) => ({
  width: 48, height: 48,
  backgroundColor: bg, color: color,
  borderRadius: '12px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
});

const actionTitleStyle = { margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)' };
const actionDescStyle = { margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 };

const thStyle = {
  padding: '1rem 1.5rem', fontSize: '0.75rem',
  fontWeight: 800, color: 'var(--color-text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const tdStyle = { padding: '1.25rem 1.5rem', fontSize: '0.9rem' };