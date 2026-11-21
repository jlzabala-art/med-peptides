import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveProtocolClinicalEvidence } from '../src/constants/protocolClinicalEvidence.js';

describe('Clinical Protocol Evidence & Safety Enrichment', () => {
  it('assigns Tier 1 Human RCT and MEN-2 exclusion to Tirzepatide protocols', () => {
    const ev = resolveProtocolClinicalEvidence({
      name: 'Metabolic Reset Tirzepatide Protocol',
      slug: 'tirzepatide-metabolic-12w',
    });
    assert.equal(ev.evidenceTier, 'Tier 1 - Human RCT');
    assert.ok(ev.citations.some((c) => c.pmid === '35658024'));
    assert.ok(ev.contraindications.some((c) => /MEN-2|Medullary Thyroid/i.test(c)));
  });

  it('keeps BPC-157/TB-500 honestly labeled as Tier 4 Preclinical with malignancy exclusion', () => {
    const ev = resolveProtocolClinicalEvidence({
      name: 'Musculoskeletal Repair Stack',
      slug: 'bpc-157-tb-500-protocol',
    });
    assert.equal(ev.evidenceTier, 'Tier 4 - Preclinical / Mechanistic');
    assert.ok(ev.contraindications.some((c) => /malignancy/i.test(c)));
  });

  it('resolves CJC-1295/Ipamorelin, Tesamorelin, and Epitalon evidence profiles cleanly', () => {
    const gh = resolveProtocolClinicalEvidence({
      name: 'CJC-1295 + Ipamorelin Nocturnal Axis',
      slug: 'cjc-1295-ipamorelin-synergistic-hgh-optimization',
    });
    assert.equal(gh.evidenceTier, 'Tier 2 - Clinical Trial');
    assert.ok(gh.biomarkers.length > 0);
    assert.ok(gh.citations.some((c) => c.pmid === '16571593'));

    const tesa = resolveProtocolClinicalEvidence({ name: 'Tesamorelin VAT Protocol' });
    assert.equal(tesa.evidenceTier, 'Tier 1 - Human RCT');
    assert.ok(tesa.citations.some((c) => c.pmid === '20647205'));

    const epi = resolveProtocolClinicalEvidence({ name: 'Epitalon Longevity Pulse' });
    assert.equal(epi.evidenceTier, 'Tier 3 - Clinical Consensus');
  });
});
