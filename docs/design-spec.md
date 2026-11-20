# Build spec: site rebuild (visual)

Direction: concept 3 "Schärfer". A Berlin heat raster sharpens from coarse to fine as the reader scrolls; the large case studies sit in full-width terracotta bands. Terracotta is bold in graphics and calm in the UI around them.

Follow this file literally. Where it and the prototype disagree, this file wins. Copy comes only from `copy/de/*.md` and `copy/en/*.md`, used verbatim.

## 0. Files

| Path | What |
| --- | --- |
| `design/prototype/index.html` | Home (DE), working motion. Serve the repo root statically and open `/design/prototype/index.html`. Use `?theme=dark` for dark mode and `?rm=1` for reduced motion |
| `design/prototype/routing-engine-solver.html` | Case-study page (DE) |
| `design/prototype/figures.html` | Every figure, both themes (`?theme=dark`), both languages (`?lang=en`) |
| `design/prototype/heat-raster.js` | Raster engine (hero, compare). Move to `src/scripts/heat-raster.ts` and keep the logic as is |
| `design/prototype/proto.js`, `proto.css` | Behaviour and styles as reference. Port them into components |
| `src/styles/figures.css` | Figure classes and graphic tokens (`--heat-*`, `--band-tint`, `--fig-bar`). Import after `tokens.css` |
| `src/assets/figures/<slug>/<name>.<lang>.svg`, `cover.svg` | Figures, inline only |
| `src/assets/geo/berlin.json` | Berlin outline and water as path data, with CRS, bounds and attribution |
| `src/assets/geo/heat-illustrative.{png,json}` | Hero raster (illustrative) |
| `src/assets/geo/heat-compare-illustrative.{png,json}` | Compare-slider raster (illustrative) |
| `design/tools/figures.mjs`, `design/tools/heat.mjs` | Generators for the figures. Run with `node design/tools/<x>.mjs .` |

## 1. Global rules

- Never render any text containing `[OFFEN`. Drop the item: a key figure, a list row, a sentence or a figure. Today this affects:
  - the solver's third key figure and the last sentence of its "Ergebnis";
  - the thesis "Ergebnis" bracket and Fig. 4;
  - the KPI Fig. 3 note;
  - the projects page's commented study-site row.
- Case titles contain ` · `. In headings, render the space before `·` as a no-break space (`&nbsp;·`), so a line never starts with the dot.
- Never write the name of the product or of the maintenance company. The app is "Routing Engine".
- Illustrative rasters always carry the note from `meta.md`: "Illustrativ, keine Messdaten" / "Illustrative, not measured data". Drive it from `illustrative: true` in the raster manifest, and drop the note when that flag is false.
- Numbers only from the copy files. Figures contain no other numbers.
- Language: every page exists in DE (`/…`) and EN (`/en/…`). The language link points to the same page in the other language.

## 2. Colour

Brand tokens stay as they are in `src/styles/tokens.css`. Graphic tokens live in `figures.css`, light and dark:

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--heat-lo` | `#3b3e45` graphite | `#26282e` | coolest raster value |
| `--heat-hi` | `#d4724a` | `#e08a62` | warmest raster value |
| `--heat-out` | `#e9e6e0` | `#121317` | raster cells outside Berlin |
| `--band-tint` | accent 16 % in bg (oklab) | accent 14 % | tint band, agentic cover |
| `--fig-bar` | text 22 % in bg | same formula | neutral bars |

- The heat ramp is an oklab mix from `--heat-lo` to `--heat-hi`. Canvas uses a 256-entry lookup table (`ramp()` in `heat-raster.js`). SVG uses the seven classes `.fig-h0` to `.fig-h6`.
- Accent fill: bands, focal figure element, active legend cell, compare/hero rasters. Text on accent is always `--color-on-accent`, never white, never muted.
- Small coloured text uses `--color-accent-text`. Large key figures on tint or bg use `--color-accent-text` too.
- UI chrome (nav, footer, body text, meta) has no accent except focus rings, the current-page underline and link text in work fields and entries.

