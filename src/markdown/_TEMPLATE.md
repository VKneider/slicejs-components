---
title: Button
route: /docs/input/button
navLabel: Button
section: Input Components
group: Basic
order: 10
description: Complete documentation and prop scenarios for Button.
component: ButtonDocumentation
generate: false
# status: new | updated | deprecated | beta | experimental
tags: [button, input]
---

# Button

## Overview
Describe what this component solves, default behavior, and when to use it.

## When to use it

:::compare left="Use this component" right="Reach for something else"
The job this component owns, and the signal that it is the right choice.
---
The adjacent job it does not own, and the component or pattern that does.
:::

## API and Behavior
- Use this section for behavior contracts (events, lifecycle expectations, state transitions).
- Do not add manual props tables. The parser injects `Props (Generated from static props)` automatically.

## Example
```javascript title="Basic build"
const button = await slice.build('Button', { value: 'Save' });
this.appendChild(button);
```

## Prop Scenarios
:::script label="value updates label" expected="Button text is updated"
const target = await slice.build('Button', { value: 'Initial' });
target.value = 'Updated';
component.appendChild(target);
if (target.value !== 'Updated') {
  throw new Error('Expected value to be Updated');
}
:::

:::script label="onClick fires" expected="Callback executes once"
let fired = 0;
const target = await slice.build('Button', {
  value: 'Click me',
  onClick: () => {
    fired += 1;
  }
});
component.appendChild(target);
target.querySelector('.slice_button_container')?.click();
if (fired !== 1) {
  throw new Error('Expected callback to fire once');
}
:::

## Notes for authors
Keep 1–3 callouts per page. Use `:::compare` for a contrast (this vs that) and `:::details` for
long caveats; a wall of tips trains readers to skip them. The parser injects the props table.

## Pitfalls
:::warning
Do not omit required front matter fields. `docs:lint-md` fails the build.
:::

:::related
- [Component](/docs/input/button) - A related component or guide.
- [Guide](/docs/internal/markdown-parser-rules) - The parser rules this page follows.
:::
