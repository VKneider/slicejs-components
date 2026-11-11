import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

test.describe('SectionHeader', () => {
   test('smoke: eyebrow, an h2 title and the description', async ({ mount }) => {
      const c = await mount('SectionHeader', {
         eyebrow: 'Services',
         title: 'What I can help you with',
         description: 'Architecture reviews and training.',
      });
      expect(c.pageErrors()).toEqual([]);
      await expect(c.component).toHaveClass(/slice-section-header/);
      await expect(c.locator('h2.slice-section-header__title')).toHaveText('What I can help you with');
      await expect(c.locator('.slice-section-header__eyebrow')).toHaveText('Services');
      await expect(c.locator('.slice-section-header__description')).toHaveText('Architecture reviews and training.');
      await expect(c.locator('.slice-section-header__actions')).toBeHidden();
   });

   test('the heading comes before the eyebrow in the DOM, the eyebrow is drawn above', async ({ mount }) => {
      const c = await mount('SectionHeader', { eyebrow: 'Pricing', title: 'Plans' });
      const order = await c.locator('.slice-section-header__text').evaluate((box) => {
         const children = [...box.children].filter((n) => !n.hidden).map((n) => n.className);
         const eyebrow = box.querySelector('.slice-section-header__eyebrow').getBoundingClientRect().top;
         const title = box.querySelector('.slice-section-header__title').getBoundingClientRect().top;
         return { children, eyebrowAbove: eyebrow < title };
      });
      expect(order.children).toEqual(['slice-section-header__title', 'slice-section-header__eyebrow']);
      expect(order.eyebrowAbove).toBe(true);
   });

   test('headingLevel swaps the element and keeps the text; anchor sets its id', async ({ mount }) => {
      const c = await mount('SectionHeader', { title: 'Projects', headingLevel: 3, anchor: '#projects' });
      await expect(c.locator('h3.slice-section-header__title')).toHaveText('Projects');
      await expect(c.locator('h3')).toHaveAttribute('id', 'projects');
      await c.component.evaluate((el) => { el.headingLevel = 1; });
      await expect(c.locator('h1.slice-section-header__title')).toHaveText('Projects');
      await expect(c.locator('h3')).toHaveCount(0);
      await c.component.evaluate((el) => { el.headingLevel = 0; el.anchor = ''; });
      await expect(c.locator('h2')).not.toHaveAttribute('id', /.*/);
   });

   test('actions: buttons (first filled, the rest outlined) and links through the router', async ({ mount, page }) => {
      const c = await mount('SectionHeader', { title: 'Section' });
      await c.component.evaluate((el) => {
         el.dataset.log = '';
         el.actions = [
            { label: 'Action 1', onClick: () => { el.dataset.log += 'action1;'; } },
            { label: 'Action 2', onClick: () => { el.dataset.log += 'action2;'; } },
            { label: 'View all', href: '/__test?section' },
         ];
      });
      await expect(c.locator('slice-button')).toHaveCount(2);
      await expect(c.locator('a.slice-section-header__link')).toHaveText('View all');
      await expect(c.locator('a.slice-section-header__link')).toHaveAttribute('href', '/__test?section');
      await c.locator('slice-button').filter({ hasText: 'Action 1' }).locator('button, .slice_button, div').first().click();
      await expect.poll(() => c.component.evaluate((el) => el.dataset.log)).toBe('action1;');

      const calls = await page.evaluate(() => {
         const seen = [];
         const original = window.slice.router.navigate.bind(window.slice.router);
         window.slice.router.navigate = (p) => { seen.push(p); return Promise.resolve(); };
         document.querySelector('a.slice-section-header__link').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
         window.slice.router.navigate = original;
         return seen;
      });
      expect(calls).toEqual(['/__test?section']);
   });

   test('replacing actions destroys the old buttons; destroy cleans up', async ({ mount, page }) => {
      await mount('SectionHeader', { title: 'x' });
      const counts = await page.evaluate(async () => {
         const el = document.querySelector('slice-section-header');
         const live = () => window.slice.controller.activeComponents.size;
         const base = live();
         el.actions = [{ label: 'A', onClick() {} }, { label: 'B', onClick() {} }];
         await new Promise((r) => setTimeout(r, 150));
         const two = live();
         el.actions = [{ label: 'C', onClick() {} }];
         await new Promise((r) => setTimeout(r, 150));
         const one = live();
         window.slice.controller.destroyComponent(el);
         return { base, two, one, end: live() };
      });
      expect(counts.two - counts.base).toBeGreaterThanOrEqual(2);
      expect(counts.one).toBeLessThan(counts.two);
      expect(counts.end).toBe(counts.base - 1);
   });

   test('align, size, tone and divider reflect; unknown values fall back', async ({ mount }) => {
      const c = await mount('SectionHeader', { title: 'x' });
      for (const [prop, value] of [['align', 'center'], ['size', 'lg'], ['size', 'sm'], ['tone', 'success']]) {
         await c.component.evaluate((el, [p, v]) => { el[p] = v; }, [prop, value]);
         await expect(c.component).toHaveAttribute(`data-${prop}`, value);
      }
      await c.component.evaluate((el) => { el.divider = true; });
      await expect(c.component).toHaveClass(/has-divider/);
      await c.component.evaluate((el) => { el.titleStyle = 'underline'; });
      await expect(c.component).toHaveAttribute('data-title-style', 'underline');
      await c.component.evaluate((el) => { el.titleStyle = 'rule'; });
      await expect(c.component).toHaveAttribute('data-title-style', 'rule');
      await c.component.evaluate((el) => { el.titleStyle = 'neon'; });
      await expect(c.component).toHaveAttribute('data-title-style', 'plain');
      await c.component.evaluate((el) => { el.align = 'right'; el.size = 'xl'; });
      await expect(c.component).toHaveAttribute('data-align', 'start');
      await expect(c.component).toHaveAttribute('data-size', 'md');
   });
});
