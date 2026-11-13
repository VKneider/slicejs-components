---
title: ProgressBar
route: /docs/display/progress-bar
navLabel: ProgressBar
section: Display
group: Feedback
order: 44
description: Accessible progress for uploads, imports and quotas, with reactive value/max, formatted output and an optional indeterminate state.
component: ProgressBarDocumentation
generate: true
tags: [progress, progressbar, upload, quota, import, loading, feedback]
---

# ProgressBar

## Overview

`ProgressBar` shows how much work is complete when a total is known. Give it a meaningful `label`,
a `value` and a `max`. For an operation whose total is temporarily unknown, use `indeterminate`.

```js
const progress = await slice.build('ProgressBar', {
   label: 'Importing contacts', value: 3, max: 8, showValue: true,
   format: (value, max) => `${value} of ${max} files`,
});
progress.value = 4;
```

### When to use it

Uploads, batch jobs, storage quotas, or completion of a task with a measurable total. It displays
progress; it does not upload files, schedule jobs, or own a wizard.

### When not to use it

Use `Loading` for a general busy indicator, `SkeletonService` for content whose shape is known,
and `Stepper` for the named stages of a process. A progress bar is not a chart or a circular gauge.

## Behavior

- Values are finite numbers clamped to `0…max`. A nonpositive/nonfinite maximum falls back to 100.
  The assigned amount is retained, so increasing `max` can reveal an amount that was previously clamped.
- `label` names the bar. An omitted label falls back to translated “Progress”; use a specific label
  in real apps. `showLabel: false` hides it visually while the bar retains its accessible name.
- `showValue` exposes the formatted value beside the track. The default is a localized percentage;
  `format(value, max)` customizes both that value and `aria-valuetext`. `ariaValueText` overrides
  the spoken value without changing the visible one. Explicit `locale` wins over the app locale.
- `tone` is semantic; `size` (`sm`, `md`, `lg`) controls track height. Props update without rebuilding.
- `indeterminate` omits `aria-valuenow`/`aria-valuetext`: it never claims a fake percentage. With
  reduced motion it stays still; otherwise its fill moves. Returning to determinate restores the value.
- The bar has `role="progressbar"` and min/max/current values. It is not a live region by default;
  announce meaningful milestones separately rather than every percentage tick.

## Examples

:::script label="A batch import, one file at a time" expected="A card with a progress bar, Import next and Reset; each import advances the formatted count from zero to eight files."
const progress = await slice.build('ProgressBar', { label: 'Contact import', max: 8, showValue: true, format: (v, max) => `${v} of ${max} files` });
const next = await slice.build('Button', { value: 'Import next file', size: 'sm', onClick: () => { progress.value += 1; progress.tone = progress.value === progress.max ? 'success' : 'accent'; next.disabled = progress.value === progress.max; } });
const reset = await slice.build('Button', { value: 'Reset', variant: 'outlined', size: 'sm', onClick: () => { progress.value = 0; progress.tone = 'accent'; next.disabled = false; } });
const actions = document.createElement('div'); actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:16px'; actions.append(next, reset);
const content = document.createElement('div'); content.append(progress, actions);
return await slice.build('Card', { title: 'Import your address book', text: 'Bring your contacts together without losing sight of progress.', content, variant: 'outlined' });
:::

:::script label="Storage quota with a semantic warning" expected="A large warning bar showing 84 of 100 GB in a card."
return await slice.build('Card', {
   title: 'Workspace storage', text: 'Archive older files or upgrade when you need more space.',
   content: await slice.build('ProgressBar', { label: 'Storage used', value: 84, max: 100, tone: 'warning', size: 'lg', showValue: true, format: (v, max) => `${v} / ${max} GB` }),
});
:::

:::script label="Unknown total, then measurable progress" expected="An indeterminate track that stays still under reduced motion; Use known total switches it to a 42 percent info bar."
const progress = await slice.build('ProgressBar', { label: 'Preparing your export', indeterminate: true, showValue: true, tone: 'info' });
const toggle = await slice.build('Button', { value: 'Use known total', variant: 'outlined', size: 'sm', onClick: () => { progress.indeterminate = !progress.indeterminate; progress.value = 42; toggle.value = progress.indeterminate ? 'Use known total' : 'Use unknown total'; } });
const box = document.createElement('div'); box.style.cssText = 'display:grid;gap:16px;width:100%'; box.append(progress, toggle); return box;
:::

:::script label="Compact semantic tones" expected="Six small progress bars, each named and colored by its tone."
const box = document.createElement('div'); box.style.cssText = 'display:grid;gap:16px;width:100%';
for (const tone of ['neutral', 'accent', 'info', 'success', 'warning', 'danger']) box.append(await slice.build('ProgressBar', { label: tone, value: 65, tone, size: 'sm', showValue: true }));
return box;
:::

## Texts and theming

`slice.progressBar.label` and `.working` have English/Spanish defaults. The app dictionary wins;
`texts: { label, working }` wins over the dictionary. Visible fallback texts follow locale changes.
Colors follow theme tokens. Local CSS overrides: `--slice-progress-bar-track`, `--slice-progress-bar-fill`,
`--slice-progress-bar-radius`, `--slice-progress-bar-height` and `--slice-progress-bar-color`.
