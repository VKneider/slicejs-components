// Browser tests deliberately use the real Slice runtime: this Service owns an overlay.
import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

async function setup(mount, page) {
   await mount('Button', { value: 'Start tour' });
   await page.evaluate(async () => {
      window.tour = await slice.build('TourService', { singleton: true, sliceId: 'tour-test' });
      const target = document.createElement('button');
      target.id = 'tour-target'; target.textContent = 'Create project';
      target.style.cssText = 'position:absolute;left:100px;top:200px;width:160px;height:44px;border-radius:8px';
      document.body.append(target);
      target.focus();
      window.startTour = (steps, options = {}) => {
         window.result = null;
         window.ended = tour.start(steps, { scrollIntoView: false, ...options });
         ended.then(value => { window.result = value; });
      };
   });
}
const card = page => page.locator('.slice-tour-overlay__card');
const title = page => page.locator('.slice-tour-overlay__title');
const ready = page => expect(card(page)).toHaveAttribute('aria-busy', 'false');

test('modal: target rect, progress, next/back, keyboard trap, Escape and focus return', async ({ mount, page }) => {
   await setup(mount, page);
   await page.evaluate(() => startTour([
      { target: '#tour-target', title: 'Create', content: 'Create your first project.', placement: 'bottom' },
      { target: () => document.querySelector('#tour-target'), title: 'Share' },
   ]));
   await ready(page);
   await expect(card(page)).toHaveAttribute('aria-modal', 'true');
   await expect(page.locator('.slice-tour-overlay__progress')).toHaveText('1 of 2');
   const rect = await page.locator('.slice-tour-overlay__spotlight').boundingBox();
   expect(rect.x).toBeCloseTo(92); expect(rect.width).toBeCloseTo(176);
   await expect(page.locator('#tour-target')).toHaveJSProperty('inert', true);
   await page.keyboard.press('Shift+Tab');
   await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeFocused();
   await page.getByRole('button', { name: 'Next', exact: true }).click();
   await expect(title(page)).toHaveText('Share'); await ready(page);
   await page.getByRole('button', { name: 'Back', exact: true }).click();
   await expect(title(page)).toHaveText('Create'); await ready(page);
   await page.keyboard.press('Escape');
   await expect(card(page)).toHaveCount(0);
   await expect(page.locator('#tour-target')).toBeFocused();
   expect(await page.evaluate(() => result)).toEqual({ completed: false, reason: 'stopped' });
   expect(await page.evaluate(() => document.body.style.position)).toBe('');
});

test('interactive waiting: anchor remains clickable, target appears without stealing focus, then modal returns', async ({ mount, page }) => {
   await setup(mount, page);
   await page.evaluate(() => {
      document.querySelector('#tour-target').onclick = () => {
         const panel = document.createElement('input'); panel.id = 'tour-panel';
         panel.style.cssText = 'position:absolute;top:300px;left:120px';
         document.body.append(panel); panel.focus();
      };
      startTour([
         { target: '#tour-panel', anchor: '#tour-target', waitFor: '#tour-panel', interactive: true, title: 'Open filters', timeout: 5000 },
         { target: '#tour-panel', title: 'Choose a filter' },
      ]);
   });
   await expect(card(page)).toBeVisible();
   await expect(card(page)).toHaveAttribute('aria-modal', 'false');
   await page.locator('#tour-target').click();
   await ready(page);
   await expect(page.locator('#tour-panel')).toBeFocused();
   await expect(page.locator('#tour-target')).toHaveJSProperty('inert', false);
   await page.getByRole('button', { name: 'Next', exact: true }).click();
   await expect(title(page)).toHaveText('Choose a filter'); await ready(page);
   await expect(card(page)).toHaveAttribute('aria-modal', 'true');
   expect(await page.evaluate(() => document.body.style.position)).toBe('fixed');
});

test('beforeStep may reveal a lazy target, replace a target, skip, or fail', async ({ mount, page }) => {
   await setup(mount, page);
   await page.evaluate(() => startTour([
      { title: 'Skip', beforeStep: () => false },
      { title: 'Lazy panel', target: '#absent', beforeStep: async () => {
         await new Promise(r => setTimeout(r, 20));
         return { target: document.querySelector('#tour-target') };
      } },
      { title: 'Broken', beforeStep: () => { throw new Error('Failed to open panel'); } },
   ]));
   await expect(title(page)).toHaveText('Lazy panel'); await ready(page);
   await page.getByRole('button', { name: 'Next', exact: true }).click();
   await expect(card(page)).toHaveCount(0);
   expect(await page.evaluate(() => result)).toEqual({ completed: false, reason: 'error' });
});

