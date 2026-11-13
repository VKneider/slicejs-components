import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

const ITEMS = [
   { title: 'Step 1', text: 'A short description.', icon: 'users' },
   { title: 'Step 2', text: 'A short description.', icon: 'book' },
   { title: 'Step 3', text: 'A short description.', icon: 'check-circle' },
];

test.describe('Stepper', () => {
   test('smoke: an ordered list with numbered markers, headings and text', async ({ mount }) => {
      const c = await mount('Stepper', { items: ITEMS });
      expect(c.pageErrors()).toEqual([]);
      await expect(c.component).toHaveClass(/slice-stepper/);
      await expect(c.locator('ol.slice-stepper__list > li')).toHaveCount(3);
      await expect(c.locator('.slice-stepper__marker')).toHaveText(['1', '2', '3']);
      await expect(c.locator('h3.slice-stepper__title')).toHaveText(ITEMS.map((i) => i.title));
      await expect(c.locator('.slice-stepper__text').first()).toHaveText('A short description.');
      await expect(c.locator('.slice-stepper__rail').first()).toHaveAttribute('aria-hidden', 'true');
   });

   test('start continues the numbering, in the markers and in the list itself', async ({ mount }) => {
      const c = await mount('Stepper', { items: ITEMS, start: 4 });
      await expect(c.locator('.slice-stepper__marker')).toHaveText(['4', '5', '6']);
      await expect(c.locator('ol')).toHaveAttribute('start', '4');
      await c.component.evaluate((el) => { el.start = 1; });
      await expect(c.locator('ol')).not.toHaveAttribute('start', /.*/);
   });

   test('marker: icon shows icons (number where one is missing), dot shows neither', async ({ mount }) => {
      const c = await mount('Stepper', { items: [...ITEMS, { title: 'Without icon' }], marker: 'icon' });
      await expect(c.locator('.slice-stepper__marker slice-icon')).toHaveCount(3);
      await expect(c.locator('.slice-stepper__marker').nth(3)).toHaveText('4');
      await c.component.evaluate((el) => { el.marker = 'dot'; });
      await expect(c.locator('.slice-stepper__marker slice-icon')).toHaveCount(0);
      await expect(c.locator('.slice-stepper__marker').first()).toHaveText('');
      await expect(c.component).toHaveAttribute('data-marker', 'dot');
   });

   test('horizontal where there is room, vertical when the container is narrow', async ({ mount, page }) => {
      await page.setViewportSize({ width: 1100, height: 800 });
      const c = await mount('Stepper', { items: ITEMS, orientation: 'horizontal' });
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
      const c = await mount('Stepper', { items: ITEMS });
      const lines = () => c.locator('.slice-stepper__rail').evaluateAll((rails) => rails.map((r) => getComputedStyle(r, '::after').content));
      expect(await lines()).toEqual(['""', '""', 'none']);
      await c.component.evaluate((el) => { el.connector = false; });
      expect(await lines()).toEqual(['none', 'none', 'none']);
   });

   test('looks reflect; unknown values fall back; headingLevel', async ({ mount }) => {
      const c = await mount('Stepper', { items: ITEMS, headingLevel: 2 });
      await expect(c.locator('h2.slice-stepper__title')).toHaveCount(3);
      for (const [prop, value] of [['variant', 'filled'], ['variant', 'outlined'], ['tone', 'success'], ['size', 'sm']]) {
         await c.component.evaluate((el, [p, v]) => { el[p] = v; }, [prop, value]);
         await expect(c.component).toHaveAttribute(`data-${prop}`, value);
      }
      await c.component.evaluate((el) => { el.orientation = 'diagonal'; el.marker = 'emoji'; });
      await expect(c.component).toHaveAttribute('data-orientation', 'vertical');
      await expect(c.component).toHaveAttribute('data-marker', 'number');
   });

   test('content nodes and icons are destroyed with it', async ({ mount, page }) => {
      await mount('Stepper', { items: ITEMS, marker: 'icon' });
      const counts = await page.evaluate(async () => {
         const el = document.querySelector('slice-stepper');
         const live = () => window.slice.controller.activeComponents.size;
         const code = await window.slice.build('Button', { value: 'Copy command' });
         el.items = [{ title: 'Install', icon: 'download', content: code }];
         await new Promise((r) => setTimeout(r, 150));
         const shown = live();
         window.slice.controller.destroyComponent(el);
         return { shown, afterDestroy: live() };
      });
      // Stepper, its one icon and the button.
      expect(counts.afterDestroy).toBe(counts.shown - 3);
   });
});

