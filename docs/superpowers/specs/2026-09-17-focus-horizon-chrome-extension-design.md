# Focus — Horizon Chrome Extension Design

## Goal
Create a Chrome extension that complements Focus — Horizon/Web 6.0 by keeping the timer and quick focus actions available without requiring the user to keep the web app open.

## Scope for 1.0
The first release uses a Chrome popup only. It includes a local timer, pause/resume/reset, active task context, timer-completion notifications, hydration reminders, and authenticated access to Focus account data. Chrome Side Panel is intentionally deferred.

## Architecture
The existing Focus application remains in `focus-app/`. The extension lives in a new sibling directory, `focus-extension/`, and targets Manifest V3. Pure timer calculations that are safe to reuse across browser contexts live in `focus-shared/`.

The extension must not import the existing React pages or reuse the existing Zustand store directly. The current `pomodoroStore` has application-specific side effects such as activity tracking, so the extension owns a small browser-specific store while sharing only pure timer helpers and contracts.

## Timer model
Timer state is timestamp-based. A running timer stores `endsAt`; remaining time is derived from `endsAt - Date.now()` rather than depending on a continuously running interval. The popup may render a local interval while open, but correctness must not depend on it.

The extension service worker schedules `chrome.alarms` for timer completion. This makes completion robust even when Chrome suspends the service worker or the popup is closed.

State fields for 1.0:
- `status`: `idle | running | paused`
- `sessionType`: `work | short_break | long_break`
- `secondsLeft`
- `endsAt`
- `activeTaskId`
- `activeProjectId`
- timer duration preferences needed by the popup

## Storage
Extension-owned state uses `chrome.storage.local`. It does not rely on Focus Web's page `localStorage`, because extension pages and website pages have separate storage contexts.

Hydration reminder settings are also stored locally so they work without login.

## Authentication and Focus data
The extension uses the same Supabase project as Focus Web. Authenticated task and project data must continue to be protected by the project's existing RLS policies.

A signed-out user can still use the local timer and hydration reminders. Account-only UI becomes available after authentication.

For 1.0, task/project synchronization is backend-based through Supabase rather than direct communication with a Focus Web tab.

## Popup UX
The popup is intentionally compact. It should present, in priority order:
1. current session type and countdown;
2. start/pause/resume/reset controls;
3. selected task or a task selector when authenticated;
4. hydration reminder toggle/interval;
5. an action to open the full Focus — Horizon experience.

Projects, analytics, history, achievements, FocushoMe detail views, and advanced settings remain in Horizon rather than being recreated in the popup.

## Notifications
The background service worker sends Chrome system notifications for timer completion and hydration reminders. Notification delivery must not require the Horizon tab or popup to be open.

## Error handling
If Supabase is unavailable or the session expires, local timer/reminder functionality continues to work. Account data sections show signed-out/unavailable state without resetting local timer state.

If extension storage cannot be read, fall back to safe timer defaults rather than inventing remote state.

## Testing
Pure timer math is unit-tested independently in `focus-shared/`. Browser state transitions and reminder configuration are tested using Chrome API adapters/stubs, while the production build is validated as a loadable Manifest V3 extension.

## Deferred
The following are explicitly outside 1.0:
- Chrome Side Panel;
- full dashboard reproduction;
- analytics/history pages;
- achievements UI;
- FocushoMe full experience;
- direct tab-to-extension message synchronization;
- cross-browser packaging beyond Chromium-compatible browsers.
