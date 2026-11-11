// Steps — how something is done, in order: "How it works", "How to enrol", "Getting your
// certificate". Each step has a marker (its number, an icon or a dot), a title, a sentence,
// and anything else it needs (a command, a link, an image).
//
// It only shows a process. When the steps are the screens of a task the user is going
// through — done, current, next, with Back and Continue — that is a Stepper.
//
//   await slice.build('Steps', {
//     items: [
//       { title: 'Create your account', text: 'With your university email.' },
//       { title: 'Choose a course', text: 'Pick from the open sections.' },
//       { title: 'Pay and start', text: 'Your access is ready the same day.' },
//     ],
//   });
//
// orientation  vertical (default) · horizontal (stacks back to vertical when narrow)
// marker       number (default) · icon · dot
// variant      soft (default) · filled · outlined — the marker
// tone         the colour of the markers and the line between them

import { destroyNodes, heading, headingLevel, iconName, toNodes } from '../../shared/content/nodes.js';

export default class Steps extends HTMLElement {
   static props = {
      // [{ title, text, icon, content, id }]
      items: { type: 'array', default: [] },
      orientation: { type: 'string', default: 'vertical', allowedValues: ['vertical', 'horizontal'] },
      marker: { type: 'string', default: 'number', allowedValues: ['number', 'icon', 'dot'] },
      variant: { type: 'string', default: 'soft', allowedValues: ['soft', 'filled', 'outlined'] },
      tone: { type: 'string', default: 'accent', allowedValues: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'] },
      size: { type: 'string', default: 'md', allowedValues: ['sm', 'md'] },
      // The number of the first step (a list that continues another one).
      start: { type: 'number', default: 1 },
      // The line that joins the markers.
      connector: { type: 'boolean', default: true },
      headingLevel: { type: 'number', default: 3 },
      ariaLabel: { type: 'string', default: '' },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-steps');
      this.$list = /** @type {HTMLOListElement} */ (this.querySelector('.slice-steps__list'));

      this._items = /** @type {any[]} */ ([]);
      this._orientation = 'vertical';
      this._marker = 'number';
      this._variant = 'soft';
      this._tone = 'accent';
      this._size = 'md';
      this._start = 1;
      this._connector = true;
      this._headingLevel = 3;
      this._ariaLabel = '';

      // Internal state: never a prop's `_<name>`.
      this._ready = false;
      this._renderRev = 0;
      this._owned = /** @type {Node[]} */ ([]);

      slice.controller.setComponentProps(this, props);
      this._paintLooks();
   }

   async init() {
      this._ready = true;
      await this._render();
   }

   beforeDestroy() {
      this._ready = false;
      this._renderRev++;
      destroyNodes(this._owned);
      this._owned = [];
   }

   // ── Props ──────────────────────────────────────────────────────

   get items() { return this._items; }
   set items(value) {
      this._items = Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];
      if (this._ready) this._render();
   }

   get orientation() { return this._orientation; }
   set orientation(value) { this._orientation = this._pick('orientation', value); this._paintLooks(); }

   get marker() { return this._marker; }
   set marker(value) {
      this._marker = this._pick('marker', value);
      this._paintLooks();
      if (this._ready) this._render();
   }

   get variant() { return this._variant; }
   set variant(value) { this._variant = this._pick('variant', value); this._paintLooks(); }

   get tone() { return this._tone; }
   set tone(value) { this._tone = this._pick('tone', value); this._paintLooks(); }

   get size() { return this._size; }
   set size(value) {
      this._size = this._pick('size', value);
      this._paintLooks();
      if (this._ready) this._render();
   }

   get start() { return this._start; }
   set start(value) {
      const n = Math.round(Number(value));
      this._start = Number.isFinite(n) ? n : 1;
      this._paintLooks();
      if (this._ready) this._render();
   }

   get connector() { return this._connector; }
   set connector(value) { this._connector = value !== false; this._paintLooks(); }

   get headingLevel() { return this._headingLevel; }
   set headingLevel(value) {
      this._headingLevel = headingLevel(value, 3);
      if (this._ready) this._render();
   }

   get ariaLabel() { return this._ariaLabel; }
   set ariaLabel(value) { this._ariaLabel = value ? String(value) : ''; this._paintLooks(); }

   // ── Painting ───────────────────────────────────────────────────

   /** @param {string} prop @param {unknown} value */
   _pick(prop, value) {
      const { allowedValues, default: fallback } = /** @type {any} */ (Steps.props)[prop];
      return allowedValues.includes(value) ? value : fallback;
   }

   _paintLooks() {
      this.dataset.orientation = this._orientation;
      this.dataset.marker = this._marker;
      this.dataset.variant = this._variant;
      this.dataset.tone = this._tone;
      this.dataset.size = this._size;
      this.classList.toggle('has-connector', this._connector);
      if (!this.$list) return;
      // The list's own numbering is what a screen reader announces ("1 of 3").
      if (this._start !== 1) this.$list.setAttribute('start', String(this._start));
      else this.$list.removeAttribute('start');
      if (this._ariaLabel) this.$list.setAttribute('aria-label', this._ariaLabel);
      else this.$list.removeAttribute('aria-label');
   }

   async _render() {
      const rev = ++this._renderRev;
      const rows = this._items.map((item, index) => this._buildStep(item, index));

      const iconSize = this._size === 'sm' ? '16px' : '18px';
      const icons = await Promise.all(rows.map(({ item }) => {
         const name = this._marker === 'icon' ? iconName(item.icon) : '';
         return name ? slice.build('Icon', { name, size: iconSize, color: 'currentColor' }) : null;
      }));
      if (!this._ready || rev !== this._renderRev) {
         destroyNodes(icons.filter(Boolean));
         return;
      }

      /** @type {Node[]} */
      const owned = [];
      rows.forEach((row, i) => {
         const icon = icons[i];
         if (icon) {
            row.$marker.replaceChildren(icon);
            owned.push(icon);
         }
         owned.push(...row.content);
      });
      const kept = new Set(owned);
      destroyNodes(this._owned.filter((node) => !kept.has(node)));
      this._owned = owned;
      this.$list.replaceChildren(...rows.map((row) => row.li));
      this.style.setProperty('--slice-steps-count', String(Math.max(rows.length, 1)));
   }

   /**
    * @param {any} item
    * @param {number} index
    */
   _buildStep(item, index) {
      const li = document.createElement('li');
      li.className = 'slice-steps__item';
      if (item.id != null) li.dataset.id = String(item.id);

      const rail = document.createElement('div');
      rail.className = 'slice-steps__rail';
      rail.setAttribute('aria-hidden', 'true');

      const $marker = document.createElement('span');
      $marker.className = 'slice-steps__marker';
      // A marker without an icon shows the number, so an `icon` list with one missing
      // icon still reads in order.
      if (this._marker !== 'dot') $marker.textContent = String(this._start + index);
      rail.append($marker);

      const body = document.createElement('div');
      body.className = 'slice-steps__body';

      const label = item.title == null ? '' : String(item.title);
      if (label) {
         const title = heading(this._headingLevel, 'slice-steps__title');
         title.textContent = label;
         body.append(title);
      }
      if (item.text) {
         const p = document.createElement('p');
         p.className = 'slice-steps__text';
         p.textContent = String(item.text);
         body.append(p);
      }
      const content = toNodes(item.content, 'slice-steps__text');
      if (content.length) {
         const box = document.createElement('div');
         box.className = 'slice-steps__content';
         box.append(...content);
         body.append(box);
      }

      li.append(rail, body);
      return { li, $marker, item, content };
   }
}

customElements.define('slice-steps', Steps);
