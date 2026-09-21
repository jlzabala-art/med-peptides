import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/admin/enrich-product/route';

describe('Enrich Product Route', () => {
  it('enriches 17-a-estradiol successfully to 100% without 500 error or wrong schema', async () => {
    const req = new Request('http://localhost:3000/api/admin/enrich-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: '17-a-estradiol', canonicalName: '17-a Estradiol' })
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.completeness.score).toBe(100);
    expect(json.completeness.missingFields.length).toBe(0);
    expect(json.completeness.schemaType).toBe('Peptide / API');
  });

  it('enriches Curcumin as a supplement with Supplement schema to 100%', async () => {
    const req = new Request('http://localhost:3000/api/admin/enrich-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'curcumin', canonicalName: 'Curcumin', categoryId: 'supplement' })
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.completeness.score).toBe(100);
    expect(json.completeness.missingFields.length).toBe(0);
    expect(json.completeness.schemaType).toBe('Supplement / Nutraceutical');
  });

  it('enriches Curcumin as a raw material API with API schema without genomics test programs', async () => {
    const req = new Request('http://localhost:3000/api/admin/enrich-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'curcumin', canonicalName: 'Curcumin', categoryId: 'raw_material' })
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.completeness.score).toBe(100);
    expect(json.completeness.missingFields.length).toBe(0);
    expect(json.completeness.schemaType).toBe('Active API / Compounding');
  });

  it('enriches a diagnostic test with Diagnostic & Genetic Test schema to 100%', async () => {
    const req = new Request('http://localhost:3000/api/admin/enrich-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'bloodo-nad-level-test',
        canonicalName: 'Bloodo™ NAD+ Level Test',
        categoryId: 'diagnostic_test'
      })
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.completeness.score).toBe(100);
    expect(json.completeness.missingFields.length).toBe(0);
    expect(json.completeness.schemaType).toBe('Diagnostic & Genetic Test');
  });
});
