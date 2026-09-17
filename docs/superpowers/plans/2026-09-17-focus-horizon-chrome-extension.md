# Focus Horizon Chrome Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Focus — Horizon Chrome extension with a compact popup for timer control, active-task context, local reminders, system notifications, and Supabase-backed account synchronization.

**Architecture:** Keep the current `focus-app/` application intact, add an isolated `focus-extension/` Manifest V3 application, and extract only pure timer contracts/helpers into `focus-shared/`. The extension owns its browser-specific state through `chrome.storage` and `chrome.alarms`; authenticated data continues to use the same Supabase backend as Focus Web.

**Tech Stack:** TypeScript, React, Vite, Chrome Extensions Manifest V3, Zustand, Supabase JS, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-17-focus-horizon-chrome-extension-design.md`

## Global Constraints

- Target Chrome Extensions Manifest V3.
- Version 1.0 uses a popup only; Side Panel is deferred.
- Timer and reminder basics must work without login.
- Authenticated tasks/projects/session data use the same Supabase project as Focus Web.
- Do not alter the existing Focus 6.0 timer behavior until shared pure timer helpers are covered by tests.
- Do not duplicate business logic that can safely live in `focus-shared/`.
- Chrome background logic must not depend on a continuously alive service worker.
- Persist timer deadlines as timestamps and use `chrome.alarms` for completion events.

---

### Task 1: Shared timer foundation

**Files:**
- Create: `focus-shared/src/timer.ts`
- Create: `focus-shared/src/timer.test.ts`
- Create: `focus-shared/package.json`
- Create: `focus-shared/tsconfig.json`

**Interfaces:**
- Produces: `getRemainingSeconds(endsAt: number, now?: number): number`
- Produces: `createTimerDeadline(secondsLeft: number, now?: number): number`

- [ ] **Step 1: Write failing tests** for deadline creation, countdown rounding and non-negative expiration.
- [ ] **Step 2: Run `npm test` in `focus-shared/` and verify RED.**
- [ ] **Step 3: Implement the minimal pure timer helpers.**
- [ ] **Step 4: Run `npm test` and verify GREEN.**
- [ ] **Step 5: Commit `test: add shared timer foundation`.**

### Task 2: Chrome extension shell

**Files:**
- Create: `focus-extension/package.json`
- Create: `focus-extension/tsconfig.json`
- Create: `focus-extension/vite.config.ts`
- Create: `focus-extension/index.html`
- Create: `focus-extension/public/manifest.json`
- Create: `focus-extension/src/main.tsx`
- Create: `focus-extension/src/popup/App.tsx`
- Create: `focus-extension/src/popup/styles.css`

**Interfaces:**
- Consumes: shared timer helpers from `focus-shared`.
- Produces: buildable MV3 popup application.

- [ ] **Step 1: Add a smoke test that asserts the popup renders the idle timer.**
- [ ] **Step 2: Run the test and verify RED.**
- [ ] **Step 3: Add the minimal popup shell and manifest.**
- [ ] **Step 4: Run test/build and verify GREEN.**
- [ ] **Step 5: Commit `feat: scaffold Focus Horizon Chrome extension`.**

### Task 3: Browser timer state and alarms

**Files:**
- Create: `focus-extension/src/background/service-worker.ts`
- Create: `focus-extension/src/timer/timerStore.ts`
- Create: `focus-extension/src/timer/timerStorage.ts`
- Create: `focus-extension/src/timer/timerStore.test.ts`

**Interfaces:**
- Produces persisted timer state with `status`, `sessionType`, `secondsLeft`, `endsAt`, `activeTaskId` and `activeProjectId`.
- Produces Chrome alarm named `focus-timer-complete`.

- [ ] **Step 1: Write failing tests for start, pause, resume and expiration reconstruction.**
- [ ] **Step 2: Verify RED.**
- [ ] **Step 3: Implement storage-backed timer state and alarm scheduling.**
- [ ] **Step 4: Verify GREEN and run build.**
- [ ] **Step 5: Commit `feat: add extension timer engine`.**

### Task 4: Notifications and hydration reminders

**Files:**
- Create: `focus-extension/src/background/notifications.ts`
- Create: `focus-extension/src/reminders/reminderStore.ts`
- Create: `focus-extension/src/reminders/reminderStore.test.ts`
- Modify: `focus-extension/src/background/service-worker.ts`
- Modify: `focus-extension/src/popup/App.tsx`

**Interfaces:**
- Produces timer-complete system notifications.
- Produces configurable hydration reminder intervals of 30, 45, 60 or 90 minutes.

- [ ] **Step 1: Write failing tests for reminder interval persistence and alarm creation contract.**
- [ ] **Step 2: Verify RED.**
- [ ] **Step 3: Implement reminder preferences, alarms and notifications.**
- [ ] **Step 4: Verify GREEN and build.**
- [ ] **Step 5: Commit `feat: add Focus extension reminders`.**

### Task 5: Supabase auth and account data

**Files:**
- Create: `focus-extension/src/lib/supabase.ts`
- Create: `focus-extension/src/auth/authStore.ts`
- Create: `focus-extension/src/data/tasks.ts`
- Create: `focus-extension/src/data/projects.ts`
- Modify: `focus-extension/src/popup/App.tsx`

**Interfaces:**
- Produces authenticated session state.
- Produces task/project queries scoped by the authenticated user and existing RLS policies.

- [ ] **Step 1: Write failing tests around signed-out behavior and task selector fallbacks.**
- [ ] **Step 2: Verify RED.**
- [ ] **Step 3: Implement Supabase client/session handling and task/project loading.**
- [ ] **Step 4: Verify GREEN and build.**
- [ ] **Step 5: Commit `feat: sync extension with Focus account`.**

### Task 6: Popup 1.0 interaction design

**Files:**
- Modify: `focus-extension/src/popup/App.tsx`
- Modify: `focus-extension/src/popup/styles.css`

**Interfaces:**
- Consumes timer/auth/task/reminder state.
- Produces the final compact 1.0 popup UI.

- [ ] **Step 1: Write interaction tests for play/pause/reset, task selection and hydration toggle.**
- [ ] **Step 2: Verify RED.**
- [ ] **Step 3: Implement the compact Horizon-styled popup.**
- [ ] **Step 4: Verify GREEN, run typecheck and production build.**
- [ ] **Step 5: Commit `feat: complete Focus Horizon extension popup`.**

### Task 7: Integration verification

**Files:**
- Modify only files required by verified defects.

- [ ] **Step 1: Run all extension/shared tests.**
- [ ] **Step 2: Run extension production build.**
- [ ] **Step 3: Load unpacked extension in Chrome and verify idle/start/pause/finish notification flows.**
- [ ] **Step 4: Verify local hydration reminders without login.**
- [ ] **Step 5: Verify signed-in task loading and active-task selection.**
- [ ] **Step 6: Confirm the Focus Web 6.0 build remains unaffected.**
