/**
 * BaseGenomicAdapter
 *
 * Abstract foundation for Multi-Lab Genomic Dossier Parsers.
 * Standardizes disparate external laboratory schemas (24Genetics, TellmeGen, VCF)
 * into the platform's canonical GenomicDossier model.
 */

export class BaseGenomicAdapter {
  constructor(providerName) {
    this.providerName = providerName;
  }

  /**
   * Determine if this adapter can parse the incoming raw payload.
   * @param {Object} rawPayload
   * @returns {boolean}
   */
  canHandle() {
    throw new Error('canHandle() must be implemented by adapter subclass');
  }

  /**
   * Parse the raw laboratory payload into a canonical GenomicDossier.
   * @param {Object} rawPayload
   * @returns {Object} Canonical GenomicDossier
   */
  parse() {
    throw new Error('parse() must be implemented by adapter subclass');
  }

  /**
   * Standardizes variant allele formatting (e.g. 'C/T' -> 'CT', 'G/G' -> 'GG').
   * @param {string} rawGenotype
   * @returns {string} Clean uppercase genotype string
   */
  cleanGenotype(rawGenotype) {
    if (!rawGenotype || typeof rawGenotype !== 'string') return '';
    return rawGenotype.replace(/\//g, '').replace(/\s+/g, '').replace(/-/g, '').toUpperCase().trim();
  }
}
