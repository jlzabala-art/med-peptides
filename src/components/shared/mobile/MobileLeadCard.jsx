"use client";

import React, { useRef, useCallback } from 'react';
import { Phone, Mail, UserCheck, MessageSquare, CheckSquare, Square, Building } from '@/lib/icons';
import StatusBadge from '../../ui/StatusBadge';
import SwipeableCard from '../../ui/SwipeableCard';
import { triggerHaptic } from '../../../utils/haptics';

const LONG_PRESS_MS = 500;

export default function MobileLeadCard({
  row,
  onRowClick,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onLongPress,
  onQuickAction,
  onConvertToPatient,
}) {
  const name = row.name || row.contactName || 'New Lead';
  const company = row.company || row.clinicName || row.organization || '';
  const email = row.email || '';
  const phone = row.phone || row.mobile || '';
  const status = (row.status || 'new').toLowerCase();
  const value = row.estimatedValue || row.value || 0;
  const score = row.score || row.leadScore || null;

  const timer = useRef(null);
  const handleTouchStart = useCallback(() => {
    timer.current = setTimeout(() => {
      triggerHaptic('medium');
      onLongPress?.();
    }, LONG_PRESS_MS);
  }, [onLongPress]);

  const cancelLongPress = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleTap = useCallback(() => {
    cancelLongPress();
    triggerHaptic('light');
    if (selectionMode) onToggleSelect?.();
    else onRowClick?.(row);
  }, [selectionMode, onToggleSelect, onRowClick, row, cancelLongPress]);

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    triggerHaptic('tap');
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const text = `Hola ${name}, gracias por contactar con Atlas Health. ¿Cómo podemos ayudarte con tus protocolos?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const handleCall = (e) => {
    e.stopPropagation();
    triggerHaptic('tap');
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  const handleConvert = (e) => {
    e.stopPropagation();
    triggerHaptic('success');
    onConvertToPatient?.(row);
  };

  const swipeActions = {
    left: [
      {
        icon: <MessageSquare size={18} />,
        label: 'WhatsApp',
        color: '#25d366',
        onClick: () => {
          if (phone) {
            const cleanPhone = phone.replace(/[^0-9+]/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener');
          }
        },
      },
    ],
    right: [
      {
        icon: <UserCheck size={18} />,
        label: 'Convert',
        color: '#7c3aed',
        onClick: () => onConvertToPatient?.(row),
      },
    ],
  };

  return (
    <SwipeableCard {...swipeActions}>
      <div
        className={`mpc-card${isSelected ? ' mpc-card--selected' : ''}`}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        role="button"
        tabIndex={0}
        style={{
          position: 'relative',
          background: 'white',
          borderRadius: '14px',
          border: isSelected ? '1.5px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          padding: '0.9rem 1rem',
          marginBottom: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          userSelect: 'none',
        }}
      >
        {/* Top Header: Selection, Name, Score, Status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {selectionMode && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('tap');
                  onToggleSelect?.();
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? '#003666' : '#94a3b8',
                }}
              >
                {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
              </div>
            )}

            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{name}</div>
              {company && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#64748b', marginTop: '0.1rem' }}>
                  <Building size={12} /> {company}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
            <StatusBadge status={status} compact />
            {score !== null && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: score >= 70 ? '#15803d' : '#d97706' }}>
                Score: {score}/100
              </span>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.78rem', color: '#475569' }}>
          {email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Mail size={12} color="#64748b" />
              <span>{email}</span>
            </div>
          )}
          {phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Phone size={12} color="#64748b" />
              <span>{phone}</span>
            </div>
          )}
        </div>

        {/* Bottom Actions Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '0.5rem',
          marginTop: '0.2rem',
        }}>
          <div>
            {value > 0 && (
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#003666' }}>
                ${value.toLocaleString()}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {phone && (
              <>
                <button
                  onClick={handleCall}
                  title="Call Lead"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Phone size={15} />
                </button>

                <button
                  onClick={handleWhatsApp}
                  title="WhatsApp"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#25d366',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <MessageSquare size={15} />
                </button>
              </>
            )}

            {onConvertToPatient && status !== 'won' && (
              <button
                onClick={handleConvert}
                title="Convert to Patient"
                style={{
                  height: '36px',
                  padding: '0 0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#7c3aed',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: 'pointer',
                }}
              >
                <UserCheck size={14} /> Convert
              </button>
            )}
          </div>
        </div>
      </div>
    </SwipeableCard>
  );
}
