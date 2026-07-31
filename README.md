# Portfolio — Derrick John F. Azaola

Static site. No build step, no dependencies. Open `index.html` in a browser and it runs.

```
index.html    markup + content
styles.css    theme tokens, layout, responsive rules
script.js     theme toggle, assistant widget, nav highlight
```

## Mobile

Four breakpoints: 900px (side column drops below), 760px (links column goes full width), 640px (phone layout), 400px (single-column links, smaller type).

On phones the buttons go full-width and stack, the profile links become a 2-up grid with 44px minimum tap targets, the portrait stays a portrait crop instead of stretching into a letterbox band, and project rows reflow so the thumbnail and title share a line with the description underneath.

Also handled: `text-size-adjust` so iOS doesn't inflate type in landscape, `overflow-x: hidden` on `<html>` as a guard against sideways scroll, `overflow-wrap` on text so long repo names can't push the layout out, `theme-color` meta for the browser chrome in both themes, and `viewport-fit=cover` for notched screens.

## No navigation bar — by design

There's no sticky header. The only thing at the top is the theme toggle, and it scrolls away with the page. Visitors read top to bottom instead of jumping to one section, which is the point.

The section `id`s (`#about`, `#now`, `#work`) are still on the elements, so you can deep-link to them from outside if you ever want to.

## What still needs your input

| Where | What to swap |
|---|---|
| **`me-formal.jpg` + `me-pose.jpg`** | **Save both photos into this folder under exactly these names — see below** |
| `index.html` — `.shot` in the two Now cards | Replace with real screenshots |
| `index.html` — `.thumb` on each project | Optional: replace the monogram tiles with screenshots |
| `index.html` — `.project-desc` lines | No repo has a GitHub description, so those lines are mine — rewrite them |
| `resume.pdf` | Drop your résumé file in this folder; the button already links to it |

### The two hero photos

The hover swap is built and waiting on the files. Save them here as:

```
me-formal.jpg    straight-on portrait   → shown by default
me-pose.jpg      the one with the hand sign → fades in on hover
```

Both must be `.jpg` with those exact names. Crop them to roughly 4:5 (portrait) — the frame is 124 × 152 and uses `object-fit: cover` anchored to the top, so faces stay in frame.

Behaviour: crossfades on hover, on keyboard focus, and on tap for touch screens (tap again or tap away to go back). If either file is missing the broken-image icon is suppressed; if both are missing it falls back to the striped placeholder and turns off the interaction entirely.

Your email (`djazaola24@gmail.com`) and GitHub (`github.com/luvdrk`) are already wired throughout.

## GitHub content

**Now** holds the two active projects — the Panzi app and the Informative Panzi Website. **Things I've built** holds the finished ones:

| Section | Entry | Repo | Languages |
|---|---|---|---|
| Now | Panzi app | *(no public repo)* | React Native, Python |
| Now | Informative Panzi Website | `Informative-Pantry-Website` | TypeScript, CSS |
| Built | CarGO | `cargo-app` + `cargo-admin` | Kotlin, React/JS, TypeScript, PLpgSQL |
| Built | Registrar Queue Management System | `Website-RQMS` | PHP, CSS, JS |
| Built | Clothe Cove | `Website` | HTML, CSS |

### Design section

Sits below **Things I've built** in the main column. Covers the Cole Grphx work — six categories pulled from the Behance profile — plus the After Effects motion work, and links out to Behance, Facebook and TikTok.

Framed deliberately as personal work, not client work: *"Nobody commissions it. It's the work I make when nobody's asked me to."* If you later want commissions, change that line and add a rate or a contact nudge.

### Day/night comparison slider

The Cole Graphics signage uses a drag-to-compare slider — day on the left, night on the right.

```
design-cole-graphics.jpg        day   (clipped, sits on top)
design-cole-graphics-night.jpg  night (base layer)
```

**Both files must be identical dimensions** (currently 1200 × 676) or the two halves won't line up.

