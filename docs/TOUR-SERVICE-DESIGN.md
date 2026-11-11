# TourService — design

**Status:** planned (design approved; not implemented).
**Feature:** [`features/0019-component-tour-service.md`](../features/0019-component-tour-service.md).
**Coverage study:** [`docs/COMPONENT_COVERAGE.md`](./COMPONENT_COVERAGE.md).

A Slice-shaped tour system for onboarding, feature discovery and release tours, in the spirit of
driver.js but split into a **Service** (orchestration) and one **Visual** (the overlay + card).

## 1. Goals

- Walk a user through 3–7 steps over **existing UI**, highlighting one target at a time.
- Work when the target is **visible**, **hidden behind code** (`beforeStep`), or **revealed by the
  user's click** (`interactive` + `waitFor`).
- Keep the hard parts in one place: spotlight, placement, scroll, focus, Escape, persistence,
  translation, reduced motion.
- Stay themeable and dependency-free; reuse the library's tokens, `Button`, `Icon`, `lockScroll`,
  `texts()` and `toNodes()`.
- One active tour per app; multiple named tours run through the same service.

## 2. Non-goals (v1)

- Multi-page tours, branching flows, analytics, recording, A/B experiments.
- A visual tour builder.
- Video steps, annotation/drawing.
- Tours on top of an open `Modal` (the flow is split into two tours; see §10).
- A separate `TourBeacon` (the pulsing dot that starts a tour). Later, if asked.

## 3. Architecture

```text
TourService (Service, singleton)
  ├─ step list, index, storageKey, events, cleanup
  ├─ resolves targets + beforeStep/waitFor/anchor
  ├─ scrolls, measures, observes resize/scroll
  ├─ owns mode: modal | interactive
  └─ builds/updates ONE TourOverlay (Visual)
        ├─ .slice-tour__dim        (full viewport, click-through in interactive mode)
        ├─ .slice-tour__spotlight  (target rect + huge box-shadow cutout)
        └─ .slice-tour__card       (title, content, progress, buttons, arrow)
```

- **`TourService`** is the brain. It has no template. If it builds UI, it builds a `TourOverlay`.
- **`TourOverlay`** is the only new Visual. It is the dialog/region + spotlight + card. It receives
  the current step and the target rect, paints, and reports `next` / `prev` / `stop`.
- It uses real `Button` components for the controls and `Icon` for the close/arrow. It does not
  reinvent buttons.
- It uses `shared/overlay/scrollLock.js` and (for modal mode) a focus trap. If the trap is extracted
  from `Modal`, it lives in `shared/overlay/focusTrap.js` and both use it.

Why not a single component with a step list? The service handles async targets, route changes,
persistence and events; a component cannot stop itself on navigation or retry a missing target.

Why not `Modal`? A `Modal` cannot anchor a spotlight to an arbitrary element or place its card next
to a target. A tour is a different layer contract.

Why not a native `<dialog>` for the whole overlay? A modal `<dialog>` makes the page inert, which is
correct for explanatory steps but incompatible with interactive steps ("click Filters to continue").
The overlay is a fixed/popover layer with two modes; modal mode adds the trap and the inertness.

## 4. Public API

### 4.1 Build

```js
const tour = await slice.build('TourService', { singleton: true, sliceId: 'tour' });
```

A second live instance logs a warning (same convention as `ToastProvider` and `ToolTipProvider`).

### 4.2 Service methods

| Method | Returns | Notes |
| --- | --- | --- |
| `start(steps, options?)` | `Promise<{ completed, reason }>` | Stops the current tour (`reason: 'replaced'`) and starts the new one. No-op when `storageKey` is completed, unless `force: true`. |
| `next()` | `this` | Only from an active step. |
| `prev()` | `this` | First step stays. |
| `stop(reason = 'stopped')` | `this` | Removes the overlay, observers and listeners; returns focus. |
| `reset(storageKey?)` | `this` | Forgets completion for one key (or the current one). |
| `index` | `number` | `-1` when idle. |
| `isActive` | `boolean` | |
| `currentStep` | `object \| null` | The normalized step. |
| `overlay` | `TourOverlay \| null` | For tests/debugging. |

### 4.3 Step schema

