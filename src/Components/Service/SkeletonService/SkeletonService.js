// SkeletonService — the loading state of ANY component, drawn from the component
// itself. No skeleton markup to write and nothing to declare on the component:
// what is on screen becomes its own placeholder.
//
//   const skeleton = await slice.build('SkeletonService', { singleton: true, sliceId: 'skeleton' });
//
//   // Refreshing: the current content dims into shapes until the new data is in.
//   const rows = await skeleton.during(table, fetchOrders());
//   table.rows = rows;
//
//   // First load: build the component with what you have (or placeholder text)
//   // and cover it.
//   const card = await slice.build('Card', { title: 'Loading title', text: 'Two lines of text…' });
//   const done = skeleton.cover(card);
//   …
//   done();
//
//   // A list with one row: show six while loading.
//   skeleton.cover(list, { repeat: 6 });
//   skeleton.cover(table, { repeat: 8, item: 'tbody tr' });
//
// How: it marks the LEAVES of what is rendered — text, images, icons, fields,
// buttons — and a stylesheet turns each into a shimmering block of exactly its
// own size. The layout does not move by a pixel when the data arrives, because
// the shapes ARE the layout.
//
// While covered the element is `aria-busy="true"` and `inert` (no clicks, no
// focus, no screen-reader reading of stale text), and a polite status says
// "Loading…" once. `prefers-reduced-motion` keeps the blocks still.

import { texts } from '../../shared/text/texts.js';

const t = texts('slice.skeleton', {
   en: { loading: 'Loading…' },
   es: { loading: 'Cargando…' },
});

const LEAF = 'slice-skeleton__leaf';
const HOST = 'slice-skeleton-host';
const TEXT = 'slice-skeleton__text';
const GHOST = 'slice-skeleton__ghost';
const STYLE_ID = 'slice-skeleton-style';
// Parts that label the interface rather than show data: column headers, field
// labels, legends. They stay as they are. `keep` replaces it ('' keeps nothing).
const KEEP = 'th, thead, label, legend, [data-skeleton-keep]';

// Replaced or opaque content: always a block of its own size.
const SOLID = new Set(['IMG', 'SVG', 'VIDEO', 'CANVAS', 'PICTURE', 'IFRAME', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'PROGRESS', 'METER', 'HR']);
// Never painted.
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'OPTION', 'BR', 'WBR', 'SOURCE', 'TRACK']);

const LEAFS = `.${HOST} .${LEAF}, .${HOST}.${LEAF}`;

const CSS = `
:where(.${HOST}) {
  --slice-skeleton-color: color-mix(in srgb, var(--font-primary-color, #222) 11%, transparent);
  --slice-skeleton-shine: color-mix(in srgb, var(--primary-background-color, #fff) 55%, transparent);
  --slice-skeleton-radius: 6px;
  --slice-skeleton-speed: 1.4s;
}
.${HOST} { cursor: progress; }
${LEAFS} {
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
  text-shadow: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  background: var(--slice-skeleton-color) !important;
  background-image: linear-gradient(90deg, transparent 0%, var(--slice-skeleton-shine) 50%, transparent 100%) !important;
  background-size: 200% 100% !important;
  background-repeat: no-repeat !important;
  border-radius: var(--slice-skeleton-own-radius, var(--slice-skeleton-radius)) !important;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  animation: slice-skeleton-shine var(--slice-skeleton-speed) ease-in-out infinite;
  user-select: none;
}
${LEAFS.split(', ').map((x) => `${x} *`).join(', ')} { visibility: hidden !important; }
${LEAFS.split(', ').map((x) => `${x}::placeholder`).join(', ')} { color: transparent !important; }
.${HOST} img.${LEAF}, .${HOST} video.${LEAF} { object-position: -99999px 0 !important; }
.${HOST} :is(svg, canvas, iframe).${LEAF} { opacity: 0.5; }
${LEAFS.split(', ').map((x) => `${x}[data-skeleton-shape="circle"]`).join(', ')} { border-radius: 50% !important; }
.${HOST} .${GHOST} { pointer-events: none; }
@keyframes slice-skeleton-shine {
  0% { background-position: 150% 0; }
  100% { background-position: -50% 0; }
}
@media (prefers-reduced-motion: reduce) {
  ${LEAFS} { animation: none; background-image: none !important; }
}
.slice-skeleton-status {
  position: fixed; width: 1px; height: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}
`;

