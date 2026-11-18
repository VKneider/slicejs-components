---
title: JsonViewer
route: /docs/display/json-viewer
navLabel: JsonViewer
section: Display
group: Content
order: 46
description: A JSON value as a tree you can read — objects and arrays fold open, values coloured by type, search that opens the way to every match, and the path or value of any node one key away.
component: JsonViewerDocumentation
generate: true
tags: [json, tree, viewer, inspector, api, payload, debug, data, display]
---

# JsonViewer

## Overview
`JsonViewer` shows a JSON value as a tree: objects and arrays fold open, strings, numbers, booleans and `null` have their own colour, and the path (`user.addresses[0].city`) or the value of any node can be copied.

Only what is open is in the page, and a long array opens in ranges of 100 (`[0 … 99]`), so a large response stays fast.

### When to use it
- **API responses in documentation**: what an endpoint returns, ready to explore.
- **The raw data of a record** in an admin panel ("View JSON").
- **Webhooks, events and logs** whose shape changes from one to the next.
- **Configs** that people read more than they edit.

### When not to use it
- **Data people work with** (sort, filter, select, edit): a [Table](/docs/data/table), a [DataList](/docs/data/datalist) or a [DescriptionList](/docs/data/description-list).
- **Code to read as text**, with its formatting: [CodeVisualizer](/docs/display/code-visualizer).
- **A hierarchy of pages or files to navigate**: [TreeView](/docs/navigation/treeview).

## Core Behavior
- `data`: any JSON value. Dates show as ISO strings; circular references show as `[Circular]` instead of hanging.
- `expandDepth`: how many levels of keys show at the start — `1` (default) the top-level keys, closed; `2` also what is inside them; `Infinity` everything.
- `rootName` ("response"): a row for the root, and the start of every copied path.
- `search: true`: a box that highlights what matches (keys and values), opens the way to it and counts it; Enter goes to the next match, Shift+Enter to the previous one.
- `toolbar` (default on): Expand all and Collapse all. `sortKeys` orders keys alphabetically without changing the data. `maxStringLength` (200) cuts long strings, with a button for the rest.
- `onSelect({ path, pathText, key, value })` on Enter or a click on a value. `onCopy({ what, text, path })` after a copy.
- `expandAll()` and `collapseAll()` from code.

### Keyboard and screen readers
It is an ARIA tree with one Tab stop: ↑ ↓ move, → opens (or goes in), ← closes (or goes up), Home / End, Enter selects. On any row, **c** copies the value and **p** copies the path; a polite status says what was copied. The copy buttons on each row do the same with the pointer.

## Looks
- `size`: `md` or `sm`. `maxHeight` ('320px') makes it scroll.
- Colours come from the theme (`--success-color` for strings, `--info-color` for numbers…) and can be set with `--slice-json-viewer-string`, `--slice-json-viewer-number`, `--slice-json-viewer-boolean`, `--slice-json-viewer-key`.

## Live Preview
:::component name="JsonViewer"
{
  "data": { "id": 1, "name": "Item 1", "active": true, "value": 10, "tags": ["tag1", "tag2"], "details": { "label": "Detail 1", "note": null } },
  "expandDepth": 2
}
:::

## Examples
:::script label="An API response in the docs" expected="a request line 'GET /api/example/1 · 200 OK' over a JSON viewer with search and a root named 'response'; searching 'sku' highlights both SKUs and opens the items; c and p copy from the focused row"
const response = {
  id: 1,
  status: 'status-1',
  createdAt: '2026-01-15T10:00:00Z',
  total: 10,
  currency: 'USD',
  owner: { id: 'user-1', name: 'User 1', email: 'user1@example.com', 'phone number': '000-000-0000' },
  shipping: { method: 'standard', address: { line1: 'Address line 1', city: 'City 1', country: 'US' }, trackingCode: null },
  items: [
    { sku: 'SKU-1', name: 'Item 1', qty: 1, price: 10 },
    { sku: 'SKU-2', name: 'Item 2', qty: 2, price: 20 }
  ],
  active: false,
  metadata: { source: 'source-1', campaign: 'campaign-1' }
};
const line = document.createElement('p');
line.style.cssText = 'margin:0 0 8px;font-family:var(--font-family-code, monospace);font-size:.85rem';
line.textContent = 'GET /api/example/1 · 200 OK';
const box = document.createElement('div');
box.style.cssText = 'width:100%';
box.append(line, await slice.build('JsonViewer', { data: response, rootName: 'response', expandDepth: 2, search: true }));
return box;
:::

