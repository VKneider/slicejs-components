---
id: "0014"
title: "Component: JsonViewer"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-09
updated: 2026-11-09
target: "next release"
owners: []
related:
  - "src/Components/Visual/JsonViewer/JsonViewer.js"
  - "src/markdown/json-viewer.md"
---

# Component: JsonViewer

## Summary

`JsonViewer` shows a JSON value as a foldable tree with typed colours, search, and the path or value of any node one key away. For API responses in docs, raw records in admin panels, webhooks and configs.

## Problem / motivation

`<pre>{JSON.stringify(x, null, 2)}</pre>` is unreadable past a screen, cannot fold, and copying a nested value or its path means selecting text by hand.

## Proposed direction

```js
await slice.build('JsonViewer', { data, rootName: 'response', expandDepth: 2, search: true, onSelect, onCopy });
```

- `expandDepth` (levels of keys shown), `rootName`, `search`, `toolbar` (Expand/Collapse all), `sortKeys`, `maxStringLength`, `copyable`, `maxHeight`, `size`.
- Lazy DOM: only open nodes render; containers with more than 100 entries open in ranges (`[0 … 99]`).
- Paths as code (`user.address["zip code"]`); circular references shown as `[Circular]`; dates as ISO.
- `onSelect({ path, pathText, key, value })`, `onCopy({ what, text, path })`, `expandAll()`, `collapseAll()`.
- Built-in texts under `slice.jsonViewer.*` (en, es) and a `texts` prop.

### Accessibility

ARIA tree with roving tabindex (one Tab stop): ↑ ↓ → ← Home End Enter; plain keys **c** (copy value) and **p** (copy path) on a row (`aria-keyshortcuts`), announced in a polite status. Copy buttons are pointer affordances (`tabindex=-1`).

## Alternatives considered

| Alternative | Why not |
| --- | --- |
| TreeView with JSON mapped to nodes | Navigation semantics and visuals, no types, copy or search. |
| CodeVisualizer | Text, not structure. |

## Scope

In: the above. Out: editing values, JSON Schema hints, virtual scrolling of open ranges.

## Validation

`JsonViewer.spec.js` (9): render and ARIA, expandDepth/expandAll/collapseAll/rootName, mouse and keyboard, onSelect paths, clipboard and announcements, search, ranges and long strings, circular data, texts and toolbar.

## Documentation impact

`src/markdown/json-viewer.md` (Display › Content): API response, raw record in a modal, webhook log.

## Decision log

- 2026-11-09 — Built. Plain-key copy shortcuts inside the tree (no Ctrl+C override).
