"use client";

import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { useRoleAccess } from '../hooks/useRoleAccess';
import { triggerHaptic } from '../utils/haptics';
import PullToRefreshWrapper from '../components/ui/PullToRefreshWrapper';
import Skeleton from '../components/ui/Skeleton';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  FlaskConical,
  Settings,
  ShoppingBag,
  Pill,
  LogOut,
  Bell,
  ChevronRight,
  Laptop,
  History,
  Plus,
  MessageSquare,
  Blocks,
  FileText,
  Calendar,
  Beaker,
  Share2,
  Award
} from '@/lib/icons';



















import DoctorOverviewTab         from '../components/doctor/DoctorOverviewTab';





import DoctorPrescriptionsTab    from '../components/doctor/DoctorPrescriptionsTab';

import CatalogCreatorFlow        from '../components/wholesaler/CatalogCreatorFlow';
import RefillReminderBanner      from '../components/shared/RefillReminderBanner';
import AdminTabErrorBoundary     from '../components/admin/AdminTabErrorBoundary';
import DoctorMessagesTab         from '../components/doctor/DoctorMessagesTab';

import userRepository from '../repositories/userRepository';

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
  { id: 'shared-info',           label: 'Shared with Me',        icon: Share2,          alwaysOn: true },
  { id: 'messages',              label: 'Messages',              icon: MessageSquare,   alwaysOn: true },
  { id: 'assistants',            label: 'Staff & Assistants',    icon: Users,           perm: 'manageStaff' },
  { id: 'membership',            label: 'Plan & Membership 💎',  icon: Award,           alwaysOn: true },
  { id: 'settings',              label: 'Settings',              icon: Settings,        alwaysOn: true },
];

export const DR_HANIEH_ERDMANN_PROFILE = {
  id: 'dr-hanieh-erdmann',
  firstName: 'Hanieh',
  lastName: 'Erdmann',
  displayName: 'Dr. Hanieh Erdmann',
  doctorName: 'Dr. Hanieh Erdmann',
  specialty: 'German Board Certified Specialist Dermatologist & Trichologist',
  license: 'DHA-00013060-006',
  clinicName: 'Bedaya Polyclinic L.L.C.',
  clinicAddress: 'Villa 2, Street 49th, Al Wasl, Dubai',
  email: 'hanieh.erdmann@me.com',
  phone: '+971 50 36123',
  clinicPhone: '+971 4 333 3955',
  germanMedicalId: '802790100115715',
  medicalChamber: 'Ärztekammer Schleswig-Holstein',
  clinic: 'Bedaya Polyclinic L.L.C.',
  patientCount: 1,
  prescriptionCount: 1,
  role: 'doctor',
  isIndividualDoctor: true,
  subscriptionTier: 'basic',
  subscriptionStatus: 'active',
  subscriptionPlanName: 'Clinical Starter',
};

const INDIVIDUAL_DOCTOR_NAV_GROUPS = [
  {
    id: 'overview', label: 'Clinical Overview', emoji: '📊',
    items: [{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    id: 'clinical', label: 'My Clinical Practice', emoji: '🩺',
    items: [
      { id: 'patients', label: 'My Patients', icon: Users },
      { id: 'prescriptions-history', label: 'Prescriptions & Lifecycle', icon: Pill },
      { id: 'new-prescription', label: 'New Prescription', icon: Plus },
      { id: 'catalog', label: 'Lotusland Formulary', icon: ShoppingBag },
      { id: 'protocols', label: 'Clinical Protocols', icon: FlaskConical },
      { id: 'appointments', label: 'Consultations', icon: Calendar },
    ],
  },
  {
    id: 'shared', label: 'Shared Info & Formularies', emoji: '🔗',
    items: [
      { id: 'shared-info', label: 'Shared with Me', icon: Share2 },
    ],
  },
  {
    id: 'account', label: 'Doctor Credentials', emoji: '🛡️',
    items: [
      { id: 'settings', label: 'DHA License & Profile', icon: Settings },
      { id: 'membership', label: 'Plan & Membership 💎', icon: Award }
    ],
  },
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
      { id: 'leads',           label: 'Patient Leads',   icon: UserCheck },
      { id: 'appointments',    label: 'Appointments',    icon: Calendar },
      { id: 'lab-results',     label: 'Lab Results',     icon: Beaker },
      { id: 'recommendations', label: 'Recommendations', icon: ClipboardList },
      { id: 'research',        label: 'Research',        icon: FlaskConical },
    ],
  },
  {
    id: 'orders', label: 'Orders & Protocols', emoji: '📦',
    items: [
      { id: 'orders',       label: 'Orders & Deliveries', icon: ShoppingBag },
      { id: 'catalog',      label: 'Lotusland Formulary', icon: ShoppingBag },
      { id: 'protocols',    label: 'Clinical Protocols',  icon: FileText, disabled: false },
      { id: 'shared-info',  label: 'Shared with Me',      icon: Share2 },
      { id: 'messages',     label: 'Messages',            icon: MessageSquare, disabled: false }
    ],
  },
  {
    id: 'account', label: 'Account', emoji: '⚙️',
    items: [
      { id: 'assistants', label: 'Staff & Assistants', icon: Users },
      { id: 'settings',   label: 'Settings',           icon: Settings },
      { id: 'membership', label: 'Plan & Suscripción 💎', icon: Award }
    ],
  },
];

