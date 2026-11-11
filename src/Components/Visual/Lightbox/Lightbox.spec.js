import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

// Lightbox contract:
//   - a native modal <dialog> named "Image viewer"; count "2 / 3"; the image's
//     alt and caption; Previous / Next disabled at the ends unless `loop`
//   - keys ← → Home End; Escape zooms out first, then closes; focus goes back
//   - thumbnails with aria-current; onChange(index, item)
//   - attach(container) turns a gallery of links into triggers
//   - the page's scroll is locked while open and released on close / destroy

const pic = (fill, w = 800, h = 600) =>
   `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${fill}"/></svg>`)}`;
const ITEMS = [
   { src: pic('#c0392b'), alt: 'Example image 1', caption: 'Description 1' },
   { src: pic('#2980b9'), alt: 'Example image 2', caption: 'Description 2' },
   { src: pic('#27ae60'), alt: 'Example image 3' },
];

const dialog = (c) => c.component.locator('dialog.slice-lightbox');

test.describe('Lightbox', () => {
   test('open(i): a named modal dialog with the count, the image, its alt and caption', async ({ mount }) => {
      const c = await mount('Lightbox', { items: ITEMS });
      await expect(dialog(c)).not.toBeVisible();
      await c.component.evaluate((el) => el.open(1));
      await expect(dialog(c)).toBeVisible();
      expect(await dialog(c).evaluate((d) => d.matches(':modal'))).toBe(true);
      await expect(dialog(c)).toHaveAttribute('aria-label', 'Image viewer');
      await expect(c.locator('.slice-lightbox__count')).toHaveText('2 / 3');
      await expect(c.locator('.slice-lightbox__img')).toHaveAttribute('alt', 'Example image 2');
      await expect(c.locator('.slice-lightbox__caption')).toHaveText('Description 2');
      expect(c.pageErrors()).toEqual([]);
   });

   test('Previous / Next: disabled at the ends; loop wraps around', async ({ mount }) => {
      const c = await mount('Lightbox', { items: ITEMS });
      await c.component.evaluate((el) => el.open(0));
      const prev = c.component.getByRole('button', { name: 'Previous image' });
      const next = c.component.getByRole('button', { name: 'Next image' });
      await expect(prev).toBeDisabled();
      await next.click();
      await next.click();
      await expect(c.locator('.slice-lightbox__count')).toHaveText('3 / 3');
      await expect(next).toBeDisabled();
      await expect(c.locator('.slice-lightbox__caption')).toBeHidden();
      await c.component.evaluate((el) => { el.loop = true; });
      await next.click();
      await expect(c.locator('.slice-lightbox__count')).toHaveText('1 / 3');
   });

   test('keyboard: → ← End Home; Escape closes and gives focus back', async ({ mount, page }) => {
      const c = await mount('Lightbox', { items: ITEMS }, { spies: ['onClose'] });
      await page.evaluate(() => {
         const b = document.createElement('button');
         b.id = 'opener';
         b.textContent = 'Open';
         document.querySelector('[data-test-root]').append(b);
         b.addEventListener('click', () => document.querySelector('slice-lightbox').open(0));
      });
      await page.locator('#opener').click();
      const count = c.locator('.slice-lightbox__count');
      await page.keyboard.press('ArrowRight');
      await expect(count).toHaveText('2 / 3');
      await page.keyboard.press('End');
      await expect(count).toHaveText('3 / 3');
      await page.keyboard.press('ArrowLeft');
      await expect(count).toHaveText('2 / 3');
      await page.keyboard.press('Home');
      await expect(count).toHaveText('1 / 3');
      expect(await page.evaluate(() => document.body.style.position)).toBe('fixed');
      await page.keyboard.press('Escape');
      await expect(dialog(c)).not.toBeVisible();
      await expect(page.locator('#opener')).toBeFocused();
      expect(await page.evaluate(() => document.body.style.position)).toBe('');
      await expect.poll(() => c.events('onClose')).toBe(1);
   });

   test('zoom: the button and a click on the picture; Escape zooms out before closing', async ({ mount, page }) => {
      const c = await mount('Lightbox', { items: ITEMS });
      await c.component.evaluate((el) => el.open(0));
      const zoom = c.component.getByRole('button', { name: 'Zoom in' });
      await zoom.click();
      await expect(c.component.getByRole('button', { name: 'Zoom out' })).toHaveAttribute('aria-pressed', 'true');
      await expect(dialog(c)).toHaveClass(/is-zoomed/);
      await page.keyboard.press('Escape');
      await expect(dialog(c)).not.toHaveClass(/is-zoomed/);
      await expect(dialog(c)).toBeVisible();

      // One click zooms in; another click zooms out.
      await c.locator('.slice-lightbox__img').click();
      await expect(dialog(c)).toHaveClass(/is-zoomed/);
      await c.locator('.slice-lightbox__img').click();
      await expect(dialog(c)).not.toHaveClass(/is-zoomed/);

      // A double click still counts as one zoom, not zoom in + zoom out.
      await c.locator('.slice-lightbox__img').dblclick();
      await expect(dialog(c)).toHaveClass(/is-zoomed/);

      await page.keyboard.press('0');
      await expect(dialog(c)).not.toHaveClass(/is-zoomed/);
   });

   test('thumbnails: one per image, the current one marked; a click jumps and reports', async ({ mount }) => {
      const c = await mount('Lightbox', { items: ITEMS }, { spies: ['onChange'] });
      await c.component.evaluate((el) => el.open(0));
      const thumbs = c.locator('.slice-lightbox__thumb');
      await expect(thumbs).toHaveCount(3);
      await expect(thumbs.nth(0)).toHaveAttribute('aria-current', 'true');
      await expect(thumbs.nth(2)).toHaveAttribute('aria-label', 'Image 3: Example image 3');
      await thumbs.nth(2).click();
      await expect(thumbs.nth(2)).toHaveAttribute('aria-current', 'true');
      await expect.poll(() => c.events('onChange')).toBe(1);
      expect((await c.eventArgs('onChange'))[0][0]).toBe(2);
      await c.component.evaluate((el) => { el.thumbnails = false; });
      await expect(c.locator('.slice-lightbox__thumbs')).toBeHidden();
   });

   test('swipe left moves to the next image; a click on the dark area closes', async ({ mount, page }) => {
      const c = await mount('Lightbox', { items: ITEMS });
      await c.component.evaluate((el) => el.open(0));
      const box = await c.locator('.slice-lightbox__img').boundingBox();
      await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.4, box.y + box.height / 2, { steps: 6 });
      await page.mouse.up();
      await expect(c.locator('.slice-lightbox__count')).toHaveText('2 / 3');
      await expect(dialog(c)).toBeVisible();
      const stage = await c.locator('.slice-lightbox__stage').boundingBox();
      const img = await c.locator(".slice-lightbox__img").boundingBox();
      await page.mouse.click((stage.x + img.x) / 2 + 30, stage.y + 40);   // beside the picture
      await expect(dialog(c)).not.toBeVisible();
   });

   test('attach(gallery): links open the viewer at their image, read from the page', async ({ mount, page }) => {
      const c = await mount('Lightbox');
      const out = await page.evaluate(async ([a, b]) => {
         const gallery = document.createElement('div');
         gallery.id = 'gallery';
         gallery.innerHTML = `
            <figure><a href="${a}"><img src="${a}" alt="Front"></a><figcaption>The cover</figcaption></figure>
            <figure><a href="${b}" data-caption="Inside pages"><img src="${b}" alt="Pages"></a></figure>`;
         document.querySelector('[data-test-root]').append(gallery);
         window.__detach = document.querySelector('slice-lightbox').attach(gallery);
         return true;
      }, [ITEMS[0].src, ITEMS[1].src]);
      expect(out).toBe(true);
      await page.locator('#gallery a').nth(1).click();
      await expect(dialog(c)).toBeVisible();
      await expect(c.locator('.slice-lightbox__count')).toHaveText('2 / 2');
      await expect(c.locator('.slice-lightbox__img')).toHaveAttribute('alt', 'Pages');
      await expect(c.locator('.slice-lightbox__caption')).toHaveText('Inside pages');
      await page.keyboard.press('ArrowLeft');
      await expect(c.locator('.slice-lightbox__caption')).toHaveText('The cover');
      await page.keyboard.press('Escape');
      await page.evaluate(() => window.__detach());
      const opened = await page.evaluate(() => {
         const link = document.querySelector('#gallery a');
         const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
         link.dispatchEvent(event);
         return document.querySelector('slice-lightbox dialog').open;
      });
      expect(opened).toBe(false);
   });

   test('a broken image says so', async ({ mount }) => {
      const c = await mount('Lightbox', { items: [{ src: '/no-such-image.png', alt: 'Missing' }] });
      await c.component.evaluate((el) => el.open());
      await expect(c.locator('.slice-lightbox__error')).toHaveText('This image could not be loaded.');
      await expect(c.locator('.slice-lightbox__error')).toBeVisible();
      // A single image: no count, no arrows, no thumbnails.
      await expect(c.locator('.slice-lightbox__count')).toHaveText('');
      await expect(c.locator('.slice-lightbox__nav--next')).toBeHidden();
      await expect(c.locator('.slice-lightbox__thumbs')).toBeHidden();
   });

   test('destroyed while open: the page scrolls again', async ({ mount, page }) => {
      const c = await mount('Lightbox', { items: ITEMS, sliceId: 'lb-destroy' });
      await c.component.evaluate((el) => el.open(0));
      expect(await page.evaluate(() => document.body.style.position)).toBe('fixed');
      await page.evaluate(() => slice.controller.destroyComponent('lb-destroy'));
      expect(await page.evaluate(() => document.body.style.position)).toBe('');
   });

   test('built-in texts can be replaced with `texts`', async ({ mount }) => {
      const c = await mount('Lightbox', { items: ITEMS, texts: { label: 'Galería', next: 'Siguiente', count: '{index} de {total}' } });
      await c.component.evaluate((el) => el.open(0));
      await expect(dialog(c)).toHaveAttribute('aria-label', 'Galería');
      await expect(c.component.getByRole('button', { name: 'Siguiente' })).toBeVisible();
      await expect(c.locator('.slice-lightbox__count')).toHaveText('1 de 3');
   });
});
