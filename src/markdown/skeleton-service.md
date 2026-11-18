---
title: SkeletonService
route: /docs/services/skeleton-service
navLabel: SkeletonService
section: Services
group: Interaction
order: 64
description: The loading state of any component, drawn from the component itself. Its text, images, fields and buttons turn into shimmering blocks of their exact size while data loads — nothing to declare on the component, no skeleton markup to write, and the layout does not move when the data arrives.
component: SkeletonServiceDocumentation
generate: true
tags: [service, skeleton, loading, placeholder, shimmer, aria-busy, async, data]
---

# SkeletonService

## Overview
A skeleton promises the shape of what is coming. A generic one (grey bars in a column) promises the wrong shape: the page jumps when the real content arrives.

`SkeletonService` takes the shape **from the component itself**. It walks what the element renders and marks its leaves — runs of text, images, icons, fields, buttons — and a stylesheet turns each into a block of exactly its own size. The shapes are the layout, so nothing moves when the data is in. No component needs to know the service exists.

```javascript
const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'skeleton' });

// Refreshing: what is on screen dims into shapes until the new data is in.
const rows = await skeleton.during(table, fetchRows());
table.rows = rows;

// First load: build the component with what you have, then cover it.
const card = await slice.build('Card', { title: 'Loading title', text: 'Two lines of text for the shape.' });
const done = skeleton.cover(card);
// …
done();
```

### When to use it
- **Refreshing data that is already on screen**: a table, a dashboard card, a profile. The old content keeps its place as shapes.
- **The first load of a component whose structure you know**: build it with placeholder text and cover it.
- **Lists**: `repeat` shows several rows while the first page loads.

### When not to use it
- **Loads under about 300ms**: a skeleton that flashes is worse than none.
- **An action the user started** (saving, sending): a busy [Button](/docs/input/button) or a [Loading](/docs/feedback/loading) indicator says "working on it" better than a dimmed page.
- **Progress you can measure** (an upload): a progress bar.
- **Nothing to show at all yet** (an empty search): an [EmptyState](/docs/display/empty-state).

## Core Behavior
- `cover(element, options)` → `done()`. Marks the leaves, adds `aria-busy="true"` and `inert` to the element (no clicks, no focus, no reading of stale text), and a polite status says "Loading…" once. `done()` puts everything back, including attributes the element already had; calling it twice is harmless.
- `during(element, work, options)` covers until `work` (a promise, or a function returning one) settles, and returns its result — or throws its error, uncovered.
- Covering an element twice counts: it comes back when every `done()` has run. `uncover(element)` forces it; `isCovered(element)` tells.
- `options.repeat: n` shows `n` rows while covered by copying the first one (or the first match of `options.item`, such as `'tbody tr'`). The copies are plain markup: a component inside the row becomes an empty box of its size, so nothing is built or registered. They are removed by `done()`.
- `options.keep`: what stays readable because it labels the interface rather than showing data — by default column headers, field labels and legends (`'th, thead, label, legend, [data-skeleton-keep]'`). Mark your own with `data-skeleton-keep`; pass `''` to cover everything.
- `options.label` replaces the announced text (built in: "Loading…" / "Cargando…").
- What becomes a block: images, video, SVG, canvas, fields and buttons as a whole, with their own corners (a round avatar stays round); text as bars **as long as the text itself**, line by line (it is wrapped in an inline span while covered, so a short name in a wide cell is a short bar); an empty box with a background image as one block.
- Destroying the service uncovers everything and removes its status and stylesheet.

## Looks
Per element or app-wide: `--slice-skeleton-color`, `--slice-skeleton-shine`, `--slice-skeleton-radius`, `--slice-skeleton-speed`. With reduced motion the blocks do not shimmer.

## Examples
:::script label="Refreshing a table" expected="an example table with a Refresh button; Refresh turns every value into a bar as long as its text (the column headers stay) for about a second and a half, then the table shows the new rows without moving"
const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });
const batches = [
  [['Item 1', 'Value 1', 'Status 1', 'Value A'], ['Item 2', 'Value 2', 'Status 2', 'Value B'], ['Item 3', 'Value 3', 'Status 3', 'Value C'], ['Item 4', 'Value 4', 'Status 4', 'Value D']],
  [['Item 5', 'Value 5', 'Status 5', 'Value E'], ['Item 6', 'Value 6', 'Status 6', 'Value F'], ['Item 7', 'Value 7', 'Status 7', 'Value G'], ['Item 8', 'Value 8', 'Status 8', 'Value H']]
];
let turn = 0;
const table = await slice.build('Table', { headers: ['Column 1', 'Column 2', 'Column 3', 'Column 4'], rows: batches[0] });
const fetchRows = () => new Promise((resolve) => setTimeout(() => resolve(batches[++turn % 2]), 1500));
const refresh = await slice.build('Button', {
  value: 'Refresh', variant: 'outlined', size: 'sm',
  onClick: async () => {
    refresh.disabled = true;
    table.rows = await skeleton.during(table, fetchRows());
    refresh.disabled = false;
  }
});
const head = document.createElement('div');
head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px';
const title = document.createElement('strong');
title.textContent = 'Example table';
head.append(title, refresh);
const box = document.createElement('div');
box.style.cssText = 'width:100%';
box.append(head, table);
return box;
:::

