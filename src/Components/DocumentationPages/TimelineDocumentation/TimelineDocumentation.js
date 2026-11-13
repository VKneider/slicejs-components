export default class TimelineDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A history in a split layout (with date ranges)","expected":"a section header 'Section' and a timeline with a column of date ranges on the left ('Year 1 — now', 'Year 1 — Year 2', 'Year 0 — Year 1'); each item has a title, a subtitle and a short description; the current one has an accent badge 'Now'","kind":"script","content":"const section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:22px;width:100%';\nsection.append(\n  await slice.build('SectionHeader', { eyebrow: 'Section', title: 'Section title', size: 'sm' }),\n  await slice.build('Timeline', {\n    layout: 'split',\n    items: [\n      { dateLabel: 'Year 1 — now', title: 'Item 1', badge: 'Now', text: 'Subtitle 1', content: 'A short description of the current item.' },\n      { dateLabel: 'Year 1 — Year 2', title: 'Item 2', text: 'Subtitle 2', content: 'A short description of the second item.' },\n      { dateLabel: 'Year 0 — Year 1', title: 'Item 3', text: 'Subtitle 3', content: 'A short description of the third item.' }\n    ]\n  })\n);\nreturn section;"},{"label":"Done, current and upcoming","expected":"a compact timeline with icon markers: 'Step 1' and 'Step 2' done, 'Step 3' current with a ring and an action button, 'Step 4' upcoming, hollow and grey with a dashed line before it; dates show with time","kind":"script","content":"const toasts = await slice.build('ToastProvider', { singleton: true });\nconst day = (d, h) => new Date(2026, 10, d, h, 15);\nreturn await slice.build('Timeline', {\n  marker: 'icon',\n  size: 'sm',\n  dateFormat: 'datetime',\n  items: [\n    { date: day(6, 9), title: 'Step 1', icon: 'cart', text: 'A short description.' },\n    { date: day(6, 16), title: 'Step 2', icon: 'archive', text: 'A short description.' },\n    {\n      date: day(7, 8), title: 'Step 3', icon: 'truck', state: 'current', tone: 'info', text: 'A short description of the current step.',\n      content: await slice.build('Button', { value: 'Action', size: 'sm', variant: 'outlined', onClick: () => toasts.show('Action selected.') })\n    },\n    { dateLabel: 'Expected date', title: 'Step 4', icon: 'home', state: 'upcoming' }\n  ]\n});"},{"label":"Changelog grouped by month","expected":"a changelog with month headings ('Month 2', 'Month 1'); each entry has a version title with a badge (Feature, Fix), a date, a short text and the title links to the docs","kind":"script","content":"return await slice.build('Timeline', {\n  groupBy: 'month',\n  sort: 'newest',\n  tone: 'accent',\n  items: [\n    { date: '2026-10-12', title: 'v1.0.0', badge: 'Feature', text: 'A short description of this release.', href: '/docs' },\n    { date: '2026-11-08', title: 'v1.2.0', badge: 'Feature', text: 'A short description of this release.', href: '/docs' },\n    { date: '2026-10-28', title: 'v1.1.1', badge: 'Fix', tone: 'warning', text: 'A short description of this fix.' },\n    { date: '2026-11-02', title: 'v1.1.0', badge: 'Feature', text: 'A short description of this release.', href: '/docs' }\n  ]\n});"},{"label":"Activity on a record (relative dates, grouped by day)","expected":"activity grouped under 'Today' and 'Yesterday' with relative times such as '20 minutes ago' and '3 hours ago'; only coloured dots per kind of change are used","kind":"script","content":"const ago = (minutes) => new Date(Date.now() - minutes * 60000);\nreturn await slice.build('Timeline', {\n  groupBy: 'day',\n  dateFormat: 'relative',\n  size: 'sm',\n  items: [\n    { date: ago(20), title: 'User 1 changed the status to Status 1', tone: 'success' },\n    { date: ago(180), title: 'User 2 added a comment', text: '“A short example comment.”', tone: 'info' },\n    { date: ago(60 * 26), title: 'User 1 created the record', tone: 'neutral' }\n  ]\n});"},{"label":"Alternate layout","expected":"a centred line with milestones on both sides, the date across from each one; on a narrow screen it becomes one column","kind":"script","content":"return await slice.build('Timeline', {\n  layout: 'alternate',\n  dateFormat: 'year',\n  marker: 'icon',\n  variant: 'filled',\n  items: [\n    { date: '2018-05-01', title: 'Milestone 1', icon: 'code', text: 'A short description of the first milestone.' },\n    { date: '2021-02-01', title: 'Milestone 2', icon: 'map-pin', text: 'A short description of the second milestone.' },\n    { date: '2024-09-01', title: 'Milestone 3', icon: 'terminal', text: 'A short description of the third milestone.' },\n    { date: '2026-03-01', title: 'Milestone 4', icon: 'globe', text: 'A short description of the fourth milestone.' }\n  ]\n});"}];
  }

  async init() {
    this.markdownPath = "timeline.md";
    this.markdownContent = "---\ntitle: Timeline\nroute: /docs/display/timeline\nnavLabel: Timeline\nsection: Display\ngroup: Content\norder: 44\ndescription: Events in time on one line — a career, the history of an order, a changelog, the activity on a record. Dates in the app's language, groups by year, month or day, and done, current and upcoming events.\ncomponent: TimelineDocumentation\ngenerate: true\ntags: [timeline, history, activity, changelog, career, tracking, events, content, display]\n---\n\n# Timeline\n\n## Overview\n`Timeline` shows things that happened — or will — in time: the jobs of a career, the history of an order, the releases of a product, who changed what on a record. Each event has a date, a marker on a line, a title, a sentence, and anything else it needs.\n\nDates are written in the app's language (through `slice.translator`, or `locale`), and the whole timeline is written again when the language changes.\n\n### When to use it\n- **A career or a story**: jobs, studies, milestones of a project (`layout: 'split'` or `'alternate'`).\n- **The history of something in progress**: an order (ordered, shipped, out for delivery), a ticket, an application — with `state: 'current'` and `'upcoming'`.\n- **A changelog** grouped by month or year.\n- **Activity on a record**: \"Ana changed the status · 3 hours ago\", grouped by day.\n\n### When not to use it\n- **A process without dates** (how to enrol, how it works): [Stepper](/docs/display/stepper).\n- **Records you search, sort or select**: [DataList](/docs/data/datalist) or [Table](/docs/data/table).\n- **A task the user goes through screen by screen**: a Stepper.\n\n## Core Behavior\n- `items: [{ id, date, dateLabel, title, text, icon, tone, state, badge, href, target, content }]`.\n  - `date`: a `Date`, a timestamp or an ISO text (`'2026-03-02'` is that local day).\n  - `dateLabel`: your own text instead of the formatted date (\"2019 – 2022\", \"Q3\").\n  - `tone`: the marker's colour for that event. `icon`: shown with `marker: 'icon'`.\n  - `state`: `done` (default), `current` (a ring, and `aria-current=\"step\"`) or `upcoming` (hollow, quiet, dashed line).\n  - `href`: the title becomes a link (through the router for app paths). `content`: a string, a node, a component or an array of them.\n- `dateFormat`: `date` (default), `datetime`, `time`, `month`, `year`, `relative` (\"3 hours ago\", with the full date in its tooltip) or `none`.\n- `groupBy`: `none`, `year`, `month` or `day` (\"Today\", \"Yesterday\", then the date). Group headings use `headingLevel` (default `3`); event titles go one level below.\n- `sort`: `none` (the order given), `newest` or `oldest`.\n- An ordered list per group, with `<time datetime>` on each date. Markers and the line are decorative.\n\n## Looks\n- `layout`: `stacked` (the date above the title, default), `split` (a column of dates at the start) or `alternate` (events on both sides of the line). `split` and `alternate` go back to `stacked` when **the container** is narrower than 560px.\n- `marker`: `dot` or `icon`. `variant`: `soft`, `filled` or `outlined`. `tone` for the whole line, `size`: `md` or `sm`.\n- CSS variables: `--slice-timeline-date-width` (the date column in `split`), `--slice-timeline-space` (between events), `--slice-timeline-dot`, `--slice-timeline-icon`.\n\n## Live Preview\n:::component name=\"Timeline\"\n{\n  \"items\": [\n    { \"date\": \"2026-03-02\", \"title\": \"Event 3\", \"text\": \"A short description of the third event.\" },\n    { \"date\": \"2025-11-20\", \"title\": \"Event 2\", \"text\": \"A short description of the second event.\" },\n    { \"date\": \"2025-06-01\", \"title\": \"Event 1\", \"text\": \"A short description of the first event.\" }\n  ]\n}\n:::\n\n## Examples\n:::script label=\"A history in a split layout (with date ranges)\" expected=\"a section header 'Section' and a timeline with a column of date ranges on the left ('Year 1 — now', 'Year 1 — Year 2', 'Year 0 — Year 1'); each item has a title, a subtitle and a short description; the current one has an accent badge 'Now'\"\nconst section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:22px;width:100%';\nsection.append(\n  await slice.build('SectionHeader', { eyebrow: 'Section', title: 'Section title', size: 'sm' }),\n  await slice.build('Timeline', {\n    layout: 'split',\n    items: [\n      { dateLabel: 'Year 1 — now', title: 'Item 1', badge: 'Now', text: 'Subtitle 1', content: 'A short description of the current item.' },\n      { dateLabel: 'Year 1 — Year 2', title: 'Item 2', text: 'Subtitle 2', content: 'A short description of the second item.' },\n      { dateLabel: 'Year 0 — Year 1', title: 'Item 3', text: 'Subtitle 3', content: 'A short description of the third item.' }\n    ]\n  })\n);\nreturn section;\n:::\n\n:::script label=\"Done, current and upcoming\" expected=\"a compact timeline with icon markers: 'Step 1' and 'Step 2' done, 'Step 3' current with a ring and an action button, 'Step 4' upcoming, hollow and grey with a dashed line before it; dates show with time\"\nconst toasts = await slice.build('ToastProvider', { singleton: true });\nconst day = (d, h) => new Date(2026, 10, d, h, 15);\nreturn await slice.build('Timeline', {\n  marker: 'icon',\n  size: 'sm',\n  dateFormat: 'datetime',\n  items: [\n    { date: day(6, 9), title: 'Step 1', icon: 'cart', text: 'A short description.' },\n    { date: day(6, 16), title: 'Step 2', icon: 'archive', text: 'A short description.' },\n    {\n      date: day(7, 8), title: 'Step 3', icon: 'truck', state: 'current', tone: 'info', text: 'A short description of the current step.',\n      content: await slice.build('Button', { value: 'Action', size: 'sm', variant: 'outlined', onClick: () => toasts.show('Action selected.') })\n    },\n    { dateLabel: 'Expected date', title: 'Step 4', icon: 'home', state: 'upcoming' }\n  ]\n});\n:::\n\n:::script label=\"Changelog grouped by month\" expected=\"a changelog with month headings ('Month 2', 'Month 1'); each entry has a version title with a badge (Feature, Fix), a date, a short text and the title links to the docs\"\nreturn await slice.build('Timeline', {\n  groupBy: 'month',\n  sort: 'newest',\n  tone: 'accent',\n  items: [\n    { date: '2026-10-12', title: 'v1.0.0', badge: 'Feature', text: 'A short description of this release.', href: '/docs' },\n    { date: '2026-11-08', title: 'v1.2.0', badge: 'Feature', text: 'A short description of this release.', href: '/docs' },\n    { date: '2026-10-28', title: 'v1.1.1', badge: 'Fix', tone: 'warning', text: 'A short description of this fix.' },\n    { date: '2026-11-02', title: 'v1.1.0', badge: 'Feature', text: 'A short description of this release.', href: '/docs' }\n  ]\n});\n:::\n\n:::script label=\"Activity on a record (relative dates, grouped by day)\" expected=\"activity grouped under 'Today' and 'Yesterday' with relative times such as '20 minutes ago' and '3 hours ago'; only coloured dots per kind of change are used\"\nconst ago = (minutes) => new Date(Date.now() - minutes * 60000);\nreturn await slice.build('Timeline', {\n  groupBy: 'day',\n  dateFormat: 'relative',\n  size: 'sm',\n  items: [\n    { date: ago(20), title: 'User 1 changed the status to Status 1', tone: 'success' },\n    { date: ago(180), title: 'User 2 added a comment', text: '“A short example comment.”', tone: 'info' },\n    { date: ago(60 * 26), title: 'User 1 created the record', tone: 'neutral' }\n  ]\n});\n:::\n\n:::script label=\"Alternate layout\" expected=\"a centred line with milestones on both sides, the date across from each one; on a narrow screen it becomes one column\"\nreturn await slice.build('Timeline', {\n  layout: 'alternate',\n  dateFormat: 'year',\n  marker: 'icon',\n  variant: 'filled',\n  items: [\n    { date: '2018-05-01', title: 'Milestone 1', icon: 'code', text: 'A short description of the first milestone.' },\n    { date: '2021-02-01', title: 'Milestone 2', icon: 'map-pin', text: 'A short description of the second milestone.' },\n    { date: '2024-09-01', title: 'Milestone 3', icon: 'terminal', text: 'A short description of the third milestone.' },\n    { date: '2026-03-01', title: 'Milestone 4', icon: 'globe', text: 'A short description of the fourth milestone.' }\n  ]\n});\n:::\n\n## Best Practices\n:::tip\nPick one date format for the whole timeline. Mixing \"3 hours ago\" and \"Mar 2, 2026\" makes readers compare two scales.\n:::\n\n:::tip\nUse `dateLabel` for ranges and fuzzy dates (\"2019 — 2022\", \"Spring 2025\"); keep `date` too when you sort or group, so the order stays right.\n:::\n\n## Pitfalls\n:::warning\n`upcoming` is not \"disabled\". It says something has not happened yet; do not use it to hide events.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            let props = {};
            if ("{\n  \"items\": [\n    { \"date\": \"2026-03-02\", \"title\": \"Event 3\", \"text\": \"A short description of the third event.\" },\n    { \"date\": \"2025-11-20\", \"title\": \"Event 2\", \"text\": \"A short description of the second event.\" },\n    { \"date\": \"2025-06-01\", \"title\": \"Event 1\", \"text\": \"A short description of the first event.\" }\n  ]\n}") {
               try {
                  props = JSON.parse("{\n  \"items\": [\n    { \"date\": \"2026-03-02\", \"title\": \"Event 3\", \"text\": \"A short description of the third event.\" },\n    { \"date\": \"2025-11-20\", \"title\": \"Event 2\", \"text\": \"A short description of the second event.\" },\n    { \"date\": \"2025-06-01\", \"title\": \"Event 1\", \"text\": \"A short description of the first event.\" }\n  ]\n}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('Timeline', props);
            container.appendChild(component);
         }
       }
      {
         const container = this.querySelector('[data-block-id="doc-block-7"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"layout\",\"type\":\"string\",\"required\":false,\"default\":\"stacked\",\"allowedValues\":[\"stacked\",\"split\",\"alternate\"]},{\"path\":\"dateFormat\",\"type\":\"string\",\"required\":false,\"default\":\"date\",\"allowedValues\":[\"date\",\"datetime\",\"time\",\"month\",\"year\",\"relative\",\"none\"]},{\"path\":\"groupBy\",\"type\":\"string\",\"required\":false,\"default\":\"none\",\"allowedValues\":[\"none\",\"year\",\"month\",\"day\"]},{\"path\":\"sort\",\"type\":\"string\",\"required\":false,\"default\":\"none\",\"allowedValues\":[\"none\",\"newest\",\"oldest\"]},{\"path\":\"marker\",\"type\":\"string\",\"required\":false,\"default\":\"dot\",\"allowedValues\":[\"dot\",\"icon\"]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"soft\",\"allowedValues\":[\"soft\",\"filled\",\"outlined\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"headingLevel\",\"type\":\"number\",\"required\":false,\"default\":\"3\",\"allowedValues\":[]},{\"path\":\"locale\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"layout\",\"type\":\"string\",\"required\":false,\"default\":\"stacked\",\"allowedValues\":[\"stacked\",\"split\",\"alternate\"]},{\"path\":\"dateFormat\",\"type\":\"string\",\"required\":false,\"default\":\"date\",\"allowedValues\":[\"date\",\"datetime\",\"time\",\"month\",\"year\",\"relative\",\"none\"]},{\"path\":\"groupBy\",\"type\":\"string\",\"required\":false,\"default\":\"none\",\"allowedValues\":[\"none\",\"year\",\"month\",\"day\"]},{\"path\":\"sort\",\"type\":\"string\",\"required\":false,\"default\":\"none\",\"allowedValues\":[\"none\",\"newest\",\"oldest\"]},{\"path\":\"marker\",\"type\":\"string\",\"required\":false,\"default\":\"dot\",\"allowedValues\":[\"dot\",\"icon\"]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"soft\",\"allowedValues\":[\"soft\",\"filled\",\"outlined\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\"]},{\"path\":\"headingLevel\",\"type\":\"number\",\"required\":false,\"default\":\"3\",\"allowedValues\":[]},{\"path\":\"locale\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"Stepper","path":"/docs/display/stepper"},{"text":"DataList","path":"/docs/data/datalist"},{"text":"Table","path":"/docs/data/table"}];
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

customElements.define('slice-timelinedocumentation', TimelineDocumentation);