## 3. Layout

- Breakpoints: base (375), `≥640` nav goes single-row and fixed, `≥768` grids and pinned hero, `≥1024` body sections with a side heading, 5-up steps and timeline, `≥1280` max container.
- `--page-pad`: 16 px (base), 24 px (≥768), 40 px (≥1280). Container `--container` 1200 px plus padding. No horizontal page scroll at any width.
- Grid: 12 columns, gap 24 px (≥768). Base is one column.
- Section rhythm: `--section-gap` (64 px, then 96 px at ≥768) top and bottom.
- Radii: controls 6 px, cards and figures 12 px, badges full. Hairlines 1 px `--color-border`. No shadows except the theme menu (`--shadow-overlay`).

## 4. Type

Geist 400/500/600, Geist Mono 500 for numbers, years and the legend.

| Role | Size | Weight | Tracking | Leading |
| --- | --- | --- | --- | --- |
| Hero name | `clamp(48px, 8.6vw, 112px)`, one line at ≥768 | 600 | −0.05em | 0.95 |
| Case title (case page) | `clamp(36px, 5.6vw, 72px)` | 600 | −0.045em | 1.02 |
| Section h2 | `clamp(32px, 4vw, 48px)` | 600 | −0.035em | 1.05 |
| Band title | `clamp(28px, 3.4vw, 44px)` | 600 | −0.035em | 1.06 |
| Entry title (compact) | `clamp(24px, 2.4vw, 30px)` | 600 | −0.025em | 1.12 |
| Key figure, band | Mono `clamp(40px, 5.4vw, 72px)` | 500 | −0.045em | 1 |
| Key figure, case page | Mono `clamp(32px, 4vw, 48px)` | 500 | −0.045em | 1 |
| Field h3 | 22 px | 600 | −0.01em | 1.25 |
| Lead | 18 px | 400 | 0 | 1.55 |
| Body / prose | 16 px (case prose 17 px) | 400 | 0 | 1.6 / 1.65 |
| Small, meta values | 14–15 px | 400 | 0 | 1.5 |
| Label (dt, captions prefix) | 12 px | 400 (`Abb. n` Mono 500) | 0.01em | 1.4 |

Sentence case everywhere. No uppercase labels. Line length ≤ 34em for leads and ≤ 720 px for prose.

## 5. Components

### 5.1 Nav
- Content (meta.md): wordmark (`aria-label` from meta), Start, Projekte, Über mich, language link ("English" / "Deutsch", `aria-label` "Sprache wechseln" / "Change language", `hreflang`, `lang`), theme control. Skip link first in the body.
- One `<nav>`, reflowed by CSS grid; do not render a second, mobile copy of the links.
- Base: static (not sticky), two rows.
  - Row 1, 56 px: wordmark left; language link and theme button right.
  - Row 2: the three links, 15 px, gap 24, 12 px bottom padding.
- ≥640: fixed, one row of 64 px. Background `--color-bg` at 72 % with 16 px blur. Links 14 px, gap 28, pushed right.
  - `main` gets `padding-top: 64px`, except the home page, where the hero runs under the nav.
- Link colour `--color-muted`, `--color-text` on hover. The current page gets text colour and a 1 px accent underline at 6 px offset.
- Theme control:
  - The button is 32 × 32 px with a 1 px border and a half-filled circle icon. Its `aria-label` is "Farbmodus wechseln" and it carries `aria-expanded`.
  - It opens a menu: surface background, 12 px radius, `--shadow-overlay`. It holds three `menuitemradio` entries: Hell / Dunkel / System. The checked entry shows a 6 px accent dot.
  - Keys: Esc closes the menu, the arrow keys move between entries, a click outside closes it.
  - Storage: `localStorage.theme` = `light | dark | system`. Light and dark set `html[data-theme]`; System removes the attribute.
  - An inline head script applies the stored value before first paint, so the page does not flash.
  - Every change dispatches `themechange` on `window`; the rasters repaint on it. This replaces the current two-state toggle.

