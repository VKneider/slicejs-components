import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

// Layout baseline contract. Derived from Layout.js (Layout.html is empty — the
// component is a bare container that appends `layout` and `view` nodes).
//   - tag: slice-layout
//   - props `layout` and `view` are objects expected to be live DOM nodes; init
//     appends them (onLayOut / showing use appendChild).
//
// LIMITATION: both meaningful props (`layout`, `view`) require live DOM nodes,
// which cannot be serialized across the page boundary via `mount` props. Passing
// plain objects would make appendChild throw, so the node-insertion behaviour is
// not exercised here. We assert the component still builds and mounts cleanly
// with no props (defaults are null, so init() is a no-op) and is a valid host.

test.describe('Layout', () => {
   test('smoke: builds and mounts without errors', async ({ mount }) => {
      const c = await mount('Layout');
      await expect(c.component).toBeAttached();
      expect(c.pageErrors()).toEqual([]);
   });

   test('mounts as a slice-layout custom element', async ({ mount }) => {
      const c = await mount('Layout');
      await expect(c.component).toHaveJSProperty('tagName', 'SLICE-LAYOUT');
   });

   test('renders no children when layout/view are not provided', async ({ mount }) => {
      const c = await mount('Layout');
      // Defaults are null -> init() appends nothing.
      await expect(c.locator(':scope > slice-layout > *')).toHaveCount(0);
      expect(c.pageErrors()).toEqual([]);
   });

   test('visual: empty layout host @visual', async ({ mount }) => {
      const c = await mount('Layout');
      await expect(c.component).toHaveScreenshot('layout-empty.png');
   });

   // ------------------------------------------------------------ legacy API

   test('legacy: onLayOut appends to the host; showing swaps the view', async ({ mount }) => {
      const c = await mount('Layout');
      const out = await c.component.evaluate(async (el) => {
         const menu = document.createElement('nav');
         const a = document.createElement('p'); a.textContent = 'A';
         const b = document.createElement('p'); b.textContent = 'B';
         await el.onLayOut(menu);
         await el.showing(a);
         await el.showing(b);
         return { children: [...el.children].map((n) => n.tagName + (n.textContent || '')), current: el.currentView === b };
      });
      expect(out.children).toEqual(['NAV', 'PB']);
      expect(out.current).toBe(true);
      await expect(c.component).not.toHaveClass(/slice-layout--regions/);
   });

   // --------------------------------------------------------------- regions

   const build = (c, extra = {}) => c.component.evaluate(async (el, extra) => {
      const make = (tag, text) => { const n = document.createElement(tag); n.textContent = text; return n; };
      const nav = document.createElement('div');
      const link = document.createElement('a');
      link.href = '#inbox';
      link.textContent = 'Inbox';
      nav.append(link);
      Object.assign(el, { sidebarLabel: 'Main navigation', ...extra });
      el.header = make('div', 'Acme');
      el.sidebar = nav;
      el.main = make('p', 'Hello');
      el.footer = make('div', '© Acme');
   }, extra);
   const widthTo = (c, px) => c.component.evaluate((el, w) => { el.style.width = `${w}px`; }, px);

   test('regions: landmarks, a labelled navigation and a skip link to main', async ({ mount, page }) => {
      const c = await mount('Layout');
      await build(c);
      await expect(c.component.getByRole('banner')).toHaveText('Acme');
      await expect(c.component.getByRole('navigation', { name: 'Main navigation' })).toBeAttached();
      await expect(c.component.getByRole('main')).toContainText('Hello');
      await expect(c.component.getByRole('contentinfo')).toHaveText('© Acme');
      const skip = c.component.getByRole('link', { name: 'Skip to content' });
      await skip.focus();
      await page.keyboard.press('Enter');
      await expect(c.component.getByRole('main')).toBeFocused();
      await c.component.evaluate((el) => { el.landmarks = false; });
      await expect(c.component.getByRole('main')).toHaveCount(0);
   });

   test('narrow: the sidebar is a drawer — menu button, Escape, focus back', async ({ mount, page }) => {
      const c = await mount('Layout', {}, { spies: ['onSidebarToggle'] });
      await build(c, { collapseBelow: 800 });
      await widthTo(c, 1000);
      const menu = c.component.getByRole('button', { name: 'Open menu' });
      await expect.poll(() => c.component.evaluate((el) => el.collapsed)).toBe(false);
      await expect(menu).toBeHidden();
      await widthTo(c, 500);
      await expect.poll(() => c.component.evaluate((el) => el.collapsed)).toBe(true);
      await expect(menu).toBeVisible();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      expect(await c.locator('.slice-layout__sidebar').evaluate((n) => n.inert)).toBe(true);

      await menu.click();
      const close = c.component.getByRole('button', { name: 'Close menu' });
      await expect(close).toHaveAttribute('aria-expanded', 'true');
      await expect(c.component.getByRole('link', { name: 'Inbox' })).toBeFocused();
      await expect.poll(() => c.events('onSidebarToggle')).toBe(1);

      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).toBeFocused();
      expect((await c.eventArgs('onSidebarToggle'))[1][0]).toBe(false);

      // Wide again: no drawer, the sidebar is part of the page.
      await widthTo(c, 1000);
      await expect(menu).toBeHidden();
      expect(await c.locator('.slice-layout__sidebar').evaluate((n) => n.inert)).toBe(false);
   });

   test('the backdrop closes the drawer', async ({ mount }) => {
      const c = await mount('Layout');
      await build(c, { collapseBelow: 800 });
      await widthTo(c, 500);
      await c.component.getByRole('button', { name: 'Open menu' }).click();
      await expect(c.locator('.slice-layout__backdrop')).toBeVisible();
      await c.locator('.slice-layout__backdrop').click({ position: { x: 480, y: 20 } });
      await expect(c.locator('.slice-layout__backdrop')).toBeHidden();
   });

   test('with regions, showing() swaps the main content; replaced region components are destroyed', async ({ mount }) => {
      const c = await mount('Layout');
      const out = await c.component.evaluate(async (el) => {
         const badge = await slice.build('Badge', { sliceId: 'layout-header-badge', label: 'beta' });
         el.header = badge;
         const before = slice.controller.activeComponents.has('layout-header-badge');
         const a = document.createElement('p'); a.textContent = 'A';
         const b = document.createElement('p'); b.textContent = 'B';
         await el.showing(a);
         await el.showing(b);
         const main = el.querySelector('.slice-layout__content').textContent;
         el.header = document.createElement('div');
         return { before, after: slice.controller.activeComponents.has('layout-header-badge'), main, aStill: a.isConnected };
      });
      expect(out).toEqual({ before: true, after: false, main: 'B', aStill: false });
   });

   test('destroying the layout destroys the components in its regions', async ({ mount }) => {
      const c = await mount('Layout', { sliceId: 'layout-destroy-me' });
      const out = await c.component.evaluate(async (el) => {
         el.sidebar = await slice.build('Badge', { sliceId: 'layout-side-badge', label: 'x' });
         slice.controller.destroyComponent('layout-destroy-me');
         return slice.controller.activeComponents.has('layout-side-badge');
      });
      expect(out).toBe(false);
   });

   test('widths become CSS variables; texts can be replaced', async ({ mount }) => {
      const c = await mount('Layout', { sidebarWidth: 300, contentWidth: '72ch', texts: { skip: 'Ir al contenido' } });
      await build(c);
      await expect(c.component).toHaveCSS('--slice-layout-sidebar-width', '300px');
      await expect(c.component).toHaveCSS('--slice-layout-content-width', '72ch');
      await expect(c.component.getByRole('link', { name: 'Ir al contenido' })).toBeAttached();
   });

   test('a regions layout inside a plain one keeps its own regions (no style leak)', async ({ mount }) => {
      const c = await mount('Layout');
      const shown = await c.component.evaluate(async (outer) => {
         const inner = await slice.build('Layout', { landmarks: false });
         await outer.showing(inner);
         const nav = document.createElement('div');
         nav.textContent = 'Menu';
         inner.sidebar = nav;
         inner.main = document.createElement('p');
         return getComputedStyle(inner.querySelector('.slice-layout__sidebar')).display;
      });
      expect(shown).not.toBe('none');
   });

   test('a route change closes the drawer; focusOnNavigate moves focus to main', async ({ mount, page }) => {
      const c = await mount('Layout');
      await build(c, { collapseBelow: 800, focusOnNavigate: true });
      await widthTo(c, 500);
      const menu = c.component.getByRole('button', { name: 'Open menu' });
      await menu.click();
      await expect(c.component).toHaveAttribute('data-sidebar-open', '');
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('router:change', { detail: { to: { path: '/inbox' }, from: { path: '/' } } })));
      await expect(c.component).not.toHaveAttribute('data-sidebar-open', /.*/);
      await expect(c.component.getByRole('main')).toBeFocused();
   });

   test('following a link in the drawer closes it', async ({ mount }) => {
      const c = await mount('Layout');
      await build(c, { collapseBelow: 800 });
      await widthTo(c, 500);
      await c.component.getByRole('button', { name: 'Open menu' }).click();
      await c.component.getByRole('link', { name: 'Inbox' }).click();
      await expect(c.component).not.toHaveAttribute('data-sidebar-open', /.*/);
   });

   test('a destroyed layout stops listening to route changes', async ({ mount, page }) => {
      const c = await mount('Layout', { sliceId: 'layout-routes' });
      await build(c);
      const out = await page.evaluate(() => {
         const el = document.querySelector('slice-layout');
         let calls = 0;
         const original = el._handleRoute.bind(el);
         el._handleRoute = () => { calls++; original(); };
         window.dispatchEvent(new CustomEvent('router:change', { detail: {} }));
         slice.controller.destroyComponent('layout-routes');
         window.dispatchEvent(new CustomEvent('router:change', { detail: {} }));
         return calls;
      });
      expect(out).toBe(1);
      expect(c.pageErrors()).toEqual([]);
   });

   test('collapseBelow as a media query; collapsedSidebar hidden adds no menu button', async ({ mount, page }) => {
      await page.setViewportSize({ width: 600, height: 700 });
      const c = await mount('Layout');
      await build(c, { collapseBelow: '(max-width: 768px)', collapsedSidebar: 'hidden' });
      await expect.poll(() => c.component.evaluate((el) => el.collapsed)).toBe(true);
      await expect(c.locator('.slice-layout__toggle')).toBeHidden();
      await expect(c.locator('.slice-layout__sidebar')).toBeHidden();
      await page.setViewportSize({ width: 1000, height: 700 });
      await expect.poll(() => c.component.evaluate((el) => el.collapsed)).toBe(false);
      await expect(c.locator('.slice-layout__sidebar')).toBeVisible();
   });

   test('the first route of a page load does not move focus; later ones do', async ({ mount, page }) => {
      const c = await mount('Layout');
      await build(c, { focusOnNavigate: true });
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('router:change', { detail: { to: { path: '/' }, from: null } })));
      await expect(c.component.getByRole('main')).not.toBeFocused();
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('router:change', { detail: { to: { path: '/b' }, from: { path: '/' } } })));
      await expect(c.component.getByRole('main')).toBeFocused();
   });
});
