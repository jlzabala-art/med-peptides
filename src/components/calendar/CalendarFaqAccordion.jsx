"use client";

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Calendar, RefreshCw, Clock, ShieldCheck, Palette } from '@/lib/icons';

const CALENDAR_FAQS = [
  {
    id: 'auto-sync',
    icon: Calendar,
    question: 'How are protocol doses automatically scheduled on my calendar?',
    answer: 'When a medical specialist activates a clinical protocol or prescription, the Atlas Health engine automatically calculates all scheduled administration days (e.g., Mon/Wed/Fri or daily morning doses) and populates your calendar in real time.'
  },
  {
    id: 'google-ical-sync',
    icon: RefreshCw,
    question: 'How do I sync my doses with Google Calendar or Apple iCal?',
    answer: 'Click the "Import / Export" dropdown at the top left of the calendar and choose "Export .ics File" to download your complete schedule, or select "Sync with Google Calendar" to connect your account for automated two-way synchronization.'
  },
  {
    id: 'color-legend',
    icon: Palette,
    question: 'What do the different color badges on calendar events mean?',
    answer: '• Regenera Teal (#1FA98F): Active Protocol Doses\n• Cyan (#3FB8C7): Verified Doctor Prescriptions\n• Gold (#B98E4C): Order Dispatch & Cold Chain Shipping\n• Slate Blue (#2563eb): Clinical Consultations & Lab Monitoring'
  },
  {
    id: 'timezone-support',
    icon: Clock,
    question: 'How do timezones (e.g., Europe/Madrid vs. Asia/Dubai) affect my dose times?',
    answer: 'Your calendar automatically displays events in your local browser timezone. You can switch the timezone selector at the top bar to preview schedules in different regions without altering your underlying protocol schedule.'
  },
  {
    id: 'missed-dose',
    icon: ShieldCheck,
    question: 'What should I do if I miss a scheduled dose?',
    answer: 'Tap the missed dose event in your calendar to log your progress or record symptoms. Never double your next dose. If in doubt, use the "💬 Direct Medical WhatsApp" or "Request Doctor Review" button to consult your supervising physician.'
  }
];

export default function CalendarFaqAccordion() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div 
      style={{
        marginTop: '2rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
        <HelpCircle size={20} color="#003666" />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#003666' }}>
            Calendar & Dosing Schedule FAQ
          </h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
            Essential guidance for managing clinical protocol schedules, timezones, and calendar exports.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {CALENDAR_FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          const Icon = faq.icon;

          return (
            <div
              key={faq.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: isOpen ? '#f8fafc' : '#ffffff',
                transition: 'all 0.2s ease'
              }}
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: '44px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '8px',
                    backgroundColor: isOpen ? 'rgba(0, 54, 102, 0.1)' : '#f1f5f9',
                    color: isOpen ? '#003666' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={16} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                    {faq.question}
                  </span>
                </div>
                {isOpen ? <ChevronUp size={18} color="#003666" /> : <ChevronDown size={18} color="#94a3b8" />}
              </button>

              {isOpen && (
                <div style={{ padding: '0 1.1rem 1rem 3.1rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