### 5.2 Footer
- 1 px top border, padding 32/48, 14 px muted.
- Row: "© 2026 Silas Pignotti · Berlin" left, Impressum and Datenschutz links right.
- Under the row, 12 px, max 60em, on every page:
  - DE: "Landesgrenze: Geoportal Berlin, dl-de/zero-2.0; Gewässer: © OpenStreetMap-Mitwirkende, ODbL"
  - EN: "State boundary: Geoportal Berlin, dl-de/zero-2.0; water: © OpenStreetMap contributors, ODbL"
  - Both strings also sit in `berlin.json` → `attribution`. They replace the `[OFFEN]` line in `meta.md`.

### 5.3 Hero raster (home only)
Structure: `section.hero[data-hero] > .hero-pin > canvas.hero-canvas + .hero-legend + .hero-copy`.

- Content: h1 name; lead; "Projekte ansehen" button (`.btn`, text colour fill) to `#fallstudien`; text links E-Mail, LinkedIn, GitHub.
- Legend:
  - "100 m", then five 14 px glyphs subdividing a square into 1, 2, 3, 5 and 7 cells per side, then "10 m". Mono 12.
  - The glyph of the current level is filled `--color-accent`; the others are `--color-border-strong` at 45 %.
  - Under it, the note "Illustrativ, keine Messdaten" (12 px, muted).
  - The legend is `aria-hidden`; the note is not.
- Base (<768):
  - The canvas sits in flow, full width, `aspect-ratio: 1`, max 64svh. Berlin is centred and fitted at 1.12× the canvas, so it is cropped slightly.
  - The legend sits below the canvas, then the copy. Padding: 28 px top, 16 px sides.
  - There is no pin.
- ≥768:
  - `.hero` is `190svh` tall and `.hero-pin` is sticky at top 0 with height `100svh`. That gives 0.9 screen of pinned scroll.
  - Both apply only under `html.js`, which an inline head script sets. Without JS the hero is one `100svh` screen with the copy and no pin.
  - The canvas fills the pin. Berlin is fitted at 0.92×, its centre at x = 60 %, y = 53 %.
  - Copy is absolute, bottom 48 px, left at the container edge.
  - The legend is absolute, bottom 48 px, right at the container edge, right-aligned.
- Fixing c3's crude text backings ("cleared cells"):
  - Do not put a background behind the text. On every paint the engine clears the raster cells under `.hero-name`, `.hero-lead`, `.hero-actions` and `.hero-legend` (each rect plus 16 px), snapped outward to the current level's cell grid.
  - The cut-out is therefore stepped and gets finer with the raster.
  - Only at ≥768. Below that, the text is not over the canvas.
- Levels:
  - Block sizes `[10, 6, 4, 2, 1]` × base cell 4 px.
  - Hairline gaps (1 px cleared) only where the cell is ≥ 12 px.
  - Cells outside Berlin are `--heat-out`. A block counts as Berlin if ≥ 50 % of its base cells have data.
  - Berlin outline: 1 px `--color-text` at 50 %.
- Progress:
  - ≥768: `p = clamp(-rect.top / (rect.height - innerHeight) / 0.85)`. Fully sharp after 85 % of the pinned distance.
  - Base: `p = clamp(scrollY / (canvasHeight × 0.6))`.
  - Level = `min(4, floor(p × 5))`.
- Data: `heat-illustrative.json` + PNG (§9) and `berlin.json`. Sampling is nearest-cell from the data frame into the screen grid.

### 5.4 Case-study band (home, three large case studies)
Element: `article.band`, full-bleed background. Inside it, `.wrap.band-grid` holds `.band-text` (columns 1–5) and `.band-fig` (columns 7–12). Padding 56 px (base) / 96 px (≥768).

`.band-text`, in this order:
1. The title as h3 with a link to the case.
2. The summary (17 px).
3. `dl.band-role` with dt "Rolle" (12 px) and dd role (14 px).
4. The key figure `.kf`, 28 px above.
5. A "Fallstudie lesen" text link (16 px, weight 500), 28 px above.

