export default class TransferListDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"Assign a project editor's permissions","expected":"Grouped permissions with explanations, a locked audit permission, a sensitive-access badge and one unavailable catalog key. Assign or remove permissions individually or with checked-visible bulk actions.","kind":"script","content":"const sensitive = await slice.build('Badge', { label: 'Sensitive access', tone: 'warning', variant: 'soft' });\nconst catalog = [\n  { value: 'projects.read', label: 'Read projects', description: 'View projects, milestones and published reports.', group: 'Projects' },\n  { value: 'projects.edit', label: 'Edit projects', description: 'Change project details and milestones.', group: 'Projects' },\n  { value: 'projects.archive', label: 'Archive projects', description: 'Archive completed projects without deleting their history.', group: 'Projects' },\n  { value: 'team.invite', label: 'Invite team members', description: 'Invite collaborators to assigned projects.', group: 'Team' },\n  { value: 'billing.read', label: 'Read billing', description: 'View invoices and billing contacts.', group: 'Administration', content: sensitive },\n  { value: 'audit.read', label: 'Read audit history', description: 'Required by the organization policy.', group: 'Administration', locked: true },\n  { value: 'billing.edit', label: 'Change billing', description: 'Managed by the account owner.', group: 'Administration', disabled: true }\n];\nconst summary = await slice.build('Badge', { label: '3 assigned keys', tone: 'accent' });\nconst role = await slice.build('Card', { title: 'Project editor', subtitle: 'Role permissions', text: 'Choose the permissions for this role. Required permissions stay assigned.', variant: 'ghost', content: summary });\nconst output = document.createElement('pre'); output.style.cssText = 'white-space:pre-wrap;font-size:.8rem;padding:12px;background:var(--secondary-background-color);border-radius:8px'; output.textContent = 'Use Save to inspect the assigned keys.';\nconst transfer = await slice.build('TransferList', {\n  ariaLabel: 'Project editor permissions', items: catalog, value: ['projects.read', 'audit.read', 'legacy.export'],\n  texts: { available: 'Available permissions', assigned: 'Assigned permissions' },\n  onChange: value => { summary.label = `${value.length} assigned keys`; }\n});\nconst save = await slice.build('Button', { value: 'Save role', size: 'sm', onClick: () => { output.textContent = JSON.stringify({ role: 'project-editor', permissions: transfer.value }, null, 2); } });\nconst box = document.createElement('div'); box.style.cssText = 'display:grid;gap:14px;width:100%'; box.append(role, transfer, save, output); return box;"},{"label":"Default and compact, one after the other","expected":"Two full-width TransferLists over the same four-item catalog. Default uses roomier rows and a 340px list; Compact uses 4px rows and a 260px list. Both keep the Available and Assigned panels side by side, so the height difference is obvious.","kind":"script","content":"const catalog = [\n  { value: 'view', label: 'View reports', description: 'Read dashboards, exports and saved views.', group: 'Reports' },\n  { value: 'edit', label: 'Edit reports', description: 'Change filters, columns and layout.', group: 'Reports' },\n  { value: 'invite', label: 'Invite viewers', description: 'Add people to this workspace.', group: 'Team' },\n  { value: 'audit', label: 'Audit history', description: 'Required by the organization policy.', group: 'Security', locked: true }\n];\nconst makePanel = async (variant) => {\n  const list = await slice.build('TransferList', {\n    items: catalog, value: ['view', 'audit'], variant,\n    ariaLabel: variant === 'compact' ? 'Compact assignment' : 'Default assignment'\n  });\n  const panel = document.createElement('section');\n  panel.style.cssText = 'display:grid;gap:8px;width:100%';\n  const title = document.createElement('strong'); title.textContent = variant === 'compact' ? 'Compact' : 'Default';\n  const note = document.createElement('span');\n  note.style.cssText = 'font-size:.78rem;color:var(--font-secondary-color)';\n  note.textContent = variant === 'compact' ? 'variant=\"compact\" - 260px list, 4px rows' : 'variant=\"default\" - 340px list, 8px rows';\n  panel.append(title, note, list);\n  return panel;\n};\nconst stack = document.createElement('div');\nstack.style.cssText = 'display:grid;gap:20px;width:100%';\nstack.append(await makePanel('default'), await makePanel('compact'));\nreturn stack;"},{"label":"Build a project team from an app-owned catalog","expected":"Start with a loading skeleton, load a team catalog, simulate a catalog error and retry. The right side is named Project team. Missing assigned keys remain intact while loading.","kind":"script","content":"const team = [\n  { value: 'ana', label: 'Ana Torres', description: 'Frontend engineer · Slice components', group: 'Engineering' },\n  { value: 'carlos', label: 'Carlos Rivas', description: 'Backend engineer · APIs and storage', group: 'Engineering' },\n  { value: 'maria', label: 'María Silva', description: 'Product designer · Interaction and accessibility', group: 'Design' },\n  { value: 'luis', label: 'Luis Pérez', description: 'Researcher · Customer interviews', group: 'Design' },\n  { value: 'sofia', label: 'Sofía Díaz', description: 'Support lead · Existing project owner', group: 'Operations', locked: true }\n];\nconst status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = 'The application is loading its team catalog.';\nconst transfer = await slice.build('TransferList', { loading: true, value: ['maria', 'sofia'], texts: {\n  available: 'Team members', assigned: 'Project team', assign: 'Add', assignSelected: 'Add to project', removeSelected: 'Remove from project'\n} });\nconst load = () => { transfer.items = team; transfer.error = ''; transfer.loading = false; status.textContent = 'Team catalog loaded.'; };\ntransfer.onRetry = load;\ntransfer.onChange = value => { status.textContent = `${value.length} members in the project team.`; };\nconst controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';\ncontrols.append(\n  await slice.build('Button', { value: 'Load team', size: 'sm', onClick: load }),\n  await slice.build('Button', { value: 'Simulate catalog error', size: 'sm', variant: 'outlined', onClick: () => { transfer.loading = false; transfer.error = 'The team catalog could not be loaded. Try again.'; status.textContent = 'Assignment is paused until the catalog is available.'; } }),\n  await slice.build('Button', { value: 'Lock / unlock assignment', size: 'sm', variant: 'ghost', onClick: () => { transfer.disabled = !transfer.disabled; } })\n);\nconst box = document.createElement('div'); box.style.cssText = 'display:grid;gap:12px;width:100%'; box.append(controls, transfer, status); return box;"}];
  }

  async init() {
    this.markdownPath = "transfer-list.md";
    this.markdownContent = "---\ntitle: TransferList\nroute: /docs/input/transfer-list\nnavLabel: TransferList\nsection: Input Components\ngroup: Selection\norder: 28\ndescription: Assign permissions, members and resources between searchable collections, with grouped rich rows, visible selection and locked policy items.\ncomponent: TransferListDocumentation\ngenerate: true\ntags: [transfer, assignment, permissions, members, selection, search]\n---\n\n# TransferList\n\n`TransferList` separates **available** items from **assigned** items. Each row has a labelled checkbox, optional description/rich content and an explicit Assign or Remove action. Search is independent on each side. Bulk actions operate on the checked visible items, without the ambiguity of a pair of arrow buttons.\n\nUse it for role permissions, project membership, resources or feature assignment. Use Select with multiple selection for a short compact field and TreeView for browsing a hierarchy. This version supports flat catalogs grouped into categories; it does not implement hierarchical permission inheritance or a tree transfer.\n\n## Value and selection\n\n`items` contains `{ value, label, description?, group?, content?, disabled?, locked? }`. Keys are unique nonempty strings or finite numbers; `1` and `'1'` are distinct. `value` is the array of assigned keys. Checking a checkbox is temporary selection; only Assign/Remove changes `value`.\n\nAssigned keys missing from the catalog are retained and announced. An unrelated edit never silently revokes those assignments. Load a fuller catalog to reveal them, or explicitly replace `value` from the application. The array returned by the getter and handler is a copy.\n\n`locked` and `disabled` items cannot be moved by user actions or `assign`/`remove`. Locked rows show a policy label. Programmatic `value` assignments remain authoritative and silent, so the app can switch between roles or restore server state.\n\n## Density and section rules\n\n`variant: 'compact'` keeps the same two panels, searches and actions, but tightens the header, row, footer and default list height (260px instead of 340px). Use it inside settings panels, sidebars or dense admin tables; keep the default when the descriptions are the point, as on a permissions onboarding screen.\n\nCatalog `group` values render as uppercase section headings with a rule, so long permission or member lists stay scannable without repeating card chrome.\n\n## Role permissions\n\n:::script label=\"Assign a project editor's permissions\" expected=\"Grouped permissions with explanations, a locked audit permission, a sensitive-access badge and one unavailable catalog key. Assign or remove permissions individually or with checked-visible bulk actions.\"\nconst sensitive = await slice.build('Badge', { label: 'Sensitive access', tone: 'warning', variant: 'soft' });\nconst catalog = [\n  { value: 'projects.read', label: 'Read projects', description: 'View projects, milestones and published reports.', group: 'Projects' },\n  { value: 'projects.edit', label: 'Edit projects', description: 'Change project details and milestones.', group: 'Projects' },\n  { value: 'projects.archive', label: 'Archive projects', description: 'Archive completed projects without deleting their history.', group: 'Projects' },\n  { value: 'team.invite', label: 'Invite team members', description: 'Invite collaborators to assigned projects.', group: 'Team' },\n  { value: 'billing.read', label: 'Read billing', description: 'View invoices and billing contacts.', group: 'Administration', content: sensitive },\n  { value: 'audit.read', label: 'Read audit history', description: 'Required by the organization policy.', group: 'Administration', locked: true },\n  { value: 'billing.edit', label: 'Change billing', description: 'Managed by the account owner.', group: 'Administration', disabled: true }\n];\nconst summary = await slice.build('Badge', { label: '3 assigned keys', tone: 'accent' });\nconst role = await slice.build('Card', { title: 'Project editor', subtitle: 'Role permissions', text: 'Choose the permissions for this role. Required permissions stay assigned.', variant: 'ghost', content: summary });\nconst output = document.createElement('pre'); output.style.cssText = 'white-space:pre-wrap;font-size:.8rem;padding:12px;background:var(--secondary-background-color);border-radius:8px'; output.textContent = 'Use Save to inspect the assigned keys.';\nconst transfer = await slice.build('TransferList', {\n  ariaLabel: 'Project editor permissions', items: catalog, value: ['projects.read', 'audit.read', 'legacy.export'],\n  texts: { available: 'Available permissions', assigned: 'Assigned permissions' },\n  onChange: value => { summary.label = `${value.length} assigned keys`; }\n});\nconst save = await slice.build('Button', { value: 'Save role', size: 'sm', onClick: () => { output.textContent = JSON.stringify({ role: 'project-editor', permissions: transfer.value }, null, 2); } });\nconst box = document.createElement('div'); box.style.cssText = 'display:grid;gap:14px;width:100%'; box.append(role, transfer, save, output); return box;\n:::\n\n## Default and compact densities\n\nThe same catalog and controls in both variants. `compact` keeps every feature but reduces the header, row, footer and list height, which is what you want inside settings panels, sidebars and dense admin tables.\n\n:::script label=\"Default and compact, one after the other\" expected=\"Two full-width TransferLists over the same four-item catalog. Default uses roomier rows and a 340px list; Compact uses 4px rows and a 260px list. Both keep the Available and Assigned panels side by side, so the height difference is obvious.\"\nconst catalog = [\n  { value: 'view', label: 'View reports', description: 'Read dashboards, exports and saved views.', group: 'Reports' },\n  { value: 'edit', label: 'Edit reports', description: 'Change filters, columns and layout.', group: 'Reports' },\n  { value: 'invite', label: 'Invite viewers', description: 'Add people to this workspace.', group: 'Team' },\n  { value: 'audit', label: 'Audit history', description: 'Required by the organization policy.', group: 'Security', locked: true }\n];\nconst makePanel = async (variant) => {\n  const list = await slice.build('TransferList', {\n    items: catalog, value: ['view', 'audit'], variant,\n    ariaLabel: variant === 'compact' ? 'Compact assignment' : 'Default assignment'\n  });\n  const panel = document.createElement('section');\n  panel.style.cssText = 'display:grid;gap:8px;width:100%';\n  const title = document.createElement('strong'); title.textContent = variant === 'compact' ? 'Compact' : 'Default';\n  const note = document.createElement('span');\n  note.style.cssText = 'font-size:.78rem;color:var(--font-secondary-color)';\n  note.textContent = variant === 'compact' ? 'variant=\"compact\" - 260px list, 4px rows' : 'variant=\"default\" - 340px list, 8px rows';\n  panel.append(title, note, list);\n  return panel;\n};\nconst stack = document.createElement('div');\nstack.style.cssText = 'display:grid;gap:20px;width:100%';\nstack.append(await makePanel('default'), await makePanel('compact'));\nreturn stack;\n:::\n\n## App-owned catalog loading and team assignment\n\nFetch the catalog with your app's data layer and pass `items`, `loading` and `error`. The component does not start network work in init. While loading it blocks edits; with no catalog it shows skeleton rows, and with existing data it keeps the old rows visible and busy. `onRetry` lets the app retry a failed request.\n\n:::script label=\"Build a project team from an app-owned catalog\" expected=\"Start with a loading skeleton, load a team catalog, simulate a catalog error and retry. The right side is named Project team. Missing assigned keys remain intact while loading.\"\nconst team = [\n  { value: 'ana', label: 'Ana Torres', description: 'Frontend engineer · Slice components', group: 'Engineering' },\n  { value: 'carlos', label: 'Carlos Rivas', description: 'Backend engineer · APIs and storage', group: 'Engineering' },\n  { value: 'maria', label: 'María Silva', description: 'Product designer · Interaction and accessibility', group: 'Design' },\n  { value: 'luis', label: 'Luis Pérez', description: 'Researcher · Customer interviews', group: 'Design' },\n  { value: 'sofia', label: 'Sofía Díaz', description: 'Support lead · Existing project owner', group: 'Operations', locked: true }\n];\nconst status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = 'The application is loading its team catalog.';\nconst transfer = await slice.build('TransferList', { loading: true, value: ['maria', 'sofia'], texts: {\n  available: 'Team members', assigned: 'Project team', assign: 'Add', assignSelected: 'Add to project', removeSelected: 'Remove from project'\n} });\nconst load = () => { transfer.items = team; transfer.error = ''; transfer.loading = false; status.textContent = 'Team catalog loaded.'; };\ntransfer.onRetry = load;\ntransfer.onChange = value => { status.textContent = `${value.length} members in the project team.`; };\nconst controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';\ncontrols.append(\n  await slice.build('Button', { value: 'Load team', size: 'sm', onClick: load }),\n  await slice.build('Button', { value: 'Simulate catalog error', size: 'sm', variant: 'outlined', onClick: () => { transfer.loading = false; transfer.error = 'The team catalog could not be loaded. Try again.'; status.textContent = 'Assignment is paused until the catalog is available.'; } }),\n  await slice.build('Button', { value: 'Lock / unlock assignment', size: 'sm', variant: 'ghost', onClick: () => { transfer.disabled = !transfer.disabled; } })\n);\nconst box = document.createElement('div'); box.style.cssText = 'display:grid;gap:12px;width:100%'; box.append(controls, transfer, status); return box;\n:::\n\n## Props\n\n| Prop | Default | Meaning |\n| --- | --- | --- |\n| `items` | `[]` | App-owned catalog. Stable value keys retain row controls and rich content across assignments. |\n| `value` | `[]` | Assigned keys, including unknown keys. Prop assignments are silent. |\n| `searchable` | `true` | Shows independent searches; disabling clears both queries and temporary selections. |\n| `showSelectAll` | `true` | Shows a native select-visible checkbox with indeterminate state. Row selection/bulk actions remain available when hidden. |\n| `variant` | `'default'` | `'compact'` tightens the header, rows, footer and list height without removing controls or descriptions. Set as `data-variant` on the host. |\n| `disabled` | `false` | Blocks selection, assignment, searches and retry controls. |\n| `loading` | `false` | Busy state; blocks assignment and selection while retaining existing rows. |\n| `error` | `''` | Text-only alert; blocks assignment until cleared. |\n| `onRetry` | `null` | Callback for Try again; without it no retry button is shown. |\n| `ariaLabel` | translated | Name of the whole assignment control. |\n| `texts` | en/es defaults | Titles, action labels, searches, empty/policy/error-retry/selection messages. |\n| `onChange` | `null` | `(value, { direction, values, items })`; direction is `assign` or `remove`, values/items describe the moved entries. |\n\n## Methods and behavior\n\n- `assign(values?)` / `remove(values?)`: explicit keys, or the checked visible items on that side. Returns whether anything moved. Filters disabled/locked, unknown and already-on-target keys. No-op calls do not emit.\n- `setSearch('available' | 'assigned', query)`: update one query. Matching ignores accents/case and includes label, description and group. Changing a query clears only that side's temporary selection.\n- `getSelection(side)`: a copied array of checked keys. `clearSelection(side?)` clears one or both sides.\n- Prop assignments update the view asynchronously through Slice update serialization; native action value changes and `onChange` are synchronous. Browser tests should wait for the relevant DOM state.\n\nThe component groups rows by the first appearance of each category, retaining catalog order within it. Empty categories disappear from search results. Select-visible and bulk actions exclude policy/unavailable items. The list uses actual native checkboxes through Checkbox, Input searches and Button actions, rather than placing checkboxes inside ARIA listbox options.\n\n## Rich content and lifecycle\n\n`content` accepts text, a live Node/Slice component or an array. DocumentFragment content is consumed into its child nodes when mounted. Content nodes cannot be shared between rows. It sits outside the checkbox label and may contain its own controls. Moving a row retains its check/action components, rich content, supported focus/selection and scroll offsets. Use stable keys and immutable content arrays when changing descriptors.\n\nThe component owns rich nodes and composed controls. Removing an item or destroying TransferList destroys that content, including components inside plain wrappers and never-mounted content queued during an update. Build app-lifetime services outside the supplied row content and manage their lifetime in the app.\n\nThe panels respond to their **container width**, stacking below 640px. Set `--slice-transfer-list-height` (default `340px`) for the scrolling list height. No decorative animation is required.\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-4"]');
         if (container) {
            const lines = ["| Prop | Default | Meaning |","| --- | --- | --- |","| `items` | `[]` | App-owned catalog. Stable value keys retain row controls and rich content across assignments. |","| `value` | `[]` | Assigned keys, including unknown keys. Prop assignments are silent. |","| `searchable` | `true` | Shows independent searches; disabling clears both queries and temporary selections. |","| `showSelectAll` | `true` | Shows a native select-visible checkbox with indeterminate state. Row selection/bulk actions remain available when hidden. |","| `variant` | `'default'` | `'compact'` tightens the header, rows, footer and list height without removing controls or descriptions. Set as `data-variant` on the host. |","| `disabled` | `false` | Blocks selection, assignment, searches and retry controls. |","| `loading` | `false` | Busy state; blocks assignment and selection while retaining existing rows. |","| `error` | `''` | Text-only alert; blocks assignment until cleared. |","| `onRetry` | `null` | Callback for Try again; without it no retry button is shown. |","| `ariaLabel` | translated | Name of the whole assignment control. |","| `texts` | en/es defaults | Titles, action labels, searches, empty/policy/error-retry/selection messages. |","| `onChange` | `null` | `(value, { direction, values, items })`; direction is `assign` or `remove`, values/items describe the moved entries. |"];
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
               // Internal links arrived as tokens; turn them into the same
               // placeholders the page replaces with Link components.
               output = output.replace(/SLICE_INLINE_LINK_(\d+)_TOKEN/g, '<span data-inline-link="$1"></span>');
               // External/unsafe links left in the cell become plain anchors.
               output = output.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => {
                  if (!/^(?:https?:\/\/|\/\/|\/|#|mailto:|tel:)/i.test(href)) return label;
                  const external = /^(?:https?:\/\/|\/\/)/i.test(href);
                  const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
                  return '<a href="' + href.replace(/"/g, '&quot;') + '"' + attrs + '>' + label + '</a>';
               });
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
    await this.renderScriptScenarios();
  }

  async update() {
    // Refresh dynamic content here if needed
  }

   beforeDestroy() {
     for (const link of this._inlineLinks) {
       if (typeof slice.isComponentAlive !== 'function' || slice.isComponentAlive(link)) {
         slice.controller.destroyComponent(link);
       }
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

customElements.define('slice-transferlistdocumentation', TransferListDocumentation);
