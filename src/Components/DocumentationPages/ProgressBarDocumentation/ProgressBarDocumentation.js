export default class ProgressBarDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A batch import, one file at a time","expected":"A card with a progress bar, Import next and Reset; each import advances the formatted count from zero to eight files.","kind":"script","content":"const progress = await slice.build('ProgressBar', { label: 'Contact import', max: 8, showValue: true, format: (v, max) => `${v} of ${max} files` });\nconst next = await slice.build('Button', { value: 'Import next file', size: 'sm', onClick: () => { progress.value += 1; progress.tone = progress.value === progress.max ? 'success' : 'accent'; next.disabled = progress.value === progress.max; } });\nconst reset = await slice.build('Button', { value: 'Reset', variant: 'outlined', size: 'sm', onClick: () => { progress.value = 0; progress.tone = 'accent'; next.disabled = false; } });\nconst actions = document.createElement('div'); actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:16px'; actions.append(next, reset);\nconst content = document.createElement('div'); content.append(progress, actions);\nreturn await slice.build('Card', { title: 'Import your address book', text: 'Bring your contacts together without losing sight of progress.', content, variant: 'outlined' });"},{"label":"Storage quota with a semantic warning","expected":"A large warning bar showing 84 of 100 GB in a card.","kind":"script","content":"return await slice.build('Card', {\n   title: 'Workspace storage', text: 'Archive older files or upgrade when you need more space.',\n   content: await slice.build('ProgressBar', { label: 'Storage used', value: 84, max: 100, tone: 'warning', size: 'lg', showValue: true, format: (v, max) => `${v} / ${max} GB` }),\n});"},{"label":"Unknown total, then measurable progress","expected":"An indeterminate track that stays still under reduced motion; Use known total switches it to a 42 percent info bar.","kind":"script","content":"const progress = await slice.build('ProgressBar', { label: 'Preparing your export', indeterminate: true, showValue: true, tone: 'info' });\nconst toggle = await slice.build('Button', { value: 'Use known total', variant: 'outlined', size: 'sm', onClick: () => { progress.indeterminate = !progress.indeterminate; progress.value = 42; toggle.value = progress.indeterminate ? 'Use known total' : 'Use unknown total'; } });\nconst box = document.createElement('div'); box.style.cssText = 'display:grid;gap:16px;width:100%'; box.append(progress, toggle); return box;"},{"label":"Compact semantic tones","expected":"Six small progress bars, each named and colored by its tone.","kind":"script","content":"const box = document.createElement('div'); box.style.cssText = 'display:grid;gap:16px;width:100%';\nfor (const tone of ['neutral', 'accent', 'info', 'success', 'warning', 'danger']) box.append(await slice.build('ProgressBar', { label: tone, value: 65, tone, size: 'sm', showValue: true }));\nreturn box;"}];
  }

  async init() {
    this.markdownPath = "progress-bar.md";
    this.markdownContent = "---\ntitle: ProgressBar\nroute: /docs/display/progress-bar\nnavLabel: ProgressBar\nsection: Display\ngroup: Feedback\norder: 44\ndescription: Accessible progress for uploads, imports and quotas, with reactive value/max, formatted output and an optional indeterminate state.\ncomponent: ProgressBarDocumentation\ngenerate: true\ntags: [progress, progressbar, upload, quota, import, loading, feedback]\n---\n\n# ProgressBar\n\n## Overview\n\n`ProgressBar` shows how much work is complete when a total is known. Give it a meaningful `label`,\na `value` and a `max`. For an operation whose total is temporarily unknown, use `indeterminate`.\n\n```js\nconst progress = await slice.build('ProgressBar', {\n   label: 'Importing contacts', value: 3, max: 8, showValue: true,\n   format: (value, max) => `${value} of ${max} files`,\n});\nprogress.value = 4;\n```\n\n### When to use it\n\nUploads, batch jobs, storage quotas, or completion of a task with a measurable total. It displays\nprogress; it does not upload files, schedule jobs, or own a wizard.\n\n### When not to use it\n\nUse `Loading` for a general busy indicator, `SkeletonService` for content whose shape is known,\nand `Stepper` for the named stages of a process. A progress bar is not a chart or a circular gauge.\n\n## Behavior\n\n- Values are finite numbers clamped to `0…max`. A nonpositive/nonfinite maximum falls back to 100.\n  The assigned amount is retained, so increasing `max` can reveal an amount that was previously clamped.\n- `label` names the bar. An omitted label falls back to translated “Progress”; use a specific label\n  in real apps. `showLabel: false` hides it visually while the bar retains its accessible name.\n- `showValue` exposes the formatted value beside the track. The default is a localized percentage;\n  `format(value, max)` customizes both that value and `aria-valuetext`. `ariaValueText` overrides\n  the spoken value without changing the visible one. Explicit `locale` wins over the app locale.\n- `tone` is semantic; `size` (`sm`, `md`, `lg`) controls track height. Props update without rebuilding.\n- `indeterminate` omits `aria-valuenow`/`aria-valuetext`: it never claims a fake percentage. With\n  reduced motion it stays still; otherwise its fill moves. Returning to determinate restores the value.\n- The bar has `role=\"progressbar\"` and min/max/current values. It is not a live region by default;\n  announce meaningful milestones separately rather than every percentage tick.\n\n## Examples\n\n:::script label=\"A batch import, one file at a time\" expected=\"A card with a progress bar, Import next and Reset; each import advances the formatted count from zero to eight files.\"\nconst progress = await slice.build('ProgressBar', { label: 'Contact import', max: 8, showValue: true, format: (v, max) => `${v} of ${max} files` });\nconst next = await slice.build('Button', { value: 'Import next file', size: 'sm', onClick: () => { progress.value += 1; progress.tone = progress.value === progress.max ? 'success' : 'accent'; next.disabled = progress.value === progress.max; } });\nconst reset = await slice.build('Button', { value: 'Reset', variant: 'outlined', size: 'sm', onClick: () => { progress.value = 0; progress.tone = 'accent'; next.disabled = false; } });\nconst actions = document.createElement('div'); actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:16px'; actions.append(next, reset);\nconst content = document.createElement('div'); content.append(progress, actions);\nreturn await slice.build('Card', { title: 'Import your address book', text: 'Bring your contacts together without losing sight of progress.', content, variant: 'outlined' });\n:::\n\n:::script label=\"Storage quota with a semantic warning\" expected=\"A large warning bar showing 84 of 100 GB in a card.\"\nreturn await slice.build('Card', {\n   title: 'Workspace storage', text: 'Archive older files or upgrade when you need more space.',\n   content: await slice.build('ProgressBar', { label: 'Storage used', value: 84, max: 100, tone: 'warning', size: 'lg', showValue: true, format: (v, max) => `${v} / ${max} GB` }),\n});\n:::\n\n:::script label=\"Unknown total, then measurable progress\" expected=\"An indeterminate track that stays still under reduced motion; Use known total switches it to a 42 percent info bar.\"\nconst progress = await slice.build('ProgressBar', { label: 'Preparing your export', indeterminate: true, showValue: true, tone: 'info' });\nconst toggle = await slice.build('Button', { value: 'Use known total', variant: 'outlined', size: 'sm', onClick: () => { progress.indeterminate = !progress.indeterminate; progress.value = 42; toggle.value = progress.indeterminate ? 'Use known total' : 'Use unknown total'; } });\nconst box = document.createElement('div'); box.style.cssText = 'display:grid;gap:16px;width:100%'; box.append(progress, toggle); return box;\n:::\n\n:::script label=\"Compact semantic tones\" expected=\"Six small progress bars, each named and colored by its tone.\"\nconst box = document.createElement('div'); box.style.cssText = 'display:grid;gap:16px;width:100%';\nfor (const tone of ['neutral', 'accent', 'info', 'success', 'warning', 'danger']) box.append(await slice.build('ProgressBar', { label: tone, value: 65, tone, size: 'sm', showValue: true }));\nreturn box;\n:::\n\n## Texts and theming\n\n`slice.progressBar.label` and `.working` have English/Spanish defaults. The app dictionary wins;\n`texts: { label, working }` wins over the dictionary. Visible fallback texts follow locale changes.\nColors follow theme tokens. Local CSS overrides: `--slice-progress-bar-track`, `--slice-progress-bar-fill`,\n`--slice-progress-bar-radius`, `--slice-progress-bar-height` and `--slice-progress-bar-color`.\n\n:::related\n- [Loading](/docs/feedback/loading) - The wait without a number.\n- [Skeleton service](/docs/services/skeleton-service) - The wait with the shape of the content.\n- [Stepper](/docs/display/stepper) - Progress through steps, not through bytes.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            const code = await slice.build('CodeVisualizer', {
               value: "const progress = await slice.build('ProgressBar', {\n   label: 'Importing contacts', value: 3, max: 8, showValue: true,\n   format: (value, max) => `${value} of ${max} files`,\n});\nprogress.value = 4;",
               language: "js"
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
         const container = this.querySelector('[data-block-id="doc-block-6"]');
         if (container) {
            const items = [{"title":"Loading","path":"/docs/feedback/loading","text":"The wait without a number."},{"title":"Skeleton service","path":"/docs/services/skeleton-service","text":"The wait with the shape of the content."},{"title":"Stepper","path":"/docs/display/stepper","text":"Progress through steps, not through bytes."}];
            const cards = [];
            for (const item of items) {
               const card = await slice.build('Card', {
                  title: item.title,
                  text: item.text || '',
                  // The small mark beside the title, not the banner: a page
                  // of four related links should not be four big arrows.
                  headerIcon: 'arrow-right',
                  interactive: true,
                  onClick: () => {
                     if (/^https?:/i.test(item.path)) {
                        window.open(item.path, '_blank', 'noopener,noreferrer');
                     } else {
                        slice.router.navigate(item.path);
                     }
                  }
               });
               if (card) cards.push(card);
            }
            const grid = await slice.build('Grid', {
               columns: items.length === 4 ? 2 : Math.min(3, Math.max(1, cards.length)),
               gap: '14px',
               items: cards
            });
            if (grid) container.appendChild(grid);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-7"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"value\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"max\",\"type\":\"number\",\"required\":false,\"default\":\"100\",\"allowedValues\":[]},{\"path\":\"label\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"showLabel\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"showValue\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"format\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"ariaValueText\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"indeterminate\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\",\"lg\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"locale\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"value\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"max\",\"type\":\"number\",\"required\":false,\"default\":\"100\",\"allowedValues\":[]},{\"path\":\"label\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"showLabel\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"showValue\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"format\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"ariaValueText\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"indeterminate\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\",\"lg\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"locale\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
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

customElements.define('slice-progressbardocumentation', ProgressBarDocumentation);
