---
title: Grid
route: /docs/layout/grid
navLabel: Grid
section: Layout
group: Containers
order: 22
description: Content in rows and columns — columns by the grid's own width, automatic columns, items that span, and named areas. For dashboards, galleries, bento sections and page regions.
component: GridDocumentation
generate: true
tags: [grid, layout, responsive, columns, areas, bento, gallery, dashboard]
---

# Grid

## Overview
`Grid` lays content out in rows and columns: four metric cards on a dashboard, a gallery of photos, a "bento" section of features with one big tile, or the regions of a page.

What makes it more than `display: grid`:

- **Breakpoints measured on the grid itself**, not on the window. A grid of `{ 0: 1, 560: 2, 960: 4 }` columns shows one column inside a narrow sidebar or a modal, and four on a wide page — the same code in both places.
- **Automatic columns** with `minItemWidth`: as many columns as fit, each at least that wide.
- **Items that span** (`{ node, colSpan, rowSpan }`), and a span never asks for more columns than there are, so a 2-wide tile becomes 1 wide on a phone instead of overflowing.
- **Named areas**, also per width: `['header header', 'main side']`.

### When to use it
- **Sets of similar things**: metric cards, products, photos, team members, features.
- **Bento sections** on a landing: one large tile and several small ones.
- **A page or panel with regions** (header, main, side) that rearrange by width.

### When not to use it
- **A list people read top to bottom** (messages, search results): a plain list or a [DataList](/docs/data/datalist).
- **Rows of data with columns to compare and sort**: a [Table](/docs/data/table).
- **An application frame** with navigation, a sidebar that collapses into a drawer and a skip link: [Layout](/docs/layout/layout).
- **Two or three things in a row** that should just wrap: a flex row in your own CSS is enough.

## Core Behavior
- `columns`: a number (default `1`), or breakpoints by the grid's width — `{ 0: 1, 560: 2, 960: 4 }` means 1 column, 2 from 560px, 4 from 960px.
- `minItemWidth`: automatic columns (`220` or `'14rem'`). Wins over `columns`.
- `items`: live DOM nodes or components, or `{ node, colSpan, rowSpan, area }`. `colSpan` is a number or `'full'` (the whole row). Assigning `items` **replaces** the content: nodes still present are moved, not rebuilt; components that leave are destroyed.
- `areas`: an array of rows (`['header header', 'main side']`), or breakpoints of them. Items with `area` go there; an item whose area is missing at the current width falls into the normal flow.
- `gap` (a CSS length or a number of pixels, `10px` by default) and `rowGap` for a different space between rows.
- `autoRows`: the height of the rows the grid creates (`'140px'`, `'minmax(120px, auto)'`), needed for `rowSpan` tiles of equal height.
- `dense`: later small items fill the holes left by big ones. The visual order then differs from the DOM order, which is what keyboard and screen readers follow — use it for galleries, not for steps.
- `align` and `justify`: how items sit in their cell (`stretch` by default, `start`, `center`, `end`).
- `columnTemplate` and `rowTemplate`: raw CSS templates when nothing above fits; they win over the rest.
- `columnCount` (read-only) and the `data-columns` attribute: the columns shown right now.
- `setItem(item)` and `setItems(items)` append; `clear()` empties it and destroys the components.

## Examples
:::script label="A dashboard that fits where it is put" expected="four metric cards: four columns at full width, two at half width, one in a sidebar; the buttons resize the container to show it"
const metrics = [
  ['Revenue', '$48,210', '+12% vs last month'],
  ['Orders', '1,284', '+4%'],
  ['Refunds', '23', '−8%'],
  ['Visitors', '36,402', '+19%']
];
const cards = [];
for (const [title, value, change] of metrics) {
  cards.push(await slice.build('Card', { title: value, subtitle: title, text: change, variant: 'outlined' }));
}
const grid = await slice.build('Grid', { columns: { 0: 1, 440: 2, 700: 4 }, gap: 12, items: cards });

const frame = document.createElement('div');
frame.style.cssText = 'width:100%;transition:width .2s';
frame.append(grid);
const bar = document.createElement('div');
bar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center';
const shown = document.createElement('span');
shown.style.cssText = 'font-size:.85rem;opacity:.75';
const report = () => setTimeout(() => { shown.textContent = `${grid.columnCount} column(s)`; }, 300);
for (const [label, width] of [['Full width', '100%'], ['Half (520px)', '520px'], ['Sidebar (320px)', '320px']]) {
  bar.append(await slice.build('Button', { value: label, variant: 'outlined', size: 'sm', onClick: () => { frame.style.width = width; report(); } }));
}
bar.append(shown);
report();
const box = document.createElement('div');
box.style.cssText = 'width:100%';
box.append(bar, frame);
return box;
:::

