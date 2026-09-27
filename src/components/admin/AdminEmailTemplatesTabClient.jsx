"use client";

import Mail from "lucide-react/dist/esm/icons/mail";
import Check from "lucide-react/dist/esm/icons/check";
import Eye from "lucide-react/dist/esm/icons/eye";
import Zap from "lucide-react/dist/esm/icons/zap";
import FileCode from "lucide-react/dist/esm/icons/file-code";
import Filter from "lucide-react/dist/esm/icons/filter";
import Globe from "lucide-react/dist/esm/icons/globe";
import Layers from "lucide-react/dist/esm/icons/layers";
import React, { useState, useMemo } from 'react';

import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import DataTable from '../ui/DataTable';
import CopyableId from '../ui/CopyableId';
import MetricCard from '../ui/MetricCard';
import StatusBadge from '../ui/StatusBadge';

function getCategorySemanticStatus(category) {
  switch (category) {
    case 'Onboarding':
      return 'active';
    case 'Orders':
      return 'po_created';
    case 'Access Control':
      return 'pending';
    case 'Clinical / B2B':
      return 'active';
    case 'Public Newsletters':
      return 'converted';
    default:
      return 'inactive';
  }
}

export default function AdminEmailTemplatesTabClient({ templates = [], isSubTab }) {
  const [activeCategory, setActiveCategory] = useState([]); // string[]
  const [activeTag, setActiveTag] = useState([]); // string[]
  const [search, setSearch] = useState('');
  const [metricScope, setMetricScope] = useState('filtered'); // 'filtered' | 'global'

  const CATEGORY_OPTIONS = [
    { label: '👤 Onboarding', value: 'Onboarding' },
    { label: '🛒 Orders', value: 'Orders' },
    { label: '🔐 Access Control', value: 'Access Control' },
    { label: '🩺 Clinical / B2B', value: 'Clinical / B2B' },
    { label: '📰 Public Newsletters', value: 'Public Newsletters' },
  ];

  const TAG_OPTIONS = [
    { label: '⚡ Automatic', value: 'auto' },
    { label: '✋ Manual', value: 'manual' },
    { label: '📬 Newsletters', value: 'newsletter' },
  ];

  const activeFilters = useMemo(() => {
    const list = [];
    activeCategory.forEach(cat => {
      list.push({
        key: `cat-${cat}`,
        label: 'Category',
        value: cat,
        onRemove: () => setActiveCategory(prev => prev.filter(v => v !== cat))
      });
    });
    activeTag.forEach(tg => {
      list.push({
        key: `tag-${tg}`,
        label: 'Mode',
        value: TAG_OPTIONS.find(t => t.value === tg)?.label || tg,
        onRemove: () => setActiveTag(prev => prev.filter(v => v !== tg))
      });
    });
    return list;
  }, [activeCategory, activeTag]);

  const filterOptions = useMemo(() => [
    {
      key: 'category',
      label: 'Category',
      multiSelect: true,
      values: activeCategory,
      options: CATEGORY_OPTIONS.map(c => ({
        ...c,
        count: templates.filter(t => t.category === c.value).length || null,
      })),
      onChange: setActiveCategory
    },
    {
      key: 'tag',
      label: 'Automation Mode',
      multiSelect: true,
      values: activeTag,
      options: TAG_OPTIONS.map(t => ({
        ...t,
        count: templates.filter(tp => tp.tags?.includes(t.value)).length || null,
      })),
      onChange: setActiveTag
    }
  ], [activeCategory, activeTag, templates]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory = activeCategory.length === 0 || activeCategory.includes(t.category);
      const matchesTag = activeTag.length === 0 || activeTag.some(f => t.tags?.includes(f));
      return matchesCategory && matchesTag;
    });
  }, [templates, activeCategory, activeTag]);

  const currentDataset = metricScope === 'filtered' ? filtered : templates;

  // Universal Table Standards: explicit widths summing to 100%, sortable headers, no ID clutter
  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Template Name',
      width: '42%',
      sortable: true,
      render: (val, row) => {
        const item = row || val || {};
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-bg-subtle, #f1f5f9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary, #003666)',
              flexShrink: 0
            }}>
              <Mail size={15} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem', letterSpacing: '-0.1px' }}>
                {item.name || 'Untitled Template'}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'category',
      header: 'Category',
      width: '18%',
      sortable: true,
      render: (val, row) => {
        const cat = row?.category || val || 'General';
        return <StatusBadge status={getCategorySemanticStatus(cat)} customLabel={cat} />;
      }
    },
    {
      key: 'mode',
      header: 'Mode',
      width: '18%',
      render: (val, row) => {
        const isAuto = row?.tags?.includes('auto');
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: 600,
            backgroundColor: isAuto ? '#f0fdf4' : '#fffbeb',
            color: isAuto ? '#166534' : '#92400e',
            border: `1px solid ${isAuto ? '#bbf7d0' : '#fde68a'}`
          }}>
            {isAuto ? <Zap size={11} /> : <Check size={11} />}
            {isAuto ? 'Automatic' : 'Manual'}
          </span>
        );
      }
    },
    {
      key: 'trigger',
      header: 'Trigger Event',
      width: '22%',
      render: (val, row) => {
        const trigger = (typeof val === 'string' ? val : (row?.trigger || val?.trigger || '—'));
        return (
          <code
            style={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
              color: 'var(--text-secondary, #475569)',
              padding: '3px 6px',
              borderRadius: '4px',
              border: '1px solid var(--border, #e2e8f0)',
              display: 'inline-block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={trigger}
          >
            {trigger}
          </code>
        );
      }
    }
  ], []);

  // Master-Detail via expandableRender (Rule #4 & #11): ID is here, with CopyableId, full description and live preview
  const expandableRender = (row) => {
    const previewHtml = row.previewHtml || `<p style="color:red">No preview available.</p>`;

    return (
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        {/* GCP Subheader Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {row.name}
              </h3>
              <StatusBadge status={getCategorySemanticStatus(row.category)} customLabel={row.category || 'General'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Template Identifier:
              </span>
              <CopyableId value={row.id} displayValue={row.id} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: row.tags?.includes('auto') ? '#f0fdf4' : '#fffbeb',
              color: row.tags?.includes('auto') ? '#166534' : '#92400e',
              border: `1px solid ${row.tags?.includes('auto') ? '#bbf7d0' : '#fde68a'}`
            }}>
              {row.tags?.includes('auto') ? <Zap size={13} /> : <Check size={13} />}
              {row.tags?.includes('auto') ? 'Automatic Cloud Trigger' : 'Manual Admin Dispatch'}
            </span>
          </div>
        </div>

        {/* Description Callout */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--color-primary, #003666)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-primary, #003666)', marginBottom: '0.35rem' }}>
            Template Scope & Automation Purpose
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
            {row.description}
          </div>
        </div>

        {/* Technical Specs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <Zap size={14} color="#f59e0b" /> Trigger Event
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {row.trigger}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <FileCode size={14} color="var(--color-primary)" /> Source Code Handler
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {row.sourceFile}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              <Mail size={14} color="#10b981" /> Dispatch Channel
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
              {row.channel || 'Cloud Function → Nodemailer'}
            </div>
          </div>
        </div>

        {/* Live HTML Preview */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={16} color="var(--color-primary)" />
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                Live HTML Preview (Sample Output)
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Rendered with mock data
            </span>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0' }}>
            <div
              style={{
                backgroundColor: 'white',
                width: '100%',
                maxWidth: '620px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
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
          subtitle={`${templates.length} templates · Governed by Google Cloud Console & Universal Table UX standards`}
          icon={Mail}
        />
      )}

      {/* Scope Switcher & Filter Indicator (Rule #22) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.5rem 0.75rem',
        backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
        borderRadius: '8px',
        border: '1px solid var(--border, #e2e8f0)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Layers size={14} color="var(--color-primary)" />
          <span>Scope:</span>
          <span style={{
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: metricScope === 'filtered' ? '#eff6ff' : '#f1f5f9',
            color: metricScope === 'filtered' ? '#1d4ed8' : '#475569',
            border: `1px solid ${metricScope === 'filtered' ? '#bfdbfe' : '#e2e8f0'}`
          }}>
            {metricScope === 'filtered'
              ? `Matching Active Filters (${filtered.length} of ${templates.length} templates)`
              : `Entire Registry (${templates.length} templates)`
            }
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setMetricScope(prev => prev === 'filtered' ? 'global' : 'filtered')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#fff',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <Globe size={12} />
            Switch to {metricScope === 'filtered' ? 'Global View' : 'Filtered View'}
          </button>
        </div>
      </div>

      {/* KPI Metric Cards (Rule #22) */}
      <div className="kpi-scroll-row" style={{ marginBottom: '0.25rem' }}>
        <MetricCard
          title="Total Templates"
          value={currentDataset.length}
          icon={Mail}
          color="var(--color-primary)"
        />
        <MetricCard
          title="Automatic Triggers"
          value={currentDataset.filter(t => t.tags?.includes('auto')).length}
          icon={Zap}
          color="var(--color-success)"
        />
        <MetricCard
          title="Manual Dispatches"
          value={currentDataset.filter(t => t.tags?.includes('manual')).length}
          icon={Check}
          color="var(--color-warning)"
        />
        <MetricCard
          title="Public Newsletters"
          value={currentDataset.filter(t => t.category === 'Public Newsletters' || t.tags?.includes('newsletter')).length}
          icon={Mail}
          color="var(--color-info)"
        />
      </div>

      {/* Global Search Bar (Rule #7 & #24) */}
      <div>
        <GlobalSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search templates by name, keyword or trigger..."
          resultCount={filtered.length}
          namespace="admin-email-templates"
          size="lg"
          filters={activeFilters}
          filterOptions={filterOptions}
        />
      </div>

      {/* Universal Table (Rule #1, #3, #4, #30, #31) */}
      <div className="gcp-table-container">
        <DataTable
          columns={columns}
          data={filtered}
          keyField={(row) => row.id}
          emptyMessage="No templates match the current filter selection."
          globalSearch={true}
          searchQuery={search}
          expandableRender={expandableRender}
        />
      </div>
    </div>
  );
}