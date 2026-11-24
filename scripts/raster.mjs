// Berlin land and water raster and the thesis cover.
// Usage:
//   node scripts/raster.mjs .   write the raster PNG and manifest, then the cover
// Manifest: src/assets/geo/berlin-raster.json
import fs from 'node:fs'
import zlib from 'node:zlib'
import path from 'node:path'

const ROOT = process.argv[2]
const GEO = (f) => path.join(ROOT, 'src/assets/geo', f)
const B = JSON.parse(fs.readFileSync(GEO('berlin.json'), 'utf8'))

// ---- polygons ----
const rings = (d) => d.split('Z').filter(Boolean).map((s) => s.replace('M', '').split('L').map((p) => p.trim().split(/\s+/).map(Number)))
const OUT = rings(B.outline), WAT = rings(B.water)
// The largest water ring in berlin.json is malformed east of Spandau: it closes the Spree into a
// wide band across the city. Trust it only for Tegeler See and the northern Havel.
const BROKEN = WAT.reduce((a, r, i) => (r.length > WAT[a].length ? i : a), 0)
const isWater = (x, y) => {
  const rest = WAT.filter((_, i) => i !== BROKEN)
  if (inRings(rest, x, y)) return true
  return (x < 195 || (x < 290 && y < 268)) && inRings([WAT[BROKEN]], x, y)
}
function inRings(R, x, y) {
  let inside = false
  for (const r of R) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// ---- hero grid: 250 x 207 cells of 4 map units, land share per cell ----
const CELL = 4, SUBS = 4
const GW = Math.ceil(B.w / CELL), GH = Math.ceil(B.h / CELL)
const grid = new Uint8Array(GW * GH)
for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
  let inside = 0, land = 0
  for (let a = 0; a < SUBS; a++) for (let b = 0; b < SUBS; b++) {
    const mx = (i + (a + 0.5) / SUBS) * CELL, my = (j + (b + 0.5) / SUBS) * CELL
    if (!inRings(OUT, mx, my)) continue
    inside++
    if (!isWater(mx, my)) land++
  }
  if (inside * 2 >= SUBS * SUBS) grid[j * GW + i] = 1 + Math.round((land / inside) * 254)
}

// ---- PNG (8-bit grayscale, no colour chunks) ----
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcT[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
const chunk = (type, data) => { const t = Buffer.from(type), l = Buffer.alloc(4), c = Buffer.alloc(4); l.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([l, t, data, c]) }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(GW, 0); ihdr.writeUInt32BE(GH, 4); ihdr[8] = 8; ihdr[9] = 0
const raw = Buffer.alloc((GW + 1) * GH); for (let j = 0; j < GH; j++) { raw[j * (GW + 1)] = 0; Buffer.from(grid.subarray(j * GW, (j + 1) * GW)).copy(raw, j * (GW + 1) + 1) }
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
fs.writeFileSync(GEO('berlin-raster.png'), png)
fs.writeFileSync(GEO('berlin-raster.json'), JSON.stringify({
  about: 'Berlin land and water from berlin.json, rasterised as a resolution motif. Not a measurement.',
  image: 'berlin-raster.png',
  grid: [GW, GH],
  frame: [0, 0, GW * CELL, GH * CELL],
  frameUnits: 'berlin.json map units',
  range: [0, 1],
  unit: 'land share of the cell (1 = land, 0 = water)'
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

// ---- thesis cover: pick a 16:9 window with a clear piece of water ----
const COVER = [256, 144]
const share = (x0, y0) => {
  const f = fineGrid(x0, y0, COVER[0], COVER[1], 64, 36)
  let inside = 0, water = 0, missing = 0
  for (const r of f) for (const v of r) { if (v === null) { missing++; continue } inside++; if (v < 0.5) water++ }
  return { inside, water: inside ? water / inside : 0, missing }
}
// At most 15 % of the cells outside Berlin, 15-50 % water, as close to a third as possible.
let best = null
for (let y0 = 0; y0 <= B.h - COVER[1]; y0 += 8) for (let x0 = 0; x0 <= B.w - COVER[0]; x0 += 8) {
  const s = share(x0, y0)
  if (s.missing > 0.15 * 64 * 36 || s.water < 0.15 || s.water > 0.5) continue
  if (!best || Math.abs(s.water - 0.33) < Math.abs(best.water - 0.33)) best = { x0, y0, ...s }
}
if (!best) throw new Error('no 16:9 window with 15-50 % water cells')

// ---- thesis cover: one area, coarse on the left, fine on the right ----
{
  const f = fineGrid(best.x0, best.y0, COVER[0], COVER[1], 64, 36), k = coarsen(f, 4)
  const fc = classes(f, 0, 1).map((r) => r.slice(32)), kc = classes(k, 0, 1).map((r) => r.slice(0, 8))
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
console.log('raster', GW, GH)
console.log(`cover window ${best.x0} ${best.y0} ${COVER[0]} ${COVER[1]} (water ${(best.water * 100).toFixed(1)} %)`)
