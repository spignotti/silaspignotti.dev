import berlinUrl from '../assets/geo/berlin.json?url'
import cmpJson from '../assets/geo/heat-compare-illustrative.json?url'
import cmpPng from '../assets/geo/heat-compare-illustrative.png?url'
import heatJson from '../assets/geo/heat-illustrative.json?url'
import heatPng from '../assets/geo/heat-illustrative.png?url'
import { Hero, createScrollScheduler, loadRaster, lut, paintCompare, startHero, watchCanvas, type RasterData } from './heat-raster'
import { bindPointerDrag } from './pointer-drag'

type Berlin = { outline: string; w: number; h: number }

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value))

/** Scroll-linked motion for the hero, compare slider, step glyphs, line drawing and the timeline. */
export function initMotion(): void {
  const root = document.documentElement
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  // A class already on <html> while the query does not match is an override (?rm=1).
  const forcedRm = root.classList.contains('rm') && !motionQuery.matches
  const isReduced = () => forcedRm || motionQuery.matches
  if (isReduced()) root.classList.add('rm')

  const items = new Set<{ update: (end: boolean) => void }>()
  const active = new Set<{ update: (end: boolean) => void }>()
  const progress = (el: Element, start: number, end: number) => {
    const top = el.getBoundingClientRect().top
    const height = window.innerHeight
    return clamp((start * height - top) / ((start - end) * height))
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const item = (entry.target as Element & { _motion?: { update: (end: boolean) => void } })._motion
        if (!item) continue
        if (!entry.isIntersecting) {
          active.delete(item)
          continue
        }
        active.add(item)
        if (!isReduced()) item.update(false)
      }
    },
    { rootMargin: '20% 0px' },
  )
  const track = (el: Element, update: (end: boolean) => void) => {
    const item = { update }
    ;(el as Element & { _motion?: typeof item })._motion = item
    items.add(item)
    observer.observe(el)
    update(isReduced())
  }
  if (items.size >= 0) {
    const onScroll = createScrollScheduler(() => {
      if (isReduced()) return
      active.forEach((item) => item.update(false))
    })
    window.addEventListener('scroll', onScroll, { passive: true })
  }
  motionQuery.addEventListener('change', () => {
    root.classList.toggle('rm', isReduced())
    const end = isReduced()
    for (const item of items) item.update(end)
  })

  document.querySelectorAll<HTMLElement>('[data-draw]').forEach((el) => {
    track(el, (end) => {
      el.style.setProperty('--draw', end ? '0' : (1 - progress(el, 0.9, 0.4)).toFixed(3))
    })
  })
  document.querySelectorAll<HTMLElement>('.tline').forEach((el) => {
    track(el, (end) => {
      el.style.setProperty('--rail', end ? '1' : progress(el, 0.9, 0.5).toFixed(3))
    })
  })

  const heroEl = document.querySelector<HTMLElement>('[data-hero]')
  const compare = document.querySelector('.cmp')
  const steps = document.querySelector<HTMLElement>('.steps')
  if (!heroEl && !compare && !steps) return

  if (heroEl || steps) {
    const berlinHeat = Promise.all([
      fetch(berlinUrl).then((response) => response.json() as Promise<Berlin>),
      loadRaster(heatJson, heatPng),
    ])
    if (heroEl) {
      void berlinHeat.then(([berlin, heat]) => mountHero(heroEl, berlin, heat, isReduced, track)).catch(() => {})
    }
    if (steps) {
      void berlinHeat.then(([, heat]) => mountSteps(steps, heat, isReduced, track)).catch(() => {})
    }
  }
  if (compare) {
    void loadRaster(cmpJson, cmpPng)
      .then((data) => mountCompare(data, isReduced, track))
      .catch(() => {})
  }
}

function mountHero(
  heroEl: HTMLElement,
  berlin: Berlin,
  heat: RasterData,
  isReduced: () => boolean,
  track: (el: Element, update: (end: boolean) => void) => void,
) {
  const canvas = heroEl.querySelector('canvas')
  if (!canvas) return
  // Same height threshold as the pinned hero in site.css (copy height + nav).
  const pinnedHero = window.matchMedia('(min-width: 768px) and (min-height: 454px)')
  const desk = () => pinnedHero.matches
  const glyphs = [...heroEl.querySelectorAll<HTMLElement>('.hero-legend .lv')]
  const hero = new Hero({
    canvas,
    data: heat,
    outline: berlin.outline,
    base: 4,
    levels: [10, 6, 4, 2, 1],
    fit(width, height) {
      const scale = Math.min(width / berlin.w, height / berlin.h) * (desk() ? 0.92 : 1.12)
      return {
        s: scale,
        ox: width * (desk() ? 0.6 : 0.5) - (berlin.w / 2) * scale,
        oy: height * (desk() ? 0.53 : 0.5) - (berlin.h / 2) * scale,
      }
    },
    clear: () =>
      desk()
        ? [...heroEl.querySelectorAll('.hero-name, .hero-lead, .hero-actions, .hero-legend')].map((el) => el.getBoundingClientRect())
        : [],
    onLevel: (level) => glyphs.forEach((glyph, index) => glyph.classList.toggle('on', index === level)),
  })
  const levelNow = () => {
    if (isReduced()) return 4
    let amount: number
    if (desk()) {
      const rect = heroEl.getBoundingClientRect()
      amount = clamp(-rect.top / (rect.height - window.innerHeight) / 0.85)
    } else amount = clamp(window.scrollY / (canvas.offsetHeight * 0.6))
    return Math.min(4, Math.floor(amount * 5))
  }
  startHero(hero, { reducedMotion: isReduced, level: levelNow })
  track(heroEl, (end) => {
    if (hero.W > 0) hero.show(levelNow(), end || isReduced() ? { instant: true } : undefined)
  })
  let lastW = window.innerWidth
  let lastH = window.innerHeight
  let lastPinned = desk()
  let timer = 0
  window.addEventListener('resize', () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      const pinned = desk()
      const crossed = pinned !== lastPinned
      if (window.innerWidth === lastW && !crossed && (!pinned || Math.abs(window.innerHeight - lastH) < 120)) return
      lastW = window.innerWidth
      lastH = window.innerHeight
      lastPinned = pinned
      hero.redraw()
    }, 150)
  })
  window.addEventListener('themechange', () => hero.redraw())
}