```js
{
  target: '#new-project',            // selector | Element | () => (selector|Element|null)
  anchor: '#new-project-button',     // optional: where the card waits while target is missing
  title: 'Create a project',
  content: 'Start here.',            // string | Node | component | array (toNodes)
  placement: 'bottom',               // top | bottom | left | right | auto (default)
  padding: 8,                        // px around the spotlight
  radius: 12,                        // spotlight corner radius; default: target's radius
  spotlight: true,                   // false: only dim, no cutout
  interactive: false,                // true: page stays clickable, no focus trap
  waitFor: '.project-form',          // optional: wait until this exists/visible
  timeout: 5000,                     // ms for waitFor / target resolution
  fallback: 'skip',                  // skip | center (default: skip)
  onTargetMissing: (step) => {},     // optional
  beforeStep: async ({ tour, step, index }) => {}, // return false to skip, or { target }
  afterStep: async ({ tour, step, index }) => {},
  texts: {},                         // per-step text overrides
  data: {},                          // app payload passed to callbacks
}
```

`beforeStep` is app code. It can select a tab, open a controlled drawer, fetch data or call a
component's `open()`. It must be idempotent and must not destroy the page. It can return:

- `false` → skip this step;
- `{ target }` → use a different target for this step;
- nothing → continue.

`waitFor` does not open anything. It waits for a target that the app or the user will reveal.
`anchor` is the element the card points at while `target` does not exist (the button that opens the
menu). When `waitFor` resolves, the card moves to `target`.

### 4.4 Options

```js
{
  storageKey: 'products-tour-v1',   // remember completion
  force: false,                    // ignore the stored completion
  stopOnRouteChange: true,         // stop on router:change
  padding: 8,                      // default spotlight padding
  texts: {},                       // next/back/skip/done/close/progress
  onStart: ({ steps }) => {},
  onStep: ({ step, index }) => {},
  onEnd: ({ completed, reason, index }) => {},
  focusTrap: true,                 // modal steps only
  lockScroll: true,                // modal steps only
  scrollIntoView: true,
  spotlight: true,
  maxCardWidth: 360,
}
```

Per-step `interactive: true` overrides modal configuration: no focus trap, no scroll lock, page
clicks pass through the dim layer (the card still blocks its own clicks). The service remembers the
previous mode and returns to modal on the next non-interactive step.

### 4.5 Events

| Event | Detail |
| --- | --- |
| `tour:start` | `{ steps, id }` |
| `tour:step` | `{ index, step, total }` |
| `tour:end` | `{ completed, reason, index }` |

Reasons: `completed`, `skipped`, `stopped`, `replaced`, `route`, `target-missing`, `error`.

### 4.6 Texts

Built in (English and Spanish) and replaceable with `texts`:

| Key | English |
| --- | --- |
| `next` | Next |
| `back` | Back |
| `skip` | Skip |
| `done` | Done |
| `close` | Close tour |
| `progress` | `{index} of {total}` |
| `preparing` | Preparing… |
| `missing` | This step is not available. |

The overlay follows `slice.translator`; changing language re-renders the visible card and the
progress text.

## 5. Lifecycle and state machine

```text
idle
  └─ start()
       ├─ prepare       beforeStep(); may return false / { target }
       ├─ resolve       target; scrollIntoView; wait for visible
       │    ├─ missing + anchor → waiting (card at anchor, user acts)
       │    ├─ missing + no anchor + fallback skip → skip
       │    └─ missing + fallback center → show centered card
       ├─ active        overlay shown, spotlight/card placed
       │    ├─ next/prev
       │    ├─ stop
       │    └─ route change → stop('route')
       └─ end           completed / skipped / stopped / error
```

- `next()` from the last step completes the tour and records `storageKey`.
- `stop()` from any step ends without marking completion.
- `skip` on a step moves to the next step (or ends if it is the last).
- `timeout` on `waitFor` uses `fallback`; `onTargetMissing` fires first.
- `beforeStep`/`afterStep` errors stop the tour with `reason: 'error'` and log through
  `slice.logger`.
- `start()` while active stops the old tour with `reason: 'replaced'`; there is never more than one
  overlay.

## 6. Target resolution and tracking

1. Normalize `target`: selector, `Element`, or function. A function runs on every resolve.
2. If found and visible (`getClientRects().length > 0`), scroll into view (center, smooth unless
   reduced motion), wait for scroll to settle (rAF + `scrollend`/timeout fallback), then measure.
3. If not found:
   - if `waitFor` is set, watch with `MutationObserver` on `document.body` (subtree, childList,
     attributes) until the selector matches or `timeout`;
   - while waiting, place the card at `anchor` if present; otherwise show the centered
     `preparing`/`missing` state;
   - on timeout, `onTargetMissing`, then `fallback` (`skip` or `center`).
