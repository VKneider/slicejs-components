export default class CalloutDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A lesson with a definition, a tip and a warning","expected":"a short lesson about an example topic: a paragraph, an accent callout 'Definition' explaining the term, a list of three items, a green callout 'Tip' with an inline code example, and a warning 'Common mistake' at the end","kind":"script","content":"const article = document.createElement('article');\narticle.style.cssText = 'display:grid;gap:14px;width:100%;max-width:640px;line-height:1.6';\n\nconst h = document.createElement('h3');\nh.textContent = 'Example topic';\nh.style.margin = '0';\nconst intro = document.createElement('p');\nintro.style.margin = '0';\nintro.textContent = 'An introductory sentence that explains the topic of this example.';\n\nconst definition = await slice.build('Callout', {\n  tone: 'accent', icon: 'book-open', title: 'Definition',\n  text: 'A definition explains the term used on this page in one or two sentences.'\n});\n\nconst list = document.createElement('ul');\nlist.style.cssText = 'margin:0;padding-left:1.2em';\nfor (const [item, meaning] of [['Item 1', 'Description of the first item'], ['Item 2', 'Description of the second item'], ['Item 3', 'Description of the third item']]) {\n  const li = document.createElement('li');\n  const b = document.createElement('code');\n  b.textContent = item;\n  li.append(b, ` ${meaning}`);\n  list.append(li);\n}\n\nconst command = document.createElement('p');\ncommand.textContent = 'An inline example: ';\nconst code = document.createElement('code');\ncode.textContent = 'example --flag value';\ncommand.append(code);\nconst tip = await slice.build('Callout', { tone: 'success', icon: 'lightbulb', title: 'Tip', content: command });\n\nconst mistake = await slice.build('Callout', {\n  tone: 'warning', title: 'Common mistake',\n  text: 'A warning about a common mistake and how to avoid it.'\n});\n\narticle.append(h, intro, definition, list, tip, mistake);\nreturn article;"},{"label":"Before a destructive step","expected":"a settings panel titled 'Delete item'; a danger callout explains what will be lost with a list of three items and a link to export data; below it an input to type the item name and a Delete button that stays disabled until the name matches","kind":"script","content":"const panel = document.createElement('section');\npanel.style.cssText = 'display:grid;gap:14px;width:100%;max-width:520px';\nconst title = document.createElement('h3');\ntitle.textContent = 'Delete item';\ntitle.style.margin = '0';\n\nconst lost = document.createElement('ul');\nfor (const text of ['All related records', 'Every user’s access', 'Any exported copies']) {\n  const li = document.createElement('li');\n  li.textContent = text;\n  lost.append(li);\n}\nconst exportLink = document.createElement('a');\nexportLink.href = '#export';\nexportLink.textContent = 'Export your data first';\nconst warning = await slice.build('Callout', {\n  tone: 'danger', variant: 'outlined', title: 'This cannot be undone',\n  content: [lost, exportLink]\n});\n\nconst name = await slice.build('Input', { label: 'Type \"example-item\" to confirm', placeholder: 'example-item' });\nconst remove = await slice.build('Button', { value: 'Delete item', variant: 'danger', disabled: true });\nname.addEventListener('input', () => { remove.disabled = name.value !== 'example-item'; });\n\npanel.append(title, warning, name, remove);\nreturn panel;"},{"label":"Long text: ghost callouts in an article","expected":"an article paragraph followed by two ghost callouts (only a coloured side bar, no box): an info 'Note' and a neutral quote-like aside without icon","kind":"script","content":"const article = document.createElement('article');\narticle.style.cssText = 'display:grid;gap:14px;width:100%;max-width:640px;line-height:1.7';\nconst p = document.createElement('p');\np.style.margin = '0';\np.textContent = 'A paragraph of example text that introduces the topic and sets up the callouts below.';\narticle.append(\n  p,\n  await slice.build('Callout', { variant: 'ghost', title: 'Note', text: 'A note about how this example is built.' }),\n  await slice.build('Callout', { variant: 'ghost', tone: 'neutral', icon: false, text: 'In short: a short summary of the note.' })\n);\nreturn article;"},{"label":"Tones and variants","expected":"a grid with the six tones in soft, outlined and ghost","kind":"script","content":"const grid = document.createElement('div');\ngrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;width:100%';\nfor (const variant of ['soft', 'outlined', 'ghost']) {\n  for (const tone of ['neutral', 'accent', 'info', 'success', 'warning', 'danger']) {\n    grid.append(await slice.build('Callout', { tone, variant, size: 'sm', title: `${tone} · ${variant}`, text: 'A short passage.' }));\n  }\n}\nreturn grid;"}];
  }

  async init() {
    this.markdownPath = "callout.md";
    this.markdownContent = "---\ntitle: Callout\nroute: /docs/display/callout\nnavLabel: Callout\nsection: Display\ngroup: Content\norder: 42\ndescription: A highlighted passage inside content — a note, a tip, a warning before a step, a definition. Tone for the meaning, variant for the loudness; part of what the page says, never a live region.\ncomponent: CalloutDocumentation\ngenerate: true\ntags: [callout, note, tip, admonition, warning, content, display]\n---\n\n# Callout\n\n## Overview\n`Callout` highlights a passage inside content: \"Note: grades are published on Fridays\", \"Tip: press ? to see every shortcut\", \"Before you start, back up your database\", the definition of a term in a lesson. It is part of what the page **says**, like a paragraph — it does not report that something just happened.\n\nTwo choices, as in [Alert](/docs/feedback/alert) and [Badge](/docs/display/badge):\n\n- **`tone`** is what it **means**: `neutral`, `accent`, `info` (the default), `success`, `warning`, `danger`. Each has its icon (`neutral` has none).\n- **`variant`** is how **loud** it is: `soft` (a tint and a side bar, the default), `outlined`, or `ghost` (only the bar, for long texts where boxes would be too much).\n\n### When to use it\n- **Notes and tips in documentation, lessons and articles**: something the reader should not miss while reading.\n- **A warning before a step**: \"This deletes every row. Export them first.\"\n- **A definition or a key idea** in course material.\n- **Conditions next to an offer**: \"Prices in USD. Taxes are added at checkout.\"\n\n### When not to use it\n- **The result of something the user did** (saved, failed, undo): an [Alert](/docs/feedback/alert). It is a live region, so screen readers announce it; a Callout is read in its place, like the text around it.\n- **Something that happened elsewhere or should float**: a [Toast](/docs/feedback/toast).\n- **Content that folds open** (FAQ, details): [Details](/docs/layout/details).\n- **Every other paragraph**. A page full of callouts has nothing highlighted.\n\n## Core Behavior\n- `title` (a short bold label: \"Note\", \"Before you start\"), `text` (one paragraph) and `content` for more: a string (another paragraph), a node, a component, or an array of them. Strings are always text, never markup.\n- `icon`: `''` uses the tone's icon, an Icon name (or `{ name }`) replaces it, `false` removes it.\n- `role=\"note\"`, named by its title; never `aria-live`. The icon is decorative: say the meaning in the title, not only with the colour.\n- Components in `content` are destroyed when the content is replaced and when the callout is destroyed.\n\n## Looks\n- `size`: `'md'` (default) or `'sm'`.\n- Same tone tokens as Alert and Badge (`--success-color-readable`…), so a theme that tunes one tunes all of them. Per-instance spacing: `--slice-callout-pad-x`, `--slice-callout-pad-y`, `--slice-callout-bar`, `--slice-callout-radius`.\n\n## Live Preview\n:::component name=\"Callout\"\n{\n  \"tone\": \"info\",\n  \"title\": \"Note\",\n  \"text\": \"A short note that highlights something important.\"\n}\n:::\n\n## Examples\n:::script label=\"A lesson with a definition, a tip and a warning\" expected=\"a short lesson about an example topic: a paragraph, an accent callout 'Definition' explaining the term, a list of three items, a green callout 'Tip' with an inline code example, and a warning 'Common mistake' at the end\"\nconst article = document.createElement('article');\narticle.style.cssText = 'display:grid;gap:14px;width:100%;max-width:640px;line-height:1.6';\n\nconst h = document.createElement('h3');\nh.textContent = 'Example topic';\nh.style.margin = '0';\nconst intro = document.createElement('p');\nintro.style.margin = '0';\nintro.textContent = 'An introductory sentence that explains the topic of this example.';\n\nconst definition = await slice.build('Callout', {\n  tone: 'accent', icon: 'book-open', title: 'Definition',\n  text: 'A definition explains the term used on this page in one or two sentences.'\n});\n\nconst list = document.createElement('ul');\nlist.style.cssText = 'margin:0;padding-left:1.2em';\nfor (const [item, meaning] of [['Item 1', 'Description of the first item'], ['Item 2', 'Description of the second item'], ['Item 3', 'Description of the third item']]) {\n  const li = document.createElement('li');\n  const b = document.createElement('code');\n  b.textContent = item;\n  li.append(b, ` ${meaning}`);\n  list.append(li);\n}\n\nconst command = document.createElement('p');\ncommand.textContent = 'An inline example: ';\nconst code = document.createElement('code');\ncode.textContent = 'example --flag value';\ncommand.append(code);\nconst tip = await slice.build('Callout', { tone: 'success', icon: 'lightbulb', title: 'Tip', content: command });\n\nconst mistake = await slice.build('Callout', {\n  tone: 'warning', title: 'Common mistake',\n  text: 'A warning about a common mistake and how to avoid it.'\n});\n\narticle.append(h, intro, definition, list, tip, mistake);\nreturn article;\n:::\n\n:::script label=\"Before a destructive step\" expected=\"a settings panel titled 'Delete item'; a danger callout explains what will be lost with a list of three items and a link to export data; below it an input to type the item name and a Delete button that stays disabled until the name matches\"\nconst panel = document.createElement('section');\npanel.style.cssText = 'display:grid;gap:14px;width:100%;max-width:520px';\nconst title = document.createElement('h3');\ntitle.textContent = 'Delete item';\ntitle.style.margin = '0';\n\nconst lost = document.createElement('ul');\nfor (const text of ['All related records', 'Every user’s access', 'Any exported copies']) {\n  const li = document.createElement('li');\n  li.textContent = text;\n  lost.append(li);\n}\nconst exportLink = document.createElement('a');\nexportLink.href = '#export';\nexportLink.textContent = 'Export your data first';\nconst warning = await slice.build('Callout', {\n  tone: 'danger', variant: 'outlined', title: 'This cannot be undone',\n  content: [lost, exportLink]\n});\n\nconst name = await slice.build('Input', { label: 'Type \"example-item\" to confirm', placeholder: 'example-item' });\nconst remove = await slice.build('Button', { value: 'Delete item', variant: 'danger', disabled: true });\nname.addEventListener('input', () => { remove.disabled = name.value !== 'example-item'; });\n\npanel.append(title, warning, name, remove);\nreturn panel;\n:::\n\n:::script label=\"Long text: ghost callouts in an article\" expected=\"an article paragraph followed by two ghost callouts (only a coloured side bar, no box): an info 'Note' and a neutral quote-like aside without icon\"\nconst article = document.createElement('article');\narticle.style.cssText = 'display:grid;gap:14px;width:100%;max-width:640px;line-height:1.7';\nconst p = document.createElement('p');\np.style.margin = '0';\np.textContent = 'A paragraph of example text that introduces the topic and sets up the callouts below.';\narticle.append(\n  p,\n  await slice.build('Callout', { variant: 'ghost', title: 'Note', text: 'A note about how this example is built.' }),\n  await slice.build('Callout', { variant: 'ghost', tone: 'neutral', icon: false, text: 'In short: a short summary of the note.' })\n);\nreturn article;\n:::\n\n:::script label=\"Tones and variants\" expected=\"a grid with the six tones in soft, outlined and ghost\"\nconst grid = document.createElement('div');\ngrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;width:100%';\nfor (const variant of ['soft', 'outlined', 'ghost']) {\n  for (const tone of ['neutral', 'accent', 'info', 'success', 'warning', 'danger']) {\n    grid.append(await slice.build('Callout', { tone, variant, size: 'sm', title: `${tone} · ${variant}`, text: 'A short passage.' }));\n  }\n}\nreturn grid;\n:::\n\n## Best Practices\n:::tip\nName it: a title such as \"Note\", \"Tip\" or \"Before you start\" is what a screen reader announces, and what a skimming reader sees first.\n:::\n\n:::tip\nUse `ghost` in long texts. A thin bar marks the passage without breaking the reading rhythm.\n:::\n\n## Pitfalls\n:::warning\nA Callout is not feedback. If the text appears because something just happened (a save, an error), use an Alert so assistive technology announces it.\n:::\n\n:::warning\nDo not rely on colour. \"Warning\" in the title says what the yellow means to everyone.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            let props = {};
            if ("{\n  \"tone\": \"info\",\n  \"title\": \"Note\",\n  \"text\": \"A short note that highlights something important.\"\n}") {
               try {
                  props = JSON.parse("{\n  \"tone\": \"info\",\n  \"title\": \"Note\",\n  \"text\": \"A short note that highlights something important.\"\n}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('Callout', props);
            container.appendChild(component);
         }
       }
      {
         const container = this.querySelector('[data-block-id="doc-block-6"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"info\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"soft\",\"allowedValues\":[\"soft\",\"outlined\",\"ghost\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"title\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"text\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"content\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"icon\",\"type\":\"any\",\"required\":false,\"default\":\"\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"info\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"soft\",\"allowedValues\":[\"soft\",\"outlined\",\"ghost\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"title\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"text\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"content\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"icon\",\"type\":\"any\",\"required\":false,\"default\":\"\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"Alert","path":"/docs/feedback/alert"},{"text":"Badge","path":"/docs/display/badge"},{"text":"Alert","path":"/docs/feedback/alert"},{"text":"Toast","path":"/docs/feedback/toast"},{"text":"Details","path":"/docs/layout/details"}];
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

customElements.define('slice-calloutdocumentation', CalloutDocumentation);
