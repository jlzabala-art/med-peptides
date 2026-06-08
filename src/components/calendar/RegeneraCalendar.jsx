import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Checkbox } from '../../components/ui';
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

// Event Colors mapping
const getEventColor = (type) => {
  switch (type) {
    case 'protocol': return '#1FA98F'; // Regenera Green
    case 'prescription': return '#3FB8C7'; // Cyan
    case 'order': return '#B98E4C'; // Gold
    case 'shipping': return '#8a9994'; // Grey
    default: return '#2563eb'; // Default blue
  }
};

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

  // Filter state
  const [activeFilter, setActiveFilter] = useState('all');

  // FullCalendar ref
  const calendarRef = useRef(null);
  useEffect(() => {
    const t1 = setTimeout(() => {
      calendarRef.current?.getApi().updateSize();
    }, 50);
    const t2 = setTimeout(() => {
      calendarRef.current?.getApi().updateSize();
    }, 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [mobile, loading, activeFilter]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [showAdvanced, setShowAdvanced] = useState(false); // Progressive expansion for mobile
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

  // Apply filters
  const filteredEvents = events.filter(e => {
    if (activeFilter === 'all') return true;
    return e.extendedProps?.type === activeFilter;
  }).map(e => ({
    ...e,
    backgroundColor: getEventColor(e.extendedProps?.type),
    borderColor: getEventColor(e.extendedProps?.type)
  }));

  useEffect(() => {
    const handleOpenModal = () => {
      setSelectedEvent(null);
      setEventForm(defaultEventForm);
      setModalMode('create');
      setShowAdvanced(!isMobile()); // Hide advanced by default on mobile
      setModalOpen(true);
    };

    window.addEventListener('open-calendar-modal', handleOpenModal);
    return () => window.removeEventListener('open-calendar-modal', handleOpenModal);
  }, []);

  useEffect(() => {
    if (Intl.supportedValuesOf) {
      setTimezoneList(Intl.supportedValuesOf('timeZone'));
    } else {
      setTimezoneList(['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']);
    }
  }, []);

  const fetchGoogleAuth = useCallback(async () => {
    try {
      const generateAuthUrl = httpsCallable(functions, 'generateAuthUrl');
      const result = await generateAuthUrl();
      setGoogleAuthUrl(result.data.url);
    } catch (e) {
      console.error('Google auth error', e);
    }
  }, []);

  const openCreateModal = () => {
    if (isPatient) return;
    setModalMode('create');
    setEventForm(defaultEventForm);
    setShowAdvanced(!isMobile());
    setModalOpen(true);
  };

  const handleDateClick = (info) => {
    if (isPatient) return;
    setModalMode('create');
    setEventForm({
      ...defaultEventForm,
      start: info.dateStr + (info.dateStr.includes('T') ? '' : 'T08:00')
    });
    setShowAdvanced(!isMobile());
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setModalMode('edit');
    setEventForm({
      title: event.title,
      start: event.startStr ? event.startStr.slice(0, 16) : '',
      end: event.endStr ? event.endStr.slice(0, 16) : '',
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
    setShowAdvanced(!isMobile() || !!event.extendedProps?.dosage); // Show if there is advanced data
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteEvent(selectedEvent.id);
      setModalOpen(false);
    }
  };

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

  const renderEventContent = (eventInfo) => {
    const { event, view } = eventInfo;
    const isProtocol = event.extendedProps?.type === 'protocol';
    const isConflict = event.extendedProps?.conflict;
    
    // Custom render for list/agenda view to hide default dots and show a clean layout
    if (view.type === 'listWeek' || view.type === 'listDay') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: event.backgroundColor }}></div>
            <span style={{ fontWeight: 600 }}>{event.title}</span>
          </div>
          {event.extendedProps?.description && (
            <span style={{ fontSize: '0.8rem', color: 'var(--cal-color-text-muted)' }}>{event.extendedProps.description}</span>
          )}
        </div>
      );
    }

    return (
      <div
        className={`custom-fc-event-content ${isConflict ? 'conflict-glow' : ''}`}
        style={{ color: '#fff', cursor: 'pointer' }}
        onClick={() => openEditModal(event)}
      >
        {isProtocol && <ProtocolDayBadge tooltip="Protocol dosing day" />}
        {event.extendedProps?.refillReminder && <span style={{ marginLeft: '4px' }} title="Refill Alert">🔄</span>}
        {event.extendedProps?.prn && <span style={{ marginLeft: '4px' }} title="PRN (As Needed)">⚡</span>}
        <span style={{ marginLeft: '6px' }}>{event.title}</span>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="empty-calendar-state">
        <div className="empty-icon">📅</div>
        <h4>No scheduled events</h4>
        <p>Your calendar is currently clear. Ready to plan your next protocol?</p>
        <div className="empty-actions">
          {!isPatient && (
            <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
              + Create Event
            </button>
          )}
          {!isPatient && (
            <button className="btn btn-secondary btn-sm" onClick={fetchGoogleAuth}>
              Sync Google Calendar
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderToolbar = () => (
    <>
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
          <label className="hide-mobile" style={{ fontSize: '0.8rem', color: 'var(--cal-color-text-muted)' }}>TZ:</label>
          <select
            className="cal-input"
            style={{ padding: '0.4rem', fontSize: '0.85rem' }}
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

      {/* Quick Filters */}
      <div className="cal-filter-bar">
        <button className={`cal-filter-pill ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
        <button className={`cal-filter-pill ${activeFilter === 'protocol' ? 'active' : ''}`} onClick={() => setActiveFilter('protocol')}>Protocols</button>
        <button className={`cal-filter-pill ${activeFilter === 'prescription' ? 'active' : ''}`} onClick={() => setActiveFilter('prescription')}>Prescriptions</button>
        <button className={`cal-filter-pill ${activeFilter === 'order' ? 'active' : ''}`} onClick={() => setActiveFilter('order')}>Orders</button>
      </div>
    </>
  );

  const initialView = 'dayGridMonth';
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: mobile ? 'listWeek,timeGridDay,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  };

  return (
    <div className="regenera-calendar-wrapper" role="region" aria-label="Event Calendar" style={{ width: '100%', background: 'var(--cal-bg-surface)' }}>
      {renderToolbar()}
      <div style={{ width: '100%' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={initialView}
          timeZone={viewTimezone}
          headerToolbar={headerToolbar}
          editable={!isPatient}
          selectable={!isPatient}
          dateClick={handleDateClick}
          selectMirror={true}
          dayMaxEvents={mobile ? 2 : true}
          events={filteredEvents}
          eventContent={renderEventContent}
          noEventsContent={renderEmptyState}
          aspectRatio={mobile ? 0.7 : 1.35}
          // Custom views config to rename listWeek to Agenda on mobile
          views={{
            listWeek: { buttonText: 'Agenda' }
          }}
        />
      </div>

      {/* Bottom Sheet Modal for Create/Edit */}
      {modalOpen && (
        <div className="cal-dialog-overlay" onClick={(e) => { if (e.target.className === 'cal-dialog-overlay') setModalOpen(false); }}>
          <div className="cal-dialog" onClick={e => e.stopPropagation()}>
            <div className="cal-dialog-header">
              <h3 className="cal-dialog-title">{modalMode === 'create' ? 'Create Event' : 'Edit Event'}</h3>
              {!isMobile() && (
                <button type="button" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setModalOpen(false)}>×</button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div className="cal-dialog-body" style={{ paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="cal-form-group" style={{ flex: '1 1 100%' }}>
                    <label className="cal-form-label">Event Type</label>
                    <select value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })} className="cal-input" disabled={isPatient}>
                      <option value="prescription">Prescription / Dose</option>
                      <option value="protocol">Protocol Day</option>
                      <option value="order">Order / Purchase</option>
                      <option value="shipping">Shipping</option>
                      <option value="default">Other</option>
                    </select>
                  </div>
                  <div className="cal-form-group" style={{ flex: '1 1 100%' }}>
                    <label className="cal-form-label">Patient (Optional)</label>
                    <select value={eventForm.patientId} onChange={(e) => setEventForm({ ...eventForm, patientId: e.target.value })} className="cal-input" disabled={isPatient}>
                      <option value="">- Unassigned -</option>
                      <option value="p1">John Doe (BPC-157 Protocol)</option>
                      <option value="p2">Jane Smith (GHK-Cu Therapy)</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="cal-form-group" style={{ flex: '1 1 45%' }}>
                    <label className="cal-form-label">Start</label>
                    <input type="datetime-local" required value={eventForm.start} onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })} className="cal-input" disabled={isPatient} />
                  </div>
                  <div className="cal-form-group" style={{ flex: '1 1 45%' }}>
                    <label className="cal-form-label">End (Optional)</label>
                    <input type="datetime-local" value={eventForm.end} onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })} className="cal-input" disabled={isPatient} />
                  </div>
                </div>

                {/* AI Mockup Button */}
                {!isPatient && (
                  <button type="button" className="btn btn-secondary" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '0.5rem', borderStyle: 'dashed' }}>
                    ✨ Find Best Time (AI)
                  </button>
                )}

                {/* Progressive Expansion Toggle */}
                <div style={{ textAlign: 'center', margin: '1rem 0 0.5rem' }}>
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--cal-color-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowAdvanced(!showAdvanced)}>
                    {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options ↓'}
                  </button>
                </div>
                
                {showAdvanced && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', animation: 'slideUp 0.2s ease-out' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <div className="cal-form-group" style={{ flex: '1 1 45%' }}>
                        <label className="cal-form-label">Dosage</label>
                        <input type="text" placeholder="e.g., 500mcg" value={eventForm.dosage} onChange={(e) => setEventForm({ ...eventForm, dosage: e.target.value })} className="cal-input" disabled={isPatient} />
                      </div>
                      <div className="cal-form-group" style={{ flex: '1 1 45%' }}>
                        <label className="cal-form-label">Injection Site</label>
                        <select value={eventForm.injectionSite} onChange={(e) => setEventForm({ ...eventForm, injectionSite: e.target.value })} className="cal-input" disabled={isPatient}>
                          <option value="">- Select site -</option>
                          <option value="abdomen">Abdomen</option>
                          <option value="thigh">Thigh</option>
                          <option value="shoulder">Shoulder</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: isPatient ? 'default' : 'pointer' }}>
                        <Checkbox checked={eventForm.prn} onChange={(e) => setEventForm({ ...eventForm, prn: e.target.checked })} disabled={isPatient} />
                        "As Needed" Dose (PRN)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: isPatient ? 'default' : 'pointer' }}>
                        <Checkbox checked={eventForm.refillReminder} onChange={(e) => setEventForm({ ...eventForm, refillReminder: e.target.checked })} disabled={isPatient} />
                        Refill Reminder
                      </label>
                    </div>

                    <div className="cal-form-group">
                      <label className="cal-form-label">Notes</label>
                      <textarea rows="2" placeholder="Side effects, instructions..." value={eventForm.symptoms} onChange={(e) => setEventForm({ ...eventForm, symptoms: e.target.value })} className="cal-input" disabled={isPatient} />
                    </div>
                  </div>
                )}
              </div>

              <div className="cal-dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                {!isPatient && modalMode === 'edit' && (
                  <button type="button" className="btn" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', marginRight: 'auto' }} onClick={handleDelete}>
                    Delete
                  </button>
                )}
                {!isPatient && (
                  <button type="submit" className="btn btn-primary">
                    {modalMode === 'create' ? 'Save Event' : 'Update'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="cal-dialog-overlay" onClick={() => setShareModalOpen(false)}>
          <div className="cal-dialog" onClick={e => e.stopPropagation()}>
            <div className="cal-dialog-header">
              <h3 className="cal-dialog-title">Share Calendar</h3>
            </div>
            <div className="cal-dialog-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--cal-color-text-muted)', marginBottom: '0.5rem' }}>
                Generate a secure link for the patient to only see events assigned to them.
              </p>
              <div className="cal-form-group">
                <label className="cal-form-label">Patient</label>
                <select className="cal-input" defaultValue="">
                  <option value="" disabled>Select a patient...</option>
                  <option value="p1">John Doe (BPC-157 Protocol)</option>
                </select>
              </div>
            </div>
            <div className="cal-dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShareModalOpen(false)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => { alert('Invitation sent'); setShareModalOpen(false); }}>Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