4. While active, keep the rect current:
   - `scroll` (capture, passive) and `resize` listeners;
   - `ResizeObserver` on the target and its offset parents, when available;
   - a `requestAnimationFrame` loop only while the tour is active and the tab is visible;
   - coalesce updates to one rAF; never animate the spotlight on every scroll event.
5. If the target is removed while active: wait for it again (same `waitFor` logic) or, without
   `waitFor`, show the centered fallback/skip. This is configurable per step.

The service always re-resolves the target at the start of each step. It never caches a stale
`Element` across steps.

## 7. Overlay, spotlight and placement

### DOM

```html
<div class="slice-tour" data-mode="modal" popover="manual">
   <div class="slice-tour__dim"></div>
   <div class="slice-tour__spotlight" style="left/top/width/height;border-radius"></div>
   <div class="slice-tour__card" role="dialog" aria-modal="true">
      <button class="slice-tour__close">…</button>
      <div class="slice-tour__eyebrow">2 of 5</div>
      <h3 class="slice-tour__title">…</h3>
      <div class="slice-tour__content">…</div>
      <div class="slice-tour__actions">
         <button class="slice-tour__skip">Skip</button>
         <button class="slice-tour__back">Back</button>
         <button class="slice-tour__next">Next</button>
      </div>
      <span class="slice-tour__arrow"></span>
   </div>
</div>
```

- The overlay is `position: fixed; inset: 0` inside a `popover="manual"` element (top layer), with a
  fixed + z-index fallback. `showPopover()` after it is connected; hide/remove on stop.
- `TourOverlay` uses the real `Button`/`Icon` components for controls; their lifecycle is owned by
  the overlay and destroyed in `beforeDestroy()`.
- `content` uses `toNodes()`; components inside it are destroyed when the step changes or the
  overlay is destroyed.

### Spotlight

A transparent element at the target rect with:

```css
box-shadow: 0 0 0 9999px var(--slice-tour-dim);
border-radius: var(--slice-tour-radius);
```

This dims everything except the target. `padding` grows the rect; `radius` default reads the
target's computed `border-radius` (fallback 8px). `spotlight: false` uses a full dim layer.

### Placement

`placeCard(targetRect, cardRect, placement, viewport, margin)`:

1. Try the requested side.
2. Flip to the opposite side when it would overflow.
3. Shift along the perpendicular axis to stay inside the viewport.
4. Place the arrow at the target's centre, clamped to the card's rounded corners.
5. `auto`: choose the side with the most room (bottom → top → right → left).
6. Recompute on scroll/resize and after the card's content settles (fonts, images, dynamic content).

If the card would not fit anywhere (tiny viewport), center it and drop the arrow.

This helper starts inside `TourOverlay` (or `shared/overlay/placeNear.js` if it proves reusable).
`TooltipCore.computePosition` is the reference for flip/shift, but the tour card has its own arrow
and width rules, so v1 does not refactor ToolTip.

## 8. Modes: modal vs interactive

| | `modal` (default) | `interactive` |
| --- | --- | --- |
| Page clicks | blocked by `.slice-tour__dim` | pass through (`pointer-events: none` on dim) |
| Focus | trapped in the card | stays on the page; card reachable by Tab |
| Scroll | locked with `lockScroll()` | free |
| Use | explain a visible target | "click X to continue" |
| Card role | `role="dialog" aria-modal="true"` | `role="dialog" aria-modal="false"` (or region) |
| Escape | stops the tour | stops the tour |

Switching modes on a step:

- entering `interactive`: release the scroll lock, release the trap, set `pointer-events: none` on
  the dim, do not steal focus; announce the instruction politely;
- leaving `interactive`: restore the previous mode, lock/trap again, focus the card.

The service owns this switch; the overlay only reflects `data-mode`.

### Interactive step with a menu

```js
const tour = await slice.build('TourService', { singleton: true, sliceId: 'tour' });

tour.start([
  {
    target: '.filters-panel',
    anchor: '#filters-button',
    title: 'Open the filters',
    content: 'Click Filters to see the options.',
    interactive: true,
    waitFor: '.filters-panel',
    timeout: 15000,
    fallback: 'skip',
  },
  {
    target: '.filters-panel .status-filter',
    title: 'Filter by status',
    content: 'Pick one or more.',
  },
]);
```

While `.filters-panel` does not exist, the card points at `#filters-button`, the page is clickable
and the user can open the menu. When the panel appears, the card moves to it and the tour continues.
No focus is stolen from the menu, so it does not close.

