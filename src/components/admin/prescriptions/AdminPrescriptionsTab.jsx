import React, { useState } from 'react';
import {
  FileText,
  Search,
  Activity,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FilePlus,
  FlaskConical,
  Clock,
  Calendar,
  User,
  Eye,
  Archive,
  Package,
} from 'lucide-react';
import PrescriptionDetailModal from '../../prescriptions/PrescriptionDetailModal';
import ProtocolDrawerContent from '../protocols/ProtocolDrawerContent';
import StandardDrawer from '../../ui/StandardDrawer';

import { useFirestoreCollection } from '../../../hooks/data/useFirestoreCollection';
import { useDataTable } from '../../../hooks/ui/useDataTable';
import { useProducts } from '../../../hooks/admin/useProducts';

// ── Responsive CSS ────────────────────────────────────────────────────────────
const responsiveStyles = `
  .responsive-table-container {
    width: 100%;
    overflow-x: auto;
  }
  .flexible-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
  }
  .flexible-table th {
    text-align: left;
    padding: 1rem;
    font-size: 0.8rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #e2e8f0;
    background: #f8fafc;
  }
  .flexible-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }
  .flexible-row {
    transition: all 0.2s ease;
    cursor: pointer;
    background: white;
  }
  .flexible-row:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 768px) {
    .flexible-table thead {
      display: none;
    }
    .flexible-table, .flexible-table tbody, .flexible-table tr, .flexible-table td {
      display: block;
      width: 100%;
    }
    .flexible-row {
      margin-bottom: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .flexible-table td {
      border-bottom: none;
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .flexible-table td::before {
      content: attr(data-label);
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-right: 1rem;
    }
    .flexible-table td:first-child {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
  }
  
  .smart-chip {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    white-space: nowrap;
  }
  .smart-chip.active {
    background: #0f172a;
    color: white;
    border: 1px solid #0f172a;
  }
  .smart-chip.inactive {
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
  }
  .smart-chip.inactive:hover {
    border-color: #94a3b8;
    color: #334155;
  }
`;

