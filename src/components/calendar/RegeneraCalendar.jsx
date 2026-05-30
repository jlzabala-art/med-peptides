import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for drag‑and‑drop
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

// Utility to map event types to colors
const EVENT_COLORS = {
  prescription: '#1e40af', // indigo
  shipping: '#16a34a', // green
  marketing: '#d946ef', // pink
  order: '#f59e0b', // amber
  protocol: '#ef4444', // red
};

export default function RegeneraCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'calendar_events'), where('ownerIds', 'array-contains', user.uid));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title,
          start: d.start?.toDate?.() ?? d.start,
          end: d.end?.toDate?.() ?? d.end,
          backgroundColor: EVENT_COLORS[d.type] || '#64748b',
          extendedProps: d,
        };
      });
      setEvents(data);
    });
    return () => unsub();
  }, [user]);

  const handleEventDrop = async info => {
    // Update Firestore with new start/end dates
    const { event } = info;
    const docRef = db.collection('calendar_events').doc(event.id);
    await docRef.update({
      start: new Date(event.start),
      end: new Date(event.end),
    });
  };

  return (
    <div className="calendar-wrapper" style={{ background: 'var(--color-calendar-bg)', borderRadius: 'var(--radius-calendar)', padding: '1rem', boxShadow: 'var(--shadow-calendar)' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' }}
        events={events}
        editable={true}
        droppable={true}
        eventDrop={handleEventDrop}
        height="auto"
        nowIndicator={true}
      />
    </div>
  );
}
