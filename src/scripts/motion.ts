import berlin from '../assets/geo/berlin.json'
import { mountHalftoneHero } from './hero-halftone'
import { createScrollScheduler } from './scroll'

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value))

/** Scroll-linked line drawing, plus the one-shot hero. */
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
  mountHalftoneHero(heroEl, berlin, isReduced)
}
