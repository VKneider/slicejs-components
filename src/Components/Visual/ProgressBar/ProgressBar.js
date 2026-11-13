// ProgressBar: work with a known total, or the same track while its total is unknown.
import { texts } from '../../shared/text/texts.js';
import { progressValue } from './parts/value.js';

const t = texts('slice.progressBar', {
   en: { label: 'Progress', working: 'Working…' },
   es: { label: 'Progreso', working: 'En proceso…' },
});

export default class ProgressBar extends HTMLElement {
   static props = {
      value: { type: 'number', default: 0 },
      max: { type: 'number', default: 100 },
      label: { type: 'string', default: '' },
      showLabel: { type: 'boolean', default: true },
      showValue: { type: 'boolean', default: false },
      // format(value, max); used by both the visible value and aria-valuetext.
      format: { type: 'function', default: null },
      ariaValueText: { type: 'string', default: '' },
      indeterminate: { type: 'boolean', default: false },
      size: { type: 'string', default: 'md', allowedValues: ['sm', 'md', 'lg'] },
      tone: { type: 'string', default: 'accent', allowedValues: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'] },
      locale: { type: 'string', default: '' },
      texts: { type: 'object', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.$track = this.querySelector('.slice-progress-bar__track');
      this.$fill = this.querySelector('.slice-progress-bar__fill');
      this.$label = this.querySelector('.slice-progress-bar__label');
      this.$value = this.querySelector('.slice-progress-bar__value');
      this._amount = 0;
      this._limit = 100;
      this._overrides = {};
      slice.controller.setComponentProps(this, props);
   }

   init() { slice.translator?.watch?.(this, () => this._paint()); }
   get value() { return progressValue(this._amount, this._limit).value; }
   set value(v) { this._amount = Number(v); this._paint(); }
   get max() { return progressValue(0, this._limit).max; }
   set max(v) { this._limit = v; this._paint(); }
   get label() { return this._label; }
   set label(v) { this._label = v == null ? '' : String(v); this._paint(); }
   get showLabel() { return this._showLabel; }
   set showLabel(v) { this._showLabel = v !== false; this._paint(); }
   get showValue() { return this._showValue; }
   set showValue(v) { this._showValue = v === true; this._paint(); }
   get format() { return this._format; }
   set format(v) { this._format = typeof v === 'function' ? v : null; this._paint(); }
   get ariaValueText() { return this._ariaValueText; }
   set ariaValueText(v) { this._ariaValueText = v == null ? '' : String(v); this._paint(); }
   get indeterminate() { return this._indeterminate; }
   set indeterminate(v) { this._indeterminate = v === true; this._paint(); }
   get size() { return this._size; }
   set size(v) { this._size = this._pick('size', v); this.dataset.size = this._size; }
   get tone() { return this._tone; }
   set tone(v) { this._tone = this._pick('tone', v); this.dataset.tone = this._tone; }
   get locale() { return this._locale; }
   set locale(v) { this._locale = typeof v === 'string' ? v : ''; this._paint(); }
   get texts() { return this._overrides; }
   set texts(v) { this._overrides = v && typeof v === 'object' ? { ...v } : {}; this._paint(); }

   _pick(prop, value) {
      const config = this.constructor.props[prop];
      return config.allowedValues.includes(value) ? value : config.default;
   }

   _text(key) { return this._overrides[key] ?? t(key); }

   _paint() {
      const { value, max, ratio } = progressValue(this._amount, this._limit);
      const name = this._label || this._text('label');
      this.$label.textContent = name;
      this.$label.classList.toggle('is-visually-hidden', this._showLabel === false);
      this.$value.hidden = !this._showValue;
      this.$track.setAttribute('aria-label', name);
      this.$track.setAttribute('aria-valuemax', String(max));
      this.dataset.indeterminate = String(!!this._indeterminate);
      let formatted;
      if (this._indeterminate) formatted = this._text('working');
      else if (this._format) formatted = String(this._format(value, max));
      else {
         const locale = this._locale || slice.translator?.locale || undefined;
         try {
            const options = { style: 'percent', maximumFractionDigits: 0 };
            formatted = !this._locale && slice.translator?.enabled && slice.translator.format?.number
               ? slice.translator.format.number(ratio, options)
               : new Intl.NumberFormat(locale, options).format(ratio);
         }
         catch { formatted = `${Math.round(ratio * 100)}%`; }
      }
      this.$value.textContent = formatted;
      this.$fill.style.transform = `scaleX(${ratio})`;
      if (this._indeterminate) {
         this.$track.removeAttribute('aria-valuenow');
         this.$track.removeAttribute('aria-valuetext');
      } else {
         this.$track.setAttribute('aria-valuenow', String(value));
         this.$track.setAttribute('aria-valuetext', this._ariaValueText || formatted);
      }
   }
}
customElements.define('slice-progress-bar', ProgressBar);
