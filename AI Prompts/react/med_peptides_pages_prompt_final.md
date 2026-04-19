
# Antigravity Final Prompt — Med-Peptides Safe Multipage Refactor

Use the uploaded files:
- `med_peptides_pages_structure_final.json`
- `med_peptides_pages_spec_final.md`

## Mission
Upgrade med-peptides into a safe multipage architecture with real URLs, reusable templates, and route-level loading.

This must be done without breaking the current app.

## Critical instructions
1. Do NOT refactor aggressively.
2. Do NOT replace working routes all at once.
3. Do NOT rewrite Firebase schema.
4. Do NOT rename `slug`, `semanticKeywords`, `tags`, `visibility`, or other preserved fields.
5. Do NOT break:
   - semantic search
   - FAQ relationships
   - protocol pages
   - PubMed preview integration
   - current product URLs

## Execution mode
Use progressive enhancement only.

### Phase 1 — create templates and layouts
Generate:
- HomeTemplate
- ProductTemplate
- CollectionTemplate
- ProtocolTemplate
- FAQTemplate
- SearchTemplate
- ContactTemplate
- CompareTemplate
- MainLayout
- ProfessionalLayout

Do not switch routing yet.

### Phase 2 — connect core routes safely
Connect one route at a time:
1. `/product/:slug`
2. `/collection/:slug`
3. `/protocol/:slug`

For each route:
- validate slug loading
- validate refresh behavior
- validate fallback behavior
- validate no runtime crash

Proceed only if the previous route works.

### Phase 3 — connect secondary routes
Connect:
- `/faq`
- `/faq/:topic`
- `/search`
- `/contact`
- `/compare/:slug1/:slug2`

### Routing requirements
- Real page-level routes
- Browser refresh support
- Lazy loading
- Route-level fetching
- No monolithic SPA behavior

### Data rules
Read from current collections only:
- products
- faq
- product_faq_mapping
- protocols
- protocol_faq_mapping
- discovery_engine

Do not restructure collections.

### Performance rules
- No global catalog preload
- Fetch only current route data
- Cache per route
- Cache TTL = 300 seconds

### Error handling
- Missing product → render 404
- Missing protocol → render 404
- Missing collection → render empty state
- Missing FAQ topic → render empty state
- Invalid compare slug → redirect to `/product/:slug1`

## Final result
Deliver a safe multipage architecture that:
- improves speed
- keeps Firebase compatibility
- preserves semantic search
- preserves FAQ logic
- preserves protocols and scientific literature
- avoids runtime regressions