:::script label="View the raw record from an admin panel" expected="a small summary of a record with a 'View JSON' button; the button opens a modal with the full record in a JsonViewer limited to 360px of height; selecting a value shows its path under the viewer"
const record = {
  id: 'record-1',
  name: 'Record 1',
  roles: ['role-1', 'role-2'],
  preferences: { theme: 'light', language: 'en', notifications: { email: true, push: false } },
  lastLogin: '2026-01-15T10:00:00Z',
  sessions: Array.from({ length: 140 }, (_, i) => ({ id: `session-${1000 + i}`, ip: `10.0.${i % 255}.${(i * 7) % 255}`, device: i % 3 ? 'web' : 'mobile' }))
};
const picked = document.createElement('p');
picked.style.cssText = 'margin:8px 0 0;font-size:.85rem;opacity:.8';
picked.textContent = 'Select a value to see its path.';
const viewer = await slice.build('JsonViewer', {
  data: record, rootName: 'record', maxHeight: '360px', size: 'sm', search: true,
  onSelect: ({ pathText, value }) => { picked.textContent = `${pathText} = ${JSON.stringify(value)}`; }
});
const body = document.createElement('div');
body.append(viewer, picked);
const modal = await slice.build('Modal', { title: 'Raw record', size: 'lg', content: body, open: false });

const card = await slice.build('Card', {
  title: record.name, subtitle: `${record.roles.join(', ')} · ${record.sessions.length} sessions`, variant: 'outlined',
  actions: [{ label: 'View JSON', variant: 'outlined', onClick: () => { modal.open = true; } }]
});
const box = document.createElement('div');
box.style.cssText = 'width:100%;max-width:420px';
box.append(card, modal);
return box;
:::

:::script label="A webhook log" expected="a list of three events; each has its type and time in a small header and a compact JsonViewer below with only the top level shown and no toolbar"
const events = [
  { type: 'event.one', at: '10:00:00', data: { id: 'event-1', value: 100, active: true } },
  { type: 'event.two', at: '11:00:00', data: { id: 'event-2', value: 200, label: 'Item 2' } },
  { type: 'event.three', at: '12:00:00', data: { id: 'event-3', changes: { field: ['old', 'new'] } } }
];
const list = document.createElement('div');
list.style.cssText = 'display:grid;gap:12px;width:100%';
for (const event of events) {
  const head = document.createElement('p');
  head.style.cssText = 'margin:0 0 6px;font-size:.82rem;font-weight:600';
  head.textContent = `${event.type} · ${event.at}`;
  const item = document.createElement('div');
  item.append(head, await slice.build('JsonViewer', { data: event.data, size: 'sm', toolbar: false }));
  list.append(item);
}
return list;
:::

## Best Practices
:::tip
Open as much as people need at a glance (`expandDepth: 2` for most API responses) and let search do the rest.
:::

:::tip
Give the root a name (`rootName: 'response'`) when people copy paths into code: they get `response.items[0].sku`, ready to paste.
:::

## Pitfalls
:::warning
It shows data; it does not hide it. Remove tokens, passwords and personal data before passing a value to a viewer that anyone with the page can read.
:::

:::related
- [Code visualizer](/docs/display/code-visualizer) - Source code instead of data.
- [Table](/docs/data/table) - The same records as rows.
- [Query service](/docs/services/query-service) - Where the JSON usually comes from.
:::