test('missing targets: skip and center fallback, timeout and missing callback', async ({ mount, page }) => {
   await setup(mount, page);
   await page.evaluate(() => {
      window.missingCount = 0;
      startTour([
         { target: '#absent', title: 'Skip me' },
         { target: '#absent', waitFor: '#absent', timeout: 40, fallback: 'center', title: 'Unavailable', onTargetMissing: () => missingCount++ },
      ]);
   });
   await expect(title(page)).toHaveText('Unavailable'); await ready(page);
   await expect(card(page)).toHaveAttribute('data-placement', 'center');
   await expect(page.locator('.slice-tour-overlay__status')).toHaveText('This step is not available.');
   expect(await page.evaluate(() => missingCount)).toBe(1);
   await page.getByRole('button', { name: 'Skip', exact: true }).click();
   await expect(card(page)).toHaveCount(0);
   expect(await page.evaluate(() => result.reason)).toBe('skipped');
});

test('persistence: complete, no-op, force and reset; stopped tours are not stored', async ({ mount, page }) => {
   await setup(mount, page);
   const start = () => page.evaluate(() => startTour([{ target: '#tour-target', title: 'Welcome' }], { storageKey: 'tour-persistence' }));
   await start(); await ready(page);
   await page.getByRole('button', { name: 'Done', exact: true }).click();
   await expect(card(page)).toHaveCount(0);
   expect(await page.evaluate(() => result)).toEqual({ completed: true, reason: 'completed' });
   expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tour-persistence')).version)).toBe(1);
   await start(); await expect(card(page)).toHaveCount(0);
   await page.evaluate(() => startTour([{ target: '#tour-target', title: 'Forced' }], { storageKey: 'tour-persistence', force: true }));
   await ready(page); await expect(title(page)).toHaveText('Forced');
   await page.evaluate(() => { tour.stop(); tour.reset(); });
   await start(); await ready(page);
   await page.evaluate(() => tour.stop());
   expect(await page.evaluate(() => localStorage.getItem('tour-persistence'))).toBeNull();
});

test('replace during unresolved app code, destroy while building and never leak an overlay', async ({ mount, page }) => {
   await setup(mount, page);
   await page.evaluate(() => {
      window.oldEnd = tour.start([{ target: '#tour-target', title: 'Never ready', beforeStep: () => new Promise(() => {}) }]);
   });
   await expect(title(page)).toHaveText('Never ready');
   await page.evaluate(() => startTour([{ target: '#tour-target', title: 'Replacement' }]));
   await expect(title(page)).toHaveText('Replacement'); await ready(page);
   expect(await page.evaluate(() => oldEnd)).toEqual({ completed: false, reason: 'replaced' });
   await page.evaluate(() => slice.controller.destroyComponent(tour));
   await expect(page.locator('slice-tour-overlay')).toHaveCount(0);
   await expect(page.locator('#tour-target')).toHaveJSProperty('inert', false);
   expect(await page.evaluate(() => document.body.style.position)).toBe('');
   expect(await page.evaluate(() => [...slice.controller.activeComponents.values()].filter(c => c.componentName === 'TourOverlay').length)).toBe(0);
   await page.evaluate(async () => {
      window.quick = await slice.build('TourService');
      quick.start([{ target: '#tour-target', title: 'Too late' }]);
      slice.controller.destroyComponent(quick);
   });
   await page.waitForTimeout(150);
   await expect(page.locator('slice-tour-overlay')).toHaveCount(0);
});

test('one active tour across services; route changes stop it; opting out keeps it', async ({ mount, page }) => {
   await setup(mount, page);
   await page.evaluate(() => startTour([{ target: '#tour-target', title: 'First' }])); await ready(page);
   await page.evaluate(async () => {
      window.second = await slice.build('TourService');
      window.secondEnd = second.start([{ target: '#tour-target', title: 'Second' }], { scrollIntoView: false });
   });
   await expect(title(page)).toHaveText('Second'); await ready(page);
   await expect(page.locator('slice-tour-overlay')).toHaveCount(1);
   expect(await page.evaluate(() => result.reason)).toBe('replaced');
   await page.evaluate(() => slice.events.emit('router:change', {}));
   await expect(card(page)).toHaveCount(0);
   expect(await page.evaluate(() => secondEnd)).toEqual({ completed: false, reason: 'route' });
   await page.evaluate(() => startTour([{ target: '#tour-target' }], { stopOnRouteChange: false })); await ready(page);
   await page.evaluate(() => slice.events.emit('router:change', {}));
   await expect(card(page)).toBeVisible();
});

