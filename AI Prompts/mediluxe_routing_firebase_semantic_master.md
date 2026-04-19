
# Mediluxe Routing + Firebase + Semantic Engine Master Spec

## Objective

Build a production-ready application architecture for Mediluxe using:

- React
- react-router-dom v6+
- Firebase Auth
- Firestore
- semantic search
- FAQ / peptide discovery
- Start Request flow
- hybrid visibility (public / professional)

This file is the full implementation specification.

---

## 1. Core Architecture

### Stack
- React
- TypeScript
- react-router-dom v6+
- Firebase Auth
- Firestore
- component-based architecture
- lazy-loaded pages

### Main goals
- clean routing
- scalable layouts
- protected routes
- Firestore-connected pages
- semantic search connected to products + FAQ + discovery engine
- doctor dashboard
- request workflows

---

## 2. Route Architecture

### Public routes
- `/`
  - Landing page
- `/search`
  - Semantic search results
- `/peptide/:slug`
  - Peptide product detail page
- `/faq`
  - FAQ landing page
- `/faq/:topic`
  - FAQ topic page
- `/compare/:slug1/:slug2`
  - Compare peptides

### Auth routes
- `/login`
- `/register`

### Professional routes
- `/start-request`
  - Start Request entry
- `/start-request/manual`
  - Exact prescription input
- `/start-request/assisted`
  - Guided formulation support

### Dashboard routes
- `/dashboard`
- `/dashboard/patients`
- `/dashboard/requests`
- `/dashboard/orders`

### Utility routes
- `*`
  - 404 page

---

## 3. Layout System

### PublicLayout
Use for:
- landing
- search
- peptide PDP
- FAQ
- compare pages

Should include:
- top navigation
- footer
- optional breadcrumb area
- semantic search entry point

### DashboardLayout
Use for authenticated areas:
- dashboard
- requests
- orders
- patients

Should include:
- sidebar
- top bar
- user menu
- protected route wrapper

---

## 4. Protected Route Logic

### Required access model
Roles:
- guest
- professional
- admin

### Rules
- guests can access public routes only
- professional users can access:
  - `/start-request`
  - `/dashboard/*`
- admin can access everything plus admin-only tools if added later

### Firebase Auth model
Store user profile fields:
- uid
- email
- role
- clinicName
- country
- approved
- createdAt

### Access rule
If route requires professional access:
- require logged-in user
- require role = professional or admin
- otherwise redirect to `/login`

---

## 5. Firestore Collections

### products
Suggested fields:
- docId
- slug
- name
- category
- subcategory
- format
- presentation
- route
- pricing
- dosageOrUsage
- visibility
- source
- active
- updatedAt
- tags
- semanticKeywords
- composition
- strengths
- availabilityType
- supplyRoute
- leadTimeCategory
- isCustomizable

### faq
Suggested fields:
- faqId
- category
- question
- answer
- tags
- relatedProductCategories
- relatedProductSubcategories
- relatedProductKeywords
- suggestedCta
- searchWeight
- visibility

### product_faq_mapping
Suggested fields:
- productCategory
- relatedFaqCategories
- relatedFaqKeywords

### discovery_engine
Use as config layer for:
- semantic search
- related FAQs
- related products
- protocols
- cross-sell

### requests
Suggested fields:
- requestType
- doctorName
- clinicName
- country
- category
- format
- freeTextInput
- parsedPrescription
- guidanceIntent
- matchResult
- attachments
- status
- createdAt
- updatedAt

### users
Suggested fields:
- uid
- email
- role
- clinicName
- approved
- country

---

## 6. Routing Implementation Notes

### Recommended file structure

- `src/router/AppRouter.tsx`
- `src/layouts/PublicLayout.tsx`
- `src/layouts/DashboardLayout.tsx`
- `src/routes/ProtectedRoute.tsx`
- `src/pages/LandingPage.tsx`
- `src/pages/SearchPage.tsx`
- `src/pages/PeptideDetailPage.tsx`
- `src/pages/FaqPage.tsx`
- `src/pages/FaqTopicPage.tsx`
- `src/pages/ComparePage.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/StartRequestPage.tsx`
- `src/pages/StartRequestManualPage.tsx`
- `src/pages/StartRequestAssistedPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/PatientsPage.tsx`
- `src/pages/RequestsPage.tsx`
- `src/pages/OrdersPage.tsx`
- `src/pages/NotFoundPage.tsx`

### Required routing features
- BrowserRouter
- Routes / Route
- nested layouts
- lazy loading with React.lazy and Suspense
- Link and useNavigate
- no full page reloads
- dynamic params for peptide PDP and compare pages

---

## 7. Firebase Data Layer

Create a clean data-access layer.

### Example service folders
- `src/lib/firebase.ts`
- `src/services/products.ts`
- `src/services/faq.ts`
- `src/services/search.ts`
- `src/services/requests.ts`
- `src/services/auth.ts`

