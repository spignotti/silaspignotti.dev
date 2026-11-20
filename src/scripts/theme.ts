/** Light, dark, or system. System removes the attribute so the CSS media query applies. */
export function initTheme(): void {
  const root = document.documentElement
  const menu = document.querySelector<HTMLElement>('.theme-menu')
  const btn = document.querySelector<HTMLButtonElement>('.theme-btn')
  if (!menu || !btn) return

  const sys = window.matchMedia('(prefers-color-scheme: dark)')
  let mode = 'system'
  try {
    mode = localStorage.getItem('theme') || 'system'
  } catch {
    mode = 'system'
  }
  if (mode !== 'light' && mode !== 'dark' && mode !== 'system') mode = 'system'

  const apply = () => {
    if (mode === 'light' || mode === 'dark') {
      root.dataset.theme = mode
      root.style.colorScheme = mode
    } else {
      delete root.dataset.theme
      root.style.colorScheme = ''
    }
    menu.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((item) => {
      item.setAttribute('aria-checked', String(item.dataset.mode === mode))
    })
    window.dispatchEvent(new Event('themechange'))
  }
  apply()
  sys.addEventListener('change', () => {
    if (mode === 'system') window.dispatchEvent(new Event('themechange'))
  })

  const control = btn.closest('.theme') ?? menu
  const closeMenu = () => {
    menu.hidden = true
    btn.setAttribute('aria-expanded', 'false')
  }

  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('.theme-btn')) {
      const open = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', String(!open))
      menu.hidden = open
      if (!open) menu.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()
      return
    }
    const option = target.closest<HTMLButtonElement>('.theme-menu [data-mode]')
    if (option?.dataset.mode) {
      mode = option.dataset.mode
      try {
        localStorage.setItem('theme', mode)
      } catch {
        /* storage can be blocked */
      }
      apply()
    }
    if (!menu.hidden && !target.closest('.theme-menu')) closeMenu()
    else if (option) {
      closeMenu()
      btn.focus()
    }
  })

  control.addEventListener('focusout', (event) => {
    const next = event instanceof FocusEvent ? event.relatedTarget : null
    if (next instanceof Node && control.contains(next)) return
    requestAnimationFrame(() => {
      if (menu.hidden || control.contains(document.activeElement)) return
      closeMenu()
    })
  })

  document.addEventListener('keydown', (event) => {
    if (menu.hidden) return
    if (event.key === 'Escape') {
      closeMenu()
      btn.focus()
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    if (!control.contains(document.activeElement)) return
    event.preventDefault()
    const items = [...menu.querySelectorAll<HTMLButtonElement>('[data-mode]')]
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    const nextIndex = index < 0 ? (step > 0 ? 0 : items.length - 1) : (index + step + items.length) % items.length
    items[nextIndex]?.focus()
  })
}
