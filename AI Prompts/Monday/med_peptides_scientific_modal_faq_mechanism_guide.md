
# Firebase guide — FAQ modal + mechanism of action + semantic search enrichment

## Objective
Add scientific FAQ modal content and mechanism-of-action content for the peptide families currently in scope, while preserving the existing semantic and FAQ work already implemented.

## Core principle
This is an additive scientific content patch.
Do not replace existing semantic keywords, FAQ mappings, or product descriptions.
Merge new fields safely.

## Recommended fields to add at family or inherited-variant level
- `mechanismOfAction.summary`
- `mechanismOfAction.researchFocus`
- `mechanismOfAction.semanticAdditions`
- `faqModalItems`
- `scientificModalEnabled = true`
- `faqModalEnabled = true`

## Semantic search rule
Use:
- current `semanticKeywords`
- plus `mechanismOfAction.semanticAdditions`
- plus FAQ question / answer text
- plus existing tags / faqTags / relatedGoals

Do not remove or re-rank existing semantic logic destructively.

## FAQ modal recommendation
Each peptide family should expose concise FAQ modal content such as:
- scientific positioning
- why it appears in certain pathways or protocols
- strength / variant logic
- how users should continue to PDP
- literature-access logic

## Mechanism of action recommendation
Keep MOA concise and research-oriented.
Avoid overclaiming.
Use it primarily for:
- modal display
- PDP scientific summary
- semantic enrichment
- pathway-level discovery relevance

## Safe merge order
1. Backup current family / variant docs
2. Match by `familySlug`
3. Add mechanism-of-action block
4. Add FAQ modal items
5. Append semantic additions
6. Validate FAQ modal
7. Validate scientific literature modal
8. Validate pathway list search and protocol search

## Important
Do not delete:
- product FAQ relationships
- PubMed references
- variant mapping
- pricing fields
- protocol builder references
