import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';
async function fill(c) {
   await c.component.evaluate((el) => {
      el.style.width = '280px';
      el.items = Array.from({ length: 4 }, (_, i) => {
         const node = document.createElement('button');
         node.type = 'button';
         node.textContent = `Action ${i}`;
         node.style.cssText = 'width:100px;flex:none';
         return {
            id: String(i),
            node,
            priority: i === 2 ? 10 : 0,
            pinned: i === 0,
         };
      });
   });
}
test('OverflowList measures its own container and preserves live nodes through menu open/close', async ({
   mount,
}) => {
   const c = await mount('OverflowList', { ariaLabel: 'Document actions' });
   await fill(c);
   await expect
      .poll(() => c.component.evaluate((el) => el.overflowItems.length))
      .toBeGreaterThan(0);
   await expect(c.component).toHaveAttribute('role', 'group');
   await expect(c.component).toHaveAttribute('aria-label', 'Document actions');
   const state = await c.component.evaluate(async (el) => {
      const hidden = el.overflowItems[0].node;
      let clicks = 0;
      hidden.addEventListener('click', () => clicks++);
      await el._menu.open();
      hidden.click();
      el._menu.close();
      await el._menu.open();
      hidden.click();
      el._menu.close();
      return {
         same: el.items.some((item) => item.node === hidden),
         clicks,
         parked: el.$measure.contains(hidden),
      };
   });
   expect(state).toEqual({ same: true, clicks: 2, parked: true });
   await c.component.evaluate((el) => {
      el.style.width = '800px';
   });
   await expect
      .poll(() => c.component.evaluate((el) => el.overflowItems.length))
      .toBe(0);
   await expect(c.locator('.slice-overflow-list__more')).toBeHidden();
   expect(c.pageErrors()).toEqual([]);
});
test('OverflowList priorities, pinning, start/end, hidden reveal and dynamic content are reactive', async ({
   mount,
}) => {
   const c = await mount('OverflowList');
   await fill(c);
   await expect
      .poll(() =>
         c.component.evaluate((el) =>
            el.visibleItems.some((i) => i.id === '0'),
         ),
      )
      .toBe(true);
   await c.component.evaluate((el) => {
      el.minVisible = 2;
      el.collapseFrom = 'start';
      el.style.width = '30px';
      el.reflow();
   });
   await expect(c.component).toHaveAttribute('data-constrained', 'true');
   expect(
      await c.component.evaluate((el) => el.visibleItems.map((i) => i.id)),
   ).toEqual(['0', '2', '3']);
   await c.component.evaluate((el) => {
      el.hidden = true;
      el.style.width = '900px';
   });
   await c.component.evaluate((el) => {
      el.hidden = false;
   });
   await expect
      .poll(() => c.component.evaluate((el) => el.overflowItems.length))
      .toBe(0);
   await c.component.evaluate((el) => {
      el.items[1].node.style.width = '900px';
   });
   await expect
      .poll(() => c.component.evaluate((el) => el.overflowItems.length))
      .toBeGreaterThan(0);
});
test('OverflowList redirects hidden focus to More, retains components and cleans ancestry', async ({
   mount,
}) => {
   const c = await mount('OverflowList');
   const result = await c.component.evaluate(async (el) => {
      const a = await slice.build('Button', { value: 'A' }),
         b = await slice.build('Button', { value: 'B' });
      a.style.width = b.style.width = '120px';
      el.style.width = '600px';
      el.items = [
         { id: 'a', node: a, pinned: true },
         { id: 'b', node: b },
      ];
      el.reflow();
      b.querySelector('button').focus();
      el.style.width = '160px';
      el.reflow();
      const focus = document.activeElement === el._menu.$trigger;
      await el._menu.open();
      el._menu.close();
      const live = slice.controller.activeComponents.has(b.sliceId);
      slice.controller.destroyComponent(el);
      return {
         focus,
         live,
         clean: ![a, b].some((child) =>
            slice.controller.activeComponents.has(child.sliceId),
         ),
      };
   });
   expect(result).toEqual({ focus: true, live: true, clean: true });
});
test('OverflowList rejects duplicate nodes and treats empty and disabled disclosure safely', async ({
   mount,
}) => {
   const c = await mount('OverflowList', { disabled: true });
   await expect(c.component).toBeAttached();
   expect(
      await c.component.evaluate((el) => {
         const node = document.createElement('span');
         let rejected = false;
         try {
            el.items = [
               { id: 'a', node },
               { id: 'b', node },
            ];
         } catch {
            rejected = true;
         }
         return { rejected, empty: el.items.length };
      }),
   ).toEqual({ rejected: true, empty: 0 });
});

test('OverflowList preserves update wrappers when adopting a composite and cleans pending rich content', async ({
   mount,
}) => {
   const c = await mount('OverflowList');
   expect(
      await c.component.evaluate(async (el) => {
         const child = await slice.build('TransferList', { items: [] });
         child.style.width = '400px';
         const update = child.update;
         el.items = [{ id: 'composite', node: child }];
         el.items = el.items;
         el.items = el.items;
         const stable = child.update === update;
         const pending = await slice.build('Button', { value: 'Pending' });
         child.items = [
            { value: 'pending', label: 'Pending', content: pending },
         ];
         slice.controller.destroyComponent(el);
         await new Promise((resolve) => setTimeout(resolve, 0));
         return {
            stable,
            clean:
               !slice.controller.activeComponents.has(child.sliceId) &&
               !slice.controller.activeComponents.has(pending.sliceId),
            validAncestors: !slice.controller.childrenIndex.has(undefined),
         };
      }),
   ).toEqual({ stable: true, clean: true, validAncestors: true });
});
