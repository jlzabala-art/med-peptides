"use client";

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  RotateCw,
  Clock,
  Calendar,
  ShieldCheck,
  FileText,
  RefreshCw,
  MessageCircle,
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  Tag
} from 'lucide-react';
import GlobalSearchBar from '../../ui/GlobalSearchBar';
import DataTable from '../../ui/DataTable';
import CopyableId from '../../ui/CopyableId';
import { resolvePrescriptionParts } from '../../../utils/clinical/clinicalFormulations';
import ComplementaryHairMineralCard from '../../prescription/ComplementaryHairMineralCard';
import ReconstitutionGuideCard from '../../prescription/ReconstitutionGuideCard';
import { isTrichoTestPrescription } from '../../../data/fagronGenomicsTests';

/**
 * DoctorPrescriptionsTab
 * 
 * Associated Clinical Prescriptions Dossier (DataTable Universal)
 * Features:
 * - Real-time Google Cloud search and integrated filters
 * - Master-Detail expandable compound formulation breakdown
 * - 1-Click WhatsApp consultation per part or prescription
 * - Bottle labels generator trigger & patient handout trigger
 */
export default function DoctorPrescriptionsTab({
  lastRefreshed,
  handleRefresh,
  searchQuery,
  setSearchQuery,
  filteredPrescriptions,
  slug,
  statusFilter,
  setStatusFilter,
  temporalFilter,
  setTemporalFilter,
  quickRxFilter,
  setQuickRxFilter,
  quickCounts,
  apiFilter,
  setApiFilter,
  recFilter,
  setRecFilter,
  patientFilter,
  setPatientFilter,
  triggerHaptic,
  prescriptionColumns,
  handleRowClickPrescription,
  handleShareProposalWhatsApp,
  handleCopyProposalLink,
  handleOpenHandout,
  handleReprescribeFormula,
  handleContactAtlasWhatsApp,
  handleOpenLabelsModal,
  toast
}) {
  return (
    <section
      id="prescriptions"
      style={{
        background: '#ffffff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #dadce0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: '#1a73e8' }} />
              <span>Associated Clinical Prescriptions Dossier</span>
            </h2>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>•</span>
              <span>Synced {lastRefreshed ? lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}</span>
            </span>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Complete verified repository of compounded prescriptions and clinical regimens.
          </p>
        </div>

        {/* Header Action: Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          title="Refresh clinical registry"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            border: '1px solid #dadce0',
            background: '#ffffff',
            color: '#5f6368',
            cursor: 'pointer',
            transition: 'all 0.12s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafd'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
        >
          <RotateCw size={14} />
        </button>
      </div>

      {/* ── Search Bar with Integrated Filters (Golden Rule #7) ──────── */}
      <div style={{ padding: '16px 20px 14px 20px', background: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by patient name, prescription code (e.g. RX-2024-001), active compound (Minoxidil, Finasteride...), or status..."
          resultCount={filteredPrescriptions.length}
          namespace={`doctor-prescriptions-${slug}`}
          size="lg"
          filters={[
            statusFilter !== 'all' && {
              key: 'status',
              label: 'Status',
              value: statusFilter === 'active' ? 'ACTIVE & APPROVED' : statusFilter.toUpperCase(),
              onRemove: () => setStatusFilter('all')
            },
            temporalFilter !== 'all' && {
              key: 'time',
              label: 'Period',
              value: temporalFilter === '30d' ? '30 Days' : '90 Days',
              onRemove: () => setTemporalFilter('all')
            },
            quickRxFilter !== 'all' && {
              key: 'quick',
              label: 'Filter',
              value: quickRxFilter === 'proposals' ? 'Unaccepted Offers' : quickRxFilter === 'drafts' ? 'Doctor Drafts' : quickRxFilter === 'active' ? 'Active Prescriptions' : 'Multi-Part',
              onRemove: () => setQuickRxFilter('all')
            },
            apiFilter && {
              key: 'api',
              label: 'Active API',
              value: apiFilter,
              onRemove: () => setApiFilter(null)
            },
            recFilter && {
              key: 'recommendation',
              label: 'Atlas Recommendation',
              value: `${recFilter.title} (${recFilter.rxIds?.length || 0})`,
              onRemove: () => setRecFilter(null)
            }
          ].filter(Boolean)}
          filterOptions={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Active & Approved', value: 'active' },
                { label: 'Approved', value: 'approved' },
                { label: 'Pending', value: 'pending' }
              ],
              value: statusFilter,
              onChange: setStatusFilter
            },
            {
              key: 'time',
              label: 'Period',
              options: [
                { label: 'All Time', value: 'all' },
                { label: '30 Days', value: '30d' },
                { label: '90 Days', value: '90d' }
              ],
              value: temporalFilter,
              onChange: setTemporalFilter
            }
          ]}
        />

        {/* Quick Status / Category Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Filter:
          </span>
          {[
            { id: 'all', label: `All (${quickCounts.all})`, color: '#003666', bg: '#f1f5f9' },
            { id: 'active', label: `🟢 Active Prescriptions (${quickCounts.active})`, color: '#137333', bg: '#f0fdf4' },
            { id: 'proposals', label: `⏳ Unaccepted Offers (${quickCounts.proposals})`, color: '#b06000', bg: '#fef7e0' },
            ...(quickCounts.drafts > 0 ? [{ id: 'drafts', label: `🟡 Doctor Drafts (${quickCounts.drafts})`, color: '#b45309', bg: '#fffbeb' }] : []),
            { id: 'multipart', label: `🔵 Multi-Part Formulations (${quickCounts.multipart})`, color: '#1a73e8', bg: '#eff6ff' }
          ].map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                if (triggerHaptic) triggerHaptic('selection');
                setQuickRxFilter(chip.id);
              }}
              style={{
                height: '28px',
                padding: '0 12px',
                borderRadius: '9999px',
                border: quickRxFilter === chip.id ? `2px solid ${chip.color}` : '1px solid #dadce0',
                background: quickRxFilter === chip.id ? chip.bg : '#ffffff',
                color: chip.color,
                fontSize: '0.74rem',
                fontWeight: quickRxFilter === chip.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: quickRxFilter === chip.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {chip.label}
            </button>
          ))}

          {(searchQuery || statusFilter !== 'all' || patientFilter !== 'all' || temporalFilter !== 'all' || quickRxFilter !== 'all' || apiFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPatientFilter('all');
                setTemporalFilter('all');
                setQuickRxFilter('all');
                setApiFilter(null);
                if (toast) toast.success('Filters reset');
              }}
              style={{
                height: '28px',
                padding: '0 10px',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#d93025',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={prescriptionColumns}
        data={filteredPrescriptions}
        keyField="id"
        tableId={`doctor-prescriptions-${slug}`}
        pagination={true}
        initialRowsPerPage={10}
        alwaysShowPagination={true}
        onRowClick={handleRowClickPrescription}
        emptyTitle={quickRxFilter === 'pending' ? "No Prescriptions Awaiting Action" : "No Prescriptions Found"}
        emptyDescription={
          quickRxFilter === 'pending'
            ? "All clinical prescriptions have been authorized or processed. There are no drafts or pending approvals requiring physician action."
            : "No prescriptions match the active search criteria or filters. Adjust search keywords or register a new patient."
        }
        emptyActionLabel={quickRxFilter === 'pending' && quickCounts.all > 0 ? `Show All Prescriptions (${quickCounts.all})` : undefined}
        onEmptyAction={quickRxFilter === 'pending' && quickCounts.all > 0 ? () => setQuickRxFilter('all') : undefined}
        expandableRender={(rx) => {
          const parts = resolvePrescriptionParts(rx);
          const totalApisCount = parts.reduce((acc, p) => acc + (p.apis?.length || 0), 0);

          const isProposal = rx.status === 'proposal_pending' || rx.isTreatmentProposal || rx.orderStatus === 'Offer Not Accepted';
          const isAwaitingAtlasReview = !isProposal && (rx.status === 'draft' || rx.ingestionStage === 'awaiting_atlas_review' || rx.state === 'draft');

          return (
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {/* Clinical Treatment Proposal Banner (Unaccepted Offer) */}
              {isProposal && (
                <div style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="#d97706" />
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400e' }}>
                        Clinical Treatment Proposal · Offer Not Accepted
                      </span>
                      <span style={{
                        fontSize: '0.70rem',
                        background: '#fef3c7',
                        color: '#b45309',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontWeight: 700,
                        border: '1px solid #fcd34d'
                      }}>
                        Patient Pending Purchase
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleShareProposalWhatsApp(rx)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 12px',
                          background: '#25D366',
                          color: '#ffffff',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Share on WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyProposalLink(rx)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 12px',
                          background: '#ffffff',
                          color: '#003666',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#78350f', lineHeight: 1.5 }}>
                    Formulated personalized regimen. The patient has not yet confirmed the dispensing order.
                  </div>
                </div>
              )}

              {/* Two-Phase Clinical Intake Tracker Banner (Draft SLA) */}
              {isAwaitingAtlasReview && (
                <div style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="#d97706" />
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400e' }}>
                        Phase 2 in Progress: Atlas AI &amp; Clinical Pharmacist Validation
                      </span>
                      <span style={{
                        fontSize: '0.70rem',
                        background: '#fef3c7',
                        color: '#b45309',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontWeight: 700,
                        border: '1px solid #fcd34d'
                      }}>
                        ETA: ~24 Hours
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 600 }}>
                      Current Mode: <strong>Draft / Clinical Review</strong>
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '8px',
                    paddingTop: '6px',
                    borderTop: '1px dashed #fcd34d'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>✓</div>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>1. Digital Intake</div>
                        <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Parsed to Draft</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef3c7', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fde68a', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>2</div>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e' }}>2. Atlas AI Review</div>
                        <div style={{ fontSize: '0.66rem', color: '#b45309' }}>Pharmacist verification (~24h)</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', opacity: 0.7 }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>3</div>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>3. Dispensary Authorization</div>
                        <div style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Active for Fulfillment</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Cloud Prescription Reference Header & Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#003666' }}>
                    Prescription #{rx.code}
                  </span>
                  <CopyableId value={rx.code} iconOnly={true} />
                  <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    <span>Authorized: {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Active Regimen'}</span>
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#e6f4ea', color: '#137333', border: '1px solid #ceead6', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={11} />
                    <span>EU GMP Validated</span>
                  </span>
                  {parts.length > 1 && (
                    <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {parts.length} Compounded Formulations
                    </span>
                  )}
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Total Active Ingredients: <strong>{totalApisCount}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* View Patient Friendly Guide Button */}
                  <Link
                    href={`/rx/${rx.code}?view=patient`}
                    target="_blank"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                    title="Ver cómo lo ve el paciente y enlace para compartir"
                  >
                    <ExternalLink size={12} />
                    <span>Vista Paciente / Compartir</span>
                  </Link>

                  {/* View Full Clinical Dossier Button */}
                  <Link
                    href={`/rx/${rx.code}`}
                    target="_blank"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      background: '#ffffff',
                      color: '#003666',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                    title="Abrir expediente clínico completo"
                  >
                    <BookOpen size={12} />
                    <span>Ficha Clínica Completa</span>
                  </Link>
                </div>
              </div>

              {/* Multi-Part Formulations Container (Full Horizontal Width) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {parts.map((part, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      background: '#ffffff',
                      border: `1px solid ${part.borderAccent || '#e2e8f0'}`,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    {/* Part Header */}
                    <div
                      style={{
                        padding: '10px 16px',
                        background: part.accentBg || '#f8fafc',
                        borderBottom: `1px solid ${part.borderAccent || '#e2e8f0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.70rem',
                            fontWeight: 750,
                            letterSpacing: '0.04em',
                            color: part.accentColor || '#003666',
                            background: '#ffffff',
                            border: `1px solid ${part.borderAccent || '#cbd5e1'}`,
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          {part.badge}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                          {part.title}
                        </span>
                        {part.volume && (
                          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                            ({part.volume})
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* 1-Click WhatsApp on this Part */}
                        <button
                          type="button"
                          onClick={() => handleContactAtlasWhatsApp && handleContactAtlasWhatsApp(
                            `Prescription #${rx.code} - Part ${part.partNumber} (${rx.patientName || 'Patient'})`,
                            `Clinical inquiry regarding formulation: ${part.title} (${(part.apis || []).map(a => a.name + (a.dose ? ' ' + a.dose : '')).join(', ')}) in vehicle: ${part.vehicle || 'Compounded vehicle'}`
                          )}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            border: '1px solid #10b981',
                            background: '#f0fdf4',
                            color: '#047857',
                            fontSize: '0.72rem',
                            fontWeight: 650,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title="Contact Atlas Clinical Support on WhatsApp"
                        >
                          <MessageCircle size={12} />
                          <span>Contact Atlas on WhatsApp</span>
                        </button>

                        <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 500 }}>
                          Dispensary: Atlas Certified Galenic Unit
                        </span>
                      </div>
                    </div>

                    {/* Part Posology Schedule Strip */}
                    {part.schedule && (
                      <div
                        style={{
                          padding: '8px 16px',
                          background: '#f8fafc',
                          borderBottom: '1px solid #f1f5f9',
                          fontSize: '0.78rem',
                          color: '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          lineHeight: 1.4
                        }}
                      >
                        <Clock size={13} style={{ color: part.accentColor || '#0d9488', flexShrink: 0 }} />
                        <span>
                          <strong style={{ color: '#0f172a' }}>Clinical Administration Regimen:</strong> {part.schedule}
                        </span>
                      </div>
                    )}

                    {/* Part Active Ingredients - Full Width Clinical Presentation */}
                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Active Pharmaceutical Ingredients (APIs) & Concentrations ({part.apis?.length || 0})
                      </div>

                      {(!part.apis || part.apis.length === 0) ? (
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                          Personalized compounded active ingredients calibrated to patient clinical profile.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                          {part.apis.map((api, aIdx) => (
                            <div
                              key={aIdx}
                              style={{
                                background: '#fafbfc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '10px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}
                            >
                              {/* Line 1: Compound Name, Dose badge, Pharmacological Class & Gene targets */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                                    {api.name}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.76rem',
                                      fontWeight: 700,
                                      background: '#e0f2fe',
                                      color: '#0369a1',
                                      border: '1px solid #bae6fd',
                                      padding: '2px 8px',
                                      borderRadius: '4px'
                                    }}
                                  >
                                    {api.dose}
                                  </span>
                                  {api.geneTargets && api.geneTargets.length > 0 && (
                                    <span style={{ display: 'inline-flex', gap: '4px' }}>
                                      {api.geneTargets.map((g, gIdx) => (
                                        <span
                                          key={gIdx}
                                          style={{
                                            fontSize: '0.66rem',
                                            fontWeight: 650,
                                            color: '#475569',
                                            background: '#f1f5f9',
                                            border: '1px solid #e2e8f0',
                                            padding: '1px 5px',
                                            borderRadius: '3px'
                                          }}
                                        >
                                          🧬 {g}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </div>

                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 650,
                                    color: '#0d9488',
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  {api.pharmacologicalClass}
                                </span>
                              </div>

                              {/* Line 2: Clinical Indication & Cellular Target */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '6px', fontSize: '0.76rem', color: '#475569' }}>
                                {api.clinicalIndication && (
                                  <div>
                                    <strong style={{ color: '#1e293b' }}>Clinical Indication:</strong> {api.clinicalIndication}
                                  </div>
                                )}
                                {api.cellularTarget && (
                                  <div>
                                    <strong style={{ color: '#1e293b' }}>Cellular Target:</strong> {api.cellularTarget}
                                  </div>
                                )}
                              </div>

                              {/* Line 3: Mechanism of Action (Crucial for Physician) */}
                              {api.mechanismOfAction && (
                                <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.45, background: '#ffffff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                                  <strong style={{ color: '#0f172a' }}>Mechanism of Action:</strong> {api.mechanismOfAction}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Clinical Reconstitution & Syringe Dosage Converter for Injectable Peptides */}
                      {(part.isInjectable || String(part.title || '').toLowerCase().includes('vial') || String(part.title || '').toLowerCase().includes('peptide') || String(part.schedule || '').toLowerCase().includes('subq') || String(part.schedule || '').toLowerCase().includes('inyect')) && (
                        <div style={{ marginTop: '8px' }}>
                          <ReconstitutionGuideCard
                            productName={part.title}
                            vialDoseMg={parseFloat(String(part.volume || '5').replace(/[^\d.]/g, '')) || 5}
                            diluentVolumeMl={2.0}
                            prescribedDoseMcg={250}
                            lang="es"
                            initiallyExpanded={false}
                          />
                        </div>
                      )}
                    </div>

                    {/* Part Footer - Compounding Vehicle / Excipient Carrier */}
                    <div
                      style={{
                        padding: '8px 16px',
                        background: '#f8fafc',
                        borderTop: '1px solid #f1f5f9',
                        fontSize: '0.75rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}
                    >
                      <span>
                        <strong style={{ color: '#334155' }}>{part.vehicleLabel || 'Pharmaceutical Carrier Base:'}</strong> {part.vehicle}
                      </span>
                      <span style={{ color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} />
                        EU GMP Validated Pharmacopeia Base
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Complementary Hair Health Assessment (TeleTest HTMA) for TrichoTest Prescriptions */}
              {isTrichoTestPrescription(rx) && (
                <div style={{ marginTop: '16px' }}>
                  <ComplementaryHairMineralCard
                    rx={rx}
                    compact={true}
                    onOpenInquiry={() => {
                      if (handleContactAtlasWhatsApp) {
                        handleContactAtlasWhatsApp(
                          `Prescription #${rx.code} — TeleTest Hair Mineral & Heavy Metals Analysis`,
                          `Physician inquiry & quotation request for TeleTest HTMA (Code: 18267691) complementary to TrichoTest prescription #${rx.code} for patient ${rx.patientName || 'Patient'}.`
                        );
                      }
                    }}
                  />
                </div>
              )}
            </div>
          );
        }}
      />
    </section>
  );
}
