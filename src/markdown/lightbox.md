---
title: Lightbox
route: /docs/display/lightbox
navLabel: Lightbox
section: Display
group: Content
order: 48
description: Photos at full size, one at a time — keyboard, swipe, zoom with pan, thumbnails, captions and preloading — on a native modal dialog. Open it from code or turn an existing gallery of links into one with attach().
component: LightboxDocumentation
generate: true
tags: [lightbox, gallery, image, photo, viewer, zoom, swipe, media, display]
---

# Lightbox

## Overview
`Lightbox` shows images at full size, one at a time, over a dark screen: the photos of a product, a portfolio, a listing, the screenshots of a release.

It sits on a native modal `<dialog>`, so the page behind is inert, Escape works and focus comes back to what opened it. On top of that: arrows and swipes to move, zoom with pan, thumbnails, captions, a count, the next image preloaded, and a message when an image fails.

```javascript
const viewer = await slice.build('Lightbox', { items: [{ src, alt, caption }, …] });
viewer.open(2);

// Or: every link to an image inside `gallery` opens the viewer at that image.
viewer.attach(gallery);
```

### When to use it
- **Galleries**: product photos, a portfolio, the pictures of a place.
- **Images that need detail**: a floor plan, a screenshot, a diagram — zoom and pan.
- **Thumbnails that link to the full image**: `attach()` keeps the links (they work without JavaScript) and opens the viewer instead.

### When not to use it
- **Browsing a few pictures inside the page** (a hero, a testimonial strip): [ElementCarrousel](/docs/layout/element-carrousel).
- **A layout of images** with no full-size view: a [Grid](/docs/layout/grid).
- **Documents, video or anything that is not an image**: a [Modal](/docs/feedback/modal) with the right content.

## Core Behavior
- `items`: `{ src, alt, caption, thumb, srcset, sizes }` or plain URLs. `alt` is read out; `caption` is shown under the image.
- `open(index)`, `close()`, `next()`, `prev()`, `go(index)`, `isOpen`, `index`. `loop` wraps from the last to the first.
- `attach(container, { selector })`: clicks on `selector` inside the container (`'a[href]'` by default, or `'img'`) open the viewer at that element. The items are read from the page at the moment of the click — `href` (or `data-full`) for the image, the `<img>`'s `alt`, and `data-caption` or the `<figcaption>` for the caption — so a gallery that changes keeps working. Ctrl/⌘-click still opens the link in a new tab. Returns a function that detaches it.
- `thumbnails` (on): a strip of small images to jump to any of them, the current one marked.
- `zoom` (on) and `maxZoom` (2.5): the zoom button, a click on the picture (zooms towards that point; a second click zooms out), + − 0; drag to pan while zoomed.
- The next and previous images load in the background; a spinner shows only if an image is slow; a broken image says so.
- `onChange(index, item)`, `onOpen(index, item)`, `onClose(index)`.
- Texts are built in (English and Spanish) and replaceable with `texts`: `label`, `count` ("{index} / {total}"), `prev`, `next`, `close`, `zoomIn`, `zoomOut`, `thumb`, `error`.

### Keyboard, pointer and screen readers
- ← → move (the other way round in right-to-left pages), Home and End go to the first and last, Escape zooms out first and closes on the second press, + − 0 zoom. While zoomed the arrows pan.
- Swipe left or right to move, down to close. A click on the picture zooms in at that point; another click zooms out. A double click counts as one zoom. A click on the dark area around the image closes.
- The dialog is named "Image viewer"; the buttons say "Previous image", "Next image", "Zoom in", "Close"; thumbnails say "Image 3".
- The page does not scroll behind it; the lock is the same one Modal uses, so a lightbox over a modal works.

## Looks
Dark by design, whatever the theme. CSS variables on the dialog: `--slice-lightbox-bg`, `--slice-lightbox-fg`, `--slice-lightbox-muted`, `--slice-lightbox-control`, `--slice-lightbox-control-hover`. On phones the arrows sit over the image.

