import test from 'node:test';
import assert from 'node:assert/strict';
import { packMasonry } from './masonry.js';

test('masonry packs into shortest column with stable ties and separate row gap', () => {
   const result = packMasonry([100, 40, 70, 50].map(height => ({ height })), 2, 120, 10, 8);
   assert.deepEqual(result.positions.map(p => [p.x, p.y]), [[0, 0], [130, 0], [130, 48], [0, 108]]);
   assert.equal(result.height, 158);
});
test('masonry spans choose the lowest contiguous group and clamp on narrow containers', () => {
   const result = packMasonry([{ height: 100 }, { height: 40 }, { height: 30 }, { height: 50, span: 2 }, { height: 20, span: 'full' }], 3, 100, 10);
   assert.deepEqual(result.positions[3], { x: 110, y: 50, width: 210, span: 2 });
   assert.equal(result.positions[4].y, 110);
   assert.equal(result.height, 130);
   assert.equal(packMasonry([{ height: 40, span: 5 }], 1, 90).positions[0].width, 90);
   assert.deepEqual(packMasonry([], 2, 100), { positions: [], height: 0 });
});
test('masonry variable heights/spans never overlap or exceed container bounds', () => {
   const items = Array.from({ length: 100 }, (_, i) => ({ height: 10 + (i * 37 % 180), span: i % 9 === 0 ? 'full' : i % 7 === 0 ? 2 : 1 }));
   const { positions, height } = packMasonry(items, 4, 100, 12, 16);
   positions.forEach((p, i) => {
      assert.ok(p.x >= 0 && p.x + p.width <= 436 && p.y + items[i].height <= height);
      for (let j = 0; j < i; j++) {
         const q = positions[j];
         assert.ok(p.x + p.width <= q.x || q.x + q.width <= p.x || p.y >= q.y + items[j].height || q.y >= p.y + items[i].height);
      }
   });
});
