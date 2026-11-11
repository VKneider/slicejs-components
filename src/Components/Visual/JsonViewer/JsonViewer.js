// JsonViewer — a JSON value as a tree you can read: objects and arrays fold open, values
// are coloured by type, and any node's path or value can be copied. For API responses in
// docs, a record's raw data in an admin panel, a config, a webhook payload.
//
//   await slice.build('JsonViewer', { data: response, expandDepth: 2, search: true });
//
// Only what is open is in the DOM, and a long array opens in ranges of 100 ("[0 … 99]"),
// so a large response stays fast.
//
// Keyboard (a tree, one Tab stop): ↑ ↓ move · → opens or goes in · ← closes or goes up ·
// Home / End · Enter selects (onSelect) · c copies the value · p copies the path.
// In the search box, Enter goes to the next match.

import { texts } from '../../shared/text/texts.js';

const CHUNK = 100;
const MAX_SEARCH_NODES = 20000;

const TEXTS = {
   label: 'JSON',
   search: 'Search keys and values',
   matches: '{count} matches',
   oneMatch: '1 match',
   noMatches: 'No matches',
   expandAll: 'Expand all',
   collapseAll: 'Collapse all',
   item: '{count} item',
   items: '{count} items',
   key: '{count} key',
   keys: '{count} keys',
   more: '+{count} characters',
   copyValue: 'Copy value',
   copyPath: 'Copy path',
   copiedValue: 'Value copied',
   copiedPath: 'Path copied: {path}',
   copyFailed: 'Could not copy',
   circular: '[Circular]',
};

const ES = {
   label: 'JSON',
   search: 'Buscar claves y valores',
   matches: '{count} coincidencias',
   oneMatch: '1 coincidencia',
   noMatches: 'Sin coincidencias',
   expandAll: 'Expandir todo',
   collapseAll: 'Contraer todo',
   item: '{count} elemento',
   items: '{count} elementos',
   key: '{count} clave',
   keys: '{count} claves',
   more: '+{count} caracteres',
   copyValue: 'Copiar valor',
   copyPath: 'Copiar ruta',
   copiedValue: 'Valor copiado',
   copiedPath: 'Ruta copiada: {path}',
   copyFailed: 'No se pudo copiar',
   circular: '[Circular]',
};

const t = texts('slice.jsonViewer', { en: TEXTS, es: ES });

/** @param {unknown} value */
function kind(value) {
   if (value === null) return 'null';
   if (Array.isArray(value)) return 'array';
   if (value instanceof Date) return 'date';
   const type = typeof value;
   if (type === 'object') return 'object';
   if (type === 'string' || type === 'number' || type === 'boolean' || type === 'undefined' || type === 'bigint') return type;
   return 'other';
}

/** @param {unknown} value */
function isContainer(value) {
   const k = kind(value);
   return k === 'object' || k === 'array';
}

/** [key, value] pairs of a container. */
function entries(value) {
   if (Array.isArray(value)) return value.map((item, index) => [index, item]);
   return Object.keys(/** @type {object} */ (value)).map((key) => [key, /** @type {any} */ (value)[key]]);
}

/**
 * A path as code: user.addresses[0]["first name"].
 * @param {(string|number)[]} path
 * @param {string} root
 */
function pathText(path, root) {
   let out = root;
   for (const key of path) {
      if (typeof key === 'number') out += `[${key}]`;
      else if (/^[A-Za-z_$][\w$]*$/.test(key)) out += out ? `.${key}` : key;
      else out += `[${JSON.stringify(key)}]`;
   }
   return out || root || '$';
}

/** An id for a node (or a range of an array): stable across renders. */
function idOf(path, range) {
   // A range is an object at the end of the path: no key (a string or a number) can look like it.
   return JSON.stringify(range ? [...path, { range: range[0] }] : path);
}

