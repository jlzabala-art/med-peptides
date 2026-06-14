import Settings from "lucide-react/dist/esm/icons/settings";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Users from "lucide-react/dist/esm/icons/users";
import Shield from "lucide-react/dist/esm/icons/shield";
import ArrowRightLeft from "lucide-react/dist/esm/icons/arrow-right-left";
import Database from "lucide-react/dist/esm/icons/database";
import Globe from "lucide-react/dist/esm/icons/globe";
import Check from "lucide-react/dist/esm/icons/check";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Layers from "lucide-react/dist/esm/icons/layers";
import React, { useState } from 'react';











import DataTable from '../ui/DataTable';
import AppFilterBar from '../ui/AppFilterBar';
import AppEntityCell from '../ui/AppEntityCell';
import { useToast } from '../../hooks/useToast';

// Dynamic gadget fetch

export default function AdminGadgetRepositoryTab() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [gadgets, setGadgets] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('/gadgets-catalog.js')
      .then(res => res.js())
      .then(data => {
        setGadgets(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load gadgets catalog:', err);
        setLoading(false);
      });
  }, []);

  const filteredGadgets = gadgets.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'gadget',
      header: 'Gadget Name',
      sortKey: 'gadget',
      sortValue: (row) => row.name.toLowerCase(),
      render: (row) => {
        return <AppEntityCell title={row.name} subtitle={row.id} icon={<Layers size={18} />} />;
      },
    },
    {
      key: 'category',
      header: 'Category',
      sortKey: 'category',
      sortValue: (row) => row.category.toLowerCase(),
      render: (row) => (
        <span
          style={{
            display: 'inline-block',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'var(--surface-hover)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
          }}
        >
          {row.category}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Function / Description',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {row.description}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Used Portals',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: 600,
            }}
          >
            <Layers size={14} /> {row.status}
          </span>
          {row.usedIn && row.usedIn.length > 0 ? (
            <select
              style={{
                width: '100%',
                maxWidth: '180px',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                background: 'var(--surface)',
                color: 'var(--text-main)',
                fontSize: '0.75rem',
                outline: 'none',
              }}
            >
              <option disabled defaultValue>{row.usedIn.length} Portals</option>
              {row.usedIn.map((portal, idx) => (
                <option key={idx} value={portal}>
                  {portal}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not used</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '1400px',
      }}
    >
      {/* ── HEADER ── */}
      <div>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            margin: '0 0 0.5rem 0',
          }}
        >
          Gadget Repository
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Central repository for all operational platform widgets. The Admin gadgets below act as
          the architectural base class parameterizations for Doctor, Wholesaler, and Patient
          variations.
        </p>
      </div>

      <AppFilterBar searchPlaceholder="Search gadgets or functions..." onSearch={setSearchTerm} />

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading gadgets catalog...</div>
      ) : (
        <DataTable data={filteredGadgets} columns={columns} defaultSortKey="category" />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}
      >
        <AlertTriangle size={18} color="var(--color-warning)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
          <strong>Note:</strong> Modifying the base behavior of these gadgets globally affects their
          scoped derivatives across professional and patient portals.
        </span>
      </div>
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminGadgetRepositoryTab | Props: none
      </div>
</div>
  );
}