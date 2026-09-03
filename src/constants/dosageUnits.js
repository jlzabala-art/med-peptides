/**
 * dosageUnits.js
 *
 * Canonical list of valid pharmaceutical and clinical dosage units for products and variants.
 */

export const DOSAGE_UNITS = [
  { value: 'mg', label: 'mg (Milligrams)' },
  { value: 'mcg', label: 'mcg (Micrograms / µg)' },
  { value: 'g', label: 'g (Grams)' },
  { value: 'IU', label: 'IU (International Units)' },
  { value: 'IU/ml', label: 'IU/ml' },
  { value: 'mg/vial', label: 'mg/vial' },
  { value: 'mg/ml', label: 'mg/ml' },
  { value: 'mcg/spray', label: 'mcg/spray' },
  { value: 'ml', label: 'ml (Milliliters)' },
  { value: '%', label: '% (Concentration Percentage)' },
  { value: 'tests', label: 'tests (Diagnostic Assays)' },
  { value: 'caps', label: 'caps (Capsules)' },
  { value: 'tablets', label: 'tablets' }
];

export const VALID_DOSAGE_UNITS = DOSAGE_UNITS.map(u => u.value);