test('next keeps the card visible and anchored while the following step prepares', async ({ mount, page }) => {
   await setup(mount, page);
   await page.evaluate(() => startTour([
      { target: '#tour-target', title: 'First' },
      { target: '#tour-target', title: 'Second', beforeStep: () => new Promise(resolve => setTimeout(resolve, 300)) },
   ]));
   await ready(page);
   await page.waitForFunction(() => document.querySelector('.slice-tour-overlay__panel')?.getAnimations().length === 0);
   const before = await card(page).boundingBox();
   await page.evaluate(() => document.querySelector('.slice-tour-overlay__next button').click());
   const during = await page.evaluate(() => {
      const panel = document.querySelector('.slice-tour-overlay__panel');
      const box = document.querySelector('.slice-tour-overlay__card').getBoundingClientRect();
      return {
         opacity: Number(getComputedStyle(panel).opacity),
         x: box.x, y: box.y,
         busy: document.querySelector('.slice-tour-overlay__card').getAttribute('aria-busy'),
      };
   });
   expect(during.busy).toBe('true');
   expect(during.opacity).toBeGreaterThan(0.95);
   expect(Math.abs(during.x - before.x)).toBeLessThan(20);
   expect(Math.abs(during.y - before.y)).toBeLessThan(20);
   await expect(title(page)).toHaveText('Second');
   await ready(page);
});

test('tracking: scroll containers, layout movement and a removed target', async ({ mount, page }) => {
   await setup(mount, page);
   await page.evaluate(() => {
      const scroll = document.createElement('div'); scroll.id = 'scroller';
      scroll.style.cssText = 'height:150px;overflow:auto;position:absolute;top:80px;left:30px;width:300px';
      const content = document.createElement('div'); content.style.height = '900px';
      const target = document.querySelector('#tour-target');
      target.style.cssText = 'display:block;margin-top:650px;width:150px;height:40px';
      content.append(target); scroll.append(content); document.body.append(scroll);
      startTour([{ target, title: 'Inside scroller', interactive: true, fallback: 'center' }], { scrollIntoView: true });
   });
   await ready(page);
   expect(await page.locator('#scroller').evaluate(el => el.scrollTop)).toBeGreaterThan(400);
   const before = await page.locator('.slice-tour-overlay__spotlight').boundingBox();
   await page.locator('#scroller').evaluate(el => { el.style.left = '80px'; });
   await expect.poll(async () => (await page.locator('.slice-tour-overlay__spotlight').boundingBox()).x).toBeGreaterThan(before.x + 40);
   await page.locator('#tour-target').evaluate(el => el.remove());
   await expect(card(page)).toHaveAttribute('data-placement', 'center');
});

test('text content is safe, content components are destroyed, storage denial never breaks a tour', async ({ mount, page }) => {
   await setup(mount, page);
   await page.evaluate(async () => {
      window.contentButton = await slice.build('Button', { value: 'Inside the card' });
      const realSet = Storage.prototype.setItem;
      Storage.prototype.setItem = () => { throw new Error('Storage denied'); };
      window.restoreStorage = () => { Storage.prototype.setItem = realSet; };
      startTour([
         { target: '#tour-target', title: 'Content', content: contentButton },
         { target: '#tour-target', title: 'Safe', content: '<img src=x onerror=alert(1)>' },
      ], { storageKey: 'denied' });
   });
   await ready(page); await expect(page.getByRole('button', { name: 'Inside the card' })).toBeVisible();
   await page.getByRole('button', { name: 'Next', exact: true }).click();
   await expect(title(page)).toHaveText('Safe'); await ready(page);
   expect(await page.evaluate(() => slice.controller.activeComponents.has(contentButton.sliceId))).toBe(false);
   await expect(page.locator('.slice-tour-overlay__content img')).toHaveCount(0);
   await page.getByRole('button', { name: 'Done', exact: true }).click();
   await expect(card(page)).toHaveCount(0);
   expect(await page.evaluate(() => result.completed)).toBe(true);
});

test('tiny viewport and reduced motion keep the card usable', async ({ mount, page }) => {
   await page.setViewportSize({ width: 320, height: 480 });
   await page.emulateMedia({ reducedMotion: 'reduce' });
   await setup(mount, page);
   await page.evaluate(() => startTour([{ target: '#tour-target', title: 'Mobile', content: 'A useful tip.' }]));
   await ready(page);
   const box = await card(page).boundingBox();
   expect(box.x).toBeGreaterThanOrEqual(12); expect(box.x + box.width).toBeLessThanOrEqual(308);
   expect(await card(page).evaluate(el => getComputedStyle(el).animationName)).toBe('none');
   expect(await page.locator('.slice-tour-overlay__panel').evaluate(el => el.getAnimations().length)).toBe(0);
});

test('split modal handoff and error on a competing modal', async ({ mount, page }) => {
   await setup(mount, page);
   await page.evaluate(() => startTour([{ target: '#tour-target', title: 'Open details' }])); await ready(page);
   await page.evaluate(async () => {
      tour.stop('handoff');
      window.modal = await slice.build('Modal', { title: 'Details', open: true });
      document.body.append(modal);
   });
   expect(await page.evaluate(() => result.reason)).toBe('handoff');
   await page.evaluate(() => startTour([{ target: '#tour-target', title: 'Conflicting tour' }]));
   await expect(card(page)).toHaveCount(0);
   await expect.poll(() => page.evaluate(() => result?.reason)).toBe('error');
});