/**
 * @typedef {{ repeat?: number, item?: string, label?: string, keep?: string }} CoverOptions
 * @typedef {{ count: number, marked: Element[], radii: Element[], wrapped: HTMLElement[], ghosts: Element[], frame: number, tries: number,
 *             inert: boolean, busy: string | null }} Cover
 */

export default class SkeletonService {
   constructor() {
      /** @type {Map<Element, Cover>} */
      this._covers = new Map();
      this._status = /** @type {HTMLElement | null} */ (null);
      this._ownsStyle = false;
   }

   init() {
      this._ensureStyle();
   }

   beforeDestroy() {
      for (const element of [...this._covers.keys()]) this._restore(element);
      this._covers.clear();
      this._status?.remove();
      this._status = null;
      if (this._ownsStyle) document.getElementById(STYLE_ID)?.remove();
   }

   /**
    * Turn what `element` shows into its own skeleton. Returns `done()`, which
    * puts it back (calling it twice is harmless). Covering an element that is
    * already covered counts: it comes back when every `done()` has run.
    * @param {Element} element
    * @param {CoverOptions} [options]
    * @returns {() => void}
    */
   cover(element, options = {}) {
      if (!(element instanceof Element)) return () => {};
      this._ensureStyle();
      const existing = this._covers.get(element);
      if (existing) {
         existing.count += 1;
         return this._doneOnce(element);
      }

      /** @type {Cover} */
      const state = {
         count: 1,
         marked: [],
         radii: [],
         wrapped: [],
         frame: 0,
         tries: 0,
         ghosts: [],
         inert: /** @type {any} */ (element).inert === true,
         busy: element.getAttribute('aria-busy'),
      };
      this._covers.set(element, state);

      element.classList.add(HOST);
      element.setAttribute('aria-busy', 'true');
      /** @type {any} */ (element).inert = true;
      this._announce(options.label || t('loading'));

      // The shapes are measured, so the element has to be on the page. Covered
      // before it is (built, covered, then returned to be appended): wait for it.
      const paint = () => {
         state.frame = 0;
         if (this._covers.get(element) !== state) return;
         if (!element.isConnected) {
            if (++state.tries < 120) state.frame = requestAnimationFrame(paint);
            return;
         }
         // Rows first, so the copies are painted too.
         const repeat = Math.max(0, Math.floor(Number(options.repeat) || 0));
         if (repeat > 1) this._repeat(element, repeat, options.item, state);
         this._mark(element, state, options.keep === undefined ? KEEP : options.keep);
      };
      paint();
      return this._doneOnce(element);
   }

   /**
    * Cover `element` until `work` settles, and give back its result (or throw
    * its error, uncovered). `work` is a promise or a function returning one.
    * @template T
    * @param {Element} element
    * @param {Promise<T> | (() => Promise<T>)} work
    * @param {CoverOptions} [options]
    * @returns {Promise<T>}
    */
   async during(element, work, options = {}) {
      const done = this.cover(element, options);
      try {
         return await (typeof work === 'function' ? work() : work);
      } finally {
         done();
      }
   }

   /** Uncover now, whatever the count. */
   uncover(element) {
      if (this._covers.has(element)) this._restore(element);
   }

   /** Whether `element` is covered. */
   isCovered(element) {
      return this._covers.has(element);
   }

   // ── Internals ──────────────────────────────────────────────────

   _doneOnce(element) {
      let called = false;
      return () => {
         if (called) return;
         called = true;
         const state = this._covers.get(element);
         if (!state) return;
         state.count -= 1;
         if (state.count <= 0) this._restore(element);
      };
   }

   _ensureStyle() {
      if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      document.head.appendChild(style);
      this._ownsStyle = true;
   }

