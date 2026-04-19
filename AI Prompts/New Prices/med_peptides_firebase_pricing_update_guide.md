
# Firebase pricing + variants update guide for Med-Peptides

## Goal
Update display pricing in USD using the 2026 wholesale PDF, while preserving all semantic search fields and product FAQ relationships.

## Source of truth
Use the uploaded price list as the source of truth for:
- per-vial / per-bottle / per-box / per-bundle display price
- 10-vial kit price where available
- product strength variants

Do not use this update to overwrite descriptive or semantic fields.

## What should be updated
For each existing product / variant document, patch only pricing and variant-management fields such as:
- `unitPriceUSD`
- `kit10PriceUSD`
- `pricingTerms`
- `displayPriceUSD`
- `displayPackPriceUSD`
- `strength`
- `quantityLabel`
- `packageType`
- `unitDisplay`
- `familySlug`
- `variantSlug`
- `hasVariants`
- `variantSlugs`
- `isActive`

## What must NOT be overwritten
Keep existing values for:
- `slug`
- `name`
- `category`
- `subcategory`
- `tags`
- `semanticKeywords`
- `faqTags`
- `relatedGoals`
- `relatedProtocolSlugs`
- `description`
- `scientificResources`
- `mechanismOfAction`
- `stability`
- `quality`
- anything linked to FAQ or semantic discovery

## Recommended document model

### Option A — best practice
Keep one document per purchasable variant, for example:
- `tirzepatide-5mg-vial`
- `tirzepatide-10mg-vial`
- `tirzepatide-15mg-vial`

And also store family-level navigation fields:
- `familySlug = "tirzepatide"`
- `hasVariants = true`
- `variantSlugs = [...]`

This is the safest option because:
- pricing differs by strength
- protocols and cost engines can reference exact variants
- product detail pages can switch variants safely
- semantic content can stay on each variant or inherit from family logic

### Option B — family page + embedded variants
Only do this if your current schema already works that way.
Otherwise do not refactor now.

## Variant behavior
For products with more than one strength, expose them as variants in the UI.
Examples:
- Retatrutide: 10 mg, 20 mg
- Tirzepatide: 5 mg, 10 mg, 15 mg, 30 mg, 60 mg
- Semaglutide: 2 mg, 5 mg, 10 mg
- AOD-9604: 2 mg, 5 mg
- BPC-157: 2 mg, 5 mg, 10 mg, 20 mg
- CJC-1295 without DAC: 2 mg, 5 mg, 10 mg
- Cagrilintide: 5 mg, 10 mg
- GHK-Cu: 50 mg, 100 mg
- Hexarelin: 2 mg, 5 mg
- NAD+: 500 mg, 1000 mg
- PT-141: 5 mg, 10 mg
- Sermorelin: 5 mg, 10 mg
- TB-500: 2 mg, 5 mg, 10 mg
And similar multi-strength products in the patch JSON.

## “Confirm all products are loaded”
This patch file includes every product and ancillary line captured from the uploaded wholesale price list and is intended as the source-of-truth update set for pricing and variants.
This does not confirm your live Firebase database automatically.
Treat confirmation as:
- confirmed in the patch file
- not yet confirmed in the live database unless you compare against a Firebase export

## Activation rule
Set:
- `isActive = true`
for every product / variant present in the update patch only if the matching document already exists or is being created intentionally as part of this patch.

Do not mark missing documents active without creating them.

## Safe migration order
1. Backup current products collection
2. Match current docs by `slug` / `variantSlug` / `familySlug`
3. Patch pricing fields only
4. Add family / variant fields
5. Validate product detail pages
6. Validate protocol cost engine
7. Validate FAQ still resolves per product
8. Validate semantic search still ranks correctly

## UI display recommendation
For each product detail page:
- show the selected variant price (`unitPriceUSD`)
- optionally show “Kit of 10” price (`kit10PriceUSD`)
- if `hasVariants = true`, show a strength selector

## Important caveat
The PDF uses different package types:
- vial
- bottle
- box
- bundle

Do not assume every product is a vial.
Use `packageType` and `unitDisplay` from the patch.

## Suggested integrity checks
Before publishing, validate:
- every variant has a unique slug
- every multi-strength family has correct `variantSlugs`
- every FAQ still points to the intended product / family
- no semantic fields were nulled or overwritten
- prices render in USD correctly
