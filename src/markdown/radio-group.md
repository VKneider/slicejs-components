---
title: RadioGroup
route: /docs/input/radio-group
navLabel: RadioGroup
section: Input Components
group: Basic
order: 14
description: Single-choice control that owns its value — keyboard, forms, card pickers and a segmented-buttons look included.
component: RadioGroupDocumentation
generate: true
tags: [radio, radiogroup, input, forms, choice]
---

# RadioGroup

## Overview
`RadioGroup` lets the user pick **exactly one** option from a short list. The group owns the value:
`value` is the selected option's `value` (or `null` while nothing is selected), and `onChange` fires
with the new one.

Use it when every option should be visible at once and there are only a handful of them (2–6). For a
long list use `Select`; for a single on/off setting use `Switch` or `Checkbox`.

### When to use it
- **A few options that should all be visible**: a shipping method, a plan, a size.
- **A switch between views or ranges** (`variant: 'buttons'`): "Day · Week · Month" above a chart, "Monthly · Yearly" on a pricing page, "List · Grid" over results.
- **A required choice in a form**, with `required` and native form submission.

### When not to use it
- **A long list** (more than about six): [Select](/docs/input/select).
- **One on/off setting**: [Switch](/docs/input/switch) or [Checkbox](/docs/input/checkbox).
- **Several choices at once**: checkboxes.
- **A score from 1 to 5**: [Rating](/docs/input/rating). The stars say "a score" in a way a row of numbers does not.
- **Buttons that do something** (Export, Delete): [Button](/docs/input/button)s. A radio only changes a value.

## Core Behavior
- `options` is an array of `{ label, value, description?, disabled? }`. A bare string or number is shorthand for `{ label: String(x), value: x }`. An object without `value` uses its `label`.
- `value` selects the option whose `value` matches. The comparison is strict (`Object.is`), so `1` and `'1'` are different values.
- `value` may be passed before or after `options` — the selection is resolved once both exist. A value that matches no option leaves the group unselected (`value` becomes `null`) and logs a warning.
- Replacing `options` keeps the current value if it is still one of the options, and clears it otherwise.
- `onChange(value, option)` fires only when the **user** selects an option (click or arrow keys). Setting `value` from code never fires it. `option` is the original entry you passed. Assign `null` to clear the handler.
- `selectedOption` returns the original entry of the selected option (or `null`) — handy when options carry extra data such as a price.
- `name` is shared by every radio. It is generated when omitted, so two groups never interfere; set it when the group sits in a native `<form>`, which then submits the selected value under that name.
- `label` renders a `<legend>` that also names the group for screen readers.
- `disabled` disables the whole group; `disabled: true` on an option disables just that one.
- `required` sets native `required` on the radios and `aria-required` on the group.
- `orientation` is `vertical` (default) or `horizontal` (options wrap on narrow screens).
- `labelPlacement` (`right` | `left` | `top` | `bottom`) places each option's text relative to its circle.
- `variant`: `default` (success accent, matches `Checkbox`), `outlined`, `soft`, `plain` (no container chip), `card` (every option is a selectable card — best with `description`) or `buttons` (the options joined in one bar, the chosen one filled — a segmented control; use it with `orientation: 'horizontal'` and short labels). Unknown values fall back to `default`.
- `size` (`sm` | `md` | `lg`) scales circles and text together.
- `label` is the visible legend and names the group. Without one, `ariaLabel` names it (a `buttons` bar above a chart has no legend).
- `customColor: { accent }` recolours the selected circle and card, in every variant.

## Keyboard and accessibility
The options are real `<input type="radio">` elements inside a `<fieldset role="radiogroup">`, so the
browser provides the standard radio keyboard model:

- **Tab** enters the group on the selected option (or the first enabled one) and **Tab** again leaves it — the group is a single tab stop.
- **Arrow keys** move to the next/previous option **and select it**, skipping disabled options.
- **Space** selects the focused option.

`el.focus()` focuses the group the same way Tab would. The radios are visually hidden but stay in the
accessibility tree; the focus ring is drawn on the visible circle. Option descriptions are linked to
their radio with `aria-describedby`.

## Theming
Every visual knob is a custom property on the host, so one instance can be tuned without touching the
component: `--slice-radio-mark-size`, `--slice-radio-mark-border`, `--slice-radio-mark-border-width`,
`--slice-radio-mark-surface`, `--slice-radio-gap`, `--slice-radio-surface`,
`--slice-radio-surface-border`, `--slice-radio-card-surface` and `--slice-radio-card-border`. For the
accent colour use `customColor`.

## Live Preview
:::component name="RadioGroup"
{
  "label": "Plan",
  "options": [
    { "label": "Free", "value": "free" },
    { "label": "Pro", "value": "pro" },
    { "label": "Team", "value": "team" }
  ],
  "value": "pro"
}
:::

