
# Antigravity Prompt — Product Page Layout Reorganization (Med‑Peptides)

## Objective
Reorganize the peptide product page layout to improve usability, clarity,
conversion visibility, and scientific credibility — while preserving all
existing Firebase data structures, semantic relationships, and routing.

This change must be UI/layout only.
No backend restructuring is allowed.

---

## Desktop Layout Rules

Reorder the right column content into the following strict hierarchy:

1. Category Badge  
2. Product Name  
3. Product Tags  
4. Research Acquisition Price  
5. Add Single Vial Button  

The price and CTA must be clearly visible without scrolling.

---

## Scientific Facts Grid

Display the four scientific data blocks in a strict **2×2 grid**.

Never render them as 3+1 layout.

Required cards:

- Analytical Purity  
- Verification (HPLC & MS)  
- Storage (Dry)  
- Storage (Liquid)

Maintain equal height and spacing.

---

## Scientific Literature Section

Move the Scientific Literature preview block directly below
the scientific facts grid.

Display:

- Maximum 3 preview articles  
- Title  
- Journal  
- Year  

Include:

Primary Button:

View All Articles

This section must NOT be hidden inside an accordion.

---

## Scientific Details Accordion

Keep accordion sections but move them below literature preview.

Accordion sections:

- Mechanism of Action  
- Stability Note  
- Quality Certification  
- Institutional Governance  

Maintain collapsible behavior.

---

## Related Peptides Section

Move related peptides above FAQ.

Display:

4–6 peptide cards.

Each card must include:

- Image  
- Name  
- Key tags  
- Navigation link  

---

## FAQ Section

Limit visible FAQ items to **top 3 only**.

Add button:

View All FAQs

Do not show large FAQ lists by default.

---

## Comparison Table

Remove comparison table from default product view.

Move comparison functionality to:

Dedicated Compare Page

Access via:

Compare Similar Peptides button.

---

## Mobile Layout Rules

Reorder mobile content vertically:

1 Image  
2 Product Name  
3 Price  
4 Add Button  
5 Scientific Facts  
6 Literature Preview  
7 Accordion Details  
8 Related Peptides  
9 FAQ  

Price must appear immediately after product name.

---

## UX Goals

Improve:

- Visual hierarchy  
- Conversion clarity  
- Scientific authority  
- Mobile usability  
- Scroll efficiency  

Reduce:

- Cognitive load  
- Redundant sections  
- Layout imbalance  

---

## Constraints (Critical)

Do NOT modify:

- Firebase collections  
- Slug routing  
- Semantic relationships  
- PubMed integration  
- FAQ mapping  
- Protocol linking  
- Existing data schema  

This must be a layout-only refactor.

---

## Expected Result

Deliver:

- Cleaner visual hierarchy  
- Faster comprehension  
- Better price visibility  
- Strong scientific positioning  
- Consistent layout across devices
