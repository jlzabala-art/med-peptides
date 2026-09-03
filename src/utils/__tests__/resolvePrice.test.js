import { describe, it, expect } from 'vitest';
import { resolveVariantPrice } from '../resolvePrice.js';
import { PRICING_TIER } from '../../constants/productEnums.js';

describe('resolveVariantPrice — Commercial Engine Core Tests', () => {
  const sampleVariant = {
    id: 'test-variant-01',
    pricing: {
      master: { perUnit: 30, kit: 150, currency: 'USD' },
      wholesale: { perUnit: 40.5, kit: 202.5, currency: 'USD' },
      clinic: { perUnit: 45, kit: 225, currency: 'USD' },
      retail: { perUnit: 60, kit: 300, currency: 'USD' },
    }
  };

  it('correctly resolves Master (Cost 0% margin) price tier', () => {
    const res = resolveVariantPrice(sampleVariant, { tier: PRICING_TIER.MASTER });
    expect(res).toBeDefined();
    expect(res.perUnit).toBe(30);
    expect(res.kit).toBe(150);
    expect(res.currency).toBe('USD');
  });

  it('correctly resolves Wholesale tier pricing', () => {
    const res = resolveVariantPrice(sampleVariant, { tier: PRICING_TIER.WHOLESALE });
    expect(res).toBeDefined();
    expect(res.perUnit).toBe(40.5);
    expect(res.kit).toBe(202.5);
  });

  it('correctly falls back up the commercial chain (clinic -> wholesale -> retail)', () => {
    const variantMissingClinic = {
      id: 'test-no-clinic',
      pricing: {
        retail: { perUnit: 50, kit: 250, currency: 'USD' }
      }
    };
    const res = resolveVariantPrice(variantMissingClinic, { tier: PRICING_TIER.CLINIC });
    expect(res).toBeDefined();
    expect(res.perUnit).toBe(50);
    expect(res.kit).toBe(250);
    expect(res.isFallback).toBe(true);
  });

  it('handles targetCurrency conversion if exchange rates provided', () => {
    const res = resolveVariantPrice(sampleVariant, {
      tier: PRICING_TIER.MASTER,
      targetCurrency: 'EUR',
      exchangeRates: { EUR: 0.92, USD: 1.0 }
    });
    expect(res).toBeDefined();
    expect(res.currency).toBe('EUR');
    expect(res.perUnit).toBeCloseTo(27.6, 1);
  });
});
