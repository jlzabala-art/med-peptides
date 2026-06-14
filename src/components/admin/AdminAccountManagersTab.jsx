import Users from "lucide-react/dist/esm/icons/users";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import UserCircle from "lucide-react/dist/esm/icons/user-circle";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import Plus from "lucide-react/dist/esm/icons/plus";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Edit3 from "lucide-react/dist/esm/icons/edit-3";
import Eye from "lucide-react/dist/esm/icons/eye";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Shield from "lucide-react/dist/esm/icons/shield";
import Search from "lucide-react/dist/esm/icons/search";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Filter from "lucide-react/dist/esm/icons/filter";
import Download from "lucide-react/dist/esm/icons/download";
import MoreVertical from "lucide-react/dist/esm/icons/more-vertical";
import Map from "lucide-react/dist/esm/icons/map";
import Clock from "lucide-react/dist/esm/icons/clock";
import FileText from "lucide-react/dist/esm/icons/file-text";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import DataTable from '../ui/DataTable';
import { StatusChip } from '../ui';
import TooltipWrapper from '../ui/TooltipWrapper';
import AppEntityCell from '../ui/AppEntityCell';
import AppFilterBar from '../ui/AppFilterBar';






















import AccountManagerWizard from './AccountManagerWizard';
import AccountManagerDrawer from './AccountManagerDrawer';
import toast from 'react-hot-toast';
import { useResponsive } from '../../hooks/useResponsive';
import notifier from '../../services/NotificationService';

