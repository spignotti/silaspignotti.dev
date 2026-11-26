/**
 * Small disclosure menu in the nav: `.menu-btn` toggles `.menu-list`.
 * It closes on a pick, Escape, a click outside, or focus moving elsewhere.
 * No focusout timer: Safari does not focus buttons on click, so a blur on
 * mousedown must not close the list before the click lands.
 */
export function bindMenu(control: HTMLElement | null, onPick?: (item: HTMLElement) => void): void {
  const btn = control?.querySelector<HTMLButtonElement>('.menu-btn')
  const menu = control?.querySelector<HTMLElement>('.menu-list')
  if (!control || !btn || !menu) return

  const items = () => [...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]')]
  const close = (refocus = false) => {
    if (menu.hidden) return
    menu.hidden = true
    btn.setAttribute('aria-expanded', 'false')
    if (refocus) btn.focus()
  }

  btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-expanded') === 'true') return close()
    menu.hidden = false
    btn.setAttribute('aria-expanded', 'true')
    const current = items().find((item) => item.getAttribute('aria-checked') === 'true') ?? items()[0]
    current?.focus()
  })

  menu.addEventListener('click', (event) => {
    const item = event.target instanceof Element ? event.target.closest<HTMLElement>('[role^="menuitem"]') : null
    if (!item) return
    onPick?.(item)
    close(true)
  })

  const outside = (event: Event) => {
    if (event.target instanceof Node && !control.contains(event.target)) close()
  }
  document.addEventListener('click', outside)
  document.addEventListener('focusin', outside)

  control.addEventListener('keydown', (event) => {
    if (menu.hidden) return
    if (event.key === 'Escape') {
      event.preventDefault()
      return close(true)
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const list = items()
    const index = list.indexOf(document.activeElement as HTMLElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    const next = index < 0 ? (step > 0 ? 0 : list.length - 1) : (index + step + list.length) % list.length
    list[next]?.focus()
  })
}
