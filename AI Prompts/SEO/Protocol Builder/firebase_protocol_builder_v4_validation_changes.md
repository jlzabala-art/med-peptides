
# Firebase Extension — Protocol Builder V4 Validation Layer

## Objective
Add a validation phase after protocol generation, before final export or Start Request.

## Flow
After the user clicks `Generate Protocol`, route to:
- `/protocol-builder/validation`

This validation step should use the generated protocol output and add clinical checks before approval.

## Extend `protocol_builder_sessions`
Add optional fields:
- `validationStatus`
- `hardConflictCount`
- `softConflictCount`
- `appliedContraindications`
- `ignoredContraindications`
- `warnings`
- `recommendedFixes`
- `finalRecommendation`
- `approvedAt`
- `revisedAfterValidation`

## Optional computed structures
You may store:
- `protocol_validation_cache`
- `protocol_warning_cache`

These are computed outputs only.

## Validation rules
Run checks for:
- format compatibility
- contraindication alignment
- complexity alignment
- duration alignment
- cost alignment

## Status values
- `pass`
- `warning`
- `blocked`

## Important
Do NOT change:
- products
- protocols
- faq
- pricing engine
- export logic
- semantic search

This phase must extend the builder safely.
