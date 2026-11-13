# Component coverage study — mainstream libraries vs Slice.js

**Status:** research note. It records a comparison and a recommendation; it does not approve building
anything. New work is captured in `features/` and `WANTED_COMPONENTS.md` first.

**Question:** which components do mainstream UI libraries ship that Slice.js does not, and which of
those gaps are worth closing for common product work?

**Sources compared (inventories, not APIs):**

- [shadcn/ui components](https://ui.shadcn.com/docs/components) and its AI Elements set.
- [MUI v9 components](https://mui.com/material-ui/all-components/) (Material UI + MUI X).
- [Ant Design v6 components](https://ant.design/components/overview).
- [Chakra UI v3 components](https://chakra-ui.com/docs/components/concepts/overview).
- Slice.js Components: `src/Components/components.js` and the Markdown pages in `src/markdown/`.

The inventories move; the job map is the durable part. When a library adds a component, ask which
*user job* it serves before deciding Slice needs it.

## 1. Method

1. **Normalize by job, not by name.** "Autocomplete", "Combobox", "Cascader" and "TreeSelect" are
   different names for a few jobs: *pick one from a long list*, *pick one from a hierarchy*, *enter
   a value that may not exist yet*.
2. **Map each job to Slice.** Four outcomes:
   - ✅ **component** — an official Slice component covers it.
   - 🧩 **composition** — existing components plus a small, documented amount of glue. Do not build a
     component until the same composition repeats across products.
   - ⛔ **gap** — no good answer today, and the job is common or expensive to get right (a11y,
     keyboard, focus, positioning, async).
   - ➖ **not a component** — CSS, platform API, or a product decision. Do not add it.
3. **Score gaps** by frequency × accessibility/behavior risk × reuse × fit with the Slice model.
4. **Prefer one of:** a component (visual), a service (headless orchestration), a composition recipe,
   or "use an external library / leave it to the app".

## 2. Coverage matrix

Legend: ✅ component · 🧩 composition · ⛔ gap · ➖ not a component.

### Foundations and layout

| Job | Slice answer | Status | Notes |
| --- | --- | --- | --- |
| App shell with bar, sidebar, main, aside, footer | `Layout` + `Navbar` / `SideMenu` | ✅ | Landmarks, skip link, drawer collapse, sticky header. |
| Responsive rows/columns, spans, named areas | `Grid` | ✅ | Breakpoints measured on the container, not the window. |
| Simple flex/stack/center/container | CSS | ➖ | Do not wrap every flexbox in a component. |
| Accordion / collapsible section | `Details` | ✅ | Native `summary`/`details` behavior and styling. |
| Resizable split panes (IDE/dashboard) | pointer events + `Layout` | ⛔ | `Splitter` is common in Chakra/Ant/shadcn; no Slice answer. |
| Divider / separator | CSS border | ➖ | A `Divider` component adds nothing over a border token. |
| Aspect ratio | CSS `aspect-ratio` | ➖ | |
| Masonry | CSS columns / `Grid` | 🧩 | Do not build until a real product needs it. |
| Sticky header / affix | `Layout` `stickyHeader`, `Navbar` | ✅ | |
| Section heading with eyebrow, actions, rules | `SectionHeader` | ✅ | `titleStyle: underline | rule` covers portfolio-style title lines. |
| Benefits / services / plan checklist | `FeatureList` | ✅ | Use `Card` when each item is an object with actions. |

### Actions, navigation and commands

| Job | Slice answer | Status | Notes |
| --- | --- | --- | --- |
| Action button with icon and variants | `Button` | ✅ | |
| Icon-only button | `Button` + `icon` + `aria-label` | ✅ | Tooltip recommended. |
| Segmented control / toggle group | `RadioGroup` `variant: 'buttons'` | ✅ | Use `RadioGroup`, not a second control. |
| Button group / split button | `Button`s in a flex row; `DropDown` for the menu | 🧩 | Build only if the menu-button pattern repeats. |
| Top navigation | `Navbar` | ✅ | Mobile panel, `panelContent`, current-page indicator. |
| Side navigation / docs tree | `SideMenu`, `TreeView`, `Layout` sidebar | ✅ | |
| Bottom tabs (mobile) | `BottomNav` | ✅ | |
| Tabs with panels | `Tabs` | ✅ | Lazy panels, closable tabs, URL/local state. |
| Breadcrumbs | `Breadcrumbs` | ✅ | |
| Pagination | `Pagination` | ✅ | Built into `Table` and `DataList` too. |
| Table of contents / anchor list | app-level `MyNavigation` pattern | 🧩 | No registry component; `SideMenu`/`TreeView` cover most cases. |
| Dropdown menu | `DropDown` | ✅ | Menu items, keyboard, placement. |
| Context menu | `DropDown` + `contextmenu` glue | 🧩 | Positioning and dismissal are the hard parts; build if it repeats. |
| Popover with arbitrary content | `DropDown` / `Modal` `layout: 'top'` | 🧩 | A generic anchored `Popover` is a gap, but many cases are menus or dialogs. |
| Tooltip / toggle tip | `ToolTip` + `ToolTipProvider` | ✅ | One provider, warm-up, top layer. |
| Command palette / command menu | `Modal` `layout: 'top'` + `Input` + `DataList`/`TreeView` | 🧩 | Keyboard model, async commands and empty states are the work; candidate for a component. |
| Wizard / stepper | `Stepper` static/interactive; `Form` steps | 🧩 | Implemented: current/done/error, gating and keyboard. Browser validation pending; Steps was merged without an alias. |
| Tour / coachmark / onboarding spotlight | none | ⛔ | No mainstream standard either; driver.js/Shepherd are standalone. `TourService` is implemented, awaiting browser validation; see [`TOUR-SERVICE-DESIGN.md`](./TOUR-SERVICE-DESIGN.md). |

### Inputs and forms

| Job | Slice answer | Status | Notes |
| --- | --- | --- | --- |
| Text / multiline input | `Input`, `Textarea` | ✅ | Labels, help, error, validation. |
| Form with schema, validation, groups, steps | `Form` | ✅ | Values, errors, step gating, groups. |
| Pick one from a list | `Select` | ✅ | Search, groups, clear, virtual, server-loaded. |
| Pick several / tags / create new | `Select` `multiple`, `creatable` | ✅ | Chips in the field, max, select all. |
| Pick a date or a date range | `DatePicker` `mode: 'range'` | ✅ | Inline calendar, presets, min/max, disabled days. |
| Pick a time | none | ⛔ | Niche in business apps; use `Select` or a native time input until a real case appears. |
| Pick a color | `ColorPicker` | ✅ | |
| Checkbox / radio / switch | `Checkbox`, `RadioGroup`, `Switch` | ✅ | Radio has card and buttons variants. |
| Slider | `Slider` | ✅ | |
| Number input with steppers | `Input` + `type="number"` | 🧩 | A dedicated NumberInput is nice-to-have, not urgent. |
| OTP / PIN input | none | ⛔ | Small, common in auth; could be a small component later. |
| File upload | `FileUpload` | ✅ | |
| Rating | `Rating` | ✅ | Halves, labels, read-only, tones. |
| Rich text editor | external (Tiptap, etc.) | ➖ | Out of scope; `HtmlService` sanitizes output. |
| Signature pad | none | ➖ | Too niche. |

### Data display

| Job | Slice answer | Status | Notes |
| --- | --- | --- | --- |
| Table with sort, filter, search, selection, totals, virtual, editing | `Table` | ✅ | This is the deep data surface. |
| Records as rows/cards with search, views, filters, groups, bulk, CRUD | `DataList` | ✅ | Better than `Table` on phones and for record-level actions. |
| One record's key/value properties | `DescriptionList` | ✅ | |
| Hierarchy / folders / tree | `TreeView` + `TreeItem` | ✅ | |
| JSON inspection | `JsonViewer` | ✅ | |
| Code with highlighting | `CodeVisualizer` | ✅ | |
| Heatmap / activity grid | `Heatmap` | ✅ | Calendar and grid types. |
| Charts (line, bar, area, pie) | external | ➖ | A charting engine is a different product. Use a library inside a `Card`. |
| Map | external | ➖ | |
| KPI / stat card | `Card` + app markup | 🧩 | A tiny `Stat` component is plausible; not a priority. |
| Progress (determinate/indeterminate) | native `<progress>` / `Loading` | ⛔ | `ProgressBar` is already a wanted component and a quick win. |
| Skeleton while loading | `SkeletonService` | ✅ | Draws the shape from the real component. |
| Empty / no results | `EmptyState` | ✅ | |
| Success / result page | `EmptyState` + `Alert` | 🧩 | A `Result` component is a common composition; not urgent. |
| Image with aspect ratio, lazy, srcset | `<img>` / `Avatar` | 🧩 | A small `Image` component is plausible; the hard parts are full-screen viewing. |
| Image gallery / carousel / lightbox | `ElementCarrousel` + `Lightbox` | 🧩 | A `Gallery` facade could compose both; don't add a second carousel. |
| Video / audio player | external | ➖ | Heavy and platform-specific. |
| QR code / watermark | external | ➖ | Niche. |

### Feedback, status and overlays

| Job | Slice answer | Status | Notes |
| --- | --- | --- | --- |
| Inline status message | `Alert` | ✅ | Live region, tones, dismiss. |
| Static note / tip / warning inside content | `Callout` | ✅ | Not a live region; part of the page's text. |
| Temporary confirmation | `Toast` + `ToastProvider` | ✅ | Pooled, positions, undo-friendly. |
| Destructive confirmation | `ConfirmActionModal` | ✅ | Promise, reasons, focus return. |
| Modal / dialog | `Modal` | ✅ | Centred, top, drawer, sheet, fullscreen, scroll lock. |
| Full-screen image | `Lightbox` | ✅ | Zoom, pan, swipe, captions, thumbnails. |
| Spinner / busy state | `Loading` | ✅ | |
| 404 / not found | `NotFound` | ✅ | |
| Persistent notification center | `Toast` + `DataList`/`Modal` | 🧩 | Transient is covered; a persistent inbox is product-specific. |
| Global banner | `Alert` | 🧩 | Pin an `Alert` at the top; no separate component needed yet. |
| Onboarding checklist | `FeatureList`/`Stepper` + storage | 🧩 | Product-specific. |
| Tour spotlight | none | ⛔ | `TourService` implemented, awaiting browser validation; design in [`TOUR-SERVICE-DESIGN.md`](./TOUR-SERVICE-DESIGN.md). |

### Services and utilities

| Job | Slice answer | Status |
| --- | --- | --- |
| HTTP with retries, auth, errors | `FetchManager` | ✅ |
| Local storage / IndexedDB | `LocalStorageManager`, `StorageService`, `IndexedDbManager` | ✅ |
| DOM helpers | `DomService` | ✅ |
| Drag and drop | `DragDropService` | ✅ |
| Download / export | `FileDownloadService` | ✅ |
| Sanitize HTML | `HtmlService` | ✅ |
| Query string | `QueryService` | ✅ |
| Keyboard shortcuts | `ShortcutService` | ✅ |
| Realtime channel | `RealtimeService` | ✅ |
| Infinite scroll | `InfiniteScrollService` | ✅ |
| Data grid engine (headless) | `DataGridEngine` | ✅ |
| Unsaved changes guard | `UnsavedChangesGuard` | ✅ |
| Clipboard | `navigator.clipboard` + `Toast` | 🧩 |
| Tour orchestration | none | ⛔ |

### AI surfaces (new in mainstream libraries)

shadcn/ui now ships an AI Elements set: chat, message, prompt input, reasoning, tool, sources,
citations, model selector, plan, queue, confirmation, checkpoint, terminal. Chakra and Ant do not.
This is a real product direction, not a mainstream baseline yet.

| Job | Slice answer | Status | Notes |
| --- | --- | --- | --- |
| Chat thread / messages | none | ⛔ | Could be a `Chat`/`MessageList` composition; do not rush. |
| Prompt composer with attachments, model, send/stop | `Input`/`Textarea` + `Button` + `FileUpload` | 🧩 | A `PromptInput` facade might earn its place. |
| Streaming response + tool calls + citations | none | ⛔ | Product-specific and fast-moving. |
| Approval before an agent acts | `ConfirmActionModal` | ✅ | Already a good primitive. |

## 3. What the comparison says

Slice is already strong where it matters most:

- **App shell, navigation, layout** — `Layout`, `Navbar`, `SideMenu`, `BottomNav`, `Tabs`,
  `Breadcrumbs`, `Pagination`, `Grid`.
- **Data work** — `Table` and `DataList` are deeper than the same-name components in most libraries:
  sorting, filtering, selection, CRUD, rollback, undo, server data, virtualization, remembered state.
- **Forms** — `Form` with schema, validation, groups and steps; `Select` with search, multiple,
  creatable and server-loaded options; `DatePicker` with ranges.
- **Feedback** — `Alert` vs `Callout` vs `Toast` is a clean separation most libraries blur.
- **Services** — HTTP, storage, DOM, drag/drop, download, shortcuts, realtime, infinite scroll,
  sanitization, unsaved changes.

The gaps cluster in four places:

1. **Orchestration of overlays and attention** — tours, command palettes, generic popovers, context
   menus. These are behavior-heavy and hard to hand-roll well.
2. **Progress and process** — `ProgressBar`, a stateful `Stepper`.
3. **Media and image workflows** — `Image`/`Gallery` as a composition, not a new carousel.
4. **AI chat** — a new surface that is not yet a mainstream baseline; watch it.

## 4. Ranked gaps

Priority is "reuse × frequency × a11y/behavior risk × fit", not "how many libraries have it".

| Rank | Gap | Why it matters | Shape | Cost | Recommendation |
| --- | --- | --- | --- | --- | --- |
| 1 | **ProgressBar** | Every upload, import, onboarding and long task; native `<progress>` is ugly and inflexible. | Visual | S | Implemented; browser/OG validation pending (0003). |
| 2 | **Stepper** | One static/interactive process component for explanations, checkout and setup; Steps was merged. | Visual | M | Implemented; browser/OG validation pending (0005). |
| 3 | **TourService** | Onboarding, feature discovery, release tours. No good native primitive; driver.js/Shepherd are separate. | Service + one overlay Visual | L | Implemented; browser validation pending. See [`TOUR-SERVICE-DESIGN.md`](./TOUR-SERVICE-DESIGN.md). |
| 4 | **CommandPalette** | Apps with many actions/routes; ⌘K is a user expectation. Keyboard, async search and empty states are the hard part. | Visual/composition | M | Build as a component (Modal `top` + Input + list) or a documented recipe first. |
| 5 | **SplitPane / Resizable** | Dashboards, IDEs, side-by-side review. Layout has no drag handle. | Visual | M | Build if a product needs it; pointer + keyboard model is real work. |
| 6 | **Gallery** | Product/portfolio galleries need carousel + full-screen + captions + alt. | Composition | S-M | Try `ElementCarrousel` + `Lightbox` first; build a facade only if it repeats. |
| 7 | **Popover / ContextMenu** | Arbitrary anchored content and right-click menus. `DropDown` is a menu, not a general popover. | Visual | M | Build a shared `Popover` primitive; `ContextMenu` can follow. |
| 8 | **AI chat surface** | AI assistants are growing; streaming, tools, citations and approval are not covered. | Composition | L | Watch; start with `Chat`/`PromptInput` only when a product needs it. |
| 9 | **OTP / PIN, NumberInput, TimePicker, TransferList, Stat, Result** | Common but smaller; each has a workaround. | Visual | S-M | Pick from evidence, not parity. |
| 10 | **Charts, maps, video, rich text, calendar/scheduler, kanban** | Big products of their own. | External / app | — | Do not build; document the integration. |

## 5. `TourService` — implemented, awaiting browser validation

**Why a Service, not a Visual component:** a tour has no markup of its own in the page's content. It
orchestrates a spotlight, a step card, focus, scroll and persistence across arbitrary targets. That
is the same shape as `ToastProvider` (a Service that owns transient UI), not a Card-like component.

**API overview (full guide: `src/markdown/tour-service.md`):**

```js
const tour = await slice.build('TourService', { singleton: true, sliceId: 'tour' });

tour.start([
   { target: '#new-project', title: 'Create a project', content: 'Start here.', placement: 'bottom' },
   { target: '.filters', title: 'Filter the list', content: 'Narrow it down.' },
   { target: '#export', title: 'Export', content: 'Download what you see.' },
], {
   storageKey: 'products-tour-v1',
   padding: 8,
   onEnd: ({ completed, index }) => {},
});
```

- `target`: a selector, an `Element`, or a function returning one. If it is missing, the step either
  skips (default) or shows a centred card (`fallback: 'center'`).
- Step props: `title`, `content`, `placement` (`top`, `bottom`, `left`, `right`, `auto`), `padding`,
  `spotlight`, `interactive`, `anchor`, `beforeStep`, `afterStep`, `waitFor` (async target).
- Controls: Next / Back / Skip / Done, progress ("2 of 5"), keyboard (Escape, arrows, Enter), focus
  trap in the step card, focus return to the opener.
- Overlay: dimmed page with a spotlight cutout; recompute on scroll/resize; `prefers-reduced-motion`.
- Persistence: `storageKey` remembers completion; `reset()` forgets it.
- Events: `tour:start`, `tour:step`, `tour:end`, plus `onStart`/`onStep`/`onEnd`.
- Texts in English and Spanish with `texts` overrides, like every other component.
- Uses the existing tokens and z-index language; never creates a new visual style.
- Out of scope for v1: multi-page tours, analytics, A/B experiments, recording, and a visual builder.

Why it is worth it: mainstream libraries do not agree on a tour (Ant has one; MUI/shadcn/Chakra do
not), and the hand-rolled versions are usually inaccessible. A Slice service can own the hard part
(spotlight + focus + positioning + persistence) while staying small.

## 6. Recommended sequence

1. **ProgressBar** and **Stepper** — implemented; complete browser/OG validation before shipping.
2. **TourService** — the user-facing idea with the strongest "Slice shape" and no clear standard.
3. **CommandPalette** and **SplitPane** — high value in app shells and dashboards; require design
   work (keyboard, focus, pointer).
4. **Gallery** — only if the same carousel + lightbox composition appears in real products.
5. **AI chat** — only when a product actually ships one; do not build a speculative AI kit.

Do not build: charts, maps, video/audio players, rich-text editors, calendars/schedulers, kanban,
watermarks, QR codes. Use an external library and wrap it in `Card`/`Modal` if needed.

## 7. Follow-ups

- The selection rules distilled from this study live in the skill:
  `repos/slice.js_docs/skill/slice-js-developer/references/component-selection.md`.
- `TourService` is implemented but **blocked on browser validation** in
  [`features/0019-component-tour-service.md`](../features/0019-component-tour-service.md), with the
  approved design in [`TOUR-SERVICE-DESIGN.md`](./TOUR-SERVICE-DESIGN.md). The real-browser gate and new OG card remain pending.
- Revisit this table when a library adds a component that maps to a job users actually ask for, not
  when a release note adds a name.
