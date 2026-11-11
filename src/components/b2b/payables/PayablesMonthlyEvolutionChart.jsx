"use client";

import React, { useState, useMemo } from 'react';
import {
  Clock,
  ChevronDown,
  Activity
} from '@/lib/icons';
import { formatCycleStart } from './payablesFormat';


export default function PayablesMonthlyEvolutionChart({ monthlyEvolution = [], currency = 'AED', lang = 'en', cycleStartDate }) {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Filter to only show active cycle from cycleStartDate onwards (default Nov 1, 2026)
  const cycleMonthStr = (cycleStartDate || '2026-11-01').slice(0, 7);
  const visibleEvolution = useMemo(() => {
    const filtered = (monthlyEvolution || []).filter(m => (m.month || '') >= cycleMonthStr);
    return filtered.length > 0 ? filtered : monthlyEvolution;
  }, [monthlyEvolution, cycleMonthStr]);

  const maxTotal = useMemo(() => {
    return Math.max(...visibleEvolution.map(m => m.total), 1);
  }, [visibleEvolution]);

  const totalContractedAll = useMemo(() => {
    return visibleEvolution.reduce((acc, m) => acc + (m.total || 0), 0);
  }, [visibleEvolution]);

  const totalPaidAll = useMemo(() => {
    return visibleEvolution.reduce((acc, m) => acc + (m.paid || 0), 0);
  }, [visibleEvolution]);

  const totalPendingAll = useMemo(() => {
    return visibleEvolution.reduce((acc, m) => acc + (m.pending || 0), 0);
  }, [visibleEvolution]);

  const paidPercent = totalContractedAll > 0 ? (totalPaidAll / totalContractedAll) * 100 : 100;

  if (!visibleEvolution || visibleEvolution.length === 0) return null;

  const isFewMonths = visibleEvolution.length <= 4;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      marginBottom: '1.5rem',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
    }}>
      {/* Header bar */}
      <div style={{
        padding: '12px 18px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={16} color="#0284c7" />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{lang === 'es' ? 'Evolución Mensual de Contratación y Estado de Liquidación' : 'Monthly Procurement & Settlement Evolution'}</span>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: paidPercent >= 90 ? '#16a34a' : '#ea580c', backgroundColor: paidPercent >= 90 ? '#dcfce7' : '#ffedd5', padding: '1px 7px', borderRadius: '4px' }}>
                {paidPercent.toFixed(1)}% {lang === 'es' ? 'Liquidado' : 'Settled'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
              {lang === 'es'
                ? `Ciclo de facturación activo auditado en Zoho Books · Desde el ${formatCycleStart(cycleStartDate, lang)}`
                : `Active billing cycle audit from Zoho Books · Starting ${formatCycleStart(cycleStartDate, lang)}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#16a34a' }} />
              <strong style={{ color: '#16a34a' }}>{lang === 'es' ? 'Pagado' : 'Settled'}</strong> ({totalPaidAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency})
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#ea580c' }} />
              <strong style={{ color: '#ea580c' }}>{lang === 'es' ? 'Pendiente' : 'Pending'}</strong> ({totalPendingAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'none',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 650,
              color: '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isOpen ? (lang === 'es' ? 'Ocultar' : 'Collapse') : (lang === 'es' ? 'Mostrar' : 'Expand')}
            <ChevronDown size={13} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {isOpen && (
        <div style={{ padding: '16px 18px' }}>
          {/* Stacked Bars container */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: isFewMonths ? 'center' : 'flex-start',
            gap: isFewMonths ? '24px' : '8px',
            height: '190px',
            paddingTop: '20px',
            paddingBottom: '26px',
            position: 'relative',
            borderBottom: '1px solid #cbd5e1',
            overflowX: 'auto'
          }}>
            {visibleEvolution.map((item) => {
              const isCurrent = item.isCurrentCycle;
              const barHeightPct = Math.max(12, (item.total / maxTotal) * 100);
              const paidHeightPct = item.total > 0 ? (item.paid / item.total) * 100 : 0;
              const pendingHeightPct = item.total > 0 ? (item.pending / item.total) * 100 : 0;

              const monthLabel = (() => {
                const parts = item.month.split('-');
                if (parts.length === 2) {
                  const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const mIdx = parseInt(parts[1], 10) - 1;
                  return `${mNames[mIdx] || parts[1]} '${parts[0].slice(2)}`;
                }
                return item.month;
              })();

              const isHovered = hoveredMonth?.month === item.month;

              return (
                <div
                  key={item.month}
                  onMouseEnter={() => setHoveredMonth(item)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  style={{
                    flex: isFewMonths ? '0 0 auto' : 1,
                    minWidth: isFewMonths ? '90px' : '42px',
                    maxWidth: isFewMonths ? '140px' : '80px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    padding: '4px',
                    backgroundColor: isCurrent ? 'rgba(2, 132, 199, 0.08)' : (isHovered ? '#f1f5f9' : 'transparent'),
                    border: isCurrent ? '1.5px dashed #0284c7' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Current Active Cycle Tag */}
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '-18px',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: '#0284c7',
                      backgroundColor: '#e0f2fe',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      border: '1px solid #bae6fd',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      {lang === 'es' ? '★ Ciclo Activo' : '★ Active Cycle'}
                    </div>
                  )}

                  {/* The Bar itself */}
                  <div style={{
                    width: '100%',
                    maxWidth: isFewMonths ? '58px' : '32px',
                    height: `${barHeightPct}%`,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    borderRadius: '4px 4px 0 0',
                    overflow: 'hidden',
                    boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.06)',
                    transform: isHovered ? 'scaleY(1.02)' : 'none',
                    transition: 'all 0.15s ease'
                  }}>
                    {/* Paid segment (Green) */}
                    {item.paid > 0 && (
                      <div
                        style={{
                          height: `${paidHeightPct}%`,
                          backgroundColor: '#16a34a',
                          transition: 'height 0.3s ease'
                        }}
                        title={`Paid: ${item.paid.toLocaleString()} ${currency}`}
                      />
                    )}
                    {/* Pending segment (Orange) */}
                    {item.pending > 0 && (
                      <div
                        style={{
                          height: `${pendingHeightPct}%`,
                          backgroundColor: '#ea580c',
                          transition: 'height 0.3s ease'
                        }}
                        title={`Pending: ${item.pending.toLocaleString()} ${currency}`}
                      />
                    )}
                  </div>

                  {/* X Axis Month Label */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-22px',
                    fontSize: '0.70rem',
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? '#0284c7' : '#64748b',
                    whiteSpace: 'nowrap'
                  }}>
                    {monthLabel}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hover / Detail Status Bar */}
          <div style={{
            marginTop: '28px',
            padding: '8px 12px',
            backgroundColor: hoveredMonth ? '#f0f9ff' : '#f8fafc',
            border: `1px solid ${hoveredMonth ? '#bae6fd' : '#e2e8f0'}`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.74rem'
          }}>
            {hoveredMonth ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#003666', fontSize: '0.80rem' }}>{hoveredMonth.month}</strong>
                  <span style={{ color: '#64748b' }}>({hoveredMonth.count} {hoveredMonth.count === 1 ? 'factura' : 'facturas'})</span>
                  {hoveredMonth.isCurrentCycle && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
                      {lang === 'es' ? 'Período Activo' : 'Active Cycle'}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span>{lang === 'es' ? 'Total:' : 'Total:'} <strong>{hoveredMonth.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</strong></span>
                  <span style={{ color: '#16a34a' }}>{lang === 'es' ? 'Pagado:' : 'Settled:'} <strong>{hoveredMonth.paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</strong></span>
                  {hoveredMonth.pending > 0 && (
                    <span style={{ color: '#ea580c', fontWeight: 700 }}>{lang === 'es' ? 'Pendiente:' : 'Pending:'} {hoveredMonth.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
                  )}
                </div>
              </>
            ) : (
              <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={12} color="#0284c7" />
                <span>
                  {lang === 'es'
                    ? 'Pasa el cursor o pulsa sobre cualquier mes para ver el desglose exacto de liquidación.'
                    : 'Hover or tap on any monthly bar to inspect the exact contracted and settlement breakdown.'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
