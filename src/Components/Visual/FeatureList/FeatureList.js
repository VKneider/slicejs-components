// FeatureList — what something offers, item by item: an icon, a title, a sentence.
// "Services", "Why us", "What's included", the benefits of a plan, a course's topics.
// It is information, not a set of cards: no surfaces by default, one rhythm, one grid.
//
//   await slice.build('FeatureList', {
//     items: [
//       { icon: 'rocket', title: 'Fast setup', text: 'Online in an afternoon.' },
//       { icon: 'shield', title: 'Private by default', text: 'Your data stays yours.', href: '/privacy' },
//     ],
//   });
//
// layout   grid (icon on top, default) · list (icon at the start; one per row unless `columns`) ·
//          compact (icon at the start, in columns, for long checklists)
// columns  0 = as many as fit (`minItemWidth`), or a maximum that still wraps on small screens
// variant  plain (no surface, default) · soft · outlined — the item's surface
// tone     the colour of the icons

import { destroyNodes, heading, headingLevel, iconName, toNodes } from '../../shared/content/nodes.js';
import { followLink, setLink } from '../../shared/navigation/links.js';

export default class FeatureList extends HTMLElement {
   static props = {
      // [{ title, text, icon, badge, href, target, content, id }]
      items: { type: 'array', default: [] },
      layout: { type: 'string', default: 'grid', allowedValues: ['grid', 'list', 'compact'] },
      // 0: as many as fit; n: at most n per row.
      columns: { type: 'number', default: 0 },
      // The narrowest an item gets before the grid wraps.
      minItemWidth: { type: 'string', default: '220px' },
      variant: { type: 'string', default: 'plain', allowedValues: ['plain', 'soft', 'outlined'] },
      tone: { type: 'string', default: 'accent', allowedValues: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'] },
      align: { type: 'string', default: 'start', allowedValues: ['start', 'center'] },
      size: { type: 'string', default: 'md', allowedValues: ['sm', 'md'] },
      // The level of each item's title (h2–h6), under the section's own heading.
      headingLevel: { type: 'number', default: 3 },
      // The list's accessible name, when no heading right before it says what it is.
      ariaLabel: { type: 'string', default: '' },
      // An item without `href` becomes a button: onItemClick(item, { index, event }).
      onItemClick: { type: 'function', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-feature-list');
      this.$list = /** @type {HTMLUListElement} */ (this.querySelector('.slice-feature-list__list'));

      this._items = /** @type {any[]} */ ([]);
      this._layout = 'grid';
      this._columns = 0;
      this._minItemWidth = '220px';
      this._variant = 'plain';
      this._tone = 'accent';
      this._align = 'start';
      this._size = 'md';
      this._headingLevel = 3;
      this._ariaLabel = '';
      this._onItemClick = /** @type {Function | null} */ (null);

      // Internal state: never a prop's `_<name>`.
      this._ready = false;
      this._renderRev = 0;
      this._owned = /** @type {Node[]} */ ([]);   // icons and content nodes of the items
      this._onListClick = (/** @type {MouseEvent} */ event) => this._handleClick(event);

      slice.controller.setComponentProps(this, props);
      this._paintLooks();
   }

   async init() {
      this._ready = true;
      this.$list.addEventListener('click', this._onListClick);
      await this._render();
   }

   beforeDestroy() {
      this._ready = false;
      this._renderRev++;
      this.$list.removeEventListener('click', this._onListClick);
      destroyNodes(this._owned);
      this._owned = [];
   }

   // ── Props ──────────────────────────────────────────────────────

   get items() { return this._items; }
   set items(value) {
      this._items = Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];
      if (this._ready) this._render();
   }

   get layout() { return this._layout; }
   set layout(value) { this._layout = this._pick('layout', value); this._paintLooks(); }

   get columns() { return this._columns; }
   set columns(value) {
      const n = Math.round(Number(value));
      this._columns = Number.isFinite(n) && n > 0 ? Math.min(n, 6) : 0;
      this._paintLooks();
   }

   get minItemWidth() { return this._minItemWidth; }
   set minItemWidth(value) {
      const text = value == null ? '' : String(value).trim();
      this._minItemWidth = text ? (/^\d+(\.\d+)?$/.test(text) ? `${text}px` : text) : '220px';
      this._paintLooks();
   }

   get variant() { return this._variant; }
   set variant(value) { this._variant = this._pick('variant', value); this._paintLooks(); }

   get tone() { return this._tone; }
   set tone(value) { this._tone = this._pick('tone', value); this._paintLooks(); }

   get align() { return this._align; }
   set align(value) { this._align = this._pick('align', value); this._paintLooks(); }

   get size() { return this._size; }
   set size(value) {
      this._size = this._pick('size', value);
      this._paintLooks();
      if (this._ready) this._render();
   }

   get headingLevel() { return this._headingLevel; }
   set headingLevel(value) {
      this._headingLevel = headingLevel(value, 3);
      if (this._ready) this._render();
   }

   get ariaLabel() { return this._ariaLabel; }
   set ariaLabel(value) { this._ariaLabel = value ? String(value) : ''; this._paintLooks(); }

   get onItemClick() { return this._onItemClick; }
   set onItemClick(value) {
      this._onItemClick = typeof value === 'function' ? value : null;
      if (this._ready) this._render();
   }

   // ── Painting ───────────────────────────────────────────────────

   /** @param {string} prop @param {unknown} value */
   _pick(prop, value) {
      const { allowedValues, default: fallback } = /** @type {any} */ (FeatureList.props)[prop];
      return allowedValues.includes(value) ? value : fallback;
   }

   _paintLooks() {
      this.dataset.layout = this._layout;
      this.dataset.variant = this._variant;
      this.dataset.tone = this._tone;
      this.dataset.align = this._align;
      this.dataset.size = this._size;
      this.style.setProperty('--slice-feature-list-min', this._minItemWidth);
      if (this._columns) this.style.setProperty('--slice-feature-list-columns', String(this._columns));
      else this.style.removeProperty('--slice-feature-list-columns');
      this.toggleAttribute('data-columns', !!this._columns);
      if (!this.$list) return;
      if (this._ariaLabel) this.$list.setAttribute('aria-label', this._ariaLabel);
      else this.$list.removeAttribute('aria-label');
   }

   async _render() {
      const rev = ++this._renderRev;

      const rows = this._items.map((item, index) => this._buildItem(item, index));
      // Icons are components: build them all, then swap the list in one go.
      const iconSize = this._size === 'sm' ? '18px' : (this._layout === 'compact' ? '18px' : '22px');
      const icons = await Promise.all(rows.map(({ item }) => {
         const name = iconName(item.icon);
         return name ? slice.build('Icon', { name, size: iconSize, color: 'currentColor' }) : null;
      }));
      if (!this._ready || rev !== this._renderRev) {
         // A newer render (or the destroy) owns the content nodes now; only these icons are ours.
         destroyNodes(icons.filter(Boolean));
         return;
      }

      /** @type {Node[]} */
      const owned = [];
      rows.forEach((row, i) => {
         const icon = icons[i];
         if (icon) {
            row.$icon.append(icon);
            row.$icon.hidden = false;
            owned.push(icon);
         }
         owned.push(...row.content);
      });

      // Nodes the app passed again (same `content` node) are kept, not destroyed.
      const kept = new Set(owned);
      destroyNodes(this._owned.filter((node) => !kept.has(node)));
      this._owned = owned;
      this.$list.replaceChildren(...rows.map((row) => row.li));
      this.classList.toggle('is-empty', rows.length === 0);
   }

   /**
    * @param {any} item
    * @param {number} index
    */
   _buildItem(item, index) {
      const li = document.createElement('li');
      li.className = 'slice-feature-list__item';
      li.dataset.index = String(index);
      if (item.id != null) li.dataset.id = String(item.id);

      const $icon = document.createElement('span');
      $icon.className = 'slice-feature-list__icon';
      $icon.setAttribute('aria-hidden', 'true');
      $icon.hidden = true;

      const body = document.createElement('div');
      body.className = 'slice-feature-list__body';

      const title = heading(this._headingLevel, 'slice-feature-list__title');
      const label = item.title == null ? '' : String(item.title);
      const href = typeof item.href === 'string' && item.href ? item.href : '';
      if (href) {
         const a = document.createElement('a');
         a.className = 'slice-feature-list__target';
         setLink(a, href, item.target || '');
         a.textContent = label;
         title.append(a);
         li.classList.add('is-interactive');
      } else if (this._onItemClick) {
         const button = document.createElement('button');
         button.type = 'button';
         button.className = 'slice-feature-list__target';
         button.textContent = label;
         title.append(button);
         li.classList.add('is-interactive');
      } else {
         title.textContent = label;
      }
      title.hidden = !label;

      if (item.badge) {
         const badge = document.createElement('span');
         badge.className = 'slice-feature-list__badge';
         badge.textContent = String(item.badge);
         title.append(' ', badge);
      }
      body.append(title);

      if (item.text) {
         const p = document.createElement('p');
         p.className = 'slice-feature-list__text';
         p.textContent = String(item.text);
         body.append(p);
      }

      const content = toNodes(item.content, 'slice-feature-list__text');
      if (content.length) {
         const box = document.createElement('div');
         box.className = 'slice-feature-list__content';
         box.append(...content);
         body.append(box);
      }

      li.append($icon, body);
      return { li, $icon, item, content };
   }

   /** @param {MouseEvent} event */
   _handleClick(event) {
      const target = /** @type {Element} */ (event.target)?.closest?.('.slice-feature-list__target');
      if (!target) return;
      const li = target.closest('.slice-feature-list__item');
      const index = Number(li?.getAttribute('data-index'));
      const item = this._items[index];
      if (!item) return;
      if (target.tagName === 'A') {
         followLink(event, item.href, item.target || '');
         return;
      }
      this._onItemClick?.(item, { index, event });
      this.dispatchEvent(new CustomEvent('item-click', { bubbles: true, detail: { item, index } }));
   }
}

customElements.define('slice-feature-list', FeatureList);
