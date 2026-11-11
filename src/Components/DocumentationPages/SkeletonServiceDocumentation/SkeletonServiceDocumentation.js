export default class SkeletonServiceDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"Refreshing a table","expected":"an example table with a Refresh button; Refresh turns every value into a bar as long as its text (the column headers stay) for about a second and a half, then the table shows the new rows without moving","kind":"script","content":"const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });\nconst batches = [\n  [['Item 1', 'Value 1', 'Status 1', 'Value A'], ['Item 2', 'Value 2', 'Status 2', 'Value B'], ['Item 3', 'Value 3', 'Status 3', 'Value C'], ['Item 4', 'Value 4', 'Status 4', 'Value D']],\n  [['Item 5', 'Value 5', 'Status 5', 'Value E'], ['Item 6', 'Value 6', 'Status 6', 'Value F'], ['Item 7', 'Value 7', 'Status 7', 'Value G'], ['Item 8', 'Value 8', 'Status 8', 'Value H']]\n];\nlet turn = 0;\nconst table = await slice.build('Table', { headers: ['Column 1', 'Column 2', 'Column 3', 'Column 4'], rows: batches[0] });\nconst fetchRows = () => new Promise((resolve) => setTimeout(() => resolve(batches[++turn % 2]), 1500));\nconst refresh = await slice.build('Button', {\n  value: 'Refresh', variant: 'outlined', size: 'sm',\n  onClick: async () => {\n    refresh.disabled = true;\n    table.rows = await skeleton.during(table, fetchRows());\n    refresh.disabled = false;\n  }\n});\nconst head = document.createElement('div');\nhead.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px';\nconst title = document.createElement('strong');\ntitle.textContent = 'Example table';\nhead.append(title, refresh);\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(head, table);\nreturn box;"},{"label":"A profile card, triggered by a button","expected":"a 'Show skeleton' button above a profile card with an avatar, a name, a role and two buttons; pressing it turns the card into blocks of their shapes (the avatar round) for about a second and a half, then the profile appears again in exactly the same place","kind":"script","content":"const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });\nconst person = { name: 'User 1', role: 'Role 1', city: 'City 1' };\nconst card = document.createElement('section');\ncard.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;width:100%;padding:16px;border:1px solid var(--slice-border-raised, #ddd);border-radius:12px';\nconst avatar = await slice.build('Avatar', { name: person.name, size: 'lg' });\nconst text = document.createElement('div');\nconst name = document.createElement('strong');\nname.textContent = person.name;\nconst role = document.createElement('p');\nrole.style.cssText = 'margin:4px 0 10px;opacity:.75';\nrole.textContent = `${person.role} · ${person.city}`;\nconst actions = document.createElement('div');\nactions.style.cssText = 'display:flex;gap:8px';\nactions.append(await slice.build('Button', { value: 'Message', size: 'sm' }), await slice.build('Button', { value: 'Profile', variant: 'outlined', size: 'sm' }));\ntext.append(name, role, actions);\ncard.append(avatar, text);\n\nconst load = async () => {\n  trigger.disabled = true;\n  await skeleton.during(card, new Promise((r) => setTimeout(r, 1500)));\n  avatar.name = person.name;\n  name.textContent = person.name;\n  role.textContent = `${person.role} · ${person.city}`;\n  trigger.disabled = false;\n};\nconst trigger = await slice.build('Button', { value: 'Show skeleton', variant: 'outlined', size: 'sm', onClick: () => load() });\nload();\n\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:10px;width:100%;max-width:420px';\nbox.append(trigger, card);\nreturn box;"},{"label":"A list that is still loading: repeat, triggered by a button","expected":"a 'Show skeleton' button above a list of messages; pressing it shows six rows of shapes (round avatars, a name and a line of text each) for about a second and a half, built from its single first row, then the six real messages","kind":"script","content":"const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });\nconst list = document.createElement('ul');\nlist.style.cssText = 'list-style:none;margin:0;padding:0;display:grid;gap:12px;width:100%;max-width:460px';\nconst row = async (who, text) => {\n  const li = document.createElement('li');\n  li.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center';\n  const body = document.createElement('div');\n  const strong = document.createElement('strong');\n  strong.textContent = who;\n  const p = document.createElement('p');\n  p.style.cssText = 'margin:2px 0 0;font-size:.9rem;opacity:.8';\n  p.textContent = text;\n  body.append(strong, p);\n  li.append(await slice.build('Avatar', { name: who, size: 'sm' }), body);\n  return li;\n};\nconst messages = [\n  ['User 1', 'Message 1'], ['User 2', 'Message 2'],\n  ['User 3', 'Message 3'], ['User 4', 'Message 4'],\n  ['User 5', 'Message 5'], ['User 6', 'Message 6']\n];\nconst load = async () => {\n  trigger.disabled = true;\n  slice.controller.destroyByContainer(list);\n  list.replaceChildren(await row('User', 'A message of about this length, to give the shape.'));\n  await skeleton.during(list, new Promise((r) => setTimeout(r, 1500)), { repeat: 6 });\n  const rows = [];\n  for (const [who, text] of messages) rows.push(await row(who, text));\n  slice.controller.destroyByContainer(list);\n  list.replaceChildren(...rows);\n  trigger.disabled = false;\n};\nconst trigger = await slice.build('Button', { value: 'Show skeleton', variant: 'outlined', size: 'sm', onClick: () => load() });\nload();\n\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:10px;width:100%;max-width:460px';\nbox.append(trigger, list);\nreturn box;"},{"label":"A dashboard of cards, triggered by a button","expected":"a 'Show skeleton' button above a dashboard of three cards; pressing it turns every card into blocks of its shape for about a second and a half, then the cards show new values without moving","kind":"script","content":"const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });\nconst batches = [\n  [['Metric 1', 'Value 1'], ['Metric 2', 'Value 2'], ['Metric 3', 'Value 3']],\n  [['Metric 1', 'Value 4'], ['Metric 2', 'Value 5'], ['Metric 3', 'Value 6']]\n];\nlet turn = 0;\nconst cards = [];\nfor (const [title, text] of batches[0]) {\n  cards.push(await slice.build('Card', { title, text, variant: 'outlined' }));\n}\nconst grid = await slice.build('Grid', { columns: 3, minItemWidth: '180px', gap: 12, items: cards });\nconst load = async () => {\n  trigger.disabled = true;\n  await skeleton.during(grid, new Promise((r) => setTimeout(r, 1500)));\n  const next = batches[++turn % 2];\n  cards.forEach((card, i) => {\n    card.title = next[i][0];\n    card.text = next[i][1];\n  });\n  trigger.disabled = false;\n};\nconst trigger = await slice.build('Button', { value: 'Show skeleton', variant: 'outlined', size: 'sm', onClick: () => load() });\nload();\n\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:10px;width:100%';\nbox.append(trigger, grid);\nreturn box;"}];
  }

  async init() {
    this.markdownPath = "skeleton-service.md";
    this.markdownContent = "---\ntitle: SkeletonService\nroute: /docs/services/skeleton-service\nnavLabel: SkeletonService\nsection: Services\ngroup: Interaction\norder: 64\ndescription: The loading state of any component, drawn from the component itself. Its text, images, fields and buttons turn into shimmering blocks of their exact size while data loads — nothing to declare on the component, no skeleton markup to write, and the layout does not move when the data arrives.\ncomponent: SkeletonServiceDocumentation\ngenerate: true\ntags: [service, skeleton, loading, placeholder, shimmer, aria-busy, async, data]\n---\n\n# SkeletonService\n\n## Overview\nA skeleton promises the shape of what is coming. A generic one (grey bars in a column) promises the wrong shape: the page jumps when the real content arrives.\n\n`SkeletonService` takes the shape **from the component itself**. It walks what the element renders and marks its leaves — runs of text, images, icons, fields, buttons — and a stylesheet turns each into a block of exactly its own size. The shapes are the layout, so nothing moves when the data is in. No component needs to know the service exists.\n\n```javascript\nconst skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'skeleton' });\n\n// Refreshing: what is on screen dims into shapes until the new data is in.\nconst rows = await skeleton.during(table, fetchRows());\ntable.rows = rows;\n\n// First load: build the component with what you have, then cover it.\nconst card = await slice.build('Card', { title: 'Loading title', text: 'Two lines of text for the shape.' });\nconst done = skeleton.cover(card);\n// …\ndone();\n```\n\n### When to use it\n- **Refreshing data that is already on screen**: a table, a dashboard card, a profile. The old content keeps its place as shapes.\n- **The first load of a component whose structure you know**: build it with placeholder text and cover it.\n- **Lists**: `repeat` shows several rows while the first page loads.\n\n### When not to use it\n- **Loads under about 300ms**: a skeleton that flashes is worse than none.\n- **An action the user started** (saving, sending): a busy [Button](/docs/input/button) or a [Loading](/docs/feedback/loading) indicator says \"working on it\" better than a dimmed page.\n- **Progress you can measure** (an upload): a progress bar.\n- **Nothing to show at all yet** (an empty search): an [EmptyState](/docs/display/empty-state).\n\n## Core Behavior\n- `cover(element, options)` → `done()`. Marks the leaves, adds `aria-busy=\"true\"` and `inert` to the element (no clicks, no focus, no reading of stale text), and a polite status says \"Loading…\" once. `done()` puts everything back, including attributes the element already had; calling it twice is harmless.\n- `during(element, work, options)` covers until `work` (a promise, or a function returning one) settles, and returns its result — or throws its error, uncovered.\n- Covering an element twice counts: it comes back when every `done()` has run. `uncover(element)` forces it; `isCovered(element)` tells.\n- `options.repeat: n` shows `n` rows while covered by copying the first one (or the first match of `options.item`, such as `'tbody tr'`). The copies are plain markup: a component inside the row becomes an empty box of its size, so nothing is built or registered. They are removed by `done()`.\n- `options.keep`: what stays readable because it labels the interface rather than showing data — by default column headers, field labels and legends (`'th, thead, label, legend, [data-skeleton-keep]'`). Mark your own with `data-skeleton-keep`; pass `''` to cover everything.\n- `options.label` replaces the announced text (built in: \"Loading…\" / \"Cargando…\").\n- What becomes a block: images, video, SVG, canvas, fields and buttons as a whole, with their own corners (a round avatar stays round); text as bars **as long as the text itself**, line by line (it is wrapped in an inline span while covered, so a short name in a wide cell is a short bar); an empty box with a background image as one block.\n- Destroying the service uncovers everything and removes its status and stylesheet.\n\n## Looks\nPer element or app-wide: `--slice-skeleton-color`, `--slice-skeleton-shine`, `--slice-skeleton-radius`, `--slice-skeleton-speed`. With reduced motion the blocks do not shimmer.\n\n## Examples\n:::script label=\"Refreshing a table\" expected=\"an example table with a Refresh button; Refresh turns every value into a bar as long as its text (the column headers stay) for about a second and a half, then the table shows the new rows without moving\"\nconst skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });\nconst batches = [\n  [['Item 1', 'Value 1', 'Status 1', 'Value A'], ['Item 2', 'Value 2', 'Status 2', 'Value B'], ['Item 3', 'Value 3', 'Status 3', 'Value C'], ['Item 4', 'Value 4', 'Status 4', 'Value D']],\n  [['Item 5', 'Value 5', 'Status 5', 'Value E'], ['Item 6', 'Value 6', 'Status 6', 'Value F'], ['Item 7', 'Value 7', 'Status 7', 'Value G'], ['Item 8', 'Value 8', 'Status 8', 'Value H']]\n];\nlet turn = 0;\nconst table = await slice.build('Table', { headers: ['Column 1', 'Column 2', 'Column 3', 'Column 4'], rows: batches[0] });\nconst fetchRows = () => new Promise((resolve) => setTimeout(() => resolve(batches[++turn % 2]), 1500));\nconst refresh = await slice.build('Button', {\n  value: 'Refresh', variant: 'outlined', size: 'sm',\n  onClick: async () => {\n    refresh.disabled = true;\n    table.rows = await skeleton.during(table, fetchRows());\n    refresh.disabled = false;\n  }\n});\nconst head = document.createElement('div');\nhead.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px';\nconst title = document.createElement('strong');\ntitle.textContent = 'Example table';\nhead.append(title, refresh);\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(head, table);\nreturn box;\n:::\n\n:::script label=\"A profile card, triggered by a button\" expected=\"a 'Show skeleton' button above a profile card with an avatar, a name, a role and two buttons; pressing it turns the card into blocks of their shapes (the avatar round) for about a second and a half, then the profile appears again in exactly the same place\"\nconst skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });\nconst person = { name: 'User 1', role: 'Role 1', city: 'City 1' };\nconst card = document.createElement('section');\ncard.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;width:100%;padding:16px;border:1px solid var(--slice-border-raised, #ddd);border-radius:12px';\nconst avatar = await slice.build('Avatar', { name: person.name, size: 'lg' });\nconst text = document.createElement('div');\nconst name = document.createElement('strong');\nname.textContent = person.name;\nconst role = document.createElement('p');\nrole.style.cssText = 'margin:4px 0 10px;opacity:.75';\nrole.textContent = `${person.role} · ${person.city}`;\nconst actions = document.createElement('div');\nactions.style.cssText = 'display:flex;gap:8px';\nactions.append(await slice.build('Button', { value: 'Message', size: 'sm' }), await slice.build('Button', { value: 'Profile', variant: 'outlined', size: 'sm' }));\ntext.append(name, role, actions);\ncard.append(avatar, text);\n\nconst load = async () => {\n  trigger.disabled = true;\n  await skeleton.during(card, new Promise((r) => setTimeout(r, 1500)));\n  avatar.name = person.name;\n  name.textContent = person.name;\n  role.textContent = `${person.role} · ${person.city}`;\n  trigger.disabled = false;\n};\nconst trigger = await slice.build('Button', { value: 'Show skeleton', variant: 'outlined', size: 'sm', onClick: () => load() });\nload();\n\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:10px;width:100%;max-width:420px';\nbox.append(trigger, card);\nreturn box;\n:::\n\n:::script label=\"A list that is still loading: repeat, triggered by a button\" expected=\"a 'Show skeleton' button above a list of messages; pressing it shows six rows of shapes (round avatars, a name and a line of text each) for about a second and a half, built from its single first row, then the six real messages\"\nconst skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });\nconst list = document.createElement('ul');\nlist.style.cssText = 'list-style:none;margin:0;padding:0;display:grid;gap:12px;width:100%;max-width:460px';\nconst row = async (who, text) => {\n  const li = document.createElement('li');\n  li.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center';\n  const body = document.createElement('div');\n  const strong = document.createElement('strong');\n  strong.textContent = who;\n  const p = document.createElement('p');\n  p.style.cssText = 'margin:2px 0 0;font-size:.9rem;opacity:.8';\n  p.textContent = text;\n  body.append(strong, p);\n  li.append(await slice.build('Avatar', { name: who, size: 'sm' }), body);\n  return li;\n};\nconst messages = [\n  ['User 1', 'Message 1'], ['User 2', 'Message 2'],\n  ['User 3', 'Message 3'], ['User 4', 'Message 4'],\n  ['User 5', 'Message 5'], ['User 6', 'Message 6']\n];\nconst load = async () => {\n  trigger.disabled = true;\n  slice.controller.destroyByContainer(list);\n  list.replaceChildren(await row('User', 'A message of about this length, to give the shape.'));\n  await skeleton.during(list, new Promise((r) => setTimeout(r, 1500)), { repeat: 6 });\n  const rows = [];\n  for (const [who, text] of messages) rows.push(await row(who, text));\n  slice.controller.destroyByContainer(list);\n  list.replaceChildren(...rows);\n  trigger.disabled = false;\n};\nconst trigger = await slice.build('Button', { value: 'Show skeleton', variant: 'outlined', size: 'sm', onClick: () => load() });\nload();\n\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:10px;width:100%;max-width:460px';\nbox.append(trigger, list);\nreturn box;\n:::\n\n:::script label=\"A dashboard of cards, triggered by a button\" expected=\"a 'Show skeleton' button above a dashboard of three cards; pressing it turns every card into blocks of its shape for about a second and a half, then the cards show new values without moving\"\nconst skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });\nconst batches = [\n  [['Metric 1', 'Value 1'], ['Metric 2', 'Value 2'], ['Metric 3', 'Value 3']],\n  [['Metric 1', 'Value 4'], ['Metric 2', 'Value 5'], ['Metric 3', 'Value 6']]\n];\nlet turn = 0;\nconst cards = [];\nfor (const [title, text] of batches[0]) {\n  cards.push(await slice.build('Card', { title, text, variant: 'outlined' }));\n}\nconst grid = await slice.build('Grid', { columns: 3, minItemWidth: '180px', gap: 12, items: cards });\nconst load = async () => {\n  trigger.disabled = true;\n  await skeleton.during(grid, new Promise((r) => setTimeout(r, 1500)));\n  const next = batches[++turn % 2];\n  cards.forEach((card, i) => {\n    card.title = next[i][0];\n    card.text = next[i][1];\n  });\n  trigger.disabled = false;\n};\nconst trigger = await slice.build('Button', { value: 'Show skeleton', variant: 'outlined', size: 'sm', onClick: () => load() });\nload();\n\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:10px;width:100%';\nbox.append(trigger, grid);\nreturn box;\n:::\n\n## Best Practices\n:::tip\nCover what you are about to replace, then set the data after `during()` returns. The skeleton shows the old shapes; the new content lands in the same place.\n:::\n\n:::tip\nFor a first load, build the component with placeholder text of a realistic length. The shapes are only as good as the text they are made from.\n:::\n\n## Pitfalls\n:::warning\nA covered element is `inert`: nothing inside it can be clicked or focused until `done()`. Do not cover a form the user is typing in — cover the part that is loading.\n:::\n\n:::warning\nAlways call `done()` (or use `during()`, which does it even when the work fails). A forgotten cover leaves the element busy and inert.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            const code = await slice.build('CodeVisualizer', {
               value: "const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'skeleton' });\n\n// Refreshing: what is on screen dims into shapes until the new data is in.\nconst rows = await skeleton.during(table, fetchRows());\ntable.rows = rows;\n\n// First load: build the component with what you have, then cover it.\nconst card = await slice.build('Card', { title: 'Loading title', text: 'Two lines of text for the shape.' });\nconst done = skeleton.cover(card);\n// …\ndone();",
               language: "javascript"
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
         const links = [{"text":"Button","path":"/docs/input/button"},{"text":"Loading","path":"/docs/feedback/loading"},{"text":"EmptyState","path":"/docs/display/empty-state"}];
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

customElements.define('slice-skeletonservicedocumentation', SkeletonServiceDocumentation);
