/** Fade and rise for [data-reveal]. Elements already in view stay visible. */
let started = false

export function initReveal(): void {
  if (started) return
  started = true
  const root = document.documentElement
  const reduced = root.classList.contains('rm') || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!root.classList.contains('js') || reduced) return

  const elements = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
  const seen = new Map<Element, number>()
  for (const el of elements) {
    const parent = el.parentElement
    if (!parent) continue
    const index = seen.get(parent) ?? 0
    el.style.setProperty('--reveal-i', String(Math.min(index, 4)))
    seen.set(parent, index + 1)
  }

  const height = window.innerHeight
  if (height <= 0) return
  const inView = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    return rect.top < height && rect.bottom > 0
  }
  const waiting = elements.filter((el) => !inView(el))
  for (const el of waiting) el.classList.add('reveal-wait')
  if (waiting.length === 0) return

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-in')
      observer.unobserve(entry.target)
    }
  })
  for (const el of waiting) observer.observe(el)

  // Layout can settle after the first measure (fonts, hash). Never keep an in-view element hidden.
  requestAnimationFrame(() => {
    for (const el of waiting) {
      if (!el.classList.contains('reveal-wait') || !inView(el)) continue
      el.classList.remove('reveal-wait', 'is-in')
      observer.unobserve(el)
    }
  })
}
