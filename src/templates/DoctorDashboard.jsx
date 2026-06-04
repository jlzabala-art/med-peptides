import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, ClipboardList, FlaskConical,
  Settings, ShoppingBag, Pill, LogOut, Bell, ChevronRight, Laptop, History, Plus,
  MessageSquare, Blocks, FileText, Calendar, Beaker
} from 'lucide-react';

import DoctorOverviewTab         from '../components/doctor/DoctorOverviewTab';
import PhysicianPatientsTab      from '../components/doctor/DoctorPatientsTab';
import PhysicianRecommendationsTab from '../components/doctor/DoctorRecommendationsTab';
import PhysicianOrdersTab        from '../components/doctor/DoctorOrdersTab';
import PhysicianProtocolsTab     from '../components/doctor/DoctorProtocolsTab';
import PhysicianSettingsTab      from '../components/doctor/DoctorSettingsTab';
import DoctorPrescriptionsTab    from '../components/doctor/DoctorPrescriptionsTab';
import PhysicianAssistantsTab    from '../components/doctor/DoctorAssistantsTab';
import CatalogCreatorFlow        from '../components/wholesaler/CatalogCreatorFlow';
import RefillReminderBanner      from '../components/shared/RefillReminderBanner';
import AdminTabErrorBoundary     from '../components/admin/AdminTabErrorBoundary';
import DoctorMessagesTab         from '../components/doctor/DoctorMessagesTab';

// Firestore notifications listener
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ── Nav groups (Google Cloud-style semantic grouping) ──────────────────────
// Flat list kept for permission filtering
const ALL_TABS = [
  { id: 'overview',              label: 'Overview',              icon: LayoutDashboard, alwaysOn: true },
  { id: 'new-prescription',      label: 'New Prescription',      icon: Plus,            alwaysOn: true },
  { id: 'prescriptions-history', label: 'Prescriptions History', icon: History,         alwaysOn: true },
  { id: 'patients',              label: 'My Patients',           icon: Users,           alwaysOn: true },
  { id: 'appointments',          label: 'Appointments',          icon: Calendar,        alwaysOn: true },
  { id: 'lab-results',           label: 'Lab Results',           icon: Beaker,          alwaysOn: true },
  { id: 'research',              label: 'Research',              icon: FlaskConical,    alwaysOn: true },
  { id: 'orders',                label: 'Orders',                icon: ShoppingBag,     perm: 'canBulkOrder' },
  { id: 'recommendations',       label: 'Recommendations',       icon: ClipboardList,   perm: 'canRecommend' },
  { id: 'protocols',             label: 'Protocols',             icon: FlaskConical,    alwaysOn: true },
  { id: 'catalog-builder',       label: 'Catalog Builder',       icon: ShoppingBag,     alwaysOn: true },
  { id: 'messages',              label: 'Messages',              icon: MessageSquare,   alwaysOn: true },
  { id: 'assistants',            label: 'Staff & Assistants',    icon: Users,           perm: 'manageStaff' },
  { id: 'settings',              label: 'Settings',              icon: Settings,        alwaysOn: true },
];

