/** Build-up for figure.fig diagrams. No class means the static final state. */
let started = false

/** Delay in ms from the bounding-box centre, 0 at the left edge to 700 at the right. */
export function buildDelay(centerX: number, originX: number, width: number): number {
  if (!(width > 0)) return 0
  const t = Math.min(1, Math.max(0, (centerX - originX) / width))
  return Math.round(t * 700)
}

/** Horizontal bars grow on x. A bar is horizontal when it is wider than it is tall. */
export function barGrow(width: number, height: number): 'x' | 'y' {
  return width > height ? 'x' : 'y'
}

export function initFigureAnim(): void {
  if (started) return
  started = true
  const root = document.documentElement
  const reduced = root.classList.contains('rm') || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!root.classList.contains('js') || reduced) return
  if (window.innerHeight <= 0) return

  const waiting: HTMLElement[] = []
  for (const figure of document.querySelectorAll<HTMLElement>('figure.fig')) {
    const svg = figure.querySelector(':scope > .fig-art > svg')
    if (!(svg instanceof SVGSVGElement)) continue
    prepare(svg)
    figure.classList.add('fig-build')
    if (shownEnough(figure)) figure.classList.add('is-in')
    else waiting.push(figure)
  }
  if (waiting.length === 0) return

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.3 },
  )
  for (const figure of waiting) observer.observe(figure)

  requestAnimationFrame(() => {
    for (const figure of waiting) {
      if (figure.classList.contains('is-in') || !shownEnough(figure)) continue
      figure.classList.add('is-in')
      observer.unobserve(figure)
    }
  })
}

function prepare(svg: SVGSVGElement): void {
  const span = svgSpan(svg)
  for (const child of svg.children) {
    if (child.localName === 'title' || child.localName === 'desc') continue
    const box = boxOf(child)
    const center = box ? box.x + box.width / 2 : span.origin
    if (child instanceof SVGElement) child.style.setProperty('--d', `${buildDelay(center, span.origin, span.width)}ms`)
    if (child.localName !== 'rect' || !box) continue
    if (!child.classList.contains('fig-bar') && !child.classList.contains('fig-bar-acc')) continue
    const size = sizeOf(child, box)
    child.setAttribute('data-grow', barGrow(size.width, size.height))
  }
}

function svgSpan(svg: SVGSVGElement): { origin: number; width: number } {
  const view = svg.viewBox.baseVal
  if (view.width > 0) return { origin: view.x, width: view.width }
  try {
    const box = svg.getBBox()
    return { origin: box.x, width: box.width }
  } catch {
    return { origin: 0, width: 0 }
  }
}

function boxOf(el: Element): DOMRect | null {
  if (!(el instanceof SVGGraphicsElement)) return null
  try {
    return el.getBBox()
  } catch {
    return null
  }
}

function sizeOf(el: Element, box: DOMRect): { width: number; height: number } {
  if (el instanceof SVGRectElement) {
    const width = el.width.baseVal
    const height = el.height.baseVal
    if (width.unitType !== SVGLength.SVG_LENGTHTYPE_PERCENTAGE && height.unitType !== SVGLength.SVG_LENGTHTYPE_PERCENTAGE) {
      return { width: width.value, height: height.value }
    }
  }
  return { width: box.width, height: box.height }
}

function shownEnough(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect()
  const view = window.innerHeight
  if (view <= 0 || rect.height <= 0) return false
  const visible = Math.min(rect.bottom, view) - Math.max(rect.top, 0)
  return visible > 0 && visible / rect.height >= 0.3
}
