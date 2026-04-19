
# Antigravity master prompt — full catalog protocols, pricing, Firebase, semantic search, and FAQ preservation

Use the uploaded JSON file `med_peptides_protocols_seed_full_catalog.json` as the source of truth for:
- full catalog product cost patch data
- protocol definitions
- protocol pricing examples
- semantic search tags
- FAQ-related protocol tags

Use the uploaded MD file `firebase_protocols_changes_full_catalog.md` as the Firebase architecture and migration blueprint.

## Main objective
Upgrade the current med-peptides discovery system so it supports advanced clinical protocols with dynamic pricing across the full catalog, while preserving the existing semantic search and FAQ system.

## Rules
1. Do NOT remove or degrade the current:
- products collection
- faq collection
- product_faq_mapping
- discovery_engine
- semantic search behavior
- FAQ to product and product to FAQ connections

2. Add a protocol layer on top of the existing discovery system.

3. Use product unit costs from the uploaded full catalog dataset to calculate protocol prices dynamically.

## What to implement

### Firebase updates
Patch existing full product catalog with:
- unitCostUSD
- kitCostUSD
- packaging
- unitType
- pricingTerms
- baseSlug
- isProtocolEligible
- protocolTags
- relatedProtocolSlugs

Create:
- protocols
- protocol_pricing_config
- protocol_faq_mapping
- protocol_pdf_templates (optional)

### Protocol pages
Create:
- protocol listing page
- protocol detail page
- protocol cards
- phase breakdown
- related products
- related FAQ
- Download PDF button

### Pricing engine
Use:
- product unitCostUSD
- item quantity per phase
- protocol phases
- markup percentage
- bundle discount percentage

Formula:
base cost = sum(unit cost × quantity)
sell price = base cost × markup
final price = sell price minus bundle discount

Return:
- total protocol price
- price per phase
- support future duration multipliers
- respect professional-only visibility for prices

### PDF generation
Protocol PDFs must:
- include protocol name
- include objective
- include phases
- include included products
- include clinical notes / disclaimer
- exclude pricing
- be downloadable by doctors as reference documents for patients

### Preserve semantic search
Extend search across:
- product name
- product tags
- product semantic keywords
- FAQ question / answer / tags
- protocol name
- protocol searchTags
- protocol relatedGoals
- protocol faqTags

Search priority:
1. direct product match
2. direct protocol match
3. FAQ match
4. semantic overlap

### Preserve FAQ quality
For each protocol:
- show 3 to 5 relevant FAQs
- use faq tags, related goals, and protocol_faq_mapping
- preserve existing FAQ UX and search quality

### Product page enrichment
On each peptide product page:
- show Included in Protocols
- show Related Protocols
- preserve existing FAQ block
- preserve related peptide logic

### Collection page enrichment
On collection pages:
- add Recommended Protocols above the product grid
- preserve existing product listing and semantic search

## Constraints
- do not break current routes
- do not remove current discovery logic
- do not remove current FAQ system
- do not replace product pages with protocol pages
- protocols must complement the existing catalog, not replace it
