import Check from "lucide-react/dist/esm/icons/check";
import Minus from "lucide-react/dist/esm/icons/minus";
import React from 'react';



export default function PermissionMatrixView({ roles, permissionCategories }) {
  // permissionCategories could be an array of objects like:
  // { module: 'Sales', permissions: [{ key: 'canCreateOrder', label: 'Create Order' }, ...] }

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflowX: 'auto',
      marginBottom: '2rem'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--background)' }}>
            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', textAlign: 'left', minWidth: '200px', position: 'sticky', left: 0, backgroundColor: 'var(--background)', zIndex: 2 }}>
              Module / Permission
            </th>
            {roles.map(role => (
              <th key={role.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', textAlign: 'center', minWidth: '120px' }}>
                <div style={{ color: role.color || 'var(--text-main)', marginBottom: '0.25rem' }}>{role.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{role.userCount} Users</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissionCategories.map((category, catIdx) => (
            <React.Fragment key={category.module}>
              {/* Category Header */}
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <td 
                  colSpan={roles.length + 1} 
                  style={{ 
                    padding: '0.75rem 1rem', 
                    fontWeight: 600, 
                    borderBottom: '1px solid var(--border)',
                    borderTop: catIdx > 0 ? '2px solid var(--border)' : 'none',
                    color: 'var(--text-main)'
                  }}
                >
                  {category.module}
                </td>
              </tr>
              {/* Permissions Rows */}
              {category.permissions.map(perm => (
                <tr key={perm.key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ 
                    padding: '0.75rem 1rem 0.75rem 2rem', 
                    borderRight: '1px solid var(--border)', 
                    position: 'sticky', 
                    left: 0, 
                    backgroundColor: 'var(--color-bg-surface)', 
                    zIndex: 1,
                    color: 'var(--text-main)'
                  }}>
                    {perm.label}
                  </td>
                  {roles.map(role => {
                    // Check if role has this permission active
                    const hasPerm = role.activePermissions && role.activePermissions.includes(perm.key);
                    return (
                      <td key={`${role.id}-${perm.key}`} style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {hasPerm ? (
                          <Check size={16} color="var(--color-success)" style={{ margin: '0 auto' }} />
                        ) : (
                          <Minus size={16} color="var(--border)" style={{ margin: '0 auto' }} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}