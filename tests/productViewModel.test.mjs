import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCanonicalKey,
  parseStrength,
  normalizeMoneyEnvelope,
  toProductViewModel,
} from '../src/utils/productViewModel.js';

describe('Canonical Model v2 — productViewModel adapter', () => {
  it('normalizes canonicalKey and structured strength from legacy pellet docs', () => {
    const raw = {
      id: 'pellet-t-100',
      name: 'Testosterone 100 mg Pellet',
      type: 'pellet',
      strength: '100 mg',
      pricing: {
        wholesalePriceEur: 40,
        currency: 'EUR',
      },
    };
    const vm = toProductViewModel(raw, { targetCurrency: 'USD' });
    assert.equal(vm.schemaVersion, 2);
    assert.equal(vm.canonicalKey, 'testosterone-100-mg-pellet');
    assert.equal(vm.strengthValue, 100);
    assert.equal(vm.strengthUnit, 'mg');
    assert.equal(vm.money.baseCurrency, 'EUR');
    assert.equal(vm.money.currency, 'USD');
    assert.equal(vm.money.unitPriceBase, 40);
    assert.equal(vm.money.pack10PriceBase, 360); // 10 * 40 * 0.90
    assert.ok(vm.money.unitPrice > 40); // EUR -> USD
  });

  it('parses decimal cannula sizes and peptide strengths reliably', () => {
    assert.deepEqual(parseStrength('3.2 mm cannula'), {
      strengthValue: 3.2,
      strengthUnit: 'mm',
      doseLabel: '3.2 mm cannula',
    });
    assert.deepEqual(parseStrength('10mg'), {
      strengthValue: 10,
      strengthUnit: 'mg',
      doseLabel: '10mg',
    });
  });

  it('prefers explicit canonicalKey when present', () => {
    assert.equal(normalizeCanonicalKey({ canonicalKey: 'bpc-157', name: 'BPC 157 10mg' }), 'bpc-157');
  });

  it('resolves nested tier pricing objects cleanly', () => {
    const money = normalizeMoneyEnvelope(
      {
        type: 'peptide',
        pricing: {
          wholesale: { perUnit: 55, kit: 467.5 },
        },
      },
      { tier: 'wholesale', targetCurrency: 'USD' }
    );
    assert.equal(money.unitPrice, 55);
    assert.equal(money.pack10Price, 467.5);
    assert.equal(money.pack10SavingsPct, 15);
  });

  it('derives synergyKeys and normalized sortDoseValue across mg and mcg', () => {
    const pelletVm = toProductViewModel({
      id: 'est-25',
      name: 'Estradiol 25 mg Pellet',
      type: 'pellet',
      hormoneType: 'estrogen',
      strength: '25 mg',
    });
    assert.deepEqual(pelletVm.synergyKeys, ['ghk-cu', 'epithalon', 'bpc-157']);
    assert.equal(pelletVm.sortDoseValue, 25);

    const mcgVm = toProductViewModel({
      id: 'pep-mcg',
      name: 'Semax 500 mcg',
      type: 'peptide',
      strength: '500 mcg',
    });
    assert.deepEqual(mcgVm.synergyKeys, ['selank']);
    assert.equal(mcgVm.sortDoseValue, 0.5);
  });
});
