# Task List — RegeneraCalendar Full Implementation

## Frontend

- [/] **`useCalendarEvents.js`** — Firestore hook: read, create, update, delete `calendar_events`
- [/] **`RegeneraCalendar.jsx`** — Full implementation: hover cards, recurring wizard, conflict detection, timezone, iCal/CSV export, Google Calendar connect, color-coded events, accessibility
- [/] **`AnalyticsPanel.jsx`** — Chart.js bar/donut charts for compliance + event type breakdown
- [/] **`CalendarPage.jsx`** — Full page wrapping calendar + analytics + toolbar (create event, export, sync)
- [ ] **Route in `App.jsx`** — Add `/calendar` route for doctor, patient, wholesaler roles

## Backend

- [/] **`sendReminders.js`** — Real multi-channel dispatch: FCM push (admin-sdk), email via nodemailer/SendGrid, console-log SMS stub
- [ ] **`functions/index.js`** — Already exports calendar functions ✅

## Completed Earlier

- [x] Calendar CSS tokens in `index.css` — glass-morphism, event colors, conflict glow, protocol badge
- [x] `useCalendarSync.js` — hook to push shipping events to calendar
- [x] `calendarAuth.js` — Google OAuth generateAuthUrl + handleAuthCallback
- [x] `calendarSync.js` — `syncToGoogleCalendar` + `protocolDaySync` triggers
- [x] `ProtocolDayBadge.jsx` — badge component
