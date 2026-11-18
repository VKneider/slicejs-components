export default class OverflowListDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A table toolbar inside a narrow panel","expected":"At 420–520px, Export, Duplicate, Archive and Delete move under More while Save view stays pinned. Change the width with the buttons, open More, and check that the status line follows the partition.","kind":"script","content":"const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = 'Measuring the toolbar...';\nconst actions = [];\nfor (const [id, label, priority, pinned] of [\n  ['save', 'Save view', 100, true],\n  ['publish', 'Publish', 80, false],\n  ['preview', 'Preview', 60, false],\n  ['share', 'Share', 40, false],\n  ['export', 'Export CSV', 30, false],\n  ['duplicate', 'Duplicate', 20, false],\n  ['archive', 'Archive', 10, false],\n  ['delete', 'Delete', 0, false]\n]) {\n  const button = await slice.build('Button', {\n    value: label, size: 'sm', variant: id === 'save' ? 'filled' : 'outlined',\n    onClick: () => { status.textContent = `${label} requested.`; }\n  });\n  actions.push({ id, node: button, priority, pinned });\n}\nconst toolbar = await slice.build('OverflowList', {\n  ariaLabel: 'Orders table actions', gap: 8, items: actions,\n  onChange: ({ visibleItems, overflowItems, constrained }) => {\n    status.textContent = `${visibleItems.length} visible - ${overflowItems.length} in More${constrained ? ' - constrained' : ''}`;\n  }\n});\nconst frame = document.createElement('div'); frame.style.cssText = 'width:520px;max-width:100%;transition:width .2s';\nconst shell = document.createElement('div'); shell.style.cssText = 'border:1px solid var(--slice-border);border-radius:12px;padding:12px;box-sizing:border-box';\nconst head = document.createElement('div'); head.style.cssText = 'display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:10px';\nconst title = document.createElement('strong'); title.textContent = 'Orders';\nconst meta = document.createElement('span'); meta.style.cssText = 'font-size:.75rem;color:var(--font-secondary-color)'; meta.textContent = '24 results - 6 columns';\nhead.append(title, meta);\nconst rows = document.createElement('div'); rows.style.cssText = 'display:grid;margin-top:12px;border-top:1px solid var(--slice-border)';\nfor (const [ref, customer, total] of [['#1042', 'Acme', '$1,240'], ['#1041', 'Northwind', '$860'], ['#1040', 'Globex', '$320']]) {\n  const row = document.createElement('div'); row.style.cssText = 'display:flex;justify-content:space-between;gap:12px;padding:7px 2px;border-bottom:1px solid var(--slice-border);font-size:.82rem';\n  const left = document.createElement('span'); left.textContent = `${ref} - ${customer}`;\n  const right = document.createElement('span'); right.textContent = total;\n  row.append(left, right); rows.append(row);\n}\nshell.append(head, toolbar, rows); frame.append(shell);\nconst controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';\nfor (const [label, width] of [['Narrow (420px)', '420px'], ['Medium (560px)', '560px'], ['Full width', '100%']]) {\n  controls.append(await slice.build('Button', { value: label, size: 'sm', variant: 'ghost', onClick: () => { frame.style.width = width; } }));\n}\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(controls, frame, status); return box;"},{"label":"Filters that keep their remove buttons","expected":"A 300px filter bar with seven chips. Some chips live under More; removing one updates both the total and the visible/overflow counts. Widen the bar to bring them back.","kind":"script","content":"const filters = [['status','Status: active'],['owner','Owner: design team'],['due','Due: this week'],['priority','Priority: high'],['region','Region: Americas'],['type','Type: invoice'],['source','Source: referral']];\nlet active = filters.length;\nconst list = await slice.build('OverflowList', {\n  ariaLabel: 'Active filters',\n  texts: { more: '+{count} filters', moreLabel: 'Show {count} hidden filters' },\n  onChange: ({ visibleItems, overflowItems }) => {\n    status.textContent = `${active} filters active - ${visibleItems.length} visible, ${overflowItems.length} under More.`;\n  }\n});\nconst status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = '7 filters active.';\nconst items = [];\nfor (const [id, label] of filters) {\n  const chip = await slice.build('Chip', { label, removable: true, variant: id === 'priority' ? 'warning' : 'neutral', onRemove: () => {\n    active -= 1;\n    list.items = list.items.filter(item => item.id !== id);\n  } });\n  items.push({ id, node: chip, priority: id === 'status' ? 10 : 0 });\n}\nlist.items = items;\nconst frame = document.createElement('div'); frame.style.cssText = 'width:300px;max-width:100%;transition:width .2s'; frame.append(list);\nconst controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';\ncontrols.append(\n  await slice.build('Button', { value: 'Compact (300px)', size: 'sm', variant: 'outlined', onClick: () => { frame.style.width = '300px'; } }),\n  await slice.build('Button', { value: 'Full width', size: 'sm', variant: 'ghost', onClick: () => { frame.style.width = '100%'; } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(controls, frame, status); return box;"}];
  }

  async init() {
    this.markdownPath = "overflow-list.md";
    this.markdownContent = "---\ntitle: OverflowList\nroute: /docs/layout/overflow-list\nnavLabel: OverflowList\nsection: Layout\ngroup: Containers\norder: 26\ndescription: Fit live controls into the container width and collect the rest under More, with priorities, pinned items and preserved component instances.\ncomponent: OverflowListDocumentation\ngenerate: true\ntags: [overflow, responsive, toolbar, actions, chips, layout]\n---\n\n# OverflowList\n\n`OverflowList` measures live items against its own container and moves the ones that do not fit into a [DropDown](/docs/navigation/dropdown) disclosure. Buttons, chips, links and custom content keep their existing instances and handlers. Closing More parks the hidden controls without destroying them.\n\n## When to use it\n\n:::compare left=\"Use OverflowList\" right=\"Reach for something else\"\n- **A table or editor toolbar inside a resizable panel.** Keep the primary action pinned and let secondary actions move into More instead of wrapping into a second row that pushes the content down.\n- **An active-filter bar over a data table.** Chips keep their remove handlers and order; hidden filters stay one click away.\n- **A page header with a long tail of actions** (Share, Export, Duplicate, Archive). Priority decides what survives when the window narrows.\n- **Controls whose component state matters** (a DatePicker, a toggle, a custom button). OverflowList moves the real node, so nothing is rebuilt.\n---\n- **The row may wrap to two lines.** CSS `flex-wrap` is simpler and keeps every action visible.\n- **The items are navigation peers.** Use [Tabs](/docs/navigation/tabs) or [SideMenu](/docs/navigation/sidemenu), which own their own patterns.\n- **There are one primary and two secondary actions.** A single DropDown, or a split button, reads more clearly than hiding two items behind More.\n- **Vertical space is the problem.** OverflowList measures width only; use a menu, a drawer or pagination instead.\n:::\n\n## Contract\n\n| Prop | Default | Meaning |\n| --- | --- | --- |\n| `items` | `[]` | `{ id, node, priority?, pinned? }`. Unique string IDs and distinct live Elements/Slice components; the component owns the supplied nodes. |\n| `minVisible` | `0` | Minimum items to retain from the edge opposite `collapseFrom`, in addition to pinned items. |\n| `collapseFrom` | `end` | `end` prefers leading items at equal priority; `start` prefers trailing items. |\n| `gap` | `8` | Number of pixels or CSS length between items. |\n| `disabled` | `false` | Disables More. Original controls retain their own disabled state. |\n| `ariaLabel` | translated | Accessible group name; use a description appropriate to the content. |\n| `texts` | en/es defaults | `more` (`More ({count})`), `moreLabel` and `label`. |\n| `onChange` | `null` | `({ visibleItems, overflowItems, constrained })` with item ID arrays, after first measurement and when the partition changes. |\n\nHigher `priority` values are preferred when they fit. All visible and overflow items retain their input order; priorities determine membership, not visual sorting. `pinned` and `minVisible` are mandatory. If they and the More trigger cannot fit, `data-constrained=\"true\"` marks the result and the rail scrolls horizontally to keep them reachable.\n\nThe component reserves the maximum count-label width for the current item set, avoiding oscillation around counts such as 9 and 10. It can leave a small amount of unused space as a result.\n\nRead-only `visibleItems` and `overflowItems` return descriptors. `reflow()` measures immediately when connected and visible, returning the partition or null when measurement is unavailable. `update()` refreshes a cached/reconnected view. Normal container/item size changes are observed automatically.\n\n## A table toolbar that keeps its primary action\n\nEight actions in one row. `Save view` is pinned, so it never leaves the strip; the low-priority actions move into More as the panel narrows. The status line uses `onChange` to show the live partition.\n\n:::script label=\"A table toolbar inside a narrow panel\" expected=\"At 420–520px, Export, Duplicate, Archive and Delete move under More while Save view stays pinned. Change the width with the buttons, open More, and check that the status line follows the partition.\"\nconst status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = 'Measuring the toolbar...';\nconst actions = [];\nfor (const [id, label, priority, pinned] of [\n  ['save', 'Save view', 100, true],\n  ['publish', 'Publish', 80, false],\n  ['preview', 'Preview', 60, false],\n  ['share', 'Share', 40, false],\n  ['export', 'Export CSV', 30, false],\n  ['duplicate', 'Duplicate', 20, false],\n  ['archive', 'Archive', 10, false],\n  ['delete', 'Delete', 0, false]\n]) {\n  const button = await slice.build('Button', {\n    value: label, size: 'sm', variant: id === 'save' ? 'filled' : 'outlined',\n    onClick: () => { status.textContent = `${label} requested.`; }\n  });\n  actions.push({ id, node: button, priority, pinned });\n}\nconst toolbar = await slice.build('OverflowList', {\n  ariaLabel: 'Orders table actions', gap: 8, items: actions,\n  onChange: ({ visibleItems, overflowItems, constrained }) => {\n    status.textContent = `${visibleItems.length} visible - ${overflowItems.length} in More${constrained ? ' - constrained' : ''}`;\n  }\n});\nconst frame = document.createElement('div'); frame.style.cssText = 'width:520px;max-width:100%;transition:width .2s';\nconst shell = document.createElement('div'); shell.style.cssText = 'border:1px solid var(--slice-border);border-radius:12px;padding:12px;box-sizing:border-box';\nconst head = document.createElement('div'); head.style.cssText = 'display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:10px';\nconst title = document.createElement('strong'); title.textContent = 'Orders';\nconst meta = document.createElement('span'); meta.style.cssText = 'font-size:.75rem;color:var(--font-secondary-color)'; meta.textContent = '24 results - 6 columns';\nhead.append(title, meta);\nconst rows = document.createElement('div'); rows.style.cssText = 'display:grid;margin-top:12px;border-top:1px solid var(--slice-border)';\nfor (const [ref, customer, total] of [['#1042', 'Acme', '$1,240'], ['#1041', 'Northwind', '$860'], ['#1040', 'Globex', '$320']]) {\n  const row = document.createElement('div'); row.style.cssText = 'display:flex;justify-content:space-between;gap:12px;padding:7px 2px;border-bottom:1px solid var(--slice-border);font-size:.82rem';\n  const left = document.createElement('span'); left.textContent = `${ref} - ${customer}`;\n  const right = document.createElement('span'); right.textContent = total;\n  row.append(left, right); rows.append(row);\n}\nshell.append(head, toolbar, rows); frame.append(shell);\nconst controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';\nfor (const [label, width] of [['Narrow (420px)', '420px'], ['Medium (560px)', '560px'], ['Full width', '100%']]) {\n  controls.append(await slice.build('Button', { value: label, size: 'sm', variant: 'ghost', onClick: () => { frame.style.width = width; } }));\n}\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(controls, frame, status); return box;\n:::\n\n## Active filters with live removal\n\nFilter chips render their own remove buttons. Open More, remove a hidden chip, and only that chip is destroyed; the rest keep their handlers and order.\n\n:::script label=\"Filters that keep their remove buttons\" expected=\"A 300px filter bar with seven chips. Some chips live under More; removing one updates both the total and the visible/overflow counts. Widen the bar to bring them back.\"\nconst filters = [['status','Status: active'],['owner','Owner: design team'],['due','Due: this week'],['priority','Priority: high'],['region','Region: Americas'],['type','Type: invoice'],['source','Source: referral']];\nlet active = filters.length;\nconst list = await slice.build('OverflowList', {\n  ariaLabel: 'Active filters',\n  texts: { more: '+{count} filters', moreLabel: 'Show {count} hidden filters' },\n  onChange: ({ visibleItems, overflowItems }) => {\n    status.textContent = `${active} filters active - ${visibleItems.length} visible, ${overflowItems.length} under More.`;\n  }\n});\nconst status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = '7 filters active.';\nconst items = [];\nfor (const [id, label] of filters) {\n  const chip = await slice.build('Chip', { label, removable: true, variant: id === 'priority' ? 'warning' : 'neutral', onRemove: () => {\n    active -= 1;\n    list.items = list.items.filter(item => item.id !== id);\n  } });\n  items.push({ id, node: chip, priority: id === 'status' ? 10 : 0 });\n}\nlist.items = items;\nconst frame = document.createElement('div'); frame.style.cssText = 'width:300px;max-width:100%;transition:width .2s'; frame.append(list);\nconst controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px';\ncontrols.append(\n  await slice.build('Button', { value: 'Compact (300px)', size: 'sm', variant: 'outlined', onClick: () => { frame.style.width = '300px'; } }),\n  await slice.build('Button', { value: 'Full width', size: 'sm', variant: 'ghost', onClick: () => { frame.style.width = '100%'; } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(controls, frame, status); return box;\n:::\n\n## Measurement, focus and ownership\n\nItems need intrinsic widths. Use content-sized controls or explicit pixel/rem widths; a child whose width depends on a percentage of this same row is outside the sizing contract. Reserve images' natural dimensions while loading. ResizeObserver handles item width changes, fonts and parent resizing. Hidden containers are measured when revealed; `reflow()` can be called after custom layout work.\n\nThe measurement lane is invisible, inert and clipped. Overflow controls keep their original keyboard behavior inside the disclosure. Escape and outside dismissal use DropDown; when a focused visible control becomes hidden, focus goes to More. No new controls are cloned or synthesized from labels.\n\nAssignments to `items` reconcile live nodes, and removed nodes are destroyed. Reuse stable IDs and node references to retain state. The dropdown receives `owned: false` custom content: OverflowList remains responsible for its nodes. Destroying OverflowList destroys the nodes, its menu, observers and scheduled work. Native resources whose state depends on DOM attachment, such as iframe browsing contexts, can still react to reparenting.\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            const buildSide = async (side) => {
               const body = document.createElement('div');
               body.className = 'doc-callout-body';
               body.innerHTML = side.html;
               const callout = await slice.build('Callout', {
                  tone: side.tone,
                  title: side.title,
                  content: Array.from(body.childNodes)
               });
               return callout || body;
            };
            const left = await buildSide({"title":"Use OverflowList","tone":"success","html":"<ul><li><strong>A table or editor toolbar inside a resizable panel.</strong> Keep the primary action pinned and let secondary actions move into More instead of wrapping into a second row that pushes the content down.</li><li><strong>An active-filter bar over a data table.</strong> Chips keep their remove handlers and order; hidden filters stay one click away.</li><li><strong>A page header with a long tail of actions</strong> (Share, Export, Duplicate, Archive). Priority decides what survives when the window narrows.</li><li><strong>Controls whose component state matters</strong> (a DatePicker, a toggle, a custom button). OverflowList moves the real node, so nothing is rebuilt.</li></ul>"});
            const right = await buildSide({"title":"Reach for something else","tone":"danger","html":"<ul><li><strong>The row may wrap to two lines.</strong> CSS <code>flex-wrap</code> is simpler and keeps every action visible.</li><li><strong>The items are navigation peers.</strong> Use <span data-inline-link=\"1\"></span> or <span data-inline-link=\"2\"></span>, which own their own patterns.</li><li><strong>There are one primary and two secondary actions.</strong> A single DropDown, or a split button, reads more clearly than hiding two items behind More.</li><li><strong>Vertical space is the problem.</strong> OverflowList measures width only; use a menu, a drawer or pagination instead.</li></ul>"});
            const grid = await slice.build('Grid', {
               columns: 2,
               gap: '14px',
               items: [left, right]
            });
            if (grid) container.appendChild(grid);
            else {
               container.appendChild(left);
               container.appendChild(right);
            }
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-2"]');
         if (container) {
            const lines = ["| Prop | Default | Meaning |","| --- | --- | --- |","| `items` | `[]` | `{ id, node, priority?, pinned? }`. Unique string IDs and distinct live Elements/Slice components; the component owns the supplied nodes. |","| `minVisible` | `0` | Minimum items to retain from the edge opposite `collapseFrom`, in addition to pinned items. |","| `collapseFrom` | `end` | `end` prefers leading items at equal priority; `start` prefers trailing items. |","| `gap` | `8` | Number of pixels or CSS length between items. |","| `disabled` | `false` | Disables More. Original controls retain their own disabled state. |","| `ariaLabel` | translated | Accessible group name; use a description appropriate to the content. |","| `texts` | en/es defaults | `more` (`More ({count})`), `moreLabel` and `label`. |","| `onChange` | `null` | `({ visibleItems, overflowItems, constrained })` with item ID arrays, after first measurement and when the partition changes. |"];
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
      {
         const container = this.querySelector('[data-block-id="doc-block-5"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"items[].id\",\"type\":\"string\",\"required\":true,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].node\",\"type\":\"any\",\"required\":true,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].priority\",\"type\":\"number\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].pinned\",\"type\":\"boolean\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"minVisible\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"collapseFrom\",\"type\":\"string\",\"required\":false,\"default\":\"end\",\"allowedValues\":[\"end\",\"start\"]},{\"path\":\"gap\",\"type\":\"any\",\"required\":false,\"default\":\"8\",\"allowedValues\":[]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"items[].id\",\"type\":\"string\",\"required\":true,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].node\",\"type\":\"any\",\"required\":true,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].priority\",\"type\":\"number\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"items[].pinned\",\"type\":\"boolean\",\"required\":false,\"default\":null,\"allowedValues\":[]},{\"path\":\"minVisible\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"collapseFrom\",\"type\":\"string\",\"required\":false,\"default\":\"end\",\"allowedValues\":[\"end\",\"start\"]},{\"path\":\"gap\",\"type\":\"any\",\"required\":false,\"default\":\"8\",\"allowedValues\":[]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"DropDown","path":"/docs/navigation/dropdown"},{"text":"Tabs","path":"/docs/navigation/tabs"},{"text":"SideMenu","path":"/docs/navigation/sidemenu"}];
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

customElements.define('slice-overflowlistdocumentation', OverflowListDocumentation);
