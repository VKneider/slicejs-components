---
title: TourService
route: /docs/services/tour-service
navLabel: TourService
section: Services
group: Interaction
order: 38
description: Guide people through existing UI with a spotlight, anchored step cards, interactive steps, async targets, accessible focus and remembered completion.
component: TourServiceDocumentation
generate: true
tags: [tour, onboarding, spotlight, walkthrough, guide, interactive, overlay, service]
---

# TourService

## Overview

`TourService` explains an existing interface one step at a time. It builds one `TourOverlay`, highlights the current target, places a card beside it, and owns navigation, focus, scrolling and completion storage. Reuse one singleton for several named tours.

```js
const tour = await slice.build('TourService', { singleton: true, sliceId: 'tour' });
const result = await tour.start([
   { target: '#create-project', title: 'Create a project', content: 'Start your next project here.' },
   { target: '#project-list', title: 'Your projects', content: 'Open a project to continue working.' },
], { storageKey: 'projects-intro-v1' });
// result: { completed: true, reason: 'completed' }, or an interruption reason.
```

### When to use it

- Introduce three to seven controls during onboarding.
- Explain a newly released feature beside its actual control.
- Ask someone to open a menu, then explain the panel they revealed.

### When not to use it

Use `Stepper` with `mode: 'static'` for an explanation that stays in the page, or `mode: 'interactive'` for progress through a task, and `ToolTip` for a short hint. A tour does not replace clear labels, normal navigation or a form's validation. Multi-page and branching tours are outside v1.

## Methods and state

| API | Contract |
| --- | --- |
| `start(steps, options)` | Promise resolving **when the tour ends** with `{ completed, reason }`. Starting again replaces the active tour. |
| `next()` / `prev()` | Move forward/back; return the service. Ignored while a step is preparing. Back at the first step stays there. |
| `stop(reason = 'stopped')` | End without recording completion; returns the service. Custom reasons such as `handoff` are supported. |
| `reset(storageKey?)` | Forget completion for that key, or the last key used. Returns the service. |
| `index` | Current index, starting at zero; `-1` while idle. |
| `isActive` | Whether a run is active, including preparation. |
| `currentStep` | Normalized current step, or `null`. |
| `overlay` | The live `TourOverlay`, or `null`; useful for diagnostics. |

The Next button on the final step becomes Done. Skip skips **one step**; skipping the final step ends with `skipped`. Close and Escape end with `stopped`. Missing steps are skipped by default; exhausting them ends with `target-missing` and does not record completion. Only Done (or `next()` from the last active step) records completion.

## Step definition

| Field | Meaning |
| --- | --- |
| `target` | Selector, connected `Element`, or synchronous function returning either. Re-resolved on every step and while tracking. |
| `title`, `content` | Title is text. Content is text, a DOM node, a Slice component, or an array of these. Strings are never interpreted as HTML. |
| `placement` | `auto` (default), `top`, `bottom`, `left`, `right`; flips and shifts to fit. Centers when no side fits. |
| `padding`, `radius` | Spotlight padding in pixels (default 8); corner radius defaults to the target's computed radius. |
| `spotlight` | `false` dims the full page without a cutout. |
| `interactive` | `true` keeps the page clickable and scrollable, without stealing focus. Default is modal. |
| `anchor` | Optional target for the card while waiting for the real target. |
| `waitFor` | Selector/Element or async predicate `({ tour, step, index, signal }) => boolean`. Waits for readiness **and** a visible target. It does not open anything. |
| `timeout` | Waiting / hook timeout in milliseconds; default 5000. |
| `fallback` | `skip` (default) or `center` when the target cannot be found. |
| `onTargetMissing` | Called with the step before applying its fallback. |
| `beforeStep` | Async hook `({ tour, step, index, signal })`; return `false` to skip or `{ target }` to override the target. |
| `afterStep` | Async hook with the same arguments when Next/Back/Skip leaves the step. Not run by `stop()`; clean external resources in your owning component. |
| `texts` | Override this step's built-in labels. |
| `data` | App data carried by the step for hooks. |

