 
import wm_001    from './wm_001--structured-weight-management.json'           with { type: 'json' };
import wm_002    from './wm_002--weight-management-combination.json'           with { type: 'json' };
import wm_003    from './wm_003--retatrutide-metabolic-research.json'          with { type: 'json' };
import wm_004    from './wm_004--tirzepatide-metabolic-adjunct.json'           with { type: 'json' };
import wm_005    from './wm_005--weight-management-advanced-longevity.json'    with { type: 'json' };
import cog_001   from './cog_001--cognitive-support.json'                      with { type: 'json' };
import cog_002   from './cog_002--focus-and-resilience.json'                   with { type: 'json' };
import energy_001 from './energy_001--mitochondrial-energy.json'               with { type: 'json' };
import energy_002 from './energy_002--mitochondrial-resilience.json'           with { type: 'json' };
import horm_001  from './horm_001--hormonal-support.json'                      with { type: 'json' };
import horm_002  from './horm_002--gh-axis-support.json'                       with { type: 'json' };
import immune_001 from './immune_001--immune-modulation.json'                  with { type: 'json' };
import immune_002 from './immune_002--immune-reset.json'                       with { type: 'json' };
import lon_001   from './lon_001--longevity-foundation.json'                   with { type: 'json' };
import lon_002   from './lon_002--longevity-circadian.json'                    with { type: 'json' };
import met_001   from './met_001--metabolic-optimization.json'                 with { type: 'json' };
import met_002   from './met_002--metabolic-retatrutide-motsc.json'            with { type: 'json' };
import neuro_001 from './neuro_001--neuro-restoration-advanced.json'           with { type: 'json' };
import sa_001    from './sa_001--skin-aesthetics-ghkcu.json'                   with { type: 'json' };
import skin_001  from './skin_001--skin-rejuvenation-ghkcu.json'               with { type: 'json' };
import skin_002  from './skin_002--skin-repair-aging.json'                     with { type: 'json' };
import sleep_001 from './sleep_001--sleep-restoration-dsip.json'               with { type: 'json' };
import sleep_002 from './sleep_002--sleep-circadian-epithalon.json'            with { type: 'json' };
import rec_001   from './rec_001--recovery-foundation.json'                    with { type: 'json' };
import rec_002   from './rec_002--recovery-advanced.json'                      with { type: 'json' };

export const protocolBundle = [
  // Weight Management (5)
  wm_001, wm_002, wm_003, wm_004, wm_005,
  // Cognitive (2)
  cog_001, cog_002,
  // Energy & Mitochondrial (2)
  energy_001, energy_002,
  // Hormonal (2)
  horm_001, horm_002,
  // Immune (2)
  immune_001, immune_002,
  // Longevity (2)
  lon_001, lon_002,
  // Metabolic (2)
  met_001, met_002,
  // Neurological (1)
  neuro_001,
  // Recovery (2)
  rec_001, rec_002,
  // Skin & Aesthetics (3)
  sa_001, skin_001, skin_002,
  // Sleep (2)
  sleep_001, sleep_002,
];
