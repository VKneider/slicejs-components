export default class LightboxDocumentation extends HTMLElement {
  constructor(props) {
    super();
    slice.attachTemplate(this);
    slice.controller.setComponentProps(this, props);
     this.debuggerProps = [];
     this._inlineLinks = [];
     this.scriptScenarios = [{"label":"An image gallery","expected":"a gallery fragment: a large image and four thumbnails under it; clicking the large image or a thumbnail opens the viewer at that image, with the caption, the count and the thumbnail strip","kind":"script","content":"// Illustrations generated on the spot, standing in for photos.\nconst shot = (bg, fg, label) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\" height=\"900\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"${bg}\"/><stop offset=\"1\" stop-color=\"${fg}\"/></linearGradient></defs><rect width=\"1200\" height=\"900\" fill=\"url(#g)\"/><rect x=\"390\" y=\"150\" width=\"420\" height=\"600\" rx=\"24\" fill=\"#fff\" opacity=\".92\"/><rect x=\"390\" y=\"150\" width=\"46\" height=\"600\" fill=\"${fg}\" opacity=\".5\"/><text x=\"600\" y=\"470\" font-family=\"sans-serif\" font-size=\"44\" text-anchor=\"middle\" fill=\"${fg}\">${label}</text></svg>`)}`;\nconst photos = [\n  { src: shot('#f6d365', '#c2410c', 'Image 1'), alt: 'Image 1', caption: 'Image 1 · Description' },\n  { src: shot('#a1c4fd', '#1e40af', 'Image 2'), alt: 'Image 2', caption: 'Image 2 · Description' },\n  { src: shot('#d4fc79', '#15803d', 'Image 3'), alt: 'Image 3', caption: 'Image 3 · Description' },\n  { src: shot('#fbc2eb', '#9d174d', 'Image 4'), alt: 'Image 4', caption: 'Image 4 · Description' }\n];\nconst viewer = await slice.build('Lightbox', { items: photos });\n\nconst gallery = document.createElement('div');\ngallery.style.cssText = 'display:grid;gap:10px;width:100%;max-width:440px';\nconst main = document.createElement('a');\nmain.href = photos[0].src;\nmain.innerHTML = '';\nconst big = document.createElement('img');\nbig.src = photos[0].src;\nbig.alt = photos[0].alt;\nbig.style.cssText = 'display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;cursor:zoom-in';\nmain.append(big);\nmain.addEventListener('click', (e) => { e.preventDefault(); viewer.open(0); });\nconst strip = document.createElement('div');\nstrip.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px';\nphotos.forEach((photo, i) => {\n  const button = document.createElement('button');\n  button.type = 'button';\n  button.setAttribute('aria-label', `View ${photo.alt}`);\n  button.style.cssText = 'padding:0;border:0;border-radius:8px;overflow:hidden;cursor:pointer;background:none';\n  const img = document.createElement('img');\n  img.src = photo.src;\n  img.alt = '';\n  img.style.cssText = 'display:block;width:100%;aspect-ratio:1;object-fit:cover';\n  button.append(img);\n  button.addEventListener('click', () => viewer.open(i));\n  strip.append(button);\n});\ngallery.append(main, strip, viewer);\nreturn gallery;"},{"label":"Turning a grid into a lightbox with attach()","expected":"a grid of six images with captions under them; every image is a link, and clicking one opens the viewer at it with the caption taken from the page; the links still work with Ctrl/⌘-click","kind":"script","content":"const art = (hue, title) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1400\" height=\"1000\"><rect width=\"1400\" height=\"1000\" fill=\"hsl(${hue} 45% 22%)\"/><circle cx=\"${400 + hue}\" cy=\"420\" r=\"260\" fill=\"hsl(${hue} 70% 60%)\"/><rect x=\"760\" y=\"300\" width=\"380\" height=\"380\" rx=\"40\" fill=\"hsl(${(hue + 40) % 360} 75% 70%)\" opacity=\".85\"/><text x=\"90\" y=\"900\" font-family=\"sans-serif\" font-size=\"56\" fill=\"#fff\">${title}</text></svg>`)}`;\nconst projects = [[12, 'Project 1'], [40, 'Project 2'], [160, 'Project 3'], [200, 'Project 4'], [260, 'Project 5'], [320, 'Project 6']];\nconst grid = document.createElement('div');\ngrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;width:100%';\nfor (const [hue, title] of projects) {\n  const figure = document.createElement('figure');\n  figure.style.cssText = 'margin:0;display:grid;gap:6px';\n  const link = document.createElement('a');\n  link.href = art(hue, title);\n  link.target = '_blank';\n  const img = document.createElement('img');\n  img.src = link.href;\n  img.alt = title;\n  img.style.cssText = 'display:block;width:100%;aspect-ratio:7/5;object-fit:cover;border-radius:10px';\n  link.append(img);\n  const caption = document.createElement('figcaption');\n  caption.style.cssText = 'font-size:.85rem';\n  caption.textContent = title;\n  figure.append(link, caption);\n  grid.append(figure);\n}\nconst viewer = await slice.build('Lightbox', { loop: true });\nviewer.attach(grid);\ngrid.append(viewer);\nreturn grid;"},{"label":"A single image to zoom into","expected":"a 'View image' button; it opens a single image (no arrows, no count, no thumbnails) that zooms with a click or the zoom button and can be dragged around while zoomed","kind":"script","content":"const plan = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1600\" height=\"1100\"><rect width=\"1600\" height=\"1100\" fill=\"#f8fafc\"/><g fill=\"none\" stroke=\"#0f172a\" stroke-width=\"10\"><rect x=\"80\" y=\"80\" width=\"1440\" height=\"940\"/><path d=\"M700 80v520M700 760v260M80 600h460M680 600h840M1100 600v420\"/></g><g font-family=\"sans-serif\" font-size=\"40\" fill=\"#334155\"><text x=\"200\" y=\"340\">Area 1 · 24 m²</text><text x=\"900\" y=\"340\">Area 2 · 14 m²</text><text x=\"200\" y=\"830\">Area 3 · 12 m²</text><text x=\"760\" y=\"830\">Area 4 · 6 m²</text><text x=\"1180\" y=\"830\">Area 5 · 9 m²</text></g></svg>`)}`;\nconst viewer = await slice.build('Lightbox', {\n  items: [{ src: plan, alt: 'Plan with five areas: Area 1 to Area 5', caption: 'Plan 1 · 65 m² · Floor 2' }]\n});\nconst open = await slice.build('Button', { value: 'View image', variant: 'outlined', icon: { name: 'search' }, onClick: () => viewer.open(0) });\nconst box = document.createElement('div');\nbox.append(open, viewer);\nreturn box;"}];
  }

  async init() {
    this.markdownPath = "lightbox.md";
    this.markdownContent = "---\ntitle: Lightbox\nroute: /docs/display/lightbox\nnavLabel: Lightbox\nsection: Display\ngroup: Content\norder: 48\ndescription: Photos at full size, one at a time — keyboard, swipe, zoom with pan, thumbnails, captions and preloading — on a native modal dialog. Open it from code or turn an existing gallery of links into one with attach().\ncomponent: LightboxDocumentation\ngenerate: true\ntags: [lightbox, gallery, image, photo, viewer, zoom, swipe, media, display]\n---\n\n# Lightbox\n\n## Overview\n`Lightbox` shows images at full size, one at a time, over a dark screen: the photos of a product, a portfolio, a listing, the screenshots of a release.\n\nIt sits on a native modal `<dialog>`, so the page behind is inert, Escape works and focus comes back to what opened it. On top of that: arrows and swipes to move, zoom with pan, thumbnails, captions, a count, the next image preloaded, and a message when an image fails.\n\n```javascript\nconst viewer = await slice.build('Lightbox', { items: [{ src, alt, caption }, …] });\nviewer.open(2);\n\n// Or: every link to an image inside `gallery` opens the viewer at that image.\nviewer.attach(gallery);\n```\n\n### When to use it\n- **Galleries**: product photos, a portfolio, the pictures of a place.\n- **Images that need detail**: a floor plan, a screenshot, a diagram — zoom and pan.\n- **Thumbnails that link to the full image**: `attach()` keeps the links (they work without JavaScript) and opens the viewer instead.\n\n### When not to use it\n- **Browsing a few pictures inside the page** (a hero, a testimonial strip): [ElementCarrousel](/docs/layout/element-carrousel).\n- **A layout of images** with no full-size view: a [Grid](/docs/layout/grid).\n- **Documents, video or anything that is not an image**: a [Modal](/docs/feedback/modal) with the right content.\n\n## Core Behavior\n- `items`: `{ src, alt, caption, thumb, srcset, sizes }` or plain URLs. `alt` is read out; `caption` is shown under the image.\n- `open(index)`, `close()`, `next()`, `prev()`, `go(index)`, `isOpen`, `index`. `loop` wraps from the last to the first.\n- `attach(container, { selector })`: clicks on `selector` inside the container (`'a[href]'` by default, or `'img'`) open the viewer at that element. The items are read from the page at the moment of the click — `href` (or `data-full`) for the image, the `<img>`'s `alt`, and `data-caption` or the `<figcaption>` for the caption — so a gallery that changes keeps working. Ctrl/⌘-click still opens the link in a new tab. Returns a function that detaches it.\n- `thumbnails` (on): a strip of small images to jump to any of them, the current one marked.\n- `zoom` (on) and `maxZoom` (2.5): the zoom button, a click on the picture (zooms towards that point; a second click zooms out), + − 0; drag to pan while zoomed.\n- The next and previous images load in the background; a spinner shows only if an image is slow; a broken image says so.\n- `onChange(index, item)`, `onOpen(index, item)`, `onClose(index)`.\n- Texts are built in (English and Spanish) and replaceable with `texts`: `label`, `count` (\"{index} / {total}\"), `prev`, `next`, `close`, `zoomIn`, `zoomOut`, `thumb`, `error`.\n\n### Keyboard, pointer and screen readers\n- ← → move (the other way round in right-to-left pages), Home and End go to the first and last, Escape zooms out first and closes on the second press, + − 0 zoom. While zoomed the arrows pan.\n- Swipe left or right to move, down to close. A click on the picture zooms in at that point; another click zooms out. A double click counts as one zoom. A click on the dark area around the image closes.\n- The dialog is named \"Image viewer\"; the buttons say \"Previous image\", \"Next image\", \"Zoom in\", \"Close\"; thumbnails say \"Image 3\".\n- The page does not scroll behind it; the lock is the same one Modal uses, so a lightbox over a modal works.\n\n## Looks\nDark by design, whatever the theme. CSS variables on the dialog: `--slice-lightbox-bg`, `--slice-lightbox-fg`, `--slice-lightbox-muted`, `--slice-lightbox-control`, `--slice-lightbox-control-hover`. On phones the arrows sit over the image.\n\n## Examples\n:::script label=\"An image gallery\" expected=\"a gallery fragment: a large image and four thumbnails under it; clicking the large image or a thumbnail opens the viewer at that image, with the caption, the count and the thumbnail strip\"\n// Illustrations generated on the spot, standing in for photos.\nconst shot = (bg, fg, label) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\" height=\"900\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"${bg}\"/><stop offset=\"1\" stop-color=\"${fg}\"/></linearGradient></defs><rect width=\"1200\" height=\"900\" fill=\"url(#g)\"/><rect x=\"390\" y=\"150\" width=\"420\" height=\"600\" rx=\"24\" fill=\"#fff\" opacity=\".92\"/><rect x=\"390\" y=\"150\" width=\"46\" height=\"600\" fill=\"${fg}\" opacity=\".5\"/><text x=\"600\" y=\"470\" font-family=\"sans-serif\" font-size=\"44\" text-anchor=\"middle\" fill=\"${fg}\">${label}</text></svg>`)}`;\nconst photos = [\n  { src: shot('#f6d365', '#c2410c', 'Image 1'), alt: 'Image 1', caption: 'Image 1 · Description' },\n  { src: shot('#a1c4fd', '#1e40af', 'Image 2'), alt: 'Image 2', caption: 'Image 2 · Description' },\n  { src: shot('#d4fc79', '#15803d', 'Image 3'), alt: 'Image 3', caption: 'Image 3 · Description' },\n  { src: shot('#fbc2eb', '#9d174d', 'Image 4'), alt: 'Image 4', caption: 'Image 4 · Description' }\n];\nconst viewer = await slice.build('Lightbox', { items: photos });\n\nconst gallery = document.createElement('div');\ngallery.style.cssText = 'display:grid;gap:10px;width:100%;max-width:440px';\nconst main = document.createElement('a');\nmain.href = photos[0].src;\nmain.innerHTML = '';\nconst big = document.createElement('img');\nbig.src = photos[0].src;\nbig.alt = photos[0].alt;\nbig.style.cssText = 'display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;cursor:zoom-in';\nmain.append(big);\nmain.addEventListener('click', (e) => { e.preventDefault(); viewer.open(0); });\nconst strip = document.createElement('div');\nstrip.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px';\nphotos.forEach((photo, i) => {\n  const button = document.createElement('button');\n  button.type = 'button';\n  button.setAttribute('aria-label', `View ${photo.alt}`);\n  button.style.cssText = 'padding:0;border:0;border-radius:8px;overflow:hidden;cursor:pointer;background:none';\n  const img = document.createElement('img');\n  img.src = photo.src;\n  img.alt = '';\n  img.style.cssText = 'display:block;width:100%;aspect-ratio:1;object-fit:cover';\n  button.append(img);\n  button.addEventListener('click', () => viewer.open(i));\n  strip.append(button);\n});\ngallery.append(main, strip, viewer);\nreturn gallery;\n:::\n\n:::script label=\"Turning a grid into a lightbox with attach()\" expected=\"a grid of six images with captions under them; every image is a link, and clicking one opens the viewer at it with the caption taken from the page; the links still work with Ctrl/⌘-click\"\nconst art = (hue, title) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1400\" height=\"1000\"><rect width=\"1400\" height=\"1000\" fill=\"hsl(${hue} 45% 22%)\"/><circle cx=\"${400 + hue}\" cy=\"420\" r=\"260\" fill=\"hsl(${hue} 70% 60%)\"/><rect x=\"760\" y=\"300\" width=\"380\" height=\"380\" rx=\"40\" fill=\"hsl(${(hue + 40) % 360} 75% 70%)\" opacity=\".85\"/><text x=\"90\" y=\"900\" font-family=\"sans-serif\" font-size=\"56\" fill=\"#fff\">${title}</text></svg>`)}`;\nconst projects = [[12, 'Project 1'], [40, 'Project 2'], [160, 'Project 3'], [200, 'Project 4'], [260, 'Project 5'], [320, 'Project 6']];\nconst grid = document.createElement('div');\ngrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;width:100%';\nfor (const [hue, title] of projects) {\n  const figure = document.createElement('figure');\n  figure.style.cssText = 'margin:0;display:grid;gap:6px';\n  const link = document.createElement('a');\n  link.href = art(hue, title);\n  link.target = '_blank';\n  const img = document.createElement('img');\n  img.src = link.href;\n  img.alt = title;\n  img.style.cssText = 'display:block;width:100%;aspect-ratio:7/5;object-fit:cover;border-radius:10px';\n  link.append(img);\n  const caption = document.createElement('figcaption');\n  caption.style.cssText = 'font-size:.85rem';\n  caption.textContent = title;\n  figure.append(link, caption);\n  grid.append(figure);\n}\nconst viewer = await slice.build('Lightbox', { loop: true });\nviewer.attach(grid);\ngrid.append(viewer);\nreturn grid;\n:::\n\n:::script label=\"A single image to zoom into\" expected=\"a 'View image' button; it opens a single image (no arrows, no count, no thumbnails) that zooms with a click or the zoom button and can be dragged around while zoomed\"\nconst plan = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1600\" height=\"1100\"><rect width=\"1600\" height=\"1100\" fill=\"#f8fafc\"/><g fill=\"none\" stroke=\"#0f172a\" stroke-width=\"10\"><rect x=\"80\" y=\"80\" width=\"1440\" height=\"940\"/><path d=\"M700 80v520M700 760v260M80 600h460M680 600h840M1100 600v420\"/></g><g font-family=\"sans-serif\" font-size=\"40\" fill=\"#334155\"><text x=\"200\" y=\"340\">Area 1 · 24 m²</text><text x=\"900\" y=\"340\">Area 2 · 14 m²</text><text x=\"200\" y=\"830\">Area 3 · 12 m²</text><text x=\"760\" y=\"830\">Area 4 · 6 m²</text><text x=\"1180\" y=\"830\">Area 5 · 9 m²</text></g></svg>`)}`;\nconst viewer = await slice.build('Lightbox', {\n  items: [{ src: plan, alt: 'Plan with five areas: Area 1 to Area 5', caption: 'Plan 1 · 65 m² · Floor 2' }]\n});\nconst open = await slice.build('Button', { value: 'View image', variant: 'outlined', icon: { name: 'search' }, onClick: () => viewer.open(0) });\nconst box = document.createElement('div');\nbox.append(open, viewer);\nreturn box;\n:::\n\n## Best Practices\n:::tip\nWrite an `alt` for every image: it is what the viewer reads out when the image changes. Use `caption` for what everyone should see (a title, a price, a date).\n:::\n\n:::tip\nGive `thumb` a small version of each image for galleries of many photos. The strip loads them lazily, but large originals as thumbnails still cost bandwidth.\n:::\n\n## Pitfalls\n:::warning\nKeep the links. `attach()` opens the viewer on a normal click, but the `<a href>` is what works without JavaScript, with Ctrl/⌘-click and for search engines.\n:::\n\n:::related\n- [Carrousel](/docs/layout/element-carrousel) - Several images, one after another.\n- [Card](/docs/layout/card) - A picture as the banner.\n- [File upload](/docs/input/file-upload) - The image before it is shown.\n:::\n";
    if (true) {
      await this.setupCopyButton();
    }
      {
         const container = this.querySelector('[data-block-id="doc-block-1"]');
         if (container) {
            const code = await slice.build('CodeVisualizer', {
               value: "const viewer = await slice.build('Lightbox', { items: [{ src, alt, caption }, …] });\nviewer.open(2);\n\n// Or: every link to an image inside `gallery` opens the viewer at that image.\nviewer.attach(gallery);",
               language: "javascript"
            });
            if (null) {
               const label = document.createElement('div');
               label.classList.add('code-block-title');
               label.textContent = null;
               container.appendChild(label);
            }
            container.appendChild(code);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-5"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Write an <code>alt</code> for every image: it is what the viewer reads out when the image changes. Use <code>caption</code> for what everyone should see (a title, a price, a date).</p>";
            const callout = await slice.build('Callout', {
               tone: "success",
               variant: "soft",
               title: "Tip",
               content: Array.from(body.childNodes)
            });
            container.appendChild(callout || body);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-6"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Give <code>thumb</code> a small version of each image for galleries of many photos. The strip loads them lazily, but large originals as thumbnails still cost bandwidth.</p>";
            const callout = await slice.build('Callout', {
               tone: "success",
               variant: "soft",
               title: "Tip",
               content: Array.from(body.childNodes)
            });
            container.appendChild(callout || body);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-7"]');
         if (container) {
            const body = document.createElement('div');
            body.className = 'doc-callout-body';
            body.innerHTML = "<p>Keep the links. <code>attach()</code> opens the viewer on a normal click, but the <code>&lt;a href&gt;</code> is what works without JavaScript, with Ctrl/⌘-click and for search engines.</p>";
            const callout = await slice.build('Callout', {
               tone: "warning",
               variant: "soft",
               title: "Warning",
               content: Array.from(body.childNodes)
            });
            container.appendChild(callout || body);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-8"]');
         if (container) {
            const items = [{"title":"Carrousel","path":"/docs/layout/element-carrousel","text":"Several images, one after another."},{"title":"Card","path":"/docs/layout/card","text":"A picture as the banner."},{"title":"File upload","path":"/docs/input/file-upload","text":"The image before it is shown."}];
            const cards = [];
            for (const item of items) {
               const card = await slice.build('Card', {
                  title: item.title,
                  text: item.text || '',
                  // The small mark beside the title, not the banner: a page
                  // of four related links should not be four big arrows.
                  headerIcon: 'arrow-right',
                  interactive: true,
                  onClick: () => {
                     if (/^https?:/i.test(item.path)) {
                        window.open(item.path, '_blank', 'noopener,noreferrer');
                     } else {
                        slice.router.navigate(item.path);
                     }
                  }
               });
               if (card) cards.push(card);
            }
            const grid = await slice.build('Grid', {
               columns: items.length === 4 ? 2 : Math.min(3, Math.max(1, cards.length)),
               gap: '14px',
               items: cards
            });
            if (grid) container.appendChild(grid);
         }
      }
      {
         const container = this.querySelector('[data-block-id="doc-block-9"]');
         if (container) {
            let props = {};
            if ("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"index\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"loop\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"thumbnails\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"zoom\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"maxZoom\",\"type\":\"number\",\"required\":false,\"default\":\"2.5\",\"allowedValues\":[]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onOpen\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onClose\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}") {
               try {
                  props = JSON.parse("{\"props\":[{\"path\":\"items\",\"type\":\"array\",\"required\":false,\"default\":\"\",\"allowedValues\":[]},{\"path\":\"index\",\"type\":\"number\",\"required\":false,\"default\":\"0\",\"allowedValues\":[]},{\"path\":\"loop\",\"type\":\"boolean\",\"required\":false,\"default\":\"false\",\"allowedValues\":[]},{\"path\":\"thumbnails\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"zoom\",\"type\":\"boolean\",\"required\":false,\"default\":\"true\",\"allowedValues\":[]},{\"path\":\"maxZoom\",\"type\":\"number\",\"required\":false,\"default\":\"2.5\",\"allowedValues\":[]},{\"path\":\"onChange\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onOpen\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"onClose\",\"type\":\"function\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]},{\"path\":\"texts\",\"type\":\"object\",\"required\":false,\"default\":\"null\",\"allowedValues\":[]}]}");
               } catch (error) {
                  console.warn('Invalid component props JSON:', error);
               }
            }
            const component = await slice.build('PropsTable', props);
            container.appendChild(component);
         }
       }
      {
         const links = [{"text":"ElementCarrousel","path":"/docs/layout/element-carrousel"},{"text":"Grid","path":"/docs/layout/grid"},{"text":"Modal","path":"/docs/feedback/modal"}];
         for (const [index, linkProps] of links.entries()) {
            const placeholder = this.querySelector('[data-inline-link="' + index + '"]');
            if (!placeholder) continue;
            const link = await slice.build('Link', linkProps);
            placeholder.replaceWith(link);
            this._inlineLinks.push(link);
         }
      }
    await this.renderScriptScenarios();
  }

  async update() {
    // Refresh dynamic content here if needed
  }

   beforeDestroy() {
     for (const link of this._inlineLinks) {
       if (typeof slice.isComponentAlive !== 'function' || slice.isComponentAlive(link)) {
         slice.controller.destroyComponent(link);
       }
     }
     this._inlineLinks = [];
   }

  async setupCopyButton() {
    const container = this.querySelector('[data-copy-md]');
    if (!container) return;

    const copyMenu = await slice.build('CopyMarkdownMenu', {
      markdownPath: this.markdownPath,
      markdownContent: this.markdownContent,
      label: 'Copy as markdown'
    });

    container.appendChild(copyMenu);
  }

  async renderScriptScenarios() {
    if (!Array.isArray(this.scriptScenarios) || this.scriptScenarios.length === 0) return;
    const host = this.querySelector('.documentation-content');
    if (!host) return;

    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

      // Render where the author put the :::script blocks.
      //
      // The markdown parser already emits one <div class="script-block"> at the
      // position of each block, in document order, and those divs come from the same
      // parse as this.scriptScenarios â€” so the counts always line up. They used to be
      // ignored: every scenario was appended in one lump to the end of
      // .documentation-content under a second, generated <h2>Prop Scenarios</h2>. The
      // result was that the heading an author wrote sat over nothing at all â€” the divs
      // were never filled, nothing in the repo reads .script-block â€” the real demos were
      // exiled below the props table, and 38 of 53 pages showed the heading twice.
      const blocks = [...this.querySelectorAll('.script-block')];
      const inPlace = blocks.length === this.scriptScenarios.length;

      const section = document.createElement('section');
      if (!inPlace) {
         // Fallback, kept so a future parser change that desyncs the two cannot
         // silently drop every demo. An author-placed heading already exists in the
         // in-place case, so only invent one when we are building the section.
         section.classList.add('doc-script-scenarios');

         const title = document.createElement('h2');
         title.textContent = 'Prop Scenarios';
         section.appendChild(title);

         const subtitle = document.createElement('p');
         subtitle.classList.add('doc-script-subtitle');
         subtitle.textContent = 'Interactive demos validating component behavior.';
         section.appendChild(subtitle);
      }
      for (const [index, scenario] of this.scriptScenarios.entries()) {
      const demobox = await slice.build('DemoBox', {
        label: scenario.label,
        expected: scenario.expected || ''
      });

      const code = await slice.build('CodeVisualizer', {
        value: scenario.content,
        language: 'javascript'
      });

      const errorMessage = document.createElement('p');
      errorMessage.classList.add('doc-script-error');
      errorMessage.hidden = true;

      const executeScenario = async () => {
        demobox.clear();
        errorMessage.hidden = true;
        errorMessage.textContent = '';

        const createBuildFallbackNode = (name) => {
          const fallback = document.createElement('div');
          fallback.style.padding = '10px';
          fallback.style.border = '1px dashed var(--warning-color)';
          fallback.style.borderRadius = '8px';
          fallback.style.background = 'color-mix(in srgb, var(--primary-background-color) 85%, var(--warning-color))';
          fallback.style.color = 'var(--font-primary-color)';
          fallback.textContent = String(name || '')
            ? 'Component "' + String(name) + '" is not registered in this build yet.'
            : 'Requested component is not registered in this build yet.';
          return fallback;
        };

        const safeSlice = Object.create(slice);
        safeSlice.build = async (name, props) => {
          const built = await slice.build(name, props);
          if (built instanceof Node) {
            return built;
          }
          if (Array.isArray(built)) {
            const fragment = document.createDocumentFragment();
            let hasNode = false;
            built.forEach((item) => {
              if (item instanceof Node) {
                fragment.appendChild(item);
                hasNode = true;
              }
            });
            if (hasNode) {
              return fragment;
            }
          }
          return built ?? createBuildFallbackNode(name);
        };

        const mount = (node) => {
          if (node instanceof Node) {
            demobox.appendDemo(node);
          }
        };

        try {
          const fn = new AsyncFunction('component', 'slice', 'document', 'mount', scenario.content);
          const result = await fn(this, safeSlice, document, mount);

          if (result instanceof Node) {
            demobox.appendDemo(result);
          } else if (Array.isArray(result)) {
            result.forEach((item) => {
              if (item instanceof Node) {
                demobox.appendDemo(item);
              }
            });
          }
        } catch (error) {
          errorMessage.textContent = 'Live preview error: ' + error.message;
          errorMessage.hidden = false;
        }
      };
      (inPlace ? blocks[index] : section).appendChild(demobox);
      demobox.appendCode(code);
      (inPlace ? blocks[index] : section).appendChild(errorMessage);

      await executeScenario();
    }
      if (!inPlace) host.appendChild(section);
  }
}

customElements.define('slice-lightboxdocumentation', LightboxDocumentation);
