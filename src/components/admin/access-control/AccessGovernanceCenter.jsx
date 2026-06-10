import React, { useState } from 'react';
import ExecutiveSummary from './ExecutiveSummary';
import RoleCardsView from './RoleCardsView';
import PermissionMatrixView from './PermissionMatrixView';
import RoleEditorModal from './RoleEditorModal';

import { List, Grid, Search, Filter, Plus, Copy, RefreshCw } from 'lucide-react';

const DUMMY_ROLES = [
  { id: 'admin', name: 'Admin', description: 'Full System Control & Settings', userCount: 4, accessPercentage: 100, territories: 'All', pricingLevel: 'All', aiAccess: 'Full', lastModified: 'Today', color: 'var(--color-danger)' },
  { id: 'clinic', name: 'Clinic / Group', description: 'Multi-practitioner Clinic Management', userCount: 18, accessPercentage: 75, territories: 'UAE', pricingLevel: 'Clinic', aiAccess: 'Limited', lastModified: '2 days ago', color: '#8b5cf6' },
  { id: 'doctor', name: 'Practitioner', description: 'Prescribing Physician & Protocols', userCount: 42, accessPercentage: 65, territories: 'UAE + Qatar', pricingLevel: 'Clinic', aiAccess: 'Limited', lastModified: 'Today', color: 'var(--color-success)' },
  { id: 'wholesaler', name: 'Wholesaler', description: 'Bulk Peptide Sourcing & Logistics', userCount: 2, accessPercentage: 45, territories: 'GCC', pricingLevel: 'Wholesaler', aiAccess: 'None', lastModified: 'Last week', color: '#f59e0b' },
];

const DUMMY_CATEGORIES = [
  {
    module: 'Dashboard & Core',
    permissions: [
      { key: 'viewAdminDashboard', label: 'View Admin Dashboard' },
      { key: 'viewPhysicianDashboard', label: 'View Physician Dashboard' },
    ]
  },
  {
    module: 'Sales & Orders',
    permissions: [
      { key: 'canCreateOrder', label: 'Create Order' },
      { key: 'canBulkOrder', label: 'Bulk Orders' },
    ]
  },
  {
    module: 'AI & Intelligence',
    permissions: [
      { key: 'useClinicalAI', label: 'Use Clinical AI' },
      { key: 'usePricingAI', label: 'Use Pricing Intelligence' },
    ]
  }
];

export default function AccessGovernanceCenter() {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'matrix'
  const [editingRole, setEditingRole] = useState(null);
  
  const handleEditRole = (roleId) => {
    const role = DUMMY_ROLES.find(r => r.id === roleId);
    setEditingRole(role);
  };

  const handleSaveRole = (updatedRole) => {
    // In a real app, save to Firestore here
    setEditingRole(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '4rem' }}>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Access Governance Center</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage Identity, Security, and RBAC matrix across all modules and regions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="gcp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Copy size={16} />
            Clone Role
          </button>
          <button className="gcp-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Plus size={16} />
            Create Role
          </button>
        </div>
      </div>

      <ExecutiveSummary 
        rolesCount={8} 
        usersCount={124} 
        customRoles={3} 
        adminUsers={4} 
        changesThisMonth={27} 
        securityAlerts={2} 
        lastAudit="Today" 
      />

      {/* Toolbar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: 'var(--color-bg-surface)', 
        padding: '0.75rem 1.25rem', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--border)' 
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Search Placeholder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--background)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <Search size={14} color="var(--text-muted)" />
            <input type="text" placeholder="Search roles or permissions..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '200px' }} />
          </div>
          
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
            <Filter size={14} />
            Filters
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--background)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setViewMode('cards')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.4rem 0.75rem', 
              background: viewMode === 'cards' ? 'var(--color-bg-hover)' : 'transparent', 
              color: viewMode === 'cards' ? 'var(--text-main)' : 'var(--text-muted)',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
            }}
          >
            <Grid size={16} /> Cards
          </button>
          <button 
            onClick={() => setViewMode('matrix')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.4rem 0.75rem', 
              background: viewMode === 'matrix' ? 'var(--color-bg-hover)' : 'transparent', 
              color: viewMode === 'matrix' ? 'var(--text-main)' : 'var(--text-muted)',
              border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
            }}
          >
            <List size={16} /> Matrix
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <RoleCardsView 
          roles={DUMMY_ROLES} 
          onEditRole={handleEditRole} 
          onCloneRole={() => {}} 
          onDeleteRole={() => {}} 
        />
      ) : (
        <PermissionMatrixView 
          roles={DUMMY_ROLES} 
          permissionCategories={DUMMY_CATEGORIES} 
        />
      )}

      {editingRole && (
        <RoleEditorModal 
          role={editingRole} 
          onClose={() => setEditingRole(null)} 
          onSave={handleSaveRole} 
        />
      )}

    </div>
  );
}
