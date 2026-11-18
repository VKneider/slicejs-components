export default class QuoteDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"Quotes carousel","expected":"a section header 'Section title' and a carousel of outlined quotes with initials avatars and star ratings: one per view on a phone, two on a tablet, three on a wide screen; arrows, dots, it loops and moves every 7 seconds unless hovered or focused, with a pause button","kind":"script","content":"const quotes = [\n  { text: 'Short example quote text.', author: 'Author 1', jobTitle: 'Role 1', rating: 5 },\n  { text: 'A longer example quote that shows how the text wraps in a card.', author: 'Author 2', jobTitle: 'Role 2', organization: 'Company 2', rating: 5 },\n  { text: 'Another example quote with a different length.', author: 'Author 3', jobTitle: 'Role 3', rating: 4.5 },\n  { text: 'A fourth example quote for the carousel.', author: 'Author 4', jobTitle: 'Role 4', organization: 'Company 4', rating: 5 },\n  { text: 'A fifth example quote.', author: 'Author 5', jobTitle: 'Role 5', rating: 4 }\n];\n\nconst slides = await Promise.all(quotes.map((q) => slice.build('Quote', {\n  ...q,\n  avatar: true,\n  variant: 'outlined',\n  size: 'sm'\n})));\n\nconst section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:24px;width:100%;min-width:0';\nsection.append(\n  await slice.build('SectionHeader', {\n    align: 'center',\n    eyebrow: 'Section',\n    title: 'Section title',\n    description: 'A short description for this section.'\n  }),\n  await slice.build('ElementCarrousel', {\n    label: 'Quotes',\n    elements: slides,\n    perView: { 0: 1, 560: 2, 900: 3 },\n    gap: 16,\n    arrows: 'outside',\n    loop: true,\n    autoplay: 7000\n  })\n);\nreturn section;"},{"label":"A leading quote","expected":"one large centred quote on a soft background with a big coloured quotation mark, the author's initials, name and title under it, and a link to read more","kind":"script","content":"return await slice.build('Quote', {\n  size: 'lg',\n  align: 'center',\n  variant: 'soft',\n  text: 'An example quote that leads this section.',\n  author: 'Author 1',\n  jobTitle: 'Role 1',\n  organization: 'Company 1',\n  avatar: true,\n  source: 'Read more',\n  href: '/docs'\n});"},{"label":"Quotes in a grid","expected":"three soft quote cards side by side (stacking on small screens), each with stars, text of different length and the author at the bottom aligned across the row","kind":"script","content":"const grid = document.createElement('div');\ngrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;width:100%';\nfor (const quote of [\n  { rating: 5, text: 'Short example quote text.', author: 'Author 1', source: 'Source 1' },\n  { rating: 4, text: 'A longer example quote that shows how the text wraps and how the caption stays aligned across the row.', author: 'Author 2', source: 'Source 2' },\n  { rating: 5, text: 'Another example quote.', author: 'Author 3', source: 'Source 3' }\n]) {\n  grid.append(await slice.build('Quote', { ...quote, variant: 'soft', size: 'sm', mark: false, avatar: true }));\n}\nreturn grid;"},{"label":"A quotation inside an article","expected":"a paragraph of an article followed by a plain neutral quote with its author and source in the caption, and the article continuing after it","kind":"script","content":"const article = document.createElement('article');\narticle.style.cssText = 'display:grid;gap:16px;width:100%;max-width:640px;line-height:1.7';\nconst p = (text) => {\n  const el = document.createElement('p');\n  el.style.margin = '0';\n  el.textContent = text;\n  return el;\n};\narticle.append(\n  p('A paragraph of example text that introduces the quotation below.'),\n  await slice.build('Quote', {\n    tone: 'neutral',\n    text: 'An example quotation inside an article.',\n    author: 'Author 1',\n    source: 'Source 1'\n  }),\n  p('The article continues after the quotation.')\n);\nreturn article;"}];
  }

  async init() {
    this.markdownPath = "quote.md";
    this.markdownContent = "---\ntitle: Quote\nroute: /docs/display/quote\nnavLabel: Quote\nsection: Display\ngroup: Content\norder: 45\ndescription: What someone said and who said it — testimonials, reviews, a line from an interview. A figure with a blockquote and a caption, an avatar, a star rating and the source; in a grid or one at a time in a carousel.\ncomponent: QuoteDocumentation\ngenerate: true\ntags: [quote, testimonial, review, blockquote, rating, carousel, content, display]\n---\n\n# Quote\n\n## Overview\n`Quote` shows what someone said, and who said it: a client's testimonial on a landing, a student's review of a course, a line from an interview inside an article.\n\nIt is a `<figure>`: the words in a `<blockquote>`, the person in a `<figcaption>` (name, job title, organization, an avatar) and, when there is one, where it was said (`<cite>`). Several quotes in a grid, or one at a time in an [ElementCarrousel](/docs/layout/element-carrousel), make a testimonials section.\n\n### When to use it\n- **Testimonials** from clients, students or users.\n- **Reviews** with a star rating.\n- **A quotation inside an article** or a lesson, with its source.\n- **One leading quote** at the top of a section (`size: 'lg'`, `align: 'center'`).\n\n### When not to use it\n- **A highlighted note or tip that nobody \"said\"**: a [Callout](/docs/display/callout).\n- **A comment thread or chat** (replies, timestamps, actions): a list built for it.\n- **Fake or anonymous praise**. A testimonial is only worth something if it is real: keep the person's name, and their permission.\n\n## Core Behavior\n- `text`: one paragraph, or an array of paragraphs. Always text, never markup.\n- `author`, `jobTitle` and `organization` (\"Job title, Company\") go in the caption. (`jobTitle`, not `role`: `role` is the element's ARIA role.)\n- `avatar`: an image URL, `true` for the author's initials, `''` for none. It is an [Avatar](/docs/display/avatar), hidden from screen readers because the name is right next to it.\n- `rating`: `0` (none) to `5`, halves allowed. The row of stars has one accessible name (\"Rated 4.5 out of 5\"); `texts: { rating: '…' }` changes it.\n- `source` (\"Google review\", \"Interview, 2024\") and `href`: the source becomes a link (a new tab for an external URL) and the blockquote's `cite`.\n\n## Looks\n- `variant`: `plain` (default), `soft` or `outlined`. `size`: `sm`, `md` or `lg`. `align`: `start` or `center`.\n- `tone`: the colour of the opening quotation mark; `mark: false` removes it.\n- In a row of quotes, the caption sits at the bottom, so cards of different lengths line up.\n- CSS variables: `--slice-quote-text-size`, `--slice-quote-pad`, `--slice-quote-radius`, `--slice-quote-star`.\n\n## Live Preview\n:::component name=\"Quote\"\n{\n  \"text\": \"Example quote text for this component.\",\n  \"author\": \"Author 1\",\n  \"jobTitle\": \"Role 1\",\n  \"organization\": \"Company 1\",\n  \"avatar\": true,\n  \"rating\": 5,\n  \"variant\": \"outlined\"\n}\n:::\n\n## Examples\n:::script label=\"Quotes carousel\" expected=\"a section header 'Section title' and a carousel of outlined quotes with initials avatars and star ratings: one per view on a phone, two on a tablet, three on a wide screen; arrows, dots, it loops and moves every 7 seconds unless hovered or focused, with a pause button\"\nconst quotes = [\n  { text: 'Short example quote text.', author: 'Author 1', jobTitle: 'Role 1', rating: 5 },\n  { text: 'A longer example quote that shows how the text wraps in a card.', author: 'Author 2', jobTitle: 'Role 2', organization: 'Company 2', rating: 5 },\n  { text: 'Another example quote with a different length.', author: 'Author 3', jobTitle: 'Role 3', rating: 4.5 },\n  { text: 'A fourth example quote for the carousel.', author: 'Author 4', jobTitle: 'Role 4', organization: 'Company 4', rating: 5 },\n  { text: 'A fifth example quote.', author: 'Author 5', jobTitle: 'Role 5', rating: 4 }\n];\n\nconst slides = await Promise.all(quotes.map((q) => slice.build('Quote', {\n  ...q,\n  avatar: true,\n  variant: 'outlined',\n  size: 'sm'\n})));\n\nconst section = document.createElement('section');\nsection.style.cssText = 'display:grid;gap:24px;width:100%;min-width:0';\nsection.append(\n  await slice.build('SectionHeader', {\n    align: 'center',\n    eyebrow: 'Section',\n    title: 'Section title',\n    description: 'A short description for this section.'\n  }),\n  await slice.build('ElementCarrousel', {\n    label: 'Quotes',\n    elements: slides,\n    perView: { 0: 1, 560: 2, 900: 3 },\n    gap: 16,\n    arrows: 'outside',\n    loop: true,\n    autoplay: 7000\n  })\n);\nreturn section;\n:::\n\n:::script label=\"A leading quote\" expected=\"one large centred quote on a soft background with a big coloured quotation mark, the author's initials, name and title under it, and a link to read more\"\nreturn await slice.build('Quote', {\n  size: 'lg',\n  align: 'center',\n  variant: 'soft',\n  text: 'An example quote that leads this section.',\n  author: 'Author 1',\n  jobTitle: 'Role 1',\n  organization: 'Company 1',\n  avatar: true,\n  source: 'Read more',\n  href: '/docs'\n});\n:::\n\n:::script label=\"Quotes in a grid\" expected=\"three soft quote cards side by side (stacking on small screens), each with stars, text of different length and the author at the bottom aligned across the row\"\nconst grid = document.createElement('div');\ngrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;width:100%';\nfor (const quote of [\n  { rating: 5, text: 'Short example quote text.', author: 'Author 1', source: 'Source 1' },\n  { rating: 4, text: 'A longer example quote that shows how the text wraps and how the caption stays aligned across the row.', author: 'Author 2', source: 'Source 2' },\n  { rating: 5, text: 'Another example quote.', author: 'Author 3', source: 'Source 3' }\n]) {\n  grid.append(await slice.build('Quote', { ...quote, variant: 'soft', size: 'sm', mark: false, avatar: true }));\n}\nreturn grid;\n:::\n\n:::script label=\"A quotation inside an article\" expected=\"a paragraph of an article followed by a plain neutral quote with its author and source in the caption, and the article continuing after it\"\nconst article = document.createElement('article');\narticle.style.cssText = 'display:grid;gap:16px;width:100%;max-width:640px;line-height:1.7';\nconst p = (text) => {\n  const el = document.createElement('p');\n  el.style.margin = '0';\n  el.textContent = text;\n  return el;\n};\narticle.append(\n  p('A paragraph of example text that introduces the quotation below.'),\n  await slice.build('Quote', {\n    tone: 'neutral',\n    text: 'An example quotation inside an article.',\n    author: 'Author 1',\n    source: 'Source 1'\n  }),\n  p('The article continues after the quotation.')\n);\nreturn article;\n:::\n\n## Best Practices\n:::tip\nKeep testimonials short and specific: what changed for that person (\"I used the final project in my first interview\") says more than general praise.\n:::\n\n:::tip\nIn a carousel, show several quotes per view on wide screens (`perView: { 0: 1, 560: 2, 900: 3 }`) and keep autoplay slow; people need time to read a whole quote.\n:::\n\n## Pitfalls\n:::warning\nDo not put links or buttons inside the quote text. If the testimonial leads somewhere (a case study), put that link after the quote.\n:::\n\n:::related\n- [Callout](/docs/display/callout) - A note from the page itself.\n- [Card](/docs/layout/card) - A testimonial with a face.\n- [Section header](/docs/display/section-header) - A quote as a section lede.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            let props = {};
            if ("{\n  \"text\": \"Example quote text for this component.\",\n  \"author\": \"Author 1\",\n  \"jobTitle\": \"Role 1\",\n  \"organization\": \"Company 1\",\n  \"avatar\": true,\n  \"rating\": 5,\n  \"variant\": \"outlined\"\n}") {
               try {
                  props = JSON.parse("{\n  \"text\": \"Example quote text for this component.\",\n  \"author\": \"Author 1\",\n  \"jobTitle\": \"Role 1\",\n  \"organization\": \"Company 1\",\n  \"avatar\": true,\n  \"rating\": 5,\n  \"variant\": \"outlined\"\n}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('Quote', props);
            container.appendChild(component);
         }
       }
      {
         const container = this.querySelector('[data-block-id="doc-block-6"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Keep testimonials short and specific: what changed for that person (\"I used the final project in my first interview\") says more than general praise.</p>";
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
            body.innerHTML = "<p>In a carousel, show several quotes per view on wide screens (<code>perView: { 0: 1, 560: 2, 900: 3 }</code>) and keep autoplay slow; people need time to read a whole quote.</p>";
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
         const container = this.querySelector('[data-block-id="doc-block-8"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Do not put links or buttons inside the quote text. If the testimonial leads somewhere (a case study), put that link after the quote.</p>";
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
         const container = this.querySelector('[data-block-id="doc-block-9"]');
         if (container) {
            const items = [{"title":"Callout","path":"/docs/display/callout","text":"A note from the page itself."},{"title":"Card","path":"/docs/layout/card","text":"A testimonial with a face."},{"title":"Section header","path":"/docs/display/section-header","text":"A quote as a section lede."}];
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
         const container = this.querySelector('[data-block-id="doc-block-10"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"text\",\"type\":\"any\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"author\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"jobTitle\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"organization\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"avatar\",\"type\":\"any\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"rating\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"source\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"href\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"plain\",\"allowedValues\":[\"plain\",\"soft\",\"outlined\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\",\"lg\"]},{\"path\":\"align\",\"type\":\"string\",\"required\":false,\"default\":\"start\",\"allowedValues\":[\"start\",\"center\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"mark\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"text\",\"type\":\"any\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"author\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"jobTitle\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"organization\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"avatar\",\"type\":\"any\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"rating\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"source\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"href\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"plain\",\"allowedValues\":[\"plain\",\"soft\",\"outlined\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\",\"lg\"]},{\"path\":\"align\",\"type\":\"string\",\"required\":false,\"default\":\"start\",\"allowedValues\":[\"start\",\"center\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"accent\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"mark\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"ElementCarrousel","path":"/docs/layout/element-carrousel"},{"text":"Callout","path":"/docs/display/callout"},{"text":"Avatar","path":"/docs/display/avatar"}];
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

customElements.define('slice-quotedocumentation', QuoteDocumentation);
