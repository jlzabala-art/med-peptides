import React, { useMemo } from 'react';
import { Check, Minus } from 'lucide-react';
import DataTable from '../../ui/DataTable';


export default function PermissionMatrixView({ roles, permissionCategories }) {
  // Flatten data
  const data = useMemo(() => {
    return permissionCategories.flatMap((cat) =>
      cat.permissions.map((perm) => ({
        id: `${cat.module}-${perm.key}`,
        module: cat.module,
        ...perm,
      }))
    );
  }, [permissionCategories]);

  // Build dynamic columns
  const columns = useMemo(() => {
    const cols = [
      {
        key: 'module',
        header: 'Module',
        sortKey: 'module',
        render: (val, row) => <strong style={{ color: 'var(--text-main)' }}>{row.module}</strong>,
      },
      {
        key: 'label',
        header: 'Permission',
        sortKey: 'label',
        render: (val, row) => <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>,
      },
    ];

    roles.forEach((role) => {
      cols.push({
        key: `role_${role.id}`,
        header: (
          <div style={{ textAlign: 'center', lineHeight: '1.2' }}>
            <div style={{ color: role.color || 'var(--text-main)', fontWeight: 600 }}>{role.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
              {role.userCount} Users
            </div>
          </div>
        ),
        align: 'center',
        render: (val, row) => {
          const hasPerm = role.activePermissions && role.activePermissions.includes(row.key);
          return hasPerm ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Check size={16} color="var(--color-success)" />
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Minus size={16} color="var(--border)" />
            </div>
          );
        },
      });
    });

    return cols;
  }, [roles]);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="gcp-table-container">
        <DataTable
          columns={columns}
          data={data}
          keyField="id"
          emptyMessage="No permissions found."
        />
      </div>
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: PermissionMatrixView | Props: roles, permissionCategories
      </div>
    </div>
  );
}