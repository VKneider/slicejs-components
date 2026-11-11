import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

const ITEMS = [
   { icon: 'rocket', title: 'Fast setup', text: 'Online in an afternoon.' },
   { icon: 'shield', title: 'Private by default', text: 'Your data stays yours.', badge: 'New' },
   { title: 'No icon here', text: 'Text only.' },
];

test.describe('FeatureList', () => {
   test('smoke: a list of items with icon, heading and text', async ({ mount }) => {
      const c = await mount('FeatureList', { items: ITEMS });
      expect(c.pageErrors()).toEqual([]);
      await expect(c.component).toHaveClass(/slice-feature-list/);
      await expect(c.locator('ul[role="list"] > li')).toHaveCount(3);
      await expect(c.locator('h3.slice-feature-list__title')).toHaveText(['Fast setup', 'Private by default New', 'No icon here']);
      await expect(c.locator('.slice-feature-list__text')).toHaveText(['Online in an afternoon.', 'Your data stays yours.', 'Text only.']);
      await expect(c.locator('.slice-feature-list__icon slice-icon')).toHaveCount(2);
      await expect(c.locator('li').nth(2).locator('.slice-feature-list__icon')).toBeHidden();
      await expect(c.locator('.slice-feature-list__badge')).toHaveText('New');
   });

   test('headingLevel sets the title element; out of range falls back to h3', async ({ mount }) => {
      const c = await mount('FeatureList', { items: ITEMS, headingLevel: 4 });
      await expect(c.locator('h4.slice-feature-list__title')).toHaveCount(3);
      await c.component.evaluate((el) => { el.headingLevel = 9; });
      await expect(c.locator('h3.slice-feature-list__title')).toHaveCount(3);
   });

   test('looks reflect as data-*; columns is a maximum that still wraps', async ({ mount, page }) => {
      const c = await mount('FeatureList', { items: [...ITEMS, ...ITEMS], columns: 3, minItemWidth: 120 });
      await expect(c.component).toHaveAttribute('data-layout', 'grid');
      await expect(c.component).toHaveAttribute('data-columns', '');
      await page.setViewportSize({ width: 1200, height: 800 });
      const columns = () => c.locator('.slice-feature-list__list').evaluate((ul) => getComputedStyle(ul).gridTemplateColumns.split(' ').length);
      expect(await columns()).toBe(3);
      await page.setViewportSize({ width: 320, height: 800 });
      expect(await columns()).toBeLessThanOrEqual(2);
      for (const [prop, value] of [['layout', 'list'], ['layout', 'compact'], ['variant', 'outlined'], ['tone', 'success'], ['align', 'center'], ['size', 'sm']]) {
         await c.component.evaluate((el, [p, v]) => { el[p] = v; }, [prop, value]);
         await expect(c.component).toHaveAttribute(`data-${prop}`, value);
      }
      await c.component.evaluate((el) => { el.layout = 'masonry'; });
      await expect(c.component).toHaveAttribute('data-layout', 'grid');
   });

   test('href: the title is a real link; a plain click on an app path uses the router', async ({ mount, page }) => {
      const c = await mount('FeatureList', {
         items: [
            { title: 'Page 1', text: 'Description 1', href: '/__test?page-1' },
            { title: 'Page 2', text: 'Description 2', href: 'https://example.com/page-2', target: '_blank' },
         ],
      });
      const links = c.locator('a.slice-feature-list__target');
      await expect(links).toHaveCount(2);
      await expect(links.nth(0)).toHaveAttribute('href', '/__test?page-1');
      await expect(links.nth(1)).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(c.locator('li.is-interactive')).toHaveCount(2);

      const navigated = await page.evaluate(() => {
         const calls = [];
         const original = window.slice.router.navigate.bind(window.slice.router);
         window.slice.router.navigate = (path) => { calls.push(path); return Promise.resolve(); };
         const link = document.querySelector('a.slice-feature-list__target');
         const plain = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
         link.dispatchEvent(plain);
         const withCtrl = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ctrlKey: true });
         // A modified click is left to the browser: stop it here so the test page stays.
         link.addEventListener('click', (e) => e.preventDefault(), { once: true });
         link.dispatchEvent(withCtrl);
         window.slice.router.navigate = original;
         return { calls, prevented: plain.defaultPrevented };
      });
      expect(navigated).toEqual({ calls: ['/__test?page-1'], prevented: true });
   });

   test('onItemClick: items without href become buttons and report the item', async ({ mount }) => {
      const c = await mount('FeatureList', { items: [{ id: 'a', title: 'Alpha' }, { id: 'b', title: 'Beta' }] }, { spies: ['onItemClick'] });
      const buttons = c.locator('button.slice-feature-list__target');
      await expect(buttons).toHaveCount(2);
      await buttons.nth(1).click();
      await expect.poll(() => c.events('onItemClick')).toBe(1);
      const [[item, meta]] = await c.eventArgs('onItemClick');
      expect(item).toMatchObject({ id: 'b', title: 'Beta' });
      expect(meta.index).toBe(1);
      await buttons.nth(0).focus();
      await c.component.page().keyboard.press('Enter');
      await expect.poll(() => c.events('onItemClick')).toBe(2);
   });

   test('text is never markup; content nodes are kept, and destroyed with it', async ({ mount, page }) => {
      const c = await mount('FeatureList', { items: [{ title: '<img src=x onerror=alert(1)>', text: '<b>x</b>' }] });
      await expect(c.locator('img')).toHaveCount(0);
      await expect(c.locator('.slice-feature-list__title')).toHaveText('<img src=x onerror=alert(1)>');
      const counts = await page.evaluate(async () => {
         const el = document.querySelector('slice-feature-list');
         const live = () => window.slice.controller.activeComponents.size;
         const button = await window.slice.build('Button', { value: 'Compare' });
         el.items = [{ icon: 'star', title: 'Pro', content: button }];
         await new Promise((r) => setTimeout(r, 100));
         const shown = !!el.querySelector('.slice-feature-list__content slice-button');
         const withButton = live();
         // The same node passed again stays (and keeps its identity).
         el.items = [{ title: 'Pro again', content: button }];
         await new Promise((r) => setTimeout(r, 100));
         const kept = el.querySelector('.slice-feature-list__content slice-button') === button;
         const afterRerender = live();
         window.slice.controller.destroyComponent(el);
         return { shown, kept, withButton, afterRerender, afterDestroy: live() };
      });
      expect(counts.shown).toBe(true);
      expect(counts.kept).toBe(true);
      // The star icon went away with the first render.
      expect(counts.afterRerender).toBe(counts.withButton - 1);
      // The list and the button.
      expect(counts.afterDestroy).toBe(counts.afterRerender - 2);
   });

   test('fast re-renders keep only the last items and leak no icons', async ({ mount, page }) => {
      const c = await mount('FeatureList', { items: ITEMS });
      const result = await page.evaluate(async () => {
         const el = document.querySelector('slice-feature-list');
         const live = () => window.slice.controller.activeComponents.size;
         await new Promise((r) => setTimeout(r, 50));
         const start = live();
         for (let i = 0; i < 5; i++) el.items = [{ icon: 'star', title: `Round ${i}` }, { icon: 'heart', title: 'Two' }];
         await new Promise((r) => setTimeout(r, 300));
         return { start, end: live(), titles: [...el.querySelectorAll('.slice-feature-list__title')].map((t) => t.textContent) };
      });
      expect(result.titles).toEqual(['Round 4', 'Two']);
      // Two icons before (ITEMS has two), two after.
      expect(result.end).toBe(result.start);
      expect(c.pageErrors()).toEqual([]);
   });
});
