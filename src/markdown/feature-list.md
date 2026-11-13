---
title: FeatureList
route: /docs/display/feature-list
navLabel: FeatureList
section: Display
group: Content
order: 41
description: What something offers, item by item — an icon, a title and a sentence on one grid. Services, benefits, what a plan includes, a course's topics. Information, not a set of cards.
component: FeatureListDocumentation
generate: true
tags: [features, benefits, services, grid, list, landing, content, display]
---

# FeatureList

## Overview
`FeatureList` lays out what something offers: the services of a studio, why a product is worth it, what a plan includes, the topics of a course. Each item is an icon, a title (a real heading) and a sentence, all on one grid with one rhythm.

It is information, not cards: by default the items have no surface, no border and no click target. Give an item an `href` and its title becomes a link that covers the item.

### When to use it
- **Services, benefits, "why us"** on a landing or a portfolio.
- **What a plan or a course includes**, as a checklist in columns (`layout: 'compact'`).
- **Links to the parts of a site**, each with a sentence ("Docs", "Guides", "API") — add `href`.
- **Facts about a product** that read as a list rather than as a table.

### When not to use it
- **Things you open, compare or select, with images or actions each**: a grid of [Card](/docs/layout/card).
- **Records with search, sort or selection**: [DataList](/docs/data/datalist).
- **A process in order**: [Stepper](/docs/display/stepper).
- **Key and value pairs** (Email: …, Plan: …): [DescriptionList](/docs/data/description-list).

## Core Behavior
- `items: [{ title, text, icon, badge, href, target, content, id }]`. `icon` is an Icon name or `{ name }`; `badge` is a short label next to the title ("New"); `content` takes more (a string, a node, a component or an array).
- `layout`: `grid` (icon on top, the default), `list` (icon at the start; one item per row unless you give `columns`) or `compact` (a small icon at the start, in columns — for long checklists).
- `columns`: `0` (default) puts as many as fit, each at least `minItemWidth` wide (`'220px'`). A number is a **maximum**: on a narrow screen the items still wrap.
- `href` makes the title a real `<a>` (through `slice.href()`, so it keeps the locale prefix) stretched over the whole item; a plain click on an app path goes through the router, and Ctrl/⌘-click opens a new tab as usual. `target: '_blank'` adds `rel="noopener"`.
- `onItemClick(item, { index, event })`: items without `href` become buttons. It also dispatches `item-click`.
- `headingLevel` (default `3`): the level of each title, under the section's own heading. Pair it with a [SectionHeader](/docs/display/section-header) (an `h2`).
- `<ul role="list">`, one focusable target per item, decorative icons. Text is always text.

## Looks
- `variant`: `plain` (default, no surface), `soft` (a tint) or `outlined` (a border).
- `tone`: the colour of the icons (`accent` by default). `align`: `start` or `center` (centred items in `grid`). `size`: `md` or `sm`.
- CSS variables: `--slice-feature-list-gap-x`, `--slice-feature-list-gap-y`, `--slice-feature-list-icon-box`, `--slice-feature-list-radius`.

## Live Preview
:::component name="FeatureList"
{
  "columns": 3,
  "items": [
    { "icon": "rocket", "title": "Feature 1", "text": "A short description of the first feature." },
    { "icon": "shield-check", "title": "Feature 2", "text": "A short description of the second feature." },
    { "icon": "users-group", "title": "Feature 3", "text": "A short description of the third feature." }
  ]
}
:::

## Examples
:::script label="A section with a FeatureList and a SectionHeader" expected="a section with the eyebrow 'Section', the title 'Section title' and an 'Action' button; below, six items in three columns with an icon each; 'Item 1' has a 'New' badge"
const section = document.createElement('section');
section.style.cssText = 'display:grid;gap:28px;width:100%';
const toasts = await slice.build('ToastProvider', { singleton: true });
section.append(
  await slice.build('SectionHeader', {
    eyebrow: 'Section',
    title: 'Section title',
    description: 'A short description for this section.',
    actions: [{ label: 'Action', onClick: () => toasts.show('Action selected.') }]
  }),
  await slice.build('FeatureList', {
    columns: 3,
    items: [
      { icon: 'layers', title: 'Item 1', badge: 'New', text: 'A short description of the first item.' },
      { icon: 'code-branch', title: 'Item 2', text: 'A short description of the second item.' },
      { icon: 'users-group', title: 'Item 3', text: 'A short description of the third item.' },
      { icon: 'rocket', title: 'Item 4', text: 'A short description of the fourth item.' },
      { icon: 'chart-line-up', title: 'Item 5', text: 'A short description of the fifth item.' },
      { icon: 'life-saver', title: 'Item 6', text: 'A short description of the sixth item.' }
    ]
  })
);
return section;
:::

