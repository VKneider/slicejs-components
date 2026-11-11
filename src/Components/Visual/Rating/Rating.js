// Rating — a score from 1 to `max` (stars by default): "How was the class?", a product
// review in a form, a satisfaction survey. And, with `readOnly`, the same stars to show a
// score that is already given.
//
//   await slice.build('Rating', { label: 'Rate the course', value: 4, onChange: (v) => … });
//   await slice.build('Rating', { value: 4.6, readOnly: true, size: 'sm' });
//
// Built like RadioGroup: one native <input type="radio"> per value, in a fieldset with
// role="radiogroup". The browser then gives the whole keyboard model (Tab lands on the
// chosen star, the arrows move AND choose), required, and form submission. On top:
//
//   allowHalf   halves: 0.5, 1, 1.5 … (two radios per star)
//   clearable   a click on the chosen star, Backspace, Delete or 0 clears it
//   labels      a word per value ('Poor' … 'Excellent'): read out with the number, and
//               shown next to the stars with `showValue`
//   icon        the character drawn ('★' by default; '♥', '●' …)
//
// It works inside Form like any other field (`value`, `required`, `ariaLabel`).

import { texts } from '../../shared/text/texts.js';

const t = texts('slice.rating', {
   en: { option: '{value} of {max}', optionLabel: '{label}, {value} of {max}', rated: 'Rated {value} out of {max}', none: 'Not rated', clear: 'Rating cleared' },
   es: { option: '{value} de {max}', optionLabel: '{label}, {value} de {max}', rated: 'Calificación: {value} de {max}', none: 'Sin calificar', clear: 'Calificación borrada' },
});

let ratingCount = 0;

