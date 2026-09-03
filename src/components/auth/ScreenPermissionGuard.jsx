import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import React from 'react';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useTranslation } from 'react-i18next';

const AccessDenied = () => {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
      <div style={{ width: '4rem', height: '4rem', backgroundColor: 'var(--color-error-bg, #fef2f2)', color: 'var(--color-error, #ef4444)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <ShieldAlert size={32} />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>{t('auth.guard.title', 'Access Restricted')}</h2>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: '28rem', margin: '0 auto' }}>
        {t('auth.guard.desc', 'You do not have the required permissions to view this screen. If you believe this is an error, please contact your administrator.')}
      </p>
    </div>
  );
};

const TAB_TO_ACTION_MAP = {
  // Admin Panel mappings
  'dashboard': 'view:admin',
  'finance': 'view:admin',
  'users': 'manage:staff',
  'invitations': 'manage:staff',
  'logistics': 'view:admin',
  'custom-synthesis': 'view:admin',
  'catalogs': 'view:admin',
  'ai-builder': 'view:admin',
  'access-levels': 'view:admin',
  
  // Clinical / Doctor mapping
  'patients': 'view:patients',
  'new-prescription': 'create:prescriptions',
  'prescriptions-history': 'view:prescriptions',
  'protocols': 'view:protocols',
  
  // Universal
  'my-profile': '*', // Everyone can view their profile
  'messages': '*',
  'calendar': '*',
  'products': 'view:products',
  'stock': 'view:products',
  'variants': 'view:products',
  'shipping': 'view:orders',
  'orders': 'view:orders',
};

/**
 * A wrapper component that checks if the current user has permission to view the tab.
 * @param {string} tabId - The ID of the tab to check permissions for.
 * @param {React.ReactNode} children - The component to render if permitted.
 */
export default function ScreenPermissionGuard({ tabId, children }) {
  const { can, is } = useRoleAccess();

  // If the user is an admin, always allow access to tabs inside panels.
  if (is('admin')) {
    return children;
  }

  const requiredAction = TAB_TO_ACTION_MAP[tabId];
  
  // If no specific action is mapped, we allow it to render, 
  // relying on PanelShell to block unauthorized panels globally.
  if (requiredAction && requiredAction !== '*' && !can(requiredAction)) {
    return <AccessDenied />;
  }

  return children;
}