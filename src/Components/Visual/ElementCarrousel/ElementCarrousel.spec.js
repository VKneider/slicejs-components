import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

// ElementCarrousel contract (the native-scroll rewrite):
//   - host: role="region", aria-roledescription="carousel", aria-label (`label`
//     or the built-in "Carousel"); the track is the keyboard target (tabindex 0)
//   - each element is an <li.slice-element-carrousel__slide> with role="group",
//     aria-roledescription="slide" and "1 of 3"; slides out of view are inert
//   - Previous / Next are Buttons, disabled at the ends unless `loop`
//   - indicators: dots (a Pagination), a "2 / 3" count, or thumbnails
//   - keyboard: ← → Home End; onChange(index, { previous }) and `slide-change`
//   - autoplay with a pause button, held while hovered or focused
//   - slides own their components: dropped ones are destroyed, kept ones are not

const ITEMS = ['One', 'Two', 'Three'];
const index = (c) => c.component.evaluate((el) => el.index);
const slides = (c) => c.locator('.slice-element-carrousel__slide');

test.describe('ElementCarrousel', () => {
   test('smoke: one slide per element, strings as text', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { elements: ITEMS });
      expect(c.pageErrors()).toEqual([]);
      await expect(c.locator('.slice-element-carrousel__track')).toBeAttached();
      await expect(slides(c)).toHaveCount(3);
      await expect(slides(c).nth(0)).toHaveText('One');
      expect(await index(c)).toBe(0);
   });

   test('a11y: a labelled carousel region of labelled slides', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { elements: ITEMS });
      await expect(c.component).toHaveAttribute('role', 'region');
      await expect(c.component).toHaveAttribute('aria-roledescription', 'carousel');
      await expect(c.component).toHaveAttribute('aria-label', 'Carousel');
      await expect(c.locator('.slice-element-carrousel__track')).toHaveAttribute('tabindex', '0');
      await expect(slides(c).nth(1)).toHaveAttribute('role', 'group');
      await expect(slides(c).nth(1)).toHaveAttribute('aria-roledescription', 'slide');
      await expect(slides(c).nth(1)).toHaveAttribute('aria-label', '2 of 3');
      await c.component.evaluate((el) => { el.label = 'Featured products'; });
      await expect(c.component).toHaveAttribute('aria-label', 'Featured products');
   });

   test('slides out of view are inert; perView shows several', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { elements: ['A', 'B', 'C', 'D'] });
      await expect.poll(() => slides(c).evaluateAll((s) => s.map((n) => n.inert))).toEqual([false, true, true, true]);
      await c.component.evaluate((el) => { el.perView = 2; });
      await expect.poll(() => slides(c).evaluateAll((s) => s.map((n) => n.inert))).toEqual([false, false, true, true]);
      expect(await c.component.evaluate((el) => el.maxIndex)).toBe(2);
   });

   test('arrows: Buttons with names; Previous disabled at the start; Next moves and reports', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { elements: ITEMS }, { spies: ['onChange'] });
      const prev = c.component.getByRole('button', { name: 'Previous slide' });
      const next = c.component.getByRole('button', { name: 'Next slide' });
      await expect(prev).toBeDisabled();
      await next.click();
      await expect.poll(() => index(c)).toBe(1);
      await expect.poll(() => c.events('onChange')).toBe(1);
      const [[i, meta]] = await c.eventArgs('onChange');
      expect(i).toBe(1);
      expect(meta.previous).toBe(0);
      await expect(c.locator('.slice-element-carrousel__live')).toHaveText('Slide 2 of 3');
      await next.click();
      await expect.poll(() => index(c)).toBe(2);
      await expect(next).toBeDisabled();
   });

   test('loop: Previous from the first goes to the last', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { elements: ITEMS, loop: true });
      const prev = c.component.getByRole('button', { name: 'Previous slide' });
      await expect(prev).toBeEnabled();
      await prev.click();
      await expect.poll(() => index(c)).toBe(2);
   });

   test('dots: one per position; a dot goes to its slide', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { elements: ITEMS });
      const dot = c.component.getByRole('button', { name: 'Go to slide 3' });
      await expect(dot).toBeVisible();
      await dot.click();
      await expect.poll(() => index(c)).toBe(2);
   });

   test('keyboard on the track: → ← End Home', async ({ mount, page }) => {
      const c = await mount('ElementCarrousel', { elements: ITEMS });
      await c.locator('.slice-element-carrousel__track').focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => index(c)).toBe(1);
      await page.keyboard.press('End');
      await expect.poll(() => index(c)).toBe(2);
      await page.keyboard.press('ArrowLeft');
      await expect.poll(() => index(c)).toBe(1);
      await page.keyboard.press('Home');
      await expect.poll(() => index(c)).toBe(0);
   });

   test('indicators: a count, or thumbnails with the current one marked', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { elements: ITEMS, indicators: 'count' });
      await expect(c.locator('.slice-element-carrousel__count')).toHaveText('1 / 3');
      await c.component.evaluate((el) => { el.indicators = 'thumbnails'; });
      const thumbs = c.locator('.slice-element-carrousel__thumb');
      await expect(thumbs).toHaveCount(3);
      await expect(thumbs.nth(0)).toHaveAttribute('aria-current', 'true');
      await thumbs.nth(1).click();
      await expect.poll(() => index(c)).toBe(1);
      await expect(thumbs.nth(1)).toHaveAttribute('aria-current', 'true');
      await expect(thumbs.nth(0)).not.toHaveAttribute('aria-current', /.*/);
   });

   test('autoplay moves by itself, holds while hovered, and the button pauses it', async ({ mount, page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      const c = await mount('ElementCarrousel', { elements: ITEMS, autoplay: 400 });
      await page.mouse.move(0, 0);
      await expect.poll(() => index(c), { timeout: 3000 }).toBeGreaterThan(0);

      await c.locator('.slice-element-carrousel__track').hover();
      expect(await c.component.evaluate((el) => el.playing)).toBe(false);
      await page.mouse.move(0, 0);
      await expect.poll(() => c.component.evaluate((el) => el.playing)).toBe(true);

      await c.component.getByRole('button', { name: 'Pause slides' }).click();
      await page.mouse.move(0, 0);
      await expect(c.component.getByRole('button', { name: 'Play slides' })).toBeVisible();
      const at = await index(c);
      await page.waitForTimeout(900);
      expect(await index(c)).toBe(at);
   });

   test('built-in texts can be replaced with `texts`', async ({ mount }) => {
      const c = await mount('ElementCarrousel', {
         elements: ITEMS,
         texts: { label: 'Carrusel', slide: '{index} de {total}', next: 'Siguiente' },
      });
      await expect(c.component).toHaveAttribute('aria-label', 'Carrusel');
      await expect(slides(c).nth(0)).toHaveAttribute('aria-label', '1 de 3');
      await expect(c.component.getByRole('button', { name: 'Siguiente' })).toBeVisible();
   });

   test('empty elements renders no slides without errors', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { elements: [] });
      await expect(slides(c)).toHaveCount(0);
      await expect(c.component).toHaveClass(/is-empty/);
      expect(c.pageErrors()).toEqual([]);
   });

   test('visual: three-item carousel @visual', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { elements: ITEMS });
      await expect(c.component).toHaveScreenshot('carrousel-three.png');
   });

   test('a Slice component dropped from elements is DESTROYED, not just detached', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { sliceId: 'car-under-test' });

      const out = await c.component.evaluate(async (el) => {
         const badge = await slice.build('Badge', { sliceId: 'car-badge', label: 'hi' });
         const plain = document.createElement('div');
         plain.textContent = 'plain';

         el.elements = [badge, plain];
         const before = slice.controller.activeComponents.has('car-badge');

         // The badge leaves the carousel; the plain node stays.
         el.elements = [plain];

         return {
            before,
            after: slice.controller.activeComponents.has('car-badge'),
            slides: el.slides.length,
         };
      });

      // innerHTML = '' would have left it registered for the life of the page.
      expect(out.before).toBe(true);
      expect(out.after).toBe(false);
      expect(out.slides).toBe(1);
      expect(c.pageErrors()).toEqual([]);
   });

   test('re-rendering the SAME elements does not destroy and rebuild them', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { sliceId: 'car-same' });

      const out = await c.component.evaluate(async (el) => {
         const badge = await slice.build('Badge', { sliceId: 'car-badge-2', label: 'hi' });
         el.elements = [badge];
         el.elements = [badge];

         return {
            stillRegistered: slice.controller.activeComponents.has('car-badge-2'),
            slides: el.slides.length,
         };
      });

      expect(out.stillRegistered).toBe(true);
      expect(out.slides).toBe(1);
   });

   test('destroying the carousel destroys the components it was showing', async ({ mount }) => {
      const c = await mount('ElementCarrousel', { sliceId: 'car-destroy-me' });

      const out = await c.component.evaluate(async (el) => {
         const badge = await slice.build('Badge', { sliceId: 'car-badge-3', label: 'hi' });
         el.elements = [badge];
         const before = slice.controller.activeComponents.has('car-badge-3');

         slice.controller.destroyComponent('car-destroy-me');
         return { before, after: slice.controller.activeComponents.has('car-badge-3') };
      });

      expect(out.before).toBe(true);
      expect(out.after).toBe(false);
   });
});
