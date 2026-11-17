---
title: SplitPane
route: /docs/layout/split-pane
navLabel: SplitPane
section: Layout
group: Containers
order: 24
description: Resizable workspaces with multiple panels, percentage limits, collapse and restore, pointer and keyboard controls.
component: SplitPaneDocumentation
generate: true
tags: [splitpane, splitter, resizable, panels, workspace, editor, layout]
---

# SplitPane

`SplitPane` shares space between two or more live panels. Drag a separator, focus it and use the keyboard, or restore a saved `sizes` array. The content stays mounted while sizes change; collapsed content is hidden and inert.

Use it for an explorer and editor, side-by-side review, or a dashboard with a resizable inspector. Use [Layout](/docs/layout/layout) for the application frame and navigation, [Grid](/docs/layout/grid) for responsive cards, and [Tabs](/docs/navigation/tabs) when only one view should be visible. SplitPane does not turn into a mobile drawer automatically.

## Contract

| Prop | Meaning |
| --- | --- |
| `panels` | Array of `{ id, label, content, minSize, maxSize, collapsible, collapsed }`. Unique string IDs are recommended; duplicate IDs are ignored. `content` accepts text, a live node/component, or an array of them. |
| `sizes` | Relative weights normalized to percentages; defaults to equal shares. Getter returns actual percentages. Assigning it is silent. |
| `orientation` | `horizontal` (side by side, default) or `vertical` (stacked). |
| `disabled` | Disables gestures, keyboard resizing and API resize/collapse actions. |
| `keyboardStep` | Percentage points per arrow press, default `2`. Shift multiplies it by five. |
| `onChange` | `(sizes, { reason, index, collapsed })`. Reasons: `pointer`, `keyboard`, `api`, `collapse`, `expand`, `cancel`. Collapsed is an array of panel IDs. |
| `texts` | Built-in text overrides: `panel`, `resize`, `help`; English/Spanish defaults follow `slice.translator`. |

`minSize` and `maxSize` are percentages of panel space, excluding the separators; defaults are `0` and `100`. Panels scroll when their content does not fit. Infeasible minima are scaled down proportionally; infeasible maxima are expanded to fill the space. `data-constrained="true"` exposes this situation. Keep constraints feasible in your application for predictable limits.

The host fills its parent. **Give a vertical pane or full workspace a definite height**, for example `pane.style.height = '420px'`. A horizontal pane without a parent height can grow from its content, but fixed-height workspaces are easier to use.

### Methods and ownership

- `resize(separatorIndex, percent)` changes the panel before that separator and its neighbor. Other panels keep their sizes. Returns whether anything changed.
- `collapse(idOrIndex)`, `expand(idOrIndex)`, `toggle(idOrIndex)` return whether the action succeeded. Only `collapsible` panels can collapse; the last expanded panel stays open. Expand restores its remembered size within current bounds.
- Assigning `panels` reconciles by ID and preserves content nodes still present. Removed content is destroyed, including Slice components inside plain DOM wrappers. Nodes passed to the pane belong to it; do not share one live node across panels.
- Programmatic `panels`, `sizes` and other prop assignments do not call `onChange`. Methods do.

## Explorer, editor and inspector

:::script label="A project workspace" expected="Three independently sized panels: a real file tree, editable project notes and a details card. Drag or use arrow keys; collapse and restore the explorer without losing the draft."
const tree = await slice.build('TreeView', {
  items: [{ id: 'src', label: 'src', expanded: true, items: [
    { id: 'app', label: 'App.js', description: 'Application entry' },
    { id: 'notes', label: 'release-notes.md', description: 'Draft for the next release' },
    { id: 'theme', label: 'theme.css' }
  ] }]
});
const notes = await slice.build('Textarea', {
  label: 'release-notes.md', labelPlacement: 'above', rows: 10,
  value: '# Release notes\n\n- SplitPane: resizable workspaces\n- Grid: masonry collections\n\nWrite your next idea here…',
  help: 'Your draft stays intact when a panel resizes or collapses.'
});
const editor = document.createElement('div');
editor.style.cssText = 'padding:12px;box-sizing:border-box';
editor.append(notes);
const details = await slice.build('Card', {
  title: 'Release checklist', subtitle: 'Workspace / components', variant: 'ghost',
  content: await slice.build('ProgressBar', { value: 3, max: 5, label: 'Reviewed', showValue: true }),
  text: 'Check keyboard controls, small containers, translations, cleanup and documentation.'
});
const pane = await slice.build('SplitPane', {
  sizes: [24, 50, 26],
  panels: [
    { id: 'files', label: 'Project files', content: tree, minSize: 12, maxSize: 40, collapsible: true },
    { id: 'editor', label: 'Editor', content: editor, minSize: 30 },
    { id: 'inspector', label: 'Inspector', content: details, minSize: 15, collapsible: true }
  ]
});
pane.style.cssText = 'height:380px;border:1px solid var(--slice-border);border-radius:12px;overflow:hidden';
const controls = document.createElement('div');
controls.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px';
controls.append(
  await slice.build('Button', { value: 'Toggle files', variant: 'outlined', size: 'sm', onClick: () => pane.toggle('files') }),
  await slice.build('Button', { value: 'Toggle inspector', variant: 'outlined', size: 'sm', onClick: () => pane.toggle('inspector') }),
  await slice.build('Button', { value: 'Reset sizes', variant: 'ghost', size: 'sm', onClick: () => { pane.expand('files'); pane.expand('inspector'); pane.sizes = [24, 50, 26]; } })
);
const box = document.createElement('div'); box.style.width = '100%'; box.append(controls, pane);
return box;
:::

