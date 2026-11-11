export default class GridDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A dashboard that fits where it is put","expected":"four metric cards: four columns at full width, two at half width, one in a sidebar; the buttons resize the container to show it","kind":"script","content":"const metrics = [\n  ['Revenue', '$48,210', '+12% vs last month'],\n  ['Orders', '1,284', '+4%'],\n  ['Refunds', '23', '−8%'],\n  ['Visitors', '36,402', '+19%']\n];\nconst cards = [];\nfor (const [title, value, change] of metrics) {\n  cards.push(await slice.build('Card', { title: value, subtitle: title, text: change, variant: 'outlined' }));\n}\nconst grid = await slice.build('Grid', { columns: { 0: 1, 440: 2, 700: 4 }, gap: 12, items: cards });\n\nconst frame = document.createElement('div');\nframe.style.cssText = 'width:100%;transition:width .2s';\nframe.append(grid);\nconst bar = document.createElement('div');\nbar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center';\nconst shown = document.createElement('span');\nshown.style.cssText = 'font-size:.85rem;opacity:.75';\nconst report = () => setTimeout(() => { shown.textContent = `${grid.columnCount} column(s)`; }, 300);\nfor (const [label, width] of [['Full width', '100%'], ['Half (520px)', '520px'], ['Sidebar (320px)', '320px']]) {\n  bar.append(await slice.build('Button', { value: label, variant: 'outlined', size: 'sm', onClick: () => { frame.style.width = width; report(); } }));\n}\nbar.append(shown);\nreport();\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(bar, frame);\nreturn box;"},{"label":"A photo gallery with automatic columns","expected":"twelve coloured tiles with captions; as many columns as fit at 160px minimum each, every tile square","kind":"script","content":"const hues = [12, 38, 64, 140, 168, 196, 220, 248, 276, 300, 330, 355];\nconst places = ['Lagunillas', 'Mérida', 'Coro', 'Los Roques', 'Canaima', 'Choroní', 'Barquisimeto', 'Margarita', 'Mochima', 'Colonia Tovar', 'Maracaibo', 'Roraima'];\nconst tiles = hues.map((h, i) => {\n  const figure = document.createElement('figure');\n  figure.style.cssText = 'margin:0;display:grid;gap:6px';\n  const photo = document.createElement('div');\n  photo.setAttribute('role', 'img');\n  photo.setAttribute('aria-label', `Photo of ${places[i]}`);\n  photo.style.cssText = `aspect-ratio:1;border-radius:10px;background:linear-gradient(135deg,hsl(${h} 70% 62%),hsl(${(h + 40) % 360} 65% 42%))`;\n  const caption = document.createElement('figcaption');\n  caption.style.cssText = 'font-size:.82rem';\n  caption.textContent = places[i];\n  figure.append(photo, caption);\n  return figure;\n});\nreturn await slice.build('Grid', { minItemWidth: 160, gap: 14, items: tiles });"},{"label":"A bento section of features","expected":"a four-column bento: a large 2×2 tile 'Components without a build step', a wide tile 'Docs that run' spanning two columns, and two small tiles; on a narrow screen every tile is one column wide and they stack","kind":"script","content":"const tile = (title, text, tone) => {\n  const el = document.createElement('article');\n  el.style.cssText = `display:grid;align-content:end;gap:6px;height:100%;box-sizing:border-box;padding:18px;border-radius:14px;background:color-mix(in srgb, var(--${tone}-color) 14%, var(--secondary-background-color))`;\n  const h = document.createElement('h3');\n  h.style.cssText = 'margin:0;font-size:1.05rem';\n  h.textContent = title;\n  const p = document.createElement('p');\n  p.style.cssText = 'margin:0;font-size:.88rem;opacity:.85';\n  p.textContent = text;\n  el.append(h, p);\n  return el;\n};\nreturn await slice.build('Grid', {\n  columns: { 0: 1, 520: 2, 700: 4 },\n  autoRows: 'minmax(130px, auto)',\n  gap: 12,\n  items: [\n    { node: tile('Components without a build step', 'Custom elements with a template, a stylesheet and a class. Open the file, change it, reload.', 'primary'), colSpan: 2, rowSpan: 2 },\n    { node: tile('Docs that run', 'Every example on these pages is live code.', 'info'), colSpan: 2 },\n    tile('Themes', 'Light, dark and your own.', 'success'),\n    tile('Translations', 'English and Spanish built in.', 'warning')\n  ]\n});"},{"label":"Regions with named areas","expected":"a product page: on a wide container the gallery on the left and the buy box on the right, with the description under the gallery; on a narrow one everything stacks, with the buy box right after the gallery","kind":"script","content":"const block = (title, height) => {\n  const el = document.createElement('section');\n  el.style.cssText = `min-height:${height}px;padding:14px;border-radius:12px;border:1px solid var(--slice-border-raised, #ddd);box-sizing:border-box`;\n  el.textContent = title;\n  return el;\n};\nreturn await slice.build('Grid', {\n  gap: 16,\n  areas: {\n    0: ['gallery', 'buy', 'details'],\n    720: ['gallery buy', 'details buy']\n  },\n  items: [\n    { node: block('Gallery', 220), area: 'gallery' },\n    { node: block('Buy box: price, size, Add to cart', 160), area: 'buy' },\n    { node: block('Description and specifications', 140), area: 'details' }\n  ]\n});"},{"label":"Adding and removing items","expected":"a row of task cards with an 'Add task' button; new cards are appended, and 'Remove first' takes the first one out (and destroys it)","kind":"script","content":"let n = 0;\nconst task = () => slice.build('Card', { title: `Task ${++n}`, text: 'Due Friday', variant: 'outlined' });\nconst grid = await slice.build('Grid', { minItemWidth: 180, gap: 10, items: [await task(), await task()] });\nconst bar = document.createElement('div');\nbar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';\nbar.append(\n  await slice.build('Button', { value: 'Add task', onClick: async () => { grid.items = [...grid.items, await task()]; } }),\n  await slice.build('Button', { value: 'Remove first', variant: 'outlined', onClick: () => { grid.items = grid.items.slice(1); } })\n);\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(bar, grid);\nreturn box;"}];
  }

  async init() {
    this.markdownPath = "grid.md";
    this.markdownContent = "---\ntitle: Grid\nroute: /docs/layout/grid\nnavLabel: Grid\nsection: Layout\ngroup: Containers\norder: 22\ndescription: Content in rows and columns — columns by the grid's own width, automatic columns, items that span, and named areas. For dashboards, galleries, bento sections and page regions.\ncomponent: GridDocumentation\ngenerate: true\ntags: [grid, layout, responsive, columns, areas, bento, gallery, dashboard]\n---\n\n# Grid\n\n## Overview\n`Grid` lays content out in rows and columns: four metric cards on a dashboard, a gallery of photos, a \"bento\" section of features with one big tile, or the regions of a page.\n\nWhat makes it more than `display: grid`:\n\n- **Breakpoints measured on the grid itself**, not on the window. A grid of `{ 0: 1, 560: 2, 960: 4 }` columns shows one column inside a narrow sidebar or a modal, and four on a wide page — the same code in both places.\n- **Automatic columns** with `minItemWidth`: as many columns as fit, each at least that wide.\n- **Items that span** (`{ node, colSpan, rowSpan }`), and a span never asks for more columns than there are, so a 2-wide tile becomes 1 wide on a phone instead of overflowing.\n- **Named areas**, also per width: `['header header', 'main side']`.\n\n### When to use it\n- **Sets of similar things**: metric cards, products, photos, team members, features.\n- **Bento sections** on a landing: one large tile and several small ones.\n- **A page or panel with regions** (header, main, side) that rearrange by width.\n\n### When not to use it\n- **A list people read top to bottom** (messages, search results): a plain list or a [DataList](/docs/data/datalist).\n- **Rows of data with columns to compare and sort**: a [Table](/docs/data/table).\n- **An application frame** with navigation, a sidebar that collapses into a drawer and a skip link: [Layout](/docs/layout/layout).\n- **Two or three things in a row** that should just wrap: a flex row in your own CSS is enough.\n\n## Core Behavior\n- `columns`: a number (default `1`), or breakpoints by the grid's width — `{ 0: 1, 560: 2, 960: 4 }` means 1 column, 2 from 560px, 4 from 960px.\n- `minItemWidth`: automatic columns (`220` or `'14rem'`). Wins over `columns`.\n- `items`: live DOM nodes or components, or `{ node, colSpan, rowSpan, area }`. `colSpan` is a number or `'full'` (the whole row). Assigning `items` **replaces** the content: nodes still present are moved, not rebuilt; components that leave are destroyed.\n- `areas`: an array of rows (`['header header', 'main side']`), or breakpoints of them. Items with `area` go there; an item whose area is missing at the current width falls into the normal flow.\n- `gap` (a CSS length or a number of pixels, `10px` by default) and `rowGap` for a different space between rows.\n- `autoRows`: the height of the rows the grid creates (`'140px'`, `'minmax(120px, auto)'`), needed for `rowSpan` tiles of equal height.\n- `dense`: later small items fill the holes left by big ones. The visual order then differs from the DOM order, which is what keyboard and screen readers follow — use it for galleries, not for steps.\n- `align` and `justify`: how items sit in their cell (`stretch` by default, `start`, `center`, `end`).\n- `columnTemplate` and `rowTemplate`: raw CSS templates when nothing above fits; they win over the rest.\n- `columnCount` (read-only) and the `data-columns` attribute: the columns shown right now.\n- `setItem(item)` and `setItems(items)` append; `clear()` empties it and destroys the components.\n\n## Examples\n:::script label=\"A dashboard that fits where it is put\" expected=\"four metric cards: four columns at full width, two at half width, one in a sidebar; the buttons resize the container to show it\"\nconst metrics = [\n  ['Revenue', '$48,210', '+12% vs last month'],\n  ['Orders', '1,284', '+4%'],\n  ['Refunds', '23', '−8%'],\n  ['Visitors', '36,402', '+19%']\n];\nconst cards = [];\nfor (const [title, value, change] of metrics) {\n  cards.push(await slice.build('Card', { title: value, subtitle: title, text: change, variant: 'outlined' }));\n}\nconst grid = await slice.build('Grid', { columns: { 0: 1, 440: 2, 700: 4 }, gap: 12, items: cards });\n\nconst frame = document.createElement('div');\nframe.style.cssText = 'width:100%;transition:width .2s';\nframe.append(grid);\nconst bar = document.createElement('div');\nbar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center';\nconst shown = document.createElement('span');\nshown.style.cssText = 'font-size:.85rem;opacity:.75';\nconst report = () => setTimeout(() => { shown.textContent = `${grid.columnCount} column(s)`; }, 300);\nfor (const [label, width] of [['Full width', '100%'], ['Half (520px)', '520px'], ['Sidebar (320px)', '320px']]) {\n  bar.append(await slice.build('Button', { value: label, variant: 'outlined', size: 'sm', onClick: () => { frame.style.width = width; report(); } }));\n}\nbar.append(shown);\nreport();\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(bar, frame);\nreturn box;\n:::\n\n:::script label=\"A photo gallery with automatic columns\" expected=\"twelve coloured tiles with captions; as many columns as fit at 160px minimum each, every tile square\"\nconst hues = [12, 38, 64, 140, 168, 196, 220, 248, 276, 300, 330, 355];\nconst places = ['Lagunillas', 'Mérida', 'Coro', 'Los Roques', 'Canaima', 'Choroní', 'Barquisimeto', 'Margarita', 'Mochima', 'Colonia Tovar', 'Maracaibo', 'Roraima'];\nconst tiles = hues.map((h, i) => {\n  const figure = document.createElement('figure');\n  figure.style.cssText = 'margin:0;display:grid;gap:6px';\n  const photo = document.createElement('div');\n  photo.setAttribute('role', 'img');\n  photo.setAttribute('aria-label', `Photo of ${places[i]}`);\n  photo.style.cssText = `aspect-ratio:1;border-radius:10px;background:linear-gradient(135deg,hsl(${h} 70% 62%),hsl(${(h + 40) % 360} 65% 42%))`;\n  const caption = document.createElement('figcaption');\n  caption.style.cssText = 'font-size:.82rem';\n  caption.textContent = places[i];\n  figure.append(photo, caption);\n  return figure;\n});\nreturn await slice.build('Grid', { minItemWidth: 160, gap: 14, items: tiles });\n:::\n\n:::script label=\"A bento section of features\" expected=\"a four-column bento: a large 2×2 tile 'Components without a build step', a wide tile 'Docs that run' spanning two columns, and two small tiles; on a narrow screen every tile is one column wide and they stack\"\nconst tile = (title, text, tone) => {\n  const el = document.createElement('article');\n  el.style.cssText = `display:grid;align-content:end;gap:6px;height:100%;box-sizing:border-box;padding:18px;border-radius:14px;background:color-mix(in srgb, var(--${tone}-color) 14%, var(--secondary-background-color))`;\n  const h = document.createElement('h3');\n  h.style.cssText = 'margin:0;font-size:1.05rem';\n  h.textContent = title;\n  const p = document.createElement('p');\n  p.style.cssText = 'margin:0;font-size:.88rem;opacity:.85';\n  p.textContent = text;\n  el.append(h, p);\n  return el;\n};\nreturn await slice.build('Grid', {\n  columns: { 0: 1, 520: 2, 700: 4 },\n  autoRows: 'minmax(130px, auto)',\n  gap: 12,\n  items: [\n    { node: tile('Components without a build step', 'Custom elements with a template, a stylesheet and a class. Open the file, change it, reload.', 'primary'), colSpan: 2, rowSpan: 2 },\n    { node: tile('Docs that run', 'Every example on these pages is live code.', 'info'), colSpan: 2 },\n    tile('Themes', 'Light, dark and your own.', 'success'),\n    tile('Translations', 'English and Spanish built in.', 'warning')\n  ]\n});\n:::\n\n:::script label=\"Regions with named areas\" expected=\"a product page: on a wide container the gallery on the left and the buy box on the right, with the description under the gallery; on a narrow one everything stacks, with the buy box right after the gallery\"\nconst block = (title, height) => {\n  const el = document.createElement('section');\n  el.style.cssText = `min-height:${height}px;padding:14px;border-radius:12px;border:1px solid var(--slice-border-raised, #ddd);box-sizing:border-box`;\n  el.textContent = title;\n  return el;\n};\nreturn await slice.build('Grid', {\n  gap: 16,\n  areas: {\n    0: ['gallery', 'buy', 'details'],\n    720: ['gallery buy', 'details buy']\n  },\n  items: [\n    { node: block('Gallery', 220), area: 'gallery' },\n    { node: block('Buy box: price, size, Add to cart', 160), area: 'buy' },\n    { node: block('Description and specifications', 140), area: 'details' }\n  ]\n});\n:::\n\n:::script label=\"Adding and removing items\" expected=\"a row of task cards with an 'Add task' button; new cards are appended, and 'Remove first' takes the first one out (and destroys it)\"\nlet n = 0;\nconst task = () => slice.build('Card', { title: `Task ${++n}`, text: 'Due Friday', variant: 'outlined' });\nconst grid = await slice.build('Grid', { minItemWidth: 180, gap: 10, items: [await task(), await task()] });\nconst bar = document.createElement('div');\nbar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';\nbar.append(\n  await slice.build('Button', { value: 'Add task', onClick: async () => { grid.items = [...grid.items, await task()]; } }),\n  await slice.build('Button', { value: 'Remove first', variant: 'outlined', onClick: () => { grid.items = grid.items.slice(1); } })\n);\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(bar, grid);\nreturn box;\n:::\n\n## Best Practices\n:::tip\nPrefer breakpoints on the grid (`columns: { 0: 1, 600: 2, 960: 4 }`) or `minItemWidth` over media queries. The same grid then works in a page, a sidebar and a modal.\n:::\n\n:::tip\nUse `colSpan` and `rowSpan` with `autoRows` for bento layouts: without a row height, a tall tile's rows are only as tall as their content.\n:::\n\n## Pitfalls\n:::warning\n`dense` and named areas change where things appear, not their order in the DOM. Keyboard focus and screen readers follow the DOM, so keep the DOM in reading order.\n:::\n\n:::warning\nAssigning `items` replaces everything. To add one, pass the old list plus the new item (`grid.items = [...grid.items, card]`) or call `setItem(card)`.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-6"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"columns\",\"type\":\"any\",\"required\":false,\"default\":\"1\",\"allowedValues\":[]},{\"path\":\"rows\",\"type\":\"number\",\"required\":false,\"default\":\"1\",\"allowedValues\":[]},{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"gap\",\"type\":\"any\",\"required\":false,\"default\":\"10px\",\"allowedValues\":[]},{\"path\":\"rowGap\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"minItemWidth\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"areas\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"autoRows\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"dense\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"align\",\"type\":\"string\",\"required\":false,\"default\":\"stretch\",\"allowedValues\":[\"stretch\",\"start\",\"center\",\"end\"]},{\"path\":\"justify\",\"type\":\"string\",\"required\":false,\"default\":\"stretch\",\"allowedValues\":[\"stretch\",\"start\",\"center\",\"end\"]},{\"path\":\"columnTemplate\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"rowTemplate\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"columns\",\"type\":\"any\",\"required\":false,\"default\":\"1\",\"allowedValues\":[]},{\"path\":\"rows\",\"type\":\"number\",\"required\":false,\"default\":\"1\",\"allowedValues\":[]},{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"gap\",\"type\":\"any\",\"required\":false,\"default\":\"10px\",\"allowedValues\":[]},{\"path\":\"rowGap\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"minItemWidth\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"areas\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"autoRows\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"dense\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"align\",\"type\":\"string\",\"required\":false,\"default\":\"stretch\",\"allowedValues\":[\"stretch\",\"start\",\"center\",\"end\"]},{\"path\":\"justify\",\"type\":\"string\",\"required\":false,\"default\":\"stretch\",\"allowedValues\":[\"stretch\",\"start\",\"center\",\"end\"]},{\"path\":\"columnTemplate\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"rowTemplate\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"DataList","path":"/docs/data/datalist"},{"text":"Table","path":"/docs/data/table"},{"text":"Layout","path":"/docs/layout/layout"}];
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

customElements.define('slice-griddocumentation', GridDocumentation);
