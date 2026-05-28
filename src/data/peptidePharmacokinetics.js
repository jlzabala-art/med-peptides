 
/**
 * peptidePharmacokinetics.js
 * 
 * Pharmacokinetic data for research peptides, including half-life and 
 * biological residence time considerations.
 * 
 * Data sourced from clinical literature and pharmacokinetic studies.
 */

export const PEPTIDE_PK_DATA = {
  'bpc-157': {
    halfLife: '4-6 hours',
    halfLifeHours: 5,
    steadyState: 'Reached in 24-30 hours',
    notes: 'Potent systemic stability. Typically administered 1-2x daily in research protocols to maintain steady-state signaling.'
  },
  'tb-500': {
    halfLife: '72-120 hours',
    halfLifeHours: 96,
    steadyState: 'Reached in 15-20 days',
    notes: 'While plasma clearance is rapid, systemic residence time and actin-binding effects persist significantly longer.'
  },
  'tirzepatide': {
    halfLife: '120 hours (5 days)',
    halfLifeHours: 120,
    steadyState: 'Reached in 4 weeks',
    notes: 'Prolonged action due to albumin binding. Steady-state accumulation increases effective exposure by ~2x over the first month.'
  },
  'semaglutide': {
    halfLife: '168 hours (7 days)',
    halfLifeHours: 168,
    steadyState: 'Reached in 4-5 weeks',
    notes: 'Longest-acting GLP-1 analog. High albumin binding ensures very stable plasma levels with weekly dosing.'
  },
  'retatrutide': {
    halfLife: '144 hours (6 days)',
    halfLifeHours: 144,
    steadyState: 'Reached in 4 weeks',
    notes: 'Triple agonist with pharmacokinetics optimized for sustained metabolic engagement.'
  },
  'ipamorelin': {
    halfLife: '2 hours',
    halfLifeHours: 2,
    steadyState: 'N/A (Pulsatile)',
    notes: 'Designed for pulsatile GH release. Clears rapidly to avoid receptor desensitization.'
  },
  'cjc-1295-dac': {
    halfLife: '168 hours (7 days)',
    halfLifeHours: 168,
    steadyState: 'Reached in 4-5 weeks',
    notes: 'Modified with Drug Affinity Complex (DAC) for sustained, non-pulsatile GH elevation.'
  },
  'cjc-1295-no-dac': {
    halfLife: '30 minutes',
    halfLifeHours: 0.5,
    steadyState: 'N/A (Pulsatile)',
    notes: 'Also known as Mod GRF 1-29. Used for precision GH pulses, typically paired with Ipamorelin.'
  },
  'mots-c': {
    halfLife: '2 hours',
    halfLifeHours: 2,
    steadyState: 'N/A',
    notes: 'Mitochondrial-derived peptide. Clears quickly but initiates gene expression cascades that persist for days.'
  },
  'epithalon': {
    halfLife: '1 hour',
    halfLifeHours: 1,
    steadyState: 'N/A',
    notes: 'Short-acting telomerase activator. Usually administered in concentrated cycles (e.g., 10-20 days).'
  },
  'tesamorelin': {
    halfLife: '1 hour',
    halfLifeHours: 1,
    steadyState: 'N/A',
    notes: 'Potent GHRH analog. Rapid clearance necessitates daily administration in most research contexts.'
  },
  'aod-9604': {
    halfLife: '3 hours',
    halfLifeHours: 3,
    steadyState: 'Reached in 15-18 hours',
    notes: 'Lipolytic fragment of HGH. Cleared relatively quickly; often dosed daily in the morning fasted state.'
  },
  'ghk-cu': {
    halfLife: '1 hour',
    halfLifeHours: 1,
    steadyState: 'N/A',
    notes: 'Copper complex utilized rapidly by cells for tissue remodeling and collagen synthesis.'
  },
  'sermorelin': {
    halfLife: '10-20 minutes',
    halfLifeHours: 0.25,
    steadyState: 'N/A',
    notes: 'Rapidly cleared growth hormone secretagogue. Effects last 2-4 hours; usually dosed daily or multiple times daily.'
  },
  'hexarelin': {
    halfLife: '1-2 hours',
    halfLifeHours: 1.5,
    steadyState: 'N/A',
    notes: 'Potent GH secretagogue with a longer half-life than GHRP-6. Clears relatively quickly.'
  },
  'ghrp-2': {
    halfLife: '15-60 minutes',
    halfLifeHours: 0.5,
    steadyState: 'N/A',
    notes: 'Requires daily administration for sustained GH elevation. Highly effective pulsatile secretagogue.'
  },
  'ghrp-6': {
    halfLife: '2.5 hours',
    halfLifeHours: 2.5,
    steadyState: 'N/A',
    notes: 'Classic GHRP with rapid plasma clearance but significant downstream signaling impact.'
  },
  'hgh': {
    halfLife: '20-30 minutes',
    halfLifeHours: 0.4,
    steadyState: 'N/A',
    notes: 'Exogenous Somatropin clears plasma quickly, but triggers IGF-1 release which maintains biological activity for 20+ hours.'
  },
  'igf-1-lr3': {
    halfLife: '20-30 hours',
    halfLifeHours: 25,
    steadyState: 'Reached in 4-6 days',
    notes: 'Modified for stability and reduced binding to inhibitory proteins, significantly extending its biological activity.'
  },
  'peg-mgf': {
    halfLife: '48-72 hours',
    halfLifeHours: 60,
    steadyState: 'Reached in 10-15 days',
    notes: 'Pegylated Mechano Growth Factor. Drastically extended half-life compared to native MGF (minutes).'
  },
  'thymosin-alpha-1': {
    halfLife: '2-3 hours',
    halfLifeHours: 2.5,
    steadyState: 'N/A',
    notes: 'Immunomodulatory peptide. Typically dosed 2x weekly in research to maintain immune modulation.'
  },
  'ara-290': {
    halfLife: '20 minutes',
    halfLifeHours: 0.33,
    steadyState: 'N/A',
    notes: 'Rapidly cleared but initiates long-lasting innate repair receptor signaling.'
  },
  'ss-31': {
    halfLife: '1-2 hours',
    halfLifeHours: 1.5,
    steadyState: 'N/A',
    notes: 'Mitochondrial stabilizer with rapid distribution and renal excretion.'
  },
  'll-37': {
    halfLife: '1-2 hours',
    halfLifeHours: 1.5,
    steadyState: 'N/A',
    notes: 'Antimicrobial peptide highly susceptible to local proteolytic degradation.'
  },
  'vip': {
    halfLife: '1-2 minutes',
    halfLifeHours: 0.03,
    steadyState: 'N/A',
    notes: 'Extremely short half-life requires specialized delivery or frequent dosing in experimental models.'
  },
  'selank': {
    halfLife: '2-3 minutes',
    halfLifeHours: 0.04,
    steadyState: 'N/A',
    notes: 'Plasma clearance is nearly instantaneous, but neuro-modulatory effects persist for hours/days via downstream signaling.'
  },
  'semax': {
    halfLife: '2-5 minutes',
    halfLifeHours: 0.06,
    steadyState: 'N/A',
    notes: 'Rapidly metabolized; neurotrophic effects are maintained by its active PGP metabolite.'
  },
  'pt-141': {
    halfLife: '2.7 hours',
    halfLifeHours: 2.7,
    steadyState: 'N/A',
    notes: 'Bremelanotide effects can last 6–72 hours despite relatively rapid plasma clearance.'
  },
  'mt-2': {
    halfLife: '1-1.5 hours',
    halfLifeHours: 1.25,
    steadyState: 'N/A',
    notes: 'Melanotan II. Some researchers observe cumulative tanning effects with daily loading phases.'
  },
  'kisspeptin-10': {
    halfLife: '3-4 minutes',
    halfLifeHours: 0.06,
    steadyState: 'N/A',
    notes: 'Potent but very short-lived. Requires pulsatile or continuous administration for sustained HPG axis engagement.'
  }
};

/**
 * Normalizes a slug and returns its PK data if available.
 */
export function getPeptidePK(slug) {
  if (!slug) return null;
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return PEPTIDE_PK_DATA[normalized] || null;
}

export default PEPTIDE_PK_DATA;
