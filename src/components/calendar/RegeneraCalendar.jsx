import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase'; // assume exported firebase functions instance
import ProtocolDayBadge from './ProtocolDayBadge';
import { motion, AnimatePresence } from 'framer-motion';
import AnalyticsPanel from './AnalyticsPanel';
 // custom CSS for glassmorphism etc.

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
  // Calendar data hook
  const { events, loading, createEvent, updateEvent, deleteEvent } = useCalendarEvents();

  // UI state
  const [selectedEvent, setSelectedEvent] = useState(null); // for popover edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [eventForm, setEventForm] = useState({ title: '', start: '', end: '', type: 'prescription', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, description: '' });
  const [timezoneList, setTimezoneList] = useState([]);
  const [googleAuthUrl, setGoogleAuthUrl] = useState('');

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
    setModalMode('create');
    setEventForm({ title: '', start: '', end: '', type: 'prescription', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, description: '' });
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
    });
    setSelectedEvent(event);
    setModalOpen(true);
  };

  // Submit handler for modal form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: eventForm.title,
      start: eventForm.start,
      end: eventForm.end,
      type: eventForm.type,
      timezone: eventForm.timezone,
      description: eventForm.description,
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
        style={{ backgroundColor: bg, color: '#fff', padding: '2px 4px', borderRadius: '4px', cursor: 'pointer' }}
        onClick={() => openEditModal(event)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter') openEditModal(event); }}
        aria-label={`${event.title}, ${event.extendedProps?.type} event`}
      >
        {isProtocol && <ProtocolDayBadge tooltip="Protocol dosing day" />}
        <span style={{ marginLeft: isProtocol ? '8px' : '0' }}>{event.title}</span>
      </div>
    );
  };

  // Toolbar with extra buttons
  const renderToolbar = () => (
    <div className="calendar-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <button className="btn-magnetic" onClick={openCreateModal}>Nuevo evento</button>
      <button className="btn-magnetic" onClick={exportCSV}>Exportar CSV</button>
      <button className="btn-magnetic" onClick={exportICal}>Exportar iCal</button>
      <button className="btn-magnetic" onClick={fetchGoogleAuth}>Conectar Google Calendar</button>
      {googleAuthUrl && (
        <a href={googleAuthUrl} target="_blank" rel="noopener noreferrer" className="btn-magnetic">
          Autorizar Google
        </a>
      )}
    </div>
  );

  return (
    <div className="regenera-calendar-wrapper" role="region" aria-label="Calendario de eventos">
      {renderToolbar()}
      <AnalyticsPanel events={events} />
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        events={events}
        eventContent={renderEventContent}
        height="700px"
      />

      {/* Modal for create / edit */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="calendar-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          >
            <motion.div
              className="calendar-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '90%', maxWidth: '500px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
            >
              <h3>{modalMode === 'create' ? 'Crear nuevo evento' : 'Editar evento'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>Título</label>
                  <input type="text" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="input" />
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>Tipo</label>
                  <select value={eventForm.type} onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })} className="input">
                    <option value="prescription">Prescription</option>
                    <option value="shipping">Shipping</option>
                    <option value="marketing">Marketing</option>
                    <option value="order">Order</option>
                    <option value="protocol">Protocol</option>
                    <option value="default">Default</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>Inicio</label>
                  <input type="datetime-local" required value={eventForm.start} onChange={(e) => setEventForm({ ...eventForm, start: e.target.value })} className="input" />
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>Fin (opcional)</label>
                  <input type="datetime-local" value={eventForm.end} onChange={(e) => setEventForm({ ...eventForm, end: e.target.value })} className="input" />
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>Zona horaria</label>
                  <select value={eventForm.timezone} onChange={(e) => setEventForm({ ...eventForm, timezone: e.target.value })} className="input">
                    {timezoneList.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label>Descripción</label>
                  <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="input" rows={3} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  {modalMode === 'edit' && (
                    <button type="button" className="btn-magnetic" onClick={handleDelete} style={{ background: '#e53e3e', color: '#fff' }}>
                      Eliminar
                    </button>
                  )}
                  <button type="button" className="btn-magnetic" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-magnetic" style={{ background: '#3182ce', color: '#fff' }}>
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
