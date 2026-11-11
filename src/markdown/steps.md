---
title: Steps
route: /docs/display/steps
navLabel: Steps
section: Display
group: Content
order: 43
description: How something is done, in order — numbered (or icon, or dot) markers joined by a line, each with a title, a sentence and any content. Vertical, or horizontal where its container has room.
component: StepsDocumentation
generate: true
tags: [steps, process, how it works, onboarding, timeline, ordered list, content, display]
---

# Steps

## Overview
`Steps` explains a process in order: "How it works", "How to enrol", "Getting your certificate", the steps to install a tool. Each step has a marker (its number, an icon or a dot), a title, a sentence, and anything else it needs — a command, a link, an image.

It is an ordered list (`<ol>`), so a screen reader announces the order and the count ("2 of 4").

### When to use it
- **"How it works"** on a landing: three or four steps from sign-up to result.
- **Instructions**: install, configure, deploy — with the command inside each step.
- **A process someone follows outside the app**: how to apply, how to return an order.

### When not to use it
- **The screens of a task the user is going through** (done, current, next; Back and Continue): that is a Stepper. `Steps` only shows a process; it has no current step and nothing to navigate.
- **Things that are not in order**: a [FeatureList](/docs/display/feature-list).
- **Events with dates** (a history, a changelog): a timeline.

## Core Behavior
- `items: [{ title, text, icon, content, id }]`. `content` takes a string, a node, a component or an array of them; text is never markup.
- `marker`: `number` (default), `icon` (each step's `icon`; a step without one keeps its number, so the order still reads) or `dot`.
- `start`: the number of the first step, for a list that continues another one. It is set on the `<ol>` too.
- `orientation`: `vertical` (default) or `horizontal`. Horizontal goes back to vertical when **its container** is narrower than 600px — a container query, so it also works inside a narrow column on a wide screen.
- `connector`: the line between markers (none after the last step).
- `headingLevel` (default `3`): every title is a heading. The markers and the line are decorative.

## Looks
- `variant`: the marker — `soft` (a tint, default), `filled` or `outlined`.
- `tone`: the colour of markers and line (`accent` by default). `size`: `md` or `sm`.
- CSS variables: `--slice-steps-marker` (its size), `--slice-steps-gap`, `--slice-steps-space` (between steps), `--slice-steps-line`.

## Live Preview
:::component name="Steps"
{
  "items": [
    { "title": "Step 1", "text": "A short description of the first step." },
    { "title": "Step 2", "text": "A short description of the second step." },
    { "title": "Step 3", "text": "A short description of the third step." }
  ]
}
:::

## Examples
:::script label="How it works, on a landing" expected="a centred section header 'How it works' followed by three horizontal steps with filled numbered markers joined by a line; when the preview is narrow they stack vertically"
const section = document.createElement('section');
section.style.cssText = 'display:grid;gap:28px;width:100%';
section.append(
  await slice.build('SectionHeader', {
    align: 'center',
    eyebrow: 'How it works',
    title: 'From start to result in three steps',
    description: 'A short description for this process.'
  }),
  await slice.build('Steps', {
    orientation: 'horizontal',
    variant: 'filled',
    items: [
      { title: 'Step 1', text: 'A short description of the first step.' },
      { title: 'Step 2', text: 'A short description of the second step.' },
      { title: 'Step 3', text: 'A short description of the third step.' }
    ]
  })
);
return section;
:::

:::script label="Instructions with commands" expected="four vertical steps with icon markers; steps 1 to 3 contain a dark code line (command 1, command 2, command 3) and step 4 contains an info callout about the result"
const command = (text) => {
  const pre = document.createElement('pre');
  pre.style.cssText = 'margin:0;padding:10px 12px;border-radius:8px;background:#1d1b29;color:#f4f2ff;font-size:.85rem;overflow:auto';
  const code = document.createElement('code');
  code.style.cssText = 'background:none;padding:0;color:inherit';
  code.textContent = text;
  pre.append(code);
  return pre;
};
return await slice.build('Steps', {
  marker: 'icon',
  items: [
    { icon: 'download', title: 'Step 1', text: 'A short description of the first step.', content: command('command-1') },
    { icon: 'folder-plus', title: 'Step 2', text: 'A short description of the second step.', content: command('command-2') },
    { icon: 'terminal', title: 'Step 3', text: 'A short description of the third step.', content: command('command-3') },
    {
      icon: 'globe', title: 'Step 4',
      content: await slice.build('Callout', { tone: 'info', size: 'sm', text: 'The result is available in the browser.' })
    }
  ]
});
:::

:::script label="A procedure split in two lists" expected="two columns: 'Part 1' with steps 1–2 and 'Part 2' continuing with steps 3–5, all with outlined markers in the success tone"
const box = document.createElement('div');
box.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:32px;width:100%';
const column = async (title, start, items) => {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:grid;gap:14px;align-content:start';
  wrap.append(
    await slice.build('SectionHeader', { title, size: 'sm', headingLevel: 3 }),
    await slice.build('Steps', { start, variant: 'outlined', tone: 'success', size: 'sm', headingLevel: 4, items })
  );
  return wrap;
};
box.append(
  await column('Part 1', 1, [
    { title: 'Step 1', text: 'A short description of the first step.' },
    { title: 'Step 2', text: 'A short description of the second step.' }
  ]),
  await column('Part 2', 3, [
    { title: 'Step 3', text: 'A short description of the third step.' },
    { title: 'Step 4', text: 'A short description of the fourth step.' },
    { title: 'Step 5', text: 'A short description of the fifth step.' }
  ])
);
return box;
:::

:::script label="Dots for a short sequence" expected="three steps with dot markers and no numbers, in a compact size"
return await slice.build('Steps', {
  marker: 'dot',
  size: 'sm',
  items: [
    { title: 'Step 1', text: 'A short description of the first step.' },
    { title: 'Step 2', text: 'A short description of the second step.' },
    { title: 'Step 3', text: 'A short description of the third step.' }
  ]
});
:::

## Best Practices
:::tip
Three to five steps. More than that is usually two processes, or a guide with sections.
:::

:::tip
Start each title with a verb ("Create", "Choose", "Pay"). The reader should be able to follow the process from the titles alone.
:::

## Pitfalls
:::warning
Do not fake a wizard with Steps by colouring the "current" one. A task the user is going through needs a current step that assistive technology knows about, and navigation between steps: that is the Stepper's job.
:::
