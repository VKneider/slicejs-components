import test from 'node:test';
import assert from 'node:assert/strict';
import { allocate, bounds, pairRange, resizePair } from './sizes.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);

test('SplitPane allocates missing/weighted sizes without mutating input', () => {
   const panels = [{}, {}, {}];
   const requested = [1, 2, 1];
   assert.deepEqual(allocate(panels, requested), [25, 50, 25]);
   assert.deepEqual(requested, [1, 2, 1]);
   allocate(panels).forEach(n => near(n, 100 / 3));
   assert.deepEqual(allocate([]), []);
   assert.deepEqual(allocate([{}, {}], [Infinity, NaN]), [50, 50]);
});
test('SplitPane handles collapsed panels and infeasible lower/upper bounds', () => {
   assert.deepEqual(allocate([{ collapsed: true }, {}], [60, 40]), [0, 100]);
   assert.deepEqual(allocate([{ minSize: 80 }, { minSize: 80 }]), [50, 50]);
   assert.deepEqual(allocate([{ maxSize: 20 }, { maxSize: 20 }]), [50, 50]);
   assert.equal(bounds([{ minSize: 80 }, { minSize: 80 }]).constrained, true);
});
test('SplitPane pair resizing respects both neighbors and leaves other panels untouched', () => {
   const panels = [{ minSize: 10, maxSize: 40 }, { minSize: 20, maxSize: 60 }, {}];
   const original = [25, 35, 40];
   assert.deepEqual(pairRange(panels, original, 0), { min: 10, max: 40, total: 60 });
   assert.deepEqual(resizePair(panels, original, 0, 95), [40, 20, 40]);
   assert.deepEqual(resizePair(panels, original, 0, -9), [10, 50, 40]);
   assert.deepEqual(resizePair(panels, original, 9, 30), original);
   assert.deepEqual(resizePair(panels, original, 0, NaN), original);
});
test('SplitPane allocation preserves total and effective constraints across varied inputs', () => {
   let seed = 42;
   const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
   for (let trial = 0; trial < 500; trial++) {
      const panels = Array.from({ length: 2 + Math.floor(rand() * 6) }, (_, i) => ({ minSize: rand() * 70, maxSize: rand() * 100, collapsed: i > 0 && rand() < .2 }));
      const requested = panels.map(() => rand() * 100);
      const values = allocate(panels, requested);
      const range = bounds(panels);
      near(values.reduce((a, b) => a + b, 0), 100);
      values.forEach((v, i) => { assert.ok(v >= range.min[i] - 1e-7 && v <= range.max[i] + 1e-7); if (panels[i].collapsed) assert.equal(v, 0); });
   }
});
