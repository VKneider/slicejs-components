export default class StepsDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"How it works, on a landing","expected":"a centred section header 'How it works' followed by three horizontal steps with filled numbered markers joined by a line; when the preview is narrow they stack vertically","kind":"script","content":"const section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:28px;width:100%';\nsection.append(\n  await slice.build('SectionHeader', {\n    align: 'center',\n    eyebrow: 'How it works',\n    title: 'From start to result in three steps',\n    description: 'A short description for this process.'\n  }),\n  await slice.build('Steps', {\n    orientation: 'horizontal',\n    variant: 'filled',\n    items: [\n      { title: 'Step 1', text: 'A short description of the first step.' },\n      { title: 'Step 2', text: 'A short description of the second step.' },\n      { title: 'Step 3', text: 'A short description of the third step.' }\n    ]\n  })\n);\nreturn section;"},{"label":"Instructions with commands","expected":"four vertical steps with icon markers; steps 1 to 3 contain a dark code line (command 1, command 2, command 3) and step 4 contains an info callout about the result","kind":"script","content":"const command = (text) => {\n  const pre = document.createElement('pre');\n  pre.style.cssText = 'margin:0;padding:10px 12px;border-radius:8px;background:#1d1b29;color:#f4f2ff;font-size:.85rem;overflow:auto';\n  const code = document.createElement('code');\n  code.style.cssText = 'background:none;padding:0;color:inherit';\n  code.textContent = text;\n  pre.append(code);\n  return pre;\n};\nreturn await slice.build('Steps', {\n  marker: 'icon',\n  items: [\n    { icon: 'download', title: 'Step 1', text: 'A short description of the first step.', content: command('command-1') },\n    { icon: 'folder-plus', title: 'Step 2', text: 'A short description of the second step.', content: command('command-2') },\n    { icon: 'terminal', title: 'Step 3', text: 'A short description of the third step.', content: command('command-3') },\n    {\n      icon: 'globe', title: 'Step 4',\n      content: await slice.build('Callout', { tone: 'info', size: 'sm', text: 'The result is available in the browser.' })\n    }\n  ]\n});"},{"label":"A procedure split in two lists","expected":"two columns: 'Part 1' with steps 1–2 and 'Part 2' continuing with steps 3–5, all with outlined markers in the success tone","kind":"script","content":"const box = document.createElement('div');\nbox.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:32px;width:100%';\nconst column = async (title, start, items) => {\n  const wrap = document.createElement('div');\n  wrap.style.cssText = 'display:grid;gap:14px;align-content:start';\n  wrap.append(\n    await slice.build('SectionHeader', { title, size: 'sm', headingLevel: 3 }),\n    await slice.build('Steps', { start, variant: 'outlined', tone: 'success', size: 'sm', headingLevel: 4, items })\n  );\n  return wrap;\n};\nbox.append(\n  await column('Part 1', 1, [\n    { title: 'Step 1', text: 'A short description of the first step.' },\n    { title: 'Step 2', text: 'A short description of the second step.' }\n  ]),\n  await column('Part 2', 3, [\n    { title: 'Step 3', text: 'A short description of the third step.' },\n    { title: 'Step 4', text: 'A short description of the fourth step.' },\n    { title: 'Step 5', text: 'A short description of the fifth step.' }\n  ])\n);\nreturn box;"},{"label":"Dots for a short sequence","expected":"three steps with dot markers and no numbers, in a compact size","kind":"script","content":"return await slice.build('Steps', {\n  marker: 'dot',\n  size: 'sm',\n  items: [\n    { title: 'Step 1', text: 'A short description of the first step.' },\n    { title: 'Step 2', text: 'A short description of the second step.' },\n    { title: 'Step 3', text: 'A short description of the third step.' }\n  ]\n});"}];
  }

  async init() {
    this.markdownPath = "steps.md";
    this.markdownContent = "---\ntitle: Steps\nroute: /docs/display/steps\nnavLabel: Steps\nsection: Display\ngroup: Content\norder: 43\ndescription: How something is done, in order — numbered (or icon, or dot) markers joined by a line, each with a title, a sentence and any content. Vertical, or horizontal where its container has room.\ncomponent: StepsDocumentation\ngenerate: true\ntags: [steps, process, how it works, onboarding, timeline, ordered list, content, display]\n---\n\n# Steps\n\n## Overview\n`Steps` explains a process in order: \"How it works\", \"How to enrol\", \"Getting your certificate\", the steps to install a tool. Each step has a marker (its number, an icon or a dot), a title, a sentence, and anything else it needs — a command, a link, an image.\n\nIt is an ordered list (`<ol>`), so a screen reader announces the order and the count (\"2 of 4\").\n\n### When to use it\n- **\"How it works\"** on a landing: three or four steps from sign-up to result.\n- **Instructions**: install, configure, deploy — with the command inside each step.\n- **A process someone follows outside the app**: how to apply, how to return an order.\n\n### When not to use it\n- **The screens of a task the user is going through** (done, current, next; Back and Continue): that is a Stepper. `Steps` only shows a process; it has no current step and nothing to navigate.\n- **Things that are not in order**: a [FeatureList](/docs/display/feature-list).\n- **Events with dates** (a history, a changelog): a timeline.\n\n## Core Behavior\n- `items: [{ title, text, icon, content, id }]`. `content` takes a string, a node, a component or an array of them; text is never markup.\n- `marker`: `number` (default), `icon` (each step's `icon`; a step without one keeps its number, so the order still reads) or `dot`.\n- `start`: the number of the first step, for a list that continues another one. It is set on the `<ol>` too.\n- `orientation`: `vertical` (default) or `horizontal`. Horizontal goes back to vertical when **its container** is narrower than 600px — a container query, so it also works inside a narrow column on a wide screen.\n- `connector`: the line between markers (none after the last step).\n- `headingLevel` (default `3`): every title is a heading. The markers and the line are decorative.\n\n## Looks\n- `variant`: the marker — `soft` (a tint, default), `filled` or `outlined`.\n- `tone`: the colour of markers and line (`accent` by default). `size`: `md` or `sm`.\n- CSS variables: `--slice-steps-marker` (its size), `--slice-steps-gap`, `--slice-steps-space` (between steps), `--slice-steps-line`.\n\n## Live Preview\n:::component name=\"Steps\"\n{\n  \"items\": [\n    { \"title\": \"Step 1\", \"text\": \"A short description of the first step.\" },\n    { \"title\": \"Step 2\", \"text\": \"A short description of the second step.\" },\n    { \"title\": \"Step 3\", \"text\": \"A short description of the third step.\" }\n  ]\n}\n:::\n\n## Examples\n:::script label=\"How it works, on a landing\" expected=\"a centred section header 'How it works' followed by three horizontal steps with filled numbered markers joined by a line; when the preview is narrow they stack vertically\"\nconst section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:28px;width:100%';\nsection.append(\n  await slice.build('SectionHeader', {\n    align: 'center',\n    eyebrow: 'How it works',\n    title: 'From start to result in three steps',\n    description: 'A short description for this process.'\n  }),\n  await slice.build('Steps', {\n    orientation: 'horizontal',\n    variant: 'filled',\n    items: [\n      { title: 'Step 1', text: 'A short description of the first step.' },\n      { title: 'Step 2', text: 'A short description of the second step.' },\n      { title: 'Step 3', text: 'A short description of the third step.' }\n    ]\n  })\n);\nreturn section;\n:::\n\n:::script label=\"Instructions with commands\" expected=\"four vertical steps with icon markers; steps 1 to 3 contain a dark code line (command 1, command 2, command 3) and step 4 contains an info callout about the result\"\nconst command = (text) => {\n  const pre = document.createElement('pre');\n  pre.style.cssText = 'margin:0;padding:10px 12px;border-radius:8px;background:#1d1b29;color:#f4f2ff;font-size:.85rem;overflow:auto';\n  const code = document.createElement('code');\n  code.style.cssText = 'background:none;padding:0;color:inherit';\n  code.textContent = text;\n  pre.append(code);\n  return pre;\n};\nreturn await slice.build('Steps', {\n  marker: 'icon',\n  items: [\n    { icon: 'download', title: 'Step 1', text: 'A short description of the first step.', content: command('command-1') },\n    { icon: 'folder-plus', title: 'Step 2', text: 'A short description of the second step.', content: command('command-2') },\n    { icon: 'terminal', title: 'Step 3', text: 'A short description of the third step.', content: command('command-3') },\n    {\n      icon: 'globe', title: 'Step 4',\n      content: await slice.build('Callout', { tone: 'info', size: 'sm', text: 'The result is available in the browser.' })\n    }\n  ]\n});\n:::\n\n:::script label=\"A procedure split in two lists\" expected=\"two columns: 'Part 1' with steps 1–2 and 'Part 2' continuing with steps 3–5, all with outlined markers in the success tone\"\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:32px;width:100%';\nconst column = async (title, start, items) => {\n  const wrap = document.createElement('div');\n  wrap.style.cssText = 'display:grid;gap:14px;align-content:start';\n  wrap.append(\n    await slice.build('SectionHeader', { title, size: 'sm', headingLevel: 3 }),\n    await slice.build('Steps', { start, variant: 'outlined', tone: 'success', size: 'sm', headingLevel: 4, items })\n  );\n  return wrap;\n};\nbox.append(\n  await column('Part 1', 1, [\n    { title: 'Step 1', text: 'A short description of the first step.' },\n    { title: 'Step 2', text: 'A short description of the second step.' }\n  ]),\n  await column('Part 2', 3, [\n    { title: 'Step 3', text: 'A short description of the third step.' },\n    { title: 'Step 4', text: 'A short description of the fourth step.' },\n    { title: 'Step 5', text: 'A short description of the fifth step.' }\n  ])\n);\nreturn box;\n:::\n\n:::script label=\"Dots for a short sequence\" expected=\"three steps with dot markers and no numbers, in a compact size\"\nreturn await slice.build('Steps', {\n  marker: 'dot',\n  size: 'sm',\n  items: [\n    { title: 'Step 1', text: 'A short description of the first step.' },\n    { title: 'Step 2', text: 'A short description of the second step.' },\n    { title: 'Step 3', text: 'A short description of the third step.' }\n  ]\n});\n:::\n\n## Best Practices\n:::tip\nThree to five steps. More than that is usually two processes, or a guide with sections.\n:::\n\n:::tip\nStart each title with a verb (\"Create\", \"Choose\", \"Pay\"). The reader should be able to follow the process from the titles alone.\n:::\n\n## Pitfalls\n:::warning\nDo not fake a wizard with Steps by colouring the \"current\" one. A task the user is going through needs a current step that assistive technology knows about, and navigation between steps: that is the Stepper's job.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            let props = {};
            if ("{\n  \"items\": [\n    { \"title\": \"Step 1\", \"text\": \"A short description of the first step.\" },\n    { \"title\": \"Step 2\", \"text\": \"A short description of the second step.\" },\n    { \"title\": \"Step 3\", \"text\": \"A short description of the third step.\" }\n  ]\n}") {
               try {
                  props = JSON.parse("{\n  \"items\": [\n    { \"title\": \"Step 1\", \"text\": \"A short description of the first step.\" },\n    { \"title\": \"Step 2\", \"text\": \"A short description of the second step.\" },\n    { \"title\": \"Step 3\", \"text\": \"A short description of the third step.\" }\n  ]\n}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('Steps', props);
            container.appendChild(component);
         }
       }
      {
         const container = this.querySelector('[data-block-id="doc-block-6"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"orientation\",\"type\":\"string\",\"required\":false,\"default\":\"vertical\",\"allowedValues\":[\"vertical\",\"horizontal\"]},{\"path\":\"marker\",\"type\":\"string\",\"required\":false,\"default\":\"number\",\"allowedValues\":[\"number\",\"icon\",\"dot\"]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"soft\",\"allowedValues\":[\"soft\",\"filled\",\"outlined\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"start\",\"type\":\"number\",\"required\":false,\"default\":\"1\",\"allowedValues\":[]},{\"path\":\"connector\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"headingLevel\",\"type\":\"number\",\"required\":false,\"default\":\"3\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"orientation\",\"type\":\"string\",\"required\":false,\"default\":\"vertical\",\"allowedValues\":[\"vertical\",\"horizontal\"]},{\"path\":\"marker\",\"type\":\"string\",\"required\":false,\"default\":\"number\",\"allowedValues\":[\"number\",\"icon\",\"dot\"]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"soft\",\"allowedValues\":[\"soft\",\"filled\",\"outlined\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"start\",\"type\":\"number\",\"required\":false,\"default\":\"1\",\"allowedValues\":[]},{\"path\":\"connector\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"headingLevel\",\"type\":\"number\",\"required\":false,\"default\":\"3\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"FeatureList","path":"/docs/display/feature-list"}];
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

customElements.define('slice-stepsdocumentation', StepsDocumentation);
