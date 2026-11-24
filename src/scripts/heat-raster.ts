// Heat raster engine. Logic ported from the prototype; the canvas is built only
// after it has a non-zero size, and requestAnimationFrame runs only during a sweep.
const DPR_MAX = 2
const MAX_BACKING_PX = 4_000_000

type Lab = [number, number, number]
type Rgb = [number, number, number]

export type RasterData = {
  w: number
  h: number
  v: Float32Array
  frame: number[]
  factor?: number
}

export type Ramp = { lut: Uint8ClampedArray; out: number[] }

const hex = (h: string): Rgb => {
  const s = h.trim().replace('#', '')
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255) as Rgb
}
const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const gam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

function toLab([r, g, b]: Rgb): Lab {
  r = lin(r)
  g = lin(g)
  b = lin(b)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function toRgb([L, a, b]: Lab): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => Math.round(Math.max(0, Math.min(1, gam(c))) * 255)) as Rgb
}

export function ramp(): Ramp {
  const cs = getComputedStyle(document.documentElement)
  const lo = toLab(hex(cs.getPropertyValue('--heat-lo')))
  const hi = toLab(hex(cs.getPropertyValue('--heat-hi')))
  const lut = new Uint8ClampedArray(256 * 3)
  for (let i = 0; i < 256; i++) {
    const t = i / 255
    const c = toRgb(lo.map((v, k) => v + ((hi[k] ?? 0) - v) * t) as Lab)
    lut.set(c, i * 3)
  }
  return { lut, out: hex(cs.getPropertyValue('--heat-out')).map((c) => Math.round(c * 255)) }
}

function backingPixels(w: number, h: number, d: number): number {
  return Math.round(w * d) * Math.round(h * d)
}

/** Device-pixel scale whose rounded canvas stays within 4 megapixels, including scales below 1. */
export function dprFor(w: number, h: number): number {
  const ratio = globalThis.devicePixelRatio
  let d = Math.min(DPR_MAX, ratio > 0 ? ratio : 1)
  if (!(w > 0) || !(h > 0)) return d
  while (backingPixels(w, h, d) > MAX_BACKING_PX && d > 0.25) d -= 0.25
  if (backingPixels(w, h, d) <= MAX_BACKING_PX) return d
  d = Math.sqrt(MAX_BACKING_PX / (w * h))
  while (d > 0 && backingPixels(w, h, d) > MAX_BACKING_PX) d /= 2
  return d
}

type CanvasLike = HTMLCanvasElement

function levelImage(vals: Float32Array, cols: number, rows: number, n: number, col: Ramp, outShade: boolean): CanvasLike {
  const bc = Math.ceil(cols / n)
  const br = Math.ceil(rows / n)
  const img = new ImageData(bc, br)
  const d = img.data
  for (let bj = 0; bj < br; bj++) {
    for (let bi = 0; bi < bc; bi++) {
      let s = 0
      let k = 0
      let all = 0
      for (let j = bj * n; j < Math.min(rows, bj * n + n); j++) {
        for (let i = bi * n; i < Math.min(cols, bi * n + n); i++) {
          all++
          const v = vals[j * cols + i] ?? NaN
          if (v === v) {
            s += v
            k++
          }
        }
      }
      const o = (bj * bc + bi) * 4
      if (k * 2 >= all && k > 0) {
        const t = Math.round(Math.max(0, Math.min(1, s / k)) * 255) * 3
        d[o] = col.lut[t] ?? 0
        d[o + 1] = col.lut[t + 1] ?? 0
        d[o + 2] = col.lut[t + 2] ?? 0
        d[o + 3] = 255
      } else if (outShade) {
        d[o] = col.out[0] ?? 0
        d[o + 1] = col.out[1] ?? 0
        d[o + 2] = col.out[2] ?? 0
        d[o + 3] = 255
      }
    }
  }
  const c = document.createElement('canvas')
  c.width = bc
  c.height = br
  c.getContext('2d')?.putImageData(img, 0, 0)
  return c
}

export type HeroOptions = {
  canvas: CanvasLike
  data: RasterData
  outline: string
  levels: number[]
  base: number
  fit: (w: number, h: number) => { s: number; ox: number; oy: number }
  clear?: () => DOMRect[]
  onLevel?: (level: number) => void
}

type Size = { w: number; h: number }

