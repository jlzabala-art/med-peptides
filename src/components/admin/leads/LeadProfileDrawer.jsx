'use client';

import React, { useState } from 'react';
import DataTable from '../../ui/DataTable';
import StatusChip from '../../ui/StatusChip';

import { calculateDetailedAIScore } from './LeadUtils';
import RFQItemsTab from './RFQItemsTab';
import toast from 'react-hot-toast';
import {
  Mail,
  Phone,
  MapPin,
  Building,
  Clock,
  Target,
  ArrowUpRight,
  CheckCircle2,
  ShieldAlert,
  User,
  DollarSign,
  List,
  FileText,
  BarChart2,
  Zap,
  X,
  MessageSquare,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  AlertCircle,
  RefreshCw,
} from '@/lib/icons';

export default function LeadProfileDrawer({
  lead,
  onClose,
  catalogProducts,
  onProductCreated,
  onStockUpdated,
  onUpdateRFQItems,
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [syncing, setSyncing] = useState(false);

  const [openSections, setOpenSections] = useState({
    overview: true,
    rfq: false,
    quotations: false,
    commercial: false,
    products: false,
    activity: false,
    documents: false,
    ai: false,
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => {
      const isCurrentlyOpen = prev[sec];
      return {
        overview: !isCurrentlyOpen && sec === 'overview',
        rfq: !isCurrentlyOpen && sec === 'rfq',
        quotations: !isCurrentlyOpen && sec === 'quotations',
        commercial: !isCurrentlyOpen && sec === 'commercial',
        products: !isCurrentlyOpen && sec === 'products',
        activity: !isCurrentlyOpen && sec === 'activity',
        documents: !isCurrentlyOpen && sec === 'documents',
        ai: !isCurrentlyOpen && sec === 'ai',
      };
    });
  };

  const collapseAll = () => {
    setOpenSections({
      overview: false,
      rfq: false,
      quotations: false,
      commercial: false,
      products: false,
      activity: false,
      documents: false,
      ai: false,
    });
  };

  if (!lead) return null;

  const aiDetails = calculateDetailedAIScore(lead);
  const isRFQ = lead.type === 'rfq';
  // Calculate value
  const value = isRFQ
    ? (lead.originalData?.items || []).reduce(
        (sum, item) => sum + (item.clientUnitPrice || 250) * (item.quantity || 1),
        0
      )
    : 500;

  const daysOpen = Math.max(
    0,
    Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24))
  );
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
    { id: 'AI Insights', icon: Zap },
  ];

  const handleSyncBigin = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success('Successfully synchronized lead with Zoho Bigin!');
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
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />
      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '960px',
          backgroundColor: 'var(--surface, #ffffff)',
          zIndex: 9999,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Commercial Header */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--surface-raised, #f8fafc)',
            borderBottom: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: isRFQ ? '#e0e7ff' : '#dcfce3',
                color: isRFQ ? '#4f46e5' : '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
            </div>
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.4rem',
                    color: 'var(--text-main, #1e293b)',
                    fontWeight: 800,
                  }}
                >
                  {lead.name}
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: lead.status === 'new' ? '#eff6ff' : '#f0fdf4',
                    color: lead.status === 'new' ? '#2563eb' : '#16a34a',
                    border: `1px solid ${lead.status === 'new' ? '#bfdbfe' : '#bbf7d0'}`,
                  }}
                >
                  {lead.status?.toUpperCase() || 'NEW'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '0.35rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted, #64748b)',
                }}
              >
                <span style={{ fontWeight: 600 }}>{leadType}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <MapPin size={12} /> {country}
                </span>
                <span>•</span>
                <span>Created {daysOpen} days ago</span>
                <span>•</span>
                <span style={{ color: 'var(--primary, #3b82f6)', fontWeight: 700 }}>
                  Owner: {owner}
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Revenue:</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>
                AED {value.toLocaleString()}
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor:
                    aiDetails.score >= 80
                      ? '#f0fdf4'
                      : aiDetails.score >= 50
                        ? '#fffbeb'
                        : '#fef2f2',
                  color:
                    aiDetails.score >= 80
                      ? '#16a34a'
                      : aiDetails.score >= 50
                        ? '#d97706'
                        : '#dc2626',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  border: `1px solid ${aiDetails.score >= 80 ? '#bbf7d0' : aiDetails.score >= 50 ? '#fcd34d' : '#fca5a5'}`,
                }}
              >
                <Target size={12} /> AI Score: {aiDetails.score}/100 ({aiDetails.strength} Strength)
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Fast-Action Trigger Bar */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--surface, #ffffff)',
            borderBottom: '1px solid var(--border, #e2e8f0)',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => triggerAction('Call')}
            className="btn btn-outline"
            style={{
              fontSize: '0.7rem',
              padding: '0.35rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Phone size={12} /> Call Client
          </button>
          <button
            onClick={() => triggerAction('Email')}
            className="btn btn-outline"
            style={{
              fontSize: '0.7rem',
              padding: '0.35rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Mail size={12} /> Send Email
          </button>
          <button
            onClick={() => triggerAction('WhatsApp')}
            className="btn btn-outline"
            style={{
              fontSize: '0.7rem',
              padding: '0.35rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              borderColor: '#22c55e',
              color: '#22c55e',
            }}
          >
            <MessageSquare size={12} /> WhatsApp
          </button>
          <button
            onClick={() => triggerAction('Meeting')}
            className="btn btn-outline"
            style={{
              fontSize: '0.7rem',
              padding: '0.35rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Calendar size={12} /> Schedule Meeting
          </button>
          <div style={{ flexGrow: 1 }} />
          <button
            onClick={() => triggerAction('Quotation')}
            className="btn btn-primary"
            style={{
              fontSize: '0.7rem',
              padding: '0.35rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <FileText size={12} /> Create Quotation
          </button>
          <button
            onClick={() => triggerAction('RFQ')}
            className="btn btn-primary"
            style={{
              fontSize: '0.7rem',
              padding: '0.35rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#8b5cf6',
              borderColor: '#8b5cf6',
            }}
          >
            <ArrowUpRight size={12} /> Create RFQ
          </button>
        </div>

        {/* ── Scrollable Body with Accordions ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            backgroundColor: 'var(--color-bg-base, #f1f5f9)',
          }}
        >
          {/* ── 2x2 Metric Strip (Golden Rule & High Polish) ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            {/* Est. Deal Value */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={16} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Deal Value</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e40af' }}>
                AED {value.toLocaleString()}
              </div>
            </div>

            {/* AI Opportunity Score */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={16} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Opportunity Score</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>
                {aiDetails.score}/100 <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#22c55e' }}>({aiDetails.strength})</span>
              </div>
            </div>

            {/* Pipeline Stage */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={16} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pipeline Stage</span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0e7490' }}>
                {lead.status?.toUpperCase() || 'NEW'} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#06b6d4' }}>• {leadType}</span>
              </div>
            </div>

            {/* Lifecycle */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lead Lifecycle</span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7e22ce' }}>
                {daysOpen} Days Open <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a855f7' }}>({country})</span>
              </div>
            </div>
          </div>

          {/* ── Toolbar: Focus Mode & Collapse All ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 2px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Commercial Account Operations
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.70rem', color: '#94a3b8', fontStyle: 'italic' }}>
                Single-section focus
              </span>
              <button
                type="button"
                onClick={collapseAll}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '3px 8px'
                }}
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* ── Accordion 1: Overview ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('overview')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.overview ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#003666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Lead Overview, Identity & Contact Profile
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Entity classification, verified contacts, primary channel, and intake requirements
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                  Overview
                </span>
                {openSections.overview ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.overview && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Recommended Next Action Engine */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <AlertCircle size={20} color="#d97706" />
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: '#92400e', display: 'block' }}>
                      Next Recommended Action
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                      "Quotation has not been sent. Client requested pricing details 3 days ago.
                      Overdue follow-up."
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => triggerAction('Quotation')}
                  className="btn btn-primary"
                  style={{ fontSize: '0.7rem', padding: '4px 12px' }}
                >
                  Draft Quotation Now
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {/* Lead Info */}
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    General Details
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Company:</span>{' '}
                      <strong style={{ color: 'var(--text-main)' }}>{lead.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Lead Type:</span>{' '}
                      <strong>{leadType}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Source:</span>{' '}
                      <strong>{lead.source || 'RFQ Portal'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Email:</span>{' '}
                      <strong>{lead.email || 'N/A'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Phone:</span>{' '}
                      <strong>{lead.phone || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                {/* Zoho Bigin Sync Integration */}
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Zoho Bigin Sync
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>External CRM ID:</span>{' '}
                      <code
                        style={{
                          backgroundColor: 'var(--surface-raised)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        bg_98231083921
                      </code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Sync Status:</span>
                      <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Synced Live</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Last Sync:</span>{' '}
                      <span>2 minutes ago</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Source:</span>{' '}
                      <strong style={{ color: 'var(--primary)' }}>Zoho Bigin</strong>
                    </div>
                  </div>
                  <button
                    onClick={handleSyncBigin}
                    disabled={syncing}
                    className="btn btn-outline"
                    style={{
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      width: '100%',
                      marginTop: '0.25rem',
                    }}
                  >
                    <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />{' '}
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>

                {/* Commercial Team assignments */}
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Account Management Team
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Account Manager:</span>{' '}
                      <strong>{owner} (Sourcing Lead)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Regional Manager:</span>{' '}
                      <strong>Alejandro M.</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Technical Advisor:</span>{' '}
                      <strong>Dr. Laura R.</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div
                style={{
                  backgroundColor: 'var(--surface)',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  Inquiry Message Notes
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {lead.message || 'No additional details logged.'}
                </p>
              </div>
            </div>
              </div>
            )}
          </div>

          {/* ── Accordion 2: RFQ Items (if RFQ) ── */}
          {isRFQ && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => toggleSection('rfq')}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  backgroundColor: openSections.rfq ? '#f8fafc' : '#ffffff',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <List size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      RFQ Line Items & Formulation Requirements
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Requested chemical substances, target quantities, and supplier matching
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                    {(lead.originalData?.items || []).length} Items
                  </span>
                  {openSections.rfq ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                </div>
              </button>

              {openSections.rfq && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                  <RFQItemsTab
                    rfqId={lead.id}
                    items={lead.originalData?.items || []}
                    onSaveItems={(updatedItems) => onUpdateRFQItems(lead.id, updatedItems)}
                    supplierName={lead.originalData?.supplierName || 'LotusLand'}
                    catalogProducts={catalogProducts}
                    onProductCreated={onProductCreated}
                    onStockUpdated={onStockUpdated}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Accordion 3: Commercial Quotations & Proposals ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('quotations')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.quotations ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Commercial Quotations & Proposals
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Issued pricing sheets, customer engagement tracking, and formal bids
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#f0fdf4', color: '#15803d' }}>
                  Proposals
                </span>
                {openSections.quotations ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.quotations && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <DataTable
                    data={[
                      {
                        id: 'QT-2026-9081',
                        value: 'AED 348,000',
                        margin: '18.4%',
                        sentDate: 'Jun 08, 2026',
                        status: 'Viewed',
                      },
                    ]}
                    keyField="id"
                    emptyTitle="No quotations yet"
                    columns={[
                      {
                        key: 'id',
                        header: 'Quotation #',
                        render: (r) => <span style={{ fontWeight: 700 }}>{r.id}</span>,
                      },
                      {
                        key: 'value',
                        header: 'Value',
                        align: 'right',
                        render: (r) => <span style={{ fontWeight: 700 }}>{r.value}</span>,
                      },
                      {
                        key: 'margin',
                        header: 'Est. Margin',
                        align: 'right',
                        render: (r) => (
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{r.margin}</span>
                        ),
                      },
                      { key: 'sentDate', header: 'Sent Date' },
                      {
                        key: 'status',
                        header: 'Status',
                        render: (r) => <StatusChip status="active" label={r.status} />,
                      },
                    ]}
                  />
                  <button
                    onClick={() => triggerAction('Quotation')}
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}
                  >
                    Generate New Proposal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Accordion 4: Commercial Intelligence & Terms ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('commercial')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.commercial ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Commercial Terms, Margins & Deal Intelligence
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Estimated annual contract volume, margin rates, and procurement urgency
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#fff7ed', color: '#c2410c' }}>
                  AED 1.4M Target
                </span>
                {openSections.commercial ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.commercial && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>
                    Commercial Sourcing Intelligence
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '1rem',
                      fontSize: '0.8rem',
                    }}
                  >
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
              </div>
            )}
          </div>

          {/* ── Accordion 5: Products & Formulation Sourcing ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('products')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.products ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Top Requested Products & Active Stock Sourcing
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Catalog availability, stock levels, and accredited chemical suppliers
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                  Catalog Matches
                </span>
                {openSections.products ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.products && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <DataTable
                    data={(
                      lead.originalData?.items || [{ itemName: 'BPC-157 5mg Pure API', quantity: 100 }]
                    ).map((p, i) => ({ ...p, _idx: i }))}
                    keyField="_idx"
                    emptyTitle="No products requested"
                    columns={[
                      {
                        key: 'itemName',
                        header: 'Top Requested Products',
                        sortKey: 'itemName',
                        render: (r) => <span style={{ fontWeight: 700 }}>{r.itemName}</span>,
                      },
                      {
                        key: 'quantity',
                        header: 'Requested Qty',
                        align: 'right',
                        sortValue: (r) => r.quantity,
                        render: (r) => <span style={{ fontWeight: 700 }}>{r.quantity}</span>,
                      },
                      {
                        key: '_category',
                        header: 'Category',
                        render: () => (
                          <span style={{ color: 'var(--text-muted)' }}>APIs &amp; Peptides</span>
                        ),
                      },
                      {
                        key: '_stock',
                        header: 'Stock Availability',
                        render: () => <StatusChip status="active" label="In Stock (240 available)" />,
                      },
                      {
                        key: '_supplier',
                        header: 'Supplier Match',
                        render: () => (
                          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            Lotusland Chemicals (Direct Match)
                          </span>
                        ),
                      },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Accordion 6: Activity Timeline & Audit Log ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('activity')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.activity ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Commercial Activity Timeline & Follow-Ups
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Chronological audit log, meeting records, call notes, and email history
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                  Activity
                </span>
                {openSections.activity ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.activity && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 800 }}>
                    Commercial Communication Log
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      position: 'relative',
                    }}
                  >
                    {[
                      {
                        title: 'Email Sent: Commercial Introduction',
                        date: 'Yesterday at 14:32',
                        details: 'Pricing parameters and chemical analysis dossiers provided to lead.',
                        type: 'email',
                      },
                      {
                        title: 'Inbound RFQ Created',
                        date: '3 days ago',
                        details: 'Customer submitted compound formulation specifications via web portal.',
                        type: 'rfq',
                      },
                    ].map((act, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: act.type === 'email' ? '#eff6ff' : '#f0fdf4',
                            color: act.type === 'email' ? '#2563eb' : '#16a34a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {act.type === 'email' ? <Mail size={14} /> : <FileText size={14} />}
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
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Accordion 7: AI Insights & Pricing Sourcing ── */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => toggleSection('ai')}
              style={{
                width: '100%',
                padding: '14px 18px',
                backgroundColor: openSections.ai ? '#f8fafc' : '#ffffff',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    AI Intelligence, Margin Advice & Cross-Sell
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Automated opportunity scoring, cross-sell predictions, and margin optimizations
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                  AI Advice
                </span>
                {openSections.ai ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
              </div>
            </button>

            {openSections.ai && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: '1.25rem',
                      borderRadius: '10px',
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 0.5rem 0',
                        color: '#1e3a8a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Zap size={16} /> Atlas AI Opportunity Sourcing Insights
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.5 }}>
                      <p style={{ margin: '0 0 0.5rem 0' }}>
                        <strong>"Client frequently procures compounding formulations."</strong> High probability of repeat order cycle during current quarter.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Cross-Sell Suggestions:</strong> We recommend pitching bio-compatible peptides and specialized solvent packages to increase order basket by 20%.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'var(--surface)',
                      padding: '1.25rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>
                      Smart Margin Optimization
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Current RFQ margin target is optimized. Atlas AI predicts an 85% conversion win rate for standard delivery schedules.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
