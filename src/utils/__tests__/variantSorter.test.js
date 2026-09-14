import { describe, it, expect } from 'vitest';
import { parseDosageNumber, sortVariantsAscending } from '../variantSorter';

describe('variantSorter', () => {
  it('parses numeric dosages with units correctly', () => {
    expect(parseDosageNumber('5 mg')).toBe(5);
    expect(parseDosageNumber('10mg')).toBe(10);
    expect(parseDosageNumber('500 mcg')).toBe(0.5);
    expect(parseDosageNumber('1 g')).toBe(1000);
    expect(parseDosageNumber('0.05%')).toBe(0.5);
    expect(parseDosageNumber('Standard Presentation')).toBe(null);
  });

  it('sorts Retatrutide variants always from smallest to largest (5mg to 40mg)', () => {
    const rawVariants = [
      { id: '1', dosage: '10 mg', price: 90 },
      { id: '2', dosage: '20 mg', price: 130 },
      { id: '3', dosage: '30 mg', price: 170 },
      { id: '4', dosage: '40 mg', price: 230 },
      { id: '5', dosage: '5 mg', price: 60 }
    ];

    const sorted = sortVariantsAscending(rawVariants);
    expect(sorted.map(v => v.dosage)).toEqual(['5 mg', '10 mg', '20 mg', '30 mg', '40 mg']);
    expect(sorted[0].price).toBe(60);
    expect(sorted[4].price).toBe(230);
  });

  it('sorts by price ascending when dosage is tied', () => {
    const raw = [
      { id: 'a', dosage: '10 mg', price: 100 },
      { id: 'b', dosage: '10 mg', price: 80 }
    ];
    const sorted = sortVariantsAscending(raw);
    expect(sorted[0].price).toBe(80);
    expect(sorted[1].price).toBe(100);
  });
});
