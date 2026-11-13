---
title: Stepper
route: /docs/display/stepper
navLabel: Stepper
section: Display
group: Content
order: 43
description: One ordered-process component for static instructions and interactive task navigation, with keyed content, current/completed/error states, linear gating and keyboard support.
component: StepperDocumentation
generate: true
tags: [stepper, steps, process, wizard, onboarding, ordered list, navigation]
---

# Stepper

## Overview

`Stepper` is the single component for an ordered process. `mode: 'static'` explains how something
works. `mode: 'interactive'` shows where someone is in a task and lets them move between stages.
It replaces the earlier separate Steps proposal and implementation; there is no Steps component,
alias or compatibility route.

```js
await slice.build('Stepper', {
   mode: 'static', orientation: 'horizontal',
   items: [{ id: 'account', title: 'Create an account' }, { id: 'course', title: 'Choose a course' }, { id: 'learn', title: 'Start learning' }],
});
```

### When to use it

Use static mode for a landing page's “How it works”, a setup procedure, or instructions with commands.
Use interactive mode for checkout stages, onboarding or a multi-step form. Use `Tabs` for sibling
views with no order/completion, `Timeline` for events with dates, and `TourService` for a guided
overlay pointing at controls across an existing screen.

## Items and modes

`items` is an array of `{ id, title, text, icon, content, status, disabled }`. IDs are unique strings
(numbers normalize to strings); omitted IDs fall back to the index. Supply stable IDs when items
change. Duplicate IDs throw a clear error rather than sharing the wrong DOM row.

- Static mode has an `<ol>` with headings and decorative number/icon/dot markers. No navigation
  controls, current-step announcement or click handlers are added.
- Interactive mode has real buttons, one `aria-current="step"` item, state text and a polite
  announcement of the active title and position. It remains an ordered list, never a tablist.
- `active` is an item ID. By default the first enabled item marked `current` is selected, or the
  first enabled item. One item is current even if input data marks several. Invalid/disabled IDs
  fall back by the same rule. Static mode exposes `active === null`.
- `status` is `upcoming`, `current`, `done`, or `error`. `active` determines the current item;
  completion/error are supplied by the app. Clicking does not mark anything done or validate data.
- `linear: true` allows completed steps and the first incomplete step, but blocks future steps.
  Disabled steps are not actionable. `clickable: false` makes interactive state read-only;
  `disabled` disables all navigation. Programmatic `active = id` can select any enabled item:
  the app owns validation and can restore a saved task.
- `select(id)` returns true only when a permitted user selection changes the current item. It fires
  `onChange(id, { previous, step, index })` and bubbling `step-change` with `{ id, previous, step, index }`.
  Assigning `active` does not fire these callbacks. The component does not own panels or routes.

## Layout and content

`orientation` is vertical by default. Horizontal becomes vertical when **its container** is under
600px. `marker` is `number`, `icon` (number fallback), or `dot`; `start` continues the numbering.
`variant` is `soft`, `filled`, or `outlined`, independently of semantic `tone`. `size` is `sm`/`md`,
`connector` hides/shows joining lines, and `headingLevel` controls the item headings.

`content` accepts text, nodes, components or arrays. Strings stay text. Rows and existing icons
are reused by ID; assigning `items` again keeps surviving content nodes, including an editor's
draft. Removed/replaced content and icons are destroyed. The component owns the content you give it.

Keyboard in interactive mode: Tab enters the actionable step list once, arrows move focus among
enabled steps, Home/End focus the first/last actionable step, and Enter/Space activate the focused
native button. Moving focus alone does not select. RTL horizontal arrows follow reading direction.

## Examples

:::script label="How enrollment works — static" expected="A section header followed by three ordered horizontal stages, stacked vertically in a narrow container."
const box = document.createElement('section'); box.style.cssText = 'display:grid;gap:24px;width:100%';
box.append(await slice.build('SectionHeader', { eyebrow: 'Your next chapter', title: 'From curiosity to your first class', align: 'center', description: 'A simple path to start learning.' }),
   await slice.build('Stepper', { mode: 'static', orientation: 'horizontal', variant: 'filled', items: [
      { id: 'account', title: 'Create your account', text: 'Use your university email to join the learning community.' },
      { id: 'course', title: 'Find your course', text: 'Choose a subject and a schedule that fit your goals.' },
      { id: 'learn', title: 'Start learning', text: 'Meet your instructor and work on your first challenge.' },
   ] }));
return box;
:::

