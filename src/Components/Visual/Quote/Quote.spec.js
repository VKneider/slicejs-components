import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

test.describe('Quote', () => {
   test('smoke: a figure with blockquote and figcaption', async ({ mount }) => {
      const c = await mount('Quote', { text: 'Example quote text.', author: 'Author 1', jobTitle: 'Role 1', organization: 'Company 1' });
      expect(c.pageErrors()).toEqual([]);
      await expect(c.component).toHaveClass(/slice-quote/);
      await expect(c.locator('figure > blockquote p')).toHaveText('Example quote text.');
      await expect(c.locator('figcaption .slice-quote__author')).toHaveText('Author 1');
      await expect(c.locator('figcaption .slice-quote__meta')).toHaveText('Role 1, Company 1');
      await expect(c.locator('.slice-quote__mark')).toHaveAttribute('aria-hidden', 'true');
      await expect(c.locator('.slice-quote__rating')).toBeHidden();
   });

   test('several paragraphs; text is never markup', async ({ mount }) => {
      const c = await mount('Quote', { text: ['<b>First</b>', 'Second'] });
      await expect(c.locator('blockquote p')).toHaveText(['<b>First</b>', 'Second']);
      await expect(c.locator('blockquote b')).toHaveCount(0);
      await expect(c.locator('figcaption')).toBeHidden();
   });

   test('rating: one accessible name, five decorative stars, halves', async ({ mount }) => {
      const c = await mount('Quote', { text: 'x', rating: 4.5 });
      const rating = c.locator('.slice-quote__rating');
      await expect(rating).toHaveAttribute('role', 'img');
      await expect(rating).toHaveAttribute('aria-label', 'Rated 4.5 out of 5');
      await expect(c.locator('.slice-quote__star')).toHaveCount(5);
      expect(await c.locator('.slice-quote__star').evaluateAll((s) => s.map((e) => e.dataset.fill))).toEqual(['full', 'full', 'full', 'full', 'half']);
      await c.component.evaluate((el) => { el.texts = { rating: '{rating}/{max} estrellas' }; el.rating = 9; });
      await expect(rating).toHaveAttribute('aria-label', '5/5 estrellas');
      await c.component.evaluate((el) => { el.rating = 0; });
      await expect(rating).toBeHidden();
   });

   test('avatar: an image or initials, hidden from screen readers (the name is next to it)', async ({ mount }) => {
      const c = await mount('Quote', { text: 'x', author: 'Author 1', avatar: true });
      await expect(c.locator('.slice-quote__avatar slice-avatar')).toHaveCount(1);
      await expect(c.locator('slice-avatar')).toHaveAttribute('aria-hidden', 'true');
      await c.component.evaluate((el) => { el.avatar = ''; });
      await expect(c.locator('.slice-quote__avatar')).toBeHidden();
      await expect(c.locator('slice-avatar')).toHaveCount(0);
   });

   test('source and href: a cited link; external opens in a new tab', async ({ mount }) => {
      const c = await mount('Quote', { text: 'x', author: 'Author 1', source: 'Source 1', href: 'https://example.com/source' });
      await expect(c.locator('blockquote')).toHaveAttribute('cite', 'https://example.com/source');
      const link = c.locator('cite a');
      await expect(link).toHaveText('Source 1');
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
   });

   test('looks reflect; unknown values fall back; mark can be removed', async ({ mount }) => {
      const c = await mount('Quote', { text: 'x' });
      for (const [prop, value] of [['variant', 'soft'], ['variant', 'outlined'], ['size', 'lg'], ['align', 'center'], ['tone', 'info']]) {
         await c.component.evaluate((el, [p, v]) => { el[p] = v; }, [prop, value]);
         await expect(c.component).toHaveAttribute(`data-${prop}`, value);
      }
      await c.component.evaluate((el) => { el.variant = 'neon'; el.mark = false; });
      await expect(c.component).toHaveAttribute('data-variant', 'plain');
      await expect(c.locator('.slice-quote__mark')).toBeHidden();
   });

   test('destroying it destroys its avatar', async ({ mount, page }) => {
      await mount('Quote', { text: 'x', author: 'Author 1', avatar: true });
      const counts = await page.evaluate(async () => {
         await new Promise((r) => setTimeout(r, 100));
         const live = () => window.slice.controller.activeComponents.size;
         const before = live();
         window.slice.controller.destroyComponent(document.querySelector('slice-quote'));
         return { before, after: live() };
      });
      expect(counts.after).toBe(counts.before - 2);
   });
});