export class Hero {
  canvas: CanvasLike
  data: RasterData
  outline: string
  levels: number[]
  base: number
  fit: HeroOptions['fit']
  clear: () => DOMRect[]
  onLevel?: (level: number) => void
  level = -1
  target = -1
  sweep: object | null = null
  /** Set when build() replaces the bitmap. show() must paint even if the level is unchanged. */
  rebuilt = false
  buf: CanvasLike
  W = 0
  H = 0
  dpr = 1
  path: Path2D | null = null
  cols = 0
  rows = 0
  vals: Float32Array = new Float32Array()
  col: Ramp | null = null
  cache = new Map<number, CanvasLike>()

  constructor(o: HeroOptions) {
    this.canvas = o.canvas
    this.data = o.data
    this.outline = o.outline
    this.levels = o.levels
    this.base = o.base
    this.fit = o.fit
    this.clear = o.clear ?? (() => [])
    this.onLevel = o.onLevel
    this.buf = document.createElement('canvas')
  }

  /** Build the grid only when both axes are non-zero. A zero-size canvas is left untouched. */
  build(size?: Size): boolean {
    const W = size?.w ?? this.canvas.clientWidth
    const H = size?.h ?? this.canvas.clientHeight
    if (!(W > 0) || !(H > 0)) return false
    // Assigning canvas width clears the bitmap. Drop a sweep that would paint that
    // cleared buffer, and force the following show() to draw the level again.
    this.sweep = null
    this.rebuilt = true
    const dpr = dprFor(W, H)
    this.W = W
    this.H = H
    this.dpr = dpr
    this.canvas.width = this.buf.width = Math.round(W * dpr)
    this.canvas.height = this.buf.height = Math.round(H * dpr)
    const { s, ox, oy } = this.fit(W, H)
    this.path = new Path2D()
    this.path.addPath(new Path2D(this.outline), new DOMMatrix().translate(ox, oy).scale(s))
    const b = this.base
    const cols = (this.cols = Math.ceil(W / b))
    const rows = (this.rows = Math.ceil(H / b))
    const D = this.data
    const fx = D.w / ((D.frame[2] ?? 0) - (D.frame[0] ?? 0))
    const fy = D.h / ((D.frame[3] ?? 0) - (D.frame[1] ?? 0))
    const vals = (this.vals = new Float32Array(cols * rows))
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const mx = ((i + 0.5) * b - ox) / s
        const my = ((j + 0.5) * b - oy) / s
        const gi = Math.floor((mx - (D.frame[0] ?? 0)) * fx)
        const gj = Math.floor((my - (D.frame[1] ?? 0)) * fy)
        vals[j * cols + i] = gi < 0 || gj < 0 || gi >= D.w || gj >= D.h ? NaN : (D.v[gj * D.w + gi] ?? NaN)
      }
    }
    this.col = ramp()
    this.cache = new Map()
    return true
  }

  compose(L: number) {
    const n = this.levels[L] ?? 1
    const b = this.base
    const cell = n * b
    const x = this.buf.getContext('2d')
    if (!x || !this.col) return
    const dpr = this.dpr
    if (!this.cache.has(L)) this.cache.set(L, levelImage(this.vals, this.cols, this.rows, n, this.col, true))
    const img = this.cache.get(L)
    if (!img || img.width === 0 || img.height === 0) return
    x.setTransform(1, 0, 0, 1, 0, 0)
    x.clearRect(0, 0, this.buf.width, this.buf.height)
    x.imageSmoothingEnabled = false
    x.drawImage(img, 0, 0, img.width * cell * dpr, img.height * cell * dpr)
    x.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (cell >= 12) {
      for (let X = cell; X < this.W; X += cell) x.clearRect(X - 1, 0, 1, this.H)
      for (let Y = cell; Y < this.H; Y += cell) x.clearRect(0, Y - 1, this.W, 1)
    }
    if (this.path) {
      x.save()
      x.globalAlpha = 0.5
      x.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text')
      x.lineWidth = 1
      x.stroke(this.path)
      x.restore()
    }
    const cr = this.canvas.getBoundingClientRect()
    for (const r of this.clear()) {
      const pad = 16
      const x0 = Math.floor((r.left - cr.left - pad) / cell) * cell
      const y0 = Math.floor((r.top - cr.top - pad) / cell) * cell
      const x1 = Math.ceil((r.right - cr.left + pad) / cell) * cell
      const y1 = Math.ceil((r.bottom - cr.top + pad) / cell) * cell
      x.clearRect(x0, y0, x1 - x0, y1 - y0)
    }
  }

  show(L: number, { instant = false, duration = 360 }: { instant?: boolean; duration?: number } = {}) {
    const rebuilt = this.rebuilt
    this.rebuilt = false
    if (L === this.target && !instant && !rebuilt) return
    this.target = L
    this.onLevel?.(L)
    this.compose(L)
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return
    // A hidden page gets no animation frames, so a sweep would stall half drawn.
    if (instant || !globalThis.requestAnimationFrame || globalThis.document?.hidden) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      if (this.buf.width > 0) ctx.drawImage(this.buf, 0, 0)
      this.level = L
      this.sweep = null
      return
    }
    const t0 = performance.now()
    const H = this.canvas.height
    const row = (this.levels[L] ?? 1) * this.base * this.dpr
    const token = (this.sweep = {})
    let done = 0
    const step = (t: number) => {
      if (this.sweep !== token) return
      const p = Math.min(1, (t - t0) / duration)
      const e = 1 - (1 - p) ** 3
      const y = p === 1 ? H : Math.ceil((e * H) / row) * row
      if (y > done && this.buf.width > 0) {
        ctx.clearRect(0, done, this.canvas.width, y - done)
        ctx.drawImage(this.buf, 0, done, this.canvas.width, y - done, 0, done, this.canvas.width, y - done)
        done = y
      }
      if (p < 1) globalThis.requestAnimationFrame(step)
      else {
        this.sweep = null
        this.level = L
      }
    }
    globalThis.requestAnimationFrame(step)
  }

  redraw() {
    const ok = this.build()
    if (!ok) return
    const L = this.target < 0 ? 0 : this.target
    this.target = -1
    this.show(L, { instant: true })
  }
}