## Prop Scenarios
:::script label="basic group" expected="three options, Pro selected"
const group = await slice.build('RadioGroup', {
  label: 'Plan',
  options: [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro' },
    { label: 'Team', value: 'team' }
  ],
  value: 'pro'
});

return group;
:::

:::script label="onChange reports the selection" expected="the text below updates as you pick"
const output = document.createElement('p');
output.textContent = 'Nothing selected yet';

const group = await slice.build('RadioGroup', {
  label: 'Notifications',
  options: [
    { label: 'Everything', value: 'all' },
    { label: 'Mentions only', value: 'mentions' },
    { label: 'Nothing', value: 'none' }
  ],
  onChange: (value, option) => {
    output.textContent = `Selected: ${option.label} (${value})`;
  }
});

const host = document.createElement('div');
host.append(group, output);
return host;
:::

:::script label="shorthand options and horizontal layout" expected="sizes in a single row"
const group = await slice.build('RadioGroup', {
  label: 'Size',
  options: ['XS', 'S', 'M', 'L', 'XL'],
  value: 'M',
  orientation: 'horizontal'
});

return group;
:::

:::script label="card picker with descriptions" expected="each option is a card; Express is selected and Pickup is disabled"
const group = await slice.build('RadioGroup', {
  label: 'Shipping method',
  variant: 'card',
  orientation: 'horizontal',
  value: 'express',
  options: [
    { label: 'Standard', value: 'standard', description: '3–5 business days · Free' },
    { label: 'Express', value: 'express', description: 'Next business day · $9' },
    { label: 'Pickup', value: 'pickup', description: 'Not available in your area', disabled: true }
  ]
});

return group;
:::

:::script label="buttons: a range switch above a chart" expected="a 'Visits' card with a Day · Week · Month bar on the right, Week chosen; choosing another range changes the total and the bars below"
const data = {
  day: { total: '1,284', bars: [12, 30, 22, 48, 60, 41, 18] },
  week: { total: '8,930', bars: [40, 55, 48, 70, 66, 52, 35] },
  month: { total: '36,402', bars: [60, 72, 58, 80, 90, 76, 84] }
};
const card = document.createElement('section');
card.style.cssText = 'display:grid;gap:14px;width:100%;max-width:520px;padding:16px;border:1px solid var(--slice-border-raised, #ddd);border-radius:12px';
const head = document.createElement('div');
head.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap';
const title = document.createElement('div');
const name = document.createElement('div');
name.style.cssText = 'font-size:.85rem;opacity:.75';
name.textContent = 'Visits';
const total = document.createElement('div');
total.style.cssText = 'font-size:1.6rem;font-weight:700';
title.append(name, total);
const bars = document.createElement('div');
bars.style.cssText = 'display:flex;align-items:end;gap:8px;height:90px';
const paint = (range) => {
  total.textContent = data[range].total;
  bars.replaceChildren(...data[range].bars.map((h) => {
    const bar = document.createElement('span');
    bar.style.cssText = `flex:1;height:${h}%;border-radius:4px;background:var(--primary-color)`;
    return bar;
  }));
};
const range = await slice.build('RadioGroup', {
  ariaLabel: 'Range',
  variant: 'buttons',
  orientation: 'horizontal',
  size: 'sm',
  value: 'week',
  options: [{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }],
  onChange: paint
});
paint('week');
head.append(title, range);
card.append(head, bars);
return card;
:::

:::script label="buttons: monthly or yearly billing" expected="a centred Monthly · Yearly bar ('Yearly' has '2 months free' under it); below, a price that changes from $12/month to $120/year"
const box = document.createElement('div');
box.style.cssText = 'display:grid;justify-items:center;gap:12px;width:100%';
const price = document.createElement('p');
price.style.cssText = 'margin:0;font-size:1.4rem;font-weight:700';
const prices = { monthly: '$12 / month', yearly: '$120 / year' };
const billing = await slice.build('RadioGroup', {
  ariaLabel: 'Billing period',
  variant: 'buttons',
  orientation: 'horizontal',
  value: 'monthly',
  options: [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly', description: '2 months free' }
  ],
  onChange: (value) => { price.textContent = prices[value]; }
});
price.textContent = prices.monthly;
box.append(billing, price);
return box;
:::

:::script label="options carrying extra data" expected="selectedOption exposes the price of the chosen plan"
const plans = [
  { label: 'Monthly', value: 'monthly', price: 12, description: '$12 / month' },
  { label: 'Yearly', value: 'yearly', price: 120, description: '$120 / year — two months free' }
];

const total = document.createElement('p');

const group = await slice.build('RadioGroup', {
  label: 'Billing',
  variant: 'card',
  options: plans,
  value: 'yearly',
  onChange: () => {
    total.textContent = `Total today: $${group.selectedOption.price}`;
  }
});
total.textContent = `Total today: $${group.selectedOption.price}`;

