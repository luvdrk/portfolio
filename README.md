# Portfolio — Derrick John F. Azaola

**Live: https://portfolio-cole-c2dc.vercel.app**

Personal portfolio for a third-year BS Information Technology student at PHINMA
University of Pangasinan, on the System Development track.

Hand-written HTML, CSS and JavaScript. No framework, no bundler, no
dependencies — `index.html` opens in a browser and runs.

```
index.html      markup and content
styles.css      design tokens, layout, motion
script.js       theme toggle, nav highlight, screenshot viewer, assistant
shots/          project screenshots
vercel.json     clean URLs, security headers, cache policy
```

## Running it

Any static server works. With Python:

```bash
python -m http.server 5173
```

Then open <http://localhost:5173>. Opening `index.html` directly from disk also
works; only the theme and boot-intro persistence need an origin.

## What's in it

**Theme** — light and dark, following the OS by default and remembering the
visitor's choice in `localStorage`. Switching uses the View Transitions API to
cross-fade the whole page rather than flipping colours instantly. The palette is
four custom properties: change `--accent`, `--accent-soft` and `--accent-ink` in
`styles.css` to reskin the site.

**Screenshot viewer** — project screenshots open in a native `<dialog>` with
arrow-key navigation between shots in the same project. The browser supplies the
backdrop, focus trap and Escape handling, so none of that is reimplemented. The
thumbnails stay real links, meaning ctrl-click and middle-click still open the
file directly and the page degrades cleanly without JavaScript.

**Motion** — a launch curtain on first arrival, a staggered hero intro, and
sections that rise as they scroll into view. Everything is built so failure is
safe: the curtain clears via a CSS animation rather than JavaScript, and reveal
classes are applied *by* script rather than sitting in the markup, so a failed
script load leaves a finished page rather than a blank one.

**Assistant** — the chat widget answers from a keyword-matched knowledge base in
`script.js` (the `KB` array). No API key, no network call, no cost. Add an entry:

```js
{
  k: ['keyword', 'another keyword'],   // any match adds to the score
  a: 'The answer to give.'
}
```

Highest score wins; with no match it points at the email address.

**Comparison slider** — the Design section uses a drag-to-compare figure built on
a real `<input type="range">` laid invisibly over the frame, so dragging,
clicking, tapping and arrow keys all work and screen readers announce it as a
slider. Both images must share identical dimensions. `script.js` wires up every
`.compare` block it finds.

## Accessibility

`prefers-reduced-motion` is honoured throughout — animations are removed, and
the two elements that would otherwise be stranded mid-animation (the launch
curtain and the scroll reveals) are explicitly reset rather than left frozen.
The theme cross-fade survives, shortened, since nothing in it travels or scales.

Interactive elements are real buttons and links, the viewer is a `<dialog>`, and
there's a skip link ahead of the nav.

## Responsive

Breakpoints at 900px (side column drops below), 760px, 640px (phone layout) and
400px. On phones buttons stack full-width, profile links become a 2-up grid with
44px tap targets, and the screenshot strips scroll horizontally.

Also handled: `text-size-adjust` so iOS doesn't inflate type in landscape,
`overflow-wrap` so long repo names can't push the layout sideways, `theme-color`
for browser chrome in both themes, and `viewport-fit=cover` for notched screens.

## Deploying

Hosted on Vercel from this repository's root. There is no build step — the files
at the root are the site.

```bash
npx vercel --prod
```

`.vercelignore` keeps `package.json` out of the upload deliberately: its build
script shells out to PowerShell, and Vercel's builders run Linux, so leaving it
in makes Vercel detect a framework and fail.

Asset URLs carry a `?v=` query string. Bump it in `index.html` whenever
`styles.css` or `script.js` changes, or returning visitors keep the cached copy.

## Projects featured

| Project | Repository | Stack |
|---|---|---|
| Panzi — AI smart pantry | [Informative-Pantry-Website](https://github.com/luvdrk/Informative-Pantry-Website) | React Native, Python, Vision API, TypeScript |
| CarGO — ride-hailing & parcels | [cargo-app](https://github.com/luvdrk/cargo-app) · [cargo-admin](https://github.com/luvdrk/cargo-admin) | Kotlin, React, Supabase, Firebase |
| Registrar Queue Management System | [Website-RQMS](https://github.com/luvdrk/Website-RQMS) | PHP, JavaScript, MySQL |
| Clothe Cove — brand storefront | [Website](https://github.com/luvdrk/Website) | HTML, CSS |

## Licence

Code is free to learn from. The photographs, résumé, project screenshots and
design work are not — please don't reuse those.
