import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

const ITEMS = [
   { title: 'Step 1', text: 'A short description.', icon: 'users' },
   { title: 'Step 2', text: 'A short description.', icon: 'book' },
   { title: 'Step 3', text: 'A short description.', icon: 'check-circle' },
];

test.describe('Steps', () => {
   test('smoke: an ordered list with numbered markers, headings and text', async ({ mount }) => {
      const c = await mount('Steps', { items: ITEMS });
      expect(c.pageErrors()).toEqual([]);
      await expect(c.component).toHaveClass(/slice-steps/);
      await expect(c.locator('ol.slice-steps__list > li')).toHaveCount(3);
      await expect(c.locator('.slice-steps__marker')).toHaveText(['1', '2', '3']);
      await expect(c.locator('h3.slice-steps__title')).toHaveText(ITEMS.map((i) => i.title));
      await expect(c.locator('.slice-steps__text').first()).toHaveText('A short description.');
      await expect(c.locator('.slice-steps__rail').first()).toHaveAttribute('aria-hidden', 'true');
   });

   test('start continues the numbering, in the markers and in the list itself', async ({ mount }) => {
      const c = await mount('Steps', { items: ITEMS, start: 4 });
      await expect(c.locator('.slice-steps__marker')).toHaveText(['4', '5', '6']);
      await expect(c.locator('ol')).toHaveAttribute('start', '4');
      await c.component.evaluate((el) => { el.start = 1; });
      await expect(c.locator('ol')).not.toHaveAttribute('start', /.*/);
   });

   test('marker: icon shows icons (number where one is missing), dot shows neither', async ({ mount }) => {
      const c = await mount('Steps', { items: [...ITEMS, { title: 'Without icon' }], marker: 'icon' });
      await expect(c.locator('.slice-steps__marker slice-icon')).toHaveCount(3);
      await expect(c.locator('.slice-steps__marker').nth(3)).toHaveText('4');
      await c.component.evaluate((el) => { el.marker = 'dot'; });
      await expect(c.locator('.slice-steps__marker slice-icon')).toHaveCount(0);
      await expect(c.locator('.slice-steps__marker').first()).toHaveText('');
      await expect(c.component).toHaveAttribute('data-marker', 'dot');
   });

   test('horizontal where there is room, vertical when the container is narrow', async ({ mount, page }) => {
      await page.setViewportSize({ width: 1100, height: 800 });
      const c = await mount('Steps', { items: ITEMS, orientation: 'horizontal' });
      const sameRow = () => c.locator('li').evaluateAll((lis) => {
         const tops = lis.map((li) => Math.round(li.getBoundingClientRect().top));
         return new Set(tops).size === 1;
      });
      expect(await sameRow()).toBe(true);
      await c.component.evaluate((el) => { el.style.width = '360px'; });
      expect(await sameRow()).toBe(false);
      await c.component.evaluate((el) => { el.style.width = ''; el.orientation = 'vertical'; });
      expect(await sameRow()).toBe(false);
   });

   test('connector between steps, none after the last; connector=false removes it', async ({ mount }) => {
      const c = await mount('Steps', { items: ITEMS });
      const lines = () => c.locator('.slice-steps__rail').evaluateAll((rails) => rails.map((r) => getComputedStyle(r, '::after').content));
      expect(await lines()).toEqual(['""', '""', 'none']);
      await c.component.evaluate((el) => { el.connector = false; });
      expect(await lines()).toEqual(['none', 'none', 'none']);
   });

   test('looks reflect; unknown values fall back; headingLevel', async ({ mount }) => {
      const c = await mount('Steps', { items: ITEMS, headingLevel: 2 });
      await expect(c.locator('h2.slice-steps__title')).toHaveCount(3);
      for (const [prop, value] of [['variant', 'filled'], ['variant', 'outlined'], ['tone', 'success'], ['size', 'sm']]) {
         await c.component.evaluate((el, [p, v]) => { el[p] = v; }, [prop, value]);
         await expect(c.component).toHaveAttribute(`data-${prop}`, value);
      }
      await c.component.evaluate((el) => { el.orientation = 'diagonal'; el.marker = 'emoji'; });
      await expect(c.component).toHaveAttribute('data-orientation', 'vertical');
      await expect(c.component).toHaveAttribute('data-marker', 'number');
   });

   test('content nodes and icons are destroyed with it', async ({ mount, page }) => {
      await mount('Steps', { items: ITEMS, marker: 'icon' });
      const counts = await page.evaluate(async () => {
         const el = document.querySelector('slice-steps');
         const live = () => window.slice.controller.activeComponents.size;
         const code = await window.slice.build('Button', { value: 'Copy command' });
         el.items = [{ title: 'Install', icon: 'download', content: code }];
         await new Promise((r) => setTimeout(r, 150));
         const shown = live();
         window.slice.controller.destroyComponent(el);
         return { shown, afterDestroy: live() };
      });
      // Steps, its one icon and the button.
      expect(counts.afterDestroy).toBe(counts.shown - 3);
   });
});
