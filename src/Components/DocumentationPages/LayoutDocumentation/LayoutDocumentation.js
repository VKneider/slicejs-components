export default class LayoutDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"An admin panel that becomes a drawer","expected":"a framed app 'Acme Admin' with a sticky header, a sidebar of four links and a dashboard in main; the 'Phone width' button narrows the frame so the sidebar hides behind a menu button that opens it as a drawer","kind":"script","content":"const link = (text, current) => {\n  const a = document.createElement('a');\n  a.href = '#';\n  a.textContent = text;\n  a.style.cssText = `display:block;padding:9px 12px;border-radius:8px;text-decoration:none;color:inherit;${current ? 'background:color-mix(in srgb, var(--primary-color) 14%, transparent);font-weight:600' : ''}`;\n  if (current) a.setAttribute('aria-current', 'page');\n  a.addEventListener('click', (e) => e.preventDefault());\n  return a;\n};\nconst nav = document.createElement('div');\nnav.style.cssText = 'display:grid;gap:2px;padding:12px';\nnav.append(link('Dashboard', true), link('Orders'), link('Customers'), link('Settings'));\n\nconst top = document.createElement('div');\ntop.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px';\nconst brand = document.createElement('strong');\nbrand.textContent = 'Acme Admin';\ntop.append(brand, await slice.build('Avatar', { name: 'Ana López', size: 'sm' }));\n\nconst dashboard = await slice.build('Grid', {\n  columns: { 0: 1, 520: 2 }, gap: 12,\n  items: [\n    await slice.build('Card', { title: '$48,210', subtitle: 'Revenue', variant: 'outlined' }),\n    await slice.build('Card', { title: '1,284', subtitle: 'Orders', variant: 'outlined' })\n  ]\n});\n\nconst app = await slice.build('Layout', {\n  landmarks: false,\n  stickyHeader: true,\n  sidebarWidth: 210,\n  collapseBelow: 640,\n  header: top,\n  sidebar: nav,\n  main: dashboard\n});\n// Assign style properties one by one: cssText would erase the width variables Layout sets on itself.\nObject.assign(app.style, { height: '380px', overflow: 'auto', border: '1px solid var(--slice-border-raised, #ddd)', borderRadius: '12px', transition: 'width .2s', width: '100%' });\n\nconst bar = document.createElement('div');\nbar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';\nbar.append(\n  await slice.build('Button', { value: 'Desktop width', variant: 'outlined', size: 'sm', onClick: () => { app.style.width = '100%'; } }),\n  await slice.build('Button', { value: 'Phone width', variant: 'outlined', size: 'sm', onClick: () => { app.style.width = '380px'; } })\n);\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(bar, app);\nreturn box;"},{"label":"A docs page with a table of contents","expected":"a three-column frame: a menu on the left, an article limited to a readable width in the middle, and an 'On this page' list in the aside on the right; a footer at the bottom","kind":"script","content":"const list = (title, items) => {\n  const box = document.createElement('div');\n  box.style.cssText = 'padding:14px;font-size:.88rem';\n  const h = document.createElement('p');\n  h.style.cssText = 'margin:0 0 8px;font-weight:700';\n  h.textContent = title;\n  const ul = document.createElement('ul');\n  ul.style.cssText = 'margin:0;padding:0;list-style:none;display:grid;gap:6px';\n  for (const item of items) {\n    const li = document.createElement('li');\n    li.textContent = item;\n    ul.append(li);\n  }\n  box.append(h, ul);\n  return box;\n};\nconst article = document.createElement('article');\narticle.style.lineHeight = '1.65';\nconst h1 = document.createElement('h2');\nh1.style.marginTop = '0';\nh1.textContent = 'Routing';\nconst p = document.createElement('p');\np.textContent = 'Routes map a path to a component. The router builds the component the first time the path is visited and keeps it, so going back is instant and the view keeps its state.';\narticle.append(h1, p, p.cloneNode(true));\nconst footer = document.createElement('div');\nfooter.style.cssText = 'padding:12px 16px;font-size:.8rem;opacity:.75';\nfooter.textContent = 'Edit this page on GitHub';\n\nconst docs = await slice.build('Layout', {\n  landmarks: false,\n  sidebarWidth: 180,\n  asideWidth: 180,\n  contentWidth: '60ch',\n  collapseBelow: 720,\n  sidebar: list('Guide', ['Install', 'Components', 'Routing', 'Themes']),\n  main: article,\n  aside: list('On this page', ['Defining routes', 'Parameters', 'Guards']),\n  footer\n});\nObject.assign(docs.style, { border: '1px solid var(--slice-border-raised, #ddd)', borderRadius: '12px', overflow: 'hidden' });\nreturn docs;"},{"label":"Swapping views with showing()","expected":"a frame with a sidebar of three buttons; each one shows its view in main, and coming back to a view keeps what was typed in it","kind":"script","content":"const views = {};\nfor (const name of ['Profile', 'Billing', 'Security']) {\n  const view = document.createElement('section');\n  const h = document.createElement('h3');\n  h.style.marginTop = '0';\n  h.textContent = name;\n  view.append(h, await slice.build('Input', { label: `${name} notes` }));\n  views[name] = view;\n}\nconst nav = document.createElement('div');\nnav.style.cssText = 'display:grid;gap:6px;padding:12px';\nconst settings = await slice.build('Layout', { landmarks: false, skipLink: false, sidebarWidth: 160, collapseBelow: 0, sidebar: nav });\nfor (const name of Object.keys(views)) {\n  nav.append(await slice.build('Button', { value: name, variant: 'ghost', onClick: () => settings.showing(views[name]) }));\n}\nawait settings.showing(views.Profile);\nObject.assign(settings.style, { border: '1px solid var(--slice-border-raised, #ddd)', borderRadius: '12px', overflow: 'hidden' });\nreturn settings;"}];
  }

  async init() {
    this.markdownPath = "layout.md";
    this.markdownContent = "---\ntitle: Layout\nroute: /docs/layout/layout\nnavLabel: Layout\nsection: Layout\ngroup: Containers\norder: 10\ndescription: The frame of an app or a site — header, sidebar, main, aside and footer, with landmarks, a skip link, a sticky header and a sidebar that becomes a drawer on narrow screens.\ncomponent: LayoutDocumentation\ngenerate: true\ntags: [layout, app shell, frame, sidebar, drawer, header, footer, landmarks, container]\n---\n\n# Layout\n\n## Overview\n`Layout` is the frame around a page: a **header** (logo, search, account), a **sidebar** (the app's navigation), the **main** content, an optional **aside** (filters, details, a table of contents) and a **footer**.\n\nYou give it the pieces; it does the parts that are easy to forget:\n\n- **Landmarks**: banner, navigation, main, complementary and contentinfo, so screen-reader users can jump between regions.\n- **\"Skip to content\"**: the first thing Tab reaches, hidden until focused.\n- **A drawer on narrow screens**: below `collapseBelow` (900px of the layout's own width) the sidebar slides in from the side behind a menu button. Escape and the backdrop close it, focus goes into it and back to the button, and a closed drawer is out of the tab order.\n- **A sticky header**, a sidebar that stays in view while the page scrolls (`fullHeight`), and a readable `contentWidth`.\n\n### When to use it\n- **The shell of an app**: a dashboard, an admin panel, a course platform — header, navigation, content.\n- **A documentation or blog site** with a menu, the article and a table of contents in the aside.\n- **The view swapper of a router**: `showing(view)` puts a view in main and removes the previous one.\n\n### When not to use it\n- **Arranging content inside a page** (cards, a gallery, a bento): [Grid](/docs/layout/grid).\n- **A single top bar** without a sidebar: a [Navbar](/docs/navigation/navbar) on its own.\n- **A panel that opens for one task** (a cart, a filter sheet): a [Modal](/docs/feedback/modal).\n- **Several layouts nested**. One frame per page; inside it, use Grid and plain sections.\n\n## Core Behavior\n- Regions: `header`, `sidebar`, `main`, `aside`, `footer` — each a node, a component, or an array of them. Setting one again replaces it; components that leave are destroyed, and so is everything in the regions when the layout is destroyed.\n- `showing(view)` shows `view` in main and removes the previous one **without destroying it** (a router keeps its views). `currentView` is what is shown.\n- `stickyHeader`, `fullHeight` (at least the window's height; sidebar and aside stay in view while main scrolls).\n- `sidebarWidth` (`260px`), `asideWidth` (`280px`), `contentWidth` (no limit by default; `'72ch'` for reading) — numbers are pixels.\n- `collapseBelow`: a number is a width **of the layout** (`900` by default; `0` never collapses); a string is a media query on the window (`'(max-width: 768px)'`) — use the same one as your Navbar's `breakpoint` so both switch at the same moment.\n- `collapsedSidebar`: `'drawer'` (default: the menu button and the slide-in panel) or `'hidden'` (no button; the app shows the sidebar's content somewhere else, such as a Navbar's `panelContent`, so the page keeps one menu button).\n- `sidebarOpen`, `toggleSidebar(open?)`, `collapsed` (read-only) and `onSidebarToggle(open)`.\n- `sidebarLabel` names the navigation landmark (\"Main navigation\"). `landmarks: false` removes the roles — for a layout shown inside another page, like the examples below.\n- `closeOnNavigate` (on by default): the drawer closes on every route change (`router:change`) and when a link inside it is followed. `focusOnNavigate` moves focus to main after each route change.\n- `skipLink` (on by default) and `texts` (`skip`, `menu`, `close`; English and Spanish built in).\n\n## With MultiRoute (app shell)\nThe usual frame of a Slice app: Layout around a [MultiRoute](/docs/routing/multi-route). MultiRoute lives in main and swaps its cached views there; Layout never rebuilds it. In `App.js`:\n\n```javascript\nconst routes = await slice.build('MultiRoute', {\n  routes: [\n    { path: '/', component: 'HomePage' },\n    { path: '/orders', component: 'OrdersPage' },\n    { path: '/orders/${id}', component: 'OrderDetailPage' },\n    { path: '/settings', component: 'SettingsPage' }\n  ]\n});\n\nconst menu = await slice.build('SideMenu', { /* links to /orders, /settings… */ });\nconst topBar = await slice.build('Navbar', { /* logo, search, account */ });\n\nconst app = await slice.build('Layout', {\n  header: topBar,\n  sidebar: menu,\n  main: routes,\n  sidebarLabel: 'Main navigation',\n  stickyHeader: true,\n  fullHeight: true,\n  focusOnNavigate: true,   // the new view is read after each navigation\n  contentWidth: '1100px'\n});\ndocument.body.appendChild(app);\n```\n\n- On a phone, following a link from the drawer closes it: the router's `router:change` closes it, and so does a click on any link inside it.\n- With `focusOnNavigate`, focus moves to main after each route change, so screen readers start the new view instead of staying on the menu link. Main is focused without scrolling; scroll restoration stays the router's.\n- Every path the MultiRoute shows must also be in `routes.js`, pointing at the shell (see MultiRoute).\n- Layout listens to `router:change` on `slice.events` and on `window`, and stops listening when it is destroyed.\n- Focus moves only on navigations, not on the first route of a page load, so Tab still starts at the top.\n- With a site Navbar fixed above the layout (outside it), set `--slice-layout-sticky-top` to the bar's height. With a Navbar that has its own mobile menu, use `collapseBelow: '(max-width: 768px)'` and `collapsedSidebar: 'hidden'`, and put the sidebar's content in the Navbar's `panelContent` on phones — this documentation site does exactly that.\n\n### Without regions\nWith no region props, Layout is the plain container it always was: `onLayOut(node)` and `showing(node)` append to the host, and `layout` / `view` are appended on init. Existing apps keep working unchanged.\n\n## Looks\nCSS variables: `--slice-layout-sidebar-width`, `--slice-layout-aside-width`, `--slice-layout-content-width`, `--slice-layout-pad` (main's padding), `--slice-layout-drawer-width`, `--slice-layout-surface`, `--slice-layout-panel` (the sidebar) and `--slice-layout-line` (the borders), and `--slice-layout-sticky-top`: the height of a fixed bar **outside** the layout (an app's Navbar), so the sticky header and sidebars stop under it. The host has `data-collapsed` and `data-sidebar-open` for your own styles.\n\n## Examples\n:::script label=\"An admin panel that becomes a drawer\" expected=\"a framed app 'Acme Admin' with a sticky header, a sidebar of four links and a dashboard in main; the 'Phone width' button narrows the frame so the sidebar hides behind a menu button that opens it as a drawer\"\nconst link = (text, current) => {\n  const a = document.createElement('a');\n  a.href = '#';\n  a.textContent = text;\n  a.style.cssText = `display:block;padding:9px 12px;border-radius:8px;text-decoration:none;color:inherit;${current ? 'background:color-mix(in srgb, var(--primary-color) 14%, transparent);font-weight:600' : ''}`;\n  if (current) a.setAttribute('aria-current', 'page');\n  a.addEventListener('click', (e) => e.preventDefault());\n  return a;\n};\nconst nav = document.createElement('div');\nnav.style.cssText = 'display:grid;gap:2px;padding:12px';\nnav.append(link('Dashboard', true), link('Orders'), link('Customers'), link('Settings'));\n\nconst top = document.createElement('div');\ntop.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px';\nconst brand = document.createElement('strong');\nbrand.textContent = 'Acme Admin';\ntop.append(brand, await slice.build('Avatar', { name: 'Ana López', size: 'sm' }));\n\nconst dashboard = await slice.build('Grid', {\n  columns: { 0: 1, 520: 2 }, gap: 12,\n  items: [\n    await slice.build('Card', { title: '$48,210', subtitle: 'Revenue', variant: 'outlined' }),\n    await slice.build('Card', { title: '1,284', subtitle: 'Orders', variant: 'outlined' })\n  ]\n});\n\nconst app = await slice.build('Layout', {\n  landmarks: false,\n  stickyHeader: true,\n  sidebarWidth: 210,\n  collapseBelow: 640,\n  header: top,\n  sidebar: nav,\n  main: dashboard\n});\n// Assign style properties one by one: cssText would erase the width variables Layout sets on itself.\nObject.assign(app.style, { height: '380px', overflow: 'auto', border: '1px solid var(--slice-border-raised, #ddd)', borderRadius: '12px', transition: 'width .2s', width: '100%' });\n\nconst bar = document.createElement('div');\nbar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';\nbar.append(\n  await slice.build('Button', { value: 'Desktop width', variant: 'outlined', size: 'sm', onClick: () => { app.style.width = '100%'; } }),\n  await slice.build('Button', { value: 'Phone width', variant: 'outlined', size: 'sm', onClick: () => { app.style.width = '380px'; } })\n);\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(bar, app);\nreturn box;\n:::\n\n:::script label=\"A docs page with a table of contents\" expected=\"a three-column frame: a menu on the left, an article limited to a readable width in the middle, and an 'On this page' list in the aside on the right; a footer at the bottom\"\nconst list = (title, items) => {\n  const box = document.createElement('div');\n  box.style.cssText = 'padding:14px;font-size:.88rem';\n  const h = document.createElement('p');\n  h.style.cssText = 'margin:0 0 8px;font-weight:700';\n  h.textContent = title;\n  const ul = document.createElement('ul');\n  ul.style.cssText = 'margin:0;padding:0;list-style:none;display:grid;gap:6px';\n  for (const item of items) {\n    const li = document.createElement('li');\n    li.textContent = item;\n    ul.append(li);\n  }\n  box.append(h, ul);\n  return box;\n};\nconst article = document.createElement('article');\narticle.style.lineHeight = '1.65';\nconst h1 = document.createElement('h2');\nh1.style.marginTop = '0';\nh1.textContent = 'Routing';\nconst p = document.createElement('p');\np.textContent = 'Routes map a path to a component. The router builds the component the first time the path is visited and keeps it, so going back is instant and the view keeps its state.';\narticle.append(h1, p, p.cloneNode(true));\nconst footer = document.createElement('div');\nfooter.style.cssText = 'padding:12px 16px;font-size:.8rem;opacity:.75';\nfooter.textContent = 'Edit this page on GitHub';\n\nconst docs = await slice.build('Layout', {\n  landmarks: false,\n  sidebarWidth: 180,\n  asideWidth: 180,\n  contentWidth: '60ch',\n  collapseBelow: 720,\n  sidebar: list('Guide', ['Install', 'Components', 'Routing', 'Themes']),\n  main: article,\n  aside: list('On this page', ['Defining routes', 'Parameters', 'Guards']),\n  footer\n});\nObject.assign(docs.style, { border: '1px solid var(--slice-border-raised, #ddd)', borderRadius: '12px', overflow: 'hidden' });\nreturn docs;\n:::\n\n:::script label=\"Swapping views with showing()\" expected=\"a frame with a sidebar of three buttons; each one shows its view in main, and coming back to a view keeps what was typed in it\"\nconst views = {};\nfor (const name of ['Profile', 'Billing', 'Security']) {\n  const view = document.createElement('section');\n  const h = document.createElement('h3');\n  h.style.marginTop = '0';\n  h.textContent = name;\n  view.append(h, await slice.build('Input', { label: `${name} notes` }));\n  views[name] = view;\n}\nconst nav = document.createElement('div');\nnav.style.cssText = 'display:grid;gap:6px;padding:12px';\nconst settings = await slice.build('Layout', { landmarks: false, skipLink: false, sidebarWidth: 160, collapseBelow: 0, sidebar: nav });\nfor (const name of Object.keys(views)) {\n  nav.append(await slice.build('Button', { value: name, variant: 'ghost', onClick: () => settings.showing(views[name]) }));\n}\nawait settings.showing(views.Profile);\nObject.assign(settings.style, { border: '1px solid var(--slice-border-raised, #ddd)', borderRadius: '12px', overflow: 'hidden' });\nreturn settings;\n:::\n\n## Best Practices\n\n:::tip\nUse `fullHeight` and `stickyHeader` for app shells: the header and the menu stay in view while long pages scroll.\n:::\n\nName the sidebar (`sidebarLabel: 'Main navigation'`) when it holds navigation: screen readers list it by that name. Style the host with single properties (`layout.style.border = …`), not `style.cssText` — the widths are CSS variables in the host's inline style, and `cssText` replaces all of it.\n\n## Pitfalls\n\n:::warning\nOne `main` per page. A Layout inside another page's main (a preview, a demo) needs `landmarks: false`.\n:::\n\n:::warning\n`showing()` removes the previous view but does not destroy it — that is what lets a router keep its views. Views you will never show again should be destroyed by whoever created them.\n:::\n\n:::related\n- [Side menu](/docs/navigation/side-menu) - The navigation a sidebar usually holds.\n- [Navbar](/docs/navigation/navbar) - The header above it.\n- [Dock layout](/docs/layout/dock-layout) - Panels people can rearrange.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            const code = await slice.build('CodeVisualizer', {
               value: "const routes = await slice.build('MultiRoute', {\n  routes: [\n    { path: '/', component: 'HomePage' },\n    { path: '/orders', component: 'OrdersPage' },\n    { path: '/orders/${id}', component: 'OrderDetailPage' },\n    { path: '/settings', component: 'SettingsPage' }\n  ]\n});\n\nconst menu = await slice.build('SideMenu', { /* links to /orders, /settings… */ });\nconst topBar = await slice.build('Navbar', { /* logo, search, account */ });\n\nconst app = await slice.build('Layout', {\n  header: topBar,\n  sidebar: menu,\n  main: routes,\n  sidebarLabel: 'Main navigation',\n  stickyHeader: true,\n  fullHeight: true,\n  focusOnNavigate: true,   // the new view is read after each navigation\n  contentWidth: '1100px'\n});\ndocument.body.appendChild(app);",
               language: "javascript"
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
         const container = this.querySelector('[data-block-id="doc-block-5"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Use <code>fullHeight</code> and <code>stickyHeader</code> for app shells: the header and the menu stay in view while long pages scroll.</p>";
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
            body.innerHTML = "<p>One <code>main</code> per page. A Layout inside another page's main (a preview, a demo) needs <code>landmarks: false</code>.</p>";
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
         const container = this.querySelector('[data-block-id="doc-block-7"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p><code>showing()</code> removes the previous view but does not destroy it — that is what lets a router keep its views. Views you will never show again should be destroyed by whoever created them.</p>";
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
            const items = [{"title":"Side menu","path":"/docs/navigation/side-menu","text":"The navigation a sidebar usually holds."},{"title":"Navbar","path":"/docs/navigation/navbar","text":"The header above it."},{"title":"Dock layout","path":"/docs/layout/dock-layout","text":"Panels people can rearrange."}];
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
            if ("{\"props\":[{\"path\":\"layout\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"view\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"header\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"sidebar\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"main\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"aside\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"footer\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"stickyHeader\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"fullHeight\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"sidebarWidth\",\"type\":\"any\",\"required\":false,\"default\":\"260px\",\"allowedValues\":[]},{\"path\":\"asideWidth\",\"type\":\"any\",\"required\":false,\"default\":\"280px\",\"allowedValues\":[]},{\"path\":\"contentWidth\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"collapseBelow\",\"type\":\"any\",\"required\":false,\"default\":\"900\",\"allowedValues\":[]},{\"path\":\"collapsedSidebar\",\"type\":\"string\",\"required\":false,\"default\":\"drawer\",\"allowedValues\":[\"drawer\",\"hidden\"]},{\"path\":\"sidebarOpen\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"onSidebarToggle\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"sidebarLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"closeOnNavigate\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"focusOnNavigate\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"landmarks\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"skipLink\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"layout\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"view\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"header\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"sidebar\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"main\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"aside\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"footer\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"stickyHeader\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"fullHeight\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"sidebarWidth\",\"type\":\"any\",\"required\":false,\"default\":\"260px\",\"allowedValues\":[]},{\"path\":\"asideWidth\",\"type\":\"any\",\"required\":false,\"default\":\"280px\",\"allowedValues\":[]},{\"path\":\"contentWidth\",\"type\":\"any\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"collapseBelow\",\"type\":\"any\",\"required\":false,\"default\":\"900\",\"allowedValues\":[]},{\"path\":\"collapsedSidebar\",\"type\":\"string\",\"required\":false,\"default\":\"drawer\",\"allowedValues\":[\"drawer\",\"hidden\"]},{\"path\":\"sidebarOpen\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"onSidebarToggle\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"sidebarLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"closeOnNavigate\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"focusOnNavigate\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"landmarks\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"skipLink\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"Grid","path":"/docs/layout/grid"},{"text":"Navbar","path":"/docs/navigation/navbar"},{"text":"Modal","path":"/docs/feedback/modal"},{"text":"MultiRoute","path":"/docs/routing/multi-route"}];
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

customElements.define('slice-layoutdocumentation', LayoutDocumentation);
