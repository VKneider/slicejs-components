import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeItems, activeId, canSelect } from './parts/model.js';
const opts = { mode: 'interactive', clickable: true, disabled: false, linear: true };

test('ids are stable strings, invalid statuses normalize, duplicate ids fail clearly', () => {
   const input = [{ id: 0, title: 'Contact', status: 'done' }, null, { id: 'payment', status: 'broken' }];
   const items = normalizeItems(input);
   assert.equal(items[0].id, '0'); assert.equal(items[1].status, 'upcoming');
   assert.equal(input[0].id, 0);
   assert.throws(() => normalizeItems([{ id: 1 }, { id: '1' }]), /unique/);
   assert.deepEqual(normalizeItems(null), []);
});

test('static has no current item; interactive resolves one current item and skips disabled items', () => {
   const items = normalizeItems([{ id: 'a', disabled: true }, { id: 'b' }, { id: 'c', status: 'current' }]);
   assert.equal(activeId(items, 'b', 'static'), null);
   assert.equal(activeId(items, null, 'interactive'), 'c');
   assert.equal(activeId(items, 'b', 'interactive'), 'b');
   assert.equal(activeId(items, 'a', 'interactive'), 'c');
   assert.equal(activeId(normalizeItems([{ disabled: true }]), null, 'interactive'), null);
});

test('linear navigation gates future steps, permits completed steps, and reacts to immutable completion', () => {
   const items = normalizeItems([{ id: 'a', status: 'done' }, { id: 'b', status: 'error' }, { id: 'c' }]);
   assert.equal(canSelect(items, 0, opts), true);
   assert.equal(canSelect(items, 1, opts), true);
   assert.equal(canSelect(items, 2, opts), false);
   assert.equal(canSelect(items, 2, { ...opts, linear: false }), true);
   const next = normalizeItems(items.map(item => item.id === 'b' ? { ...item, status: 'done' } : item));
   assert.equal(canSelect(next, 2, opts), true);
   assert.equal(items[1].status, 'error');
});

test('static, read-only, disabled and invalid item navigation cannot activate a step', () => {
   const items = normalizeItems([{ id: 'a' }, { id: 'b', disabled: true }]);
   assert.equal(canSelect(items, 0, { ...opts, mode: 'static' }), false);
   assert.equal(canSelect(items, 0, { ...opts, clickable: false }), false);
   assert.equal(canSelect(items, 0, { ...opts, disabled: true }), false);
   assert.equal(canSelect(items, 1, { ...opts, linear: false }), false);
   assert.equal(canSelect(items, -1, opts), false);
});