/** Observe the canvas and build only after a non-zero size is reported. `once` stops after that first size. */
export function watchCanvas(canvas: HTMLElement, onSize: (size: Size) => void, opts?: { once?: boolean }): void {
  let observer: ResizeObserver | undefined
  let settled = false
  const run = (w: number, h: number) => {
    if (!(w > 0) || !(h > 0) || settled) return
    if (opts?.once) {
      settled = true
      observer?.disconnect()
    }
    onSize({ w, h })
  }
  run(canvas.clientWidth, canvas.clientHeight)
  if (settled || typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect
    if (!rect) return
    run(rect.width, rect.height)
  })
  observer.observe(canvas)
}

export function startHero(hero: Hero, opts: { reducedMotion: boolean | (() => boolean); level: () => number }): void {
  const reduced = () => (typeof opts.reducedMotion === 'function' ? opts.reducedMotion() : opts.reducedMotion)
  watchCanvas(
    hero.canvas,
    (size) => {
      if (!hero.build(size)) return
      if (reduced()) hero.show(hero.levels.length - 1, { instant: true })
      else if (hero.level < 0) hero.show(opts.level(), { duration: 900 })
      else hero.show(opts.level())
    },
    { once: true },
  )
}

/** One frame per scroll burst. The callback does not schedule another frame. */
export function createScrollScheduler(update: () => void): () => void {
  let ticking = false
  return () => {
    if (ticking) return
    ticking = true
    globalThis.requestAnimationFrame(() => {
      ticking = false
      update()
    })
  }
}

export async function loadRaster(manifestUrl: string, imageUrl?: string): Promise<RasterData> {
  const man = (await (await fetch(manifestUrl)).json()) as RasterData & { image: string }
  const src = imageUrl ?? new URL(man.image, new URL(manifestUrl, location.href)).href
  const blob = await (await fetch(src)).blob()
  const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' })
  const c = document.createElement('canvas')
  c.width = bmp.width
  c.height = bmp.height
  const x = c.getContext('2d', { willReadFrequently: true })
  if (!x) throw new Error('canvas')
  x.drawImage(bmp, 0, 0)
  const px = x.getImageData(0, 0, bmp.width, bmp.height).data
  const v = new Float32Array(bmp.width * bmp.height)
  for (let i = 0; i < v.length; i++) {
    const g = px[i * 4] ?? 0
    v[i] = g === 0 ? NaN : (g - 1) / 254
  }
  return { ...man, w: bmp.width, h: bmp.height, v }
}
