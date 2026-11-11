// Links that go through the router.
//
// A real `<a href>` is what a link should be: it can be opened in a new tab, copied, read
// by a screen reader as a link and followed by a crawler. An internal one (`/pricing`)
// should still not reload the page, so a plain click goes through `slice.router.navigate`;
// a click with a modifier (new tab, new window, download) or on an external URL is left
// to the browser.
//
// Used by FeatureList, SectionHeader, Timeline and Quote.

/**
 * An app path the router can handle: starts with one `/` (not `//cdn…`, not `https:`).
 * @param {unknown} href
 * @returns {href is string}
 */
export function isInternalHref(href) {
   return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');
}

/**
 * Point an anchor at `href`: through `slice.href()` for an app path (it adds the locale
 * prefix when the app has one), as given otherwise. `_blank` gets `rel="noopener"`.
 * @param {HTMLAnchorElement} anchor
 * @param {string} href
 * @param {string} [target]
 */
export function setLink(anchor, href, target = '') {
   const internal = isInternalHref(href);
   const resolved = internal && typeof slice?.href === 'function' ? slice.href(href) : href;
   anchor.setAttribute('href', resolved);
   if (target) {
      anchor.target = target;
      if (target === '_blank') anchor.rel = 'noopener noreferrer';
   } else {
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
   }
}

/**
 * Handle a click on an anchor made with `setLink`: a plain left click on an app path
 * navigates with the router (no reload). Returns true when it did.
 * @param {MouseEvent} event
 * @param {string} href the app path as given (not the localized URL)
 * @param {string} [target]
 * @returns {boolean}
 */
export function followLink(event, href, target = '') {
   if (event.defaultPrevented || event.button !== 0) return false;
   if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
   if (target && target !== '_self') return false;
   if (!isInternalHref(href) || typeof slice?.router?.navigate !== 'function') return false;
   event.preventDefault();
   slice.router.navigate(href);
   return true;
}
