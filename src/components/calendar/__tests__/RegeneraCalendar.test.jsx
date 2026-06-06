import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RegeneraCalendar from '../RegeneraCalendar';

// Mock dependencies
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'test-user-id', role: 'doctor' } })
}));

describe('RegeneraCalendar', () => {
  it('renders without crashing', () => {
    // Simple render test
    render(<RegeneraCalendar userRole="doctor" />);
    // Look for basic calendar elements
    const calendarContainer = document.querySelector('.fc');
    expect(calendarContainer).toBeInTheDocument();
  });
});
