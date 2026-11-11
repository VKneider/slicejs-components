// Grid — content in rows and columns: a dashboard of metric cards, a gallery, a
// bento of features, a page with header / sidebar / main areas.
//
//   // A fixed number of columns (as before)
//   await slice.build('Grid', { columns: 3, items: cards });
//
//   // Columns by the GRID's own width (not the window's): 1, then 2 from 560px, 4 from 960px
//   await slice.build('Grid', { columns: { 0: 1, 560: 2, 960: 4 }, gap: 16, items: cards });
//
//   // As many columns as fit, each at least 220px
//   await slice.build('Grid', { minItemWidth: 220, items: photos });
//
//   // Items that span: { node, colSpan, rowSpan } — a span never asks for more
//   // columns than there are, so a 2-wide card is 1 wide on a phone
//   await slice.build('Grid', { columns: 4, autoRows: '140px', items: [{ node: big, colSpan: 2, rowSpan: 2 }, a, b] });
//
//   // Named areas, also per width
//   await slice.build('Grid', {
//      areas: { 0: ['header', 'main', 'side'], 800: ['header header', 'main side'] },
//      columnTemplate: '1fr 280px',
//      items: [{ node: top, area: 'header' }, { node: content, area: 'main' }, { node: panel, area: 'side' }],
//   });
//
// Breakpoints are measured on the grid itself (a ResizeObserver), so the same grid
// works in a page, in a sidebar and in a modal.

/** @typedef {{ node: Element, colSpan?: number | 'full', rowSpan?: number, area?: string }} GridItem */

const ALIGN = ['stretch', 'start', 'center', 'end'];

export default class Grid extends HTMLElement {

   static props = {
      // A number, or breakpoints by the grid's width: { 0: 1, 600: 2, 960: 4 }.
      columns: { type: 'any', default: 1, required: false },
      rows: { type: 'number', default: 1, required: false },
      // Live DOM nodes, or { node, colSpan, rowSpan, area }. Replaced on every assignment.
      items: { type: 'array', default: [], required: false },
      // '10px', '1rem', or a number of pixels.
      gap: { type: 'any', default: '10px', required: false },
      // A different gap between rows (the column gap stays `gap`).
      rowGap: { type: 'any', default: null, required: false },
      // Automatic columns: as many as fit, each at least this wide (number = px).
      minItemWidth: { type: 'any', default: null, required: false },
      // Named areas: ['header header', 'side main'], or breakpoints of them.
      areas: { type: 'any', default: null, required: false },
      // The height of rows the grid creates by itself ('140px', 'minmax(120px, auto)').
      autoRows: { type: 'string', default: null, required: false },
      // Fill holes left by large items with later small ones (visual order changes).
      dense: { type: 'boolean', default: false, required: false },
      // How items sit in their cell: vertically (align) and horizontally (justify).
      align: { type: 'string', default: 'stretch', required: false, allowedValues: ['stretch', 'start', 'center', 'end'] },
      justify: { type: 'string', default: 'stretch', required: false, allowedValues: ['stretch', 'start', 'center', 'end'] },
      // Raw CSS templates, when nothing above fits. They win over columns / rows.
      columnTemplate: { type: 'string', default: null, required: false },
      rowTemplate: { type: 'string', default: null, required: false }
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);

      this.$grid = /** @type {HTMLElement} */ (this.querySelector('.grid-container'));

      // Internal state: never a prop's `_<name>` (the framework resets those).
      this._width = 0;
      this._shownColumns = 1;
      this._styled = new WeakSet();
      this._observer = /** @type {ResizeObserver | null} */ (null);
      this._frame = 0;

