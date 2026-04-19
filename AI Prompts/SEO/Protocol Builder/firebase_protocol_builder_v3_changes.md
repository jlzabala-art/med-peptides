
# Firebase Extension — Protocol Builder V3

## Purpose
Add guided condition selection and deterministic protocol logic.

## Extend protocol_builder_sessions

Add fields:

- primaryConditionSelected
- contraindicationsSelected
- mappedGoals
- appliedExclusions
- ignoredContraindications
- confidenceScore
- timeline
- estimatedCost

## Optional Cache Blocks

- protocol_confidence_data
- protocol_timeline_cache
- protocol_cost_cache

## Critical Rules

Do NOT modify:

- products
- protocols
- faq
- semantic search
- pricing logic
- PDF exports
