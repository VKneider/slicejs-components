import documentationRoutes from './documentationRoutes.generated.js';
import docRoutes from './docRoutes.generated.js';
import docsIndex from './docsIndex.js';
import { buildVisualRoutes, filterNavigationItems, toTreeViewItems, resolveInitialDocsPath } from './visualComponentRoutes.js';

const scrollContentToTop = () => {
   const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
   window.scrollTo({ top: 0, behavior });
};


export default class ComponentsPage extends HTMLElement {
   constructor(props) {
      super();
      slice.attachTemplate(this);
      slice.controller.setComponentProps(this, props);
      this.debuggerProps = [];
   }

   async init() {
      // Usar la configuración de rutas centralizada
      const { routes: routesConfig, buildCompactNavigationItems } = buildVisualRoutes(documentationRoutes, docsIndex);

      console.log('Visual Components MultiRoute items:', docRoutes);

      // Crear el MultiRoute con todas las rutas (usa docRoutes.generated.js para
      // que el bundle analyzer pueda detectar estaticamente los componentes)
      //
      // No `fallback` here on purpose: this container is the App shell, and it
      // is updated on EVERY route change (`App.update` → `renderIfCurrentRoute`).
      // With a fallback it would build NotFound the moment you leave the docs
      // area for another section (Theme Creator, the Playground), leaving a 404
      // inside the shell and stealing the page title. A `/docs/*` path that is
      // not a page never mounts this shell anyway: `routes.js` lists every real
      // page, so the Router's own `/404` route handles it.
      const visualComponentsMultiRoute = await slice.build('MultiRoute', {
         routes: docRoutes
      });

      // Crear el MainMenu que contendrá el TreeView
      const mainMenu = await slice.build('MainMenu', {});

      const baseNavigationItems = buildCompactNavigationItems(routesConfig);

      const buildTreeView = async (query = '') => {
         const filteredItems = filterNavigationItems(baseNavigationItems, query);
         if (!filteredItems.length) {
            return null;
         }

          const treeItems = toTreeViewItems(filteredItems);
           const treeView = await slice.build('TreeView', {
              items: treeItems,
              activePath: slice.path,
              // Keep the sidebar scroll position when a row navigates.
              preserveScroll: true,
              // Remember the open sections between visits.
              stateKey: 'docs-nav',
              ariaLabel: 'Documentation',
              // While searching, show every match opened.
              expanded: query ? 'all' : 'none',
               onClick: async (/** @type {any} */ item) => {
                  if (!item.path) return;

                  treeView.setActiveTreeItem(item);
                  await slice.router.navigate(item.path);
                  scrollContentToTop();
               },
           });

          return treeView;
      };

      const initialTreeView = await buildTreeView('');
      if (initialTreeView) {
         mainMenu.add(initialTreeView);
      } else {
         mainMenu.setEmptyState('No components found');
      }

      mainMenu.addEventListener('docs-menu-search', async (event) => {
         const query = event?.detail?.query || '';
         const nextTreeView = await buildTreeView(query);

         if (nextTreeView) {
            mainMenu.setMenuTree(nextTreeView);
            return;
         }

         mainMenu.setEmptyState('No components found');
      });

      // Crear MyNavigation
      const myNavigation = await slice.build('MyNavigation', {
         page: visualComponentsMultiRoute,
      });

      // The docs frame: the tree on the left, the page in the middle, its
      // table of contents on the right. The site Navbar lives outside (App), fixed
      // over the top; `--slice-layout-sticky-top` (ComponentsPage.css) keeps the
      // sticky sidebars under it.
      const navbar = /** @type {any} */ (document.querySelector('slice-nav-bar'));
      const breakpoint = Number(navbar?.breakpoint) || 768;
      const layOut = await slice.build('Layout', {
         sidebar: mainMenu,
         main: visualComponentsMultiRoute,
         aside: myNavigation,
         sidebarLabel: 'Documentation',
         sidebarWidth: 'clamp(220px, 17vw, 320px)',
         asideWidth: 'clamp(180px, 12vw, 250px)',
         fullHeight: true,
         // Collapse exactly when the Navbar does (same media query), and do not
         // add a second menu button: on phones the tree goes into the Navbar's panel.
         collapseBelow: `(max-width: ${breakpoint}px)`,
         collapsedSidebar: 'hidden',
         focusOnNavigate: true,
      });
      this.appendChild(layOut);

      // ONE menu button on narrow screens: the Navbar's. There the docs menu
      // (search + tree) moves into the Navbar's mobile panel; on wide screens and
      // outside /docs it goes back to the Layout's sidebar.
      this._mainMenu = mainMenu;
      this._layOut = layOut;
      this._placeMenu = () => this._placeDocsMenu();
      window.addEventListener('resize', this._placeMenu);
      window.addEventListener('router:change', this._placeMenu);
      if (slice.events && typeof slice.events.subscribe === 'function') {
         this._routeSubscription = slice.events.subscribe('router:change', this._placeMenu, { component: this });
      }
      this._placeDocsMenu();

      const defaultDocsPath = routesConfig?.defaultRoute?.path || '/docs';
      const initialPath = resolveInitialDocsPath(slice.path, defaultDocsPath);

      if (slice.path !== initialPath) {
         await slice.router.navigate(initialPath);
      }

      if (typeof visualComponentsMultiRoute.renderIfCurrentRoute === 'function') {
         await visualComponentsMultiRoute.renderIfCurrentRoute();
      }
   }

   // A cached MultiRoute brought the page back (e.g. Home → Docs).
   update() {
      this._placeDocsMenu?.();
   }

   _placeDocsMenu() {
      const menu = this._mainMenu;
      if (!menu) return;
      const navbar = /** @type {any} */ (document.querySelector('slice-nav-bar'));
      const breakpoint = Number(navbar?.breakpoint) || 768;
      const narrow = window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
      const onDocs = typeof slice.path === 'string' && slice.path.startsWith('/docs');
      if (navbar && narrow && onDocs) {
         if (navbar.panelContent !== menu) navbar.panelContent = menu;
      } else {
         if (navbar && navbar.panelContent === menu) navbar.panelContent = null;
         // Same node again: the Layout keeps it (nothing is destroyed) and puts it back.
         if (!this._layOut.querySelector('.slice-layout__sidebar')?.contains(menu)) this._layOut.sidebar = menu;
      }
   }

   beforeDestroy() {
      window.removeEventListener('resize', this._placeMenu);
      window.removeEventListener('router:change', this._placeMenu);
      if (this._routeSubscription && typeof slice.events?.unsubscribe === 'function') {
         slice.events.unsubscribe('router:change', this._routeSubscription);
      }
      this._routeSubscription = null;
      // The menu may be living in the Navbar: take it out so it is destroyed with this page.
      const navbar = /** @type {any} */ (document.querySelector('slice-nav-bar'));
      if (navbar && navbar.panelContent === this._mainMenu) navbar.panelContent = null;

   }
}

customElements.define('slice-components-page', ComponentsPage);