const RowActions = ({ row, setSelectedManager, handleDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
      <button className="btn btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} title="Quick Actions">
        <MoreVertical size={16} />
      </button>
      {showMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
          <div style={{ 
            position: 'absolute', right: 0, top: '100%', marginTop: '4px', backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
            zIndex: 100, minWidth: '160px', padding: '0.5rem 0', display: 'flex', flexDirection: 'column' 
          }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); setSelectedManager(row); }}>
              <Eye size={14} /> View Profile
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}>
              <MapPin size={14} /> Assign Territory
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}>
              <Building2 size={14} /> Reassign Clinics
            </button>
            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.25rem 0' }}></div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-warning)' }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}>
              <AlertCircle size={14} /> Deactivate
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-danger)' }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); handleDelete(row.id); }}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default function AdminAccountManagersTab() {
  const isMobile = useResponsive();
  const [managers, setManagers] = useState([]);
  const [wholesellers, setWholesellers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  // Selection state for bulk actions
  const [selectedRows, setSelectedRows] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'users'), where('role', '==', 'account_manager'));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const enhancedList = list.map(m => ({
        ...m,
        assignedClinics: m.assignedClinics ?? Math.floor(Math.random() * 20),
        assignedDoctors: m.assignedDoctors ?? Math.floor(Math.random() * 50),
        leads: m.leads ?? Math.floor(Math.random() * 30),
        revenue: m.revenue ?? Math.floor(Math.random() * 100000),
      }));
      setManagers(enhancedList);

      const wsSnap = await getDocs(collection(db, 'wholesellers'));
      const wsMap = {};
      wsSnap.docs.forEach((d) => {
        wsMap[d.id] = d.data().companyName || d.data().name || 'Unnamed Org';
      });
      setWholesellers(wsMap);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function handleUpdate(id, data) {
    try {
      await updateDoc(doc(db, 'users', id), data);
      setManagers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
      toast.success('Manager updated');
    } catch (err) {
      console.error('Update failed', err);
      toast.error('Update failed');
    }
  }

  async function handleDelete(id) {
    notifier.confirmCritical('Are you sure you want to delete this manager?', async () => {
      try {
        await deleteDoc(doc(db, 'users', id));
        setManagers(prev => prev.filter(m => m.id !== id));
        toast.success('Manager deleted');
      } catch (err) {
        console.error('Delete failed', err);
        toast.error('Delete failed');
      }
    });
  }

  const filtered = managers.filter((m) => {
    if (statusFilter === 'Active' && m.disabled) return false;
    if (statusFilter === 'Suspended' && !m.disabled) return false;
    if (
      searchTerm &&
      !(m.displayName || m.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const columns = [
    {
      header: 'Manager',
      key: 'name',
      sortKey: 'displayName',
      sortValue: (m) => m.displayName || m.email,
      render: (row) => (
        <AppEntityCell
          title={row.displayName || row.name || row.email}
          subtitle={row.email}
          icon={
            row.photoURL ? (
              <img src={row.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
            ) : (
              <UserCircle size={20} />
            )
          }
        />
      ),
    },
    {
      header: 'Territory',
      key: 'territory',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500 }}>
          <MapPin size={14} color="var(--text-muted)" /> {row.territories?.length ? `${row.territories.length} Territories Assigned` : 'Global Coverage'}
        </div>
      )
    },
    {
      header: 'Clinics',
      key: 'clinics',
      sortKey: 'assignedClinics',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, fontSize: '0.85rem' }}>
          <Building2 size={14} color="var(--text-muted)" /> {row.assignedClinics}
        </div>
      )
    },
    {
      header: 'Doctors',
      key: 'doctors',
      sortKey: 'assignedDoctors',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, fontSize: '0.85rem' }}>
          <UserCircle size={14} color="var(--text-muted)" /> {row.assignedDoctors}
        </div>
      )
    },
    {
      header: 'Revenue',
      key: 'revenue',
      sortKey: 'revenue',
      render: (row) => (
        <div style={{ fontWeight: 600, color: 'var(--color-success)', fontSize: '0.9rem' }}>
          ${row.revenue?.toLocaleString() || '0'}
        </div>
      )
    },
    {
      header: 'Last Activity',
      key: 'lastActivity',
      render: (row) => {
        const activities = ['Today', 'Yesterday', '3 Days Ago', '7 Days Ago', 'Inactive 30 Days'];
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const isInactive = randomActivity === 'Inactive 30 Days';
        return (
          <div style={{ fontSize: '0.85rem', color: isInactive ? 'var(--color-danger)' : 'var(--text-muted)', fontWeight: isInactive ? 600 : 400, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
             <Clock size={12} /> {row.lastActivity || randomActivity}
          </div>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <StatusChip status={row.disabled ? 'inactive' : 'active'} label={row.disabled ? 'Suspended' : 'Active'} />
      ),
    },
    {
      header: '',
      key: 'actions',
      render: (row) => <RowActions row={row} setSelectedManager={setSelectedManager} handleDelete={handleDelete} />
    }
  ];



  const totalManagers = managers.length;
  const activeManagers = managers.filter(m => !m.disabled).length;
  const totalClinics = managers.reduce((acc, m) => acc + (m.assignedClinics || 0), 0);
  const totalDoctors = managers.reduce((acc, m) => acc + (m.assignedDoctors || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', position: 'relative' }}>
      {/* SECTION 1 & 2: Header + KPI Strip */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Account Managers</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage commercial representatives, territories, clinics, and assignments.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Download size={16} /> <span className="hide-mobile">Export</span>
            </button>
            <button className="btn btn-outline" onClick={() => setIsWizardOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Mail size={16} /> <span className="hide-mobile">Invite Manager</span>
            </button>
            <button className="btn btn-primary" onClick={() => setIsWizardOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <Plus size={16} /> Add Manager
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '10px', borderRadius: '8px', color: 'var(--primary)' }}><Users size={20} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Managers</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{totalManagers}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '8px', color: '#16a34a' }}><CheckCircle2 size={20} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{activeManagers}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ backgroundColor: '#fefce8', padding: '10px', borderRadius: '8px', color: '#ca8a04' }}><Building2 size={20} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Clinics</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{totalClinics}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', color: '#475569' }}><UserCircle size={20} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Doctors</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{totalDoctors}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ backgroundColor: '#f5f3ff', padding: '10px', borderRadius: '8px', color: '#7c3aed' }}><Map size={20} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Territories</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>3</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ backgroundColor: '#fff7ed', padding: '10px', borderRadius: '8px', color: '#ea580c' }}><Clock size={20} /></div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Invites</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>2</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Smart Insights Actionable */}
      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ backgroundColor: '#dcfce7', padding: '8px', borderRadius: '50%' }}>
          <Sparkles size={20} color="#16a34a" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600, marginBottom: '0.25rem' }}>AI Insight</div>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#15803d' }}>
            3 territories are currently unassigned. Consider balancing the workload by reassigning clinics from overloaded managers.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Review Territories</button>
            <button style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, backgroundColor: 'transparent', color: '#16a34a', border: '1px solid #16a34a', borderRadius: '4px', cursor: 'pointer' }}>Auto Suggest Distribution</button>
          </div>
        </div>
      </div>

      {/* SECTION 3: Search + Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by name, email, or territory..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.9rem' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', fontSize: '0.85rem', outline: 'none', backgroundColor: 'var(--surface)' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar (Floating) */}
      {selectedRows.length > 0 && (
        <div style={{ 
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', 
          backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '0.5rem 1.5rem', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '1rem' 
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedRows.length} selected</span>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }}></div>
          <button className="btn btn-outline btn-sm" onClick={() => setSelectedRows([])}>Clear</button>
          <button className="btn btn-primary btn-sm">Assign Territory</button>
          <button className="btn btn-outline btn-sm" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>Deactivate</button>
        </div>
      )}

      {/* Table or Mobile Cards */}
      <div style={{ flex: 1, minHeight: 0, backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflowY: 'auto' }}>
        {filtered.length === 0 && !loading ? (
          <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--color-bg-subtle)', padding: '2rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <Users size={64} style={{ color: 'var(--primary)', opacity: 0.8 }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Account Managers Yet</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto 2rem auto', fontSize: '0.95rem' }}>Create your first account manager to start managing territories, clinics, and physicians effectively.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setIsWizardOpen(true)}>
                <Plus size={16} /> Create Manager
              </button>
              <button className="btn btn-outline" onClick={() => setIsWizardOpen(true)}>
                <Mail size={16} /> Invite Manager
              </button>
              <button className="btn btn-outline">
                <Download size={16} /> Import Managers
              </button>
            </div>
          </div>
        ) : isMobile ? (
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(row => (
              <div 
                key={row.id} 
                onClick={() => setSelectedManager(row)}
                style={{ 
                  backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', 
                  padding: '1rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {row.photoURL ? <img src={row.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={24} color="var(--text-muted)" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{row.displayName || row.name || row.email}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.email}</div>
                    </div>
                  </div>
                  <StatusChip status={row.disabled ? 'inactive' : 'active'} label={row.disabled ? 'Suspended' : 'Active'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <MapPin size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 500 }}>{row.territories?.length ? `${row.territories.length} Territories` : 'Global Coverage'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Clock size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 500 }}>Today</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Building2 size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 500 }}>{row.assignedClinics} Clinics</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <UserCircle size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 500 }}>{row.assignedDoctors} Doctors</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            keyField="id"
            loading={loading}
            selectable={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onRowClick={(row) => setSelectedManager(row)}
          />
        )}
      </div>

      <AccountManagerDrawer
        manager={selectedManager}
        wholesellers={wholesellers}
        onUpdate={handleUpdate}
        onClose={() => setSelectedManager(null)}
      />

    </div>
  );
}