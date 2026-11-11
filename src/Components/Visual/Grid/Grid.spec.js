import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

// Grid contract. Derived from Grid.js / Grid.html.
//   - tag: slice-grid, inner .grid-container holds the layout
//   - columns -> grid-template-columns: repeat(N, 1fr) (unless columnTemplate)
//   - rows    -> grid-template-rows: repeat(N, 1fr) (unless rowTemplate)
//   - gap     -> .grid-container style.gap
//   - columnTemplate / rowTemplate -> explicit grid-template-* override
//   - items   -> live DOM nodes, REPLACED (not appended) on every assignment
//
// `items` holds live DOM nodes, which cannot cross the `mount` prop boundary,
// so the item specs drive them from inside the page. That is also why the old
// append-only behaviour went unnoticed: nothing here ever set items twice.

test.describe('Grid', () => {
   test('smoke: builds and mounts without errors', async ({ mount }) => {
      const c = await mount('Grid');
      // An empty grid (no items) collapses to 0x0, so assert attachment, not
      // visibility — the layout container is what carries the contract.
      await expect(c.component).toBeAttached();
      await expect(c.locator('.grid-container')).toBeAttached();
      expect(c.pageErrors()).toEqual([]);
   });

   test('columns reflect to grid-template-columns via repeat', async ({ mount }) => {
      const c = await mount('Grid', { columns: 3 });
      await expect(c.locator('.grid-container')).toHaveCSS(
         'grid-template-columns',
         /(repeat\(3, 1fr\)|(\d+(\.\d+)?px\s+){2}\d+(\.\d+)?px)/
      );
   });

   test('rows reflect to grid-template-rows via repeat', async ({ mount }) => {
      const c = await mount('Grid', { rows: 2, columns: 1 });
      await expect(c.locator('.grid-container')).toHaveCSS(
         'grid-template-rows',
         /(repeat\(2, 1fr\)|(\d+(\.\d+)?px\s+)\d+(\.\d+)?px)/
      );
   });

   test('gap reflects to the container style', async ({ mount }) => {
      const c = await mount('Grid', { gap: '24px' });
      await expect(c.locator('.grid-container')).toHaveCSS('gap', '24px');
   });

   test('columnTemplate overrides grid-template-columns', async ({ mount }) => {
      const c = await mount('Grid', { columns: 2, columnTemplate: '100px 200px' });
      await expect(c.locator('.grid-container')).toHaveCSS('grid-template-columns', '100px 200px');
   });

   test('rowTemplate overrides grid-template-rows', async ({ mount }) => {
      const c = await mount('Grid', { rows: 2, rowTemplate: '50px 80px' });
      await expect(c.locator('.grid-container')).toHaveCSS('grid-template-rows', '50px 80px');
   });

   // ------------------------------------------------------------------- items

   test('setting items twice replaces rather than appends', async ({ mount }) => {
      const c = await mount('Grid', { columns: 2 });

      const out = await c.component.evaluate((el) => {
         const make = (t) => {
            const d = document.createElement('div');
            d.textContent = t;
            return d;
         };
         el.items = [make('a'), make('b')];
         const afterFirst = el.querySelector('.grid-container').children.length;

         el.items = [make('c')];
         const afterSecond = el.querySelector('.grid-container').children.length;
         const text = [...el.querySelector('.grid-container').children].map((n) => n.textContent);

         return { afterFirst, afterSecond, text };
      });

      // The bug: both calls appended, so the second render showed a, b AND c.
      expect(out.afterFirst).toBe(2);
      expect(out.afterSecond).toBe(1);
      expect(out.text).toEqual(['c']);
   });

   test('a node still present is MOVED, keeping its identity and state', async ({ mount }) => {
      const c = await mount('Grid');

      const out = await c.component.evaluate((el) => {
         const make = (t) => {
            const d = document.createElement('div');
            d.textContent = t;
            return d;
         };
         const a = make('a');
         const b = make('b');
         const first = make('first');

         el.items = [a, b];
         a.__marker = 'state-a';

         el.items = [first, a, b];        // same nodes, new order
         const container = el.querySelector('.grid-container');

         return {
            order: [...container.children].map((n) => n.textContent),
            // Identity preserved: moved, not re-created.
            sameA: container.children[1] === a,
            marker: a.__marker,
            count: container.children.length,
         };
      });

      expect(out.order).toEqual(['first', 'a', 'b']);
      expect(out.sameA).toBe(true);
      expect(out.marker).toBe('state-a');
      expect(out.count).toBe(3);
   });

   test('a Slice child that leaves the list is DESTROYED, not just detached', async ({ mount }) => {
      const c = await mount('Grid');

      const out = await c.component.evaluate(async (el) => {
         const badge = await slice.build('Badge', { sliceId: 'grid-badge', label: 'hi' });
         const plain = document.createElement('div');
         plain.textContent = 'plain';

         el.items = [badge, plain];
         const registeredBefore = slice.controller.activeComponents.has('grid-badge');

         // The badge leaves the list; the plain node stays.
         el.items = [plain];

         return {
            registeredBefore,
            stillRegistered: slice.controller.activeComponents.has('grid-badge'),
            children: [...el.querySelector('.grid-container').children].map((n) => n.textContent),
         };
      });

      expect(out.registeredBefore).toBe(true);
      // With innerHTML = '' the component would stay in the registry for the
      // life of the page.
      expect(out.stillRegistered).toBe(false);
      expect(out.children).toEqual(['plain']);
      expect(c.pageErrors()).toEqual([]);
   });

   test('destroying the grid destroys the Slice children it holds', async ({ mount }) => {
      const c = await mount('Grid', { sliceId: 'grid-under-test' });

      const out = await c.component.evaluate(async (el) => {
         const badge = await slice.build('Badge', { sliceId: 'grid-badge-2', label: 'hi' });
         el.items = [badge];
         const before = slice.controller.activeComponents.has('grid-badge-2');

         slice.controller.destroyComponent('grid-under-test');
         return { before, after: slice.controller.activeComponents.has('grid-badge-2') };
      });

      expect(out.before).toBe(true);
      expect(out.after).toBe(false);
   });

   test('clear() empties the grid and destroys its components', async ({ mount }) => {
      const c = await mount('Grid');

      const out = await c.component.evaluate(async (el) => {
         const badge = await slice.build('Badge', { sliceId: 'grid-badge-3', label: 'hi' });
         el.items = [badge];
         el.clear();
         return {
            children: el.querySelector('.grid-container').children.length,
            registered: slice.controller.activeComponents.has('grid-badge-3'),
            items: el.items.length,
         };
      });

      expect(out.children).toBe(0);
      expect(out.registered).toBe(false);
      expect(out.items).toBe(0);
   });

   test('setItem still appends, for incremental use', async ({ mount }) => {
      const c = await mount('Grid');

      const out = await c.component.evaluate(async (el) => {
         const a = document.createElement('div');
         a.textContent = 'a';
         const b = document.createElement('div');
         b.textContent = 'b';
         await el.setItem(a);
         await el.setItem(b);
         return [...el.querySelector('.grid-container').children].map((n) => n.textContent);
      });

      expect(out).toEqual(['a', 'b']);
   });

   test('a non-node entry is skipped, not fatal', async ({ mount }) => {
      const c = await mount('Grid');

      const out = await c.component.evaluate((el) => {
         const good = document.createElement('div');
         good.textContent = 'good';
         el.items = [null, good, 'not-a-node'];
         return [...el.querySelector('.grid-container').children].map((n) => n.textContent);
      });

      expect(out).toEqual(['good']);
   });

   // ------------------------------------------------------- responsive layout

   const cols = (c) => c.component.evaluate((el) => el.columnCount);
   const widthTo = (c, px) => c.component.evaluate((el, w) => { el.style.width = `${w}px`; }, px);

   test('columns by breakpoints follow the GRID\'s width', async ({ mount }) => {
      const c = await mount('Grid', { columns: { 0: 1, 560: 2, 960: 4 } });
      await widthTo(c, 400);
      await expect.poll(() => cols(c)).toBe(1);
      await widthTo(c, 700);
      await expect.poll(() => cols(c)).toBe(2);
      await widthTo(c, 1000);
      await expect.poll(() => cols(c)).toBe(4);
      await expect(c.component).toHaveAttribute('data-columns', '4');
      expect(c.pageErrors()).toEqual([]);
   });

   test('minItemWidth: as many columns as fit', async ({ mount }) => {
      const c = await mount('Grid', { minItemWidth: 200, gap: 0 });
      await widthTo(c, 700);
      await expect.poll(() => cols(c)).toBe(3);
      await widthTo(c, 300);
      await expect.poll(() => cols(c)).toBe(1);
   });

   test('items as { node, colSpan, rowSpan }: spans never exceed the columns shown', async ({ mount }) => {
      const c = await mount('Grid', { columns: { 0: 1, 600: 4 }, autoRows: '80px' });
      await c.component.evaluate((el) => {
         const big = document.createElement('div');
         big.id = 'big';
         big.textContent = 'big';
         const wide = document.createElement('div');
         wide.id = 'wide';
         el.items = [{ node: big, colSpan: 2, rowSpan: 2 }, { node: wide, colSpan: 'full' }, document.createElement('div')];
      });
      const big = c.locator('#big');
      await widthTo(c, 800);
      await expect.poll(() => big.evaluate((n) => n.style.gridColumn)).toBe('span 2');
      expect(await big.evaluate((n) => n.style.gridRow)).toBe('span 2');
      expect(await c.locator('#wide').evaluate((n) => n.style.gridColumn)).toBe('1 / -1');
      await expect(big).toHaveCSS('height', '170px'); // two 80px rows + the 10px gap
      await widthTo(c, 400);
      await expect.poll(() => big.evaluate((n) => n.style.gridColumn)).toBe('span 1');
      // The same node passed plain again loses the spans.
      await c.component.evaluate((el) => { el.items = [el.querySelector('#big')]; });
      expect(await big.evaluate((n) => n.style.gridRow)).toBe('');
   });

   test('areas place items by name, per width', async ({ mount }) => {
      const c = await mount('Grid', { areas: { 0: ['head', 'main', 'side'], 700: ['head head', 'main side'] } });
      await c.component.evaluate((el) => {
         const make = (id) => { const n = document.createElement('div'); n.id = id; n.textContent = id; return n; };
         el.items = [{ node: make('head'), area: 'head' }, { node: make('main'), area: 'main' }, { node: make('side'), area: 'side' }];
      });
      const top = (id) => c.locator(`#${id}`).evaluate((n) => Math.round(n.getBoundingClientRect().top));
      await widthTo(c, 500);
      await expect.poll(async () => (await top('side')) > (await top('main'))).toBe(true);
      await widthTo(c, 900);
      await expect.poll(async () => (await top('side')) === (await top('main'))).toBe(true);
      expect(await cols(c)).toBe(2);
      expect(await c.locator('#head').evaluate((n) => n.style.gridArea)).toBe('head');
   });

   test('gap as a number, rowGap, align, justify and dense', async ({ mount }) => {
      const c = await mount('Grid', { gap: 16, rowGap: '4px', align: 'center', justify: 'start', dense: true });
      const g = c.locator('.grid-container');
      await expect(g).toHaveCSS('column-gap', '16px');
      await expect(g).toHaveCSS('row-gap', '4px');
      await expect(g).toHaveCSS('align-items', 'center');
      await expect(g).toHaveCSS('justify-items', 'start');
      await expect(g).toHaveCSS('grid-auto-flow', 'dense');
   });

   test('visual: 3-column grid @visual', async ({ mount }) => {
      const c = await mount('Grid', { columns: 3, gap: '12px' });
      await expect(c.component).toHaveScreenshot('grid-3col.png');
   });
});
