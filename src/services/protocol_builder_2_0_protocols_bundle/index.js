import wm_001    from './wm_001--structured-weight-management.json'    with { type: 'json' };
import wm_002    from './wm_002--weight-management-combination.json'    with { type: 'json' };
import wm_003    from './wm_003--retatrutide-metabolic-research.json'   with { type: 'json' };
import wm_004    from './wm_004--tirzepatide-metabolic-adjunct.json'    with { type: 'json' };
import cog_001   from './cog_001--cognitive-support.json'               with { type: 'json' };
import cog_002   from './cog_002--focus-and-resilience.json'            with { type: 'json' };
import energy_001 from './energy_001--mitochondrial-energy.json'        with { type: 'json' };
import energy_002 from './energy_002--mitochondrial-resilience.json'    with { type: 'json' };
import horm_001  from './horm_001--hormonal-support.json'               with { type: 'json' };
import horm_002  from './horm_002--gh-axis-support.json'                with { type: 'json' };
import immune_001 from './immune_001--immune-modulation.json'           with { type: 'json' };
import immune_002 from './immune_002--immune-reset.json'                with { type: 'json' };
import lon_001   from './lon_001--longevity-foundation.json'            with { type: 'json' };
import lon_002   from './lon_002--longevity-circadian.json'             with { type: 'json' };
import met_001   from './met_001--metabolic-optimization.json'          with { type: 'json' };
import sa_001    from './sa_001--skin-aesthetics-ghkcu.json'            with { type: 'json' };

export const protocolBundle = [
  wm_001, wm_002, wm_003, wm_004,
  cog_001, cog_002,
  energy_001, energy_002,
  horm_001, horm_002,
  immune_001, immune_002,
  lon_001, lon_002,
  met_001,
  sa_001,
];
