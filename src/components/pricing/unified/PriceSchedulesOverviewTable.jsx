'use client';

import React, { useMemo } from 'react';
import {
  FileText, Share2, Users, ChevronDown, FileDown, ArrowRight,
  Calculator, MessageSquare, Package
} from 'lucide-react';

import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';

/**
 * Compact mobile card for B2B Price Schedules Overview.
 * Keeps touch targets >= 34-36px and avoids verbose multi-row stacked labels.
 */
function ScheduleOverviewMobileCard({
  row,
  isAdmin = false,
  onSelectGroup,
  onGeneratePdf,
  onOpenShareModal,
  onOpenSimulator,
}) {
  const Icon = row.icon || Package;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '8px',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Header Row: Icon + Catalog Title + Reference/Currency Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <button
          type="button"
          onClick={() => onSelectGroup?.(row.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: 0,
            flex: 1,
            background: 'none',
            border: 'none',
            padding: 0,
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={16} color="#003666" />
          </div>
          <span
            style={{
              fontWeight: 750,
              fontSize: '0.9rem',
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {row.label}
          </span>
        </button>

        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 750,
            color: '#0369a1',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            padding: '2px 8px',
            borderRadius: '12px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {row.badge} · {row.currency}
        </span>
      </div>

      {/* 2-line Clamped Description */}
      <div
        style={{
          fontSize: '0.75rem',
          color: '#64748b',
          lineHeight: 1.38,
          marginTop: '6px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {row.description}
      </div>

      {/* Admin-only subtle supplier & formula line (Rule #73) */}
      {isAdmin && (row.supplier || row.pricingNote) && (
        <div
          style={{
            fontSize: '0.69rem',
            color: '#475569',
            marginTop: '5px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {row.supplier}{row.pricingNote ? ` · ${row.pricingNote}` : ''}
        </div>
      )}

      {/* Footer Actions Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '8px',
          marginTop: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onGeneratePdf?.(row);
            }}
            style={{
              minHeight: '34px',
              padding: '0 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.72rem',
              fontWeight: 650,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <FileDown size={13} color="#d97706" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenShareModal?.(row);
            }}
            style={{
              minHeight: '34px',
              padding: '0 10px',
              borderRadius: '6px',
              border: '1px solid #bae6fd',
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              fontSize: '0.72rem',
              fontWeight: 650,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSimulator?.(row);
              }}
              aria-label="Simulate Pricing & Margins"
              style={{
                minHeight: '34px',
                minWidth: '34px',
                padding: '0 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Calculator size={13} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectGroup?.(row.id);
          }}
          style={{
            minHeight: '34px',
            padding: '0 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#003666',
            color: '#ffffff',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span>Open SKUs</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

/**
 * PriceSchedulesOverviewTable
 * ─────────────────────────────────────────────────────────────────────────────
 * Primary tabular view of all official B2B price schedules.
 * Complies with Golden Rules #3, #4, #8, #11, #30, #73, #74.
 */
export default function PriceSchedulesOverviewTable({
  schedules,
  isAdmin = false,
  onSelectGroup,
  onOpenShareModal,
  onOpenRecipientsModal,
  onOpenSimulator,
  onGeneratePdf,
  onWhatsAppShare,
  onClearFilters
}) {
  const columns = useMemo(() => {
    const productCol = {
      key: 'label',
      label: 'Product Line / Catalog',
      width: isAdmin ? '25%' : '44%',
      align: 'left',
      sortable: true,
      sortValue: (row) => (row.label || '').toLowerCase(),
      render: (val, row) => {
        const Icon = row.icon;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '8px',
              backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={17} color="#003666" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                {row.label}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px', lineHeight: 1.3 }}>
                {row.description}
              </div>
            </div>
          </div>
        );
      }
    };

    const referencesCol = {
      key: 'skuCount',
      label: 'References',
      width: isAdmin ? '11%' : '14%',
      align: 'left',
      sortable: true,
      sortValue: (row) => Number(row.skuCount) || 0,
      render: (val, row) => (
        <span style={{
          fontSize: '11px', fontWeight: 700, color: '#0369a1',
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          padding: '2px 8px', borderRadius: '12px', display: 'inline-block'
        }}>
          {row.badge}
        </span>
      )
    };

    const actionsCol = {
      key: 'actions',
      label: 'Actions',
      width: '18%',
      align: 'right',
      sortable: false,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px', flexWrap: 'nowrap' }}>
          {isAdmin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSimulator(row);
              }}
              style={{
                padding: '4px 5px',
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
          )}

          {/* Download PDF Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onGeneratePdf(row);
            }}
            style={{
              padding: '4px 5px',
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
              padding: '4px 5px',
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
              padding: '4px 7px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#003666',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            title={`View ${row.label} SKUs`}
          >
            <span>SKUs</span>
            <ArrowRight size={11} />
          </button>
        </div>
      )
    };

    if (!isAdmin) {
      return [
        productCol,
        referencesCol,
        {
          key: 'currency',
          label: 'Currency',
          width: '12%',
          align: 'left',
          sortable: true,
          sortValue: (row) => (row.currency || '').toLowerCase(),
          render: (val, row) => (
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#0284c7',
              backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
              padding: '2px 8px', borderRadius: '6px', display: 'inline-block'
            }}>
              {row.currency}
            </span>
          )
        },
        {
          key: 'status',
          label: 'Status',
          width: '12%',
          align: 'left',
          sortable: false,
          render: () => <StatusBadge status="active" />
        },
        actionsCol,
      ];
    }

    return [
      productCol,
      {
        key: 'supplier',
        label: 'Supplier / Origin',
        width: '15%',
        align: 'left',
        sortable: true,
        sortValue: (row) => (row.supplier || '').toLowerCase(),
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
      referencesCol,
      {
        key: 'pricingNote',
        label: 'Pricing Formula',
        width: '19%',
        align: 'left',
        sortable: true,
        sortValue: (row) => (row.pricingNote || '').toLowerCase(),
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
        sortable: true,
        sortValue: (row) => Number(row.sharesCount ?? row.recipients?.length ?? 0) || 0,
        render: (val, row) => {
          const count = row.sharesCount ?? (row.recipients?.length || 0);
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
                backgroundColor: count > 0 ? '#f0fdf4' : '#f8fafc',
                border: count > 0 ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                color: count > 0 ? '#166534' : '#64748b',
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
      actionsCol,
    ];
  }, [isAdmin, onSelectGroup, onOpenShareModal, onOpenRecipientsModal, onOpenSimulator, onGeneratePdf]);

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
        mobileCardComponent={ScheduleOverviewMobileCard}
        mobileCardProps={{
          isAdmin,
          onSelectGroup,
          onGeneratePdf,
          onOpenShareModal,
          onOpenSimulator,
        }}
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
                  {isAdmin ? (
                    <>Formula: <strong>{row.pricingNote}</strong> · {row.skuCount} active references · Supplier: {row.supplier} · Currency: <strong>{row.currency}</strong></>
                  ) : (
                    <>{row.skuCount} active references · Currency: <strong>{row.currency}</strong></>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {isAdmin && (
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
                )}

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