Hooks receive an `AbortSignal`. Stop/replacement aborts outstanding work; app code should honor the signal when fetching or updating external state. Hook errors/timeouts end with `error`, log through `slice.logger` and release the overlay. A `waitFor` timeout applies the missing-target fallback. Visibility requires a connected element with layout and visible computed visibility. Keep target functions inexpensive and side-effect free.

## Start options

| Option | Default / meaning |
| --- | --- |
| `storageKey` | Optional versioned app key, e.g. `projects-intro-v2`. Stores `{ completedAt, version: 1 }` in localStorage. |
| `force` | `false`; replay a completed tour. Otherwise `start()` resolves immediately with `completed`. |
| `stopOnRouteChange` | `true`; `router:change` ends with `route`. |
| `padding`, `spotlight` | Defaults for each step; 8 and true. |
| `texts` | Tour-wide labels, overridden by each step's `texts`. |
| `focusTrap`, `lockScroll` | `true` for modal steps; interactive steps always release both. |
| `scrollIntoView` | `true`; instant centered scrolling, including nested scroll containers, before the final measurement. No smooth animation or delayed positioning. |
| `animate` | `true`; glide the card and spotlight between steps. `false` applies every position immediately. |
| `duration` | `300` ms for the entrance and the stage glide between steps. `0` disables the glide. |
| `maxCardWidth` | 360 pixels, constrained by the viewport. |
| `onStart({ steps })` | Run started. |
| `onStep({ step, index })` | Target is ready or a centered fallback is shown. |
| `onEnd({ completed, reason, index })` | Completion/interruption, after cleanup. |

Storage failures are logged once and never prevent the tour. A stopped tour starts again from the beginning. One active tour is enforced across service instances; a second live service warns to encourage a singleton.

### Events

`slice.events` emits `tour:start` (`{ steps, id }`), `tour:step` (`{ step, index, total }`), and `tour:end` (`{ completed, reason, index }`). Standard reasons are `completed`, `skipped`, `stopped`, `replaced`, `route`, `target-missing`, and `error`.

## Live examples

Both examples build `TourDemo`, a self-contained workspace fixture, then create the tour against
its internal controls. In a real app, use your own selectors or elements in each step.

:::script label="Workspace introduction — modal tour" expected="A detailed project workspace. Take the tour introduces navigation, metrics, project creation and project cards, with focus trapping and Back/Next controls."
const demo = await slice.build('TourDemo', { tour: 'overview' });
const tour = await slice.build('TourService', { singleton: true, sliceId: 'docsTour' });
const data = { demo: demo.sliceId };

const steps = [
   { target: demo.targets.nav, placement: 'right', data,
     title: 'A home for your team', content: 'Projects, people and your weekly overview live together in this workspace.' },
   { target: demo.targets.metrics, placement: 'bottom', data,
     title: 'See the big picture', content: 'Keep an eye on active projects, completed tasks and the people moving your work forward.' },
   { target: demo.targets.create, placement: 'bottom', data,
     title: 'Give your next idea a home', content: 'Start a project here. Your team can add tasks and work together as it takes shape.' },
   { target: demo.targets.projects, placement: 'top', data,
     title: 'Pick up where you left off', content: 'Each card brings together a project’s purpose, status, owner and next deadline.' },
];

demo.onLaunch = () => tour.start(steps, { maxCardWidth: 340 });
return demo;
:::

:::script label="Find your focus — interactive tour" expected="The same workspace with an interactive walkthrough. Open Filters, change the project status or search, then prepare an export summary without losing access to page controls."
const demo = await slice.build('TourDemo', { tour: 'interactive' });
const tour = await slice.build('TourService', { singleton: true, sliceId: 'docsTour' });
const data = { demo: demo.sliceId };

const steps = [
   { target: () => demo.targets.filters.hidden ? null : demo.targets.filters,
     anchor: demo.targets.filtersButton, waitFor: () => !demo.targets.filters.hidden,
     interactive: true, timeout: 30000, placement: 'top', data,
     title: 'Make room for what matters', content: 'Click Filters in the project toolbar. The page stays interactive while this card waits for the panel.' },
   { target: demo.targets.status, beforeStep: () => demo.toggleFilters(true), interactive: true, placement: 'top', data,
     title: 'Narrow your view', content: 'Choose In progress or In review. Search projects to see the cards update immediately.' },
   { target: demo.targets.export, interactive: true, placement: 'top', data,
     title: 'Share the essentials', content: 'Click Export summary to prepare a short summary of the projects you can see, then finish.' },
];

