
# Antigravity Prompt — Safe Firebase pricing + variants update for Med-Peptides

Use the uploaded files:
- `med_peptides_firebase_pricing_patch_2026.json`
- `med_peptides_firebase_pricing_update_guide.md`

## Mission
Update product display pricing in Firebase using the 2026 wholesale price list, and add safe variant handling for products with multiple strengths.

## Critical rule
This is a safe patch, not a destructive refactor.

Do NOT overwrite:
- semanticKeywords
- tags
- faqTags
- relatedGoals
- relatedProtocolSlugs
- product descriptions
- scientific resources
- FAQ mappings
- PubMed integrations
- protocol references

## What to do
1. Patch pricing fields in existing product docs
2. Ensure all products / ancillaries from the uploaded price list are represented in the patch
3. Add family / variant fields so multi-strength items behave as variants
4. Mark products active only when the document exists or is intentionally created
5. Preserve all semantic and FAQ behavior

## Variant requirement
Where a family has more than one strength, expose variants in Firebase and in UI using:
- `familySlug`
- `variantSlug`
- `hasVariants`
- `variantSlugs`
- `strength`

## Pricing requirement
Use:
- `unitPriceUSD`
- `kit10PriceUSD`
- `pricingTerms`

Do not infer missing prices beyond the uploaded patch.

## Output expectation
Implement a safe product pricing / variants update without breaking:
- semantic discovery
- FAQ per product
- protocol builder references
- product detail pages
- cost calculations
