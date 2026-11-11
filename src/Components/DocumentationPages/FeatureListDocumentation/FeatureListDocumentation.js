export default class FeatureListDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A section with a FeatureList and a SectionHeader","expected":"a section with the eyebrow 'Section', the title 'Section title' and an 'Action' button; below, six items in three columns with an icon each; 'Item 1' has a 'New' badge","kind":"script","content":"const section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:28px;width:100%';\nconst toasts = await slice.build('ToastProvider', { singleton: true });\nsection.append(\n  await slice.build('SectionHeader', {\n    eyebrow: 'Section',\n    title: 'Section title',\n    description: 'A short description for this section.',\n    actions: [{ label: 'Action', onClick: () => toasts.show('Action selected.') }]\n  }),\n  await slice.build('FeatureList', {\n    columns: 3,\n    items: [\n      { icon: 'layers', title: 'Item 1', badge: 'New', text: 'A short description of the first item.' },\n      { icon: 'code-branch', title: 'Item 2', text: 'A short description of the second item.' },\n      { icon: 'users-group', title: 'Item 3', text: 'A short description of the third item.' },\n      { icon: 'rocket', title: 'Item 4', text: 'A short description of the fourth item.' },\n      { icon: 'chart-line-up', title: 'Item 5', text: 'A short description of the fifth item.' },\n      { icon: 'life-saver', title: 'Item 6', text: 'A short description of the sixth item.' }\n    ]\n  })\n);\nreturn section;"},{"label":"What a plan includes (compact checklist)","expected":"a pricing box for the 'Plan' plan: price and a short description, then a compact list in two columns of nine included features, each with a small green check","kind":"script","content":"const plan = document.createElement('div');\nplan.style.cssText = 'display:grid;gap:16px;box-sizing:border-box;width:100%;max-width:620px;padding:24px;border-radius:16px;border:1px solid color-mix(in srgb, currentColor 14%, transparent)';\nconst head = document.createElement('div');\nconst name = document.createElement('h3');\nname.textContent = 'Plan — $0 / month';\nname.style.margin = '0';\nconst desc = document.createElement('p');\ndesc.textContent = 'A short description of the plan.';\ndesc.style.cssText = 'margin:4px 0 0;opacity:.75';\nhead.append(name, desc);\nconst included = ['Included feature 1', 'Included feature 2', 'Included feature 3', 'Included feature 4', 'Included feature 5', 'Included feature 6', 'Included feature 7', 'Included feature 8', 'Included feature 9'];\nplan.append(head, await slice.build('FeatureList', {\n  layout: 'compact', tone: 'success', minItemWidth: '230px', headingLevel: 4,\n  ariaLabel: 'Included in Plan',\n  items: included.map((title) => ({ icon: 'check', title }))\n}));\nreturn plan;"},{"label":"Links to the parts of a site","expected":"three outlined items 'Page 1', 'Page 2' and 'Page 3' with an icon and a sentence; the whole item is clickable and opens the page through the router; 'Page 3' opens an external page in a new tab","kind":"script","content":"return await slice.build('FeatureList', {\n  variant: 'outlined',\n  layout: 'list',\n  columns: 3,\n  minItemWidth: '220px',\n  items: [\n    { icon: 'book-open', title: 'Page 1', text: 'A short description of the first page.', href: '/docs' },\n    { icon: 'lightbulb', title: 'Page 2', text: 'A short description of the second page.', href: '/docs/guides/data-and-loading' },\n    { icon: 'github', title: 'Page 3', text: 'A short description of the third page.', href: 'https://github.com/VKneider/slicejs-components/releases', target: '_blank' }\n  ]\n});"},{"label":"Centred items, with something more per item","expected":"four centred items with soft surfaces; each has a small line with its number of lessons below the text","kind":"script","content":"const lessons = (n) => {\n  const p = document.createElement('p');\n  p.textContent = `${n} lessons`;\n  p.style.cssText = 'margin:0;font-size:.8rem;font-weight:600;opacity:.7';\n  return p;\n};\nreturn await slice.build('FeatureList', {\n  align: 'center',\n  variant: 'soft',\n  columns: 4,\n  minItemWidth: '160px',\n  items: [\n    { icon: 'globe', title: 'Topic 1', text: 'A short description of the first topic.', content: lessons(4) },\n    { icon: 'html', title: 'Topic 2', text: 'A short description of the second topic.', content: lessons(6) },\n    { icon: 'css', title: 'Topic 3', text: 'A short description of the third topic.', content: lessons(7) },\n    { icon: 'javascript', title: 'Topic 4', text: 'A short description of the fourth topic.', content: lessons(9) }\n  ]\n});"}];
  }

  async init() {
    this.markdownPath = "feature-list.md";
    this.markdownContent = "---\ntitle: FeatureList\nroute: /docs/display/feature-list\nnavLabel: FeatureList\nsection: Display\ngroup: Content\norder: 41\ndescription: What something offers, item by item — an icon, a title and a sentence on one grid. Services, benefits, what a plan includes, a course's topics. Information, not a set of cards.\ncomponent: FeatureListDocumentation\ngenerate: true\ntags: [features, benefits, services, grid, list, landing, content, display]\n---\n\n# FeatureList\n\n## Overview\n`FeatureList` lays out what something offers: the services of a studio, why a product is worth it, what a plan includes, the topics of a course. Each item is an icon, a title (a real heading) and a sentence, all on one grid with one rhythm.\n\nIt is information, not cards: by default the items have no surface, no border and no click target. Give an item an `href` and its title becomes a link that covers the item.\n\n### When to use it\n- **Services, benefits, \"why us\"** on a landing or a portfolio.\n- **What a plan or a course includes**, as a checklist in columns (`layout: 'compact'`).\n- **Links to the parts of a site**, each with a sentence (\"Docs\", \"Guides\", \"API\") — add `href`.\n- **Facts about a product** that read as a list rather than as a table.\n\n### When not to use it\n- **Things you open, compare or select, with images or actions each**: a grid of [Card](/docs/layout/card).\n- **Records with search, sort or selection**: [DataList](/docs/data/datalist).\n- **A process in order**: [Steps](/docs/display/steps).\n- **Key and value pairs** (Email: …, Plan: …): [DescriptionList](/docs/data/description-list).\n\n## Core Behavior\n- `items: [{ title, text, icon, badge, href, target, content, id }]`. `icon` is an Icon name or `{ name }`; `badge` is a short label next to the title (\"New\"); `content` takes more (a string, a node, a component or an array).\n- `layout`: `grid` (icon on top, the default), `list` (icon at the start; one item per row unless you give `columns`) or `compact` (a small icon at the start, in columns — for long checklists).\n- `columns`: `0` (default) puts as many as fit, each at least `minItemWidth` wide (`'220px'`). A number is a **maximum**: on a narrow screen the items still wrap.\n- `href` makes the title a real `<a>` (through `slice.href()`, so it keeps the locale prefix) stretched over the whole item; a plain click on an app path goes through the router, and Ctrl/⌘-click opens a new tab as usual. `target: '_blank'` adds `rel=\"noopener\"`.\n- `onItemClick(item, { index, event })`: items without `href` become buttons. It also dispatches `item-click`.\n- `headingLevel` (default `3`): the level of each title, under the section's own heading. Pair it with a [SectionHeader](/docs/display/section-header) (an `h2`).\n- `<ul role=\"list\">`, one focusable target per item, decorative icons. Text is always text.\n\n## Looks\n- `variant`: `plain` (default, no surface), `soft` (a tint) or `outlined` (a border).\n- `tone`: the colour of the icons (`accent` by default). `align`: `start` or `center` (centred items in `grid`). `size`: `md` or `sm`.\n- CSS variables: `--slice-feature-list-gap-x`, `--slice-feature-list-gap-y`, `--slice-feature-list-icon-box`, `--slice-feature-list-radius`.\n\n## Live Preview\n:::component name=\"FeatureList\"\n{\n  \"columns\": 3,\n  \"items\": [\n    { \"icon\": \"rocket\", \"title\": \"Feature 1\", \"text\": \"A short description of the first feature.\" },\n    { \"icon\": \"shield-check\", \"title\": \"Feature 2\", \"text\": \"A short description of the second feature.\" },\n    { \"icon\": \"users-group\", \"title\": \"Feature 3\", \"text\": \"A short description of the third feature.\" }\n  ]\n}\n:::\n\n## Examples\n:::script label=\"A section with a FeatureList and a SectionHeader\" expected=\"a section with the eyebrow 'Section', the title 'Section title' and an 'Action' button; below, six items in three columns with an icon each; 'Item 1' has a 'New' badge\"\nconst section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:28px;width:100%';\nconst toasts = await slice.build('ToastProvider', { singleton: true });\nsection.append(\n  await slice.build('SectionHeader', {\n    eyebrow: 'Section',\n    title: 'Section title',\n    description: 'A short description for this section.',\n    actions: [{ label: 'Action', onClick: () => toasts.show('Action selected.') }]\n  }),\n  await slice.build('FeatureList', {\n    columns: 3,\n    items: [\n      { icon: 'layers', title: 'Item 1', badge: 'New', text: 'A short description of the first item.' },\n      { icon: 'code-branch', title: 'Item 2', text: 'A short description of the second item.' },\n      { icon: 'users-group', title: 'Item 3', text: 'A short description of the third item.' },\n      { icon: 'rocket', title: 'Item 4', text: 'A short description of the fourth item.' },\n      { icon: 'chart-line-up', title: 'Item 5', text: 'A short description of the fifth item.' },\n      { icon: 'life-saver', title: 'Item 6', text: 'A short description of the sixth item.' }\n    ]\n  })\n);\nreturn section;\n:::\n\n:::script label=\"What a plan includes (compact checklist)\" expected=\"a pricing box for the 'Plan' plan: price and a short description, then a compact list in two columns of nine included features, each with a small green check\"\nconst plan = document.createElement('div');\nplan.style.cssText = 'display:grid;gap:16px;box-sizing:border-box;width:100%;max-width:620px;padding:24px;border-radius:16px;border:1px solid color-mix(in srgb, currentColor 14%, transparent)';\nconst head = document.createElement('div');\nconst name = document.createElement('h3');\nname.textContent = 'Plan — $0 / month';\nname.style.margin = '0';\nconst desc = document.createElement('p');\ndesc.textContent = 'A short description of the plan.';\ndesc.style.cssText = 'margin:4px 0 0;opacity:.75';\nhead.append(name, desc);\nconst included = ['Included feature 1', 'Included feature 2', 'Included feature 3', 'Included feature 4', 'Included feature 5', 'Included feature 6', 'Included feature 7', 'Included feature 8', 'Included feature 9'];\nplan.append(head, await slice.build('FeatureList', {\n  layout: 'compact', tone: 'success', minItemWidth: '230px', headingLevel: 4,\n  ariaLabel: 'Included in Plan',\n  items: included.map((title) => ({ icon: 'check', title }))\n}));\nreturn plan;\n:::\n\n:::script label=\"Links to the parts of a site\" expected=\"three outlined items 'Page 1', 'Page 2' and 'Page 3' with an icon and a sentence; the whole item is clickable and opens the page through the router; 'Page 3' opens an external page in a new tab\"\nreturn await slice.build('FeatureList', {\n  variant: 'outlined',\n  layout: 'list',\n  columns: 3,\n  minItemWidth: '220px',\n  items: [\n    { icon: 'book-open', title: 'Page 1', text: 'A short description of the first page.', href: '/docs' },\n    { icon: 'lightbulb', title: 'Page 2', text: 'A short description of the second page.', href: '/docs/guides/data-and-loading' },\n    { icon: 'github', title: 'Page 3', text: 'A short description of the third page.', href: 'https://github.com/VKneider/slicejs-components/releases', target: '_blank' }\n  ]\n});\n:::\n\n:::script label=\"Centred items, with something more per item\" expected=\"four centred items with soft surfaces; each has a small line with its number of lessons below the text\"\nconst lessons = (n) => {\n  const p = document.createElement('p');\n  p.textContent = `${n} lessons`;\n  p.style.cssText = 'margin:0;font-size:.8rem;font-weight:600;opacity:.7';\n  return p;\n};\nreturn await slice.build('FeatureList', {\n  align: 'center',\n  variant: 'soft',\n  columns: 4,\n  minItemWidth: '160px',\n  items: [\n    { icon: 'globe', title: 'Topic 1', text: 'A short description of the first topic.', content: lessons(4) },\n    { icon: 'html', title: 'Topic 2', text: 'A short description of the second topic.', content: lessons(6) },\n    { icon: 'css', title: 'Topic 3', text: 'A short description of the third topic.', content: lessons(7) },\n    { icon: 'javascript', title: 'Topic 4', text: 'A short description of the fourth topic.', content: lessons(9) }\n  ]\n});\n:::\n\n## Best Practices\n:::tip\nKeep titles short and parallel (\"Fast setup\", \"Private by default\") and the sentence to one or two lines. If an item needs a paragraph, it is a section of its own.\n:::\n\n:::tip\nPut a [SectionHeader](/docs/display/section-header) right before it: the header is the `h2`, the items are `h3` (the default), and the page keeps a clean outline.\n:::\n\n## Pitfalls\n:::warning\nDo not turn every item into a link just to make it \"interactive\". A link that leads to a page that only repeats the sentence is noise.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            let props = {};
            if ("{\n  \"columns\": 3,\n  \"items\": [\n    { \"icon\": \"rocket\", \"title\": \"Feature 1\", \"text\": \"A short description of the first feature.\" },\n    { \"icon\": \"shield-check\", \"title\": \"Feature 2\", \"text\": \"A short description of the second feature.\" },\n    { \"icon\": \"users-group\", \"title\": \"Feature 3\", \"text\": \"A short description of the third feature.\" }\n  ]\n}") {
               try {
                  props = JSON.parse("{\n  \"columns\": 3,\n  \"items\": [\n    { \"icon\": \"rocket\", \"title\": \"Feature 1\", \"text\": \"A short description of the first feature.\" },\n    { \"icon\": \"shield-check\", \"title\": \"Feature 2\", \"text\": \"A short description of the second feature.\" },\n    { \"icon\": \"users-group\", \"title\": \"Feature 3\", \"text\": \"A short description of the third feature.\" }\n  ]\n}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('FeatureList', props);
            container.appendChild(component);
         }
       }
      {
         const container = this.querySelector('[data-block-id="doc-block-6"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"layout\",\"type\":\"string\",\"required\":false,\"default\":\"grid\",\"allowedValues\":[\"grid\",\"list\",\"compact\"]},{\"path\":\"columns\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"minItemWidth\",\"type\":\"string\",\"required\":false,\"default\":\"220px\",\"allowedValues\":[]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"plain\",\"allowedValues\":[\"plain\",\"soft\",\"outlined\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"align\",\"type\":\"string\",\"required\":false,\"default\":\"start\",\"allowedValues\":[\"start\",\"center\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"headingLevel\",\"type\":\"number\",\"required\":false,\"default\":\"3\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"onItemClick\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"layout\",\"type\":\"string\",\"required\":false,\"default\":\"grid\",\"allowedValues\":[\"grid\",\"list\",\"compact\"]},{\"path\":\"columns\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"minItemWidth\",\"type\":\"string\",\"required\":false,\"default\":\"220px\",\"allowedValues\":[]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"plain\",\"allowedValues\":[\"plain\",\"soft\",\"outlined\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"align\",\"type\":\"string\",\"required\":false,\"default\":\"start\",\"allowedValues\":[\"start\",\"center\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"headingLevel\",\"type\":\"number\",\"required\":false,\"default\":\"3\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"onItemClick\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"Card","path":"/docs/layout/card"},{"text":"DataList","path":"/docs/data/datalist"},{"text":"Steps","path":"/docs/display/steps"},{"text":"DescriptionList","path":"/docs/data/description-list"},{"text":"SectionHeader","path":"/docs/display/section-header"},{"text":"SectionHeader","path":"/docs/display/section-header"}];
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

customElements.define('slice-featurelistdocumentation', FeatureListDocumentation);