const DOCTOR_NAV_GROUPS = [
  {
    id: 'overview', label: 'Overview', emoji: '📊',
    items: [{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    id: 'prescriptions', label: 'Prescriptions', emoji: '💊',
    items: [
      { id: 'new-prescription',      label: 'New Prescription',      icon: Plus },
      { id: 'prescriptions-history', label: 'Prescriptions History', icon: History },
    ],
  },
  {
    id: 'clinical', label: 'Clinical Work', emoji: '🧬',
    items: [
      { id: 'patients',        label: 'My Patients',     icon: Users },
      { id: 'appointments',    label: 'Appointments',    icon: Calendar },
      { id: 'lab-results',     label: 'Lab Results',     icon: Beaker },
      { id: 'recommendations', label: 'Recommendations', icon: ClipboardList },
      { id: 'research',        label: 'Research',        icon: FlaskConical },
    ],
  },
  {
    id: 'orders', label: 'Orders & Protocols', emoji: '📦',
    items: [
      { id: 'orders',    label: 'Orders',    icon: ShoppingBag },
      { id: 'protocols', label: 'Protocols', icon: FileText, disabled: false },
      { id: 'catalog-builder', label: 'Catalog Builder', icon: Blocks, disabled: false },
      { id: 'messages', label: 'Messages', icon: MessageSquare, disabled: false }
    ],
  },
  {
    id: 'account', label: 'Account', emoji: '⚙️',
    items: [
      { id: 'assistants', label: 'Staff & Assistants', icon: Users },
      { id: 'settings',   label: 'Settings',           icon: Settings }
    ],
  },
];

// ── Main ───────────────────────────────────────────────────────────────────────
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import AppPortalLayout from '../layout/AppPortalLayout';

export default function DoctorDashboard() {
  const { user, userProfile, baseRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Derive active tab from URL (e.g. /doctor/patients -> patients)
  const pathParts = location.pathname.split('/').filter(Boolean);
  // Default to 'overview' if exactly /doctor
  const activeTab = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'overview';
  const [sharedPatients, setSharedPatients] = useState([]);

  // Impersonation state for administrators
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(() => sessionStorage.getItem('impersonatedDoctorId') || '');
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState(null);
  
  // Staff doctor profile fetching
  const [staffDoctorProfile, setStaffDoctorProfile] = useState(null);
  const isStaffUser = baseRole === 'staff';
  const staffDoctorId = isStaffUser && userProfile?.assignedDoctorIds?.[0] ? userProfile.assignedDoctorIds[0] : null;

  useEffect(() => {
    if (!staffDoctorId) return;
    const fetchStaffDoctor = async () => {
      try {
        const dDoc = await getDoc(doc(db, 'users', staffDoctorId));
        if (dDoc.exists()) setStaffDoctorProfile(dDoc.data());
      } catch (err) {
        console.error('Error fetching staff doctor profile:', err);
      }
    };
    fetchStaffDoctor();
  }, [staffDoctorId]);

  const isAdmin = baseRole === 'admin';

  // Fetch all doctors for admin impersonation list
  useEffect(() => {
    if (!isAdmin) return;
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setDoctorsList(docs);
        
        // Load stored impersonated doctor profile
        const storedId = sessionStorage.getItem('impersonatedDoctorId');
        if (storedId) {
          const profile = docs.find(d => d.id === storedId);
          if (profile) setSelectedDoctorProfile(profile);
        }
      } catch (err) {
        console.error('Error fetching doctors for admin impersonation:', err);
      }
    };
    fetchDoctors();
  }, [isAdmin]);

  // Compute active doctor context
  const activeDoctorProfile = isAdmin && selectedDoctorProfile 
    ? selectedDoctorProfile 
    : (isStaffUser ? staffDoctorProfile : userProfile);
    
  const doctorId = isAdmin && selectedDoctorId 
    ? selectedDoctorId 
    : (isStaffUser ? staffDoctorId : user?.uid);
    
  const doctorName = activeDoctorProfile?.firstName
    ? `Dr. ${activeDoctorProfile.firstName} ${activeDoctorProfile.lastName || ''}`.trim()
    : (isStaffUser && activeDoctorProfile ? `Equipo de Dr. ${activeDoctorProfile.lastName || ''}` : (user?.displayName || 'Physician'));
    
  const doctorMeta = { doctorName, specialty: activeDoctorProfile?.specialty || '' };

  const currentTab = ALL_TABS.find(t => t.id === activeTab);

  return (
    <AppPortalLayout allowedRoles={['doctor', 'admin', 'staff']}>
      {isAdmin && (
        <div style={{
          background: '#fff7e6',
          borderBottom: '1px solid #ffe7ba',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: '#d46b08',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Laptop size={16} />
            <span><strong>Admin Impersonation Mode:</strong> Viewing portal as doctor:</span>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedDoctorId(id);
                if (id) {
                  sessionStorage.setItem('impersonatedDoctorId', id);
                  const profile = doctorsList.find(d => d.id === id);
                  setSelectedDoctorProfile(profile || null);
                } else {
                  sessionStorage.removeItem('impersonatedDoctorId');
                  setSelectedDoctorProfile(null);
                }
              }}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #ffd591',
                borderRadius: '4px',
                background: 'var(--color-bg-surface)',
                color: '#202124',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">— Select Doctor (Viewing as Self) —</option>
              {doctorsList.map(docItem => (
                <option key={docItem.id} value={docItem.id}>
                  Dr. {docItem.firstName || ''} {docItem.lastName || ''} ({docItem.email || 'No email'})
                </option>
              ))}
            </select>
          </div>
          <span style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 600 }}>Developer Tool</span>
        </div>
      )}

      <div style={{ padding: '2rem' }}>
        <AdminTabErrorBoundary tabId={activeTab} tabLabel={currentTab?.label || activeTab}>
          <Outlet context={{ doctorId, doctorMeta, sharedPatients, setSharedPatients, navigate }} />
        </AdminTabErrorBoundary>
      </div>
    </AppPortalLayout>
  );
}
