
# Antigravity Prompt — Protocol Builder V4 Validation Phase

Use the uploaded files:
- `med_peptides_protocol_builder_v4_validation_spec.json`
- `firebase_protocol_builder_v4_validation_changes.md`

Extend the current Protocol Builder. Do NOT rebuild from scratch.

## Objective
Build the second phase of the Protocol Builder:
a Protocol Validation Layer that appears after the user clicks `Generate Protocol`.

This phase must help doctors validate the generated protocol before:
- approving it
- exporting it
- sending it to Start Request

## Required behavior

### 1. Routing / flow
When the user clicks:
`Generate Protocol`

the next step must be:

`/protocol-builder/validation`

This should open a dedicated validation page or step, not a modal.

### 2. Validation page sections
Build these sections:
- Validation Summary
- Constraint Check Panel
- Clinical Sanity Checks
- Format Conflict Panel
- Complexity Check Panel
- Cost and Duration Check
- Final Protocol Preview
- Actions Row

### 3. Validation logic
Run deterministic checks for:
- format compatibility
- contraindication alignment
- complexity alignment
- duration alignment
- cost alignment

### 4. Conflict model
Support:
- hard conflicts
- soft conflicts

Examples of hard conflicts:
- injectable-only protocol selected when oral-only was chosen
- blend included when avoid-blends was selected
- advanced protocol selected when simple-only was required

Examples of soft conflicts:
- total cost high for budget-sensitive case
- too many products for low-adherence / simple case

### 5. Status output
Show one of:
- Pass
- Warning
- Blocked

And display:
- applied contraindications
- ignored contraindications
- warnings
- recommended fixes
- final recommendation

### 6. Actions
Allow:
- Approve Protocol
- Revise Protocol
- Export PDF
- Send to Start Request

If validationStatus = blocked:
- disable Approve Protocol
- encourage Revise Protocol

### 7. Compatibility
Do NOT break:
- Firebase schema core collections
- protocol builder logic
- FAQ logic
- pricing engine
- PDF exports
- semantic search
- Start Request integration

Only extend the builder with a safe validation phase.

## Final goal
Deliver a clinically useful validation step so that the protocol builder behaves like:

Generate Protocol
→ Validate Protocol
→ Approve / Revise
→ Export / Submit
