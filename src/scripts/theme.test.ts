import assert from 'node:assert/strict'
import test from 'node:test'
import { initTheme } from './theme.ts'

type Evt = { type: string; target: DomEl; key?: string; preventDefault: () => void; prevented: boolean }
type Listener = (event: Evt) => void

class DomEl {
  parent: DomEl | null = null
  children: DomEl[] = []
  className = ''
  hidden = false
  dataset: Record<string, string | undefined> = {}
  style = { colorScheme: '' }
  attrs = new Map<string, string>()
  listeners = new Map<string, Listener[]>()

  setAttribute(name: string, value: string) {
    this.attrs.set(name, value)
  }
  getAttribute(name: string) {
    return this.attrs.get(name) ?? null
  }
  addEventListener(type: string, fn: Listener) {
    const list = this.listeners.get(type) ?? []
    list.push(fn)
    this.listeners.set(type, list)
  }
  matches(selector: string): boolean {
    if (selector.startsWith('.')) return this.className.split(/\s+/).includes(selector.slice(1))
    if (selector === '[data-mode]') return this.dataset.mode !== undefined
    if (selector === '[role^="menuitem"]') return (this.getAttribute('role') ?? '').startsWith('menuitem')
    return false
  }
  closest(selector: string): DomEl | null {
    for (let el: DomEl | null = this; el; el = el.parent) if (el.matches(selector)) return el
    return null
  }
  querySelectorAll(selector: string): DomEl[] {
    const out: DomEl[] = []
    const walk = (el: DomEl) => {
      for (const child of el.children) {
        if (child.matches(selector)) out.push(child)
        walk(child)
      }
    }
    walk(this)
    return out
  }
  querySelector(selector: string): DomEl | null {
    return this.querySelectorAll(selector)[0] ?? null
  }
  append(child: DomEl) {
    child.parent = this
    this.children.push(child)
    return child
  }
  focus() {
    active = this
    dispatch('focusin', this)
  }
  contains(node: unknown): boolean {
    return node === this || this.children.some((child) => child.contains(node))
  }
}

let active: DomEl | null = null
const docListeners = new Map<string, Listener[]>()

function dispatch(type: string, target: DomEl, key?: string): boolean {
  const event: Evt = { type, target, key, prevented: false, preventDefault: () => (event.prevented = true) }
  for (let el: DomEl | null = target; el; el = el.parent) for (const fn of el.listeners.get(type) ?? []) fn(event)
  for (const fn of docListeners.get(type) ?? []) fn(event)
  return event.prevented
}

/** A hidden element cannot be hit; the click lands on whatever is behind it. */
function click(target: DomEl) {
  for (let el: DomEl | null = target; el; el = el.parent) if (el.hidden && el.parent) target = el.parent
  dispatch('click', target)
}

/** Safari on mousedown: the focused element blurs, nothing else takes focus. */
function blurToBody() {
  active = null
}

function install() {
  active = null
  docListeners.clear()
  const root = new DomEl()
  const theme = root.append(new DomEl())
  theme.className = 'theme'
  const btn = theme.append(new DomEl())
  btn.className = 'menu-btn'
  btn.setAttribute('aria-expanded', 'false')
  const menu = theme.append(new DomEl())
  menu.className = 'menu-list'
  menu.hidden = true
  for (const mode of ['light', 'dark', 'system']) {
    const item = menu.append(new DomEl())
    item.dataset.mode = mode
    item.setAttribute('role', 'menuitemradio')
  }
  const outside = root.append(new DomEl())

  let stored: string | null = 'light'
  Object.assign(globalThis, {
    Element: DomEl,
    Node: DomEl,
    document: {
      documentElement: root,
      get activeElement() {
        return active
      },
      querySelector: (selector: string) => root.querySelector(selector),
      addEventListener(type: string, fn: Listener) {
        const list = docListeners.get(type) ?? []
        list.push(fn)
        docListeners.set(type, list)
      },
    },
    localStorage: {
      getItem: () => stored,
      setItem: (_key: string, value: string) => {
        stored = value
      },
    },
    dispatchEvent: () => true,
    Event: class {
      constructor(public type: string) {}
    },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
  })
  ;(globalThis as { window?: unknown }).window = globalThis
  initTheme()
  const [light, dark, system] = menu.querySelectorAll('[data-mode]') as [DomEl, DomEl, DomEl]
  return { root, btn, menu, outside, light, dark, system, stored: () => stored }
}

test('a click on an option applies it even when the click never moved focus (Safari)', () => {
  const { root, btn, menu, dark, system, stored } = install()
  assert.equal(root.dataset.theme, 'light')

  click(btn)
  assert.equal(menu.hidden, false)
  blurToBody()
  click(dark)
  assert.equal(root.dataset.theme, 'dark')
  assert.equal(stored(), 'dark')
  assert.equal(menu.hidden, true)
  assert.equal(btn.getAttribute('aria-expanded'), 'false')

  click(btn)
  blurToBody()
  click(system)
  assert.equal(root.dataset.theme, undefined)
  assert.equal(system.getAttribute('aria-checked'), 'true')
})

test('the menu closes on a click outside, on focus outside and on Escape', () => {
  const { btn, menu, outside } = install()
  click(btn)
  click(outside)
  assert.equal(menu.hidden, true)

  click(btn)
  outside.focus()
  assert.equal(menu.hidden, true)

  click(btn)
  assert.equal(dispatch('keydown', active ?? btn, 'Escape'), true)
  assert.equal(menu.hidden, true)
  assert.equal(active, btn)
})

test('arrow keys move between options inside the open menu', () => {
  const { btn, light, dark, system } = install()
  click(btn)
  assert.equal(active, light)
  dispatch('keydown', light, 'ArrowDown')
  assert.equal(active, dark)
  dispatch('keydown', dark, 'ArrowUp')
  assert.equal(active, light)
  dispatch('keydown', light, 'ArrowUp')
  assert.equal(active, system)
})
