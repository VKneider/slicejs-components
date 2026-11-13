import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStep, cancellable } from './parts/steps.js';
import { placeCard } from '../../Visual/TourOverlay/parts/placement.js';

test('normalize a step without mutating the caller or text overrides', () => {
   const input = { placement: 'elsewhere', padding: -1, timeout: -8, texts: { next: 'Go' } };
   const step = normalizeStep(input, { padding: 12, texts: { back: 'Return' } });
   assert.equal(step.placement, 'auto'); assert.equal(step.padding, 8);
   assert.equal(step.timeout, 5000); assert.equal(step.fallback, 'skip');
   assert.deepEqual(step.texts, { back: 'Return', next: 'Go' });
   assert.deepEqual(input.texts, { next: 'Go' });
   assert.equal(normalizeStep({ timeout: 0, spotlight: false }).timeout, 0);
   assert.equal(normalizeStep({ spotlight: false }).spotlight, false);
});

test('async app work can be cancelled or bounded without waiting for its promise', async () => {
   const controller = new AbortController();
   const work = cancellable(() => new Promise(() => {}), controller.signal, 1000);
   controller.abort();
   await assert.rejects(work, { name: 'AbortError' });
   await assert.rejects(cancellable(() => new Promise(() => {}), new AbortController().signal, 1), /timed out/);
   assert.equal(await cancellable(() => 42, new AbortController().signal, 100), 42);
});

test('placement flips, shifts, centers when crowded and clamps the arrow', () => {
   const viewport = { width: 800, height: 600 }, card = { width: 300, height: 180 };
   const target = { left: 700, right: 780, top: 500, bottom: 540, width: 80, height: 40 };
   const pos = placeCard(target, card, 'bottom', viewport);
   assert.equal(pos.side, 'top'); assert.equal(pos.left, 488);
   assert.ok(pos.arrow <= 280);
   assert.equal(placeCard(null, card, 'auto', viewport).side, 'center');
   assert.equal(placeCard(target, { width: 790, height: 590 }, 'auto', viewport).side, 'center');
});

// Orchestration tests isolate browser effects; the adjacent Playwright spec covers the real DOM.
import TourService from './TourService.js';

function environment() {
   const originals = new Map();
   const put = (key, value) => { originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { value, configurable: true, writable: true }); };
   const frames = new Map(), subscriptions = new Map(), overlays = [], logs = [], destroyed = [];
   let serial = 0;
   class FakeElement extends EventTarget {
      constructor() { super(); this.isConnected = true; this.inert = false; this.style = {}; this.tagName = 'DIV'; }
      getClientRects() { return this.isConnected ? [this.getBoundingClientRect()] : []; }
      getBoundingClientRect() { return { left: 100, top: 100, right: 200, bottom: 140, width: 100, height: 40 }; }
      scrollIntoView() {}
      contains(node) { return node === this; }
      focus() { document.activeElement = this; }
      querySelectorAll() { return []; }
   }
   const target = new FakeElement(), opener = new FakeElement();
   const elements = new Map([['#target', target]]);
   const doc = new EventTarget();
   doc.body = new FakeElement(); doc.body.children = [target];
   doc.activeElement = opener;
   doc.querySelector = selector => elements.get(selector) || null;
   const win = new EventTarget(); win.scrollTo = () => {}; win.scrollY = 0;
   put('Element', FakeElement); put('document', doc); put('window', win);
   put('getComputedStyle', () => ({ visibility: 'visible', display: 'block', borderRadius: '8px' }));
   put('MutationObserver', class { observe() {} disconnect() {} });
   put('requestAnimationFrame', fn => { frames.set(++serial, fn); return serial; });
   put('cancelAnimationFrame', id => frames.delete(id));
   const stored = new Map();
   put('localStorage', { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) });
   put('slice', {
      logger: { logError: (...args) => logs.push(args), logWarning: (...args) => logs.push(args) },
      events: {
         subscribe: (name, fn) => { const id = `subscription-${++serial}`; subscriptions.set(id, { name, fn }); return id; },
         unsubscribe: (name, id) => subscriptions.delete(id),
         emit: (name, detail) => { for (const entry of [...subscriptions.values()]) if (entry.name === name) entry.fn(detail); },
      },
      build: async () => {
         const overlay = { $card: new FakeElement(), view: null, show() {}, track(rect) { this.rect = rect; } };
         overlays.push(overlay); return overlay;
      },
      controller: { destroyComponent: component => { destroyed.push(component); component.beforeDestroy?.(); } },
   });
   const services = [];
   return {
      target, elements, opener, frames, overlays, logs, destroyed, subscriptions, stored,
      service() { const service = new TourService(); services.push(service); return service; },
      async ready(tour) {
         for (let i = 0; i < 100 && (!tour.overlay || tour.overlay.view.preparing); i++) await new Promise(resolve => setTimeout(resolve, 1));
         assert.equal(tour.overlay?.view.preparing, false, 'tour reached an active step');
      },
      close() {
         for (const service of services) service.beforeDestroy();
         for (const [key, descriptor] of originals) {
            if (descriptor) Object.defineProperty(globalThis, key, descriptor);
            else delete globalThis[key];
         }
      },
   };
}