:::script label="A photo gallery with automatic columns" expected="twelve coloured tiles with captions; as many columns as fit at 160px minimum each, every tile square"
const hues = [12, 38, 64, 140, 168, 196, 220, 248, 276, 300, 330, 355];
const places = ['Lagunillas', 'Mérida', 'Coro', 'Los Roques', 'Canaima', 'Choroní', 'Barquisimeto', 'Margarita', 'Mochima', 'Colonia Tovar', 'Maracaibo', 'Roraima'];
const tiles = hues.map((h, i) => {
  const figure = document.createElement('figure');
  figure.style.cssText = 'margin:0;display:grid;gap:6px';
  const photo = document.createElement('div');
  photo.setAttribute('role', 'img');
  photo.setAttribute('aria-label', `Photo of ${places[i]}`);
  photo.style.cssText = `aspect-ratio:1;border-radius:10px;background:linear-gradient(135deg,hsl(${h} 70% 62%),hsl(${(h + 40) % 360} 65% 42%))`;
  const caption = document.createElement('figcaption');
  caption.style.cssText = 'font-size:.82rem';
  caption.textContent = places[i];
  figure.append(photo, caption);
  return figure;
});
return await slice.build('Grid', { minItemWidth: 160, gap: 14, items: tiles });
:::

:::script label="A bento section of features" expected="a four-column bento: a large 2×2 tile 'Components without a build step', a wide tile 'Docs that run' spanning two columns, and two small tiles; on a narrow screen every tile is one column wide and they stack"
const tile = (title, text, tone) => {
  const el = document.createElement('article');
  el.style.cssText = `display:grid;align-content:end;gap:6px;height:100%;box-sizing:border-box;padding:18px;border-radius:14px;background:color-mix(in srgb, var(--${tone}-color) 14%, var(--secondary-background-color))`;
  const h = document.createElement('h3');
  h.style.cssText = 'margin:0;font-size:1.05rem';
  h.textContent = title;
  const p = document.createElement('p');
  p.style.cssText = 'margin:0;font-size:.88rem;opacity:.85';
  p.textContent = text;
  el.append(h, p);
  return el;
};
return await slice.build('Grid', {
  columns: { 0: 1, 520: 2, 700: 4 },
  autoRows: 'minmax(130px, auto)',
  gap: 12,
  items: [
    { node: tile('Components without a build step', 'Custom elements with a template, a stylesheet and a class. Open the file, change it, reload.', 'primary'), colSpan: 2, rowSpan: 2 },
    { node: tile('Docs that run', 'Every example on these pages is live code.', 'info'), colSpan: 2 },
    tile('Themes', 'Light, dark and your own.', 'success'),
    tile('Translations', 'English and Spanish built in.', 'warning')
  ]
});
:::

:::script label="Regions with named areas" expected="a product page: on a wide container the gallery on the left and the buy box on the right, with the description under the gallery; on a narrow one everything stacks, with the buy box right after the gallery"
const block = (title, height) => {
  const el = document.createElement('section');
  el.style.cssText = `min-height:${height}px;padding:14px;border-radius:12px;border:1px solid var(--slice-border-raised, #ddd);box-sizing:border-box`;
  el.textContent = title;
  return el;
};
return await slice.build('Grid', {
  gap: 16,
  areas: {
    0: ['gallery', 'buy', 'details'],
    720: ['gallery buy', 'details buy']
  },
  items: [
    { node: block('Gallery', 220), area: 'gallery' },
    { node: block('Buy box: price, size, Add to cart', 160), area: 'buy' },
    { node: block('Description and specifications', 140), area: 'details' }
  ]
});
:::

:::script label="Adding and removing items" expected="a row of task cards with an 'Add task' button; new cards are appended, and 'Remove first' takes the first one out (and destroys it)"
let n = 0;
const task = () => slice.build('Card', { title: `Task ${++n}`, text: 'Due Friday', variant: 'outlined' });
const grid = await slice.build('Grid', { minItemWidth: 180, gap: 10, items: [await task(), await task()] });
const bar = document.createElement('div');
bar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';
bar.append(
  await slice.build('Button', { value: 'Add task', onClick: async () => { grid.items = [...grid.items, await task()]; } }),
  await slice.build('Button', { value: 'Remove first', variant: 'outlined', onClick: () => { grid.items = grid.items.slice(1); } })
);
const box = document.createElement('div');
box.style.cssText = 'width:100%';
box.append(bar, grid);
return box;
:::

## Best Practices
:::tip
Prefer breakpoints on the grid (`columns: { 0: 1, 600: 2, 960: 4 }`) or `minItemWidth` over media queries. The same grid then works in a page, a sidebar and a modal.
:::

:::tip
Use `colSpan` and `rowSpan` with `autoRows` for bento layouts: without a row height, a tall tile's rows are only as tall as their content.
:::

## Pitfalls
:::warning
`dense` and named areas change where things appear, not their order in the DOM. Keyboard focus and screen readers follow the DOM, so keep the DOM in reading order.
:::

:::warning
Assigning `items` replaces everything. To add one, pass the old list plus the new item (`grid.items = [...grid.items, card]`) or call `setItem(card)`.
:::
