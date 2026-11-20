// Heat rasters and the raster SVG figures (thesis Fig. 3 and the thesis cover).
// Usage:
//   node scripts/heat.mjs .              write the illustrative PNGs + manifests, then the SVGs
//   node scripts/heat.mjs . --from-png   keep the PNGs as they are (e.g. the real thesis result) and
//                                        only regenerate resolution-compare.*.svg and cover.svg from them
// Manifests: src/assets/geo/heat-illustrative.json and heat-compare-illustrative.json (see docs/design-spec.md).
import fs from 'node:fs'
import zlib from 'node:zlib'
import path from 'node:path'

const ROOT = process.argv[2]
const FROM_PNG = process.argv.includes('--from-png')
const GEO = (f) => path.join(ROOT, 'src/assets/geo', f)
// minimal PNG reader: 8-bit grayscale, all five row filters
function readGray(file) {
  const b = fs.readFileSync(file); let o = 8, w, h, idat = []
  while (o < b.length) { const l = b.readUInt32BE(o), t = b.toString('ascii', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + l)
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); if (d[8] !== 8 || d[9] !== 0) throw new Error(file + ': expected 8-bit grayscale') }
    if (t === 'IDAT') idat.push(d); o += 12 + l }
  const raw = zlib.inflateSync(Buffer.concat(idat)), out = new Uint8Array(w * h)
  for (let j = 0; j < h; j++) { const f = raw[j * (w + 1)]
    for (let i = 0; i < w; i++) { const x = raw[j * (w + 1) + 1 + i], a = i ? out[j * w + i - 1] : 0, up = j ? out[(j - 1) * w + i] : 0, c = i && j ? out[(j - 1) * w + i - 1] : 0
      const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c)
      out[j * w + i] = (x + [0, a, up, (a + up) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? up : c][f]) & 255 } }
  return { w, h, v: out }
}
const B = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/assets/geo/berlin.json'), 'utf8'))

// ---- polygons ----
const rings = (d) => d.split('Z').filter(Boolean).map((s) => s.replace('M', '').split('L').map((p) => p.trim().split(/\s+/).map(Number)))
const OUT = rings(B.outline), WAT = rings(B.water)
function inRings(R, x, y) {
  let inside = false
  for (const r of R) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// ---- illustrative field (no measured data) ----
const hash = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295 }
function vnoise(x, y) { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), w = fy * fy * (3 - 2 * fy)
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1); return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w }
const g = (x, y, cx, cy, sx, sy) => Math.exp(-(((x - cx) ** 2) / sx + ((y - cy) ** 2) / sy))
function field(mx, my, res = 4) {
  let v = g(mx, my, 480, 380, 52000, 36000) * 0.75
  v += 0.12 * Math.sin(mx / 23) * Math.cos(my / 31) + 0.3 * (vnoise(mx / 14, my / 14) - 0.5) + 0.22 * (vnoise(mx / 4.5 + 40, my / 4.5) - 0.5)
  v -= 0.35 * g(mx, my, 430, 385, 900, 500) // a large park west of the centre
  v -= 0.45 * g(mx, my, 230, 520, 9000, 16000) // forest in the south-west
  v += 0.25 + (hash(Math.floor(mx / res), Math.floor(my / res)) - 0.5) * 0.18
  if (res < 2) v += 0.16 * (vnoise(mx / 1.6 + 7, my / 1.6) - 0.5)
  if (inRings(WAT, mx, my)) v -= 0.6
  return Math.max(0, Math.min(1, v))
}

// ---- hero grid: 250 x 207 cells of 4 map units ----
const HM = FROM_PNG ? JSON.parse(fs.readFileSync(GEO('heat-illustrative.json'), 'utf8')) : null
const CELL = FROM_PNG ? (HM.frame[2] - HM.frame[0]) / HM.grid[0] : 4, GW = FROM_PNG ? HM.grid[0] : Math.ceil(B.w / CELL), GH = FROM_PNG ? HM.grid[1] : Math.ceil(B.h / CELL)
const grid = FROM_PNG ? readGray(GEO(HM.image)).v : new Uint8Array(GW * GH)
if (!FROM_PNG) for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
  const mx = (i + 0.5) * CELL, my = (j + 0.5) * CELL
  grid[j * GW + i] = inRings(OUT, mx, my) ? 1 + Math.round(field(mx, my) * 254) : 0
}