| Case | Variant | Figure | Key figure (home.md) |
| --- | --- | --- | --- |
| Routing Engine · Planung und Solver | `band--accent`: bg `--color-accent`, all text `--color-on-accent` (no muted text, contrast), focus ring and selection in on-accent | `routing-engine-solver/cover.svg`, tours draw with scroll | label above "Im Betrieb seit", value "Oktober 2026" |
| Routing Engine · agentisch gebaut … | `band--tint band--flip`: bg `--band-tint`, figure columns 1–6, text 8–12 | `routing-engine-agentic/cover.svg`, main line draws with scroll | value "343", label below "gemergte Pull Requests"; value in `--color-accent-text` |
| Masterarbeit · Berliner Hitze auf 10 m | `band--heat`: page bg | compare slider (§5.5), full bleed under the text row | value "100 m → 10 m", right-aligned in columns 8–12 (below the text at base) |

- Base layout: one column, text first, figure after. The flip variant also shows text first.
- Figure: inline SVG, `aria-hidden` (decorative; the text carries the content), 12 px radius.

### 5.5 Compare slider (home thesis band, thesis case Fig. 3)
- Structure: two canvases stacked. The 100 m canvas below; the 10 m canvas above, clipped with `clip-path: inset(0 0 0 var(--x))`.
- The handle is a 44 px hit area with a 4 px `--color-bg` line and a 32 px grip (bg, 1 px `--color-border-strong`, 6 px radius, ‹› icon).
- Chips "100 m" (top left) and "10 m" (top right): mono 13 on bg, 6 px radius.
- Aspect: 8:3 at ≥768, 4:3 at base. Base uses the centre 160 × 120 fine cells; ≥768 uses all 320 × 120.
- 100 m side: block mean over `factor` × `factor` fine cells, with 1 device-pixel gaps. 10 m side: fine cells, no gaps.
- Under the slider, a row with the illustrative note left and "Fallstudie lesen" right (accent-text, weight 500). Padding 14 / 56 px (96 px at ≥768).
- A11y:
  - The handle is `role="slider"`, `tabindex="0"`, `aria-valuemin` 0, `aria-valuemax` 100, `aria-valuenow`.
  - `aria-label` is the first sentence of the Fig. 3 caption: "Derselbe Ausschnitt auf 100 m und auf 10 m" / "The same area at 100 m and at 10 m".
  - Arrow keys ±5, PageUp/PageDown ±20, Home/End to 0 and 100.
  - Pointer drag uses pointer capture. `touch-action: pan-y`.
- Default position: 85 %. Scroll-linked to 15 % while the box top moves from 85 % to 20 % of the viewport. The first pointer or key input stops the scroll link for good.

### 5.6 Compact entry and small row (home, after the bands)
- KPI entry:
  - `article.entry`: 1 px top border, padding 48 px (64 px at ≥768).
  - Text in columns 1–5. Title 24–30 px, summary 16 px muted, role, then "Fallstudie lesen" in accent-text.
  - Figure in columns 7–12: `kpi-reference/forecast-error.<lang>.svg` (with labels, not decorative). It replaces the "8,42 %" key figure.
- urban-tree-transfer row:
  - `.row-small`: 1 px top border, padding 24. At ≥768 its columns are `220px 64px 1fr auto`: name (600), year (mono), sentence (muted 15), "Code auf GitHub".
- Then "Alle Projekte" as a text link after a 1 px top border.

### 5.7 Work fields ("Arbeitsfelder", id `arbeitsfelder`)
- Three columns at ≥768 (gap 24), stacked at base (gap 40).
- Each field has a 2 px `--color-text` top rule, 20 px above the h3. Then the paragraph (15 px muted).
- Then a `dl` of two entries:
  - "Werkzeuge" (dt 12 px muted, dd 14 px);
  - "Beleg" (links in accent-text, comma-separated as in the copy). "Abschnitt „So arbeite ich“" links to `#so-arbeite-ich`.
- No icons, no rasters.