The control is a real `<input type="range">` laid invisibly over the frame, which means drag, click, tap and arrow keys all work with no custom drag maths, and screen readers announce it as a slider. `touch-action: pan-y` keeps vertical page scrolling working on phones. Double-click resets to centre.

To add another comparison anywhere on the page, copy the `.compare` block and swap the two `src` values — `script.js` wires up every `.compare` it finds automatically.

### More design work

The section currently shows one piece. Your Behance has jerseys, rosters and overlays, which are more distinctive than a logo mockup — worth adding two or three as plain `.design-figure` blocks.

Figma and Lightroom sit in a muted `stack-aside` line rather than the main tool list, since you described them as occasional. Move them up into the `<ul>` if that changes.

### Project thumbnails

Each finished project has a monogram tile tinted with its GitHub language colour — Kotlin purple, PHP indigo, HTML orange. Two inline attributes control it:

```html
<div class="thumb" data-mono="CG" style="--lang:#A97BFF" aria-hidden="true"></div>
```

To use a real screenshot instead, replace the whole `<div>` with an image — the class carries the sizing and corner radius across:

```html
<img class="thumb" src="shots/cargo.png" alt="">
```

PuzzlED is deliberately excluded. Both repos are still public on GitHub — delete or make them private there if you don't want them found.

CarGO gets the `project-lead` class: a taller thumbnail, slightly larger type, and two repo links instead of one. It sits first because it's the largest and most recent substantial work.

In **Tech stack**, an accent dot marks anything used in the projects listed above — HTML, CSS, JavaScript, TypeScript, PHP, React, Kotlin, React Native, Android Studio, Supabase, PostgreSQL, Firebase. Unmarked: Python, MySQL and the media tools. To mark a new one, add `class="ghv"` to its `<li>`.

This is a static snapshot from the GitHub API, not a live feed. When you push something new, copy an existing `<li class="project">` and edit it.

## Theme

Light/dark follows the OS by default, then remembers whatever the visitor picks (`localStorage`). The accent colour is one variable — change `--accent`, `--accent-soft` and `--accent-ink` in `styles.css` to reskin the whole site.

## The assistant

The chat widget answers from a local knowledge base in `script.js` (the `KB` array) — keyword matching against your facts, no API key, no network call, no cost. It works on GitHub Pages or any static host.

To add or reword an answer, edit an entry in `KB`:

```js
{
  k: ['keyword', 'another keyword'],   // any match counts toward the score
  a: 'The answer to give.'
}
```

The highest-scoring entry wins; if nothing matches, it falls back to pointing at your email.

If you later want a real LLM behind it, replace the `setTimeout` block inside `ask()` with a `fetch` to your own backend endpoint — keep any API key server-side, never in this file.

## Deploying to Vercel

`vercel.json` is already set up — clean URLs, security headers, and a one-year cache on images and fonts. No build step; it's a static site.

Vercel needs a browser login, which has to be done by you. From this folder:

```bash
npx vercel login     # opens your browser / emails a code
npx vercel --prod    # deploys, prints your live URL
```

First run asks a few questions — accept the defaults:

| Prompt | Answer |
|---|---|
| Set up and deploy? | **Y** |
| Which scope? | your account |
| Link to existing project? | **N** |
| Project name? | anything, e.g. `derrick-azaola` |
| In which directory is your code? | `./` |
| Modify build settings? | **N** |

Redeploy any time with `npx vercel --prod`.

**Alternative, no terminal:** zip this folder and drop it on <https://vercel.com/new> — same result.

**Heads up on git:** this folder sits inside a repository whose root is `C:\Users\Cole` — your entire home directory. Don't `git add` from here; you'd stage thousands of unrelated files. The Vercel CLI uploads the folder directly and doesn't need git at all. If you later want GitHub-connected auto-deploys, run `git init` *inside this folder* first so it gets its own repo.
