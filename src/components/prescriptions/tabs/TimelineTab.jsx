import React from 'react';
import { User, Upload, MessageCircle, AlertTriangle } from '@/lib/icons';

export default function TimelineTab({ rx }) {
  // Aggregate and enrich timeline events
  let allEvents = [...(rx.timeline || [])];

  // 1. Patient Registration Date
  if (rx.patient?.createdAt) {
    allEvents.push({
      timestamp: rx.patient.createdAt,
      event: 'Patient Registration',
      description: `Patient ${rx.patient.name || ''} profile created.`
    });
  } else if (rx.patient?.registeredAt) {
    allEvents.push({
      timestamp: rx.patient.registeredAt,
      event: 'Patient Registration',
      description: `Patient ${rx.patient.name || ''} profile created.`
    });
  }

  // 2. Prescription Issuance Date
  if (rx.createdAt || rx.dateIssued) {
    // Check if we don't already have an exact duplicate "Created" event
    const hasCreation = allEvents.some(e => e.event && e.event.toLowerCase().includes('created') && e.timestamp === (rx.createdAt || rx.dateIssued));
    if (!hasCreation) {
      allEvents.push({
        timestamp: rx.createdAt || rx.dateIssued,
        event: 'Prescription Issued',
        description: `Initial prescription issued by ${rx.doctor?.name || rx.doctorName || 'Doctor'}.`
      });
    }
  }

  // 3. Interactions / Consultations
  if (rx.messages && Array.isArray(rx.messages)) {
    rx.messages.forEach(msg => {
      allEvents.push({
        timestamp: msg.timestamp || msg.date || new Date().toISOString(),
        event: msg.sender === 'patient' ? 'Message from Patient' : 'Consultation Sent',
        description: msg.content || 'Communication logged.'
      });
    });
  }

  // 4. Smart Adherence Alert (Phase 6)
  // Check if prescription duration has passed by 2 weeks and no refill exists
  const durationWeeks = parseInt(rx.duration) || 4;
  const startDate = rx.dateIssued ? new Date(rx.dateIssued) : (rx.createdAt ? new Date(rx.createdAt) : null);
  if (startDate) {
    const expectedEndDate = new Date(startDate.getTime() + (durationWeeks * 7 * 24 * 60 * 60 * 1000));
    const twoWeeksPastEnd = new Date(expectedEndDate.getTime() + (14 * 24 * 60 * 60 * 1000));
    const now = new Date();
    
    // If we are 2 weeks past the expected end date, and status is not Draft/Renewed/Cancelled
    if (now > twoWeeksPastEnd && !['Draft', 'Cancelled'].includes(rx.status)) {
      // Ensure we haven't already marked an adherence alert
      const hasAdherenceAlert = allEvents.some(e => e.event === 'Adherence Alert');
      if (!hasAdherenceAlert) {
        allEvents.push({
          timestamp: twoWeeksPastEnd.toISOString(),
          event: 'Adherence Alert',
          description: `Patient is overdue for a refill by >2 weeks based on a ${durationWeeks}-week protocol. Follow up recommended.`
        });
      }
    }
  }

  // Sort descending by date
  allEvents.sort((a, b) => {
    const d1 = new Date(b.timestamp || 0).getTime();
    const d2 = new Date(a.timestamp || 0).getTime();
    return d1 - d2;
  });

  const getEventIcon = (event = '') => {
    const eLower = event.toLowerCase();
    if (eLower.includes('upload') || eLower.includes('document') || eLower.includes('pdf'))
      return { icon: Upload, color: '#3b82f6', bg: '#eff6ff' };
    if (eLower.includes('assign') || eLower.includes('manager'))
      return { icon: User, color: '#f59e0b', bg: '#fffbeb' };
    if (eLower.includes('message') || eLower.includes('consultation'))
      return { icon: MessageCircle, color: '#10b981', bg: '#ecfdf5' };
    if (eLower.includes('alert') || eLower.includes('adherence'))
      return { icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' };
    return { icon: User, color: '#6366f1', bg: '#eef2ff' };
  };

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {allEvents.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', padding: '2rem 0' }}>
          No timeline events recorded.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              bottom: '1rem',
              left: '1.25rem',
              width: '2px',
              background: '#e2e8f0',
              zIndex: 0,
            }}
          />
          {allEvents.map((evt, i) => {
            const { icon: EventIcon, color, bg } = getEventIcon(evt.event);
            return (
              <div key={i} style={{ display: 'flex', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: bg,
                    border: `2px solid white`,
                    boxShadow: '0 0 0 1px #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <EventIcon size={18} color={color} />
                </div>
                <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                    {evt.event}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.4 }}>
                    {evt.description}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                    {new Date(evt.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
