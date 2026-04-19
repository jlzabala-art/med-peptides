/**
 * Static mapping from normalised category / pathway slugs to their
 * canonical collection route slug.  Used in App.jsx handleCategorySelect.
 */
export const PATHWAY_MAPPING = {
  'healing-repair':                  'healing-recovery',
  'healing-amp-recovery':            'healing-recovery',
  'healing-recovery':                'healing-recovery',
  'metabolic-optimization':          'weight-management-metabolic',
  'weight-management-metabolic':     'weight-management-metabolic',
  'weight-management-amp-metabolic': 'weight-management-metabolic',
  'neuro-cognitive':                 'cognitive-neuro-protection',
  'cognitive-neuro-protection':      'cognitive-neuro-protection',
  'cognitive-amp-neuro-protection':  'cognitive-neuro-protection',
  'longevity-vitality':              'anti-aging-longevity',
  'anti-aging-longevity':            'anti-aging-longevity',
  'anti-aging-amp-longevity':        'anti-aging-longevity',
  'somatic-research':                'muscle-growth-performance',
  'muscle-growth-performance':       'muscle-growth-performance',
  'muscle-growth-amp-performance':   'muscle-growth-performance',
  'hormonal-pathways':               'hormonal-support',
  'hormonal-support':                'hormonal-support',
};
