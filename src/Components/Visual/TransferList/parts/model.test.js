import test from 'node:test';
import assert from 'node:assert/strict';
import {
   normalizeItems,
   normalizeValue,
   filterItems,
   changeAssignment,
} from './model.js';
const catalog = () =>
   normalizeItems([
      {
         value: 'read',
         label: 'Lectúra',
         description: 'Ver informes',
         group: 'Proyectos',
      },
      { value: 'write', label: 'Editar', group: 'Proyectos' },
      { value: 'admin', label: 'Administrar', locked: true },
      { value: 0, label: 'Zero' },
      { value: 'disabled', label: 'Disabled', disabled: true },
   ]);
test('TransferList validates keys and copies data without coercing numeric/string identity', () => {
   const source = [{ value: 1, label: 'One' }];
   const result = normalizeItems(source);
   assert.notEqual(result, source);
   assert.notEqual(result[0], source[0]);
   assert.deepEqual(normalizeValue([1, '1', 1, 0]), [1, '1', 0]);
   for (const values of [
      [{ value: 'a' }, { value: 'a' }],
      [{ value: NaN }],
      [{ value: '' }],
   ])
      assert.throws(() => normalizeItems(values), TypeError);
   assert.throws(() => normalizeValue([Infinity]), TypeError);
});
test('TransferList filters each side by accent-insensitive label, description and category', () => {
   const items = catalog();
   assert.deepEqual(
      filterItems(items, ['read'], 'assigned', 'lectura').map((i) => i.value),
      ['read'],
   );
   assert.deepEqual(
      filterItems(items, ['read'], 'available', 'PROYECTOS').map(
         (i) => i.value,
      ),
      ['write'],
   );
   assert.equal(
      filterItems(items, [], 'available', 'informes')[0].value,
      'read',
   );
   assert.equal(filterItems(items, [], 'assigned', '').length, 0);
});
test('TransferList changes only movable catalog entries and retains unknown assigned values', () => {
   const items = catalog();
   const previous = ['future', 'admin', 'read'];
   const added = changeAssignment(
      items,
      previous,
      ['write', 0, 'disabled', 'admin', 'unknown', 'write'],
      'assign',
   );
   assert.deepEqual(added, {
      value: ['future', 'admin', 'read', 'write', 0],
      moved: ['write', 0],
   });
   assert.deepEqual(
      changeAssignment(
         items,
         added.value,
         ['future', 'admin', 'read', 0],
         'remove',
      ),
      { value: ['future', 'admin', 'write'], moved: ['read', 0] },
   );
   assert.deepEqual(previous, ['future', 'admin', 'read']);
   assert.throws(() => changeAssignment(items, [], [], 'other'), TypeError);
});
test('TransferList disjoint partitions and assign/remove round trip preserve the catalog', () => {
   const items = normalizeItems(
      Array.from({ length: 100 }, (_, value) => ({
         value,
         label: `Item ${value}`,
         locked: value % 9 === 0,
         disabled: value % 7 === 0,
      })),
   );
   const initial = ['not-loaded', 0, 10];
   const next = changeAssignment(
      items,
      initial,
      items.map((i) => i.value),
      'assign',
   );
   const left = filterItems(items, next.value, 'available'),
      right = filterItems(items, next.value, 'assigned');
   assert.equal(left.length + right.length, 100);
   assert.equal(new Set([...left, ...right].map((i) => i.value)).size, 100);
   const restored = changeAssignment(items, next.value, next.moved, 'remove');
   assert.deepEqual(restored.value, initial);
});
