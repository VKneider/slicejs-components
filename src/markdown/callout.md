---
title: Callout
route: /docs/display/callout
navLabel: Callout
section: Display
group: Content
order: 42
description: A highlighted passage inside content — a note, a tip, a warning before a step, a definition. Tone for the meaning, variant for the loudness; part of what the page says, never a live region.
component: CalloutDocumentation
generate: true
tags: [callout, note, tip, admonition, warning, content, display]
---

# Callout

## Overview
`Callout` highlights a passage inside content: "Note: grades are published on Fridays", "Tip: press ? to see every shortcut", "Before you start, back up your database", the definition of a term in a lesson. It is part of what the page **says**, like a paragraph — it does not report that something just happened.

Two choices, as in [Alert](/docs/feedback/alert) and [Badge](/docs/display/badge):

- **`tone`** is what it **means**: `neutral`, `accent`, `info` (the default), `success`, `warning`, `danger`. Each has its icon (`neutral` has none).
- **`variant`** is how **loud** it is: `soft` (a tint and a side bar, the default), `outlined`, or `ghost` (only the bar, for long texts where boxes would be too much).

### When to use it
- **Notes and tips in documentation, lessons and articles**: something the reader should not miss while reading.
- **A warning before a step**: "This deletes every row. Export them first."
- **A definition or a key idea** in course material.
- **Conditions next to an offer**: "Prices in USD. Taxes are added at checkout."

### When not to use it
- **The result of something the user did** (saved, failed, undo): an [Alert](/docs/feedback/alert). It is a live region, so screen readers announce it; a Callout is read in its place, like the text around it.
- **Something that happened elsewhere or should float**: a [Toast](/docs/feedback/toast).
- **Content that folds open** (FAQ, details): [Details](/docs/layout/details).
- **Every other paragraph**. A page full of callouts has nothing highlighted.

## Core Behavior
- `title` (a short bold label: "Note", "Before you start"), `text` (one paragraph) and `content` for more: a string (another paragraph), a node, a component, or an array of them. Strings are always text, never markup.
- `icon`: `''` uses the tone's icon, an Icon name (or `{ name }`) replaces it, `false` removes it.
- `role="note"`, named by its title; never `aria-live`. The icon is decorative: say the meaning in the title, not only with the colour.
- Components in `content` are destroyed when the content is replaced and when the callout is destroyed.

## Looks
- `size`: `'md'` (default) or `'sm'`.
- Same tone tokens as Alert and Badge (`--success-color-readable`…), so a theme that tunes one tunes all of them. Per-instance spacing: `--slice-callout-pad-x`, `--slice-callout-pad-y`, `--slice-callout-bar`, `--slice-callout-radius`.

## Live Preview
:::component name="Callout"
{
  "tone": "info",
  "title": "Note",
  "text": "A short note that highlights something important."
}
:::

## Examples
:::script label="A lesson with a definition, a tip and a warning" expected="a short lesson about an example topic: a paragraph, an accent callout 'Definition' explaining the term, a list of three items, a green callout 'Tip' with an inline code example, and a warning 'Common mistake' at the end"
const article = document.createElement('article');
article.style.cssText = 'display:grid;gap:14px;width:100%;max-width:640px;line-height:1.6';

const h = document.createElement('h3');
h.textContent = 'Example topic';
h.style.margin = '0';
const intro = document.createElement('p');
intro.style.margin = '0';
intro.textContent = 'An introductory sentence that explains the topic of this example.';

const definition = await slice.build('Callout', {
  tone: 'accent', icon: 'book-open', title: 'Definition',
  text: 'A definition explains the term used on this page in one or two sentences.'
});

const list = document.createElement('ul');
list.style.cssText = 'margin:0;padding-left:1.2em';
for (const [item, meaning] of [['Item 1', 'Description of the first item'], ['Item 2', 'Description of the second item'], ['Item 3', 'Description of the third item']]) {
  const li = document.createElement('li');
  const b = document.createElement('code');
  b.textContent = item;
  li.append(b, ` ${meaning}`);
  list.append(li);
}

const command = document.createElement('p');
command.textContent = 'An inline example: ';
const code = document.createElement('code');
code.textContent = 'example --flag value';
command.append(code);
const tip = await slice.build('Callout', { tone: 'success', icon: 'lightbulb', title: 'Tip', content: command });

const mistake = await slice.build('Callout', {
  tone: 'warning', title: 'Common mistake',
  text: 'A warning about a common mistake and how to avoid it.'
});

article.append(h, intro, definition, list, tip, mistake);
return article;
:::

:::script label="Before a destructive step" expected="a settings panel titled 'Delete item'; a danger callout explains what will be lost with a list of three items and a link to export data; below it an input to type the item name and a Delete button that stays disabled until the name matches"
const panel = document.createElement('section');
panel.style.cssText = 'display:grid;gap:14px;width:100%;max-width:520px';
const title = document.createElement('h3');
title.textContent = 'Delete item';
title.style.margin = '0';

const lost = document.createElement('ul');
for (const text of ['All related records', 'Every user’s access', 'Any exported copies']) {
  const li = document.createElement('li');
  li.textContent = text;
  lost.append(li);
}
const exportLink = document.createElement('a');
exportLink.href = '#export';
exportLink.textContent = 'Export your data first';
const warning = await slice.build('Callout', {
  tone: 'danger', variant: 'outlined', title: 'This cannot be undone',
  content: [lost, exportLink]
});

const name = await slice.build('Input', { label: 'Type "example-item" to confirm', placeholder: 'example-item' });
const remove = await slice.build('Button', { value: 'Delete item', variant: 'danger', disabled: true });
name.addEventListener('input', () => { remove.disabled = name.value !== 'example-item'; });

panel.append(title, warning, name, remove);
return panel;
:::

:::script label="Long text: ghost callouts in an article" expected="an article paragraph followed by two ghost callouts (only a coloured side bar, no box): an info 'Note' and a neutral quote-like aside without icon"
const article = document.createElement('article');
article.style.cssText = 'display:grid;gap:14px;width:100%;max-width:640px;line-height:1.7';
const p = document.createElement('p');
p.style.margin = '0';
p.textContent = 'A paragraph of example text that introduces the topic and sets up the callouts below.';
article.append(
  p,
  await slice.build('Callout', { variant: 'ghost', title: 'Note', text: 'A note about how this example is built.' }),
  await slice.build('Callout', { variant: 'ghost', tone: 'neutral', icon: false, text: 'In short: a short summary of the note.' })
);
return article;
:::

:::script label="Tones and variants" expected="a grid with the six tones in soft, outlined and ghost"
const grid = document.createElement('div');
grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;width:100%';
for (const variant of ['soft', 'outlined', 'ghost']) {
  for (const tone of ['neutral', 'accent', 'info', 'success', 'warning', 'danger']) {
    grid.append(await slice.build('Callout', { tone, variant, size: 'sm', title: `${tone} · ${variant}`, text: 'A short passage.' }));
  }
}
return grid;
:::

## Best Practices
:::tip
Name it: a title such as "Note", "Tip" or "Before you start" is what a screen reader announces, and what a skimming reader sees first.
:::

:::tip
Use `ghost` in long texts. A thin bar marks the passage without breaking the reading rhythm.
:::

## Pitfalls
:::warning
A Callout is not feedback. If the text appears because something just happened (a save, an error), use an Alert so assistive technology announces it.
:::

:::warning
Do not rely on colour. "Warning" in the title says what the yellow means to everyone.
:::