// ── Status Configuration ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Active: { label: 'Active', emoji: '🟢', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  active: { label: 'Active', emoji: '🟢', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  sent: { label: 'Sent', emoji: '📨', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  draft: { label: 'Draft', emoji: '📝', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  fulfilled: {
    label: 'Fulfilled',
    emoji: '🔵',
    color: '#6366f1',
    bg: '#eef2ff',
    border: '#c7d2fe',
  },
  Fulfilled: {
    label: 'Fulfilled',
    emoji: '🔵',
    color: '#6366f1',
    bg: '#eef2ff',
    border: '#c7d2fe',
  },
  expired: { label: 'Expired', emoji: '🔴', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  Expired: { label: 'Expired', emoji: '🔴', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  cancelled: {
    label: 'Cancelled',
    emoji: '❌',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  assigned_to_wholesaler: {
    label: 'Awaiting Review',
    emoji: '🟡',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  viewed_by_patient: {
    label: 'Viewed by Patient',
    emoji: '👁️',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  added_to_bulk: {
    label: 'In Bulk Order',
    emoji: '🟣',
    color: '#7c3aed',
    bg: '#ede9fe',
    border: '#c4b5fd',
  },
  ordered: { label: 'Ordered', emoji: '✅', color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
};

function getStatusMeta(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || 'Unknown',
      emoji: '⚪',
      color: '#6b7280',
      bg: '#f9fafb',
      border: '#e5e7eb',
    }
  );
}

// ── Uniform KPI Summary Bar ───────────────────────────────────────────────────
function UniformKPIs({ data }) {
  const total = data.length;
  const awaiting = data.filter((d) =>
    ['assigned_to_wholesaler', 'draft'].includes(d.status)
  ).length;
  const active = data.filter((d) =>
    ['Active', 'active', 'sent', 'viewed_by_patient', 'ordered', 'added_to_bulk'].includes(d.status)
  ).length;
  const fulfilled = data.filter((d) => ['Fulfilled', 'fulfilled'].includes(d.status)).length;

  // Example "Expiring Soon" calculation (mock logic: just take 10% of active for demonstration, or real logic if date exists)
  const expiringSoon = data.filter((d) => {
    if (!['Active', 'active'].includes(d.status)) return false;
    if (d.followUpDate) {
      const followUp = new Date(d.followUpDate);
      const now = new Date();
      const diffDays = (followUp - now) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 14;
    }
    return false;
  }).length;

  const stats = [
    { label: 'Total Prescriptions', value: total, color: '#3b82f6', icon: <FileText size={16} /> },
    { label: 'Awaiting Review', value: awaiting, color: '#f59e0b', icon: <Clock size={16} /> },
    { label: 'Active', value: active, color: '#10b981', icon: <Activity size={16} /> },
    { label: 'Fulfilled', value: fulfilled, color: '#6366f1', icon: <CheckCircle2 size={16} /> },
    {
      label: 'Expiring Soon (< 14d)',
      value: expiringSoon,
      color: '#ef4444',
      icon: <AlertCircle size={16} />,
    },
  ];

  return (
    <div
      className="kpi-scroll-row"
      style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            flex: '1 1 200px',
            minWidth: 180,
            background: 'white',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
            <div
              style={{
                color: s.color,
                background: s.color + '15',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
              }}
            >
              {s.icon}
            </div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {s.label}
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Smart Chips ───────────────────────────────────────────────────────────────
function SmartChips({ activeChip, setActiveChip }) {
  const chips = [
    { id: 'all', label: 'All Prescriptions', icon: <Package size={14} /> },
    { id: 'awaiting', label: 'Awaiting Review', icon: <Clock size={14} /> },
    { id: 'active', label: 'Active', icon: <Activity size={14} /> },
    { id: 'recent', label: 'Recent (7 Days)', icon: <Calendar size={14} /> },
  ];

  return (
    <div
      className="smart-chips-bar"
      style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          className={`smart-chip ${activeChip === chip.id ? 'active' : 'inactive'}`}
          onClick={() => setActiveChip(chip.id)}
        >
          {chip.icon} {chip.label}
        </button>
      ))}
    </div>
  );
}

// ── Patient Avatar ────────────────────────────────────────────────────────────
function PatientAvatar({ name, size = 40 }) {
  const initials = (name || '??')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const hue = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: `hsl(${hue}, 60%, 88%)`,
        color: `hsl(${hue}, 50%, 35%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

// ── Flexible Table ────────────────────────────────────────────────────────────
function FlexibleTable({ data, onRowClick }) {
  return (
    <div className="responsive-table-container">
      <table className="flexible-table">
        <thead>
          <tr>
            <th>Patient & Doctor</th>
            <th>Protocol / Diagnosis</th>
            <th>Source & Items</th>
            <th>Status</th>
            <th>Dates</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((rx) => {
            const patient = rx.patient?.name || rx.patientName || 'Unknown Patient';
            const protocol = rx.protocol || rx.protocolName || '—';
            const diagnosis = rx.diagnosis || '—';
            const source = rx.source || rx.type || 'Manual';
            const apiCount = (rx.items || rx.products || []).length;
            const followUp = rx.followUpDate || rx.followUp || '—';
            const doctor = rx.doctor?.name || rx.doctorName || '—';
            const date = rx.createdAt
              ? new Date(rx.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : rx.dateIssued || '—';
            const meta = getStatusMeta(rx.status);

            return (
              <tr key={rx.id} className="flexible-row" onClick={() => onRowClick(rx)}>
                <td data-label="Patient & Doctor">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <PatientAvatar name={patient} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                        {patient}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <Stethoscope size={12} /> Dr. {doctor}
                      </div>
                    </div>
                  </div>
                </td>

                <td data-label="Protocol">
                  <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                    {protocol}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{diagnosis}</div>
                </td>

                <td data-label="Source & APIs">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      color: '#334155',
                      fontWeight: 600,
                    }}
                  >
                    <FilePlus size={14} color="#f59e0b" /> {source}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      color: '#64748b',
                      marginTop: '0.2rem',
                    }}
                  >
                    <FlaskConical size={12} color="#8b5cf6" /> {apiCount} item
                    {apiCount !== 1 ? 's' : ''}
                  </div>
                </td>

                <td data-label="Status">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '20px',
                      background: meta.bg,
                      color: meta.color,
                      border: `1px solid ${meta.border}`,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                </td>

                <td data-label="Dates">
                  <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                    <span style={{ color: '#94a3b8' }}>Issued:</span> {date}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                    <span style={{ color: '#94a3b8' }}>Follow-up:</span> {followUp}
                  </div>
                </td>

                <td data-label="Action" style={{ textAlign: 'right' }}>
                  <ChevronRight size={18} color="#94a3b8" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPrescriptionsTab() {
  const [activeChip, setActiveChip] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [linkedProtocol, setLinkedProtocol] = useState(null); // secondary: protocol drawer
  const [linkedProduct, setLinkedProduct] = useState(null); // secondary: product drawer

  // 1. Data Fetching
  const { data: prescriptions, isLoading: loading } = useFirestoreCollection('prescriptions', {
    orderByFields: [['createdAt', 'desc']],
  });
  const { products } = useProducts();

  // 2. Custom Filter Function for Smart Chips
  const filterByChip = (p) => {
    if (activeChip === 'all') return true;
    if (activeChip === 'awaiting') {
      return ['assigned_to_wholesaler', 'draft'].includes(p.status);
    }
    if (activeChip === 'active') {
      return ['Active', 'active', 'sent', 'viewed_by_patient', 'ordered', 'added_to_bulk'].includes(
        p.status
      );
    }
    if (activeChip === 'recent') {
      if (p.createdAt) {
        // useFirestoreCollection automatically normalizes dates to ISO strings
        const createdAtDate = new Date(p.createdAt);
        const diffDays = (new Date() - createdAtDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      return false;
    }
    return true;
  };

  // 3. DataTable state (Search, Filter, Paginate)
  const {
    paginatedData: filtered,
    search: searchTerm,
    setSearch: setSearchTerm,
  } = useDataTable(prescriptions, {
    filterFn: filterByChip,
    searchFields: ['patient.name', 'patientName', 'doctor.name', 'doctorName', 'id'],
    initialPageSize: 100, // Load more rows for this specific table
  });

  return (
    <>
      <style>{responsiveStyles}</style>
      <div
        style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: '1.25rem',
          backgroundColor: '#f8fafc',
        }}
      >
        {/* Page Header */}
        <div>
          <h1
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 0.2rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} color="white" />
            </div>
            Prescriptions
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            System of record for all patient prescriptions and recommendations.
          </p>
        </div>

        {/* Uniform KPI Summary Bar */}
        {!loading && <UniformKPIs data={prescriptions} />}

        {/* Filters and Smart Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'white',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <SmartChips activeChip={activeChip} setActiveChip={setActiveChip} />

          <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '400px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search by patient, doctor, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#f8fafc',
                color: '#0f172a',
                boxSizing: 'border-box',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
        </div>

        {/* Flexible Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              Loading prescriptions...
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5rem 2rem',
                gap: '1rem',
                color: '#94a3b8',
                background: 'white',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={28} color="#cbd5e1" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#475569', fontWeight: 700 }}>
                  No Prescriptions Found
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  {searchTerm || activeChip !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Prescriptions will appear here once created.'}
                </p>
              </div>
            </div>
          ) : (
            <FlexibleTable data={filtered} onRowClick={setSelectedItem} />
          )}
        </div>

        {/* Prescription Detail Drawer */}
        {selectedItem && (
          <PrescriptionDetailModal
            rx={selectedItem}
            products={products}
            onClose={() => setSelectedItem(null)}
            onProtocolClick={(proto) => setLinkedProtocol(proto)}
            onProductClick={(prod) => setLinkedProduct(prod)}
          />
        )}

        {/* Linked Protocol Secondary Drawer */}
        {linkedProtocol && (
          <StandardDrawer
            isOpen={true}
            onClose={() => setLinkedProtocol(null)}
            title={linkedProtocol.name || 'Protocol Details'}
            subtitle="Linked protocol"
            fullWorkspace={true}
          >
            <ProtocolDrawerContent
              protocol={linkedProtocol}
              products={products}
              onProductClick={(prod) => setLinkedProduct(prod)}
            />
          </StandardDrawer>
        )}

        {/* Linked Product Secondary Drawer */}
        {linkedProduct && (
          <StandardDrawer
            isOpen={true}
            onClose={() => setLinkedProduct(null)}
            title={linkedProduct.name || linkedProduct.displayName || 'Product Details'}
            subtitle={linkedProduct.category || ''}
            fullWorkspace={true}
          >
            <div
              style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              {linkedProduct.description && (
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {linkedProduct.description}
                </p>
              )}
              {[
                { label: 'SKU / Ref', value: linkedProduct.sku || linkedProduct.ref || '—' },
                { label: 'Category', value: linkedProduct.category || '—' },
                { label: 'Default Dosage', value: linkedProduct.defaultDosage || '—' },
                { label: 'Unit', value: linkedProduct.unit || '—' },
                {
                  label: 'Active',
                  value:
                    linkedProduct.isActive !== undefined
                      ? linkedProduct.isActive
                        ? 'Yes'
                        : 'No'
                      : '—',
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '0.6rem 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: '#94a3b8',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      width: 110,
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </StandardDrawer>
        )}
      </div>
    </>
  );
}
