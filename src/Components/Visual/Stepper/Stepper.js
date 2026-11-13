// Stepper: one process view, static instructions or interactive task navigation.
import { destroyNodes, heading, headingLevel, iconName, toNodes } from '../../shared/content/nodes.js';
import { texts } from '../../shared/text/texts.js';
import { normalizeItems, activeId, canSelect } from './parts/model.js';

const t = texts('slice.stepper', {
   en: { label: 'Process steps', upcoming: 'Upcoming', current: 'Current step', done: 'Completed', error: 'Needs attention', progress: 'Step {index} of {total}: {title}' },
   es: { label: 'Pasos del proceso', upcoming: 'Pendiente', current: 'Paso actual', done: 'Completado', error: 'Requiere atención', progress: 'Paso {index} de {total}: {title}' },
});

export default class Stepper extends HTMLElement {
   static props = {
      // [{ id, title, text, icon, content, status, disabled }]. IDs must be unique.
      items: { type: 'array', default: [] },
      mode: { type: 'string', default: 'static', allowedValues: ['static', 'interactive'] },
      active: { type: 'string', default: null },
      linear: { type: 'boolean', default: false },
      clickable: { type: 'boolean', default: true },
      disabled: { type: 'boolean', default: false },
      onChange: { type: 'function', default: null },
      orientation: { type: 'string', default: 'vertical', allowedValues: ['vertical', 'horizontal'] },
      marker: { type: 'string', default: 'number', allowedValues: ['number', 'icon', 'dot'] },
      variant: { type: 'string', default: 'soft', allowedValues: ['soft', 'filled', 'outlined'] },
      tone: { type: 'string', default: 'accent', allowedValues: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'] },
      size: { type: 'string', default: 'md', allowedValues: ['sm', 'md'] },
      start: { type: 'number', default: 1 },
      connector: { type: 'boolean', default: true },
      headingLevel: { type: 'number', default: 3 },
      ariaLabel: { type: 'string', default: '' },
      texts: { type: 'object', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-stepper');
      this.$list = this.querySelector('.slice-stepper__list');
      this.$live = this.querySelector('[role="status"]');
      this._entries = [];
      this._rows = new Map();
      this._requested = null;
      this._ready = false;
      this._overrides = {};
      this.$list.addEventListener('click', event => {
         const button = event.target.closest('button[data-step]');
         if (button) this.select(button.dataset.step);
      });
      this.$list.addEventListener('keydown', event => this._key(event));
      slice.controller.setComponentProps(this, props);
   }

   async init() {
      this._ready = true;
      slice.translator?.watch?.(this, () => this._paintState());
      await this.update();
   }

   get items() { return this._entries.map(item => ({ ...item })); }
   set items(value) { this._entries = normalizeItems(value); if (this._ready) this.update(); }
   get mode() { return this._mode; }
   set mode(v) { this._mode = this._pick('mode', v); this._looks(); if (this._ready) this.update(); }
   get active() { return activeId(this._entries, this._requested, this._mode); }
   set active(v) { this._requested = v == null ? null : String(v); this._paintState(); }
   get linear() { return this._linear; }
   set linear(v) { this._linear = v === true; this._paintState(); }
   get clickable() { return this._clickable; }
   set clickable(v) { this._clickable = v !== false; this._paintState(); }
   get disabled() { return this._disabled; }
   set disabled(v) { this._disabled = v === true; this._paintState(); }
   get onChange() { return this._onChange; }
   set onChange(v) { this._onChange = typeof v === 'function' ? v : null; }
   get orientation() { return this._orientation; }
   set orientation(v) { this._orientation = this._pick('orientation', v); this._looks(); }
   get marker() { return this._marker; }
   set marker(v) { this._marker = this._pick('marker', v); this._looks(); if (this._ready) this.update(); }
   get variant() { return this._variant; }
   set variant(v) { this._variant = this._pick('variant', v); this._looks(); }
   get tone() { return this._tone; }
   set tone(v) { this._tone = this._pick('tone', v); this._looks(); }
   get size() { return this._size; }
   set size(v) { this._size = this._pick('size', v); this._looks(); if (this._ready) this.update(); }
   get start() { return this._start; }
   set start(v) { this._start = Number.isFinite(Number(v)) ? Math.round(Number(v)) : 1; this._looks(); this._paintState(); }
   get connector() { return this._connector; }
   set connector(v) { this._connector = v !== false; this._looks(); }
   get headingLevel() { return this._headingLevel; }
   set headingLevel(v) { this._headingLevel = headingLevel(v, 3); if (this._ready) this.update(); }
   get ariaLabel() { return this._ariaLabel; }
   set ariaLabel(v) { this._ariaLabel = v == null ? '' : String(v); this._looks(); }
   get texts() { return this._overrides; }
   set texts(v) { this._overrides = v && typeof v === 'object' ? { ...v } : {}; this._paintState(); }

   _pick(name, value) {
      const config = this.constructor.props[name];
      return config.allowedValues.includes(value) ? value : config.default;
   }

   _t(key, params = {}) {
      const own = this._overrides[key];
      return own == null ? t(key, params) : String(own).replace(/\{(\w+)\}/g, (m, name) => name in params ? String(params[name]) : m);
   }

   _looks() {
      for (const key of ['mode', 'orientation', 'marker', 'variant', 'tone', 'size']) if (this[`_${key}`]) this.dataset[key] = this[`_${key}`];
      this.classList.toggle('has-connector', this._connector !== false);
      this.$list.start = this._start ?? 1;
      if ((this._start ?? 1) === 1) this.$list.removeAttribute('start');
      this.$list.setAttribute('aria-label', this._ariaLabel || this._t('label'));
   }

   _allowed(index) { return canSelect(this._entries, index, { mode: this._mode, linear: this._linear, clickable: this._clickable, disabled: this._disabled }); }

   /** User navigation. Programmatic `active = id` does not fire handlers. */
   select(id) {
      const index = this._entries.findIndex(item => item.id === String(id));
      if (!this._allowed(index)) return false;
      const previous = this.active;
      if (previous === String(id)) return false;
      this._requested = String(id);
      this._paintState();
      const detail = { previous, step: { ...this._entries[index] }, index };
      const selected = this.active;
      this._onChange?.(selected, detail);
      this.dispatchEvent(new CustomEvent('step-change', { bubbles: true, detail: { id: selected, ...detail } }));
      return true;
   }

   async update() {
      if (!this._ready) return;
      const kept = new Set(this._entries.map(item => item.id));
      for (const [id, row] of this._rows) if (!kept.has(id)) { this._disposeRow(row); this._rows.delete(id); }
      const ordered = [];
      for (const [index, item] of this._entries.entries()) {
         let row = this._rows.get(item.id);
         if (!row) { row = this._newRow(item.id); this._rows.set(item.id, row); }
         this._patchBody(row, item);
         const name = this._marker === 'icon' ? iconName(item.icon) : '';
         if (row.iconName !== name || (row.icon && row.icon.size !== (this._size === 'sm' ? '16px' : '18px'))) {
            if (row.icon) destroyNodes([row.icon]);
            row.icon = null; row.iconName = name;
            if (name) {
               const icon = await slice.build('Icon', { name, size: this._size === 'sm' ? '16px' : '18px', color: 'currentColor' });
               if (!this._ready) { if (icon) destroyNodes([icon]); return; }
               row.icon = icon;
            }
         }
         row.index = index;
         ordered.push(row.li);
      }
      // Move survivors rather than replacing them: stable item ids retain their content and focus.
      const focused = this.contains(document.activeElement) ? document.activeElement : null;
      ordered.forEach((node, index) => { if (this.$list.children[index] !== node) this.$list.insertBefore(node, this.$list.children[index] || null); });
      if (focused?.isConnected && document.activeElement !== focused) focused.focus?.({ preventScroll: true });
      this.style.setProperty('--slice-stepper-count', String(Math.max(ordered.length, 1)));
      this._paintState();
   }

   _newRow(id) {
      const li = document.createElement('li'); li.className = 'slice-stepper__item'; li.dataset.id = id;
      const rail = document.createElement('div'); rail.className = 'slice-stepper__rail'; rail.setAttribute('aria-hidden', 'true');
      const marker = document.createElement('span'); marker.className = 'slice-stepper__marker'; rail.append(marker);
      const body = document.createElement('div'); body.className = 'slice-stepper__body';
      const text = document.createElement('p'); text.className = 'slice-stepper__text';
      const content = document.createElement('div'); content.className = 'slice-stepper__content';
      const status = document.createElement('span'); status.className = 'slice-stepper__sr';
      li.append(rail, body);
      return { li, rail, marker, body, text, content, status, icon: null, iconName: '', owned: [], source: undefined };
   }

   _patchBody(row, item) {
      const interactive = this._mode === 'interactive';
      const tag = `H${this._headingLevel}`;
      if (!row.title || row.title.tagName !== tag || row.interactive !== interactive) {
         const title = heading(this._headingLevel, 'slice-stepper__title');
         row.title?.remove(); row.title = title; row.button = null; row.interactive = interactive;
         if (interactive) {
            row.button = document.createElement('button'); row.button.type = 'button'; row.button.className = 'slice-stepper__trigger'; row.button.dataset.step = item.id;
            title.append(row.button);
         }
         row.body.prepend(title);
      }
      (row.button || row.title).textContent = item.title;
      row.text.textContent = String(item.text ?? '');
      if (item.text) { if (!row.text.parentNode) row.body.append(row.text); } else row.text.remove();
      if (row.source !== item.content) {
         const nodes = toNodes(item.content, 'slice-stepper__text');
         const kept = new Set(nodes);
         destroyNodes(row.owned.filter(node => !kept.has(node)));
         row.owned = nodes; row.source = item.content;
         row.content.replaceChildren(...nodes);
      }
      if (row.owned.length) { if (!row.content.parentNode) row.body.append(row.content); } else row.content.remove();
      if (interactive && !row.status.parentNode) row.body.append(row.status);
      else if (!interactive) row.status.remove();
   }

   _paintState() {
      this._looks();
      const selected = this.active;
      const activeIndex = this._entries.findIndex(item => item.id === selected);
      const focusIndex = this._allowed(activeIndex) ? activeIndex : this._entries.findIndex((_, index) => this._allowed(index));
      for (const [index, item] of this._entries.entries()) {
         const row = this._rows.get(item.id); if (!row) continue;
         const current = this._mode === 'interactive' && item.id === selected;
         const status = current ? 'current' : item.status === 'current' ? 'upcoming' : item.status;
         row.li.dataset.status = status;
         row.li.classList.toggle('is-disabled', !!this._disabled || item.disabled);
         if (current) row.li.setAttribute('aria-current', 'step'); else row.li.removeAttribute('aria-current');
         row.status.textContent = this._t(status);
         if (row.button) {
            row.button.disabled = !this._allowed(index);
            row.button.tabIndex = index === focusIndex ? 0 : -1;
         }
         if (row.icon && this._marker === 'icon') { if (row.marker.firstChild !== row.icon) row.marker.replaceChildren(row.icon); }
         else row.marker.textContent = this._marker === 'dot' ? '' : status === 'done' ? '✓' : status === 'error' ? '!' : String((this._start ?? 1) + index);
      }
      const item = this._entries[activeIndex];
      this.$live.textContent = item ? this._t('progress', { index: activeIndex + 1, total: this._entries.length, title: item.title }) : '';
   }

   _key(event) {
      const trigger = event.target.closest('button[data-step]');
      if (!trigger || this._mode !== 'interactive') return;
      const nodes = [...this.$list.querySelectorAll('button[data-step]:not(:disabled)')];
      const at = nodes.indexOf(trigger);
      const rtl = getComputedStyle(this).direction === 'rtl';
      let next;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = nodes.length - 1;
      else if (event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) next = (at + 1) % nodes.length;
      else if (event.key === 'ArrowUp' || event.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) next = (at - 1 + nodes.length) % nodes.length;
      if (next == null || !nodes[next]) return;
      event.preventDefault();
      nodes.forEach((node, index) => { node.tabIndex = index === next ? 0 : -1; });
      nodes[next].focus();
   }

   _disposeRow(row) { destroyNodes([row.icon, ...row.owned].filter(Boolean)); row.li.remove(); }
   beforeDestroy() { this._ready = false; for (const row of this._rows.values()) this._disposeRow(row); this._rows.clear(); }
}
customElements.define('slice-stepper', Stepper);
