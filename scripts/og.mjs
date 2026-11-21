// Build-time OG PNGs. Colours are hex only. Mixes are computed in this script, never left in a source string.
// Site image matches public/ogImage.svg. Case images render the cover at 1200x675 and crop to 1200x630.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const root = process.cwd()
const outDir = path.join(root, 'public/og')
fs.mkdirSync(outDir, { recursive: true })
for (const name of fs.readdirSync(outDir)) {
  if (!name.endsWith('.png')) continue
  const file = path.join(outDir, name)
  if (fs.statSync(file).isFile()) fs.rmSync(file)
}

const BG = [0xf7, 0xf7, 0xf5, 255]
const TEXT = [0x15, 0x19, 0x22, 255]
const MUTED = [0x62, 0x5d, 0x57, 255]
const ACCENT = [0xd4, 0x72, 0x4a, 255]
const ON = [0x15, 0x19, 0x22, 255]
const HEAT_LO = [0x3b, 0x3e, 0x45, 255]
const HEAT_HI = [0xd4, 0x72, 0x4a, 255]
const HEAT_OUT = [0xe9, 0xe6, 0xe0, 255]

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const toLab = ([r, g, b]) => {
  r = lin(r / 255)
  g = lin(g / 255)
  b = lin(b / 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}
const fromLab = ([L, a, b]) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map((c) => Math.round(Math.max(0, Math.min(1, gam(c))) * 255))
}
const mix = (a, b, t) => {
  const A = toLab(a)
  const B = toLab(b)
  const rgb = fromLab(A.map((v, i) => v + ((B[i] ?? 0) - v) * t))
  return [rgb[0], rgb[1], rgb[2], 255]
}
const fade = (rgb, alpha) => [rgb[0], rgb[1], rgb[2], Math.round(alpha * 255)]

const BAR = mix(TEXT, BG, 0.22)
const TINT = mix(ACCENT, BG, 0.16)
const HEAT = [0, 1, 2, 3, 4, 5, 6].map((i) => (i === 0 ? HEAT_LO : i === 6 ? HEAT_HI : mix(HEAT_HI, HEAT_LO, [0, 0.17, 0.33, 0.5, 0.67, 0.83, 1][i])))

const STYLE = {
  'fig-cover-acc': { fill: ACCENT },
  'fig-cover-tint': { fill: TINT },
  'fig-cover-bg': { fill: BG },
  'fig-cover-out': { fill: HEAT_OUT },
  'fig-cover-grid': { stroke: BG, width: 3 },
  'fig-cover-hair': { stroke: fade(ON, 0.16), width: 2 },
  'fig-cover-hair-t': { stroke: fade(TEXT, 0.1), width: 2 },
  'fig-cover-split': { stroke: BG, width: 8 },
  'fig-ink': { stroke: ON, width: 10, cap: 'round' },
  'fig-ink-thin': { stroke: ON, width: 4, dash: [2, 14], cap: 'round' },
  'fig-ink-fill': { fill: ON },
  'fig-stop': { fill: ACCENT, stroke: ON, width: 6 },
  'fig-lane': { stroke: BAR, width: 14, cap: 'round' },
  'fig-lane-acc': { stroke: ACCENT, width: 28 },
  'fig-gate': { fill: TEXT },
  'fig-pr': { fill: TEXT },
  'fig-bar': { fill: BAR },
  'fig-bar-acc': { fill: ACCENT },
  'fig-base': { stroke: TEXT, width: 1 },
}
HEAT.forEach((color, i) => { STYLE[`fig-h${i}`] = { fill: color } })

function styleFor(cls) {
  const out = {}
  for (const name of cls.split(/\s+/)) Object.assign(out, STYLE[name] ?? {})
  return out
}

function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0
    Buffer.from(rgba.subarray(y * w * 4, (y + 1) * w * 4)).copy(raw, y * (w * 4 + 1) + 1)
  }
  const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcT[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (type, data) => { const t = Buffer.from(type); const l = Buffer.alloc(4); const c = Buffer.alloc(4); l.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([l, t, data, c]) }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
}

