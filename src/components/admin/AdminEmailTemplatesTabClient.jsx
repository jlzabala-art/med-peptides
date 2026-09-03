"use client";

import Mail from "lucide-react/dist/esm/icons/mail";
import Copy from "lucide-react/dist/esm/icons/copy";
import Check from "lucide-react/dist/esm/icons/check";
import Eye from "lucide-react/dist/esm/icons/eye";
import Tag from "lucide-react/dist/esm/icons/tag";
import Zap from "lucide-react/dist/esm/icons/zap";
import FileCode from "lucide-react/dist/esm/icons/file-code";
import Filter from "lucide-react/dist/esm/icons/filter";
import React, { useState, useMemo } from 'react';

import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTable from '../ui/DataTable';
import CopyableId from '../ui/CopyableId';
import MetricCard from '../ui/MetricCard';

const TAG_COLORS = {
  onboarding: { bg: '#dbeafe', color: 'var(--color-primary-hover)' },
  order: { bg: '#d1fae5', color: '#065f46' },
  admin: { bg: '#fef3c7', color: '#92400e' },
  auto: { bg: '#ede9fe', color: '#5b21b6' },
  manual: { bg: '#fce7f3', color: '#9d174d' },
  approval: { bg: '#dcfce7', color: '#166534' },
  denial: { bg: '#fee2e2', color: '#991b1b' },
  b2b: { bg: '#e0f2fe', color: '#0369a1' },
  invitation: { bg: '#fdf4ff', color: '#86198f' },
};

function TagBadge({ tag }) {
  const style = TAG_COLORS[tag] || { bg: '#f1f5f9', color: 'var(--text-secondary)' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 'var(--radius-md, 4px)',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.3px',
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {tag}
    </span>
  );
}

export default function AdminEmailTemplatesTabClient({ templates = [], isSubTab }) {
  const [activeFilter, setActiveFilter] = useState([]); // string[]
  const [search, setSearch] = useState('');

  const ALL_TAGS = [
    { label: '⚡ Automatic',  value: 'auto' },
    { label: '✋ Manual',     value: 'manual' },
    { label: '🛒 Orders',    value: 'order' },
    { label: '👤 Onboarding', value: 'onboarding' },
  ];

  const activeFilters = activeFilter.map(val => ({
    key: `tag-${val}`,
    label: 'Type',
    value: ALL_TAGS.find(t => t.value === val)?.label || val,
    onRemove: () => setActiveFilter(prev => prev.filter(v => v !== val))
  }));

  const filterOptions = [
    {
      key: 'tag',
      label: 'Template Type',
      multiSelect: true,
      values: activeFilter,
      options: ALL_TAGS.map(t => ({
        ...t,
        count: templates.filter(tp => tp.tags?.includes(t.value)).length || null,
      })),
      onChange: setActiveFilter
    }
  ];

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesFilter = activeFilter.length === 0 || activeFilter.some(f => t.tags?.includes(f));
      return matchesFilter;
    });
  }, [activeFilter]);

  const columns = useMemo(() => [
    {
      key: 'id',
      header: 'ID',
      render: (val) => <CopyableId value={val} />
    },
    {
      key: 'name',
      header: 'Template Name & Description',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            {row.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {row.description}
          </div>
        </div>
      )
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (tags) => (
        <div style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
          {tags.map(tag => <TagBadge key={tag} tag={tag} />)}
        </div>
      )
    },
    {
      key: 'trigger',
      header: 'Trigger',
      render: (val) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{val}</span>
    }
  ], []);

  const expandableRender = (row) => {
    const previewHtml = row.previewHtml || `<p style="color:red">No preview available.</p>`;

    return (
      <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-subtle, #f8fafc)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <Zap size={14} /> Trigger
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
              {row.trigger}
            </div>
          </div>
          
          <div style={{ background: 'white', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <FileCode size={14} /> Source File
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontFamily: 'monospace' }}>
              {row.sourceFile}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: '#f1f5f9' }}>
            <Eye size={16} color="var(--color-primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>Live Preview — Sample Data</span>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0' }}>
            <div
              style={{ backgroundColor: 'white', width: '100%', maxWidth: '620px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '0 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {!isSubTab && (
        <PageHeader 
          title="Email Template Library"
          subtitle={`${templates.length} templates · Reference by ID when requesting changes`}
          icon={Mail}
        />
      )}

      {/* KPI Cards */}
      <div className="kpi-scroll-row" style={{ marginBottom: '0.5rem' }}>
        <MetricCard
          title="Total Templates"
          value={templates.length}
          icon={Mail}
          color="var(--color-primary)"
        />
        <MetricCard
          title="Automatic Triggers"
          value={templates.filter(t => t.tags.includes('auto')).length}
          icon={Zap}
          color="var(--color-success)"
        />
        <MetricCard
          title="Manual Triggers"
          value={templates.filter(t => t.tags.includes('manual')).length}
          icon={Check}
          color="var(--color-warning)"
        />
        <MetricCard
          title="Custom Overrides"
          value={templates.filter(t => t.tags.includes('custom')).length || 0}
          icon={Mail}
          color="var(--color-info)"
        />
      </div>

      <div>
        <GlobalSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search templates by name or ID..."
          resultCount={filtered.length}
          namespace="admin-email-templates"
          size="lg"
          filters={activeFilters}
          filterOptions={filterOptions}
        />
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={columns}
          data={filtered}
          keyField={(row) => row.id}
          emptyMessage="No templates match this filter."
          globalSearch={true}
          searchQuery={search}
          expandableRender={expandableRender}
        />
      </div>

      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminEmailTemplatesTab | Props: none
      </div>
    </div>
  );
}