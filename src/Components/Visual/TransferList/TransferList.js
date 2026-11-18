// TransferList is an app-owned assignment control, composed of Input/Checkbox/Button.
import { destroyNodes, toNodes } from '../../shared/content/nodes.js';
import { captureView, reparentNodes } from '../../shared/content/ownership.js';
import { texts } from '../../shared/text/texts.js';
import {
   normalizeItems,
   normalizeValue,
   filterItems,
   changeAssignment,
} from './parts/model.js';
const t = texts('slice.transferList', {
   en: {
      label: 'Assign items',
      available: 'Available',
      assigned: 'Assigned',
      search: 'Search {title}',
      selectVisible: 'Select visible items',
      assign: 'Assign',
      remove: 'Remove',
      itemAction: '{action}: {label}',
      assignSelected: 'Assign selected',
      removeSelected: 'Remove selected',
      selected: '{count} selected',
      count: '{visible} of {total}',
      emptyAvailable: 'All catalog items are assigned.',
      emptyAssigned: 'Choose items to assign.',
      emptyCatalog: 'No items available.',
      noResults: 'No matching items.',
      clearSearch: 'Clear search',
      locked: 'Managed by policy',
      disabled: 'Unavailable',
      unknown: '{count} assigned items are not in the current catalog.',
      moved: '{count} items {action}.',
      assignedAction: 'assigned',
      removedAction: 'removed',
      retry: 'Try again',
      loading: 'Loading items…',
   },
   es: {
      label: 'Asignar elementos',
      available: 'Disponibles',
      assigned: 'Asignados',
      search: 'Buscar en {title}',
      selectVisible: 'Seleccionar elementos visibles',
      assign: 'Asignar',
      remove: 'Quitar',
      itemAction: '{action}: {label}',
      assignSelected: 'Asignar seleccionados',
      removeSelected: 'Quitar seleccionados',
      selected: '{count} seleccionados',
      count: '{visible} de {total}',
      emptyAvailable: 'Todos los elementos están asignados.',
      emptyAssigned: 'Elige elementos para asignar.',
      emptyCatalog: 'No hay elementos disponibles.',
      noResults: 'No hay coincidencias.',
      clearSearch: 'Borrar búsqueda',
      locked: 'Administrado por una política',
      disabled: 'No disponible',
      unknown: '{count} elementos asignados no están en el catálogo actual.',
      moved: '{count} elementos {action}.',
      assignedAction: 'asignados',
      removedAction: 'retirados',
      retry: 'Reintentar',
      loading: 'Cargando elementos…',
   },
});
let sequence = 0;