### 5.8 "So arbeite ich" (id `so-arbeite-ich`)
- `ol.steps`, five items. The steps are a real sequence, so they carry numbers: mono 13, accent-text.
- Each item: a raster glyph (canvas), the number, the title (19 px, 600, copy includes the full stop) and the text (15 px muted).
- Base: a 72 px glyph left and the text right. ≥1024: five columns, 96 px glyph above.
- Glyph content:
  - A fixed 16 × 16 patch of the hero raster, sampled in `berlin.json` map units: x 416–544, y 320–448. Use map units, not grid indices, so the patch still fits after a data swap.
  - Step i is shown at 2^(i−1) cells per side: 1, 2, 4, 8, 16.
  - 1 device-pixel gaps for 2 to 8 cells per side.
- Motion: see §7. The final state shows resolution increasing from step 1 to step 5.

### 5.9 Timeline ("Stationen" on home)
- `ol.tline` with five entries: year (mono 15, 500) and text (15 px muted).
- Base: vertical rail, 1 px `--color-border-strong`, 24 px left padding. Each entry has a 9 px dot (bg fill, 1 px border-strong). The last dot (2026) is filled accent.
- ≥1024: five equal columns, a horizontal rail at the top, dots 28 px above the year.
- Then "Mehr über mich" (text link, 500), 32 px above.

### 5.10 Contact (id `kontakt`)
- h2, then the sentence as a lead (muted).
- Then the three links in one row, wrapping: `clamp(24px, 3vw, 36px)`, 600, gap 12/40, underlined text links.

### 5.11 Links and buttons
- `.btn`: 44 px tall, 20 px side padding, 6 px radius, bg `--color-text`, text `--color-bg`, 15 px 500. On press, `translateY(1px)` for 80 ms. Used only for the hero main action and the 404 actions.
- Text links: underline 1 px, offset 4 px, colour currentColor at 35 %, full colour on hover (120 ms).
- Focus ring: 2 px accent, offset 3 px. On accent bands it is on-accent.

### 5.12 Case-study page
1. **Header band.**
   - Same variant as the case's home band: solver accent, agentic tint, thesis bg, KPI bg.
   - Columns 1–6, bottom-aligned:
     - "Zurück zu den Projekten" (14 px link);
     - h1 title;
     - summary (lead).
   - Columns 7–12: `cover.svg`. The solver and agentic covers draw their `.fig-draw` lines once on load (§7).
   - Padding 32/48 (base), 56/72 (≥768). Base: text, then the cover.
2. **Meta.**
   - A `dl.cs-meta` with the fields from meta.md that have values: Rolle, Zeitraum, Stand, Links.
   - Stand is a badge: round, 1 px border, mono 12, 6 px accent dot, value "live" / "laufend" / "abgeschlossen". Links are rendered only if the list is not empty.
   - Columns `2fr 1fr 1fr` at ≥768. 1 px bottom border.
3. **Key figures.** "Kennzahlen" as a `dl` row: label above (12 px muted), value below (mono, §4). Gap 24/64, wrapping. Skip `[OFFEN]` items.
4. **Body.**
   - Sections Problem, Vorgehen, System, Ergebnis, Grenzen.
   - ≥1024: h2 (22 px) in columns 1–3, sticky at nav + 24 px. Prose in columns 4–10. Figures in columns 4–12.
   - Base: one column, 48 px between sections.
   - Bold lead-ins (`**…**`) render as `<strong>` 600.
   - Every grid child gets `min-width: 0`, so wide figures scroll inside their box.
5. **Figure.**
   - `figure.fig > .fig-art + figcaption`. The figure is inlined from the SVG file (reuse `Figure.astro` from `origin/content-structure`: it suffixes ids per instance).
   - Caption: "Abb. n" (mono 12, 500, text colour, 8 px gap), then the caption text (14 px muted).
   - Figures appear in number order; place each after the paragraph it belongs to. Solver: Fig. 1 after the first Vorgehen paragraph, Fig. 2 after "Der Monat ist die Planungseinheit.", Fig. 3 in Ergebnis.
   - A figure whose file does not exist (screenshots not yet made) is omitted entirely in production.
