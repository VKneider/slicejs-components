---
title: DockLayout
route: /docs/layout/dock-layout
navLabel: DockLayout
section: Layout
group: Containers
order: 25
description: Dockable workspaces composed of Tabs and SplitPane. Move live tabs, create splits, resize panels and restore a serializable distribution.
component: DockLayoutDocumentation
generate: true
tags: [dock, docking, workspace, tabs, splitpane, panels, drag, editor]
---

# DockLayout

`DockLayout` arranges groups of [Tabs](/docs/navigation/tabs) inside [SplitPane](/docs/layout/split-pane). Drag a tab to another strip to move or reorder it; drop it near a panel edge to create a split. Empty groups disappear and a split with one child collapses into that child.

**Content is moved, not rebuilt.** Tab IDs identify the existing entries, panel wrappers and live nodes. Lazy factories run when first selected and continue if their tab moves while loading. The workspace transfers component ownership before retiring old containers, so deleting an empty source group cannot destroy a moved child.

Use it for editors, analysis tools, monitoring dashboards and review workspaces. Use plain Tabs for one fixed group, SplitPane for fixed resizable regions, or Layout for application navigation. Floating windows and dragging across separate DockLayout instances are outside this first version.

## Content and distribution are separate

`items` uses the Tabs descriptor shape: `{ id, label, panel, icon?, badge?, disabled?, closable? }`. IDs must be globally unique strings. `panel` is text, a live DOM/Slice component, or a lazy function returning one (possibly asynchronously). Keep the same panel node/factory when refreshing an item; changing the source intentionally replaces its content. Supplied nodes belong to the workspace, including never-selected nodes.

`layout` contains only JSON data:

```js
{
  type: 'split', id: 'workspace', orientation: 'horizontal', sizes: [35, 65],
  children: [
    { type: 'group', id: 'files', label: 'Sources', tabs: ['brief', 'notes'], activeTab: 'brief' },
    { type: 'group', id: 'review', label: 'Review', tabs: ['preview'], activeTab: 'preview' }
  ]
}
```

Without `layout`, every item starts in the `main` group. A supplied layout must contain each current item ID exactly once. Unknown/repeated tab IDs, duplicate node IDs, invalid sizes, cycles and oversized trees are rejected before changing the view. Groups and splits share one namespace for their node IDs. `sizes` are relative weights, normalized to percentages by SplitPane.

Give the host a definite height, such as `dock.style.height = '460px'`. Groups scroll within their available space.

## A review workspace

:::script label="Release workspace: edit, preview and rearrange" expected="Editable release notes and a preview group. Drag tabs between strips or to panel edges; use the destination selector and Move button as an alternative. The draft and its selection remain intact after moving."
const initial = '# Next release\n\n- Resizable panels\n- Dockable tabs\n- Masonry collections\n\nWrite a release note here…';
const editor = await slice.build('Textarea', { label: 'release-notes.md', labelPlacement: 'above', rows: 11, value: initial, help: 'Moving this tab keeps the same editor instance.' });
const editorBox = document.createElement('div'); editorBox.style.cssText = 'padding:14px;box-sizing:border-box'; editorBox.append(editor);
const checklist = await slice.build('TreeView', { items: [{ id: 'review', label: 'Review checklist', expanded: true, items: [
  { id: 'keyboard', label: 'Keyboard and focus' }, { id: 'resize', label: 'Resize and split' }, { id: 'restore', label: 'Restore saved distribution' }
] }] });
const preview = await slice.build('Card', {
  title: 'Slice workspace', subtitle: 'Release preview', variant: 'ghost',
  text: 'Arrange your workspace around the task. Keep the editor wide, move the checklist below it, or bring the preview alongside the draft.',
  content: await slice.build('ProgressBar', { label: 'Release review', value: 3, max: 5, showValue: true })
});
const status = document.createElement('p'); status.setAttribute('role', 'status'); status.style.fontSize = '.85rem';
let savedDraft = initial;
const dock = await slice.build('DockLayout', {
  items: [
    { id: 'editor', label: 'Release notes', panel: editorBox },
    { id: 'checklist', label: 'Checklist', panel: checklist },
    { id: 'preview', label: 'Preview', panel: preview },
    { id: 'guide', label: 'Workspace guide', panel: async () => await slice.build('Card', { title: 'Make room for your work', text: 'Drag near an edge to split. Drag onto a tab strip to merge. Use the Move controls or keyboard shortcuts if you prefer.', variant: 'ghost' }) }
  ],
  layout: { type: 'split', id: 'workspace', orientation: 'horizontal', sizes: [58, 42], children: [
    { type: 'group', id: 'writing', label: 'Writing', tabs: ['editor', 'checklist'], activeTab: 'editor' },
    { type: 'group', id: 'review', label: 'Review', tabs: ['preview', 'guide'], activeTab: 'preview' }
  ] },
  onBeforeClose: id => {
    if (id === 'editor' && editor.value !== savedDraft) { status.textContent = 'Save the draft before closing this tab.'; return false; }
    return true;
  },
  onChange: (layout, detail) => { status.textContent = `${detail.reason}: ${detail.tabId || 'panel sizes'}`; }
});
dock.style.height = '460px';
const tools = document.createElement('div'); tools.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';
tools.append(
  await slice.build('Button', { value: 'Save draft', size: 'sm', onClick: () => { savedDraft = editor.value; status.textContent = 'Draft marked as saved for this demo.'; } }),
  await slice.build('Button', { value: 'Preview below writing', size: 'sm', variant: 'outlined', onClick: async () => { await dock.moveTab('preview', 'writing', { position: 'bottom' }); } })
);
const box = document.createElement('div'); box.style.width = '100%'; box.append(tools, dock, status); return box;
:::

