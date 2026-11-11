---
title: Rating
route: /docs/input/rating
navLabel: Rating
section: Input Components
group: Basic
order: 15
description: A score from 1 to 5 (or 10) with stars — in a review form, a survey or a quick "how was it?" — and the same stars, read-only, to show an average. Halves, a word per value, and native radios underneath.
component: RatingDocumentation
generate: true
tags: [rating, stars, score, review, feedback, survey, input, forms]
---

# Rating

## Overview
`Rating` asks for a score: "How was the item?", a review, "Rate your experience". It draws stars (or hearts, or dots), lights them up as the pointer moves over them, and keeps the chosen value: `value` is a number from 1 to `max`, or `null` while there is none.

With `readOnly` it shows a score that already exists — the average of a product, the stars of one review — as a single image with a name: "Rated 4.5 out of 5".

Underneath it is a group of native radios, like [RadioGroup](/docs/input/radio-group): one Tab stop, the arrows move and choose, `required` works, and a native `<form>` submits the value.

### When to use it
- **Review and feedback forms**: a course, a product, a support conversation.
- **Quick satisfaction questions** after something ends: an order, a call, a lesson.
- **Showing an average or a single review's score** (`readOnly`), with the count next to it.

### When not to use it
- **Choosing among named options** ("Free · Pro · Team"): [RadioGroup](/docs/input/radio-group).
- **A number on a wide scale** (0–100, a price, a volume): [Slider](/docs/input/slider). A row of 100 stars is not a control.
- **Agree / disagree scales** (a Likert question): a RadioGroup with the words as options. Stars mean "better", which "Neither agree nor disagree" is not.
- **Likes and favourites** (one tap, on or off): a toggle [Button](/docs/input/button).