6. **Next.**
   - 1 px top border, padding 48.
   - Label "Nächste Fallstudie" (12 px muted), the next case title as a 28–44 px link (no underline; 2 px accent underline on hover), then "Alle Projekte".
   - Order: solver → agentic → thesis → KPI → solver.

## 6. Pages

| Page | 375 | 768 | 1280 |
| --- | --- | --- | --- |
| **Home** | Nav 2 rows; hero canvas square + legend + copy; section "Fallstudien" (h2 + intro, 40 px bottom); bands stacked; KPI entry; tree row; fields stacked; steps list; vertical timeline; contact | Pinned hero (190svh); bands 5/7 split; fields 3-up; steps still a list | Same as 768 with 1200 container; steps and timeline 5-up |
| **Projects** (`/projekte`) | h1 "Projekte" + intro (lead); list of four case cards, one column; h2 "Weitere Arbeiten" + small rows | Cards in 2 columns, gap 24 | Same, container 1200 |
| **Case study** | §5.12, one column; figures scroll sideways inside their box | Header 6/6; meta 3 columns | Sticky side headings |
| **About** (`/ueber-mich`) | h1, intro (lead, ≤ 34em); sections Stationen, Ausbildung, Sprachen as lists; link "Arbeitsfelder ansehen" | List rows as 2 columns: period (mono, 160 px) and content | Same, content max 720 px |
| **404** | h1 "Seite nicht gefunden", text, two buttons ("Zur Startseite" `.btn`, "Projekte ansehen" outline variant: 1 px border, no fill), padding top 96 | Same | Same, left-aligned in the container |
| **Impressum, Datenschutz** | Text page: h1 + prose column 720 px, h2 22 px; no graphics | Same | Same |

- Project card (projects page): `cover.svg` (16:9, 12 px radius, 1 px border, `aria-hidden`), then the title (h2, 22 px, 600), the summary (15 px muted) and the status line in mono 12 as in the projects.md comment ("2026 · live"). The whole card is one link; the title gets the underline on hover. No shadow, no lift.
- The thesis cover is cut from the illustrative raster. While `illustrative` is true, its card shows the illustrative note (12 px muted) directly under the cover.
- About list row: year range in mono; title with `**…**`, then the org; description in muted. Thesis titles in italics as in the copy. No portrait (open in the copy).

## 7. Motion

Allowed: scroll-linked effects, raster sharpening, line drawing. Not allowed: scroll hijacking, endless loops, idle animation.

| What | Trigger | Mapping / duration | Easing | Reduced motion |
| --- | --- | --- | --- | --- |
| Hero level | scroll (§5.3 progress) | each level change sweeps the new level in, top to bottom, cell row by cell row, 360 ms | ease-out cubic | level 4 at once; hero not pinned (`height: auto`) |
| Hero first paint | data loaded | sweep of the current level, 900 ms | ease-out cubic | none |
| Band figure lines (`.fig-draw` in `[data-draw]`) | scroll: container top from 90 % to 40 % of viewport | `--draw` = 1 − progress (stroke-dashoffset on `pathLength="1"` paths) | linear (scroll) | fully drawn |
| Case header cover lines | page load | 1200 ms, delays 200 ms and 500 ms | `--ease-enter` | fully drawn |
| Compare handle | scroll until first input (§5.5) | 85 % → 15 % | linear (scroll) | static at 50 % |
| Step glyphs | scroll: list top from 85 % to 45 % | level 0–5, glyph i shows `2^min(i, level−1)` cells; repaint only on change | step | final state |
| Timeline rail | scroll: list top from 90 % to 50 % | `scaleX` (`scaleY` at base) 0 → 1 | linear | full |
| Link underline, theme menu item | hover / focus | 120 ms colour | `--ease-standard` | none |

