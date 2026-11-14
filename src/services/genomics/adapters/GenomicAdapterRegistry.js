import { TwentyFourGeneticsAdapter } from './TwentyFourGeneticsAdapter.js';
import { TellmeGenAdapter } from './TellmeGenAdapter.js';

const adapters = [
  new TwentyFourGeneticsAdapter(),
  new TellmeGenAdapter()
];

/**
 * GenomicAdapterRegistry
 *
 * Automatically inspects incoming raw lab payloads, discovers the
 * suitable adapter, and parses it into the canonical GenomicDossier.
 */
export function parseRawGenomicPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid raw genomic payload: object expected');
  }

  const matchedAdapter = adapters.find(a => a.canHandle(payload));
  if (matchedAdapter) {
    return matchedAdapter.parse(payload);
  }

  // Fallback default: 24Genetics parser
  const defaultAdapter = adapters[0];
  return defaultAdapter.parse(payload);
}
