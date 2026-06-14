import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Search from "lucide-react/dist/esm/icons/search";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import Users from "lucide-react/dist/esm/icons/users";
import UserRound from "lucide-react/dist/esm/icons/user-round";
import Building from "lucide-react/dist/esm/icons/building";
import CheckSquare from "lucide-react/dist/esm/icons/check-square";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import Plus from "lucide-react/dist/esm/icons/plus";
import BriefcaseMedical from "lucide-react/dist/esm/icons/briefcase-medical";
import LineChart from "lucide-react/dist/esm/icons/line-chart";
import Settings from "lucide-react/dist/esm/icons/settings";
import LogOut from "lucide-react/dist/esm/icons/log-out";
import React, { useState, useEffect } from 'react';














import AtlasHealthLogo from '../../brand/AtlasHealthLogo';
import './AppSidebar.css';

// ── Mobile Bottom Nav ────────────────────────────────────────────────────────
function MobileBottomNav({ activeId, onNavigate }) {
  const primaryModules = [
    { id: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/patients', label: 'Patients', icon: Users },
    { id: '/tasks', label: 'Tasks', icon: CheckSquare },
    { id: '/clinics', label: 'Clinics', icon: Building },
    { id: '/more', label: 'More', icon: MoreHorizontal }
  ];

  return (
    <>
      <button className="mobile-fab" aria-label="Quick Action">
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <nav className="mobile-bottom-nav">
        {primaryModules.map(mod => {
          const Icon = mod.icon;
          const isActive = activeId === mod.id || (mod.id === '/more' && activeId === 'more');
          return (
            <button 
              key={mod.id} 
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(mod.id)}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="bottom-nav-label">{mod.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

// ── Desktop Sidebar Item ──────────────────────────────────────────────────────
function SidebarItem({ item, isActive, expanded, onClick }) {
  const Icon = item.icon;
  return (
    <button
      className={`sb-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(item.id)}
      data-tooltip={!expanded ? item.label : undefined}
    >
      <span className="sb-item-icon">
        {Icon && <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
      </span>
      <span className="sb-item-label">{item.label}</span>
      {item.badge && expanded && (
        <span style={{ marginLeft: 'auto', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '12px' }}>
          {item.badge}
        </span>
      )}
    </button>
  );
}

// ── Main AppSidebar ───────────────────────────────────────────────────────────
export default function AppSidebar({
  groups = [],
  pinnedItems = [],
  activeId,
  onNavigate,
  isMobile,
  footer
}) {
  const [expanded, setExpanded] = useState(true);

  if (isMobile) {
    return <MobileBottomNav activeId={activeId} onNavigate={onNavigate} />;
  }

  // Linear/Notion style sidebar
  return (
    <aside className={`app-sidebar ${!expanded ? 'collapsed' : ''}`}>
      {/* Top Header Section */}
      <div className="sb-header">
        <div className="sb-brand">
          <AtlasHealthLogo size={24} />
          <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--sb-text)' }}>Atlas Health</span>
        </div>
        <button 
          className="sb-hamburger" 
          onClick={() => setExpanded(!expanded)}
          style={{ marginLeft: expanded ? 'auto' : '0' }}
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="sb-scroll">
        {/* Render pinned items */}
        {pinnedItems.length > 0 && (
          <div className="sb-group">
            <div className="sb-group-items">
              {pinnedItems.map(item => (
                <SidebarItem 
                  key={item.id} 
                  item={item} 
                  isActive={activeId === item.id} 
                  expanded={expanded}
                  onClick={onNavigate}
                />
              ))}
            </div>
            <div className="sb-divider" />
          </div>
        )}

        {/* Render standard groups */}
        {groups.map((group, idx) => (
          <div key={group.id} className="sb-group">
            {group.label && <div className="sb-group-header">{group.label}</div>}
            <div className="sb-group-items">
              {group.items?.map(item => (
                <SidebarItem 
                  key={item.id} 
                  item={item} 
                  isActive={activeId === item.id} 
                  expanded={expanded}
                  onClick={onNavigate}
                />
              ))}
            </div>
            {idx < groups.length - 1 && <div className="sb-divider" />}
          </div>
        ))}

      </nav>

      {/* Bottom Footer Section */}
      {footer && (
        <div className="sb-footer">
          <button className="sb-item" onClick={footer.onClick} data-tooltip={!expanded ? footer.label : undefined}>
            <span className="sb-item-icon"><LogOut size={18} /></span>
            <span className="sb-item-label">{footer.label}</span>
          </button>
        </div>
      )}

    </aside>
  );
}