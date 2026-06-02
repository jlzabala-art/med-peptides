import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, vi, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminSkuMappingTab from '../SkuMappingTab/AdminSkuMappingTab.jsx';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-admin', getIdToken: () => Promise.resolve('mock-token') },
    userProfile: { role: 'admin', email: 'admin@regenpept.test' },
  }),
}));

describe('AdminSkuMappingTab', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
      const body = options?.body ? JSON.parse(options.body) : {};
      
      if (body.mode === 'status') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              records: [
                {
                  id: 'mapping_1',
                  firebase_product_id: 'prod_123',
                  firebase_sku: 'SKU-FB-1',
                  firebase_name: 'Test Product 1',
                  zoho_item_id: 'zoho_123',
                  zoho_sku: 'SKU-ZH-1',
                  zoho_name: 'Zoho Product 1',
                  status: 'pending',
                  match_confidence: 75,
                  match_reasoning: 'Close name match',
                },
              ],
              statusCounts: {
                pending: 1,
                confirmed: 0,
                rejected: 0,
                synced: 0,
                error: 0,
              },
              total: 1,
            }),
        });
      }
      
      if (body.mode === 'get_family_details') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              extras: {
                firebaseVariants: [
                  {
                    firebase_product_id: 'prod_123',
                    firebase_variant_id: 'v1',
                    name: 'Test Product 1 (5mg)',
                    sku: 'SKU-FB-1',
                    guest_usd: 50.0,
                    label: '5mg',
                  },
                ],
                zohoItems: [
                  {
                    item_id: 'zoho_123',
                    name: 'Zoho Product 1',
                    sku: 'SKU-ZH-1',
                    rate: 185.0,
                    status: 'active',
                  },
                ],
              },
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders SkuMappingTab and loads mappings', async () => {
    render(
      <MemoryRouter>
        <AdminSkuMappingTab />
      </MemoryRouter>
    );

    // Check header
    expect(screen.getByText(/SKU Synchronization/)).toBeInTheDocument();
    
    // Check loading indicator or items
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Zoho Product 1')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('opens ResolveFamilyModal on clicking Align Family', async () => {
    render(
      <MemoryRouter>
        <AdminSkuMappingTab />
      </MemoryRouter>
    );

    // Wait for mapping item to load
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    // Click "Align Family"
    const alignBtn = screen.getByText('Align Family');
    fireEvent.click(alignBtn);

    // Wait for modal to render and fetch data
    await waitFor(() => {
      expect(screen.getByText('Align Product Family')).toBeInTheDocument();
    });

    // Check Firebase variant name and Zoho item name are shown in modal
    expect(screen.getByText('Test Product 1 (5mg)')).toBeInTheDocument();
    expect(screen.getAllByText('Zoho Product 1').length).toBeGreaterThanOrEqual(2);
  });
});
