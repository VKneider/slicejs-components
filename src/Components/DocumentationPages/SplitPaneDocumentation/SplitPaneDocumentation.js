export default class SplitPaneDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A project workspace","expected":"Three independently sized panels: a real file tree, editable project notes and a details card. Drag or use arrow keys; collapse and restore the explorer without losing the draft.","kind":"script","content":"const tree = await slice.build('TreeView', {\n  items: [{ id: 'src', label: 'src', expanded: true, items: [\n    { id: 'app', label: 'App.js', description: 'Application entry' },\n    { id: 'notes', label: 'release-notes.md', description: 'Draft for the next release' },\n    { id: 'theme', label: 'theme.css' }\n  ] }]\n});\nconst notes = await slice.build('Textarea', {\n  label: 'release-notes.md', labelPlacement: 'above', rows: 10,\n  value: '# Release notes\\n\\n- SplitPane: resizable workspaces\\n- Grid: masonry collections\\n\\nWrite your next idea here…',\n  help: 'Your draft stays intact when a panel resizes or collapses.'\n});\nconst editor = document.createElement('div');\neditor.style.cssText = 'padding:12px;box-sizing:border-box';\neditor.append(notes);\nconst details = await slice.build('Card', {\n  title: 'Release checklist', subtitle: 'Workspace / components', variant: 'ghost',\n  content: await slice.build('ProgressBar', { value: 3, max: 5, label: 'Reviewed', showValue: true }),\n  text: 'Check keyboard controls, small containers, translations, cleanup and documentation.'\n});\nconst pane = await slice.build('SplitPane', {\n  sizes: [24, 50, 26],\n  panels: [\n    { id: 'files', label: 'Project files', content: tree, minSize: 12, maxSize: 40, collapsible: true },\n    { id: 'editor', label: 'Editor', content: editor, minSize: 30 },\n    { id: 'inspector', label: 'Inspector', content: details, minSize: 15, collapsible: true }\n  ]\n});\npane.style.cssText = 'height:380px;border:1px solid var(--slice-border);border-radius:12px;overflow:hidden';\nconst controls = document.createElement('div');\ncontrols.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px';\ncontrols.append(\n  await slice.build('Button', { value: 'Toggle files', variant: 'outlined', size: 'sm', onClick: () => pane.toggle('files') }),\n  await slice.build('Button', { value: 'Toggle inspector', variant: 'outlined', size: 'sm', onClick: () => pane.toggle('inspector') }),\n  await slice.build('Button', { value: 'Reset sizes', variant: 'ghost', size: 'sm', onClick: () => { pane.expand('files'); pane.expand('inspector'); pane.sizes = [24, 50, 26]; } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(controls, pane);\nreturn box;"},{"label":"Review with a collapsible activity log","expected":"A side-by-side copy review above a collapsible activity log. Both orientations work together; edits remain intact after collapse.","kind":"script","content":"const before = await slice.build('Card', { title: 'Current copy', text: 'Build an app with reusable components.', variant: 'outlined' });\nconst after = await slice.build('Textarea', { label: 'Proposed copy', labelPlacement: 'above', rows: 6, value: 'Build your next workspace with Slice. Resize panels, arrange cards and keep your flow.' });\nconst review = await slice.build('SplitPane', {\n  sizes: [45, 55], panels: [{ id: 'before', label: 'Current copy', content: before, minSize: 20 }, { id: 'after', label: 'Proposed copy', content: after, minSize: 25 }]\n});\nconst activity = await slice.build('Card', { title: 'Activity', subtitle: 'Today', text: '09:10 Draft created · 10:25 Copy updated · 11:00 Review requested', variant: 'ghost' });\nconst pane = await slice.build('SplitPane', {\n  orientation: 'vertical', sizes: [72, 28],\n  panels: [{ id: 'review', label: 'Copy comparison', content: review, minSize: 35 }, { id: 'activity', label: 'Activity log', content: activity, minSize: 15, maxSize: 50, collapsible: true }]\n});\npane.style.height = '400px';\nreturn pane;"},{"label":"Remember this layout","expected":"A two-panel planning board. Save the current distribution, resize it, then Restore to recover both sizes and collapsed panels.","kind":"script","content":"const key = 'slice-split-pane-planning-v1';\nconst pane = await slice.build('SplitPane', {\n  sizes: [35, 65], panels: [\n    { id: 'brief', label: 'Project brief', collapsible: true, minSize: 15, content: await slice.build('Card', { title: 'Project brief', text: 'Keep the review workspace comfortable on each screen.', variant: 'ghost' }) },\n    { id: 'tasks', label: 'Tasks', minSize: 25, content: await slice.build('Card', { title: 'Next actions', text: 'Review constraints, try keyboard resizing, then save a layout.', variant: 'outlined' }) }\n  ]\n});\npane.style.height = '240px';\nconst status = document.createElement('p'); status.setAttribute('role', 'status');\nconst controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';\ncontrols.append(\n  await slice.build('Button', { value: 'Save layout', size: 'sm', onClick: () => {\n    try { localStorage.setItem(key, JSON.stringify({ sizes: pane.sizes, collapsed: pane.panels.filter(p => p.collapsed).map(p => p.id) })); status.textContent = 'Layout saved.'; }\n    catch { status.textContent = 'Storage is unavailable.'; }\n  } }),\n  await slice.build('Button', { value: 'Restore layout', variant: 'outlined', size: 'sm', onClick: () => {\n    try {\n      const saved = JSON.parse(localStorage.getItem(key) || 'null');\n      if (!saved || !Array.isArray(saved.sizes) || saved.sizes.length !== pane.panels.length || !saved.sizes.every(v => Number.isFinite(v) && v >= 0)) { status.textContent = 'Save a layout first.'; return; }\n      pane.panels = pane.panels.map(p => ({ ...p, collapsed: Array.isArray(saved.collapsed) && saved.collapsed.includes(p.id) }));\n      pane.sizes = saved.sizes; status.textContent = 'Layout restored.';\n    } catch { status.textContent = 'The saved layout could not be read.'; }\n  } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(controls, status, pane); return box;"}];
  }

  async init() {
    this.markdownPath = "split-pane.md";
    this.markdownContent = "---\ntitle: SplitPane\nroute: /docs/layout/split-pane\nnavLabel: SplitPane\nsection: Layout\ngroup: Containers\norder: 24\ndescription: Resizable workspaces with multiple panels, percentage limits, collapse and restore, pointer and keyboard controls.\ncomponent: SplitPaneDocumentation\ngenerate: true\ntags: [splitpane, splitter, resizable, panels, workspace, editor, layout]\n---\n\n# SplitPane\n\n`SplitPane` shares space between two or more live panels. Drag a separator, focus it and use the keyboard, or restore a saved `sizes` array. The content stays mounted while sizes change; collapsed content is hidden and inert.\n\nUse it for an explorer and editor, side-by-side review, or a dashboard with a resizable inspector. Use [Layout](/docs/layout/layout) for the application frame and navigation, [Grid](/docs/layout/grid) for responsive cards, and [Tabs](/docs/navigation/tabs) when only one view should be visible. SplitPane does not turn into a mobile drawer automatically.\n\n## Contract\n\n| Prop | Meaning |\n| --- | --- |\n| `panels` | Array of `{ id, label, content, minSize, maxSize, collapsible, collapsed }`. Unique string IDs are recommended; duplicate IDs are ignored. `content` accepts text, a live node/component, or an array of them. |\n| `sizes` | Relative weights normalized to percentages; defaults to equal shares. Getter returns actual percentages. Assigning it is silent. |\n| `orientation` | `horizontal` (side by side, default) or `vertical` (stacked). |\n| `disabled` | Disables gestures, keyboard resizing and API resize/collapse actions. |\n| `keyboardStep` | Percentage points per arrow press, default `2`. Shift multiplies it by five. |\n| `onChange` | `(sizes, { reason, index, collapsed })`. Reasons: `pointer`, `keyboard`, `api`, `collapse`, `expand`, `cancel`. Collapsed is an array of panel IDs. |\n| `texts` | Built-in text overrides: `panel`, `resize`, `help`; English/Spanish defaults follow `slice.translator`. |\n\n`minSize` and `maxSize` are percentages of panel space, excluding the separators; defaults are `0` and `100`. Panels scroll when their content does not fit. Infeasible minima are scaled down proportionally; infeasible maxima are expanded to fill the space. `data-constrained=\"true\"` exposes this situation. Keep constraints feasible in your application for predictable limits.\n\nThe host fills its parent. **Give a vertical pane or full workspace a definite height**, for example `pane.style.height = '420px'`. A horizontal pane without a parent height can grow from its content, but fixed-height workspaces are easier to use.\n\n### Methods and ownership\n\n- `resize(separatorIndex, percent)` changes the panel before that separator and its neighbor. Other panels keep their sizes. Returns whether anything changed.\n- `collapse(idOrIndex)`, `expand(idOrIndex)`, `toggle(idOrIndex)` return whether the action succeeded. Only `collapsible` panels can collapse; the last expanded panel stays open. Expand restores its remembered size within current bounds.\n- Assigning `panels` reconciles by ID and preserves content nodes still present. Removed content is destroyed, including Slice components inside plain DOM wrappers. Nodes passed to the pane belong to it; do not share one live node across panels.\n- Programmatic `panels`, `sizes` and other prop assignments do not call `onChange`. Methods do.\n\n## Explorer, editor and inspector\n\n:::script label=\"A project workspace\" expected=\"Three independently sized panels: a real file tree, editable project notes and a details card. Drag or use arrow keys; collapse and restore the explorer without losing the draft.\"\nconst tree = await slice.build('TreeView', {\n  items: [{ id: 'src', label: 'src', expanded: true, items: [\n    { id: 'app', label: 'App.js', description: 'Application entry' },\n    { id: 'notes', label: 'release-notes.md', description: 'Draft for the next release' },\n    { id: 'theme', label: 'theme.css' }\n  ] }]\n});\nconst notes = await slice.build('Textarea', {\n  label: 'release-notes.md', labelPlacement: 'above', rows: 10,\n  value: '# Release notes\\n\\n- SplitPane: resizable workspaces\\n- Grid: masonry collections\\n\\nWrite your next idea here…',\n  help: 'Your draft stays intact when a panel resizes or collapses.'\n});\nconst editor = document.createElement('div');\neditor.style.cssText = 'padding:12px;box-sizing:border-box';\neditor.append(notes);\nconst details = await slice.build('Card', {\n  title: 'Release checklist', subtitle: 'Workspace / components', variant: 'ghost',\n  content: await slice.build('ProgressBar', { value: 3, max: 5, label: 'Reviewed', showValue: true }),\n  text: 'Check keyboard controls, small containers, translations, cleanup and documentation.'\n});\nconst pane = await slice.build('SplitPane', {\n  sizes: [24, 50, 26],\n  panels: [\n    { id: 'files', label: 'Project files', content: tree, minSize: 12, maxSize: 40, collapsible: true },\n    { id: 'editor', label: 'Editor', content: editor, minSize: 30 },\n    { id: 'inspector', label: 'Inspector', content: details, minSize: 15, collapsible: true }\n  ]\n});\npane.style.cssText = 'height:380px;border:1px solid var(--slice-border);border-radius:12px;overflow:hidden';\nconst controls = document.createElement('div');\ncontrols.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px';\ncontrols.append(\n  await slice.build('Button', { value: 'Toggle files', variant: 'outlined', size: 'sm', onClick: () => pane.toggle('files') }),\n  await slice.build('Button', { value: 'Toggle inspector', variant: 'outlined', size: 'sm', onClick: () => pane.toggle('inspector') }),\n  await slice.build('Button', { value: 'Reset sizes', variant: 'ghost', size: 'sm', onClick: () => { pane.expand('files'); pane.expand('inspector'); pane.sizes = [24, 50, 26]; } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(controls, pane);\nreturn box;\n:::\n\n## Vertical review and nested panes\n\nA panel can contain another SplitPane. Each separator handles only its own pane; nested keyboard/pointer events do not resize the parent.\n\n:::script label=\"Review with a collapsible activity log\" expected=\"A side-by-side copy review above a collapsible activity log. Both orientations work together; edits remain intact after collapse.\"\nconst before = await slice.build('Card', { title: 'Current copy', text: 'Build an app with reusable components.', variant: 'outlined' });\nconst after = await slice.build('Textarea', { label: 'Proposed copy', labelPlacement: 'above', rows: 6, value: 'Build your next workspace with Slice. Resize panels, arrange cards and keep your flow.' });\nconst review = await slice.build('SplitPane', {\n  sizes: [45, 55], panels: [{ id: 'before', label: 'Current copy', content: before, minSize: 20 }, { id: 'after', label: 'Proposed copy', content: after, minSize: 25 }]\n});\nconst activity = await slice.build('Card', { title: 'Activity', subtitle: 'Today', text: '09:10 Draft created · 10:25 Copy updated · 11:00 Review requested', variant: 'ghost' });\nconst pane = await slice.build('SplitPane', {\n  orientation: 'vertical', sizes: [72, 28],\n  panels: [{ id: 'review', label: 'Copy comparison', content: review, minSize: 35 }, { id: 'activity', label: 'Activity log', content: activity, minSize: 15, maxSize: 50, collapsible: true }]\n});\npane.style.height = '400px';\nreturn pane;\n:::\n\n## Saving a distribution\n\nPersistence stays in the app: choose a versioned key, validate stored input, and restore collapsed IDs before sizes. `onChange` fires during dragging, so debounce expensive persistence. This example saves only on an explicit button.\n\n:::script label=\"Remember this layout\" expected=\"A two-panel planning board. Save the current distribution, resize it, then Restore to recover both sizes and collapsed panels.\"\nconst key = 'slice-split-pane-planning-v1';\nconst pane = await slice.build('SplitPane', {\n  sizes: [35, 65], panels: [\n    { id: 'brief', label: 'Project brief', collapsible: true, minSize: 15, content: await slice.build('Card', { title: 'Project brief', text: 'Keep the review workspace comfortable on each screen.', variant: 'ghost' }) },\n    { id: 'tasks', label: 'Tasks', minSize: 25, content: await slice.build('Card', { title: 'Next actions', text: 'Review constraints, try keyboard resizing, then save a layout.', variant: 'outlined' }) }\n  ]\n});\npane.style.height = '240px';\nconst status = document.createElement('p'); status.setAttribute('role', 'status');\nconst controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';\ncontrols.append(\n  await slice.build('Button', { value: 'Save layout', size: 'sm', onClick: () => {\n    try { localStorage.setItem(key, JSON.stringify({ sizes: pane.sizes, collapsed: pane.panels.filter(p => p.collapsed).map(p => p.id) })); status.textContent = 'Layout saved.'; }\n    catch { status.textContent = 'Storage is unavailable.'; }\n  } }),\n  await slice.build('Button', { value: 'Restore layout', variant: 'outlined', size: 'sm', onClick: () => {\n    try {\n      const saved = JSON.parse(localStorage.getItem(key) || 'null');\n      if (!saved || !Array.isArray(saved.sizes) || saved.sizes.length !== pane.panels.length || !saved.sizes.every(v => Number.isFinite(v) && v >= 0)) { status.textContent = 'Save a layout first.'; return; }\n      pane.panels = pane.panels.map(p => ({ ...p, collapsed: Array.isArray(saved.collapsed) && saved.collapsed.includes(p.id) }));\n      pane.sizes = saved.sizes; status.textContent = 'Layout restored.';\n    } catch { status.textContent = 'The saved layout could not be read.'; }\n  } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(controls, status, pane); return box;\n:::\n\n## Keyboard and accessibility\n\n| Key | Action |\n| --- | --- |\n| Tab | Focus an enabled separator or the controls inside a panel. |\n| Left / Right | Resize side-by-side panels; direction follows RTL. |\n| Up / Down | Resize stacked panels. |\n| Shift + arrow | Five times `keyboardStep`. |\n| Home / End | Resize to the current lower/upper limit. |\n| Enter | Toggle the preceding collapsible panel, or the following panel if only it is collapsible. |\n\nSeparators announce their controlled panel, current percentage and effective limits. Pointer capture continues a drag outside the handle; pointer cancellation restores the starting distribution. Collapsed content cannot receive focus. If both adjacent panels are collapsible, use the API or a visible Button to toggle the following panel separately.\n\n## Styling\n\nUse the host to set dimensions. `--slice-split-pane-handle-size` defaults to `12px`; `--slice-split-pane-accent` and `--slice-split-pane-border` follow theme tokens. Keep the handle large enough to grab. No motion is required. Tiny panels scroll; this component does not replace responsive navigation or a mobile-specific product layout.\n\n## Transferring panel ownership\n\n`releasePanels()` returns the current descriptors with their actual content nodes and empties the\npane **without destroying that content**. Adopt the returned descriptors in another SplitPane or\ndestroy the released nodes explicitly. Destroying the old pane after adoption does not destroy\nthose components. This is used by [DockLayout](/docs/layout/dock-layout) when changing a split tree;\nnormal `panels = ...` replacement keeps its existing destroy-on-removal behavior.\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            const lines = ["| Prop | Meaning |","| --- | --- |","| `panels` | Array of `{ id, label, content, minSize, maxSize, collapsible, collapsed }`. Unique string IDs are recommended; duplicate IDs are ignored. `content` accepts text, a live node/component, or an array of them. |","| `sizes` | Relative weights normalized to percentages; defaults to equal shares. Getter returns actual percentages. Assigning it is silent. |","| `orientation` | `horizontal` (side by side, default) or `vertical` (stacked). |","| `disabled` | Disables gestures, keyboard resizing and API resize/collapse actions. |","| `keyboardStep` | Percentage points per arrow press, default `2`. Shift multiplies it by five. |","| `onChange` | `(sizes, { reason, index, collapsed })`. Reasons: `pointer`, `keyboard`, `api`, `collapse`, `expand`, `cancel`. Collapsed is an array of panel IDs. |","| `texts` | Built-in text overrides: `panel`, `resize`, `help`; English/Spanish defaults follow `slice.translator`. |"];
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
            const lines = ["| Key | Action |","| --- | --- |","| Tab | Focus an enabled separator or the controls inside a panel. |","| Left / Right | Resize side-by-side panels; direction follows RTL. |","| Up / Down | Resize stacked panels. |","| Shift + arrow | Five times `keyboardStep`. |","| Home / End | Resize to the current lower/upper limit. |","| Enter | Toggle the preceding collapsible panel, or the following panel if only it is collapsible. |"];
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
            if ("{\"props\":[{\"path\":\"panels\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"panels[].id\",\"type\":\"string\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"panels[].label\",\"type\":\"string\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"panels[].content\",\"type\":\"any\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"panels[].minSize\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"panels[].maxSize\",\"type\":\"number\",\"required\":false,\"default\":\"100\",\"allowedValues\":[]},{\"path\":\"panels[].collapsible\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"panels[].collapsed\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"sizes\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"sizes[]\",\"type\":\"number\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"orientation\",\"type\":\"string\",\"required\":false,\"default\":\"horizontal\",\"allowedValues\":[\"horizontal\",\"vertical\"]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"keyboardStep\",\"type\":\"number\",\"required\":false,\"default\":\"2\",\"allowedValues\":[]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"panels\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"panels[].id\",\"type\":\"string\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"panels[].label\",\"type\":\"string\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"panels[].content\",\"type\":\"any\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"panels[].minSize\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"panels[].maxSize\",\"type\":\"number\",\"required\":false,\"default\":\"100\",\"allowedValues\":[]},{\"path\":\"panels[].collapsible\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"panels[].collapsed\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"sizes\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"sizes[]\",\"type\":\"number\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"orientation\",\"type\":\"string\",\"required\":false,\"default\":\"horizontal\",\"allowedValues\":[\"horizontal\",\"vertical\"]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"keyboardStep\",\"type\":\"number\",\"required\":false,\"default\":\"2\",\"allowedValues\":[]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"Layout","path":"/docs/layout/layout"},{"text":"Grid","path":"/docs/layout/grid"},{"text":"Tabs","path":"/docs/navigation/tabs"},{"text":"DockLayout","path":"/docs/layout/dock-layout"}];
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

customElements.define('slice-splitpanedocumentation', SplitPaneDocumentation);
