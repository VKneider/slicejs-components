---
id: "0019"
title: "Component: TourService"
repo: "slicejs-components"
status: blocked
area: components
priority: high
created: 2026-11-09
updated: 2026-11-12
target: "next release"
owners: []
related:
  - "docs/TOUR-SERVICE-DESIGN.md"
  - "docs/COMPONENT_COVERAGE.md"
  - "src/Components/Service/ToastProvider/ToastProvider.js"
  - "src/Components/Visual/ToolTip/ToolTip.js"
  - "src/Components/shared/overlay/scrollLock.js"
  - "src/Components/shared/navigation/links.js"
---

# Component: TourService

## Summary

A **headless tour service** for onboarding, feature discovery and release tours, in the spirit of
driver.js but shaped like a Slice Service: it owns the spotlight, the step card, positioning, focus,
scroll and persistence; the app only declares the steps and targets.

It is a **Service**, not a Visual component: the tour has no content of its own in the page. It
orchestrates temporary UI over arbitrary elements, which is the same shape as `ToastProvider`.

Status: **blocked on browser validation**. TourService and TourOverlay are implemented; the real-browser gate and generated social card are pending. See the
coverage study in `docs/COMPONENT_COVERAGE.md` for why this gap is ranked first among the
overlay/orchestration jobs.

## Problem / motivation

Apps hand-roll onboarding tours with absolutely positioned divs, a dark overlay and a card. The
visible part is easy; the failure modes are not:

- the target moves on scroll/resize, or is inside a scroll container;
- the page behind still scrolls, or the tour traps focus in the wrong place;
- Escape closes the tour without giving focus back;
- the spotlight is invisible to keyboard and screen-reader users, and the card is not announced;
- each step needs a different position and a different "next" rule;
- "do not show again" is a localStorage key reinvented per app;
- the tour is not translatable, themeable or testable.

driver.js, Shepherd and Intro.js solve this outside the framework, but they bring their own styles,
positioning and lifecycle. Slice already has the pieces: tokens, theme, translator, events, a shared
scroll lock, and a Service pattern that can build transient UI (`ToastProvider`).

## Proposed direction

```js
const tour = await slice.build('TourService', { singleton: true, sliceId: 'tour' });

await tour.start([
   { target: '#new-project', title: 'Create a project', content: 'Start here.', placement: 'bottom' },
   { target: '.filters', title: 'Filter the list', content: 'Narrow it down.' },
   { target: '#export', title: 'Export', content: 'Download what you see.' },
], {
   storageKey: 'products-tour-v1',
   padding: 8,
   onEnd: ({ completed, index }) => {},
});
```

### API sketch

- `start(steps, options)` → Promise<{ completed, reason }>. `next()`, `prev()`, `stop(reason)`,
  `index`, `isActive`, `currentStep`.
- Step: `{ target, title, content, placement, padding, spotlight, disableBeacon, beforeStep,
  afterStep, waitFor, fallback }`.
  - `target`: selector, `Element`, or a function returning either.
  - `placement`: `top | bottom | left | right | auto` (auto flips when there is no room).
  - `waitFor`: an async predicate/function for targets that appear later; skip or wait.
  - `fallback`: `'skip'` (default when the target is missing) or `'center'` (a centred card).
- Options: `storageKey`, `padding`, `spotlight` (default on), `scrollIntoView` (default on),
  `keyboard` (default on), `focusTrap` (default on), `texts`, `onStart`, `onStep`, `onEnd`.
- Texts: English and Spanish built in, replaceable with `texts` (next, back, skip, done, progress,
  close), following `slice.translator`.
- Events: `tour:start`, `tour:step`, `tour:end` with `{ index, step, reason }`.

### Behavior

- Dim the page and cut a spotlight around the target; recompute on scroll, resize and target layout
  changes (IntersectionObserver/ResizeObserver where available).
- Step card floats near the target, arrow pointing at it, with Next / Back / Skip / Done and
  "2 of 5". The last step says Done; a one-step tour says Got it.
- `scrollIntoView` brings the target into view before placing the card.
- When the target is missing, skip by default (or show the centred card with `fallback: 'center'`).
- `storageKey` remembers completion; `reset()` forgets it; `start()` with the same key is a no-op
  unless `force: true`.
- The tour is a single active instance per `sliceId`; starting again replaces it cleanly.
- Destroying the service removes the overlay, listeners, observers and status, and returns focus.

### Accessibility

- The step card is a dialog (`role="dialog"`, `aria-labelledby`, `aria-describedby`, `aria-modal`
  only when focus is trapped); the step is announced politely.
- Focus goes to the card on start; Tab cycles inside it; Escape stops the tour; focus returns to
  the element that started it.
- The target is brought into view and marked with `aria-describedby` pointing at the step content
  when possible, so a screen reader hears "what this is" next to the element.
- The spotlight is decorative; the meaning is always in the card text. Never rely on the cutout.
- `prefers-reduced-motion`: no zoom/fade; the overlay appears instantly.
- Keyboard: ←/→ or PageUp/PageDown for steps, Enter for Next, Escape to stop, Home/End for first/last.
- Text contrast follows the theme tokens; the overlay never traps the page when `focusTrap: false`.

## Scope

In v1: linear steps, spotlight, placement, scroll, focus, keyboard, persistence, texts, events,
theme tokens, reduced motion, one active tour.

Out: multi-page tours, branching, analytics, recording, a visual builder, A/B experiments, video
steps, and remote step definitions.

## Compatibility and risk

- New Service; no public API changes elsewhere.
- Reuses `shared/overlay/scrollLock.js`, the theme tokens and the translator.
- The overlay must not create a second focus trap over a Modal that is already open. Rule: a tour
  does not start on top of a Modal; if it must, the Modal's trap and the tour coordinate through
  the same focus-trap primitive (to extract from Modal if needed).
