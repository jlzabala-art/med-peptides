import React, { useState } from 'react';
import History from 'lucide-react/dist/esm/icons/history';
import Edit3 from 'lucide-react/dist/esm/icons/edit-3';
import Copy from 'lucide-react/dist/esm/icons/copy';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Plus from 'lucide-react/dist/esm/icons/plus';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import User from 'lucide-react/dist/esm/icons/user';
import Tag from 'lucide-react/dist/esm/icons/tag';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import GlobalSearchBar from '../../../ui/GlobalSearchBar';

// ── Event type config ─────────────────────────────────────────────────────────
const EVENT_TYPES = {
  created:           { label: 'Created',                    color: '#22c55e', bg: '#dcfce7', icon: Plus },
  modified:          { label: 'Modified',                   color: '#3b82f6', bg: '#dbeafe', icon: Edit3 },
  duplicated:        { label: 'Duplicated',                 color: '#7c3aed', bg: '#f3e8ff', icon: Copy },
  published:         { label: 'Published',                  color: '#0ea5e9', bg: '#e0f2fe', icon: ShieldCheck },
  archived:          { label: 'Archived',                   color: '#64748b', bg: '#f1f5f9', icon: Tag },
  prescription_gen:  { label: 'Prescription Generated',    color: '#d97706', bg: '#fef3c7', icon: FileText },
  version_bump:      { label: 'Version Updated',            color: '#a855f7', bg: '#f5f3ff', icon: Tag },
};

function getEventStyle(type) {
  return EVENT_TYPES[type] || { label: type, color: '#64748b', bg: '#f1f5f9', icon: History };
}

function formatTs(ts) {
  if (!ts) return '—';
  const d = typeof ts === 'string' ? new Date(ts) : ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Build synthetic history from protocol metadata ────────────────────────────
function buildHistoryFromProtocol(protocol) {
  const events = [...(protocol?.audit_log || [])];

  // Always add creation event from createdAt / created_at
  const createdAt = protocol?.createdAt || protocol?.created_at;
  if (createdAt && !events.find(e => e.type === 'created')) {
    events.unshift({
      id: 'synthetic-created',
      type: 'created',
      actor: protocol?.createdBy || protocol?.created_by || 'System',
      ts: createdAt,
      summary: `Protocol "${protocol?.protocol_name || 'Unnamed'}" created`,
      details: {
        category: protocol?.therapeutic_category,
        status: 'draft',
        version: protocol?.version_number || '1.0',
      },
    });
  }

  // Add version bump if version > 1
  const version = parseFloat(protocol?.version_number);
  if (version > 1 && !events.find(e => e.type === 'version_bump')) {
    events.push({
      id: 'synthetic-version',
      type: 'version_bump',
      actor: protocol?.lastModifiedBy || 'Admin',
      ts: protocol?.updatedAt || protocol?.updated_at || new Date().toISOString(),
      summary: `Version bumped to ${version}`,
      details: { new_version: String(version) },
    });
  }

  // Add published event if status is active
  if (['active', 'published'].includes(protocol?.status) && !events.find(e => e.type === 'published')) {
    events.push({
      id: 'synthetic-published',
      type: 'published',
      actor: protocol?.publishedBy || 'Admin',
      ts: protocol?.publishedAt || protocol?.updatedAt || new Date().toISOString(),
      summary: `Protocol published and made available to physicians`,
      details: { status: 'active' },
    });
  }

  return events.sort((a, b) => {
    const da = a.ts?.toDate ? a.ts.toDate() : new Date(a.ts || 0);
    const db2 = b.ts?.toDate ? b.ts.toDate() : new Date(b.ts || 0);
    return db2 - da;
  });
}

// ── EventRow ─────────────────────────────────────────────────────────────────
function EventRow({ event }) {
  const [expanded, setExpanded] = useState(false);
  const style = getEventStyle(event.type);
  const Icon  = style.icon;
  const hasDetails = event.details && Object.keys(event.details).length > 0;

  return (
    <div style={{ borderLeft: `3px solid ${style.color}`, paddingLeft: '1rem', marginBottom: '0.75rem' }}>
      <div
        onClick={() => hasDetails && setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.7rem 0.85rem', borderRadius: '10px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          cursor: hasDetails ? 'pointer' : 'default',
        }}
      >
        {/* Icon badge */}
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={style.color} />
        </div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{event.summary || style.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '1px 7px', borderRadius: '99px', fontSize: '0.67rem', fontWeight: 700, background: style.bg, color: style.color }}>{style.label}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <User size={11} /> {event.actor || 'Unknown'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTs(event.ts)}</span>
          </div>
        </div>

        {hasDetails && (
          expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />
        )}
      </div>

      {/* Details */}
      {expanded && hasDetails && (
        <div style={{ margin: '0.3rem 0 0 0', padding: '0.75rem', background: 'var(--surface-raised, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <tbody>
              {Object.entries(event.details).map(([k, v]) => (
                <tr key={k} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.3rem 0.5rem 0.3rem 0', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', width: '40%' }}>{k.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '0.3rem 0 0.3rem 0.5rem', color: 'var(--text-main)' }}>{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProtocolHistory({ protocol, onUpdate }) {
  const allEvents = buildHistoryFromProtocol(protocol);
  const [search, setSearch]  = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = allEvents.filter(e => {
    const matchesSearch = !search ||
      (e.summary || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.actor   || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const usedTypes = [...new Set(allEvents.map(e => e.type))];

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} color="var(--primary)" /> Protocol History & Audit Log
        </h2>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.83rem' }}>
          Immutable record of every change, publication, duplication, and prescription generation.
        </p>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Events', value: allEvents.length },
          { label: 'Version', value: protocol?.version_number || '1.0' },
          { label: 'Last Modified', value: protocol?.updatedAt ? formatTs(protocol.updatedAt).split(',')[0] : '—' },
          { label: 'Status', value: (protocol?.status || 'draft').toUpperCase() },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.65rem 1rem', minWidth: '100px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-main)', marginTop: '0.1rem' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <GlobalSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search events, actors..."
        resultCount={allEvents.length > 0 ? filtered.length : undefined}
        namespace="protocol-history"
        size="lg"
      />

      {/* Type filters */}
      {usedTypes.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTypeFilter('all')}
            style={{ padding: '0.3rem 0.85rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: typeFilter === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)', background: typeFilter === 'all' ? 'var(--primary)' : 'var(--surface)', color: typeFilter === 'all' ? '#fff' : 'var(--text-main)' }}
          >All</button>
          {usedTypes.map(type => {
            const s = getEventStyle(type);
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                style={{ padding: '0.3rem 0.85rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: typeFilter === type ? `2px solid ${s.color}` : '1px solid var(--border)', background: typeFilter === type ? s.bg : 'var(--surface)', color: typeFilter === type ? s.color : 'var(--text-main)' }}
              >{s.label}</button>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <History size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem' }}>{search ? 'No matching events' : 'No History Yet'}</h3>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>Events will appear here as the protocol is modified, published, or used to generate prescriptions.</p>
        </div>
      ) : (
        <div>
          {filtered.map(event => <EventRow key={event.id} event={event} />)}
        </div>
      )}
    </div>
  );
}