function canvas(w, h, fill) {
  const data = new Uint8ClampedArray(w * h * 4)
  if (fill) for (let i = 0; i < data.length; i += 4) data.set(fill, i)
  const blend = (x, y, color) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const o = (y * w + x) * 4
    const a = (color[3] ?? 255) / 255
    if (a <= 0) return
    if (a >= 1) { data[o] = color[0]; data[o + 1] = color[1]; data[o + 2] = color[2]; data[o + 3] = 255; return }
    data[o] = Math.round(color[0] * a + data[o] * (1 - a))
    data[o + 1] = Math.round(color[1] * a + data[o + 1] * (1 - a))
    data[o + 2] = Math.round(color[2] * a + data[o + 2] * (1 - a))
    data[o + 3] = 255
  }
  return { w, h, data, blend }
}

const ident = () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
const mul = (m, n) => ({
  a: m.a * n.a + m.c * n.b, b: m.b * n.a + m.d * n.b,
  c: m.a * n.c + m.c * n.d, d: m.b * n.c + m.d * n.d,
  e: m.a * n.e + m.c * n.f + m.e, f: m.b * n.e + m.d * n.f + m.f,
})
const apply = (m, x, y) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]
function parseTransform(value, base) {
  let m = base
  const re = /(translate|scale)\(([^)]+)\)/g
  let match
  while ((match = re.exec(value))) {
    const n = match[2].trim().split(/[\s,]+/).map(Number)
    if (match[1] === 'translate') m = mul(m, { a: 1, b: 0, c: 0, d: 1, e: n[0] || 0, f: n[1] || 0 })
    else m = mul(m, { a: n[0] || 1, b: 0, c: 0, d: n[1] || n[0] || 1, e: 0, f: 0 })
  }
  return m
}
const scaleOf = (m) => Math.hypot(m.a, m.b) || 1

function fillRect(c, x, y, w, h, rx, color) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = Math.ceil(x + w)
  const y1 = Math.ceil(y + h)
  const r = Math.min(rx || 0, w / 2, h / 2)
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      let inside = px + 0.5 >= x && py + 0.5 >= y && px + 0.5 <= x + w && py + 0.5 <= y + h
      if (inside && r > 0) {
        const cx = px + 0.5 < x + r ? x + r : px + 0.5 > x + w - r ? x + w - r : px + 0.5
        const cy = py + 0.5 < y + r ? y + r : py + 0.5 > y + h - r ? y + h - r : py + 0.5
        if ((px + 0.5 - cx) ** 2 + (py + 0.5 - cy) ** 2 > r * r) inside = false
      }
      if (inside) c.blend(px, py, color)
    }
  }
}

function fillPolygon(c, pts, color) {
  if (pts.length < 3) return
  let minY = Infinity
  let maxY = -Infinity
  let minX = Infinity
  let maxX = -Infinity
  for (const [x, y] of pts) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x) }
  const y0 = Math.max(0, Math.floor(minY))
  const y1 = Math.min(c.h - 1, Math.ceil(maxY))
  for (let y = y0; y <= y1; y++) {
    const ys = y + 0.5
    const xs = []
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i]
      const [xj, yj] = pts[j]
      if ((yi > ys) !== (yj > ys)) xs.push(((xj - xi) * (ys - yi)) / (yj - yi) + xi)
    }
    xs.sort((a, b) => a - b)
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const a = Math.max(0, Math.ceil(xs[i]))
      const b = Math.min(c.w - 1, Math.floor(xs[i + 1]))
      for (let x = a; x <= b; x++) if (x >= minX - 1 && x <= maxX + 1) c.blend(x, y, color)
    }
  }
}

function strokeSegment(c, x0, y0, x1, y1, width, color) {
  const r = width / 2
  const minX = Math.floor(Math.min(x0, x1) - r)
  const maxX = Math.ceil(Math.max(x0, x1) + r)
  const minY = Math.floor(Math.min(y0, y1) - r)
  const maxY = Math.ceil(Math.max(y0, y1) + r)
  const dx = x1 - x0
  const dy = y1 - y0
  const len2 = dx * dx + dy * dy || 1
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const t = Math.max(0, Math.min(1, ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2))
      const px = x0 + t * dx
      const py = y0 + t * dy
      if ((x + 0.5 - px) ** 2 + (y + 0.5 - py) ** 2 <= r * r) c.blend(x, y, color)
    }
  }
}

