// Timeline — things that happened (or will), in time: a career, the history of an order,
// a changelog, the activity on a record. Each event has a date, a marker on a line, a title,
// a sentence, and anything else it needs.
//
//   await slice.build('Timeline', {
//     groupBy: 'year',
//     items: [
//       { date: '2026-03-02', title: 'Released v4', text: 'Translator and SEO.', icon: 'rocket', tone: 'success' },
//       { date: '2025-09-14', title: 'Event 1', text: 'A short description.' },
//     ],
//   });
//
// layout     stacked (the date over the title, default) · split (a column of dates at the
//            start) · alternate (events on both sides of the line). split and alternate
//            go back to stacked when the container is narrow.
// dateFormat date · datetime · time · month · year · relative ("3 hours ago") · none
// groupBy    none · year · month · day ("Today", "Yesterday", then the date)
// state      per event: done (default) · current · upcoming — for something in progress,
//            like an order on its way.
//
// Dates follow the app's locale (slice.translator), or `locale`.

import { destroyNodes, heading, headingLevel, iconName, toNodes } from '../../shared/content/nodes.js';
import { followLink, setLink } from '../../shared/navigation/links.js';
import { relativeTime, toDate } from '../../shared/data/dates.js';

/** @type {Record<string, Intl.DateTimeFormatOptions>} */
const DATE_STYLES = {
   date: { dateStyle: 'medium' },
   datetime: { dateStyle: 'medium', timeStyle: 'short' },
   time: { timeStyle: 'short' },
   month: { month: 'long', year: 'numeric' },
   year: { year: 'numeric' },
};

export default class Timeline extends HTMLElement {
   static props = {
      // [{ id, date, dateLabel, title, text, icon, tone, state, badge, href, target, content }]
      items: { type: 'array', default: [] },
      layout: { type: 'string', default: 'stacked', allowedValues: ['stacked', 'split', 'alternate'] },
      dateFormat: { type: 'string', default: 'date', allowedValues: ['date', 'datetime', 'time', 'month', 'year', 'relative', 'none'] },
      groupBy: { type: 'string', default: 'none', allowedValues: ['none', 'year', 'month', 'day'] },
      // none keeps the order given; newest / oldest sort by date.
      sort: { type: 'string', default: 'none', allowedValues: ['none', 'newest', 'oldest'] },
      // dot (default) · icon (each event's icon; a dot where there is none)
      marker: { type: 'string', default: 'dot', allowedValues: ['dot', 'icon'] },
      variant: { type: 'string', default: 'soft', allowedValues: ['soft', 'filled', 'outlined'] },
      // The colour of markers and line; an event's own `tone` wins for its marker.
      tone: { type: 'string', default: 'accent', allowedValues: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'] },
      size: { type: 'string', default: 'md', allowedValues: ['sm', 'md'] },
      // The level of the group headings; events are one level below (or this level without groups).
      headingLevel: { type: 'number', default: 3 },
      // A fixed locale for the dates (otherwise the app's).
      locale: { type: 'string', default: '' },
      ariaLabel: { type: 'string', default: '' },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);
      this.classList.add('slice-timeline');
      this.$body = this.querySelector('.slice-timeline__body');

      this._items = /** @type {any[]} */ ([]);
      this._layout = 'stacked';
      this._dateFormat = 'date';
      this._groupBy = 'none';
      this._sort = 'none';
      this._marker = 'dot';
      this._variant = 'soft';
      this._tone = 'accent';
      this._size = 'md';
      this._headingLevel = 3;
      this._locale = '';
      this._ariaLabel = '';

      // Internal state: never a prop's `_<name>`.
      this._ready = false;
      this._renderRev = 0;
      this._owned = /** @type {Node[]} */ ([]);
      this._onClick = (/** @type {MouseEvent} */ event) => this._handleClick(event);

      slice.controller.setComponentProps(this, props);
      this._paintLooks();
   }

   async init() {
      this._ready = true;
      this.$body.addEventListener('click', this._onClick);
      // Dates and group names are written in the active language: write them again on a change.
      slice.translator?.watch?.(this, () => this._render());
      await this._render();
   }

