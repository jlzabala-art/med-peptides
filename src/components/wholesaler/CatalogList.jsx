import FileText from "lucide-react/dist/esm/icons/file-text";
import Plus from "lucide-react/dist/esm/icons/plus";
import Eye from "lucide-react/dist/esm/icons/eye";
import Edit3 from "lucide-react/dist/esm/icons/edit-3";
import Copy from "lucide-react/dist/esm/icons/copy";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import BarChart2 from "lucide-react/dist/esm/icons/bar-chart-2";
import Users from "lucide-react/dist/esm/icons/users";
import FileDown from "lucide-react/dist/esm/icons/file-down";
import Search from "lucide-react/dist/esm/icons/search";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Send from "lucide-react/dist/esm/icons/send";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import Globe from "lucide-react/dist/esm/icons/globe";
import Lock from "lucide-react/dist/esm/icons/lock";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import React, { useState, useEffect } from 'react';
import { catalogRepository } from '../../repositories/catalogRepository';



















import { getProtocolTemplates } from '../../repositories/protocolRepository';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import ExpandableTableRow from '../common/ExpandableTableRow';

export default function CatalogList({ ownerId, ownerType, onOpenBuilder, onSelectCatalogToEdit }) {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatalogLeads, setSelectedCatalogLeads] = useState(null);
  const [leadsList, setLeadsList] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [previewCatalog, setPreviewCatalog] = useState(null);

  useEffect(() => {
    loadCatalogs();
  }, [ownerId, ownerType]);

  const loadCatalogs = async () => {
    setLoading(true);
    try {
      let ownedList = [];
      if (ownerType === 'admin') {
        ownedList = await catalogRepository.getAllCatalogs();
      } else {
        ownedList = await catalogRepository.getCatalogsByOwner(ownerId);
      }
      const publicList = await catalogRepository.getPublicCatalogs();
      // Merge and deduplicate by id
      const mergedMap = new Map();
      publicList.forEach(c => mergedMap.set(c.id, c));
      ownedList.forEach(c => mergedMap.set(c.id, c)); // Owned ones override if there's overlap
      setCatalogs(Array.from(mergedMap.values()));
    } catch (e) {
      console.error('Error loading catalogs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (catalog) => {
    if (!window.confirm(`Duplicate "${catalog.title}"?`)) return;
    try {
      const isPublicClone = catalog.ownerId !== ownerId;
      const duplicated = {
        ...catalog,
        id: '', // repo will auto-gen
        title: isPublicClone ? `${catalog.title} (My Clone)` : `${catalog.title} (Copy)`,
        slug: `${catalog.slug}-copy-${Math.floor(Math.random() * 10000)}`,
        views: 0,
        leadCaptureCount: 0,
        ownerId: ownerId,           // Assign to current user
        ownerType: ownerType,       // Assign to current role
        visibility: 'private',      // Clones are private by default
        pricingTier: null,          // Clear specific pricing so user's default applies
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await catalogRepository.saveCatalog(duplicated);
      loadCatalogs();
    } catch (e) {
      alert(`Error duplicating catalog: ${e.message}`);
    }
  };

  const handleCopyLink = (catalog) => {
    const fullUrl = `${window.location.origin}/catalog/${catalog.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(catalog.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareCRM = (catalog) => {
    // Basic share implementation (Option C / mailto approach) until full Bigin sync is finalized
    const fullUrl = `${window.location.origin}/catalog/${catalog.slug}?utm_source=bigin_share`;
    window.open(`mailto:?subject=Tu Catálogo Clínico de Atlas Health&body=Hola,%0A%0AAquí tienes el enlace al catálogo clínico personalizado:%0A${fullUrl}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this catalog? This action cannot be undone.')) return;
    try {
      await catalogRepository.deleteCatalog(id);
      loadCatalogs();
    } catch (e) {
      alert(`Error deleting catalog: ${e.message}`);
    }
  };

  const handleViewLeads = async (catalog) => {
    setSelectedCatalogLeads(catalog);
    setLeadsLoading(true);
    try {
      const leads = await catalogRepository.getLeadsForCatalog(catalog.id);
      setLeadsList(leads);
    } catch (e) {
      console.error(e);
    } finally {
      setLeadsLoading(false);
    }
  };

  const filteredCatalogs = catalogs.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedCatalogLeads) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <button onClick={() => setSelectedCatalogLeads(null)} style={backButtonStyle}>
            <ArrowLeft size={16} /> Back to Catalogs
          </button>
          <div>
            <h2 style={titleStyle}>Leads captured for: {selectedCatalogLeads.title}</h2>
            <p style={subtitleStyle}>List of clinic and doctor requests received from this catalog mini-site.</p>
          </div>
        </div>

        {leadsLoading ? (
          <div style={loadingStyle}>Loading leads...</div>
        ) : leadsList.length === 0 ? (
          <div style={emptyStateStyle}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>No leads captured yet</h3>
            <p>Leads will appear here when doctors or clinics submit contact forms on your catalog.</p>
          </div>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={theadRowStyle}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Notes / Request</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leadsList.map(lead => (
                  <tr key={lead.id} style={tbodyRowStyle}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{lead.name}</td>
                    <td style={tdStyle}>{lead.email}</td>
                    <td style={tdStyle}>{lead.phone}</td>
                    <td style={tdStyle}>{lead.message || '—'}</td>
                    <td style={tdStyle}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: lead.status === 'new' ? '#e8f0fe' : '#e6f4ea',
                        color: lead.status === 'new' ? '#1a73e8' : '#137333'
                      }}>
                        {lead.status || 'new'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={actionsBarStyle}>
        <div style={searchContainerStyle}>
          <Search size={16} style={searchIconStyle} />
          <input 
            type="text" 
            placeholder="Filter catalogs by name or slug..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
          />
        </div>
        <button onClick={onOpenBuilder} style={createButtonStyle}>
          <Plus size={16} /> Create Catalog
        </button>
      </div>

      {loading ? (
        <div style={loadingStyle}>Loading catalogs...</div>
      ) : filteredCatalogs.length === 0 ? (
        <div style={emptyStateStyle}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No catalogs found</h3>
          <p>Create your first dynamic catalog using AI merchandising context and customized pricing rules.</p>
          <button onClick={onOpenBuilder} style={{ ...createButtonStyle, marginTop: '1rem' }}>
            Get Started
          </button>
        </div>
      ) : (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                <th style={thStyle}>Catalog / Route</th>
                <th style={thStyle}>Status / Visibility</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCatalogs.map(catalog => (
                <ExpandableCatalogRow 
                  key={catalog.id}
                  catalog={catalog}
                  ownerId={ownerId}
                  ownerType={ownerType}
                  handleCopyLink={handleCopyLink}
                  copiedId={copiedId}
                  handleViewLeads={handleViewLeads}
                  setPreviewCatalog={setPreviewCatalog}
                  handleShareCRM={handleShareCRM}
                  onSelectCatalogToEdit={onSelectCatalogToEdit}
                  handleDuplicate={handleDuplicate}
                  handleDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PREVIEW DRAWER */}
      {previewCatalog && (
        <div style={drawerOverlayStyle} onClick={() => setPreviewCatalog(null)}>
          <div style={drawerStyle} onClick={(e) => e.stopPropagation()}>
            <div style={drawerHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#202124' }}>Preview: {previewCatalog.title}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={`/catalog/${previewCatalog.slug}`} target="_blank" rel="noopener noreferrer" style={{...createButtonStyle, backgroundColor: '#f1f3f4', color: '#1a73e8'}}>
                  <ExternalLink size={14} /> Open Tab
                </a>
                <button onClick={() => setPreviewCatalog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
                  <X size={20} color="#5f6368" />
                </button>
              </div>
            </div>
            <div style={drawerBodyStyle}>
              <iframe 
                src={`/catalog/${previewCatalog.slug}`} 
                title="Catalog Preview"
                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Internal Component for Expandable Row ────────────────────────────────────
function ExpandableCatalogRow({ 
  catalog, ownerId, ownerType, handleCopyLink, copiedId, handleViewLeads, 
  setPreviewCatalog, handleShareCRM, onSelectCatalogToEdit, handleDuplicate, handleDelete 
}) {
  const publicUrl = `/catalog/${catalog.slug}`;
  const isOwner = catalog.ownerId === ownerId || ownerType === 'admin';

  const mainContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontWeight: 600, color: '#1a73e8', fontSize: '0.9rem' }}>{catalog.title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, fontSize: '0.8rem' }} title="Open in new tab">
          {catalog.slug} <ExternalLink size={10} />
        </a>
        <button 
          onClick={() => handleCopyLink(catalog)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === catalog.id ? '#137333' : '#5f6368', padding: 0 }}
          title="Copy Link"
        >
          {copiedId === catalog.id ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
      {catalog.goal && <span style={{ fontSize: '0.75rem', color: '#5f6368', fontWeight: 400 }}>{catalog.goal}</span>}
    </div>
  );

  const subContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
      <span style={{
        ...statusBadgeStyle,
        backgroundColor: catalog.status === 'published' ? '#e6f4ea' : '#f1f3f4',
        color: catalog.status === 'published' ? '#137333' : '#5f6368'
      }}>
        {catalog.status}
      </span>
      {catalog.visibility === 'public' ? (
        <span style={{...badgeStyle, backgroundColor: '#e8f0fe', color: '#1a73e8', display: 'inline-flex', alignItems: 'center'}}>
          <Globe size={12} style={{marginRight: 4}}/> Public
        </span>
      ) : (
        <span style={{...badgeStyle, backgroundColor: '#f1f3f4', color: '#5f6368', display: 'inline-flex', alignItems: 'center'}}>
          <Lock size={12} style={{marginRight: 4}}/> Private
        </span>
      )}
    </div>
  );

  const actions = (
    <>
      <button onClick={() => setPreviewCatalog(catalog)} title="Preview Catalog" style={actionButtonStyle}>
        <Eye size={14} />
      </button>
      {isOwner && (
        <button onClick={() => handleShareCRM(catalog)} title="Share to CRM" style={{ ...actionButtonStyle, color: '#1a73e8' }}>
          <Send size={14} />
        </button>
      )}
      {isOwner && (
        <button onClick={() => onSelectCatalogToEdit(catalog)} title="Edit Catalog" style={actionButtonStyle}>
          <Edit3 size={14} />
        </button>
      )}
      <button onClick={() => handleDuplicate(catalog)} title={isOwner ? "Duplicate" : "Clone for my clinic"} style={actionButtonStyle}>
        <Copy size={14} />
      </button>
      {isOwner && (
        <button onClick={() => handleDelete(catalog.id)} title="Delete" style={{ ...actionButtonStyle, color: '#d93025' }}>
          <Trash2 size={14} />
        </button>
      )}
    </>
  );

  const expandedContent = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>Audience</div>
        <span style={badgeStyle}>{catalog.audience}</span>
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>Views</div>
        <div style={{ fontSize: '0.85rem', color: '#202124', fontWeight: 500 }}>{catalog.views || 0}</div>
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>Leads</div>
        <div style={{ fontSize: '0.85rem', color: '#202124', fontWeight: 500 }}>
          {catalog.leadCaptureCount > 0 && isOwner ? (
            <button onClick={() => handleViewLeads(catalog)} style={leadsLinkButtonStyle}>
              <Users size={12} /> {catalog.leadCaptureCount} leads
            </button>
          ) : (
            catalog.leadCaptureCount || '0'
          )}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 600 }}>Last Updated</div>
        <div style={{ fontSize: '0.85rem', color: '#202124', fontWeight: 500 }}>{new Date(catalog.updatedAt).toLocaleDateString()}</div>
      </div>
    </div>
  );

  return (
    <ExpandableTableRow 
      mainContent={mainContent}
      subContent={subContent}
      actions={actions}
      expandedContent={expandedContent}
    />
  );
}

// ── Styles (Google Cloud inspired) ──────────────────────────────────────────
const containerStyle = {
  background: 'var(--color-bg-surface)',
  borderRadius: '8px',
  border: '1px solid #dadce0',
  padding: '1.5rem',
  boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1), 0 2px 6px 2px rgba(60,64,67,0.15)',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '1.5rem',
};

const titleStyle = {
  margin: 0,
  fontSize: '1.25rem',
  color: '#202124',
  fontWeight: 600,
};

const subtitleStyle = {
  margin: '0.25rem 0 0',
  fontSize: '0.85rem',
  color: '#5f6368',
};

const backButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  background: 'none',
  border: 'none',
  color: '#1a73e8',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  padding: '0.5rem 0',
};

const actionsBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
  gap: '1rem',
};

const searchContainerStyle = {
  position: 'relative',
  flex: '1',
  maxWidth: '400px',
};

const searchIconStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#5f6368',
};

