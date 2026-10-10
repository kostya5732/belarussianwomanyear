# AGENTS.md

## Architecture
Plain static site, no build step. `netlify.toml` publishes `public/`.

- Theme: 2026 — Год белорусской женщины. Hero (linen + red рушнік) → Chapter I Ефросинья (church style: year line, exhibits, cathedral map) → chapters II–V rendered from data, each in its own style (`theme-chronicle`, `theme-stage`, `theme-cosmos`, `theme-arena`).
- `public/index.html` — page shell (header, hero, Euphrosyne chapter, `#chapters` container, `#voyage` and `#descent` overlays).
- `public/data.js` — ALL content (`window.SITE`: `saint`, `timeline` (Euphrosyne events), `chapters` (themed sections with `people`), `cathedrals`). Edit text here, not in HTML. Timeline/people items: `{ y, year, name, life, role, deed, facts, text, img?, photo?, pos?, fit?, credit? }` — `photo` is a Wikipedia/Commons portrait in `public/img/people/` (`pos` = object-position, `fit: 'contain'` for stamps, `credit` = author · licence). `bond` holds the epilogue (corkboard + book pages).
- `public/main.js` — renders exhibits, year lines (`.chrono`), people cards and chapters from data; clicking a year/card opens the time-travel overlay (`#voyage`, themed via `data-theme`, counter runs from 2026 to `y`); IntersectionObserver reveals (`.reveal` → `.in`, stagger via `--i`), cursor tilt on paintings, scroll progress, active nav, canvas "candle embers".
- `public/styles.css` — design tokens in `:root` (wine/gold/parchment palette; Cormorant Garamond, Lora, Ruslan Display).
- `public/img/` — AI-generated oil-painting style PNGs (3:4). Always reference them via the Image CDN helper `img(file, w)` in main.js, never directly.

## Conventions
- Content is Russian. Each exhibit = painting on the left, info (kicker, title, subtitle, facts `[label, value]`, paragraphs) on the right; stacks on mobile.
- Animate only transform/opacity/filter/clip-path; respect `prefers-reduced-motion`.
- To add a cathedral: add an image to `public/img/` and an object to `SITE.cathedrals`.
- To add a woman: add an object to the right `SITE.chapters[].people` (keep chronological order). A new style = new `theme-*` block in styles.css plus a `.voyage[data-theme=…]` variable set.
