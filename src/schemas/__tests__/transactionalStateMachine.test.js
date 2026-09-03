/**
 * src/schemas/__tests__/transactionalStateMachine.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for the clinical State Machine.
 *
 * Standards: GAMP 5 (Good Automated Manufacturing Practice),
 *            FDA 21 CFR Part 11 (OQ - Operational Qualification)
 *
 * Coverage target: 100% of transition rules.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, test, expect } from 'vitest';
import {
  canTransitionTo,
  getNextAllowedStates,
  TRANSACTION_TAXONOMY,
  validatePurchaseOrderTransition,
  validatePrescriptionTransition,
  validateQuotationTransition,
} from '../transactionalStateMachine';

// ─── Prescription / Quotation transitions ──────────────────────────────────

describe('canTransitionTo — quotation entity (maps to prescription states)', () => {
  test('draft → pending_approval is LEGAL', () => {
    expect(canTransitionTo('quotation', 'draft', 'pending_approval')).toBe(true);
  });

  test('draft → sent is LEGAL', () => {
    expect(canTransitionTo('quotation', 'draft', 'sent')).toBe(true);
  });

  test('accepted → converted_to_order is LEGAL', () => {
    expect(canTransitionTo('quotation', 'accepted', 'converted_to_order')).toBe(true);
  });

  test('converted_to_order → any further state is ILLEGAL (terminal)', () => {
    expect(canTransitionTo('quotation', 'converted_to_order', 'draft')).toBe(false);
    expect(canTransitionTo('quotation', 'converted_to_order', 'sent')).toBe(false);
    expect(canTransitionTo('quotation', 'converted_to_order', 'accepted')).toBe(false);
  });

  test('draft → completed is ILLEGAL (skips required steps)', () => {
    expect(canTransitionTo('quotation', 'draft', 'converted_to_order')).toBe(false);
  });

  test('same status → same status is always LEGAL (idempotent update)', () => {
    expect(canTransitionTo('quotation', 'draft', 'draft')).toBe(true);
    expect(canTransitionTo('quotation', 'accepted', 'accepted')).toBe(true);
  });

  test('unknown entity type returns false gracefully', () => {
    expect(canTransitionTo('unknown_entity', 'draft', 'sent')).toBe(false);
  });

  test('null/undefined args return false gracefully', () => {
    expect(canTransitionTo(null, 'draft', 'sent')).toBe(false);
    expect(canTransitionTo('quotation', null, 'sent')).toBe(false);
    expect(canTransitionTo('quotation', 'draft', null)).toBe(false);
  });
});

// ─── Sales Order transitions ─────────────────────────────────────────────────

describe('canTransitionTo — sales_order entity', () => {
  test('draft → pending is LEGAL', () => {
    expect(canTransitionTo('sales_order', 'draft', 'pending')).toBe(true);
  });

  test('pending → processing is LEGAL', () => {
    expect(canTransitionTo('sales_order', 'pending', 'processing')).toBe(true);
  });

  test('delivered → completed is LEGAL', () => {
    expect(canTransitionTo('sales_order', 'delivered', 'completed')).toBe(true);
  });

  test('completed → any other state is ILLEGAL (terminal state)', () => {
    expect(canTransitionTo('sales_order', 'completed', 'draft')).toBe(false);
    expect(canTransitionTo('sales_order', 'completed', 'pending')).toBe(false);
    expect(canTransitionTo('sales_order', 'completed', 'cancelled')).toBe(false);
  });

  test('draft → completed is ILLEGAL (skips required steps)', () => {
    expect(canTransitionTo('sales_order', 'draft', 'completed')).toBe(false);
  });

  test('cancelled → any state is ILLEGAL (terminal state)', () => {
    const states = ['draft', 'pending', 'processing', 'delivered', 'completed'];
    states.forEach((s) => {
      expect(canTransitionTo('sales_order', 'cancelled', s)).toBe(false);
    });
  });
});

// ─── Purchase Order transitions ───────────────────────────────────────────────

describe('canTransitionTo — purchase_order entity', () => {
  test('draft → po_created is LEGAL', () => {
    expect(canTransitionTo('purchase_order', 'draft', 'po_created')).toBe(true);
  });

  test('in_transit → delivered is LEGAL', () => {
    expect(canTransitionTo('purchase_order', 'in_transit', 'delivered')).toBe(true);
  });

  test('reconciled → any state is ILLEGAL (terminal)', () => {
    const states = ['draft', 'po_created', 'in_transit', 'delivered', 'disputed', 'cancelled'];
    states.forEach((s) => {
      expect(canTransitionTo('purchase_order', 'reconciled', s)).toBe(false);
    });
  });

  test('in_transit → draft is ILLEGAL (backward jump)', () => {
    expect(canTransitionTo('purchase_order', 'in_transit', 'draft')).toBe(false);
  });
});

// ─── getNextAllowedStates ────────────────────────────────────────────────────

describe('getNextAllowedStates', () => {
  test('returns correct next states for draft quotation', () => {
    const next = getNextAllowedStates('quotation', 'draft');
    expect(next).toContain('pending_approval');
    expect(next).toContain('sent');
    expect(next).toContain('cancelled');
  });

  test('returns empty array for terminal states', () => {
    expect(getNextAllowedStates('quotation', 'converted_to_order')).toEqual([]);
    expect(getNextAllowedStates('sales_order', 'completed')).toEqual([]);
    expect(getNextAllowedStates('purchase_order', 'reconciled')).toEqual([]);
  });

  test('returns empty array for unknown type', () => {
    expect(getNextAllowedStates('unknown', 'draft')).toEqual([]);
  });
});

// ─── Taxonomy structural integrity ──────────────────────────────────────────

describe('TRANSACTION_TAXONOMY structural integrity', () => {
  const entityTypes = Object.keys(TRANSACTION_TAXONOMY);

  entityTypes.forEach((entityType) => {
    test(`[${entityType}] all transition targets are valid defined states`, () => {
      const { states, transitions } = TRANSACTION_TAXONOMY[entityType];
      const stateSet = new Set(states);

      Object.entries(transitions).forEach(([fromState, toStates]) => {
        expect(stateSet.has(fromState)).toBe(true);
        toStates.forEach((toState) => {
          expect(stateSet.has(toState)).toBe(true);
        });
      });
    });

    test(`[${entityType}] all defined states appear in the transitions map`, () => {
      const { states, transitions } = TRANSACTION_TAXONOMY[entityType];
      states.forEach((state) => {
        expect(transitions).toHaveProperty(state);
      });
    });

    test(`[${entityType}] initial state exists in states list`, () => {
      const { states, initial } = TRANSACTION_TAXONOMY[entityType];
      expect(states).toContain(initial);
    });
  });
});

describe('validatePurchaseOrderTransition — Business Rules & Logistics Guards', () => {
  it('blocks transition to in_transit if tracking or carrier is missing', () => {
    const invalidPo = { id: 'PO-001', status: 'po_created' };
    const res = validatePurchaseOrderTransition(invalidPo, 'in_transit');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('tracking number, AWB or carrier');
  });

  it('allows transition to in_transit when tracking number is present', () => {
    const validPo = { id: 'PO-002', status: 'po_created', trackingNumber: 'DHL-EXPRESS-99214' };
    const res = validatePurchaseOrderTransition(validPo, 'in_transit');
    expect(res.valid).toBe(true);
  });

  it('blocks transition to reconciled if temperature excursion is disputed', () => {
    const disputedPo = { id: 'PO-003', status: 'delivered', temperatureExcursionDisputed: true };
    const res = validatePurchaseOrderTransition(disputedPo, 'reconciled');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('temperature excursion');
  });

  it('allows transition to reconciled when delivery has no open temperature disputes', () => {
    const cleanPo = { id: 'PO-004', status: 'delivered', temperatureExcursionDisputed: false };
    const res = validatePurchaseOrderTransition(cleanPo, 'reconciled');
    expect(res.valid).toBe(true);
  });
});

describe('validatePrescriptionTransition — Clinical Guards', () => {
  it('blocks approval if doctor identity or signature is missing', () => {
    const unsignedRx = { id: 'RX-001', status: 'pending_approval' };
    const res = validatePrescriptionTransition(unsignedRx, 'approved');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('doctor ID, license number or digital signature');
  });

  it('allows approval when doctor license or signature is present', () => {
    const signedRx = { id: 'RX-002', status: 'pending_approval', doctorLicense: 'MED-99214' };
    const res = validatePrescriptionTransition(signedRx, 'approved');
    expect(res.valid).toBe(true);
  });
});

describe('validateQuotationTransition — Commercial Validity Guards', () => {
  it('blocks conversion to order if quotation has expired', () => {
    const expiredQuote = { id: 'QT-001', status: 'accepted', validUntil: '2020-01-01' };
    const res = validateQuotationTransition(expiredQuote, 'converted_to_order');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('validity has expired');
  });

  it('allows conversion to order if quotation is still valid', () => {
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
    const validQuote = { id: 'QT-002', status: 'accepted', validUntil: futureDate };
    const res = validateQuotationTransition(validQuote, 'converted_to_order');
    expect(res.valid).toBe(true);
  });
});

