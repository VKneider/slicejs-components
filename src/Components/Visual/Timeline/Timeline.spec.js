import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

const ITEMS = [
   { id: 'a', date: '2024-03-02', title: 'Event 1', text: 'A short description.', icon: 'rocket', tone: 'success' },
   { id: 'b', date: '2023-09-14', title: 'Event 2', text: 'A short description.' },
   { id: 'c', date: '2023-01-10', title: 'Event 3' },
];

test.describe('Timeline', () => {
   test('smoke: an ordered list of events with <time>, heading and text', async ({ mount }) => {
      const c = await mount('Timeline', { items: ITEMS, locale: 'en-US' });
      expect(c.pageErrors()).toEqual([]);
      await expect(c.component).toHaveClass(/slice-timeline/);
      await expect(c.locator('ol.slice-timeline__list > li')).toHaveCount(3);
      await expect(c.locator('h3.slice-timeline__title')).toHaveText(['Event 1', 'Event 2', 'Event 3']);
      await expect(c.locator('time').first()).toHaveText('Mar 2, 2024');
      expect(await c.locator('time').first().getAttribute('datetime')).toMatch(/^2024-03-0[12]T/);
      await expect(c.locator('li').first()).toHaveAttribute('data-tone', 'success');
      await expect(c.locator('.slice-timeline__rail').first()).toHaveAttribute('aria-hidden', 'true');
   });

   test('dateFormat and dateLabel; a fixed locale writes the dates in it', async ({ mount }) => {
      const c = await mount('Timeline', { items: [{ date: '2024-03-02', title: 'x' }, { date: '2022-01-01', dateLabel: '2019 – 2022', title: 'y' }], locale: 'es', dateFormat: 'month' });
      await expect(c.locator('time')).toHaveText(['marzo de 2024', '2019 – 2022']);
      await c.component.evaluate((el) => { el.dateFormat = 'year'; });
      await expect(c.locator('time').first()).toHaveText('2024');
      await c.component.evaluate((el) => { el.dateFormat = 'none'; });
      await expect(c.locator('time')).toHaveText(['2019 – 2022']);
   });

   test('relative dates carry the full date in their title', async ({ mount, page }) => {
      const c = await mount('Timeline', { items: [], locale: 'en', dateFormat: 'relative' });
      await page.evaluate(() => {
         document.querySelector('slice-timeline').items = [{ date: new Date(Date.now() - 3 * 3600 * 1000), title: 'Event 4' }];
      });
      await expect(c.locator('time')).toHaveText('3 hours ago');
      expect(await c.locator('time').getAttribute('title')).toBeTruthy();
   });

   test('groupBy year: a heading per group, events one level below; sort', async ({ mount }) => {
      const c = await mount('Timeline', { items: ITEMS, groupBy: 'year', sort: 'oldest', locale: 'en' });
      await expect(c.locator('section.slice-timeline__group')).toHaveCount(2);
      await expect(c.locator('h3.slice-timeline__group-title')).toHaveText(['2023', '2024']);
      await expect(c.locator('h4.slice-timeline__title')).toHaveText(['Event 3', 'Event 2', 'Event 1']);
      await c.component.evaluate((el) => { el.sort = 'newest'; });
      await expect(c.locator('h3.slice-timeline__group-title')).toHaveText(['2024', '2023']);
   });

   test('groupBy day says Today and Yesterday', async ({ mount, page }) => {
      const c = await mount('Timeline', { items: [], groupBy: 'day', locale: 'en' });
      await page.evaluate(() => {
         const now = Date.now();
         document.querySelector('slice-timeline').items = [
            { date: new Date(now), title: 'a' },
            { date: new Date(now - 24 * 3600 * 1000), title: 'b' },
         ];
      });
      await expect(c.locator('.slice-timeline__group-title')).toHaveText(['Today', 'Yesterday']);
   });

   test('state: current is aria-current="step", upcoming is marked', async ({ mount }) => {
      const c = await mount('Timeline', {
         items: [
            { title: 'Step 1', state: 'done' },
            { title: 'Step 2', state: 'current' },
            { title: 'Step 3', state: 'upcoming' },
         ],
      });
      await expect(c.locator('li').nth(1)).toHaveAttribute('aria-current', 'step');
      await expect(c.locator('li').nth(2)).toHaveAttribute('data-state', 'upcoming');
      await expect(c.locator('li[aria-current]')).toHaveCount(1);
   });

   test('marker icon: icons where given, a dot where not; layouts reflect', async ({ mount }) => {
      const c = await mount('Timeline', { items: ITEMS, marker: 'icon' });
      await expect(c.locator('.slice-timeline__marker slice-icon')).toHaveCount(1);
      await expect(c.locator('.slice-timeline__marker.has-icon')).toHaveCount(1);
      for (const layout of ['split', 'alternate', 'stacked']) {
         await c.component.evaluate((el, l) => { el.layout = l; }, layout);
         await expect(c.component).toHaveAttribute('data-layout', layout);
      }
      await c.component.evaluate((el) => { el.layout = 'zigzag'; el.tone = 'loud'; });
      await expect(c.component).toHaveAttribute('data-layout', 'stacked');
      await expect(c.component).toHaveAttribute('data-tone', 'accent');
   });

   test('alternate puts events on both sides where there is room, one column when narrow', async ({ mount, page }) => {
      await page.setViewportSize({ width: 1100, height: 900 });
      const c = await mount('Timeline', { items: ITEMS, layout: 'alternate', locale: 'en' });
      const lefts = () => c.locator('.slice-timeline__content').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
      const wide = await lefts();
      expect(new Set(wide).size).toBe(2);
      await c.component.evaluate((el) => { el.style.width = '380px'; });
      const narrow = await lefts();
      expect(new Set(narrow).size).toBe(1);
   });

   test('href: the title is a link through the router', async ({ mount, page }) => {
      const c = await mount('Timeline', { items: [{ title: 'Event 5', href: '/__test?event' }] });
      await expect(c.locator('a.slice-timeline__link')).toHaveAttribute('href', '/__test?event');
      const calls = await page.evaluate(() => {
         const seen = [];
         const original = window.slice.router.navigate.bind(window.slice.router);
         window.slice.router.navigate = (p) => { seen.push(p); return Promise.resolve(); };
         document.querySelector('a.slice-timeline__link').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
         window.slice.router.navigate = original;
         return seen;
      });
      expect(calls).toEqual(['/__test?event']);
   });

   test('content components and icons are destroyed with it', async ({ mount, page }) => {
      await mount('Timeline', { items: [], marker: 'icon' });
      const counts = await page.evaluate(async () => {
         const el = document.querySelector('slice-timeline');
         const live = () => window.slice.controller.activeComponents.size;
         const button = await window.slice.build('Button', { value: 'Action' });
         el.items = [{ title: 'Step 2', icon: 'truck', content: button }];
         await new Promise((r) => setTimeout(r, 150));
         const shown = live();
         window.slice.controller.destroyComponent(el);
         return { shown, end: live() };
      });
      expect(counts.end).toBe(counts.shown - 3);
   });
});