export default class JsonViewer extends HTMLElement {
   static props = {
      // Any JSON value (objects, arrays, strings, numbers, booleans, null).
      data: { type: 'any', default: null },
      // Levels of keys shown at the start: 1 the top-level keys (closed), 2 also what is
      // inside them, Infinity everything. 0 closes the root row too (with rootName).
      expandDepth: { type: 'number', default: 1 },
      // A name for the root ("response"): shows a root row and starts every copied path.
      rootName: { type: 'string', default: '' },
      // A search box that highlights and opens what matches.
      search: { type: 'boolean', default: false },
      // Expand all / Collapse all buttons.
      toolbar: { type: 'boolean', default: true },
      // Keys in alphabetical order (the data is not changed).
      sortKeys: { type: 'boolean', default: false },
      // Strings longer than this are cut, with a button for the rest.
      maxStringLength: { type: 'number', default: 200 },
      // Copy buttons on each row (the c / p keys work regardless).
      copyable: { type: 'boolean', default: true },
      // A height that scrolls (e.g. '320px'); empty: as tall as the content.
      maxHeight: { type: 'string', default: '' },
      size: { type: 'string', default: 'md', allowedValues: ['sm', 'md'] },
      ariaLabel: { type: 'string', default: '' },
      // onSelect({ path, pathText, key, value }) on Enter or a click on a key.
      onSelect: { type: 'function', default: null },
      // onCopy({ what: 'value' | 'path', text, path })
      onCopy: { type: 'function', default: null },
      texts: { type: 'object', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-json-viewer');
      this.$toolbar = this.querySelector('.slice-json-viewer__toolbar');
      this.$search = /** @type {HTMLInputElement} */ (this.querySelector('.slice-json-viewer__search'));
      this.$count = this.querySelector('.slice-json-viewer__count');
      this.$tools = this.querySelector('.slice-json-viewer__tools');
      this.$expand = this.querySelector('[data-action="expand"]');
      this.$collapse = this.querySelector('[data-action="collapse"]');
      this.$tree = this.querySelector('.slice-json-viewer__tree');
      this.$status = this.querySelector('.slice-json-viewer__status');

      this._data = /** @type {any} */ (null);
      this._expandDepth = 1;
      this._rootName = '';
      this._search = false;
      this._toolbar = true;
      this._sortKeys = false;
      this._maxStringLength = 200;
      this._copyable = true;
      this._maxHeight = '';
      this._size = 'md';
      this._ariaLabel = '';
      this._onSelect = /** @type {Function | null} */ (null);
      this._onCopy = /** @type {Function | null} */ (null);
      this._texts = /** @type {Record<string, string>} */ ({});

      // Internal state: never a prop's `_<name>`.
      this._ready = false;
      this._open = new Set();          // ids of open nodes and ranges
      this._fullStrings = new Set();   // ids of strings shown whole
      this._query = '';
      this._matches = /** @type {string[]} */ ([]);
      this._matchIndex = -1;
      this._focusId = '';
      this._searchTimer = 0;
      this._statusTimer = 0;
      this._seeded = false;

      this._onTreeClick = (/** @type {MouseEvent} */ e) => this._handleClick(e);
      this._onTreeKey = (/** @type {KeyboardEvent} */ e) => this._handleKey(e);
      this._onTreeFocus = (/** @type {FocusEvent} */ e) => {
         const row = /** @type {Element} */ (e.target)?.closest?.('[role="treeitem"]');
         if (row instanceof HTMLElement) this._setFocusRow(row, false);
      };
      this._onSearchInput = () => {
         clearTimeout(this._searchTimer);
         this._searchTimer = window.setTimeout(() => this._runSearch(this.$search.value), 150);
      };
      this._onSearchKey = (/** @type {KeyboardEvent} */ e) => {
         if (e.key !== 'Enter') return;
         e.preventDefault();
         clearTimeout(this._searchTimer);
         if (this.$search.value !== this._query) this._runSearch(this.$search.value);
         this._nextMatch(e.shiftKey ? -1 : 1);
      };
      this._onExpandAll = () => this.expandAll();
      this._onCollapseAll = () => this.collapseAll();

      slice.controller.setComponentProps(this, props);
      this._paintLooks();
   }

   init() {
      this._ready = true;
      this.$tree.addEventListener('click', this._onTreeClick);
      this.$tree.addEventListener('keydown', this._onTreeKey);
      this.$tree.addEventListener('focusin', this._onTreeFocus);
      this.$search.addEventListener('input', this._onSearchInput);
      this.$search.addEventListener('keydown', this._onSearchKey);
      this.$expand.addEventListener('click', this._onExpandAll);
      this.$collapse.addEventListener('click', this._onCollapseAll);
      slice.translator?.watch?.(this, () => { this._paintTexts(); this._render(); });
      this._paintTexts();
      this._seed();
      this._render();
   }

   beforeDestroy() {
      this._ready = false;
      clearTimeout(this._searchTimer);
      clearTimeout(this._statusTimer);
      this.$tree.removeEventListener('click', this._onTreeClick);
      this.$tree.removeEventListener('keydown', this._onTreeKey);
      this.$tree.removeEventListener('focusin', this._onTreeFocus);
      this.$search.removeEventListener('input', this._onSearchInput);
      this.$search.removeEventListener('keydown', this._onSearchKey);
      this.$expand.removeEventListener('click', this._onExpandAll);
      this.$collapse.removeEventListener('click', this._onCollapseAll);
   }

   // ── Props ──────────────────────────────────────────────────────

   get data() { return this._data; }
   set data(value) {
      this._data = value === undefined ? null : value;
      this._open.clear();
      this._fullStrings.clear();
      this._seeded = false;
      if (this._ready) {
         this._seed();
         if (this._query) this._runSearch(this._query);
         else this._render();
      }
   }

   get expandDepth() { return this._expandDepth; }
   set expandDepth(value) {
      const n = Number(value);
      this._expandDepth = Number.isNaN(n) ? 1 : Math.max(0, n);
      if (this._ready) {
         this._open.clear();
         this._seeded = false;
         this._seed();
         this._render();
      }
   }

   get rootName() { return this._rootName; }
   set rootName(value) { this._rootName = value ? String(value) : ''; if (this._ready) { this._seeded = false; this._seed(); this._render(); } }

   get search() { return this._search; }
   set search(value) { this._search = value === true; this._paintLooks(); }

   get toolbar() { return this._toolbar; }
   set toolbar(value) { this._toolbar = value !== false; this._paintLooks(); }

   get sortKeys() { return this._sortKeys; }
   set sortKeys(value) { this._sortKeys = value === true; if (this._ready) this._render(); }

   get maxStringLength() { return this._maxStringLength; }
   set maxStringLength(value) {
      const n = Math.round(Number(value));
      this._maxStringLength = Number.isFinite(n) && n > 0 ? n : 200;
      if (this._ready) this._render();
   }

   get copyable() { return this._copyable; }
   set copyable(value) { this._copyable = value !== false; this.classList.toggle('is-copyable', this._copyable); if (this._ready) this._render(); }

   get maxHeight() { return this._maxHeight; }
   set maxHeight(value) {
      const text = value == null ? '' : String(value).trim();
      this._maxHeight = /^\d+(\.\d+)?$/.test(text) ? `${text}px` : text;
      this._paintLooks();
   }

   get size() { return this._size; }
   set size(value) {
      const { allowedValues, default: fallback } = JsonViewer.props.size;
      this._size = allowedValues.includes(value) ? value : fallback;
      this._paintLooks();
   }

   get ariaLabel() { return this._ariaLabel; }
   set ariaLabel(value) { this._ariaLabel = value ? String(value) : ''; this._paintTexts(); }

   get onSelect() { return this._onSelect; }
   set onSelect(value) { this._onSelect = typeof value === 'function' ? value : null; }

   get onCopy() { return this._onCopy; }
   set onCopy(value) { this._onCopy = typeof value === 'function' ? value : null; }

   get texts() { return this._texts; }
   set texts(value) {
      this._texts = value && typeof value === 'object' ? { ...value } : {};
      if (this._ready) { this._paintTexts(); this._render(); }
   }

   // ── Methods ────────────────────────────────────────────────────

   /** Open every container (up to a few thousand nodes, so a huge payload stays usable). */
   expandAll() {
      let budget = 5000;
      const walk = (value, path, ancestors) => {
         if (budget-- <= 0 || !isContainer(value) || ancestors.has(value)) return;
         this._open.add(idOf(path));
         const list = this._entries(value);
         const next = new Set(ancestors).add(value);
         for (const range of this._ranges(list.length)) if (range) this._open.add(idOf(path, range));
         for (const [key, child] of list) walk(child, [...path, key], next);
      };
      walk(this._data, [], new Set());
      this._render();
   }

   /** Close everything (the root stays open when it has no row). */
   collapseAll() {
      this._open.clear();
      if (!this._rootName) this._open.add(idOf([]));
      this._render();
   }

   // ── Text ───────────────────────────────────────────────────────

   /** @param {string} key @param {Record<string, any>} [params] */
   _t(key, params = {}) {
      const own = this._texts[key];
      if (own == null) return t(key, params);
      return String(own).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
   }

   _paintTexts() {
      if (!this.$tree) return;
      this.$tree.setAttribute('aria-label', this._ariaLabel || this._rootName || this._t('label'));
      this.$search.placeholder = this._t('search');
      this.$search.setAttribute('aria-label', this._t('search'));
      this.$expand.textContent = this._t('expandAll');
      this.$collapse.textContent = this._t('collapseAll');
      this.$tree.setAttribute('aria-keyshortcuts', 'c p');
   }

   _paintLooks() {
      this.dataset.size = this._size;
      this.classList.toggle('is-copyable', this._copyable);
      if (!this.$toolbar) return;
      this.$search.hidden = !this._search;
      this.$tools.hidden = !this._toolbar;
      this.$toolbar.hidden = !this._search && !this._toolbar;
      if (this._maxHeight) this.$tree.style.maxHeight = this._maxHeight;
      else this.$tree.style.removeProperty('max-height');
      this.$tree.classList.toggle('is-scrolling', !!this._maxHeight);
   }

   /** @param {string} message */
   _announce(message) {
      clearTimeout(this._statusTimer);
      this.$status.textContent = message;
      this._statusTimer = window.setTimeout(() => { this.$status.textContent = ''; }, 2500);
   }

   // ── Model ──────────────────────────────────────────────────────

   /** @param {any} value */
   _entries(value) {
      const list = entries(value);
      if (this._sortKeys && !Array.isArray(value)) list.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
      return list;
   }

   /** The ranges a container's children are split in (null: no split). */
   _ranges(length) {
      if (length <= CHUNK) return [null];
      const ranges = [];
      for (let start = 0; start < length; start += CHUNK) ranges.push([start, Math.min(start + CHUNK, length) - 1]);
      return ranges;
   }

   /** Open the first `expandDepth` levels. */
   _seed() {
      if (this._seeded) return;
      this._seeded = true;
      // Without a root row, the root is always open: its entries are the top level.
      if (!this._rootName) this._open.add(idOf([]));
      const depth = this._expandDepth;
      let budget = 3000;
      const walk = (value, path, level, ancestors) => {
         if (budget-- <= 0 || !isContainer(value) || ancestors.has(value)) return;
         // level 0 is the root (a row with rootName); its entries are level 1. A container
         // opens when the level of its entries is still within expandDepth.
         if (level >= depth) return;
         this._open.add(idOf(path));
         const list = this._entries(value);
         const next = new Set(ancestors).add(value);
         const ranges = this._ranges(list.length);
         if (ranges[0]) this._open.add(idOf(path, ranges[0]));
         for (const [key, child] of list.slice(0, CHUNK)) walk(child, [...path, key], level + 1, next);
      };
      walk(this._data, [], 0, new Set());
   }

   // ── Rendering ──────────────────────────────────────────────────

   _render() {
      if (!this._ready) return;
      const focusId = this._focusId;
      const hadFocus = this.$tree.contains(document.activeElement);
      const items = [];
      const value = this._data;
      if (this._rootName || !isContainer(value)) {
         items.push(this._buildNode(this._rootName || null, value, [], 1, 1, 1, new Set()));
      } else {
         items.push(...this._buildChildren(value, [], 1, new Set()));
      }
      this.$tree.replaceChildren(...items);
      this._paintMatches();

      // One Tab stop: the focused row, or the first.
      const rows = this._rows();
      const target = rows.find((row) => row.dataset.id === focusId) || rows[0];
      if (target) this._setFocusRow(target, hadFocus);
   }

   /**
    * The children of an open container: its entries, or its ranges.
    * @param {any} value
    * @param {(string|number)[]} path
    * @param {number} level
    * @param {Set<any>} ancestors
    */
   _buildChildren(value, path, level, ancestors) {
      const list = this._entries(value);
      const next = new Set(ancestors).add(value);
      const ranges = this._ranges(list.length);
      if (!ranges[0]) {
         return list.map(([key, child], i) => this._buildNode(key, child, [...path, key], level, i + 1, list.length, next));
      }
      return ranges.map((range, i) => this._buildRange(/** @type {number[]} */ (range), list, path, level, i + 1, ranges.length, next));
   }

   /**
    * A row "[100 … 199]" that opens a slice of a long array or object.
    * @param {number[]} range
    * @param {any[]} list
    * @param {(string|number)[]} path
    * @param {number} level
    * @param {number} pos
    * @param {number} total
    * @param {Set<any>} ancestors
    */
   _buildRange(range, list, path, level, pos, total, ancestors) {
      const id = idOf(path, range);
      const open = this._open.has(id);
      const li = this._row(id, level, pos, total, open);
      li.dataset.range = `${range[0]}-${range[1]}`;
      const line = li.firstElementChild;
      const label = document.createElement('span');
      label.className = 'slice-json-viewer__range';
      label.textContent = `[${range[0]} … ${range[1]}]`;
      line.append(label);
      if (open) {
         const group = document.createElement('ul');
         group.setAttribute('role', 'group');
         const slice_ = list.slice(range[0], range[1] + 1);
         group.append(...slice_.map(([key, child], i) => this._buildNode(key, child, [...path, key], level + 1, i + 1, slice_.length, ancestors)));
         li.append(group);
      }
      return li;
   }

   /**
    * @param {string} id
    * @param {number} level
    * @param {number} pos
    * @param {number} total
    * @param {boolean | null} open null for a leaf
    */
   _row(id, level, pos, total, open) {
      const li = document.createElement('li');
      li.className = 'slice-json-viewer__node';
      li.setAttribute('role', 'treeitem');
      li.setAttribute('aria-level', String(level));
      li.setAttribute('aria-posinset', String(pos));
      li.setAttribute('aria-setsize', String(total));
      li.tabIndex = -1;
      li.dataset.id = id;
      li.style.setProperty('--level', String(level - 1));
      if (open !== null) li.setAttribute('aria-expanded', String(open));

      const line = document.createElement('div');
      line.className = 'slice-json-viewer__line';
      const caret = document.createElement('span');
      caret.className = 'slice-json-viewer__caret';
      caret.setAttribute('aria-hidden', 'true');
      line.append(caret);
      li.append(line);
      return li;
   }

   /**
    * One key: value row (and its children when open).
    * @param {string|number|null} key
    * @param {any} value
    * @param {(string|number)[]} path
    * @param {number} level
    * @param {number} pos
    * @param {number} total
    * @param {Set<any>} ancestors
    */
   _buildNode(key, value, path, level, pos, total, ancestors) {
      const id = idOf(path);
      const circular = isContainer(value) && ancestors.has(value);
      const container = isContainer(value) && !circular;
      const open = container && this._open.has(id);
      const li = this._row(id, level, pos, total, container ? open : null);
      const line = /** @type {HTMLElement} */ (li.firstElementChild);

      if (key !== null) {
         const k = document.createElement('span');
         k.className = 'slice-json-viewer__key';
         k.dataset.kind = typeof key === 'number' ? 'index' : 'key';
         k.textContent = typeof key === 'number' ? String(key) : key;
         const colon = document.createElement('span');
         colon.className = 'slice-json-viewer__colon';
         colon.textContent = ':';
         line.append(k, colon);
      }

      if (circular) {
         line.append(this._valueSpan('other', this._t('circular')));
      } else if (container) {
         const isArray = Array.isArray(value);
         const count = isArray ? value.length : Object.keys(value).length;
         const brace = document.createElement('span');
         brace.className = 'slice-json-viewer__brace';
         brace.textContent = isArray ? '[' : '{';
         const preview = document.createElement('span');
         preview.className = 'slice-json-viewer__preview';
         preview.textContent = this._t(isArray ? (count === 1 ? 'item' : 'items') : (count === 1 ? 'key' : 'keys'), { count });
         const close = document.createElement('span');
         close.className = 'slice-json-viewer__brace';
         close.textContent = isArray ? ']' : '}';
         line.append(brace, preview, close);
         li.dataset.kind = isArray ? 'array' : 'object';
      } else {
         this._appendPrimitive(line, value, id);
         li.dataset.kind = kind(value);
      }

      if (this._copyable) line.append(this._actions());

      if (open) {
         const group = document.createElement('ul');
         group.setAttribute('role', 'group');
         group.append(...this._buildChildren(value, path, level + 1, ancestors));
         li.append(group);
      }
      return li;
   }

   /**
    * @param {HTMLElement} line
    * @param {any} value
    * @param {string} id
    */
   _appendPrimitive(line, value, id) {
      const k = kind(value);
      if (k === 'string') {
         const full = this._fullStrings.has(id);
         const cut = !full && value.length > this._maxStringLength;
         const shown = cut ? value.slice(0, this._maxStringLength) : value;
         line.append(this._valueSpan('string', `"${shown}${cut ? '…' : ''}"`));
         if (cut) {
            const more = document.createElement('button');
            more.type = 'button';
            more.tabIndex = -1;
            more.className = 'slice-json-viewer__more';
            more.textContent = this._t('more', { count: value.length - this._maxStringLength });
            line.append(more);
         }
         return;
      }
      if (k === 'date') return void line.append(this._valueSpan('string', `"${value.toISOString()}"`));
      if (k === 'undefined') return void line.append(this._valueSpan('null', 'undefined'));
      if (k === 'bigint') return void line.append(this._valueSpan('number', `${value}n`));
      line.append(this._valueSpan(k, String(value)));
   }

   /** @param {string} type @param {string} text */
   _valueSpan(type, text) {
      const span = document.createElement('span');
      span.className = 'slice-json-viewer__value';
      span.dataset.type = type;
      span.textContent = text;
      return span;
   }

   _actions() {
      const box = document.createElement('span');
      box.className = 'slice-json-viewer__actions';
      for (const [what, label] of [['path', this._t('copyPath')], ['value', this._t('copyValue')]]) {
         const button = document.createElement('button');
         button.type = 'button';
         // Not a Tab stop inside the tree: the c / p keys do the same from the row.
         button.tabIndex = -1;
         button.className = 'slice-json-viewer__copy';
         button.dataset.copy = what;
         button.title = label;
         button.setAttribute('aria-label', label);
         button.textContent = what === 'path' ? '⌖' : '⧉';
         box.append(button);
      }
      return box;
   }

   // ── Navigation ─────────────────────────────────────────────────

   /** @returns {HTMLElement[]} the rows a user can see, in order */
   _rows() {
      return /** @type {HTMLElement[]} */ ([...this.$tree.querySelectorAll('[role="treeitem"]')]);
   }

   /**
    * @param {HTMLElement} row
    * @param {boolean} focus
    */
   _setFocusRow(row, focus) {
      for (const other of this.$tree.querySelectorAll('[role="treeitem"][tabindex="0"]')) {
         if (other !== row) /** @type {HTMLElement} */ (other).tabIndex = -1;
      }
      row.tabIndex = 0;
      this._focusId = row.dataset.id || '';
      if (focus) row.focus({ preventScroll: false });
   }

   /** The value at a node id (ranges resolve to the container). */
   _resolve(id) {
      const path = /** @type {any[]} */ (JSON.parse(id)).filter((k) => typeof k === 'string' || typeof k === 'number');
      let value = this._data;
      for (const key of path) value = value == null ? undefined : value[key];
      return { path, value };
   }

   /** @param {HTMLElement} row @param {boolean} open */
   _toggle(row, open) {
      const id = row.dataset.id || '';
      if (open) this._open.add(id);
      else this._open.delete(id);
      this._focusId = id;
      this._render();
   }

   /** @param {MouseEvent} event */
   _handleClick(event) {
      const target = /** @type {Element} */ (event.target);
      const row = /** @type {HTMLElement | null} */ (target?.closest?.('[role="treeitem"]'));
      if (!row) return;
      const copy = target.closest('[data-copy]');
      if (copy) {
         event.stopPropagation();
         this._copy(row, /** @type {'value'|'path'} */ (copy.getAttribute('data-copy')));
         return;
      }
      if (target.closest('.slice-json-viewer__more')) {
         this._fullStrings.add(row.dataset.id || '');
         this._focusId = row.dataset.id || '';
         this._render();
         return;
      }
      // Only the row's own line: a click inside an open child's line is that child's.
      const line = target.closest('.slice-json-viewer__line');
      if (!line || line.parentElement !== row) return;
      this._setFocusRow(row, true);
      if (row.hasAttribute('aria-expanded')) {
         this._toggle(row, row.getAttribute('aria-expanded') !== 'true');
      } else {
         this._select(row);
      }
   }

   /** @param {KeyboardEvent} event */
   _handleKey(event) {
      const row = /** @type {HTMLElement | null} */ (/** @type {Element} */ (event.target)?.closest?.('[role="treeitem"]'));
      if (!row || event.altKey || event.ctrlKey || event.metaKey) return;
      const rows = this._rows();
      const index = rows.indexOf(row);
      const expandable = row.hasAttribute('aria-expanded');
      const open = row.getAttribute('aria-expanded') === 'true';
      const go = (/** @type {HTMLElement | undefined} */ next) => { if (next) this._setFocusRow(next, true); };

      switch (event.key) {
         case 'ArrowDown': go(rows[index + 1]); break;
         case 'ArrowUp': go(rows[index - 1]); break;
         case 'Home': go(rows[0]); break;
         case 'End': go(rows[rows.length - 1]); break;
         case 'ArrowRight':
            if (expandable && !open) this._toggle(row, true);
            else if (expandable && open) go(rows[index + 1]);
            else return;
            break;
         case 'ArrowLeft':
            if (expandable && open) this._toggle(row, false);
            else go(/** @type {HTMLElement | undefined} */ (row.parentElement?.closest('[role="treeitem"]') || undefined));
            break;
         case 'Enter':
            if (expandable) this._toggle(row, !open);
            else this._select(row);
            break;
         case 'c': this._copy(row, 'value'); break;
         case 'p': this._copy(row, 'path'); break;
         default: return;
      }
      event.preventDefault();
   }

   /** @param {HTMLElement} row */
   _select(row) {
      if (row.dataset.range) return;
      const { path, value } = this._resolve(row.dataset.id || '[]');
      const detail = { path, pathText: pathText(path, this._rootName), key: path[path.length - 1] ?? null, value };
      this._onSelect?.(detail);
      this.dispatchEvent(new CustomEvent('json-select', { bubbles: true, detail }));
   }

   /**
    * @param {HTMLElement} row
    * @param {'value'|'path'} what
    */
   async _copy(row, what) {
      const { path, value } = this._resolve(row.dataset.id || '[]');
      const text = what === 'path'
         ? pathText(path, this._rootName)
         : (typeof value === 'string' ? value : this._stringify(value));
      const ok = await writeClipboard(text);
      if (!this._ready) return;
      this._announce(ok
         ? (what === 'path' ? this._t('copiedPath', { path: text }) : this._t('copiedValue'))
         : this._t('copyFailed'));
      if (ok) this._onCopy?.({ what, text, path });
   }

   /** JSON text of a value; circular references become "[Circular]". */
   _stringify(value) {
      const seen = new WeakSet();
      try {
         return JSON.stringify(value, (_key, v) => {
            if (typeof v === 'bigint') return `${v}n`;
            if (v && typeof v === 'object') {
               if (seen.has(v)) return this._t('circular');
               seen.add(v);
            }
            return v;
         }, 2) ?? String(value);
      } catch {
         return String(value);
      }
   }

   // ── Search ─────────────────────────────────────────────────────

   /** @param {string} query */
   _runSearch(query) {
      this._query = String(query || '').trim();
      this._matches = [];
      this._matchIndex = -1;
      const q = this._query.toLowerCase();
      if (q) {
         let budget = MAX_SEARCH_NODES;
         const walk = (value, path, ancestors) => {
            if (budget-- <= 0) return;
            const key = path[path.length - 1];
            const own = key !== undefined && String(key).toLowerCase().includes(q);
            const leaf = !isContainer(value) && value !== undefined && String(value instanceof Date ? value.toISOString() : value).toLowerCase().includes(q);
            if (own || leaf) {
               this._matches.push(idOf(path));
               this._openTo(path);
            }
            if (!isContainer(value) || ancestors.has(value)) return;
            const next = new Set(ancestors).add(value);
            for (const [k, child] of this._entries(value)) walk(child, [...path, k], next);
         };
         walk(this._data, [], new Set());
      }
      const count = this._matches.length;
      this.$count.hidden = !q;
      this.$count.textContent = !q ? '' : count === 0 ? this._t('noMatches') : count === 1 ? this._t('oneMatch') : this._t('matches', { count });
      this._render();
   }

   /** Open every container (and range) on the way to a path. */
   _openTo(path) {
      let value = this._data;
      for (let i = 0; i < path.length; i++) {
         const parentPath = path.slice(0, i);
         this._open.add(idOf(parentPath));
         const list = this._entries(value);
         const position = Array.isArray(value) ? Number(path[i]) : list.findIndex(([k]) => k === path[i]);
         const ranges = this._ranges(list.length);
         if (ranges[0]) {
            const range = ranges.find((r) => r && position >= r[0] && position <= r[1]);
            if (range) this._open.add(idOf(parentPath, range));
         }
         value = value?.[path[i]];
      }
   }

   _paintMatches() {
      const q = this._query.toLowerCase();
      const ids = new Set(this._matches);
      for (const row of this._rows()) {
         const hit = ids.has(row.dataset.id || '');
         row.classList.toggle('is-match', hit);
         if (!hit || !q) continue;
         const line = row.firstElementChild;
         for (const span of line.querySelectorAll('.slice-json-viewer__key, .slice-json-viewer__value')) mark(span, q);
      }
      for (const row of this.$tree.querySelectorAll('.is-current-match')) row.classList.remove('is-current-match');
      const current = this._matches[this._matchIndex];
      if (current) this.$tree.querySelector(`[data-id="${CSS.escape(current)}"]`)?.classList.add('is-current-match');
   }

   /** @param {number} step */
   _nextMatch(step) {
      if (!this._matches.length) return;
      this._matchIndex = (this._matchIndex + step + this._matches.length) % this._matches.length;
      this._paintMatches();
      const row = /** @type {HTMLElement | null} */ (this.$tree.querySelector(`[data-id="${CSS.escape(this._matches[this._matchIndex])}"]`));
      if (row) {
         this._setFocusRow(row, false);
         row.scrollIntoView({ block: 'nearest' });
      }
   }
}

/**
 * Wrap the occurrences of `query` in a span's text with <mark>.
 * @param {Element} span
 * @param {string} query lower case
 */
function mark(span, query) {
   const text = span.textContent || '';
   const lower = text.toLowerCase();
   if (!lower.includes(query)) return;
   const parts = [];
   let at = 0;
   for (let i = lower.indexOf(query); i !== -1; i = lower.indexOf(query, at)) {
      if (i > at) parts.push(document.createTextNode(text.slice(at, i)));
      const m = document.createElement('mark');
      m.textContent = text.slice(i, i + query.length);
      parts.push(m);
      at = i + query.length;
   }
   if (at < text.length) parts.push(document.createTextNode(text.slice(at)));
   span.replaceChildren(...parts);
}

/** @param {string} text */
async function writeClipboard(text) {
   try {
      if (navigator.clipboard?.writeText) {
         await navigator.clipboard.writeText(text);
         return true;
      }
   } catch {
      // fall back below
   }
   try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.append(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
   } catch {
      return false;
   }
}

customElements.define('slice-json-viewer', JsonViewer);
