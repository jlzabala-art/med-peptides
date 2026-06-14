import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Checkbox, TextField, Select, Button } from '../../components/ui';
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
import CalendarContextDrawer from './CalendarContextDrawer';

// Detect mobile viewport
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

// Event Colors mapping
const getEventColor = (type) => {
  switch (type) {
    case 'protocol':
      return '#1FA98F'; // Regenera Green
    case 'prescription':
      return '#3FB8C7'; // Cyan
    case 'order':
      return '#B98E4C'; // Gold
    case 'shipping':
      return '#8a9994'; // Grey
    default:
      return '#2563eb'; // Default blue
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
    const dtEnd = e.end
      ? new Date(e.end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : dtStart;
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
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mobile, loading, activeFilter]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);
  // Sync component state with global store mobile
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [viewTimezone, setViewTimezone] = useState(browserTimezone);

  const defaultEventForm = {
    title: '',
    start: '',
    end: '',
    type: 'prescription',
    patientId: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    description: '',
    dosage: '',
    injectionSite: '',
    prn: false,
    refillReminder: false,
    symptoms: '',
  };
  const [eventForm, setEventForm] = useState(defaultEventForm);
  const [timezoneList] = useState(() => {
    if (Intl.supportedValuesOf) {
      return Intl.supportedValuesOf('timeZone');
    }
    return ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
  });
  const [googleAuthUrl, setGoogleAuthUrl] = useState('');

  // Apply filters
  const filteredEvents = events
    .filter((e) => {
      if (activeFilter === 'all') return true;
      return e.extendedProps?.type === activeFilter;
    })
    .map((e) => ({
      ...e,
      backgroundColor: getEventColor(e.extendedProps?.type),
      borderColor: getEventColor(e.extendedProps?.type),
    }));

  useEffect(() => {
    const handleOpenModal = () => {
      setSelectedEvent(null);
      setEventForm(defaultEventForm);
      setModalMode('create');
      setModalOpen(true);
    };

    window.addEventListener('open-calendar-modal', handleOpenModal);
    return () => window.removeEventListener('open-calendar-modal', handleOpenModal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    setModalOpen(true);
  };

  const [currentDateTitle, setCurrentDateTitle] = useState('');

  // Update title when view changes
  const handleDatesSet = (dateInfo) => {
    setCurrentDateTitle(dateInfo.view.title);
  };

  const handleDateClick = (info) => {
    if (isPatient) return;
    setModalMode('create');
    setEventForm({
      ...defaultEventForm,
      start: info.dateStr + (info.dateStr.includes('T') ? '' : 'T08:00'),
    });

    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    if (!isMobile() && !isPatient) {
      // Desktop: Open the Context Drawer
      setContextDrawerOpen(true);
      return;
    }

    // Mobile or Patient fallback: Open standard edit modal
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

    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const patientName = eventForm.patientId ? eventForm.patientId : 'Unassigned';
    let typeName = 'Event';
    switch (eventForm.type) {
      case 'prescription':
        typeName = 'Prescription / Dose';
        break;
      case 'protocol':
        typeName = 'Protocol Day';
        break;
      case 'order':
        typeName = 'Order / Purchase';
        break;
      case 'shipping':
        typeName = 'Shipping';
        break;
      default:
        typeName = 'Other';
        break;
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

  const getEventIcon = (type) => {
    switch (type) {
      case 'prescription':
        return '💊';
      case 'protocol':
        return '📋';
      case 'order':
        return '📦';
      case 'test':
        return '🧬';
      case 'followup':
        return '📞';
      case 'consultation':
        return '🏥';
      default:
        return '📅';
    }
  };

  const renderEventContent = (eventInfo) => {
    const { event, view } = eventInfo;
    const type = event.extendedProps?.type || 'default';
    const isList = view.type.includes('list');

    if (isList) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{getEventIcon(type)}</span>
            <span style={{ fontWeight: 600 }}>{event.title}</span>
          </div>
          {event.extendedProps?.description && (
            <span style={{ fontSize: '0.8rem', color: 'var(--cal-color-text-muted)' }}>
              {event.extendedProps.description}
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        className="custom-event-card"
        style={{ borderLeftColor: event.backgroundColor || 'var(--cal-color-primary)' }}
        onClick={(e) => {
          e.stopPropagation();
          openEditModal(event);
        }}
      >
        <div className="event-card-header">
          <span className="event-type-icon">{getEventIcon(type)}</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.title}
          </span>
        </div>
        <div className="event-card-time">{eventInfo.timeText || 'All Day'}</div>
      </div>
    );
  };

  const renderDayCellContent = (arg) => {
    const dayEvents = events.filter((e) => {
      const eDate = new Date(e.start).toISOString().split('T')[0];
      const cellDate = arg.date.toISOString().split('T')[0];
      return eDate === cellDate;
    });

    // Group events by type
    const categoryCounts = {};
    dayEvents.forEach((e) => {
      const type = e.extendedProps?.type || 'default';
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    });

    return (
      <div
        className="day-cell-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          padding: '4px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{arg.dayNumberText}</span>
          {dayEvents.length > 0 && (
            <span
              style={{
                fontSize: '0.7rem',
                background: 'var(--cal-color-primary)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px',
              }}
            >
              {dayEvents.length}
            </span>
          )}
        </div>

        {dayEvents.length > 0 && (
          <div
            className="day-cell-indicators"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              marginTop: '4px',
              flex: 1,
              overflowY: 'auto',
            }}
          >
            {Object.entries(categoryCounts).map(([type, count]) => (
              <div
                key={type}
                style={{
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--cal-color-text-secondary)',
                }}
              >
                <span>{getEventIcon(type)}</span>
                <span style={{ fontWeight: 500 }}>{count}</span>
              </div>
            ))}
          </div>
        )}

        {!isMobile() && !isPatient && (
          <div className="day-cell-hover-actions">
            <button
              className="hover-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDateClick({ dateStr: arg.date.toISOString() });
              }}
            >
              + Quick Event
            </button>
            <button
              className="hover-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                calendarRef.current.getApi().changeView('timeGridDay', arg.date);
              }}
            >
              View Day
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          textAlign: 'center',
          height: '100%',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>📅</div>
        <h3 className="atlas-h2" style={{ marginBottom: '0.5rem' }}>
          No events scheduled for {currentDateTitle || 'this period'}
        </h3>
        <p
          className="atlas-helper-text"
          style={{ maxWidth: '300px', marginBottom: '1.5rem', fontSize: '0.9rem' }}
        >
          Your clinical schedule is currently clear. Ready to plan your next patient protocol or
          consultation?
        </p>
        {!isPatient && (
          <button
            className="cal-btn-primary"
            onClick={openCreateModal}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.95rem' }}
          >
            + Schedule Event
          </button>
        )}
      </div>
    );
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const renderToolbar = () => (
    <div className="cal-custom-header">
      {/* Row 3: Primary Actions */}
      <div className="cal-header-row">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div className="cal-dropdown-container">
            {!isPatient && (
              <button className="cal-btn-outline" onClick={() => setDropdownOpen(!dropdownOpen)}>
                Import / Export ▾
              </button>
            )}
            {dropdownOpen && !isPatient && (
              <div className="cal-dropdown-menu">
                <button
                  className="cal-dropdown-item"
                  onClick={() => {
                    exportCSV();
                    setDropdownOpen(false);
                  }}
                >
                  CSV Export
                </button>
                <button className="cal-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  CSV Import
                </button>
                <button
                  className="cal-dropdown-item"
                  onClick={() => {
                    exportICal();
                    setDropdownOpen(false);
                  }}
                >
                  iCal Export
                </button>
                <button
                  className="cal-dropdown-item"
                  onClick={() => {
                    fetchGoogleAuth();
                    setDropdownOpen(false);
                  }}
                >
                  Google Sync
                </button>
                <button
                  className="cal-dropdown-item"
                  onClick={() => {
                    setShareModalOpen(true);
                    setDropdownOpen(false);
                  }}
                >
                  Share Calendar
                </button>
              </div>
            )}
          </div>

          {googleAuthUrl && !isPatient && (
            <a
              href={googleAuthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cal-btn-outline"
              style={{ textDecoration: 'none' }}
            >
              Authorize Google
            </a>
          )}

          <select
            style={{
              border: '1px solid var(--cal-border)',
              background: 'var(--cal-bg-surface)',
              outline: 'none',
              fontSize: '0.85rem',
              color: 'var(--cal-color-text-primary)',
              cursor: 'pointer',
              borderRadius: 'var(--cal-radius-sm)',
              padding: '6px 12px',
            }}
            value={viewTimezone}
            onChange={(e) => setViewTimezone(e.target.value)}
          >
            <option value={browserTimezone}>🌍 {browserTimezone}</option>
            {timezoneList
              .filter((tz) => tz !== browserTimezone)
              .map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
          </select>
        </div>
        <button
          className={`cal-filter-pill pill-test ${activeFilter === 'test' ? 'active' : ''}`}
          onClick={() => setActiveFilter('test')}
        >
          Tests
        </button>
      </div>
    </div>
  );

  const initialView = mobile ? 'listWeek' : 'dayGridMonth';
  const headerToolbar = false;

  return (
    <div
      className="regenera-calendar-wrapper"
      role="region"
      aria-label="Event Calendar"
      style={{ width: '100%', background: 'var(--cal-bg-surface)' }}
    >
      {renderToolbar()}
      <div style={{ width: '100%', position: 'relative' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={initialView}
          timeZone={viewTimezone}
          headerToolbar={headerToolbar}
          datesSet={handleDatesSet}
          editable={!isPatient}
          selectable={!isPatient}
          dateClick={handleDateClick}
          selectMirror={true}
          dayMaxEvents={mobile ? 2 : true}
          events={filteredEvents}
          eventContent={renderEventContent}
          dayCellContent={renderDayCellContent}
          noEventsContent={renderEmptyState}
          aspectRatio={mobile ? 0.7 : 1.35}
          views={{
            listWeek: { buttonText: 'Agenda' },
          }}
        />
      </div>

      {/* Bottom Sheet / Modal for Create/Edit */}
      {modalOpen && (
        <div
          className={mobile ? 'cal-bottom-sheet-overlay' : 'cal-dialog-overlay'}
          onClick={(e) => {
            if (
              e.target.className === 'cal-bottom-sheet-overlay' ||
              e.target.className === 'cal-dialog-overlay'
            )
              setModalOpen(false);
          }}
        >
          <div
            className={mobile ? 'cal-bottom-sheet' : 'cal-dialog'}
            onClick={(e) => e.stopPropagation()}
          >
            {mobile && <div className="sheet-handle"></div>}

            <div className="cal-dialog-header" style={{ marginBottom: mobile ? '1rem' : '1.5rem' }}>
              <h3 className="cal-dialog-title">
                {modalMode === 'create' ? 'Schedule Event' : 'Edit Event'}
              </h3>
              {!mobile && (
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: 'var(--cal-color-text-muted)',
                  }}
                  onClick={() => setModalOpen(false)}
                >
                  ×
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}
            >
              <div className="cal-dialog-body" style={{ paddingBottom: '1rem', flex: 1 }}>
                
                {/* SECTION 1: Patient & Type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <Select
                    label="Patient"
                    id="patientId"
                    value={eventForm.patientId}
                    onChange={(e) => setEventForm({ ...eventForm, patientId: e.target.value })}
                    disabled={isPatient}
                    options={[
                      { value: '', label: '- Search patient -' },
                      { value: 'p1', label: 'John Doe' },
                      { value: 'p2', label: 'Jane Smith' }
                    ]}
                  />

                  <Select
                    label="Event Type"
                    id="eventType"
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                    disabled={isPatient}
                    options={[
                      { value: 'prescription', label: '💊 Prescription' },
                      { value: 'protocol', label: '📋 Protocol' },
                      { value: 'order', label: '📦 Order' },
                      { value: 'test', label: '🧬 Test' },
                      { value: 'followup', label: '📞 Follow-up' },
                      { value: 'consultation', label: '🏥 Consultation' }
                    ]}
                  />

                  <TextField
                    label="Date & Time"
                    type="datetime-local"
                    id="eventStart"
                    required
                    value={eventForm.start}
                    onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })}
                    disabled={isPatient}
                  />
                </div>

                {/* Premium AI Smart Scheduling Card */}
                {!isPatient && (
                  <div
                    className="atlas-card"
                    style={{
                      marginBottom: '1.5rem',
                      background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                      border: '1px solid #bfdbfe',
                      padding: '16px',
                      borderRadius: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.2rem' }}>✨</span>
                      <span style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                        Smart Scheduling
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#3b82f6', margin: 0, lineHeight: 1.4 }}>
                      Optimum slot suggested based on patient history, provider availability, and active protocols.
                    </p>
                  </div>
                )}

                {/* SECTION 2: Specific Details */}
                {eventForm.type && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {eventForm.type.charAt(0).toUpperCase() + eventForm.type.slice(1)} Details
                    </h4>
                    
                    {eventForm.type === 'prescription' && (
                      <>
                        <TextField
                          label="Medication / Compound"
                          placeholder="e.g., BPC-157"
                          id="medicationCompound"
                          disabled={isPatient}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <TextField
                              label="Dosage"
                              placeholder="e.g., 500mcg"
                              id="eventDosage"
                              value={eventForm.dosage}
                              onChange={(e) => setEventForm({ ...eventForm, dosage: e.target.value })}
                              disabled={isPatient}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Select
                              label="Site"
                              id="injectionSite"
                              value={eventForm.injectionSite}
                              onChange={(e) => setEventForm({ ...eventForm, injectionSite: e.target.value })}
                              disabled={isPatient}
                              options={[
                                { value: '', label: '- Select -' },
                                { value: 'abdomen', label: 'Abdomen' },
                                { value: 'thigh', label: 'Thigh' }
                              ]}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {eventForm.type === 'consultation' && (
                      <TextField
                        label="Location / Link"
                        placeholder="Zoom link or Clinic Room"
                        id="consultationLocation"
                        disabled={isPatient}
                      />
                    )}

                    {eventForm.type !== 'prescription' && eventForm.type !== 'consultation' && (
                      <TextField
                        label={`${eventForm.type} details`}
                        placeholder={`Enter ${eventForm.type} details...`}
                        disabled={isPatient}
                      />
                    )}
                  </div>
                )}

                {/* SECTION 3: Additional Notes & Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', padding: '0 0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
                      <Checkbox
                        checked={eventForm.prn}
                        onChange={(e) => setEventForm({ ...eventForm, prn: e.target.checked })}
                        disabled={isPatient}
                      />
                      PRN (As needed)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
                      <Checkbox
                        checked={eventForm.refillReminder}
                        onChange={(e) => setEventForm({ ...eventForm, refillReminder: e.target.checked })}
                        disabled={isPatient}
                      />
                      Refill Reminder
                    </label>
                  </div>

                  <div className="cal-form-group">
                    <label className="cal-form-label">Internal Notes</label>
                    <textarea
                      rows="3"
                      placeholder="Context, symptoms, or special instructions..."
                      value={eventForm.symptoms}
                      onChange={(e) => setEventForm({ ...eventForm, symptoms: e.target.value })}
                      className="cal-input"
                      disabled={isPatient}
                      style={{ resize: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div className="cal-dialog-footer" style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--cal-border)', marginTop: 'auto', background: 'var(--cal-bg-surface)', display: 'flex', justifyContent: 'space-between' }}>
                {!isPatient && modalMode === 'edit' ? (
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                  >
                    Delete Event
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                )}

                {!isPatient && (
                  <Button variant="primary" type="submit">
                    {modalMode === 'create' ? 'Save Event' : 'Update'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="cal-dialog-overlay" onClick={() => setShareModalOpen(false)}>
          <div className="cal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="cal-dialog-header">
              <h3 className="cal-dialog-title">Share Calendar</h3>
            </div>
            <div className="cal-dialog-body">
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--cal-color-text-muted)',
                  marginBottom: '0.5rem',
                }}
              >
                Generate a secure link for the patient to only see events assigned to them.
              </p>
              <div className="cal-form-group">
                <label className="cal-form-label">Patient</label>
                <select className="cal-input" defaultValue="">
                  <option value="" disabled>
                    Select a patient...
                  </option>
                  <option value="p1">John Doe (BPC-157 Protocol)</option>
                </select>
              </div>
            </div>
            <div className="cal-dialog-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShareModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  alert('Invitation sent');
                  setShareModalOpen(false);
                }}
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Context Drawer (Desktop Only) */}
      <CalendarContextDrawer
        event={selectedEvent}
        isOpen={contextDrawerOpen}
        onClose={() => setContextDrawerOpen(false)}
      />
    </div>
  );
}
