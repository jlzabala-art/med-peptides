"use client";
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminProtocolsTab from '../AdminProtocolsTab.jsx';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/protocols',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/useRoleAccess', () => ({
  useRoleAccess: () => ({
    role: 'admin',
    is: (r) => r === 'admin',
    can: () => true,
  }),
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-admin' },
    userProfile: { role: 'admin' },
  }),
}));

vi.mock('../../../context/DrawerContext', () => ({
  useDrawer: () => ({
    openDrawer: vi.fn(),
    closeDrawer: vi.fn(),
    isDrawerOpen: false,
    drawerState: {},
  }),
}));





vi.mock('../../../actions/protocolsActions', () => ({
  fetchProtocolsAction: vi.fn(() => Promise.resolve([
    {
      id: 'p1',
      name: 'Test Protocol',
      therapeutic_category: 'Category A',
      status: 'active',
      complexity_level: 'moderate',
      createdAt: '2026-05-26T13:00:00Z',
    },
  ])),
  fetchProtocolsMetricsAction: vi.fn(() => Promise.resolve({
    totalProtocols: 1,
    activeCount: 1,
    draftCount: 0,
    archivedCount: 0,
  })),
}));

// Mock db & auth reference
vi.mock('../../../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-admin' } },
}));

describe('AdminProtocolsTab', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  test('renders protocols page and header correctly', async () => {
    const Component = await AdminProtocolsTab({ isSubTab: false });
    render(
      <QueryClientProvider client={queryClient}>
        {Component}
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Protocols & Pathways/i)).toBeInTheDocument();
    });
  });
});

