---
title: OverflowList
route: /docs/layout/overflow-list
navLabel: OverflowList
section: Layout
group: Containers
order: 26
description: Fit live controls into the container width and collect the rest under More, with priorities, pinned items and preserved component instances.
component: OverflowListDocumentation
generate: true
tags: [overflow, responsive, toolbar, actions, chips, layout]
---

# OverflowList

`OverflowList` measures live items against its own container and moves the ones that do not fit into a [DropDown](/docs/navigation/dropdown) disclosure. Buttons, chips, links and custom content keep their existing instances and handlers. Closing More parks the hidden controls without destroying them.

Use it for compact action bars, active filters and navigation shortcuts, especially inside resizable panels. Use CSS wrapping when multiple lines are welcome. Tabs already manages its own strip; OverflowList does not replace Tabs or build a new menu vocabulary.

## Contract

| Prop | Default | Meaning |
| --- | --- | --- |
| `items` | `[]` | `{ id, node, priority?, pinned? }`. Unique string IDs and distinct live Elements/Slice components; the component owns the supplied nodes. |
| `minVisible` | `0` | Minimum items to retain from the edge opposite `collapseFrom`, in addition to pinned items. |
| `collapseFrom` | `end` | `end` prefers leading items at equal priority; `start` prefers trailing items. |
| `gap` | `8` | Number of pixels or CSS length between items. |
| `disabled` | `false` | Disables More. Original controls retain their own disabled state. |
| `ariaLabel` | translated | Accessible group name; use a description appropriate to the content. |
| `texts` | en/es defaults | `more` (`More ({count})`), `moreLabel` and `label`. |
| `onChange` | `null` | `({ visibleItems, overflowItems, constrained })` with item ID arrays, after first measurement and when the partition changes. |

Higher `priority` values are preferred when they fit. All visible and overflow items retain their input order; priorities determine membership, not visual sorting. `pinned` and `minVisible` are mandatory. If they and the More trigger cannot fit, `data-constrained="true"` marks the result and the rail scrolls horizontally to keep them reachable.

The component reserves the maximum count-label width for the current item set, avoiding oscillation around counts such as 9 and 10. It can leave a small amount of unused space as a result.

Read-only `visibleItems` and `overflowItems` return descriptors. `reflow()` measures immediately when connected and visible, returning the partition or null when measurement is unavailable. `update()` refreshes a cached/reconnected view. Normal container/item size changes are observed automatically.

## Responsive document actions

:::script label="A toolbar inside a resizable workspace" expected="Save stays visible; secondary actions move under More as the writing panel narrows. The same Button instances keep their handlers in both locations."
const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = 'Draft ready.';
const actions = [];
for (const [id, label, priority] of [
  ['save', 'Save draft', 100], ['publish', 'Publish', 30], ['preview', 'Preview', 10], ['share', 'Share', 5], ['export', 'Export', 0]
]) {
  const button = await slice.build('Button', { value: label, size: 'sm', variant: id === 'save' ? 'filled' : 'outlined', onClick: () => { status.textContent = `${label} requested.`; } });
  actions.push({ id, node: button, priority, pinned: id === 'save' });
}
const toolbar = await slice.build('OverflowList', { ariaLabel: 'Document actions', gap: 8, items: actions });
const editor = document.createElement('div'); editor.style.cssText = 'padding:14px;box-sizing:border-box';
editor.append(toolbar, await slice.build('Card', { title: 'Release notes', subtitle: 'Draft · updated today', text: 'Keep the main action close. Resize the separator to make room for the document or its review panel.', variant: 'ghost' }), status);
const review = await slice.build('Card', { title: 'Review', text: 'Check examples, keyboard behavior and the final changelog before publishing.', variant: 'ghost' });
const pane = await slice.build('SplitPane', { sizes: [70, 30], panels: [{ id: 'writing', label: 'Writing', content: editor, minSize: 30 }, { id: 'review', label: 'Review', content: review, minSize: 15 }] });
pane.style.height = '300px';
return pane;
:::

## Active filters with live removal

:::script label="Filters that keep their remove buttons" expected="A compact filter bar. Open More and remove a hidden chip; only that chip is destroyed. Resize the bar using the buttons."
const filters = [['status','Status: active'],['owner','Owner: design team'],['due','Due: this week'],['priority','Priority: high'],['region','Region: Americas']];
const list = await slice.build('OverflowList', { ariaLabel: 'Active filters', texts: { more: '+{count} filters', moreLabel: 'Show {count} hidden filters' } });
const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = '5 filters active.';
const items = [];
for (const [id, label] of filters) {
  const chip = await slice.build('Chip', { label, removable: true, variant: id === 'priority' ? 'warning' : 'neutral', onRemove: () => {
    list.items = list.items.filter(item => item.id !== id); status.textContent = `${list.items.length} filters active.`;
  } });
  items.push({ id, node: chip, priority: id === 'status' ? 10 : 0 });
}
list.items = items;
const frame = document.createElement('div'); frame.style.cssText = 'width:340px;max-width:100%'; frame.append(list);
const controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';
controls.append(
  await slice.build('Button', { value: 'Compact', size: 'sm', variant: 'outlined', onClick: () => { frame.style.width = '340px'; } }),
  await slice.build('Button', { value: 'Full width', size: 'sm', variant: 'ghost', onClick: () => { frame.style.width = '100%'; } })
);
const box = document.createElement('div'); box.style.width = '100%'; box.append(controls, frame, status); return box;
:::

## Measurement, focus and ownership

Items need intrinsic widths. Use content-sized controls or explicit pixel/rem widths; a child whose width depends on a percentage of this same row is outside the sizing contract. Reserve images' natural dimensions while loading. ResizeObserver handles item width changes, fonts and parent resizing. Hidden containers are measured when revealed; `reflow()` can be called after custom layout work.

The measurement lane is invisible, inert and clipped. Overflow controls keep their original keyboard behavior inside the disclosure. Escape and outside dismissal use DropDown; when a focused visible control becomes hidden, focus goes to More. No new controls are cloned or synthesized from labels.

Assignments to `items` reconcile live nodes, and removed nodes are destroyed. Reuse stable IDs and node references to retain state. The dropdown receives `owned: false` custom content: OverflowList remains responsible for its nodes. Destroying OverflowList destroys the nodes, its menu, observers and scheduled work. Native resources whose state depends on DOM attachment, such as iframe browsing contexts, can still react to reparenting.
