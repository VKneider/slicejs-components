// Lightbox — photos at full size, one at a time: a product's gallery, a
// portfolio, the pictures of a listing, the screenshots of a release.
//
//   const viewer = await slice.build('Lightbox', {
//      items: [{ src: '/img/1.jpg', alt: 'Example image 1', caption: 'Description 1' }, …],
//   });
//   viewer.open(2);
//
//   // Or turn an existing gallery into one: every link to an image inside it opens
//   // the viewer at that image (alt from the <img>, caption from data-caption or
//   // the <figcaption>). Links keep working without JavaScript.
//   viewer.attach(gallery);                  // 'a[href]' by default
//   viewer.attach(grid, { selector: 'img' }); // or the images themselves
//
// On a native modal <dialog>: the top layer, the page inert behind it, Escape,
// and focus kept inside and handed back to whatever opened it. On top of that:
//   ← → Home End        previous, next, first, last (`loop` wraps around)
//   swipe               left / right to move, down to close
//   zoom                the button, a click on the picture (at that point), + - 0;
//                       drag to pan while zoomed; Escape zooms out first
//   thumbnails          a strip to jump to any image (`thumbnails`)
//   preloading          the next and previous images load in the background
//   a broken image      says so instead of an empty frame
// The page does not scroll behind it (the scroll lock is shared with Modal).

import { texts } from '../../shared/text/texts.js';
import { lockScroll } from '../../shared/overlay/scrollLock.js';

const t = texts('slice.lightbox', {
   en: {
      label: 'Image viewer', count: '{index} / {total}', prev: 'Previous image', next: 'Next image',
      close: 'Close', zoomIn: 'Zoom in', zoomOut: 'Zoom out', thumb: 'Image {index}', error: 'This image could not be loaded.',
   },
   es: {
      label: 'Visor de imágenes', count: '{index} / {total}', prev: 'Imagen anterior', next: 'Imagen siguiente',
      close: 'Cerrar', zoomIn: 'Acercar', zoomOut: 'Alejar', thumb: 'Imagen {index}', error: 'No se pudo cargar esta imagen.',
   },
});

const SWIPE = 50;          // px to count as a swipe
const SWIPE_CLOSE = 90;    // px down to close

/** @typedef {{ src: string, alt?: string, caption?: string, thumb?: string, srcset?: string, sizes?: string }} LightboxItem */

