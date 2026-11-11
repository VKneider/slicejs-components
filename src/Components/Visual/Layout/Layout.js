// Layout — the frame of an app or a site: a header, a sidebar, the main content, an
// aside and a footer. Below a width the sidebar becomes a drawer with a menu button.
//
//   const app = await slice.build('Layout', {
//      header: topBar,            // a node or a component
//      sidebar: menu,
//      main: router,              // or showing(view) to swap what is shown
//      stickyHeader: true,
//      fullHeight: true,
//      sidebarLabel: 'Main navigation',
//   });
//
// What it does for you:
//   - landmarks: banner, navigation, main, complementary, contentinfo
//   - a "Skip to content" link, the first thing Tab reaches
//   - the sidebar as a drawer below `collapseBelow` (measured on the layout itself):
//     a menu button with aria-expanded, Escape and the backdrop close it, focus goes
//     in and comes back
//   - `contentWidth` keeps long lines readable; `sidebarWidth`, `asideWidth`
//   - around a MultiRoute: the drawer closes on every route change, and with
//     `focusOnNavigate` focus moves to main so the new view is read
//
// Legacy use is unchanged: with no region props, `onLayOut(node)` and `showing(node)`
// append to the host, as they always did.

import { texts } from '../../shared/text/texts.js';
import { destroyNodes } from '../../shared/content/nodes.js';

const t = texts('slice.layout', {
   en: { skip: 'Skip to content', menu: 'Open menu', close: 'Close menu' },
   es: { skip: 'Saltar al contenido', menu: 'Abrir menú', close: 'Cerrar menú' },
});

const REGIONS = /** @type {const} */ (['header', 'sidebar', 'main', 'aside', 'footer']);

let layoutCount = 0;

export default class Layout extends HTMLElement {

   static props = {
      // Legacy: a node appended to the host on init (onLayOut), and the view shown (showing).
      layout: { type: 'object', default: null, required: false },
      view: { type: 'object', default: null, required: false },
      // Regions: a node, a component, or an array of them.
      header: { type: 'any', default: null },
      sidebar: { type: 'any', default: null },
      main: { type: 'any', default: null },
      aside: { type: 'any', default: null },
      footer: { type: 'any', default: null },
      // The header stays at the top while the page scrolls.
      stickyHeader: { type: 'boolean', default: false },
      // At least the height of the window; the footer stays at the bottom.
      fullHeight: { type: 'boolean', default: false },
      sidebarWidth: { type: 'any', default: '260px' },
      asideWidth: { type: 'any', default: '280px' },
      // The maximum width of the main content (a number = px). null: no limit.
      contentWidth: { type: 'any', default: null },
      // Below this width (of the layout, in px) the sidebar is a drawer. 0 = never.
      // A number: below this width OF THE LAYOUT (px). A string: a media query, matched
      // on the window like a Navbar's breakpoint ('(max-width: 768px)'). 0 = never.
      collapseBelow: { type: 'any', default: 900 },
      // While collapsed, the sidebar is a 'drawer' (with the menu button) or 'hidden'
      // (the app shows it elsewhere — e.g. in the Navbar's mobile panel).
      collapsedSidebar: { type: 'string', default: 'drawer', allowedValues: ['drawer', 'hidden'] },
      // The drawer is open (only while collapsed).
      sidebarOpen: { type: 'boolean', default: false },
      onSidebarToggle: { type: 'function', default: null },
      // The sidebar's accessible name; it is a navigation landmark.
      sidebarLabel: { type: 'string', default: '' },
      // Close the drawer when the route changes (router:change) or a link in the sidebar is followed.
      closeOnNavigate: { type: 'boolean', default: true },
      // Move focus to the main region after each route change, so screen readers start
      // reading the new view. Recommended for an app shell around a MultiRoute.
      focusOnNavigate: { type: 'boolean', default: false },
      // Landmark roles on the regions. Off when the layout sits inside another page's <main>.
      landmarks: { type: 'boolean', default: true },
      skipLink: { type: 'boolean', default: true },
      texts: { type: 'object', default: null },
   };

   constructor(props) {
      super();
      slice.attachTemplate(this);

      // Internal state: never a prop's `_<name>`.
      this._uid = `slice-layout-${++layoutCount}`;
      this._frame = /** @type {Record<string, HTMLElement> | null} */ (null);
      this._regionNodes = /** @type {Record<string, Node[]>} */ ({});
      this._collapsed = false;
      this._width = 0;
      this._observer = /** @type {ResizeObserver | null} */ (null);
      this._raf = 0;
      this._mql = /** @type {MediaQueryList | null} */ (null);
      this._onMedia = () => this._measure();

      this._onKey = (/** @type {KeyboardEvent} */ e) => {
         if (e.key === 'Escape' && this._collapsed && this._sidebarOpen) {
            e.stopPropagation();
            this._setOpen(false, true);
            this._frame?.toggle.focus();
         }
      };

      // Route changes: the router announces them on slice.events when the app
      // enables the event bus, and on window otherwise — listen to both.
      this._routeSubscription = null;
      this._onRoute = (/** @type {any} */ e) => this._handleRoute(e?.detail ?? e);

      slice.controller.setComponentProps(this, props);
      this.currentView = null;
   }

