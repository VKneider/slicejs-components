export default class TourServiceDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"Workspace introduction — modal tour","expected":"A detailed project workspace. Take the tour introduces navigation, metrics, project creation and project cards, with focus trapping and Back/Next controls.","kind":"script","content":"const demo = await slice.build('TourDemo', { tour: 'overview' });\nconst tour = await slice.build('TourService', { singleton: true, sliceId: 'docsTour' });\nconst data = { demo: demo.sliceId };\n\nconst steps = [\n   { target: demo.targets.nav, placement: 'right', data,\n     title: 'A home for your team', content: 'Projects, people and your weekly overview live together in this workspace.' },\n   { target: demo.targets.metrics, placement: 'bottom', data,\n     title: 'See the big picture', content: 'Keep an eye on active projects, completed tasks and the people moving your work forward.' },\n   { target: demo.targets.create, placement: 'bottom', data,\n     title: 'Give your next idea a home', content: 'Start a project here. Your team can add tasks and work together as it takes shape.' },\n   { target: demo.targets.projects, placement: 'top', data,\n     title: 'Pick up where you left off', content: 'Each card brings together a project’s purpose, status, owner and next deadline.' },\n];\n\ndemo.onLaunch = () => tour.start(steps, { maxCardWidth: 340 });\nreturn demo;"},{"label":"Find your focus — interactive tour","expected":"The same workspace with an interactive walkthrough. Open Filters, change the project status or search, then prepare an export summary without losing access to page controls.","kind":"script","content":"const demo = await slice.build('TourDemo', { tour: 'interactive' });\nconst tour = await slice.build('TourService', { singleton: true, sliceId: 'docsTour' });\nconst data = { demo: demo.sliceId };\n\nconst steps = [\n   { target: () => demo.targets.filters.hidden ? null : demo.targets.filters,\n     anchor: demo.targets.filtersButton, waitFor: () => !demo.targets.filters.hidden,\n     interactive: true, timeout: 30000, placement: 'top', data,\n     title: 'Make room for what matters', content: 'Click Filters in the project toolbar. The page stays interactive while this card waits for the panel.' },\n   { target: demo.targets.status, beforeStep: () => demo.toggleFilters(true), interactive: true, placement: 'top', data,\n     title: 'Narrow your view', content: 'Choose In progress or In review. Search projects to see the cards update immediately.' },\n   { target: demo.targets.export, interactive: true, placement: 'top', data,\n     title: 'Share the essentials', content: 'Click Export summary to prepare a short summary of the projects you can see, then finish.' },\n];\n\ndemo.onLaunch = () => {\n   demo.clearFilters();\n   demo.toggleFilters(false);\n   return tour.start(steps, { maxCardWidth: 340 });\n};\nreturn demo;"}];
  }

  async init() {
    this.markdownPath = "tour-service.md";
    this.markdownContent = "---\ntitle: TourService\nroute: /docs/services/tour-service\nnavLabel: TourService\nsection: Services\ngroup: Interaction\norder: 38\ndescription: Guide people through existing UI with a spotlight, anchored step cards, interactive steps, async targets, accessible focus and remembered completion.\ncomponent: TourServiceDocumentation\ngenerate: true\ntags: [tour, onboarding, spotlight, walkthrough, guide, interactive, overlay, service]\n---\n\n# TourService\n\n## Overview\n\n`TourService` explains an existing interface one step at a time. It builds one `TourOverlay`, highlights the current target, places a card beside it, and owns navigation, focus, scrolling and completion storage. Reuse one singleton for several named tours.\n\n```js\nconst tour = await slice.build('TourService', { singleton: true, sliceId: 'tour' });\nconst result = await tour.start([\n   { target: '#create-project', title: 'Create a project', content: 'Start your next project here.' },\n   { target: '#project-list', title: 'Your projects', content: 'Open a project to continue working.' },\n], { storageKey: 'projects-intro-v1' });\n// result: { completed: true, reason: 'completed' }, or an interruption reason.\n```\n\n### When to use it\n\n- Introduce three to seven controls during onboarding.\n- Explain a newly released feature beside its actual control.\n- Ask someone to open a menu, then explain the panel they revealed.\n\n### When not to use it\n\nUse `Stepper` with `mode: 'static'` for an explanation that stays in the page, or `mode: 'interactive'` for progress through a task, and `ToolTip` for a short hint. A tour does not replace clear labels, normal navigation or a form's validation. Multi-page and branching tours are outside v1.\n\n## Methods and state\n\n| API | Contract |\n| --- | --- |\n| `start(steps, options)` | Promise resolving **when the tour ends** with `{ completed, reason }`. Starting again replaces the active tour. |\n| `next()` / `prev()` | Move forward/back; return the service. Ignored while a step is preparing. Back at the first step stays there. |\n| `stop(reason = 'stopped')` | End without recording completion; returns the service. Custom reasons such as `handoff` are supported. |\n| `reset(storageKey?)` | Forget completion for that key, or the last key used. Returns the service. |\n| `index` | Current index, starting at zero; `-1` while idle. |\n| `isActive` | Whether a run is active, including preparation. |\n| `currentStep` | Normalized current step, or `null`. |\n| `overlay` | The live `TourOverlay`, or `null`; useful for diagnostics. |\n\nThe Next button on the final step becomes Done. Skip skips **one step**; skipping the final step ends with `skipped`. Close and Escape end with `stopped`. Missing steps are skipped by default; exhausting them ends with `target-missing` and does not record completion. Only Done (or `next()` from the last active step) records completion.\n\n## Step definition\n\n| Field | Meaning |\n| --- | --- |\n| `target` | Selector, connected `Element`, or synchronous function returning either. Re-resolved on every step and while tracking. |\n| `title`, `content` | Title is text. Content is text, a DOM node, a Slice component, or an array of these. Strings are never interpreted as HTML. |\n| `placement` | `auto` (default), `top`, `bottom`, `left`, `right`; flips and shifts to fit. Centers when no side fits. |\n| `padding`, `radius` | Spotlight padding in pixels (default 8); corner radius defaults to the target's computed radius. |\n| `spotlight` | `false` dims the full page without a cutout. |\n| `interactive` | `true` keeps the page clickable and scrollable, without stealing focus. Default is modal. |\n| `anchor` | Optional target for the card while waiting for the real target. |\n| `waitFor` | Selector/Element or async predicate `({ tour, step, index, signal }) => boolean`. Waits for readiness **and** a visible target. It does not open anything. |\n| `timeout` | Waiting / hook timeout in milliseconds; default 5000. |\n| `fallback` | `skip` (default) or `center` when the target cannot be found. |\n| `onTargetMissing` | Called with the step before applying its fallback. |\n| `beforeStep` | Async hook `({ tour, step, index, signal })`; return `false` to skip or `{ target }` to override the target. |\n| `afterStep` | Async hook with the same arguments when Next/Back/Skip leaves the step. Not run by `stop()`; clean external resources in your owning component. |\n| `texts` | Override this step's built-in labels. |\n| `data` | App data carried by the step for hooks. |\n\nHooks receive an `AbortSignal`. Stop/replacement aborts outstanding work; app code should honor the signal when fetching or updating external state. Hook errors/timeouts end with `error`, log through `slice.logger` and release the overlay. A `waitFor` timeout applies the missing-target fallback. Visibility requires a connected element with layout and visible computed visibility. Keep target functions inexpensive and side-effect free.\n\n## Start options\n\n| Option | Default / meaning |\n| --- | --- |\n| `storageKey` | Optional versioned app key, e.g. `projects-intro-v2`. Stores `{ completedAt, version: 1 }` in localStorage. |\n| `force` | `false`; replay a completed tour. Otherwise `start()` resolves immediately with `completed`. |\n| `stopOnRouteChange` | `true`; `router:change` ends with `route`. |\n| `padding`, `spotlight` | Defaults for each step; 8 and true. |\n| `texts` | Tour-wide labels, overridden by each step's `texts`. |\n| `focusTrap`, `lockScroll` | `true` for modal steps; interactive steps always release both. |\n| `scrollIntoView` | `true`; instant centered scrolling, including nested scroll containers, before the final measurement. No smooth animation or delayed positioning. |\n| `animate` | `true`; glide the card and spotlight between steps. `false` applies every position immediately. |\n| `duration` | `300` ms for the entrance and the stage glide between steps. `0` disables the glide. |\n| `maxCardWidth` | 360 pixels, constrained by the viewport. |\n| `onStart({ steps })` | Run started. |\n| `onStep({ step, index })` | Target is ready or a centered fallback is shown. |\n| `onEnd({ completed, reason, index })` | Completion/interruption, after cleanup. |\n\nStorage failures are logged once and never prevent the tour. A stopped tour starts again from the beginning. One active tour is enforced across service instances; a second live service warns to encourage a singleton.\n\n### Events\n\n`slice.events` emits `tour:start` (`{ steps, id }`), `tour:step` (`{ step, index, total }`), and `tour:end` (`{ completed, reason, index }`). Standard reasons are `completed`, `skipped`, `stopped`, `replaced`, `route`, `target-missing`, and `error`.\n\n## Live examples\n\nBoth examples build `TourDemo`, a self-contained workspace fixture, then create the tour against\nits internal controls. In a real app, use your own selectors or elements in each step.\n\n:::script label=\"Workspace introduction — modal tour\" expected=\"A detailed project workspace. Take the tour introduces navigation, metrics, project creation and project cards, with focus trapping and Back/Next controls.\"\nconst demo = await slice.build('TourDemo', { tour: 'overview' });\nconst tour = await slice.build('TourService', { singleton: true, sliceId: 'docsTour' });\nconst data = { demo: demo.sliceId };\n\nconst steps = [\n   { target: demo.targets.nav, placement: 'right', data,\n     title: 'A home for your team', content: 'Projects, people and your weekly overview live together in this workspace.' },\n   { target: demo.targets.metrics, placement: 'bottom', data,\n     title: 'See the big picture', content: 'Keep an eye on active projects, completed tasks and the people moving your work forward.' },\n   { target: demo.targets.create, placement: 'bottom', data,\n     title: 'Give your next idea a home', content: 'Start a project here. Your team can add tasks and work together as it takes shape.' },\n   { target: demo.targets.projects, placement: 'top', data,\n     title: 'Pick up where you left off', content: 'Each card brings together a project’s purpose, status, owner and next deadline.' },\n];\n\ndemo.onLaunch = () => tour.start(steps, { maxCardWidth: 340 });\nreturn demo;\n:::\n\n:::script label=\"Find your focus — interactive tour\" expected=\"The same workspace with an interactive walkthrough. Open Filters, change the project status or search, then prepare an export summary without losing access to page controls.\"\nconst demo = await slice.build('TourDemo', { tour: 'interactive' });\nconst tour = await slice.build('TourService', { singleton: true, sliceId: 'docsTour' });\nconst data = { demo: demo.sliceId };\n\nconst steps = [\n   { target: () => demo.targets.filters.hidden ? null : demo.targets.filters,\n     anchor: demo.targets.filtersButton, waitFor: () => !demo.targets.filters.hidden,\n     interactive: true, timeout: 30000, placement: 'top', data,\n     title: 'Make room for what matters', content: 'Click Filters in the project toolbar. The page stays interactive while this card waits for the panel.' },\n   { target: demo.targets.status, beforeStep: () => demo.toggleFilters(true), interactive: true, placement: 'top', data,\n     title: 'Narrow your view', content: 'Choose In progress or In review. Search projects to see the cards update immediately.' },\n   { target: demo.targets.export, interactive: true, placement: 'top', data,\n     title: 'Share the essentials', content: 'Click Export summary to prepare a short summary of the projects you can see, then finish.' },\n];\n\ndemo.onLaunch = () => {\n   demo.clearFilters();\n   demo.toggleFilters(false);\n   return tour.start(steps, { maxCardWidth: 340 });\n};\nreturn demo;\n:::\n\n`TourDemo` exposes `targets` (its internal controls), `toggleFilters(open?)`, `clearFilters()`,\n`exportSummary()` and `launch()`. Both examples request the same singleton (`docsTour`), so starting\none closes the other. The fixture also owns the default tours used by its own tests; the examples\nreplace them through `onLaunch`.\n\n## Async setup\n\nOpen app-controlled panels in `beforeStep`, then let `waitFor` confirm the target is visible. A preparation card is shown while the hook runs. Keep hooks idempotent so Back works too.\n\n```js\n{\n   target: '#advanced-panel .api-key',\n   title: 'Your API key',\n   content: 'Copy it here.',\n   beforeStep: async ({ signal }) => {\n      await openAdvancedTab({ signal }); // your app's operation\n   },\n   waitFor: '#advanced-panel .api-key',\n   timeout: 5000,\n   fallback: 'center',\n}\n```\n\n## Accessibility and lifecycle\n\nModal mode uses a named dialog card, an inert page, a Tab trap and the shared scroll lock. Interactive mode keeps page controls reachable and announces the step politely without moving focus. Escape always closes; modal ArrowLeft/ArrowRight and PageUp/PageDown navigate, Home/End jump to the first/last step, while input fields keep their editing keys. Native Button controls support Enter and Space. Progress is text. Reduced motion and `animate: false` remove the card and spotlight motion; scrolling is instant in all modes.\n\nTargets are remeasured while the tour is visible, including layout shifts and nested scrolling. A removed target is resolved again using the same wait/fallback rules. Content components are owned by the overlay and destroyed on step change or stop: pass fresh content if you replay a step containing components. The overlay's Button/Icon children, tracking frame, timers, listeners, inert state, pending wait and scroll lock are all released on stop or `beforeDestroy()`. App-owned target components are never destroyed.\n\n### Modal handoff\n\nDo not run a modal tour above an open native modal dialog. End the tour first, open the modal, and put the explanation inside the modal's own content:\n\n```js\ntour.stop('handoff');\nmodal.open = true;\n```\n\nInteractive steps can yield to page-owned controls, but coordinating a tour over a modal's top layer is outside v1. The service rejects modal steps while a native modal is open.\n\n## Texts and translation\n\nBuilt-in controls use `slice.tour.*`, with English and Spanish defaults. Labels and progress update when the locale changes. The priority is step `texts` → start `texts` → app dictionary → library default. Keys: `next`, `back`, `skip`, `done`, `close`, `progress` (`{index}`, `{total}`), `preparing`, `missing`. Titles and content belong to the app; supply localized content when starting a tour.\n\n## Theming\n\nSet CSS variables on `slice-tour-overlay` (or its `.slice-tour-overlay` layer): `--slice-tour-dim`, `--slice-tour-card-bg`, `--slice-tour-card-fg`, `--slice-tour-accent`, `--slice-tour-radius`, `--slice-tour-card-width`, `--slice-tour-arrow`, `--slice-tour-z`. Colors fall back to the app's theme tokens; the card stays within the viewport and scrolls for long content. The card enters and glides between steps over `duration` (300ms by default); `prefers-reduced-motion` and `animate: false` remove that motion.\n\n## TourOverlay integration\n\nInstall/register `TourService`, `TourOverlay`, `Button`, and `Icon`. TourOverlay is the service's renderer; normally let the service build it. Its `view` object has `step`, `index`, `total`, `preparing`, `missing`, `texts`, `maxCardWidth`, and `focusTrap`. Its handler props are `onNext`, `onPrev`, `onSkip`, `onClose`. `show()` connects and opens its manual popover (fixed-position fallback); `track(rect)` accepts `{ left, top, right, bottom, width, height, radius }` or `null` for a centered card. Rect updates do not reannounce content. The service owns modal focus and page inertness.\n\n:::related\n- [Tooltip](/docs/display/tooltip) - The small, in-place explanation.\n- [Modal](/docs/feedback/modal) - The step that needs a real dialog.\n- [Stepper](/docs/display/stepper) - A multi-step flow inside the page.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            const code = await slice.build('CodeVisualizer', {
               value: "const tour = await slice.build('TourService', { singleton: true, sliceId: 'tour' });\nconst result = await tour.start([\n   { target: '#create-project', title: 'Create a project', content: 'Start your next project here.' },\n   { target: '#project-list', title: 'Your projects', content: 'Open a project to continue working.' },\n], { storageKey: 'projects-intro-v1' });\n// result: { completed: true, reason: 'completed' }, or an interruption reason.",
               language: "js"
            });
            if (null) {
               const label = document.createElement('div');
               label.classList.add('code-block-title');
               label.textContent = null;
               container.appendChild(label);
            }
            container.appendChild(code);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-2"]');
         if (container) {
            const lines = ["| API | Contract |","| --- | --- |","| `start(steps, options)` | Promise resolving **when the tour ends** with `{ completed, reason }`. Starting again replaces the active tour. |","| `next()` / `prev()` | Move forward/back; return the service. Ignored while a step is preparing. Back at the first step stays there. |","| `stop(reason = 'stopped')` | End without recording completion; returns the service. Custom reasons such as `handoff` are supported. |","| `reset(storageKey?)` | Forget completion for that key, or the last key used. Returns the service. |","| `index` | Current index, starting at zero; `-1` while idle. |","| `isActive` | Whether a run is active, including preparation. |","| `currentStep` | Normalized current step, or `null`. |","| `overlay` | The live `TourOverlay`, or `null`; useful for diagnostics. |"];
            const clean = (line) => {
               let value = line.trim();
               if (value.startsWith('|')) {
                  value = value.slice(1);
               }
               if (value.endsWith('|')) {
                  value = value.slice(0, -1);
               }
               // An escaped pipe (|) is a character inside the cell - a union
               // type, a value in prose - not a column break. Splitting on it
               // dropped every column after it (the description, usually).
               // (No regex here: this code lives in a template string, so every
               // backslash would have to be doubled, and a missed one shipped a
               // broken regex that killed the whole page.)
               const ESCAPED_PIPE = String.fromCharCode(92) + '|';
               const MARK = String.fromCharCode(1);
               return value
                  .split(ESCAPED_PIPE)
                  .join(MARK)
                  .split('|')
                  .map((cell) => cell.split(MARK).join('|').trim());
            };

            const formatCell = (text) => {
               let output = text
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');

               const applyBold = (input) => {
                  let result = '';
                  let index = 0;
                  while (index < input.length) {
                     const start = input.indexOf('**', index);
                     if (start === -1) {
                        result += input.slice(index);
                        break;
                     }
                     const end = input.indexOf('**', start + 2);
                     if (end === -1) {
                        result += input.slice(index);
                        break;
                     }
                     result += input.slice(index, start) + '<strong>' + input.slice(start + 2, end) + '</strong>';
                     index = end + 2;
                  }
                  return result;
               };

               const applyInlineCode = (input) => {
                  const parts = input.split(String.fromCharCode(96));
                  if (parts.length === 1) return input;
                  return parts
                     .map((part, idx) => (idx % 2 === 1 ? '<code>' + part + '</code>' : part))
                     .join('');
               };

               output = applyBold(output);
               output = applyInlineCode(output);
               // Internal links arrived as tokens; turn them into the same
               // placeholders the page replaces with Link components.
               output = output.replace(/SLICE_INLINE_LINK_(\d+)_TOKEN/g, '<span data-inline-link="$1"></span>');
               // External/unsafe links left in the cell become plain anchors.
               output = output.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => {
                  if (!/^(?:https?:\/\/|\/\/|\/|#|mailto:|tel:)/i.test(href)) return label;
                  const external = /^(?:https?:\/\/|\/\/)/i.test(href);
                  const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
                  return '<a href="' + href.replace(/"/g, '&quot;') + '"' + attrs + '>' + label + '</a>';
               });
               return output;
            };

            const headers = lines.length > 0 ? clean(lines[0]) : [];
            // Cells carry trusted inline markup (code/bold) from the parser, so
            // they use Table's explicit { html } opt-in (Table escapes plain strings).
            const rows = lines.slice(2).map((line) => clean(line).map((cell) => ({ html: formatCell(cell) })));
            const table = await slice.build('Table', { headers, rows });
            container.appendChild(table);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-3"]');
         if (container) {
            const lines = ["| Field | Meaning |","| --- | --- |","| `target` | Selector, connected `Element`, or synchronous function returning either. Re-resolved on every step and while tracking. |","| `title`, `content` | Title is text. Content is text, a DOM node, a Slice component, or an array of these. Strings are never interpreted as HTML. |","| `placement` | `auto` (default), `top`, `bottom`, `left`, `right`; flips and shifts to fit. Centers when no side fits. |","| `padding`, `radius` | Spotlight padding in pixels (default 8); corner radius defaults to the target's computed radius. |","| `spotlight` | `false` dims the full page without a cutout. |","| `interactive` | `true` keeps the page clickable and scrollable, without stealing focus. Default is modal. |","| `anchor` | Optional target for the card while waiting for the real target. |","| `waitFor` | Selector/Element or async predicate `({ tour, step, index, signal }) => boolean`. Waits for readiness **and** a visible target. It does not open anything. |","| `timeout` | Waiting / hook timeout in milliseconds; default 5000. |","| `fallback` | `skip` (default) or `center` when the target cannot be found. |","| `onTargetMissing` | Called with the step before applying its fallback. |","| `beforeStep` | Async hook `({ tour, step, index, signal })`; return `false` to skip or `{ target }` to override the target. |","| `afterStep` | Async hook with the same arguments when Next/Back/Skip leaves the step. Not run by `stop()`; clean external resources in your owning component. |","| `texts` | Override this step's built-in labels. |","| `data` | App data carried by the step for hooks. |"];
            const clean = (line) => {
               let value = line.trim();
               if (value.startsWith('|')) {
                  value = value.slice(1);
               }
               if (value.endsWith('|')) {
                  value = value.slice(0, -1);
               }
               // An escaped pipe (|) is a character inside the cell - a union
               // type, a value in prose - not a column break. Splitting on it
               // dropped every column after it (the description, usually).
               // (No regex here: this code lives in a template string, so every
               // backslash would have to be doubled, and a missed one shipped a
               // broken regex that killed the whole page.)
               const ESCAPED_PIPE = String.fromCharCode(92) + '|';
               const MARK = String.fromCharCode(1);
               return value
                  .split(ESCAPED_PIPE)
                  .join(MARK)
                  .split('|')
                  .map((cell) => cell.split(MARK).join('|').trim());
            };

            const formatCell = (text) => {
               let output = text
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');

               const applyBold = (input) => {
                  let result = '';
                  let index = 0;
                  while (index < input.length) {
                     const start = input.indexOf('**', index);
                     if (start === -1) {
                        result += input.slice(index);
                        break;
                     }
                     const end = input.indexOf('**', start + 2);
                     if (end === -1) {
                        result += input.slice(index);
                        break;
                     }
                     result += input.slice(index, start) + '<strong>' + input.slice(start + 2, end) + '</strong>';
                     index = end + 2;
                  }
                  return result;
               };

               const applyInlineCode = (input) => {
                  const parts = input.split(String.fromCharCode(96));
                  if (parts.length === 1) return input;
                  return parts
                     .map((part, idx) => (idx % 2 === 1 ? '<code>' + part + '</code>' : part))
                     .join('');
               };

               output = applyBold(output);
               output = applyInlineCode(output);
               // Internal links arrived as tokens; turn them into the same
               // placeholders the page replaces with Link components.
               output = output.replace(/SLICE_INLINE_LINK_(\d+)_TOKEN/g, '<span data-inline-link="$1"></span>');
               // External/unsafe links left in the cell become plain anchors.
               output = output.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => {
                  if (!/^(?:https?:\/\/|\/\/|\/|#|mailto:|tel:)/i.test(href)) return label;
                  const external = /^(?:https?:\/\/|\/\/)/i.test(href);
                  const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
                  return '<a href="' + href.replace(/"/g, '&quot;') + '"' + attrs + '>' + label + '</a>';
               });
               return output;
            };

            const headers = lines.length > 0 ? clean(lines[0]) : [];
            // Cells carry trusted inline markup (code/bold) from the parser, so
            // they use Table's explicit { html } opt-in (Table escapes plain strings).
            const rows = lines.slice(2).map((line) => clean(line).map((cell) => ({ html: formatCell(cell) })));
            const table = await slice.build('Table', { headers, rows });
            container.appendChild(table);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-4"]');
         if (container) {
            const lines = ["| Option | Default / meaning |","| --- | --- |","| `storageKey` | Optional versioned app key, e.g. `projects-intro-v2`. Stores `{ completedAt, version: 1 }` in localStorage. |","| `force` | `false`; replay a completed tour. Otherwise `start()` resolves immediately with `completed`. |","| `stopOnRouteChange` | `true`; `router:change` ends with `route`. |","| `padding`, `spotlight` | Defaults for each step; 8 and true. |","| `texts` | Tour-wide labels, overridden by each step's `texts`. |","| `focusTrap`, `lockScroll` | `true` for modal steps; interactive steps always release both. |","| `scrollIntoView` | `true`; instant centered scrolling, including nested scroll containers, before the final measurement. No smooth animation or delayed positioning. |","| `animate` | `true`; glide the card and spotlight between steps. `false` applies every position immediately. |","| `duration` | `300` ms for the entrance and the stage glide between steps. `0` disables the glide. |","| `maxCardWidth` | 360 pixels, constrained by the viewport. |","| `onStart({ steps })` | Run started. |","| `onStep({ step, index })` | Target is ready or a centered fallback is shown. |","| `onEnd({ completed, reason, index })` | Completion/interruption, after cleanup. |"];
            const clean = (line) => {
               let value = line.trim();
               if (value.startsWith('|')) {
                  value = value.slice(1);
               }
               if (value.endsWith('|')) {
                  value = value.slice(0, -1);
               }
               // An escaped pipe (|) is a character inside the cell - a union
               // type, a value in prose - not a column break. Splitting on it
               // dropped every column after it (the description, usually).
               // (No regex here: this code lives in a template string, so every
               // backslash would have to be doubled, and a missed one shipped a
               // broken regex that killed the whole page.)
               const ESCAPED_PIPE = String.fromCharCode(92) + '|';
               const MARK = String.fromCharCode(1);
               return value
                  .split(ESCAPED_PIPE)
                  .join(MARK)
                  .split('|')
                  .map((cell) => cell.split(MARK).join('|').trim());
            };

            const formatCell = (text) => {
               let output = text
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;');

               const applyBold = (input) => {
                  let result = '';
                  let index = 0;
                  while (index < input.length) {
                     const start = input.indexOf('**', index);
                     if (start === -1) {
                        result += input.slice(index);
                        break;
                     }
                     const end = input.indexOf('**', start + 2);
                     if (end === -1) {
                        result += input.slice(index);
                        break;
                     }
                     result += input.slice(index, start) + '<strong>' + input.slice(start + 2, end) + '</strong>';
                     index = end + 2;
                  }
                  return result;
               };

               const applyInlineCode = (input) => {
                  const parts = input.split(String.fromCharCode(96));
                  if (parts.length === 1) return input;
                  return parts
                     .map((part, idx) => (idx % 2 === 1 ? '<code>' + part + '</code>' : part))
                     .join('');
               };

               output = applyBold(output);
               output = applyInlineCode(output);
               // Internal links arrived as tokens; turn them into the same
               // placeholders the page replaces with Link components.
               output = output.replace(/SLICE_INLINE_LINK_(\d+)_TOKEN/g, '<span data-inline-link="$1"></span>');
               // External/unsafe links left in the cell become plain anchors.
               output = output.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => {
                  if (!/^(?:https?:\/\/|\/\/|\/|#|mailto:|tel:)/i.test(href)) return label;
                  const external = /^(?:https?:\/\/|\/\/)/i.test(href);
                  const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
                  return '<a href="' + href.replace(/"/g, '&quot;') + '"' + attrs + '>' + label + '</a>';
               });
               return output;
            };

            const headers = lines.length > 0 ? clean(lines[0]) : [];
            // Cells carry trusted inline markup (code/bold) from the parser, so
            // they use Table's explicit { html } opt-in (Table escapes plain strings).
            const rows = lines.slice(2).map((line) => clean(line).map((cell) => ({ html: formatCell(cell) })));
            const table = await slice.build('Table', { headers, rows });
            container.appendChild(table);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-7"]');
         if (container) {
            const code = await slice.build('CodeVisualizer', {
               value: "{\n   target: '#advanced-panel .api-key',\n   title: 'Your API key',\n   content: 'Copy it here.',\n   beforeStep: async ({ signal }) => {\n      await openAdvancedTab({ signal }); // your app's operation\n   },\n   waitFor: '#advanced-panel .api-key',\n   timeout: 5000,\n   fallback: 'center',\n}",
               language: "js"
            });
            if (null) {
               const label = document.createElement('div');
               label.classList.add('code-block-title');
               label.textContent = null;
               container.appendChild(label);
            }
            container.appendChild(code);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-8"]');
         if (container) {
            const code = await slice.build('CodeVisualizer', {
               value: "tour.stop('handoff');\nmodal.open = true;",
               language: "js"
            });
            if (null) {
               const label = document.createElement('div');
               label.classList.add('code-block-title');
               label.textContent = null;
               container.appendChild(label);
            }
            container.appendChild(code);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-9"]');
         if (container) {
            const items = [{"title":"Tooltip","path":"/docs/display/tooltip","text":"The small, in-place explanation."},{"title":"Modal","path":"/docs/feedback/modal","text":"The step that needs a real dialog."},{"title":"Stepper","path":"/docs/display/stepper","text":"A multi-step flow inside the page."}];
            const cards = [];
            for (const item of items) {
               const card = await slice.build('Card', {
                  title: item.title,
                  text: item.text || '',
                  // The small mark beside the title, not the banner: a page
                  // of four related links should not be four big arrows.
                  headerIcon: 'arrow-right',
                  interactive: true,
                  onClick: () => {
                     if (/^https?:/i.test(item.path)) {
                        window.open(item.path, '_blank', 'noopener,noreferrer');
                     } else {
                        slice.router.navigate(item.path);
                     }
                  }
               });
               if (card) cards.push(card);
            }
            const grid = await slice.build('Grid', {
               columns: items.length === 4 ? 2 : Math.min(3, Math.max(1, cards.length)),
               gap: '14px',
               items: cards
            });
            if (grid) container.appendChild(grid);
         }
      }
    await this.renderScriptScenarios();
  }

  async update() {
    // Refresh dynamic content here if needed
  }

   beforeDestroy() {
     for (const link of this._inlineLinks) {
       if (typeof slice.isComponentAlive !== 'function' || slice.isComponentAlive(link)) {
         slice.controller.destroyComponent(link);
       }
     }
     this._inlineLinks = [];
   }

  async setupCopyButton() {
    const container = this.querySelector('[data-copy-md]');
    if (!container) return;

    const copyMenu = await slice.build('CopyMarkdownMenu', {
      markdownPath: this.markdownPath,
      markdownContent: this.markdownContent,
      label: 'Copy as markdown'
    });

    container.appendChild(copyMenu);
  }

  async renderScriptScenarios() {
    if (!Array.isArray(this.scriptScenarios) || this.scriptScenarios.length === 0) return;
    const host = this.querySelector('.documentation-content');
    if (!host) return;

    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

      // Render where the author put the :::script blocks.
      //
      // The markdown parser already emits one <div class="script-block"> at the
      // position of each block, in document order, and those divs come from the same
      // parse as this.scriptScenarios â€” so the counts always line up. They used to be
      // ignored: every scenario was appended in one lump to the end of
      // .documentation-content under a second, generated <h2>Prop Scenarios</h2>. The
      // result was that the heading an author wrote sat over nothing at all â€” the divs
      // were never filled, nothing in the repo reads .script-block â€” the real demos were
      // exiled below the props table, and 38 of 53 pages showed the heading twice.
      const blocks = [...this.querySelectorAll('.script-block')];
      const inPlace = blocks.length === this.scriptScenarios.length;

      const section = document.createElement('section');
      if (!inPlace) {
         // Fallback, kept so a future parser change that desyncs the two cannot
         // silently drop every demo. An author-placed heading already exists in the
         // in-place case, so only invent one when we are building the section.
         section.classList.add('doc-script-scenarios');

         const title = document.createElement('h2');
         title.textContent = 'Prop Scenarios';
         section.appendChild(title);

         const subtitle = document.createElement('p');
         subtitle.classList.add('doc-script-subtitle');
         subtitle.textContent = 'Interactive demos validating component behavior.';
         section.appendChild(subtitle);
      }
      for (const [index, scenario] of this.scriptScenarios.entries()) {
      const demobox = await slice.build('DemoBox', {
        label: scenario.label,
        expected: scenario.expected || ''
      });

      const code = await slice.build('CodeVisualizer', {
        value: scenario.content,
        language: 'javascript'
      });

      const errorMessage = document.createElement('p');
      errorMessage.classList.add('doc-script-error');
      errorMessage.hidden = true;

      const executeScenario = async () => {
        demobox.clear();
        errorMessage.hidden = true;
        errorMessage.textContent = '';

        const createBuildFallbackNode = (name) => {
          const fallback = document.createElement('div');
          fallback.style.padding = '10px';
          fallback.style.border = '1px dashed var(--warning-color)';
          fallback.style.borderRadius = '8px';
          fallback.style.background = 'color-mix(in srgb, var(--primary-background-color) 85%, var(--warning-color))';
          fallback.style.color = 'var(--font-primary-color)';
          fallback.textContent = String(name || '')
            ? 'Component "' + String(name) + '" is not registered in this build yet.'
            : 'Requested component is not registered in this build yet.';
          return fallback;
        };

        const safeSlice = Object.create(slice);
        safeSlice.build = async (name, props) => {
          const built = await slice.build(name, props);
          if (built instanceof Node) {
            return built;
          }
          if (Array.isArray(built)) {
            const fragment = document.createDocumentFragment();
            let hasNode = false;
            built.forEach((item) => {
              if (item instanceof Node) {
                fragment.appendChild(item);
                hasNode = true;
              }
            });
            if (hasNode) {
              return fragment;
            }
          }
          return built ?? createBuildFallbackNode(name);
        };

        const mount = (node) => {
          if (node instanceof Node) {
            demobox.appendDemo(node);
          }
        };

        try {
          const fn = new AsyncFunction('component', 'slice', 'document', 'mount', scenario.content);
          const result = await fn(this, safeSlice, document, mount);

          if (result instanceof Node) {
            demobox.appendDemo(result);
          } else if (Array.isArray(result)) {
            result.forEach((item) => {
              if (item instanceof Node) {
                demobox.appendDemo(item);
              }
            });
          }
        } catch (error) {
          errorMessage.textContent = 'Live preview error: ' + error.message;
          errorMessage.hidden = false;
        }
      };
      (inPlace ? blocks[index] : section).appendChild(demobox);
      demobox.appendCode(code);
      (inPlace ? blocks[index] : section).appendChild(errorMessage);

      await executeScenario();
    }
      if (!inPlace) host.appendChild(section);
  }
}

customElements.define('slice-tourservicedocumentation', TourServiceDocumentation);