## Vertical review and nested panes

A panel can contain another SplitPane. Each separator handles only its own pane; nested keyboard/pointer events do not resize the parent.

:::script label="Review with a collapsible activity log" expected="A side-by-side copy review above a collapsible activity log. Both orientations work together; edits remain intact after collapse."
const before = await slice.build('Card', { title: 'Current copy', text: 'Build an app with reusable components.', variant: 'outlined' });
const after = await slice.build('Textarea', { label: 'Proposed copy', labelPlacement: 'above', rows: 6, value: 'Build your next workspace with Slice. Resize panels, arrange cards and keep your flow.' });
const review = await slice.build('SplitPane', {
  sizes: [45, 55], panels: [{ id: 'before', label: 'Current copy', content: before, minSize: 20 }, { id: 'after', label: 'Proposed copy', content: after, minSize: 25 }]
});
const activity = await slice.build('Card', { title: 'Activity', subtitle: 'Today', text: '09:10 Draft created · 10:25 Copy updated · 11:00 Review requested', variant: 'ghost' });
const pane = await slice.build('SplitPane', {
  orientation: 'vertical', sizes: [72, 28],
  panels: [{ id: 'review', label: 'Copy comparison', content: review, minSize: 35 }, { id: 'activity', label: 'Activity log', content: activity, minSize: 15, maxSize: 50, collapsible: true }]
});
pane.style.height = '400px';
return pane;
:::

## Saving a distribution

Persistence stays in the app: choose a versioned key, validate stored input, and restore collapsed IDs before sizes. `onChange` fires during dragging, so debounce expensive persistence. This example saves only on an explicit button.

:::script label="Remember this layout" expected="A two-panel planning board. Save the current distribution, resize it, then Restore to recover both sizes and collapsed panels."
const key = 'slice-split-pane-planning-v1';
const pane = await slice.build('SplitPane', {
  sizes: [35, 65], panels: [
    { id: 'brief', label: 'Project brief', collapsible: true, minSize: 15, content: await slice.build('Card', { title: 'Project brief', text: 'Keep the review workspace comfortable on each screen.', variant: 'ghost' }) },
    { id: 'tasks', label: 'Tasks', minSize: 25, content: await slice.build('Card', { title: 'Next actions', text: 'Review constraints, try keyboard resizing, then save a layout.', variant: 'outlined' }) }
  ]
});
pane.style.height = '240px';
const status = document.createElement('p'); status.setAttribute('role', 'status');
const controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
controls.append(
  await slice.build('Button', { value: 'Save layout', size: 'sm', onClick: () => {
    try { localStorage.setItem(key, JSON.stringify({ sizes: pane.sizes, collapsed: pane.panels.filter(p => p.collapsed).map(p => p.id) })); status.textContent = 'Layout saved.'; }
    catch { status.textContent = 'Storage is unavailable.'; }
  } }),
  await slice.build('Button', { value: 'Restore layout', variant: 'outlined', size: 'sm', onClick: () => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (!saved || !Array.isArray(saved.sizes) || saved.sizes.length !== pane.panels.length || !saved.sizes.every(v => Number.isFinite(v) && v >= 0)) { status.textContent = 'Save a layout first.'; return; }
      pane.panels = pane.panels.map(p => ({ ...p, collapsed: Array.isArray(saved.collapsed) && saved.collapsed.includes(p.id) }));
      pane.sizes = saved.sizes; status.textContent = 'Layout restored.';
    } catch { status.textContent = 'The saved layout could not be read.'; }
  } })
);
const box = document.createElement('div'); box.style.width = '100%'; box.append(controls, status, pane); return box;
:::

## Keyboard and accessibility

| Key | Action |
| --- | --- |
| Tab | Focus an enabled separator or the controls inside a panel. |
| Left / Right | Resize side-by-side panels; direction follows RTL. |
| Up / Down | Resize stacked panels. |
| Shift + arrow | Five times `keyboardStep`. |
| Home / End | Resize to the current lower/upper limit. |
| Enter | Toggle the preceding collapsible panel, or the following panel if only it is collapsible. |

Separators announce their controlled panel, current percentage and effective limits. Pointer capture continues a drag outside the handle; pointer cancellation restores the starting distribution. Collapsed content cannot receive focus. If both adjacent panels are collapsible, use the API or a visible Button to toggle the following panel separately.

## Styling

Use the host to set dimensions. `--slice-split-pane-handle-size` defaults to `12px`; `--slice-split-pane-accent` and `--slice-split-pane-border` follow theme tokens. Keep the handle large enough to grab. No motion is required. Tiny panels scroll; this component does not replace responsive navigation or a mobile-specific product layout.

## Transferring panel ownership

`releasePanels()` returns the current descriptors with their actual content nodes and empties the
pane **without destroying that content**. Adopt the returned descriptors in another SplitPane or
destroy the released nodes explicitly. Destroying the old pane after adoption does not destroy
those components. This is used by [DockLayout](/docs/layout/dock-layout) when changing a split tree;
normal `panels = ...` replacement keeps its existing destroy-on-removal behavior.