// ---- PNG (8-bit grayscale, no colour chunks) ----
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcT[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
const chunk = (type, data) => { const t = Buffer.from(type), l = Buffer.alloc(4), c = Buffer.alloc(4); l.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([l, t, data, c]) }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(GW, 0); ihdr.writeUInt32BE(GH, 4); ihdr[8] = 8; ihdr[9] = 0
const raw = Buffer.alloc((GW + 1) * GH); for (let j = 0; j < GH; j++) { raw[j * (GW + 1)] = 0; Buffer.from(grid.subarray(j * GW, (j + 1) * GW)).copy(raw, j * (GW + 1) + 1) }
const png = FROM_PNG ? null : Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
if (!FROM_PNG) fs.writeFileSync(path.join(ROOT, 'src/assets/geo/heat-illustrative.png'), png)
if (!FROM_PNG) fs.writeFileSync(path.join(ROOT, 'src/assets/geo/heat-illustrative.json'), JSON.stringify({
  illustrative: true,
  about: 'Illustrative surface-temperature raster for the hero and the thesis figures. Not measured data. Replace with the thesis result in the same format and set illustrative to false.',
  image: 'heat-illustrative.png',
  encoding: '8-bit grayscale PNG, row-major, top row = north. 0 = no data (outside Berlin). 1..255 map linearly to range[0]..range[1].',
  grid: [GW, GH],
  frame: [0, 0, GW * CELL, GH * CELL],
  frameUnits: 'berlin.json map units (same frame as outline and water)',
  range: [0, 1],
  unit: 'relative (0 = coolest, 1 = hottest)'
}, null, 2) + '\n')

// ---- raster SVG helpers ----
const sample = (mx, my) => { const i = Math.min(GW - 1, Math.max(0, Math.floor(mx / CELL))), j = Math.min(GH - 1, Math.max(0, Math.floor(my / CELL))); const v = grid[j * GW + i]; return v ? (v - 1) / 254 : null }
function fineGrid(x0, y0, w, h, cols, rows) {
  const out = []; const cw = w / cols, ch = h / rows
  for (let j = 0; j < rows; j++) { const r = []; for (let i = 0; i < cols; i++) {
    let s = 0, n = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { const v = sample(x0 + (i + (a + 0.5) / 3) * cw, y0 + (j + (b + 0.5) / 3) * ch); if (v !== null) { s += v; n++ } }
    r.push(n ? s / n : null) } out.push(r) }
  return out
}
function coarsen(f, k) { const rows = f.length / k, cols = f[0].length / k, out = []
  for (let J = 0; J < rows; J++) { const r = []; for (let I = 0; I < cols; I++) { let s = 0, n = 0; for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) { const v = f[J * k + j][I * k + i]; if (v !== null) { s += v; n++ } } r.push(n ? s / n : null) } out.push(r) }
  return out }
function classes(f, lo, hi) { return f.map((r) => r.map((v) => (v === null ? -1 : Math.max(0, Math.min(6, Math.floor(((v - lo) / (hi - lo)) * 7)))))) }
// one <path> per class, horizontal runs merged, coordinates in cell units
function rasterPaths(cls, indent) {
  const d = Array.from({ length: 7 }, () => [])
  cls.forEach((r, j) => { let i = 0; while (i < r.length) { const k = r[i]; let n = 1; while (i + n < r.length && r[i + n] === k) n++; if (k >= 0) d[k].push(`M${i} ${j}h${n}v1h-${n}z`); i += n } })
  return d.map((p, k) => (p.length ? `${indent}<path class="fig-h${k}" d="${p.join('')}"/>` : '')).filter(Boolean).join('\n')
}
const range = (f) => { const v = f.flat().filter((x) => x !== null).sort((a, b) => a - b); return [v[Math.floor(v.length * 0.03)], v[Math.floor(v.length * 0.97)]] }

