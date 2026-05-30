# RegeneraPept Calendar – Full Enhancement Plan

## Goal Description
Upgrade the existing calendar gadget to a premium, fully‑featured scheduling hub that supports:
- Color‑coded event families (prescriptions, shipping, marketing, orders, medical protocols)
- Drag‑and‑drop rescheduling with visual feedback
- Recurring‑event wizard for prescriptions and protocol dosing
- Conflict detection and resolution UI
- Per‑event reminder preferences (push, email, SMS) ✅ all enabled (todos)
- Time‑zone override per event
- Two‑way sync with the user’s Google Calendar (full access scope `https://www.googleapis.com/auth/calendar`)
- Rich hover cards with timeline, actions, QR code
- Dark‑mode + glass‑morphism styling with micro‑animations
- Full accessibility (keyboard navigation, ARIA, high‑contrast mode)
- Export to iCal/CSV
- Analytics dashboard summarising upcoming/past events and compliance (retention 1 year)
- **Critical**: Show protocol‑day entries for both the doctor and patient (days when any treatment protocol must be taken).

---
## User Review Required
> [!IMPORTANT]
> The plan introduces new backend services (Cloud Functions for reminders, Google Calendar OAuth flow, Firestore schema changes) and UI components. All open questions have been answered by the user:
> - **Google Calendar OAuth scope:** full access (`https://www.googleapis.com/auth/calendar`).
> - **Reminder channels:** Email (SendGrid/Firebase), SMS (Twilio), Push (FCM) – all enabled.
> - **Protocol data source:** Existing `protocols` collection will be used.
> - **Analytics retention:** 1 year.
> Proceed with implementation.

---
## Proposed Changes

### Phase 6: Global Form & Interaction Component Normalization (GCP Style)
Identify missing Google Cloud-styled interactive components that currently rely on native browser elements across portals, and build them.

#### [NEW] [TextField.jsx](file:///Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/components/ui/TextField.jsx)
- A standardized, floating-label or outlined input field following GCP forms design.
- Handles validation states, icons, and helper text.

#### [NEW] [Select.jsx](file:///Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/components/ui/Select.jsx)
- A standardized dropdown to replace native `<select>` elements, matching GCP aesthetics.

#### [NEW] [Toggle.jsx](file:///Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/components/ui/Toggle.jsx)
- A standard GCP-style switch for boolean settings.

#### [NEW] [Tabs.jsx](file:///Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/components/ui/Tabs.jsx)
- A unified tab navigation component to replace the inline tab buttons currently mapped across `DoctorHome`, `WholesalerHome`, and Admin dashboards.

#### [MODIFY] [StatusBadge.jsx](file:///Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/components/ui/StatusBadge.jsx) -> [StatusChip.jsx](file:///Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/components/ui/StatusChip.jsx)
- Rename and finalize the global StatusChip component, deleting redundant badge definitions.

#### [MODIFY] [index.js](file:///Users/joseluiszabala/Documents/Antigravity/regenpept-web/src/components/ui/index.js)
- Export all the newly built components for global availability.

### UI Layer
- **[NEW]** `src/components/calendar/RegeneraCalendar.jsx` – glass‑morphism dark calendar built with FullCalendar supporting color tags, drag‑and‑drop, timezone selector, recurring‑event modal, hover cards, and protocol‑day badges.
- **[NEW]** `src/components/calendar/ProtocolDayBadge.jsx` – badge/icon displayed on days that contain protocol dosing for doctor/patient.
- **[MODIFY]** `src/components/supplier/ShippingTrackerTab.jsx` – import new `useCalendarSync` hook to push shipping‑insight events to the calendar.
- **[MODIFY]** `src/components/ui/ThemeProvider.jsx` – add dark‑mode toggle and glass‑morphism CSS variables.
- **[NEW]** `src/components/calendar/AnalyticsPanel.jsx` – Chart.js charts summarising upcoming vs past events, compliance percentages.

### Backend / Firestore
- **[NEW]** Collection `calendar_events` (see schema below).
- **[NEW]** Extend existing `protocols` collection with `doses` sub‑field if not present; `protocol_schedules` collection not needed.
- **[NEW]** Cloud Function `syncToGoogleCalendar` – creates/updates events in the user’s Google Calendar using the OAuth token stored in Firestore (`users/{uid}/googleCalendar`).
- **[NEW]** Cloud Function `sendReminders` – runs every 5 min (Cron) to scan `calendar_events` for upcoming reminders and dispatch via Email (SendGrid), SMS (Twilio), and Push (FCM).
- **[NEW]** Cloud Function `protocolDaySync` – on write to `protocols`, generate matching `calendar_events` entries of type `protocol` for each dose date.

### Authentication / OAuth
- Add a new route `/auth/google-calendar` (Firebase Function) that initiates the Google OAuth flow and stores the token (encrypted) in Firestore under `users/{uid}/googleCalendar`.

### Styling & Assets
- Extend `src/index.css` with tokens:
  - `--color-calendar-bg` (dark translucent)
  - `--radius-calendar` (rounded)
  - `--shadow-calendar` (subtle elevation)
  - Event‑type color variables matching `EVENT_COLORS`.
- Add CSS for event colors, conflict glow, hover micro‑animations, and glass‑morphism backdrop.

---
## Verification Plan
### Automated Tests
- Unit tests for Cloud Functions (`syncToGoogleCalendar`, `sendReminders`, `protocolDaySync`).
- Integration test using Firebase Emulator Suite to ensure Firestore ↔ Google Calendar sync.
- UI snapshot tests for `RegeneraCalendar` (dark mode, drag‑and‑drop, protocol badges).

### Manual Verification
- Create a sample prescription with a 30‑day recurrence and verify it appears on the calendar with correct color and reminder emails.
- Add a protocol schedule for a patient and confirm protocol‑day badges show on the calendar for both doctor and patient views.
- Perform a drag‑and‑drop move and ensure Firestore updates and Google Calendar syncs.
- Toggle dark mode and check glass‑morphism backdrop.
- Export the calendar to iCal and re‑import to verify data fidelity.
- Test accessibility: keyboard navigation, screen‑reader announcements, high‑contrast toggle.

---
**Ready to start** – implementation will begin after creating the task checklist.
