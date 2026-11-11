import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

const DATA = {
   id: 42,
   name: 'User 1',
   active: true,
   manager: null,
   tags: ['tag1', 'tag2'],
   address: { city: 'City 1', 'zip code': '0000' },
};

const rows = (c) => c.locator('[role="treeitem"]');
// A row by its path: row(c, 'address', 'city').
const row = (c, ...path) => c.locator(`[role="treeitem"][data-id='${JSON.stringify(path)}']`);

test.describe('JsonViewer', () => {
   test('smoke: a tree with typed values; top level open, deeper closed', async ({ mount }) => {
      const c = await mount('JsonViewer', { data: DATA });
      expect(c.pageErrors()).toEqual([]);
      await expect(c.locator('[role="tree"]')).toHaveCount(1);
      await expect(rows(c)).toHaveCount(6);
      await expect(c.locator('.slice-json-viewer__value[data-type="number"]')).toHaveText('42');
      await expect(c.locator('.slice-json-viewer__value[data-type="string"]').first()).toHaveText('"User 1"');
      await expect(c.locator('.slice-json-viewer__value[data-type="boolean"]')).toHaveText('true');
      await expect(c.locator('.slice-json-viewer__value[data-type="null"]')).toHaveText('null');
      await expect(row(c, 'tags')).toHaveAttribute('aria-expanded', 'false');
      await expect(row(c, 'tags').locator('.slice-json-viewer__preview')).toHaveText('2 items');
      await expect(rows(c).first()).toHaveAttribute('aria-level', '1');
      await expect(rows(c).first()).toHaveAttribute('aria-setsize', '6');
   });

   test('expandDepth, expandAll, collapseAll; a root name adds a root row', async ({ mount }) => {
      const c = await mount('JsonViewer', { data: DATA, expandDepth: 2 });
      await expect(row(c, 'address')).toHaveAttribute('aria-expanded', 'true');
      await expect(row(c, 'address', 'city')).toHaveAttribute('aria-level', '2');
      await c.component.evaluate((el) => el.collapseAll());
      await expect(rows(c)).toHaveCount(6);
      await c.component.evaluate((el) => el.expandAll());
      await expect(rows(c)).toHaveCount(10);
      await c.component.evaluate((el) => { el.rootName = 'user'; });
      await expect(rows(c).first().locator('.slice-json-viewer__key').first()).toHaveText('user');
   });

   test('click and keyboard: one Tab stop, arrows move, → opens, ← closes and goes up', async ({ mount, page }) => {
      const c = await mount('JsonViewer', { data: DATA });
      await expect(c.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(1);
      await row(c, 'tags').locator(':scope > .slice-json-viewer__line').click();
      await expect(row(c, 'tags')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator(':focus')).toHaveAttribute('data-id', '["tags"]');
      await page.keyboard.press('ArrowDown');
      await expect(page.locator(':focus')).toHaveAttribute('data-id', '["tags",0]');
      await page.keyboard.press('ArrowLeft');
      await expect(page.locator(':focus')).toHaveAttribute('data-id', '["tags"]');
      await page.keyboard.press('ArrowLeft');
      await expect(row(c, 'tags')).toHaveAttribute('aria-expanded', 'false');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      await expect(row(c, 'address')).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('End');
      await expect(page.locator(':focus')).toHaveAttribute('data-id', '["address","zip code"]');
      await page.keyboard.press('Home');
      await expect(page.locator(':focus')).toHaveAttribute('data-id', '["id"]');
      await expect(c.locator('[role="treeitem"][tabindex="0"]')).toHaveCount(1);
   });

   test('onSelect with the path as code (quoted keys where needed)', async ({ mount, page }) => {
      const c = await mount('JsonViewer', { data: DATA, expandDepth: 2, rootName: 'user' }, { spies: ['onSelect'] });
      await row(c, 'address', 'zip code').locator(':scope > .slice-json-viewer__line').click();
      await expect.poll(() => c.events('onSelect')).toBe(1);
      const [[detail]] = await c.eventArgs('onSelect');
      expect(detail.pathText).toBe('user.address["zip code"]');
      expect(detail.value).toBe('0000');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('Enter');
      await expect.poll(() => c.events('onSelect')).toBe(2);
      expect((await c.eventArgs('onSelect'))[1][0].pathText).toBe('user.address.city');
   });

   test('copy: c copies the value, p the path, announced politely', async ({ mount, page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const c = await mount('JsonViewer', { data: DATA }, { spies: ['onCopy'] });
      await row(c, 'address').focus();
      await page.keyboard.press('c');
      await expect.poll(() => c.events('onCopy')).toBe(1);
      // The OS clipboard normalises newlines (CRLF on Windows): compare the text, not the line endings.
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied.replace(/\r\n/g, '\n')).toBe(JSON.stringify(DATA.address, null, 2));
      await expect(c.locator('[role="status"]')).toHaveText('Value copied');
      await page.keyboard.press('p');
      await expect.poll(() => c.events('onCopy')).toBe(2);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('address');
      await expect(c.locator('[role="status"]')).toHaveText('Path copied: address');
   });

   test('search: counts, highlights and opens the way to the matches; Enter goes to the next', async ({ mount, page }) => {
      const c = await mount('JsonViewer', { data: DATA, search: true, expandDepth: 0 });
      const box = c.locator('input[type="search"]');
      await expect(box).toBeVisible();
      await box.fill('city 1');
      await expect(c.locator('.slice-json-viewer__count')).toHaveText('1 match');
      await expect(row(c, 'address')).toHaveAttribute('aria-expanded', 'true');
      await expect(c.locator('mark')).toHaveText('City 1');
      await box.fill('a');
      await expect(c.locator('.slice-json-viewer__count')).toHaveText(/\d+ matches/);
      await box.press('Enter');
      await expect(c.locator('.is-current-match')).toHaveCount(1);
      await box.fill('zzz');
      await expect(c.locator('.slice-json-viewer__count')).toHaveText('No matches');
   });

   test('long arrays open in ranges of 100; long strings are cut with a button for the rest', async ({ mount, page }) => {
      const c = await mount('JsonViewer', { data: { list: Array.from({ length: 250 }, (_, i) => i), text: 'x'.repeat(300) }, expandDepth: 2, maxStringLength: 50 });
      await expect(c.locator('[data-range]')).toHaveText([/\[0 … 99\]/, /\[100 … 199\]/, /\[200 … 249\]/]);
      await expect(c.locator('[data-range="0-99"]')).toHaveAttribute('aria-expanded', 'true');
      await expect(c.locator('[data-range="100-199"]')).toHaveAttribute('aria-expanded', 'false');
      const text = c.locator('.slice-json-viewer__value[data-type="string"]');
      await expect(text).toHaveText(`"${'x'.repeat(50)}…"`);
      await c.locator('.slice-json-viewer__more').click();
      await expect(text).toHaveText(`"${'x'.repeat(300)}"`);
   });

   test('circular references do not hang; primitives render as one row', async ({ mount, page }) => {
      const c = await mount('JsonViewer', { data: 'just a string' });
      await expect(rows(c)).toHaveCount(1);
      await page.evaluate(() => {
         const a = { name: 'a' };
         a.self = a;
         document.querySelector('slice-json-viewer').data = a;
      });
      await expect(c.locator('.slice-json-viewer__value[data-type="other"]')).toHaveText('[Circular]');
      await c.component.evaluate((el) => el.expandAll());
      expect(c.pageErrors()).toEqual([]);
   });

   test('texts follow the texts prop; toolbar can be hidden', async ({ mount }) => {
      const c = await mount('JsonViewer', { data: DATA, texts: { expandAll: 'Abrir todo', items: '{count} elementos' } });
      await expect(c.locator('[data-action="expand"]')).toHaveText('Abrir todo');
      await expect(row(c, 'tags').locator('.slice-json-viewer__preview')).toHaveText('2 elementos');
      await c.component.evaluate((el) => { el.toolbar = false; });
      await expect(c.locator('.slice-json-viewer__toolbar')).toBeHidden();
   });
});
