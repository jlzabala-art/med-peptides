const fs = require('fs');
const file = 'src/components/admin/AdminAccountManagersTab.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import DataTable from '\.\.\/ui\/DataTable';/, "import DataTable from '../ui/DataTable';\nimport { Tabs, StatusChip } from '../ui';");

// replace the manual status span with StatusChip
content = content.replace(
  /<span className=\{`status-badge status-\$\{row\.disabled \? 'inactive' : 'active'\}`\}>\s*\{row\.disabled \? 'Suspended' : 'Active'\}\s*<\/span>/,
  "<StatusChip status={row.disabled ? 'inactive' : 'active'} label={row.disabled ? 'Suspended' : 'Active'} />"
);

const panelRegex = /return \([\s\S]+?\);\n\}/;

const newPanel = `return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '300px',
      }}
    >
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'profile',
            label: 'Operational Profile',
            icon: Briefcase,
            content: (
              <div style={{ maxWidth: '600px' }}>
                <h4
                  style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}
                >
                  Operational Assignments
                </h4>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Parent Wholeseller Organization
                    </label>
                    <select
                      defaultValue={manager.wholesellerId || ''}
                      onChange={(e) => onUpdate(manager.id, { wholesellerId: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '0.6rem',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        background: 'var(--color-bg-elevated)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="">-- Unassigned --</option>
                      {orgOptions.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      This limits the Account Manager's operational visibility to only clinics, doctors,
                      and orders belonging to this Wholeseller.
                    </p>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!manager.disabled}
                        onChange={(e) => onUpdate(manager.id, { disabled: !e.target.checked })}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        Account Active
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'contact',
            label: 'Contact & Routing',
            icon: Phone,
            content: (
              <div style={{ maxWidth: '600px' }}>
                <h4
                  style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}
                >
                  Contact Info
                </h4>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      defaultValue={manager.phone || ''}
                      onBlur={(e) => onUpdate(manager.id, { phone: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '0.6rem',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}`;

content = content.replace(panelRegex, newPanel);
fs.writeFileSync(file, content);
console.log('patched');
