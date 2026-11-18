---
title: TransferList
route: /docs/input/transfer-list
navLabel: TransferList
section: Input Components
group: Selection
order: 28
description: Assign permissions, members and resources between searchable collections, with grouped rich rows, visible selection and locked policy items.
component: TransferListDocumentation
generate: true
tags: [transfer, assignment, permissions, members, selection, search]
---

# TransferList

`TransferList` separates **available** items from **assigned** items. Each row has a labelled checkbox, optional description/rich content and an explicit Assign or Remove action. Search is independent on each side. Bulk actions operate on the checked visible items, without the ambiguity of a pair of arrow buttons.

Use it for role permissions, project membership, resources or feature assignment. Use Select with multiple selection for a short compact field and TreeView for browsing a hierarchy. This version supports flat catalogs grouped into categories; it does not implement hierarchical permission inheritance or a tree transfer.

## Value and selection

`items` contains `{ value, label, description?, group?, content?, disabled?, locked? }`. Keys are unique nonempty strings or finite numbers; `1` and `'1'` are distinct. `value` is the array of assigned keys. Checking a checkbox is temporary selection; only Assign/Remove changes `value`.

Assigned keys missing from the catalog are retained and announced. An unrelated edit never silently revokes those assignments. Load a fuller catalog to reveal them, or explicitly replace `value` from the application. The array returned by the getter and handler is a copy.

`locked` and `disabled` items cannot be moved by user actions or `assign`/`remove`. Locked rows show a policy label. Programmatic `value` assignments remain authoritative and silent, so the app can switch between roles or restore server state.

## Role permissions

:::script label="Assign a project editor's permissions" expected="Grouped permissions with explanations, a locked audit permission, a sensitive-access badge and one unavailable catalog key. Assign or remove permissions individually or with checked-visible bulk actions."
const sensitive = await slice.build('Badge', { label: 'Sensitive access', tone: 'warning', variant: 'soft' });
const catalog = [
  { value: 'projects.read', label: 'Read projects', description: 'View projects, milestones and published reports.', group: 'Projects' },
  { value: 'projects.edit', label: 'Edit projects', description: 'Change project details and milestones.', group: 'Projects' },
  { value: 'projects.archive', label: 'Archive projects', description: 'Archive completed projects without deleting their history.', group: 'Projects' },
  { value: 'team.invite', label: 'Invite team members', description: 'Invite collaborators to assigned projects.', group: 'Team' },
  { value: 'billing.read', label: 'Read billing', description: 'View invoices and billing contacts.', group: 'Administration', content: sensitive },
  { value: 'audit.read', label: 'Read audit history', description: 'Required by the organization policy.', group: 'Administration', locked: true },
  { value: 'billing.edit', label: 'Change billing', description: 'Managed by the account owner.', group: 'Administration', disabled: true }
];
const summary = await slice.build('Badge', { label: '3 assigned keys', tone: 'accent' });
const role = await slice.build('Card', { title: 'Project editor', subtitle: 'Role permissions', text: 'Choose the permissions for this role. Required permissions stay assigned.', variant: 'ghost', content: summary });
const output = document.createElement('pre'); output.style.cssText = 'white-space:pre-wrap;font-size:.8rem;padding:12px;background:var(--secondary-background-color);border-radius:8px'; output.textContent = 'Use Save to inspect the assigned keys.';
const transfer = await slice.build('TransferList', {
  ariaLabel: 'Project editor permissions', items: catalog, value: ['projects.read', 'audit.read', 'legacy.export'],
  texts: { available: 'Available permissions', assigned: 'Assigned permissions' },
  onChange: value => { summary.label = `${value.length} assigned keys`; }
});
const save = await slice.build('Button', { value: 'Save role', size: 'sm', onClick: () => { output.textContent = JSON.stringify({ role: 'project-editor', permissions: transfer.value }, null, 2); } });
const box = document.createElement('div'); box.style.cssText = 'display:grid;gap:14px;width:100%'; box.append(role, transfer, save, output); return box;
:::

## App-owned catalog loading and team assignment

Fetch the catalog with your app's data layer and pass `items`, `loading` and `error`. The component does not start network work in init. While loading it blocks edits; with no catalog it shows skeleton rows, and with existing data it keeps the old rows visible and busy. `onRetry` lets the app retry a failed request.

