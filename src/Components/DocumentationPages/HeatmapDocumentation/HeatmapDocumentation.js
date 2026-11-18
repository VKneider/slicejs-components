export default class HeatmapDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A year of activity","expected":"a section header with the total and a calendar of the last 52 weeks in green with month and weekday names, a legend Less…More and a summary; busier on weekdays, quiet on weekends; on a phone it scrolls and starts at the latest weeks","kind":"script","content":"// Deterministic sample data: busier on weekdays, a quiet holiday stretch.\nlet seed = 7;\nconst random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);\nconst data = [];\nconst end = new Date(2026, 10, 8);\nfor (let i = 0; i < 364; i++) {\n  const day = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);\n  const weekend = day.getDay() === 0 || day.getDay() === 6;\n  const holiday = day.getMonth() === 7 && day.getDate() < 20;\n  const value = holiday ? 0 : Math.max(0, Math.round((weekend ? 1.2 : 5) * random() * random() * 3 - (weekend ? 1 : 0)));\n  if (value) data.push({ date: day, value });\n}\nconst total = data.reduce((sum, d) => sum + d.value, 0);\nconst section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:16px;width:100%;min-width:0';\nsection.append(\n  await slice.build('SectionHeader', { size: 'sm', title: `${total.toLocaleString('en')} activity in the last year` }),\n  await slice.build('Heatmap', {\n    end,\n    data,\n    summary: true,\n    label: (cell) => `${cell.value || 'No'} activity on ${cell.date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`\n  })\n);\nreturn section;"},{"label":"When do visitors come (hour × weekday)","expected":"a grid of 7 weekdays by 15 hours (8 to 22) in the accent tone with bigger cells; peaks around 9–11 and 19–21 on weekdays; hovering a cell says how many visits; clicking one writes its detail below","kind":"script","content":"const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];\nconst hours = Array.from({ length: 15 }, (_, i) => String(8 + i));\nconst data = [];\ndays.forEach((day, d) => hours.forEach((hour, h) => {\n  const hr = 8 + h;\n  const morning = Math.max(0, 6 - Math.abs(hr - 10) * 2);\n  const evening = Math.max(0, 7 - Math.abs(hr - 20) * 2);\n  const weekend = d >= 5 ? 0.6 : 1;\n  data.push({ row: day, column: hour, value: Math.round((morning + evening + 1) * weekend * 14 + ((d * 7 + h * 3) % 9)) });\n}));\nconst detail = document.createElement('p');\ndetail.style.cssText = 'margin:8px 0 0;font-size:.85rem;opacity:.8';\ndetail.textContent = 'Click a cell to see its detail.';\nconst heatmap = await slice.build('Heatmap', {\n  type: 'grid',\n  rows: days,\n  columns: hours,\n  data,\n  tone: 'accent',\n  cellSize: 26,\n  label: (cell) => `${cell.row} ${cell.column}:00 — ${cell.value} visits`,\n  onCellClick: (cell) => { detail.textContent = `${cell.row} between ${cell.column}:00 and ${Number(cell.column) + 1}:00: ${cell.value} visits.`; }\n});\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%;min-width:0';\nbox.append(heatmap, detail);\nreturn box;"},{"label":"Study days of a semester (thresholds)","expected":"a calendar from September to December starting on Monday, in the info tone, with fixed steps: 1–29 minutes, 30–59, 60–119 and two hours or more; the legend shows the five steps","kind":"script","content":"let seed = 3;\nconst random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);\nconst data = [];\nfor (let d = new Date(2026, 8, 1); d <= new Date(2026, 11, 15); d.setDate(d.getDate() + 1)) {\n  if (random() < 0.62) data.push({ date: new Date(d), value: Math.round(random() * 150) });\n}\nreturn await slice.build('Heatmap', {\n  start: '2026-09-01',\n  end: '2026-12-15',\n  weekStart: 1,\n  tone: 'info',\n  cellSize: 16,\n  data,\n  thresholds: [1, 30, 60, 120],\n  formatValue: (minutes) => minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`\n});"}];
  }

  async init() {
    this.markdownPath = "heatmap.md";
    this.markdownContent = "---\ntitle: Heatmap\nroute: /docs/display/heatmap\nnavLabel: Heatmap\nsection: Display\ngroup: Content\norder: 47\ndescription: How much, where in a grid — activity per day over a year, or any two dimensions such as hour × weekday. Colour steps from the theme, a legend, a tip on hover and focus, and a keyboard grid where every cell has its own text.\ncomponent: HeatmapDocumentation\ngenerate: true\ntags: [heatmap, calendar, activity, contributions, chart, grid, data, display]\n---\n\n# Heatmap\n\n## Overview\n`Heatmap` shows how much of something there is in each cell of a grid, as colour: the stronger the colour, the higher the value.\n\n- **`type: 'calendar'`** (default) lays out days: one column per week, one row per weekday — the activity of a year, the study days of a semester, the sales of a quarter.\n- **`type: 'grid'`** takes any two dimensions with your labels: hour × weekday, product × region, lesson × student.\n\n### When to use it\n- **Patterns over time**: which days are busy, gaps, streaks.\n- **Two dimensions at once**: when do people visit (hour × weekday), which lessons are hard (student × exercise).\n- **A glance at a lot of values** where the exact number matters less than the shape.\n\n### When not to use it\n- **Exact numbers to compare or read**: a [Table](/docs/data/table).\n- **One series over time** (a trend): a line or bar chart.\n- **Few values** (under a dozen): a list or a small table says it better.\n\n## Core Behavior\n- `data` for a calendar: `[{ date, value }]` or `{ '2026-03-02': 4 }` (the same day twice adds up). For a grid: `[{ row, column, value }]`, with `row` and `column` as labels from `rows` / `columns` or as indexes.\n- `start` and `end` (calendar): the range. By default, the 52 weeks up to today. `weekStart`: `0` Sunday, `1` Monday, `-1` (default) the locale's.\n- `levels` (default `5`, counting the empty one) and `thresholds`: the lowest value of each step after the empty one (`[1, 4, 8, 12]`). Without thresholds the steps split 0…max evenly.\n- `label(cell)` writes each cell's text (for the tip and screen readers); by default \"Mon, Mar 2, 2026: 4\" or \"Mon, 9: 12\". `formatValue(value)` changes only how values are written.\n- `onCellClick(cell, { event })` and the `cell-click` event: `cell` is `{ date | row, column, value, level }`. `cells` returns them all.\n- `summary: true` adds \"1,284 in total\"; `legend` (default on) shows Less ▢▢▢▢ More.\n\n### Keyboard and screen readers\nIt is an ARIA grid with one Tab stop (the latest day in a calendar): arrows move between cells, skipping the days outside the range; Home / End go to the ends of a row; Enter or Space reports the cell. Every cell has its own text, so colour is never the only way to read it; the focused or hovered cell shows it in a tip.\n\n## Looks\n- `tone`: the colour (`success` by default, like a contributions graph). `cellSize` in px (default `12`); the gap scales with it.\n- `labels`: month and weekday names (calendar) or row and column labels (grid). A calendar wider than its box scrolls, and opens on its most recent weeks.\n- CSS variables: `--slice-heatmap-color`, `--slice-heatmap-empty`, `--slice-heatmap-radius`.\n\n## Live Preview\n:::component name=\"Heatmap\"\n{\n  \"start\": \"2026-01-01\",\n  \"end\": \"2026-03-31\",\n  \"data\": { \"2026-01-05\": 2, \"2026-01-06\": 5, \"2026-01-12\": 1, \"2026-01-20\": 8, \"2026-02-02\": 3, \"2026-02-03\": 4, \"2026-02-17\": 9, \"2026-03-03\": 2, \"2026-03-10\": 6, \"2026-03-24\": 12 }\n}\n:::\n\n## Examples\n:::script label=\"A year of activity\" expected=\"a section header with the total and a calendar of the last 52 weeks in green with month and weekday names, a legend Less…More and a summary; busier on weekdays, quiet on weekends; on a phone it scrolls and starts at the latest weeks\"\n// Deterministic sample data: busier on weekdays, a quiet holiday stretch.\nlet seed = 7;\nconst random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);\nconst data = [];\nconst end = new Date(2026, 10, 8);\nfor (let i = 0; i < 364; i++) {\n  const day = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);\n  const weekend = day.getDay() === 0 || day.getDay() === 6;\n  const holiday = day.getMonth() === 7 && day.getDate() < 20;\n  const value = holiday ? 0 : Math.max(0, Math.round((weekend ? 1.2 : 5) * random() * random() * 3 - (weekend ? 1 : 0)));\n  if (value) data.push({ date: day, value });\n}\nconst total = data.reduce((sum, d) => sum + d.value, 0);\nconst section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:16px;width:100%;min-width:0';\nsection.append(\n  await slice.build('SectionHeader', { size: 'sm', title: `${total.toLocaleString('en')} activity in the last year` }),\n  await slice.build('Heatmap', {\n    end,\n    data,\n    summary: true,\n    label: (cell) => `${cell.value || 'No'} activity on ${cell.date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`\n  })\n);\nreturn section;\n:::\n\n:::script label=\"When do visitors come (hour × weekday)\" expected=\"a grid of 7 weekdays by 15 hours (8 to 22) in the accent tone with bigger cells; peaks around 9–11 and 19–21 on weekdays; hovering a cell says how many visits; clicking one writes its detail below\"\nconst days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];\nconst hours = Array.from({ length: 15 }, (_, i) => String(8 + i));\nconst data = [];\ndays.forEach((day, d) => hours.forEach((hour, h) => {\n  const hr = 8 + h;\n  const morning = Math.max(0, 6 - Math.abs(hr - 10) * 2);\n  const evening = Math.max(0, 7 - Math.abs(hr - 20) * 2);\n  const weekend = d >= 5 ? 0.6 : 1;\n  data.push({ row: day, column: hour, value: Math.round((morning + evening + 1) * weekend * 14 + ((d * 7 + h * 3) % 9)) });\n}));\nconst detail = document.createElement('p');\ndetail.style.cssText = 'margin:8px 0 0;font-size:.85rem;opacity:.8';\ndetail.textContent = 'Click a cell to see its detail.';\nconst heatmap = await slice.build('Heatmap', {\n  type: 'grid',\n  rows: days,\n  columns: hours,\n  data,\n  tone: 'accent',\n  cellSize: 26,\n  label: (cell) => `${cell.row} ${cell.column}:00 — ${cell.value} visits`,\n  onCellClick: (cell) => { detail.textContent = `${cell.row} between ${cell.column}:00 and ${Number(cell.column) + 1}:00: ${cell.value} visits.`; }\n});\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%;min-width:0';\nbox.append(heatmap, detail);\nreturn box;\n:::\n\n:::script label=\"Study days of a semester (thresholds)\" expected=\"a calendar from September to December starting on Monday, in the info tone, with fixed steps: 1–29 minutes, 30–59, 60–119 and two hours or more; the legend shows the five steps\"\nlet seed = 3;\nconst random = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);\nconst data = [];\nfor (let d = new Date(2026, 8, 1); d <= new Date(2026, 11, 15); d.setDate(d.getDate() + 1)) {\n  if (random() < 0.62) data.push({ date: new Date(d), value: Math.round(random() * 150) });\n}\nreturn await slice.build('Heatmap', {\n  start: '2026-09-01',\n  end: '2026-12-15',\n  weekStart: 1,\n  tone: 'info',\n  cellSize: 16,\n  data,\n  thresholds: [1, 30, 60, 120],\n  formatValue: (minutes) => minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`\n});\n:::\n\n## Best Practices\n:::tip\nWrite a `label` that says the unit (\"3 contributions on Mar 2\"). The default only knows the number.\n:::\n\n:::tip\nUse `thresholds` when the steps mean something (30 minutes, an hour, two hours). Even steps change meaning every time the maximum changes.\n:::\n\n## Pitfalls\n:::warning\nA heatmap shows a pattern, not exact values. If people need to compare numbers, give them the table too.\n:::\n\n:::related\n- [Table](/docs/data/table) - The same numbers as cells.\n- [Timeline](/docs/display/timeline) - The same events in order.\n- [Tooltip](/docs/display/tooltip) - The value behind a square.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            let props = {};
            if ("{\n  \"start\": \"2026-01-01\",\n  \"end\": \"2026-03-31\",\n  \"data\": { \"2026-01-05\": 2, \"2026-01-06\": 5, \"2026-01-12\": 1, \"2026-01-20\": 8, \"2026-02-02\": 3, \"2026-02-03\": 4, \"2026-02-17\": 9, \"2026-03-03\": 2, \"2026-03-10\": 6, \"2026-03-24\": 12 }\n}") {
               try {
                  props = JSON.parse("{\n  \"start\": \"2026-01-01\",\n  \"end\": \"2026-03-31\",\n  \"data\": { \"2026-01-05\": 2, \"2026-01-06\": 5, \"2026-01-12\": 1, \"2026-01-20\": 8, \"2026-02-02\": 3, \"2026-02-03\": 4, \"2026-02-17\": 9, \"2026-03-03\": 2, \"2026-03-10\": 6, \"2026-03-24\": 12 }\n}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('Heatmap', props);
            container.appendChild(component);
         }
       }
      {
         const container = this.querySelector('[data-block-id="doc-block-5"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Write a <code>label</code> that says the unit (\"3 contributions on Mar 2\"). The default only knows the number.</p>";
            const callout = await slice.build('Callout', {
               tone: "success",
               variant: "soft",
               title: "Tip",
               content: Array.from(body.childNodes)
            });
            container.appendChild(callout || body);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-6"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Use <code>thresholds</code> when the steps mean something (30 minutes, an hour, two hours). Even steps change meaning every time the maximum changes.</p>";
            const callout = await slice.build('Callout', {
               tone: "success",
               variant: "soft",
               title: "Tip",
               content: Array.from(body.childNodes)
            });
            container.appendChild(callout || body);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-7"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>A heatmap shows a pattern, not exact values. If people need to compare numbers, give them the table too.</p>";
            const callout = await slice.build('Callout', {
               tone: "warning",
               variant: "soft",
               title: "Warning",
               content: Array.from(body.childNodes)
            });
            container.appendChild(callout || body);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-8"]');
         if (container) {
            const items = [{"title":"Table","path":"/docs/data/table","text":"The same numbers as cells."},{"title":"Timeline","path":"/docs/display/timeline","text":"The same events in order."},{"title":"Tooltip","path":"/docs/display/tooltip","text":"The value behind a square."}];
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
         const container = this.querySelector('[data-block-id="doc-block-9"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"type\",\"type\":\"string\",\"required\":false,\"default\":\"calendar\",\"allowedValues\":[\"calendar\",\"grid\"]},{\"path\":\"data\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"rows\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"columns\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"start\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"end\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"weekStart\",\"type\":\"number\",\"required\":false,\"default\":\"-1\",\"allowedValues\":[]},{\"path\":\"levels\",\"type\":\"number\",\"required\":false,\"default\":\"5\",\"allowedValues\":[]},{\"path\":\"thresholds\",\"type\":\"array\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"success\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"cellSize\",\"type\":\"number\",\"required\":false,\"default\":\"12\",\"allowedValues\":[]},{\"path\":\"labels\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"legend\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"summary\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"label\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"formatValue\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"locale\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"onCellClick\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"type\",\"type\":\"string\",\"required\":false,\"default\":\"calendar\",\"allowedValues\":[\"calendar\",\"grid\"]},{\"path\":\"data\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"rows\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"columns\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"start\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"end\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"weekStart\",\"type\":\"number\",\"required\":false,\"default\":\"-1\",\"allowedValues\":[]},{\"path\":\"levels\",\"type\":\"number\",\"required\":false,\"default\":\"5\",\"allowedValues\":[]},{\"path\":\"thresholds\",\"type\":\"array\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"success\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"cellSize\",\"type\":\"number\",\"required\":false,\"default\":\"12\",\"allowedValues\":[]},{\"path\":\"labels\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"legend\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"summary\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"label\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"formatValue\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"locale\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"onCellClick\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"Table","path":"/docs/data/table"}];
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

customElements.define('slice-heatmapdocumentation', HeatmapDocumentation);