:::script label="A task with panels — interactive and linear" expected="A three-stage course setup with a real Input and Select. Save and continue marks the stage complete and unlocks the next. Completed stages remain available, and the progress bar tracks completion."
const panels = new Map();
const contact = document.createElement('div'); contact.append(await slice.build('Input', { label: 'Contact email', type: 'email', placeholder: 'you@example.com' })); panels.set('contact', contact);
const course = document.createElement('div'); course.append(await slice.build('Select', { label: 'Choose your course', options: [{ label: 'Web components', value: 'web' }, { label: 'Programming foundations', value: 'programming' }] })); panels.set('course', course);
const review = await slice.build('Card', { title: 'Ready for your next chapter', text: 'Review your choices with your advisor before confirming enrollment.', variant: 'outlined' }); panels.set('review', review);
const steps = [{ id: 'contact', title: 'Your details' }, { id: 'course', title: 'Your course' }, { id: 'review', title: 'Review' }];
const progress = await slice.build('ProgressBar', { label: 'Setup completion', max: 3, showValue: true, size: 'sm', format: (v, max) => `${v} of ${max} stages saved` });
const status = document.createElement('p'); status.setAttribute('role', 'status');
const show = id => { for (const [key, panel] of panels) panel.hidden = key !== id; };
const stepper = await slice.build('Stepper', { mode: 'interactive', orientation: 'horizontal', active: 'contact', linear: true, items: steps, onChange: id => show(id) });
const next = await slice.build('Button', { value: 'Save and continue', size: 'sm', onClick: () => {
   const index = steps.findIndex(item => item.id === stepper.active);
   steps[index] = { ...steps[index], status: 'done' }; stepper.items = [...steps];
   progress.value = steps.filter(item => item.status === 'done').length;
   if (index < steps.length - 1) { stepper.active = steps[index + 1].id; show(stepper.active); }
   else { status.textContent = 'Setup saved. You can revisit each stage.'; progress.tone = 'success'; }
} });
const content = document.createElement('div'); content.style.cssText = 'display:grid;gap:18px;width:100%';
content.append(stepper, ...panels.values(), progress, next, status); show('contact');
return content;
:::

:::script label="Instructions with icons and extra content" expected="Three vertical setup instructions with icons, a command and a final success callout."
const command = document.createElement('code'); command.textContent = 'pnpm run dev';
return await slice.build('Stepper', { marker: 'icon', items: [
   { id: 'install', title: 'Install dependencies', text: 'Use the package manager declared by your project.', icon: 'download' },
   { id: 'run', title: 'Start the development server', content: command, icon: 'terminal' },
   { id: 'visit', title: 'Open your application', icon: 'globe', content: await slice.build('Callout', { tone: 'success', text: 'Your local preview is ready for your next change.' }) },
] });
:::

:::script label="A review needs attention" expected="An interactive vertical sequence showing completed, error, current and disabled upcoming states."
return await slice.build('Stepper', { mode: 'interactive', active: 'review', variant: 'outlined', items: [
   { id: 'details', title: 'Contact details', status: 'done', text: 'Your contact information is saved.' },
   { id: 'payment', title: 'Payment method', status: 'error', text: 'The saved card needs an updated expiry date.' },
   { id: 'review', title: 'Review order', text: 'Check your items before submitting.' },
   { id: 'confirm', title: 'Confirmation', disabled: true, text: 'Available after the order is submitted.' },
] });
:::

:::script label="A compact procedure continuing another list" expected="Three compact static steps with dot markers, then the same procedure numbered from four."
const box = document.createElement('div'); box.style.cssText = 'display:grid;gap:24px;width:100%';
const items = [{ title: 'Check your materials', text: 'Have everything ready before you start.' }, { title: 'Follow the instructions', text: 'Work through the procedure carefully.' }, { title: 'Review the result', text: 'Make sure the outcome meets your goal.' }];
box.append(await slice.build('Stepper', { items, marker: 'dot', size: 'sm' }), await slice.build('Stepper', { items, start: 4, size: 'sm', tone: 'success', variant: 'outlined' }));
return box;
:::

## Texts and theming

Built-in status/announcement texts use `slice.stepper.*`: `label`, `upcoming`, `current`, `done`,
`error`, `progress` (`{index}`, `{total}`, `{title}`), with English/Spanish defaults. `texts` overrides
app dictionaries; `ariaLabel` names the list. Titles and descriptions belong to the app.

Colors follow theme tokens; component variables use `--slice-stepper-*` (`color`, `ink`, `on-color`,
`marker`, `gap`, `space`, `line`). Reduced-motion users get no decorative motion. The component has
no network calls, global listeners or timer loop.
