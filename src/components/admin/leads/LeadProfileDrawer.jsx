import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Building from "lucide-react/dist/esm/icons/building";
import Clock from "lucide-react/dist/esm/icons/clock";
import Target from "lucide-react/dist/esm/icons/target";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import User from "lucide-react/dist/esm/icons/user";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import List from "lucide-react/dist/esm/icons/list";
import FileText from "lucide-react/dist/esm/icons/file-text";
import BarChart2 from "lucide-react/dist/esm/icons/bar-chart-2";
import Zap from "lucide-react/dist/esm/icons/zap";
import X from "lucide-react/dist/esm/icons/x";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Download from "lucide-react/dist/esm/icons/download";
import Upload from "lucide-react/dist/esm/icons/upload";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import React, { useState } from 'react';























import { calculateDetailedAIScore } from './LeadUtils';
import RFQItemsTab from './RFQItemsTab';
import toast from 'react-hot-toast';

export default function LeadProfileDrawer({ 
  lead, 
  onClose, 
  catalogProducts, 
  onProductCreated, 
  onStockUpdated,
  onUpdateRFQItems
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [syncing, setSyncing] = useState(false);

  if (!lead) return null;

  const aiDetails = calculateDetailedAIScore(lead);
  const isRFQ = lead.type === 'rfq';
  // Calculate value
  const value = isRFQ 
    ? (lead.originalData?.items || []).reduce((sum, item) => sum + ((item.clientUnitPrice || 250) * (item.quantity || 1)), 0)
    : 500;

  const daysOpen = Math.max(0, Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24)));
  const owner = lead.assignedOwner || 'Jose';
  const country = lead.country || (isRFQ ? 'Spain' : 'UAE');
  const leadType = lead.leadType || (isRFQ ? 'Compounding Pharmacy' : 'Clinic');
  const TABS = [
    { id: 'Overview', icon: BarChart2 },
    ...(isRFQ ? [{ id: 'RFQ Items', icon: List }] : []),
    { id: 'Quotations', icon: FileText },
    { id: 'Commercial', icon: DollarSign },
    { id: 'Products', icon: Zap },
    { id: 'Activity', icon: Clock },
    { id: 'Documents', icon: FileText },
    { id: 'AI Insights', icon: Zap }
  ];

  const handleSyncBigin = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("Successfully synchronized lead with Zoho Bigin!");
    }, 1500);
  };

  const triggerAction = (actionName) => {
    toast.success(`Action triggered: ${actionName}`);
  };

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
        width: '100%', maxWidth: '960px',
        backgroundColor: 'var(--surface, #ffffff)',
        zIndex: 9999,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Commercial Header */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface-raised, #f8fafc)',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              backgroundColor: isRFQ ? '#e0e7ff' : '#dcfce3',
              color: isRFQ ? '#4f46e5' : '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.5rem', border: '1px solid rgba(0,0,0,0.05)'
            }}>
              {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main, #1e293b)', fontWeight: 800 }}>
                  {lead.name}
                </h2>
                <span style={{ 
                  fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                  backgroundColor: lead.status === 'new' ? '#eff6ff' : '#f0fdf4',
                  color: lead.status === 'new' ? '#2563eb' : '#16a34a',
                  border: `1px solid ${lead.status === 'new' ? '#bfdbfe' : '#bbf7d0'}`
                }}>
                  {lead.status?.toUpperCase() || 'NEW'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                <span style={{ fontWeight: 600 }}>{leadType}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={12} /> {country}</span>
                <span>•</span>
                <span>Created {daysOpen} days ago</span>
                <span>•</span>
                <span style={{ color: 'var(--primary, #3b82f6)', fontWeight: 700 }}>Owner: {owner}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Revenue:</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>AED {value.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '4px',
                backgroundColor: aiDetails.score >= 80 ? '#f0fdf4' : aiDetails.score >= 50 ? '#fffbeb' : '#fef2f2',
                color: aiDetails.score >= 80 ? '#16a34a' : aiDetails.score >= 50 ? '#d97706' : '#dc2626',
                padding: '3px 10px', borderRadius: '12px', fontWeight: 800, fontSize: '0.75rem',
                border: `1px solid ${aiDetails.score >= 80 ? '#bbf7d0' : aiDetails.score >= 50 ? '#fcd34d' : '#fca5a5'}`
              }}>
                <Target size={12} /> AI Score: {aiDetails.score}/100 ({aiDetails.strength} Strength)
              </div>
              <button 
                onClick={onClose}
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Fast-Action Trigger Bar */}
        <div style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--surface, #ffffff)',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center'
        }}>
          <button onClick={() => triggerAction('Call')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={12} /> Call Client
          </button>
          <button onClick={() => triggerAction('Email')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Mail size={12} /> Send Email
          </button>
          <button onClick={() => triggerAction('WhatsApp')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px', borderColor: '#22c55e', color: '#22c55e' }}>
            <MessageSquare size={12} /> WhatsApp
          </button>
          <button onClick={() => triggerAction('Meeting')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> Schedule Meeting
          </button>
          <div style={{ flexGrow: 1 }} />
          <button onClick={() => triggerAction('Quotation')} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={12} /> Create Quotation
          </button>
          <button onClick={() => triggerAction('RFQ')} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}>
            <ArrowUpRight size={12} /> Create RFQ
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.5rem',
          backgroundColor: 'var(--surface-raised, #f8fafc)', overflowX: 'auto'
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.8rem 0',
                marginRight: '1.5rem',
                border: 'none', background: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary, #2563eb)' : 'transparent'}`,
                color: activeTab === tab.id ? 'var(--primary, #2563eb)' : 'var(--text-muted, #64748b)',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              <tab.icon size={14} /> {tab.id}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: 'var(--color-bg-base, #f1f5f9)' }}>
          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Recommended Next Action Engine */}
              <div style={{ 
                padding: '1rem 1.25rem', 
                backgroundColor: '#fffbeb', 
                border: '1px solid #fde68a', 
                borderRadius: '10px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <AlertCircle size={20} color="#d97706" />
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: '#92400e', display: 'block' }}>Next Recommended Action</strong>
                    <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                      "Quotation has not been sent. Client requested pricing details 3 days ago. Overdue follow-up."
                    </span>
                  </div>
                </div>
                <button onClick={() => triggerAction('Quotation')} className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '4px 12px' }}>
                  Draft Quotation Now
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {/* Lead Info */}
                <div style={{ backgroundColor: 'var(--surface)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>General Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Company:</span> <strong style={{ color: 'var(--text-main)' }}>{lead.name}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Lead Type:</span> <strong>{leadType}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Source:</span> <strong>{lead.source || 'RFQ Portal'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong>{lead.email || 'N/A'}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <strong>{lead.phone || 'N/A'}</strong></div>
                  </div>
                </div>

                {/* Zoho Bigin Sync Integration */}
                <div style={{ backgroundColor: 'var(--surface)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Zoho Bigin Sync</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>External CRM ID:</span> <code style={{ backgroundColor: 'var(--surface-raised)', padding: '2px 6px', borderRadius: '4px' }}>bg_98231083921</code></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Sync Status:</span> 
                      <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Synced Live</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Last Sync:</span> <span>2 minutes ago</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Source:</span> <strong style={{ color: 'var(--primary)' }}>Zoho Bigin</strong></div>
                  </div>
                  <button 
                    onClick={handleSyncBigin} 
                    disabled={syncing} 
                    className="btn btn-outline" 
                    style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', marginTop: '0.25rem' }}
                  >
                    <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>

                {/* Commercial Team assignments */}
                <div style={{ backgroundColor: 'var(--surface)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Account Management Team</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Account Manager:</span> <strong>{owner} (Sourcing Lead)</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Regional Manager:</span> <strong>Alejandro M.</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Technical Advisor:</span> <strong>Dr. Laura R.</strong></div>
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div style={{ backgroundColor: 'var(--surface)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                 <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Inquiry Message Notes</h3>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                   {lead.message || 'No additional details logged.'}
                 </p>
              </div>
            </div>
          )}

          {/* RFQ ITEMS TAB */}
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

          {/* QUOTATIONS TAB */}
          {activeTab === 'Quotations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '10px' }}>Quotation #</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Value</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Est. Margin</th>
                      <th style={{ padding: '10px' }}>Sent Date</th>
                      <th style={{ padding: '10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px', fontWeight: 700 }}>QT-2026-9081</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>AED 348,000</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>18.4%</td>
                      <td style={{ padding: '10px' }}>Jun 08, 2026</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10b981', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>Viewed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button onClick={() => triggerAction('Quotation')} className="btn btn-primary" style={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}>
                Generate New Proposal
              </button>
            </div>
          )}

          {/* COMMERCIAL TAB */}
          {activeTab === 'Commercial' && (
            <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Commercial Sourcing Intelligence</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Annual Value:</span>
                  <strong style={{ color: 'var(--text-main)' }}>AED 1.4M</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Buying Authority Level:</span>
                  <strong style={{ color: 'var(--text-main)' }}>C-Level Executives / MD</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Probability of Closing:</span>
                  <strong style={{ color: '#16a34a' }}>75%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Expected Margin Rate:</span>
                  <strong style={{ color: 'var(--text-main)' }}>22.5%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Urgency Index:</span>
                  <strong style={{ color: '#ef4444' }}>High Urgency (Delivery ETA requested)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Decision Timeline:</span>
                  <strong style={{ color: 'var(--text-main)' }}>Q2 - immediate purchase</strong>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'Products' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '10px' }}>Top Requested Products</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Requested Qty</th>
                      <th style={{ padding: '10px' }}>Category</th>
                      <th style={{ padding: '10px' }}>Stock Availability</th>
                      <th style={{ padding: '10px' }}>Supplier Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(lead.originalData?.items || [
                      { itemName: 'BPC-157 5mg Pure API', quantity: 100 }
                    ]).map((prod, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px', fontWeight: 700 }}>{prod.itemName}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>{prod.quantity}</td>
                        <td style={{ padding: '10px', color: 'var(--text-muted)' }}>APIs & Peptides</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>In Stock (240 available)</span>
                        </td>
                        <td style={{ padding: '10px', color: 'var(--primary)', fontWeight: 600 }}>Lotusland Chemicals (Direct Match)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACTIVITY TIMELINE TAB */}
          {activeTab === 'Activity' && (
            <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 800 }}>HubSpot-Style Activity Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.5rem' }}>
                <div style={{ position: 'absolute', top: '5px', bottom: '5px', left: '6px', width: '2px', backgroundColor: 'var(--border)' }} />
                {[
                  { title: 'RFQ Generated', details: 'RFQ Number RFQ-2026-001 created automatically from custom proforma upload.', date: 'Today, 2:10 PM', icon: Zap, bg: '#f5f3ff', color: '#8b5cf6' },
                  { title: 'Email Interaction', details: 'Client replied to pricing options, requesting express customs routing via Madrid freezone.', date: 'Yesterday, 4:15 PM', icon: Mail, bg: '#eff6ff', color: '#3b82f6' },
                  { title: 'Meeting Completed', details: 'Discovery call with buying authority. Alignment on custom compounding batch specifications.', date: 'June 07, 2026', icon: Calendar, bg: '#f0fdf4', color: '#16a34a' },
                  { title: 'Lead Created', details: 'Lead record initialized via Website Portal submission.', date: 'June 01, 2026', icon: User, bg: '#f8fafc', color: '#64748b' }
                ].map((act, index) => {
                  const Icon = act.icon;
                  return (
                    <div key={index} style={{ position: 'relative' }}>
                      <div style={{ 
                        position: 'absolute', left: '-27px', top: '2px',
                        width: '24px', height: '24px', borderRadius: '50%',
                        backgroundColor: act.bg, color: act.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid var(--surface)'
                      }}>
                        <Icon size={12} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{act.title}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.date}</span>
                        </div>
                        <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {act.details}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'Documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Custom Compounding Specifications', type: 'PDF Spec Sheet', status: 'Approved' },
                { name: 'CoA Certificate of analysis', type: 'Certificate', status: 'Missing', warning: true },
                { name: 'MSDS Documentation Sheet', type: 'Compliance doc', status: 'Approved' },
                { name: 'Commercial Proforma Invoice', type: 'Invoice', status: 'Pending Review', warning: true }
              ].map((doc, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '0.75rem 1rem', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--surface)',
                    fontSize: '0.78rem' 
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-main)' }}>{doc.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{doc.type}</span>
                  </div>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 700, 
                    color: doc.warning ? '#ea580c' : '#16a34a', 
                    backgroundColor: doc.warning ? '#fff7ed' : '#dcfce7', 
                    padding: '2px 8px', 
                    borderRadius: '4px' 
                  }}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* AI INSIGHTS TAB */}
          {activeTab === 'AI Insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1.25rem', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={16} /> Atlas AI Opportunity Sourcing Insights
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.5 }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    <strong>"Magenta frequently purchases peptide components."</strong> There is a 92% historical likelihood of HGH & BPC-157 demand during Q2.
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Cross-Sell Suggestions:</strong> We recommend pitching FOXO4 and PNC-27 peptides as regulatory backups to improve basket value by 18%.
                  </p>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>Smart Pricing Advice</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Current RFQ margin target is optimized. Atlas AI predicts a 82% win rate if matching Barcelona compounders.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </>
  );
}