- One passive scroll listener, throttled to one `requestAnimationFrame`. An `IntersectionObserver` (rootMargin 20 %) keeps the set of in-view items; only those update.
- When an item enters view, call its update once, so anchor jumps and reloads mid-page show the right state.
- `prefers-reduced-motion: reduce` and the `.rm` class: all of the above in their end state, transitions off.
- No JS (no `html.js`):
  - the hero is one screen with the copy and no pin;
  - the figures are fully drawn (`--draw` defaults to 0);
  - the compare slider is not shown. Render it only after its data has loaded; the static `resolution-compare.<lang>.svg` is the fallback.

## 8. Figures

- Files are inline SVG with `class="figure-svg"` (plus `fig-wide` for diagrams 840 wide), with `width`/`height` attributes and a `viewBox`.
  - Never `<img>`: the figures take their colours from page tokens.
  - No `<style>`, no hex, no `style=`.
  - `title`/`desc` ids are `fig-<case>-<name>-t/-d`; `Figure.astro` suffixes them per instance.
- CSS: `.figure-svg { max-width: 100%; height: auto }`.
  - Below 640 px, `.fig-wide` gets `min-width: 600px` inside `.fig-art { overflow-x: auto }`, so text stays ≥ 10 px.
  - Charts (480 and 560 wide) scale down instead.
- Style:
  - Boxes: 6 px radius, 1.5 px `--color-border-strong`, surface fill.
  - One focal element per figure, filled accent with on-accent text 600.
  - Arrows are drawn as paths, no markers.
  - Labels 14 px; small labels 12 px; numbers in Geist Mono.

| Case | File | Notes |
| --- | --- | --- |
| routing-engine-solver | `architecture.{de,en}.svg` | Fig. 1, focus "Prüfung durch das Büro"; bracket "austauschbare Schnittstellen" joins Geocoding and Solver |
| | `method.{de,en}.svg` | Fig. 2, four boxes with pictograms, focus "Tag und Fahrzeug" |
| | `cover.svg` | accent bg, two schematic tours plus one dashed, on a plain grid (no real places) |
| routing-engine-agentic | `process.{de,en}.svg` | Fig. 1, focus "Checks und Review" with three sub-checks; dashed branch "wartet auf Freigabe" into Merge |
| | `prs-per-month.{de,en}.svg` | Fig. 2, bars 7 / 64 / 88 / 184, October accent, "bis 19.11." under November |
| | `cover.svg` | tint bg, three lanes through one gate into one accent line |
| berlin-lst-downscaling | `data-flow.{de,en}.svg` | Fig. 1, focus the feature stack (layered) |
| | `ablation-stages.{de,en}.svg` | Fig. 2, no result numbers. The accent marks stage 1 (the spectral baseline) because the copy has no approved stage-1 result. Add the result row when the values are released |
| | `resolution-compare.{de,en}.svg` | Fig. 3 static version and no-JS fallback; generated by `heat.mjs`. On the case page Fig. 3 is the compare slider (§5.5) with this caption |
| | `cover.svg` | generated; coarse left half, fine right half |
| kpi-reference | `process.{de,en}.svg` | Fig. 1, focus "Referenzimplementierung" |
| | `forecast-model.{de,en}.svg` | Fig. 2, no values |
| | `forecast-error.{de,en}.svg` | Fig. 3, two bars only (20,12 % and 8,42 %), chosen model accent |
| | `cover.svg` | the same two bars to scale, wordless |

- Not drawn: solver Fig. 3 (screenshot), thesis Fig. 4 (`[OFFEN]`).
- Captions and figure numbers come from the copy's "Abbildungen" lists. Alt text is the SVG `title` + `desc` (pattern from meta.md).
- Covers are 1600 × 900 (16:9), wordless, `aria-hidden`, one file for both languages.
- OG images for case pages: render the cover to PNG at 1200 × 675 with the light theme resolved, then crop 22–23 px from the top and the bottom to 1200 × 630.
  - Resolving the light theme means replacing every class with a fill or stroke of precomputed hex values.
    - Injecting the CSS is not enough: `var()` does not resolve in a bare SVG, and SVG rasterisers such as resvg and sharp do not support `color-mix()`, which the `.fig-h1`–`.fig-h5` classes, `--band-tint` and `--fig-bar` use.
    - Compute the mixes once in the OG build script.
  - The thesis OG image adds the illustrative note bottom-left (Geist 24 px, `#151922` on a `#F7F7F5` chip) while `illustrative` is true.
  - Covers keep content out of the outer 40 px vertically.
  - Other pages keep `public/ogImage.svg`.
