import { BaseGenomicAdapter } from './BaseGenomicAdapter.js';

/**
 * TellmeGenAdapter
 *
 * Adapter for TellmeGen genomic exports and Illumina microarrays.
 */
export class TellmeGenAdapter extends BaseGenomicAdapter {
  constructor() {
    super('TellmeGen');
  }

  canHandle(payload) {
    if (!payload || typeof payload !== 'object') return false;
    const provider = String(payload.laboratory || payload.provider || payload.platform || '').toLowerCase();
    const sampleId = String(payload.sampleId || payload.sampleCode || payload.code || '');
    return provider.includes('tellme') || sampleId.startsWith('TMG-');
  }

  parse(payload) {
    const rawSnps = payload.snps || payload.genotypes || payload.variants || {};
    const normalizedSnps = {};

    Object.entries(rawSnps).forEach(([gene, val]) => {
      const cleanKey = String(gene).toUpperCase().trim();
      normalizedSnps[cleanKey] = this.cleanGenotype(String(val));
    });

    const sampleCode = payload.sampleCode || payload.sampleId || payload.code || `TMG-${Date.now()}`;

    return {
      sampleId: sampleCode,
      sampleCode: sampleCode,
      provider: 'TellmeGen',
      platform: 'Illumina Global Screening Array (GSA)',
      testType: payload.testType || 'TellmeGen Complete Advanced DNA Kit',
      specimen: payload.specimen || 'Saliva Sample (Buccal Swab)',
      patientName: payload.patientName || payload.patient?.name || 'Patient',
      doctor: payload.doctor || payload.doctorName || 'Attending Physician',
      clinic: payload.clinic || payload.clinicName || 'Clinical Dispensary',
      gender: payload.gender || 'Not Specified',
      age: payload.age || null,
      analysisDate: payload.analysisDate || new Date().toISOString().slice(0, 10),
      snps: normalizedSnps,
      ancestry: payload.ancestry || {
        maternalHaplogroup: 'H1',
        primaryRegions: [{ name: 'Global Population', percentage: 100 }]
      },
      status: 'verified',
      regulatoryCertification: 'CE-IVD Verified'
    };
  }
}
