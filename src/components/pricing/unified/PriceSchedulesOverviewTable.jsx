'use client';

import React, { useMemo } from 'react';
import {
  FileText, Share2, Users, ChevronDown, FileDown, ArrowRight,
  Calculator, MessageSquare, ExternalLink
} from 'lucide-react';

import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';

/**
 * PriceSchedulesOverviewTable
 * ─────────────────────────────────────────────────────────────────────────────
 * Primary tabular view of all official B2B price schedules.
 * Complies with Golden Rules #3, #4, #8, #11, #30.
 */
export default function PriceSchedulesOverviewTable({
  schedules,
  onSelectGroup,
  onOpenShareModal,
  onOpenRecipientsModal,
  onOpenSimulator,
  onGeneratePdf,
  onWhatsAppShare,
  onClearFilters
}) {
  const columns = useMemo(() => [
    {
      key: 'label',
      label: 'Product Line / Catalog',
      width: '28%',
      align: 'left',
      render: (val, row) => {
        const Icon = row.icon;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={18} color="#003666" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                {row.label}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                {row.description}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'supplier',
      label: 'Supplier / Origin',
      width: '18%',
      align: 'left',
      render: (val, row) => (
        <div>
          <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600 }}>
            {row.supplier}
          </div>
          <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }} />
            Active Catalog
          </div>
        </div>
      )
    },
    {
      key: 'skuCount',
      label: 'References',
      width: '10%',
      align: 'left',
      render: (val, row) => (
        <span style={{
          fontSize: '11px', fontWeight: 700, color: '#0369a1',
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          padding: '2px 8px', borderRadius: '12px', display: 'inline-block'
        }}>
          {row.badge}
        </span>
      )
    },
    {
      key: 'pricingNote',
      label: 'Pricing Formula',
      width: '18%',
      align: 'left',
      render: (val, row) => (
        <div style={{ fontSize: '11px', color: '#475569' }}>
          <strong style={{ color: '#0f172a' }}>{row.pricingNote}</strong>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
            Currency: <strong style={{ color: '#0284c7' }}>{row.currency}</strong>
          </div>
        </div>
      )
    },
    {
      key: 'shares',
      label: 'Shares',
      width: '12%',
      align: 'center',
      render: (val, row) => {
        const count = row.sharesCount || (row.recipients?.length || 0);
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenRecipientsModal(row);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="View recipient delivery history"
          >
            <Users size={12} />
            <span>{count} shared</span>
            <ChevronDown size={11} />
          </button>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '14%',
      minWidth: '130px',
      align: 'right',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
          {/* Simulator Drawer Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSimulator(row);
            }}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0284c7',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
            title="Simulate Pricing & Margins"
          >
            <Calculator size={13} />
          </button>

          {/* Download PDF Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onGeneratePdf(row);
            }}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
            title="Download Official PDF Dossier"
          >
            <FileDown size={13} color="#d97706" />
          </button>

          {/* Share Modal Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenShareModal(row);
            }}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: '1px solid #bae6fd',
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
            title="Share Tokenized Public Link"
          >
            <Share2 size={13} />
          </button>

          {/* View SKUs Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectGroup(row.id);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#003666',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title={`View ${row.label} SKUs`}
          >
            <span>SKUs</span>
            <ArrowRight size={11} />
          </button>
        </div>
      )
    }
  ], [onSelectGroup, onOpenShareModal, onOpenRecipientsModal, onOpenSimulator, onGeneratePdf]);

  if (!schedules || schedules.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No price schedules found"
        subtitle="Try adjusting your category, currency, or search criteria."
        action={{
          label: 'Clear Filters',
          onClick: onClearFilters
        }}
      />
    );
  }

  return (
    <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <DataTable
        columns={columns}
        data={schedules}
        pagination={false}
        globalSearch={false}
        onRowClick={(row) => onSelectGroup(row.id)}
        expandableRender={(row) => (
          <div style={{
            padding: '14px 18px',
            backgroundColor: '#f8fafc',
            borderLeft: '4px solid #003666',
            borderRadius: '6px',
            margin: '4px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                  Distribution Details · {row.label}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                  Formula: <strong>{row.pricingNote}</strong> · {row.skuCount} active references · Supplier: {row.supplier} · Currency: <strong>{row.currency}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => onOpenSimulator(row)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0284c7',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Calculator size={12} />
                  <span>Simulate Margin</span>
                </button>

                <button
                  type="button"
                  onClick={() => onGeneratePdf(row)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <FileText size={12} color="#d97706" />
                  <span>Generate PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenShareModal(row)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid #bae6fd',
                    backgroundColor: '#f0f9ff',
                    color: '#0284c7',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={12} />
                  <span>Share Web Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => onWhatsAppShare(row)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0',
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <MessageSquare size={12} />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectGroup(row.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <span>Explore SKUs ({row.skuCount})</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
