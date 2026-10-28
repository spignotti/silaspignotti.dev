# Style profile

Visual language for graphics, icons, covers, OG images, and other visual assets on silaspignotti.dev. Values follow the live codebase: `src/styles/global.css`, `src/styles/typography.css`, `src/layouts/Layout.astro`, and the components in `src/components/`.

## Art style

Premium minimal editorial. Clean geometric forms with soft edges. No illustration, no cartoon, no isometric. High-end design portfolio meets technical documentation. Closest references: Linear marketing pages, Vercel's visual identity, Stripe's editorial graphics.

- Do: flat or near-flat vector, subtle glassmorphism, layered translucent panels, restrained line art.
- Don't: 3D renders, glossy surfaces, cartoon illustrations, noisy isometric scenes, busy geometric overload.

## Color palette

### Dark mode (preferred for graphics)

| Role | Description | Prompt term |
| --- | --- | --- |
| Background | Deep charcoal, near-black (#121212) | "deep charcoal background" |
| Foreground | Near-white, ivory | "ivory text", "near-white" |
| Card | Dark gray surface, subtle elevation | "dark gray card surface" |
| Primary | Warm light gold, champagne | "muted gold accent", "champagne" |
| Secondary | Muted warm olive-gray | "warm olive-gray" |
| Muted | Dark gray | "muted dark gray" |
| Border | Subtle dark neutral line | "subtle dark border" |

### Light mode (alternative)

| Role | Description | Prompt term |
| --- | --- | --- |
| Background | Very light off-white | "warm off-white background" |
| Foreground | Dark neutral charcoal | "charcoal text" |
| Card | Nearly white | "near-white card" |
| Primary | Warm muted ochre, brown-gold | "muted ochre accent" |
| Secondary | Pale sand, mustard tint | "pale sand", "pale mustard" |
| Muted | Soft light gray | "soft gray" |
| Border | Subtle pale gray | "subtle pale border" |

### Palette direction

- Use: ivory, warm white, charcoal, soft gray, muted gold, sand, pale mustard, very restrained accents.
- Avoid: loud blues, purple gradients, neon tech palettes, oversaturated branding colors.

## Line style

No outlines or very thin strokes. Shapes are defined by surface contrast and subtle borders, not by drawn lines. When line art is needed (for example icons), use thin, consistent-weight strokes in the primary accent color (muted gold or ochre).

## Shading

Flat with very subtle depth. Soft shadows only (low contrast, no hard drop shadows). Faint glassmorphism on card surfaces: translucent panels with backdrop blur. No cel-shading, no heavy gradients.

## Mood and tone

Editorial, calm, intelligent, polished. Quiet luxury for a technical personal brand. Competence and precision without being cold or corporate: the visual equivalent of a well-organized GitHub repo.

- Keywords: factual, confident, modern, understated, professional.
- Domain signals: geospatial analysis, AI systems, mapping, automation, data pipelines, clarity.
- Don't signal: gaming, startup hype, enterprise dashboard, social media influencer.

## Formats

| Asset | Ratio / size | Notes |
| --- | --- | --- |
| Project cover / card | 16:9 (or 3:2) | Portfolio grid and project detail hero |
| OG / social image | 1200x630 (1.91:1) | Dark editorial poster style |
| Project icon | 1:1 | Geometric symbol on dark card background |
| Blog header | 16:9 | Atmospheric, topic-suggestive |

Defaults: 16:9 for covers, 1:1 for icons, 1.91:1 for OG images.

## Background

- Dark mode: deep charcoal (#121212) with an optional subtle radial glow in warm primary or secondary tones.
- Light mode: warm off-white with very faint atmospheric haze.
- Both can include minimal grain, soft blur, and layered translucent panels.

## Typography in graphics

- Headlines: bold, compact, confident, large scale. ClashDisplay-style geometric sans-serif with tight tracking. For project names, section labels, hero text.
- Body and labels: clean, calm, highly readable. Lexend-style modern sans-serif. For supporting text, metadata, captions, tag chips.
- Monospace: Geist Mono-style. For code snippets, terminal references, technical labels.

## Shape language

- Rounded corners everywhere (`rounded-xl` to `rounded-3xl` feel).
- Pill-shaped labels and buttons (`rounded-full`).
- Large rounded panels and cards.
- Soft component geometry. No sharp, aggressive edges.

## Component patterns

- Cards: border plus soft surface contrast, lightly translucent, clean internal spacing.
- Tags / pills: rounded-full, small, muted color fill or outline.
- Buttons: pill style, primary filled or outline variant.
- Glow effects: soft blurred radial glows in warm tones, never harsh.

## Branding

- Logo: "SP" monogram in a rounded square outline. Monochrome. Can be placed subtly in graphics.
- Brand feel: monochrome, minimal, shape-led, recognizable, not decorative.

## Master prompt

```text
Create a high-end editorial graphic for a personal portfolio website focused on data, AI, automation, and geospatial work. The visual style should feel premium, minimal, intelligent, and technically precise, with a calm and modern design language. Use an understated palette of ivory, off-white, charcoal, soft grays, and muted warm ochre/gold accents with occasional sand or pale mustard tones. Incorporate rounded card-like forms, pill labels, subtle borders, soft shadows, translucent surfaces, and faint glassmorphism. Typography should feel like bold Clash Display for headlines paired with clean Lexend-style sans serif for body or supporting text. Add very subtle radial glow, blur, and a touch of grain or texture. The mood should suggest geospatial analysis, AI systems, mapping, automation, and clarity without relying on cliche tech visuals. Keep it polished, restrained, and presentation-ready for recruiters, clients, and technical collaborators.
```

## Short prompt (append to a specific prompt)

```text
Premium minimal editorial tech graphic, warm neutral palette, ivory and charcoal, muted ochre accent, rounded glass-like cards, pill labels, bold display typography, clean sans body text, subtle radial glow, slight grain, intelligent geospatial AI aesthetic, understated and high-end.
```

## Anti-patterns (never use)

- Cyberpunk neon
- Purple/blue startup gradients
- Generic SaaS hero art
- Cartoon illustrations
- Noisy isometric scenes
- Glossy fake-3D shapes
- Overly playful startup visuals
- Loud enterprise dashboard style
- High-saturation abstract blobs
- Gaming aesthetic
