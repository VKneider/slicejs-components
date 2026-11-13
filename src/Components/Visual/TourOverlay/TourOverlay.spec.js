import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

// Intercept the config before the `mount` fixture boots /__test: the harness
// navigates during fixture setup, so routes registered in the test body are too late.
test.beforeEach(async ({ page }) => {
   await page.route('**/sliceConfig.json', async route => {
      const response = await route.fetch(); const config = await response.json();
      config.translator = { enabled: true, defaultLocale: 'en', fallbackLocale: 'en', locales: ['en', 'es'], path: '/locales' };
      await route.fulfill({ response, json: config });
   });
   await page.route('**/locales/*.json', route => route.fulfill({ json: {} }));
});

test('a step change glides the spotlight; animate:false snaps it', async ({ mount, page }) => {
   const c = await mount('TourOverlay', {
      view: { step: { title: 'First' }, index: 0, total: 2, animate: true, duration: 300 },
   });
   await c.component.evaluate(el => {
      el.show();
      el.track({ left: 40, top: 80, right: 120, bottom: 120, width: 80, height: 40, radius: 8 });
   });
   await page.waitForTimeout(400);
   const from = await c.locator('.slice-tour-overlay__spotlight').boundingBox();
   await c.component.evaluate(el => {
      el.view = { ...el.view, step: { title: 'Second' }, index: 1 };
      el.track({ left: 500, top: 300, right: 580, bottom: 340, width: 80, height: 40, radius: 8 }, true);
   });
   await page.waitForTimeout(100);
   const mid = await c.locator('.slice-tour-overlay__spotlight').boundingBox();
   expect(await c.component.evaluate(el => el.querySelector('.slice-tour-overlay').classList.contains('is-gliding'))).toBe(true);
   expect(await c.locator('.slice-tour-overlay__card').evaluate(el => getComputedStyle(el).transitionDuration)).toBe('0.3s');
   await page.waitForTimeout(350);
   const end = await c.locator('.slice-tour-overlay__spotlight').boundingBox();
   expect(await c.component.evaluate(el => el.querySelector('.slice-tour-overlay').classList.contains('is-gliding'))).toBe(false);
   expect(mid.x).toBeGreaterThan(from.x + 10);
   expect(mid.x).toBeLessThan(end.x - 10);
   expect(end.x).toBeCloseTo(500, 0);

   await c.component.evaluate(el => {
      el.view = { ...el.view, animate: false, step: { title: 'Third' }, index: 2 };
      el.track({ left: 40, top: 80, right: 120, bottom: 120, width: 80, height: 40, radius: 8 }, true);
   });
   const snapped = await c.locator('.slice-tour-overlay__spotlight').boundingBox();
   expect(snapped.x).toBeCloseTo(40, 0);
   expect(c.pageErrors()).toEqual([]);
});

test('overlay props, controls, translated texts and reactive view', async ({ mount, page }) => {
   const c = await mount('TourOverlay', {
      view: { step: { title: 'Welcome', content: 'Try the controls.', interactive: true }, index: 1, total: 3 },
   }, { spies: ['onNext', 'onPrev', 'onSkip', 'onClose'] });
   await c.component.evaluate(el => el.show());
   await expect(c.component.getByRole('dialog')).toHaveAccessibleName('Welcome');
   await expect(c.component.getByRole('dialog')).toHaveAccessibleDescription('Try the controls.');
   await c.component.getByRole('button', { name: 'Next', exact: true }).click();
   await c.component.getByRole('button', { name: 'Back', exact: true }).click();
   await c.component.getByRole('button', { name: 'Skip', exact: true }).click();
   await c.component.getByRole('button', { name: 'Close tour', exact: true }).click();
   for (const name of ['onNext', 'onPrev', 'onSkip', 'onClose']) expect(await c.events(name)).toBe(1);
   await page.evaluate(() => slice.translator.setLocale('es'));
   await expect(c.component.getByRole('button', { name: 'Siguiente', exact: true })).toBeVisible();
   await expect(c.locator('.slice-tour-overlay__progress')).toHaveText('2 de 3');
   await c.component.evaluate(el => {
      el.view = { ...el.view, index: 2, texts: { done: 'Finish now', progress: 'Step {index}/{total}' } };
   });
   await expect(c.component.getByRole('button', { name: 'Finish now', exact: true })).toBeVisible();
   await expect(c.locator('.slice-tour-overlay__progress')).toHaveText('Step 3/3');
   expect(c.pageErrors()).toEqual([]);
});