export default class TransferList extends HTMLElement {
   static props = {
      items: {
         type: 'array',
         default: [],
         items: {
            type: 'object',
            schema: {
               value: { type: 'any', required: true },
               label: { type: 'string' },
               description: { type: 'string' },
               group: { type: 'string' },
               content: { type: 'any' },
               disabled: { type: 'boolean' },
               locked: { type: 'boolean' },
            },
         },
      },
      value: { type: 'array', default: [] },
      searchable: { type: 'boolean', default: true },
      showSelectAll: { type: 'boolean', default: true },
      disabled: { type: 'boolean', default: false },
      loading: { type: 'boolean', default: false },
      error: { type: 'string', default: '' },
      ariaLabel: { type: 'string', default: '' },
      texts: { type: 'object', default: null },
      onChange: { type: 'function', default: null },
      onRetry: { type: 'function', default: null },
   };
   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-transfer-list');
      this.$panels = this.querySelector('.slice-transfer-list__panels');
      this.$error = this.querySelector('.slice-transfer-list__error');
      this.$unknown = this.querySelector('.slice-transfer-list__unknown');
      this.$status = this.querySelector('.slice-transfer-list__status');
      this._catalog = [];
      this._requested = [];
      this._marks = { available: new Set(), assigned: new Set() };
      this._queries = { available: '', assigned: '' };
      this._rows = new Map();
      this._views = new Map();
      this._overrides = {};
      this._children = new Set();
      this._ready = false;
      this._dead = false;
      this._retryButton = null;
      this._uid = `slice-transfer-list-${++sequence}`;
      slice.controller.setComponentProps(this, props);
   }
   async _build(name, props) {
      const child = await slice.build(name, props);
      if (!child) throw new Error(`TransferList: ${name} could not be built`);
      if (this._dead) {
         slice.controller.destroyComponent(child);
         return null;
      }
      this._children.add(child);
      return child;
   }
   async init() {
      this._ready = true;
      for (const side of ['available', 'assigned']) {
         const el = document.createElement('section');
         el.className = 'slice-transfer-list__panel';
         el.dataset.side = side;
         const header = document.createElement('div');
         header.className = 'slice-transfer-list__header';
         const title = document.createElement('h3');
         title.className = 'slice-transfer-list__title';
         title.id = `${this._uid}-${side}`;
         el.setAttribute('aria-labelledby', title.id);
         const count = document.createElement('span');
         count.className = 'slice-transfer-list__count';
         header.append(title, count);
         const searchBox = document.createElement('div');
         searchBox.className = 'slice-transfer-list__search';
         const search = await this._build('Input', {
            size: 'sm',
            labelPlacement: 'above',
            clearable: true,
            onChange: (value) => this.setSearch(side, value),
         });
         if (!search) return;
         searchBox.append(search);
         const selection = document.createElement('div');
         selection.className = 'slice-transfer-list__selection';
         const all = await this._build('Checkbox', {
            size: 'sm',
            variant: 'plain',
            onChange: (checked) => this._selectVisible(side, checked),
         });
         if (!all) return;
         selection.append(all);
         const body = document.createElement('div');
         body.className = 'slice-transfer-list__body';
         const list = document.createElement('ul');
         list.className = 'slice-transfer-list__list';
         list.setAttribute('aria-labelledby', title.id);
         const skeleton = document.createElement('div');
         skeleton.className = 'slice-transfer-list__skeleton';
         skeleton.setAttribute('aria-hidden', 'true');
         for (let i = 0; i < 3; i++)
            skeleton.append(document.createElement('span'));
         const empty = document.createElement('p');
         empty.className = 'slice-transfer-list__empty';
         const clearBox = document.createElement('div');
         clearBox.className = 'slice-transfer-list__clear';
         const clear = await this._build('Button', {
            size: 'sm',
            variant: 'ghost',
            onClick: () => {
               search.value = '';
               this.setSearch(side, '');
            },
         });
         if (!clear) return;
         clearBox.append(clear);
         body.append(skeleton, list, empty, clearBox);
         const footer = document.createElement('div');
         footer.className = 'slice-transfer-list__footer';
         const selected = document.createElement('span');
         selected.className = 'slice-transfer-list__selected';
         const bulk = await this._build('Button', {
            size: 'sm',
            variant: side === 'available' ? 'filled' : 'outlined',
            onClick: () =>
               side === 'available' ? this.assign() : this.remove(),
         });
         if (!bulk) return;
         footer.append(selected, bulk);
         el.append(header, searchBox, selection, body, footer);
         this.$panels.append(el);
         this._views.set(side, {
            el,
            title,
            count,
            searchBox,
            search,
            selection,
            all,
            body,
            list,
            skeleton,
            empty,
            clearBox,
            clear,
            selected,
            bulk,
            headers: new Map(),
         });
      }
      this._retryButton = await this._build('Button', {
         size: 'sm',
         variant: 'outlined',
         onClick: () => this._onRetry?.(),
      });
      if (!this._retryButton) return;
      this.querySelector('.slice-transfer-list__retry').append(
         this._retryButton,
      );
      slice.translator?.watch?.(this, () => {
         this._labels();
         this.update();
      });
      this._labels();
      await this.update();
   }
   get items() {
      return this._catalog.map((item) => ({ ...item }));
   }
   _contentNodes(items) {
      return items
         .flatMap((item) =>
            Array.isArray(item.content) ? item.content : [item.content],
         )
         .filter((node) => node instanceof Node)
         .flatMap((node) =>
            node.nodeType === 11 ? [...node.childNodes] : [node],
         );
   }
   set items(v) {
      const next = normalizeItems(v);
      const nodes = this._contentNodes(next);
      const keep = new Set(nodes);
      if (
         keep.size !== nodes.length ||
         nodes.some((node) => node === this || node.contains?.(this))
      )
         throw new TypeError(
            'TransferList: content nodes cannot be shared between rows',
         );
      const pending = this._catalog.filter(
         (item) => !this._rows.has(item.value),
      );
      destroyNodes(
         this._contentNodes(pending).filter((node) => !keep.has(node)),
      );
      this._catalog = next;
      reparentNodes(this._contentNodes(next), this);
      this._cleanMarks();
      if (this._ready) this.update();
   }
   get value() {
      return [...this._requested];
   }
   set value(v) {
      this._requested = normalizeValue(v);
      this._cleanMarks();
      if (this._ready) this.update();
   }
   get searchable() {
      return this._searchable;
   }
   set searchable(v) {
      this._searchable = v !== false;
      if (!this._searchable) {
         this._queries = { available: '', assigned: '' };
         this.clearSelection();
      }
      if (this._ready) this.update();
   }
   get showSelectAll() {
      return this._showSelectAll;
   }
   set showSelectAll(v) {
      this._showSelectAll = v !== false;
      if (this._ready) this.update();
   }
   get disabled() {
      return this._disabled;
   }
   set disabled(v) {
      this._disabled = v === true;
      if (this._ready) this.update();
   }
   get loading() {
      return this._loading;
   }
   set loading(v) {
      if (this._loading && v !== true) this.$status.textContent = '';
      this._loading = v === true;
      if (this._ready) this.update();
   }
   get error() {
      return this._error;
   }
   set error(v) {
      this._error = typeof v === 'string' ? v : '';
      if (this._ready) this.update();
   }
   get ariaLabel() {
      return this._ariaLabel;
   }
   set ariaLabel(v) {
      this._ariaLabel = typeof v === 'string' ? v : '';
      this._labels();
   }
   get texts() {
      return { ...this._overrides };
   }
   set texts(v) {
      this._overrides = v && typeof v === 'object' ? { ...v } : {};
      this._labels();
      if (this._ready) this.update();
   }
   get onChange() {
      return this._onChange;
   }
   set onChange(v) {
      this._onChange = typeof v === 'function' ? v : null;
   }
   get onRetry() {
      return this._onRetry;
   }
   set onRetry(v) {
      this._onRetry = typeof v === 'function' ? v : null;
      if (this._ready) this.update();
   }
   _t(key, params = {}) {
      return this._overrides[key] == null
         ? t(key, params)
         : String(this._overrides[key]).replace(/\{(\w+)\}/g, (m, k) =>
              k in params ? String(params[k]) : m,
           );
   }
   _labels() {
      this.setAttribute('role', 'group');
      this.setAttribute('aria-label', this._ariaLabel || this._t('label'));
   }
   _locked() {
      return this._disabled || this._loading || !!this._error;
   }
   _visible(side) {
      return filterItems(
         this._catalog,
         this._requested,
         side,
         this._queries[side],
      );
   }
   _cleanMarks() {
      if (!this._marks) return;
      for (const side of ['available', 'assigned']) {
         const valid = new Set(
            this._visible(side)
               .filter((item) => !item.disabled && !item.locked)
               .map((item) => item.value),
         );
         for (const value of this._marks[side])
            if (!valid.has(value)) this._marks[side].delete(value);
      }
   }
   setSearch(side, query) {
      if (!this._marks[side] || this._dead) return false;
      this._queries[side] = String(query ?? '');
      this._marks[side].clear();
      const view = this._views.get(side);
      if (view && view.search.value !== this._queries[side])
         view.search.value = this._queries[side];
      if (this._ready) this.update();
      return true;
   }
   getSelection(side) {
      return this._marks[side] ? [...this._marks[side]] : [];
   }
   clearSelection(side) {
      for (const name of side ? [side] : ['available', 'assigned'])
         this._marks[name]?.clear();
      if (this._ready) this.update();
   }
   _selectVisible(side, checked) {
      if (this._locked()) return;
      for (const item of this._visible(side))
         if (!item.disabled && !item.locked) {
            if (checked) this._marks[side].add(item.value);
            else this._marks[side].delete(item.value);
         }
      this.update();
   }
   assign(values = this.getSelection('available')) {
      return this._move(values, 'assign');
   }
   remove(values = this.getSelection('assigned')) {
      return this._move(values, 'remove');
   }
   _move(values, direction) {
      if (this._dead || this._locked()) return false;
      const result = changeAssignment(
         this._catalog,
         this._requested,
         values,
         direction,
      );
      if (!result.moved.length) return false;
      this._requested = result.value;
      for (const key of result.moved) {
         this._marks.available.delete(key);
         this._marks.assigned.delete(key);
      }
      this.$status.textContent = this._t('moved', {
         count: result.moved.length,
         action: this._t(
            direction === 'assign' ? 'assignedAction' : 'removedAction',
         ),
      });
      this.update();
      this._onChange?.(this.value, {
         direction,
         values: [...result.moved],
         items: result.moved.map((value) => ({
            ...this._catalog.find((item) => item.value === value),
         })),
      });
      return true;
   }
   async _makeRow(item) {
      const el = document.createElement('li');
      el.className = 'slice-transfer-list__row';
      const head = document.createElement('div');
      head.className = 'slice-transfer-list__row-head';
      const check = await this._build('Checkbox', {
         size: 'sm',
         variant: 'plain',
         label: item.label,
         onChange: (checked) => {
            if (this._locked()) return;
            const record = this._catalog.find(
               (entry) => entry.value === item.value,
            );
            if (!record || record.disabled || record.locked) return;
            const side = this._requested.includes(item.value)
               ? 'assigned'
               : 'available';
            if (checked) this._marks[side].add(item.value);
            else this._marks[side].delete(item.value);
            this.update();
         },
      });
      if (!check) return null;
      const action = await this._build('Button', {
         size: 'sm',
         variant: 'ghost',
         onClick: () =>
            this._requested.includes(item.value)
               ? this.remove([item.value])
               : this.assign([item.value]),
      });
      if (!action) return null;
      head.append(check, action);
      const description = document.createElement('p');
      description.className = 'slice-transfer-list__description';
      description.id = `${this._uid}-description-${++sequence}`;
      const lock = document.createElement('span');
      lock.className = 'slice-transfer-list__lock';
      lock.id = `${this._uid}-lock-${sequence}`;
      const extra = document.createElement('div');
      extra.className = 'slice-transfer-list__extra';
      el.append(head, description, lock, extra);
      return {
         el,
         check,
         action,
         description,
         lock,
         extra,
         nodes: [],
         source: undefined,
      };
   }
   _dropRow(row) {
      const keep = new Set(this._contentNodes(this._catalog));
      destroyNodes(row.nodes.filter((node) => !keep.has(node)));
      for (const child of [row.check, row.action]) {
         this._children.delete(child);
         if (slice.controller.activeComponents.has(child.sliceId))
            slice.controller.destroyComponent(child);
      }
      row.el.remove();
   }
   async update() {
      if (
         !this._ready ||
         this._dead ||
         this._views.size !== 2 ||
         !this._retryButton
      )
         return;
      const restore = captureView([this.$panels]);
      const wanted = new Set(this._catalog.map((item) => item.value));
      for (const [value, row] of this._rows)
         if (!wanted.has(value)) {
            this._dropRow(row);
            this._rows.delete(value);
         }
      for (const snapshot of this._catalog) {
         let item = this._catalog.find(
            (record) => record.value === snapshot.value,
         );
         if (!item) continue;
         let row = this._rows.get(item.value);
         if (!row) {
            row = await this._makeRow(item);
            if (!row || this._dead) return;
            item = this._catalog.find(
               (record) => record.value === snapshot.value,
            );
            if (!item) {
               this._dropRow(row);
               continue;
            }
            this._rows.set(item.value, row);
         }
         const side = this._requested.includes(item.value)
            ? 'assigned'
            : 'available';
         row.check.label = item.label;
         row.check.checked = this._marks[side].has(item.value);
         row.check.disabled = this._locked() || item.disabled || item.locked;
         row.action.value = this._t(side === 'assigned' ? 'remove' : 'assign');
         row.action.ariaLabel = this._t('itemAction', {
            action: row.action.value,
            label: item.label,
         });
         row.action.disabled = row.check.disabled;
         row.description.textContent = item.description;
         row.description.hidden = !item.description;
         row.lock.textContent = this._t(item.locked ? 'locked' : 'disabled');
         row.lock.hidden = !item.locked && !item.disabled;
         const described = [
            item.description ? row.description.id : '',
            item.locked || item.disabled ? row.lock.id : '',
         ]
            .filter(Boolean)
            .join(' ');
         if (described)
            row.check.$input.setAttribute('aria-describedby', described);
         else row.check.$input.removeAttribute('aria-describedby');
         if (row.source !== item.content) {
            const nodes = toNodes(
               item.content,
               'slice-transfer-list__text',
            ).flatMap((node) =>
               node.nodeType === 11 ? [...node.childNodes] : [node],
            );
            destroyNodes(row.nodes.filter((node) => !nodes.includes(node)));
            nodes.forEach((node) => row.extra.append(node));
            row.nodes = nodes;
            row.source = item.content;
         }
      }
      const known = new Set(this._catalog.map((item) => item.value));
      const unknown = this._requested.filter((value) => !known.has(value));
      this.$unknown.hidden = !unknown.length || this._loading;
      this.$unknown.textContent = this._t('unknown', { count: unknown.length });
      this.$error.hidden = !this._error;
      this.$error.querySelector('p').textContent = this._error || '';
      this._retryButton.value = this._t('retry');
      this._retryButton.hidden = !this._onRetry;
      this._retryButton.disabled = this._loading || this._disabled;
      this.setAttribute('aria-busy', String(this._loading));
      if (this._loading) this.$status.textContent = this._t('loading');
      for (const side of ['available', 'assigned']) {
         const view = this._views.get(side),
            visible = this._visible(side);
         const ids = new Set(visible.map((item) => item.value));
         const all = filterItems(this._catalog, this._requested, side);
         const movable = visible.filter(
            (item) => !item.disabled && !item.locked,
         );
         const selected = movable.filter((item) =>
            this._marks[side].has(item.value),
         );
         const title = this._t(side);
         view.title.textContent = title;
         view.count.textContent = this._t('count', {
            visible: visible.length,
            total: all.length,
         });
         view.search.label = this._t('search', { title });
         view.search.disabled = this._disabled;
         view.searchBox.hidden = !this._searchable;
         view.selection.hidden = !this._showSelectAll;
         view.all.label = this._t('selectVisible');
         view.all.$input.setAttribute(
            'aria-label',
            `${this._t('selectVisible')}: ${title}`,
         );
         view.all.checked =
            movable.length > 0 && selected.length === movable.length;
         view.all.$input.indeterminate =
            selected.length > 0 && selected.length < movable.length;
         view.all.disabled = this._locked() || !movable.length;
         view.selected.textContent = this._t('selected', {
            count: selected.length,
         });
         view.bulk.value = this._t(
            side === 'available' ? 'assignSelected' : 'removeSelected',
         );
         view.bulk.disabled = this._locked() || !selected.length;
         const ordered = [],
            headers = new Set();
         // Group by first category appearance; rows keep catalog order within each group.
         const categoryOrder = [...new Set(all.map((item) => item.group))];
         for (const group of categoryOrder) {
            const rows = all.filter((item) => item.group === group);
            if (group) {
               let heading = view.headers.get(group);
               if (!heading) {
                  heading = document.createElement('li');
                  heading.className = 'slice-transfer-list__group';
                  heading.setAttribute('role', 'presentation');
                  view.headers.set(group, heading);
               }
               heading.textContent = group;
               heading.hidden = !rows.some((item) => ids.has(item.value));
               ordered.push(heading);
               headers.add(group);
            }
            for (const item of rows) {
               const row = this._rows.get(item.value);
               row.el.hidden = !ids.has(item.value);
               ordered.push(row.el);
            }
         }
         for (const [group, heading] of view.headers)
            if (!headers.has(group)) {
               heading.remove();
               view.headers.delete(group);
            }
         ordered.forEach((el, index) => {
            if (view.list.children[index] !== el)
               view.list.insertBefore(el, view.list.children[index] || null);
         });
         const firstLoading = this._loading && !this._catalog.length;
         view.skeleton.hidden = !firstLoading;
         view.empty.hidden = visible.length > 0 || firstLoading;
         view.empty.textContent = this._queries[side]
            ? this._t('noResults')
            : !this._catalog.length
              ? this._t('emptyCatalog')
              : this._t(
                   side === 'available' ? 'emptyAvailable' : 'emptyAssigned',
                );
         view.clear.value = this._t('clearSearch');
         view.clear.disabled = this._disabled;
         view.clearBox.hidden = !this._queries[side] || visible.length > 0;
      }
      reparentNodes([this.$panels, this.$error], this);
      restore();
   }
   beforeDestroy() {
      this._dead = true;
      this._ready = false;
      const owned = new Set(
         [...this._rows.values()].flatMap((row) => row.nodes),
      );
      for (const item of this._catalog)
         for (const node of Array.isArray(item.content)
            ? item.content
            : [item.content])
            if (node instanceof Node) owned.add(node);
      destroyNodes(owned);
      for (const child of this._children)
         if (slice.controller.activeComponents.has(child.sliceId))
            slice.controller.destroyComponent(child);
      this._children.clear();
      this._rows.clear();
      this._views.clear();
      this._marks.available.clear();
      this._marks.assigned.clear();
   }
}
customElements.define('slice-transfer-list', TransferList);