test('interactive navigation has one current step, real buttons, callbacks and linear gating', async ({ mount }) => {
   const c = await mount('Stepper', { mode: 'interactive', active: 'address', linear: true, items: [
      { id: 'cart', title: 'Cart', status: 'done' }, { id: 'address', title: 'Address' }, { id: 'payment', title: 'Payment' },
   ] }, { spies: ['onChange'] });
   await expect(c.locator('[aria-current="step"]')).toHaveCount(1);
   await expect(c.component.getByRole('button', { name: 'Payment', exact: true })).toBeDisabled();
   await c.component.getByRole('button', { name: 'Cart', exact: true }).click();
   expect((await c.eventArgs('onChange'))[0][0]).toBe('cart');
   await c.component.evaluate(el => { el.items = el.items.map(item => ({ ...item, status: item.id === 'cart' || item.id === 'address' ? 'done' : 'upcoming' })); });
   await expect(c.component.getByRole('button', { name: 'Payment', exact: true })).toBeEnabled();
   await c.component.getByRole('button', { name: 'Payment', exact: true }).click();
   await expect(c.locator('[aria-current="step"]')).toHaveAttribute('data-id', 'payment');
   expect(c.pageErrors()).toEqual([]);
});

test('arrow keys move focus, Enter activates, disabled steps are skipped, Home and End work', async ({ mount, page }) => {
   const c = await mount('Stepper', { mode: 'interactive', items: [
      { id: 'a', title: 'Contact' }, { id: 'b', title: 'Delivery', disabled: true }, { id: 'c', title: 'Review' },
   ] });
   await c.component.getByRole('button', { name: 'Contact', exact: true }).focus();
   await page.keyboard.press('ArrowRight');
   await expect(c.component.getByRole('button', { name: 'Review', exact: true })).toBeFocused();
   await expect(c.locator('[aria-current="step"]')).toHaveAttribute('data-id', 'a');
   await page.keyboard.press('Enter');
   await expect(c.locator('[aria-current="step"]')).toHaveAttribute('data-id', 'c');
   await page.keyboard.press('Home');
   await expect(c.component.getByRole('button', { name: 'Contact', exact: true })).toBeFocused();
   await page.keyboard.press('End');
   await expect(c.component.getByRole('button', { name: 'Review', exact: true })).toBeFocused();
});

test('mode and active update in place; keyed content survives items updates; static has no controls', async ({ mount, page }) => {
   const c = await mount('Stepper', { items: [{ id: 'a', title: 'Contact' }, { id: 'b', title: 'Review' }] });
   await expect(c.component.getByRole('button')).toHaveCount(0);
   await c.component.evaluate(async el => {
      const field = document.createElement('input'); field.value = 'Keep my draft';
      el.items = [{ id: 'a', title: 'Contact', content: field }, { id: 'b', title: 'Review' }];
      await el.update(); window.savedField = field;
      el.mode = 'interactive'; await el.update();
      el.active = 'b';
   });
   await expect(c.locator('[aria-current="step"]')).toHaveAttribute('data-id', 'b');
   await c.component.evaluate(async el => { el.items = el.items.map(item => ({ ...item, text: 'Updated elsewhere' })); await el.update(); });
   expect(await page.evaluate(() => savedField.isConnected && savedField.value === 'Keep my draft')).toBe(true);
   await c.component.evaluate(el => { el.mode = 'static'; });
   await expect(c.locator('[aria-current]')).toHaveCount(0);
   await expect(c.component.getByRole('button')).toHaveCount(0);
});