## Export and restore without rebuilding content

`getLayout()` returns a fresh serializable tree: tab IDs, order, active tabs, groups, splits and current sizes. Keep item definitions in your application; JSON cannot serialize a component instance or a factory. Storage is explicit and app-owned. Version your storage key and reconcile item IDs when your application's available tabs change.

:::script label="Save a personal research workspace" expected="Three research tabs. Save their arrangement, change it, then restore the saved tree. The notes field remains the same live instance. Locking layout edits still lets you use the content."
const notes = await slice.build('Textarea', { label: 'Research notes', labelPlacement: 'above', rows: 9, value: 'Questions to explore:\n\n1. Which panels need to be visible together?\n2. What should be remembered between sessions?' });
const dock = await slice.build('DockLayout', { items: [
  { id: 'notes', label: 'Notes', panel: notes },
  { id: 'sources', label: 'Sources', panel: await slice.build('Card', { title: 'Component sources', text: 'Tabs owns a group; SplitPane owns its available space; DockLayout coordinates the arrangement.', variant: 'ghost' }) },
  { id: 'summary', label: 'Summary', panel: await slice.build('Card', { title: 'Working findings', text: 'Keep the content stable while changing the view around it.', variant: 'outlined' }) }
] });
dock.style.height = '360px';
const key = 'slice-research-workspace-v1';
const status = document.createElement('p'); status.setAttribute('role', 'status');
const bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';
bar.append(
  await slice.build('Button', { value: 'Save layout', size: 'sm', onClick: () => {
    try { localStorage.setItem(key, JSON.stringify(dock.getLayout())); status.textContent = 'Layout saved.'; }
    catch { status.textContent = 'Storage is unavailable.'; }
  } }),
  await slice.build('Button', { value: 'Restore layout', size: 'sm', variant: 'outlined', onClick: async () => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) { status.textContent = 'Save a layout first.'; return; }
      status.textContent = await dock.restoreLayout(JSON.parse(stored)) ? 'Layout restored. Notes are unchanged.' : 'Unlock layout editing first.';
    } catch { status.textContent = 'The saved layout is invalid for the current tabs.'; }
  } }),
  await slice.build('Button', { value: 'Lock / unlock layout', size: 'sm', variant: 'ghost', onClick: () => { dock.disabled = !dock.disabled; status.textContent = dock.disabled ? 'Layout editing locked.' : 'Layout editing unlocked.'; } })
);
const box = document.createElement('div'); box.style.width = '100%'; box.append(bar, dock, status); return box;
:::

## A code editor workspace

The demo below assembles a complete editor from public components: `TreeView` for the files, editable `Tabs` inside this `DockLayout`, a nested `SplitPane` for the console, and a live preview pane. Drag any tab to another strip or to a panel edge; the editor text, the preview and the console keep their state. The terminal accepts `help`, `ls`, `save`, `build` and `clear`, and the status bar follows the active file and caret.

