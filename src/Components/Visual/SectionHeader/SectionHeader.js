// SectionHeader — the top of a section: a short eyebrow, the title, one or two lines that
// say what the section is about, and what to do from here ("View all", "Contact us").
// Every section of a landing or a portfolio starts the same way; this is that start, with
// a real heading so the page has an outline.
//
//   await slice.build('SectionHeader', {
//     eyebrow: 'Services',
//     title: 'What I can help you with',
//     description: 'Architecture reviews, training for teams and long-term support.',
//     actions: [{ label: 'View all services', href: '/services' }],
//   });
//
// actions     [{ label, onClick, variant, icon }] are Buttons; [{ label, href, target }] are links
// align       start (default; actions on the right) · center (actions below)
// size        sm · md (default) · lg (the page's first section)
// titleStyle  plain (default) · underline (a short accent bar under the title) · rule (a full line)

import { headingLevel } from '../../shared/content/nodes.js';
import { followLink, setLink } from '../../shared/navigation/links.js';

export default class SectionHeader extends HTMLElement {
   static props = {
      eyebrow: { type: 'string', default: '' },
      title: { type: 'string', default: '' },
      description: { type: 'string', default: '' },
      // Buttons ({ label, onClick, variant, icon, disabled }) or links ({ label, href, target }).
      actions: { type: 'array', default: [] },
      align: { type: 'string', default: 'start', allowedValues: ['start', 'center'] },
      size: { type: 'string', default: 'md', allowedValues: ['sm', 'md', 'lg'] },
      // h2 by default: a section of the page. The page's own title is the h1.
      headingLevel: { type: 'number', default: 2 },
      // The eyebrow's colour.
      tone: { type: 'string', default: 'accent', allowedValues: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'] },
      // A line under it, to separate it from what follows.
      divider: { type: 'boolean', default: false },
      // A line attached to the title: a short accent bar or a full rule.
      titleStyle: { type: 'string', default: 'plain', allowedValues: ['plain', 'underline', 'rule'] },
      // The heading's id, so the section can be linked to (`/about#services`).
      anchor: { type: 'string', default: '' },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-section-header');
      this.$text = this.querySelector('.slice-section-header__text');
      this.$eyebrow = this.querySelector('.slice-section-header__eyebrow');
      this.$description = this.querySelector('.slice-section-header__description');
      this.$actions = this.querySelector('.slice-section-header__actions');
      this.$title = /** @type {HTMLHeadingElement} */ (document.createElement('h2'));
      this.$title.className = 'slice-section-header__title';
      // First in the DOM: heading navigation lands on the title, then reads the eyebrow.
      this.$text.insertBefore(this.$title, this.$text.firstChild);

      this._eyebrow = '';
      this._title = '';
      this._description = '';
      this._actions = /** @type {any[]} */ ([]);
      this._align = 'start';
      this._size = 'md';
      this._headingLevel = 2;
      this._tone = 'accent';
      this._divider = false;
      this._titleStyle = 'plain';
      this._anchor = '';

      // Internal state: never a prop's `_<name>`.
      this._ready = false;
      this._actionsRev = 0;
      this._buttons = /** @type {any[]} */ ([]);
      this._onActionsClick = (/** @type {MouseEvent} */ event) => this._handleLinkClick(event);

      slice.controller.setComponentProps(this, props);
      this._paint();
   }

   async init() {
      this._ready = true;
      this.$actions.addEventListener('click', this._onActionsClick);
      await this._paintActions();
   }

   beforeDestroy() {
      this._ready = false;
      this._actionsRev++;
      this.$actions.removeEventListener('click', this._onActionsClick);
      this._destroyButtons();
   }

   // ── Props ──────────────────────────────────────────────────────

   get eyebrow() { return this._eyebrow; }
   set eyebrow(value) { this._eyebrow = value == null ? '' : String(value); this._paint(); }

   get title() { return this._title; }
   set title(value) { this._title = value == null ? '' : String(value); this._paint(); }

   get description() { return this._description; }
   set description(value) { this._description = value == null ? '' : String(value); this._paint(); }

   get actions() { return this._actions; }
   set actions(value) {
      this._actions = Array.isArray(value) ? value.filter((a) => a && typeof a === 'object') : [];
      if (this._ready) this._paintActions();
   }

   get align() { return this._align; }
   set align(value) { this._align = this._pick('align', value); this._paint(); }

   get size() { return this._size; }
   set size(value) {
      this._size = this._pick('size', value);
      this._paint();
      if (this._ready) this._paintActions();
   }

   get headingLevel() { return this._headingLevel; }
   set headingLevel(value) {
      this._headingLevel = headingLevel(value, 2);
      this._paint();
   }

   get tone() { return this._tone; }
   set tone(value) { this._tone = this._pick('tone', value); this._paint(); }

   get divider() { return this._divider; }
   set divider(value) { this._divider = value === true; this._paint(); }

   get titleStyle() { return this._titleStyle; }
   set titleStyle(value) { this._titleStyle = this._pick('titleStyle', value); this._paint(); }

   get anchor() { return this._anchor; }
   set anchor(value) { this._anchor = value ? String(value).trim().replace(/^#/, '') : ''; this._paint(); }

   // ── Painting ───────────────────────────────────────────────────

   /** @param {string} prop @param {unknown} value */
   _pick(prop, value) {
      const { allowedValues, default: fallback } = /** @type {any} */ (SectionHeader.props)[prop];
      return allowedValues.includes(value) ? value : fallback;
   }

   _paint() {
      if (!this.$text) return;
      this.dataset.align = this._align;
      this.dataset.size = this._size;
      this.dataset.tone = this._tone;
      this.dataset.titleStyle = this._titleStyle;
      this.classList.toggle('has-divider', this._divider);

      // The heading element follows headingLevel: replace it when the level changes.
      const tag = `H${this._headingLevel}`;
      if (this.$title.tagName !== tag) {
         const next = /** @type {HTMLHeadingElement} */ (document.createElement(tag));
         next.className = this.$title.className;
         this.$title.replaceWith(next);
         this.$title = next;
      }
      this.$title.textContent = this._title;
      this.$title.hidden = !this._title;
      if (this._anchor) this.$title.id = this._anchor;
      else this.$title.removeAttribute('id');

      this.$eyebrow.textContent = this._eyebrow;
      this.$eyebrow.hidden = !this._eyebrow;
      this.$description.textContent = this._description;
      this.$description.hidden = !this._description;
   }

   async _paintActions() {
      const rev = ++this._actionsRev;
      const size = this._size === 'sm' ? 'sm' : 'md';
      const built = await Promise.all(this._actions.map((action, index) => {
         if (typeof action.href === 'string' && action.href) {
            const a = document.createElement('a');
            a.className = 'slice-section-header__link';
            a.dataset.index = String(index);
            setLink(a, action.href, action.target || '');
            a.textContent = action.label == null ? '' : String(action.label);
            return a;
         }
         return slice.build('Button', {
            value: action.label == null ? '' : String(action.label),
            icon: action.icon || null,
            size,
            // The first action is the main one; the rest are quieter.
            variant: action.variant || (index === 0 ? 'filled' : 'outlined'),
            disabled: action.disabled === true,
            onClick: (/** @type {Event} */ event) => action.onClick?.({ header: this, event }),
         });
      }));
      const buttons = built.filter((node) => node && !(node instanceof HTMLAnchorElement));
      if (!this._ready || rev !== this._actionsRev) {
         for (const button of buttons) slice.controller.destroyComponent(button);
         return;
      }
      this._destroyButtons();
      this._buttons = buttons;
      const nodes = built.filter(Boolean);
      this.$actions.replaceChildren(...nodes);
      this.$actions.hidden = nodes.length === 0;
   }

   _destroyButtons() {
      for (const button of this._buttons) slice.controller.destroyComponent(button);
      this._buttons = [];
   }

   /** @param {MouseEvent} event */
   _handleLinkClick(event) {
      const link = /** @type {Element} */ (event.target)?.closest?.('a.slice-section-header__link');
      if (!link) return;
      const action = this._actions[Number(link.getAttribute('data-index'))];
      if (action?.href) followLink(event, action.href, action.target || '');
   }
}

customElements.define('slice-section-header', SectionHeader);