:::script label="Build a project team from an app-owned catalog" expected="Start with a loading skeleton, load a team catalog, simulate a catalog error and retry. The right side is named Project team. Missing assigned keys remain intact while loading."
const team = [
  { value: 'ana', label: 'Ana Torres', description: 'Frontend engineer · Slice components', group: 'Engineering' },
  { value: 'carlos', label: 'Carlos Rivas', description: 'Backend engineer · APIs and storage', group: 'Engineering' },
  { value: 'maria', label: 'María Silva', description: 'Product designer · Interaction and accessibility', group: 'Design' },
  { value: 'luis', label: 'Luis Pérez', description: 'Researcher · Customer interviews', group: 'Design' },
  { value: 'sofia', label: 'Sofía Díaz', description: 'Support lead · Existing project owner', group: 'Operations', locked: true }
];
const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = 'The application is loading its team catalog.';
const transfer = await slice.build('TransferList', { loading: true, value: ['maria', 'sofia'], texts: {
  available: 'Team members', assigned: 'Project team', assign: 'Add', assignSelected: 'Add to project', removeSelected: 'Remove from project'
} });
const load = () => { transfer.items = team; transfer.error = ''; transfer.loading = false; status.textContent = 'Team catalog loaded.'; };
transfer.onRetry = load;
transfer.onChange = value => { status.textContent = `${value.length} members in the project team.`; };
const controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
controls.append(
  await slice.build('Button', { value: 'Load team', size: 'sm', onClick: load }),
  await slice.build('Button', { value: 'Simulate catalog error', size: 'sm', variant: 'outlined', onClick: () => { transfer.loading = false; transfer.error = 'The team catalog could not be loaded. Try again.'; status.textContent = 'Assignment is paused until the catalog is available.'; } }),
  await slice.build('Button', { value: 'Lock / unlock assignment', size: 'sm', variant: 'ghost', onClick: () => { transfer.disabled = !transfer.disabled; } })
);
const box = document.createElement('div'); box.style.cssText = 'display:grid;gap:12px;width:100%'; box.append(controls, transfer, status); return box;
:::

## Props

| Prop | Default | Meaning |
| --- | --- | --- |
| `items` | `[]` | App-owned catalog. Stable value keys retain row controls and rich content across assignments. |
| `value` | `[]` | Assigned keys, including unknown keys. Prop assignments are silent. |
| `searchable` | `true` | Shows independent searches; disabling clears both queries and temporary selections. |
| `showSelectAll` | `true` | Shows a native select-visible checkbox with indeterminate state. Row selection/bulk actions remain available when hidden. |
| `disabled` | `false` | Blocks selection, assignment, searches and retry controls. |
| `loading` | `false` | Busy state; blocks assignment and selection while retaining existing rows. |
| `error` | `''` | Text-only alert; blocks assignment until cleared. |
| `onRetry` | `null` | Callback for Try again; without it no retry button is shown. |
| `ariaLabel` | translated | Name of the whole assignment control. |
| `texts` | en/es defaults | Titles, action labels, searches, empty/policy/error-retry/selection messages. |
| `onChange` | `null` | `(value, { direction, values, items })`; direction is `assign` or `remove`, values/items describe the moved entries. |

## Methods and behavior

- `assign(values?)` / `remove(values?)`: explicit keys, or the checked visible items on that side. Returns whether anything moved. Filters disabled/locked, unknown and already-on-target keys. No-op calls do not emit.
- `setSearch('available' | 'assigned', query)`: update one query. Matching ignores accents/case and includes label, description and group. Changing a query clears only that side's temporary selection.
- `getSelection(side)`: a copied array of checked keys. `clearSelection(side?)` clears one or both sides.
- Prop assignments update the view asynchronously through Slice update serialization; native action value changes and `onChange` are synchronous. Browser tests should wait for the relevant DOM state.

The component groups rows by the first appearance of each category, retaining catalog order within it. Empty categories disappear from search results. Select-visible and bulk actions exclude policy/unavailable items. The list uses actual native checkboxes through Checkbox, Input searches and Button actions, rather than placing checkboxes inside ARIA listbox options.

## Rich content and lifecycle

`content` accepts text, a live Node/Slice component or an array. DocumentFragment content is consumed into its child nodes when mounted. Content nodes cannot be shared between rows. It sits outside the checkbox label and may contain its own controls. Moving a row retains its check/action components, rich content, supported focus/selection and scroll offsets. Use stable keys and immutable content arrays when changing descriptors.

The component owns rich nodes and composed controls. Removing an item or destroying TransferList destroys that content, including components inside plain wrappers and never-mounted content queued during an update. Build app-lifetime services outside the supplied row content and manage their lifetime in the app.

The panels respond to their **container width**, stacking below 640px. Set `--slice-transfer-list-height` (default `340px`) for the scrolling list height. No decorative animation is required.
