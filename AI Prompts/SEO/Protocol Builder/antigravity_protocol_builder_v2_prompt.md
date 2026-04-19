
# Antigravity Master Prompt — Protocol Builder Clinical Upgrade

Use the uploaded files:

- med_peptides_protocol_builder_v2_spec.json
- firebase_protocol_builder_v2_changes.md

## Primary Objective

Upgrade the existing Protocol Builder into a clinically intelligent system.

Do NOT rebuild the system.

Extend it safely.

## New Features to Implement

### 1 Patient Context Layer

Add new follow-up inputs:

- Patient Type
- Age Group
- Primary Condition
- Contraindications
- Format Tolerance
- Injection Tolerance

Use these inputs to refine protocol matching.

---

### 2 Protocol Confidence Panel

Create a visible block called:

Protocol Confidence

Display:

- Confidence Score (%)
- Matched Signals
- Conflicting Signals
- Reasoning Summary

Place directly below:

Protocol Recommendation.

---

### 3 Timeline Visualization

Create visual timeline showing:

- Phase
- Duration
- Objective
- Products

Desktop:

Horizontal timeline

Mobile:

Vertical stacked timeline

---

### 4 Protocol Cost Summary

Calculate:

- Estimated Total Cost
- Cost per Week
- Cost per Phase

Use existing product cost logic.

Respect pricing visibility rules.

---

### 5 Alternative Reasoning Layer

For alternatives display:

- Why alternative exists
- Why it was not selected

Example:

Excluded due to injection-only format.

---

### 6 Editing Intelligence

When protocol is edited:

Recalculate:

- Confidence
- Timeline
- Cost

---

## Constraints

Do NOT modify:

- Firebase schema core collections
- Protocol logic
- FAQ logic
- Semantic search logic
- Export PDF logic

Only extend the builder.

---

## Final Objective

Deliver a clinical-grade protocol builder that includes:

- patient-aware matching
- confidence scoring
- timeline visualization
- cost estimation
- intelligent alternative reasoning
