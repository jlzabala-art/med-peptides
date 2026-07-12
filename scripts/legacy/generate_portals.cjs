const fs = require('fs');
const path = require('path');

const portals = ['pharmacy', 'clinic', 'supplier', 'wholesaler'];

portals.forEach(portal => {
  const dir = path.join('src/app', portal);
  const slugDir = path.join(dir, '[...slug]');
  fs.mkdirSync(slugDir, { recursive: true });

  const Capitalized = portal.charAt(0).toUpperCase() + portal.slice(1);

  // layout.jsx
  fs.writeFileSync(path.join(dir, 'layout.jsx'), `'use client';
import React from 'react';
import ${Capitalized}Home from '../../templates/${Capitalized}Home';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function ${Capitalized}Layout({ children }) {
  return (
    <ProtectedRoute requiredRole="${portal === 'pharmacy' ? 'compounding_pharmacy' : portal}">
      <${Capitalized}Home>
        {children}
      </${Capitalized}Home>
    </ProtectedRoute>
  );
}`);

  // page.jsx
  fs.writeFileSync(path.join(dir, 'page.jsx'), `'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardEngine from '../../engine/DashboardEngine';

export default function ${Capitalized}RootPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <DashboardEngine role="${portal === 'pharmacy' ? 'compounding_pharmacy' : portal}" dataContext={{}} />
    </div>
  );
}`);

  // [...slug]/page.jsx
  fs.writeFileSync(path.join(slugDir, 'page.jsx'), `'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import RoleDashboard from '../../../templates/RoleDashboard';
import AdminTabErrorBoundary from '../../../components/admin/AdminTabErrorBoundary';

export default function ${Capitalized}DynamicRoute({ params }) {
  const router = useRouter();
  const slug = params.slug || [];
  const path = slug.join('/');

  return (
    <AdminTabErrorBoundary tabId={path} tabLabel={path}>
      <RoleDashboard onBack={() => router.push('/')} />
    </AdminTabErrorBoundary>
  );
}`);

});

console.log('Portals generated.');
