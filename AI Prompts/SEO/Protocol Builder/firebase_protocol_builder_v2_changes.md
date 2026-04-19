
# Firebase Extensions — Protocol Builder V2

## Objective
Extend the current protocol builder to support clinical-grade decision logic.

## New optional fields

### protocol_builder_sessions
Add:

- patientType
- ageGroup
- primaryCondition
- contraindications
- formatTolerance
- injectionTolerance
- confidenceScore
- calculatedCost
- calculatedTimeline

## New computed structures

### protocol_confidence_data
Store:

- confidenceScore
- matchedSignals
- conflictingSignals
- reasoningSummary

### protocol_timeline_cache
Store:

- phaseName
- phaseDuration
- phaseObjective
- phaseProducts

### protocol_cost_cache
Store:

- totalEstimatedCost
- costPerWeek
- costPerPhase

## Important

Do NOT modify:

- products
- protocols
- faq
- semantic search logic
- pricing rules

Only extend computed outputs.
- Verify panel closes on ESC and clicking outside.

---

# Phase 12: Rendering & Scroll Fixes

Address the critical `ReferenceError: useState is not defined` and the scroll-locking bug on the Product Detail Page.

## Proposed Changes

### [Component Name] Rendering Fixes
#### [MODIFY] TBD (Based on search results)
- Find the component using `useState` without an import and fix it.

### [Component Name] Scroll Management
#### [MODIFY] [ProductDetail.jsx](file:///Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/templates/ProductDetail.jsx)
- Audit `useEffect` hooks for `overflow: hidden` cleanup.
- Ensure the body scroll is restored when any modal (FAQ, PubMed, Compare) is closed.
- Check for CSS conflicts with `sticky` positioning and `height: 100vh`.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
- **Scenario 1**: Navigation to Product Detail Page.
  - Confirm NO rendering errors in console.
  - Confirm page is scrollable.
- **Scenario 2**: Open/Close FAQ Modal.
  - Confirm scroll locks when open.
  - Confirm scroll UNLOCKS when closed (via X, ESC, or Backdrop).
- **Scenario 3**: Open/Close PubMed Panel.
  - Confirm scroll locks when open.
  - Confirm scroll UNLOCKS when closed.
