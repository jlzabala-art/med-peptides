
# Antigravity Prompt — PubMed Preview Layer for med-peptides

Use the uploaded files:
- `med_peptides_pubmed_preview_firebase.json`
- `med_peptides_pubmed_preview_firebase.md`

## Objective
Implement Option 1: an internal PubMed preview layer for med-peptides product pages.

Instead of sending users directly to PubMed, show 3 relevant literature results inside the application first.

## What to build

### 1. Keep the current PDP structure
Do not redesign the whole product page.

Keep:
- current product template
- current accordion structure
- current Scientific Resources section

Only enhance the PubMed behavior.

### 2. Replace direct PubMed navigation
When the user clicks:
`Browse PubMed`

Do NOT immediately open an external page.

Instead:
- open an internal literature preview panel
- show top 3 relevant articles
- allow the user to open PubMed only if they choose to

### 3. Build PubMed query semantically
Use current product data:
- `name`
- `semanticKeywords`
- `tags`

Create a query using the product name plus the most relevant semantic terms.

Do not rely on exact keyword only.
Use the strongest terms already available in the current product data.

### 4. Use PubMed API
Use PubMed / NCBI E-utilities to retrieve:
- PMID
- title
- journal
- year
- abstract or summary

### 5. Add Firebase caching
Create and use `pubmed_cache`.

Flow:
- check cache by `productSlug`
- if fresh, use cache
- if missing or expired, call PubMed API
- store normalized results in Firebase
- if API fails and stale cache exists, show stale cache

### 6. UI requirements
Open a right-side panel on desktop.
Use full-screen panel on mobile.

Panel title:
`Scientific Literature`

Each result card must show:
- title
- journal
- year
- short summary

Each result card must include:
- `View Abstract`
- `Open in PubMed`

Do not open PubMed before the user clicks `Open in PubMed`.

### 7. Compatibility rules
Do not break:
- existing Firebase schema
- existing product routes
- current FAQ system
- current semantic search logic
- current accordion structure

### 8. Output expected
Generate:
- PubMed API service
- Firebase cache service
- preview panel component
- article cards
- integration into Scientific Resources block
- graceful loading and fallback states

The final result must feel like a premium scientific preview experience inside med-peptides.
