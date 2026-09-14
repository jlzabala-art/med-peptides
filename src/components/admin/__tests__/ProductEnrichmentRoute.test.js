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
});
