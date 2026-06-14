import { describe, test, vi, expect, beforeEach } from 'vitest';
import { getTenantSlugFromPath, resolveTenantBySlug, resolveTenantById } from '../resolveTenant';
import { resolveVariantPrice, setActiveTenantForResolution, getActiveTenantForResolution } from '../resolvePrice';
import { resolveProductPrice } from '../resolveProductPrice';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => {
  const collection = (db, name) => ({ _collectionName: name });
  const query = (col, ...args) => ({ _collectionName: col._collectionName, _args: args });
  const getDocs = (q) => {
    const colName = q?._collectionName;
    let data = [];
    if (colName === 'tenants') {
      data = [
        {
          id: 'tenant-1',
          slug: 'magenta',
          name: 'Magenta Wholesaler',
          branding: {
            primaryColor: '#ff00ff',
            secondaryColor: '#00ffff',
          },
          priceOverrides: {
            'peptide-a': 120.0, // scalar override
            'peptide-b': {
              perUnit: 90.0,
              kit: 800.0,
              currency: 'USD'
            }
          }
        }
      ];
    }
    return Promise.resolve({
      empty: data.length === 0,
      docs: data.map(item => ({
        id: item.id,
        data: () => {
          const { id: _id, ...rest } = item;
          return rest;
        }
      }))
    });
  };

  const getDoc = (docRef) => {
    if (docRef._id === 'tenant-1') {
      return Promise.resolve({
        exists: () => true,
        id: 'tenant-1',
        data: () => ({
          slug: 'magenta',
          name: 'Magenta Wholesaler',
          branding: {
            primaryColor: '#ff00ff',
            secondaryColor: '#00ffff',
          },
          priceOverrides: {
            'peptide-a': 120.0,
            'peptide-b': {
              perUnit: 90.0,
              kit: 800.0,
              currency: 'USD'
            }
          }
        })
      });
    }
    return Promise.resolve({ exists: () => false });
  };

  const doc = (db, name, id) => ({ _collectionName: name, _id: id });

  return {
    collection,
    query,
    getDocs,
    getDoc,
    doc,
    where: (field, op, val) => ({ field, op, val })
  };
});

vi.mock('../../firebase', () => ({ db: {} }));

describe('Tenant Resolution', () => {
  test('getTenantSlugFromPath extracts slug correctly', () => {
    expect(getTenantSlugFromPath('/partner/magenta')).toBe('magenta');
    expect(getTenantSlugFromPath('/partners/cyan/some-subpath')).toBe('cyan');
    expect(getTenantSlugFromPath('/other/path')).toBeNull();
  });

  test('resolveTenantBySlug resolves slug from firestore query', async () => {
    const tenant = await resolveTenantBySlug('magenta');
    expect(tenant).not.toBeNull();
    expect(tenant.slug).toBe('magenta');
    expect(tenant.name).toBe('Magenta Wholesaler');
  });

  test('resolveTenantById resolves ID from firestore document get', async () => {
    const tenant = await resolveTenantById('tenant-1');
    expect(tenant).not.toBeNull();
    expect(tenant.slug).toBe('magenta');
    expect(tenant.branding.primaryColor).toBe('#ff00ff');
  });
});

describe('Tenant-Aware Pricing Resolution', () => {
  const mockVariantA = {
    id: 'v-a',
    productSlug: 'peptide-a',
    name: 'Peptide A',
    pricing: {
      retail: { perUnit: 150.0, kit: 1400.0, currency: 'USD' }
    }
  };

  const mockVariantB = {
    id: 'v-b',
    productSlug: 'peptide-b',
    name: 'Peptide B',
    pricing: {
      retail: { perUnit: 110.0, kit: 1000.0, currency: 'USD' }
    }
  };

  const mockVariantC = {
    id: 'v-c',
    productSlug: 'peptide-c',
    name: 'Peptide C',
    pricing: {
      retail: { perUnit: 200.0, kit: 1800.0, currency: 'USD' }
    }
  };

  const mockProductA = {
    id: 'prod-a',
    slug: 'peptide-a',
    name: 'Peptide A',
    productType: 'peptide',
    variants: [mockVariantA]
  };

  const mockProductC = {
    id: 'prod-c',
    slug: 'peptide-c',
    name: 'Peptide C',
    productType: 'peptide',
    variants: [mockVariantC]
  };

  const mockTenant = {
    id: 'tenant-1',
    slug: 'magenta',
    priceOverrides: {
      'peptide-a': 120.0,
      'peptide-b': {
        perUnit: 90.0,
        kit: 800.0,
        currency: 'USD'
      }
    }
  };

  beforeEach(() => {
    setActiveTenantForResolution(null);
  });

  test('resolves standard pricing when no tenant is active', () => {
    const resolved = resolveVariantPrice(mockVariantA);
    expect(resolved.perUnit).toBe(150.0);
    expect(resolved.source).toBe('base');
  });

  test('resolves override pricing (scalar) when tenant is active', () => {
    const resolved = resolveVariantPrice(mockVariantA, { tenant: mockTenant });
    expect(resolved.perUnit).toBe(120.0);
    expect(resolved.source).toBe('customer');
  });

  test('resolves override pricing (object) when tenant is active', () => {
    const resolved = resolveVariantPrice(mockVariantB, { tenant: mockTenant });
    expect(resolved.perUnit).toBe(90.0);
    expect(resolved.kit).toBe(800.0);
    expect(resolved.source).toBe('customer');
  });

  test('hides pricing (returns nulls) when tenant is active but has no override', () => {
    const resolved = resolveVariantPrice(mockVariantC, { tenant: mockTenant });
    expect(resolved.perUnit).toBeNull();
    expect(resolved.kit).toBeNull();
  });

  test('respects global active tenant resolution setting', () => {
    setActiveTenantForResolution(mockTenant);
    expect(getActiveTenantForResolution()).toEqual(mockTenant);

    const priceInfo = resolveProductPrice(mockProductA);
    expect(priceInfo.amount).toBe(120.0);
    expect(priceInfo.formattedPrice).toBe('$120.00 / vial');

    const priceInfoHidden = resolveProductPrice(mockProductC);
    expect(priceInfoHidden.amount).toBeNull();
    expect(priceInfoHidden.formattedPrice).toBe('Pricing unavailable');
  });
});
