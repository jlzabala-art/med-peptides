import User from "lucide-react/dist/esm/icons/user";
import Settings from "lucide-react/dist/esm/icons/settings";
import Bell from "lucide-react/dist/esm/icons/bell";
import Shield from "lucide-react/dist/esm/icons/shield";
import Monitor from "lucide-react/dist/esm/icons/monitor";
import Palette from "lucide-react/dist/esm/icons/palette";
import Plug from "lucide-react/dist/esm/icons/plug";
import Lock from "lucide-react/dist/esm/icons/lock";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import React, { useState, useEffect } from 'react';
import AccountOverview from './AccountOverview';
import ProfileSection from './sections/ProfileSection';
import PreferencesSection from './sections/PreferencesSection';
import NotificationsSection from './sections/NotificationsSection';
import SecurityCenter from './sections/SecurityCenter';
import AppearanceSection from './sections/AppearanceSection';
import IntegrationsSection from './sections/IntegrationsSection';
import PrivacySection from './sections/PrivacySection';
// import SessionsSection from './sections/SessionsSection'; // We will create this next
import SmartSaveIndicator from './SmartSaveIndicator';










import { useLocation, useNavigate } from 'react-router-dom';

const SECTIONS = [
  { id: 'profile', label: 'My Account', icon: User, component: ProfileSection },
  { id: 'security', label: 'Security & Passwords', icon: Shield, component: SecurityCenter },
  { id: 'preferences', label: 'Preferences', icon: Settings, component: PreferencesSection },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationsSection },
  { id: 'sessions', label: 'Active Sessions', icon: Monitor, component: ProfileSection },
  { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceSection },
  { id: 'integrations', label: 'Integrations', icon: Plug, component: IntegrationsSection },
  { id: 'privacy', label: 'Privacy', icon: Lock, component: PrivacySection },
];

export default function SettingsLayout({ onBack }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileView, setMobileView] = useState('menu'); // 'menu' | 'detail'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSectionClick = (id) => {
    setActiveSection(id);
    if (isMobile) {
      setMobileView('detail');
    }
  };

  const handleMobileBack = () => {
    setMobileView('menu');
  };

  const ActiveComponent = SECTIONS.find(s => s.id === activeSection)?.component || ProfileSection;
  const activeSectionData = SECTIONS.find(s => s.id === activeSection);

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {(!isMobile || mobileView === 'menu') && <AccountOverview />}
      <div style={{
        marginTop: '2rem',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '2rem',
        alignItems: 'flex-start'
      }}>
        {/* Navigation Sidebar / Mobile Menu */}
        {(!isMobile || mobileView === 'menu') && (
          <div style={{
            width: isMobile ? '100%' : '240px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: isMobile ? '1px solid var(--border)' : 'none',
                  background: !isMobile && activeSection === section.id ? 'var(--primary-light)' : (isMobile ? 'var(--surface)' : 'transparent'),
                  color: !isMobile && activeSection === section.id ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: !isMobile && activeSection === section.id ? 700 : 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isMobile ? '0 2px 4px rgba(0,0,0,0.02)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <section.icon size={20} color={!isMobile && activeSection === section.id ? 'var(--primary)' : 'var(--text-muted)'} />
                  {section.label}
                </div>
                {isMobile && <ChevronRight size={18} color="var(--text-muted)" />}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        {(!isMobile || mobileView === 'detail') && (
          <div style={{
            flex: 1,
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            minHeight: '400px',
            overflow: 'hidden'
          }}>
            {isMobile && (
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)' }}>
                <button 
                  onClick={handleMobileBack}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--primary)', padding: '0.5rem', margin: '-0.5rem' }}
                >
                  <ArrowLeft size={20} />
                </button>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {activeSectionData?.icon && <activeSectionData.icon size={18} color="var(--primary)" />}
                  {activeSectionData?.label}
                </h3>
              </div>
            )}
            <ActiveComponent />
          </div>
        )}

      </div>

      {/* Sticky Save State Indicator */}
      <SmartSaveIndicator />
    </div>
  );
}