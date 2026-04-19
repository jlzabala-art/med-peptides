
# Protocol Builder UI Reorganization — Implementation Guide

## Project
med-peptides  
Module: Protocol Builder Result Screen  
Goal: Improve clinical usability, clarity, and workflow efficiency across laptop and mobile.

---

# Primary UI Changes

## 1. Remove "Browse Supplies"

Remove completely:

Browse Supplies

Reason:
This action does not belong in the protocol validation workflow.

Users should access supplies only via:

- Main navigation → Catalog

---

## 2. Convert PubMed Section to Right-Side Panel

Current Issue:
PubMed content consumes excessive vertical space.

### New Behavior

Button:

View Scientific Evidence

### Laptop / Desktop

- Right-side slide panel
- Width: 420–520px
- Scrollable
- Overlay layout
- Close button visible

### Mobile

- Full-screen modal
- Scrollable
- Close button at top-right

Important:
PubMed must NOT appear inline anymore.

---

## 3. Update Primary Button Label

Change:

Request This Protocol

To:

Add Protocol to Cart

Optional:

Add Protocol to Cart & Review

Purpose:
Clarify that items will automatically be added to the cart.

---

## 4. Add Cost Breakdown Modal

Add button:

View Cost Breakdown

Click opens modal showing:

Example:

Phase 1  
Retatrutide 10mg × 2 vials  

Phase 2  
Semaglutide 5mg × 2 vials  

Phase 3  
Tirzepatide 15mg × 2 vials  

Total Vials: X  
Estimated Cost: $XXX  

Important:
Use existing computed values.  
Do NOT recalculate.

---

## 5. Restructure Right Panel Layout

Correct section order:

1. Clinical Confidence Panel  
2. Protocol Timeline  
3. Cost Architecture  
4. Clinical Reasoning  

PubMed removed from inline layout.

---

## 6. Add Protocol Status Display

Show:

Protocol Status: VALIDATED  
Confidence: 92%

Place near top of results.

---

## 7. Add Auto-Save Indicator

Display:

Auto-saved • just now

Update timestamp dynamically.

Purpose:
Increase clinician confidence in persistence.

---

## 8. Mobile Accordion Layout

On mobile only:

Convert sections to collapsible blocks:

▼ Protocol Timeline  
▼ Cost Summary  
▼ Clinical Reasoning  
▼ Scientific Evidence  

Default:

Timeline → open  
Others → collapsed

---

## 9. Button Group Reorganization

Correct button row:

[ Add Protocol to Cart ]  
[ Export PDF ]  
[ View Scientific Evidence ]

Remove:

Browse Supplies

---

## 10. Improve Visual Hierarchy

Ensure:

- consistent spacing
- balanced layout
- readable typography
- no oversized evidence sections
- correct desktop proportions
- improved scanning behavior

---

# Optional High-Value Enhancements

Highly recommended additions:

## Save Protocol Button

Allows persistent storage in protocol history.

## Duplicate Protocol Button

Allows fast protocol variations.

## Protocol ID Display

Example:

Protocol ID: MP-2026-0322-001

Useful for:

- traceability
- support
- auditing
- version tracking

---

# Expected Final Result

After implementation:

- PubMed no longer dominates the layout
- Buttons reflect real workflow
- Cost details become transparent
- Laptop interface becomes cleaner
- Mobile navigation improves significantly
- Protocol workflow becomes clinically intuitive
- System feels professional and production-ready

