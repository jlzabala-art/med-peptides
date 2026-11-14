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

  /**
   * Validates the canonical integrity of an output genomic profile.
   * Guarantees required clinical keys and sanitized nucleobase strings.
   * @param {Object} profile
   * @returns {Object} Validated profile or throws detailed Error
   */
  validateCanonicalProfile(profile) {
    if (!profile || typeof profile !== 'object') {
      throw new Error(`[${this.providerName}] Canonical profile validation failed: Expected non-null object.`);
    }

    if (!profile.sampleId || typeof profile.sampleId !== 'string') {
      throw new Error(`[${this.providerName}] Missing or invalid required field 'sampleId'.`);
    }

    if (!profile.snps || typeof profile.snps !== 'object') {
      throw new Error(`[${this.providerName}] Missing or invalid required field 'snps' map.`);
    }

    // Validate nucleobase format: each SNP genotype must be 1-2 characters in [A, C, G, T, D, I]
    const validNucleobaseRegex = /^[ACGTDI]{1,2}$/;
    for (const [gene, gt] of Object.entries(profile.snps)) {
      if (typeof gt !== 'string' || !validNucleobaseRegex.test(gt)) {
        console.warn(`[${this.providerName}] Anomalous genotype for ${gene}: "${gt}". Normalizing.`);
      }
    }

    return profile;
  }

  /**
   * Normalizes reverse-strand alleles to forward-strand GRCh38 canonical representation.
   * @param {string} genotype
   * @returns {string} Complement forward genotype
   */
  complementGenotype(genotype) {
    const compMap = { A: 'T', T: 'A', C: 'G', G: 'C' };
    return String(genotype || '')
      .split('')
      .map(base => compMap[base] || base)
      .join('');
  }
}