:::script label="A code editor workspace" expected="A full editor shell with an explorer, editable file tabs, a dockable live preview, a terminal and a status bar. Drag a tab to another strip or split the preview to the right; edits and notes survive the move."
const demo = await slice.build('CodeEditorDemo', { height: '620px' });
return demo;
:::

## Props

| Prop | Default | Meaning |
| --- | --- | --- |
| `items` | `[]` | Tabs descriptors. Reconcile by globally unique ID; removed content is destroyed. New IDs enter the first group. |
| `layout` | `null` | JSON tree, or null for a single `main` group. Assigning it validates and updates silently. |
| `draggable` | `true` | Enables pointer dragging. Keyboard and visible Move controls remain available. |
| `disabled` | `false` | Locks layout edits: moving, resizing, closing and restoring. Existing content remains usable. |
| `closable` | `true` | Default for tab close affordances. Each item can override it. |
| `minPanelSize` | `8` | Minimum percentage for each split child; clamped to 0–40. Infeasible bounds follow SplitPane's relaxation rules. |
| `ariaLabel` | translated | Region's accessible name. |
| `texts` | en/es defaults | Overrides for workspace/group labels, move destinations, help, empty and announcement texts. |
| `onChange` | `null` | `(layout, { reason, tabId, groupId })`. Reasons: `select`, `resize`, `move`, `close`, `restore`. |
| `onBeforeClose` | `null` | `(tabId, item) => boolean or Promise<boolean>`. False keeps the tab open. A rejected veto keeps it open and announces failure. |
| `onClose` | `null` | `(tabId, item)` after successful close. |

## Methods

- `await moveTab(tabId, groupId, { index, position })`: positions are `center` (default), `left`, `right`, `top`, `bottom`. Center inserts into the group's tab strip; `index` is the **final zero-based index after removing the source**. Omitted index appends. Edge positions create a new group beside the target. Left/right refer to physical edges, including in RTL.
- `await closeTab(tabId)`: respects disabled/closable and the close veto, destroys the content and prunes empty groups. The final close leaves one reachable empty group.
- `getLayout()`: fresh JSON snapshot including current active tabs and splitter sizes.
- `await restoreLayout(tree)`: validates the whole tree before applying it. Invalid data throws TypeError and leaves the current view intact. Changing the tree transfers existing entries; it does not replay factories.
- `getTabs(groupId)`: the underlying Tabs instance, for selection or inspection. Use DockLayout's methods for structural edits so its model stays consistent.

Mutation methods resolve to whether the operation succeeded. No-op, disabled, unknown-tab and concurrent user edits during a layout update return false. Wait for a method before starting the next one. Prop assignments are silent; methods and user interactions notify. `onChange` can fire repeatedly during resize; debounce persistence or use a Save button.

## Pointer and keyboard

Drag starts after 8px. A preview shows the tab insertion slot or half-panel split target. Dropping outside this workspace, pressing Escape, pointer cancellation or destruction discards the gesture. Touch and pen use the same Pointer Events path; dragging is restricted to tab headers.

| Input | Action |
| --- | --- |
| Ctrl + Shift + Left / Right | Reorder the focused tab within its group; follows RTL direction. |
| Ctrl + Shift + PageUp / PageDown | Move the focused tab to the previous/next group. |
| Ctrl + Alt + arrow | Split the focused tab toward that edge. |
| Escape | Cancel a pending drag. |
| Destination selector + Move | Visible, keyboard-accessible move/split alternative. |
| Tabs / SplitPane keys | Normal tab selection, closing and separator resizing continue to work. |

A polite live region announces moves and closes. Content focus, supported text selection and scroll offsets are restored after moving DOM. Native browser state tied to DOM attachment (for example, an iframe's browsing context) may behave differently; this is not a guarantee that every browser-owned resource survives reparenting.

## Lifecycle and compatibility

Tabs gains `moveTab(id, targetTabs, index, { activate })` for transferring an actual entry, including lazy work, to another group. SplitPane gains `releasePanels()` for handing its content back without destroying it. A caller that releases content must adopt or destroy it.

The shared ownership bridge targets the verified Slice Controller 4.x ancestry contract: it unlinks the previous parent before re-registering the same live component. Keep the transfer/source-destruction tests when upgrading the framework. Existing public props and methods retain their behavior.

DockLayout owns its Tabs, SplitPane instances and supplied content. Destroying it releases pointer capture and destroys owned content, including never-selected panels and late async results. The layout tree contains no HTML, executable code or content factories; dynamic labels are inserted as text.