export default class Rating extends HTMLElement {
   static props = {
      // The score (a number), or null for none.
      value: { type: 'number', default: null },
      max: { type: 'number', default: 5 },
      allowHalf: { type: 'boolean', default: false },
      clearable: { type: 'boolean', default: true },
      readOnly: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
      required: { type: 'boolean', default: false },
      // A visible label (the fieldset's legend). Inside a Form, the Form's label is used.
      label: { type: 'string', default: '' },
      // The accessible name when there is no visible label.
      ariaLabel: { type: 'string', default: '' },
      // The radios' shared name (generated when empty), for a native <form>.
      name: { type: 'string', default: '' },
      // One word per whole value, from 1: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'].
      labels: { type: 'array', default: [] },
      // The number (and its word) next to the stars: "4 · Very good".
      showValue: { type: 'boolean', default: false },
      icon: { type: 'string', default: '★' },
      size: { type: 'string', default: 'md', allowedValues: ['sm', 'md', 'lg'] },
      tone: { type: 'string', default: 'warning', allowedValues: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'] },
      // onChange(value | null)
      onChange: { type: 'function', default: null },
      texts: { type: 'object', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-rating');
      this.$group = /** @type {HTMLFieldSetElement} */ (this.querySelector('.slice-rating__group'));
      this.$legend = this.querySelector('.slice-rating__label');
      this.$stars = this.querySelector('.slice-rating__stars');
      this.$value = this.querySelector('.slice-rating__value');
      this.$readonly = this.querySelector('.slice-rating__readonly');

      this._value = /** @type {number | null} */ (null);
      this._max = 5;
      this._allowHalf = false;
      this._clearable = true;
      this._readOnly = false;
      this._disabled = false;
      this._required = false;
      this._label = '';
      this._ariaLabel = '';
      this._name = '';
      this._labels = /** @type {string[]} */ ([]);
      this._showValue = false;
      this._icon = '★';
      this._size = 'md';
      this._tone = 'warning';
      this._onChange = /** @type {Function | null} */ (null);
      this._texts = /** @type {Record<string, string>} */ ({});

      // Internal state: never a prop's `_<name>`.
      this._uid = `slice-rating-${++ratingCount}`;
      this._preview = /** @type {number | null} */ (null);
      // The value as given, so a later max / allowHalf re-rounds it (props come in any order).
      this._given = /** @type {unknown} */ (null);
      this._inputs = /** @type {HTMLInputElement[]} */ ([]);
      this._starEls = /** @type {HTMLElement[]} */ ([]);
      this._built = false;
      this.$legend.id = `${this._uid}-label`;

      this._onInput = (/** @type {Event} */ e) => this._handleChange(e);
      this._onClick = (/** @type {MouseEvent} */ e) => this._handleClick(e);
      this._onKey = (/** @type {KeyboardEvent} */ e) => this._handleKey(e);
      this._onOver = (/** @type {PointerEvent} */ e) => {
         const input = this._inputFor(e.target);
         if (input && !input.disabled) this._setPreview(Number(input.value));
      };
      this._onLeave = () => this._setPreview(null);
      this.$stars.addEventListener('change', this._onInput);
      this.$stars.addEventListener('click', this._onClick);
      this.$stars.addEventListener('keydown', this._onKey);
      this.$stars.addEventListener('pointerover', this._onOver);
      this.$stars.addEventListener('pointerleave', this._onLeave);

      slice.controller.setComponentProps(this, props);
      this._build();
   }

   init() {
      slice.translator?.watch?.(this, () => this._build());
   }

   // ── Props ──────────────────────────────────────────────────────

   get value() { return this._value; }
   set value(value) {
      this._given = value;
      this._value = this._clamp(value);
      this._paint();
   }

   get max() { return this._max; }
   set max(value) {
      const n = Math.round(Number(value));
      this._max = Number.isFinite(n) ? Math.min(10, Math.max(1, n)) : 5;
      this._value = this._clamp(this._given);
      this._build();
   }

   get allowHalf() { return this._allowHalf; }
   set allowHalf(value) { this._allowHalf = value === true; this._value = this._clamp(this._given); this._build(); }

   get clearable() { return this._clearable; }
   set clearable(value) { this._clearable = value !== false; }

   get readOnly() { return this._readOnly; }
   set readOnly(value) { this._readOnly = value === true; this._value = this._clamp(this._given); this._build(); }

   get disabled() { return this._disabled; }
   set disabled(value) {
      this._disabled = value === true;
      this.$group.disabled = this._disabled;
      if (this._disabled) this.$group.setAttribute('aria-disabled', 'true');
      else this.$group.removeAttribute('aria-disabled');
      this.classList.toggle('is-disabled', this._disabled);
   }

   get required() { return this._required; }
   set required(value) {
      this._required = value === true;
      for (const input of this._inputs) input.required = this._required;
      if (this._required) this.$group.setAttribute('aria-required', 'true');
      else this.$group.removeAttribute('aria-required');
   }

   get label() { return this._label; }
   set label(value) { this._label = value ? String(value) : ''; this._paintName(); }

   get ariaLabel() { return this._ariaLabel; }
   set ariaLabel(value) { this._ariaLabel = value ? String(value) : ''; this._paintName(); }

   get name() { return this._name; }
   set name(value) {
      this._name = typeof value === 'string' && value.trim() ? value.trim() : '';
      for (const input of this._inputs) input.name = this._name || this._uid;
   }

   get labels() { return this._labels; }
   set labels(value) { this._labels = Array.isArray(value) ? value.map((l) => (l == null ? '' : String(l))) : []; this._build(); }

   get showValue() { return this._showValue; }
   set showValue(value) { this._showValue = value === true; this._paint(); }

   get icon() { return this._icon; }
   set icon(value) { this._icon = value ? String(value) : '★'; this._build(); }

   get size() { return this._size; }
   set size(value) { this._size = this._pick('size', value); this.dataset.size = this._size; }

   get tone() { return this._tone; }
   set tone(value) { this._tone = this._pick('tone', value); this.dataset.tone = this._tone; }

   get onChange() { return this._onChange; }
   set onChange(value) { this._onChange = typeof value === 'function' ? value : null; }

   get texts() { return this._texts; }
   set texts(value) { this._texts = value && typeof value === 'object' ? { ...value } : {}; this._build(); }

   /** Focus the chosen star, or the first one (like Tab would). */
   focus(options) {
      const target = this._inputs.find((input) => input.checked) || this._inputs.find((input) => !input.disabled);
      target?.focus(options);
   }

   // ── Helpers ────────────────────────────────────────────────────

   /** @param {string} prop @param {unknown} value */
   _pick(prop, value) {
      const { allowedValues, default: fallback } = /** @type {any} */ (Rating.props)[prop];
      return allowedValues.includes(value) ? value : fallback;
   }

   /** @param {unknown} value */
   _clamp(value) {
      if (value === null || value === undefined || value === '') return null;
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) return null;
      // A score to show (readOnly) keeps its tenths: an average of 4.6 is drawn as 4.6.
      const step = this._readOnly ? 0.1 : this._allowHalf ? 0.5 : 1;
      const rounded = Math.round(n / step) * step;
      return Math.min(this._max, Math.max(step, Math.round(rounded * 10) / 10));
   }

   /** @param {string} key @param {Record<string, any>} [params] */
   _t(key, params = {}) {
      const own = this._texts[key];
      if (own == null) return t(key, params);
      return String(own).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
   }

   /** @param {number} value */
   _number(value) {
      const translator = /** @type {any} */ (globalThis).slice?.translator;
      try {
         if (translator?.enabled) return translator.format.number(value);
         return new Intl.NumberFormat(document.documentElement.lang || undefined).format(value);
      } catch {
         return String(value);
      }
   }

   /** The word for a value (whole values only; a half takes the word below it). */
   _word(value) {
      return this._labels[Math.ceil(value) - 1] || '';
   }

   /** @param {EventTarget | null} target */
   _inputFor(target) {
      const part = /** @type {Element} */ (target)?.closest?.('.slice-rating__part');
      const input = part?.querySelector('input');
      return input instanceof HTMLInputElement ? input : null;
   }

   // ── Rendering ──────────────────────────────────────────────────

   _paintName() {
      this.$legend.textContent = this._label;
      this.$legend.hidden = !this._label;
      if (this._label) {
         this.$group.setAttribute('aria-labelledby', this.$legend.id);
         this.$group.removeAttribute('aria-label');
      } else {
         this.$group.removeAttribute('aria-labelledby');
         if (this._ariaLabel) this.$group.setAttribute('aria-label', this._ariaLabel);
         else this.$group.removeAttribute('aria-label');
      }
   }

   _build() {
      if (!this.$stars) return;
      this.dataset.size = this._size;
      this.dataset.tone = this._tone;
      this.$group.hidden = this._readOnly;
      this.$readonly.hidden = !this._readOnly;
      this._inputs = [];

      const stars = [];
      for (let i = 1; i <= this._max; i++) {
         const star = document.createElement('span');
         star.className = 'slice-rating__star';
         star.dataset.star = String(i);
         const glyph = document.createElement('span');
         glyph.className = 'slice-rating__glyph';
         glyph.setAttribute('aria-hidden', 'true');
         glyph.textContent = this._icon;
         const fill = document.createElement('span');
         fill.className = 'slice-rating__fill';
         fill.setAttribute('aria-hidden', 'true');
         fill.textContent = this._icon;
         star.append(glyph, fill);
         if (!this._readOnly) {
            const values = this._allowHalf ? [i - 0.5, i] : [i];
            for (const value of values) star.append(this._part(value, values.length === 2 && value % 1 !== 0 ? 'start' : (values.length === 2 ? 'end' : 'whole')));
         }
         stars.push(star);
      }
      this._starEls = stars;
      if (this._readOnly) {
         this.$stars.replaceChildren();
         this.$readonly.replaceChildren(...stars);
      } else {
         this.$readonly.replaceChildren();
         this.$stars.replaceChildren(...stars);
      }
      this._built = true;
      this._paintName();
      this.required = this._required;
      this.disabled = this._disabled;
      this._paint();
   }

   /**
    * A clickable half (or whole) of a star: a label around a visually hidden radio.
    * @param {number} value
    * @param {'start'|'end'|'whole'} side
    */
   _part(value, side) {
      const part = document.createElement('label');
      part.className = 'slice-rating__part';
      part.dataset.side = side;
      const input = document.createElement('input');
      input.type = 'radio';
      input.className = 'slice-rating__input';
      input.name = this._name || this._uid;
      input.value = String(value);
      input.required = this._required;
      const word = this._word(value);
      input.setAttribute('aria-label', word
         ? this._t('optionLabel', { label: word, value: this._number(value), max: this._max })
         : this._t('option', { value: this._number(value), max: this._max }));
      part.append(input);
      this._inputs.push(input);
      return part;
   }

   _paint() {
      if (!this._built) return;
      const shown = this._preview ?? this._value ?? 0;
      for (const star of this._starEls) this._fillStar(star, shown);
      for (const input of this._inputs) input.checked = this._value !== null && Number(input.value) === this._value;
      this.classList.toggle('is-previewing', this._preview !== null);
      this.classList.toggle('has-value', this._value !== null);

      if (this._readOnly) {
         this.$readonly.setAttribute('aria-label', this._value === null
            ? this._t('none')
            : this._t('rated', { value: this._number(this._value), max: this._max }));
      }

      const valueShown = this._showValue && (this._preview ?? this._value) !== null;
      this.$value.hidden = !valueShown;
      if (valueShown) {
         const v = /** @type {number} */ (this._preview ?? this._value);
         const word = this._word(v);
         this.$value.textContent = word ? `${this._number(v)} · ${word}` : `${this._number(v)} / ${this._max}`;
      } else {
         this.$value.textContent = '';
      }
   }

   /** @param {HTMLElement} star @param {number} shown */
   _fillStar(star, shown) {
      const i = Number(star.dataset.star);
      const amount = Math.min(1, Math.max(0, shown - (i - 1)));
      star.dataset.fill = amount === 1 ? 'full' : amount > 0 ? 'half' : 'empty';
      star.style.setProperty('--slice-rating-fill', `${Math.round(amount * 100)}%`);
   }

   /** @param {number | null} value */
   _setPreview(value) {
      if (this._disabled || this._readOnly) return;
      this._preview = value;
      this._paint();
   }

   // ── Events ─────────────────────────────────────────────────────

   /** @param {Event} event */
   _handleChange(event) {
      const input = /** @type {HTMLInputElement} */ (event.target);
      if (!(input instanceof HTMLInputElement)) return;
      this._commit(Number(input.value));
   }

   /** @param {MouseEvent} event */
   _handleClick(event) {
      const input = /** @type {HTMLInputElement} */ (event.target);
      if (!(input instanceof HTMLInputElement) || !this._clearable) return;
      // A radio's click runs before its change. If the clicked value is already the
      // value, no change will follow: the click on the chosen star clears it.
      if (this._value !== null && Number(input.value) === this._value) {
         this._commit(null);
         this._preview = null;
         this._paint();
      }
   }

   /** @param {KeyboardEvent} event */
   _handleKey(event) {
      if (!this._clearable || this._disabled) return;
      if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
         if (this._value === null) return;
         event.preventDefault();
         this._commit(null);
         this._announce(this._t('clear'));
      }
   }

   /** @param {number | null} value */
   _commit(value) {
      const next = this._clamp(value);
      if (next === this._value) {
         this._paint();
         return;
      }
      this._value = next;
      this._given = next;
      this._paint();
      // A radio cannot be unchecked by the user: when clearing, say it as a change too,
      // so a Form around it re-validates.
      if (next === null) this.dispatchEvent(new Event('change', { bubbles: true }));
      this._onChange?.(next);
   }

   /** @param {string} message */
   _announce(message) {
      const live = this.querySelector('.slice-rating__live');
      if (live) live.textContent = message;
   }
}

customElements.define('slice-rating', Rating);