export default class Lightbox extends HTMLElement {
   static props = {
      // Images: { src, alt, caption, thumb, srcset, sizes }, or plain URLs.
      items: { type: 'array', default: [] },
      // The image shown (0-based). Setting it while open moves to it.
      index: { type: 'number', default: 0 },
      // Next from the last goes to the first.
      loop: { type: 'boolean', default: false },
      // The strip of small images at the bottom (shown when there are 2 or more).
      thumbnails: { type: 'boolean', default: true },
      zoom: { type: 'boolean', default: true },
      // How far the zoom goes.
      maxZoom: { type: 'number', default: 2.5 },
      // onChange(index, item) when the image shown changes while open.
      onChange: { type: 'function', default: null },
      onOpen: { type: 'function', default: null },
      onClose: { type: 'function', default: null },
      texts: { type: 'object', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.$dialog = /** @type {HTMLDialogElement} */ (this.querySelector('.slice-lightbox'));
      this.$count = this.querySelector('.slice-lightbox__count');
      this.$zoom = /** @type {HTMLButtonElement} */ (this.querySelector('.slice-lightbox__zoom'));
      this.$close = /** @type {HTMLButtonElement} */ (this.querySelector('.slice-lightbox__close'));
      this.$stage = /** @type {HTMLElement} */ (this.querySelector('.slice-lightbox__stage'));
      this.$prev = /** @type {HTMLButtonElement} */ (this.querySelector('.slice-lightbox__nav--prev'));
      this.$next = /** @type {HTMLButtonElement} */ (this.querySelector('.slice-lightbox__nav--next'));
      this.$frame = /** @type {HTMLElement} */ (this.querySelector('.slice-lightbox__frame'));
      this.$img = /** @type {HTMLImageElement} */ (this.querySelector('.slice-lightbox__img'));
      this.$error = /** @type {HTMLElement} */ (this.querySelector('.slice-lightbox__error'));
      this.$caption = /** @type {HTMLElement} */ (this.querySelector('.slice-lightbox__caption'));
      this.$thumbs = /** @type {HTMLElement} */ (this.querySelector('.slice-lightbox__thumbs'));

      this._items = /** @type {LightboxItem[]} */ ([]);
      this._index = 0;
      this._loop = false;
      this._thumbnails = true;
      this._zoom = true;
      this._maxZoom = 2.5;
      this._onChange = /** @type {Function | null} */ (null);
      this._onOpen = /** @type {Function | null} */ (null);
      this._onClose = /** @type {Function | null} */ (null);
      this._texts = /** @type {Record<string, string>} */ ({});

      // Internal state: never a prop's `_<name>`.
      this._scale = 1;
      this._pan = { x: 0, y: 0 };
      this._gesture = /** @type {any} */ (null);
      this._suppressClick = false;
      this._releaseScroll = /** @type {(() => void) | null} */ (null);
      this._returnFocus = /** @type {HTMLElement | null} */ (null);
      this._preloaded = /** @type {HTMLImageElement[]} */ ([]);
      this._attached = /** @type {Array<() => void>} */ ([]);
      this._wasOpen = false;

      // Every listener is on the component's own nodes: they go with it.
      this.$close.addEventListener('click', () => this.close());
      this.$prev.addEventListener('click', () => this.prev());
      this.$next.addEventListener('click', () => this.next());
      this.$zoom.addEventListener('click', () => this._setScale(this._scale > 1 ? 1 : this._maxZoom));
      this.$dialog.addEventListener('keydown', (e) => this._onKey(e));
      this.$dialog.addEventListener('cancel', (e) => {
         // Escape: zoom out first, close on the next one.
         e.preventDefault();
         if (this._scale > 1) this._setScale(1);
         else this.close();
      });
      this.$dialog.addEventListener('close', () => this._afterClose());
      this.$img.addEventListener('load', () => this._loaded(true));
      this.$img.addEventListener('error', () => this._loaded(false));
      this.$stage.addEventListener('pointerdown', (e) => this._down(e));
      this.$stage.addEventListener('pointermove', (e) => this._move(e));
      this.$stage.addEventListener('pointerup', (e) => this._up(e));
      this.$stage.addEventListener('pointercancel', (e) => this._up(e));
      this.$stage.addEventListener('click', (e) => {
         if (this._suppressClick) { this._suppressClick = false; return; }
         // One click on the picture zooms in at that point; another click zooms out.
         // The second click of a double click (`detail > 1`) is ignored, so a double
         // click still leaves it zoomed once instead of undoing the first click.
         if (e.target === this.$img && this._zoom) {
            if (e.detail > 1) return;
            this._setScale(this._scale > 1 ? 1 : this._maxZoom, e);
            return;
         }
         // A click on the dark area around the picture closes.
         if (e.target === this.$stage || e.target === this.$frame || e.target === this.$caption?.parentElement) this.close();
      });
      this.$thumbs.addEventListener('click', (e) => {
         const button = /** @type {Element} */ (e.target)?.closest?.('.slice-lightbox__thumb');
         if (button) this.go(Number(/** @type {HTMLElement} */ (button).dataset.index));
      });

      slice.controller.setComponentProps(this, props);
      this._paintTexts();
   }

   init() {
      slice.translator?.watch?.(this, () => {
         this._paintTexts();
         this._render();
      });
   }

   beforeDestroy() {
      for (const detach of this._attached) detach();
      this._attached = [];
      if (this.$dialog.open) this.$dialog.close();
      this._afterClose();
      this._preloaded = [];
   }

   // ── Props ──────────────────────────────────────────────────────

   get items() { return this._items; }
   set items(value) {
      this._items = (Array.isArray(value) ? value : [])
         .map((item) => (typeof item === 'string' ? { src: item } : item))
         .filter((item) => item && typeof item.src === 'string' && item.src);
      this._index = this._clampIndex(this._index);
      this._renderThumbs();
      this._render();
   }

   get index() { return this._index; }
   set index(value) {
      const next = this._clampIndex(Number(value) || 0);
      if (this.$dialog.open) this.go(next);
      else this._index = next;
   }

   get loop() { return this._loop; }
   set loop(value) { this._loop = value === true; this._paintNav(); }

   get thumbnails() { return this._thumbnails; }
   set thumbnails(value) { this._thumbnails = value !== false; this._renderThumbs(); }

   get zoom() { return this._zoom; }
   set zoom(value) { this._zoom = value !== false; this.$zoom.hidden = !this._zoom; if (!this._zoom) this._setScale(1); }

   get maxZoom() { return this._maxZoom; }
   set maxZoom(value) { const n = Number(value); this._maxZoom = Number.isFinite(n) && n > 1 ? n : 2.5; }

   get onChange() { return this._onChange; }
   set onChange(value) { this._onChange = typeof value === 'function' ? value : null; }

   get onOpen() { return this._onOpen; }
   set onOpen(value) { this._onOpen = typeof value === 'function' ? value : null; }

   get onClose() { return this._onClose; }
   set onClose(value) { this._onClose = typeof value === 'function' ? value : null; }

   get texts() { return this._texts; }
   set texts(value) { this._texts = value && typeof value === 'object' ? { ...value } : {}; this._paintTexts(); this._render(); }

   /** Whether the viewer is open. */
   get isOpen() { return this.$dialog.open; }

   // ── API ────────────────────────────────────────────────────────

   /** Open at `index` (or the current one). */
   open(index = this._index) {
      if (!this._items.length) return;
      this._index = this._clampIndex(index);
      if (!this.$dialog.open) {
         const active = /** @type {HTMLElement | null} */ (document.activeElement);
         this._returnFocus = active && active !== document.body ? active : null;
         if (!this.isConnected) document.body.appendChild(this);
         this._releaseScroll = lockScroll();
         this.$dialog.showModal();
         this._wasOpen = true;
         this.$stage.focus({ preventScroll: true });
         this._onOpen?.(this._index, this._items[this._index]);
      }
      this._render();
   }

   close() {
      if (this.$dialog.open) this.$dialog.close();
   }

   next() {
      const last = this._items.length - 1;
      if (this._index < last) this.go(this._index + 1);
      else if (this._loop && last > 0) this.go(0);
   }

   prev() {
      if (this._index > 0) this.go(this._index - 1);
      else if (this._loop && this._items.length > 1) this.go(this._items.length - 1);
   }

   /** Show the image at `index`. */
   go(index) {
      const next = this._clampIndex(index);
      if (next === this._index && this.$img.getAttribute('src')) return;
      this._index = next;
      this._render();
      if (this.$dialog.open) this._onChange?.(this._index, this._items[this._index]);
   }

   /**
    * Make the images in `container` open this viewer. The items become the images
    * found there, read at the moment one is clicked, so a gallery that changes
    * keeps working. Returns a function that undoes it.
    * @param {Element} container
    * @param {{ selector?: string }} [options]
    */
   attach(container, options = {}) {
      if (!(container instanceof Element)) return () => {};
      const selector = options.selector || 'a[href]';
      const onClick = (/** @type {MouseEvent} */ event) => {
         if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
         const trigger = /** @type {Element} */ (event.target)?.closest?.(selector);
         if (!trigger || !container.contains(trigger)) return;
         const triggers = /** @type {Element[]} */ ([...container.querySelectorAll(selector)]);
         const items = triggers.map(itemFrom).filter(Boolean);
         const at = triggers.indexOf(trigger);
         if (at < 0 || !items.length) return;
         event.preventDefault();
         this.items = items;
         this.open(at);
      };
      container.addEventListener('click', onClick);
      let done = false;
      const detach = () => {
         if (done) return;
         done = true;
         container.removeEventListener('click', onClick);
         this._attached = this._attached.filter((fn) => fn !== detach);
      };
      this._attached.push(detach);
      return detach;
   }

   // ── Rendering ──────────────────────────────────────────────────

   /** @param {string} key @param {Record<string, any>} [params] */
   _t(key, params = {}) {
      const own = this._texts[key];
      if (own == null) return t(key, params);
      return String(own).replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m));
   }

   /** @param {number} index */
   _clampIndex(index) {
      const n = Math.round(Number(index) || 0);
      return Math.min(Math.max(0, n), Math.max(0, this._items.length - 1));
   }

   _paintTexts() {
      this.$dialog.setAttribute('aria-label', this._t('label'));
      this.$close.setAttribute('aria-label', this._t('close'));
      this.$prev.setAttribute('aria-label', this._t('prev'));
      this.$next.setAttribute('aria-label', this._t('next'));
      this.$zoom.setAttribute('aria-label', this._t(this._scale > 1 ? 'zoomOut' : 'zoomIn'));
      this.$error.textContent = this._t('error');
      this.$stage.tabIndex = -1;
      for (const thumb of this.$thumbs.querySelectorAll('.slice-lightbox__thumb')) {
         const i = Number(/** @type {HTMLElement} */ (thumb).dataset.index);
         const alt = this._items[i]?.alt;
         thumb.setAttribute('aria-label', alt ? `${this._t('thumb', { index: i + 1 })}: ${alt}` : this._t('thumb', { index: i + 1 }));
      }
   }

   _render() {
      const item = this._items[this._index];
      if (!item) return;
      this._setScale(1);
      const total = this._items.length;
      this.$count.textContent = total > 1 ? this._t('count', { index: this._index + 1, total }) : '';
      this.$dialog.dataset.single = String(total < 2);

      if (this.$img.getAttribute('src') !== item.src) {
         this.$frame.classList.add('is-loading');
         this.$frame.classList.remove('has-error');
         this.$error.hidden = true;
         if (item.srcset) this.$img.srcset = item.srcset; else this.$img.removeAttribute('srcset');
         if (item.sizes) this.$img.sizes = item.sizes; else this.$img.removeAttribute('sizes');
         this.$img.src = item.src;
         if (this.$img.complete && this.$img.naturalWidth) this._loaded(true);
      }
      this.$img.alt = item.alt || '';
      this.$caption.textContent = item.caption || '';
      this.$caption.hidden = !item.caption;
      this._paintNav();

      for (const thumb of this.$thumbs.children) {
         const on = Number(/** @type {HTMLElement} */ (thumb).dataset.index) === this._index;
         if (on) {
            thumb.setAttribute('aria-current', 'true');
            if (this.$dialog.open) thumb.scrollIntoView({ block: 'nearest', inline: 'center' });
         } else thumb.removeAttribute('aria-current');
      }
      if (this.$dialog.open) this._preload();
   }

   _paintNav() {
      const total = this._items.length;
      this.$prev.hidden = total < 2;
      this.$next.hidden = total < 2;
      this.$prev.disabled = !this._loop && this._index <= 0;
      this.$next.disabled = !this._loop && this._index >= total - 1;
   }

   _renderThumbs() {
      const show = this._thumbnails && this._items.length > 1;
      this.$thumbs.hidden = !show;
      if (!show) {
         this.$thumbs.replaceChildren();
         return;
      }
      this.$thumbs.replaceChildren(...this._items.map((item, i) => {
         const button = document.createElement('button');
         button.type = 'button';
         button.className = 'slice-lightbox__thumb';
         button.dataset.index = String(i);
         const img = document.createElement('img');
         img.src = item.thumb || item.src;
         img.alt = '';
         img.loading = 'lazy';
         img.decoding = 'async';
         button.append(img);
         return button;
      }));
      this._paintTexts();
   }

   /** @param {boolean} ok */
   _loaded(ok) {
      this.$frame.classList.remove('is-loading');
      this.$frame.classList.toggle('has-error', !ok);
      this.$error.hidden = ok;
   }

   _preload() {
      const around = [this._index + 1, this._index - 1].map((i) => this._items[(i + this._items.length) % this._items.length]);
      this._preloaded = around.filter((item) => item && item.src !== this._items[this._index]?.src).map((item) => {
         const img = new Image();
         img.decoding = 'async';
         if (item.srcset) img.srcset = item.srcset;
         img.src = item.src;
         return img;
      });
   }

   // ── Zoom and pan ───────────────────────────────────────────────

   /** @param {number} scale @param {MouseEvent} [at] zoom in towards this point */
   _setScale(scale, at) {
      const next = this._zoom ? Math.min(this._maxZoom, Math.max(1, scale)) : 1;
      if (next > 1 && at) {
         // Keep the point under the pointer where it is.
         const box = this.$img.getBoundingClientRect();
         const dx = at.clientX - (box.left + box.width / 2);
         const dy = at.clientY - (box.top + box.height / 2);
         this._pan = { x: -dx * (next - 1), y: -dy * (next - 1) };
      } else if (next === 1) {
         this._pan = { x: 0, y: 0 };
      }
      this._scale = next;
      this._clampPan();
      this._applyTransform();
      this.$dialog.classList.toggle('is-zoomed', next > 1);
      this.$zoom.setAttribute('aria-pressed', String(next > 1));
      this.$zoom.setAttribute('aria-label', this._t(next > 1 ? 'zoomOut' : 'zoomIn'));
   }

   _clampPan() {
      const w = this.$img.offsetWidth;
      const h = this.$img.offsetHeight;
      const maxX = (w * (this._scale - 1)) / 2;
      const maxY = (h * (this._scale - 1)) / 2;
      this._pan.x = Math.min(maxX, Math.max(-maxX, this._pan.x));
      this._pan.y = Math.min(maxY, Math.max(-maxY, this._pan.y));
   }

   /** @param {number} [dx] @param {number} [dy] a live swipe offset */
   _applyTransform(dx = 0, dy = 0) {
      this.$img.style.transform = this._scale === 1 && !dx && !dy
         ? ''
         : `translate(${this._pan.x + dx}px, ${this._pan.y + dy}px) scale(${this._scale})`;
   }

   // ── Pointer: swipe, swipe down, pan ────────────────────────────

   /** @param {PointerEvent} e */
   _down(e) {
      this._suppressClick = false;
      if (e.button !== 0 || /** @type {Element} */ (e.target).closest('button')) return;
      this._gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, pan: { ...this._pan }, moved: false };
   }

   /** @param {PointerEvent} e */
   _move(e) {
      const g = this._gesture;
      if (!g || g.id !== e.pointerId) return;
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (!g.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
         g.moved = true;
         // Captured only once it is a drag, so a plain click still reaches the
         // picture and toggles the zoom.
         try { this.$stage.setPointerCapture(e.pointerId); } catch { /* pointer gone */ }
      }
      if (!g.moved) return;
      this.$dialog.classList.add('is-dragging');
      if (this._scale > 1) {
         this._pan = { x: g.pan.x + dx, y: g.pan.y + dy };
         this._clampPan();
         this._applyTransform();
      } else if (Math.abs(dx) > Math.abs(dy)) {
         this._applyTransform(dx, 0);
      } else if (dy > 0) {
         this._applyTransform(0, dy);
         this.$dialog.style.setProperty('--slice-lightbox-fade', String(Math.max(0.3, 1 - dy / 400)));
      }
   }

   /** @param {PointerEvent} e */
   _up(e) {
      const g = this._gesture;
      if (!g || g.id !== e.pointerId) return;
      this._gesture = null;
      this.$dialog.classList.remove('is-dragging');
      this.$dialog.style.removeProperty('--slice-lightbox-fade');
      if (!g.moved) return;
      this._suppressClick = true;
      if (this._scale > 1) return;
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      this._applyTransform();
      if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) {
         if (dx < 0) this.next(); else this.prev();
      } else if (dy > SWIPE_CLOSE && dy > Math.abs(dx)) {
         this.close();
      }
   }

   // ── Keyboard ───────────────────────────────────────────────────

   /** @param {KeyboardEvent} e */
   _onKey(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const keys = {
         ArrowRight: () => this.next(),
         ArrowLeft: () => this.prev(),
         Home: () => this.go(0),
         End: () => this.go(this._items.length - 1),
         '+': () => this._setScale(this._scale > 1 ? this._maxZoom : Math.min(this._maxZoom, 2)),
         '=': () => this._setScale(this._scale > 1 ? this._maxZoom : Math.min(this._maxZoom, 2)),
         '-': () => this._setScale(1),
         0: () => this._setScale(1),
      };
      const rtl = getComputedStyle(this.$dialog).direction === 'rtl';
      const key = rtl && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') ? (e.key === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight') : e.key;
      const action = keys[key];
      if (!action) return;
      // The zoomed picture pans with the arrows instead.
      if (this._scale > 1 && key.startsWith('Arrow')) {
         this._pan.x += key === 'ArrowLeft' ? 60 : -60;
         this._clampPan();
         this._applyTransform();
         e.preventDefault();
         return;
      }
      e.preventDefault();
      action();
   }

   _afterClose() {
      this._setScale(1);
      this._releaseScroll?.();
      this._releaseScroll = null;
      const target = this._returnFocus;
      this._returnFocus = null;
      if (target && target.isConnected) {
         try { target.focus({ preventScroll: true }); } catch { /* not focusable */ }
      }
      if (this._onClose && this._wasOpen) this._onClose(this._index);
      this._wasOpen = false;
   }
}

/**
 * The image a gallery trigger points at.
 * @param {Element} trigger
 * @returns {LightboxItem | null}
 */
function itemFrom(trigger) {
   const img = trigger.tagName === 'IMG' ? /** @type {HTMLImageElement} */ (trigger) : trigger.querySelector('img');
   const href = trigger.tagName === 'A' ? /** @type {HTMLAnchorElement} */ (trigger).href : '';
   const src = trigger.getAttribute('data-full') || href || img?.currentSrc || img?.src || '';
   if (!src) return null;
   const caption = trigger.getAttribute('data-caption')
      || trigger.closest('figure')?.querySelector('figcaption')?.textContent?.trim()
      || '';
   return { src, alt: img?.alt || trigger.getAttribute('aria-label') || '', caption, thumb: img?.currentSrc || img?.src || undefined };
}

customElements.define('slice-lightbox', Lightbox);
