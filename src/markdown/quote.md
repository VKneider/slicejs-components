---
title: Quote
route: /docs/display/quote
navLabel: Quote
section: Display
group: Content
order: 45
description: What someone said and who said it — testimonials, reviews, a line from an interview. A figure with a blockquote and a caption, an avatar, a star rating and the source; in a grid or one at a time in a carousel.
component: QuoteDocumentation
generate: true
tags: [quote, testimonial, review, blockquote, rating, carousel, content, display]
---

# Quote

## Overview
`Quote` shows what someone said, and who said it: a client's testimonial on a landing, a student's review of a course, a line from an interview inside an article.

It is a `<figure>`: the words in a `<blockquote>`, the person in a `<figcaption>` (name, job title, organization, an avatar) and, when there is one, where it was said (`<cite>`). Several quotes in a grid, or one at a time in an [ElementCarrousel](/docs/layout/element-carrousel), make a testimonials section.

### When to use it
- **Testimonials** from clients, students or users.
- **Reviews** with a star rating.
- **A quotation inside an article** or a lesson, with its source.
- **One leading quote** at the top of a section (`size: 'lg'`, `align: 'center'`).

### When not to use it
- **A highlighted note or tip that nobody "said"**: a [Callout](/docs/display/callout).
- **A comment thread or chat** (replies, timestamps, actions): a list built for it.
- **Fake or anonymous praise**. A testimonial is only worth something if it is real: keep the person's name, and their permission.

## Core Behavior
- `text`: one paragraph, or an array of paragraphs. Always text, never markup.
- `author`, `jobTitle` and `organization` ("Job title, Company") go in the caption. (`jobTitle`, not `role`: `role` is the element's ARIA role.)
- `avatar`: an image URL, `true` for the author's initials, `''` for none. It is an [Avatar](/docs/display/avatar), hidden from screen readers because the name is right next to it.
- `rating`: `0` (none) to `5`, halves allowed. The row of stars has one accessible name ("Rated 4.5 out of 5"); `texts: { rating: '…' }` changes it.
- `source` ("Google review", "Interview, 2024") and `href`: the source becomes a link (a new tab for an external URL) and the blockquote's `cite`.

## Looks
- `variant`: `plain` (default), `soft` or `outlined`. `size`: `sm`, `md` or `lg`. `align`: `start` or `center`.
- `tone`: the colour of the opening quotation mark; `mark: false` removes it.
- In a row of quotes, the caption sits at the bottom, so cards of different lengths line up.
- CSS variables: `--slice-quote-text-size`, `--slice-quote-pad`, `--slice-quote-radius`, `--slice-quote-star`.

## Live Preview
:::component name="Quote"
{
  "text": "Example quote text for this component.",
  "author": "Author 1",
  "jobTitle": "Role 1",
  "organization": "Company 1",
  "avatar": true,
  "rating": 5,
  "variant": "outlined"
}
:::

## Examples
:::script label="Quotes carousel" expected="a section header 'Section title' and a carousel of outlined quotes with initials avatars and star ratings: one per view on a phone, two on a tablet, three on a wide screen; arrows, dots, it loops and moves every 7 seconds unless hovered or focused, with a pause button"
const quotes = [
  { text: 'Short example quote text.', author: 'Author 1', jobTitle: 'Role 1', rating: 5 },
  { text: 'A longer example quote that shows how the text wraps in a card.', author: 'Author 2', jobTitle: 'Role 2', organization: 'Company 2', rating: 5 },
  { text: 'Another example quote with a different length.', author: 'Author 3', jobTitle: 'Role 3', rating: 4.5 },
  { text: 'A fourth example quote for the carousel.', author: 'Author 4', jobTitle: 'Role 4', organization: 'Company 4', rating: 5 },
  { text: 'A fifth example quote.', author: 'Author 5', jobTitle: 'Role 5', rating: 4 }
];

const slides = await Promise.all(quotes.map((q) => slice.build('Quote', {
  ...q,
  avatar: true,
  variant: 'outlined',
  size: 'sm'
})));

const section = document.createElement('section');
section.style.cssText = 'display:grid;gap:24px;width:100%;min-width:0';
section.append(
  await slice.build('SectionHeader', {
    align: 'center',
    eyebrow: 'Section',
    title: 'Section title',
    description: 'A short description for this section.'
  }),
  await slice.build('ElementCarrousel', {
    label: 'Quotes',
    elements: slides,
    perView: { 0: 1, 560: 2, 900: 3 },
    gap: 16,
    arrows: 'outside',
    loop: true,
    autoplay: 7000
  })
);
return section;
:::

:::script label="A leading quote" expected="one large centred quote on a soft background with a big coloured quotation mark, the author's initials, name and title under it, and a link to read more"
return await slice.build('Quote', {
  size: 'lg',
  align: 'center',
  variant: 'soft',
  text: 'An example quote that leads this section.',
  author: 'Author 1',
  jobTitle: 'Role 1',
  organization: 'Company 1',
  avatar: true,
  source: 'Read more',
  href: '/docs'
});
:::

:::script label="Quotes in a grid" expected="three soft quote cards side by side (stacking on small screens), each with stars, text of different length and the author at the bottom aligned across the row"
const grid = document.createElement('div');
grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;width:100%';
for (const quote of [
  { rating: 5, text: 'Short example quote text.', author: 'Author 1', source: 'Source 1' },
  { rating: 4, text: 'A longer example quote that shows how the text wraps and how the caption stays aligned across the row.', author: 'Author 2', source: 'Source 2' },
  { rating: 5, text: 'Another example quote.', author: 'Author 3', source: 'Source 3' }
]) {
  grid.append(await slice.build('Quote', { ...quote, variant: 'soft', size: 'sm', mark: false, avatar: true }));
}
return grid;
:::

:::script label="A quotation inside an article" expected="a paragraph of an article followed by a plain neutral quote with its author and source in the caption, and the article continuing after it"
const article = document.createElement('article');
article.style.cssText = 'display:grid;gap:16px;width:100%;max-width:640px;line-height:1.7';
const p = (text) => {
  const el = document.createElement('p');
  el.style.margin = '0';
  el.textContent = text;
  return el;
};
article.append(
  p('A paragraph of example text that introduces the quotation below.'),
  await slice.build('Quote', {
    tone: 'neutral',
    text: 'An example quotation inside an article.',
    author: 'Author 1',
    source: 'Source 1'
  }),
  p('The article continues after the quotation.')
);
return article;
:::

## Best Practices
:::tip
Keep testimonials short and specific: what changed for that person ("I used the final project in my first interview") says more than general praise.
:::

:::tip
In a carousel, show several quotes per view on wide screens (`perView: { 0: 1, 560: 2, 900: 3 }`) and keep autoplay slow; people need time to read a whole quote.
:::

## Pitfalls
:::warning
Do not put links or buttons inside the quote text. If the testimonial leads somewhere (a case study), put that link after the quote.
:::

:::related
- [Callout](/docs/display/callout) - A note from the page itself.
- [Card](/docs/layout/card) - A testimonial with a face.
- [Section header](/docs/display/section-header) - A quote as a section lede.
:::