:::script label="A profile card, triggered by a button" expected="a 'Show skeleton' button above a profile card with an avatar, a name, a role and two buttons; pressing it turns the card into blocks of their shapes (the avatar round) for about a second and a half, then the profile appears again in exactly the same place"
const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });
const person = { name: 'User 1', role: 'Role 1', city: 'City 1' };
const card = document.createElement('section');
card.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;width:100%;padding:16px;border:1px solid var(--slice-border-raised, #ddd);border-radius:12px';
const avatar = await slice.build('Avatar', { name: person.name, size: 'lg' });
const text = document.createElement('div');
const name = document.createElement('strong');
name.textContent = person.name;
const role = document.createElement('p');
role.style.cssText = 'margin:4px 0 10px;opacity:.75';
role.textContent = `${person.role} · ${person.city}`;
const actions = document.createElement('div');
actions.style.cssText = 'display:flex;gap:8px';
actions.append(await slice.build('Button', { value: 'Message', size: 'sm' }), await slice.build('Button', { value: 'Profile', variant: 'outlined', size: 'sm' }));
text.append(name, role, actions);
card.append(avatar, text);

const load = async () => {
  trigger.disabled = true;
  await skeleton.during(card, new Promise((r) => setTimeout(r, 1500)));
  avatar.name = person.name;
  name.textContent = person.name;
  role.textContent = `${person.role} · ${person.city}`;
  trigger.disabled = false;
};
const trigger = await slice.build('Button', { value: 'Show skeleton', variant: 'outlined', size: 'sm', onClick: () => load() });
load();

const box = document.createElement('div');
box.style.cssText = 'display:grid;gap:10px;width:100%;max-width:420px';
box.append(trigger, card);
return box;
:::

:::script label="A list that is still loading: repeat, triggered by a button" expected="a 'Show skeleton' button above a list of messages; pressing it shows six rows of shapes (round avatars, a name and a line of text each) for about a second and a half, built from its single first row, then the six real messages"
const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });
const list = document.createElement('ul');
list.style.cssText = 'list-style:none;margin:0;padding:0;display:grid;gap:12px;width:100%;max-width:460px';
const row = async (who, text) => {
  const li = document.createElement('li');
  li.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center';
  const body = document.createElement('div');
  const strong = document.createElement('strong');
  strong.textContent = who;
  const p = document.createElement('p');
  p.style.cssText = 'margin:2px 0 0;font-size:.9rem;opacity:.8';
  p.textContent = text;
  body.append(strong, p);
  li.append(await slice.build('Avatar', { name: who, size: 'sm' }), body);
  return li;
};
const messages = [
  ['User 1', 'Message 1'], ['User 2', 'Message 2'],
  ['User 3', 'Message 3'], ['User 4', 'Message 4'],
  ['User 5', 'Message 5'], ['User 6', 'Message 6']
];
const load = async () => {
  trigger.disabled = true;
  slice.controller.destroyByContainer(list);
  list.replaceChildren(await row('User', 'A message of about this length, to give the shape.'));
  await skeleton.during(list, new Promise((r) => setTimeout(r, 1500)), { repeat: 6 });
  const rows = [];
  for (const [who, text] of messages) rows.push(await row(who, text));
  slice.controller.destroyByContainer(list);
  list.replaceChildren(...rows);
  trigger.disabled = false;
};
const trigger = await slice.build('Button', { value: 'Show skeleton', variant: 'outlined', size: 'sm', onClick: () => load() });
load();

const box = document.createElement('div');
box.style.cssText = 'display:grid;gap:10px;width:100%;max-width:460px';
box.append(trigger, list);
return box;
:::

:::script label="A dashboard of cards, triggered by a button" expected="a 'Show skeleton' button above a dashboard of three cards; pressing it turns every card into blocks of its shape for about a second and a half, then the cards show new values without moving"
const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'docsSkeleton' });
const batches = [
  [['Metric 1', 'Value 1'], ['Metric 2', 'Value 2'], ['Metric 3', 'Value 3']],
  [['Metric 1', 'Value 4'], ['Metric 2', 'Value 5'], ['Metric 3', 'Value 6']]
];
let turn = 0;
const cards = [];
for (const [title, text] of batches[0]) {
  cards.push(await slice.build('Card', { title, text, variant: 'outlined' }));
}
const grid = await slice.build('Grid', { columns: 3, minItemWidth: '180px', gap: 12, items: cards });
const load = async () => {
  trigger.disabled = true;
  await skeleton.during(grid, new Promise((r) => setTimeout(r, 1500)));
  const next = batches[++turn % 2];
  cards.forEach((card, i) => {
    card.title = next[i][0];
    card.text = next[i][1];
  });
  trigger.disabled = false;
};
const trigger = await slice.build('Button', { value: 'Show skeleton', variant: 'outlined', size: 'sm', onClick: () => load() });
load();

const box = document.createElement('div');
box.style.cssText = 'display:grid;gap:10px;width:100%';
box.append(trigger, grid);
return box;
:::

## Best Practices

:::tip
Cover what you are about to replace, then set the data after `during()` returns. The skeleton shows the old shapes; the new content lands in the same place.
:::

For a first load, build the component with placeholder text of a realistic length. The shapes are only as good as the text they are made from.

## Pitfalls

:::warning
A covered element is `inert`: nothing inside it can be clicked or focused until `done()`. Cover the part that is loading, never a form the user is typing in, and always call `done()` — or use `during()`, which does it even when the work fails.
:::

:::related
- [Loading](/docs/feedback/loading) - The spinner and the overlay for the whole page.
- [EmptyState](/docs/display/empty-state) - The other end of the same wait.
- [QueryService](/docs/services/query-service) - Where the data usually comes from.
- [Data and loading](/docs/guides/data-and-loading) - Bringing data in without blocking the page.
:::