test('navigation settles once, completion is persisted and reset; cleanup releases listeners and page state', async () => {
   const env = environment();
   try {
      const tour = env.service(), steps = [{ target: '#target', title: 'First' }, { target: '#target', title: 'Last' }];
      let endCount = 0;
      const ended = tour.start(steps, { storageKey: 'intro', scrollIntoView: false, onEnd: () => endCount++ });
      await env.ready(tour);
      assert.equal(tour.index, 0); assert.equal(env.target.inert, true);
      tour.next(); await env.ready(tour); assert.equal(tour.index, 1);
      tour.prev(); await env.ready(tour); assert.equal(tour.index, 0);
      tour.next(); await env.ready(tour); tour.next();
      assert.deepEqual(await ended, { completed: true, reason: 'completed' });
      tour.stop(); assert.equal(endCount, 1);
      assert.equal(tour.index, -1); assert.equal(env.target.inert, false);
      assert.equal(env.frames.size, 0); assert.equal(env.subscriptions.size, 0);
      assert.equal(document.activeElement, env.opener);
      assert.ok(env.stored.has('intro'));
      assert.deepEqual(await tour.start(steps, { storageKey: 'intro' }), { completed: true, reason: 'completed' });
      assert.equal(tour.overlay, null);
      tour.reset(); assert.equal(env.stored.has('intro'), false);
   } finally { env.close(); }
});

test('replacing a run cancels pending hooks; a second service replaces globally; route unsubscribes', async () => {
   const env = environment();
   try {
      const first = env.service(), second = env.service();
      let signal;
      const old = first.start([{ target: '#target', beforeStep: ctx => { signal = ctx.signal; return new Promise(() => {}); } }]);
      await new Promise(resolve => setTimeout(resolve, 1));
      const ended = second.start([{ target: '#target', interactive: true }], { scrollIntoView: false });
      await env.ready(second);
      assert.deepEqual(await old, { completed: false, reason: 'replaced' });
      assert.equal(signal.aborted, true); assert.equal(env.target.inert, false);
      assert.equal(env.subscriptions.size, 1);
      slice.events.emit('router:change', {});
      assert.deepEqual(await ended, { completed: false, reason: 'route' });
      assert.equal(env.subscriptions.size, 0);
   } finally { env.close(); }
});

test('wait predicates time out to fallback even when the target exists; missing steps never complete a tour', async () => {
   const env = environment();
   try {
      const tour = env.service(); let missing = 0;
      const ended = tour.start([
         { target: '#absent' },
         { target: '#target', waitFor: () => new Promise(() => {}), timeout: 5, fallback: 'center', onTargetMissing: () => missing++ },
      ], { scrollIntoView: false });
      await env.ready(tour);
      assert.equal(tour.index, 1); assert.equal(tour.overlay.view.missing, true);
      assert.equal(tour.overlay.rect, null); assert.equal(missing, 1);
      const frame = [...env.frames.values()].at(-1); frame();
      assert.equal(tour.overlay.rect, null, 'timed-out wait remains centered even if its target exists');
      tour.stop(); await ended;
      assert.deepEqual(await tour.start([{ target: '#absent' }]), { completed: false, reason: 'target-missing' });
   } finally { env.close(); }
});

test('beforeStep skips, overrides, errors, and afterStep failure cleans up', async () => {
   const env = environment();
   try {
      const tour = env.service();
      const ended = tour.start([
         { beforeStep: () => false },
         { target: '#absent', beforeStep: () => ({ target: env.target }), afterStep: () => { throw new Error('Save failed'); } },
      ], { scrollIntoView: false });
      await env.ready(tour); assert.equal(tour.index, 1);
      tour.next(); assert.deepEqual(await ended, { completed: false, reason: 'error' });
      assert.equal(env.subscriptions.size, 0); assert.equal(env.target.inert, false);
      assert.deepEqual(await tour.start([{ beforeStep: () => { throw new Error('Open failed'); } }]), { completed: false, reason: 'error' });
   } finally { env.close(); }
});

test('destroy during overlay construction disposes the late result; storage failure is nonfatal', async () => {
   const env = environment();
   try {
      const tour = env.service();
      let resolve;
      slice.build = () => new Promise(r => { resolve = r; });
      const ended = tour.start([{ target: '#target' }]);
      tour.beforeDestroy();
      const late = {};
      resolve(late);
      await new Promise(r => setTimeout(r, 1));
      assert.deepEqual(await ended, { completed: false, reason: 'stopped' });
      assert.ok(env.destroyed.includes(late));
      assert.equal(env.subscriptions.size, 0);
      const another = env.service();
      localStorage.getItem = () => { throw new Error('Denied'); };
      const replay = another.start([], { storageKey: 'blocked' });
      assert.equal((await replay).completed, false);
      assert.equal(another._storage('get', 'blocked'), false);
      assert.equal(another._storage('set', 'blocked'), false);
   } finally { env.close(); }
});
