
# Firebase changes for PubMed Preview Layer

## Objective
Add an internal PubMed preview system to med-peptides product pages, keeping users inside the app and avoiding immediate external navigation.

## Reuse existing collections
Do not modify or remove:
- `products`
- `faq`
- `product_faq_mapping`
- `protocols`
- `protocol_faq_mapping`
- `discovery_engine`

This PubMed preview layer must be additive only.

## New collection: `pubmed_cache`
Purpose:
Store cached scientific literature previews for product pages.

### Suggested fields
- `productSlug`
- `queryUsed`
- `articles`
  - `pmid`
  - `title`
  - `journal`
  - `year`
  - `summary`
  - `abstract`
  - `pubmedUrl`
- `source`
- `lastUpdated`
- `expiresAt`
- `status`

### Notes
- One document per product slug is enough initially
- Refresh after 7 days
- If API fails, stale cache may still be shown

## Data source strategy
Build PubMed queries using existing product fields:
- `name`
- `semanticKeywords`
- `tags`

Do not rename these fields.

## Performance rules
- Do not fetch full product catalogs to build PubMed queries
- Build the query only for the current product page
- Read from `pubmed_cache` first
- Call PubMed API only if cache is missing or expired

## UI compatibility
The preview must stay inside the existing Product Detail Page structure:
- keep Scientific Information accordion
- keep Scientific Resources section
- replace direct external PubMed action with internal preview panel

## Recommended indexes
Create indexes for:
- `pubmed_cache.productSlug`
- `pubmed_cache.expiresAt`
- `pubmed_cache.lastUpdated`

## Critical rule
Do not break:
- current page URLs
- current semantic search
- current FAQ blocks
- current Firebase schema outside the additive cache collection
