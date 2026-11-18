export default class OverflowListDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A toolbar inside a resizable workspace","expected":"Save stays visible; secondary actions move under More as the writing panel narrows. The same Button instances keep their handlers in both locations.","kind":"script","content":"const status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = 'Draft ready.';\nconst actions = [];\nfor (const [id, label, priority] of [\n  ['save', 'Save draft', 100], ['publish', 'Publish', 30], ['preview', 'Preview', 10], ['share', 'Share', 5], ['export', 'Export', 0]\n]) {\n  const button = await slice.build('Button', { value: label, size: 'sm', variant: id === 'save' ? 'filled' : 'outlined', onClick: () => { status.textContent = `${label} requested.`; } });\n  actions.push({ id, node: button, priority, pinned: id === 'save' });\n}\nconst toolbar = await slice.build('OverflowList', { ariaLabel: 'Document actions', gap: 8, items: actions });\nconst editor = document.createElement('div'); editor.style.cssText = 'padding:14px;box-sizing:border-box';\neditor.append(toolbar, await slice.build('Card', { title: 'Release notes', subtitle: 'Draft · updated today', text: 'Keep the main action close. Resize the separator to make room for the document or its review panel.', variant: 'ghost' }), status);\nconst review = await slice.build('Card', { title: 'Review', text: 'Check examples, keyboard behavior and the final changelog before publishing.', variant: 'ghost' });\nconst pane = await slice.build('SplitPane', { sizes: [70, 30], panels: [{ id: 'writing', label: 'Writing', content: editor, minSize: 30 }, { id: 'review', label: 'Review', content: review, minSize: 15 }] });\npane.style.height = '300px';\nreturn pane;"},{"label":"Filters that keep their remove buttons","expected":"A compact filter bar. Open More and remove a hidden chip; only that chip is destroyed. Resize the bar using the buttons.","kind":"script","content":"const filters = [['status','Status: active'],['owner','Owner: design team'],['due','Due: this week'],['priority','Priority: high'],['region','Region: Americas']];\nconst list = await slice.build('OverflowList', { ariaLabel: 'Active filters', texts: { more: '+{count} filters', moreLabel: 'Show {count} hidden filters' } });\nconst status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = '5 filters active.';\nconst items = [];\nfor (const [id, label] of filters) {\n  const chip = await slice.build('Chip', { label, removable: true, variant: id === 'priority' ? 'warning' : 'neutral', onRemove: () => {\n    list.items = list.items.filter(item => item.id !== id); status.textContent = `${list.items.length} filters active.`;\n  } });\n  items.push({ id, node: chip, priority: id === 'status' ? 10 : 0 });\n}\nlist.items = items;\nconst frame = document.createElement('div'); frame.style.cssText = 'width:340px;max-width:100%'; frame.append(list);\nconst controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';\ncontrols.append(\n  await slice.build('Button', { value: 'Compact', size: 'sm', variant: 'outlined', onClick: () => { frame.style.width = '340px'; } }),\n  await slice.build('Button', { value: 'Full width', size: 'sm', variant: 'ghost', onClick: () => { frame.style.width = '100%'; } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(controls, frame, status); return box;"}];
  }

  async init() {
    this.markdownPath = "overflow-list.md";
    this.markdownContent = "---\ntitle: OverflowList\nroute: /docs/layout/overflow-list\nnavLabel: OverflowList\nsection: Layout\ngroup: Containers\norder: 26\ndescription: Fit live controls into the container width and collect the rest under More, with priorities, pinned items and preserved component instances.\ncomponent: OverflowListDocumentation\ngenerate: true\ntags: [overflow, responsive, toolbar, actions, chips, layout]\n---\n\n# OverflowList\n\n`OverflowList` measures live items against its own container and moves the ones that do not fit into a [DropDown](/docs/navigation/dropdown) disclosure. Buttons, chips, links and custom content keep their existing instances and handlers. Closing More parks the hidden controls without destroying them.\n\nUse it for compact action bars, active filters and navigation shortcuts, especially inside resizable panels. Use CSS wrapping when multiple lines are welcome. Tabs already manages its own strip; OverflowList does not replace Tabs or build a new menu vocabulary.\n\n## Contract\n\n| Prop | Default | Meaning |\n| --- | --- | --- |\n| `items` | `[]` | `{ id, node, priority?, pinned? }`. Unique string IDs and distinct live Elements/Slice components; the component owns the supplied nodes. |\n| `minVisible` | `0` | Minimum items to retain from the edge opposite `collapseFrom`, in addition to pinned items. |\n| `collapseFrom` | `end` | `end` prefers leading items at equal priority; `start` prefers trailing items. |\n| `gap` | `8` | Number of pixels or CSS length between items. |\n| `disabled` | `false` | Disables More. Original controls retain their own disabled state. |\n| `ariaLabel` | translated | Accessible group name; use a description appropriate to the content. |\n| `texts` | en/es defaults | `more` (`More ({count})`), `moreLabel` and `label`. |\n| `onChange` | `null` | `({ visibleItems, overflowItems, constrained })` with item ID arrays, after first measurement and when the partition changes. |\n\nHigher `priority` values are preferred when they fit. All visible and overflow items retain their input order; priorities determine membership, not visual sorting. `pinned` and `minVisible` are mandatory. If they and the More trigger cannot fit, `data-constrained=\"true\"` marks the result and the rail scrolls horizontally to keep them reachable.\n\nThe component reserves the maximum count-label width for the current item set, avoiding oscillation around counts such as 9 and 10. It can leave a small amount of unused space as a result.\n\nRead-only `visibleItems` and `overflowItems` return descriptors. `reflow()` measures immediately when connected and visible, returning the partition or null when measurement is unavailable. `update()` refreshes a cached/reconnected view. Normal container/item size changes are observed automatically.\n\n## Responsive document actions\n\n:::script label=\"A toolbar inside a resizable workspace\" expected=\"Save stays visible; secondary actions move under More as the writing panel narrows. The same Button instances keep their handlers in both locations.\"\nconst status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = 'Draft ready.';\nconst actions = [];\nfor (const [id, label, priority] of [\n  ['save', 'Save draft', 100], ['publish', 'Publish', 30], ['preview', 'Preview', 10], ['share', 'Share', 5], ['export', 'Export', 0]\n]) {\n  const button = await slice.build('Button', { value: label, size: 'sm', variant: id === 'save' ? 'filled' : 'outlined', onClick: () => { status.textContent = `${label} requested.`; } });\n  actions.push({ id, node: button, priority, pinned: id === 'save' });\n}\nconst toolbar = await slice.build('OverflowList', { ariaLabel: 'Document actions', gap: 8, items: actions });\nconst editor = document.createElement('div'); editor.style.cssText = 'padding:14px;box-sizing:border-box';\neditor.append(toolbar, await slice.build('Card', { title: 'Release notes', subtitle: 'Draft · updated today', text: 'Keep the main action close. Resize the separator to make room for the document or its review panel.', variant: 'ghost' }), status);\nconst review = await slice.build('Card', { title: 'Review', text: 'Check examples, keyboard behavior and the final changelog before publishing.', variant: 'ghost' });\nconst pane = await slice.build('SplitPane', { sizes: [70, 30], panels: [{ id: 'writing', label: 'Writing', content: editor, minSize: 30 }, { id: 'review', label: 'Review', content: review, minSize: 15 }] });\npane.style.height = '300px';\nreturn pane;\n:::\n\n## Active filters with live removal\n\n:::script label=\"Filters that keep their remove buttons\" expected=\"A compact filter bar. Open More and remove a hidden chip; only that chip is destroyed. Resize the bar using the buttons.\"\nconst filters = [['status','Status: active'],['owner','Owner: design team'],['due','Due: this week'],['priority','Priority: high'],['region','Region: Americas']];\nconst list = await slice.build('OverflowList', { ariaLabel: 'Active filters', texts: { more: '+{count} filters', moreLabel: 'Show {count} hidden filters' } });\nconst status = document.createElement('p'); status.setAttribute('role', 'status'); status.textContent = '5 filters active.';\nconst items = [];\nfor (const [id, label] of filters) {\n  const chip = await slice.build('Chip', { label, removable: true, variant: id === 'priority' ? 'warning' : 'neutral', onRemove: () => {\n    list.items = list.items.filter(item => item.id !== id); status.textContent = `${list.items.length} filters active.`;\n  } });\n  items.push({ id, node: chip, priority: id === 'status' ? 10 : 0 });\n}\nlist.items = items;\nconst frame = document.createElement('div'); frame.style.cssText = 'width:340px;max-width:100%'; frame.append(list);\nconst controls = document.createElement('div'); controls.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';\ncontrols.append(\n  await slice.build('Button', { value: 'Compact', size: 'sm', variant: 'outlined', onClick: () => { frame.style.width = '340px'; } }),\n  await slice.build('Button', { value: 'Full width', size: 'sm', variant: 'ghost', onClick: () => { frame.style.width = '100%'; } })\n);\nconst box = document.createElement('div'); box.style.width = '100%'; box.append(controls, frame, status); return box;\n:::\n\n## Measurement, focus and ownership\n\nItems need intrinsic widths. Use content-sized controls or explicit pixel/rem widths; a child whose width depends on a percentage of this same row is outside the sizing contract. Reserve images' natural dimensions while loading. ResizeObserver handles item width changes, fonts and parent resizing. Hidden containers are measured when revealed; `reflow()` can be called after custom layout work.\n\nThe measurement lane is invisible, inert and clipped. Overflow controls keep their original keyboard behavior inside the disclosure. Escape and outside dismissal use DropDown; when a focused visible control becomes hidden, focus goes to More. No new controls are cloned or synthesized from labels.\n\nAssignments to `items` reconcile live nodes, and removed nodes are destroyed. Reuse stable IDs and node references to retain state. The dropdown receives `owned: false` custom content: OverflowList remains responsible for its nodes. Destroying OverflowList destroys the nodes, its menu, observers and scheduled work. Native resources whose state depends on DOM attachment, such as iframe browsing contexts, can still react to reparenting.\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
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
         const container = this.querySelector('[data-block-id="doc-block-4"]');
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
         const links = [{"text":"DropDown","path":"/docs/navigation/dropdown"}];
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
