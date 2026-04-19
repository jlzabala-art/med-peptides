
# Med-Peptides Complete Discovery System — Antigravity Master Prompt

Use the uploaded file `med_peptides_complete_discovery_system.json` as the full source of truth for building the complete discovery layer for med-peptides.

## Objective

Build the entire peptide discovery system in one implementation, not in phases.

This system must integrate:
- advanced FAQ
- related peptides engine
- compare peptides blocks
- semantic FAQ search
- FAQ on peptide product pages
- peptide suggestions below FAQ answers
- hybrid visibility for public and professional users
- SEO structure for FAQ and peptide discovery

This should feel like a premium research / medical discovery platform, not a basic support page.

## Data Source

Use the JSON file as the source for:
- FAQ categories
- FAQ documents
- direct FAQ ↔ peptide mappings
- semantic FAQ ↔ peptide mappings
- FAQ landing configuration
- related peptide engine
- compare peptide blocks
- discovery logic and limits
- SEO metadata

Collections to build or import:
- peptide_faq
- faq_categories
- faq_peptide_mapping
- faq_landing_config
- peptide_related_engine
- peptide_compare_blocks
- discovery_config

## What to Build

### 1. FAQ & Discovery Landing Page
Build a single landing page called:
Peptide FAQ & Discovery

Include:
- search bar
- category filter or category chips
- featured questions
- FAQ accordion
- related peptide suggestions
- compare peptide blocks

Design:
- premium
- clean
- mobile-first
- medical / research oriented

### 2. Advanced Semantic Search
Search across:
- FAQ question
- shortAnswer
- answer
- tags
- seoKeywords
- relatedCatalogKeywords

Search behavior:
1. direct peptide FAQ matches
2. same family matches
3. shared goal-tag matches
4. SEO/keyword overlap
5. global questions

Use deterministic matching first.
Use AI only to:
- summarize
- explain why a result matched
- rank already filtered results

### 3. FAQ on Every Peptide Product Page
On each peptide PDP:
- show 3 to 5 relevant FAQs below the main product content
- use direct mappings first
- then family matches
- then semantic matches
- respect public/professional visibility

Section title:
Frequently Asked Questions

### 4. Related Peptides on Every PDP
On each peptide PDP:
- show 3 to 6 related peptides
- use peptide_related_engine first
- fallback to same family or shared goals
- include a “Compare related peptides” CTA when compare candidates exist

Section titles:
Related Peptides
Compare Similar Peptides

### 5. FAQ Answers Must Suggest Peptides
When a user opens an FAQ answer:
- show related peptide cards below the answer
- use relatedPeptideNames first
- then family / goals / semantic overlap
- show 3 to 6 peptide cards
- each peptide card links to the PDP

### 6. Compare Peptides Blocks
Use peptide_compare_blocks to build:
- compare modules on PDPs
- compare modules on FAQ pages
- “Users also compare” style blocks

Each block should:
- show base peptide
- show compare candidates
- explain comparison dimensions: family, goals, format, visibility
- link to relevant PDPs

### 7. Hybrid Visibility
Respect visibility rules:
- public users see only public FAQ items and public peptide suggestions
- professional users see both public and professional FAQ items and suggestions

Do not expose professional-only peptide relationships to public users.

### 8. SEO Structure
Use:
- seoTitle
- seoDescription
- seoKeywords

Make the FAQ system SEO-friendly through:
- clean rendering
- strong internal links to peptide PDPs
- category-based discoverability
- structured accordion content
- searchable FAQ content

### 9. UI Requirements
Build:
- top search input
- category chips / tabs
- featured questions row
- accordion FAQ list
- related peptide row beneath relevant FAQ answers
- FAQ block on each PDP
- related peptide row on each PDP
- compare block on each PDP when data exists

### 10. Matching Logic
Use this order:
1. direct faq mappings
2. peptide_related_engine
3. same family
4. shared goal tags
5. seo keyword overlap
6. relatedCatalogKeywords overlap
7. fallback by category

Never rely on AI alone for peptide matching.

## Final Goal

Create the strongest possible all-in-one discovery system for med-peptides so that it:
- improves SEO
- increases peptide discovery
- enriches every peptide PDP
- helps users compare similar peptides
- supports conversion
- supports both public and professional user journeys
- works as one integrated system from the start
