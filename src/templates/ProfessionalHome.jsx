import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusSquare, 
  Search, 
  Library, 
  Clock, 
  ShieldAlert, 
  BarChart3, 
  Activity, 
  ChevronRight,
  User,
  Settings,
  Bell,
  CheckCircle2,
  Lock,
  MessageSquare
} from 'lucide-react';
import { getSavedProtocolsList } from '../services/protocolStorage';
import { useAuth } from '../context/AuthContext';
import CustomSynthesisBanner from '../sections/CustomSynthesisBanner';
import AcademyBanner from '../sections/AcademyBanner';
import PowerSearch from '../sections/PowerSearch';

export default function ProfessionalHome({ userProfile, onOpenSearch, searchQuery, setSearchQuery }) {
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
    { label: 'Project Savings', value: '$1,240', icon: BarChart3, color: '#10b981' },
  ];

  return (
    <div className="professional-home" style={{ 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      paddingBottom: '5rem',
      animation: 'fadeIn 0.6s ease-out' 
    }}>
      {/* 1. Operational Header / Breadcrumb */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '1.5rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>
            Operational Dashboard
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
            {userProfile?.fullName || 'Practitioner'} • {userProfile?.institution || 'Clinical Facility'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} color="#64748b" />
            <span style={{ 
              position: 'absolute', 
              top: -2, right: -2, 
              width: 8, height: 8, 
              backgroundColor: '#ef4444', 
              borderRadius: '50%', 
              border: '2px solid white' 
            }} />
          </div>
          <div style={{ 
            width: 36, height: 36, 
            borderRadius: '50%', 
            backgroundColor: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '0.9rem'
          }}>
            {userProfile?.fullName?.charAt(0) || <User size={18} />}
          </div>
        </div>
      </div>

      <div className="dashboard-container" style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 2rem' }}>
        
        {/* 2. Quick Actions Panel */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusSquare size={20} color="var(--primary)" /> Quick Workflows
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <button 
              onClick={() => navigate('/protocol-builder')}
              style={actionButtonStyle}
            >
              <div style={iconBoxStyle('#eff6ff', 'var(--primary)')}><PlusSquare size={24} /></div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={actionTitleStyle}>Create New Protocol</h3>
                <p style={actionDescStyle}>Launch AI-assisted titration builder</p>
              </div>
              <ChevronRight size={20} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
            </button>
            <button 
              onClick={() => navigate('/search')}
              style={actionButtonStyle}
            >
              <div style={iconBoxStyle('#f0fdf4', '#10b981')}><Search size={24} /></div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={actionTitleStyle}>Literature Search</h3>
                <p style={actionDescStyle}>Query 2,500+ clinical publications</p>
              </div>
              <ChevronRight size={20} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
            </button>
            <button 
              onClick={() => navigate('/products')}
              style={actionButtonStyle}
            >
              <div style={iconBoxStyle('#faf5ff', '#a855f7')}><Library size={24} /></div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={actionTitleStyle}>Open Library</h3>
                <p style={actionDescStyle}>Browse standardized peptide catalog</p>
              </div>
              <ChevronRight size={20} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
            </button>
          </div>
        </section>

        {/* 2.5 Unified Clinical Search for Professionals */}
        <section style={{ marginBottom: '2.5rem' }}>
          <PowerSearch 
            onOpenSearch={onOpenSearch} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
        </section>

        {/* 3. Stats Summary */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2.5rem' 
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ 
                width: 48, height: 48, 
                borderRadius: '12px', 
                backgroundColor: `${stat.color}10`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: stat.color
              }}>
                <stat.icon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
          {/* 4. Active Protocols List */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Recent Protocol Activities</h2>
              <button onClick={() => navigate('/protocol-builder')} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
            </div>
            
            <div style={{ backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading your clinical vault...</div>
              ) : protocols.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                  <div style={{ marginBottom: '1.5rem', opacity: 0.5 }}><PlusSquare size={48} color="#cbd5e1" /></div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>No Active Protocols</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Start your first multi-phase research protocol to see it here.</p>
                  <button 
                    onClick={() => navigate('/protocol-builder')}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      backgroundColor: 'var(--primary)', 
                      color: 'white', 
                      borderRadius: '8px', 
                      border: 'none', 
                      fontWeight: 700, 
                      cursor: 'pointer' 
                    }}
                  >
                    Launch Builder
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <th style={tableHeaderStyle}>Protocol Name</th>
                        <th style={tableHeaderStyle}>Category</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Last Update</th>
                        <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {protocols.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: idx === protocols.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                          <td style={tableCellStyle}>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{p.protocol_name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>v{p.version_number || 1.0}</div>
                          </td>
                          <td style={tableCellStyle}>
                             <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{p.therapeutic_category}</span>
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '20px', 
                              fontSize: '0.7rem', 
                              fontWeight: 800, 
                              backgroundColor: p.status === 'approved' ? '#dcfce7' : '#fef9c3',
                              color: p.status === 'approved' ? '#166534' : '#854d0e'
                            }}>
                              {(p.status || 'draft').toUpperCase()}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {p.updated_at?.toDate ? new Date(p.updated_at.toDate()).toLocaleDateString() : 'Active Now'}
                            </div>
                          </td>
                          <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                            <button 
                              onClick={() => navigate(`/protocol-builder?id=${p.id}`)}
                              style={{ 
                                padding: '6px 12px', 
                                border: '1px solid #e2e8f0', 
                                background: 'white', 
                                borderRadius: '6px', 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
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

          {/* 5. Sidebar: Safety and Monitoring */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Safety Alerts */}
            <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#dc2626' }}>
                <ShieldAlert size={22} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Safety Monitoring</h2>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={safetyItemStyle('#fef2f2', '#ef4444')}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Institutional Guidelines Updated</div>
                  <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>Verify PT-141 titration schedules against latest ethics review.</p>
                </div>
                <div style={safetyItemStyle('#f0fdf4', '#10b981')}>
                  <CheckCircle2 size={16} style={{ marginBottom: '0.25rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cold Chain Verification</div>
                  <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>All active logistics paths are within standard temp range.</p>
                </div>
              </div>
            </section>

            {/* Account Status / Economic Summary */}
            <section style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #001A35 100%)', 
              color: 'white', 
              padding: '1.5rem', 
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
               <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}><BarChart3 size={100} /></div>
               <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', position: 'relative' }}>Commercial Summary</h2>
               
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

        {/* 6. Integration Sections (Marketing reduced) */}
        <div style={{ marginTop: '4rem' }}>
           <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Professional Resources</h2>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <AcademyBanner onNavigate={navigate} compact={true} />
              <CustomSynthesisBanner onNavigate={navigate} compact={true} />
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

// Styles
const actionButtonStyle = {
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1.25rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const iconBoxStyle = (bg, color) => ({
  width: 48, height: 48,
  backgroundColor: bg,
  color: color,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
});

const actionTitleStyle = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 800,
  color: '#1e293b'
};

const actionDescStyle = {
  margin: '0.15rem 0 0 0',
  fontSize: '0.8rem',
  color: '#64748b',
  fontWeight: 500
};

const tableHeaderStyle = {
  padding: '1rem 1.5rem',
  fontSize: '0.75rem',
  fontWeight: 800,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const tableCellStyle = {
  padding: '1.25rem 1.5rem',
  fontSize: '0.9rem'
};

const safetyItemStyle = (bg, border) => ({
  backgroundColor: bg,
  padding: '1rem',
  borderRadius: '12px',
  borderLeft: `4px solid ${border}`,
  color: '#1e293b'
});
