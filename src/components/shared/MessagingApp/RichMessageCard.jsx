"use client";

import React, { useState } from 'react';
import { Package, ShoppingBag, CreditCard, ExternalLink, Calendar, CheckCircle, Download, Clock } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { downloadSingleAppointmentICS } from '../../../services/calendarService';

export default function RichMessageCard({ type, referenceId, text }) {
  const [confirmed, setConfirmed] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // ── Calendar Invite Card Handler ──────────────────────────────────────────
  if (type === 'calendar_invite') {
    let inviteData = {};
    try {
      inviteData = typeof referenceId === 'string' && referenceId.startsWith('{')
        ? JSON.parse(referenceId)
        : { title: 'Clinical Consultation', dateTime: referenceId, duration: 30 };
    } catch {
      inviteData = { title: text || 'Clinical Consultation', dateTime: new Date().toISOString(), duration: 30 };
    }

    const { title = 'Clinical Consultation', dateTime, duration = 30, doctorName, patientName, notes } = inviteData;
    const formattedDate = dateTime ? new Date(dateTime).toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Date to be confirmed';

    const handleConfirmAndAdd = async (e) => {
      e.stopPropagation();
      setLoadingAction(true);
      try {
        if (db) {
          const startDate = new Date(dateTime || Date.now());
          const endDate = new Date(startDate.getTime() + (Number(duration) || 30) * 60000);
          await addDoc(collection(db, 'calendar_events'), {
            title: title || 'Clinical Consultation',
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            type: 'consultation',
            doctorName: doctorName || '',
            patientName: patientName || '',
            notes: notes || '',
            status: 'confirmed',
            createdAt: serverTimestamp()
          });
        }
        setConfirmed(true);
        toast.success('Appointment confirmed & saved to your calendar!');
      } catch (err) {
        console.error('Error adding calendar event:', err);
        toast.error('Could not save to calendar');
      } finally {
        setLoadingAction(false);
      }
    };

    const handleDownloadICS = (e) => {
      e.stopPropagation();
      downloadSingleAppointmentICS({
        title,
        date: dateTime,
        durationMinutes: duration,
        doctorName,
        patientName,
        notes
      });
      toast.success('Calendar .ics downloaded!');
    };

    return (
      <div 
        style={{
          marginTop: '0.65rem',
          padding: '0.85rem 1rem',
          backgroundColor: '#f8fafc',
          border: '1.5px solid #0d9488',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(13, 148, 136, 0.08)',
          maxWidth: '380px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '8px', backgroundColor: '#ccfbf1',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488'
            }}>
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{title}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {doctorName ? `With ${doctorName}` : 'Clinical Consultation'}
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: confirmed ? '#dcfce7' : '#fef3c7',
            color: confirmed ? '#15803d' : '#b45309',
            border: `1px solid ${confirmed ? '#86efac' : '#fde68a'}`
          }}>
            {confirmed ? 'Confirmed ✓' : 'Invite'}
          </span>
        </div>

        <div style={{
          padding: '0.45rem 0.65rem',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          fontSize: '0.78rem',
          color: '#334155',
          marginBottom: '0.65rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Clock size={14} color="#0d9488" />
          <span><strong>{formattedDate}</strong> ({duration} min)</span>
        </div>

        {text && text !== dateTime && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.65rem', fontStyle: 'italic' }}>
            "{text}"
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px' }}>
          {!confirmed ? (
            <button
              type="button"
              onClick={handleConfirmAndAdd}
              disabled={loadingAction}
              style={{
                flex: 1,
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f766e'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0d9488'}
            >
              <CheckCircle size={13} />
              <span>{loadingAction ? 'Saving...' : 'Accept & Add'}</span>
            </button>
          ) : (
            <div style={{
              flex: 1,
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              fontSize: '0.74rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              <CheckCircle size={13} />
              <span>Added to Calendar</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleDownloadICS}
            title="Download .ics file for Apple/Google Calendar"
            style={{
              padding: '0.4rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <Download size={13} />
            <span>.ics</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Standard Cards (Product, Order, Payment) ──────────────────────────────
  let icon = null;
  let title = '';
  let color = '#1a73e8';
  let bgColor = '#e8f0fe';

  if (type === 'link_product') {
    icon = <Package size={24} color={color} />;
    title = 'Product Recommendation';
  } else if (type === 'link_order') {
    color = '#f59e0b';
    bgColor = '#fef3c7';
    icon = <ShoppingBag size={24} color={color} />;
    title = 'Order Reference';
  } else if (type === 'payment_link') {
    color = '#10b981';
    bgColor = '#d1fae5';
    icon = <CreditCard size={24} color={color} />;
    title = 'Payment Link';
  }

  const isUrl = referenceId && (referenceId.startsWith('http://') || referenceId.startsWith('https://'));

  const handleClick = () => {
    if (isUrl) {
      window.open(referenceId, '_blank');
    } else {
      toast(`Navigating to ${type}: ${referenceId}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem',
        marginTop: '0.5rem',
        backgroundColor: '#ffffff',
        border: `1px solid ${color}`,
        borderRadius: '8px',
        cursor: 'pointer',
        gap: '1rem',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{
        width: 40, height: 40, borderRadius: '8px', backgroundColor: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, color: '#3c4043' }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{title}</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8, wordBreak: 'break-all' }}>
          {text || referenceId}
        </div>
      </div>
      {isUrl && <ExternalLink size={16} color="#9aa0a6" />}
    </div>
  );
}