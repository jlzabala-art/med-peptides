"use client";
import React from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminCatalogTabClient from '../AdminCatalogTabClient.jsx';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/catalog',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams('supplier=supplier-lotusland&productType=finished_product'),
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
    user: { uid: 'test-admin', role: 'admin' },
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

vi.mock('../../../context/CartProvider', () => ({
  useCart: () => ({
    updateCart: vi.fn(),
    cart: {},
  }),
}));
vi.mock('@/context/CartProvider', () => ({
  useCart: () => ({
    updateCart: vi.fn(),
    cart: {},
  }),
}));

vi.mock('../../../context/AppSettingsContext', () => ({
  useAppSettings: () => ({
    settings: {},
  }),
}));

vi.mock('../../../hooks/useToast', () => ({
  useToast: () => ({
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}));

describe('AdminCatalogTabClient with supplier and productType params', () => {
  test('renders without crashing with supplier-lotusland and finished_product', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const mockProducts = [
      {
        id: 'dsip',
        name: 'DSIP',
        canonicalName: 'DSIP (Delta Sleep-Inducing Peptide)',
        category: 'peptide',
        productType: 'finished_product',
        primaryType: 'finished_product',
        type: 'finished_product',
        status: 'published',
        suppliers: [
          { id: 'supplier-lotusland', name: 'Lotusland Limited', price: 70 },
        ],
        variants: [
          {
            id: 'lotusland-dsip-10-mg',
            dosage: '10 mg',
            format: 'vial',
            supplierId: 'supplier-lotusland',
            price: 70,
            pricing: { retail: { perUnit: 133 } },
          },
        ],
      },
    ];

    const summaryData = JSON.parse(require('fs').readFileSync('scratch/summary_lotusland.json', 'utf8'));
    const facetsData = JSON.parse(require('fs').readFileSync('scratch/facets.json', 'utf8'));

    global.fetch = vi.fn().mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/catalog/facets')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(facetsData),
        });
      }
      if (urlStr.includes('/api/catalog/summary')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(summaryData),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    const { act } = await import('react');
    const { waitFor } = await import('@testing-library/react');

    let rendered;
    await act(async () => {
      rendered = render(
        <QueryClientProvider client={queryClient}>
          <AdminCatalogTabClient
            initialProducts={summaryData.items}
            globalMetrics={summaryData.kpis}
            readOnly={false}
          />
        </QueryClientProvider>
      );
    });

    await waitFor(() => {
      expect(rendered.container).toBeTruthy();
    });
  });
});