   /**
    * Walk the rendered tree and mark its leaves.
    * @param {Element} root @param {Cover} state
    */
   _mark(root, state, keep = KEEP) {
      const visit = (/** @type {Element} */ el) => {
         if (SKIP.has(el.tagName.toUpperCase())) return;
         // Labels of the interface, not data: they stay readable.
         if (keep && el.matches(keep)) return;
         if (el.classList.contains(LEAF)) return;
         const tag = el.tagName.toUpperCase();
         const style = getComputedStyle(el);
         if (style.display === 'none' || style.visibility === 'hidden') return;

         // Replaced content, fields, buttons, images by role: one block, as is.
         if (SOLID.has(tag) || el.getAttribute('role') === 'img' || el.getAttribute('role') === 'button') {
            this._leaf(el, state);
            return;
         }

         const children = [...el.childNodes];
         const hasText = children.some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
         const elements = children.filter((n) => n.nodeType === Node.ELEMENT_NODE);

         if (hasText && elements.every((n) => isInline(/** @type {Element} */ (n)))) {
            // A run of text (with <b>, <a>, <code>… inside). Painted as the TEXT,
            // not the box: an inline wrapper's background follows each line, so a
            // short name in a wide cell is a short bar. An inline element is
            // already that; a run holding a component is painted whole (its
            // nodes are not moved).
            if (style.display === 'inline' || elements.some((n) => /** @type {Element} */ (n).tagName.includes('-'))) {
               this._leaf(el, state);
               return;
            }
            const span = document.createElement('span');
            span.className = TEXT;
            span.append(...el.childNodes);
            el.append(span);
            state.wrapped.push(span);
            this._leaf(span, state);
            return;
         }
         if (hasText) {
            // Text next to blocks: wrap each text run so only the text is painted.
            for (const node of children) {
               if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;
               const span = document.createElement('span');
               span.className = TEXT;
               node.replaceWith(span);
               span.appendChild(node);
               state.wrapped.push(span);
               this._leaf(span, state);
            }
         }
         if (!elements.length && !hasText) {
            // An empty box with a picture of its own (an avatar, a swatch).
            const box = el.getBoundingClientRect();
            if (style.backgroundImage !== 'none' && box.width > 0 && box.height > 0) this._leaf(el, state);
            return;
         }
         for (const child of elements) visit(/** @type {Element} */ (child));
      };
      visit(root);
   }

   /** @param {Element} el @param {Cover} state */
   _leaf(el, state) {
      const box = el.getBoundingClientRect();
      // The shape's corners: the element's own, or those of a child that fills it
      // (a component host whose round face is inside, like Avatar).
      const radiusOf = (/** @type {Element} */ node) => {
         const r = getComputedStyle(node).borderTopLeftRadius;
         return r.endsWith('%') ? (parseFloat(r) / 100) * box.width : parseFloat(r) || 0;
      };
      let radius = radiusOf(el);
      const inner = el.firstElementChild;
      if (!radius && inner) {
         const b = inner.getBoundingClientRect();
         if (Math.abs(b.width - box.width) < 2 && Math.abs(b.height - box.height) < 2) radius = radiusOf(inner);
      }
      el.classList.add(LEAF);
      if (box.width > 0 && Math.abs(box.width - box.height) < 2 && radius >= box.width / 2 - 1) {
         el.setAttribute('data-skeleton-shape', 'circle');
      } else if (radius > 0) {
         /** @type {HTMLElement} */ (el).style.setProperty('--slice-skeleton-own-radius', `${radius}px`);
         state.radii.push(el);
      }
      state.marked.push(el);
   }

   /**
    * Show `count` rows while loading, copying the first one. Copies are plain
    * markup: a custom element (a component) inside the row becomes an empty box
    * of the same size, so no component is constructed and nothing is registered.
    * @param {Element} root @param {number} count @param {string | undefined} selector @param {Cover} state
    */
   _repeat(root, count, selector, state) {
      const first = selector ? root.querySelector(selector) : root.firstElementChild;
      if (!first || !first.parentNode) return;
      const siblings = selector ? root.querySelectorAll(selector).length : root.children.length;
      let anchor = first;
      for (let i = siblings; i < count; i++) {
         const ghost = ghostOf(first);
         ghost.classList.add(GHOST);
         ghost.setAttribute('aria-hidden', 'true');
         anchor.after(ghost);
         anchor = ghost;
         state.ghosts.push(ghost);
      }
   }

