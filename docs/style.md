# Style profile

Visual language for graphics, figures, covers, OG images and motion on silaspignotti.dev. Values follow Personal Brand Guide v1.1 (06.11.2026) and `src/styles/tokens.css`. Build details live in `docs/design-spec.md`.

## Art style

Technically sober UI, bold graphics. Quiet whitespace, hairlines and flat surfaces carry the interface. Terracotta is used boldly inside graphics: full-width case-study bands, heat rasters, routes and tonal scales. Content is the image: real data, numbers, diagrams of how the work runs.

- Do: flat vector, 1 px hairlines in the UI, one focal element per figure, Geist, terracotta fills in graphics.
- Don't: gradient heroes, glass-card walls, stock photos, 3D shapes, device mockups, endless loops, a second accent colour.

## Color

| Role | Light | Dark |
| --- | --- | --- |
| Background | #F7F7F5 | #0B0C0F |
| Surface | #FFFFFF | #151514 |
| Surface 2 | #F0EEEA | #1D1C1A |
| Text | #151922 | #EEECE8 |
| Muted | #625D57 | #A39D95 |
| Border | #E5E2DC | #2A2825 |
| Accent | #D4724A | #E08A62 |
| Accent text | #9E4D29 | #E08A62 |
| On accent | #151922 | #0B0C0F |

Graphic tokens (`src/styles/figures.css`): heat ramp graphite `--heat-lo` to terracotta `--heat-hi`, mixed in oklab; `--heat-out` outside the study area; `--band-tint` is the accent at 16 % in the background.

Accent is for a fill, a focus ring, large type, or a graphic. Small coloured type uses accent text. Text on an accent fill is on-accent, never white and never muted. Do not use #E8590C.

## Type

Geist for UI and text. Geist Mono for code, numbers, years and raster labels. Weights 400 and 600. 500 only for labels and mono figures. Self-hosted, no CDN.

## Shape

- Controls: 6 px radius.
- Cards and images: 12 px radius, 1 px border, no shadow.
- Badges: fully round.
- Glass only on the navigation: 16 px blur, surface at 72% opacity.
- One overlay shadow: `0 8px 32px rgb(0 0 0 / .12)`, for menus only.

## Motion

- Scroll-linked effects are allowed: raster sharpening (coarse to fine), line drawing, a compare handle that follows the scroll until touched.
- One short orchestrated moment on load is fine (hero first paint, a cover drawing its route).
- No scroll hijacking, no endless loops, no idle animation. Pinned sections hold for at most about one screen.
- `prefers-reduced-motion`: every effect shows its end state.

## Figures

- Inline SVG in `src/assets/figures/<case>/<name>.<lang>.svg`; covers as `cover.svg` (wordless, one file).
- No `<style>`, hex colours or `style` attributes inside SVGs. Use `fig-` classes from `src/styles/figures.css`, so light and dark come from one file. Unique, prefixed ids.
- One focal element, filled accent with on-accent text. Everything else in graphite lines on surface.
- Rasters use the seven heat classes `.fig-h0` to `.fig-h6`.
- Illustrative data always carries the note "Illustrativ, keine Messdaten" / "Illustrative, not measured data". Numbers only from the copy.

## Branding

Wordmark is the name, Silas Pignotti. Favicon is an S in Geist SemiBold. No globe, no SP monogram.

## Formats

| Asset | Ratio / size | Notes |
| --- | --- | --- |
| Project cover | 16:9, 1600×900 SVG | Drawn graphic in the case's colour (band, tint or raster), wordless |
| Figure | 840 wide (diagrams), 480–560 (charts) | Inline SVG, classes only |
| OG image | 1200×630 | Case pages: cover rendered in light theme, cropped from 1200×675. Other pages: off-white, graphite name, one terracotta mark |
| Favicon | SVG | S in Geist SemiBold |

## Master prompt

```text
Editorial graphic for a personal site about geodata, data analysis and automation. Off-white #F7F7F5 or near-black #0B0C0F, graphite #3B3E45, terracotta #D4724A used boldly as a fill, hairline lines, 6–12 px corners, no shadow, no gradient wash, no glass, no 3D, no stock people. Square raster cells and route lines as motifs. Geist-style sans, Geist Mono for numbers. Flat, precise, one focal element.
```
