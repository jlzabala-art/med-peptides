
# Antigravity Prompt — Add FAQ modal content + Mechanism of Action + semantic enrichment

Use the uploaded files:
- `med_peptides_scientific_modal_faq_mechanism_patch.json`
- `med_peptides_scientific_modal_faq_mechanism_guide.md`

## Mission
Add scientific FAQ modal data and mechanism-of-action content for the peptide families currently in scope, and make this content available to semantic search.

## Critical rule
This is a safe additive patch.

Do NOT overwrite:
- existing semanticKeywords
- existing FAQ mappings
- existing product descriptions
- existing PubMed data
- existing variant logic
- existing pricing
- protocol builder references

## What to do
1. Add `mechanismOfAction` scientific summaries per family
2. Add concise `faqModalItems` per family
3. Add `semanticAdditions` to search index inputs
4. Keep the content scientific-first and minimally commercial
5. Reuse this content in:
   - FAQ modal
   - scientific list rows
   - PDP scientific blocks
   - semantic discovery

## Semantic requirement
Search should be able to find peptides not only by current tags, but also by:
- mechanism language
- FAQ language
- family-level scientific terminology

## Expected result
After implementation:
- each peptide family has richer FAQ modal content
- mechanism of action is available as structured data
- semantic discovery improves
- no previously built FAQ or semantic work is lost
