// Heatmap — how much, where in a grid: activity per day over a year (calendar), or any
// two dimensions such as hour × weekday (grid). The colour gets stronger with the value.
//
//   await slice.build('Heatmap', { data: [{ date: '2026-03-02', value: 4 }, …] });
//   await slice.build('Heatmap', {
//     type: 'grid', rows: ['Mon', 'Tue', …], columns: ['8', '9', …],
//     data: [{ row: 'Mon', column: '9', value: 12 }, …],
//   });
//
// It is an ARIA grid with one Tab stop: arrows move between cells, Home / End go to the
// ends of a row, Enter reports the cell (onCellClick). Every cell has its text, so the
// colour is never the only way to read it; the focused or hovered cell shows it in a tip.
//
// type        calendar (default) · grid
// levels      colour steps, counting the empty one (default 5)
// thresholds  the lowest value of each step after the empty one ([1, 4, 8, 12]);
//             without them the steps split 0…max evenly
// label       (cell) => text, for the tip and screen readers

import { texts } from '../../shared/text/texts.js';
import { toDate } from '../../shared/data/dates.js';

const t = texts('slice.heatmap', {
   en: { label: 'Activity', less: 'Less', more: 'More', day: '{date}: {value}', empty: '{date}: none', cell: '{row}, {column}: {value}', total: '{total} in total' },
   es: { label: 'Actividad', less: 'Menos', more: 'Más', day: '{date}: {value}', empty: '{date}: nada', cell: '{row}, {column}: {value}', total: '{total} en total' },
});

const DAY = 86400000;

