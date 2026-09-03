import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegeneraCalendar from '../RegeneraCalendar';

// Mock dependencies
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'test-user-id', role: 'doctor' } }),
}));

vi.mock('../../../hooks/useCalendarEvents', () => ({
  useCalendarEvents: () => ({
    events: [],
    loading: false,
    error: null,
    addEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
  }),
}));

vi.mock('../../../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user-id' } },
}));

describe('RegeneraCalendar', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it('renders without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <RegeneraCalendar userRole="doctor" />
      </QueryClientProvider>
    );
    const calendarContainer = document.querySelector('.fc');
    expect(calendarContainer).toBeInTheDocument();
  });
});
