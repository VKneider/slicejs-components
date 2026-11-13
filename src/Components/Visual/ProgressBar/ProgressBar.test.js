import test from 'node:test';
import assert from 'node:assert/strict';
import { progressValue } from './parts/value.js';

test('progress domain clamps finite values and always has a positive finite maximum', () => {
   assert.deepEqual(progressValue(25, 50), { value: 25, max: 50, ratio: .5 });
   assert.deepEqual(progressValue(-5, 50), { value: 0, max: 50, ratio: 0 });
   assert.deepEqual(progressValue(1000, 3), { value: 3, max: 3, ratio: 1 });
   for (const max of [0, -1, NaN, Infinity, 'invalid']) assert.equal(progressValue(42, max).max, 100);
   for (const value of [NaN, Infinity, -Infinity, 'invalid']) assert.equal(progressValue(value, 50).value, 0);
});

test('reading a new maximum does not destroy the assigned value', () => {
   const assigned = 80;
   assert.equal(progressValue(assigned, 50).value, 50);
   assert.equal(progressValue(assigned, 100).value, 80);
});