const searchInputStyle = {
  width: '100%',
  padding: '8px 12px 8px 36px',
  borderRadius: '4px',
  border: '1px solid #dadce0',
  fontSize: '0.85rem',
  outline: 'none',
};

const createButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#1a73e8',
  color: 'var(--color-bg-surface)',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  fontWeight: 500,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const loadingStyle = {
  padding: '3rem',
  textAlign: 'center',
  color: '#5f6368',
  fontSize: '0.9rem',
};

const emptyStateStyle = {
  padding: '4rem 2rem',
  textAlign: 'center',
  color: '#5f6368',
};

const tableContainerStyle = {
  overflowX: 'auto',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const theadRowStyle = {
  borderBottom: '2px solid #dadce0',
};

const thStyle = {
  textAlign: 'left',
  padding: '12px 8px',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#3c4043',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tbodyRowStyle = {
  borderBottom: '1px solid #e0e0e0',
  ':hover': {
    backgroundColor: 'var(--color-bg-app)',
  }
};

const tdStyle = {
  padding: '14px 8px',
  fontSize: '0.85rem',
  color: '#3c4043',
  verticalAlign: 'middle',
};

const linkStyle = {
  color: '#1a73e8',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
};

const badgeStyle = {
  backgroundColor: '#f1f3f4',
  color: '#3c4043',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 500,
};

const statusBadgeStyle = {
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 600,
};

const actionButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#5f6368',
  cursor: 'pointer',
  padding: '6px',
  borderRadius: '4px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    backgroundColor: '#f1f3f4',
  }
};

const actionButtonsGroupStyle = {
  display: 'flex',
  gap: '4px',
  justifyContent: 'flex-end',
};

const leadsLinkButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#1a73e8',
  textDecoration: 'underline',
  cursor: 'pointer',
  padding: 0,
  fontSize: '0.85rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
};

const drawerOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(9, 30, 66, 0.4)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'flex-end',
};

const drawerStyle = {
  width: '100%',
  maxWidth: '800px',
  backgroundColor: '#fff',
  height: '100%',
  boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
};

const drawerHeaderStyle = {
  padding: '1.5rem',
  borderBottom: '1px solid #dadce0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const drawerBodyStyle = {
  flex: 1,
  backgroundColor: '#f8f9fa',
};