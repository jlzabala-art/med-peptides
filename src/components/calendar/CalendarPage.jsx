import React from 'react';
import RegeneraCalendar from './RegeneraCalendar';
import { Card } from '../ui';
import './CalendarCloud.css'; // Keep for FullCalendar overrides but we will style the wrapper

export default function CalendarPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>My Calendar</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
            Manage your prescriptions, follow-ups, and treatment protocols.
          </p>
        </div>
      </div>
      <Card style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <RegeneraCalendar />
      </Card>
    </div>
  );
}
