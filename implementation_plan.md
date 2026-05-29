# Admin & Doctor Dashboard UI Revamp

## Goal Description

Redesign the **AdminDashboard** to provide a modern, premium experience:
- Clear organization of metrics, user management, and system logs.
- Use glassmorphism cards, subtle gradients, and responsive layout.
- Implement an accordion with 4 tabs (only one open at a time) for mobile elegance.
- Apply the corporate color palette used on the home page (lighter, vibrant hues).
- Ensure accessibility (ARIA labels, focus states).

Create a new **DoctorDashboard** view tailored for doctors:
- Display doctor‑specific information: upcoming appointments, patient list, prescribed protocols, and analytics.
- Use the same design system as the admin view for visual consistency.
- Provide navigation to patient detail pages and protocol management.

## User Review Required

> [!IMPORTANT]
> Please review the proposed changes:
> - Acceptance of a major UI overhaul (may affect existing routes and styling).
> - Addition of a new route `/doctor-dashboard` and corresponding navigation entry.
> - Confirmation of the corporate color variables (if different from the current home palette).
> - Confirmation of data to display on the doctor view (e.g., appointments API, patient collection).

## Open Questions

> [!WARNING]
> - Which specific admin sections should be grouped into the 4 accordion tabs? (e.g., **Metrics**, **User Management**, **System Logs**, **Settings**).
> - What exact doctor‑side data fields are required? Do we fetch from existing Firestore collections or need new ones?
> - Should the doctor view support role‑based access control via Firebase Auth rules?

## Proposed Changes

---
### Admin Dashboard

- **[MODIFY]** `src/templates/AdminDashboard.jsx`
  - Refactor into four accordion sections.
  - Replace dark background colors with variables from `src/styles/theme.css` (e.g., `--color-primary`, `--color-accent`).
  - Add glassmorphism card component `GlassCard` for each metric.
  - Ensure responsive grid using CSS `grid` and `@container` queries.
  - Add ARIA attributes for accessibility.

- **[NEW]** `src/components/Accordion.jsx`
  - Reusable accordion component with controlled open state (single open tab).

- **[NEW]** `src/components/GlassCard.jsx`
  - Styled card with backdrop‑filter, subtle shadow, and gradient overlay.

- **[MODIFY]** `src/styles/theme.css`
  - Introduce corporate palette variables (`--brand-primary`, `--brand-secondary`).
  - Update dark mode colors to lighter tones.

---
### Doctor Dashboard

- **[NEW]** `src/templates/DoctorDashboard.jsx`
  - Layout with sections: **Appointments**, **My Patients**, **Prescriptions**, **Analytics**.
  - Utilizes `GlassCard` and `Accordion` for consistency.
  - Pulls data from Firestore collections `appointments`, `patients`, `prescriptions` scoped to `auth.currentUser.uid`.

- **[MODIFY]** `src/App.jsx` (or router config)
  - Add route `/doctor-dashboard` pointing to `DoctorDashboard`.
  - Add navigation menu entry visible only for users with role `doctor`.

- **[NEW]** `src/context/RoleContext.jsx`
  - Provide user role from Auth token to conditionally render doctor navigation.

---
### 1. UI/UX Standardization (GCP Data Tables)

*Status: Planning*

We will standardize all system data tables using the `AppDataTable` component to follow Google Cloud Console UX patterns.

### Objectives:
- **Consistent Placement:** Search and filter controls will be placed directly above the table header.
- **Filter Chips:** Active filters will be displayed as chips below the search bar.
- **Pagination:** Footer-based pagination with a default of 20 items per page.
- **State Preservation:** Implement server-side pagination with cursors (`startAfter`, `limit`) where applicable.

### Proposed Changes:

#### [MODIFY] `src/components/ui/AppDataTable.jsx`
- Add a new "Toolbar" section above the table header to render the search input and filter chips.
- Accept new props: `searchQuery`, `onSearchChange`, `searchPlaceholder`, `filters` (array of active filter objects), `onFilterRemove`, `renderCustomFilters` (for advanced filter dropdowns).
- Ensure footer pagination controls are styled strictly according to GCP standards (rows per page dropdown, item count text, and simple chevron navigation).

#### [MODIFY] Individual Tab Components (e.g., `AdminCostsTab`, `AdminProductsTab`, `AdminInvitationsTab`, `OrdersTab`, etc.)
- Remove custom-built search bars and filter dropdowns from the tab headers.
- Pass search state and filter state directly to the updated `AppDataTable`.
- Enforce the 20 items per page limit.
- Update queries to support cursor-based pagination if not already implemented.

## 2. Performance Optimization (Firestore Indices)

*Status: Planning*

To ensure the new paginated and filtered tables perform optimally at scale, we must define Firestore compound indices.

### Proposed Changes:
- Review queries across all portals (Users, Orders, Products, etc.).
- Create a `firestore.indexes.json` or equivalent configuration to define required compound indices (e.g., filtering by `status` and sorting by `createdAt`, while paginating).
- Document the `firebase deploy --only firestore:indexes` command in the walkthrough.

## 3. Audit Logs & Traceability

*Status: Pending*

- Integrate `logAction` into key edit operations in the Wholesaler portal (e.g., Bulk Orders creation, Rx status updates).

## User Review Required
> [!IMPORTANT]
> - Are there any specific filters or advanced search behaviors you want natively integrated into `AppDataTable` (e.g., date range pickers), or should complex filters be handled via custom render props?
> - Do you want to enforce server-side pagination for ALL tables, or is client-side pagination acceptable for smaller datasets (e.g., AdminSettingsTab)?

- Update Firebase security rules to grant doctors read/write access only to their own data.
- Add unit tests for role‑based rendering.

## Verification Plan

### Automated Tests
- Run existing Jest/React Testing Library suite.
- Add new tests for `Accordion` (single open tab) and `DoctorDashboard` role rendering.
- Use `firebase emulators:exec` to validate security rules.

### Manual Verification
- Open admin dashboard on desktop and mobile (responsive check).
- Verify color scheme matches home page.
- Switch to a doctor account and ensure the doctor view displays correct data.
- Perform accessibility audit with Chrome DevTools (a11y tab).