import PanelShell from '../components/shell/PanelShell';
import IndividualDoctorSimulationBanner from '../components/doctor/IndividualDoctorSimulationBanner';
import DoctorUpgradePlanModal from '../components/doctor/DoctorUpgradePlanModal';
import { useDoctorAiQuota } from '../hooks/useDoctorAiQuota';
import DoctorAiQuotaPill from '../components/doctor/DoctorAiQuotaPill';

export const DoctorContext = React.createContext({});

export default function DoctorDashboard({ children }) {
  const { user, userProfile, baseRole } = useAuth();
  const { can, is } = useRoleAccess();
  const isAdmin = is('admin');
  const pathname = usePathname();
  const router = useRouter();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  // Derive active tab from URL (e.g. /doctor/patients -> patients)
  const pathParts = pathname.split('/').filter(Boolean);
  // Default to 'overview' if exactly /doctor
  const activeTab = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'overview';
  const [sharedPatients, setSharedPatients] = useState([]);

  // Impersonation state for administrators
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('simulate') === 'dr-hanieh-erdmann') return 'dr-hanieh-erdmann';
      const stored = sessionStorage.getItem('impersonatedDoctorId') || localStorage.getItem('impersonatedDoctorId');
      if (stored) return stored;
    }
    return 'dr-hanieh-erdmann';
  });
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('simulate') === 'dr-hanieh-erdmann' || sessionStorage.getItem('impersonatedDoctorId') === 'dr-hanieh-erdmann') {
        return DR_HANIEH_ERDMANN_PROFILE;
      }
    }
    return DR_HANIEH_ERDMANN_PROFILE;
  });

  const isSimulatingDrErdmann = selectedDoctorId === 'dr-hanieh-erdmann';

  // Reactively sync simulation state from URL or storage on route changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const simParam = urlParams.get('simulate');
    const storedId = sessionStorage.getItem('impersonatedDoctorId') || localStorage.getItem('impersonatedDoctorId');
    const targetId = simParam || storedId || 'dr-hanieh-erdmann';
    if (targetId === 'dr-hanieh-erdmann') {
      setSelectedDoctorId('dr-hanieh-erdmann');
      setSelectedDoctorProfile(DR_HANIEH_ERDMANN_PROFILE);
      sessionStorage.setItem('impersonatedDoctorId', 'dr-hanieh-erdmann');
      localStorage.setItem('impersonatedDoctorId', 'dr-hanieh-erdmann');
    }
  }, [pathname]);

  // Staff doctor profile fetching
  const [staffDoctorProfile, setStaffDoctorProfile] = useState(null);
  const isStaffUser = baseRole === 'staff';
  const staffDoctorId = isStaffUser && userProfile?.assignedDoctorIds?.[0] ? userProfile.assignedDoctorIds[0] : null;

  useEffect(() => {
    if (!staffDoctorId) return;
    const fetchStaffDoctor = async () => {
      try {
        const dDoc = await userRepository.getUserById(staffDoctorId);
        if (dDoc) setStaffDoctorProfile(dDoc);
      } catch (err) {
        console.error('Error fetching staff doctor profile:', err);
      }
    };
    fetchStaffDoctor();
  }, [staffDoctorId]);

  // Fetch all doctors for admin impersonation list
  useEffect(() => {
    if (!isAdmin) return;
    const fetchDoctors = async () => {
      try {
        const docs = await userRepository.getDoctors();
        setDoctorsList(docs);
        // Load stored impersonated doctor profile
        const storedId = sessionStorage.getItem('impersonatedDoctorId');
        if (storedId) {
          const profile = docs.find(d => d.id === storedId);
          if (profile) setSelectedDoctorProfile(profile);
        }
      } catch (err) {
        if (err?.code === 'permission-denied') {
          console.warn('[DoctorDashboard] Doctors list query not permitted for current user.');
        } else {
          console.error('Error fetching doctors for admin impersonation:', err);
        }
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

  const handleRefresh = async () => {
    // Simulate network delay for refresh
    return new Promise(resolve => setTimeout(resolve, 800));
  };

  const handleExitSimulation = () => {
    setSelectedDoctorId('');
    setSelectedDoctorProfile(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('impersonatedDoctorId');
      localStorage.removeItem('impersonatedDoctorId');
    }
    router.push('/admin');
  };

  const effectiveDoctorId = isSimulatingDrErdmann ? 'dr-hanieh-erdmann' : doctorId;
  const effectiveDoctorMeta = isSimulatingDrErdmann ? DR_HANIEH_ERDMANN_PROFILE : doctorMeta;

  const subscriptionTier = isSimulatingDrErdmann 
    ? (selectedDoctorProfile?.subscriptionTier || 'basic') 
    : (activeDoctorProfile?.subscriptionTier || 'basic');
  const isProDoctor = subscriptionTier === 'advanced' || subscriptionTier === 'pro';

  const doctorQuota = useDoctorAiQuota(effectiveDoctorId, subscriptionTier);

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <PanelShell 
        allowedRoles={['doctor', 'admin', 'staff']}
        sidebarNavGroups={isSimulatingDrErdmann ? INDIVIDUAL_DOCTOR_NAV_GROUPS : DOCTOR_NAV_GROUPS}
        activeNavId={activeTab}
        onNavigate={(id) => router.push(`/doctor/${id}`)}
        portalTitle={isSimulatingDrErdmann ? 'Doctor Clinical Portal' : 'Clinical Portal'}
        roleContext="doctor"
        pageContext={{ activeTab }}
      >

      <div style={{ padding: '1.5rem' }}>
        {/* Doctor Subscription Tier & AI Quota Status Pills */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          <DoctorAiQuotaPill quota={doctorQuota} onOpenUpgrade={() => setIsUpgradeModalOpen(true)} />
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: isProDoctor ? '1px solid #99f6e4' : '1px solid #fed7aa',
              backgroundColor: isProDoctor ? '#f0fdfa' : '#fff7ed',
              color: isProDoctor ? '#0f766e' : '#c2410c',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'transform 0.15s ease',
            }}
            title="Click to view subscription details or request Pro upgrade"
          >
            {isProDoctor ? (
              <>💎 Advanced Pro Plan • Active</>
            ) : (
              <>🟢 Basic Plan (Free) • Upgrade to Pro ⚡</>
            )}
          </button>
        </div>

        <AdminTabErrorBoundary tabId={activeTab} tabLabel={currentTab?.label || activeTab}>
          <DoctorContext.Provider value={{
            doctorId: effectiveDoctorId,
            doctorMeta: effectiveDoctorMeta,
            isSimulatingDrErdmann,
            isIndividualDoctor: isSimulatingDrErdmann,
            subscriptionTier,
            isProDoctor,
            doctorQuota,
            openUpgradeModal: () => setIsUpgradeModalOpen(true),
            sharedPatients,
            setSharedPatients
          }}>
            {children}

            <DoctorUpgradePlanModal
              isOpen={isUpgradeModalOpen}
              onClose={() => setIsUpgradeModalOpen(false)}
              currentTier={subscriptionTier}
              doctorName={doctorName}
              doctorId={effectiveDoctorId}
              onUpgradeSuccess={() => {
                if (isSimulatingDrErdmann) {
                  setSelectedDoctorProfile(prev => ({ ...prev, subscriptionTier: 'advanced' }));
                }
              }}
            />
          </DoctorContext.Provider>
        </AdminTabErrorBoundary>
      </div>
    </PanelShell>
    </PullToRefreshWrapper>
  );
}