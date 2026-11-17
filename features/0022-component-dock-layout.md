---
id: "0022"
title: "Component: DockLayout"
repo: "slicejs-components"
status: blocked
area: components
priority: medium
created: 2026-11-16
updated: 2026-11-16
target: "next release"
owners: []
related:
  - "features/0020-component-split-pane.md"
  - "src/Components/Visual/DockLayout/DockLayout.js"
  - "src/markdown/dock-layout.md"
---

# Component: DockLayout

## Summary
A generic dockable workspace composed of Tabs and SplitPane. Move existing tab entries and content between groups without rebuilding them; split a group at an edge, resize and serialize the arrangement.

## Problem / motivation
Tabs and SplitPane supply the views, but applications otherwise repeat transfer ownership, drop targets, empty-group pruning, focus restoration and persistence glue.

## Proposed direction
Props: `items` (Tabs descriptors, with live node or lazy `panel`), `layout` (serializable group/split tree), `disabled`, `draggable`, `closable`, `minPanelSize`, `ariaLabel`, `texts`, `onChange`, `onBeforeClose`, `onClose`. Methods: async `moveTab(id, groupId, {position,index})`, `closeTab(id)`, `restoreLayout(tree)`, plus `getLayout()` and `getTabs(groupId)`.

Groups: `{type:'group',id,label?,tabs:['a','b'],activeTab:'a'}`. Splits: `{type:'split',id,orientation,sizes,children:[...]}`. Content is separate from the JSON tree. Validate globally unique IDs and tab membership before committing.

### States and accessibility
Empty, single/multiple groups, dragging with insertion/edge preview, disabled, lazy content loading, closing veto and invalid restore. Pointer capture supports mouse/pen/touch; Escape/pointercancel cancel before mutation. Keyboard reorder/move/split and visible move controls provide alternatives to drag. Tabs/separators keep their existing ARIA patterns; changes are announced politely; texts ship en/es. Restore focus/selection/scroll after moving DOM. No decorative motion required.

## Alternatives
Application glue is suitable for one fixed layout. A reusable component is justified here by the user's explicit request. Reuse Tabs/SplitPane rather than implement another tab strip or splitter.

## Scope
Reordering, cross-group moves within one workspace, four split edges, pruning empty groups, close/veto, JSON export/restore, stable live content, pointer/keyboard and docs demo. Floating windows, cross-workspace dragging, docking external URLs and automatic storage are out of scope.

## Compatibility and risk
Additive APIs: Tabs.moveTab and SplitPane.releasePanels. Controller 4.x stores parent indexes; ownership transfers must unlink old indexes and re-register with the new owner before the source can be destroyed. Lazy work follows the transferred entry and gets cleaned on close. Existing APIs retain behavior.

## Validation
Pure model tests including invalid/cyclic/deep trees, moves, splits and pruning. Browser tests for actual identity, no factory rerun, focus/selection/scroll, source destruction after transfer, pointer/cancel, keyboard, disabled, teardown. Docs/registry/types/catalog and build gates.

## Documentation impact
New dock-layout.md with two real workspaces; extend Tabs/SplitPane guides with transfer APIs; update coverage, wanted index and changelog. Do not mark done until browser/OG validation succeeds.

## Open questions
None for v1; preserve live instances and transfer ownership explicitly.

## Decision log
- 2026-11-16 — User approved DockLayout as a generic Slice component composed of Tabs/SplitPane.
- 2026-11-16 — Execution environment recovered; recovered the previous SplitPane/Grid patch and began implementation on current master.

## Implementation and validation

- Implemented DockLayout, the pure JSON model, live tab transfers and SplitPane.releasePanels.
  Transfer ancestry and view-state restoration are shared helpers, verified against Controller 4.3.0.
- Added 9 model tests and browser specs for DockLayout, Tabs transfer and SplitPane release.
- `pnpm test`: 198 tests pass. Seven additional checks run the actual Slice build/Controller/props/
  destroy code with a DOM adapter, including both authored examples. These do not certify native
  layout, pointer capture or touch behavior.
- Markdown lint/generation, registry/catalog/types generation, teardown/icon checks and production
  build pass. Existing CLI computed-metadata warnings remain unrelated to the new component.
- Playwright was attempted but cannot launch: Chromium is absent and its download is truncated.
  The complete gate stops at og:check: DockLayout and SplitPane have no generated OG image.
  Feature stays blocked on release validation; no browser/visual pass is claimed.
- The delivered cumulative patch is based on master 6c5cd1b and also contains the recovered
  SplitPane/Grid masonry changes, which are still absent from that master.

### Release checks

```bash
pnpm exec playwright install chromium
pnpm exec playwright test src/Components/Visual/DockLayout/DockLayout.spec.js src/Components/Visual/Tabs/Tabs.spec.js src/Components/Visual/SplitPane/SplitPane.spec.js src/Components/Visual/Grid/Grid.spec.js --project=components --workers=2
pnpm run og:generate -- --only=/docs/layout/dock-layout
pnpm run og:generate -- --only=/docs/layout/split-pane
pnpm run test:gate
```

Review actual pointer/pen/touch capture, keyboard, RTL, focused text selection/scroll after moves,
narrow containers and late factories. Only then mark done and move the wanted row to shipped.