### Required product methods
- `getProductBySlug(slug)`
- `getProductsByCategory(category)`
- `getRelatedProducts(product)`
- `searchProducts(query, visibility)`

### Required FAQ methods
- `getFaqCategories()`
- `getFaqByTopic(topic)`
- `getRelatedFaqForProduct(product)`
- `searchFaq(query, visibility)`

### Required request methods
- `createRequest(data)`
- `getUserRequests(uid)`
- `updateRequestStatus(requestId, status)`

### Required auth methods
- `getCurrentUser()`
- `signIn()`
- `signOut()`
- `getUserRole(uid)`

---

## 8. Semantic Search Engine

### Objective
Search across:
- products
- FAQ
- discovery engine signals

### Inputs
- user natural-language query
- optional visibility context
- optional category filter

### Deterministic search priority
1. exact product name match
2. product slug / keyword match
3. tags match
4. semanticKeywords match
5. FAQ tags / question / answer match
6. relatedProductKeywords and discovery config

### Ranking
Products first, FAQs second, protocols third.

### Firestore-ready fields
Use:
- name
- category
- subcategory
- tags
- semanticKeywords
- dosageOrUsage
- FAQ question
- FAQ answer
- FAQ tags

### AI usage rule
AI can:
- explain why a result matched
- summarize result groups
- refine ranking after deterministic filtering

AI must NOT:
- invent products
- bypass visibility rules
- decide matches without deterministic filtering

---

## 9. Start Request Integration

### Modes
- manual / exact prescription
- assisted / guided support

### Live matching against catalog
While the doctor types:
- parse category
- parse format
- parse ingredients
- parse strengths
- compare to products collection

### Output states
- exact match
- similar match
- custom required

### Fulfillment paths
- catalog_product
- adapted_existing_formulation
- full_custom_formulation

### Save into requests
Include:
- matchType
- confidence
- closestProductIds
- fulfillmentPath
- supplyInsight

---

## 10. Product Detail Page Requirements

Each peptide PDP should include:

### Main sections
- hero
- quick overview
- research context
- technical details
- FAQ
- related peptides
- compare related peptides

### Related content blocks
- 3 to 5 FAQ items
- 3 to 6 related peptides
- compare block if available

### Matching logic
Use:
1. direct product FAQ mapping
2. related engine
3. same family / category
4. semantic overlap

---

## 11. FAQ System Requirements

### FAQ landing page
- top search bar
- category chips or tabs
- featured questions
- accordion layout
- related peptide cards under answers

### FAQ topic page
- topic-specific filtered list
- related peptide suggestions
- CTA buttons

### Search behavior
- searchable by natural language
- products and FAQs connected
- respect public/professional visibility

---

## 12. Compare Peptides

### Route
`/compare/:slug1/:slug2`

### Show
- peptide 1 summary
- peptide 2 summary
- comparison dimensions:
  - category / family
  - goals
  - format
  - visibility
- related FAQs
- CTA back to PDP

---

## 13. UX Rules

### General
- mobile-first
- premium medical / research look
- clean hierarchy
- no clutter
- excellent scanability

### Search UX
- fast
- result groups
- products first
- FAQ second
- explain matches

### Navigation UX
- breadcrumb support
- back navigation preserved
- route transitions clear
- protected routes should redirect elegantly

---

## 14. Error Handling

### Required
- loading state per page
- empty results states
- 404 page
- auth redirect fallback
- Firestore fetch error fallback

### Search fallback
If no deterministic match:
- show closest categories
- show helpful FAQ
- suggest Start Request

---

## 15. Security + Visibility

### Public users
- can see public products
- can see public FAQ
- cannot access professional pages
- cannot see professional-only related content

### Professional users
- can see public + professional products
- can use Start Request
- can access dashboard
- can see deeper recommendations

### Admin
- full access

---

## 16. Build Priorities

Build in this order:
1. router
2. layouts
3. protected route
4. Firebase services
5. public pages
6. dashboard pages
7. semantic search
8. FAQ + PDP enrichment
9. Start Request integration
10. compare pages

---

## 17. Validation Checklist

Before completion, verify:

### Routing
- all routes resolve correctly
- protected routes work
- lazy loading works
- 404 works

### Firebase
- products fetch by slug
- FAQ fetch by category/topic
- requests save correctly
- auth role checks work

### Search
- products appear before FAQ
- visibility respected
- semantic matches are sensible

### PDP
- FAQ block appears
- related products appear
- compare block appears when data exists

### Start Request
- manual mode works
- assisted mode works
- live matching works
- request saves into Firestore

---

## 18. Final Product Goal

The final result should behave like:

- a premium peptide / compounding discovery platform
- a semantic search system
- a doctor-facing request platform
- a Firebase-backed SaaS foundation

Not a demo and not a toy example.