function strokePoly(c, pts, width, color, dash) {
  let drawn = 0
  const pattern = dash && dash.length ? dash : null
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const len = Math.hypot(x1 - x0, y1 - y0)
    if (!pattern) { strokeSegment(c, x0, y0, x1, y1, width, color); continue }
    let left = len
    let sx = x0
    let sy = y0
    while (left > 0.5) {
      const cycle = pattern.reduce((s, n) => s + n, 0) || 1
      const pos = drawn % cycle
      let acc = 0
      let on = true
      let span = pattern[0]
      for (let k = 0; k < pattern.length; k++) {
        if (pos < acc + pattern[k]) { on = k % 2 === 0; span = acc + pattern[k] - pos; break }
        acc += pattern[k]
      }
      const step = Math.min(left, span)
      const nx = sx + ((x1 - x0) * step) / len
      const ny = sy + ((y1 - y0) * step) / len
      if (on) strokeSegment(c, sx, sy, nx, ny, width, color)
      sx = nx
      sy = ny
      left -= step
      drawn += step
    }
  }
}

function parsePath(d) {
  const tokens = d.match(/[MmLlHhVvCcZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []
  const subs = []
  let cur = []
  let i = 0
  let cmd = ''
  let x = 0
  let y = 0
  let sx = 0
  let sy = 0
  const num = () => Number(tokens[i++])
  const push = (px, py) => { cur.push([px, py]); x = px; y = py }
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++]
    const rel = cmd === cmd.toLowerCase()
    const C = cmd.toUpperCase()
    if (C === 'M') {
      if (cur.length) subs.push(cur)
      cur = []
      const nx = num() + (rel ? x : 0)
      const ny = num() + (rel ? y : 0)
      push(nx, ny)
      sx = x
      sy = y
      cmd = rel ? 'l' : 'L'
    } else if (C === 'L') {
      push(num() + (rel ? x : 0), num() + (rel ? y : 0))
    } else if (C === 'H') {
      push(num() + (rel ? x : 0), y)
    } else if (C === 'V') {
      push(x, num() + (rel ? y : 0))
    } else if (C === 'C') {
      const args = [num(), num(), num(), num(), num(), num()]
      const p0 = [x, y]
      const p1 = [args[0] + (rel ? x : 0), args[1] + (rel ? y : 0)]
      const p2 = [args[2] + (rel ? x : 0), args[3] + (rel ? y : 0)]
      const p3 = [args[4] + (rel ? x : 0), args[5] + (rel ? y : 0)]
      for (let t = 1; t <= 12; t++) {
        const u = t / 12
        const a = (1 - u) ** 3
        const b = 3 * (1 - u) ** 2 * u
        const c = 3 * (1 - u) * u ** 2
        const d3 = u ** 3
        push(a * p0[0] + b * p1[0] + c * p2[0] + d3 * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d3 * p3[1])
      }
    } else if (C === 'Z') {
      if (cur.length) { push(sx, sy); subs.push(cur); cur = [] }
    }
  }
  if (cur.length) subs.push(cur)
  return subs
}

function isRect(pts) {
  if (pts.length < 4 || pts.length > 6) return null
  const xs = [...new Set(pts.map((p) => Math.round(p[0] * 100) / 100))]
  const ys = [...new Set(pts.map((p) => Math.round(p[1] * 100) / 100))]
  if (xs.length !== 2 || ys.length !== 2) return null
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.abs(xs[1] - xs[0]), h: Math.abs(ys[1] - ys[0]) }
}

