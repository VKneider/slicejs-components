export default class StepperDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"How enrollment works — static","expected":"A section header followed by three ordered horizontal stages, stacked vertically in a narrow container.","kind":"script","content":"const box = document.createElement('section'); box.style.cssText = 'display:grid;gap:24px;width:100%';\nbox.append(await slice.build('SectionHeader', { eyebrow: 'Your next chapter', title: 'From curiosity to your first class', align: 'center', description: 'A simple path to start learning.' }),\n   await slice.build('Stepper', { mode: 'static', orientation: 'horizontal', variant: 'filled', items: [\n      { id: 'account', title: 'Create your account', text: 'Use your university email to join the learning community.' },\n      { id: 'course', title: 'Find your course', text: 'Choose a subject and a schedule that fit your goals.' },\n      { id: 'learn', title: 'Start learning', text: 'Meet your instructor and work on your first challenge.' },\n   ] }));\nreturn box;"},{"label":"A task with panels — interactive and linear","expected":"A three-stage course setup with a real Input and Select. Save and continue marks the stage complete and unlocks the next. Completed stages remain available, and the progress bar tracks completion.","kind":"script","content":"const panels = new Map();\nconst contact = document.createElement('div'); contact.append(await slice.build('Input', { label: 'Contact email', type: 'email', placeholder: 'you@example.com' })); panels.set('contact', contact);\nconst course = document.createElement('div'); course.append(await slice.build('Select', { label: 'Choose your course', options: [{ label: 'Web components', value: 'web' }, { label: 'Programming foundations', value: 'programming' }] })); panels.set('course', course);\nconst review = await slice.build('Card', { title: 'Ready for your next chapter', text: 'Review your choices with your advisor before confirming enrollment.', variant: 'outlined' }); panels.set('review', review);\nconst steps = [{ id: 'contact', title: 'Your details' }, { id: 'course', title: 'Your course' }, { id: 'review', title: 'Review' }];\nconst progress = await slice.build('ProgressBar', { label: 'Setup completion', max: 3, showValue: true, size: 'sm', format: (v, max) => `${v} of ${max} stages saved` });\nconst status = document.createElement('p'); status.setAttribute('role', 'status');\nconst show = id => { for (const [key, panel] of panels) panel.hidden = key !== id; };\nconst stepper = await slice.build('Stepper', { mode: 'interactive', orientation: 'horizontal', active: 'contact', linear: true, items: steps, onChange: id => show(id) });\nconst next = await slice.build('Button', { value: 'Save and continue', size: 'sm', onClick: () => {\n   const index = steps.findIndex(item => item.id === stepper.active);\n   steps[index] = { ...steps[index], status: 'done' }; stepper.items = [...steps];\n   progress.value = steps.filter(item => item.status === 'done').length;\n   if (index < steps.length - 1) { stepper.active = steps[index + 1].id; show(stepper.active); }\n   else { status.textContent = 'Setup saved. You can revisit each stage.'; progress.tone = 'success'; }\n} });\nconst content = document.createElement('div'); content.style.cssText = 'display:grid;gap:18px;width:100%';\ncontent.append(stepper, ...panels.values(), progress, next, status); show('contact');\nreturn content;"},{"label":"Instructions with icons and extra content","expected":"Three vertical setup instructions with icons, a command and a final success callout.","kind":"script","content":"const command = document.createElement('code'); command.textContent = 'pnpm run dev';\nreturn await slice.build('Stepper', { marker: 'icon', items: [\n   { id: 'install', title: 'Install dependencies', text: 'Use the package manager declared by your project.', icon: 'download' },\n   { id: 'run', title: 'Start the development server', content: command, icon: 'terminal' },\n   { id: 'visit', title: 'Open your application', icon: 'globe', content: await slice.build('Callout', { tone: 'success', text: 'Your local preview is ready for your next change.' }) },\n] });"},{"label":"A review needs attention","expected":"An interactive vertical sequence showing completed, error, current and disabled upcoming states.","kind":"script","content":"return await slice.build('Stepper', { mode: 'interactive', active: 'review', variant: 'outlined', items: [\n   { id: 'details', title: 'Contact details', status: 'done', text: 'Your contact information is saved.' },\n   { id: 'payment', title: 'Payment method', status: 'error', text: 'The saved card needs an updated expiry date.' },\n   { id: 'review', title: 'Review order', text: 'Check your items before submitting.' },\n   { id: 'confirm', title: 'Confirmation', disabled: true, text: 'Available after the order is submitted.' },\n] });"},{"label":"A compact procedure continuing another list","expected":"Three compact static steps with dot markers, then the same procedure numbered from four.","kind":"script","content":"const box = document.createElement('div'); box.style.cssText = 'display:grid;gap:24px;width:100%';\nconst items = [{ title: 'Check your materials', text: 'Have everything ready before you start.' }, { title: 'Follow the instructions', text: 'Work through the procedure carefully.' }, { title: 'Review the result', text: 'Make sure the outcome meets your goal.' }];\nbox.append(await slice.build('Stepper', { items, marker: 'dot', size: 'sm' }), await slice.build('Stepper', { items, start: 4, size: 'sm', tone: 'success', variant: 'outlined' }));\nreturn box;"}];
  }

  async init() {
    this.markdownPath = "stepper.md";
    this.markdownContent = "---\ntitle: Stepper\nroute: /docs/display/stepper\nnavLabel: Stepper\nsection: Display\ngroup: Content\norder: 43\ndescription: One ordered-process component for static instructions and interactive task navigation, with keyed content, current/completed/error states, linear gating and keyboard support.\ncomponent: StepperDocumentation\ngenerate: true\ntags: [stepper, steps, process, wizard, onboarding, ordered list, navigation]\n---\n\n# Stepper\n\n## Overview\n\n`Stepper` is the single component for an ordered process. `mode: 'static'` explains how something\nworks. `mode: 'interactive'` shows where someone is in a task and lets them move between stages.\nIt replaces the earlier separate Steps proposal and implementation; there is no Steps component,\nalias or compatibility route.\n\n```js\nawait slice.build('Stepper', {\n   mode: 'static', orientation: 'horizontal',\n   items: [{ id: 'account', title: 'Create an account' }, { id: 'course', title: 'Choose a course' }, { id: 'learn', title: 'Start learning' }],\n});\n```\n\n### When to use it\n\nUse static mode for a landing page's “How it works”, a setup procedure, or instructions with commands.\nUse interactive mode for checkout stages, onboarding or a multi-step form. Use `Tabs` for sibling\nviews with no order/completion, `Timeline` for events with dates, and `TourService` for a guided\noverlay pointing at controls across an existing screen.\n\n## Items and modes\n\n`items` is an array of `{ id, title, text, icon, content, status, disabled }`. IDs are unique strings\n(numbers normalize to strings); omitted IDs fall back to the index. Supply stable IDs when items\nchange. Duplicate IDs throw a clear error rather than sharing the wrong DOM row.\n\n- Static mode has an `<ol>` with headings and decorative number/icon/dot markers. No navigation\n  controls, current-step announcement or click handlers are added.\n- Interactive mode has real buttons, one `aria-current=\"step\"` item, state text and a polite\n  announcement of the active title and position. It remains an ordered list, never a tablist.\n- `active` is an item ID. By default the first enabled item marked `current` is selected, or the\n  first enabled item. One item is current even if input data marks several. Invalid/disabled IDs\n  fall back by the same rule. Static mode exposes `active === null`.\n- `status` is `upcoming`, `current`, `done`, or `error`. `active` determines the current item;\n  completion/error are supplied by the app. Clicking does not mark anything done or validate data.\n- `linear: true` allows completed steps and the first incomplete step, but blocks future steps.\n  Disabled steps are not actionable. `clickable: false` makes interactive state read-only;\n  `disabled` disables all navigation. Programmatic `active = id` can select any enabled item:\n  the app owns validation and can restore a saved task.\n- `select(id)` returns true only when a permitted user selection changes the current item. It fires\n  `onChange(id, { previous, step, index })` and bubbling `step-change` with `{ id, previous, step, index }`.\n  Assigning `active` does not fire these callbacks. The component does not own panels or routes.\n\n## Layout and content\n\n`orientation` is vertical by default. Horizontal becomes vertical when **its container** is under\n600px. `marker` is `number`, `icon` (number fallback), or `dot`; `start` continues the numbering.\n`variant` is `soft`, `filled`, or `outlined`, independently of semantic `tone`. `size` is `sm`/`md`,\n`connector` hides/shows joining lines, and `headingLevel` controls the item headings.\n\n`content` accepts text, nodes, components or arrays. Strings stay text. Rows and existing icons\nare reused by ID; assigning `items` again keeps surviving content nodes, including an editor's\ndraft. Removed/replaced content and icons are destroyed. The component owns the content you give it.\n\nKeyboard in interactive mode: Tab enters the actionable step list once, arrows move focus among\nenabled steps, Home/End focus the first/last actionable step, and Enter/Space activate the focused\nnative button. Moving focus alone does not select. RTL horizontal arrows follow reading direction.\n\n## Examples\n\n:::script label=\"How enrollment works — static\" expected=\"A section header followed by three ordered horizontal stages, stacked vertically in a narrow container.\"\nconst box = document.createElement('section'); box.style.cssText = 'display:grid;gap:24px;width:100%';\nbox.append(await slice.build('SectionHeader', { eyebrow: 'Your next chapter', title: 'From curiosity to your first class', align: 'center', description: 'A simple path to start learning.' }),\n   await slice.build('Stepper', { mode: 'static', orientation: 'horizontal', variant: 'filled', items: [\n      { id: 'account', title: 'Create your account', text: 'Use your university email to join the learning community.' },\n      { id: 'course', title: 'Find your course', text: 'Choose a subject and a schedule that fit your goals.' },\n      { id: 'learn', title: 'Start learning', text: 'Meet your instructor and work on your first challenge.' },\n   ] }));\nreturn box;\n:::\n\n:::script label=\"A task with panels — interactive and linear\" expected=\"A three-stage course setup with a real Input and Select. Save and continue marks the stage complete and unlocks the next. Completed stages remain available, and the progress bar tracks completion.\"\nconst panels = new Map();\nconst contact = document.createElement('div'); contact.append(await slice.build('Input', { label: 'Contact email', type: 'email', placeholder: 'you@example.com' })); panels.set('contact', contact);\nconst course = document.createElement('div'); course.append(await slice.build('Select', { label: 'Choose your course', options: [{ label: 'Web components', value: 'web' }, { label: 'Programming foundations', value: 'programming' }] })); panels.set('course', course);\nconst review = await slice.build('Card', { title: 'Ready for your next chapter', text: 'Review your choices with your advisor before confirming enrollment.', variant: 'outlined' }); panels.set('review', review);\nconst steps = [{ id: 'contact', title: 'Your details' }, { id: 'course', title: 'Your course' }, { id: 'review', title: 'Review' }];\nconst progress = await slice.build('ProgressBar', { label: 'Setup completion', max: 3, showValue: true, size: 'sm', format: (v, max) => `${v} of ${max} stages saved` });\nconst status = document.createElement('p'); status.setAttribute('role', 'status');\nconst show = id => { for (const [key, panel] of panels) panel.hidden = key !== id; };\nconst stepper = await slice.build('Stepper', { mode: 'interactive', orientation: 'horizontal', active: 'contact', linear: true, items: steps, onChange: id => show(id) });\nconst next = await slice.build('Button', { value: 'Save and continue', size: 'sm', onClick: () => {\n   const index = steps.findIndex(item => item.id === stepper.active);\n   steps[index] = { ...steps[index], status: 'done' }; stepper.items = [...steps];\n   progress.value = steps.filter(item => item.status === 'done').length;\n   if (index < steps.length - 1) { stepper.active = steps[index + 1].id; show(stepper.active); }\n   else { status.textContent = 'Setup saved. You can revisit each stage.'; progress.tone = 'success'; }\n} });\nconst content = document.createElement('div'); content.style.cssText = 'display:grid;gap:18px;width:100%';\ncontent.append(stepper, ...panels.values(), progress, next, status); show('contact');\nreturn content;\n:::\n\n:::script label=\"Instructions with icons and extra content\" expected=\"Three vertical setup instructions with icons, a command and a final success callout.\"\nconst command = document.createElement('code'); command.textContent = 'pnpm run dev';\nreturn await slice.build('Stepper', { marker: 'icon', items: [\n   { id: 'install', title: 'Install dependencies', text: 'Use the package manager declared by your project.', icon: 'download' },\n   { id: 'run', title: 'Start the development server', content: command, icon: 'terminal' },\n   { id: 'visit', title: 'Open your application', icon: 'globe', content: await slice.build('Callout', { tone: 'success', text: 'Your local preview is ready for your next change.' }) },\n] });\n:::\n\n:::script label=\"A review needs attention\" expected=\"An interactive vertical sequence showing completed, error, current and disabled upcoming states.\"\nreturn await slice.build('Stepper', { mode: 'interactive', active: 'review', variant: 'outlined', items: [\n   { id: 'details', title: 'Contact details', status: 'done', text: 'Your contact information is saved.' },\n   { id: 'payment', title: 'Payment method', status: 'error', text: 'The saved card needs an updated expiry date.' },\n   { id: 'review', title: 'Review order', text: 'Check your items before submitting.' },\n   { id: 'confirm', title: 'Confirmation', disabled: true, text: 'Available after the order is submitted.' },\n] });\n:::\n\n:::script label=\"A compact procedure continuing another list\" expected=\"Three compact static steps with dot markers, then the same procedure numbered from four.\"\nconst box = document.createElement('div'); box.style.cssText = 'display:grid;gap:24px;width:100%';\nconst items = [{ title: 'Check your materials', text: 'Have everything ready before you start.' }, { title: 'Follow the instructions', text: 'Work through the procedure carefully.' }, { title: 'Review the result', text: 'Make sure the outcome meets your goal.' }];\nbox.append(await slice.build('Stepper', { items, marker: 'dot', size: 'sm' }), await slice.build('Stepper', { items, start: 4, size: 'sm', tone: 'success', variant: 'outlined' }));\nreturn box;\n:::\n\n## Texts and theming\n\nBuilt-in status/announcement texts use `slice.stepper.*`: `label`, `upcoming`, `current`, `done`,\n`error`, `progress` (`{index}`, `{total}`, `{title}`), with English/Spanish defaults. `texts` overrides\napp dictionaries; `ariaLabel` names the list. Titles and descriptions belong to the app.\n\nColors follow theme tokens; component variables use `--slice-stepper-*` (`color`, `ink`, `on-color`,\n`marker`, `gap`, `space`, `line`). Reduced-motion users get no decorative motion. The component has\nno network calls, global listeners or timer loop.\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            const code = await slice.build('CodeVisualizer', {
               value: "await slice.build('Stepper', {\n   mode: 'static', orientation: 'horizontal',\n   items: [{ id: 'account', title: 'Create an account' }, { id: 'course', title: 'Choose a course' }, { id: 'learn', title: 'Start learning' }],\n});",
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
         const container = this.querySelector('[data-block-id="doc-block-7"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"mode\",\"type\":\"string\",\"required\":false,\"default\":\"static\",\"allowedValues\":[\"static\",\"interactive\"]},{\"path\":\"active\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"linear\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"clickable\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"orientation\",\"type\":\"string\",\"required\":false,\"default\":\"vertical\",\"allowedValues\":[\"vertical\",\"horizontal\"]},{\"path\":\"marker\",\"type\":\"string\",\"required\":false,\"default\":\"number\",\"allowedValues\":[\"number\",\"icon\",\"dot\"]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"soft\",\"allowedValues\":[\"soft\",\"filled\",\"outlined\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"start\",\"type\":\"number\",\"required\":false,\"default\":\"1\",\"allowedValues\":[]},{\"path\":\"connector\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"headingLevel\",\"type\":\"number\",\"required\":false,\"default\":\"3\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"mode\",\"type\":\"string\",\"required\":false,\"default\":\"static\",\"allowedValues\":[\"static\",\"interactive\"]},{\"path\":\"active\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"linear\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"clickable\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"orientation\",\"type\":\"string\",\"required\":false,\"default\":\"vertical\",\"allowedValues\":[\"vertical\",\"horizontal\"]},{\"path\":\"marker\",\"type\":\"string\",\"required\":false,\"default\":\"number\",\"allowedValues\":[\"number\",\"icon\",\"dot\"]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"soft\",\"allowedValues\":[\"soft\",\"filled\",\"outlined\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"start\",\"type\":\"number\",\"required\":false,\"default\":\"1\",\"allowedValues\":[]},{\"path\":\"connector\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"headingLevel\",\"type\":\"number\",\"required\":false,\"default\":\"3\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
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

customElements.define('slice-stepperdocumentation', StepperDocumentation);