function mountCompare(data: RasterData, isReduced: () => boolean, track: (el: Element, update: (end: boolean) => void) => void) {
  document.querySelectorAll<HTMLElement>('.cmp').forEach((box) => {
    const canvases = [...box.querySelectorAll('canvas')]
    const coarse = canvases[0]
    const fine = canvases[1]
    const handle = box.querySelector<HTMLElement>('.handle')
    if (!coarse || !fine || !handle) return
    const slot = box.closest('.cmp-slot')
    box.hidden = false
    slot?.classList.add('is-live')
    let touched = false
    const crop = () => (window.innerWidth >= 768 ? [0, 0, data.w, data.h] : [Math.round((data.w - 160) / 2), 0, 160, 120])
    const paint = () => paintCompare(coarse, fine, data, crop())
    const setX = (value: number) => {
      const next = clamp(value)
      box.style.setProperty('--x', `${(next * 100).toFixed(2)}%`)
      handle.setAttribute('aria-valuenow', String(Math.round(next * 100)))
    }
    watchCanvas(coarse, paint)
    track(box, (end) => {
      if (touched) return
      if (end || isReduced()) setX(0.5)
      else setX(0.85 - 0.7 * progressOf(box))
    })
    const move = (event: PointerEvent) => {
      const rect = box.getBoundingClientRect()
      setX((event.clientX - rect.left) / rect.width)
      touched = true
    }
    bindPointerDrag(box, move)
    handle.addEventListener('keydown', (event) => {
      const current = Number(handle.getAttribute('aria-valuenow'))
      const steps: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 }
      const step = steps[event.key]
      if (step !== undefined) {
        event.preventDefault()
        touched = true
        setX((current + step) / 100)
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        touched = true
        setX(event.key === 'Home' ? 0 : 1)
      }
    })
    let width = window.innerWidth
    window.addEventListener('resize', () => {
      if (window.innerWidth !== width) {
        width = window.innerWidth
        paint()
      }
    })
    window.addEventListener('themechange', paint)
  })
}

function progressOf(el: Element) {
  const top = el.getBoundingClientRect().top
  const height = window.innerHeight
  return clamp((0.85 * height - top) / ((0.85 - 0.2) * height))
}

function mountSteps(list: HTMLElement, heat: RasterData, isReduced: () => boolean, track: (el: Element, update: (end: boolean) => void) => void) {
  const canvases = [...list.querySelectorAll('canvas')]
  const count = 16
  const patch = new Float32Array(count * count)
  const origin = [416, 320, 128]
  const frame = heat.frame
  const fx = heat.w / ((frame[2] ?? 0) - (frame[0] ?? 0))
  const fy = heat.h / ((frame[3] ?? 0) - (frame[1] ?? 0))
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      const mx = (origin[0] ?? 0) + ((x + 0.5) / count) * (origin[2] ?? 0)
      const my = (origin[1] ?? 0) + ((y + 0.5) / count) * (origin[2] ?? 0)
      patch[y * count + x] = heat.v[Math.floor((my - (frame[1] ?? 0)) * fy) * heat.w + Math.floor((mx - (frame[0] ?? 0)) * fx)] ?? NaN
    }
  }
  let ramp = lut()
  let shown: number[] = []
  const draw = (canvas: HTMLCanvasElement, cells: number) => {
    const width = canvas.clientWidth
    if (!(width > 0)) return
    const ratio = Math.min(2, window.devicePixelRatio || 1)
    const size = Math.round(width * ratio)
    if (canvas.width !== size) canvas.width = canvas.height = size
    const context = canvas.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    const cell = canvas.width / cells
    const sample = count / cells
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        let sum = 0
        let hits = 0
        for (let by = 0; by < sample; by++) {
          for (let bx = 0; bx < sample; bx++) {
            const value = patch[(y * sample + by) * count + x * sample + bx] ?? NaN
            if (value === value) {
              sum += value
              hits++
            }
          }
        }
        const index = Math.round(clamp(hits ? sum / hits : 0) * 255) * 3
        context.fillStyle = `rgb(${ramp[index]},${ramp[index + 1]},${ramp[index + 2]})`
        const gap = cells > 1 && cells < 16 ? Math.max(1, ratio) : 0
        context.fillRect(Math.round(x * cell), Math.round(y * cell), Math.ceil(cell) - gap, Math.ceil(cell) - gap)
      }
    }
  }
  const update = (end: boolean) => {
    const amount = end || isReduced() ? 1 : progressOfSteps(list)
    const level = Math.floor(amount * 5)
    canvases.forEach((canvas, index) => {
      const cells = 2 ** Math.min(index, Math.max(0, level - 1))
      if (shown[index] !== cells) {
        shown[index] = cells
        draw(canvas, cells)
      }
    })
  }
  const redraw = () => {
    ramp = lut()
    shown = []
    update(isReduced())
  }
  ramp = lut()
  track(list, update)
  window.addEventListener('themechange', redraw)
}

function progressOfSteps(el: Element) {
  const top = el.getBoundingClientRect().top
  const height = window.innerHeight
  return clamp((0.85 * height - top) / ((0.85 - 0.45) * height))
}
