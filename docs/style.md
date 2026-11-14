# Style profile

Visual language for graphics, icons, covers, OG images, and other visual assets on silaspignotti.dev. Values follow Personal Brand Guide v1.1 (06.11.2026) and `src/styles/tokens.css`.

## Art style

Technically sober. Quiet whitespace, hairlines, flat surfaces, one terracotta accent. Content is the image: real screenshots, numbers, code. References: Apple, Linear, Vercel, Cursor.

- Do: flat vector, 1 px hairlines, real product screenshots, Geist, one accent.
- Don't: gradient heroes, glass-card walls, stock photos, 3D shapes, device mockups, looping motion, a second accent color.

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

Accent is for a fill, a focus ring, or large type. Small colored type uses accent text. Text on an accent fill is on-accent, never white. Do not use #E8590C.

## Type

Geist for UI and text. Geist Mono for code and numbers. Weights 400 and 600. 500 only for labels and mono figures. Self-hosted, no CDN.

## Shape

- Controls: 6 px radius.
- Cards and images: 12 px radius, 1 px border, no shadow.
- Badges: fully round.
- Glass only on the navigation: 16 px blur, surface at 72% opacity.
- One overlay shadow: `0 8px 32px rgb(0 0 0 / .12)`.

## Branding

Wordmark is the name, Silas Pignotti. Favicon is an S in Geist SemiBold. No globe, no SP monogram.

## Formats

| Asset | Ratio / size | Notes |
| --- | --- | --- |
| Project cover | 16:9 | Real screenshot on surface, 12 px radius, 1 px border |
| OG image | 1200×630 | Off-white, graphite type, one terracotta mark |
| Favicon | SVG | S in Geist SemiBold |

## Master prompt

```text
Quiet editorial graphic for a personal site about data, geospatial work, automation, and applied software. Off-white #F7F7F5 or near-black #0B0C0F, graphite text, one terracotta accent #D4724A, hairline borders, 12 px corners, no shadow, no gradient, no glass cards, no 3D, no stock people. Geist-style sans for the name, Geist Mono for any numbers. Flat, precise, and sparse.
```