- `heat-raster.js` reads `--heat-lo`, `--heat-hi` and `--heat-out` as 6-digit hex. Keep those three plain hex wherever they move.

## 9. Data

- `berlin.json` contains:
  - `outline` and `water` (SVG path data);
  - the frame `w` × `h` (1000 × 824.2);
  - `crs` EPSG:25833 and `bounds`, with the transform from metres to frame units in `about`;
  - `attribution` (de, en).
- Raster manifest (`heat-*.json`):

```json
{ "illustrative": true, "image": "heat-illustrative.png", "grid": [250, 207], "frame": [0, 0, 1000, 828],
  "frameUnits": "berlin.json map units", "range": [0, 1], "unit": "relative", "factor": 10 }
```

- Image: an 8-bit grayscale PNG, row-major, top = north. 0 = no data. 1–255 map linearly to `range`. `factor` exists only on the compare manifest.
- Load the image with `createImageBitmap(blob, { colorSpaceConversion: 'none' })` so the values survive colour management.
- Import the PNG and the JSON with `?url` so Vite hashes them. Load on the client only on pages that use them (home; thesis case page).
- Swapping in the thesis result:
  1. Write new PNGs and manifests in the same format (hero: Berlin at about 45 m per cell in the `berlin.json` frame; compare: a 10 m crop with `factor: 10`).
  2. Set `illustrative: false`.
  3. Run `node design/tools/heat.mjs . --from-png` to regenerate `resolution-compare.*.svg` and the thesis `cover.svg`.
  4. Re-pick the Fig. 3 window (`i0`, `j0` in the script). The illustrative note then disappears everywhere.

## 10. Performance

- Canvas backing store ≤ 4 MP (`width × height × dpr²`). DPR is capped at 2 and lowered in 0.25 steps until the store fits.
- The hero keeps one off-screen buffer and one small image per level (cached until rebuild).
  - Rebuild on width change, on a height change of more than 120 px at ≥768 (never on mobile URL-bar resizes), and on `themechange`.
  - Debounce 150 ms.
- No `requestAnimationFrame` while idle: rAF only runs during a sweep, and only while scroll events arrive.
- Payload on home: `berlin.json` 16 KB, hero PNG 24 KB, compare PNG 35 KB, covers about 2–8 KB inline.
  - Start loading after first paint.
  - The hero h1 and copy render without the raster. The canvas paints when its data arrives.
- Steps glyphs: five small canvases, repainted only when their level changes.

## 11. Open strings and conflicts

- Missing strings (copywriter): `aria-label` for the main nav landmark ("Hauptnavigation" / "Main navigation") and for the footer legal nav ("Rechtliches" / "Legal"). The case-page "next" block is labelled by its visible "Nächste Fallstudie" via `aria-labelledby` and needs no new string.
- Company names: `copy/*/about.md` names the maintenance company and the plastics sorting company, while the case studies keep both anonymous. Naming the sorting company next to the KPI case also identifies it. Copy is verbatim, so the builder renders `about.md` as written until the copywriter or Silas decides. §1's naming rule applies to everything the builder writes itself: ids, alt text, comments, figures.
- `meta.md` footer line "Bezirksgrenzen: [OFFEN]" is superseded by the Landesgrenze/OSM attribution above. The outline is the state boundary, not districts.
- Theme control: three options per meta.md. The current `SiteNav.astro` toggle is two-state and must be replaced.
- Repo `AGENTS.md` says "No i18n", while this rebuild is bilingual. Update `AGENTS.md` with the rebuild.
