import React from 'react';
import RegeneraCalendar from './RegeneraCalendar';
import './CalendarCloud.css';

export default function CalendarPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
          Mi Calendario
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Gestiona tus prescripciones, seguimientos y protocolos de tratamiento.
        </p>
      </header>
      
      <div className="gc-surface gc-calendar-wrapper">
        <RegeneraCalendar />
      </div>
    </div>
  );
}