- Tests need a deterministic target and a fixed viewport; avoid animations in the spec.

## Validation

- `TourService.spec.js`: start/next/prev/stop; step card content and progress; target missing
  (skip and center); keyboard; Escape; focus return; `storageKey` persistence; destroy mid-tour;
  reduced motion; `texts` en/es; target inside a scroll container.
- `TourOverlay.spec.js` covers its controls, reactive view, safe content and locale changes; the service owns orchestration.
- Manual check in the docs site: a tour over a real table/card, desktop and mobile.

## Documentation impact

- `src/markdown/tour-service.md` (Services › Interaction): a three-step product tour, a
  "don't show again" example, and a comparison with static/interactive `Stepper`.
- `docs/COMPONENT_COVERAGE.md` row moves from gap to shipped.
- `WANTED_COMPONENTS.md` row moves to shipped; this feature gets a decision log entry.
- Skill: `component-selection.md` composition recipe becomes a component row.

## Design

The full design is in [`docs/TOUR-SERVICE-DESIGN.md`](../docs/TOUR-SERVICE-DESIGN.md). It resolves:

- `TourService` + one `TourOverlay` visual; not a monolithic component and not a service that writes
  HTML.
- A fixed/popover overlay with two modes: `modal` (focus trap, scroll lock) and `interactive` (page
  stays clickable, no focus stealing). Not a native modal `<dialog>` for the whole tour.
- `beforeStep` for targets the app can open; `interactive` + `anchor` + `waitFor` for targets the
  user must click; `waitFor`/`timeout`/`fallback` for async or missing targets.
- Singleton service, one active tour, route changes stop it, multiple named tours share the service.
- v1 does not run tours on top of a Modal; the flow is split or the controlled-modal path is used.
- Progress is text/dots (no `ProgressBar` dependency), and `Button`/`Icon`/`lockScroll`/`toNodes`/
  `texts` are reused.

## Open questions for implementation

- Does `start()` resolve on end (like `Modal.show()`)? The design says yes.
- Does `TourOverlay` own its popover host, or does the service create it? The design assumes the
  overlay owns it; confirm when writing the files.
- Extract the focus trap to `shared/overlay/focusTrap.js` now, or keep it local until Modal needs it
  too? Prefer extraction only if the implementation duplicates the behavior.
- Is a beacon (a pulsing dot that opens the tour) part of the service or a separate `TourBeacon`?
  Out of v1.
- `storageKey` semantics: per tour, versioned by the app. Confirmed.

## Decision log

- 2026-11-09 — Captured as `proposed` after the component coverage study. Direction: a Service that
  orchestrates a spotlight + step card, not a page component. It is not implemented.
- 2026-11-10 — Design approved: `TourService` + `TourOverlay`, one singleton, `modal` and
  `interactive` modes, `beforeStep`/`anchor`/`waitFor`, split tours over modals, no `ProgressBar`
  dependency. Status moved to `planned`; implementation is still pending.

- 2026-11-12 — Implemented TourService + TourOverlay, registered both, added the Markdown guide,
  three runnable app scenarios, generated route/SEO/catalog entries, 8 node tests and 12 browser tests.
  start() resolves on end; the overlay owns its popover. Modal uses native dialog focus management,
  so the tour has a local trap rather than extracting nonexistent Modal trap code. Instant scrolling
  avoids a smooth-scroll race and satisfies reduced motion; completion uses localStorage directly.
- 2026-11-12 — Validation: 176 node tests pass; Markdown lint/generation, teardown and icon-name
  checks pass; production build passes. Browser validation is blocked in this environment:
  Playwright's browser download failed, and system Chromium cannot create its process socket
  (Operation not permitted). The new OG card cannot be captured, so og:check / test:gate remain
  blocked. Status is blocked, not done; the wanted-component row stays open.

## Remaining release validation

On a machine where Playwright Chromium runs:

```bash
pnpm exec playwright install chromium
pnpm exec playwright test TourService TourOverlay --project=components --workers=2
pnpm run og:generate -- --only=/docs/services/tour-service
pnpm run test:gate
```

Review the live desktop/mobile scenarios, commit the generated OG card, and only then mark this
feature done and move TourService to the shipped list. The developer skill is in the separate docs
repository; its component-selection/catalog update is still a release follow-up there.

- 2026-11-12 — Added TourDemo under DemoComponents: a responsive Launchpad workspace with
  Button, Icon, Badge, Avatar, Card, Grid, Input and Select; functioning search/status filters and a
  summary action. The docs now have exactly two script scenarios, each a single slice.build:
  overview (modal) and interactive filtering/export. Both share the singleton service and use
  instance-local targets. Screenshots remain blocked: desktop Chromium opens, but cannot reach
  the isolated dev server, and organization policy blocks file:// previews.

- 2026-11-12 — Follow-up: TourDemo now includes a ProgressBar in each project card, and the guide
  references the unified Stepper modes. Standalone Steps was removed by explicit user decision.
- 2026-11-13 — Review fixes: TourDemo filters hide the card instead of the whole Grid; the route
  listener defers `stop()` out of EventManager's dispatch loop; the TourOverlay translation spec
  intercepts the config before mount. The docs now show the `TourService` creation and steps against
  `TourDemo.targets` through `onLaunch`, with a docs regression test. Motion now glides the card and
  spotlight between steps with a driver.js-style stage transition, configurable via
  `animate`/`duration`.
  Verified here: 182 node tests, 18 targeted browser tests, `og:check` and production build. Full
  `test:gate` and the complete browser suite remain pending.
  The original tour remains blocked on the real-browser/OG gate; its state is not upgraded by
  successful logic/DOM-adapter/build checks on the new components.