   beforeDestroy() {
      this._ready = false;
      this._renderRev++;
      this.$body.removeEventListener('click', this._onClick);
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

   get dateFormat() { return this._dateFormat; }
   set dateFormat(value) { this._dateFormat = this._pick('dateFormat', value); if (this._ready) this._render(); }

   get groupBy() { return this._groupBy; }
   set groupBy(value) { this._groupBy = this._pick('groupBy', value); if (this._ready) this._render(); }

   get sort() { return this._sort; }
   set sort(value) { this._sort = this._pick('sort', value); if (this._ready) this._render(); }

   get marker() { return this._marker; }
   set marker(value) { this._marker = this._pick('marker', value); this._paintLooks(); if (this._ready) this._render(); }

   get variant() { return this._variant; }
   set variant(value) { this._variant = this._pick('variant', value); this._paintLooks(); }

   get tone() { return this._tone; }
   set tone(value) { this._tone = this._pick('tone', value); this._paintLooks(); }

   get size() { return this._size; }
   set size(value) { this._size = this._pick('size', value); this._paintLooks(); if (this._ready) this._render(); }

   get headingLevel() { return this._headingLevel; }
   set headingLevel(value) { this._headingLevel = headingLevel(value, 3); if (this._ready) this._render(); }

   get locale() { return this._locale; }
   set locale(value) { this._locale = value ? String(value) : ''; if (this._ready) this._render(); }

   get ariaLabel() { return this._ariaLabel; }
   set ariaLabel(value) { this._ariaLabel = value ? String(value) : ''; if (this._ready) this._render(); }

   // ── Dates ──────────────────────────────────────────────────────

   /** @param {string} prop @param {unknown} value */
   _pick(prop, value) {
      const { allowedValues, default: fallback } = /** @type {any} */ (Timeline.props)[prop];
      return allowedValues.includes(value) ? value : fallback;
   }

   /** The locale dates are written in: the prop, the translator's, the page's. */
   _dateLocale() {
      if (this._locale) return this._locale;
      const translator = /** @type {any} */ (globalThis).slice?.translator;
      if (translator?.enabled && translator.locale) return translator.locale;
      return document.documentElement.lang || undefined;
   }

   /**
    * @param {Date} date
    * @param {Intl.DateTimeFormatOptions} options
    */
   _format(date, options) {
      try {
         return new Intl.DateTimeFormat(this._dateLocale(), options).format(date);
      } catch {
         return date.toLocaleDateString();
      }
   }

   /** @param {Date} date */
   _dateText(date) {
      if (this._dateFormat === 'none') return '';
      if (this._dateFormat === 'relative') return relativeTime(date, { locale: this._locale || undefined });
      return this._format(date, /** @type {any} */ (DATE_STYLES)[this._dateFormat]);
   }

   /**
    * The group an event falls in, as [key, label].
    * @param {Date | null} date
    * @returns {[string, string]}
    */
   _group(date) {
      if (!date) return ['', ''];
      if (this._groupBy === 'year') return [String(date.getFullYear()), this._format(date, { year: 'numeric' })];
      if (this._groupBy === 'month') {
         return [`${date.getFullYear()}-${date.getMonth()}`, this._format(date, { month: 'long', year: 'numeric' })];
      }
      // day: "Today", "Yesterday", "Tomorrow", then the date.
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const today = new Date();
      const startOf = (/** @type {Date} */ d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const days = Math.round((startOf(date) - startOf(today)) / 86400000);
      if (Math.abs(days) <= 1) {
         try {
            const word = new Intl.RelativeTimeFormat(this._dateLocale(), { numeric: 'auto' }).format(days, 'day');
            return [key, word.charAt(0).toLocaleUpperCase(this._dateLocale()) + word.slice(1)];
         } catch {
            // fall through to the date
         }
      }
      const sameYear = date.getFullYear() === today.getFullYear();
      return [key, this._format(date, sameYear ? { weekday: 'long', day: 'numeric', month: 'long' } : { dateStyle: 'full' })];
   }

   // ── Painting ───────────────────────────────────────────────────

   _paintLooks() {
      this.dataset.layout = this._layout;
      this.dataset.marker = this._marker;
      this.dataset.variant = this._variant;
      this.dataset.tone = this._tone;
      this.dataset.size = this._size;
   }

   _events() {
      const events = this._items.map((item, index) => ({ item, index, date: toDate(item.date) }));
      if (this._sort !== 'none') {
         const sign = this._sort === 'newest' ? -1 : 1;
         // Events without a date keep their place at the end.
         events.sort((a, b) => {
            if (!a.date || !b.date) return (a.date ? -1 : 0) + (b.date ? 1 : 0) || a.index - b.index;
            return sign * (a.date.getTime() - b.date.getTime()) || a.index - b.index;
         });
      }
      return events;
   }

   async _render() {
      const rev = ++this._renderRev;
      const events = this._events();
      const grouped = this._groupBy !== 'none';
      const titleLevel = grouped ? Math.min(this._headingLevel + 1, 6) : this._headingLevel;

      /** @type {{ key: string, label: string, rows: any[] }[]} */
      const groups = [];
      for (const event of events) {
         const [key, label] = grouped ? this._group(event.date) : ['', ''];
         let group = groups[groups.length - 1];
         if (!group || group.key !== key) {
            group = { key, label, rows: [] };
            groups.push(group);
         }
         group.rows.push(this._buildEvent(event, titleLevel));
      }

      const rows = groups.flatMap((group) => group.rows);
      const iconSize = this._size === 'sm' ? '14px' : '16px';
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
            row.$marker.append(icon);
            row.$marker.classList.add('has-icon');
            owned.push(icon);
         }
         owned.push(...row.content);
      });

