
# Antigravity Prompt — Protocol Result Mobile Refinement + Economic Logic + Request Flow

PROJECT: med-peptides  
MODULE: Clinical Protocol Builder  
TARGET: Mobile result screen + economic breakdown + protocol request flow  

IMPORTANT:
Do NOT rebuild the Protocol Builder.
Do NOT change core Firebase collections.
Do NOT break current semantic logic, pricing logic, FAQ logic, or export logic.

This is a refinement and extension of the existing builder.

--------------------------------------------------
PRIMARY OBJECTIVES
--------------------------------------------------

1. Fix the mobile protocol result experience
2. Add clickable product detail links
3. Add full economic breakdown with vial quantities
4. Account for opened vial usability / stability
5. Add the ability to request the generated protocol
6. Keep bundle compatibility optional and non-blocking

--------------------------------------------------
PART 1 — FIX MOBILE RESULT SCREEN
--------------------------------------------------

CURRENT PROBLEM:

On mobile, the generated protocol renders like an overlay
instead of a full new screen.

REQUIRED FIX:

When user clicks:

Generate Protocol

Navigate to:

/protocol-builder/result

Must be:

- full-screen page
- independent scroll
- proper header
- back button
- correct stacking context
- no overlap from previous screen
- correct z-index behavior

This must NOT be:

- modal
- overlay
- drawer
- floating panel

Desktop layout can remain unchanged.

--------------------------------------------------
PART 2 — PRODUCT DETAIL LINKS
--------------------------------------------------

Each product shown inside the generated protocol must be clickable.

Add links:

/product/:slug

For:

- product names
- product cards
- timeline product entries
- cost breakdown entries

Add optional label:

View Product Details

--------------------------------------------------
PART 3 — ECONOMIC BREAKDOWN MODAL
--------------------------------------------------

Add button:

View Cost Breakdown

Behavior:

Desktop → Modal  
Mobile → Bottom Sheet / Full-screen Sheet  

Must include:

For each product:

- product name
- presentation
- dosage
- number of vials
- estimated duration
- unit cost
- subtotal

Also show:

- cost per phase
- total cost
- cost per week

--------------------------------------------------
PART 4 — OPENED VIAL LOGIC
--------------------------------------------------

If product includes:

- opened vial stability
- reconstitution duration

Then:

Adjust vial calculations accordingly.

Example:

If:
1 vial covers 6 weeks  
but open-use window = 28 days  
protocol = 8 weeks  

Result:

Recommend 2 vials

Display explanation:

"Additional vial required due to opened-vial usability window."

If no stability rule exists:

Display:

"No opened-vial stability rule available."

--------------------------------------------------
PART 5 — REQUEST THIS PROTOCOL
--------------------------------------------------

Add CTA:

Request This Protocol

Behavior:

Open prefilled request flow including:

- primary condition
- contraindications
- selected products
- protocol phases
- vial quantities
- estimated total cost
- clinician notes

This must integrate with existing request flow safely.

--------------------------------------------------
PART 6 — BUNDLE COMPATIBILITY
--------------------------------------------------

Do NOT convert protocols into bundles automatically.

Optional:

Show:

Related Existing Bundle  
or  
Closest Ready-Made Option  

Reference only.

Protocol remains primary request object.

--------------------------------------------------
PART 7 — MOBILE UI ORDER
--------------------------------------------------

Mobile layout order:

1 Header  
2 Protocol Title  
3 Confidence Panel  
4 Timeline  
5 Products  
6 Cost Summary  
7 View Cost Breakdown  
8 Request This Protocol  
9 Alternatives  
10 FAQ Support  

--------------------------------------------------
PART 8 — DO NOT BREAK
--------------------------------------------------

Do NOT break:

- Firebase schema
- protocol logic
- semantic search
- FAQ system
- pricing engine
- PDF export
- Start Request integration

Only extend existing logic safely.

--------------------------------------------------
FINAL EXPECTATION
--------------------------------------------------

The protocol result must behave as:

- real mobile screen
- clinically readable
- economically transparent
- actionable
- request-ready