### Auto-revealed target with tabs

```js
{
  target: '#advanced-panel .api-key',
  title: 'Your API key',
  content: 'Copy it from here.',
  beforeStep: async ({ tour }) => {
    await tabs.select('advanced');     // the lazy panel builds now
  },
  waitFor: '#advanced-panel .api-key',
  timeout: 3000,
}
```

The tour stays modal; the app opened the panel before the card is shown.

## 9. Accessibility

- **Modal:** the card is a dialog named by its title and described by its content; focus moves to
  the first action (or the card) on show; Tab cycles inside; Escape stops; focus returns to the
  element that was focused before `start()`.
- **Interactive:** the card does not steal focus. It is announced through a polite live region
  ("Step 2 of 5: Open the filters. Click Filters to continue."). The Skip button is reachable by Tab
  but does not take focus automatically. The target's own accessible behavior is untouched.
- The spotlight is decorative. Its meaning is always in the card's text.
- Progress is text, not only dots. The current step is announced on change, not on every scroll.
- `prefers-reduced-motion`: no smooth scroll, no card/spotlight transitions, no arrow movement.
- The dim layer never makes the target unreadable for a screen reader; the dialog content is the
  source of truth.
- Every control is a real `Button`/`Icon` with an accessible name; the close button says "Close
  tour", not just "×".
- If the target is missing, the fallback card still names the step and offers Skip/Close; it never
  traps the user on a blank overlay.

## 10. Modals and nested layers (v1 rule)

Do not start a tour on top of an open `Modal` in v1. Two supported patterns:

1. **Split the tour.** Step 1 highlights the button that opens the modal. The tour ends with
   `reason: 'handoff'`; the app opens the modal; a second tour starts inside/after the modal.
2. **Controlled modal.** If the app controls the modal with `open: true`, `beforeStep` can open it
   and the tour can continue, but the modal's focus trap and the tour's trap must not both run:
   the tour becomes `interactive` or yields focus to the modal. This is an advanced case; document
   it, do not optimize it in v1.

A tour over a `Lightbox`, a `DropDown` or a `Select` menu is the same class of problem; prefer the
interactive step or a split.

## 11. Persistence

- `storageKey` stores `{ completedAt, version }` in `localStorage` through `StorageService` when
  available, or `localStorage` directly as a fallback.
- Completed tours are skipped on `start()` unless `force: true`.
- `reset(key)` removes the entry; `reset()` uses the current key.
- A tour stopped mid-way is **not** marked completed; the next `start()` begins again.
- The key belongs to the app; use a version suffix (`products-tour-v2`) when the steps change.
- Storage failures never break the tour (private mode, quota); log once and continue.

## 12. Theming

CSS variables on `.slice-tour` (all with theme fallbacks):

```css
--slice-tour-dim: rgb(0 0 0 / .55);
--slice-tour-card-bg: var(--primary-background-color);
--slice-tour-card-fg: var(--font-primary-color);
--slice-tour-accent: var(--primary-color);
--slice-tour-radius: 14px;
--slice-tour-card-width: 360px;
--slice-tour-arrow: 10px;
--slice-tour-z: 12000;
```

The card uses the same surface, border, shadow and radius language as `Card`/`Modal`. The spotlight
uses the dim token, not a hard-coded black. The arrow is a rotated square or a CSS triangle that
matches the card surface.

## 13. Files and integration

New files:

```text
src/Components/Service/TourService/TourService.js
src/Components/Visual/TourOverlay/TourOverlay.js
src/Components/Visual/TourOverlay/TourOverlay.html
src/Components/Visual/TourOverlay/TourOverlay.css
src/Components/Service/TourService/TourService.spec.js
src/Components/Visual/TourOverlay/TourOverlay.spec.js
src/markdown/tour-service.md
```

Shared helpers (only if extracted):

```text
src/Components/shared/overlay/focusTrap.js   (from Modal, shared by both)
src/Components/shared/overlay/placeNear.js   (flip/shift/arrow; optional)
```

Integration:

- Register both in `src/Components/components.js` (the parser syncs it).
- Add `tour-service.md` to `src/markdown/`; run `docs:lint-md`, `docs:generate`, `docs:agent`.
- `TourOverlay` needs a docs page too? The user-facing page is `tour-service.md`; the overlay is
  internal-ish but registered. Its props are documented inside the service page (like Toast/ToastProvider).
- Update `WANTED_COMPONENTS.md` and the feature when shipped.
- Add the component to the skill's `component-selection.md` and the catalog when shipped.
- Generate the OG card for `/docs/services/tour-service`.

