import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

const box = (c) => c.locator('.slice-callout__box');

test.describe('Callout', () => {
   test('smoke: a soft info note with title, text and the tone icon', async ({ mount }) => {
      const c = await mount('Callout', { title: 'Note', text: 'A short note for this example.' });
      expect(c.pageErrors()).toEqual([]);
      await expect(c.component).toHaveClass(/slice-callout/);
      await expect(c.component).toHaveAttribute('data-tone', 'info');
      await expect(c.component).toHaveAttribute('data-variant', 'soft');
      await expect(c.locator('.slice-callout__title')).toHaveText('Note');
      await expect(c.locator('.slice-callout__text')).toHaveText('A short note for this example.');
      await expect(c.locator('.slice-callout__icon slice-icon')).toHaveCount(1);
   });

   test('a11y: role=note named by its title; never a live region', async ({ mount }) => {
      const c = await mount('Callout', { tone: 'danger', title: 'Caution', text: 'This cannot be undone.' });
      await expect(box(c)).toHaveAttribute('role', 'note');
      await expect(box(c)).not.toHaveAttribute('aria-live', /.*/);
      const titleId = await c.locator('.slice-callout__title').getAttribute('id');
      await expect(box(c)).toHaveAttribute('aria-labelledby', titleId);
      await c.component.evaluate((el) => { el.title = ''; });
      await expect(box(c)).not.toHaveAttribute('aria-labelledby', /.*/);
      await expect(c.locator('.slice-callout__icon')).toHaveAttribute('aria-hidden', 'true');
   });

   test('two callouts get different title ids', async ({ mount, page }) => {
      await mount('Callout', { title: 'One' });
      const ids = await page.evaluate(async () => {
         const second = await window.slice.build('Callout', { title: 'Two' });
         document.querySelector('[data-test-root]').append(second);
         return [...document.querySelectorAll('.slice-callout__title')].map((t) => t.id);
      });
      expect(new Set(ids).size).toBe(ids.length);
   });

   test('tone, variant and size reflect; unknown values fall back', async ({ mount }) => {
      const c = await mount('Callout', { text: 'x' });
      for (const tone of ['neutral', 'accent', 'info', 'success', 'warning', 'danger']) {
         await c.component.evaluate((el, t) => { el.tone = t; }, tone);
         await expect(c.component).toHaveAttribute('data-tone', tone);
      }
      for (const variant of ['soft', 'outlined', 'ghost']) {
         await c.component.evaluate((el, v) => { el.variant = v; }, variant);
         await expect(c.component).toHaveAttribute('data-variant', variant);
      }
      await c.component.evaluate((el) => { el.tone = 'loud'; el.variant = 'neon'; el.size = 'xl'; });
      await expect(c.component).toHaveAttribute('data-tone', 'info');
      await expect(c.component).toHaveAttribute('data-variant', 'soft');
      await expect(c.component).toHaveAttribute('data-size', 'md');
   });

   test('icon: the tone gives one, a name or { name } replaces it, false removes it; neutral has none', async ({ mount }) => {
      const c = await mount('Callout', { tone: 'neutral', text: 'x' });
      await expect(c.locator('.slice-callout__icon')).toBeHidden();
      await c.component.evaluate((el) => { el.icon = { name: 'lightbulb' }; });
      await expect(c.locator('.slice-callout__icon slice-icon')).toHaveCount(1);
      await expect(c.locator('.slice-callout__icon')).toBeVisible();
      await c.component.evaluate((el) => { el.icon = false; });
      await expect(c.locator('.slice-callout__icon')).toBeHidden();
      await c.component.evaluate((el) => { el.icon = ''; el.tone = 'warning'; });
      await expect(c.locator('.slice-callout__icon')).toBeVisible();
      await expect(c.locator('.slice-callout__icon slice-icon')).toHaveCount(1);
   });

   test('content: strings become paragraphs (never markup), nodes go as they are', async ({ mount }) => {
      const c = await mount('Callout', { title: 'Before you start' });
      await c.component.evaluate((el) => {
         const link = document.createElement('a');
         link.href = '/guide';
         link.textContent = 'Read the guide';
         el.content = ['<b>not bold</b>', link];
      });
      await expect(c.locator('.slice-callout__content p')).toHaveText('<b>not bold</b>');
      await expect(c.locator('.slice-callout__content b')).toHaveCount(0);
      await expect(c.locator('.slice-callout__content a')).toHaveText('Read the guide');
      await c.component.evaluate((el) => { el.content = null; });
      await expect(c.locator('.slice-callout__content')).toBeHidden();
   });

   test('a component in content is destroyed with it, and when replaced', async ({ mount, page }) => {
      const c = await mount('Callout', { title: 'x' });
      const counts = await page.evaluate(async () => {
         const el = document.querySelector('slice-callout');
         const live = () => window.slice.controller.activeComponents.size;
         const button = await window.slice.build('Button', { value: 'Open' });
         const before = live();
         el.content = button;
         el.content = 'plain';
         const afterReplace = live();
         const other = await window.slice.build('Button', { value: 'Again' });
         el.content = other;
         const withOther = live();
         window.slice.controller.destroyComponent(el);
         return { before, afterReplace, withOther, afterDestroy: live() };
      });
      expect(counts.afterReplace).toBe(counts.before - 1);
      expect(counts.withOther).toBe(counts.afterReplace + 1);
      // The callout, its icon and the button are gone.
      expect(counts.afterDestroy).toBe(counts.withOther - 3);
      expect(c.pageErrors()).toEqual([]);
   });
});
