/* eslint-disable no-unused-vars */
import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './breadcrumbs.css';

/**
 * Breadcrumbs component for the admin dashboard.
 * It builds a hierarchy based on the current location pathname and query parameters.
 * Example: /admin?s=operations&t=users => Admin / Operations / Active Users
 */
const Breadcrumbs = () => {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const section = params.get('s'); // e.g., 'operations', 'architecture', 'intelligence'
  const sub = params.get('t'); // e.g., 'users', 'products'

  const crumbs = [];
  // Root
  crumbs.push({ label: 'Admin', path: '/admin' });

  const sectionMap = {
    operations: 'Operations',
    architecture: 'System Architecture',
    intelligence: 'Intelligence',
  };

  const subMap = {
    users: 'Active Users',
    products: 'Manage Products',
    prices: 'Pricing Matrix',
    orders: 'Orders & Billing',
    commissions: 'Commissions',
    'access-levels': 'Access Levels',
    'clinical-ai': 'Clinical AI Config',
    settings: 'Global Settings',
    deploy: 'Deploy & Hosting',
    analytics: 'System Analytics',
    'ai-logs': 'AI Logs',
    growth: 'Growth Signals',
  };

  if (section && sectionMap[section]) {
    crumbs.push({ label: sectionMap[section], path: `/admin?s=${section}` });
  }
  if (sub && subMap[sub]) {
    crumbs.push({ label: subMap[sub], path: `/admin?s=${section}&t=${sub}` });
  }

  return (
    <nav className="admin-breadcrumbs" aria-label="breadcrumb">
      {crumbs.map((c, i) => (
        <span key={c.path} className="breadcrumb-item">
          {i < crumbs.length - 1 ? (
            <Link to={c.path} className="breadcrumb-link">{c.label}</Link>
          ) : (
            <span className="breadcrumb-current">{c.label}</span>
          )}
          {i < crumbs.length - 1 && <span className="breadcrumb-separator">/</span>}
        </span>
      ))}
    </nav>
  );
};

export default memo(Breadcrumbs);