// ---- compare raster: a crop at a finer cell size, for the 100 m / 10 m slider ----
const CM = FROM_PNG ? JSON.parse(fs.readFileSync(GEO('heat-compare-illustrative.json'), 'utf8')) : null
const CMP = FROM_PNG ? { frame: CM.frame, cols: CM.grid[0], rows: CM.grid[1], factor: CM.factor } : { frame: [300, 330, 288, 108], cols: 320, rows: 120, factor: 10 }
const cw = CMP.frame[2] / CMP.cols
const cmp = FROM_PNG ? readGray(GEO(CM.image)).v : new Uint8Array(CMP.cols * CMP.rows)
if (!FROM_PNG) for (let j = 0; j < CMP.rows; j++) for (let i = 0; i < CMP.cols; i++) {
  const mx = CMP.frame[0] + (i + 0.5) * cw, my = CMP.frame[1] + (j + 0.5) * cw
  cmp[j * CMP.cols + i] = inRings(OUT, mx, my) ? 1 + Math.round(field(mx, my, cw) * 254) : 0
}
const encodePng = (data, w, h) => { const hd = Buffer.alloc(13); hd.writeUInt32BE(w, 0); hd.writeUInt32BE(h, 4); hd[8] = 8; hd[9] = 0
  const rw = Buffer.alloc((w + 1) * h); for (let j = 0; j < h; j++) Buffer.from(data.subarray(j * w, (j + 1) * w)).copy(rw, j * (w + 1) + 1)
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', hd), chunk('IDAT', zlib.deflateSync(rw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]) }
if (!FROM_PNG) fs.writeFileSync(path.join(ROOT, 'src/assets/geo/heat-compare-illustrative.png'), encodePng(cmp, CMP.cols, CMP.rows))
if (!FROM_PNG) fs.writeFileSync(path.join(ROOT, 'src/assets/geo/heat-compare-illustrative.json'), JSON.stringify({
  illustrative: true,
  about: 'Illustrative crop for the 100 m / 10 m compare slider. Fine grid = the 10 m side; the 100 m side is the block mean over factor x factor fine cells. Not measured data. Replace with a 10 m crop of the thesis result and set illustrative to false.',
  image: 'heat-compare-illustrative.png',
  encoding: '8-bit grayscale PNG, row-major, top row = north. 0 = no data. 1..255 map linearly to range.',
  grid: [CMP.cols, CMP.rows],
  factor: CMP.factor,
  frame: CMP.frame,
  frameUnits: 'berlin.json map units',
  range: [0, 1],
  unit: 'relative (0 = coolest, 1 = hottest)'
}, null, 2) + '\n')

// ---- Fig. 3 thesis: same area at 100 m and 10 m (centre 60 x 40 of the compare crop) ----
// The figure shows a 60 x 40 window of the compare grid; i0/j0 pick it. Re-pick after swapping the data.
const sub = []; const i0 = 160, j0 = 40
for (let j = 0; j < 40; j++) { const r = []; for (let i = 0; i < 60; i++) { const v = cmp[(j0 + j) * CMP.cols + i0 + i]; r.push(v ? (v - 1) / 254 : null) } sub.push(r) }
const fine = sub, coarse = coarsen(fine, 10)
const [lo, hi] = range(fine)
const T = {
  de: { t: 'Derselbe Ausschnitt auf 100 m und auf 10 m', d: 'Zwei gleich große Ausschnitte der Berliner Innenstadt als Wärmeraster, links in 100-m-Zellen, rechts in 10-m-Zellen. Die Farbskala reicht von Graphit (kühler) bis Terrakotta (wärmer). Illustrativ, keine Messdaten.' },
  en: { t: 'The same area at 100 m and at 10 m', d: 'Two equal views of inner Berlin as a heat raster, 100 m cells on the left and 10 m cells on the right. The colour scale runs from graphite (cooler) to terracotta (warmer). Illustrative, not measured data.' },
}
for (const lang of ['de', 'en']) {
  const id = 'fig-lst-res'
  const svg = `<svg class="figure-svg fig-wide" width="840" height="274" viewBox="0 0 840 274" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-t ${id}-d">
  <title id="${id}-t">${T[lang].t}</title>
  <desc id="${id}-d">${T[lang].d}</desc>
  <!-- Generated from src/assets/geo/heat-illustrative.png (illustrative grid). Regenerate when the thesis result replaces it. -->
  <g transform="scale(68.3333)" shape-rendering="crispEdges">
${rasterPaths(classes(coarse, lo, hi), '    ')}
  </g>
  <g transform="translate(430 0) scale(6.8333)" shape-rendering="crispEdges">
${rasterPaths(classes(fine, lo, hi), '    ')}
  </g>
  <rect class="fig-chip" x="12" y="12" width="62" height="28" rx="6"/>
  <text class="fig-num" x="43" y="31" text-anchor="middle">100 m</text>
  <rect class="fig-chip" x="442" y="12" width="52" height="28" rx="6"/>
  <text class="fig-num" x="468" y="31" text-anchor="middle">10 m</text>
</svg>
`
  fs.writeFileSync(path.join(ROOT, `src/assets/figures/berlin-lst-downscaling/resolution-compare.${lang}.svg`), svg)
}

// ---- thesis cover: one area, coarse on the left, fine on the right ----
{
  const c = [300, 262, 400, 225] // 16:9 in map units
  const f = fineGrid(...c, 64, 36), k = coarsen(f, 4)
  const [l, h] = range(f)
  const fc = classes(f, l, h).map((r) => r.slice(32)), kc = classes(k, l, h).map((r) => r.slice(0, 8))
  const svg = `<svg class="figure-svg fig-cover" width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect class="fig-cover-out" width="1600" height="900"/>
  <g transform="scale(100)" shape-rendering="crispEdges">
${rasterPaths(kc, '    ')}
  </g>
  <g transform="translate(800 0) scale(25)" shape-rendering="crispEdges">
${rasterPaths(fc, '    ')}
  </g>
  <path class="fig-cover-grid" d="M100 0V900M200 0V900M300 0V900M400 0V900M500 0V900M600 0V900M700 0V900M0 100H800M0 200H800M0 300H800M0 400H800M0 500H800M0 600H800M0 700H800M0 800H800"/>
  <path class="fig-cover-split" d="M800 0V900"/>
</svg>
`
  fs.writeFileSync(path.join(ROOT, 'src/assets/figures/berlin-lst-downscaling/cover.svg'), svg)
}
console.log(FROM_PNG ? 'from png' : 'generated', 'grid', GW, GH, 'range', lo.toFixed(2), hi.toFixed(2))
