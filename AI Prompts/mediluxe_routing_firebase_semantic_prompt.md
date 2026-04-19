
# Antigravity Master Prompt — Routing + Firebase + Semantic Engine

Use the uploaded file `mediluxe_routing_firebase_semantic_master.md` as the full implementation blueprint.

Build the system exactly from that specification.

## Main Objective

Create a production-ready Mediluxe platform using:
- React
- react-router-dom v6+
- Firebase Auth
- Firestore
- semantic search
- FAQ integration
- Start Request flow
- protected doctor dashboard

## Instructions

1. Use the MD file as the source of truth for:
- route architecture
- layout system
- protected route logic
- Firestore collections
- service layer
- semantic search behavior
- Start Request integration
- PDP enrichment
- FAQ behavior
- compare pages
- UX requirements
- validation checklist

2. Build the router first
Implement:
- BrowserRouter
- nested Routes
- PublicLayout
- DashboardLayout
- ProtectedRoute
- lazy-loaded pages
- 404 page

3. Connect Firebase second
Create a structured Firebase layer for:
- products
- faq
- product_faq_mapping
- discovery_engine
- requests
- users

4. Connect routes to real data
Implement:
- peptide PDP fetch by slug
- FAQ fetch by topic/category
- search results from products + FAQ
- request submission to Firestore

5. Implement semantic search
Use deterministic matching first across:
- product name
- slug
- category
- subcategory
- tags
- semanticKeywords
- FAQ question
- FAQ answer
- FAQ tags
- related keywords

Products first, FAQs second, protocols third.

Use AI only for:
- summaries
- match explanations
- ranking refinement after filtering

6. Implement Start Request
Build:
- manual prescription mode
- assisted mode
- live matching against products collection
- fulfillment path detection
- request saving in Firestore

7. Implement PDP enrichment
On peptide pages show:
- related FAQs
- related peptides
- compare peptides block

8. Respect hybrid visibility
- public users see only public content
- professional users see public + professional content
- protected routes require professional or admin role

## Output Required

Generate:
- router files
- layouts
- protected route component
- Firebase config and services
- example pages
- semantic search logic
- request flow logic
- connected PDP and FAQ pages

Do not build a toy example.
Do not simplify the architecture.
Think like a senior SaaS engineer building a scalable production-ready platform.
