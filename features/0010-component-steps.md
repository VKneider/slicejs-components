---
id: "0010"
title: "Component: Steps (merged into Stepper)"
repo: "slicejs-components"
status: rejected
area: components
priority: medium
created: 2026-11-08
updated: 2026-11-12
target: "merged into 0005"
owners: []
related:
  - "features/0005-component-stepper.md"
  - "src/Components/Visual/Stepper/Stepper.js"
  - "src/markdown/stepper.md"
---

# Steps — retired as a separate component

## Summary

The standalone Steps component has been merged into Stepper (feature 0005). Its static ordered
instructions are Stepper's default mode. This file preserves the decision history; it is not an
open request to rebuild Steps.

## Problem / motivation

Steps and Stepper shared markers, connectors, content and responsive layout. Two names forced
consumers to choose between largely identical surfaces. One component with two explicit modes
covers static explanations and interactive task navigation.

## Final direction

Use `slice.build('Stepper', { mode: 'static', items })` for the original display-only job, or
`mode: 'interactive'` for current/completed/error states and navigation.

## Alternatives considered

- Keep two independent components: rejected by the user in favor of a single Stepper.
- Keep a Steps alias/compatibility wrapper: explicitly declined; the user confirmed no consumers.

## Scope and compatibility

Removed Steps source, its tests (migrated to Stepper), Markdown, generated docs, route, registry
entry, declaration and generated social card. No alias, redirect or compatibility layer remains.
This is an explicit user-authorized API removal despite the repository's general alias policy.

## Validation and documentation

Static cases are now in Stepper.spec.js; the canonical guide is src/markdown/stepper.md.
Stepper's implementation/release validation is tracked only in feature 0005. This feature uses
rejected to mean the standalone component was retired; its useful behavior is retained by Stepper.

## Decision log

- 2026-11-08 — Built as a separate static Steps component; Stepper was still a separate proposal.
- 2026-11-12 — User requested fusion into one Stepper, then explicitly declined compatibility
  because nobody uses Steps. Merged the implementation, migrated docs/tests, removed the old
  component/route and changed this feature to rejected (superseded by 0005).
