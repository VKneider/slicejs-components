// SplitPane: resizable, collapsible workspaces. Percentages exclude handle space.
import { destroyNodes, toNodes } from '../../shared/content/nodes.js';
import { reparentNodes } from '../../shared/content/ownership.js';
import { texts } from '../../shared/text/texts.js';
import { allocate, bounds, pairRange, resizePair } from './parts/sizes.js';

const t = texts('slice.splitPane', {
   en: { panel: 'Panel {index}', resize: 'Resize {label}', help: 'Use arrow keys to resize, Home or End for limits, Enter to collapse or restore.' },
   es: { panel: 'Panel {index}', resize: 'Redimensionar {label}', help: 'Usa las flechas para redimensionar, Inicio o Fin para los límites, Intro para contraer o restaurar.' },
});
let sequence = 0;

export default class SplitPane extends HTMLElement {
   static props = {
      // [{ id, label, content, minSize: 0, maxSize: 100, collapsible: false, collapsed: false }]
      panels: { type: 'array', default: [], items: { type: 'object', schema: {
         id: { type: 'string' }, label: { type: 'string' }, content: { type: 'any' },
         minSize: { type: 'number', default: 0 }, maxSize: { type: 'number', default: 100 },
         collapsible: { type: 'boolean', default: false }, collapsed: { type: 'boolean', default: false },
      } } },
      sizes: { type: 'array', default: [], items: { type: 'number' } },
      orientation: { type: 'string', default: 'horizontal', allowedValues: ['horizontal', 'vertical'] },
      disabled: { type: 'boolean', default: false },
      keyboardStep: { type: 'number', default: 2 },
      onChange: { type: 'function', default: null },
      texts: { type: 'object', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-split-pane');
      this.$track = this.querySelector('.slice-split-pane__track');
      this._entries = [];
      this._views = new Map();
      this._handles = [];
      this._values = [];
      this._restored = new Map();
      this._overrides = {};
      this._prefix = `slice-split-pane-${++sequence}`;
      this._ready = false;
      this._gesture = null;
      this._resizeObserver = null;
      this.$track.addEventListener('keydown', e => this._key(e));
      this.$track.addEventListener('pointerdown', e => this._start(e));
      this.$track.addEventListener('pointermove', e => this._move(e));
      this.$track.addEventListener('pointerup', e => this._finish(e));
      this.$track.addEventListener('pointercancel', e => this._finish(e, true));
      this.$track.addEventListener('lostpointercapture', e => this._finish(e));
      slice.controller.setComponentProps(this, props);
   }

   init() {
      this._ready = true;
      this._reconcile();
      slice.translator?.watch?.(this, () => this._paint());
      if (typeof ResizeObserver !== 'undefined') {
         this._resizeObserver = new ResizeObserver(() => this._paint());
         this._resizeObserver.observe(this.$track);
      }
   }

   get panels() { return this._entries.map(p => ({ ...p })); }
   set panels(value) {
      this._endGesture();
      const seen = new Set();
      this._entries = (Array.isArray(value) ? value : []).flatMap((p, i) => {
         if (!p || typeof p !== 'object') return [];
         const id = String(p.id ?? i);
         if (seen.has(id)) return [];
         seen.add(id);
         return [{ ...p, id, collapsible: p.collapsible === true, collapsed: p.collapsible === true && p.collapsed === true }];
      });
      for (const id of this._restored.keys()) if (!seen.has(id)) this._restored.delete(id);
      if (this._entries.length && this._entries.every(p => p.collapsed)) this._entries.at(-1).collapsed = false;
      this._values = allocate(this._entries, this._values);
      if (this._ready) this._reconcile();
   }
   get sizes() { return [...this._values]; }
   set sizes(value) { this._endGesture(); this._values = allocate(this._entries, Array.isArray(value) ? value : []); this._paint(); }
   get orientation() { return this._orientation; }
   set orientation(value) { this._endGesture(); this._orientation = value === 'vertical' ? 'vertical' : 'horizontal'; this.dataset.orientation = this._orientation; this._paint(); }
   get disabled() { return this._disabled; }
   set disabled(value) { this._disabled = value === true; if (this._disabled) this._endGesture(); this._paint(); }
   get keyboardStep() { return this._keyboardStep; }
   set keyboardStep(value) { this._keyboardStep = Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : 2; }
   get onChange() { return this._onChange; }
   set onChange(value) { this._onChange = typeof value === 'function' ? value : null; }
   get texts() { return { ...this._overrides }; }
   set texts(value) { this._overrides = value && typeof value === 'object' ? { ...value } : {}; this._paint(); }

   /** Give content back without destroying it. Caller must adopt or destroy the nodes. */
   releasePanels() {
      this._endGesture();
      const panels = this._entries.map(p => ({ ...p, content: [...(this._views.get(p.id)?.nodes || [])] }));
      for (const view of this._views.values()) { reparentNodes(view.nodes, null); view.el.remove(); }
      this._views.clear();
      this._handles.forEach(h => h.remove());
      this._handles = [];
      this._entries = [];
      this._values = [];
      this._restored.clear();
      return panels;
   }

   _t(key, params = {}) {
      return this._overrides[key] == null ? t(key, params) : String(this._overrides[key]).replace(/\{(\w+)\}/g, (m, k) => k in params ? String(params[k]) : m);
   }

   _reconcile() {
      const wanted = new Map(this._entries.map(p => [p.id, toNodes(p.content, 'slice-split-pane__text')]));
      const keep = new Set([...wanted.values()].flat());
      for (const view of this._views.values()) destroyNodes(view.nodes.filter(n => !keep.has(n)));
      for (const [id, view] of this._views) if (!wanted.has(id)) { view.el.remove(); this._views.delete(id); }
      const handles = this._handles;
      this._handles = [];
      const order = [];
      this._entries.forEach((p, i) => {
         let view = this._views.get(p.id);
         if (!view) {
            const el = document.createElement('section');
            el.className = 'slice-split-pane__panel';
            el.id = `${this._prefix}-panel-${i}-${++sequence}`;
            view = { el, nodes: [] };
            this._views.set(p.id, view);
         }
         view.nodes = wanted.get(p.id);
         // Move existing content rather than rebuilding its components or local state.
         view.nodes.forEach((node, n) => { if (view.el.childNodes[n] !== node) view.el.insertBefore(node, view.el.childNodes[n] || null); });
         order.push(view.el);
         if (i < this._entries.length - 1) {
            const handle = handles[i] || document.createElement('div');
            handle.className = 'slice-split-pane__handle';
            handle.dataset.separator = String(i);
            handle.setAttribute('role', 'separator');
            this._handles.push(handle);
            order.push(handle);
         }
      });
      handles.slice(this._handles.length).forEach(h => h.remove());
      order.forEach((node, i) => { if (this.$track.children[i] !== node) this.$track.insertBefore(node, this.$track.children[i] || null); });
      reparentNodes([...this.$track.children], this);
      this._paint();
   }

   _paint() {
      if (!this._ready) return;
      const vertical = this._orientation === 'vertical';
      const rect = this.$track.getBoundingClientRect();
      const handleSpace = this._handles.reduce((sum, h) => { const r = h.getBoundingClientRect(); return sum + (vertical ? r.height : r.width); }, 0);
      this._available = Math.max(0, (vertical ? rect.height : rect.width) - handleSpace);
      this.dataset.constrained = String(bounds(this._entries).constrained);
      this._entries.forEach((p, i) => {
         const el = this._views.get(p.id)?.el;
         if (!el) return;
         el.setAttribute('aria-label', p.label || this._t('panel', { index: i + 1 }));
         el.hidden = p.collapsed;
         el.inert = p.collapsed;
         // flex-grow shares the space remaining after fixed-width handles.
         el.style.flexGrow = String(this._values[i] || 0);
      });
      this._handles.forEach((h, i) => {
         const p = this._entries[i];
         const range = pairRange(this._entries, this._values, i);
         const collapsible = this._toggleIndex(i) !== -1;
         const disabled = this._disabled || (range.max - range.min < .001 && !collapsible);
         h.tabIndex = disabled ? -1 : 0;
         h.setAttribute('aria-disabled', String(disabled));
         h.setAttribute('aria-orientation', vertical ? 'horizontal' : 'vertical');
         h.setAttribute('aria-controls', this._views.get(p.id).el.id);
         h.setAttribute('aria-label', this._t('resize', { label: p.label || this._t('panel', { index: i + 1 }) }));
         h.setAttribute('aria-description', this._t('help'));
         for (const [name, value] of [['min', range.min], ['max', range.max], ['now', this._values[i] || 0]]) h.setAttribute(`aria-value${name}`, String(Math.round(value * 100) / 100));
      });
   }

   _notify(reason, index) {
      this._onChange?.(this.sizes, { reason, index, collapsed: this._entries.filter(p => p.collapsed).map(p => p.id) });
   }

   /** Resize the panel before separator `index` to a percentage of total panel space. */
   resize(index, percent, reason = 'api') {
      if (this._disabled || !Number.isInteger(index) || index < 0 || index >= this._entries.length - 1) return false;
      const next = resizePair(this._entries, this._values, index, Number(percent));
      if (next.every((v, i) => Math.abs(v - this._values[i]) < 1e-8)) return false;
      this._values = next;
      this._paint();
      this._notify(reason, index);
      return true;
   }

   _index(id) { return typeof id === 'number' ? id : this._entries.findIndex(p => p.id === String(id)); }
   collapse(id) { return this._collapse(this._index(id), true); }
   expand(id) { return this._collapse(this._index(id), false); }
   toggle(id) { const i = this._index(id); return this._collapse(i, !this._entries[i]?.collapsed); }
   _collapse(i, collapsed) {
      const p = this._entries[i];
      if (this._disabled || !p?.collapsible || p.collapsed === collapsed) return false;
      if (collapsed && this._entries.filter(p => !p.collapsed).length <= 1) return false;
      this._endGesture();
      const desired = this.sizes;
      if (collapsed) this._restored.set(p.id, desired[i]);
      else {
         const size = this._restored.get(p.id) || 100 / this._entries.length;
         const total = desired.reduce((a, b) => a + b, 0) || 100;
         desired.forEach((v, n) => { desired[n] = v * (100 - size) / total; });
         desired[i] = size;
      }
      if (collapsed && this._views.get(p.id)?.el.contains(document.activeElement)) this._handles[Math.min(i, this._handles.length - 1)]?.focus();
      p.collapsed = collapsed;
      this._values = allocate(this._entries, desired);
      this._paint();
      this._notify(collapsed ? 'collapse' : 'expand', i);
      return true;
   }

   _toggleIndex(i) { return this._entries[i]?.collapsible ? i : this._entries[i + 1]?.collapsible ? i + 1 : -1; }
   _ownHandle(event) { const h = event.target.closest?.('[data-separator]'); return h?.parentElement === this.$track ? h : null; }
   _rtl() { return this._orientation !== 'vertical' && getComputedStyle(this).direction === 'rtl'; }
   _key(event) {
      const h = this._ownHandle(event);
      if (!h || this._disabled) return;
      const i = Number(h.dataset.separator);
      const vertical = this._orientation === 'vertical';
      const range = pairRange(this._entries, this._values, i);
      let next = this._values[i];
      const positive = vertical ? 'ArrowDown' : this._rtl() ? 'ArrowLeft' : 'ArrowRight';
      const negative = vertical ? 'ArrowUp' : this._rtl() ? 'ArrowRight' : 'ArrowLeft';
      if (event.key === 'Enter') { event.preventDefault(); const index = this._toggleIndex(i); if (index >= 0) this.toggle(index); return; }
      if (event.key === 'Home') next = range.min;
      else if (event.key === 'End') next = range.max;
      else if (event.key === positive || event.key === negative) next += (event.key === positive ? 1 : -1) * (this._keyboardStep || 2) * (event.shiftKey ? 5 : 1);
      else return;
      event.preventDefault();
      this.resize(i, next, 'keyboard');
   }

   _start(event) {
      const handle = this._ownHandle(event);
      if (!handle || this._disabled || event.button !== 0 || event.isPrimary === false || !this._available) return;
      event.preventDefault();
      this._endGesture();
      const index = Number(handle.dataset.separator);
      this._gesture = { handle, index, pointer: event.pointerId, origin: this._orientation === 'vertical' ? event.clientY : event.clientX, sizes: this.sizes, available: this._available };
      handle.focus();
      handle.setPointerCapture(event.pointerId);
      this.classList.add('is-dragging');
   }
   _move(event) {
      const g = this._gesture;
      if (!g || event.pointerId !== g.pointer) return;
      const coord = this._orientation === 'vertical' ? event.clientY : event.clientX;
      const delta = (coord - g.origin) * (this._rtl() ? -1 : 1) / g.available * 100;
      this.resize(g.index, g.sizes[g.index] + delta, 'pointer');
   }
   _finish(event, cancel = false) {
      const g = this._gesture;
      if (!g || event.pointerId !== g.pointer) return;
      if (cancel) { this._values = g.sizes; this._paint(); this._notify('cancel', g.index); }
      else if (event.type === 'pointerup') this._move(event);
      this._endGesture();
   }
   _endGesture() {
      const g = this._gesture;
      this._gesture = null;
      if (g?.handle.hasPointerCapture?.(g.pointer)) g.handle.releasePointerCapture(g.pointer);
      this.classList.remove('is-dragging');
   }

   beforeDestroy() {
      this._ready = false;
      this._endGesture();
      this._resizeObserver?.disconnect();
      for (const view of this._views.values()) destroyNodes(view.nodes);
      this._views.clear();
      this._restored.clear();
   }
}
customElements.define('slice-split-pane', SplitPane);
