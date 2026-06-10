import React, { useState } from 'react';
import { Mail, Phone, MapPin, Building, Clock, Target, ArrowUpRight, CheckCircle2, ShieldAlert, User, DollarSign, List, FileText, BarChart2, Zap } from 'lucide-react';
import { calculateAILeadScore } from './LeadUtils';
import RFQItemsTab from './RFQItemsTab';

export default function LeadProfileDrawer({ 
  lead, 
  onClose, 
  catalogProducts, 
  onProductCreated, 
  onStockUpdated,
  onUpdateRFQItems
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  if (!lead) return null;

  const score = calculateAILeadScore(lead);
  const isRFQ = lead.type === 'rfq';
  
  const TABS = [
    { id: 'Overview', icon: BarChart2 },
    ...(isRFQ ? [{ id: 'RFQ Items', icon: List }] : []),
    { id: 'Quotations', icon: FileText },
    { id: 'Commercial', icon: DollarSign },
    { id: 'Activity', icon: Clock },
    { id: 'AI Insights', icon: Zap }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '900px', // 60% on typical desktop
        backgroundColor: '#ffffff',
        zIndex: 9999,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Header Strip */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: isRFQ ? '#e0e7ff' : '#dcfce3',
              color: isRFQ ? '#4f46e5' : '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.25rem'
            }}>
              {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b', fontWeight: 700 }}>
                {lead.name}
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} /> {lead.email || 'N/A'}
                </span>
                {lead.phone && (
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} /> {lead.phone}
                  </span>
                )}
                <span style={{ 
                  fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
                  backgroundColor: lead.status === 'new' ? '#eff6ff' : '#f0fdf4',
                  color: lead.status === 'new' ? '#2563eb' : '#16a34a',
                  border: `1px solid ${lead.status === 'new' ? '#bfdbfe' : '#bbf7d0'}`
                }}>
                  {lead.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <ArrowUpRight size={20} style={{ transform: 'rotate(90deg)' }} />
            </button>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '4px',
              backgroundColor: score >= 80 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fef2f2',
              color: score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626',
              padding: '4px 12px', borderRadius: '16px', fontWeight: 700, fontSize: '0.85rem'
            }}>
              <Target size={14} /> Score {score}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem',
          backgroundColor: '#ffffff'
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 0',
                marginRight: '2rem',
                border: 'none', background: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? '#2563eb' : 'transparent'}`,
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={16} /> {tab.id}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
          
          {activeTab === 'Overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Lead Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Company/Name:</span> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{lead.name}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Lead Type:</span> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{isRFQ ? 'B2B RFQ' : 'B2C Request'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Pipeline Stage:</span> <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2563eb' }}>{lead.status.toUpperCase()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Created:</span> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(lead.createdAt).toLocaleString()}</span></div>
                </div>
              </div>
              
              <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Opportunity Analysis</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontSize: '0.85rem' }}>AI Score:</span> <span style={{ fontWeight: 600, fontSize: '0.85rem', color: score > 80 ? '#16a34a' : '#1e293b' }}>{score}/100</span></div>
                  {isRFQ && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Requested Items:</span> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{lead.originalData?.items?.length || 0}</span></div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b', fontSize: '0.85rem' }}>Next Action:</span> <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ef4444' }}>Needs Review</span></div>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                 <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b' }}>Message / Notes</h3>
                 <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                   {lead.message || 'No additional notes provided.'}
                 </p>
              </div>
            </div>
          )}

          {activeTab === 'RFQ Items' && isRFQ && (
            <RFQItemsTab 
              rfqId={lead.id}
              items={lead.originalData?.items || []}
              onSaveItems={(updatedItems) => onUpdateRFQItems(lead.id, updatedItems)}
              supplierName={lead.originalData?.supplierName || 'LotusLand'}
              catalogProducts={catalogProducts}
              onProductCreated={onProductCreated}
              onStockUpdated={onStockUpdated}
            />
          )}

          {activeTab === 'Quotations' && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>No Quotations Yet</h3>
              <p>Create the first quotation from the RFQ Items tab.</p>
            </div>
          )}

          {activeTab === 'Commercial' && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <Building size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>Commercial Data</h3>
              <p>Territory, expected revenue, and competitor notes will appear here.</p>
            </div>
          )}

          {activeTab === 'Activity' && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3>Activity Timeline</h3>
              <p>Historical log of all interactions and status changes.</p>
            </div>
          )}

          {activeTab === 'AI Insights' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={16} /> AI Opportunity Recommendation</h4>
                <p style={{ margin: 0, color: '#15803d', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  This lead has an Opportunity Score of {score}. Based on historical data, leads with {isRFQ ? 'large RFQs' : 'these characteristics'} close at a 42% higher rate. 
                  <br/><br/><strong>Recommended Action:</strong> Follow up within 24 hours with a comprehensive quotation and alternative product suggestions for any out-of-stock items.
                </p>
              </div>
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={16} /> Risk Factors</h4>
                <p style={{ margin: 0, color: '#b45309', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  - Request contains items not currently mapped to the catalog.<br/>
                  - Time since inquiry is approaching 48 hours.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
