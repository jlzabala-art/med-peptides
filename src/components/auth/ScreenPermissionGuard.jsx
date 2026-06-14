import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../contexts/PermissionsContext';

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

const TAB_TO_PERMISSION_MAP = {
  // Admin Panel mappings
  'dashboard': 'canAccessAdminDashboard',
  'finance': 'canAccessAdminDashboard',
  'users': 'manageStaff',
  'invitations': 'manageStaff',
  'logistics': 'canBulkOrder',
  'custom-synthesis': 'customSynthesis',
  'catalogs': 'canAccessAdminDashboard',
  'ai-builder': 'canAccessAdminDashboard',
  'access-levels': 'canAccessAdminDashboard',
  // General views
  'my-profile': 'canAccessAdminDashboard', // Everyone with admin access
  'messages': 'canAccessAdminDashboard',
  'calendar': 'canAccessAdminDashboard',
  'products': 'canAccessAdminDashboard',
  'stock': 'canAccessAdminDashboard',
  'variants': 'canAccessAdminDashboard',
  'shipping': 'canAccessAdminDashboard',
};

/**
 * A wrapper component that checks if the current user has permission to view the tab.
 * @param {string} tabId - The ID of the tab to check permissions for.
 * @param {React.ReactNode} children - The component to render if permitted.
 */
export default function ScreenPermissionGuard({ tabId, children }) {
  const { hasPermission, loadingPermissions } = usePermissions();

  if (loadingPermissions) {
    return (
      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <div style={{ height: '2rem', width: '2rem', backgroundColor: 'var(--color-border)', borderRadius: '9999px', marginBottom: '1rem' }}></div>
          <div style={{ height: '1rem', width: '8rem', backgroundColor: 'var(--color-border)', borderRadius: '0.25rem' }}></div>
        </div>
      </div>
    );
  }

  const permissionKey = TAB_TO_PERMISSION_MAP[tabId] || 'canAccessAdminDashboard'; // default safe

  if (!hasPermission(permissionKey)) {
    return <AccessDenied />;
  }

  return children;
}