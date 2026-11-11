// Quote — what someone said, and who said it: a testimonial on a landing, a student's
// review of a course, a line from an interview in an article.
//
//   await slice.build('Quote', {
//     text: 'We shipped the new portal in three weeks.',
//     author: 'Author 1', jobTitle: 'Role 1', organization: 'Company 1',
//     avatar: '/img/ana.jpg', rating: 5,
//   });
//
// A <figure> with a <blockquote> and a <figcaption>: the words, then the person.
// Several quotes side by side, or one at a time in an ElementCarrousel, make a
// testimonials section.
//
// variant  plain (default) · soft · outlined — the surface
// size     sm · md (default) · lg (one quote that leads a section)
// avatar   an image URL, true for the author's initials, '' for none

import { texts } from '../../shared/text/texts.js';
import { setLink, followLink } from '../../shared/navigation/links.js';

const t = texts('slice.quote', {
   en: { rating: 'Rated {rating} out of {max}' },
   es: { rating: 'Calificación: {rating} de {max}' },
});

const MAX_RATING = 5;

export default class Quote extends HTMLElement {
   static props = {
      // The words: one paragraph, or an array of paragraphs.
      text: { type: 'any', default: '' },
      author: { type: 'string', default: '' },
      // What the author does ("CTO", "Student"). Not `role`: that is the element's ARIA role.
      jobTitle: { type: 'string', default: '' },
      organization: { type: 'string', default: '' },
      // An image URL, true for initials, '' for none.
      avatar: { type: 'any', default: '' },
      // 0 (none) to 5 stars; halves allowed.
      rating: { type: 'number', default: 0 },
      // Where it was said: "Google review", "Interview, 2024".
      source: { type: 'string', default: '' },
      // A link to the source; also the blockquote's `cite`.
      href: { type: 'string', default: '' },
      variant: { type: 'string', default: 'plain', allowedValues: ['plain', 'soft', 'outlined'] },
      size: { type: 'string', default: 'md', allowedValues: ['sm', 'md', 'lg'] },
      align: { type: 'string', default: 'start', allowedValues: ['start', 'center'] },
      tone: { type: 'string', default: 'accent', allowedValues: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'] },
      // The big opening quotation mark.
      mark: { type: 'boolean', default: true },
      // Built-in text overrides: { rating: 'Rated {rating} out of {max}' }.
      texts: { type: 'object', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-quote');
      this.$mark = this.querySelector('.slice-quote__mark');
      this.$rating = this.querySelector('.slice-quote__rating');
      this.$text = this.querySelector('.slice-quote__text');
      this.$caption = this.querySelector('.slice-quote__caption');
      this.$avatar = this.querySelector('.slice-quote__avatar');
      this.$author = this.querySelector('.slice-quote__author');
      this.$meta = this.querySelector('.slice-quote__meta');
      this.$source = this.querySelector('.slice-quote__source');

      this._text = /** @type {string | string[]} */ ('');
      this._author = '';
      this._jobTitle = '';
      this._organization = '';
      this._avatar = /** @type {string | boolean} */ ('');
      this._rating = 0;
      this._source = '';
      this._href = '';
      this._variant = 'plain';
      this._size = 'md';
      this._align = 'start';
      this._tone = 'accent';
      this._mark = true;
      this._texts = /** @type {Record<string, string>} */ ({});

      // Internal state: never a prop's `_<name>`.
      this._ready = false;
      this._avatarComponent = /** @type {any} */ (null);
      this._avatarRev = 0;
      this._onSourceClick = (/** @type {MouseEvent} */ event) => {
         if (event.target instanceof Element && event.target.closest('a') && this._href) followLink(event, this._href);
      };

      slice.controller.setComponentProps(this, props);
      this._paint();
   }

   async init() {
      this._ready = true;
      this.$source.addEventListener('click', this._onSourceClick);
      slice.translator?.watch?.(this, () => this._paintRating());
      await this._paintAvatar();
   }

   beforeDestroy() {
      this._ready = false;
      this._avatarRev++;
      this.$source.removeEventListener('click', this._onSourceClick);
      if (this._avatarComponent) slice.controller.destroyComponent(this._avatarComponent);
      this._avatarComponent = null;
   }

   // ── Props ──────────────────────────────────────────────────────

   get text() { return this._text; }
   set text(value) {
      this._text = Array.isArray(value) ? value.filter((p) => p != null && p !== '').map(String) : (value == null ? '' : String(value));
      this._paint();
   }

   get author() { return this._author; }
   set author(value) {
      this._author = value == null ? '' : String(value);
      this._paint();
      if (this._ready) this._paintAvatar();
   }

   get jobTitle() { return this._jobTitle; }
   set jobTitle(value) { this._jobTitle = value == null ? '' : String(value); this._paint(); }

   get organization() { return this._organization; }
   set organization(value) { this._organization = value == null ? '' : String(value); this._paint(); }

   get avatar() { return this._avatar; }
   set avatar(value) {
      this._avatar = value === true ? true : (typeof value === 'string' ? value : '');
      this._paint();
      if (this._ready) this._paintAvatar();
   }

   get rating() { return this._rating; }
   set rating(value) {
      const n = Number(value);
      this._rating = Number.isFinite(n) ? Math.min(MAX_RATING, Math.max(0, Math.round(n * 2) / 2)) : 0;
      this._paintRating();
   }

   get source() { return this._source; }
   set source(value) { this._source = value == null ? '' : String(value); this._paint(); }

   get href() { return this._href; }
   set href(value) { this._href = value ? String(value) : ''; this._paint(); }

   get variant() { return this._variant; }
   set variant(value) { this._variant = this._pick('variant', value); this._paint(); }

   get size() { return this._size; }
   set size(value) {
      this._size = this._pick('size', value);
      this._paint();
      if (this._ready) this._paintAvatar();
   }

   get align() { return this._align; }
   set align(value) { this._align = this._pick('align', value); this._paint(); }

   get tone() { return this._tone; }
   set tone(value) { this._tone = this._pick('tone', value); this._paint(); }

   get mark() { return this._mark; }
   set mark(value) { this._mark = value !== false; this._paint(); }

   get texts() { return this._texts; }
   set texts(value) { this._texts = value && typeof value === 'object' ? { ...value } : {}; this._paintRating(); }

   // ── Painting ───────────────────────────────────────────────────

   /** @param {string} prop @param {unknown} value */
   _pick(prop, value) {
      const { allowedValues, default: fallback } = /** @type {any} */ (Quote.props)[prop];
      return allowedValues.includes(value) ? value : fallback;
   }

   /** @param {string} key @param {Record<string, any>} [params] */
   _t(key, params = {}) {
      const own = this._texts[key];
      if (own == null) return t(key, params);
      return String(own).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
   }

   _paint() {
      if (!this.$text) return;
      this.dataset.variant = this._variant;
      this.dataset.size = this._size;
      this.dataset.align = this._align;
      this.dataset.tone = this._tone;
      this.$mark.hidden = !this._mark;

      const paragraphs = (Array.isArray(this._text) ? this._text : [this._text]).filter(Boolean).map((line) => {
         const p = document.createElement('p');
         p.textContent = line;
         return p;
      });
      this.$text.replaceChildren(...paragraphs);

      this.$author.textContent = this._author;
      this.$author.hidden = !this._author;
      const meta = [this._jobTitle, this._organization].filter(Boolean).join(', ');
      this.$meta.textContent = meta;
      this.$meta.hidden = !meta;

      this.$source.replaceChildren();
      if (this._source || this._href) {
         if (this._href) {
            const a = document.createElement('a');
            setLink(a, this._href, /^https?:/i.test(this._href) ? '_blank' : '');
            a.textContent = this._source || this._href;
            this.$source.append(a);
         } else {
            this.$source.textContent = this._source;
         }
      }
      this.$source.hidden = !(this._source || this._href);
      if (this._href) this.$text.setAttribute('cite', this._href);
      else this.$text.removeAttribute('cite');

      this.$avatar.hidden = !this._avatar;
      this.$caption.hidden = !(this._author || meta || this._source || this._href || this._avatar);
      this._paintRating();
   }

   _paintRating() {
      if (!this.$rating) return;
      const rating = this._rating;
      this.$rating.hidden = rating <= 0;
      if (rating <= 0) {
         this.$rating.replaceChildren();
         this.$rating.removeAttribute('aria-label');
         return;
      }
      // One accessible name for the whole row; the stars themselves are decoration.
      this.$rating.setAttribute('aria-label', this._t('rating', { rating, max: MAX_RATING }));
      const stars = [];
      for (let i = 1; i <= MAX_RATING; i++) {
         const star = document.createElement('span');
         star.className = 'slice-quote__star';
         star.setAttribute('aria-hidden', 'true');
         star.textContent = '★';
         star.dataset.fill = rating >= i ? 'full' : rating >= i - 0.5 ? 'half' : 'empty';
         stars.push(star);
      }
      this.$rating.replaceChildren(...stars);
   }

   async _paintAvatar() {
      const rev = ++this._avatarRev;
      if (this._avatarComponent) {
         slice.controller.destroyComponent(this._avatarComponent);
         this._avatarComponent = null;
         this.$avatar.replaceChildren();
      }
      if (!this._avatar) return;
      const size = this._size === 'lg' ? 'lg' : this._size === 'sm' ? 'sm' : 'md';
      const avatar = await slice.build('Avatar', {
         name: this._author,
         src: typeof this._avatar === 'string' ? this._avatar : '',
         size,
      });
      if (!avatar) return;
      if (!this._ready || rev !== this._avatarRev) {
         slice.controller.destroyComponent(avatar);
         return;
      }
      // The name is right next to it: the picture adds nothing for a screen reader.
      avatar.setAttribute('aria-hidden', 'true');
      this._avatarComponent = avatar;
      this.$avatar.replaceChildren(avatar);
   }
}

customElements.define('slice-quote', Quote);