function drawShape(c, kind, attrs, matrix) {
  const st = styleFor(attrs.class ?? '')
  const pt = (x, y) => apply(matrix, Number(x) || 0, Number(y) || 0)
  if (kind === 'rect' && st.fill) {
    const [x, y] = pt(attrs.x, attrs.y)
    const [x2, y2] = pt(Number(attrs.x || 0) + Number(attrs.width || 0), Number(attrs.y || 0) + Number(attrs.height || 0))
    fillRect(c, Math.min(x, x2), Math.min(y, y2), Math.abs(x2 - x), Math.abs(y2 - y), (Number(attrs.rx) || 0) * scaleOf(matrix), st.fill)
  }
  if (kind === 'circle') {
    const [cx, cy] = pt(attrs.cx, attrs.cy)
    const r = (Number(attrs.r) || 0) * scaleOf(matrix)
    if (st.stroke) fillRect(c, cx - r - (st.width * scaleOf(matrix)) / 2, cy - r - (st.width * scaleOf(matrix)) / 2, (r + (st.width * scaleOf(matrix)) / 2) * 2, (r + (st.width * scaleOf(matrix)) / 2) * 2, r + (st.width * scaleOf(matrix)) / 2, st.stroke)
    if (st.fill) fillRect(c, cx - r, cy - r, r * 2, r * 2, r, st.fill)
  }
  if (kind === 'path') {
    const subs = parsePath(attrs.d || '')
    for (const sub of subs) {
      const pts = sub.map(([x, y]) => apply(matrix, x, y))
      const rect = st.fill ? isRect(sub) : null
      if (rect && st.fill) {
        const [x, y] = apply(matrix, rect.x, rect.y)
        const [x2, y2] = apply(matrix, rect.x + rect.w, rect.y + rect.h)
        fillRect(c, Math.min(x, x2), Math.min(y, y2), Math.abs(x2 - x), Math.abs(y2 - y), 0, st.fill)
      } else if (st.fill) fillPolygon(c, pts, st.fill)
      if (st.stroke) strokePoly(c, pts, (st.width || 1) * scaleOf(matrix), st.stroke, st.dash?.map((n) => n * scaleOf(matrix)))
    }
  }
}

function renderSvg(file, w, h) {
  const text = fs.readFileSync(file, 'utf8')
  const vb = text.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number) ?? [0, 0, w, h]
  const rootM = mul(ident(), { a: w / (vb[2] || w), b: 0, c: 0, d: h / (vb[3] || h), e: -(vb[0] || 0), f: -(vb[1] || 0) })
  const c = canvas(w, h, BG)
  const tags = text.match(/<(rect|path|circle|g)\b[^>]*\/?>|<\/g>/g) ?? []
  const stack = [rootM]
  for (const tag of tags) {
    if (tag.startsWith('</g>')) { stack.pop(); continue }
    const kind = tag.match(/^<([a-z]+)/)?.[1]
    const attrs = {}
    for (const attr of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) attrs[attr[1]] = attr[2]
    let matrix = stack[stack.length - 1]
    if (attrs.transform) matrix = parseTransform(attrs.transform, matrix)
    if (kind === 'g') { stack.push(matrix); continue }
    drawShape(c, kind, attrs, matrix)
  }
  return c
}

