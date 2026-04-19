
# Firebase changes required — full catalog protocols, pricing engine, semantic search, and FAQ preservation

## 1. Preserve existing collections
Do **not** remove or simplify these existing collections and semantics:
- `products`
- `faq`
- `product_faq_mapping`
- `discovery_engine`
- all existing semantic search tags, FAQ mappings, related-product logic, and public/professional visibility rules

The protocol system must sit **on top of** the current discovery layer, not replace it.

## 2. Patch the full `products` catalog
Extend the existing product documents with:
- `unitCostUSD`
- `kitCostUSD`
- `packaging`
- `unitType`
- `pricingTerms`
- `baseSlug`
- `isProtocolEligible`
- `protocolTags`
- `relatedProtocolSlugs`

Keep existing:
- `slug`
- `name`
- `category`
- `subcategory`
- `tags`
- `semanticKeywords`
- `visibility`
- FAQ / discovery-related fields

Do not lose semantic search quality.

## 3. Create new collection: `protocols`
Fields:
- `protocolSlug`
- `name`
- `goalCategory`
- `relatedGoals`
- `searchTags`
- `faqTags`
- `pdfEnabled`
- `priceVisibility`
- `phases`
- `baseCostUSD`
- `phaseCosts`
- `pricingExample`
- `suggestedCta`
- `visibility`
- `active`

Each phase includes:
- `phase`
- `weeks`
- `items`
  - `productSlug`
  - `qty`

## 4. Create new collection: `protocol_pricing_config`
Fields:
- `markupPctDefault`
- `bundleDiscountPctDefault`
- `currency`
- `shippingIncluded`
- `taxIncluded`
- `allowDurationMultipliers`
- `durationOptions`
- `priceVisibility`

## 5. Create new collection: `protocol_pdf_templates`
Optional, for configurable PDF rendering without price.

## 6. Create new collection: `protocol_faq_mapping`
Fields:
- `protocolSlug`
- `faqId`
- `matchType`
- `priority`

## 7. Search preservation
Extend deterministic search to include:
- protocol name
- protocol search tags
- protocol related goals
- FAQ tags linked to protocol
- products inside protocols

Ranking:
1. direct product match
2. direct protocol match
3. FAQ match
4. semantic overlap
5. fallback by goalCategory

## 8. Visibility rules
Public users:
- may see protocol structure
- may download protocol PDFs
- must not see professional-only pricing

Professional users:
- can see protocol pricing
- can access cost-derived protocol price logic

## 9. Recommended indexes
Add indexes for:
- `products.slug`
- `products.baseSlug`
- `products.visibility`
- `protocols.protocolSlug`
- `protocols.goalCategory`
- `protocols.searchTags`
- `protocols.visibility`
- `protocol_faq_mapping.protocolSlug`

## 10. Migration order
1. Patch full `products` catalog with cost data
2. Create `protocols`
3. Create `protocol_pricing_config`
4. Create `protocol_faq_mapping`
5. Extend search layer
6. Add protocol blocks to PDP / collection pages
7. Add PDF generation

## 11. Critical rule
The protocol layer must reuse:
- existing product semantics
- existing FAQ logic
- existing related products engine
- existing visibility rules
