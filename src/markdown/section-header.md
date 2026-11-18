---
title: SectionHeader
route: /docs/display/section-header
navLabel: SectionHeader
section: Display
group: Content
order: 40
description: The top of a section — eyebrow, a real heading, a description and actions such as "View all" or "Contact me". Start or centre aligned, three sizes, linkable with an anchor.
component: SectionHeaderDocumentation
generate: true
tags: [section, header, heading, title, eyebrow, landing, content, display]
---

# SectionHeader

## Overview
`SectionHeader` is how a section starts: a short **eyebrow** ("Projects"), the **title** ("Things I have built"), one or two lines that say what the section is about, and what to do from here ("View all projects →", "Contact me").

The title is a real heading (`h2` by default), so the page keeps an outline that screen readers and search engines can follow.

### When to use it
- **Each section of a landing or a portfolio**: services, projects, testimonials, pricing.
- **Above a list or a grid** that needs a title and a "View all" link: a [FeatureList](/docs/display/feature-list), [Stepper](/docs/display/stepper), a grid of [Card](/docs/layout/card)s.
- **The first section of a page** (`size: 'lg'`, `headingLevel: 1`) when the page has no other title.

### When not to use it
- **Inside a card or a form**: the card's own title, or the field's label.
- **Headings in long text** (articles, docs): plain headings — an eyebrow and actions on every heading of an article is too much.
- **A page frame with navigation**: [Layout](/docs/layout/layout) and [Navbar](/docs/navigation/navbar).

## Core Behavior
- `eyebrow`, `title` and `description`, all plain text.
- `actions`: `{ label, onClick, variant, icon, disabled }` becomes a [Button](/docs/input/button) (the first `filled`, the rest `outlined` unless they say otherwise); `{ label, href, target }` becomes a **link** with an arrow, through `slice.href()` and the router for app paths.
- `align`: `start` (default; the actions on the right, wrapping below on narrow screens) or `center` (the actions below).
- `headingLevel` (default `2`) and `anchor` (the heading's `id`, so `/about#projects` scrolls to it).
- The heading comes first in the DOM — heading navigation lands on the title, then reads the eyebrow — and the eyebrow is drawn above it.

## Looks
- `size`: `sm`, `md` (default) or `lg` (the first section of a page). The title scales with the viewport between limits.
- `tone`: the colour of the eyebrow (`accent` by default). `divider`: a line under the whole header.
- `titleStyle`: `plain` (default), `underline` (a short accent bar under the title) or `rule` (a full line under the title). Use it when the line belongs to the title, like a portfolio section, instead of separating the whole header.
- CSS variables: `--slice-section-header-title` (the title's size), `--slice-section-header-measure` (the text's maximum width).

## Live Preview
:::component name="SectionHeader"
{
  "eyebrow": "Section",
  "title": "Section title",
  "description": "A short description for this section.",
  "titleStyle": "underline",
  "actions": [{ "label": "View all", "href": "/docs" }]
}
:::

## Examples
:::script label="A section with a 'View all' link" expected="a section header with the eyebrow 'Section', a title, a description and a 'View all' link on the right; below it, three cards"
const section = document.createElement('section');
section.style.cssText = 'display:grid;gap:24px;width:100%';
const cards = document.createElement('div');
cards.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px';
for (const [title, text] of [['Item 1', 'A short description of the first item.'], ['Item 2', 'A short description of the second item.'], ['Item 3', 'A short description of the third item.']]) {
  cards.append(await slice.build('Card', { title, text, variant: 'outlined' }));
}
section.append(
  await slice.build('SectionHeader', {
    eyebrow: 'Section',
    title: 'Section title',
    description: 'A short description for this section.',
    anchor: 'section',
    actions: [{ label: 'View all', href: '/docs' }]
  }),
  cards
);
return section;
:::

:::script label="Page opening, centred, with two actions" expected="a large centred header: eyebrow 'Section', a big title, a description, and two buttons 'Action 1' (filled) and 'Action 2' (outlined)"
const toasts = await slice.build('ToastProvider', { singleton: true });
return await slice.build('SectionHeader', {
  size: 'lg',
  align: 'center',
  headingLevel: 1,
  eyebrow: 'Section',
  title: 'Page title',
  description: 'A short description for this page.',
  actions: [
    { label: 'Action 1', onClick: () => toasts.show('Action 1 selected.') },
    { label: 'Action 2', onClick: () => toasts.show('Action 2 selected.') }
  ]
});
:::

:::script label="Small headers with a divider" expected="two small headers with a line under each: 'Section 1' with a 'View all' link, and 'Section 2' with an outlined 'Action' button with an icon"
const toasts = await slice.build('ToastProvider', { singleton: true });
const box = document.createElement('div');
box.style.cssText = 'display:grid;gap:28px;width:100%;max-width:640px';
box.append(
  await slice.build('SectionHeader', { size: 'sm', divider: true, title: 'Section 1', description: 'A short description.', actions: [{ label: 'View all', href: '/docs' }] }),
  await slice.build('SectionHeader', { size: 'sm', divider: true, title: 'Section 2', actions: [{ label: 'Action', variant: 'outlined', icon: { name: 'user-add' }, onClick: () => toasts.show('Action selected.') }] })
);
return box;
:::

:::script label="Eyebrow tones" expected="four small headers whose eyebrows are coloured accent, success, warning and neutral"
const box = document.createElement('div');
box.style.cssText = 'display:grid;gap:20px;width:100%';
for (const [tone, eyebrow] of [['accent', 'Label 1'], ['success', 'Label 2'], ['warning', 'Label 3'], ['neutral', 'Label 4']]) {
  box.append(await slice.build('SectionHeader', { size: 'sm', tone, eyebrow, title: `${eyebrow} title` }));
}
return box;
:::

:::script label="Title styles: plain, underline and rule" expected="three headers: one with no line, one with a short accent bar under the title, and one with a full line under the title"
const box = document.createElement('div');
box.style.cssText = 'display:grid;gap:28px;width:100%;max-width:640px';
for (const [titleStyle, title] of [['plain', 'Plain'], ['underline', 'Underline'], ['rule', 'Rule']]) {
  box.append(await slice.build('SectionHeader', {
    size: 'sm',
    titleStyle,
    eyebrow: 'Section',
    title,
    description: 'A short description for this section.'
  }));
}
return box;
:::

## Best Practices
:::tip
One `h1` per page. Sections use `h2` (the default); the items inside them — a FeatureList, Stepper — use `h3`.
:::

:::tip
Use a link for "View all" and a button for an action. A link goes somewhere (it can open in a new tab); a button does something here.
:::

## Pitfalls
:::warning
Keep the eyebrow to one or two words. It labels the section; it is not a second title.
:::

:::related
- [Grid](/docs/layout/grid) - What usually goes under it.
- [Empty state](/docs/display/empty-state) - A section with nothing yet.
- [Card](/docs/layout/card) - Sections as cards.
:::
