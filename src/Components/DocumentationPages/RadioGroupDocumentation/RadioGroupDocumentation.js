export default class RadioGroupDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"basic group","expected":"three options, Pro selected","kind":"script","content":"const group = await slice.build('RadioGroup', {\n  label: 'Plan',\n  options: [\n    { label: 'Free', value: 'free' },\n    { label: 'Pro', value: 'pro' },\n    { label: 'Team', value: 'team' }\n  ],\n  value: 'pro'\n});\n\nreturn group;"},{"label":"onChange reports the selection","expected":"the text below updates as you pick","kind":"script","content":"const output = document.createElement('p');\noutput.textContent = 'Nothing selected yet';\n\nconst group = await slice.build('RadioGroup', {\n  label: 'Notifications',\n  options: [\n    { label: 'Everything', value: 'all' },\n    { label: 'Mentions only', value: 'mentions' },\n    { label: 'Nothing', value: 'none' }\n  ],\n  onChange: (value, option) => {\n    output.textContent = `Selected: ${option.label} (${value})`;\n  }\n});\n\nconst host = document.createElement('div');\nhost.append(group, output);\nreturn host;"},{"label":"shorthand options and horizontal layout","expected":"sizes in a single row","kind":"script","content":"const group = await slice.build('RadioGroup', {\n  label: 'Size',\n  options: ['XS', 'S', 'M', 'L', 'XL'],\n  value: 'M',\n  orientation: 'horizontal'\n});\n\nreturn group;"},{"label":"card picker with descriptions","expected":"each option is a card; Express is selected and Pickup is disabled","kind":"script","content":"const group = await slice.build('RadioGroup', {\n  label: 'Shipping method',\n  variant: 'card',\n  orientation: 'horizontal',\n  value: 'express',\n  options: [\n    { label: 'Standard', value: 'standard', description: '3–5 business days · Free' },\n    { label: 'Express', value: 'express', description: 'Next business day · $9' },\n    { label: 'Pickup', value: 'pickup', description: 'Not available in your area', disabled: true }\n  ]\n});\n\nreturn group;"},{"label":"buttons: a range switch above a chart","expected":"a 'Visits' card with a Day · Week · Month bar on the right, Week chosen; choosing another range changes the total and the bars below","kind":"script","content":"const data = {\n  day: { total: '1,284', bars: [12, 30, 22, 48, 60, 41, 18] },\n  week: { total: '8,930', bars: [40, 55, 48, 70, 66, 52, 35] },\n  month: { total: '36,402', bars: [60, 72, 58, 80, 90, 76, 84] }\n};\nconst card = document.createElement('section');\ncard.style.cssText = 'display:grid;gap:14px;width:100%;max-width:520px;padding:16px;border:1px solid var(--slice-border-raised, #ddd);border-radius:12px';\nconst head = document.createElement('div');\nhead.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap';\nconst title = document.createElement('div');\nconst name = document.createElement('div');\nname.style.cssText = 'font-size:.85rem;opacity:.75';\nname.textContent = 'Visits';\nconst total = document.createElement('div');\ntotal.style.cssText = 'font-size:1.6rem;font-weight:700';\ntitle.append(name, total);\nconst bars = document.createElement('div');\nbars.style.cssText = 'display:flex;align-items:end;gap:8px;height:90px';\nconst paint = (range) => {\n  total.textContent = data[range].total;\n  bars.replaceChildren(...data[range].bars.map((h) => {\n    const bar = document.createElement('span');\n    bar.style.cssText = `flex:1;height:${h}%;border-radius:4px;background:var(--primary-color)`;\n    return bar;\n  }));\n};\nconst range = await slice.build('RadioGroup', {\n  ariaLabel: 'Range',\n  variant: 'buttons',\n  orientation: 'horizontal',\n  size: 'sm',\n  value: 'week',\n  options: [{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }],\n  onChange: paint\n});\npaint('week');\nhead.append(title, range);\ncard.append(head, bars);\nreturn card;"},{"label":"buttons: monthly or yearly billing","expected":"a centred Monthly · Yearly bar ('Yearly' has '2 months free' under it); below, a price that changes from $12/month to $120/year","kind":"script","content":"const box = document.createElement('div');\nbox.style.cssText = 'display:grid;justify-items:center;gap:12px;width:100%';\nconst price = document.createElement('p');\nprice.style.cssText = 'margin:0;font-size:1.4rem;font-weight:700';\nconst prices = { monthly: '$12 / month', yearly: '$120 / year' };\nconst billing = await slice.build('RadioGroup', {\n  ariaLabel: 'Billing period',\n  variant: 'buttons',\n  orientation: 'horizontal',\n  value: 'monthly',\n  options: [\n    { label: 'Monthly', value: 'monthly' },\n    { label: 'Yearly', value: 'yearly', description: '2 months free' }\n  ],\n  onChange: (value) => { price.textContent = prices[value]; }\n});\nprice.textContent = prices.monthly;\nbox.append(billing, price);\nreturn box;"},{"label":"options carrying extra data","expected":"selectedOption exposes the price of the chosen plan","kind":"script","content":"const plans = [\n  { label: 'Monthly', value: 'monthly', price: 12, description: '$12 / month' },\n  { label: 'Yearly', value: 'yearly', price: 120, description: '$120 / year — two months free' }\n];\n\nconst total = document.createElement('p');\n\nconst group = await slice.build('RadioGroup', {\n  label: 'Billing',\n  variant: 'card',\n  options: plans,\n  value: 'yearly',\n  onChange: () => {\n    total.textContent = `Total today: $${group.selectedOption.price}`;\n  }\n});\ntotal.textContent = `Total today: $${group.selectedOption.price}`;\n\nconst host = document.createElement('div');\nhost.append(group, total);\nreturn host;"},{"label":"controlled from outside","expected":"the buttons change the selection without firing onChange","kind":"script","content":"const group = await slice.build('RadioGroup', {\n  label: 'Theme',\n  options: [\n    { label: 'Light', value: 'light' },\n    { label: 'Dark', value: 'dark' },\n    { label: 'System', value: 'system' }\n  ],\n  value: 'system'\n});\n\nconst actions = document.createElement('div');\nactions.style.display = 'flex';\nactions.style.gap = '8px';\n\nfor (const value of ['light', 'dark', 'system']) {\n  actions.appendChild(await slice.build('Button', {\n    value: `Set ${value}`,\n    size: 'sm',\n    variant: 'outlined',\n    onClick: () => { group.value = value; }\n  }));\n}\n\nactions.appendChild(await slice.build('Button', {\n  value: 'Clear',\n  size: 'sm',\n  variant: 'ghost',\n  onClick: () => { group.value = null; }\n}));\n\nconst host = document.createElement('div');\nhost.append(group, actions);\nreturn host;"},{"label":"disabled group and disabled option","expected":"the first group is fully disabled; in the second only Team is","kind":"script","content":"const options = [\n  { label: 'Free', value: 'free' },\n  { label: 'Pro', value: 'pro' },\n  { label: 'Team', value: 'team' }\n];\n\nconst locked = await slice.build('RadioGroup', {\n  label: 'Managed by your organisation',\n  options,\n  value: 'pro',\n  disabled: true\n});\n\nconst partial = await slice.build('RadioGroup', {\n  label: 'Upgrade to',\n  options: options.map((o) => (o.value === 'team' ? { ...o, disabled: true } : o))\n});\n\nconst host = document.createElement('div');\nhost.style.display = 'flex';\nhost.style.flexWrap = 'wrap';\nhost.style.gap = '16px';\nhost.append(locked, partial);\nreturn host;"},{"label":"variant variations","expected":"default, outlined, soft and plain side by side","kind":"script","content":"const host = document.createElement('div');\nhost.style.display = 'flex';\nhost.style.flexWrap = 'wrap';\nhost.style.gap = '16px';\n\nfor (const variant of ['default', 'outlined', 'soft', 'plain']) {\n  host.appendChild(await slice.build('RadioGroup', {\n    label: variant,\n    variant,\n    options: ['One', 'Two'],\n    value: 'Two'\n  }));\n}\n\nreturn host;"},{"label":"size and label placement","expected":"sm, md and lg groups; the last puts labels on the left","kind":"script","content":"const host = document.createElement('div');\nhost.style.display = 'flex';\nhost.style.flexWrap = 'wrap';\nhost.style.alignItems = 'flex-start';\nhost.style.gap = '16px';\n\nfor (const size of ['sm', 'md', 'lg']) {\n  host.appendChild(await slice.build('RadioGroup', {\n    label: `Size ${size}`,\n    size,\n    options: ['Daily', 'Weekly'],\n    value: 'Weekly'\n  }));\n}\n\nhost.appendChild(await slice.build('RadioGroup', {\n  label: 'Labels on the left',\n  labelPlacement: 'left',\n  options: ['Daily', 'Weekly'],\n  value: 'Daily'\n}));\n\nreturn host;"},{"label":"custom accent","expected":"the selected circle uses the custom colour","kind":"script","content":"const group = await slice.build('RadioGroup', {\n  label: 'Priority',\n  options: ['Low', 'Normal', 'High'],\n  value: 'High',\n  customColor: { accent: '#d97706' }\n});\n\nreturn group;"},{"label":"inside a Form","expected":"submitting without a choice shows the required message","kind":"script","content":"const result = document.createElement('pre');\n\nconst form = await slice.build('Form', {\n  submitText: 'Continue',\n  schema: [\n    {\n      name: 'contact',\n      component: 'RadioGroup',\n      required: 'Choose how we should contact you',\n      props: {\n        label: 'Preferred contact',\n        variant: 'plain',\n        orientation: 'horizontal',\n        options: [\n          { label: 'Email', value: 'email' },\n          { label: 'Phone', value: 'phone' },\n          { label: 'Don’t contact me', value: 'none' }\n        ]\n      }\n    }\n  ],\n  onSubmit: (values) => {\n    result.textContent = JSON.stringify(values);\n  }\n});\n\nconst host = document.createElement('div');\nhost.append(form, result);\nreturn host;"}];
  }

  async init() {
    this.markdownPath = "radio-group.md";
    this.markdownContent = "---\ntitle: RadioGroup\nroute: /docs/input/radio-group\nnavLabel: RadioGroup\nsection: Input Components\ngroup: Basic\norder: 14\ndescription: Single-choice control that owns its value — keyboard, forms, card pickers and a segmented-buttons look included.\ncomponent: RadioGroupDocumentation\ngenerate: true\ntags: [radio, radiogroup, input, forms, choice]\n---\n\n# RadioGroup\n\n## Overview\n`RadioGroup` lets the user pick **exactly one** option from a short list. The group owns the value:\n`value` is the selected option's `value` (or `null` while nothing is selected), and `onChange` fires\nwith the new one.\n\nUse it when every option should be visible at once and there are only a handful of them (2–6). For a\nlong list use `Select`; for a single on/off setting use `Switch` or `Checkbox`.\n\n### When to use it\n- **A few options that should all be visible**: a shipping method, a plan, a size.\n- **A switch between views or ranges** (`variant: 'buttons'`): \"Day · Week · Month\" above a chart, \"Monthly · Yearly\" on a pricing page, \"List · Grid\" over results.\n- **A required choice in a form**, with `required` and native form submission.\n\n### When not to use it\n- **A long list** (more than about six): [Select](/docs/input/select).\n- **One on/off setting**: [Switch](/docs/input/switch) or [Checkbox](/docs/input/checkbox).\n- **Several choices at once**: checkboxes.\n- **A score from 1 to 5**: [Rating](/docs/input/rating). The stars say \"a score\" in a way a row of numbers does not.\n- **Buttons that do something** (Export, Delete): [Button](/docs/input/button)s. A radio only changes a value.\n\n## Core Behavior\n- `options` is an array of `{ label, value, description?, disabled? }`. A bare string or number is shorthand for `{ label: String(x), value: x }`. An object without `value` uses its `label`.\n- `value` selects the option whose `value` matches. The comparison is strict (`Object.is`), so `1` and `'1'` are different values.\n- `value` may be passed before or after `options` — the selection is resolved once both exist. A value that matches no option leaves the group unselected (`value` becomes `null`) and logs a warning.\n- Replacing `options` keeps the current value if it is still one of the options, and clears it otherwise.\n- `onChange(value, option)` fires only when the **user** selects an option (click or arrow keys). Setting `value` from code never fires it. `option` is the original entry you passed. Assign `null` to clear the handler.\n- `selectedOption` returns the original entry of the selected option (or `null`) — handy when options carry extra data such as a price.\n- `name` is shared by every radio. It is generated when omitted, so two groups never interfere; set it when the group sits in a native `<form>`, which then submits the selected value under that name.\n- `label` renders a `<legend>` that also names the group for screen readers.\n- `disabled` disables the whole group; `disabled: true` on an option disables just that one.\n- `required` sets native `required` on the radios and `aria-required` on the group.\n- `orientation` is `vertical` (default) or `horizontal` (options wrap on narrow screens).\n- `labelPlacement` (`right` | `left` | `top` | `bottom`) places each option's text relative to its circle.\n- `variant`: `default` (success accent, matches `Checkbox`), `outlined`, `soft`, `plain` (no container chip), `card` (every option is a selectable card — best with `description`) or `buttons` (the options joined in one bar, the chosen one filled — a segmented control; use it with `orientation: 'horizontal'` and short labels). Unknown values fall back to `default`.\n- `size` (`sm` | `md` | `lg`) scales circles and text together.\n- `label` is the visible legend and names the group. Without one, `ariaLabel` names it (a `buttons` bar above a chart has no legend).\n- `customColor: { accent }` recolours the selected circle and card, in every variant.\n\n## Keyboard and accessibility\nThe options are real `<input type=\"radio\">` elements inside a `<fieldset role=\"radiogroup\">`, so the\nbrowser provides the standard radio keyboard model:\n\n- **Tab** enters the group on the selected option (or the first enabled one) and **Tab** again leaves it — the group is a single tab stop.\n- **Arrow keys** move to the next/previous option **and select it**, skipping disabled options.\n- **Space** selects the focused option.\n\n`el.focus()` focuses the group the same way Tab would. The radios are visually hidden but stay in the\naccessibility tree; the focus ring is drawn on the visible circle. Option descriptions are linked to\ntheir radio with `aria-describedby`.\n\n## Theming\nEvery visual knob is a custom property on the host, so one instance can be tuned without touching the\ncomponent: `--slice-radio-mark-size`, `--slice-radio-mark-border`, `--slice-radio-mark-border-width`,\n`--slice-radio-mark-surface`, `--slice-radio-gap`, `--slice-radio-surface`,\n`--slice-radio-surface-border`, `--slice-radio-card-surface` and `--slice-radio-card-border`. For the\naccent colour use `customColor`.\n\n## Live Preview\n:::component name=\"RadioGroup\"\n{\n  \"label\": \"Plan\",\n  \"options\": [\n    { \"label\": \"Free\", \"value\": \"free\" },\n    { \"label\": \"Pro\", \"value\": \"pro\" },\n    { \"label\": \"Team\", \"value\": \"team\" }\n  ],\n  \"value\": \"pro\"\n}\n:::\n\n## Prop Scenarios\n:::script label=\"basic group\" expected=\"three options, Pro selected\"\nconst group = await slice.build('RadioGroup', {\n  label: 'Plan',\n  options: [\n    { label: 'Free', value: 'free' },\n    { label: 'Pro', value: 'pro' },\n    { label: 'Team', value: 'team' }\n  ],\n  value: 'pro'\n});\n\nreturn group;\n:::\n\n:::script label=\"onChange reports the selection\" expected=\"the text below updates as you pick\"\nconst output = document.createElement('p');\noutput.textContent = 'Nothing selected yet';\n\nconst group = await slice.build('RadioGroup', {\n  label: 'Notifications',\n  options: [\n    { label: 'Everything', value: 'all' },\n    { label: 'Mentions only', value: 'mentions' },\n    { label: 'Nothing', value: 'none' }\n  ],\n  onChange: (value, option) => {\n    output.textContent = `Selected: ${option.label} (${value})`;\n  }\n});\n\nconst host = document.createElement('div');\nhost.append(group, output);\nreturn host;\n:::\n\n:::script label=\"shorthand options and horizontal layout\" expected=\"sizes in a single row\"\nconst group = await slice.build('RadioGroup', {\n  label: 'Size',\n  options: ['XS', 'S', 'M', 'L', 'XL'],\n  value: 'M',\n  orientation: 'horizontal'\n});\n\nreturn group;\n:::\n\n:::script label=\"card picker with descriptions\" expected=\"each option is a card; Express is selected and Pickup is disabled\"\nconst group = await slice.build('RadioGroup', {\n  label: 'Shipping method',\n  variant: 'card',\n  orientation: 'horizontal',\n  value: 'express',\n  options: [\n    { label: 'Standard', value: 'standard', description: '3–5 business days · Free' },\n    { label: 'Express', value: 'express', description: 'Next business day · $9' },\n    { label: 'Pickup', value: 'pickup', description: 'Not available in your area', disabled: true }\n  ]\n});\n\nreturn group;\n:::\n\n:::script label=\"buttons: a range switch above a chart\" expected=\"a 'Visits' card with a Day · Week · Month bar on the right, Week chosen; choosing another range changes the total and the bars below\"\nconst data = {\n  day: { total: '1,284', bars: [12, 30, 22, 48, 60, 41, 18] },\n  week: { total: '8,930', bars: [40, 55, 48, 70, 66, 52, 35] },\n  month: { total: '36,402', bars: [60, 72, 58, 80, 90, 76, 84] }\n};\nconst card = document.createElement('section');\ncard.style.cssText = 'display:grid;gap:14px;width:100%;max-width:520px;padding:16px;border:1px solid var(--slice-border-raised, #ddd);border-radius:12px';\nconst head = document.createElement('div');\nhead.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap';\nconst title = document.createElement('div');\nconst name = document.createElement('div');\nname.style.cssText = 'font-size:.85rem;opacity:.75';\nname.textContent = 'Visits';\nconst total = document.createElement('div');\ntotal.style.cssText = 'font-size:1.6rem;font-weight:700';\ntitle.append(name, total);\nconst bars = document.createElement('div');\nbars.style.cssText = 'display:flex;align-items:end;gap:8px;height:90px';\nconst paint = (range) => {\n  total.textContent = data[range].total;\n  bars.replaceChildren(...data[range].bars.map((h) => {\n    const bar = document.createElement('span');\n    bar.style.cssText = `flex:1;height:${h}%;border-radius:4px;background:var(--primary-color)`;\n    return bar;\n  }));\n};\nconst range = await slice.build('RadioGroup', {\n  ariaLabel: 'Range',\n  variant: 'buttons',\n  orientation: 'horizontal',\n  size: 'sm',\n  value: 'week',\n  options: [{ label: 'Day', value: 'day' }, { label: 'Week', value: 'week' }, { label: 'Month', value: 'month' }],\n  onChange: paint\n});\npaint('week');\nhead.append(title, range);\ncard.append(head, bars);\nreturn card;\n:::\n\n:::script label=\"buttons: monthly or yearly billing\" expected=\"a centred Monthly · Yearly bar ('Yearly' has '2 months free' under it); below, a price that changes from $12/month to $120/year\"\nconst box = document.createElement('div');\nbox.style.cssText = 'display:grid;justify-items:center;gap:12px;width:100%';\nconst price = document.createElement('p');\nprice.style.cssText = 'margin:0;font-size:1.4rem;font-weight:700';\nconst prices = { monthly: '$12 / month', yearly: '$120 / year' };\nconst billing = await slice.build('RadioGroup', {\n  ariaLabel: 'Billing period',\n  variant: 'buttons',\n  orientation: 'horizontal',\n  value: 'monthly',\n  options: [\n    { label: 'Monthly', value: 'monthly' },\n    { label: 'Yearly', value: 'yearly', description: '2 months free' }\n  ],\n  onChange: (value) => { price.textContent = prices[value]; }\n});\nprice.textContent = prices.monthly;\nbox.append(billing, price);\nreturn box;\n:::\n\n:::script label=\"options carrying extra data\" expected=\"selectedOption exposes the price of the chosen plan\"\nconst plans = [\n  { label: 'Monthly', value: 'monthly', price: 12, description: '$12 / month' },\n  { label: 'Yearly', value: 'yearly', price: 120, description: '$120 / year — two months free' }\n];\n\nconst total = document.createElement('p');\n\nconst group = await slice.build('RadioGroup', {\n  label: 'Billing',\n  variant: 'card',\n  options: plans,\n  value: 'yearly',\n  onChange: () => {\n    total.textContent = `Total today: $${group.selectedOption.price}`;\n  }\n});\ntotal.textContent = `Total today: $${group.selectedOption.price}`;\n\nconst host = document.createElement('div');\nhost.append(group, total);\nreturn host;\n:::\n\n:::script label=\"controlled from outside\" expected=\"the buttons change the selection without firing onChange\"\nconst group = await slice.build('RadioGroup', {\n  label: 'Theme',\n  options: [\n    { label: 'Light', value: 'light' },\n    { label: 'Dark', value: 'dark' },\n    { label: 'System', value: 'system' }\n  ],\n  value: 'system'\n});\n\nconst actions = document.createElement('div');\nactions.style.display = 'flex';\nactions.style.gap = '8px';\n\nfor (const value of ['light', 'dark', 'system']) {\n  actions.appendChild(await slice.build('Button', {\n    value: `Set ${value}`,\n    size: 'sm',\n    variant: 'outlined',\n    onClick: () => { group.value = value; }\n  }));\n}\n\nactions.appendChild(await slice.build('Button', {\n  value: 'Clear',\n  size: 'sm',\n  variant: 'ghost',\n  onClick: () => { group.value = null; }\n}));\n\nconst host = document.createElement('div');\nhost.append(group, actions);\nreturn host;\n:::\n\n:::script label=\"disabled group and disabled option\" expected=\"the first group is fully disabled; in the second only Team is\"\nconst options = [\n  { label: 'Free', value: 'free' },\n  { label: 'Pro', value: 'pro' },\n  { label: 'Team', value: 'team' }\n];\n\nconst locked = await slice.build('RadioGroup', {\n  label: 'Managed by your organisation',\n  options,\n  value: 'pro',\n  disabled: true\n});\n\nconst partial = await slice.build('RadioGroup', {\n  label: 'Upgrade to',\n  options: options.map((o) => (o.value === 'team' ? { ...o, disabled: true } : o))\n});\n\nconst host = document.createElement('div');\nhost.style.display = 'flex';\nhost.style.flexWrap = 'wrap';\nhost.style.gap = '16px';\nhost.append(locked, partial);\nreturn host;\n:::\n\n:::script label=\"variant variations\" expected=\"default, outlined, soft and plain side by side\"\nconst host = document.createElement('div');\nhost.style.display = 'flex';\nhost.style.flexWrap = 'wrap';\nhost.style.gap = '16px';\n\nfor (const variant of ['default', 'outlined', 'soft', 'plain']) {\n  host.appendChild(await slice.build('RadioGroup', {\n    label: variant,\n    variant,\n    options: ['One', 'Two'],\n    value: 'Two'\n  }));\n}\n\nreturn host;\n:::\n\n:::script label=\"size and label placement\" expected=\"sm, md and lg groups; the last puts labels on the left\"\nconst host = document.createElement('div');\nhost.style.display = 'flex';\nhost.style.flexWrap = 'wrap';\nhost.style.alignItems = 'flex-start';\nhost.style.gap = '16px';\n\nfor (const size of ['sm', 'md', 'lg']) {\n  host.appendChild(await slice.build('RadioGroup', {\n    label: `Size ${size}`,\n    size,\n    options: ['Daily', 'Weekly'],\n    value: 'Weekly'\n  }));\n}\n\nhost.appendChild(await slice.build('RadioGroup', {\n  label: 'Labels on the left',\n  labelPlacement: 'left',\n  options: ['Daily', 'Weekly'],\n  value: 'Daily'\n}));\n\nreturn host;\n:::\n\n:::script label=\"custom accent\" expected=\"the selected circle uses the custom colour\"\nconst group = await slice.build('RadioGroup', {\n  label: 'Priority',\n  options: ['Low', 'Normal', 'High'],\n  value: 'High',\n  customColor: { accent: '#d97706' }\n});\n\nreturn group;\n:::\n\n:::script label=\"inside a Form\" expected=\"submitting without a choice shows the required message\"\nconst result = document.createElement('pre');\n\nconst form = await slice.build('Form', {\n  submitText: 'Continue',\n  schema: [\n    {\n      name: 'contact',\n      component: 'RadioGroup',\n      required: 'Choose how we should contact you',\n      props: {\n        label: 'Preferred contact',\n        variant: 'plain',\n        orientation: 'horizontal',\n        options: [\n          { label: 'Email', value: 'email' },\n          { label: 'Phone', value: 'phone' },\n          { label: 'Don’t contact me', value: 'none' }\n        ]\n      }\n    }\n  ],\n  onSubmit: (values) => {\n    result.textContent = JSON.stringify(values);\n  }\n});\n\nconst host = document.createElement('div');\nhost.append(form, result);\nreturn host;\n:::\n\n## Best Practices\n\n:::tip\nOrder options in a meaningful way (cheapest first, most common first) and pre-select a sensible default when one exists — a group with nothing selected forces an extra decision.\n:::\n\nInside a `Form`, use `variant: 'plain'` and let the Form field's `label` name the group: the Form passes it as `ariaLabel`. A `label` on the RadioGroup itself (its legend) is only needed outside a Form. Keep `buttons` labels to a word or two and to two–five options; longer lists wrap badly in a bar, so use `card` or the default look.\n\n## Pitfalls\n\n:::warning\n`value` is compared strictly. If your options use numbers (`value: 1`), set `value: 1`, not `'1'` — otherwise nothing is selected and a warning is logged.\n:::\n\nDo not use a RadioGroup for actions. Selecting an option should only change a value; if picking it should trigger something, use buttons instead.\n\n:::related\n- [Select](/docs/input/select) - The same choice, collapsed into a menu.\n- [Checkbox](/docs/input/checkbox) - Several answers at once.\n- [Form](/docs/input/form) - The group as one field of many.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            let props = {};
            if ("{\n  \"label\": \"Plan\",\n  \"options\": [\n    { \"label\": \"Free\", \"value\": \"free\" },\n    { \"label\": \"Pro\", \"value\": \"pro\" },\n    { \"label\": \"Team\", \"value\": \"team\" }\n  ],\n  \"value\": \"pro\"\n}") {
               try {
                  props = JSON.parse("{\n  \"label\": \"Plan\",\n  \"options\": [\n    { \"label\": \"Free\", \"value\": \"free\" },\n    { \"label\": \"Pro\", \"value\": \"pro\" },\n    { \"label\": \"Team\", \"value\": \"team\" }\n  ],\n  \"value\": \"pro\"\n}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('RadioGroup', props);
            container.appendChild(component);
         }
       }
      {
         const container = this.querySelector('[data-block-id="doc-block-15"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Order options in a meaningful way (cheapest first, most common first) and pre-select a sensible default when one exists — a group with nothing selected forces an extra decision.</p>";
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
         const container = this.querySelector('[data-block-id="doc-block-16"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p><code>value</code> is compared strictly. If your options use numbers (<code>value: 1</code>), set <code>value: 1</code>, not <code>'1'</code> — otherwise nothing is selected and a warning is logged.</p>";
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
         const container = this.querySelector('[data-block-id="doc-block-17"]');
         if (container) {
            const items = [{"title":"Select","path":"/docs/input/select","text":"The same choice, collapsed into a menu."},{"title":"Checkbox","path":"/docs/input/checkbox","text":"Several answers at once."},{"title":"Form","path":"/docs/input/form","text":"The group as one field of many."}];
            const cards = [];
            for (const item of items) {
               const card = await slice.build('Card', {
                  title: item.title,
                  text: item.text || '',
                  // The small mark beside the title, not the banner: a page
                  // of four related links should not be four big arrows.
                  headerIcon: 'arrow-right',
                  interactive: true,
                  onClick: () => {
                     if (/^https?:/i.test(item.path)) {
                        window.open(item.path, '_blank', 'noopener,noreferrer');
                     } else {
                        slice.router.navigate(item.path);
                     }
                  }
               });
               if (card) cards.push(card);
            }
            const grid = await slice.build('Grid', {
               columns: items.length === 4 ? 2 : Math.min(3, Math.max(1, cards.length)),
               gap: '14px',
               items: cards
            });
            if (grid) container.appendChild(grid);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-18"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"options\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"value\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"name\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"label\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"required\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"orientation\",\"type\":\"string\",\"required\":false,\"default\":\"vertical\",\"allowedValues\":[\"vertical\",\"horizontal\"]},{\"path\":\"labelPlacement\",\"type\":\"string\",\"required\":false,\"default\":\"right\",\"allowedValues\":[\"right\",\"left\",\"top\",\"bottom\"]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"default\",\"allowedValues\":[\"default\",\"outlined\",\"soft\",\"plain\",\"card\",\"buttons\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\",\"lg\"]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"customColor\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"options\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"value\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"name\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"label\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"ariaLabel\",\"type\":\"string\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"disabled\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"required\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"orientation\",\"type\":\"string\",\"required\":false,\"default\":\"vertical\",\"allowedValues\":[\"vertical\",\"horizontal\"]},{\"path\":\"labelPlacement\",\"type\":\"string\",\"required\":false,\"default\":\"right\",\"allowedValues\":[\"right\",\"left\",\"top\",\"bottom\"]},{\"path\":\"variant\",\"type\":\"string\",\"required\":false,\"default\":\"default\",\"allowedValues\":[\"default\",\"outlined\",\"soft\",\"plain\",\"card\",\"buttons\"]},{\"path\":\"size\",\"type\":\"string\",\"required\":false,\"default\":\"md\",\"allowedValues\":[\"sm\",\"md\",\"lg\"]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"customColor\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"Select","path":"/docs/input/select"},{"text":"Switch","path":"/docs/input/switch"},{"text":"Checkbox","path":"/docs/input/checkbox"},{"text":"Rating","path":"/docs/input/rating"},{"text":"Button","path":"/docs/input/button"}];
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

customElements.define('slice-radiogroupdocumentation', RadioGroupDocumentation);
