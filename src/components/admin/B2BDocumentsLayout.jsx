import React from 'react';
import { Search, Plus, Filter, MoreVertical, FileText } from 'lucide-react';

export default function B2BDocumentsLayout({
  title,
  documents,
  selectedDoc,
  onSelectDoc,
  onCreateNew,
  renderContent,
  renderSidebarItem,
  loading
}) {
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: 'var(--color-bg-app)', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR (List View) */}
      <div style={{ 
        width: '320px', 
        borderRight: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--color-bg-surface)',
        flexShrink: 0
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h2>
            <button 
              onClick={onCreateNew}
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              <Plus size={14} /> Nuevo
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              background: 'var(--color-bg-app)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '0.3rem 0.5rem'
            }}>
              <Search size={14} color="var(--color-text-tertiary)" />
              <input 
                placeholder="Buscar..."
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.8rem', width: '100%', color: 'var(--color-text-primary)' }}
              />
            </div>
            <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>
              <Filter size={14} color="var(--color-text-secondary)" />
            </button>
          </div>
        </div>

        {/* Sidebar List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>Cargando...</div>
          ) : documents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>No hay documentos.</div>
          ) : (
            documents.map((doc, idx) => (
              <div 
                key={doc.id || idx} 
                onClick={() => onSelectDoc(doc)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  background: selectedDoc?.id === doc.id ? 'rgba(0,54,102,0.04)' : 'transparent',
                  borderLeft: selectedDoc?.id === doc.id ? '3px solid var(--color-primary)' : '3px solid transparent'
                }}
              >
                {renderSidebarItem ? renderSidebarItem(doc) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{doc.documentNumber}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER PANEL (Document Viewer) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedDoc ? (
          renderContent(selectedDoc)
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
            <FileText size={48} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Selecciona un documento para visualizarlo</p>
          </div>
        )}
      </div>

    </div>
  );
}