const host = document.createElement('div');
host.append(group, total);
return host;
:::

:::script label="controlled from outside" expected="the buttons change the selection without firing onChange"
const group = await slice.build('RadioGroup', {
  label: 'Theme',
  options: [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' }
  ],
  value: 'system'
});

const actions = document.createElement('div');
actions.style.display = 'flex';
actions.style.gap = '8px';

for (const value of ['light', 'dark', 'system']) {
  actions.appendChild(await slice.build('Button', {
    value: `Set ${value}`,
    size: 'sm',
    variant: 'outlined',
    onClick: () => { group.value = value; }
  }));
}

actions.appendChild(await slice.build('Button', {
  value: 'Clear',
  size: 'sm',
  variant: 'ghost',
  onClick: () => { group.value = null; }
}));

const host = document.createElement('div');
host.append(group, actions);
return host;
:::

:::script label="disabled group and disabled option" expected="the first group is fully disabled; in the second only Team is"
const options = [
  { label: 'Free', value: 'free' },
  { label: 'Pro', value: 'pro' },
  { label: 'Team', value: 'team' }
];

const locked = await slice.build('RadioGroup', {
  label: 'Managed by your organisation',
  options,
  value: 'pro',
  disabled: true
});

const partial = await slice.build('RadioGroup', {
  label: 'Upgrade to',
  options: options.map((o) => (o.value === 'team' ? { ...o, disabled: true } : o))
});

const host = document.createElement('div');
host.style.display = 'flex';
host.style.flexWrap = 'wrap';
host.style.gap = '16px';
host.append(locked, partial);
return host;
:::

:::script label="variant variations" expected="default, outlined, soft and plain side by side"
const host = document.createElement('div');
host.style.display = 'flex';
host.style.flexWrap = 'wrap';
host.style.gap = '16px';

for (const variant of ['default', 'outlined', 'soft', 'plain']) {
  host.appendChild(await slice.build('RadioGroup', {
    label: variant,
    variant,
    options: ['One', 'Two'],
    value: 'Two'
  }));
}

return host;
:::

:::script label="size and label placement" expected="sm, md and lg groups; the last puts labels on the left"
const host = document.createElement('div');
host.style.display = 'flex';
host.style.flexWrap = 'wrap';
host.style.alignItems = 'flex-start';
host.style.gap = '16px';

for (const size of ['sm', 'md', 'lg']) {
  host.appendChild(await slice.build('RadioGroup', {
    label: `Size ${size}`,
    size,
    options: ['Daily', 'Weekly'],
    value: 'Weekly'
  }));
}

host.appendChild(await slice.build('RadioGroup', {
  label: 'Labels on the left',
  labelPlacement: 'left',
  options: ['Daily', 'Weekly'],
  value: 'Daily'
}));

return host;
:::

:::script label="custom accent" expected="the selected circle uses the custom colour"
const group = await slice.build('RadioGroup', {
  label: 'Priority',
  options: ['Low', 'Normal', 'High'],
  value: 'High',
  customColor: { accent: '#d97706' }
});

return group;
:::

:::script label="inside a Form" expected="submitting without a choice shows the required message"
const result = document.createElement('pre');

const form = await slice.build('Form', {
  submitText: 'Continue',
  schema: [
    {
      name: 'contact',
      component: 'RadioGroup',
      required: 'Choose how we should contact you',
      props: {
        label: 'Preferred contact',
        variant: 'plain',
        orientation: 'horizontal',
        options: [
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' },
          { label: 'Don’t contact me', value: 'none' }
        ]
      }
    }
  ],
  onSubmit: (values) => {
    result.textContent = JSON.stringify(values);
  }
});

const host = document.createElement('div');
host.append(form, result);
return host;
:::

## Best Practices

:::tip
Order options in a meaningful way (cheapest first, most common first) and pre-select a sensible default when one exists — a group with nothing selected forces an extra decision.
:::

Inside a `Form`, use `variant: 'plain'` and let the Form field's `label` name the group: the Form passes it as `ariaLabel`. A `label` on the RadioGroup itself (its legend) is only needed outside a Form. Keep `buttons` labels to a word or two and to two–five options; longer lists wrap badly in a bar, so use `card` or the default look.

## Pitfalls

:::warning
`value` is compared strictly. If your options use numbers (`value: 1`), set `value: 1`, not `'1'` — otherwise nothing is selected and a warning is logged.
:::

Do not use a RadioGroup for actions. Selecting an option should only change a value; if picking it should trigger something, use buttons instead.

:::related
- [Select](/docs/input/select) - The same choice, collapsed into a menu.
- [Checkbox](/docs/input/checkbox) - Several answers at once.
- [Form](/docs/input/form) - The group as one field of many.
:::
