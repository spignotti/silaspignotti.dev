import { bindMenu } from './menu.ts'

/** Light, dark, or system. System removes the attribute so the CSS media query applies. */
export function initTheme(): void {
  const root = document.documentElement
  const control = document.querySelector<HTMLElement>('.theme')
  if (!control) return

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
    control.querySelectorAll<HTMLElement>('[data-mode]').forEach((item) => {
      item.setAttribute('aria-checked', String(item.dataset.mode === mode))
    })
    window.dispatchEvent(new Event('themechange'))
  }
  apply()
  sys.addEventListener('change', () => {
    if (mode === 'system') window.dispatchEvent(new Event('themechange'))
  })

  bindMenu(control, (item) => {
    if (!item.dataset.mode) return
    mode = item.dataset.mode
    try {
      localStorage.setItem('theme', mode)
    } catch {
      /* storage can be blocked */
    }
    apply()
  })
}
