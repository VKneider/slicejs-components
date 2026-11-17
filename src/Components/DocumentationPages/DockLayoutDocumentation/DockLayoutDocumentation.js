export default class DockLayoutDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"Release workspace: edit, preview and rearrange","expected":"Editable release notes and a preview group. Drag tabs between strips or to panel edges; use the destination selector and Move button as an alternative. The draft and its selection remain intact after moving.","kind":"script","content":"const initial = '# Next release\\n\\n- Resizable panels\\n- Dockable tabs\\n- Masonry collections\\n\\nWrite a release note here…';\nconst editor = await slice.build('Textarea', { label: 'release-notes.md', labelPlacement: 'above', rows: 11, value: initial, help: 'Moving this tab keeps the same editor instance.' });\nconst editorBox = document.createElement('div'); editorBox.style.cssText = 'padding:14px;box-sizing:border-box'; editorBox.append(editor);\nconst checklist = await slice.build('TreeView', { items: [{ id: 'review', label: 'Review checklist', expanded: true, items: [\n  { id: 'keyboard', label: 'Keyboard and focus' }, { id: 'resize', label: 'Resize and split' }, { id: 'restore', label: 'Restore saved distribution' }\n] }] });\nconst preview = await slice.build('Card', {\n  title: 'Slice workspace', subtitle: 'Release preview', variant: 'ghost',\n  text: 'Arrange your workspace around the task. Keep the editor wide, move the checklist below it, or bring the preview alongside the draft.',\n  content: await slice.build('ProgressBar', { label: 'Release review', value: 3, max: 5, showValue: true })\n});\nconst status = document.createElement('p'); status.setAttribute('role', 'status'); status.style.fontSize = '.85rem';\nlet savedDraft = initial;\nconst dock = await slice.build('DockLayout', {\n  items: [\n    { id: 'editor', label: 'Release notes', panel: editorBox },\n    { id: 'checklist', label: 'Checklist', panel: checklist },\n    { id: 'preview', label: 'Preview', panel: preview },\n    { id: 'guide', label: 'Workspace guide', panel: async () => await slice.build('Card', { title: 'Make room for your work', text: 'Drag near an edge to split. Drag onto a tab strip to merge. Use the Move controls or keyboard shortcuts if you prefer.', variant: 'ghost' }) }\n  ],\n  layout: { type: 'split', id: 'workspace', orientation: 'horizontal', sizes: [58, 42], children: [\n    { type: 'group', id: 'writing', label: 'Writing', tabs: ['editor', 'checklist'], activeTab: 'editor' },\n    { type: 'group', id: 'review', label: 'Review', tabs: ['preview', 'guide'], activeTab: 'preview' }\n  ] },\n  onBeforeClose: id => {\n    if (id === 'editor' && editor.value !== savedDraft) { status.textContent = 'Save the draft before closing this tab.'; return false; }\n    return true;\n  },\n  onChange: (layout, detail) => { status.textContent = `${detail.reason}: ${detail.tabId || 'panel sizes'}`; }\n});\ndock.style.height = '460px';\nconst tools = document.createElement('div'); tools.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';\ntools.append(\n  await slice.build('Button', { value: 'Save draft', size: 'sm', onClick: () => { savedDraft = editor.value; status.textContent = 'Draft marked as saved for this demo.'; } }),\n  await slice.build('Button', { value: 'Preview below writing', size: 'sm', variant: 'outlined', onClick: async () => { await dock.moveTab('preview', 'writing', { position: 'bottom' }); } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(tools, dock, status); return box;"},{"label":"Save a personal research workspace","expected":"Three research tabs. Save their arrangement, change it, then restore the saved tree. The notes field remains the same live instance. Locking layout edits still lets you use the content.","kind":"script","content":"const notes = await slice.build('Textarea', { label: 'Research notes', labelPlacement: 'above', rows: 9, value: 'Questions to explore:\\n\\n1. Which panels need to be visible together?\\n2. What should be remembered between sessions?' });\nconst dock = await slice.build('DockLayout', { items: [\n  { id: 'notes', label: 'Notes', panel: notes },\n  { id: 'sources', label: 'Sources', panel: await slice.build('Card', { title: 'Component sources', text: 'Tabs owns a group; SplitPane owns its available space; DockLayout coordinates the arrangement.', variant: 'ghost' }) },\n  { id: 'summary', label: 'Summary', panel: await slice.build('Card', { title: 'Working findings', text: 'Keep the content stable while changing the view around it.', variant: 'outlined' }) }\n] });\ndock.style.height = '360px';\nconst key = 'slice-research-workspace-v1';\nconst status = document.createElement('p'); status.setAttribute('role', 'status');\nconst bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';\nbar.append(\n  await slice.build('Button', { value: 'Save layout', size: 'sm', onClick: () => {\n    try { localStorage.setItem(key, JSON.stringify(dock.getLayout())); status.textContent = 'Layout saved.'; }\n    catch { status.textContent = 'Storage is unavailable.'; }\n  } }),\n  await slice.build('Button', { value: 'Restore layout', size: 'sm', variant: 'outlined', onClick: async () => {\n    try {\n      const stored = localStorage.getItem(key);\n      if (!stored) { status.textContent = 'Save a layout first.'; return; }\n      status.textContent = await dock.restoreLayout(JSON.parse(stored)) ? 'Layout restored. Notes are unchanged.' : 'Unlock layout editing first.';\n    } catch { status.textContent = 'The saved layout is invalid for the current tabs.'; }\n  } }),\n  await slice.build('Button', { value: 'Lock / unlock layout', size: 'sm', variant: 'ghost', onClick: () => { dock.disabled = !dock.disabled; status.textContent = dock.disabled ? 'Layout editing locked.' : 'Layout editing unlocked.'; } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(bar, dock, status); return box;"}];
  }

  async init() {
    this.markdownPath = "dock-layout.md";
    this.markdownContent = "---\ntitle: DockLayout\nroute: /docs/layout/dock-layout\nnavLabel: DockLayout\nsection: Layout\ngroup: Containers\norder: 25\ndescription: Dockable workspaces composed of Tabs and SplitPane. Move live tabs, create splits, resize panels and restore a serializable distribution.\ncomponent: DockLayoutDocumentation\ngenerate: true\ntags: [dock, docking, workspace, tabs, splitpane, panels, drag, editor]\n---\n\n# DockLayout\n\n`DockLayout` arranges groups of [Tabs](/docs/navigation/tabs) inside [SplitPane](/docs/layout/split-pane). Drag a tab to another strip to move or reorder it; drop it near a panel edge to create a split. Empty groups disappear and a split with one child collapses into that child.\n\n**Content is moved, not rebuilt.** Tab IDs identify the existing entries, panel wrappers and live nodes. Lazy factories run when first selected and continue if their tab moves while loading. The workspace transfers component ownership before retiring old containers, so deleting an empty source group cannot destroy a moved child.\n\nUse it for editors, analysis tools, monitoring dashboards and review workspaces. Use plain Tabs for one fixed group, SplitPane for fixed resizable regions, or Layout for application navigation. Floating windows and dragging across separate DockLayout instances are outside this first version.\n\n## Content and distribution are separate\n\n`items` uses the Tabs descriptor shape: `{ id, label, panel, icon?, badge?, disabled?, closable? }`. IDs must be globally unique strings. `panel` is text, a live DOM/Slice component, or a lazy function returning one (possibly asynchronously). Keep the same panel node/factory when refreshing an item; changing the source intentionally replaces its content. Supplied nodes belong to the workspace, including never-selected nodes.\n\n`layout` contains only JSON data:\n\n```js\n{\n  type: 'split', id: 'workspace', orientation: 'horizontal', sizes: [35, 65],\n  children: [\n    { type: 'group', id: 'files', label: 'Sources', tabs: ['brief', 'notes'], activeTab: 'brief' },\n    { type: 'group', id: 'review', label: 'Review', tabs: ['preview'], activeTab: 'preview' }\n  ]\n}\n```\n\nWithout `layout`, every item starts in the `main` group. A supplied layout must contain each current item ID exactly once. Unknown/repeated tab IDs, duplicate node IDs, invalid sizes, cycles and oversized trees are rejected before changing the view. Groups and splits share one namespace for their node IDs. `sizes` are relative weights, normalized to percentages by SplitPane.\n\nGive the host a definite height, such as `dock.style.height = '460px'`. Groups scroll within their available space.\n\n## A review workspace\n\n:::script label=\"Release workspace: edit, preview and rearrange\" expected=\"Editable release notes and a preview group. Drag tabs between strips or to panel edges; use the destination selector and Move button as an alternative. The draft and its selection remain intact after moving.\"\nconst initial = '# Next release\\n\\n- Resizable panels\\n- Dockable tabs\\n- Masonry collections\\n\\nWrite a release note here…';\nconst editor = await slice.build('Textarea', { label: 'release-notes.md', labelPlacement: 'above', rows: 11, value: initial, help: 'Moving this tab keeps the same editor instance.' });\nconst editorBox = document.createElement('div'); editorBox.style.cssText = 'padding:14px;box-sizing:border-box'; editorBox.append(editor);\nconst checklist = await slice.build('TreeView', { items: [{ id: 'review', label: 'Review checklist', expanded: true, items: [\n  { id: 'keyboard', label: 'Keyboard and focus' }, { id: 'resize', label: 'Resize and split' }, { id: 'restore', label: 'Restore saved distribution' }\n] }] });\nconst preview = await slice.build('Card', {\n  title: 'Slice workspace', subtitle: 'Release preview', variant: 'ghost',\n  text: 'Arrange your workspace around the task. Keep the editor wide, move the checklist below it, or bring the preview alongside the draft.',\n  content: await slice.build('ProgressBar', { label: 'Release review', value: 3, max: 5, showValue: true })\n});\nconst status = document.createElement('p'); status.setAttribute('role', 'status'); status.style.fontSize = '.85rem';\nlet savedDraft = initial;\nconst dock = await slice.build('DockLayout', {\n  items: [\n    { id: 'editor', label: 'Release notes', panel: editorBox },\n    { id: 'checklist', label: 'Checklist', panel: checklist },\n    { id: 'preview', label: 'Preview', panel: preview },\n    { id: 'guide', label: 'Workspace guide', panel: async () => await slice.build('Card', { title: 'Make room for your work', text: 'Drag near an edge to split. Drag onto a tab strip to merge. Use the Move controls or keyboard shortcuts if you prefer.', variant: 'ghost' }) }\n  ],\n  layout: { type: 'split', id: 'workspace', orientation: 'horizontal', sizes: [58, 42], children: [\n    { type: 'group', id: 'writing', label: 'Writing', tabs: ['editor', 'checklist'], activeTab: 'editor' },\n    { type: 'group', id: 'review', label: 'Review', tabs: ['preview', 'guide'], activeTab: 'preview' }\n  ] },\n  onBeforeClose: id => {\n    if (id === 'editor' && editor.value !== savedDraft) { status.textContent = 'Save the draft before closing this tab.'; return false; }\n    return true;\n  },\n  onChange: (layout, detail) => { status.textContent = `${detail.reason}: ${detail.tabId || 'panel sizes'}`; }\n});\ndock.style.height = '460px';\nconst tools = document.createElement('div'); tools.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';\ntools.append(\n  await slice.build('Button', { value: 'Save draft', size: 'sm', onClick: () => { savedDraft = editor.value; status.textContent = 'Draft marked as saved for this demo.'; } }),\n  await slice.build('Button', { value: 'Preview below writing', size: 'sm', variant: 'outlined', onClick: async () => { await dock.moveTab('preview', 'writing', { position: 'bottom' }); } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(tools, dock, status); return box;\n:::\n\n## Export and restore without rebuilding content\n\n`getLayout()` returns a fresh serializable tree: tab IDs, order, active tabs, groups, splits and current sizes. Keep item definitions in your application; JSON cannot serialize a component instance or a factory. Storage is explicit and app-owned. Version your storage key and reconcile item IDs when your application's available tabs change.\n\n:::script label=\"Save a personal research workspace\" expected=\"Three research tabs. Save their arrangement, change it, then restore the saved tree. The notes field remains the same live instance. Locking layout edits still lets you use the content.\"\nconst notes = await slice.build('Textarea', { label: 'Research notes', labelPlacement: 'above', rows: 9, value: 'Questions to explore:\\n\\n1. Which panels need to be visible together?\\n2. What should be remembered between sessions?' });\nconst dock = await slice.build('DockLayout', { items: [\n  { id: 'notes', label: 'Notes', panel: notes },\n  { id: 'sources', label: 'Sources', panel: await slice.build('Card', { title: 'Component sources', text: 'Tabs owns a group; SplitPane owns its available space; DockLayout coordinates the arrangement.', variant: 'ghost' }) },\n  { id: 'summary', label: 'Summary', panel: await slice.build('Card', { title: 'Working findings', text: 'Keep the content stable while changing the view around it.', variant: 'outlined' }) }\n] });\ndock.style.height = '360px';\nconst key = 'slice-research-workspace-v1';\nconst status = document.createElement('p'); status.setAttribute('role', 'status');\nconst bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';\nbar.append(\n  await slice.build('Button', { value: 'Save layout', size: 'sm', onClick: () => {\n    try { localStorage.setItem(key, JSON.stringify(dock.getLayout())); status.textContent = 'Layout saved.'; }\n    catch { status.textContent = 'Storage is unavailable.'; }\n  } }),\n  await slice.build('Button', { value: 'Restore layout', size: 'sm', variant: 'outlined', onClick: async () => {\n    try {\n      const stored = localStorage.getItem(key);\n      if (!stored) { status.textContent = 'Save a layout first.'; return; }\n      status.textContent = await dock.restoreLayout(JSON.parse(stored)) ? 'Layout restored. Notes are unchanged.' : 'Unlock layout editing first.';\n    } catch { status.textContent = 'The saved layout is invalid for the current tabs.'; }\n  } }),\n  await slice.build('Button', { value: 'Lock / unlock layout', size: 'sm', variant: 'ghost', onClick: () => { dock.disabled = !dock.disabled; status.textContent = dock.disabled ? 'Layout editing locked.' : 'Layout editing unlocked.'; } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(bar, dock, status); return box;\n:::\n\n## Props\n\n| Prop | Default | Meaning |\n| --- | --- | --- |\n| `items` | `[]` | Tabs descriptors. Reconcile by globally unique ID; removed content is destroyed. New IDs enter the first group. |\n| `layout` | `null` | JSON tree, or null for a single `main` group. Assigning it validates and updates silently. |\n| `draggable` | `true` | Enables pointer dragging. Keyboard and visible Move controls remain available. |\n| `disabled` | `false` | Locks layout edits: moving, resizing, closing and restoring. Existing content remains usable. |\n| `closable` | `true` | Default for tab close affordances. Each item can override it. |\n| `minPanelSize` | `8` | Minimum percentage for each split child; clamped to 0–40. Infeasible bounds follow SplitPane's relaxation rules. |\n| `ariaLabel` | translated | Region's accessible name. |\n| `texts` | en/es defaults | Overrides for workspace/group labels, move destinations, help, empty and announcement texts. |\n| `onChange` | `null` | `(layout, { reason, tabId, groupId })`. Reasons: `select`, `resize`, `move`, `close`, `restore`. |\n| `onBeforeClose` | `null` | `(tabId, item) => boolean or Promise<boolean>`. False keeps the tab open. A rejected veto keeps it open and announces failure. |\n| `onClose` | `null` | `(tabId, item)` after successful close. |\n\n## Methods\n\n- `await moveTab(tabId, groupId, { index, position })`: positions are `center` (default), `left`, `right`, `top`, `bottom`. Center inserts into the group's tab strip; `index` is the **final zero-based index after removing the source**. Omitted index appends. Edge positions create a new group beside the target. Left/right refer to physical edges, including in RTL.\n- `await closeTab(tabId)`: respects disabled/closable and the close veto, destroys the content and prunes empty groups. The final close leaves one reachable empty group.\n- `getLayout()`: fresh JSON snapshot including current active tabs and splitter sizes.\n- `await restoreLayout(tree)`: validates the whole tree before applying it. Invalid data throws TypeError and leaves the current view intact. Changing the tree transfers existing entries; it does not replay factories.\n- `getTabs(groupId)`: the underlying Tabs instance, for selection or inspection. Use DockLayout's methods for structural edits so its model stays consistent.\n\nMutation methods resolve to whether the operation succeeded. No-op, disabled, unknown-tab and concurrent user edits during a layout update return false. Wait for a method before starting the next one. Prop assignments are silent; methods and user interactions notify. `onChange` can fire repeatedly during resize; debounce persistence or use a Save button.\n\n## Pointer and keyboard\n\nDrag starts after 8px. A preview shows the tab insertion slot or half-panel split target. Dropping outside this workspace, pressing Escape, pointer cancellation or destruction discards the gesture. Touch and pen use the same Pointer Events path; dragging is restricted to tab headers.\n\n| Input | Action |\n| --- | --- |\n| Ctrl + Shift + Left / Right | Reorder the focused tab within its group; follows RTL direction. |\n| Ctrl + Shift + PageUp / PageDown | Move the focused tab to the previous/next group. |\n| Ctrl + Alt + arrow | Split the focused tab toward that edge. |\n| Escape | Cancel a pending drag. |\n| Destination selector + Move | Visible, keyboard-accessible move/split alternative. |\n| Tabs / SplitPane keys | Normal tab selection, closing and separator resizing continue to work. |\n\nA polite live region announces moves and closes. Content focus, supported text selection and scroll offsets are restored after moving DOM. Native browser state tied to DOM attachment (for example, an iframe's browsing context) may behave differently; this is not a guarantee that every browser-owned resource survives reparenting.\n\n## Lifecycle and compatibility\n\nTabs gains `moveTab(id, targetTabs, index, { activate })` for transferring an actual entry, including lazy work, to another group. SplitPane gains `releasePanels()` for handing its content back without destroying it. A caller that releases content must adopt or destroy it.\n\nThe shared ownership bridge targets the verified Slice Controller 4.x ancestry contract: it unlinks the previous parent before re-registering the same live component. Keep the transfer/source-destruction tests when upgrading the framework. Existing public props and methods retain their behavior.\n\nDockLayout owns its Tabs, SplitPane instances and supplied content. Destroying it releases pointer capture and destroys owned content, including never-selected panels and late async results. The layout tree contains no HTML, executable code or content factories; dynamic labels are inserted as text.\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            const code = await slice.build('CodeVisualizer', {
               value: "{\n  type: 'split', id: 'workspace', orientation: 'horizontal', sizes: [35, 65],\n  children: [\n    { type: 'group', id: 'files', label: 'Sources', tabs: ['brief', 'notes'], activeTab: 'brief' },\n    { type: 'group', id: 'review', label: 'Review', tabs: ['preview'], activeTab: 'preview' }\n  ]\n}",
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
         const container = this.querySelector('[data-block-id="doc-block-4"]');
         if (container) {
            const lines = ["| Prop | Default | Meaning |","| --- | --- | --- |","| `items` | `[]` | Tabs descriptors. Reconcile by globally unique ID; removed content is destroyed. New IDs enter the first group. |","| `layout` | `null` | JSON tree, or null for a single `main` group. Assigning it validates and updates silently. |","| `draggable` | `true` | Enables pointer dragging. Keyboard and visible Move controls remain available. |","| `disabled` | `false` | Locks layout edits: moving, resizing, closing and restoring. Existing content remains usable. |","| `closable` | `true` | Default for tab close affordances. Each item can override it. |","| `minPanelSize` | `8` | Minimum percentage for each split child; clamped to 0–40. Infeasible bounds follow SplitPane's relaxation rules. |","| `ariaLabel` | translated | Region's accessible name. |","| `texts` | en/es defaults | Overrides for workspace/group labels, move destinations, help, empty and announcement texts. |","| `onChange` | `null` | `(layout, { reason, tabId, groupId })`. Reasons: `select`, `resize`, `move`, `close`, `restore`. |","| `onBeforeClose` | `null` | `(tabId, item) => boolean or Promise<boolean>`. False keeps the tab open. A rejected veto keeps it open and announces failure. |","| `onClose` | `null` | `(tabId, item)` after successful close. |"];
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
         const container = this.querySelector('[data-block-id="doc-block-5"]');
         if (container) {
            const lines = ["| Input | Action |","| --- | --- |","| Ctrl + Shift + Left / Right | Reorder the focused tab within its group; follows RTL direction. |","| Ctrl + Shift + PageUp / PageDown | Move the focused tab to the previous/next group. |","| Ctrl + Alt + arrow | Split the focused tab toward that edge. |","| Escape | Cancel a pending drag. |","| Destination selector + Move | Visible, keyboard-accessible move/split alternative. |","| Tabs / SplitPane keys | Normal tab selection, closing and separator resizing continue to work. |"];
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
         const container = this.querySelector('[data-block-id="doc-block-6"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"items[].id\",\"type\":\"string\",\"required\":true,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].label\",\"type\":\"string\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].panel\",\"type\":\"any\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].icon\",\"type\":\"string\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].badge\",\"type\":\"any\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].disabled\",\"type\":\"boolean\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].closable\",\"type\":\"boolean\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"layout\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"draggable\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"closable\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"minPanelSize\",\"type\":\"number\",\"required\":false,\"default\":\"8\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onBeforeClose\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onClose\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"items[].id\",\"type\":\"string\",\"required\":true,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].label\",\"type\":\"string\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].panel\",\"type\":\"any\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].icon\",\"type\":\"string\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].badge\",\"type\":\"any\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].disabled\",\"type\":\"boolean\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].closable\",\"type\":\"boolean\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"layout\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"draggable\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"closable\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"minPanelSize\",\"type\":\"number\",\"required\":false,\"default\":\"8\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onBeforeClose\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onClose\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"Tabs","path":"/docs/navigation/tabs"},{"text":"SplitPane","path":"/docs/layout/split-pane"}];
         for (const [index, linkProps] of links.entries()) {
            const placeholder = this.querySelector('[data-inline-link="' + index + '"]');
            if (!placeholder) continue;
            const link = await slice.build('Link', linkProps);
            placeholder.replaceWith(link);
            this._inlineLinks.push(link);
         }
      }
    await this.renderScriptScenarios();
  }

  async update() {
    // Refresh dynamic content here if needed
  }

   beforeDestroy() {
     for (const link of this._inlineLinks) {
       slice.controller.destroyComponent(link);
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

customElements.define('slice-docklayoutdocumentation', DockLayoutDocumentation);