      slice.controller.setComponentProps(this, props);
      this._apply();
   }

   init() {
      if (typeof ResizeObserver === 'undefined') return;
      this._observer = new ResizeObserver((entries) => {
         const width = Math.round(entries[0]?.contentRect.width ?? 0);
         if (width === this._width) return;
         this._width = width;
         // Next frame: changing the layout inside the observer's callback would
         // resize what it observes and loop.
         cancelAnimationFrame(this._frame);
         this._frame = requestAnimationFrame(() => this._apply());
      });
      this._observer.observe(this);
   }

   beforeDestroy() {
      this._observer?.disconnect();
      this._observer = null;
      cancelAnimationFrame(this._frame);
      // Without this every node handed to the grid — and every Slice component
      // among them — stayed in activeComponents after the grid was gone.
      this._removeChildren();
   }

   // ── Props ──────────────────────────────────────────────────────

   get columns() { return this._columns; }
   set columns(value) { this._columns = value; this._apply(); }

   get rows() { return this._rows; }
   set rows(value) { this._rows = value; this._apply(); }

   get gap() { return this._gap; }
   set gap(value) { this._gap = value; this._apply(); }

   get rowGap() { return this._rowGap; }
   set rowGap(value) { this._rowGap = value; this._apply(); }

   get minItemWidth() { return this._minItemWidth; }
   set minItemWidth(value) { this._minItemWidth = value; this._apply(); }

   get areas() { return this._areas; }
   set areas(value) { this._areas = value; this._apply(); }

   get autoRows() { return this._autoRows; }
   set autoRows(value) { this._autoRows = value; this._apply(); }

   get dense() { return this._dense; }
   set dense(value) { this._dense = value === true; this._apply(); }

   get align() { return this._align; }
   set align(value) { this._align = ALIGN.includes(value) ? value : 'stretch'; this._apply(); }

   get justify() { return this._justify; }
   set justify(value) { this._justify = ALIGN.includes(value) ? value : 'stretch'; this._apply(); }

   get columnTemplate() { return this._columnTemplate; }
   set columnTemplate(value) { this._columnTemplate = value; this._apply(); }

   get rowTemplate() { return this._rowTemplate; }
   set rowTemplate(value) { this._rowTemplate = value; this._apply(); }

   /** The number of columns shown right now (after breakpoints and automatic columns). */
   get columnCount() { return this._shownColumns; }

   /**
    * Replace the grid's contents with `values`.
    *
    * REPLACES, it does not append. This used to append on every call, so
    * setting `items` twice showed every cell twice.
    *
    * The array holds live DOM nodes (or `{ node, … }`), so node identity IS the
    * key: a node still present is moved rather than re-created, which keeps its
    * state (and, for a Slice component, never re-runs its constructor).
    */
   set items(values) {
      this._items = Array.isArray(values) ? values : [];
      this._reconcileNodes(this._items);
      this._placeItems();
   }

   get items() {
      return this._items;
   }

   /** Append a single node (or `{ node, colSpan, … }`), for incremental use. `set items` is for wholesale. */
   async setItem(item) {
      const node = this._nodeOf(item);
      if (!node) {
         console.warn('Grid: Invalid item provided to setItem', item);
         return;
      }
      node.classList.add('grid-item');
      this.$grid.appendChild(node);
      this._items = [...(this._items || []), item];
      this._placeItems();
   }

   /** Convenience for `setItem` over a list. Appends — use `items` to replace. */
   async setItems(items) {
      if (!items || !Array.isArray(items)) {
         console.warn('Grid: Invalid items array provided', items);
         return;
      }
      for (const item of items) {
         await this.setItem(item);
      }
   }

   /** Remove everything, destroying any Slice components among the children. */
   clear() {
      this._removeChildren();
      this._items = [];
   }

   // ── Layout ─────────────────────────────────────────────────────

   /**
    * The value for the current width: a plain value as is, or the entry of a
    * breakpoints object `{ 0: a, 600: b }` with the largest key ≤ the width.
    * @param {any} value
    */
   _atWidth(value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
      const keys = Object.keys(value).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
      if (!keys.length) return undefined;
      let chosen = keys[0];
      for (const key of keys) if (key <= this._width) chosen = key;
      return value[chosen];
   }

   /** @param {any} value */
   _length(value) {
      if (value === null || value === undefined || value === '') return '';
      return typeof value === 'number' ? `${value}px` : String(value);
   }

   _apply() {
      const grid = this.$grid;
      if (!grid) return;
      const style = grid.style;

      // Areas: an array of row strings ("header header"), maybe per width.
      const areas = this._atWidth(this._areas);
      const areaRows = Array.isArray(areas) ? areas.map((row) => String(row).trim()).filter(Boolean) : [];
      style.gridTemplateAreas = areaRows.length ? areaRows.map((row) => `"${row}"`).join(' ') : '';

      // Columns: raw template > minItemWidth > the areas' width > a number (maybe per width).
      const count = Math.max(1, Math.round(Number(this._atWidth(this._columns)) || 1));
      const minWidth = this._length(this._minItemWidth);
      if (this._columnTemplate) {
         style.gridTemplateColumns = this._columnTemplate;
      } else if (minWidth) {
         // min(…, 100%): one item never overflows a grid narrower than minItemWidth.
         style.gridTemplateColumns = `repeat(auto-fill, minmax(min(${minWidth}, 100%), 1fr))`;
      } else if (areaRows.length) {
         style.gridTemplateColumns = `repeat(${areaRows[0].split(/\s+/).length}, minmax(0, 1fr))`;
      } else {
         style.gridTemplateColumns = `repeat(${count}, minmax(0, 1fr))`;
      }

      // Rows: raw template; else areas and autoRows let rows size themselves; else `rows`.
      const autoRows = this._autoRows || '';
      style.gridAutoRows = autoRows;
      if (this._rowTemplate) {
         style.gridTemplateRows = this._rowTemplate;
      } else if (areaRows.length || autoRows) {
         // 'none', not '': '' would fall back to the stylesheet's single 1fr row.
         style.gridTemplateRows = 'none';
      } else {
         style.gridTemplateRows = `repeat(${Math.max(1, Math.round(Number(this._rows) || 1))}, 1fr)`;
      }

      // `gap` sets both; a rowGap then replaces the row half.
      style.gap = this._length(this._gap ?? '10px');
      if (this._rowGap !== null && this._rowGap !== undefined && this._rowGap !== '') style.rowGap = this._length(this._rowGap);
      style.gridAutoFlow = this._dense ? 'dense' : '';
      style.alignItems = this._align && this._align !== 'stretch' ? this._align : '';
      style.justifyItems = this._justify && this._justify !== 'stretch' ? this._justify : '';

      this._shownColumns = this._countColumns(count, areaRows);
      this.dataset.columns = String(this._shownColumns);
      this._placeItems();
   }

   /** @param {number} count @param {string[]} areaRows */
   _countColumns(count, areaRows) {
      if (!this._columnTemplate && !this._length(this._minItemWidth)) {
         return areaRows.length ? areaRows[0].split(/\s+/).length : count;
      }
      // A template or automatic columns: ask the browser how many it made.
      if (!this.isConnected) return 1;
      const resolved = getComputedStyle(this.$grid).gridTemplateColumns;
      if (!resolved || resolved === 'none') return 1;
      return Math.max(1, resolved.trim().split(/\s+(?![^(]*\))/).length);
   }

   /** @param {any} item @returns {HTMLElement | null} */
   _nodeOf(item) {
      if (item && item.classList) return item;
      if (item && typeof item === 'object' && item.node && item.node.classList) return item.node;
      return null;
   }

   /** Spans and areas, on the item nodes. A span never asks for more columns than shown. */
   _placeItems() {
      if (!Array.isArray(this._items)) return;
      const columns = this._shownColumns || 1;
      for (const item of this._items) {
         const node = this._nodeOf(item);
         if (!node) continue;
         const spec = item === node ? null : /** @type {GridItem} */ (item);
         const style = /** @type {HTMLElement} */ (node).style;
         if (!spec && !this._styled.has(node)) continue;

         const colSpan = spec?.colSpan;
         const rowSpan = Number(spec?.rowSpan) || 0;
         const area = spec?.area ? String(spec.area) : '';

         style.gridArea = '';
         if (area) {
            style.gridArea = area;
         } else {
            if (colSpan === 'full') style.gridColumn = '1 / -1';
            else if (Number(colSpan) > 1) style.gridColumn = `span ${Math.min(columns, Math.round(Number(colSpan)))}`;
            else style.gridColumn = '';
            style.gridRow = rowSpan > 1 ? `span ${Math.round(rowSpan)}` : '';
         }
         if (spec) this._styled.add(node);
         else this._styled.delete(node);
      }
   }

   _reconcileNodes(entries) {
      const wanted = [];
      for (const entry of entries) {
         const node = this._nodeOf(entry);
         if (node) wanted.push(node);
         else console.warn('Grid: Ignoring invalid item', entry);
      }
      const keep = /** @type {Set<Element>} */ (new Set(wanted));

      // Remove what is gone BEFORE ordering, so a removed node is never a
      // move target. A Slice child must go through destroyComponent so its
      // beforeDestroy runs; innerHTML = '' would leave it registered forever.
      for (const child of Array.from(this.$grid.children)) {
         if (keep.has(child)) continue;
         const sliceId = child.getAttribute?.('slice-id');
         if (sliceId) slice.controller.destroyComponent(sliceId);
         else child.remove();
      }

      wanted.forEach((node, i) => {
         node.classList.add('grid-item');
         // insertBefore MOVES the node — it never clones, so no constructor
         // re-runs and nothing leaks.
         if (this.$grid.children[i] !== node) {
            this.$grid.insertBefore(node, this.$grid.children[i] || null);
         }
      });
   }

   _removeChildren() {
      if (!this.$grid) return;
      for (const child of Array.from(this.$grid.children)) {
         const sliceId = child.getAttribute?.('slice-id');
         if (sliceId) slice.controller.destroyComponent(sliceId);
         else child.remove();
      }
   }
}

customElements.define('slice-grid', Grid);