   async init() {
      if (this.layout) {
         await this.onLayOut(this.layout);
      }
      if (this.view) {
         await this.showing(this.view);
      }
      if (this._frame) this._observe();
      window.addEventListener('router:change', this._onRoute);
      if (slice.events && typeof slice.events.subscribe === 'function') {
         this._routeSubscription = slice.events.subscribe('router:change', this._onRoute, { component: this });
      }
      slice.translator?.watch?.(this, () => this._paintTexts());
   }

   beforeDestroy() {
      this._mql?.removeEventListener('change', this._onMedia);
      this._mql = null;
      this._observer?.disconnect();
      this._observer = null;
      cancelAnimationFrame(this._raf);
      this.removeEventListener('keydown', this._onKey);
      window.removeEventListener('router:change', this._onRoute);
      if (this._routeSubscription && typeof slice.events?.unsubscribe === 'function') {
         slice.events.unsubscribe('router:change', this._routeSubscription);
      }
      this._routeSubscription = null;
      // Region content the layout owns (set through props) goes with it.
      for (const region of REGIONS) destroyNodes(this._regionNodes[region] || []);
      this._regionNodes = {};
   }

   // ── Legacy props ───────────────────────────────────────────────

   get layout() { return this._layout; }
   set layout(value) { this._layout = value; }

   get view() { return this._view; }
   set view(value) { this._view = value; }

   // ── Regions ────────────────────────────────────────────────────

   get header() { return this._header; }
   set header(value) { this._header = value; this._setRegion('header', value); }

   get sidebar() { return this._sidebar; }
   set sidebar(value) { this._sidebar = value; this._setRegion('sidebar', value); }

   get main() { return this._main; }
   set main(value) { this._main = value; this._setRegion('main', value); }

   get aside() { return this._aside; }
   set aside(value) { this._aside = value; this._setRegion('aside', value); }

   get footer() { return this._footer; }
   set footer(value) { this._footer = value; this._setRegion('footer', value); }

   // ── Looks and behaviour ────────────────────────────────────────

   get stickyHeader() { return this._stickyHeader; }
   set stickyHeader(value) { this._stickyHeader = value === true; this.toggleAttribute('data-sticky-header', this._stickyHeader); }

   get fullHeight() { return this._fullHeight; }
   set fullHeight(value) { this._fullHeight = value === true; this.toggleAttribute('data-full-height', this._fullHeight); }

   get sidebarWidth() { return this._sidebarWidth; }
   set sidebarWidth(value) { this._sidebarWidth = value; this._cssLength('--slice-layout-sidebar-width', value); }

   get asideWidth() { return this._asideWidth; }
   set asideWidth(value) { this._asideWidth = value; this._cssLength('--slice-layout-aside-width', value); }

   get contentWidth() { return this._contentWidth; }
   set contentWidth(value) { this._contentWidth = value; this._cssLength('--slice-layout-content-width', value); }

   get collapseBelow() { return this._collapseBelow; }
   set collapseBelow(value) {
      this._mql?.removeEventListener('change', this._onMedia);
      this._mql = null;
      if (typeof value === 'string' && value.trim() && Number.isNaN(Number(value))) {
         this._collapseBelow = value.trim();
         this._mql = window.matchMedia(this._collapseBelow);
         this._mql.addEventListener('change', this._onMedia);
      } else {
         const n = Number(value);
         this._collapseBelow = Number.isFinite(n) && n > 0 ? n : 0;
      }
      this._measure();
   }

   get collapsedSidebar() { return this._collapsedSidebar; }
   set collapsedSidebar(value) {
      this._collapsedSidebar = value === 'hidden' ? 'hidden' : 'drawer';
      this.dataset.collapsedSidebar = this._collapsedSidebar;
      if (this._collapsedSidebar === 'hidden' && this._sidebarOpen) this._setOpen(false, false);
      this._applyCollapsed();
   }

   get sidebarOpen() { return this._sidebarOpen; }
   set sidebarOpen(value) { this._setOpen(value === true, false); }

   get onSidebarToggle() { return this._onSidebarToggle; }
   set onSidebarToggle(value) { this._onSidebarToggle = typeof value === 'function' ? value : null; }

   get closeOnNavigate() { return this._closeOnNavigate; }
   set closeOnNavigate(value) { this._closeOnNavigate = value !== false; }

