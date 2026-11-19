// Prototype behaviour: theme, figures, scroll-linked motion. Reference for the builder.
;(function () {
  const d = document.documentElement, q = new URLSearchParams(location.search)
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
  const RM = q.get('rm') === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches
  if (RM) d.classList.add('rm')
  const BASE = new URL('../../', document.currentScript.src) // worktree root

  // ---------------- theme: light | dark | system ----------------
  const sys = matchMedia('(prefers-color-scheme: dark)')
  let mode = q.get('theme') || (() => { try { return localStorage.getItem('theme') } catch { return null } })() || 'system'
  function applyTheme() {
    if (mode === 'light' || mode === 'dark') d.dataset.theme = mode
    else delete d.dataset.theme
    d.style.colorScheme = mode === 'system' ? '' : mode
    $$('.theme-menu [data-mode]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === mode)))
    dispatchEvent(new Event('themechange'))
  }
  applyTheme()
  sys.addEventListener('change', () => mode === 'system' && dispatchEvent(new Event('themechange')))
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-btn'), menu = $('.theme-menu')
    if (btn) { const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); menu.hidden = open; if (!open) $('[aria-checked="true"]', menu)?.focus(); return }
    const opt = e.target.closest('.theme-menu [data-mode]')
    if (opt) { mode = opt.dataset.mode; try { localStorage.setItem('theme', mode) } catch {} applyTheme() }
    if (menu && !menu.hidden && !e.target.closest('.theme-menu')) { menu.hidden = true; $('.theme-btn').setAttribute('aria-expanded', 'false') }
    else if (opt) { menu.hidden = true; $('.theme-btn').setAttribute('aria-expanded', 'false'); $('.theme-btn').focus() }
  })
  document.addEventListener('keydown', (e) => {
    const menu = $('.theme-menu'); if (!menu || menu.hidden) return
    const items = $$('[data-mode]', menu), i = items.indexOf(document.activeElement)
    if (e.key === 'Escape') { menu.hidden = true; $('.theme-btn').setAttribute('aria-expanded', 'false'); $('.theme-btn').focus() }
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus() }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[(i + items.length - 1) % items.length].focus() }
  })

  // ---------------- figures: inline the real SVG files ----------------
  const figs = Promise.all($$('[data-fig]').map(async (el, n) => {
    const res = await fetch(new URL(`src/assets/figures/${el.dataset.fig}.svg`, BASE))
    if (!res.ok) return
    const sfx = `-${n}`
    el.innerHTML = (await res.text()).replace(/\bid="([^"]+)"/g, `id="$1${sfx}"`).replace(/aria-labelledby="([^"]+)"/g, (_, ids) => `aria-labelledby="${ids.split(/\s+/).map((x) => x + sfx).join(' ')}"`)
    if (el.dataset.decorative !== undefined) { const s = $('svg', el); s.setAttribute('aria-hidden', 'true'); s.removeAttribute('role'); s.removeAttribute('aria-labelledby') }
  }))

  // ---------------- scroll-linked motion: one listener, rAF-throttled, only in-view items ----------------
  const items = new Set(), active = new Set()
  // progress of an element: 0 when its top is at a*vh, 1 when its top is at b*vh
  const prog = (el, a, b) => { const t = el.getBoundingClientRect().top, vh = innerHeight; return clamp((a * vh - t) / ((a - b) * vh)) }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return active.delete(e.target._m)
    active.add(e.target._m); if (!RM) e.target._m.update() // catch up after a jump (anchor link, reload mid-page)
  }), { rootMargin: '20% 0px' })
  function track(el, update) { const m = { el, update }; el._m = m; items.add(m); io.observe(el); if (RM) update(null); else update(undefined) }
  let ticking = false
  addEventListener('scroll', () => { if (RM || ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; active.forEach((m) => m.update()) }) }, { passive: true })

  // line drawing: --draw goes 1 -> 0 while the container scrolls from 90% to 40% of the viewport
  figs.then(() => $$('[data-draw]').forEach((el) => track(el, (rm) => el.style.setProperty('--draw', rm === null ? 0 : (1 - prog(el, 0.9, 0.4)).toFixed(3)))))

  // timeline rail
  $$('.tline').forEach((el) => track(el, (rm) => el.style.setProperty('--rail', rm === null ? 1 : prog(el, 0.9, 0.5).toFixed(3))))

  // ---------------- heat rasters ----------------
  const H = window.HeatRaster
  const geo = (f) => new URL(`src/assets/geo/${f}`, BASE).href
  const heroEl = $('[data-hero]')
  const wantsHeat = heroEl || $('.cmp') || $('.steps')
  if (!wantsHeat) return
  Promise.all([fetch(geo('berlin.json')).then((r) => r.json()), H.loadRaster(geo('heat-illustrative.json')), $('.cmp') ? H.loadRaster(geo('heat-compare-illustrative.json')) : null]).then(([berlin, heat, cmpData]) => {
    // ---- hero ----
    if (heroEl) {
      const canvas = $('canvas', heroEl), desk = () => innerWidth >= 768
      const glyphs = $$('.hero-legend .lv')
      const hero = new H.Hero({
        canvas, data: heat, outline: berlin.outline, base: 4, levels: [10, 6, 4, 2, 1],
        fit(W, Hh) {
          // desktop: Berlin sits right of centre, below the nav; mobile: centred and slightly cropped
          const k = desk() ? 0.92 : 1.12, s = Math.min(W / berlin.w, Hh / berlin.h) * k
          return { s, ox: W * (desk() ? 0.6 : 0.5) - (berlin.w / 2) * s, oy: Hh * (desk() ? 0.53 : 0.5) - (berlin.h / 2) * s }
        },
        clear: () => (desk() ? $$('.hero-name, .hero-lead, .hero-actions, .hero-legend', heroEl).map((e) => e.getBoundingClientRect()) : []),
        onLevel: (L) => glyphs.forEach((g, i) => g.classList.toggle('on', i === L)),
      })
      const levelNow = () => {
        if (RM) return 4
        let p
        if (desk()) { const r = heroEl.getBoundingClientRect(); p = clamp(-r.top / (r.height - innerHeight) / 0.85) }
        else p = clamp(scrollY / (canvas.offsetHeight * 0.6))
        return Math.min(4, Math.floor(p * 5))
      }
      hero.build()
      if (RM) hero.show(4, { instant: true }); else hero.show(levelNow(), { duration: 900 })
      track(heroEl, () => hero.show(levelNow()))
      let lastW = innerWidth, lastH = innerHeight, rz
      addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => {
        if (innerWidth === lastW && (!desk() || Math.abs(innerHeight - lastH) < 120)) return // ignore mobile URL-bar resizes
        lastW = innerWidth; lastH = innerHeight; hero.redraw() }, 150) })
      addEventListener('themechange', () => hero.redraw())
    }

    // ---- compare slider ----
    $$('.cmp').forEach((box) => {
      const [a, b] = $$('canvas', box), handle = $('.handle', box)
      let touched = false
      const crop = () => (innerWidth >= 768 ? [0, 0, cmpData.w, cmpData.h] : [Math.round((cmpData.w - 160) / 2), 0, 160, 120])
      const paint = () => H.paintCompare(a, b, cmpData, crop())
      const setX = (p) => { box.style.setProperty('--x', (p * 100).toFixed(2) + '%'); handle.setAttribute('aria-valuenow', Math.round(p * 100)) }
      paint(); setX(RM ? 0.5 : 0.85)
      if (!RM) track(box, () => { if (!touched) setX(0.85 - 0.7 * prog(box, 0.85, 0.2)) })
      const move = (e) => { const r = box.getBoundingClientRect(); setX(clamp((e.clientX - r.left) / r.width)); touched = true }
      let drag = false
      box.addEventListener('pointerdown', (e) => { drag = true; box.setPointerCapture(e.pointerId); move(e) })
      box.addEventListener('pointermove', (e) => drag && move(e))
      box.addEventListener('pointerup', () => (drag = false))
      handle.addEventListener('keydown', (e) => {
        const v = +handle.getAttribute('aria-valuenow'), step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -20, PageUp: 20 }[e.key]
        if (step !== undefined) { e.preventDefault(); touched = true; setX(clamp((v + step) / 100)) }
        if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); touched = true; setX(e.key === 'Home' ? 0 : 1) }
      })
      let lw = innerWidth; addEventListener('resize', () => { if (innerWidth !== lw) { lw = innerWidth; paint() } })
      addEventListener('themechange', paint)
    })

    // ---- "So arbeite ich": glyphs sharpen 1 -> 2^i cells per side as the list scrolls in ----
    const list = $('.steps')
    if (list) {
      const cvs = $$('canvas', list), N = 16, patch = new Float32Array(N * N)
      // a 16 x 16 patch of the hero raster in berlin.json map units (x 416-544, y 320-448), so it survives a data swap
      const P = [416, 320, 128], fx = heat.w / (heat.frame[2] - heat.frame[0]), fy = heat.h / (heat.frame[3] - heat.frame[1])
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const mx = P[0] + ((i + 0.5) / N) * P[2], my = P[1] + ((j + 0.5) / N) * P[2]
        patch[j * N + i] = heat.v[Math.floor((my - heat.frame[1]) * fy) * heat.w + Math.floor((mx - heat.frame[0]) * fx)]
      }
      let lut, shown = []
      const draw = (c, n) => {
        const w = c.clientWidth, dpr = Math.min(2, devicePixelRatio || 1); if (c.width !== Math.round(w * dpr)) { c.width = c.height = Math.round(w * dpr) }
        const x = c.getContext('2d'), cell = c.width / n, k = N / n
        for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
          let s = 0, m = 0; for (let b = 0; b < k; b++) for (let a = 0; a < k; a++) { const v = patch[(j * k + b) * N + i * k + a]; if (v === v) { s += v; m++ } }
          const t = Math.round(clamp(m ? s / m : 0) * 255) * 3; x.fillStyle = `rgb(${lut[t]},${lut[t + 1]},${lut[t + 2]})`
          const gap = n > 1 && n < 16 ? Math.max(1, dpr) : 0
          x.fillRect(Math.round(i * cell), Math.round(j * cell), Math.ceil(cell) - gap, Math.ceil(cell) - gap)
        }
      }
      const update = (rm) => {
        const p = rm === null ? 1 : prog(list, 0.85, 0.45), lvl = Math.floor(p * 5) // 0..5
        cvs.forEach((c, i) => { const n = 2 ** Math.min(i, Math.max(0, lvl - 1)); if (shown[i] !== n) { shown[i] = n; draw(c, n) } })
      }
      const redraw = () => { lut = H.lut(); shown = []; update(RM ? null : undefined) }
      lut = H.lut(); track(list, update)
      addEventListener('themechange', redraw)
    }
  })
})()
