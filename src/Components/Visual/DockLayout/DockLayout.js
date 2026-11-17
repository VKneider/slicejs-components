// DockLayout composes Tabs and SplitPane. The JSON tree never owns DOM content.
import { texts } from '../../shared/text/texts.js';
import { destroyNodes } from '../../shared/content/nodes.js';
import { captureView, reparentNodes } from '../../shared/content/ownership.js';
import { cloneLayout, findNode, groups, moveLayout, normalizeLayout, pruneLayout, removeLayoutTab } from './parts/layout.js';

const t = texts('slice.dockLayout', {
   en: { label: 'Dockable workspace', group: 'Group {index}', move: 'Move', destination: 'Destination for the active tab', moveTo: 'Move to {label}', left: 'Split left', right: 'Split right', top: 'Split above', bottom: 'Split below', empty: 'No open tabs.', moved: '{label} moved.', closed: '{label} closed.', closeError: 'The tab could not be closed.', help: 'Drag tabs to reorder or split. Ctrl+Shift+arrows reorders, Ctrl+Shift+PageUp/PageDown moves between groups, Ctrl+Alt+arrows splits. Escape cancels dragging.' },
   es: { label: 'Espacio de trabajo acoplable', group: 'Grupo {index}', move: 'Mover', destination: 'Destino de la pestaña activa', moveTo: 'Mover a {label}', left: 'Dividir a la izquierda', right: 'Dividir a la derecha', top: 'Dividir arriba', bottom: 'Dividir abajo', empty: 'No hay pestañas abiertas.', moved: '{label} movida.', closed: '{label} cerrada.', closeError: 'No se pudo cerrar la pestaña.', help: 'Arrastra pestañas para reordenar o dividir. Ctrl+Mayús+flechas reordena, Ctrl+Mayús+RePág/AvPág mueve entre grupos y Ctrl+Alt+flechas divide. Escape cancela el arrastre.' },
});

