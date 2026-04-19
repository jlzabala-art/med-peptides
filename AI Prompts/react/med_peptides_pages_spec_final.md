
# Med-Peptides Multipage Architecture — Safe Final Spec

## Objective
Refactor med-peptides into a true multipage architecture with distinct URLs, while preserving all working Firebase data, semantic search, FAQ logic, protocol logic, and scientific literature integrations.

## Core rules
- Do not turn the site into a one-page scrolling experience
- Do not break existing slugs
- Do not break existing Firebase collections
- Do not remove semantic search
- Do not remove FAQ logic
- Do not remove protocol or PubMed logic

## Required route structure
- `/`
- `/product/:slug`
- `/collection/:slug`
- `/protocol/:slug`
- `/faq`
- `/faq/:topic`
- `/contact`
- `/search`
- `/compare/:slug1/:slug2`

## Safe implementation strategy
### Phase 1
Create all templates and layouts without replacing current routes.

### Phase 2
Connect templates to routes gradually:
1. `/product/:slug`
2. `/collection/:slug`
3. `/protocol/:slug`

Validate each route before proceeding.

### Phase 3
Connect:
- `/faq`
- `/faq/:topic`
- `/search`
- `/compare/:slug1/:slug2`
- `/contact`

## Template contract
Every page must use a template with clearly defined props and fallback handling.

## Data loading rules
- Load only data needed for the current route
- No full catalog preload
- Enable per-route caching
- Use lazy loading for page bundles

## Error handling
- Missing product → 404
- Missing protocol → 404
- Missing collection → empty collection state
- Missing FAQ topic → empty topic state
- Invalid compare slug → redirect to first valid product

## Performance rules
- Route-based code splitting
- Per-page data fetching
- Cache TTL: 300 seconds
- No global initial data load

## Deliverable
A safe, route-based, multipage med-peptides architecture with reusable templates and no breaking changes.