## Core Behavior
- `value` (a number or `null`), `max` (5 by default, up to 10), `allowHalf` (0.5 steps: two radios per star, the left half and the right half). A value is rounded to the nearest step and kept between the first step and `max`.
- **Clearing**: with `clearable` (on by default) a click on the chosen star, Backspace, Delete or 0 removes the value. A polite status says "Rating cleared".
- `labels`: one word per whole value, from 1 — `['Poor', 'Fair', 'Good', 'Very good', 'Excellent']`. Each radio is then named "Very good, 4 of 5", and `showValue` writes "4 · Very good" next to the stars (it follows the pointer while it moves).
- `onChange(value | null)` on every choice by the user, and a bubbling `change` event — also when clearing — so a [Form](/docs/input/form) re-validates.
- `label` is a visible legend; `ariaLabel` names it without one. Inside a Form, the field's label names it.
- `disabled`, `required` and `name` (the radios' name for a native form; generated when empty).
- `readOnly`: no radios and no Tab stop; one element with `role="img"` and the score in words.
- Texts are built in (English and Spanish) and follow the active language: "{value} of {max}", "Rated {value} out of {max}", "Not rated", "Rating cleared". Replace any of them with `texts`.

### Keyboard
Tab lands on the chosen star (or the first one). ← → (and ↑ ↓) move **and** choose, as in any radio group. Backspace, Delete or 0 clear when `clearable`.

## Looks
- `size`: `sm`, `md` (default) or `lg`.
- `tone`: the colour of the lit stars — `warning` (gold, the default), `accent`, `info`, `success`, `danger` or `neutral`.
- `icon`: the character drawn — `★` by default; `♥`, `●`, `▲`… Any single character works, and both the empty and the lit star use it.
- CSS variables: `--slice-rating-size`, `--slice-rating-gap`, `--slice-rating-color` (lit) and `--slice-rating-empty`.

## Live Preview
:::component name="Rating"
{
  "label": "How would you rate this item?",
  "value": 4,
  "labels": ["Poor", "Fair", "Good", "Very good", "Excellent"],
  "showValue": true
}
:::

## Examples
:::script label="A feedback form" expected="a form titled 'Rate this item' with a required star rating 'How was the item?' that writes the chosen word next to the stars, a second rating 'How clear was the information?' and a comment box; submitting without stars shows the required message, submitting with stars shows a toast with the scores"
const toasts = await slice.build('ToastProvider', { singleton: true });
const words = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
const form = await slice.build('Form', {
  maxWidth: '480px',
  submitText: 'Send feedback',
  schema: [
    { kind: 'field', name: 'item', label: 'How was the item?', component: 'Rating', required: true,
      props: { labels: words, showValue: true, size: 'lg' } },
    { kind: 'field', name: 'clarity', label: 'How clear was the information?', component: 'Rating',
      props: { labels: words, showValue: true } },
    { kind: 'field', name: 'comment', label: 'Anything we should change?', component: 'Textarea', full: true }
  ],
  onSubmit: (values) => {
    toasts.show(`Thanks! Item ${values.item}/5${values.clarity ? `, clarity ${values.clarity}/5` : ''}.`);
  }
});
const title = document.createElement('h3');
title.textContent = 'Rate this item';
title.style.margin = '0 0 8px';
const box = document.createElement('div');
box.style.cssText = 'width:100%';
box.append(title, form);
return box;
:::

:::script label="An average and the reviews under it" expected="a summary with a big 4.6, read-only stars with four and a half lit and '128 reviews'; a bar per star count; below, two reviews with small read-only stars, an author and a text"
const summary = document.createElement('section');
summary.style.cssText = 'display:grid;gap:16px;width:100%;max-width:560px';

const top = document.createElement('div');
top.style.cssText = 'display:flex;gap:24px;align-items:center;flex-wrap:wrap';
const average = document.createElement('div');
average.style.cssText = 'display:grid;justify-items:start;gap:4px';
const big = document.createElement('span');
big.style.cssText = 'font-size:2.4rem;font-weight:700;line-height:1';
big.textContent = '4.6';
const count = document.createElement('span');
count.style.cssText = 'font-size:.85rem;opacity:.75';
count.textContent = '128 reviews';
average.append(big, await slice.build('Rating', { value: 4.6, readOnly: true, allowHalf: true }), count);

const bars = document.createElement('div');
bars.style.cssText = 'display:grid;gap:4px;flex:1;min-width:200px;font-size:.8rem';
for (const [stars, n] of [[5, 96], [4, 21], [3, 6], [2, 3], [1, 2]]) {
  const row = document.createElement('div');
  row.style.cssText = 'display:grid;grid-template-columns:2ch 1fr 3ch;gap:8px;align-items:center';
  const track = document.createElement('span');
  track.style.cssText = 'height:6px;border-radius:3px;background:color-mix(in srgb, currentColor 12%, transparent);overflow:hidden';
  const fill = document.createElement('span');
  fill.style.cssText = `display:block;height:100%;width:${Math.round((n / 128) * 100)}%;background:var(--warning-color)`;
  track.append(fill);
  row.append(`${stars}★`, track, String(n));
  bars.append(row);
}
top.append(average, bars);

const list = document.createElement('div');
list.style.cssText = 'display:grid;gap:14px';
for (const [author, score, text] of [
  ['Reviewer 1', 5, 'A short example review.'],
  ['Reviewer 2', 4, 'A longer example review that explains the score.']
]) {
  const review = document.createElement('article');
  review.style.cssText = 'display:grid;gap:4px';
  const head = document.createElement('div');
  head.style.cssText = 'display:flex;gap:8px;align-items:center;font-size:.85rem;font-weight:600';
  head.append(await slice.build('Rating', { value: score, readOnly: true, size: 'sm' }), author);
  const p = document.createElement('p');
  p.style.margin = '0';
  p.textContent = text;
  review.append(head, p);
  list.append(review);
}
summary.append(top, list);
return summary;
:::

:::script label="Rate your experience" expected="a small card 'Your item arrived' with a rating 'How was your experience?'; picking a score thanks you below and, for 1 or 2 stars, asks what went wrong"
const card = document.createElement('section');
card.style.cssText = 'display:grid;gap:10px;width:100%;max-width:380px;padding:16px;border:1px solid var(--slice-border-raised, #ddd);border-radius:12px';
const title = document.createElement('strong');
title.textContent = 'Your item arrived';
const reply = document.createElement('p');
reply.style.cssText = 'margin:0;font-size:.9rem;min-height:1.4em';
const rating = await slice.build('Rating', {
  label: 'How was your experience?',
  labels: ['Bad', 'Not great', 'OK', 'Good', 'Perfect'],
  showValue: true,
  onChange: (value) => {
    reply.textContent = value === null ? ''
      : value <= 2 ? 'Sorry about that. What went wrong?'
      : 'Thanks! Your feedback was saved.';
  }
});
card.append(title, rating, reply);
return card;
:::

:::script label="Halves, ten points, icons and tones" expected="four ratings: one with halves at 3.5, one out of 10 at 7, red hearts at 4 and accent dots at 2, each with its value written next to it"
const box = document.createElement('div');
box.style.cssText = 'display:grid;gap:14px;width:100%';
box.append(
  await slice.build('Rating', { label: 'Halves', allowHalf: true, value: 3.5, showValue: true }),
  await slice.build('Rating', { label: 'Out of 10', max: 10, value: 7, size: 'sm', showValue: true }),
  await slice.build('Rating', { label: 'How much did you like it?', icon: '♥', tone: 'danger', value: 4 }),
  await slice.build('Rating', { label: 'Difficulty', icon: '●', tone: 'accent', value: 2, size: 'sm', labels: ['Easy', 'Medium', 'Hard'], max: 3, showValue: true })
);
return box;
:::

## Best Practices
:::tip
Give each value a word with `labels` and turn on `showValue`. "4 · Very good" is clearer than four stars, and the word is read out with the number.
:::

:::tip
Show the count next to an average: "4.6 · 128 reviews". Five stars from two people and five stars from two thousand are not the same.
:::

## Pitfalls
:::warning
Do not round an average to whole stars when showing it. Use `allowHalf` with `readOnly`, and write the exact number next to it.
:::

:::warning
A read-only rating is not a control: it has no Tab stop. To let people change a score they gave, show the editable one.
:::
