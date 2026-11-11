import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';

// SkeletonService contract:
//   - cover(el) marks the LEAVES of what el renders (text runs, images, fields,
//     buttons, components' own leaves) with .slice-skeleton__leaf; the element
//     gets .slice-skeleton-host, aria-busy="true" and inert; a polite status
//     says "Loading…"; done() restores everything (attributes it had included)
//   - during(el, work) covers until work settles and returns its result
//   - repeat copies the first row without constructing components
//   - covering twice needs two done() calls

const HTML = `
  <article id="card" style="width:320px">
    <img id="photo" alt="" width="80" height="80" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">
    <h3 id="title">Item <b>#1000</b></h3>
    <div id="mixed">Value <p id="para">Two example items in a sentence.</p></div>
    <button id="buy">Action</button>
  </article>
  <ul id="list"><li class="row"><span class="name">User 1</span> <span class="when">today</span></li></ul>`;

const service = (page) => page.evaluate(async () => {
   await slice.build('SkeletonService', { singleton: true, sliceId: 'skeleton' });
});
const run = (page, fn) => page.evaluate(fn);

test.describe('SkeletonService', () => {
   test('cover marks the leaves, makes the element busy and inert; done puts it back', async ({ mountHtml, page }) => {
      await mountHtml(HTML);
      await service(page);
      const out = await run(page, () => {
         const sk = slice.controller.getComponent('skeleton');
         const card = document.getElementById('card');
         const done = sk.cover(card);
         const leaves = [...card.querySelectorAll('.slice-skeleton__leaf')].map((n) => n.id || `text in #${n.parentElement.id}`);
         const during = {
            busy: card.getAttribute('aria-busy'), inert: card.inert, host: card.classList.contains('slice-skeleton-host'),
            status: document.querySelector('.slice-skeleton-status')?.textContent,
            textColor: getComputedStyle(document.querySelector('#para .slice-skeleton__leaf')).color,
            textWidth: Math.round(document.querySelector('#para .slice-skeleton__leaf').getBoundingClientRect().width) < Math.round(document.getElementById('para').getBoundingClientRect().width) || null,
         };
         done();
         done();   // harmless twice
         return {
            leaves, during,
            after: { leaves: card.querySelectorAll('.slice-skeleton__leaf').length, busy: card.hasAttribute('aria-busy'), inert: card.inert, spans: card.querySelectorAll('.slice-skeleton__text').length, mixed: document.getElementById('mixed').firstChild.nodeType },
         };
      });
      // The image; the TEXT of the heading (with its <b>), of the run next to a
      // block and of the paragraph (wrapped, so a bar is as long as its text);
      // and the button.
      expect(out.leaves).toEqual(['photo', 'text in #title', 'text in #mixed', 'text in #para', 'buy']);
      expect(out.during.textColor).toBe('rgba(0, 0, 0, 0)');
      expect({ ...out.during, textColor: undefined, textWidth: undefined }).toEqual({ busy: 'true', inert: true, host: true, status: 'Loading…', textColor: undefined, textWidth: undefined });
      expect(out.after).toEqual({ leaves: 0, busy: false, inert: false, spans: 0, mixed: 3 });
      expect(await page.locator('#title').innerHTML()).toBe('Item <b>#1000</b>');
   });

   test('the shape is the layout: covering does not move anything', async ({ mountHtml, page }) => {
      await mountHtml(HTML);
      await service(page);
      const moved = await run(page, () => {
         const sk = slice.controller.getComponent('skeleton');
         const card = document.getElementById('card');
         const boxes = () => [...card.querySelectorAll('*')].map((n) => { const b = n.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(Math.round).join(); });
         const before = boxes();
         const done = sk.cover(card);
         const during = [...card.querySelectorAll('*')].filter((n) => !n.classList.contains('slice-skeleton__text')).map((n) => { const b = n.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(Math.round).join(); });
         done();
         return before.filter((b) => !during.includes(b));
      });
      expect(moved).toEqual([]);
   });

   test('during() covers until the work settles and returns its result (and uncovers on errors)', async ({ mountHtml, page }) => {
      await mountHtml(HTML);
      await service(page);
      const out = await run(page, async () => {
         const sk = slice.controller.getComponent('skeleton');
         const card = document.getElementById('card');
         let seen = null;
         const value = await sk.during(card, async () => { seen = sk.isCovered(card); return 42; });
         let failed = false;
         try { await sk.during(card, Promise.reject(new Error('offline'))); } catch { failed = true; }
         return { value, seen, failed, after: sk.isCovered(card), busy: card.hasAttribute('aria-busy') };
      });
      expect(out).toEqual({ value: 42, seen: true, failed: true, after: false, busy: false });
   });

   test('repeat shows N rows while loading, without building components', async ({ mountHtml, page }) => {
      await mountHtml(HTML);
      await service(page);
      const out = await run(page, async () => {
         const sk = slice.controller.getComponent('skeleton');
         const list = document.getElementById('list');
         const badge = await slice.build('Badge', { label: 'new' });
         list.querySelector('.row').append(badge);
         const components = slice.controller.activeComponents.size;
         const done = sk.cover(list, { repeat: 4 });
         const rows = list.children.length;
         const ghosts = list.querySelectorAll('.slice-skeleton__ghost').length;
         const hidden = [...list.querySelectorAll('.slice-skeleton__ghost')].every((g) => g.getAttribute('aria-hidden') === 'true');
         const badges = list.querySelectorAll('slice-badge').length;
         const sameCount = slice.controller.activeComponents.size === components;
         done();
         return { rows, ghosts, hidden, badges, sameCount, after: list.children.length };
      });
      expect(out).toEqual({ rows: 4, ghosts: 3, hidden: true, badges: 1, sameCount: true, after: 1 });
   });

   test('covering twice needs two done(); attributes the element had are restored', async ({ mountHtml, page }) => {
      await mountHtml(HTML);
      await service(page);
      const out = await run(page, () => {
         const sk = slice.controller.getComponent('skeleton');
         const card = document.getElementById('card');
         card.setAttribute('aria-busy', 'false');
         const a = sk.cover(card);
         const b = sk.cover(card);
         a();
         const still = sk.isCovered(card);
         b();
         return { still, after: sk.isCovered(card), busy: card.getAttribute('aria-busy'), status: document.querySelector('.slice-skeleton-status').textContent };
      });
      expect(out).toEqual({ still: true, after: false, busy: 'false', status: '' });
   });

   test('a component covered as it is: its own leaves, nothing declared on it', async ({ mount, page }) => {
      const c = await mount('Card', { title: 'Loading title', text: 'Two lines of placeholder text for the card.', variant: 'outlined' });
      await service(page);
      const count = await c.component.evaluate((card) => {
         const sk = slice.controller.getComponent('skeleton');
         sk.cover(card);
         return card.querySelectorAll('.slice-skeleton__leaf').length;
      });
      expect(count).toBeGreaterThanOrEqual(2);
      await expect(c.component).toHaveAttribute('aria-busy', 'true');
      expect(c.pageErrors()).toEqual([]);
   });

   test('destroying the service uncovers everything and removes its status and style', async ({ mountHtml, page }) => {
      await mountHtml(HTML);
      await service(page);
      const out = await run(page, () => {
         const sk = slice.controller.getComponent('skeleton');
         const card = document.getElementById('card');
         sk.cover(card);
         slice.controller.destroyComponent('skeleton');
         return { covered: card.classList.contains('slice-skeleton-host'), inert: card.inert, status: !!document.querySelector('.slice-skeleton-status'), style: !!document.getElementById('slice-skeleton-style') };
      });
      expect(out).toEqual({ covered: false, inert: false, status: false, style: false });
   });

   test('covered before it is on the page: painted once it is appended', async ({ page, mountHtml }) => {
      await mountHtml('<div id="slot"></div>');
      await service(page);
      const out = await run(page, async () => {
         const sk = slice.controller.getComponent('skeleton');
         const card = document.createElement('p');
         card.textContent = 'A line of text';
         sk.cover(card);
         const before = card.querySelectorAll('.slice-skeleton__leaf').length;
         document.getElementById('slot').append(card);
         await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
         return { before, after: card.querySelectorAll('.slice-skeleton__leaf').length, busy: card.getAttribute('aria-busy') };
      });
      expect(out).toEqual({ before: 0, after: 1, busy: 'true' });
   });
});
