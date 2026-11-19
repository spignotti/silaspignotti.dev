// Heat raster engine for the hero and the 100 m / 10 m compare slider.
// Framework-free. The builder can move this file to src/scripts/ as is.
// Data: a grayscale PNG plus a JSON manifest (see src/assets/geo/*.json).
// Idle cost: none. rAF runs only while a level change is being swept in.
;(function () {
  const DPR_MAX = 2
  const MAX_BACKING_PX = 4_000_000 // canvas backing store cap (width * height * dpr^2)

  // ---------- colour: oklab ramp from --heat-lo to --heat-hi ----------
  const hex = (h) => { h = h.trim().replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) }
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
  function toLab([r, g, b]) {
    r = lin(r); g = lin(g); b = lin(b)
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
  }
  function toRgb([L, a, b]) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map((c) => Math.round(Math.max(0, Math.min(1, gam(c))) * 255))
  }
  function ramp() {
    const cs = getComputedStyle(document.documentElement)
    const lo = toLab(hex(cs.getPropertyValue('--heat-lo'))), hi = toLab(hex(cs.getPropertyValue('--heat-hi')))
    const lut = new Uint8ClampedArray(256 * 3)
    for (let i = 0; i < 256; i++) { const t = i / 255, c = toRgb(lo.map((v, k) => v + (hi[k] - v) * t)); lut.set(c, i * 3) }
    return { lut, out: hex(cs.getPropertyValue('--heat-out')).map((c) => Math.round(c * 255)) }
  }

  // ---------- data ----------
  async function loadRaster(manifestUrl) {
    const man = await (await fetch(manifestUrl)).json()
    const blob = await (await fetch(new URL(man.image, new URL(manifestUrl, location.href)))).blob()
    const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' })
    const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(bmp, 0, 0)
    const px = x.getImageData(0, 0, bmp.width, bmp.height).data
    const v = new Float32Array(bmp.width * bmp.height)
    for (let i = 0; i < v.length; i++) { const g = px[i * 4]; v[i] = g === 0 ? NaN : (g - 1) / 254 }
    return { ...man, w: bmp.width, h: bmp.height, v }
  }
  const dprFor = (w, h) => { let d = Math.min(DPR_MAX, devicePixelRatio || 1); while (w * h * d * d > MAX_BACKING_PX && d > 1) d -= 0.25; return d }

  // Paint a value grid (cols x rows, NaN = no data) block-averaged by n into an ImageData-backed canvas.
  function levelImage(vals, cols, rows, n, col, outShade) {
    const bc = Math.ceil(cols / n), br = Math.ceil(rows / n)
    const img = new ImageData(bc, br), d = img.data
    for (let bj = 0; bj < br; bj++) for (let bi = 0; bi < bc; bi++) {
      let s = 0, k = 0, all = 0
      for (let j = bj * n; j < Math.min(rows, bj * n + n); j++) for (let i = bi * n; i < Math.min(cols, bi * n + n); i++) { all++; const v = vals[j * cols + i]; if (v === v) { s += v; k++ } }
      const o = (bj * bc + bi) * 4
      if (k * 2 >= all) { const t = Math.round(Math.max(0, Math.min(1, s / k)) * 255) * 3; d[o] = col.lut[t]; d[o + 1] = col.lut[t + 1]; d[o + 2] = col.lut[t + 2]; d[o + 3] = 255 }
      else if (outShade) { d[o] = col.out[0]; d[o + 1] = col.out[1]; d[o + 2] = col.out[2]; d[o + 3] = 255 }
    }
    const c = document.createElement('canvas'); c.width = bc; c.height = br; c.getContext('2d').putImageData(img, 0, 0)
    return c
  }

  // =====================================================================
  // Hero: full-bleed raster over Berlin that sharpens with scroll.
  // opts: { canvas, data, outline (SVG path in data frame units), levels, base,
  //         fit(W,H) -> {s, ox, oy}, clear: () => [DOMRect...], onLevel(L) }
  // =====================================================================
  class Hero {
    constructor(o) { Object.assign(this, o); this.level = -1; this.target = -1; this.sweep = null; this.buf = document.createElement('canvas') }
    build() {
      const c = this.canvas, W = c.clientWidth, H = c.clientHeight, dpr = dprFor(W, H)
      this.W = W; this.H = H; this.dpr = dpr
      c.width = this.buf.width = Math.round(W * dpr); c.height = this.buf.height = Math.round(H * dpr)
      const { s, ox, oy } = this.fit(W, H)
      this.path = new Path2D(); this.path.addPath(new Path2D(this.outline), new DOMMatrix().translate(ox, oy).scale(s))
      // base grid: one value per base cell (screen px), sampled from the data frame
      const b = this.base, cols = (this.cols = Math.ceil(W / b)), rows = (this.rows = Math.ceil(H / b)), D = this.data
      const fx = D.w / (D.frame[2] - D.frame[0]), fy = D.h / (D.frame[3] - D.frame[1])
      const vals = (this.vals = new Float32Array(cols * rows))
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const mx = ((i + 0.5) * b - ox) / s, my = ((j + 0.5) * b - oy) / s
        const gi = Math.floor((mx - D.frame[0]) * fx), gj = Math.floor((my - D.frame[1]) * fy)
        vals[j * cols + i] = gi < 0 || gj < 0 || gi >= D.w || gj >= D.h ? NaN : D.v[gj * D.w + gi]
      }
      this.col = ramp()
      this.cache = new Map()
    }
    // compose level L into the off-screen buffer: cells, gaps, cleared zones, outline
    compose(L) {
      const n = this.levels[L], b = this.base, cell = n * b, x = this.buf.getContext('2d'), dpr = this.dpr
      if (!this.cache.has(L)) this.cache.set(L, levelImage(this.vals, this.cols, this.rows, n, this.col, true))
      const img = this.cache.get(L)
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, this.buf.width, this.buf.height)
      x.imageSmoothingEnabled = false
      x.drawImage(img, 0, 0, img.width * cell * dpr, img.height * cell * dpr)
      x.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (cell >= 12) { // hairline gaps make the grid legible at coarse levels
        for (let X = cell; X < this.W; X += cell) x.clearRect(X - 1, 0, 1, this.H)
        for (let Y = cell; Y < this.H; Y += cell) x.clearRect(0, Y - 1, this.W, 1)
      }
      x.save(); x.globalAlpha = 0.5; x.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text'); x.lineWidth = 1; x.stroke(this.path); x.restore()
      const cr = this.canvas.getBoundingClientRect()
      for (const r of this.clear()) { // free the cells under the text, snapped outward to this level's grid
        const pad = 16, x0 = Math.floor((r.left - cr.left - pad) / cell) * cell, y0 = Math.floor((r.top - cr.top - pad) / cell) * cell
        const x1 = Math.ceil((r.right - cr.left + pad) / cell) * cell, y1 = Math.ceil((r.bottom - cr.top + pad) / cell) * cell
        x.clearRect(x0, y0, x1 - x0, y1 - y0)
      }
    }
    show(L, { instant = false, duration = 360 } = {}) {
      if (L === this.target && !instant) return
      this.target = L; this.onLevel?.(L); this.compose(L)
      const ctx = this.canvas.getContext('2d')
      if (instant) { ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); ctx.drawImage(this.buf, 0, 0); this.level = L; return }
      // sweep the new level in from the top, cell row by cell row
      const t0 = performance.now(), H = this.canvas.height, row = this.levels[L] * this.base * this.dpr, token = (this.sweep = {})
      let done = 0
      const step = (t) => {
        if (this.sweep !== token) return
        const p = Math.min(1, (t - t0) / duration), e = 1 - (1 - p) ** 3
        const y = p === 1 ? H : Math.ceil((e * H) / row) * row
        if (y > done) { ctx.clearRect(0, done, this.canvas.width, y - done); ctx.drawImage(this.buf, 0, done, this.canvas.width, y - done, 0, done, this.canvas.width, y - done); done = y }
        if (p < 1) requestAnimationFrame(step); else { this.sweep = null; this.level = L }
      }
      requestAnimationFrame(step)
    }
    redraw() { this.build(); const L = this.target < 0 ? 0 : this.target; this.target = -1; this.show(L, { instant: true }) }
  }

  // =====================================================================
  // Compare: the same crop at 100 m (block mean) and 10 m, split by a handle.
  // =====================================================================
  function paintCompare(canvasCoarse, canvasFine, data, crop) {
    const col = ramp()
    for (const [c, n] of [[canvasCoarse, data.factor], [canvasFine, 1]]) {
      const W = c.clientWidth, H = c.clientHeight, dpr = dprFor(W, H)
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr)
      // crop: [i0, j0, cols, rows] in fine cells, chosen by the caller to match the box aspect
      const [i0, j0, cols, rows] = crop
      const vals = new Float32Array(cols * rows)
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) vals[j * cols + i] = data.v[(j0 + j) * data.w + i0 + i]
      const img = levelImage(vals, cols, rows, n, col, true), x = c.getContext('2d')
      x.imageSmoothingEnabled = false
      x.drawImage(img, 0, 0, img.width * n * (c.width / cols), img.height * n * (c.height / rows))
      if (n > 1) { // gaps between the 100 m cells
        const cw = (c.width / cols) * n, chh = (c.height / rows) * n
        for (let X = cw; X < c.width; X += cw) x.clearRect(Math.round(X) - dpr, 0, dpr, c.height)
        for (let Y = chh; Y < c.height; Y += chh) x.clearRect(0, Math.round(Y) - dpr, c.width, dpr)
      }
    }
  }

  window.HeatRaster = { loadRaster, Hero, paintCompare, lut: () => ramp().lut }
})()