## Examples
:::script label="An image gallery" expected="a gallery fragment: a large image and four thumbnails under it; clicking the large image or a thumbnail opens the viewer at that image, with the caption, the count and the thumbnail strip"
// Illustrations generated on the spot, standing in for photos.
const shot = (bg, fg, label) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${fg}"/></linearGradient></defs><rect width="1200" height="900" fill="url(#g)"/><rect x="390" y="150" width="420" height="600" rx="24" fill="#fff" opacity=".92"/><rect x="390" y="150" width="46" height="600" fill="${fg}" opacity=".5"/><text x="600" y="470" font-family="sans-serif" font-size="44" text-anchor="middle" fill="${fg}">${label}</text></svg>`)}`;
const photos = [
  { src: shot('#f6d365', '#c2410c', 'Image 1'), alt: 'Image 1', caption: 'Image 1 · Description' },
  { src: shot('#a1c4fd', '#1e40af', 'Image 2'), alt: 'Image 2', caption: 'Image 2 · Description' },
  { src: shot('#d4fc79', '#15803d', 'Image 3'), alt: 'Image 3', caption: 'Image 3 · Description' },
  { src: shot('#fbc2eb', '#9d174d', 'Image 4'), alt: 'Image 4', caption: 'Image 4 · Description' }
];
const viewer = await slice.build('Lightbox', { items: photos });

const gallery = document.createElement('div');
gallery.style.cssText = 'display:grid;gap:10px;width:100%;max-width:440px';
const main = document.createElement('a');
main.href = photos[0].src;
main.innerHTML = '';
const big = document.createElement('img');
big.src = photos[0].src;
big.alt = photos[0].alt;
big.style.cssText = 'display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;cursor:zoom-in';
main.append(big);
main.addEventListener('click', (e) => { e.preventDefault(); viewer.open(0); });
const strip = document.createElement('div');
strip.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px';
photos.forEach((photo, i) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `View ${photo.alt}`);
  button.style.cssText = 'padding:0;border:0;border-radius:8px;overflow:hidden;cursor:pointer;background:none';
  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = '';
  img.style.cssText = 'display:block;width:100%;aspect-ratio:1;object-fit:cover';
  button.append(img);
  button.addEventListener('click', () => viewer.open(i));
  strip.append(button);
});
gallery.append(main, strip, viewer);
return gallery;
:::

:::script label="Turning a grid into a lightbox with attach()" expected="a grid of six images with captions under them; every image is a link, and clicking one opens the viewer at it with the caption taken from the page; the links still work with Ctrl/⌘-click"
const art = (hue, title) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000"><rect width="1400" height="1000" fill="hsl(${hue} 45% 22%)"/><circle cx="${400 + hue}" cy="420" r="260" fill="hsl(${hue} 70% 60%)"/><rect x="760" y="300" width="380" height="380" rx="40" fill="hsl(${(hue + 40) % 360} 75% 70%)" opacity=".85"/><text x="90" y="900" font-family="sans-serif" font-size="56" fill="#fff">${title}</text></svg>`)}`;
const projects = [[12, 'Project 1'], [40, 'Project 2'], [160, 'Project 3'], [200, 'Project 4'], [260, 'Project 5'], [320, 'Project 6']];
const grid = document.createElement('div');
grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;width:100%';
for (const [hue, title] of projects) {
  const figure = document.createElement('figure');
  figure.style.cssText = 'margin:0;display:grid;gap:6px';
  const link = document.createElement('a');
  link.href = art(hue, title);
  link.target = '_blank';
  const img = document.createElement('img');
  img.src = link.href;
  img.alt = title;
  img.style.cssText = 'display:block;width:100%;aspect-ratio:7/5;object-fit:cover;border-radius:10px';
  link.append(img);
  const caption = document.createElement('figcaption');
  caption.style.cssText = 'font-size:.85rem';
  caption.textContent = title;
  figure.append(link, caption);
  grid.append(figure);
}
const viewer = await slice.build('Lightbox', { loop: true });
viewer.attach(grid);
grid.append(viewer);
return grid;
:::

:::script label="A single image to zoom into" expected="a 'View image' button; it opens a single image (no arrows, no count, no thumbnails) that zooms with a click or the zoom button and can be dragged around while zoomed"
const plan = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100"><rect width="1600" height="1100" fill="#f8fafc"/><g fill="none" stroke="#0f172a" stroke-width="10"><rect x="80" y="80" width="1440" height="940"/><path d="M700 80v520M700 760v260M80 600h460M680 600h840M1100 600v420"/></g><g font-family="sans-serif" font-size="40" fill="#334155"><text x="200" y="340">Area 1 · 24 m²</text><text x="900" y="340">Area 2 · 14 m²</text><text x="200" y="830">Area 3 · 12 m²</text><text x="760" y="830">Area 4 · 6 m²</text><text x="1180" y="830">Area 5 · 9 m²</text></g></svg>`)}`;
const viewer = await slice.build('Lightbox', {
  items: [{ src: plan, alt: 'Plan with five areas: Area 1 to Area 5', caption: 'Plan 1 · 65 m² · Floor 2' }]
});
const open = await slice.build('Button', { value: 'View image', variant: 'outlined', icon: { name: 'search' }, onClick: () => viewer.open(0) });
const box = document.createElement('div');
box.append(open, viewer);
return box;
:::

## Best Practices
:::tip
Write an `alt` for every image: it is what the viewer reads out when the image changes. Use `caption` for what everyone should see (a title, a price, a date).
:::

:::tip
Give `thumb` a small version of each image for galleries of many photos. The strip loads them lazily, but large originals as thumbnails still cost bandwidth.
:::

## Pitfalls
:::warning
Keep the links. `attach()` opens the viewer on a normal click, but the `<a href>` is what works without JavaScript, with Ctrl/⌘-click and for search engines.
:::