   get focusOnNavigate() { return this._focusOnNavigate; }
   set focusOnNavigate(value) { this._focusOnNavigate = value === true; }

   get sidebarLabel() { return this._sidebarLabel; }
   set sidebarLabel(value) { this._sidebarLabel = value ? String(value) : ''; this._paintRoles(); }

   get landmarks() { return this._landmarks; }
   set landmarks(value) { this._landmarks = value !== false; this._paintRoles(); }

   get skipLink() { return this._skipLink; }
   set skipLink(value) { this._skipLink = value !== false; this._paintTexts(); }

   get texts() { return this._texts; }
   set texts(value) { this._texts = value && typeof value === 'object' ? { ...value } : {}; this._paintTexts(); }

   /** True while the sidebar is shown as a drawer (the layout is narrower than collapseBelow). */
   get collapsed() { return this._collapsed; }

   /** Open or close the drawer (no-op while the sidebar is not collapsed). */
   toggleSidebar(open = !this._sidebarOpen) {
      this._setOpen(open === true, true);
   }

   // ── Views ──────────────────────────────────────────────────────

   /**
    * Show `view`, replacing the one shown before (which is removed, not destroyed:
    * a router keeps its views). With regions, it goes in the main region.
    */
   async showing(view) {
      if (this.currentView && this.currentView.parentNode) {
         this.currentView.parentNode.removeChild(this.currentView);
      }
      this._target().appendChild(view);
      this.currentView = view;
   }

   /** Append `view` (legacy: to the host; with regions, to the main region). */
   async onLayOut(view) {
      this._target().appendChild(view);
   }

   // ── Internals ──────────────────────────────────────────────────

   /** @param {string} key @param {Record<string, any>} [params] */
   _t(key, params = {}) {
      const own = this._texts?.[key];
      return own == null ? t(key, params) : String(own);
   }

   _target() {
      return this._frame ? this._frame.content : this;
   }

   /** @param {string} name @param {unknown} value */
   _cssLength(name, value) {
      if (value === null || value === undefined || value === '') this.style.removeProperty(name);
      else this.style.setProperty(name, typeof value === 'number' ? `${value}px` : String(value));
   }

   /** @param {typeof REGIONS[number]} region @param {any} value */
   _setRegion(region, value) {
      const list = (Array.isArray(value) ? value : [value]).filter((node) => node instanceof Node);
      if (!list.length && !this._frame) return;
      const frame = this._ensureFrame();
      const host = region === 'main' ? frame.content : frame[region];
      const keep = new Set(list);
      // Components that leave a region are destroyed; the ones that stay are moved, not rebuilt.
      destroyNodes((this._regionNodes[region] || []).filter((node) => !keep.has(node)));
      this._regionNodes[region] = list;
      if (region === 'main') {
         // The view shown by showing() stays.
         for (const node of list) host.appendChild(node);
      } else {
         host.replaceChildren(...list);
      }
      this.toggleAttribute(`data-has-${region}`, region === 'main' ? true : list.length > 0);
      if (region === 'header') this._placeToggle();
   }

   _ensureFrame() {
      if (this._frame) return this._frame;
      const el = (tag, cls) => {
         const node = document.createElement(tag);
         node.className = `slice-layout__${cls}`;
         return node;
      };
      const skip = /** @type {HTMLAnchorElement} */ (el('a', 'skip'));
      const header = el('div', 'header');
      const toggle = /** @type {HTMLButtonElement} */ (el('button', 'toggle'));
      toggle.type = 'button';
      toggle.hidden = true;
      toggle.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
      const body = el('div', 'body');
      const sidebar = el('div', 'sidebar');
      sidebar.id = `${this._uid}-sidebar`;
      sidebar.tabIndex = -1;
      const backdrop = el('div', 'backdrop');
      backdrop.hidden = true;
      const main = el('div', 'main');
      main.id = `${this._uid}-main`;
      main.tabIndex = -1;
      const content = el('div', 'content');
      main.append(content);
      const aside = el('div', 'aside');
      const footer = el('div', 'footer');
      body.append(sidebar, backdrop, main, aside);

      skip.href = `#${main.id}`;
      skip.addEventListener('click', (e) => {
         e.preventDefault();
         main.focus();
         main.scrollIntoView({ block: 'start' });
      });
      toggle.setAttribute('aria-controls', sidebar.id);
      toggle.addEventListener('click', () => this._setOpen(!this._sidebarOpen, true));
      // A link followed from the drawer: close it (also for hash and external links,
      // which the router does not announce).
      sidebar.addEventListener('click', (e) => {
         const link = /** @type {Element} */ (e.target)?.closest?.('a[href]');
         if (link && this._closeOnNavigate && this._collapsed && this._sidebarOpen) this._setOpen(false, true);
      });
      backdrop.addEventListener('click', () => {
         this._setOpen(false, true);
         toggle.focus();
      });

      // Anything already appended (legacy onLayOut before regions) moves into main.
      const before = Array.from(this.childNodes);
      this.append(skip, header, body, footer);
      for (const node of before) content.appendChild(node);

      this._frame = { skip, header, toggle, body, sidebar, backdrop, main, content, aside, footer };
      this.classList.add('slice-layout--regions');
      this.setAttribute('data-has-main', '');
      this.addEventListener('keydown', this._onKey);
      this._paintRoles();
      this._paintTexts();
      this._placeToggle();
      this._applyCollapsed();
      if (this.isConnected && !this._observer) this._observe();
      return this._frame;
   }

