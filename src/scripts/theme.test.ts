import assert from 'node:assert/strict'
import test from 'node:test'
import { initTheme } from './theme.ts'

type Listener = (event: { target?: DomEl; relatedTarget?: DomEl | null; key?: string; preventDefault?: () => void }) => void

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
    if (selector.startsWith('.') && !selector.includes(' ')) return this.className.split(/\s+/).includes(selector.slice(1))
    if (selector === '[data-mode]') return this.dataset.mode !== undefined
    if (selector === '[aria-checked="true"]') return this.getAttribute('aria-checked') === 'true'
    if (selector === '.theme-menu [data-mode]') return this.dataset.mode !== undefined && this.hasAncestor('theme-menu')
    return false
  }
  hasAncestor(className: string): boolean {
    let parent = this.parent
    while (parent) {
      if (parent.className.split(/\s+/).includes(className)) return true
      parent = parent.parent
    }
    return false
  }
  closest(selector: string): DomEl | null {
    let current: DomEl | null = this
    while (current) {
      if (current.matches(selector)) return current
      current = current.parent
    }
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
  }
  focus() {
    active = this
  }
  contains(node: unknown): boolean {
    if (node === this) return true
    return this.children.some((child) => child.contains(node))
  }
}

let active: DomEl | null = null
const docListeners = new Map<string, Listener[]>()
let frames: FrameRequestCallback[] = []

class FocusEvt {
  relatedTarget: DomEl | null
  constructor(_type: string, init?: { relatedTarget?: DomEl | null }) {
    this.relatedTarget = init?.relatedTarget ?? null
  }
}

function install() {
  active = null
  docListeners.clear()
  frames = []
  const root = new DomEl()
  const theme = new DomEl()
  theme.className = 'theme'
  const btn = new DomEl()
  btn.className = 'theme-btn'
  btn.setAttribute('aria-expanded', 'false')
  const menu = new DomEl()
  menu.className = 'theme-menu'
  menu.hidden = true
  for (const mode of ['light', 'dark', 'system']) {
    const item = new DomEl()
    item.dataset.mode = mode
    item.setAttribute('aria-checked', mode === 'system' ? 'true' : 'false')
    menu.append(item)
  }
  theme.append(btn)
  theme.append(menu)
  root.append(theme)
  const outside = new DomEl()
  root.append(outside)

  const documentStub = {
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
  }
  Object.assign(globalThis, {
    Element: DomEl,
    Node: DomEl,
    FocusEvent: FocusEvt,
    document: documentStub,
    localStorage: { getItem: () => null, setItem() {} },
    requestAnimationFrame: (cb: FrameRequestCallback) => {
      frames.push(cb)
      return frames.length
    },
    dispatchEvent: () => true,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
  })
  ;(globalThis as { window?: unknown }).window = globalThis
  initTheme()
  return { btn, menu, theme, outside, items: menu.querySelectorAll('[data-mode]') }
}

function click(target: DomEl) {
  for (const fn of docListeners.get('click') ?? []) fn({ target })
}

function key(name: string) {
  let prevented = false
  for (const fn of docListeners.get('keydown') ?? []) {
    fn({ key: name, preventDefault: () => { prevented = true } })
  }
  return prevented
}

function focusOut(from: DomEl, related: DomEl | null) {
  const event = new FocusEvt('focusout', { relatedTarget: related })
  for (const fn of from.listeners.get('focusout') ?? []) fn(event)
}

function flush() {
  const queued = frames.splice(0)
  for (const cb of queued) cb(0)
}

test('the theme menu closes when focus leaves and ignores arrows outside it', () => {
  const { btn, menu, theme, outside, items } = install()
  click(btn)
  assert.equal(menu.hidden, false)
  assert.equal(btn.getAttribute('aria-expanded'), 'true')

  outside.focus()
  focusOut(theme, items[1] ?? null)
  flush()
  assert.equal(menu.hidden, false)

  focusOut(theme, outside)
  flush()
  assert.equal(menu.hidden, true)
  assert.equal(btn.getAttribute('aria-expanded'), 'false')

  click(btn)
  outside.focus()
  assert.equal(key('ArrowDown'), false)
  assert.equal(active, outside)

  items[0]?.focus()
  assert.equal(key('ArrowDown'), true)
  assert.equal(active, items[1])
  assert.equal(key('ArrowUp'), true)
  assert.equal(active, items[0])
})