      const sections = groups.map((group) => {
         const list = document.createElement('ol');
         list.className = 'slice-timeline__list';
         list.append(...group.rows.map((row) => row.li));
         if (!grouped) {
            if (this._ariaLabel) list.setAttribute('aria-label', this._ariaLabel);
            return list;
         }
         const section = document.createElement('section');
         section.className = 'slice-timeline__group';
         const title = heading(this._headingLevel, 'slice-timeline__group-title');
         title.textContent = group.label;
         section.append(title, list);
         return section;
      });

      const kept = new Set(owned);
      destroyNodes(this._owned.filter((node) => !kept.has(node)));
      this._owned = owned;
      this.$body.replaceChildren(...sections);
      // With groups, the name goes on the whole timeline; without, on its one list.
      if (grouped && this._ariaLabel) {
         this.$body.setAttribute('role', 'group');
         this.$body.setAttribute('aria-label', this._ariaLabel);
      } else {
         this.$body.removeAttribute('role');
         this.$body.removeAttribute('aria-label');
      }
      this.classList.toggle('is-empty', rows.length === 0);
   }

   /**
    * @param {{ item: any, index: number, date: Date | null }} event
    * @param {number} titleLevel
    */
   _buildEvent({ item, index, date }, titleLevel) {
      const li = document.createElement('li');
      li.className = 'slice-timeline__item';
      li.dataset.index = String(index);
      if (item.id != null) li.dataset.id = String(item.id);
      const tones = Timeline.props.tone.allowedValues;
      if (tones.includes(item.tone)) li.dataset.tone = item.tone;
      const state = ['current', 'upcoming'].includes(item.state) ? item.state : 'done';
      li.dataset.state = state;
      if (state === 'current') li.setAttribute('aria-current', 'step');

      const when = document.createElement('div');
      when.className = 'slice-timeline__when';
      const label = item.dateLabel != null ? String(item.dateLabel) : (date ? this._dateText(date) : '');
      if (label) {
         const time = document.createElement('time');
         time.className = 'slice-timeline__date';
         time.textContent = label;
         if (date) {
            time.dateTime = date.toISOString();
            if (this._dateFormat === 'relative') time.title = this._format(date, DATE_STYLES.datetime);
         }
         when.append(time);
      }

      const rail = document.createElement('div');
      rail.className = 'slice-timeline__rail';
      rail.setAttribute('aria-hidden', 'true');
      const $marker = document.createElement('span');
      $marker.className = 'slice-timeline__marker';
      rail.append($marker);

      const body = document.createElement('div');
      body.className = 'slice-timeline__content';
      const text = item.title == null ? '' : String(item.title);
      if (text) {
         const title = heading(titleLevel, 'slice-timeline__title');
         const href = typeof item.href === 'string' && item.href ? item.href : '';
         if (href) {
            const a = document.createElement('a');
            a.className = 'slice-timeline__link';
            setLink(a, href, item.target || '');
            a.textContent = text;
            title.append(a);
         } else {
            title.textContent = text;
         }
         if (item.badge) {
            const badge = document.createElement('span');
            badge.className = 'slice-timeline__badge';
            badge.textContent = String(item.badge);
            title.append(' ', badge);
         }
         body.append(title);
      }
      if (item.text) {
         const p = document.createElement('p');
         p.className = 'slice-timeline__text';
         p.textContent = String(item.text);
         body.append(p);
      }
      const content = toNodes(item.content, 'slice-timeline__text');
      if (content.length) {
         const box = document.createElement('div');
         box.className = 'slice-timeline__extra';
         box.append(...content);
         body.append(box);
      }

      li.append(when, rail, body);
      li.classList.toggle('has-date', !!label);
      return { li, $marker, item, content };
   }

   /** @param {MouseEvent} event */
   _handleClick(event) {
      const link = /** @type {Element} */ (event.target)?.closest?.('a.slice-timeline__link');
      if (!link) return;
      const item = this._items[Number(link.closest('.slice-timeline__item')?.getAttribute('data-index'))];
      if (item?.href) followLink(event, item.href, item.target || '');
   }
}

customElements.define('slice-timeline', Timeline);
