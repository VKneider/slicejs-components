import test from 'node:test';
import assert from 'node:assert/strict';
import { fitItems } from './fit.js';
test('OverflowList fits all items without reserving an unnecessary trigger', () => {
   assert.deepEqual(fitItems([{ width: 40 }, { width: 40 }], 90, 50, 10), {
      visible: [0, 1],
      overflow: [],
      constrained: false,
   });
   assert.deepEqual(fitItems([], 0, 50), {
      visible: [],
      overflow: [],
      constrained: false,
   });
});
test('OverflowList priorities, edge order and reserved gaps select a stable subsequence', () => {
   const items = [{ width: 40 }, { width: 40, priority: 5 }, { width: 40 }];
   assert.deepEqual(fitItems(items, 120, 20, 10).visible, [0, 1]);
   assert.deepEqual(fitItems(items, 120, 20, 10, 0, 'start').visible, [1, 2]);
   assert.deepEqual(
      fitItems(
         [{ width: 90, priority: 5 }, { width: 20 }, { width: 20 }],
         80,
         20,
         5,
      ).visible,
      [1, 2],
   );
});
test('OverflowList pinned/minVisible items remain reachable even if they cannot fit', () => {
   const items = [{ width: 80, pinned: true }, { width: 80 }, { width: 80 }];
   assert.deepEqual(fitItems(items, 40, 30, 8, 2), {
      visible: [0, 1],
      overflow: [2],
      constrained: true,
   });
   assert.deepEqual(fitItems(items, 150, 30, 8, 1, 'start').visible, [0, 2]);
});
test('OverflowList budgets never duplicate/drop items and preserve order across widths', () => {
   const items = Array.from({ length: 35 }, (_, i) => ({
      width: 20 + (i % 7) * 13,
      priority: i % 5,
      pinned: i === 3,
   }));
   for (let width = 0; width < 2000; width += 7) {
      const result = fitItems(items, width, 60, 8);
      assert.equal(
         result.visible.length + result.overflow.length,
         items.length,
      );
      assert.equal(
         new Set([...result.visible, ...result.overflow]).size,
         items.length,
      );
      assert.ok(result.visible.includes(3));
      assert.deepEqual(
         [...result.visible].sort((a, b) => a - b),
         result.visible,
      );
      if (!result.constrained && result.overflow.length) {
         assert.ok(
            result.visible.reduce((sum, i) => sum + items[i].width + 8, 60) <=
               width,
         );
      }
   }
});
