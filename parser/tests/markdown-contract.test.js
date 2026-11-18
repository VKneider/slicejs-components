import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parseMarkdownFile } from '../lib/markdownParser.js';

const fixture = `---
title: Contract Fixture
route: /docs/internal/contract-fixture
navLabel: Contract Fixture
section: Internal
group: Contract
order: 99
description: A fixture for the shared markdown contract.
component: ContractFixture
status: new
tags: [test]
---

# Contract Fixture

A paragraph with [Services](/docs/services/dom-service) and an [external link](https://example.com).

> A quoted aside with \`code\`.

1. First step wraps
   onto another line.
2. Second step.

- Parent item
  - Nested item

| Name | Notes |
| --- | --- |
| \`slice.build\` | See [Docs](/docs/services/dom-service). |

:::note
A quiet note.
:::

:::compare left="Do" right="Don't"
Update the prop.
---
Destroy and rebuild.
:::

:::details title="A detail"
A **rich** body with \`code\`.
:::

:::related
- [Button](/docs/input/button) - The button component.
- [Input](/docs/input/input) - The input component.
:::
`;

const parseFixture = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slice-components-contract-'));
  const file = path.join(dir, 'contract.md');
  fs.writeFileSync(file, fixture, 'utf8');
  try {
    return parseMarkdownFile(file);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

test('internal links become Link placeholders and external links open in a new tab', () => {
  const { html, jsBlocks } = parseFixture();
  const inlineLinks = jsBlocks.find((block) => block.type === 'inline-links');

  assert.match(html, /<span data-inline-link="0"><\/span>/);
  assert.match(html, /<a href="https:\/\/example.com" target="_blank" rel="noopener noreferrer">external link<\/a>/);
  assert.ok(inlineLinks);
  assert.deepEqual(inlineLinks.links[0], { text: 'Services', path: '/docs/services/dom-service' });
  assert.doesNotMatch(html, /\[Services\]\(/);
});

test('blockquotes and wrapped or nested lists render correctly', () => {
  const { html } = parseFixture();
  assert.match(html, /<blockquote><p>A quoted aside with <code>code<\/code>\.<\/p><\/blockquote>/);
  assert.match(html, /<ol><li>First step wraps onto another line\.<\/li><li>Second step\.<\/li><\/ol>/);
  assert.match(html, /<ul><li>Parent item<ul><li>Nested item<\/li><\/ul><\/li><\/ul>/);
});

test('table rows keep internal links for the page formatter', () => {
  const { jsBlocks } = parseFixture();
  const table = jsBlocks.find((block) => block.type === 'table');
  assert.ok(table);
  assert.ok(table.rows.some((row) => row.includes('SLICE_INLINE_LINK_')));
});

test('note, compare, details and status become registry blocks', () => {
  const { jsBlocks } = parseFixture();
  const note = jsBlocks.find((block) => block.type === 'callout');
  const compare = jsBlocks.find((block) => block.type === 'compare');
  const details = jsBlocks.find((block) => block.type === 'details');
  const status = jsBlocks.find((block) => block.type === 'status');

  assert.ok(note);
  assert.equal(note.tone, 'neutral');
  assert.equal(note.variant, 'ghost');

  assert.ok(compare);
  assert.equal(compare.left.title, 'Do');
  assert.equal(compare.right.title, "Don't");
  assert.match(compare.left.html, /Update the prop/);
  assert.match(compare.right.html, /Destroy and rebuild/);

  assert.ok(details);
  assert.match(details.html, /<strong>rich<\/strong>/);
  assert.match(details.html, /<code>code<\/code>/);

  assert.ok(status);
  assert.equal(status.status, 'new');
});

test('related links become card items', () => {
  const { jsBlocks } = parseFixture();
  const related = jsBlocks.find((block) => block.type === 'related');

  assert.ok(related);
  assert.equal(related.items.length, 2);
  assert.equal(related.items[0].path, '/docs/input/button');
  assert.match(related.items[0].text, /The button component/);
});
