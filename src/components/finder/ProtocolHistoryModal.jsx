import X from "lucide-react/dist/esm/icons/x";
import Search from "lucide-react/dist/esm/icons/search";
import Clock from "lucide-react/dist/esm/icons/clock";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import FileText from "lucide-react/dist/esm/icons/file-text";
import User from "lucide-react/dist/esm/icons/user";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Layers from "lucide-react/dist/esm/icons/layers";
import Filter from "lucide-react/dist/esm/icons/filter";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Download from "lucide-react/dist/esm/icons/download";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';














import { getSavedProtocolsList, deleteProtocol } from '../../services/protocolStorage';
import { generateProtocolICS } from '../../services/calendarService';
import { generateClinicalPDF } from '../../services/pdfService';

/**
 * Enhanced Protocol Repository & Version History Dashboard (Section 4, 9, 11, 15).
 * Allows clinicians to browse, filter, and restore protocols with specific status badges.
 */
const ProtocolHistoryModal = ({ isOpen, onClose, onSelect, onCompare }) => {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // card ID with open action menu
  const menuRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadProtocols();
    }
  }, [isOpen]);

  const loadProtocols = async () => {
    setLoading(true);
    try {
      const data = await getSavedProtocolsList({
          latestOnly: false // Show all versions for history
      });
      setProtocols(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      if (confirm("Are you sure you want to delete this protocol? This action cannot be undone.")) {
          const success = await deleteProtocol(id);
          if (success) {
              setProtocols(prev => prev.filter(p => p.id !== id));
          }
      }
  };

  const filtered = protocols.filter(p => {
    const matchesSearch = (p.protocol_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (p.therapeutic_category?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (p.created_by?.user_name?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.therapeutic_category === filterCategory;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
      switch(status) {
          case 'approved': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
          case 'reviewed': return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
          case 'archived': return { bg: '#f1f5f9', text: 'var(--color-text-secondary)', border: 'var(--color-border)' };
          default: return { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' }; // draft
      }
  };

  const handleDownloadGuide = async (protocol) => {
    try { await generateClinicalPDF(protocol); }
    catch(e) { console.error('PDF failed', e); }
    setActiveMenu(null);
  };

  const handleSyncCalendar = (protocol) => {
    generateProtocolICS(protocol);
    setActiveMenu(null);
  };

  const DOSING_WARNING = 'Verify units/mL concentration with your pharmacist before administration.';

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: 'var(--background)',
        width: 'min(98%, 1000px)',
        height: 'min(92%, 850px)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Modal Header */}
        <div style={{ 
          padding: '1.5rem 2rem', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'white', 
              width: '44px', 
              height: '44px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Layers size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>Saved Clinical Protocols</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Manage, compare, and restore clinical pathway versions</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'rgba(0,0,0,0.05)', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', color: 'var(--text-main)', display: 'flex' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar: Search & Filters */}
        <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.5)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name, category, or author..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1.5px solid var(--border)', fontSize: '0.9rem', outline: 'none', backgroundColor: 'white' }}
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0 1rem', borderRadius: '12px', border: '1.5px solid var(--border)', fontSize: '0.85rem', fontWeight: 600, outline: 'none', backgroundColor: 'white', minWidth: '130px' }}
          >
            <option value="all">Any Status</option>
            <option value="draft">Draft</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="archived">Archived</option>
          </select>

          <button 
            onClick={loadProtocols} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,163,224,0.1)', border: 'none', color: 'var(--secondary)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
          >
              <RefreshCw size={16} className={loading ? 'spinner-icon' : ''} /> Refresh
          </button>
        </div>

        {/* Protocol List Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {loading ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
               <div className="spinner-icon" style={{ marginBottom: '1rem' }}>
                 <RefreshCw size={32} />
               </div>
               <p style={{ fontWeight: 700 }}>Accessing Vault...</p>
             </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No results mapping criteria</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {filtered.map(p => {
                  const s = getStatusColor(p.status);
                  return (
                    <div 
                      key={p.id} 
                      style={{
                        backgroundColor: 'white',
                        padding: '1rem 1.5rem',
                        borderRadius: '16px',
                        border: '1.5px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'all 0.2s',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      className="card-hover-item"
                    >
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: 1 }}>
                        <div style={{ backgroundColor: 'rgba(0, 54, 102, 0.05)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                          <FileText size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                              {p.metadata?.scientificName || p.protocol_name}
                            </h4>
                            {p.metadata?.scientificName && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 500 }}>
                                {p.protocol_name}
                              </span>
                            )}
                            <span style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}`, padding: '1px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' }}>{p.status}</span>
                            {p.is_latest && <span style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '1px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900 }}>LATEST</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            <span>v{p.version_number}</span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Calendar size={12} /> {new Date(p.created_at?.seconds * 1000 || p.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><User size={12} /> {p.created_by?.user_name}</span>
                          </div>
                        </div>
                      </div>
                      {/* Action Buttons Row */}
                       <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                         {/* Quick Actions Menu Button */}
                         <button
                           onClick={() => setActiveMenu(activeMenu === p.id ? null : p.id)}
                           style={{
                             padding: '0.4rem 0.85rem',
                             borderRadius: '8px',
                             border: '1px solid var(--border)',
                             background: 'white',
                             fontSize: '0.8rem',
                             fontWeight: 700,
                             cursor: 'pointer',
                             display: 'flex',
                             alignItems: 'center',
                             gap: '0.4rem',
                             color: 'var(--primary)',
                             minHeight: '44px'
                           }}
                           title="Clinical Asset Actions"
                         >
                           <Download size={15} /> Export
                         </button>

                         {/* Floating dropdown */}
                         {activeMenu === p.id && (
                           <div
                             ref={menuRef}
                             style={{
                               position: 'absolute',
                               bottom: 'calc(100% + 6px)',
                               right: 0,
                               backgroundColor: 'white',
                               border: '1.5px solid var(--border)',
                               borderRadius: '14px',
                               boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                               zIndex: 3000,
                               minWidth: '240px',
                               overflow: 'hidden'
                             }}
                           >
                             <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                               Clinical Asset Export
                             </div>
                             <button
                               onClick={() => handleDownloadGuide(p)}
                               style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.7rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textAlign: 'left' }}
                             >
                               <FileText size={16} color="var(--primary)" />
                               Download Administration Guide
                             </button>
                             <button
                               onClick={() => handleSyncCalendar(p)}
                               style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.7rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#0369a1', textAlign: 'left' }}
                             >
                               <Calendar size={16} color="#0369a1" />
                               Sync Dosing Schedule to Calendar
                             </button>
                             {/* Safety Warning */}
                             <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '0.6rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--color-warning-bg)' }}>
                               <AlertTriangle size={13} color="#b45309" style={{ flexShrink: 0, marginTop: '1px' }} />
                               <span style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 600, lineHeight: 1.4 }}>{DOSING_WARNING}</span>
                             </div>
                           </div>
                         )}

                         <button
                           onClick={() => onSelect(p)}
                           style={{ padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }}
                         >
                           Restore
                         </button>
                         <button
                           onClick={() => handleDelete(p.id)}
                           style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #fee2e2', background: 'var(--color-danger-bg)', color: '#b91c1c', cursor: 'pointer', minHeight: '44px' }}
                           title="Delete Protocol"
                         >
                           <X size={16} />
                         </button>
                       </div>
                    </div>
                  );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border)', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{filtered.length} Protocols Indexed</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <button style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Download Export History (JSON)</button>
             <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border)' }}></div>
             <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)' }}>SECURE CLINICAL VAULT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolHistoryModal;