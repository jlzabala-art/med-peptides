import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sanitizeCSVCell, exportToCSV, exportToJSON } from '../universalExporter';

describe('universalExporter', () => {
  let originalBlob;
  let originalCreateObjectURL;
  let originalRevokeObjectURL;

  beforeEach(() => {
    originalBlob = global.Blob;
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;

    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    global.Blob = originalBlob;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  describe('sanitizeCSVCell()', () => {
    it('handles null and undefined gracefully', () => {
      expect(sanitizeCSVCell(null)).toBe('');
      expect(sanitizeCSVCell(undefined)).toBe('');
    });

    it('returns benign text unchanged with double quotes escaped', () => {
      expect(sanitizeCSVCell('Regenera Clinic')).toBe('Regenera Clinic');
      expect(sanitizeCSVCell('BPC-157 "Pure" 5mg')).toBe('BPC-157 ""Pure"" 5mg');
    });

    it('neutralizes CSV formula injection attempts (=, +, -, @, \\t)', () => {
      expect(sanitizeCSVCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
      expect(sanitizeCSVCell('+cmd|/C calc')).toBe("'+cmd|/C calc");
      expect(sanitizeCSVCell('-2+3')).toBe("'-2+3");
      expect(sanitizeCSVCell('@IMPORTXML("http://evil.com")')).toBe("'@IMPORTXML(\"\"http://evil.com\"\")");
      expect(sanitizeCSVCell('\tmalicious')).toBe("'\tmalicious");
    });
  });

  describe('exportToCSV()', () => {

    it('generates CSV with UTF-8 BOM and correct headers and accessors', () => {
      let capturedBlobContent = null;
      class MockBlob {
        constructor(content, options) {
          capturedBlobContent = content[0];
          this.content = content;
          this.options = options;
        }
      }
      global.Blob = MockBlob;

      const mockData = [
        { id: 'cli-1', name: 'Alpha Clinic', director: 'Dr. House', total: 1200 },
        { id: 'cli-2', name: '=HYPERLINK("evil.com")', director: 'Dr. Evil', total: 500 },
      ];

      const columns = [
        { header: 'ID', accessor: (d) => d.id },
        { header: 'Clinic Name', accessor: (d) => d.name },
        { header: 'Director', key: 'director' },
        { header: 'Total ($)', accessor: (d) => `$${d.total.toFixed(2)}` },
      ];

      exportToCSV(mockData, columns, 'clinics_test.csv');

      expect(capturedBlobContent).toBeDefined();
      // Must start with UTF-8 BOM \uFEFF
      expect(capturedBlobContent.startsWith('\uFEFF')).toBe(true);
      expect(capturedBlobContent).toContain('"ID","Clinic Name","Director","Total ($)"');
      expect(capturedBlobContent).toContain('"cli-1","Alpha Clinic","Dr. House","$1200.00"');
      // Must sanitize injection in second row
      expect(capturedBlobContent).toContain('\'=HYPERLINK');
    });

    it('supports polymorphic signature (data, filename, columns)', () => {
      let capturedBlobContent = null;
      class MockBlob {
        constructor(content, options) {
          capturedBlobContent = content[0];
          this.content = content;
          this.options = options;
        }
      }
      global.Blob = MockBlob;

      const mockData = [{ sku: 'PEP-01', name: 'TB-500' }];
      const columns = [{ header: 'SKU', key: 'sku' }, { header: 'Product', key: 'name' }];

      exportToCSV(mockData, 'products.csv', columns);

      expect(capturedBlobContent.startsWith('\uFEFF')).toBe(true);
      expect(capturedBlobContent).toContain('"SKU","Product"');
      expect(capturedBlobContent).toContain('"PEP-01","TB-500"');
    });
  });

  describe('exportToJSON()', () => {
    it('creates formatted JSON file with indentation', () => {
      let capturedJson = null;
      class MockBlob {
        constructor(content) {
          capturedJson = content[0];
          this.content = content;
        }
      }
      global.Blob = MockBlob;

      const data = [{ a: 1, b: 'test' }];
      exportToJSON(data, 'test.json');

      expect(capturedJson).toBe(JSON.stringify(data, null, 2));
    });
  });
});
