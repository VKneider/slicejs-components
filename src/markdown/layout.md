---
title: Layout
route: /docs/layout/layout
navLabel: Layout
section: Layout
group: Containers
order: 10
description: The frame of an app or a site — header, sidebar, main, aside and footer, with landmarks, a skip link, a sticky header and a sidebar that becomes a drawer on narrow screens.
component: LayoutDocumentation
generate: true
tags: [layout, app shell, frame, sidebar, drawer, header, footer, landmarks, container]
---

# Layout

## Overview
`Layout` is the frame around a page: a **header** (logo, search, account), a **sidebar** (the app's navigation), the **main** content, an optional **aside** (filters, details, a table of contents) and a **footer**.

You give it the pieces; it does the parts that are easy to forget:

- **Landmarks**: banner, navigation, main, complementary and contentinfo, so screen-reader users can jump between regions.
- **"Skip to content"**: the first thing Tab reaches, hidden until focused.
- **A drawer on narrow screens**: below `collapseBelow` (900px of the layout's own width) the sidebar slides in from the side behind a menu button. Escape and the backdrop close it, focus goes into it and back to the button, and a closed drawer is out of the tab order.
- **A sticky header**, a sidebar that stays in view while the page scrolls (`fullHeight`), and a readable `contentWidth`.

### When to use it
- **The shell of an app**: a dashboard, an admin panel, a course platform — header, navigation, content.
- **A documentation or blog site** with a menu, the article and a table of contents in the aside.
- **The view swapper of a router**: `showing(view)` puts a view in main and removes the previous one.

### When not to use it
- **Arranging content inside a page** (cards, a gallery, a bento): [Grid](/docs/layout/grid).
- **A single top bar** without a sidebar: a [Navbar](/docs/navigation/navbar) on its own.
- **A panel that opens for one task** (a cart, a filter sheet): a [Modal](/docs/feedback/modal).
- **Several layouts nested**. One frame per page; inside it, use Grid and plain sections.

## Core Behavior
- Regions: `header`, `sidebar`, `main`, `aside`, `footer` — each a node, a component, or an array of them. Setting one again replaces it; components that leave are destroyed, and so is everything in the regions when the layout is destroyed.
- `showing(view)` shows `view` in main and removes the previous one **without destroying it** (a router keeps its views). `currentView` is what is shown.
- `stickyHeader`, `fullHeight` (at least the window's height; sidebar and aside stay in view while main scrolls).
- `sidebarWidth` (`260px`), `asideWidth` (`280px`), `contentWidth` (no limit by default; `'72ch'` for reading) — numbers are pixels.
- `collapseBelow`: a number is a width **of the layout** (`900` by default; `0` never collapses); a string is a media query on the window (`'(max-width: 768px)'`) — use the same one as your Navbar's `breakpoint` so both switch at the same moment.
- `collapsedSidebar`: `'drawer'` (default: the menu button and the slide-in panel) or `'hidden'` (no button; the app shows the sidebar's content somewhere else, such as a Navbar's `panelContent`, so the page keeps one menu button).
- `sidebarOpen`, `toggleSidebar(open?)`, `collapsed` (read-only) and `onSidebarToggle(open)`.
- `sidebarLabel` names the navigation landmark ("Main navigation"). `landmarks: false` removes the roles — for a layout shown inside another page, like the examples below.
- `closeOnNavigate` (on by default): the drawer closes on every route change (`router:change`) and when a link inside it is followed. `focusOnNavigate` moves focus to main after each route change.
- `skipLink` (on by default) and `texts` (`skip`, `menu`, `close`; English and Spanish built in).

## With MultiRoute (app shell)
The usual frame of a Slice app: Layout around a [MultiRoute](/docs/routing/multi-route). MultiRoute lives in main and swaps its cached views there; Layout never rebuilds it. In `App.js`:

```javascript
const routes = await slice.build('MultiRoute', {
  routes: [
    { path: '/', component: 'HomePage' },
    { path: '/orders', component: 'OrdersPage' },
    { path: '/orders/${id}', component: 'OrderDetailPage' },
    { path: '/settings', component: 'SettingsPage' }
  ]
});

const menu = await slice.build('SideMenu', { /* links to /orders, /settings… */ });
const topBar = await slice.build('Navbar', { /* logo, search, account */ });

const app = await slice.build('Layout', {
  header: topBar,
  sidebar: menu,
  main: routes,
  sidebarLabel: 'Main navigation',
  stickyHeader: true,
  fullHeight: true,
  focusOnNavigate: true,   // the new view is read after each navigation
  contentWidth: '1100px'
});
document.body.appendChild(app);
```

- On a phone, following a link from the drawer closes it: the router's `router:change` closes it, and so does a click on any link inside it.
- With `focusOnNavigate`, focus moves to main after each route change, so screen readers start the new view instead of staying on the menu link. Main is focused without scrolling; scroll restoration stays the router's.
- Every path the MultiRoute shows must also be in `routes.js`, pointing at the shell (see MultiRoute).
- Layout listens to `router:change` on `slice.events` and on `window`, and stops listening when it is destroyed.
- Focus moves only on navigations, not on the first route of a page load, so Tab still starts at the top.
- With a site Navbar fixed above the layout (outside it), set `--slice-layout-sticky-top` to the bar's height. With a Navbar that has its own mobile menu, use `collapseBelow: '(max-width: 768px)'` and `collapsedSidebar: 'hidden'`, and put the sidebar's content in the Navbar's `panelContent` on phones — this documentation site does exactly that.

### Without regions
With no region props, Layout is the plain container it always was: `onLayOut(node)` and `showing(node)` append to the host, and `layout` / `view` are appended on init. Existing apps keep working unchanged.

## Looks
CSS variables: `--slice-layout-sidebar-width`, `--slice-layout-aside-width`, `--slice-layout-content-width`, `--slice-layout-pad` (main's padding), `--slice-layout-drawer-width`, `--slice-layout-surface`, `--slice-layout-panel` (the sidebar) and `--slice-layout-line` (the borders), and `--slice-layout-sticky-top`: the height of a fixed bar **outside** the layout (an app's Navbar), so the sticky header and sidebars stop under it. The host has `data-collapsed` and `data-sidebar-open` for your own styles.

## Examples
:::script label="An admin panel that becomes a drawer" expected="a framed app 'Acme Admin' with a sticky header, a sidebar of four links and a dashboard in main; the 'Phone width' button narrows the frame so the sidebar hides behind a menu button that opens it as a drawer"
const link = (text, current) => {
  const a = document.createElement('a');
  a.href = '#';
  a.textContent = text;
  a.style.cssText = `display:block;padding:9px 12px;border-radius:8px;text-decoration:none;color:inherit;${current ? 'background:color-mix(in srgb, var(--primary-color) 14%, transparent);font-weight:600' : ''}`;
  if (current) a.setAttribute('aria-current', 'page');
  a.addEventListener('click', (e) => e.preventDefault());
  return a;
};
const nav = document.createElement('div');
nav.style.cssText = 'display:grid;gap:2px;padding:12px';
nav.append(link('Dashboard', true), link('Orders'), link('Customers'), link('Settings'));

const top = document.createElement('div');
top.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px';
const brand = document.createElement('strong');
brand.textContent = 'Acme Admin';
top.append(brand, await slice.build('Avatar', { name: 'Ana López', size: 'sm' }));

const dashboard = await slice.build('Grid', {
  columns: { 0: 1, 520: 2 }, gap: 12,
  items: [
    await slice.build('Card', { title: '$48,210', subtitle: 'Revenue', variant: 'outlined' }),
    await slice.build('Card', { title: '1,284', subtitle: 'Orders', variant: 'outlined' })
  ]
});

const app = await slice.build('Layout', {
  landmarks: false,
  stickyHeader: true,
  sidebarWidth: 210,
  collapseBelow: 640,
  header: top,
  sidebar: nav,
  main: dashboard
});
// Assign style properties one by one: cssText would erase the width variables Layout sets on itself.
Object.assign(app.style, { height: '380px', overflow: 'auto', border: '1px solid var(--slice-border-raised, #ddd)', borderRadius: '12px', transition: 'width .2s', width: '100%' });

const bar = document.createElement('div');
bar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';
bar.append(
  await slice.build('Button', { value: 'Desktop width', variant: 'outlined', size: 'sm', onClick: () => { app.style.width = '100%'; } }),
  await slice.build('Button', { value: 'Phone width', variant: 'outlined', size: 'sm', onClick: () => { app.style.width = '380px'; } })
);
const box = document.createElement('div');
box.style.cssText = 'width:100%';
box.append(bar, app);
return box;
:::

:::script label="A docs page with a table of contents" expected="a three-column frame: a menu on the left, an article limited to a readable width in the middle, and an 'On this page' list in the aside on the right; a footer at the bottom"
const list = (title, items) => {
  const box = document.createElement('div');
  box.style.cssText = 'padding:14px;font-size:.88rem';
  const h = document.createElement('p');
  h.style.cssText = 'margin:0 0 8px;font-weight:700';
  h.textContent = title;
  const ul = document.createElement('ul');
  ul.style.cssText = 'margin:0;padding:0;list-style:none;display:grid;gap:6px';
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    ul.append(li);
  }
  box.append(h, ul);
  return box;
};
const article = document.createElement('article');
article.style.lineHeight = '1.65';
const h1 = document.createElement('h2');
h1.style.marginTop = '0';
h1.textContent = 'Routing';
const p = document.createElement('p');
p.textContent = 'Routes map a path to a component. The router builds the component the first time the path is visited and keeps it, so going back is instant and the view keeps its state.';
article.append(h1, p, p.cloneNode(true));
const footer = document.createElement('div');
footer.style.cssText = 'padding:12px 16px;font-size:.8rem;opacity:.75';
footer.textContent = 'Edit this page on GitHub';

const docs = await slice.build('Layout', {
  landmarks: false,
  sidebarWidth: 180,
  asideWidth: 180,
  contentWidth: '60ch',
  collapseBelow: 720,
  sidebar: list('Guide', ['Install', 'Components', 'Routing', 'Themes']),
  main: article,
  aside: list('On this page', ['Defining routes', 'Parameters', 'Guards']),
  footer
});
Object.assign(docs.style, { border: '1px solid var(--slice-border-raised, #ddd)', borderRadius: '12px', overflow: 'hidden' });
return docs;
:::

:::script label="Swapping views with showing()" expected="a frame with a sidebar of three buttons; each one shows its view in main, and coming back to a view keeps what was typed in it"
const views = {};
for (const name of ['Profile', 'Billing', 'Security']) {
  const view = document.createElement('section');
  const h = document.createElement('h3');
  h.style.marginTop = '0';
  h.textContent = name;
  view.append(h, await slice.build('Input', { label: `${name} notes` }));
  views[name] = view;
}
const nav = document.createElement('div');
nav.style.cssText = 'display:grid;gap:6px;padding:12px';
const settings = await slice.build('Layout', { landmarks: false, skipLink: false, sidebarWidth: 160, collapseBelow: 0, sidebar: nav });
for (const name of Object.keys(views)) {
  nav.append(await slice.build('Button', { value: name, variant: 'ghost', onClick: () => settings.showing(views[name]) }));
}
await settings.showing(views.Profile);
Object.assign(settings.style, { border: '1px solid var(--slice-border-raised, #ddd)', borderRadius: '12px', overflow: 'hidden' });
return settings;
:::

## Best Practices
:::tip
Name the sidebar (`sidebarLabel: 'Main navigation'`) when it holds navigation. Screen readers list it by that name.
:::

:::tip
Use `fullHeight` and `stickyHeader` for app shells: the header and the menu stay in view while long pages scroll.
:::

:::tip
Style the host with single properties (`layout.style.border = …`), not `style.cssText`: the widths are CSS variables in the host's inline style, and `cssText` replaces all of it.
:::

## Pitfalls
:::warning
One `main` per page. A Layout inside another page's main (a preview, a demo) needs `landmarks: false`.
:::

:::warning
`showing()` removes the previous view but does not destroy it — that is what lets a router keep its views. Views you will never show again should be destroyed by whoever created them.
:::
