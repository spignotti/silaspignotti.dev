import berlinUrl from '../assets/geo/berlin.json?url'
import heatJson from '../assets/geo/heat-illustrative.json?url'
import heatPng from '../assets/geo/heat-illustrative.png?url'
import { Hero, createScrollScheduler, loadRaster, startHero, type RasterData } from './heat-raster'

type Berlin = { outline: string; w: number; h: number }

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value))

/** Scroll-linked motion for the hero and the line drawing. */
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

  const heroEl = document.querySelector<HTMLElement>('[data-hero]')
  if (!heroEl) return

  void Promise.all([fetch(berlinUrl).then((response) => response.json() as Promise<Berlin>), loadRaster(heatJson, heatPng)])
    .then(([berlin, heat]) => mountHero(heroEl, berlin, heat, isReduced, track))
    .catch(() => {})
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
        ? [...heroEl.querySelectorAll('.hero-name, .hero-lead, .hero-actions')].map((el) => el.getBoundingClientRect())
        : [],
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