const FONT = {
  ' ': '00000', A: '01110,10001,10001,11111,10001,10001,10001', B: '11110,10001,10001,11110,10001,10001,11110',
  C: '01110,10001,10000,10000,10000,10001,01110', D: '11110,10001,10001,10001,10001,10001,11110',
  E: '11111,10000,10000,11110,10000,10000,11111', F: '11111,10000,10000,11110,10000,10000,10000',
  G: '01110,10001,10000,10111,10001,10001,01110', H: '10001,10001,10001,11111,10001,10001,10001',
  I: '01110,00100,00100,00100,00100,00100,01110', J: '00111,00010,00010,00010,10010,10010,01100',
  K: '10001,10010,10100,11000,10100,10010,10001', L: '10000,10000,10000,10000,10000,10000,11111',
  M: '10001,11011,10101,10101,10001,10001,10001', N: '10001,11001,10101,10011,10001,10001,10001',
  O: '01110,10001,10001,10001,10001,10001,01110', P: '11110,10001,10001,11110,10000,10000,10000',
  Q: '01110,10001,10001,10001,10101,10010,01101', R: '11110,10001,10001,11110,10100,10010,10001',
  S: '01111,10000,10000,01110,00001,00001,11110', T: '11111,00100,00100,00100,00100,00100,00100',
  U: '10001,10001,10001,10001,10001,10001,01110', V: '10001,10001,10001,10001,10001,01010,00100',
  W: '10001,10001,10001,10101,10101,10101,01010', X: '10001,10001,01010,00100,01010,10001,10001',
  Y: '10001,10001,01010,00100,00100,00100,00100', Z: '11111,00001,00010,00100,01000,10000,11111',
  a: '00000,00000,01110,00001,01111,10001,01111', b: '10000,10000,11110,10001,10001,10001,11110',
  c: '00000,00000,01110,10000,10000,10001,01110', d: '00001,00001,01111,10001,10001,10001,01111',
  e: '00000,00000,01110,10001,11111,10000,01110', f: '00110,01001,01000,11100,01000,01000,01000',
  g: '00000,01111,10001,01111,00001,10001,01110', h: '10000,10000,10110,11001,10001,10001,10001',
  i: '00100,00000,01100,00100,00100,00100,01110', j: '00010,00000,00110,00010,00010,10010,01100',
  k: '10000,10000,10010,10100,11000,10100,10010', l: '01100,00100,00100,00100,00100,00100,01110',
  m: '00000,00000,11010,10101,10101,10001,10001', n: '00000,00000,10110,11001,10001,10001,10001',
  o: '00000,00000,01110,10001,10001,10001,01110', p: '00000,11110,10001,11110,10000,10000,10000',
  r: '00000,00000,10110,11001,10000,10000,10000', s: '00000,00000,01111,10000,01110,00001,11110',
  t: '01000,01000,11100,01000,01000,01001,00110', u: '00000,00000,10001,10001,10001,10011,01101',
  v: '00000,00000,10001,10001,10001,01010,00100', w: '00000,00000,10001,10101,10101,10101,01010',
  x: '00000,00000,10001,01010,00100,01010,10001', y: '00000,10001,10001,01111,00001,10001,01110',
  z: '00000,00000,11111,00010,00100,01000,11111',
  '.': '00000,00000,00000,00000,00000,01100,01100', ',': '00000,00000,00000,00000,00100,00100,01000',
  '·': '00000,00000,00000,01100,01100,00000,00000',
}

function text(c, str, x, y, scale, color) {
  let cx = x
  for (const ch of str) {
    const rows = (FONT[ch] ?? FONT[' ']).split(',')
    rows.forEach((row, ry) => {
      if (row.length === 1) return
      for (let rx = 0; rx < 5; rx++) if (row[rx] === '1') fillRect(c, cx + rx * scale, y + ry * scale, scale, scale, 0, color)
    })
    cx += 6 * scale
  }
}

function site() {
  const c = canvas(1200, 630, BG)
  fillRect(c, 96, 168, 64, 4, 0, ACCENT)
  text(c, 'Silas Pignotti', 96, 230, 8, TEXT)
  text(c, 'Data · AI · Automation · Geospatial', 96, 340, 4, MUTED)
  fs.writeFileSync(path.join(outDir, 'site.png'), png(1200, 630, c.data))
}

function crop(c) {
  const out = canvas(1200, 630)
  for (let y = 0; y < 630; y++) out.data.set(c.data.subarray((y + 22) * 1200 * 4, (y + 23) * 1200 * 4), y * 1200 * 4)
  return out
}

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!field) continue
    let value = field[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    data[field[1]] = value
  }
  return data
}

function caseSlugs() {
  const dir = path.join(root, 'src/content/projects/de')
  if (!fs.existsSync(dir)) return []
  const slugs = []
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue
    const data = frontmatter(fs.readFileSync(path.join(dir, name), 'utf8'))
    if (!data || data.kind !== 'case' || !data.slug) continue
    const cover = path.join(root, 'src/assets/figures', data.slug, 'cover.svg')
    if (!fs.existsSync(cover)) continue
    slugs.push(data.slug)
  }
  return slugs
}

function cases() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/assets/geo/heat-illustrative.json'), 'utf8'))
  for (const slug of caseSlugs()) {
    const file = path.join(root, 'src/assets/figures', slug, 'cover.svg')
    const rendered = renderSvg(file, 1200, 675)
    const image = crop(rendered)
    if (slug === 'berlin-lst-downscaling' && manifest.illustrative === true) {
      const label = 'Illustrativ, keine Messdaten'
      fillRect(image, 36, 560, label.length * 4 * 6 + 24, 44, 6, BG)
      text(image, label, 48, 572, 4, TEXT)
    }
    fs.writeFileSync(path.join(outDir, `${slug}.png`), png(1200, 630, image.data))
  }
}

site()
cases()
console.log('og pngs written')
