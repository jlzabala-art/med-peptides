import User from "lucide-react/dist/esm/icons/user";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Database from "lucide-react/dist/esm/icons/database";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import Info from "lucide-react/dist/esm/icons/info";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import React from 'react';







/**
 * Compact provenance block to display protocol authorship and source metadata.
 */
const ProvenanceBlock = ({ metadata }) => {
  if (!metadata) return null;

  const {
    protocol_source_type,
    protocol_author_name,
    protocol_author_title,
    protocol_author_organization,
    protocol_author_notes,
    protocol_is_curated,
    protocol_is_physician_authored,
    protocol_source_document,
    protocol_review_status,
    protocol_last_reviewed_at
  } = metadata;

  const getTypeLabel = (type) => {
    const labels = {
      curated_library: 'Curated Clinical Library',
      physician_protocol: 'Physician-Authored Protocol',
      internal_template: 'Internal Clinical Template',
      imported_reference: 'Imported Clinical Reference'
    };
    return labels[type] || 'Standard Reference';
  };

  const getStatusStyle = (status) => {
    const defaultStatus = status || 'draft';
    const styles = {
      approved: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
      reviewed: { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
      draft: { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
      archived: { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' }
    };
    return styles[defaultStatus.toLowerCase()] || styles.draft;
  };

  const statusStyle = getStatusStyle(protocol_review_status);

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-surface)',
      border: '1px solid var(--border)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      borderRadius: '16px',
      padding: '2rem',
      marginTop: '2rem',
      marginBottom: '6rem', 
      fontSize: '0.9rem',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
          {protocol_is_physician_authored ? <ShieldCheck style={{ color: 'var(--primary)' }} size={22} /> : <Database style={{ color: 'var(--primary)' }} size={22} />}
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
            Protocol Provenance & Authorship
          </h3>
        </div>
        {/* Compact Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {protocol_is_physician_authored && (
            <span style={{ backgroundColor: 'var(--color-danger-bg)', color: '#b91c1c', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              PHYSICIAN PROTOCOL
            </span>
          )}
          {protocol_is_curated && (
            <span style={{ backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              CURATED LIBRARY
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Source Type</div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>{getTypeLabel(protocol_source_type)}</div>
          {protocol_source_document && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <FileText size={14} /> {protocol_source_document}
            </div>
          )}
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Author / Clinician</div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={16} style={{ color: 'var(--text-muted)' }} /> {protocol_author_name || 'Generic Clinical Team'}
          </div>
          {protocol_author_title && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {protocol_author_title} {protocol_author_organization ? `| ${protocol_author_organization}` : ''}
            </div>
          )}
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Review Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ 
              backgroundColor: statusStyle.bg, 
              color: statusStyle.color, 
              border: `1px solid ${statusStyle.border}`,
              padding: '4px 12px', 
              borderRadius: '6px', 
              fontSize: '0.8rem', 
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {protocol_review_status || 'draft'}
            </span>
            {protocol_last_reviewed_at && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {protocol_last_reviewed_at}
              </span>
            )}
          </div>
        </div>
      </div>

      {(!protocol_review_status || protocol_review_status.toLowerCase() === 'draft') && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#b45309', fontWeight: 500 }}>
            This protocol is currently in <strong>draft status</strong> and should be clinically reviewed before final use.
          </p>
        </div>
      )}

      {protocol_review_status && protocol_review_status.toLowerCase() !== 'draft' && protocol_author_notes && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {protocol_author_notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProvenanceBlock;
