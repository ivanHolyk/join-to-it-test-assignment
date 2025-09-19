# join-to-it-test-assignment

A small Vue 3 + TypeScript test project — a miniature calendar/reminder app built with FullCalendar.
This repo implements a simplified Google Calendar-like interface with event creation, editing, deletion, drag/drop, color tagging and basic accessibility/UX niceties.

---

## What this project does

- Display a month/week/day calendar (FullCalendar).
- Add new events (max 30 characters) for a chosen day/time.
- Edit events (title, start/end, color, all-day, notes).
- Delete events.
- Drag & drop events to change date/time.
- Click on a date to open a new-event popover positioned near the click.
- Handle simultaneous events and render them in correct order.
- Choose an event color; app computes readable `textColor` automatically.
- Small, focused UX improvements (Escape to close modal, auto-fill end time = start + 1 hour, all-day handling etc.).

This README replaces the scaffold boilerplate and documents the useful, project-specific details you’ll need while developing.

---

## Tech stack

- Vue 3 (script setup, composition API)
- TypeScript
- Vite
- Pinia (store)
- FullCalendar (vue3)
- uuid (event `id`)
- SCSS allowed; CSS overrides for FullCalendar live in `src/styles/fc-override.scss`
- Simple utility helpers in `src/utils`:
  - `color-contrast.ts` — chooses black/white text for a background color
  - `dateFormatter.ts` — helpers for `datetime-local` formatting

---

## Project structure (high-level)

```
src/
├─ components/
│  ├─ Sidebar.vue
│  ├─ CalendarView.vue
│  ├─ NewEventModal.vue
│  └─ EditEventModal.vue
├─ stores/
│  └─ events.ts
├─ utils/
│  ├─ color-contrast.ts
│  └─ dateFormatter.ts
├─ styles/
│  └─ fc-override.scss
└─ App.vue
```

---

## Event model (what each event object contains)

Events stored in Pinia use FullCalendar’s `EventInput` style plus some local fields:

```ts
{
  id: string,                 // uuidv4
  title: string,
  start: string,              // "YYYY-MM-DD" (all-day) or "YYYY-MM-DDTHH:MM"
  end?: string,               // same format as start
  backgroundColor?: string,
  borderColor?: string,
  eventColor?: string,        // sometimes used
  textColor?: string,         // computed from bg for readability
  allDay?: boolean,
  extendedProps?: { notes?: string }
}
```

Notes:

- For **all-day** events we use `YYYY-MM-DD` (date-only). For timed events we use `YYYY-MM-DDTHH:MM` (compatible with `datetime-local`).
- The store contains helper fields and methods to select an event/date for editing/creating: `selectedEventId`, `selectedEvent`, `selectedDate`, `selectedPosition`, and methods like `selectEvent`, `selectDate`, `clearSelection`, `clearSelectedDate`.

---

## Running the project

Install deps:

```bash
npm install
```

Dev server:

```bash
npm run dev
```

Build for prod:

```bash
npm run build
npm run preview   # optional, to preview the build
```

Type-check with `vue-tsc` (project is configured to use `vue-tsc` instead of `tsc` to support `.vue` files):

```bash
npm run typecheck
```

Recommended editor: **VSCode + Volar** (disable Vetur). Volar ensures proper TypeScript support for `.vue` SFCs.

---

## Developer notes / important behaviours

- **Auto end time**: When a user sets a start datetime (timed events), the UI will auto-fill end = start + 1 hour unless the end is manually edited.
- **All-day toggle**: When switching to all-day, the inputs convert to date-only (`YYYY-MM-DD`). Switching back converts to `datetime-local` and sets default times. This conversion handles local timezone edge cases by using 09:00 as a safe default for date-only -> timed conversions.
- **Popover positioning**: The new-event modal can act like a popover — the calendar stores the click coordinates (`selectedPosition`) and the modal positions itself near the click, clamping to the viewport.
- **Color contrast**: `utils/color-contrast.ts` picks `#000`/`#fff` for readable foreground color and the store computes `textColor` for events added/updated.
- **Store API** (in `stores/events.ts`): `events` (reactive array), `addNewEvent`, `updateEvent`, `deleteEvent`, `selectEvent(id)`, `selectDate(value)`, `clearSelection()`, `clearSelectedDate()`. Use these to integrate components without heavy prop drilling.

---

## Known caveats & suggestions

- Timezone handling is intentionally simple: we store date-only strings for all-day events and `datetime-local`-style strings for timed events. Watch out for differences between `Date.toString()` and the exact formats the `<input type="datetime-local">` expects.
- No automated tests in the repo currently.
- The FullCalendar overrides are in `src/styles/fc-override.scss`. You can reorganize those overrides with SCSS nesting if you prefer.

---

## How to extend

- Add persistence: save `events` to localStorage or an API.
- Add recurring events support (FullCalendar has plugins).
- Improve accessibility: announce popover open/close, manage focus trap in modal.
- Add unit tests for store logic (pinia actions) and for date conversion helpers.

---

If you want, I can:

- produce a short CONTRIBUTING.md,
- reorganize `fc-override.scss` into nested SCSS,
- or add localStorage persistence to the events store.

Which do you want next?