## 14. Test plan

### Unit (node:test)

- Step normalization: defaults, invalid `placement`/`fallback`, `timeout`.
- `beforeStep` returning `false`, `{ target }`, or throwing.
- `storageKey`: completed skip, `force`, `reset`, storage failure.
- `stopOnRouteChange` and reasons.
- `start()` while active replaces the previous tour.
- `next/prev` boundaries and completion.
- `target` as selector, Element, function.
- `waitFor` timeout → fallback skip/center.
- `interactive` mode flags.

### E2E (Playwright, real runtime)

- Modal step: spotlight rect, card position, progress, Next/Back, Escape, focus return.
- Interactive step: card at anchor, page clickable, menu opens, target appears, card moves, menu stays
  open (focus not stolen).
- `beforeStep` opens a tab with a lazy panel; the card waits and lands on the target.
- Async target: `waitFor` resolves after a fetch; timeout path.
- Missing target: skip and centered fallback.
- Target inside a scroll container: scrollIntoView and re-measure.
- Resize/scroll: spotlight follows the target.
- Reduced motion: no smooth scroll/transitions.
- Texts en/es; translator switch while a step is visible.
- Persistence: second `start()` skips; `force` replays; `reset` replays.
- Destroy while active: overlay, observers, listeners and scroll lock are gone; focus restored.
- A second `TourService` warns and does not double-render.
- Modal handoff: Step 1 ends with `handoff`; the modal opens; a second tour starts.

## 15. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Target moves while open | rAF-coalesced scroll/resize/ResizeObserver updates. |
| Menu closes when focus moves | interactive mode never steals focus; use `anchor`. |
| Page inert in modal mode | interactive mode for user actions; split tours for modals. |
| Focus trap conflict with Modal | v1 rule: no tour on an open Modal; split or interactive. |
| Popover not supported | fixed + high z-index fallback; still top layer via `popover` where available. |
| Long/async `beforeStep` | `preparing` state; timeout; skip/error reasons. |
| Nested scroll containers | scrollIntoView + ResizeObserver on the target and offset parents. |
| Reduced motion | one branch: no smooth scroll/transitions; state changes are instant. |
| Target removed between steps | always re-resolve; `waitFor` or fallback. |
| Storage unavailable | try/catch; continue without persistence; log once. |
| Overlay above app modals | v1 does not support it; document the split-tour pattern. |

## 16. Design decisions (resolved)

- **One Visual + one Service.** `TourOverlay` paints; `TourService` orchestrates. Not a monolithic
  component, not a service that writes HTML.
- **Not a native modal `<dialog>` for the whole tour.** The overlay is a fixed/popover layer with
  `modal` and `interactive` modes; modal mode adds the trap and scroll lock. This is what makes
  "click X to continue" possible.
- **Singleton, one active tour.** `start()` replaces; multiple named tours share the service.
- **Interactive steps are v1.** `interactive: true`, `anchor`, `waitFor`; no focus stealing.
- **`beforeStep` is app code.** It can open tabs/drawers/controlled menus and fetch; it is not a
  generic "click this selector" command.
- **`waitFor` waits, it does not open.** `anchor` holds the card while the user acts.
- **No tours over modals in v1.** Split the flow or use the controlled-modal advanced path.
- **Progress is text/dots, not `ProgressBar`.** The tour does not depend on a component that is not
  shipped yet.
- **Reuse `Button`, `Icon`, `lockScroll`, `toNodes`, `texts`.** New code is the overlay/card, the
  spotlight and the service.
- **Extract the focus trap only if needed.** If the tour needs the same trap as Modal, extract it to
  `shared/overlay/focusTrap.js` and migrate Modal in the same change; otherwise keep the trap local
  and note the duplication.

## 17. Open questions (for implementation)

- Does `TourOverlay` own the `<dialog>`/popover element, or does the service create the host and the
  overlay only renders the card? The design assumes the overlay owns its host (easier to test).
- Should `start()` return a promise that resolves on end (like `Modal.show()`)? The design says yes;
  a caller may want `await tour.start(...)`.
- Should `storageKey` live on `start` options or on the service? On `start` options, so one service
  can run several named tours.
- Should the card use `Button` components or native buttons with the shared class? `Button` for
  consistency; it costs a few child components and must be destroyed with the overlay.
- Should `interactive` be per step or per tour? Per step, with the service restoring the previous
  mode; a per-tour option can force all steps interactive later.
