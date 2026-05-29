import React, { useState, useMemo } from 'react';
import { Mail, Copy, Check, Eye, Tag, Zap, FileCode, Filter } from 'lucide-react';
import { EMAIL_TEMPLATE_REGISTRY } from '../../data/emailTemplateRegistry';

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
  const style = TAG_COLORS[tag] || { bg: '#f1f5f9', color: 'var(--color-text-secondary)' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 'var(--radius-md)',
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

export default function AdminEmailTemplatesTab() {
  const [selectedId, setSelectedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const selected = EMAIL_TEMPLATE_REGISTRY.find((t) => t.id === selectedId);

  const previewHtml = useMemo(() => {
    if (!selected) return '';
    try {
      return selected.getHtml();
    } catch (e) {
      return `<p style="color:red">Preview error: ${e.message}</p>`;
    }
  }, [selected]);

  const copyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const FILTERS = [
    { key: 'all', label: 'All Templates' },
    { key: 'auto', label: '⚡ Automatic' },
    { key: 'manual', label: '✋ Manual' },
    { key: 'order', label: '🛒 Orders' },
    { key: 'onboarding', label: '👤 Onboarding' },
  ];

  const filtered = EMAIL_TEMPLATE_REGISTRY.filter((t) => {
    const matchesFilter = activeFilter === 'all' || t.tags.includes(activeFilter);
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.includes(search.toUpperCase());
    return matchesFilter && matchesSearch;
  });

  const tableHeaderStyle = {
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid var(--border)'
  };

  const tableCellStyle = {
    padding: '1rem',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
    fontSize: '0.875rem',
    color: 'var(--text-main)'
  };

  if (selected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setSelectedId(null)}
            style={{
              background: 'none', border: 'none', color: 'var(--primary)',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '0.25rem'
            }}
          >
            ← Back to list
          </button>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Preview Template
          </h2>
        </div>
        
        {/* Preview content here */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Meta card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--color-primary)',
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: '5px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {selected.id}
                  </span>
                  <button
                    onClick={() => copyId(selected.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      color: copiedId === selected.id ? 'var(--success)' : 'var(--text-muted)',
                    }}
                  >
                    {copiedId === selected.id ? (
                      <>
                        <Check size={12} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy ID
                      </>
                    )}
                  </button>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  {selected.name}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {selected.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            </div>

            <p
              style={{
                margin: '0 0 1rem',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}
            >
              {selected.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div
                style={{
                  background: 'var(--background)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '4px',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <Zap size={12} /> Trigger
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    fontFamily: 'monospace',
                    lineHeight: 1.5,
                  }}
                >
                  {selected.trigger}
                </div>
              </div>
              <div
                style={{
                  background: 'var(--background)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '4px',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <FileCode size={12} /> Source File
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--primary)',
                    fontFamily: 'monospace',
                    lineHeight: 1.5,
                    wordBreak: 'break-all',
                  }}
                >
                  {selected.sourceFile}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '0.75rem',
                background: 'var(--background)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginBottom: '4px',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <Mail size={12} /> Channel
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                {selected.channel}
              </div>
            </div>
          </div>

          {/* HTML Preview */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1rem',
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--color-bg-app)',
              }}
            >
              <Eye size={15} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                Live Preview — Sample Data
              </span>
              <span
                style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}
              >
                Rendered with placeholder values
              </span>
            </div>
            <div
              style={{
                backgroundColor: '#f1f5f9',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  backgroundColor: 'white',
                  width: '100%',
                  maxWidth: '620px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              margin: '0 0 4px',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--primary)',
            }}
          >
            Email Template Library
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {EMAIL_TEMPLATE_REGISTRY.length} templates · Reference by ID when requesting changes
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '0.5rem 0.875rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            fontSize: '0.875rem',
            width: '220px',
            color: 'var(--text-main)',
            background: 'var(--background)',
          }}
        />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              padding: '0.35rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: `1px solid ${activeFilter === f.key ? 'var(--primary)' : 'var(--border)'}`,
              backgroundColor: activeFilter === f.key ? 'var(--primary)' : 'transparent',
              color: activeFilter === f.key ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main layout: data table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>ID</th>
              <th style={tableHeaderStyle}>Template Name & Description</th>
              <th style={tableHeaderStyle}>Tags</th>
              <th style={tableHeaderStyle}>Trigger</th>
              <th style={tableHeaderStyle} align="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...tableCellStyle, textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  No templates match this filter.
                </td>
              </tr>
            )}
            {filtered.map((tpl) => (
              <tr 
                key={tpl.id}
                style={{
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,113,189,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ ...tableCellStyle, width: '120px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {tpl.id}
                    </span>
                    <button
                      onClick={() => copyId(tpl.id)}
                      title="Copy ID"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                        color: copiedId === tpl.id ? 'var(--success)' : 'var(--text-muted)',
                      }}
                    >
                      {copiedId === tpl.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </td>
                <td style={tableCellStyle}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {tpl.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {tpl.description}
                  </div>
                </td>
                <td style={tableCellStyle}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {tpl.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
                  </div>
                </td>
                <td style={{ ...tableCellStyle, fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {tpl.trigger}
                </td>
                <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedId(tpl.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)', background: 'var(--background)',
                      color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={14} /> Preview
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminEmailTemplatesTab | Props: none
      </div>
    
</div>
  );
}
