export default class JsonViewerDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"An API response in the docs","expected":"a request line 'GET /api/example/1 · 200 OK' over a JSON viewer with search and a root named 'response'; searching 'sku' highlights both SKUs and opens the items; c and p copy from the focused row","kind":"script","content":"const response = {\n  id: 1,\n  status: 'status-1',\n  createdAt: '2026-01-15T10:00:00Z',\n  total: 10,\n  currency: 'USD',\n  owner: { id: 'user-1', name: 'User 1', email: 'user1@example.com', 'phone number': '000-000-0000' },\n  shipping: { method: 'standard', address: { line1: 'Address line 1', city: 'City 1', country: 'US' }, trackingCode: null },\n  items: [\n    { sku: 'SKU-1', name: 'Item 1', qty: 1, price: 10 },\n    { sku: 'SKU-2', name: 'Item 2', qty: 2, price: 20 }\n  ],\n  active: false,\n  metadata: { source: 'source-1', campaign: 'campaign-1' }\n};\nconst line = document.createElement('p');\nline.style.cssText = 'margin:0 0 8px;font-family:var(--font-family-code, monospace);font-size:.85rem';\nline.textContent = 'GET /api/example/1 · 200 OK';\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(line, await slice.build('JsonViewer', { data: response, rootName: 'response', expandDepth: 2, search: true }));\nreturn box;"},{"label":"View the raw record from an admin panel","expected":"a small summary of a record with a 'View JSON' button; the button opens a modal with the full record in a JsonViewer limited to 360px of height; selecting a value shows its path under the viewer","kind":"script","content":"const record = {\n  id: 'record-1',\n  name: 'Record 1',\n  roles: ['role-1', 'role-2'],\n  preferences: { theme: 'light', language: 'en', notifications: { email: true, push: false } },\n  lastLogin: '2026-01-15T10:00:00Z',\n  sessions: Array.from({ length: 140 }, (_, i) => ({ id: `session-${1000 + i}`, ip: `10.0.${i % 255}.${(i * 7) % 255}`, device: i % 3 ? 'web' : 'mobile' }))\n};\nconst picked = document.createElement('p');\npicked.style.cssText = 'margin:8px 0 0;font-size:.85rem;opacity:.8';\npicked.textContent = 'Select a value to see its path.';\nconst viewer = await slice.build('JsonViewer', {\n  data: record, rootName: 'record', maxHeight: '360px', size: 'sm', search: true,\n  onSelect: ({ pathText, value }) => { picked.textContent = `${pathText} = ${JSON.stringify(value)}`; }\n});\nconst body = document.createElement('div');\nbody.append(viewer, picked);\nconst modal = await slice.build('Modal', { title: 'Raw record', size: 'lg', content: body, open: false });\n\nconst card = await slice.build('Card', {\n  title: record.name, subtitle: `${record.roles.join(', ')} · ${record.sessions.length} sessions`, variant: 'outlined',\n  actions: [{ label: 'View JSON', variant: 'outlined', onClick: () => { modal.open = true; } }]\n});\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%;max-width:420px';\nbox.append(card, modal);\nreturn box;"},{"label":"A webhook log","expected":"a list of three events; each has its type and time in a small header and a compact JsonViewer below with only the top level shown and no toolbar","kind":"script","content":"const events = [\n  { type: 'event.one', at: '10:00:00', data: { id: 'event-1', value: 100, active: true } },\n  { type: 'event.two', at: '11:00:00', data: { id: 'event-2', value: 200, label: 'Item 2' } },\n  { type: 'event.three', at: '12:00:00', data: { id: 'event-3', changes: { field: ['old', 'new'] } } }\n];\nconst list = document.createElement('div');\nlist.style.cssText = 'display:grid;gap:12px;width:100%';\nfor (const event of events) {\n  const head = document.createElement('p');\n  head.style.cssText = 'margin:0 0 6px;font-size:.82rem;font-weight:600';\n  head.textContent = `${event.type} · ${event.at}`;\n  const item = document.createElement('div');\n  item.append(head, await slice.build('JsonViewer', { data: event.data, size: 'sm', toolbar: false }));\n  list.append(item);\n}\nreturn list;"}];
  }

  async init() {
    this.markdownPath = "json-viewer.md";
    this.markdownContent = "---\ntitle: JsonViewer\nroute: /docs/display/json-viewer\nnavLabel: JsonViewer\nsection: Display\ngroup: Content\norder: 46\ndescription: A JSON value as a tree you can read — objects and arrays fold open, values coloured by type, search that opens the way to every match, and the path or value of any node one key away.\ncomponent: JsonViewerDocumentation\ngenerate: true\ntags: [json, tree, viewer, inspector, api, payload, debug, data, display]\n---\n\n# JsonViewer\n\n## Overview\n`JsonViewer` shows a JSON value as a tree: objects and arrays fold open, strings, numbers, booleans and `null` have their own colour, and the path (`user.addresses[0].city`) or the value of any node can be copied.\n\nOnly what is open is in the page, and a long array opens in ranges of 100 (`[0 … 99]`), so a large response stays fast.\n\n### When to use it\n- **API responses in documentation**: what an endpoint returns, ready to explore.\n- **The raw data of a record** in an admin panel (\"View JSON\").\n- **Webhooks, events and logs** whose shape changes from one to the next.\n- **Configs** that people read more than they edit.\n\n### When not to use it\n- **Data people work with** (sort, filter, select, edit): a [Table](/docs/data/table), a [DataList](/docs/data/datalist) or a [DescriptionList](/docs/data/description-list).\n- **Code to read as text**, with its formatting: [CodeVisualizer](/docs/display/code-visualizer).\n- **A hierarchy of pages or files to navigate**: [TreeView](/docs/navigation/treeview).\n\n## Core Behavior\n- `data`: any JSON value. Dates show as ISO strings; circular references show as `[Circular]` instead of hanging.\n- `expandDepth`: how many levels of keys show at the start — `1` (default) the top-level keys, closed; `2` also what is inside them; `Infinity` everything.\n- `rootName` (\"response\"): a row for the root, and the start of every copied path.\n- `search: true`: a box that highlights what matches (keys and values), opens the way to it and counts it; Enter goes to the next match, Shift+Enter to the previous one.\n- `toolbar` (default on): Expand all and Collapse all. `sortKeys` orders keys alphabetically without changing the data. `maxStringLength` (200) cuts long strings, with a button for the rest.\n- `onSelect({ path, pathText, key, value })` on Enter or a click on a value. `onCopy({ what, text, path })` after a copy.\n- `expandAll()` and `collapseAll()` from code.\n\n### Keyboard and screen readers\nIt is an ARIA tree with one Tab stop: ↑ ↓ move, → opens (or goes in), ← closes (or goes up), Home / End, Enter selects. On any row, **c** copies the value and **p** copies the path; a polite status says what was copied. The copy buttons on each row do the same with the pointer.\n\n## Looks\n- `size`: `md` or `sm`. `maxHeight` ('320px') makes it scroll.\n- Colours come from the theme (`--success-color` for strings, `--info-color` for numbers…) and can be set with `--slice-json-viewer-string`, `--slice-json-viewer-number`, `--slice-json-viewer-boolean`, `--slice-json-viewer-key`.\n\n## Live Preview\n:::component name=\"JsonViewer\"\n{\n  \"data\": { \"id\": 1, \"name\": \"Item 1\", \"active\": true, \"value\": 10, \"tags\": [\"tag1\", \"tag2\"], \"details\": { \"label\": \"Detail 1\", \"note\": null } },\n  \"expandDepth\": 2\n}\n:::\n\n## Examples\n:::script label=\"An API response in the docs\" expected=\"a request line 'GET /api/example/1 · 200 OK' over a JSON viewer with search and a root named 'response'; searching 'sku' highlights both SKUs and opens the items; c and p copy from the focused row\"\nconst response = {\n  id: 1,\n  status: 'status-1',\n  createdAt: '2026-01-15T10:00:00Z',\n  total: 10,\n  currency: 'USD',\n  owner: { id: 'user-1', name: 'User 1', email: 'user1@example.com', 'phone number': '000-000-0000' },\n  shipping: { method: 'standard', address: { line1: 'Address line 1', city: 'City 1', country: 'US' }, trackingCode: null },\n  items: [\n    { sku: 'SKU-1', name: 'Item 1', qty: 1, price: 10 },\n    { sku: 'SKU-2', name: 'Item 2', qty: 2, price: 20 }\n  ],\n  active: false,\n  metadata: { source: 'source-1', campaign: 'campaign-1' }\n};\nconst line = document.createElement('p');\nline.style.cssText = 'margin:0 0 8px;font-family:var(--font-family-code, monospace);font-size:.85rem';\nline.textContent = 'GET /api/example/1 · 200 OK';\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(line, await slice.build('JsonViewer', { data: response, rootName: 'response', expandDepth: 2, search: true }));\nreturn box;\n:::\n\n:::script label=\"View the raw record from an admin panel\" expected=\"a small summary of a record with a 'View JSON' button; the button opens a modal with the full record in a JsonViewer limited to 360px of height; selecting a value shows its path under the viewer\"\nconst record = {\n  id: 'record-1',\n  name: 'Record 1',\n  roles: ['role-1', 'role-2'],\n  preferences: { theme: 'light', language: 'en', notifications: { email: true, push: false } },\n  lastLogin: '2026-01-15T10:00:00Z',\n  sessions: Array.from({ length: 140 }, (_, i) => ({ id: `session-${1000 + i}`, ip: `10.0.${i % 255}.${(i * 7) % 255}`, device: i % 3 ? 'web' : 'mobile' }))\n};\nconst picked = document.createElement('p');\npicked.style.cssText = 'margin:8px 0 0;font-size:.85rem;opacity:.8';\npicked.textContent = 'Select a value to see its path.';\nconst viewer = await slice.build('JsonViewer', {\n  data: record, rootName: 'record', maxHeight: '360px', size: 'sm', search: true,\n  onSelect: ({ pathText, value }) => { picked.textContent = `${pathText} = ${JSON.stringify(value)}`; }\n});\nconst body = document.createElement('div');\nbody.append(viewer, picked);\nconst modal = await slice.build('Modal', { title: 'Raw record', size: 'lg', content: body, open: false });\n\nconst card = await slice.build('Card', {\n  title: record.name, subtitle: `${record.roles.join(', ')} · ${record.sessions.length} sessions`, variant: 'outlined',\n  actions: [{ label: 'View JSON', variant: 'outlined', onClick: () => { modal.open = true; } }]\n});\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%;max-width:420px';\nbox.append(card, modal);\nreturn box;\n:::\n\n:::script label=\"A webhook log\" expected=\"a list of three events; each has its type and time in a small header and a compact JsonViewer below with only the top level shown and no toolbar\"\nconst events = [\n  { type: 'event.one', at: '10:00:00', data: { id: 'event-1', value: 100, active: true } },\n  { type: 'event.two', at: '11:00:00', data: { id: 'event-2', value: 200, label: 'Item 2' } },\n  { type: 'event.three', at: '12:00:00', data: { id: 'event-3', changes: { field: ['old', 'new'] } } }\n];\nconst list = document.createElement('div');\nlist.style.cssText = 'display:grid;gap:12px;width:100%';\nfor (const event of events) {\n  const head = document.createElement('p');\n  head.style.cssText = 'margin:0 0 6px;font-size:.82rem;font-weight:600';\n  head.textContent = `${event.type} · ${event.at}`;\n  const item = document.createElement('div');\n  item.append(head, await slice.build('JsonViewer', { data: event.data, size: 'sm', toolbar: false }));\n  list.append(item);\n}\nreturn list;\n:::\n\n## Best Practices\n:::tip\nOpen as much as people need at a glance (`expandDepth: 2` for most API responses) and let search do the rest.\n:::\n\n:::tip\nGive the root a name (`rootName: 'response'`) when people copy paths into code: they get `response.items[0].sku`, ready to paste.\n:::\n\n## Pitfalls\n:::warning\nIt shows data; it does not hide it. Remove tokens, passwords and personal data before passing a value to a viewer that anyone with the page can read.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            let props = {};
            if ("{\n  \"data\": { \"id\": 1, \"name\": \"Item 1\", \"active\": true, \"value\": 10, \"tags\": [\"tag1\", \"tag2\"], \"details\": { \"label\": \"Detail 1\", \"note\": null } },\n  \"expandDepth\": 2\n}") {
               try {
                  props = JSON.parse("{\n  \"data\": { \"id\": 1, \"name\": \"Item 1\", \"active\": true, \"value\": 10, \"tags\": [\"tag1\", \"tag2\"], \"details\": { \"label\": \"Detail 1\", \"note\": null } },\n  \"expandDepth\": 2\n}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('JsonViewer', props);
            container.appendChild(component);
         }
       }
      {
         const container = this.querySelector('[data-block-id="doc-block-5"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"data\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"expandDepth\",\"type\":\"number\",\"required\":false,\"default\":\"1\",\"allowedValues\":[]},{\"path\":\"rootName\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"search\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"toolbar\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"sortKeys\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"maxStringLength\",\"type\":\"number\",\"required\":false,\"default\":\"200\",\"allowedValues\":[]},{\"path\":\"copyable\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"maxHeight\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"onSelect\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onCopy\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"data\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"expandDepth\",\"type\":\"number\",\"required\":false,\"default\":\"1\",\"allowedValues\":[]},{\"path\":\"rootName\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"search\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"toolbar\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"sortKeys\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"maxStringLength\",\"type\":\"number\",\"required\":false,\"default\":\"200\",\"allowedValues\":[]},{\"path\":\"copyable\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"maxHeight\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"onSelect\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onCopy\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"Table","path":"/docs/data/table"},{"text":"DataList","path":"/docs/data/datalist"},{"text":"DescriptionList","path":"/docs/data/description-list"},{"text":"CodeVisualizer","path":"/docs/display/code-visualizer"},{"text":"TreeView","path":"/docs/navigation/treeview"}];
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

customElements.define('slice-jsonviewerdocumentation', JsonViewerDocumentation);
