import React, { useState } from 'react';
import { Tabs, Toggle, TextField, StatusChip } from '../ui';
import { X, Briefcase, Map, Users, TrendingUp, Shield, Activity, Phone, Mail, Building2, Calendar, MapPin, CheckCircle2, AlertCircle, Clock, Search, MoreVertical, DollarSign, Target, UserCircle, Plus, Eye } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';

export default function AccountManagerDrawer({ manager, wholesellers, onUpdate, onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const isMobile = useResponsive();

  if (!manager) return null;

  const workloadPercentage = Math.min(100, Math.floor(((manager.assignedClinics || 0) + (manager.assignedDoctors || 0)) / 2));

  const tabs = [
    {
      id: 'general',
      label: 'General',
      icon: Briefcase,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role</span>
              <div style={{ fontWeight: 500 }}>Account Manager</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hire Date</span>
              <div style={{ fontWeight: 500 }}>{manager.createdAt ? new Date(manager.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organization</span>
              <div style={{ fontWeight: 500 }}>
                {manager.wholesellerId ? wholesellers[manager.wholesellerId] || 'Unknown Org' : 'Unassigned'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</span>
              <div style={{ fontWeight: 500 }}>{manager.phone || 'No phone'}</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Manager Notes</h4>
            <TextField 
              multiline 
              rows={4} 
              defaultValue={manager.notes || ''} 
              onBlur={(e) => onUpdate(manager.id, { notes: e.target.value })} 
              placeholder="Add internal notes about this manager..."
            />
          </div>
        </div>
      )
    },
    {
      id: 'territories',
      label: `Territories (${manager.territories?.length || 1})`,
      icon: Map,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>Coverage Health</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" /> <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Dubai</span>
                </div>
                <StatusChip status="active" label="Covered" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" /> <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Abu Dhabi</span>
                </div>
                <StatusChip status="active" label="Covered" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} color="#d97706" /> <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Sharjah</span>
                </div>
                <StatusChip status="warning" label="Unassigned" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#16a34a" /> <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Northern Emirates</span>
                </div>
                <StatusChip status="active" label="Covered" />
              </div>
            </div>
            <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }}>Manage Territories</button>
          </div>
        </div>
      )
    },
    {
      id: 'assignments',
      label: `Assignments (${(manager.assignedClinics || 0) + (manager.assignedDoctors || 0)})`,
      icon: Users,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} color="var(--text-muted)" /> Clinics ({manager.assignedClinics || 0})
              </h4>
              <button className="btn btn-icon btn-sm"><Plus size={16} /></button>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {[1, 2, 3].map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--surface)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>Elite Wellness Clinic {i+1}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dubai Healthcare City</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-icon btn-sm" title="View"><Eye size={14} /></button>
                    <button className="btn btn-icon btn-sm" title="Reassign"><Users size={14} /></button>
                    <button className="btn btn-icon btn-sm" title="Remove"><X size={14} color="var(--color-danger)" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCircle size={16} color="var(--text-muted)" /> Doctors ({manager.assignedDoctors || 0})
              </h4>
              <button className="btn btn-icon btn-sm"><Plus size={16} /></button>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {[1, 2].map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: i < 1 ? '1px solid var(--border)' : 'none', backgroundColor: 'var(--surface)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>Dr. Sarah Jenkins {i+1}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Functional Medicine</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-icon btn-sm" title="View"><Eye size={14} /></button>
                    <button className="btn btn-icon btn-sm" title="Reassign"><Users size={14} /></button>
                    <button className="btn btn-icon btn-sm" title="Remove"><X size={14} color="var(--color-danger)" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: TrendingUp,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <DollarSign size={14} /> Revenue Generated
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>${manager.revenue?.toLocaleString() || '124,500'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.25rem' }}>↑ 12% vs last month</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <Activity size={14} /> Orders Created
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>34</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.25rem' }}>↑ 4% vs last month</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <Building2 size={14} /> Clinics Activated
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>8</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Stable</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <Target size={14} /> Conversion Rate
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>24%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem' }}>↓ 2% vs last month</div>
            </div>
          </div>
          
          <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <TrendingUp size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Detailed charts and monthly trends will appear here.</p>
          </div>
        </div>
      )
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: Shield,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Toggle label="Account Active" checked={!manager.disabled} onChange={(checked) => onUpdate(manager.id, { disabled: !checked })} />
          <Toggle label="Can Modify Territories" checked={manager.canModifyTerritories || false} onChange={(checked) => onUpdate(manager.id, { canModifyTerritories: checked })} />
          <Toggle label="Can Access Analytics" checked={manager.canAccessAnalytics || false} onChange={(checked) => onUpdate(manager.id, { canAccessAnalytics: checked })} />
        </div>
      )
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Clock,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { a: 'Logged in', d: 'Today, 09:41 AM' },
            { a: 'Assigned to Elite Wellness Clinic', d: 'Yesterday, 02:15 PM' },
            { a: 'Updated Territory limits', d: '3 Days Ago' },
          ].map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '6px' }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>{log.a}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.d}</div>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998, backdropFilter: 'blur(2px)' }} 
        onClick={onClose}
      />
      {/* Drawer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: isMobile ? '100vw' : '580px',
          backgroundColor: 'var(--surface)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={18} /> Account Manager Profile
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-outline btn-sm">Edit</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Executive Summary Header */}
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {manager.photoURL ? (
                  <img src={manager.photoURL} alt={manager.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserCircle size={40} color="var(--text-muted)" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
                    {manager.displayName || manager.name || 'Unnamed Manager'}
                  </h3>
                  <StatusChip status={manager.disabled ? 'inactive' : 'active'} label={manager.disabled ? 'Suspended' : 'Active'} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Mail size={14} /> {manager.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  <MapPin size={14} /> {manager.territories?.length ? `${manager.territories.length} Territories Assigned` : 'Global Coverage'}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Clinics</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{manager.assignedClinics || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Doctors</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{manager.assignedDoctors || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Revenue</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-success)' }}>${(manager.revenue || 124500).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Last Active</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '2px' }}>Today</div>
              </div>
            </div>

            {/* Workload Indicator */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Workload</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: workloadPercentage > 80 ? 'var(--color-danger)' : 'var(--text-main)' }}>{workloadPercentage}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${workloadPercentage}%`, 
                  backgroundColor: workloadPercentage > 80 ? 'var(--color-danger)' : workloadPercentage > 50 ? 'var(--color-warning)' : 'var(--color-success)',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Based on active clinics, doctors, leads, and orders managed.
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <Tabs 
              activeTab={activeTab} 
              onChange={setActiveTab} 
              tabs={tabs} 
            />
          </div>
        </div>
      </div>
    </>
  );
}
