# Task List — RegeneraCalendar Full Implementation

## Frontend

- [x] **`useCalendarEvents.js`** — Firestore hook: read, create, update, delete `calendar_events`
- [x] **`RegeneraCalendar.jsx`** — Full implementation: hover cards, recurring wizard, conflict detection, timezone, iCal/CSV export, Google Calendar connect, color-coded events, accessibility
- [x] **`AnalyticsPanel.jsx`** — Chart.js bar/donut charts for compliance + event type breakdown
- [x] **`CalendarPage.jsx`** — Full page wrapping calendar + analytics + toolbar (create event, export, sync)
- [x] **Route in `App.jsx`** — Add `/calendar` route for doctor, patient, wholesaler roles

## Backend

- [x] **`sendReminders.js`** — Real multi-channel dispatch: FCM push (admin-sdk), email via nodemailer/SendGrid, console-log SMS stub
- [x] **`functions/index.js`** — Already exports calendar functions ✅

## Completed Earlier

- [x] Calendar CSS tokens in `index.css` — glass-morphism, event colors, conflict glow, protocol badge
- [x] `useCalendarSync.js` — hook to push shipping events to calendar
- [x] `calendarAuth.js` — Google OAuth generateAuthUrl + handleAuthCallback
- [x] `calendarSync.js` — `syncToGoogleCalendar` + `protocolDaySync` triggers
- [x] `ProtocolDayBadge.jsx` — badge component
