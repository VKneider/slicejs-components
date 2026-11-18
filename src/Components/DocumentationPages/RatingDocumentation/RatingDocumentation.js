export default class RatingDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"A feedback form","expected":"a form titled 'Rate this item' with a required star rating 'How was the item?' that writes the chosen word next to the stars, a second rating 'How clear was the information?' and a comment box; submitting without stars shows the required message, submitting with stars shows a toast with the scores","kind":"script","content":"const toasts = await slice.build('ToastProvider', { singleton: true });\nconst words = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];\nconst form = await slice.build('Form', {\n  maxWidth: '480px',\n  submitText: 'Send feedback',\n  schema: [\n    { kind: 'field', name: 'item', label: 'How was the item?', component: 'Rating', required: true,\n      props: { labels: words, showValue: true, size: 'lg' } },\n    { kind: 'field', name: 'clarity', label: 'How clear was the information?', component: 'Rating',\n      props: { labels: words, showValue: true } },\n    { kind: 'field', name: 'comment', label: 'Anything we should change?', component: 'Textarea', full: true }\n  ],\n  onSubmit: (values) => {\n    toasts.show(`Thanks! Item ${values.item}/5${values.clarity ? `, clarity ${values.clarity}/5` : ''}.`);\n  }\n});\nconst title = document.createElement('h3');\ntitle.textContent = 'Rate this item';\ntitle.style.margin = '0 0 8px';\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(title, form);\nreturn box;"},{"label":"An average and the reviews under it","expected":"a summary with a big 4.6, read-only stars with four and a half lit and '128 reviews'; a bar per star count; below, two reviews with small read-only stars, an author and a text","kind":"script","content":"const summary = document.createElement('section');\nsummary.style.cssText = 'display:grid;gap:16px;width:100%;max-width:560px';\n\nconst top = document.createElement('div');\ntop.style.cssText = 'display:flex;gap:24px;align-items:center;flex-wrap:wrap';\nconst average = document.createElement('div');\naverage.style.cssText = 'display:grid;justify-items:start;gap:4px';\nconst big = document.createElement('span');\nbig.style.cssText = 'font-size:2.4rem;font-weight:700;line-height:1';\nbig.textContent = '4.6';\nconst count = document.createElement('span');\ncount.style.cssText = 'font-size:.85rem;opacity:.75';\ncount.textContent = '128 reviews';\naverage.append(big, await slice.build('Rating', { value: 4.6, readOnly: true, allowHalf: true }), count);\n\nconst bars = document.createElement('div');\nbars.style.cssText = 'display:grid;gap:4px;flex:1;min-width:200px;font-size:.8rem';\nfor (const [stars, n] of [[5, 96], [4, 21], [3, 6], [2, 3], [1, 2]]) {\n  const row = document.createElement('div');\n  row.style.cssText = 'display:grid;grid-template-columns:2ch 1fr 3ch;gap:8px;align-items:center';\n  const track = document.createElement('span');\n  track.style.cssText = 'height:6px;border-radius:3px;background:color-mix(in srgb, currentColor 12%, transparent);overflow:hidden';\n  const fill = document.createElement('span');\n  fill.style.cssText = `display:block;height:100%;width:${Math.round((n / 128) * 100)}%;background:var(--warning-color)`;\n  track.append(fill);\n  row.append(`${stars}★`, track, String(n));\n  bars.append(row);\n}\ntop.append(average, bars);\n\nconst list = document.createElement('div');\nlist.style.cssText = 'display:grid;gap:14px';\nfor (const [author, score, text] of [\n  ['Reviewer 1', 5, 'A short example review.'],\n  ['Reviewer 2', 4, 'A longer example review that explains the score.']\n]) {\n  const review = document.createElement('article');\n  review.style.cssText = 'display:grid;gap:4px';\n  const head = document.createElement('div');\n  head.style.cssText = 'display:flex;gap:8px;align-items:center;font-size:.85rem;font-weight:600';\n  head.append(await slice.build('Rating', { value: score, readOnly: true, size: 'sm' }), author);\n  const p = document.createElement('p');\n  p.style.margin = '0';\n  p.textContent = text;\n  review.append(head, p);\n  list.append(review);\n}\nsummary.append(top, list);\nreturn summary;"},{"label":"Rate your experience","expected":"a small card 'Your item arrived' with a rating 'How was your experience?'; picking a score thanks you below and, for 1 or 2 stars, asks what went wrong","kind":"script","content":"const card = document.createElement('section');\ncard.style.cssText = 'display:grid;gap:10px;width:100%;max-width:380px;padding:16px;border:1px solid var(--slice-border-raised, #ddd);border-radius:12px';\nconst title = document.createElement('strong');\ntitle.textContent = 'Your item arrived';\nconst reply = document.createElement('p');\nreply.style.cssText = 'margin:0;font-size:.9rem;min-height:1.4em';\nconst rating = await slice.build('Rating', {\n  label: 'How was your experience?',\n  labels: ['Bad', 'Not great', 'OK', 'Good', 'Perfect'],\n  showValue: true,\n  onChange: (value) => {\n    reply.textContent = value === null ? ''\n      : value <= 2 ? 'Sorry about that. What went wrong?'\n      : 'Thanks! Your feedback was saved.';\n  }\n});\ncard.append(title, rating, reply);\nreturn card;"},{"label":"Halves, ten points, icons and tones","expected":"four ratings: one with halves at 3.5, one out of 10 at 7, red hearts at 4 and accent dots at 2, each with its value written next to it","kind":"script","content":"const box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:14px;width:100%';\nbox.append(\n  await slice.build('Rating', { label: 'Halves', allowHalf: true, value: 3.5, showValue: true }),\n  await slice.build('Rating', { label: 'Out of 10', max: 10, value: 7, size: 'sm', showValue: true }),\n  await slice.build('Rating', { label: 'How much did you like it?', icon: '♥', tone: 'danger', value: 4 }),\n  await slice.build('Rating', { label: 'Difficulty', icon: '●', tone: 'accent', value: 2, size: 'sm', labels: ['Easy', 'Medium', 'Hard'], max: 3, showValue: true })\n);\nreturn box;"}];
  }

  async init() {
    this.markdownPath = "rating.md";
    this.markdownContent = "---\ntitle: Rating\nroute: /docs/input/rating\nnavLabel: Rating\nsection: Input Components\ngroup: Basic\norder: 15\ndescription: A score from 1 to 5 (or 10) with stars — in a review form, a survey or a quick \"how was it?\" — and the same stars, read-only, to show an average. Halves, a word per value, and native radios underneath.\ncomponent: RatingDocumentation\ngenerate: true\ntags: [rating, stars, score, review, feedback, survey, input, forms]\n---\n\n# Rating\n\n## Overview\n`Rating` asks for a score: \"How was the item?\", a review, \"Rate your experience\". It draws stars (or hearts, or dots), lights them up as the pointer moves over them, and keeps the chosen value: `value` is a number from 1 to `max`, or `null` while there is none.\n\nWith `readOnly` it shows a score that already exists — the average of a product, the stars of one review — as a single image with a name: \"Rated 4.5 out of 5\".\n\nUnderneath it is a group of native radios, like [RadioGroup](/docs/input/radio-group): one Tab stop, the arrows move and choose, `required` works, and a native `<form>` submits the value.\n\n### When to use it\n- **Review and feedback forms**: a course, a product, a support conversation.\n- **Quick satisfaction questions** after something ends: an order, a call, a lesson.\n- **Showing an average or a single review's score** (`readOnly`), with the count next to it.\n\n### When not to use it\n- **Choosing among named options** (\"Free · Pro · Team\"): [RadioGroup](/docs/input/radio-group).\n- **A number on a wide scale** (0–100, a price, a volume): [Slider](/docs/input/slider). A row of 100 stars is not a control.\n- **Agree / disagree scales** (a Likert question): a RadioGroup with the words as options. Stars mean \"better\", which \"Neither agree nor disagree\" is not.\n- **Likes and favourites** (one tap, on or off): a toggle [Button](/docs/input/button).\n\n## Core Behavior\n- `value` (a number or `null`), `max` (5 by default, up to 10), `allowHalf` (0.5 steps: two radios per star, the left half and the right half). A value is rounded to the nearest step and kept between the first step and `max`.\n- **Clearing**: with `clearable` (on by default) a click on the chosen star, Backspace, Delete or 0 removes the value. A polite status says \"Rating cleared\".\n- `labels`: one word per whole value, from 1 — `['Poor', 'Fair', 'Good', 'Very good', 'Excellent']`. Each radio is then named \"Very good, 4 of 5\", and `showValue` writes \"4 · Very good\" next to the stars (it follows the pointer while it moves).\n- `onChange(value | null)` on every choice by the user, and a bubbling `change` event — also when clearing — so a [Form](/docs/input/form) re-validates.\n- `label` is a visible legend; `ariaLabel` names it without one. Inside a Form, the field's label names it.\n- `disabled`, `required` and `name` (the radios' name for a native form; generated when empty).\n- `readOnly`: no radios and no Tab stop; one element with `role=\"img\"` and the score in words.\n- Texts are built in (English and Spanish) and follow the active language: \"{value} of {max}\", \"Rated {value} out of {max}\", \"Not rated\", \"Rating cleared\". Replace any of them with `texts`.\n\n### Keyboard\nTab lands on the chosen star (or the first one). ← → (and ↑ ↓) move **and** choose, as in any radio group. Backspace, Delete or 0 clear when `clearable`.\n\n## Looks\n- `size`: `sm`, `md` (default) or `lg`.\n- `tone`: the colour of the lit stars — `warning` (gold, the default), `accent`, `info`, `success`, `danger` or `neutral`.\n- `icon`: the character drawn — `★` by default; `♥`, `●`, `▲`… Any single character works, and both the empty and the lit star use it.\n- CSS variables: `--slice-rating-size`, `--slice-rating-gap`, `--slice-rating-color` (lit) and `--slice-rating-empty`.\n\n## Live Preview\n:::component name=\"Rating\"\n{\n  \"label\": \"How would you rate this item?\",\n  \"value\": 4,\n  \"labels\": [\"Poor\", \"Fair\", \"Good\", \"Very good\", \"Excellent\"],\n  \"showValue\": true\n}\n:::\n\n## Examples\n:::script label=\"A feedback form\" expected=\"a form titled 'Rate this item' with a required star rating 'How was the item?' that writes the chosen word next to the stars, a second rating 'How clear was the information?' and a comment box; submitting without stars shows the required message, submitting with stars shows a toast with the scores\"\nconst toasts = await slice.build('ToastProvider', { singleton: true });\nconst words = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];\nconst form = await slice.build('Form', {\n  maxWidth: '480px',\n  submitText: 'Send feedback',\n  schema: [\n    { kind: 'field', name: 'item', label: 'How was the item?', component: 'Rating', required: true,\n      props: { labels: words, showValue: true, size: 'lg' } },\n    { kind: 'field', name: 'clarity', label: 'How clear was the information?', component: 'Rating',\n      props: { labels: words, showValue: true } },\n    { kind: 'field', name: 'comment', label: 'Anything we should change?', component: 'Textarea', full: true }\n  ],\n  onSubmit: (values) => {\n    toasts.show(`Thanks! Item ${values.item}/5${values.clarity ? `, clarity ${values.clarity}/5` : ''}.`);\n  }\n});\nconst title = document.createElement('h3');\ntitle.textContent = 'Rate this item';\ntitle.style.margin = '0 0 8px';\nconst box = document.createElement('div');\nbox.style.cssText = 'width:100%';\nbox.append(title, form);\nreturn box;\n:::\n\n:::script label=\"An average and the reviews under it\" expected=\"a summary with a big 4.6, read-only stars with four and a half lit and '128 reviews'; a bar per star count; below, two reviews with small read-only stars, an author and a text\"\nconst summary = document.createElement('section');\nsummary.style.cssText = 'display:grid;gap:16px;width:100%;max-width:560px';\n\nconst top = document.createElement('div');\ntop.style.cssText = 'display:flex;gap:24px;align-items:center;flex-wrap:wrap';\nconst average = document.createElement('div');\naverage.style.cssText = 'display:grid;justify-items:start;gap:4px';\nconst big = document.createElement('span');\nbig.style.cssText = 'font-size:2.4rem;font-weight:700;line-height:1';\nbig.textContent = '4.6';\nconst count = document.createElement('span');\ncount.style.cssText = 'font-size:.85rem;opacity:.75';\ncount.textContent = '128 reviews';\naverage.append(big, await slice.build('Rating', { value: 4.6, readOnly: true, allowHalf: true }), count);\n\nconst bars = document.createElement('div');\nbars.style.cssText = 'display:grid;gap:4px;flex:1;min-width:200px;font-size:.8rem';\nfor (const [stars, n] of [[5, 96], [4, 21], [3, 6], [2, 3], [1, 2]]) {\n  const row = document.createElement('div');\n  row.style.cssText = 'display:grid;grid-template-columns:2ch 1fr 3ch;gap:8px;align-items:center';\n  const track = document.createElement('span');\n  track.style.cssText = 'height:6px;border-radius:3px;background:color-mix(in srgb, currentColor 12%, transparent);overflow:hidden';\n  const fill = document.createElement('span');\n  fill.style.cssText = `display:block;height:100%;width:${Math.round((n / 128) * 100)}%;background:var(--warning-color)`;\n  track.append(fill);\n  row.append(`${stars}★`, track, String(n));\n  bars.append(row);\n}\ntop.append(average, bars);\n\nconst list = document.createElement('div');\nlist.style.cssText = 'display:grid;gap:14px';\nfor (const [author, score, text] of [\n  ['Reviewer 1', 5, 'A short example review.'],\n  ['Reviewer 2', 4, 'A longer example review that explains the score.']\n]) {\n  const review = document.createElement('article');\n  review.style.cssText = 'display:grid;gap:4px';\n  const head = document.createElement('div');\n  head.style.cssText = 'display:flex;gap:8px;align-items:center;font-size:.85rem;font-weight:600';\n  head.append(await slice.build('Rating', { value: score, readOnly: true, size: 'sm' }), author);\n  const p = document.createElement('p');\n  p.style.margin = '0';\n  p.textContent = text;\n  review.append(head, p);\n  list.append(review);\n}\nsummary.append(top, list);\nreturn summary;\n:::\n\n:::script label=\"Rate your experience\" expected=\"a small card 'Your item arrived' with a rating 'How was your experience?'; picking a score thanks you below and, for 1 or 2 stars, asks what went wrong\"\nconst card = document.createElement('section');\ncard.style.cssText = 'display:grid;gap:10px;width:100%;max-width:380px;padding:16px;border:1px solid var(--slice-border-raised, #ddd);border-radius:12px';\nconst title = document.createElement('strong');\ntitle.textContent = 'Your item arrived';\nconst reply = document.createElement('p');\nreply.style.cssText = 'margin:0;font-size:.9rem;min-height:1.4em';\nconst rating = await slice.build('Rating', {\n  label: 'How was your experience?',\n  labels: ['Bad', 'Not great', 'OK', 'Good', 'Perfect'],\n  showValue: true,\n  onChange: (value) => {\n    reply.textContent = value === null ? ''\n      : value <= 2 ? 'Sorry about that. What went wrong?'\n      : 'Thanks! Your feedback was saved.';\n  }\n});\ncard.append(title, rating, reply);\nreturn card;\n:::\n\n:::script label=\"Halves, ten points, icons and tones\" expected=\"four ratings: one with halves at 3.5, one out of 10 at 7, red hearts at 4 and accent dots at 2, each with its value written next to it\"\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;gap:14px;width:100%';\nbox.append(\n  await slice.build('Rating', { label: 'Halves', allowHalf: true, value: 3.5, showValue: true }),\n  await slice.build('Rating', { label: 'Out of 10', max: 10, value: 7, size: 'sm', showValue: true }),\n  await slice.build('Rating', { label: 'How much did you like it?', icon: '♥', tone: 'danger', value: 4 }),\n  await slice.build('Rating', { label: 'Difficulty', icon: '●', tone: 'accent', value: 2, size: 'sm', labels: ['Easy', 'Medium', 'Hard'], max: 3, showValue: true })\n);\nreturn box;\n:::\n\n## Best Practices\n:::tip\nGive each value a word with `labels` and turn on `showValue`. \"4 · Very good\" is clearer than four stars, and the word is read out with the number.\n:::\n\n:::tip\nShow the count next to an average: \"4.6 · 128 reviews\". Five stars from two people and five stars from two thousand are not the same.\n:::\n\n## Pitfalls\n:::warning\nDo not round an average to whole stars when showing it. Use `allowHalf` with `readOnly`, and write the exact number next to it.\n:::\n\n:::warning\nA read-only rating is not a control: it has no Tab stop. To let people change a score they gave, show the editable one.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            let props = {};
            if ("{\n  \"label\": \"How would you rate this item?\",\n  \"value\": 4,\n  \"labels\": [\"Poor\", \"Fair\", \"Good\", \"Very good\", \"Excellent\"],\n  \"showValue\": true\n}") {
               try {
                  props = JSON.parse("{\n  \"label\": \"How would you rate this item?\",\n  \"value\": 4,\n  \"labels\": [\"Poor\", \"Fair\", \"Good\", \"Very good\", \"Excellent\"],\n  \"showValue\": true\n}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('Rating', props);
            container.appendChild(component);
         }
       }
      {
         const container = this.querySelector('[data-block-id="doc-block-6"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Give each value a word with <code>labels</code> and turn on <code>showValue</code>. \"4 · Very good\" is clearer than four stars, and the word is read out with the number.</p>";
            const callout = await slice.build('Callout', {
               tone: "success",
               variant: "soft",
               title: "Tip",
               content: Array.from(body.childNodes)
            });
            container.appendChild(callout || body);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-7"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Show the count next to an average: \"4.6 · 128 reviews\". Five stars from two people and five stars from two thousand are not the same.</p>";
            const callout = await slice.build('Callout', {
               tone: "success",
               variant: "soft",
               title: "Tip",
               content: Array.from(body.childNodes)
            });
            container.appendChild(callout || body);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-8"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Do not round an average to whole stars when showing it. Use <code>allowHalf</code> with <code>readOnly</code>, and write the exact number next to it.</p>";
            const callout = await slice.build('Callout', {
               tone: "warning",
               variant: "soft",
               title: "Warning",
               content: Array.from(body.childNodes)
            });
            container.appendChild(callout || body);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-9"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>A read-only rating is not a control: it has no Tab stop. To let people change a score they gave, show the editable one.</p>";
            const callout = await slice.build('Callout', {
               tone: "warning",
               variant: "soft",
               title: "Warning",
               content: Array.from(body.childNodes)
            });
            container.appendChild(callout || body);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-10"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"value\",\"type\":\"number\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"max\",\"type\":\"number\",\"required\":false,\"default\":\"5\",\"allowedValues\":[]},{\"path\":\"allowHalf\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"clearable\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"readOnly\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"required\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"label\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"name\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"labels\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"showValue\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"icon\",\"type\":\"string\",\"required\":false,\"default\":\"★\",\"allowedValues\":[]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\",\"lg\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"warning\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"value\",\"type\":\"number\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"max\",\"type\":\"number\",\"required\":false,\"default\":\"5\",\"allowedValues\":[]},{\"path\":\"allowHalf\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"clearable\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"readOnly\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"required\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"label\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"name\",\"type\":\"string\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"labels\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"showValue\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"icon\",\"type\":\"string\",\"required\":false,\"default\":\"★\",\"allowedValues\":[]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\",\"lg\"]},{\"path\":\"tone\",\"type\":\"string\",\"required\":false,\"default\":\"warning\",\"allowedValues\":[\"neutral\",\"accent\",\"info\",\"success\",\"warning\",\"danger\"]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"RadioGroup","path":"/docs/input/radio-group"},{"text":"RadioGroup","path":"/docs/input/radio-group"},{"text":"Slider","path":"/docs/input/slider"},{"text":"Button","path":"/docs/input/button"},{"text":"Form","path":"/docs/input/form"}];
         for (const [index, linkProps] of links.entries()) {
            const placeholder = this.querySelector('[data-inline-link="' + index + '"]');
            if (!placeholder) continue;
            const link = await slice.build('Link', linkProps);
            placeholder.replaceWith(link);
            this._inlineLinks.push(link);
         }
      }
    await this.renderScriptScenarios();
  }

  async update() {
    // Refresh dynamic content here if needed
  }

   beforeDestroy() {
     for (const link of this._inlineLinks) {
       if (typeof slice.isComponentAlive !== 'function' || slice.isComponentAlive(link)) {
         slice.controller.destroyComponent(link);
       }
     }
     this._inlineLinks = [];
   }

  async setupCopyButton() {
    const container = this.querySelector('[data-copy-md]');
    if (!container) return;

    const copyMenu = await slice.build('CopyMarkdownMenu', {
      markdownPath: this.markdownPath,
      markdownContent: this.markdownContent,
      label: 'Copy as markdown'
    });

    container.appendChild(copyMenu);
  }

  async renderScriptScenarios() {
    if (!Array.isArray(this.scriptScenarios) || this.scriptScenarios.length === 0) return;
    const host = this.querySelector('.documentation-content');
    if (!host) return;

    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

      // Render where the author put the :::script blocks.
      //
      // The markdown parser already emits one <div class="script-block"> at the
      // position of each block, in document order, and those divs come from the same
      // parse as this.scriptScenarios â€” so the counts always line up. They used to be
      // ignored: every scenario was appended in one lump to the end of
      // .documentation-content under a second, generated <h2>Prop Scenarios</h2>. The
      // result was that the heading an author wrote sat over nothing at all â€” the divs
      // were never filled, nothing in the repo reads .script-block â€” the real demos were
      // exiled below the props table, and 38 of 53 pages showed the heading twice.
      const blocks = [...this.querySelectorAll('.script-block')];
      const inPlace = blocks.length === this.scriptScenarios.length;

      const section = document.createElement('section');
      if (!inPlace) {
         // Fallback, kept so a future parser change that desyncs the two cannot
         // silently drop every demo. An author-placed heading already exists in the
         // in-place case, so only invent one when we are building the section.
         section.classList.add('doc-script-scenarios');

         const title = document.createElement('h2');
         title.textContent = 'Prop Scenarios';
         section.appendChild(title);

         const subtitle = document.createElement('p');
         subtitle.classList.add('doc-script-subtitle');
         subtitle.textContent = 'Interactive demos validating component behavior.';
         section.appendChild(subtitle);
      }
      for (const [index, scenario] of this.scriptScenarios.entries()) {
      const demobox = await slice.build('DemoBox', {
        label: scenario.label,
        expected: scenario.expected || ''
      });

      const code = await slice.build('CodeVisualizer', {
        value: scenario.content,
        language: 'javascript'
      });

      const errorMessage = document.createElement('p');
      errorMessage.classList.add('doc-script-error');
      errorMessage.hidden = true;

      const executeScenario = async () => {
        demobox.clear();
        errorMessage.hidden = true;
        errorMessage.textContent = '';

        const createBuildFallbackNode = (name) => {
          const fallback = document.createElement('div');
          fallback.style.padding = '10px';
          fallback.style.border = '1px dashed var(--warning-color)';
          fallback.style.borderRadius = '8px';
          fallback.style.background = 'color-mix(in srgb, var(--primary-background-color) 85%, var(--warning-color))';
          fallback.style.color = 'var(--font-primary-color)';
          fallback.textContent = String(name || '')
            ? 'Component "' + String(name) + '" is not registered in this build yet.'
            : 'Requested component is not registered in this build yet.';
          return fallback;
        };

        const safeSlice = Object.create(slice);
        safeSlice.build = async (name, props) => {
          const built = await slice.build(name, props);
          if (built instanceof Node) {
            return built;
          }
          if (Array.isArray(built)) {
            const fragment = document.createDocumentFragment();
            let hasNode = false;
            built.forEach((item) => {
              if (item instanceof Node) {
                fragment.appendChild(item);
                hasNode = true;
              }
            });
            if (hasNode) {
              return fragment;
            }
          }
          return built ?? createBuildFallbackNode(name);
        };

        const mount = (node) => {
          if (node instanceof Node) {
            demobox.appendDemo(node);
          }
        };

        try {
          const fn = new AsyncFunction('component', 'slice', 'document', 'mount', scenario.content);
          const result = await fn(this, safeSlice, document, mount);

          if (result instanceof Node) {
            demobox.appendDemo(result);
          } else if (Array.isArray(result)) {
            result.forEach((item) => {
              if (item instanceof Node) {
                demobox.appendDemo(item);
              }
            });
          }
        } catch (error) {
          errorMessage.textContent = 'Live preview error: ' + error.message;
          errorMessage.hidden = false;
        }
      };
      (inPlace ? blocks[index] : section).appendChild(demobox);
      demobox.appendCode(code);
      (inPlace ? blocks[index] : section).appendChild(errorMessage);

      await executeScenario();
    }
      if (!inPlace) host.appendChild(section);
  }
}

customElements.define('slice-ratingdocumentation', RatingDocumentation);
