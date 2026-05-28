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
### Security & Access

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
