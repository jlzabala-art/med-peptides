import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import AdminProtocolsTab from '../AdminProtocolsTab.jsx';
import { getPaginatedProtocols, updateProtocolFull } from '../../../services/protocolStorage';

// Mock firebase/firestore functions used in the component
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
}));

// Mock services that fetch protocols and products
vi.mock('../../../services/protocolStorage', () => ({
  getPaginatedProtocols: vi.fn(),
  updateProtocolFull: vi.fn(),
}));

// Mock db reference
vi.mock('../../../firebase', () => ({ db: {} }));

describe('AdminProtocolsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPaginatedProtocols).mockResolvedValue({
      protocols: [],
      lastDoc: null,
      hasMore: false,
    });
  });

  test('renders loading state and then shows empty list message', async () => {
    render(<AdminProtocolsTab />);
    // Loading indicator should appear first
    expect(screen.getByText(/Loading all protocols…/i)).toBeInTheDocument();
    // Wait for the async fetch to finish
    await waitFor(() =>
      expect(screen.queryByText(/Loading all protocols…/i)).not.toBeInTheDocument()
    );
    // With no protocols we should see the placeholder message
    expect(screen.getByText(/No protocols saved yet./i)).toBeInTheDocument();
  });

  test('displays an error message when getPaginatedProtocols rejects', async () => {
    vi.mocked(getPaginatedProtocols).mockRejectedValue(new Error('network failure'));
    render(<AdminProtocolsTab />);
    await waitFor(() => expect(screen.getByText(/Failed to load protocols:/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  test('allows expanding a protocol row after data is loaded', async () => {
    const mockProtocol = {
      id: 'p1',
      protocol_name: 'Test Protocol',
      therapeutic_category: 'Category A',
      status: 'draft',
      complexity_level: 'moderate',
      created_at: { toDate: () => new Date() },
      created_by: { user_name: 'admin' },
      version_number: 1,
      phases: [],
    };
    vi.mocked(getPaginatedProtocols).mockResolvedValue({
      protocols: [mockProtocol],
      lastDoc: null,
      hasMore: false,
    });
    render(<AdminProtocolsTab />);
    await waitFor(() => expect(screen.getByText('Test Protocol')).toBeInTheDocument());

    const toggleBtn = screen.getByRole('button', { name: /Expand protocol details/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Add Phase/i)).toBeInTheDocument();
  });
});
