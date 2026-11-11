export default class SectionHeaderDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A section with a 'View all' link","expected":"a section header with the eyebrow 'Section', a title, a description and a 'View all' link on the right; below it, three cards","kind":"script","content":"const section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:24px;width:100%';\nconst cards = document.createElement('div');\ncards.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px';\nfor (const [title, text] of [['Item 1', 'A short description of the first item.'], ['Item 2', 'A short description of the second item.'], ['Item 3', 'A short description of the third item.']]) {\n  cards.append(await slice.build('Card', { title, text, variant: 'outlined' }));\n}\nsection.append(\n  await slice.build('SectionHeader', {\n    eyebrow: 'Section',\n    title: 'Section title',\n    description: 'A short description for this section.',\n    anchor: 'section',\n    actions: [{ label: 'View all', href: '/docs' }]\n  }),\n  cards\n);\nreturn section;"},{"label":"Page opening, centred, with two actions","expected":"a large centred header: eyebrow 'Section', a big title, a description, and two buttons 'Action 1' (filled) and 'Action 2' (outlined)","kind":"script","content":"const toasts = await slice.build('ToastProvider', { singleton: true });\nreturn await slice.build('SectionHeader', {\n  size: 'lg',\n  align: 'center',\n  headingLevel: 1,\n  eyebrow: 'Section',\n  title: 'Page title',\n  description: 'A short description for this page.',\n  actions: [\n    { label: 'Action 1', onClick: () => toasts.show('Action 1 selected.') },\n    { label: 'Action 2', onClick: () => toasts.show('Action 2 selected.') }\n  ]\n});"},{"label":"Small headers with a divider","expected":"two small headers with a line under each: 'Section 1' with a 'View all' link, and 'Section 2' with an outlined 'Action' button with an icon","kind":"script","content":"const toasts = await slice.build('ToastProvider', { singleton: true });\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:28px;width:100%;max-width:640px';\nbox.append(\n  await slice.build('SectionHeader', { size: 'sm', divider: true, title: 'Section 1', description: 'A short description.', actions: [{ label: 'View all', href: '/docs' }] }),\n  await slice.build('SectionHeader', { size: 'sm', divider: true, title: 'Section 2', actions: [{ label: 'Action', variant: 'outlined', icon: { name: 'user-add' }, onClick: () => toasts.show('Action selected.') }] })\n);\nreturn box;"},{"label":"Eyebrow tones","expected":"four small headers whose eyebrows are coloured accent, success, warning and neutral","kind":"script","content":"const box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:20px;width:100%';\nfor (const [tone, eyebrow] of [['accent', 'Label 1'], ['success', 'Label 2'], ['warning', 'Label 3'], ['neutral', 'Label 4']]) {\n  box.append(await slice.build('SectionHeader', { size: 'sm', tone, eyebrow, title: `${eyebrow} title` }));\n}\nreturn box;"},{"label":"Title styles: plain, underline and rule","expected":"three headers: one with no line, one with a short accent bar under the title, and one with a full line under the title","kind":"script","content":"const box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:28px;width:100%;max-width:640px';\nfor (const [titleStyle, title] of [['plain', 'Plain'], ['underline', 'Underline'], ['rule', 'Rule']]) {\n  box.append(await slice.build('SectionHeader', {\n    size: 'sm',\n    titleStyle,\n    eyebrow: 'Section',\n    title,\n    description: 'A short description for this section.'\n  }));\n}\nreturn box;"}];
  }

  async init() {
    this.markdownPath = "section-header.md";
    this.markdownContent = "---\ntitle: SectionHeader\nroute: /docs/display/section-header\nnavLabel: SectionHeader\nsection: Display\ngroup: Content\norder: 40\ndescription: The top of a section — eyebrow, a real heading, a description and actions such as \"View all\" or \"Contact me\". Start or centre aligned, three sizes, linkable with an anchor.\ncomponent: SectionHeaderDocumentation\ngenerate: true\ntags: [section, header, heading, title, eyebrow, landing, content, display]\n---\n\n# SectionHeader\n\n## Overview\n`SectionHeader` is how a section starts: a short **eyebrow** (\"Projects\"), the **title** (\"Things I have built\"), one or two lines that say what the section is about, and what to do from here (\"View all projects →\", \"Contact me\").\n\nThe title is a real heading (`h2` by default), so the page keeps an outline that screen readers and search engines can follow.\n\n### When to use it\n- **Each section of a landing or a portfolio**: services, projects, testimonials, pricing.\n- **Above a list or a grid** that needs a title and a \"View all\" link: a [FeatureList](/docs/display/feature-list), [Steps](/docs/display/steps), a grid of [Card](/docs/layout/card)s.\n- **The first section of a page** (`size: 'lg'`, `headingLevel: 1`) when the page has no other title.\n\n### When not to use it\n- **Inside a card or a form**: the card's own title, or the field's label.\n- **Headings in long text** (articles, docs): plain headings — an eyebrow and actions on every heading of an article is too much.\n- **A page frame with navigation**: [Layout](/docs/layout/layout) and [Navbar](/docs/navigation/navbar).\n\n## Core Behavior\n- `eyebrow`, `title` and `description`, all plain text.\n- `actions`: `{ label, onClick, variant, icon, disabled }` becomes a [Button](/docs/input/button) (the first `filled`, the rest `outlined` unless they say otherwise); `{ label, href, target }` becomes a **link** with an arrow, through `slice.href()` and the router for app paths.\n- `align`: `start` (default; the actions on the right, wrapping below on narrow screens) or `center` (the actions below).\n- `headingLevel` (default `2`) and `anchor` (the heading's `id`, so `/about#projects` scrolls to it).\n- The heading comes first in the DOM — heading navigation lands on the title, then reads the eyebrow — and the eyebrow is drawn above it.\n\n## Looks\n- `size`: `sm`, `md` (default) or `lg` (the first section of a page). The title scales with the viewport between limits.\n- `tone`: the colour of the eyebrow (`accent` by default). `divider`: a line under the whole header.\n- `titleStyle`: `plain` (default), `underline` (a short accent bar under the title) or `rule` (a full line under the title). Use it when the line belongs to the title, like a portfolio section, instead of separating the whole header.\n- CSS variables: `--slice-section-header-title` (the title's size), `--slice-section-header-measure` (the text's maximum width).\n\n## Live Preview\n:::component name=\"SectionHeader\"\n{\n  \"eyebrow\": \"Section\",\n  \"title\": \"Section title\",\n  \"description\": \"A short description for this section.\",\n  \"titleStyle\": \"underline\",\n  \"actions\": [{ \"label\": \"View all\", \"href\": \"/docs\" }]\n}\n:::\n\n## Examples\n:::script label=\"A section with a 'View all' link\" expected=\"a section header with the eyebrow 'Section', a title, a description and a 'View all' link on the right; below it, three cards\"\nconst section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:24px;width:100%';\nconst cards = document.createElement('div');\ncards.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px';\nfor (const [title, text] of [['Item 1', 'A short description of the first item.'], ['Item 2', 'A short description of the second item.'], ['Item 3', 'A short description of the third item.']]) {\n  cards.append(await slice.build('Card', { title, text, variant: 'outlined' }));\n}\nsection.append(\n  await slice.build('SectionHeader', {\n    eyebrow: 'Section',\n    title: 'Section title',\n    description: 'A short description for this section.',\n    anchor: 'section',\n    actions: [{ label: 'View all', href: '/docs' }]\n  }),\n  cards\n);\nreturn section;\n:::\n\n:::script label=\"Page opening, centred, with two actions\" expected=\"a large centred header: eyebrow 'Section', a big title, a description, and two buttons 'Action 1' (filled) and 'Action 2' (outlined)\"\nconst toasts = await slice.build('ToastProvider', { singleton: true });\nreturn await slice.build('SectionHeader', {\n  size: 'lg',\n  align: 'center',\n  headingLevel: 1,\n  eyebrow: 'Section',\n  title: 'Page title',\n  description: 'A short description for this page.',\n  actions: [\n    { label: 'Action 1', onClick: () => toasts.show('Action 1 selected.') },\n    { label: 'Action 2', onClick: () => toasts.show('Action 2 selected.') }\n  ]\n});\n:::\n\n:::script label=\"Small headers with a divider\" expected=\"two small headers with a line under each: 'Section 1' with a 'View all' link, and 'Section 2' with an outlined 'Action' button with an icon\"\nconst toasts = await slice.build('ToastProvider', { singleton: true });\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:28px;width:100%;max-width:640px';\nbox.append(\n  await slice.build('SectionHeader', { size: 'sm', divider: true, title: 'Section 1', description: 'A short description.', actions: [{ label: 'View all', href: '/docs' }] }),\n  await slice.build('SectionHeader', { size: 'sm', divider: true, title: 'Section 2', actions: [{ label: 'Action', variant: 'outlined', icon: { name: 'user-add' }, onClick: () => toasts.show('Action selected.') }] })\n);\nreturn box;\n:::\n\n:::script label=\"Eyebrow tones\" expected=\"four small headers whose eyebrows are coloured accent, success, warning and neutral\"\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:20px;width:100%';\nfor (const [tone, eyebrow] of [['accent', 'Label 1'], ['success', 'Label 2'], ['warning', 'Label 3'], ['neutral', 'Label 4']]) {\n  box.append(await slice.build('SectionHeader', { size: 'sm', tone, eyebrow, title: `${eyebrow} title` }));\n}\nreturn box;\n:::\n\n:::script label=\"Title styles: plain, underline and rule\" expected=\"three headers: one with no line, one with a short accent bar under the title, and one with a full line under the title\"\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:28px;width:100%;max-width:640px';\nfor (const [titleStyle, title] of [['plain', 'Plain'], ['underline', 'Underline'], ['rule', 'Rule']]) {\n  box.append(await slice.build('SectionHeader', {\n    size: 'sm',\n    titleStyle,\n    eyebrow: 'Section',\n    title,\n    description: 'A short description for this section.'\n  }));\n}\nreturn box;\n:::\n\n## Best Practices\n:::tip\nOne `h1` per page. Sections use `h2` (the default); the items inside them — a FeatureList, Steps — use `h3`.\n:::\n\n:::tip\nUse a link for \"View all\" and a button for an action. A link goes somewhere (it can open in a new tab); a button does something here.\n:::\n\n## Pitfalls\n:::warning\nKeep the eyebrow to one or two words. It labels the section; it is not a second title.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            let props = {};
            if ("{\n  \"eyebrow\": \"Section\",\n  \"title\": \"Section title\",\n  \"description\": \"A short description for this section.\",\n  \"titleStyle\": \"underline\",\n  \"actions\": [{ \"label\": \"View all\", \"href\": \"/docs\" }]\n}") {
               try {
                  props = JSON.parse("{\n  \"eyebrow\": \"Section\",\n  \"title\": \"Section title\",\n  \"description\": \"A short description for this section.\",\n  \"titleStyle\": \"underline\",\n  \"actions\": [{ \"label\": \"View all\", \"href\": \"/docs\" }]\n}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('SectionHeader', props);
            container.appendChild(component);
         }
       }
      {
         const container = this.querySelector('[data-block-id="doc-block-7"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"eyebrow\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"title\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"description\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"actions\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"align\",\"type\":\"string\",\"required\":false,\"default\":\"start\",\"allowedValues\":[\"start\",\"center\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\",\"lg\"]},{\"path\":\"headingLevel\",\"type\":\"number\",\"required\":false,\"default\":\"2\",\"allowedValues\":[]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"divider\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"titleStyle\",\"type\":\"string\",\"required\":false,\"default\":\"plain\",\"allowedValues\":[\"plain\",\"underline\",\"rule\"]},{\"path\":\"anchor\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"eyebrow\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"title\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"description\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"actions\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"align\",\"type\":\"string\",\"required\":false,\"default\":\"start\",\"allowedValues\":[\"start\",\"center\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\",\"lg\"]},{\"path\":\"headingLevel\",\"type\":\"number\",\"required\":false,\"default\":\"2\",\"allowedValues\":[]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"divider\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"titleStyle\",\"type\":\"string\",\"required\":false,\"default\":\"plain\",\"allowedValues\":[\"plain\",\"underline\",\"rule\"]},{\"path\":\"anchor\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"FeatureList","path":"/docs/display/feature-list"},{"text":"Steps","path":"/docs/display/steps"},{"text":"Card","path":"/docs/layout/card"},{"text":"Layout","path":"/docs/layout/layout"},{"text":"Navbar","path":"/docs/navigation/navbar"},{"text":"Button","path":"/docs/input/button"}];
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

customElements.define('slice-sectionheaderdocumentation', SectionHeaderDocumentation);
