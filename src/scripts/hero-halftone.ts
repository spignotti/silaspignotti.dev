/** Halftone heat-island hero. Look matches variant B in `.hero-mock.html`. */

export type BerlinPaths = { outline: string; water: string; w: number; h: number }

export type Placement = { s: number; ox: number; oy: number }

const WAVE_MS = 1400
const RESIZE_MS = 150
const DESKTOP = '(min-width: 768px)'

type Mask = { data: Uint8ClampedArray; width: number; height: number }

type Dot = { x: number; y: number; r: number; fade: number; dist: number }

/** Ease-out cubic, the same curve as the mock's `ease`. */
export function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t))
  return 1 - (1 - clamped) ** 3
}

/** Dot spacing in CSS pixels. */
export function dotStep(width: number): number {
  return Math.max(5, width / 150)
}

/**
 * Fit the map into the canvas.
 * Desktop is `place(..., 'full')`: wide box shifted right, full height.
 * On this site the mobile canvas is only the map (the copy sits below it),
 * so the map is contained and centred instead of leaving room for overlaid text.
 */
export function placeMap(mapW: number, mapH: number, width: number, height: number, desktop: boolean): Placement {
  if (!(mapW > 0) || !(mapH > 0)) return { s: 1, ox: 0, oy: 0 }
  if (!desktop) {
    const margin = Math.min(width, height) * 0.04
    const bw = Math.max(0, width - margin * 2)
    const bh = Math.max(0, height - margin * 2)
    const s = Math.min(bw / mapW, bh / mapH)
    return { s, ox: (width - mapW * s) / 2, oy: (height - mapH * s) / 2 }
  }
  const bw = width * 0.78
  const bh = height
  const ox = width * 0.26
  const oy = height * 0.02
  const s = Math.min(bw / mapW, bh / mapH)
  return { s, ox: ox + (bw - mapW * s) / 2, oy: oy + (bh - mapH * s) / 2 }
}

/** 1 at the heat centre, 0.28 once the falloff reaches zero. */
export function heatScale(dist: number): number {
  const falloff = Math.max(0, 1 - dist * 0.85)
  return 0.28 + 0.72 * falloff * falloff
}

/** Intro wave: 0 before the front arrives, 1 once it has passed. */
export function waveAmount(eased: number, dist: number): number {
  return Math.min(1, Math.max(0, eased * 1.6 - dist * 0.6))
}

/** Desktop alpha ramp by x. Off for the stacked mobile layout. */
export function sideFade(x: number, width: number, desktop: boolean): number {
  if (!desktop || !(width > 0)) return 1
  return Math.min(1, Math.max(0, (x / width - 0.22) / 0.4))
}

