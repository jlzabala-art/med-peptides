import React, { useState, useEffect, useCallback, useRef } from 'react';
import './CalendarCloud.css';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import ProtocolDayBadge from './ProtocolDayBadge';
import { useAuth } from '../../context/AuthContext';

// Detect mobile viewport
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

// Helper to generate iCal content
const generateICal = (events) => {
  const lines = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Atlas Health//RegeneraCalendar//EN');
  events.forEach((e) => {
    const uid = `event-${e.id}@atlashealth.com`;
    const dtStart = new Date(e.start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtEnd = e.end ? new Date(e.end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : dtStart;
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${e.title}`);
    lines.push(`DESCRIPTION:${e.extendedProps?.description || ''}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\n');
};

export default function RegeneraCalendar() {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const { userProfile } = useAuth();
  const isPatient = userProfile?.role === 'patient';

  // Mobile detection with resize listener
  const [mobile, setMobile] = useState(isMobile());
  useEffect(() => {
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // FullCalendar ref — used to force updateSize() after mount (fixes Safari 0-height grid)
  const calendarRef = useRef(null);
  useEffect(() => {
    // Give the browser a frame to finish layout, then tell FC to recalculate
    const t1 = setTimeout(() => {
      calendarRef.current?.getApi().updateSize();
    }, 50);
    const t2 = setTimeout(() => {
      calendarRef.current?.getApi().updateSize();
    }, 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [mobile, loading]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [viewTimezone, setViewTimezone] = useState(browserTimezone);
  const defaultEventForm = {
    title: '', start: '', end: '', type: 'prescription', patientId: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, description: '',
    dosage: '', injectionSite: '', prn: false, refillReminder: false, symptoms: ''
  };
  const [eventForm, setEventForm] = useState(defaultEventForm);
  const [timezoneList, setTimezoneList] = useState([]);
  const [googleAuthUrl, setGoogleAuthUrl] = useState('');

  // Initial fetch and custom event listener for AI Actions
  useEffect(() => {
    const handleOpenModal = () => {
      setSelectedEvent(null);
      setEventForm(defaultEventForm);
      setModalMode('create');
      setModalOpen(true);
    };

    window.addEventListener('open-calendar-modal', handleOpenModal);
    return () => window.removeEventListener('open-calendar-modal', handleOpenModal);
  }, []);

  // Load timezone list once
  useEffect(() => {
    if (Intl.supportedValuesOf) {
      setTimezoneList(Intl.supportedValuesOf('timeZone'));
    } else {
      setTimezoneList(['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']);
    }
  }, []);

  // Google Calendar auth URL generation
  const fetchGoogleAuth = useCallback(async () => {
    try {
      const generateAuthUrl = httpsCallable(functions, 'generateAuthUrl');
      const result = await generateAuthUrl();
      setGoogleAuthUrl(result.data.url);
    } catch (e) {
      console.error('Google auth error', e);
    }
  }, []);

  // Open modal for creating a new event
  const openCreateModal = () => {
    if (isPatient) return;
    setModalMode('create');
    setEventForm(defaultEventForm);
    setModalOpen(true);
  };

  // Open modal from date click
  const handleDateClick = (info) => {
    if (isPatient) return;
    setModalMode('create');
    setEventForm({
      ...defaultEventForm,
      start: info.dateStr + (info.dateStr.includes('T') ? '' : 'T08:00')
    });
    setModalOpen(true);
  };

  // Open modal for editing an existing event
  const openEditModal = (event) => {
    setModalMode('edit');
    setEventForm({
      title: event.title,
      start: event.start,
      end: event.end,
      type: event.extendedProps?.type || 'prescription',
      timezone: event.extendedProps?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      description: event.extendedProps?.description || '',
      dosage: event.extendedProps?.dosage || '',
      injectionSite: event.extendedProps?.injectionSite || '',
      prn: event.extendedProps?.prn || false,
      refillReminder: event.extendedProps?.refillReminder || false,
      symptoms: event.extendedProps?.symptoms || '',
    });
    setSelectedEvent(event);
    setModalOpen(true);
  };

  // Submit handler for modal form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Auto-generate title if not provided by patient or type
    const patientName = eventForm.patientId ? eventForm.patientId : 'Unassigned';
    let typeName = 'Event';
    switch(eventForm.type) {
      case 'prescription': typeName = 'Prescription / Dose'; break;
      case 'protocol': typeName = 'Protocol Day'; break;
      case 'order': typeName = 'Order / Purchase'; break;
      case 'shipping': typeName = 'Shipping'; break;
      default: typeName = 'Other'; break;
    }
    const generatedTitle = `${patientName} - ${typeName}`;

    const payload = {
      title: generatedTitle,
      start: eventForm.start,
      end: eventForm.end,
      type: eventForm.type,
      timezone: eventForm.timezone,
      description: eventForm.description,
      dosage: eventForm.dosage,
      injectionSite: eventForm.injectionSite,
      prn: eventForm.prn,
      refillReminder: eventForm.refillReminder,
      symptoms: eventForm.symptoms,
    };
    try {
      if (modalMode === 'create') {
        await createEvent(payload);
      } else if (modalMode === 'edit' && selectedEvent) {
        await updateEvent(selectedEvent.id, payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Event save error', err);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteEvent(selectedEvent.id);
      setModalOpen(false);
    }
  };

  // Export CSV helper (simple)
  const exportCSV = () => {
    const header = ['Title', 'Start', 'End', 'Type', 'Timezone', 'Description'];
    const rows = events.map((e) => [
      e.title,
      e.start,
      e.end || '',
      e.extendedProps?.type || '',
      e.extendedProps?.timezone || '',
      e.extendedProps?.description || '',
    ]);
    const csvContent = [header, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar_events.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export iCal
  const exportICal = () => {
    const ics = generateICal(events);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar_events.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render event content with badge and conflict glow
  const renderEventContent = (eventInfo) => {
    const { event } = eventInfo;
    const isProtocol = event.extendedProps?.type === 'protocol';
    const isConflict = event.extendedProps?.conflict;
    const bg = event.backgroundColor;
    return (
      <div
        className={`custom-fc-event-content ${isConflict ? 'conflict-glow' : ''}`}
        style={{ backgroundColor: bg, color: '#fff', padding: '2px 4px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        onClick={() => openEditModal(event)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter') openEditModal(event); }}
        aria-label={`${event.title}, ${event.extendedProps?.type} event`}
      >
        {isProtocol && <ProtocolDayBadge tooltip="Protocol dosing day" />}
        {event.extendedProps?.refillReminder && <span style={{ marginLeft: '4px' }} title="Refill Alert">🔄</span>}
        {event.extendedProps?.prn && <span style={{ marginLeft: '4px' }} title="PRN (As Needed)">⚡</span>}
        <span style={{ marginLeft: '6px' }}>{event.title}</span>
      </div>
    );
  };

  // Toolbar with extra buttons
  const renderToolbar = () => (
    <div className="calendar-toolbar">
      <div className="cal-toolbar-left">
        {!isPatient && (
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>+ Event</button>
        )}
        <button className="btn btn-secondary btn-sm hide-mobile" onClick={exportCSV}>CSV</button>
        <button className="btn btn-secondary btn-sm hide-mobile" onClick={exportICal}>iCal</button>
        {!isPatient && (
          <button className="btn btn-secondary btn-sm hide-mobile" onClick={() => setShareModalOpen(true)}>Share</button>
        )}
        {!isPatient && (
          <button className="btn btn-secondary btn-sm hide-mobile" onClick={fetchGoogleAuth}>Google</button>
        )}
        {googleAuthUrl && !isPatient && (
          <a href={googleAuthUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm hide-mobile" style={{ textDecoration: 'none' }}>
            Authorize
          </a>
        )}
      </div>
      <div className="cal-toolbar-right">
        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>TZ:</label>
        <select
          className="cal-input"
          style={{ padding: '0.3rem 0.4rem', fontSize: '0.8rem', minWidth: '130px' }}
          value={viewTimezone}
          onChange={(e) => setViewTimezone(e.target.value)}
        >
          <option value={browserTimezone}>{browserTimezone} (Auto)</option>
          {timezoneList.filter(tz => tz !== browserTimezone).map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const calendarView = 'dayGridMonth';
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  };

  return (
    <div className="regenera-calendar-wrapper" role="region" aria-label="Event Calendar">
      {renderToolbar()}
      <div style={{ width: '100%' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={calendarView}
          key={`fc-${viewTimezone}`}
          timeZone={viewTimezone}
          headerToolbar={headerToolbar}
          editable={!isPatient}
          selectable={!isPatient}
          dateClick={handleDateClick}
          selectMirror={true}
          dayMaxEvents={mobile ? 2 : true}
          events={events}
          eventContent={renderEventContent}
          contentHeight="auto"
          noEventsContent="No events scheduled"
        />
      </div>

      {/* Modal for create / edit */}
      {modalOpen && (
        <div className="cal-dialog-overlay">
          <div className="cal-dialog">
            <div className="cal-dialog-header">
              <h3 className="cal-dialog-title">{modalMode === 'create' ? 'Create New Event' : 'Edit Event'}</h3>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="cal-dialog-body" style={{ paddingBottom: '0.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>Event Details</h4>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="cal-form-group" style={{ flex: '1 1 150px' }}>
                    <label className="cal-form-label">Patient</label>
                    <select value={eventForm.patientId} onChange={(e) => setEventForm({ ...eventForm, patientId: e.target.value })} className="cal-input" disabled={isPatient}>
                      <option value="">- Unassigned -</option>
                      <option value="p1">John Doe (BPC-157 Protocol)</option>
                      <option value="p2">Jane Smith (GHK-Cu Therapy)</option>
                      <option value="p3">Robert Brown (Maintenance)</option>
                    </select>
                  </div>
                  <div className="cal-form-group" style={{ flex: '1 1 150px' }}>
                    <label className="cal-form-label">Event Type</label>
                    <select value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })} className="cal-input" disabled={isPatient}>
                      <option value="prescription">Prescription / Dose</option>
                      <option value="protocol">Protocol Day</option>
                      <option value="order">Order / Purchase</option>
                      <option value="shipping">Shipping</option>
                      <option value="default">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="cal-form-group" style={{ flex: '1 1 150px' }}>
                    <label className="cal-form-label">Start</label>
                    <input type="datetime-local" required value={eventForm.start} onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })} className="cal-input" disabled={isPatient} />
                  </div>
                  <div className="cal-form-group" style={{ flex: '1 1 150px' }}>
                    <label className="cal-form-label">End (optional)</label>
                    <input type="datetime-local" value={eventForm.end} onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })} className="cal-input" disabled={isPatient} />
                  </div>
                </div>
                
                <h4 style={{ margin: '1.5rem 0 1rem', fontSize: '0.9rem', color: 'var(--color-success)', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>Medical Options (Optional)</h4>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <div className="cal-form-group" style={{ flex: '1 1 150px' }}>
                    <label className="cal-form-label">Dosage</label>
                    <input type="text" placeholder="e.g., 500mcg" value={eventForm.dosage} onChange={(e) => setEventForm({ ...eventForm, dosage: e.target.value })} className="cal-input" disabled={isPatient} />
                  </div>
                  <div className="cal-form-group" style={{ flex: '1 1 150px' }}>
                    <label className="cal-form-label">Injection Site</label>
                    <select value={eventForm.injectionSite} onChange={(e) => setEventForm({ ...eventForm, injectionSite: e.target.value })} className="cal-input" disabled={isPatient}>
                      <option value="">- Select site -</option>
                      <option value="abdomen_left">Abdomen (Left)</option>
                      <option value="abdomen_right">Abdomen (Right)</option>
                      <option value="thigh_left">Thigh (Left)</option>
                      <option value="thigh_right">Thigh (Right)</option>
                      <option value="shoulder_left">Shoulder (Left)</option>
                      <option value="shoulder_right">Shoulder (Right)</option>
                      <option value="glute">Glute</option>
                      <option value="sublingual">Sublingual (Oral)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: isPatient ? 'default' : 'pointer' }}>
                    <input type="checkbox" checked={eventForm.prn} onChange={(e) => setEventForm({ ...eventForm, prn: e.target.checked })} disabled={isPatient} />
                    "As Needed" Dose (PRN)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: isPatient ? 'default' : 'pointer' }}>
                    <input type="checkbox" checked={eventForm.refillReminder} onChange={(e) => setEventForm({ ...eventForm, refillReminder: e.target.checked })} disabled={isPatient} />
                    Refill Reminder
                  </label>
                </div>

                <div className="cal-form-group" style={{ marginTop: '1rem' }}>
                  <label className="cal-form-label">Symptom Log / Notes</label>
                  <textarea rows="2" placeholder="Side effects, mood..." value={eventForm.symptoms} onChange={(e) => setEventForm({ ...eventForm, symptoms: e.target.value })} className="cal-input" disabled={isPatient} />
                </div>
              </div>

              <div className="cal-dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Close</button>
                {!isPatient && modalMode === 'edit' && (
                  <button type="button" className="btn btn-danger" onClick={handleDelete} style={{ marginRight: 'auto' }}>
                    Delete
                  </button>
                )}
                {!isPatient && (
                  <button type="submit" className="btn btn-primary">
                    {modalMode === 'create' ? 'Create Event' : 'Save'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to share with patient */}
      {shareModalOpen && (
        <div className="cal-dialog-overlay">
          <div className="cal-dialog">
            <div className="cal-dialog-header">
              <h3 className="cal-dialog-title">Share Calendar</h3>
            </div>
            <div className="cal-dialog-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                Generate a secure link for the patient to only see events (doses, protocols) assigned to them. They will not be able to edit or see others' events.
              </p>
              <div className="cal-form-group">
                <label className="cal-form-label">Patient</label>
                <select className="cal-input" defaultValue="">
                  <option value="" disabled>Select a patient...</option>
                  <option value="p1">John Doe (BPC-157 Protocol)</option>
                  <option value="p2">Jane Smith (GHK-Cu Therapy)</option>
                  <option value="p3">Robert Brown (Maintenance)</option>
                </select>
              </div>
              <div className="cal-form-group" style={{ marginTop: '1rem' }}>
                <label className="cal-form-label">Private Link</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" readOnly value="https://app.regenpept.com/calendar?patientId=xyz" className="cal-input" style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.02)' }} />
                  <button className="btn btn-secondary" onClick={() => alert('Link copied to clipboard')}>Copy</button>
                </div>
              </div>
            </div>
            <div className="cal-dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShareModalOpen(false)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => { alert('Invitation sent to patient via email.'); setShareModalOpen(false); }}>Send via Email</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
