import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

// Rating contract:
//   - a fieldset[role=radiogroup] of native radios, one per value ("3 of 5"),
//     named by `label` (legend) or `ariaLabel`
//   - arrows choose (native radio group); click on the chosen star clears when clearable;
//     Backspace / Delete clear; onChange(value | null) and a bubbling `change`
//   - allowHalf: two radios per star, 0.5 steps
//   - readOnly: role="img" with "Rated 4.5 out of 5", no radios
//   - labels: a word per value, in the radio's name and next to the stars with showValue

const radios = (c) => c.component.getByRole('radio');
const value = (c) => c.component.evaluate((el) => el.value);
const fills = (c) => c.locator('.slice-rating__star').evaluateAll((s) => s.map((n) => n.dataset.fill));

test.describe('Rating', () => {
   test('smoke: five radios, nothing chosen', async ({ mount }) => {
      const c = await mount('Rating', { ariaLabel: 'Rate the item' });
      expect(c.pageErrors()).toEqual([]);
      await expect(radios(c)).toHaveCount(5);
      expect(await value(c)).toBe(null);
      expect(await fills(c)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
   });

   test('a11y: a named radiogroup whose radios say "N of max"', async ({ mount }) => {
      const c = await mount('Rating', { label: 'Rate the item', value: 3 });
      await expect(c.component.getByRole('radiogroup', { name: 'Rate the item' })).toBeVisible();
      await expect(c.component.getByRole('radio', { name: '3 of 5' })).toBeChecked();
      await c.component.evaluate((el) => { el.label = ''; el.ariaLabel = 'Your score'; });
      await expect(c.component.getByRole('radiogroup', { name: 'Your score' })).toBeVisible();
   });

   test('a click chooses and reports; value fills the stars', async ({ mount }) => {
      const c = await mount('Rating', { ariaLabel: 'Score' }, { spies: ['onChange'] });
      await c.locator('.slice-rating__star').nth(3).click();
      expect(await value(c)).toBe(4);
      expect(await fills(c)).toEqual(['full', 'full', 'full', 'full', 'empty']);
      await expect.poll(() => c.events('onChange')).toBe(1);
      expect((await c.eventArgs('onChange'))[0][0]).toBe(4);
   });

   test('clicking the chosen star clears it; not when clearable is false', async ({ mount }) => {
      const c = await mount('Rating', { ariaLabel: 'Score', value: 2 }, { spies: ['onChange'] });
      await c.locator('.slice-rating__star').nth(1).click();
      expect(await value(c)).toBe(null);
      await expect(c.component.getByRole('radio', { checked: true })).toHaveCount(0);
      expect((await c.eventArgs('onChange'))[0][0]).toBe(null);
      await c.component.evaluate((el) => { el.clearable = false; el.value = 2; });
      await c.locator('.slice-rating__star').nth(1).click();
      expect(await value(c)).toBe(2);
   });

   test('keyboard: arrows choose, Backspace clears', async ({ mount, page }) => {
      const c = await mount('Rating', { ariaLabel: 'Score', value: 2 });
      await c.component.evaluate((el) => el.focus());
      await page.keyboard.press('ArrowRight');
      expect(await value(c)).toBe(3);
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      expect(await value(c)).toBe(1);
      await page.keyboard.press('Backspace');
      expect(await value(c)).toBe(null);
      await expect(c.locator('.slice-rating__live')).toHaveText('Rating cleared');
   });

   test('allowHalf: two radios per star, a half fills half a star', async ({ mount }) => {
      const c = await mount('Rating', { ariaLabel: 'Score', allowHalf: true, value: 3.4 });
      await expect(radios(c)).toHaveCount(10);
      expect(await value(c)).toBe(3.5);
      expect(await fills(c)).toEqual(['full', 'full', 'full', 'half', 'empty']);
      await expect(c.component.getByRole('radio', { name: '3.5 of 5' })).toBeChecked();
   });

   test('readOnly: an image with the score, no radios', async ({ mount }) => {
      const c = await mount('Rating', { value: 4.5, readOnly: true, allowHalf: true });
      await expect(radios(c)).toHaveCount(0);
      await expect(c.component.getByRole('img', { name: 'Rated 4.5 out of 5' })).toBeVisible();
      expect(await fills(c)).toEqual(['full', 'full', 'full', 'full', 'half']);
      await c.component.evaluate((el) => { el.value = 4.63; });
      await expect(c.component.getByRole('img', { name: 'Rated 4.6 out of 5' })).toBeVisible();
      expect(await c.locator('.slice-rating__star').nth(4).evaluate((n) => n.style.getPropertyValue('--slice-rating-fill'))).toBe('60%');
      await c.component.evaluate((el) => { el.value = null; });
      await expect(c.component.getByRole('img', { name: 'Not rated' })).toBeVisible();
   });

   test('labels name the radios and show next to the stars with showValue', async ({ mount }) => {
      const c = await mount('Rating', {
         ariaLabel: 'Score', value: 4, showValue: true,
         labels: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'],
      });
      await expect(c.component.getByRole('radio', { name: 'Excellent, 5 of 5' })).toBeAttached();
      await expect(c.locator('.slice-rating__value')).toHaveText('4 · Very good');
      await c.locator('.slice-rating__star').nth(1).hover();
      await expect(c.locator('.slice-rating__value')).toHaveText('2 · Fair');
      expect(await fills(c)).toEqual(['full', 'full', 'empty', 'empty', 'empty']);
   });

   test('max, disabled and required', async ({ mount }) => {
      const c = await mount('Rating', { ariaLabel: 'Score', max: 10, value: 12, disabled: true, required: true });
      await expect(radios(c)).toHaveCount(10);
      expect(await value(c)).toBe(10);
      await expect(radios(c).first()).toBeDisabled();
      await expect(c.component.getByRole('radiogroup')).toHaveAttribute('aria-required', 'true');
   });

   test('built-in texts can be replaced with `texts`', async ({ mount }) => {
      const c = await mount('Rating', { ariaLabel: 'Puntaje', texts: { option: '{value} de {max}' } });
      await expect(c.component.getByRole('radio', { name: '2 de 5' })).toBeAttached();
   });

   test('submits with a native form', async ({ mount }) => {
      const c = await mount('Rating', { ariaLabel: 'Score', name: 'stars', value: 4 });
      const sent = await c.component.evaluate((el) => {
         const form = document.createElement('form');
         el.replaceWith(form);
         form.append(el);
         return new FormData(form).get('stars');
      });
      expect(sent).toBe('4');
   });

   test('inside a Form: required blocks submit; the value is a number; clearing empties it', async ({ mount }) => {
      const c = await mount('Form', {
         schema: [{ kind: 'field', name: 'stars', label: 'How was the item?', component: 'Rating', required: true }],
      }, { spies: ['onSubmit'] });
      const rating = c.component.locator('slice-rating');
      await expect(rating.getByRole('radiogroup', { name: 'How was the item?' })).toBeAttached();
      expect(await c.component.evaluate((f) => f.submit())).toBe(false);
      await rating.locator('.slice-rating__star').nth(4).click();
      expect(await c.component.evaluate((f) => f.getValues().stars)).toBe(5);
      expect(await c.component.evaluate((f) => f.submit())).toBe(true);
      await rating.locator('.slice-rating__star').nth(4).click();
      expect(await c.component.evaluate((f) => f.getValues().stars)).toBe(null);
   });
});