   /** @param {any} [change] the router's { to, from } */
   _handleRoute(change) {
      if (!this._frame || !this.isConnected) return;
      if (this._closeOnNavigate && this._collapsed && this._sidebarOpen) this._setOpen(false, true);
      // A cached view hidden by its MultiRoute is not on screen: only a visible layout takes focus.
      // Not on the first route of the page (no `from`): the page just loaded, and
      // Tab should still start at the top.
      if (this._focusOnNavigate && change?.from && this._frame.main.getClientRects().length) {
         this._frame.main.focus({ preventScroll: true });
      }
   }

   _placeToggle() {
      const f = this._frame;
      if (!f) return;
      // The menu button opens the header; with no header, the top of the main region.
      if (this.hasAttribute('data-has-header')) f.header.prepend(f.toggle);
      else f.main.prepend(f.toggle);
   }

   _paintRoles() {
      const f = this._frame;
      if (!f) return;
      const roles = { header: 'banner', sidebar: 'navigation', main: 'main', aside: 'complementary', footer: 'contentinfo' };
      for (const [region, role] of Object.entries(roles)) {
         if (this._landmarks) f[region].setAttribute('role', role);
         else f[region].removeAttribute('role');
      }
      if (this._sidebarLabel) f.sidebar.setAttribute('aria-label', this._sidebarLabel);
      else f.sidebar.removeAttribute('aria-label');
   }

   _paintTexts() {
      const f = this._frame;
      if (!f) return;
      f.skip.textContent = this._t('skip');
      f.skip.hidden = !this._skipLink;
      f.toggle.setAttribute('aria-label', this._t(this._sidebarOpen && this._collapsed ? 'close' : 'menu'));
   }

   _observe() {
      if (typeof ResizeObserver === 'undefined') return;
      this._observer = new ResizeObserver(() => {
         cancelAnimationFrame(this._raf);
         // Next frame: the layout change would otherwise resize what is observed, inside the callback.
         this._raf = requestAnimationFrame(() => this._measure());
      });
      this._observer.observe(this);
      if (this._frame) this._observer.observe(this._frame.header);
   }

   _measure() {
      const f = this._frame;
      if (!f || !this.isConnected) return;
      this._width = this.getBoundingClientRect().width;
      this.style.setProperty('--slice-layout-header-height', `${Math.round(f.header.getBoundingClientRect().height)}px`);
      const below = this._collapseBelow;
      const collapsed = this._mql
         ? this._mql.matches
         : typeof below === 'number' && below > 0 && this._width > 0 && this._width < below;
      if (collapsed !== this._collapsed) {
         this._collapsed = collapsed;
         if (!collapsed && this._sidebarOpen) this._setOpen(false, true);
         this._applyCollapsed();
      }
   }

   _applyCollapsed() {
      const f = this._frame;
      if (!f) return;
      const hasSidebar = this.hasAttribute('data-has-sidebar');
      this.toggleAttribute('data-collapsed', this._collapsed);
      const drawer = this._collapsedSidebar !== 'hidden';
      f.toggle.hidden = !(this._collapsed && hasSidebar && drawer);
      const open = this._collapsed && this._sidebarOpen;
      f.toggle.setAttribute('aria-expanded', String(open));
      this.toggleAttribute('data-sidebar-open', open);
      f.backdrop.hidden = !open;
      // A closed drawer is out of the tab order and the accessibility tree.
      f.sidebar.inert = this._collapsed && !open;
      this._paintTexts();
   }

   /** @param {boolean} open @param {boolean} fromUser */
   _setOpen(open, fromUser) {
      const was = this._sidebarOpen === true;
      if (this._collapsedSidebar === 'hidden') open = false;
      this._sidebarOpen = open;
      if (!this._frame) return;
      this._applyCollapsed();
      if (open === was || !this._collapsed) return;
      if (open) {
         const first = /** @type {HTMLElement | null} */ (this._frame.sidebar.querySelector('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'));
         (first || this._frame.sidebar).focus();
      }
      if (fromUser) this._onSidebarToggle?.(open);
   }
}

customElements.define('slice-layout', Layout);
