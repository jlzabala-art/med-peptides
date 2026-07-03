import React, { useState, useRef } from 'react';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Upload from 'lucide-react/dist/esm/icons/upload';
import Link from 'lucide-react/dist/esm/icons/link';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import FilePlus from 'lucide-react/dist/esm/icons/file-plus';
import Search from 'lucide-react/dist/esm/icons/search';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import GlobalSearchBar from '../../../ui/GlobalSearchBar';

// ── constants ─────────────────────────────────────────────────────────────────
const DOC_TYPES = [
  { id: 'consent',    label: 'Consent Form',        color: '#3b82f6', bg: '#dbeafe' },
  { id: 'reference', label: 'Scientific Reference', color: '#7c3aed', bg: '#f3e8ff' },
  { id: 'protocol',  label: 'Protocol PDF',         color: '#059669', bg: '#d1fae5' },
  { id: 'lab',       label: 'Lab Reference',        color: '#d97706', bg: '#fef3c7' },
  { id: 'other',     label: 'Other',                color: '#64748b', bg: '#f1f5f9' },
];

const DOC_TYPE_MAP = Object.fromEntries(DOC_TYPES.map(d => [d.id, d]));

function getTypeStyle(type) {
  return DOC_TYPE_MAP[type] || DOC_TYPE_MAP.other;
}

function TypeBadge({ type }) {
  const s = getTypeStyle(type);
  return (
    <span style={{
      padding: '2px 8px', borderRadius: '99px', fontSize: '0.68rem', fontWeight: 700,
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

function DocCard({ doc, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.85rem 1rem', border: '1px solid var(--border)',
      borderRadius: '10px', background: 'var(--surface)',
      transition: 'box-shadow 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
        background: getTypeStyle(doc.type).bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {doc.url ? <Link size={16} color={getTypeStyle(doc.type).color} /> : <FileText size={16} color={getTypeStyle(doc.type).color} />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {doc.title}
        </div>
        {doc.description && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {doc.description}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
          <TypeBadge type={doc.type} />
          {doc.addedAt && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {new Date(doc.addedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {doc.url && (
          <a href={doc.url} target="_blank" rel="noreferrer"
            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--primary)', display: 'flex', alignItems: 'center', textDecoration: 'none', background: 'var(--surface)' }}
          >
            <ExternalLink size={14} />
          </a>
        )}
        <button onClick={() => onRemove(doc.id)}
          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', color: '#ef4444', display: 'flex', alignItems: 'center', background: 'var(--surface)', cursor: 'pointer' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── AddDocModal ───────────────────────────────────────────────────────────────
function AddDocModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', type: 'reference', url: '', description: '' });

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({ ...form, id: Date.now().toString(), addedAt: new Date().toISOString() });
    setForm({ title: '', type: 'reference', url: '', description: '' });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 800 }}>Add Document / Reference</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Title *</label>
            <input
              required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Patient Informed Consent Form"
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem' }}>
              {DOC_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>URL (optional)</label>
            <input
              type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Notes (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description or citation..."
              rows={2}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button type="submit" style={{ padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Add Document</button>
        </div>
      </form>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProtocolDocuments({ protocol, onUpdate }) {
  const rawDocs   = protocol?.documents || [];
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [showModal, setShowModal] = useState(false);

  const docs = rawDocs.filter(d => {
    const matchesSearch = !search ||
      (d.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || d.type === filter;
    return matchesSearch && matchesFilter;
  });

  function handleAdd(newDoc) {
    onUpdate?.({ documents: [...rawDocs, newDoc] });
  }

  function handleRemove(id) {
    onUpdate?.({ documents: rawDocs.filter(d => d.id !== id) });
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--primary)" /> Documents & References
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.83rem' }}>
            PDFs, informed consents, scientific literature, and protocol references.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FilePlus size={16} /> Add Document
        </button>
      </div>

      {/* AI tip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px' }}>
        <Sparkles size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.8rem', color: '#5b21b6' }}>
          <strong>Atlas AI:</strong> Attach at least one peer-reviewed PubMed reference per compound to increase protocol credibility scores for medical board review.
        </span>
      </div>

      {/* Prominent search */}
      <GlobalSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search documents by title, notes, or citation..."
        resultCount={rawDocs.length > 0 ? docs.length : undefined}
        namespace="protocol-documents"
        size="lg"
      />

      {/* Type filters */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {[{ id: 'all', label: 'All' }, ...DOC_TYPES].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            style={{
              padding: '0.3rem 0.85rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
              border: filter === t.id ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: filter === t.id ? 'var(--primary)' : 'var(--surface)',
              color: filter === t.id ? '#fff' : 'var(--text-main)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {DOC_TYPES.map(t => {
          const count = rawDocs.filter(d => d.type === t.id).length;
          if (!count) return null;
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: t.color, fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color, display: 'inline-block' }} />
              {count} {t.label}{count > 1 ? 's' : ''}
            </div>
          );
        })}
      </div>

      {/* Document list */}
      {docs.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem' }}>{search ? 'No results found' : 'No Documents Yet'}</h3>
          <p style={{ fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
            {search ? `No documents match "${search}".` : 'Attach consent forms, PubMed references, or protocol PDFs to enrich this protocol.'}
          </p>
          {!search && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <FilePlus size={16} /> Add First Document
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {docs.map(doc => <DocCard key={doc.id} doc={doc} onRemove={handleRemove} />)}
        </div>
      )}

      <AddDocModal open={showModal} onClose={() => setShowModal(false)} onAdd={handleAdd} />
    </div>
  );
}
