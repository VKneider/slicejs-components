---
id: "0018"
title: "Component: Lightbox"
repo: "slicejs-components"
status: done
area: components
priority: medium
created: 2026-11-09
updated: 2026-11-09
target: "next release"
owners: []
related:
  - "src/Components/Visual/Lightbox/Lightbox.js"
  - "src/Components/shared/overlay/scrollLock.js"
  - "src/markdown/lightbox.md"
---

# Component: Lightbox

## Summary

`Lightbox` shows images at full size, one at a time, on a native modal `<dialog>`: keyboard, swipe, zoom with pan, thumbnails, captions, preloading and an error state. `attach(container)` turns an existing gallery of links into one.

## Problem / motivation

Product pages, portfolios and listings need a full-size image view. Apps used a Modal with an `<img>` (no keyboard navigation, no swipe, no zoom) or a third-party script that ignores the theme, focus return and the page's scroll lock.

## Proposed direction

```js
const viewer = await slice.build('Lightbox', { items: [{ src, alt, caption, thumb }], loop: true });
viewer.open(2);
viewer.attach(gallery);                    // links to images open the viewer
```

- `items` (objects or URLs), `index`, `loop`, `thumbnails`, `zoom`, `maxZoom`, `onChange`, `onOpen`, `onClose`, `texts` (en/es).
- `open()`, `close()`, `next()`, `prev()`, `go()`, `attach(container, { selector })` → detach.
- ← → Home End; Escape zooms out, then closes; + − 0; swipe left/right/down; a click on the picture zooms at that point (another click zooms out); drag pans; click on the dark area closes; RTL aware.
- Preloads the neighbours; spinner only after 250ms; "This image could not be loaded."
- Scroll lock extracted from Modal to `shared/overlay/scrollLock.js`, shared by both.

## Validation

`Lightbox.spec.js` (10): dialog and texts, ends and loop, keyboard + focus return + scroll lock, zoom and Escape, thumbnails and onChange, swipe and close on the dark area, attach/detach reading the page, broken and single image, destroy while open, `texts`. Modal specs unchanged after the scroll-lock extraction.

## Documentation impact

`lightbox.md` (Display › Content): product gallery, portfolio grid with `attach()`, floor plan to zoom.

## Decision log

- 2026-11-09 — Built on `<dialog>.showModal()` (top layer, inert page, Escape) rather than on Modal: the viewer has its own full-screen layout and gestures, and shares only the scroll lock.
