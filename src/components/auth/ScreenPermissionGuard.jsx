import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../contexts/PermissionsContext';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
      <ShieldAlert size={32} />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
    <p className="text-gray-500 max-w-md">
      You do not have the required permissions to view this screen. If you believe this is an error, please contact your administrator.
    </p>
  </div>
);

/**
 * A wrapper component that checks if the current user has permission to view the tab.
 * @param {string} tabId - The ID of the tab to check permissions for.
 * @param {React.ReactNode} children - The component to render if permitted.
 */
export default function ScreenPermissionGuard({ tabId, children }) {
  const { hasPermission, loadingPermissions } = usePermissions();

  if (loadingPermissions) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!hasPermission(tabId)) {
    return <AccessDenied />;
  }

  return children;
}
