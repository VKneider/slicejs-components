// OverflowList retains caller-supplied live nodes, including inside a borrowed DropDown panel.
import { destroyNodes } from '../../shared/content/nodes.js';
import { captureView, reparentNodes } from '../../shared/content/ownership.js';
import { texts } from '../../shared/text/texts.js';
import { fitItems } from './parts/fit.js';
const t = texts('slice.overflowList', {
   en: {
      more: 'More ({count})',
      moreLabel: 'Show {count} more items',
      label: 'Responsive content',
   },
   es: {
      more: 'Más ({count})',
      moreLabel: 'Mostrar {count} elementos más',
      label: 'Contenido adaptable',
   },
});

export default class OverflowList extends HTMLElement {
   static props = {
      items: {
         type: 'array',
         default: [],
         items: {
            type: 'object',
            schema: {
               id: { type: 'string', required: true },
               node: { type: 'any', required: true },
               priority: { type: 'number' },
               pinned: { type: 'boolean' },
            },
         },
      },
      minVisible: { type: 'number', default: 0 },
      collapseFrom: {
         type: 'string',
         default: 'end',
         allowedValues: ['end', 'start'],
      },
      gap: { type: 'any', default: 8 },
      disabled: { type: 'boolean', default: false },
      ariaLabel: { type: 'string', default: '' },
      texts: { type: 'object', default: null },
      onChange: { type: 'function', default: null },
   };
   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-overflow-list');
      this.$rail = this.querySelector('.slice-overflow-list__rail');
      this.$measure = this.querySelector('.slice-overflow-list__measure');
      this.$overflow = this.querySelector('.slice-overflow-list__overflow');
      this.$more = document.createElement('div');
      this.$more.className = 'slice-overflow-list__more';
      this.$more.hidden = true;
      this.$rail.append(this.$more);
      this._entries = [];
      this._rows = new Map();
      this._overrides = {};
      this._shown = [];
      this._hidden = [];
      this._ready = false;
      this._dead = false;
      this._frame = 0;
      this._observer = null;
      this._widths = new WeakMap();
      this._signature = '';
      this._menu = null;
      this._fallback = () => this._schedule();
      slice.controller.setComponentProps(this, props);
   }
   async init() {
      this._ready = true;
      const menu = await slice.build('DropDown', {
         label: this._t('more', { count: this._entries.length }),
         size: 'sm',
         variant: 'outlined',
         caret: true,
         items: [{ owned: false, render: () => this.$overflow }],
         onOpenChange: (open) => {
            if (!open && !this._dead) {
               this.$measure.append(this.$overflow);
               this._schedule();
            }
         },
      });
      if (!menu) throw new Error('OverflowList: DropDown could not be built');
      if (this._dead) {
         slice.controller.destroyComponent(menu);
         return;
      }
      this._menu = menu;
      this.$more.append(menu);
      menu.disabled = this._disabled;
      slice.translator?.watch?.(this, () => {
         this._label();
         this._schedule();
      });
      if (typeof ResizeObserver !== 'undefined') {
         this._observer = new ResizeObserver((entries) => {
            let changed = false;
            for (const entry of entries) {
               const width =
                  entry.borderBoxSize?.[0]?.inlineSize ??
                  entry.contentRect.width;
               if (
                  Math.abs((this._widths.get(entry.target) ?? -1) - width) > 0.1
               ) {
                  this._widths.set(entry.target, width);
                  changed = true;
               }
            }
            if (changed) this._schedule();
         });
         this._observe();
      } else window.addEventListener('resize', this._fallback);
      this._schedule();
   }
   get items() {
      return this._entries.map((item) => ({ ...item }));
   }
   set items(value) {
      const ids = new Set(),
         nodes = new Set();
      const entries = (Array.isArray(value) ? value : []).map((item) => {
         if (
            !item ||
            typeof item.id !== 'string' ||
            !item.id ||
            ids.has(item.id) ||
            !(item.node instanceof Element) ||
            nodes.has(item.node) ||
            item.node === this ||
            item.node.contains?.(this)
         )
            throw new TypeError(
               'OverflowList: items need unique IDs and distinct live elements',
            );
         ids.add(item.id);
         nodes.add(item.node);
         return {
            ...item,
            priority: Number.isFinite(Number(item.priority))
               ? Number(item.priority)
               : 0,
            pinned: item.pinned === true,
         };
      });
      const restore = captureView(
         [...this._rows.values()].map((row) => row.el),
      );
      if (this._menu?.isOpen) this._menu.close();
      for (const [id, row] of this._rows) {
         const next = entries.find((item) => item.id === id);
         if (!next || next.node !== row.node) {
            if (!nodes.has(row.node)) destroyNodes([row.node]);
            row.el.remove();
            this._rows.delete(id);
         }
      }
      for (const item of entries)
         if (!this._rows.has(item.id)) {
            const el = document.createElement('div');
            el.className = 'slice-overflow-list__item';
            el.dataset.itemId = item.id;
            el.append(item.node);
            this.$overflow.append(el);
            this._rows.set(item.id, { el, node: item.node });
         }
      this._entries = entries;
      reparentNodes(
         [...this._rows.values()].map((row) => row.el),
         this,
      );
      this._observe();
      this._schedule();
      restore();
   }
   get minVisible() {
      return this._minVisible;
   }
   set minVisible(v) {
      this._minVisible = Number.isFinite(Number(v))
         ? Math.max(0, Math.floor(Number(v)))
         : 0;
      this._schedule();
   }
   get collapseFrom() {
      return this._collapseFrom;
   }
   set collapseFrom(v) {
      this._collapseFrom = v === 'start' ? 'start' : 'end';
      this._schedule();
   }
   get gap() {
      return this._gap;
   }
   set gap(v) {
      this._gap =
         typeof v === 'number'
            ? Math.max(0, Number.isFinite(v) ? v : 8)
            : typeof v === 'string'
              ? v
              : 8;
      this.style.setProperty(
         '--slice-overflow-list-gap',
         typeof this._gap === 'number' ? `${this._gap}px` : this._gap,
      );
      this._schedule();
   }
   get disabled() {
      return this._disabled;
   }
   set disabled(v) {
      this._disabled = v === true;
      if (this._menu) this._menu.disabled = this._disabled;
   }
   get ariaLabel() {
      return this._ariaLabel;
   }
   set ariaLabel(v) {
      this._ariaLabel = typeof v === 'string' ? v : '';
      this._label();
   }
   get texts() {
      return { ...this._overrides };
   }
   set texts(v) {
      this._overrides = v && typeof v === 'object' ? { ...v } : {};
      this._label();
      this._schedule();
   }
   get onChange() {
      return this._onChange;
   }
   set onChange(v) {
      this._onChange = typeof v === 'function' ? v : null;
   }
   get visibleItems() {
      return this._shown
         .map((id) => this._entries.find((item) => item.id === id))
         .filter(Boolean)
         .map((item) => ({ ...item }));
   }
   get overflowItems() {
      return this._hidden
         .map((id) => this._entries.find((item) => item.id === id))
         .filter(Boolean)
         .map((item) => ({ ...item }));
   }
   _t(key, params = {}) {
      return this._overrides[key] == null
         ? t(key, params)
         : String(this._overrides[key]).replace(/\{(\w+)\}/g, (m, k) =>
              k in params ? String(params[k]) : m,
           );
   }
   _label() {
      this.setAttribute('role', 'group');
      this.setAttribute('aria-label', this._ariaLabel || this._t('label'));
   }
   _observe() {
      if (!this._observer) return;
      this._observer.disconnect();
      this._observer.observe(this);
      for (const row of this._rows.values())
         this._observer.observe(row.el, { box: 'border-box' });
   }
   _schedule() {
      if (!this._ready || this._dead || this._frame) return;
      this._frame = requestAnimationFrame(() => {
         this._frame = 0;
         this.reflow();
      });
   }
   update() {
      this.reflow();
   }
   reflow() {
      if (
         !this._ready ||
         this._dead ||
         !this._menu ||
         !this.isConnected ||
         this.clientWidth <= 0
      )
         return null;
      const focused = document.activeElement;
      const focusedId = [...this._rows].find(([, row]) =>
         row.el.contains(focused),
      )?.[0];
      const restore = captureView(
         [...this._rows.values()].map((row) => row.el),
      );
      // Reserve the widest count label, so changing 9 ↔ 10 cannot oscillate the fit.
      this.$more.hidden = false;
      this.$more.style.width = 'max-content';
      this._menu.label = this._t('more', { count: this._entries.length });
      const moreWidth = this.$more.getBoundingClientRect().width;
      this.$more.style.width = `${moreWidth}px`;
      const widths = this._entries.map((item) => ({
         ...item,
         width: this._rows.get(item.id).el.getBoundingClientRect().width,
      }));
      const gap = parseFloat(getComputedStyle(this.$rail).columnGap) || 0;
      const result = fitItems(
         widths,
         this.$rail.clientWidth || this.clientWidth,
         moreWidth,
         gap,
         this._minVisible,
         this._collapseFrom,
      );
      const shown = result.visible.map((i) => this._entries[i].id),
         hidden = result.overflow.map((i) => this._entries[i].id);
      const signature = JSON.stringify([shown, hidden, result.constrained]);
      if (signature !== this._signature && this._menu.isOpen)
         this._menu.close();
      const place = (parent, ids) =>
         ids.forEach((id, index) => {
            const el = this._rows.get(id).el;
            if (parent.children[index] !== el)
               parent.insertBefore(el, parent.children[index] || null);
         });
      place(this.$rail, shown);
      place(this.$overflow, hidden);
      if (this.$rail.lastElementChild !== this.$more)
         this.$rail.append(this.$more);
      const triggerFocused = document.activeElement === this._menu.$trigger;
      this.$more.hidden = hidden.length === 0;
      this._menu.label = this._t('more', { count: hidden.length });
      this._menu.ariaLabel = this._t('moreLabel', { count: hidden.length });
      this._shown = shown;
      this._hidden = hidden;
      this.dataset.constrained = String(result.constrained);
      restore();
      if (hidden.includes(focusedId) && !this._menu.isOpen)
         this._menu.$trigger.focus({ preventScroll: true });
      if (!hidden.length && triggerFocused) {
         const first = this.$rail.querySelector(
            'button:not(:disabled), input:not(:disabled), a[href], [tabindex="0"]',
         );
         if (first) first.focus({ preventScroll: true });
      }
      if (signature !== this._signature) {
         this._signature = signature;
         this._onChange?.({
            visibleItems: [...shown],
            overflowItems: [...hidden],
            constrained: result.constrained,
         });
      }
      return {
         visibleItems: [...shown],
         overflowItems: [...hidden],
         constrained: result.constrained,
      };
   }
   beforeDestroy() {
      this._dead = true;
      this._ready = false;
      cancelAnimationFrame(this._frame);
      this._frame = 0;
      this._observer?.disconnect();
      window.removeEventListener('resize', this._fallback);
      this.$overflow.remove();
      if (
         this._menu &&
         slice.controller.activeComponents.has(this._menu.sliceId)
      )
         slice.controller.destroyComponent(this._menu);
      destroyNodes([...this._rows.values()].map((row) => row.node));
      this._rows.clear();
   }
}
customElements.define('slice-overflow-list', OverflowList);