export function dotRadius(step: number, inside: boolean, dist: number): number {
  if (!inside) return Math.max(0.6, step * 0.08)
  return step * 0.5 * heatScale(dist)
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Land minus water, one map unit per pixel, same composite as the mock. */
function buildMask(berlin: BerlinPaths): Mask | null {
  const width = Math.max(1, Math.round(berlin.w))
  const height = Math.max(1, Math.ceil(berlin.h))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.fillStyle = '#000'
  ctx.fill(new Path2D(berlin.outline), 'evenodd')
  ctx.globalCompositeOperation = 'destination-out'
  // The largest water ring in berlin.json is malformed east of Spandau: it closes the Spree into a
  // wide band across the city. Trust it only for Tegeler See and the northern Havel.
  const rings = berlin.water.split('M').filter((r) => r.trim()).map((r) => `M${r}`)
  const broken = rings.reduce((a, r, i) => (r.length > rings[a]!.length ? i : a), 0)
  ctx.fill(new Path2D(rings.filter((_, i) => i !== broken).join(' ')), 'evenodd')
  const west = new Path2D()
  west.rect(0, 0, 195, height)
  west.rect(0, 0, 290, 268)
  ctx.save()
  ctx.clip(west)
  ctx.fill(new Path2D(rings[broken]), 'evenodd')
  ctx.restore()
  return { data: ctx.getImageData(0, 0, width, height).data, width, height }
}

function inside(mask: Mask, u: number, v: number): boolean {
  const x = u | 0
  const y = v | 0
  if (x < 0 || y < 0 || x >= mask.width || y >= mask.height) return false
  return (mask.data[(y * mask.width + x) * 4 + 3] ?? 0) > 128
}

/** Draw the hero into `hero`'s canvas. One wave on load, then a still frame. */
export function mountHalftoneHero(hero: HTMLElement, berlin: BerlinPaths, reducedMotion: () => boolean): void {
  const canvas = hero.querySelector('canvas')
  if (!(canvas instanceof HTMLCanvasElement)) return
  const ctx = canvas.getContext('2d')
  const mask = buildMask(berlin)
  if (!ctx || !mask) return

  let insideDots: Dot[] = []
  let outsideDots: Dot[] = []
  let progress = 0
  let played = false
  let raf = 0
  let timer = 0
  let lastW = -1
  let lastH = -1
  let lastDpr = -1
  let lastDesktop = false
  let viewW = 0
  let viewH = 0

  const rebuild = (): boolean => {
    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    if (!(width > 0) || !(height > 0)) return false
    const dpr = window.devicePixelRatio || 1
    const desktop = window.matchMedia(DESKTOP).matches
    const wKey = Math.round(width)
    const hKey = Math.round(height)
    if (wKey === lastW && hKey === lastH && dpr === lastDpr && desktop === lastDesktop && played) return true
    lastW = wKey
    lastH = hKey
    lastDpr = dpr
    lastDesktop = desktop
    viewW = width
    viewH = height

    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(height * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const placed = placeMap(berlin.w, berlin.h, width, height, desktop)
    const step = dotStep(width)
    const cx = placed.ox + berlin.w * placed.s * 0.47
    const cy = placed.oy + berlin.h * placed.s * 0.47
    const reach = berlin.w * placed.s * 0.42
    const nextInside: Dot[] = []
    const nextOutside: Dot[] = []
    for (let py = 0; py < height; py += step) {
      for (let px = 0; px < width; px += step) {
        const x = px + step / 2
        const y = py + step / 2
        const u = (x - placed.ox) / placed.s
        const v = (y - placed.oy) / placed.s
        const land = inside(mask, u, v)
        const dist = reach > 0 ? Math.hypot(x - cx, y - cy) / reach : 0
        const fade = sideFade(px, width, desktop)
        const dot = { x, y, r: dotRadius(step, land, dist), fade, dist }
        if (land) nextInside.push(dot)
        else nextOutside.push(dot)
      }
    }
    insideDots = nextInside
    outsideDots = nextOutside
    return true
  }

  const paint = () => {
    ctx.clearRect(0, 0, viewW, viewH)
    const accent = token('--color-accent')
    // Faint field. --color-border sits close to the page in both themes;
    // --color-border-strong is a mid grey and would compete with the accent dots.
    const grid = token('--color-border')
    const eased = easeOutCubic(progress)
    ctx.fillStyle = grid
    for (const dot of outsideDots) {
      const alpha = dot.fade * 0.9
      if (!(alpha > 0)) continue
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = accent
    for (const dot of insideDots) {
      const alpha = dot.fade * waveAmount(eased, dot.dist)
      if (!(alpha > 0)) continue
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  const play = () => {
    cancelAnimationFrame(raf)
    if (reducedMotion()) {
      progress = 1
      paint()
      return
    }
    progress = 0
    paint()
    const t0 = performance.now()
    const step = (now: number) => {
      if (reducedMotion()) {
        progress = 1
        paint()
        return
      }
      progress = Math.min(1, (now - t0) / WAVE_MS)
      paint()
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
  }

  const kick = (delay: number) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      if (!rebuild()) return
      if (!played) {
        played = true
        play()
        return
      }
      paint()
    }, delay)
  }

  kick(0)
  const observer = new ResizeObserver(() => kick(played ? RESIZE_MS : 0))
  observer.observe(canvas)
  window.addEventListener('resize', () => kick(RESIZE_MS))
  window.addEventListener('themechange', () => {
    if (played) paint()
  })
}