/** @param {Date} date */
function dayKey(date) {
   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** @param {Date} date */
function startOfDay(date) {
   return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default class Heatmap extends HTMLElement {
   static props = {
      type: { type: 'string', default: 'calendar', allowedValues: ['calendar', 'grid'] },
      // calendar: [{ date, value }] or { '2026-03-02': 4 }. grid: [{ row, column, value }].
      data: { type: 'any', default: null },
      // grid: the labels of the rows and columns, in order.
      rows: { type: 'array', default: [] },
      columns: { type: 'array', default: [] },
      // calendar: the first and last day (default: the 52 weeks up to today).
      start: { type: 'any', default: null },
      end: { type: 'any', default: null },
      // calendar: 0 Sunday, 1 Monday; -1 follows the locale.
      weekStart: { type: 'number', default: -1 },
      levels: { type: 'number', default: 5 },
      thresholds: { type: 'array', default: null },
      tone: { type: 'string', default: 'success', allowedValues: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'] },
      // Cell size in px; the gap scales with it.
      cellSize: { type: 'number', default: 12 },
      // Month and weekday names (calendar) or row and column labels (grid).
      labels: { type: 'boolean', default: true },
      legend: { type: 'boolean', default: true },
      // "1,284 in total" under a calendar.
      summary: { type: 'boolean', default: false },
      // (cell) => the cell's text. cell: { date, row, column, value, level }
      label: { type: 'function', default: null },
      // (value) => how a value is written (default: the locale's number format).
      formatValue: { type: 'function', default: null },
      locale: { type: 'string', default: '' },
      ariaLabel: { type: 'string', default: '' },
      // onCellClick(cell, { event })
      onCellClick: { type: 'function', default: null },
      texts: { type: 'object', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-heatmap');
      this.$scroller = this.querySelector('.slice-heatmap__scroller');
      this.$columns = this.querySelector('.slice-heatmap__columns');
      this.$rows = this.querySelector('.slice-heatmap__rows');
      this.$grid = this.querySelector('.slice-heatmap__grid');
      this.$summary = this.querySelector('.slice-heatmap__summary');
      this.$legend = this.querySelector('.slice-heatmap__legend');
      this.$tip = this.querySelector('.slice-heatmap__tip');

      this._type = 'calendar';
      this._data = /** @type {any} */ (null);
      this._rowsLabels = /** @type {any[]} */ ([]);
      this._columnsLabels = /** @type {any[]} */ ([]);
      this._start = /** @type {any} */ (null);
      this._end = /** @type {any} */ (null);
      this._weekStart = -1;
      this._levels = 5;
      this._thresholds = /** @type {number[] | null} */ (null);
      this._tone = 'success';
      this._cellSize = 12;
      this._labels = true;
      this._legend = true;
      this._summary = false;
      this._label = /** @type {Function | null} */ (null);
      this._formatValue = /** @type {Function | null} */ (null);
      this._locale = '';
      this._ariaLabel = '';
      this._onCellClick = /** @type {Function | null} */ (null);
      this._texts = /** @type {Record<string, string>} */ ({});

      // Internal state: never a prop's `_<name>`.
      this._ready = false;
      this._cells = /** @type {any[][]} */ ([]);   // [row][column] → cell model (or null: outside the range)
      this._focus = { row: 0, column: 0 };
      this._scrolled = false;

      this._onGridKey = (/** @type {KeyboardEvent} */ e) => this._handleKey(e);
      this._onGridClick = (/** @type {MouseEvent} */ e) => {
         const el = this._cellElement(e.target);
         if (!el) return;
         this._moveTo(Number(el.dataset.row), Number(el.dataset.column), false);
         this._report(el, e);
      };
      this._onGridOver = (/** @type {PointerEvent} */ e) => {
         const el = this._cellElement(e.target);
         if (el) this._showTip(el);
      };
      this._onGridLeave = () => {
         const focused = this.$grid.querySelector('[tabindex="0"]');
         if (focused instanceof HTMLElement && this.$grid.contains(document.activeElement)) this._showTip(focused);
         else this._hideTip();
      };
      this._onGridFocus = (/** @type {FocusEvent} */ e) => {
         const el = this._cellElement(e.target);
         if (el) this._showTip(el);
      };
      this._onGridBlur = () => this._hideTip();
      this._onScroll = () => this._hideTip();

      slice.controller.setComponentProps(this, props);
      this._paintLooks();
   }

   init() {
      this._ready = true;
      this.$grid.addEventListener('keydown', this._onGridKey);
      this.$grid.addEventListener('click', this._onGridClick);
      this.$grid.addEventListener('pointerover', this._onGridOver);
      this.$grid.addEventListener('pointerleave', this._onGridLeave);
      this.$grid.addEventListener('focusin', this._onGridFocus);
      this.$grid.addEventListener('focusout', this._onGridBlur);
      this.$scroller.addEventListener('scroll', this._onScroll, { passive: true });
      slice.translator?.watch?.(this, () => this._render());
      this._render();
   }

   beforeDestroy() {
      this._ready = false;
      this.$grid.removeEventListener('keydown', this._onGridKey);
      this.$grid.removeEventListener('click', this._onGridClick);
      this.$grid.removeEventListener('pointerover', this._onGridOver);
      this.$grid.removeEventListener('pointerleave', this._onGridLeave);
      this.$grid.removeEventListener('focusin', this._onGridFocus);
      this.$grid.removeEventListener('focusout', this._onGridBlur);
      this.$scroller.removeEventListener('scroll', this._onScroll);
   }

   // ── Props ──────────────────────────────────────────────────────

   get type() { return this._type; }
   set type(value) { this._type = this._pick('type', value); this._paintLooks(); this._rerender(); }

   get data() { return this._data; }
   set data(value) { this._data = value ?? null; this._rerender(); }

   get rows() { return this._rowsLabels; }
   set rows(value) { this._rowsLabels = Array.isArray(value) ? value : []; this._rerender(); }

   get columns() { return this._columnsLabels; }
   set columns(value) { this._columnsLabels = Array.isArray(value) ? value : []; this._rerender(); }

   get start() { return this._start; }
   set start(value) { this._start = value ?? null; this._scrolled = false; this._rerender(); }

   get end() { return this._end; }
   set end(value) { this._end = value ?? null; this._scrolled = false; this._rerender(); }

   get weekStart() { return this._weekStart; }
   set weekStart(value) {
      const n = Number(value);
      this._weekStart = n >= 0 && n <= 6 ? Math.round(n) : -1;
      this._rerender();
   }

   get levels() { return this._levels; }
   set levels(value) {
      const n = Math.round(Number(value));
      this._levels = Number.isFinite(n) ? Math.min(9, Math.max(2, n)) : 5;
      this._rerender();
   }

   get thresholds() { return this._thresholds; }
   set thresholds(value) {
      this._thresholds = Array.isArray(value) ? value.map(Number).filter(Number.isFinite).sort((a, b) => a - b) : null;
      this._rerender();
   }

   get tone() { return this._tone; }
   set tone(value) { this._tone = this._pick('tone', value); this._paintLooks(); }

   get cellSize() { return this._cellSize; }
   set cellSize(value) {
      const n = Number(value);
      this._cellSize = Number.isFinite(n) ? Math.min(48, Math.max(6, n)) : 12;
      this._paintLooks();
   }

   get labels() { return this._labels; }
   set labels(value) { this._labels = value !== false; this._paintLooks(); }

   get legend() { return this._legend; }
   set legend(value) { this._legend = value !== false; this._rerender(); }

   get summary() { return this._summary; }
   set summary(value) { this._summary = value === true; this._rerender(); }

   get label() { return this._label; }
   set label(value) { this._label = typeof value === 'function' ? value : null; this._rerender(); }

   get formatValue() { return this._formatValue; }
   set formatValue(value) { this._formatValue = typeof value === 'function' ? value : null; this._rerender(); }

   get locale() { return this._locale; }
   set locale(value) { this._locale = value ? String(value) : ''; this._rerender(); }

   get ariaLabel() { return this._ariaLabel; }
   set ariaLabel(value) { this._ariaLabel = value ? String(value) : ''; this._rerender(); }

   get onCellClick() { return this._onCellClick; }
   set onCellClick(value) { this._onCellClick = typeof value === 'function' ? value : null; }

   get texts() { return this._texts; }
   set texts(value) { this._texts = value && typeof value === 'object' ? { ...value } : {}; this._rerender(); }

   /** The cells as data: [{ date | row, column, value, level }], in reading order. */
   get cells() {
      return this._cells.flat().filter(Boolean).map((cell) => ({ ...cell }));
   }

   // ── Helpers ────────────────────────────────────────────────────

   /** @param {string} prop @param {unknown} value */
   _pick(prop, value) {
      const { allowedValues, default: fallback } = /** @type {any} */ (Heatmap.props)[prop];
      return allowedValues.includes(value) ? value : fallback;
   }

   _rerender() {
      if (this._ready) this._render();
   }

   /** @param {string} key @param {Record<string, any>} [params] */
   _t(key, params = {}) {
      const own = this._texts[key];
      if (own == null) return t(key, params);
      return String(own).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
   }

   _loc() {
      if (this._locale) return this._locale;
      const translator = /** @type {any} */ (globalThis).slice?.translator;
      if (translator?.enabled && translator.locale) return translator.locale;
      return document.documentElement.lang || undefined;
   }

   /** @param {number} value */
   _value(value) {
      if (this._formatValue) return String(this._formatValue(value));
      try {
         return new Intl.NumberFormat(this._loc()).format(value);
      } catch {
         return String(value);
      }
   }

   /** @param {Date} date @param {Intl.DateTimeFormatOptions} options */
   _date(date, options) {
      try {
         return new Intl.DateTimeFormat(this._loc(), options).format(date);
      } catch {
         return date.toDateString();
      }
   }

   /** The first day of the week: the prop, or the locale's (Sunday when unknown). */
   _firstDay() {
      if (this._weekStart >= 0) return this._weekStart;
      try {
         const info = /** @type {any} */ (new Intl.Locale(this._loc() || 'en-US'));
         const week = typeof info.getWeekInfo === 'function' ? info.getWeekInfo() : info.weekInfo;
         if (week?.firstDay) return week.firstDay % 7;
      } catch {
         // fall through
      }
      return 0;
   }

   /** @param {number} value @param {number} max */
   _level(value, max) {
      if (!(value > 0)) return 0;
      const top = this._levels - 1;
      if (this._thresholds?.length) {
         let level = 0;
         this._thresholds.forEach((min, i) => { if (value >= min) level = i + 1; });
         return Math.min(level, top);
      }
      if (!(max > 0)) return 0;
      return Math.max(1, Math.min(top, Math.ceil((value / max) * top)));
   }

   /** @param {any} cell */
   _cellText(cell) {
      if (this._label) {
         try {
            return String(this._label({ ...cell }));
         } catch {
            // fall back to the built-in text
         }
      }
      if (this._type === 'calendar') {
         const date = this._date(cell.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
         return cell.value > 0 ? this._t('day', { date, value: this._value(cell.value) }) : this._t('empty', { date });
      }
      return this._t('cell', { row: cell.row, column: cell.column, value: this._value(cell.value) });
   }

   // ── Models ─────────────────────────────────────────────────────

   _calendarModel() {
      /** @type {Map<string, number>} */
      const values = new Map();
      const add = (/** @type {any} */ date, /** @type {any} */ value) => {
         const d = toDate(date);
         const n = Number(value);
         if (!d || !Number.isFinite(n)) return;
         const key = dayKey(d);
         values.set(key, (values.get(key) || 0) + n);
      };
      if (Array.isArray(this._data)) for (const entry of this._data) add(entry?.date, entry?.value);
      else if (this._data && typeof this._data === 'object') for (const [date, value] of Object.entries(this._data)) add(date, value);

      const end = startOfDay(toDate(this._end) || new Date());
      const start = startOfDay(toDate(this._start) || new Date(end.getTime() - 364 * DAY));
      const first = this._firstDay();
      // The grid starts on the first day of start's week.
      const gridStart = new Date(start);
      gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() - first + 7) % 7));
      const weeks = Math.max(1, Math.ceil((Math.round((end.getTime() - gridStart.getTime()) / DAY) + 1) / 7));

      let max = 0;
      let total = 0;
      for (const [key, value] of values) {
         const d = toDate(key);
         if (d && d >= start && d <= end) {
            max = Math.max(max, value);
            total += value;
         }
      }

      /** @type {any[][]} */
      const cells = Array.from({ length: 7 }, () => []);
      const columnLabels = /** @type {string[]} */ (Array(weeks).fill(''));
      let lastLabel = -3;
      for (let w = 0; w < weeks; w++) {
         for (let r = 0; r < 7; r++) {
            const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + w * 7 + r);
            if (date < start || date > end) {
               cells[r][w] = null;
               continue;
            }
            const value = values.get(dayKey(date)) || 0;
            cells[r][w] = { date, value, level: this._level(value, max), row: r, column: w };
            // A month's name over the week where it starts (not too close to the previous one).
            if (date.getDate() === 1 || (w === 0 && r === 0) || (w === 0 && date.getTime() === start.getTime())) {
               if (w - lastLabel >= 3 && !columnLabels[w]) {
                  columnLabels[w] = this._date(date, { month: 'short' });
                  lastLabel = w;
               }
            }
         }
      }
      // Weekday names on Monday, Wednesday and Friday, whatever day the week starts on.
      const rowLabels = Array.from({ length: 7 }, (_, r) => {
         const weekday = (first + r) % 7;
         if (weekday !== 1 && weekday !== 3 && weekday !== 5) return '';
         return this._date(new Date(2023, 0, 1 + weekday), { weekday: 'short' }); // 2023-01-01 is a Sunday
      });
      const rowNames = Array.from({ length: 7 }, (_, r) => this._date(new Date(2023, 0, 1 + ((first + r) % 7)), { weekday: 'long' }));
      return { cells, rowLabels, rowNames, columnLabels, total };
   }

   _gridModel() {
      const rows = this._rowsLabels.map(String);
      const columns = this._columnsLabels.map(String);
      /** @type {Map<string, number>} */
      const values = new Map();
      const list = Array.isArray(this._data) ? this._data : [];
      for (const entry of list) {
         if (!entry) continue;
         const r = typeof entry.row === 'number' && rows[entry.row] === undefined ? null : (typeof entry.row === 'number' ? entry.row : rows.indexOf(String(entry.row)));
         const c = typeof entry.column === 'number' && columns[entry.column] === undefined ? null : (typeof entry.column === 'number' ? entry.column : columns.indexOf(String(entry.column)));
         const n = Number(entry.value);
         if (r == null || c == null || r < 0 || c < 0 || !Number.isFinite(n)) continue;
         values.set(`${r}:${c}`, (values.get(`${r}:${c}`) || 0) + n);
      }
      let max = 0;
      let total = 0;
      for (const value of values.values()) {
         max = Math.max(max, value);
         total += value;
      }
      const cells = rows.map((row, r) => columns.map((column, c) => {
         const value = values.get(`${r}:${c}`) || 0;
         return { row, column, value, level: this._level(value, max), rowIndex: r, columnIndex: c };
      }));
      return { cells, rowLabels: rows, rowNames: rows, columnLabels: columns, total };
   }

   // ── Painting ───────────────────────────────────────────────────

   _paintLooks() {
      this.dataset.type = this._type;
      this.dataset.tone = this._tone;
      this.style.setProperty('--slice-heatmap-cell', `${this._cellSize}px`);
      this.style.setProperty('--slice-heatmap-gap', `${Math.max(2, Math.round(this._cellSize / 4))}px`);
      this.classList.toggle('has-labels', this._labels);
   }

   _render() {
      const model = this._type === 'grid' ? this._gridModel() : this._calendarModel();
      this._cells = model.cells;
      const columns = model.cells[0]?.length || 0;
      this.style.setProperty('--slice-heatmap-columns', String(columns));
      const top = this._levels - 1;

      // Labels (decorative: every cell carries its own text).
      this.$columns.replaceChildren(...model.columnLabels.map((text) => {
         const span = document.createElement('span');
         span.textContent = text;
         return span;
      }));
      this.$rows.replaceChildren(...model.rowLabels.map((text) => {
         const span = document.createElement('span');
         span.textContent = text;
         return span;
      }));

      // Cells, row by row (an ARIA grid reads rows).
      const rows = model.cells.map((line, r) => {
         const row = document.createElement('div');
         row.className = 'slice-heatmap__row';
         row.setAttribute('role', 'row');
         row.setAttribute('aria-label', model.rowNames[r] || '');
         line.forEach((cell, c) => {
            const el = document.createElement('div');
            el.className = 'slice-heatmap__cell';
            el.dataset.row = String(r);
            el.dataset.column = String(c);
            if (!cell) {
               el.classList.add('is-out');
               el.setAttribute('role', 'presentation');
               row.append(el);
               return;
            }
            el.setAttribute('role', 'gridcell');
            el.tabIndex = -1;
            el.dataset.level = String(cell.level);
            el.style.setProperty('--heat', `${top ? Math.round((cell.level / top) * 100) : 0}`);
            el.setAttribute('aria-label', this._cellText(cell));
            row.append(el);
         });
         return row;
      });
      this.$grid.replaceChildren(...rows);
      this.$grid.setAttribute('aria-label', this._ariaLabel || this._t('label'));
      this.$grid.setAttribute('aria-rowcount', String(model.cells.length));
      this.$grid.setAttribute('aria-colcount', String(columns));

      // One Tab stop: the last day with a cell (today, in a calendar), or where the focus was.
      const keep = this._at(this._focus.row, this._focus.column);
      if (keep) this._moveTo(this._focus.row, this._focus.column, false);
      else {
         const last = this._lastCell();
         if (last) this._moveTo(last.row, last.column, false);
      }

      // Legend and summary.
      this.$legend.hidden = !this._legend;
      if (this._legend) {
         const less = document.createElement('span');
         less.textContent = this._t('less');
         const more = document.createElement('span');
         more.textContent = this._t('more');
         const swatches = Array.from({ length: this._levels }, (_, level) => {
            const s = document.createElement('span');
            s.className = 'slice-heatmap__swatch';
            s.dataset.level = String(level);
            s.style.setProperty('--heat', `${top ? Math.round((level / top) * 100) : 0}`);
            return s;
         });
         this.$legend.replaceChildren(less, ...swatches, more);
      }
      this.$summary.hidden = !this._summary;
      this.$summary.textContent = this._summary ? this._t('total', { total: this._value(model.total) }) : '';

      // A calendar opens on its most recent weeks.
      if (this._type === 'calendar' && !this._scrolled) {
         this._scrolled = true;
         requestAnimationFrame(() => {
            if (this._ready) this.$scroller.scrollLeft = this.$scroller.scrollWidth;
         });
      }
   }

   // ── Navigation ─────────────────────────────────────────────────

   /** @param {number} row @param {number} column */
   _at(row, column) {
      return this._cells[row]?.[column] || null;
   }

   _lastCell() {
      const columns = this._cells[0]?.length || 0;
      for (let c = columns - 1; c >= 0; c--) {
         for (let r = this._cells.length - 1; r >= 0; r--) if (this._cells[r][c]) return { row: r, column: c };
      }
      return null;
   }

   /** @param {EventTarget | null} target */
   _cellElement(target) {
      const el = /** @type {Element} */ (target)?.closest?.('.slice-heatmap__cell');
      return el instanceof HTMLElement && el.getAttribute('role') === 'gridcell' ? el : null;
   }

   /**
    * @param {number} row
    * @param {number} column
    * @param {boolean} focus
    */
   _moveTo(row, column, focus) {
      const el = /** @type {HTMLElement | null} */ (this.$grid.querySelector(`.slice-heatmap__cell[data-row="${row}"][data-column="${column}"]`));
      if (!el || el.getAttribute('role') !== 'gridcell') return false;
      for (const other of this.$grid.querySelectorAll('.slice-heatmap__cell[tabindex="0"]')) {
         if (other !== el) /** @type {HTMLElement} */ (other).tabIndex = -1;
      }
      el.tabIndex = 0;
      this._focus = { row, column };
      if (focus) el.focus();
      return true;
   }

   /** @param {KeyboardEvent} event */
   _handleKey(event) {
      const el = this._cellElement(event.target);
      if (!el || event.altKey || event.ctrlKey || event.metaKey) return;
      const row = Number(el.dataset.row);
      const column = Number(el.dataset.column);
      const rows = this._cells.length;
      const columns = this._cells[0]?.length || 0;
      /** @param {number} dr @param {number} dc */
      const step = (dr, dc) => {
         // Skip the empty corners of a calendar.
         for (let r = row + dr, c = column + dc; r >= 0 && r < rows && c >= 0 && c < columns; r += dr, c += dc) {
            if (this._moveTo(r, c, true)) return;
         }
      };
      switch (event.key) {
         case 'ArrowRight': step(0, 1); break;
         case 'ArrowLeft': step(0, -1); break;
         case 'ArrowDown': step(1, 0); break;
         case 'ArrowUp': step(-1, 0); break;
         case 'Home':
            for (let c = 0; c < columns; c++) if (this._moveTo(row, c, true)) break;
            break;
         case 'End':
            for (let c = columns - 1; c >= 0; c--) if (this._moveTo(row, c, true)) break;
            break;
         case 'Enter':
         case ' ':
            this._report(el, event);
            break;
         default:
            return;
      }
      event.preventDefault();
   }

   /** @param {HTMLElement} el @param {Event} event */
   _report(el, event) {
      const cell = this._at(Number(el.dataset.row), Number(el.dataset.column));
      if (!cell) return;
      const detail = { ...cell };
      this._onCellClick?.(detail, { event });
      this.dispatchEvent(new CustomEvent('cell-click', { bubbles: true, detail }));
   }

   // ── Tip ────────────────────────────────────────────────────────

   /** @param {HTMLElement} el */
   _showTip(el) {
      this.$tip.textContent = el.getAttribute('aria-label') || '';
      this.$tip.hidden = false;
      const host = this.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      const tip = this.$tip.getBoundingClientRect();
      let left = box.left - host.left + box.width / 2 - tip.width / 2;
      left = Math.max(0, Math.min(left, host.width - tip.width));
      let top = box.top - host.top - tip.height - 6;
      if (top < 0) top = box.bottom - host.top + 6;
      this.$tip.style.left = `${Math.round(left)}px`;
      this.$tip.style.top = `${Math.round(top)}px`;
   }

   _hideTip() {
      this.$tip.hidden = true;
   }
}

customElements.define('slice-heatmap', Heatmap);
