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

## When to use it

:::compare left="Use OverflowList" right="Reach for something else"
- **A table or editor toolbar inside a resizable panel.** Keep the primary action pinned and let secondary actions move into More instead of wrapping into a second row that pushes the content down.
- **An active-filter bar over a data table.** Chips keep their remove handlers and order; hidden filters stay one click away.
- **A page header with a long tail of actions** (Share, Export, Duplicate, Archive). Priority decides what survives when the window narrows.
- **Controls whose component state matters** (a DatePicker, a toggle, a custom button). OverflowList moves the real node, so nothing is rebuilt.
---
- **The row may wrap to two lines.** CSS `flex-wrap` is simpler and keeps every action visible.
- **The items are navigation peers.** Use [Tabs](/docs/navigation/tabs) or [SideMenu](/docs/navigation/sidemenu), which own their own patterns.
- **There are one primary and two secondary actions.** A single DropDown, or a split button, reads more clearly than hiding two items behind More.
- **Vertical space is the problem.** OverflowList measures width only; use a menu, a drawer or pagination instead.
:::

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

## A table toolbar that keeps its primary action

Eight actions in one row. `Save view` is pinned, so it never leaves the strip; the low-priority actions move into More as the panel narrows. The status line uses `onChange` to show the live partition.

:::script label="A table toolbar inside a narrow panel" expected="At 420–520px, Export, Duplicate, Archive and Delete move under More while Save view stays pinned. Change the width with the buttons, open More, and check that the status line follows the partition."
const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = 'Measuring the toolbar...';
const actions = [];
for (const [id, label, priority, pinned] of [
  ['save', 'Save view', 100, true],
  ['publish', 'Publish', 80, false],
  ['preview', 'Preview', 60, false],
  ['share', 'Share', 40, false],
  ['export', 'Export CSV', 30, false],
  ['duplicate', 'Duplicate', 20, false],
  ['archive', 'Archive', 10, false],
  ['delete', 'Delete', 0, false]
]) {
  const button = await slice.build('Button', {
    value: label, size: 'sm', variant: id === 'save' ? 'filled' : 'outlined',
    onClick: () => { status.textContent = `${label} requested.`; }
  });
  actions.push({ id, node: button, priority, pinned });
}
const toolbar = await slice.build('OverflowList', {
  ariaLabel: 'Orders table actions', gap: 8, items: actions,
  onChange: ({ visibleItems, overflowItems, constrained }) => {
    status.textContent = `${visibleItems.length} visible - ${overflowItems.length} in More${constrained ? ' - constrained' : ''}`;
  }
});
const frame = document.createElement('div'); frame.style.cssText = 'width:520px;max-width:100%;transition:width .2s';
const shell = document.createElement('div'); shell.style.cssText = 'border:1px solid var(--slice-border);border-radius:12px;padding:12px;box-sizing:border-box';
const head = document.createElement('div'); head.style.cssText = 'display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:10px';
const title = document.createElement('strong'); title.textContent = 'Orders';
const meta = document.createElement('span'); meta.style.cssText = 'font-size:.75rem;color:var(--font-secondary-color)'; meta.textContent = '24 results - 6 columns';
head.append(title, meta);
const rows = document.createElement('div'); rows.style.cssText = 'display:grid;margin-top:12px;border-top:1px solid var(--slice-border)';
for (const [ref, customer, total] of [['#1042', 'Acme', '$1,240'], ['#1041', 'Northwind', '$860'], ['#1040', 'Globex', '$320']]) {
  const row = document.createElement('div'); row.style.cssText = 'display:flex;justify-content:space-between;gap:12px;padding:7px 2px;border-bottom:1px solid var(--slice-border);font-size:.82rem';
  const left = document.createElement('span'); left.textContent = `${ref} - ${customer}`;
  const right = document.createElement('span'); right.textContent = total;
  row.append(left, right); rows.append(row);
}
shell.append(head, toolbar, rows); frame.append(shell);
const controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';
for (const [label, width] of [['Narrow (420px)', '420px'], ['Medium (560px)', '560px'], ['Full width', '100%']]) {
  controls.append(await slice.build('Button', { value: label, size: 'sm', variant: 'ghost', onClick: () => { frame.style.width = width; } }));
}
const box = document.createElement('div'); box.style.width = '100%'; box.append(controls, frame, status); return box;
:::

## Active filters with live removal

Filter chips render their own remove buttons. Open More, remove a hidden chip, and only that chip is destroyed; the rest keep their handlers and order.

:::script label="Filters that keep their remove buttons" expected="A 300px filter bar with seven chips. Some chips live under More; removing one updates both the total and the visible/overflow counts. Widen the bar to bring them back."
const filters = [['status','Status: active'],['owner','Owner: design team'],['due','Due: this week'],['priority','Priority: high'],['region','Region: Americas'],['type','Type: invoice'],['source','Source: referral']];
let active = filters.length;
const list = await slice.build('OverflowList', {
  ariaLabel: 'Active filters',
  texts: { more: '+{count} filters', moreLabel: 'Show {count} hidden filters' },
  onChange: ({ visibleItems, overflowItems }) => {
    status.textContent = `${active} filters active - ${visibleItems.length} visible, ${overflowItems.length} under More.`;
  }
});
const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = '7 filters active.';
const items = [];
for (const [id, label] of filters) {
  const chip = await slice.build('Chip', { label, removable: true, variant: id === 'priority' ? 'warning' : 'neutral', onRemove: () => {
    active -= 1;
    list.items = list.items.filter(item => item.id !== id);
  } });
  items.push({ id, node: chip, priority: id === 'status' ? 10 : 0 });
}
list.items = items;
const frame = document.createElement('div'); frame.style.cssText = 'width:300px;max-width:100%;transition:width .2s'; frame.append(list);
const controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';
controls.append(
  await slice.build('Button', { value: 'Compact (300px)', size: 'sm', variant: 'outlined', onClick: () => { frame.style.width = '300px'; } }),
  await slice.build('Button', { value: 'Full width', size: 'sm', variant: 'ghost', onClick: () => { frame.style.width = '100%'; } })
);
const box = document.createElement('div'); box.style.width = '100%'; box.append(controls, frame, status); return box;
:::

## Measurement, focus and ownership

Items need intrinsic widths. Use content-sized controls or explicit pixel/rem widths; a child whose width depends on a percentage of this same row is outside the sizing contract. Reserve images' natural dimensions while loading. ResizeObserver handles item width changes, fonts and parent resizing. Hidden containers are measured when revealed; `reflow()` can be called after custom layout work.

The measurement lane is invisible, inert and clipped. Overflow controls keep their original keyboard behavior inside the disclosure. Escape and outside dismissal use DropDown; when a focused visible control becomes hidden, focus goes to More. No new controls are cloned or synthesized from labels.

Assignments to `items` reconcile live nodes, and removed nodes are destroyed. Reuse stable IDs and node references to retain state. The dropdown receives `owned: false` custom content: OverflowList remains responsible for its nodes. Destroying OverflowList destroys the nodes, its menu, observers and scheduled work. Native resources whose state depends on DOM attachment, such as iframe browsing contexts, can still react to reparenting.