:::script label="What a plan includes (compact checklist)" expected="a pricing box for the 'Plan' plan: price and a short description, then a compact list in two columns of nine included features, each with a small green check"
const plan = document.createElement('div');
plan.style.cssText = 'display:grid;gap:16px;box-sizing:border-box;width:100%;max-width:620px;padding:24px;border-radius:16px;border:1px solid color-mix(in srgb, currentColor 14%, transparent)';
const head = document.createElement('div');
const name = document.createElement('h3');
name.textContent = 'Plan — $0 / month';
name.style.margin = '0';
const desc = document.createElement('p');
desc.textContent = 'A short description of the plan.';
desc.style.cssText = 'margin:4px 0 0;opacity:.75';
head.append(name, desc);
const included = ['Included feature 1', 'Included feature 2', 'Included feature 3', 'Included feature 4', 'Included feature 5', 'Included feature 6', 'Included feature 7', 'Included feature 8', 'Included feature 9'];
plan.append(head, await slice.build('FeatureList', {
  layout: 'compact', tone: 'success', minItemWidth: '230px', headingLevel: 4,
  ariaLabel: 'Included in Plan',
  items: included.map((title) => ({ icon: 'check', title }))
}));
return plan;
:::

:::script label="Links to the parts of a site" expected="three outlined items 'Page 1', 'Page 2' and 'Page 3' with an icon and a sentence; the whole item is clickable and opens the page through the router; 'Page 3' opens an external page in a new tab"
return await slice.build('FeatureList', {
  variant: 'outlined',
  layout: 'list',
  columns: 3,
  minItemWidth: '220px',
  items: [
    { icon: 'book-open', title: 'Page 1', text: 'A short description of the first page.', href: '/docs' },
    { icon: 'lightbulb', title: 'Page 2', text: 'A short description of the second page.', href: '/docs/guides/data-and-loading' },
    { icon: 'github', title: 'Page 3', text: 'A short description of the third page.', href: 'https://github.com/VKneider/slicejs-components/releases', target: '_blank' }
  ]
});
:::

:::script label="Centred items, with something more per item" expected="four centred items with soft surfaces; each has a small line with its number of lessons below the text"
const lessons = (n) => {
  const p = document.createElement('p');
  p.textContent = `${n} lessons`;
  p.style.cssText = 'margin:0;font-size:.8rem;font-weight:600;opacity:.7';
  return p;
};
return await slice.build('FeatureList', {
  align: 'center',
  variant: 'soft',
  columns: 4,
  minItemWidth: '160px',
  items: [
    { icon: 'globe', title: 'Topic 1', text: 'A short description of the first topic.', content: lessons(4) },
    { icon: 'html', title: 'Topic 2', text: 'A short description of the second topic.', content: lessons(6) },
    { icon: 'css', title: 'Topic 3', text: 'A short description of the third topic.', content: lessons(7) },
    { icon: 'javascript', title: 'Topic 4', text: 'A short description of the fourth topic.', content: lessons(9) }
  ]
});
:::

## Best Practices
:::tip
Keep titles short and parallel ("Fast setup", "Private by default") and the sentence to one or two lines. If an item needs a paragraph, it is a section of its own.
:::

:::tip
Put a [SectionHeader](/docs/display/section-header) right before it: the header is the `h2`, the items are `h3` (the default), and the page keeps a clean outline.
:::

## Pitfalls
:::warning
Do not turn every item into a link just to make it "interactive". A link that leads to a page that only repeats the sentence is noise.
:::
