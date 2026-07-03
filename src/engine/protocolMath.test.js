import { describe, it, expect } from 'vitest';
import { calculateProtocolRequirements, generatePrescriptionLines } from './protocolMath';

describe('protocolMath Engine', () => {

  const mockProtocol = {
    patient: 'John Doe',
    phases: [
      {
        phase: 1,
        items: [
          {
            productId: 'pep-001',
            name: 'BPC-157',
            vialStrengthMg: 10,
            doseMg: 0.5,
            frequencyPerWeek: 5,
            durationWeeks: 4,
            route: 'Subcutaneous'
          }
        ]
      }
    ]
  };

  const complexProtocol = {
    patient: 'Jane Smith',
    phases: [
      {
        phase: 1,
        items: [
          {
            productId: 'pep-002',
            name: 'CJC-1295',
            vialStrengthMg: 5, // 5mg per vial
            doseMg: 0.2,       // 0.2mg per dose
            frequencyPerWeek: 5, // 5 times a week = 1mg/week
            durationWeeks: 6,    // 6 weeks = 6mg total
            route: 'Subcutaneous'
          }
        ]
      }
    ]
  };

  describe('calculateProtocolRequirements', () => {
    it('should correctly calculate vials required for a simple protocol', () => {
      const requirements = calculateProtocolRequirements(mockProtocol);
      expect(requirements).toHaveLength(1);
      const req = requirements[0];
      
      // 0.5mg * 5 times/week * 4 weeks = 10mg
      // Vial strength is 10mg. So exactly 1 vial needed.
      expect(req.totalMgRequired).toBe(10);
      expect(req.vialsRequired).toBe(1);
      expect(req.unusedMg).toBe(0);
    });

    it('should round up vials when exact mg is not a perfect multiple of vial strength', () => {
      const requirements = calculateProtocolRequirements(complexProtocol);
      expect(requirements).toHaveLength(1);
      const req = requirements[0];
      
      // 0.2mg * 5 = 1mg/week * 6 weeks = 6mg total.
      // Vial strength = 5mg. 6 / 5 = 1.2 vials. Should round up to 2 vials.
      expect(req.totalMgRequired).toBeCloseTo(6);
      expect(req.vialsRequired).toBe(2);
      expect(req.unusedMg).toBeCloseTo(4); // 2*5 - 6 = 4mg unused
    });

    it('should return empty array for empty protocol', () => {
      const reqs = calculateProtocolRequirements({});
      expect(reqs).toEqual([]);
    });
  });

  describe('generatePrescriptionLines', () => {
    it('should correctly generate prescription lines based on calculated vials', () => {
      const lines = generatePrescriptionLines(complexProtocol);
      expect(lines).toHaveLength(1);
      const line = lines[0];
      
      expect(line.product_name).toBe('CJC-1295');
      expect(line.dosage).toBe('0.2 mg');
      expect(line.frequency).toBe('5x / week');
      expect(line.duration).toBe('6 weeks');
      expect(line.quantity).toBe(2); // The exact rounded up vials
    });
  });

});
