import React, { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle, User, ChevronDown, ShoppingCart, Menu, Sparkles, Globe, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useHeaderContext } from '../../../context/HeaderContext';
import { useTheme } from '../../../context/ThemeContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import './AppHeader.css';
import UserDropdown from '../../../navigation/UserDropdown';
import NotificationsPanel from './NotificationsPanel';
import AdminAIAssistant from './AdminAIAssistant';
import GlobalSearchModal from './GlobalSearchModal';
import AdminPortalSwitcher from './AdminPortalSwitcher';
import GlobalPreferencesDropdown from './GlobalPreferencesDropdown';

export default function AppHeader({ 
  title, subtitle, onSearchClick, cartCount = 0, onOpenCart, onToggleSidebar,
  onToggleDesktopAI, isDesktopAIOpen, showDesktopAIToggle
}) {
  const { user, userProfile, activeRole, logout } = useAuth();
  const { headerContent } = useHeaderContext();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // Escuchar el evento global para abrir el buscador (Cmd+K)
  useEffect(() => {
    const handleToggle = () => setIsSearchOpen(prev => !prev);
    document.addEventListener('toggle-global-search', handleToggle);
    return () => document.removeEventListener('toggle-global-search', handleToggle);
  }, []);
  
  // Try to get initials from the profile or user email
  const getInitials = () => {
    if (userProfile?.firstName) {
      const first = userProfile.firstName.charAt(0);
      const last = userProfile.lastName ? userProfile.lastName.charAt(0) : '';
      return `${first}${last}`.toUpperCase();
    }
    if (userProfile?.name) {
      const parts = userProfile.name.split(' ').filter(p => p.length > 0);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return userProfile.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'RP';
  };

  const displayName = userProfile?.firstName 
    ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
    : userProfile?.name || user?.email || 'User';

  return (
    <header className="app-header glass-header">
      {/* Left: Hamburger (Mobile) + Breadcrumbs / Context Title */}
      <div className="app-header-left">
        {onToggleSidebar && (
          <button className="app-header-hamburger" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
            <Menu size={22} strokeWidth={1.8} />
          </button>
        )}
        <div className="app-header-title-group">
          <div className="app-header-title">
            {title || t('nav.dashboard')}
          </div>
          {subtitle && (
            <div className="app-header-subtitle">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Center: Dynamic Utility Content OR Global Search */}
      <div className="app-header-center">
        {headerContent ? (
          headerContent
        ) : (
          <div className="app-header-search-container">
            <Search size={16} className="app-header-search-icon" />
            <input 
              type="text" 
              className="app-header-search" 
              placeholder={t('header.search')} 
              onClick={() => setIsSearchOpen(true)}
              readOnly 
            />
            <div className="app-header-shortcut">
              <kbd>⌘</kbd><kbd>K</kbd>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions & Profile */}
      <div className="app-header-right">
        {onOpenCart && (
          <button className="app-header-action" aria-label="Cart" onClick={onOpenCart}>
            <ShoppingCart size={20} strokeWidth={1.8} />
            {cartCount > 0 && (
              <div className="app-header-badge cart-badge">{cartCount}</div>
            )}
          </button>
        )}
        
        {showDesktopAIToggle && (
          <button 
            className="app-header-action ai-toggle-btn" 
            aria-label="Toggle Clinical AI"
            onClick={onToggleDesktopAI}
            style={{ color: isDesktopAIOpen ? 'var(--color-accent)' : 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={20} strokeWidth={2} className={isDesktopAIOpen ? 'pulse-icon' : ''} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'none' }} className="ai-label">Atlas AI</span>
          </button>
        )}
        
        <AdminPortalSwitcher />
        
        <button 
          className="app-header-action" 
          aria-label="Toggle Theme"
          onClick={toggleTheme}
          title={t('header.theme')}
        >
          {theme === 'dark' ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />}
        </button>

        <GlobalPreferencesDropdown />

        <button 
          className="app-header-action" 
          aria-label="Help & Support"
          onClick={() => setIsAIOpen(true)}
        >
          <HelpCircle size={20} strokeWidth={1.8} />
          {isAIOpen && <AdminAIAssistant onClose={() => setIsAIOpen(false)} />}
        </button>
        
        <button 
          className="app-header-action" 
          aria-label="Notifications"
          style={{ position: 'relative' }}
          onClick={() => setIsNotifOpen(!isNotifOpen)}
        >
          <Bell size={20} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <div className="app-header-badge cart-badge">{unreadCount > 99 ? '99+' : unreadCount}</div>
          )}
          
          {isNotifOpen && (
            <NotificationsPanel onClose={() => setIsNotifOpen(false)} />
          )}
        </button>

        <div 
          className="app-header-profile" 
          tabIndex={0} 
          role="button" 
          aria-haspopup="true"
          aria-expanded={isUserMenuOpen}
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          style={{ position: 'relative' }}
        >
          <div className="app-header-avatar" style={{ overflow: 'hidden' }}>
            {(userProfile?.photoURL || user?.photoURL) ? (
              <img 
                src={userProfile?.photoURL || user?.photoURL} 
                alt="Profile Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              getInitials()
            )}
          </div>
          <div className="app-header-user-info">
            <span className="app-header-user-name">{displayName}</span>
            <span className="app-header-user-role">{activeRole || 'User'}</span>
          </div>
          <ChevronDown size={14} color="var(--color-text-secondary)" style={{ marginLeft: '4px' }} />
          
          {isUserMenuOpen && (
            <UserDropdown 
              user={user}
              userProfile={userProfile}
              onClose={() => setIsUserMenuOpen(false)}
              onLogout={() => {
                setIsUserMenuOpen(false);
                if (logout) logout();
                window.location.href = '/';
              }}
            />
          )}
        </div>
      </div>
      
      {/* Global Search Command Palette */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
