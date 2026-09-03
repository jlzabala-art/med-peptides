/**
 * __tests__/clinicalSanitizer.test.js
 * Unit tests for the Clinical Sanitizer (Pilar 4 — Fase 3)
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizeField,
  sanitizeEntity,
  sanitizeClinicalEntity,
  CLINICAL_FREE_TEXT_FIELDS,
} from '../clinicalSanitizer';

describe('clinicalSanitizer', () => {
  describe('sanitizeField()', () => {
    it('returns null/undefined unchanged', () => {
      expect(sanitizeField(null)).toBeNull();
      expect(sanitizeField(undefined)).toBeUndefined();
    });

    it('passes through plain clinical text unchanged (after escaping)', () => {
      const plain = 'BID 0.5mg/kg SQ, PRN. Monitor IGF-1 levels.';
      const result = sanitizeField(plain);
      // No HTML, so no stripping; the / gets escaped to &#x2F;
      expect(result).toContain('BID');
      expect(result).toContain('PRN');
      expect(result).toContain('Monitor IGF-1 levels');
    });

    it('strips <script> tags completely', () => {
      const malicious = 'Good text <script>alert("xss")</script> after';
      const result = sanitizeField(malicious);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Good text');
      expect(result).toContain('after');
    });

    it('strips inline event handlers (onerror, onclick)', () => {
      const malicious = 'Notes: <img onerror="stealData()" src="x">';
      const result = sanitizeField(malicious);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('stealData');
    });

    it('strips javascript: protocol', () => {
      const malicious = 'Click here: javascript:void(document.cookie)';
      const result = sanitizeField(malicious);
      expect(result).not.toContain('javascript:');
      expect(result).toContain('Click here');
    });

    it('strips data: protocol', () => {
      const malicious = 'Load: data:text/html,<h1>XSS</h1>';
      const result = sanitizeField(malicious);
      expect(result).not.toContain('data:text/html');
    });

    it('strips all HTML tags but preserves content', () => {
      const htmlInput = '<b>Important</b> note: <em>see doctor</em>';
      const result = sanitizeField(htmlInput);
      expect(result).not.toContain('<b>');
      expect(result).not.toContain('<em>');
      expect(result).toContain('Important');
      expect(result).toContain('note');
      expect(result).toContain('see doctor');
    });

    it('strips style blocks', () => {
      const malicious = '<style>body { display:none }</style>Notes here';
      const result = sanitizeField(malicious);
      expect(result).not.toContain('<style>');
      expect(result).not.toContain('display:none');
      expect(result).toContain('Notes here');
    });

    it('preserves numeric ranges and units', () => {
      const clinical = 'Dose: 50-100 mg, IGF-1: 200–400 ng/mL, HGH: 1.5 IU/day';
      const result = sanitizeField(clinical);
      expect(result).toContain('50-100');
      expect(result).toContain('200');
      expect(result).toContain('ng');
      expect(result).toContain('HGH');
    });

    it('collapses excessive blank lines to max 2', () => {
      const multiLine = 'Line1\n\n\n\n\nLine2';
      const result = sanitizeField(multiLine);
      expect(result).not.toContain('\n\n\n');
      expect(result).toContain('Line1');
      expect(result).toContain('Line2');
    });

    it('returns non-string values unchanged', () => {
      expect(sanitizeField(42)).toBe(42);
      expect(sanitizeField(true)).toBe(true);
      expect(sanitizeField({ a: 1 })).toEqual({ a: 1 });
    });
  });

  describe('sanitizeEntity()', () => {
    it('sanitizes all string fields in an entity', () => {
      const entity = {
        id: 'p-001',
        notes: '<script>evil()</script>Valid clinical note',
        instructions: '<b>Take once daily</b>',
        count: 5,
      };
      const result = sanitizeEntity(entity);
      expect(result.id).toBe('p-001'); // No HTML chars, stays same
      expect(result.notes).not.toContain('<script>');
      expect(result.notes).toContain('Valid clinical note');
      expect(result.instructions).not.toContain('<b>');
      expect(result.count).toBe(5);
    });

    it('only sanitizes specified fields when fieldsToSanitize is provided', () => {
      const entity = {
        notes: '<script>evil()</script>Note',
        title: '<b>Title</b>',
      };
      const result = sanitizeEntity(entity, ['notes']);
      expect(result.notes).not.toContain('<script>');
      // title was NOT in the sanitize list
      expect(result.title).toBe('<b>Title</b>');
    });

    it('returns arrays and null unchanged', () => {
      expect(sanitizeEntity(null)).toBeNull();
      expect(sanitizeEntity([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('sanitizeClinicalEntity()', () => {
    it('only sanitizes CLINICAL_FREE_TEXT_FIELDS, not id or status', () => {
      const entity = {
        id: 'rx-001',
        status: 'approved',
        notes: '<script>alert(1)</script>Doctor note',
        instructions: '<img src=x onerror=xss()>Take 2 daily',
        totalAmount: 150,
      };
      const result = sanitizeClinicalEntity(entity);
      expect(result.id).toBe('rx-001');
      expect(result.status).toBe('approved');
      expect(result.notes).not.toContain('<script>');
      expect(result.instructions).not.toContain('onerror');
      expect(result.totalAmount).toBe(150);
    });
  });

  describe('CLINICAL_FREE_TEXT_FIELDS', () => {
    it('includes key clinical text fields', () => {
      expect(CLINICAL_FREE_TEXT_FIELDS).toContain('notes');
      expect(CLINICAL_FREE_TEXT_FIELDS).toContain('instructions');
      expect(CLINICAL_FREE_TEXT_FIELDS).toContain('doctorNotes');
      expect(CLINICAL_FREE_TEXT_FIELDS).toContain('treatmentPlan');
    });

    it('is frozen (immutable)', () => {
      expect(Object.isFrozen(CLINICAL_FREE_TEXT_FIELDS)).toBe(true);
    });
  });
});