   /** @param {Element} element */
   _restore(element) {
      const state = this._covers.get(element);
      this._covers.delete(element);
      if (!state) return;
      cancelAnimationFrame(state.frame);
      for (const ghost of state.ghosts) ghost.remove();
      for (const el of state.marked) {
         el.classList.remove(LEAF);
         el.removeAttribute('data-skeleton-shape');
      }
      for (const el of state.radii) /** @type {HTMLElement} */ (el).style.removeProperty('--slice-skeleton-own-radius');
      for (const span of state.wrapped) {
         // The component may have re-rendered meanwhile: only unwrap what is still there.
         if (span.parentNode) span.replaceWith(...span.childNodes);
      }
      element.classList.remove(HOST);
      if (state.busy === null) element.removeAttribute('aria-busy');
      else element.setAttribute('aria-busy', state.busy);
      /** @type {any} */ (element).inert = state.inert;
      if (!this._covers.size && this._status) this._status.textContent = '';
   }

   /** @param {string} message */
   _announce(message) {
      if (!this._status) {
         this._status = document.createElement('div');
         this._status.className = 'slice-skeleton-status';
         this._status.setAttribute('role', 'status');
         document.body.appendChild(this._status);
      }
      // Once while anything is loading, not once per covered element.
      if (this._status.textContent !== message) this._status.textContent = message;
   }
}

const INLINE = new Set(['A', 'ABBR', 'B', 'BDI', 'BDO', 'CITE', 'CODE', 'DATA', 'DFN', 'EM', 'I', 'KBD', 'MARK', 'Q', 'S', 'SAMP', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TIME', 'U', 'VAR', 'BR', 'WBR']);

/** @param {Element} el */
function isInline(el) {
   if (INLINE.has(el.tagName.toUpperCase())) return true;
   const display = getComputedStyle(el).display;
   return display === 'inline' || display === 'contents';
}

/**
 * A copy of `node` without components: native elements are cloned shallowly
 * (classes and inline styles kept), custom elements become a box of their size.
 * @param {Element} node
 * @returns {Element}
 */
function ghostOf(node) {
   if (node.tagName.includes('-')) {
      let display = getComputedStyle(node).display;
      let box = node.getBoundingClientRect();
      // A host with display: contents has no box of its own: its content's.
      if (display === 'contents' && node.firstElementChild) {
         box = node.firstElementChild.getBoundingClientRect();
         display = getComputedStyle(node.firstElementChild).display;
      }
      const stand = document.createElement('span');
      stand.style.display = display === 'inline' ? 'inline-block' : display;
      stand.style.width = `${box.width}px`;
      stand.style.height = `${box.height}px`;
      stand.style.maxWidth = '100%';
      const face = getComputedStyle(node).borderRadius !== '0px' ? node : node.firstElementChild;
      if (face) stand.style.borderRadius = getComputedStyle(face).borderRadius;
      stand.setAttribute('role', 'img');
      return stand;
   }
   const copy = /** @type {Element} */ (node.cloneNode(false));
   if (copy instanceof HTMLElement && node instanceof HTMLElement && !copy.getAttribute('style')) {
      // The copy loses the rules written for the component around it
      // ('slice-x .row'): keep the layout it had.
      const cs = getComputedStyle(node);
      for (const prop of ['display', 'gridTemplateColumns', 'gap', 'alignItems', 'flexDirection', 'padding']) copy.style[prop] = cs[prop];
   }
   copy.removeAttribute('id');
   copy.removeAttribute('slice-id');
   for (const child of node.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) copy.appendChild(ghostOf(/** @type {Element} */ (child)));
      else if (child.nodeType === Node.TEXT_NODE) copy.appendChild(child.cloneNode());
   }
   return copy;
}