export default class DockLayout extends HTMLElement {
   static props = {
      items: { type: 'array', default: [], items: { type: 'object', schema: {
         id: { type: 'string', required: true }, label: { type: 'string' }, panel: { type: 'any' },
         icon: { type: 'string' }, badge: { type: 'any' }, disabled: { type: 'boolean' }, closable: { type: 'boolean' },
      } } },
      layout: { type: 'object', default: null },
      draggable: { type: 'boolean', default: true },
      disabled: { type: 'boolean', default: false },
      closable: { type: 'boolean', default: true },
      minPanelSize: { type: 'number', default: 8 },
      ariaLabel: { type: 'string', default: '' },
      texts: { type: 'object', default: null },
      onChange: { type: 'function', default: null },
      onBeforeClose: { type: 'function', default: null },
      onClose: { type: 'function', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-dock-layout');
      this.$workspace = this.querySelector('.slice-dock-layout__workspace');
      this.$preview = this.querySelector('.slice-dock-layout__preview');
      this.$ghost = this.querySelector('.slice-dock-layout__ghost');
      this.$status = this.querySelector('.slice-dock-layout__status');
      this._records = new Map();
      this._scrollPositions = new Map();
      this._model = null;
      this._groups = new Map();
      this._splits = new Map();
      this._overrides = {};
      this._ready = false;
      this._dead = false;
      this._painting = false;
      this._action = false;
      this._drag = null;
      this._lastDragButton = null;
      this._ignoreUntil = 0;
      this.addEventListener('keydown', e => this._key(e), true);
      this.addEventListener('pointerdown', e => this._startDrag(e));
      this.addEventListener('pointermove', e => this._dragMove(e));
      this.addEventListener('pointerup', e => this._dragEnd(e));
      this.addEventListener('pointercancel', e => { if (e.pointerId === this._drag?.pointer) this._cancelDrag(); });
      this.addEventListener('lostpointercapture', e => { if (e.pointerId === this._drag?.pointer) this._cancelDrag(); });
      this.addEventListener('click', e => {
         if (Date.now() < this._ignoreUntil && this._lastDragButton?.contains(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); }
      }, true);
      slice.controller.setComponentProps(this, props);
   }

   async init() {
      this._ready = true;
      slice.translator?.watch?.(this, () => { this._labels(); this._paintControls(); });
      await this.update();
   }
   get items() { return [...this._records.values()].map(item => ({ ...item })); }
   set items(value) {
      const records = new Map();
      for (const item of Array.isArray(value) ? value : []) {
         if (!item || typeof item.id !== 'string' || !item.id || records.has(item.id)) throw new TypeError('DockLayout: items need unique string IDs');
         records.set(item.id, { ...item, label: String(item.label ?? item.id) });
      }
      if (this._model) {
         const root = this.getLayout();
         for (const group of groups(root)) { group.tabs = group.tabs.filter(id => records.has(id)); if (!group.tabs.includes(group.activeTab)) group.activeTab = group.tabs[0] || ''; }
         const assigned = new Set(groups(root).flatMap(g => g.tabs));
         const first = groups(root)[0];
         for (const id of records.keys()) if (!assigned.has(id)) first.tabs.push(id);
         this._model = pruneLayout(root) || normalizeLayout(null, records.keys());
      } else this._model = normalizeLayout(null, records.keys());
      this._records = records;
      for (const id of this._scrollPositions.keys()) if (!records.has(id)) this._scrollPositions.delete(id);
      if (this._ready) this.update();
   }
   get layout() { return this.getLayout(); }
   set layout(value) { const next = normalizeLayout(value, this._records.keys()); this._cancelDrag(); this._model = next; if (this._ready) this.update(); }
   get draggable() { return this._draggable; }
   set draggable(v) { this._draggable = v !== false; if (!this._draggable) this._cancelDrag(); this.dataset.draggable = String(this._draggable); }
   get disabled() { return this._disabled; }
   set disabled(v) { this._disabled = v === true; if (this._disabled) this._cancelDrag(); this._paintControls(); }
   get closable() { return this._closable; }
   set closable(v) { this._closable = v !== false; if (this._ready) this.update(); }
   get minPanelSize() { return this._minPanelSize; }
   set minPanelSize(v) { this._minPanelSize = Number.isFinite(Number(v)) ? Math.max(0, Math.min(40, Number(v))) : 8; if (this._ready) this.update(); }
   get ariaLabel() { return this._ariaLabel; }
   set ariaLabel(v) { this._ariaLabel = typeof v === 'string' ? v : ''; this._labels(); }
   get texts() { return { ...this._overrides }; }
   set texts(v) { this._overrides = v && typeof v === 'object' ? { ...v } : {}; this._labels(); this._paintControls(); }
   get onChange() { return this._onChange; }
   set onChange(v) { this._onChange = typeof v === 'function' ? v : null; }
   get onBeforeClose() { return this._onBeforeClose; }
   set onBeforeClose(v) { this._onBeforeClose = typeof v === 'function' ? v : null; }
   get onClose() { return this._onClose; }
   set onClose(v) { this._onClose = typeof v === 'function' ? v : null; }
   _t(key, params = {}) { return this._overrides[key] == null ? t(key, params) : String(this._overrides[key]).replace(/\{(\w+)\}/g, (m, k) => k in params ? String(params[k]) : m); }
   _labels() { this.setAttribute('role', 'region'); this.setAttribute('aria-label', this._ariaLabel || this._t('label')); this.setAttribute('aria-description', this._t('help')); }
   _groupLabel(group, index) { return group.label || this._t('group', { index: index + 1 }); }
   getTabs(groupId) { return this._groups.get(groupId)?.tabs || null; }
   getLayout() {
      const root = cloneLayout(this._model);
      if (!root || this._painting) return root;
      const pull = node => {
         if (node.type === 'group') {
            const tabs = this.getTabs(node.id);
            const active = tabs?.activeTab;
            if (tabs && (active === '' || node.tabs.includes(active))) node.activeTab = active;
         } else {
            const split = this._splits.get(node.id);
            if (split?.sizes.length === node.children.length) node.sizes = split.sizes;
            node.children.forEach(pull);
         }
      };
      pull(root); return root;
   }

   async update() {
      if (!this._ready || this._dead) return;
      this._painting = true;
      this.setAttribute('aria-busy', 'true');
      const restore = captureView([this.$workspace]);
      for (const view of this._groups.values()) {
         if (this._records.has(view.tabs.activeTab)) this._scrollPositions.set(view.tabs.activeTab, [view.tabs.$panels.scrollLeft, view.tabs.$panels.scrollTop]);
      }
      try {
         const root = this._model;
         const wanted = groups(root);
         for (const group of wanted) {
            if (this._groups.has(group.id)) continue;
            const tabs = await slice.build('Tabs', { items: [], keepMounted: true, variant: 'enclosed',
               onChange: id => {
                  if (this._painting || this._dead) return;
                  const node = findNode(this._model, group.id); if (!node) return;
                  const view = this.getTabs(group.id);
                  if (node.activeTab) this._scrollPositions.set(node.activeTab, [view.$panels.scrollLeft, view.$panels.scrollTop]);
                  node.activeTab = id;
                  const [x, y] = this._scrollPositions.get(id) || [0, 0]; view.$panels.scrollLeft = x; view.$panels.scrollTop = y;
                  this._paintControls(); this._emit('select', id, group.id);
               }, onClose: id => { this.closeTab(id); return false; },
            });
            if (!tabs) throw new Error('DockLayout: Tabs could not be built');
            if (this._dead) { slice.controller.destroyComponent(tabs); return; }
            this._groups.set(group.id, this._createGroup(group.id, tabs));
         }
         // Move entries before assigning items; removing them first would destroy content.
         for (const group of wanted) {
            const target = this.getTabs(group.id);
            for (const id of group.tabs) {
               const source = [...this._groups.values()].find(g => g.tabs !== target && g.tabs.items.some(item => item.id === id))?.tabs;
               if (source) source.moveTab(id, target, undefined, { activate: false });
            }
         }
         for (const group of wanted) {
            const target = this.getTabs(group.id);
            target.items = group.tabs.map(id => this._records.get(id)).filter(Boolean);
            target.activeTab = group.activeTab;
            target.closable = this._closable;
            this._groups.get(group.id).empty.hidden = group.tabs.length > 0;
         }
         // Release old ownership before changing the split tree. Reuse every surviving group.
         for (const split of this._splits.values()) split.releasePanels();
         const used = new Set();
         const buildNode = async node => {
            if (node.type === 'group') return this._groups.get(node.id).el;
            let split = this._splits.get(node.id);
            if (!split) {
               split = await slice.build('SplitPane', { panels: [] });
               if (!split) throw new Error('DockLayout: SplitPane could not be built');
               if (this._dead) { slice.controller.destroyComponent(split); return null; }
               this._splits.set(node.id, split);
            }
            used.add(node.id);
            const panels = [];
            for (const child of node.children) {
               const content = await buildNode(child);
               if (this._dead) return null;
               panels.push({ id: child.id, label: child.label || child.id, content, minSize: this._minPanelSize });
            }
            split.orientation = node.orientation;
            split.panels = panels;
            split.sizes = node.sizes;
            node.sizes = split.sizes;
            split.disabled = this._disabled;
            split.onChange = sizes => { node.sizes = sizes; if (!this._painting && !this._dead) this._emit('resize', null, node.id); };
            return split;
         };
         const element = await buildNode(root);
         if (this._dead) return;
         if (this.$workspace.firstElementChild !== element) this.$workspace.replaceChildren(element);
         reparentNodes([element], this);
         for (const [id, split] of this._splits) if (!used.has(id)) { slice.controller.destroyComponent(split); this._splits.delete(id); }
         const ids = new Set(wanted.map(g => g.id));
         for (const [id, group] of this._groups) if (!ids.has(id)) { slice.controller.destroyComponent(group.tabs); group.el.remove(); this._groups.delete(id); }
         this._paintControls();
         restore();
         for (const view of this._groups.values()) {
            const [x, y] = this._scrollPositions.get(view.tabs.activeTab) || [0, 0];
            view.tabs.$panels.scrollLeft = x; view.tabs.$panels.scrollTop = y;
         }
      } finally { this._painting = false; this.removeAttribute('aria-busy'); }
   }

   _createGroup(id, tabs) {
      const el = document.createElement('section'); el.className = 'slice-dock-layout__group'; el.dataset.dockGroup = id;
      const toolbar = document.createElement('div'); toolbar.className = 'slice-dock-layout__toolbar';
      const title = document.createElement('span'); title.className = 'slice-dock-layout__title';
      const select = document.createElement('select'); select.className = 'slice-dock-layout__destination';
      const button = document.createElement('button'); button.type = 'button'; button.className = 'slice-dock-layout__move';
      button.addEventListener('click', () => { const value = select.value; const active = tabs.activeTab; if (value.startsWith('group:')) this.moveTab(active, value.slice(6)); else this.moveTab(active, id, { position: value }); });
      const empty = document.createElement('p'); empty.className = 'slice-dock-layout__empty'; empty.setAttribute('role', 'status');
      toolbar.append(title, select, button); el.append(toolbar, tabs, empty);
      return { el, tabs, title, select, button, empty };
   }
   _paintControls() {
      const list = groups(this._model);
      this._groups.forEach((view, id) => {
         const index = list.findIndex(g => g.id === id); if (index < 0) return;
         const label = this._groupLabel(list[index], index);
         view.title.textContent = label;
         view.tabs.ariaLabel = label;
         view.el.setAttribute('aria-label', label);
         view.empty.textContent = this._t('empty');
         view.button.textContent = this._t('move');
         view.select.setAttribute('aria-label', this._t('destination'));
         const previous = view.select.value;
         view.select.replaceChildren();
         for (const [n, group] of list.entries()) if (group.id !== id) {
            const option = document.createElement('option'); option.value = `group:${group.id}`; option.textContent = this._t('moveTo', { label: this._groupLabel(group, n) }); view.select.append(option);
         }
         for (const position of ['left','right','top','bottom']) {
            const option = document.createElement('option'); option.value = position; option.textContent = this._t(position); view.select.append(option);
         }
         if ([...view.select.options].some(o => o.value === previous)) view.select.value = previous;
         const item = this._records.get(view.tabs.activeTab);
         view.button.disabled = view.select.disabled = this._disabled || this._action || !item || item.disabled === true;
      });
      for (const split of this._splits.values()) split.disabled = this._disabled;
   }
   _emit(reason, tabId, groupId) { this._onChange?.(this.getLayout(), { reason, tabId, groupId }); }
   async moveTab(id, groupId, options = {}) {
      if (this._dead || !this._ready || this._disabled || this._action || this._painting || this._records.get(id)?.disabled || !this._records.has(id)) return false;
      const placement = getComputedStyle(this).direction === 'rtl' && ['left','right'].includes(options.position)
         ? { ...options, position: options.position === 'left' ? 'right' : 'left' } : options;
      const next = moveLayout(this.getLayout(), id, groupId, placement); if (!next) return false;
      const hadFocus = this.contains(document.activeElement);
      this._action = true; this._cancelDrag();
      try {
         this._model = next; await this.update(); if (this._dead) return false;
         if (hadFocus && !this.contains(document.activeElement)) {
            const destination = groups(next).find(group => group.tabs.includes(id));
            this.getTabs(destination.id)?.select(id, { focus: true });
         }
         this.$status.textContent = this._t('moved', { label: this._records.get(id)?.label || id });
         this._emit('move', id, groups(next).find(g => g.tabs.includes(id))?.id);
         return true;
      } finally { this._action = false; this._paintControls(); }
   }
   async closeTab(id) {
      const item = this._records.get(id);
      if (!item || item.disabled || this._disabled || this._action || this._painting || this._dead || item.closable === false || (!this._closable && item.closable !== true)) return false;
      const sourceGroup = groups(this._model).find(group => group.tabs.includes(id));
      const sourceTabs = sourceGroup && this.getTabs(sourceGroup.id);
      const focusWasInside = sourceTabs?.getPanel(id)?.contains(document.activeElement) || document.activeElement?.dataset.tabId === id;
      this._action = true; this._cancelDrag(); this._paintControls();
      try {
         if (await this._onBeforeClose?.(id, item) === false || this._dead) return false;
         const next = removeLayoutTab(this.getLayout(), id); if (!next) return false;
         this._records.delete(id); this._scrollPositions.delete(id); this._model = next;
         await this.update(); if (this._dead) return false;
         if (focusWasInside) {
            const group = findNode(this._model, sourceGroup.id) || groups(this._model)[0];
            const tabs = this.getTabs(group.id);
            if (tabs?.activeTab) tabs.select(tabs.activeTab, { focus: true });
            else { this.tabIndex = -1; this.focus({ preventScroll: true }); }
         }
         this.$status.textContent = this._t('closed', { label: item.label });
         this._onClose?.(id, item); this._emit('close', id, null); return true;
      } catch (error) {
         this.$status.textContent = this._t('closeError');
         slice.logger?.logError?.('DockLayout', 'Closing a tab failed', error);
         return false;
      } finally { this._action = false; this._paintControls(); }
   }
   async restoreLayout(value) {
      if (this._dead || this._disabled || this._action || this._painting) return false;
      const next = normalizeLayout(value, this._records.keys());
      this._action = true; this._cancelDrag();
      try { this._model = next; await this.update(); if (this._dead) return false; this._emit('restore', null, null); return true; }
      finally { this._action = false; this._paintControls(); }
   }

   _ownGroup(target) { const el = target.closest?.('[data-dock-group]'); return el?.closest('slice-dock-layout') === this ? el : null; }
   _key(event) {
      if (event.key === 'Escape' && this._drag) { event.preventDefault(); event.stopPropagation(); this._cancelDrag(); return; }
      const group = this._ownGroup(event.target);
      const button = event.target.closest?.('[role=tab]');
      if (!group || !button || this._disabled || button.closest('slice-tabs') !== this.getTabs(group.dataset.dockGroup)) return;
      const id = button.dataset.tabId; const node = findNode(this._model, group.dataset.dockGroup);
      if (!node || !node.tabs.includes(id)) return;
      const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'top', ArrowDown: 'bottom' };
      if (event.ctrlKey && event.altKey && directions[event.key]) {
         event.preventDefault(); event.stopPropagation(); this.moveTab(id, node.id, { position: directions[event.key] });
      } else if (event.ctrlKey && event.shiftKey && ['ArrowLeft','ArrowRight'].includes(event.key)) {
         event.preventDefault(); event.stopPropagation();
         const rtl = getComputedStyle(this).direction === 'rtl';
         const delta = (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1);
         this.moveTab(id, node.id, { index: node.tabs.indexOf(id) + delta });
      } else if (event.ctrlKey && event.shiftKey && ['PageUp','PageDown'].includes(event.key)) {
         event.preventDefault(); event.stopPropagation(); const list = groups(this._model); const index = list.findIndex(g => g.id === node.id);
         this.moveTab(id, list[(index + (event.key === 'PageDown' ? 1 : -1) + list.length) % list.length].id);
      }
   }
   _startDrag(event) {
      if (!this._draggable || this._disabled || this._painting || this._action || event.button !== 0 || event.isPrimary === false) return;
      const group = this._ownGroup(event.target); const button = event.target.closest?.('[role=tab]');
      if (!group || !button || button.closest('slice-tabs') !== this.getTabs(group.dataset.dockGroup) || button.disabled || event.target.closest('.slice_tab_close')) return;
      this._drag = { button, id: button.dataset.tabId, pointer: event.pointerId, x: event.clientX, y: event.clientY, active: false, target: null };
      button.setPointerCapture(event.pointerId);
   }
   _dragMove(event) {
      const drag = this._drag; if (!drag || event.pointerId !== drag.pointer) return;
      if (!drag.active && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
      drag.active = true; event.preventDefault();
      const bounds = this.getBoundingClientRect();
      this.$ghost.hidden = false; this.$ghost.textContent = this._records.get(drag.id)?.label || drag.id;
      this.$ghost.style.left = `${event.clientX - bounds.left + 12}px`; this.$ghost.style.top = `${event.clientY - bounds.top + 12}px`;
      const hit = document.elementFromPoint(event.clientX, event.clientY); const group = hit && this._ownGroup(hit);
      if (!group) { drag.target = null; this.$preview.hidden = true; return; }
      const rect = group.getBoundingClientRect();
      const strip = hit.closest('[role=tablist]');
      const bar = strip?.closest('slice-tabs') === this.getTabs(group.dataset.dockGroup) ? strip : null;
      let position = 'center', index;
      let x = rect.left, y = rect.top, width = rect.width, height = rect.height;
      if (bar) {
         const buttons = [...bar.querySelectorAll('[role=tab]')]; const rtl = getComputedStyle(this).direction === 'rtl';
         index = buttons.findIndex(b => { const r = b.getBoundingClientRect(); return rtl ? event.clientX > r.x + r.width / 2 : event.clientX < r.x + r.width / 2; });
         if (index < 0) index = buttons.length;
         const before = buttons[index]?.getBoundingClientRect(); const last = buttons.at(-1)?.getBoundingClientRect();
         x = before ? (rtl ? before.right : before.left) : last ? (rtl ? last.left : last.right) : rect.left;
         y = bar.getBoundingClientRect().top; width = 3; height = bar.getBoundingClientRect().height;
         // index denotes the final position after taking the source out.
         const sourceIndex = buttons.findIndex(b => b === drag.button); if (sourceIndex >= 0 && sourceIndex < index) index--;
      } else {
         const edges = [['left',event.clientX-rect.left,rect.width],['right',rect.right-event.clientX,rect.width],['top',event.clientY-rect.top,rect.height],['bottom',rect.bottom-event.clientY,rect.height]];
         const near = edges.filter(([,distance,size]) => distance < Math.min(64,size*.25)).sort((a,b) => a[1]/a[2]-b[1]/b[2])[0];
         if (near) position = near[0];
         if (['left','right'].includes(position)) { width /= 2; if (position === 'right') x += width; }
         if (['top','bottom'].includes(position)) { height /= 2; if (position === 'bottom') y += height; }
      }
      drag.target = { groupId: group.dataset.dockGroup, position, index };
      this.$preview.hidden = false;
      Object.assign(this.$preview.style, { left: `${x-bounds.left}px`, top: `${y-bounds.top}px`, width: `${width}px`, height: `${height}px` });
   }
   _dragEnd(event) {
      const drag = this._drag; if (!drag || drag.pointer !== event.pointerId) return;
      if (drag.active) this._dragMove(event);
      const target = drag.target;
      if (drag.active) { this._lastDragButton = drag.button; this._ignoreUntil = Date.now() + 250; }
      this._cancelDrag();
      if (drag.active && target) this.moveTab(drag.id, target.groupId, target);
   }
   _cancelDrag() {
      const drag = this._drag; this._drag = null;
      if (drag?.button.hasPointerCapture?.(drag.pointer)) drag.button.releasePointerCapture(drag.pointer);
      if (this.$preview) this.$preview.hidden = true;
      if (this.$ghost) this.$ghost.hidden = true;
   }
   beforeDestroy() {
      this._dead = true; this._ready = false; this._cancelDrag(); this._lastDragButton = null;
      for (const view of this._groups.values()) if (slice.controller.activeComponents.has(view.tabs.sliceId)) slice.controller.destroyComponent(view.tabs);
      for (const split of this._splits.values()) if (slice.controller.activeComponents.has(split.sliceId)) slice.controller.destroyComponent(split);
      // Unrendered sources are owned too; the tab view may not have mounted them yet.
      for (const item of this._records.values()) if (item.panel instanceof Node && item.panel.sliceId && slice.controller.activeComponents.has(item.panel.sliceId)) destroyNodes([item.panel]);
      this._groups.clear(); this._splits.clear(); this._records.clear(); this._scrollPositions.clear();
   }
}
customElements.define('slice-dock-layout', DockLayout);