demo.onLaunch = () => {
   demo.clearFilters();
   demo.toggleFilters(false);
   return tour.start(steps, { maxCardWidth: 340 });
};
return demo;
:::

`TourDemo` exposes `targets` (its internal controls), `toggleFilters(open?)`, `clearFilters()`,
`exportSummary()` and `launch()`. Both examples request the same singleton (`docsTour`), so starting
one closes the other. The fixture also owns the default tours used by its own tests; the examples
replace them through `onLaunch`.

## Async setup

Open app-controlled panels in `beforeStep`, then let `waitFor` confirm the target is visible. A preparation card is shown while the hook runs. Keep hooks idempotent so Back works too.

```js
{
   target: '#advanced-panel .api-key',
   title: 'Your API key',
   content: 'Copy it here.',
   beforeStep: async ({ signal }) => {
      await openAdvancedTab({ signal }); // your app's operation
   },
   waitFor: '#advanced-panel .api-key',
   timeout: 5000,
   fallback: 'center',
}
```

## Accessibility and lifecycle

Modal mode uses a named dialog card, an inert page, a Tab trap and the shared scroll lock. Interactive mode keeps page controls reachable and announces the step politely without moving focus. Escape always closes; modal ArrowLeft/ArrowRight and PageUp/PageDown navigate, Home/End jump to the first/last step, while input fields keep their editing keys. Native Button controls support Enter and Space. Progress is text. Reduced motion and `animate: false` remove the card and spotlight motion; scrolling is instant in all modes.

Targets are remeasured while the tour is visible, including layout shifts and nested scrolling. A removed target is resolved again using the same wait/fallback rules. Content components are owned by the overlay and destroyed on step change or stop: pass fresh content if you replay a step containing components. The overlay's Button/Icon children, tracking frame, timers, listeners, inert state, pending wait and scroll lock are all released on stop or `beforeDestroy()`. App-owned target components are never destroyed.

### Modal handoff

Do not run a modal tour above an open native modal dialog. End the tour first, open the modal, and put the explanation inside the modal's own content:

```js
tour.stop('handoff');
modal.open = true;
```

Interactive steps can yield to page-owned controls, but coordinating a tour over a modal's top layer is outside v1. The service rejects modal steps while a native modal is open.

## Texts and translation

Built-in controls use `slice.tour.*`, with English and Spanish defaults. Labels and progress update when the locale changes. The priority is step `texts` → start `texts` → app dictionary → library default. Keys: `next`, `back`, `skip`, `done`, `close`, `progress` (`{index}`, `{total}`), `preparing`, `missing`. Titles and content belong to the app; supply localized content when starting a tour.

## Theming

Set CSS variables on `slice-tour-overlay` (or its `.slice-tour-overlay` layer): `--slice-tour-dim`, `--slice-tour-card-bg`, `--slice-tour-card-fg`, `--slice-tour-accent`, `--slice-tour-radius`, `--slice-tour-card-width`, `--slice-tour-arrow`, `--slice-tour-z`. Colors fall back to the app's theme tokens; the card stays within the viewport and scrolls for long content. The card enters and glides between steps over `duration` (300ms by default); `prefers-reduced-motion` and `animate: false` remove that motion.

## TourOverlay integration

Install/register `TourService`, `TourOverlay`, `Button`, and `Icon`. TourOverlay is the service's renderer; normally let the service build it. Its `view` object has `step`, `index`, `total`, `preparing`, `missing`, `texts`, `maxCardWidth`, and `focusTrap`. Its handler props are `onNext`, `onPrev`, `onSkip`, `onClose`. `show()` connects and opens its manual popover (fixed-position fallback); `track(rect)` accepts `{ left, top, right, bottom, width, height, radius }` or `null` for a centered card. Rect updates do not reannounce content. The service owns modal focus and page inertness.
