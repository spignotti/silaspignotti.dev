// Writes the diagram and chart figures (DE + EN) and the three non-raster covers into
// src/assets/figures. Geometry is authored here by hand; the script only swaps the language strings.
// Usage: node scripts/figures.mjs .   (raster figures: scripts/heat.mjs)
import fs from 'node:fs'
import path from 'node:path'
const ROOT = process.argv[2]
const F = (p) => path.join(ROOT, 'src/assets/figures', p)

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const r1 = (n) => Math.round(n * 10) / 10
function box(x, y, w, h, cls = 'fig-box') { return `<rect class="${cls}" x="${r1(x + 0.75)}" y="${r1(y + 0.75)}" width="${r1(w - 1.5)}" height="${r1(h - 1.5)}" rx="6"/>` }
function label(cx, cy, lines, cls = 'fig-t', lh = 18, anchor = 'middle') {
  const first = cy - ((lines.length - 1) * lh) / 2 + 5
  return lines.map((t, i) => `<text class="${cls}" x="${r1(cx)}" y="${r1(first + i * lh)}" text-anchor="${anchor}">${esc(t)}</text>`).join('\n  ')
}
function arrow(x1, x2, y, head = 'fig-head-muted') { return `<path class="fig-ln" d="M${r1(x1 + 3)} ${y}H${r1(x2 - 7)}"/>\n  <path class="${head}" d="M${r1(x2 - 2)} ${y}l-7 -4.5v9z"/>` }
function svg({ id, w, h, title, desc, body, wide = true }) {
  return `<svg class="figure-svg${wide ? ' fig-wide' : ''}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${id}-t ${id}-d">
  <title id="${id}-t">${esc(title)}</title>
  <desc id="${id}-d">${esc(desc)}</desc>
  ${body.trim()}
</svg>
`
}
const write = (p, s) => { fs.writeFileSync(F(p), s); console.log(p, s.length) }

// ======================= routing-engine-solver/architecture =======================
{
  const L = {
    de: { title: 'Vom Auftrag zur Stoppliste', desc: 'Ablauf von links nach rechts: Import der Aufträge, Geocoding, Planungsregeln, Solver, Prüfung auf der Karte durch das Büro, Export als Stoppliste und Fahrerblatt. Geocoding und Solver sitzen hinter austauschbaren Schnittstellen. Hervorgehoben ist die Prüfung durch das Büro.',
      n: [['Import der', 'Aufträge'], ['Geocoding'], ['Planungsregeln'], ['Solver'], ['Prüfung durch', 'das Büro']], ex: 'Export', exs: ['Stoppliste,', 'Fahrerblatt'], grp: 'austauschbare Schnittstellen' },
    en: { title: 'From order to stop list', desc: 'Flow from left to right: order import, geocoding, planning rules, solver, review on the map by the office, export as stop list and driver sheet. Geocoding and solver sit behind replaceable interfaces. The review by the office is highlighted.',
      n: [['Import', 'orders'], ['Geocoding'], ['Planning rules'], ['Solver'], ['Review by', 'the office']], ex: 'Export', exs: ['stop list,', 'driver sheet'], grp: 'replaceable interfaces' },
  }
  for (const [lang, t] of Object.entries(L)) {
    const W = 124, G = 19.2, xs = [0, 1, 2, 3, 4, 5].map((i) => i * (W + G)), cy = 32
    const parts = []
    t.n.forEach((lines, i) => {
      const focus = i === 4
      parts.push(box(xs[i], 0, W, 64, focus ? 'fig-focus' : 'fig-box'))
      parts.push(label(xs[i] + W / 2, cy, lines, focus ? 'fig-t-on' : 'fig-t'))
    })
    parts.push(box(xs[5], 0, W, 64))
    parts.push(`<text class="fig-t-b" x="${r1(xs[5] + W / 2)}" y="22" text-anchor="middle">${t.ex}</text>`)
    parts.push(label(xs[5] + W / 2, 45, t.exs, 'fig-t-s', 14))
    for (let i = 0; i < 5; i++) parts.push(arrow(xs[i] + W, xs[i + 1], cy, i === 3 ? 'fig-head' : 'fig-head-muted'))
    const g1 = xs[1] + W / 2, g2 = xs[3] + W / 2
    parts.push(`<path class="fig-ln" d="M${r1(g1)} 72V86H${r1(g2)}V72"/>`)
    parts.push(`<text class="fig-t-s" x="${r1((g1 + g2) / 2)}" y="104" text-anchor="middle">${t.grp}</text>`)
    write(`routing-engine-solver/architecture.${lang}.svg`, svg({ id: 'fig-res-arch', w: 840, h: 110, title: t.title, desc: t.desc, body: parts.join('\n  ') }))
  }
}

// ======================= routing-engine-solver/method =======================
{
  const L = {
    de: { title: 'Aus dem Intervall folgt der Monat', desc: 'Vier Schritte in einer Reihe: Wartungsintervall, fälliger Monat, Tag und Fahrzeug, Route. Hervorgehoben ist die Zuordnung zu Tag und Fahrzeug durch den Solver.', n: ['Wartungsintervall', 'fälliger Monat', 'Tag und Fahrzeug', 'Route'] },
    en: { title: 'The interval sets the month', desc: 'Four steps in a row: service interval, due month, day and vehicle, route. The assignment to day and vehicle by the solver is highlighted.', n: ['Service interval', 'Due month', 'Day and vehicle', 'Route'] },
  }
  for (const [lang, t] of Object.entries(L)) {
    const W = 180, G = 40, xs = [0, 220, 440, 660], H = 140
    const p = []
    xs.forEach((x, i) => { p.push(box(x, 0, W, H, i === 2 ? 'fig-focus' : 'fig-box')); p.push(`<text class="${i === 2 ? 'fig-t-on' : 'fig-t'}" x="${x + W / 2}" y="118" text-anchor="middle">${t.n[i]}</text>`) })
    // 1 interval: a month axis, a visit every third month
    { const c = 90; p.push(`<path class="fig-ln" d="M${c - 60} 52H${c + 60}"/>`)
      for (let i = 0; i < 7; i++) { const x = c - 60 + i * 20; p.push(i % 3 === 0 ? `<circle class="fig-dot" cx="${x}" cy="52" r="6"/>` : `<path class="fig-ln" d="M${x} 46V58"/>`) } }
    // 2 month: twelve months, one due
    { const c = 310, x0 = c - 38, y0 = 28
      for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { const due = r === 1 && k === 2; p.push(`<rect class="${due ? 'fig-gate' : 'fig-box-quiet'}" x="${x0 + k * 20 + 0.5}" y="${y0 + r * 16 + 0.5}" width="15" height="11" rx="2"/>`) } }
    // 3 day and vehicle: weekdays x vehicles, assigned cells filled
    { const c = 530, x0 = c - 43, y0 = 25, on = new Set(['0-1', '1-3', '2-0', '0-4', '1-0', '2-2'])
      for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) p.push(`<rect class="${on.has(r + '-' + k) ? 'fig-ink-fill' : 'fig-ink-box'}" x="${x0 + k * 18 + 0.75}" y="${y0 + r * 18 + 0.75}" width="12.5" height="12.5" rx="2"/>`) }
    // 4 route: depot and stops
    { const c = 750; p.push(`<path class="fig-ln-strong" d="M${c - 8} 74L${c - 50} 56L${c - 30} 30L${c + 14} 26L${c + 48} 44L${c + 34} 70Z"/>`)
      p.push(`<rect class="fig-gate" x="${c - 14}" y="68" width="12" height="12" rx="2"/>`)
      for (const [dx, dy] of [[-50, 56], [-30, 30], [14, 26], [48, 44], [34, 70]]) p.push(`<circle class="fig-chip" cx="${c + dx}" cy="${dy}" r="5"/><circle class="fig-ln-strong" cx="${c + dx}" cy="${dy}" r="5"/>`) }
    for (let i = 0; i < 3; i++) p.push(arrow(xs[i] + W, xs[i + 1], 70, i === 1 ? 'fig-head' : 'fig-head-muted'))
    write(`routing-engine-solver/method.${lang}.svg`, svg({ id: 'fig-res-method', w: 840, h: 140, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= routing-engine-agentic/process =======================
{
  const L = {
    de: { title: 'Vom Issue bis in den Betrieb', desc: 'Ablauf von links nach rechts: Issue, Plan, ein Agent setzt im Worktree um, Checks und Review, Merge, Release-Tag, nächtlicher Deploy. Checks und Review bestehen aus CI-Checks, einem Review durch ein zweites Modell und einer Prüfung in der laufenden App. Migrationen, Login, Zugangsdaten und Deploy zweigen gestrichelt ab und warten auf Freigabe. Hervorgehoben sind Checks und Review.',
      n: [['Issue'], ['Plan'], ['Agent setzt im', 'Worktree um'], ['Checks und Review'], ['Merge'], ['Release-Tag'], ['nächtlicher', 'Deploy']],
      sub: [['CI-Checks'], ['Review durch ein', 'zweites Modell'], ['Prüfung in der', 'laufenden App']], wait: 'wartet auf Freigabe', waits: ['Migrationen, Login,', 'Zugangsdaten, Deploy'] },
    en: { title: 'From issue to production', desc: 'Flow from left to right: issue, plan, an agent implements in a worktree, checks and review, merge, release tag, nightly deploy. Checks and review consist of CI checks, a review by a second model and a check in the running app. Migrations, login, credentials and deploy branch off, dashed, and wait for approval. Checks and review are highlighted.',
      n: [['Issue'], ['Plan'], ['Agent implements', 'in a worktree'], ['Checks and review'], ['Merge'], ['Release tag'], ['Nightly', 'deploy']],
      sub: [['CI checks'], ['Review by a', 'second model'], ['Check in the', 'running app']], wait: 'waits for approval', waits: ['migrations, login,', 'credentials, deploy'] },
  }
  for (const [lang, t] of Object.entries(L)) {
    const ws = [72, 72, 134, 150, 82, 104, 112], G = 19, xs = []; let x = 0; for (const w of ws) { xs.push(x); x += w + G }
    const cy = 30, p = []
    t.n.forEach((lines, i) => { const f = i === 3; p.push(box(xs[i], 0, ws[i], 60, f ? 'fig-focus' : 'fig-box')); p.push(label(xs[i] + ws[i] / 2, cy, lines, f ? 'fig-t-on' : 'fig-t')) })
    for (let i = 0; i < 6; i++) p.push(arrow(xs[i] + ws[i], xs[i + 1], cy, i === 2 || i === 3 ? 'fig-head' : 'fig-head-muted'))
    // sub-checks under the focus box
    const sx = xs[3], spine = sx + 12, bx = sx + 24, bw = ws[3] - 24, sub = [[74, 30], [112, 40], [160, 40]]
    p.push(`<path class="fig-ln-acc" d="M${spine} 60V${sub[2][0] + 20}${sub.map(([y, h]) => `M${spine} ${y + h / 2}H${bx}`).join('')}"/>`)
    sub.forEach(([y, h], i) => { p.push(box(bx, y, bw, h, 'fig-box')); p.push(label(bx + bw / 2, y + h / 2, t.sub[i], 'fig-t-sm', 15)) })
    // dashed branch: waits for approval, then into merge
    const bxw = 520, mx = xs[4] + ws[4] / 2
    p.push(`<path class="fig-ln fig-dash" d="M${r1(xs[3] + ws[3] + G / 2)} ${cy}V144H${bxw - 4}"/>`)
    p.push(`<path class="fig-head-muted" d="M${bxw + 1} 144l-7 -4.5v9z"/>`)
    p.push(box(bxw, 112, 240, 68, 'fig-box-quiet fig-dash'))
    p.push(`<text class="fig-t-b" x="${bxw + 16}" y="136">${t.wait}</text>`)
    p.push(label(bxw + 16, 156, t.waits, 'fig-t-s', 15, 'start'))
    p.push(`<path class="fig-ln fig-dash" d="M${mx} 112V68"/>`)
    p.push(`<path class="fig-head-muted" d="M${mx} 61l-4.5 7h9z"/>`)
    write(`routing-engine-agentic/process.${lang}.svg`, svg({ id: 'fig-rea-process', w: 840, h: 202, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= routing-engine-agentic/prs-per-month =======================
{
  const vals = [7, 64, 88, 184]
  const L = {
    de: { title: 'Gemergte Pull Requests pro Monat', desc: 'Balkendiagramm: August 7, September 64, Oktober 88, November 184 bis zum 19.11.2026. Hervorgehoben ist Oktober, der Monat des ersten Releases und des Starts im Betrieb.', m: ['August', 'September', 'Oktober', 'November'], note: 'bis 19.11.' },
    en: { title: 'Merged pull requests per month', desc: 'Bar chart: August 7, September 64, October 88, November 184 up to 19 Nov 2026. October, the month of the first release and the start of daily use, is highlighted.', m: ['August', 'September', 'October', 'November'], note: 'to 19 Nov' },
  }
  for (const [lang, t] of Object.entries(L)) {
    const base = 240, k = 190 / 184, p = []
    vals.forEach((v, i) => {
      const cx = 60 + i * 120, h = v * k, acc = i === 2
      p.push(`<rect class="${acc ? 'fig-bar-acc' : 'fig-bar'}" x="${cx - 36}" y="${r1(base - h)}" width="72" height="${r1(h)}" rx="2"/>`)
      p.push(`<text class="fig-num-l${acc ? ' fig-num-acc' : ''}" x="${cx}" y="${r1(base - h - 10)}" text-anchor="middle">${v}</text>`)
      p.push(`<text class="${acc ? 'fig-t-b' : 'fig-t-muted'}" x="${cx}" y="${base + 24}" text-anchor="middle">${t.m[i]}</text>`)
    })
    p.push(`<text class="fig-t-s" x="420" y="${base + 42}" text-anchor="middle">${t.note}</text>`)
    p.push(`<path class="fig-base" d="M0 ${base + 0.5}H480"/>`)
    write(`routing-engine-agentic/prs-per-month.${lang}.svg`, svg({ id: 'fig-rea-prs', w: 480, h: 290, title: t.title, desc: t.desc, body: p.join('\n  '), wide: false }))
  }
}

// ======================= kpi-reference/process =======================
{
  const L = {
    de: { title: 'Die Referenz legt die Werte fest', desc: 'Ablauf von links nach rechts: Anforderung, Referenzimplementierung, Abgleich mit der Produktion, Übergabe. Hervorgehoben ist die Referenzimplementierung.', n: [['Anforderung'], ['Referenzimplementierung'], ['Abgleich mit der', 'Produktion'], ['Übergabe']] },
    en: { title: 'The reference defines the values', desc: 'Flow from left to right: requirement, reference implementation, matching with production, handover. The reference implementation is highlighted.', n: [['Requirement'], ['Reference implementation'], ['Matching with', 'production'], ['Handover']] },
  }
  for (const [lang, t] of Object.entries(L)) {
    const ws = [150, 230, 210, 130], xs = [0, 190, 460, 710], p = []
    t.n.forEach((lines, i) => { const f = i === 1; p.push(box(xs[i], 0, ws[i], 64, f ? 'fig-focus' : 'fig-box')); p.push(label(xs[i] + ws[i] / 2, 32, lines, f ? 'fig-t-on' : 'fig-t')) })
    for (let i = 0; i < 3; i++) p.push(arrow(xs[i] + ws[i], xs[i + 1], 32, i < 2 ? 'fig-head' : 'fig-head-muted'))
    write(`kpi-reference/process.${lang}.svg`, svg({ id: 'fig-kpi-process', w: 840, h: 64, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= kpi-reference/forecast-model =======================
{
  const L = {
    de: { title: 'Vier Faktoren, multipliziert', desc: 'Formel in einer Zeile: Mengenniveau mal Saisonfaktor je Monat mal Arbeitstagsgewicht mal Standortanteil ergibt die Prognose. Allgemeine Form ohne Betriebswerte. Hervorgehoben ist die Prognose.', n: [['Mengenniveau'], ['Saisonfaktor', '(Monat)'], ['Arbeitstagsgewicht'], ['Standortanteil'], ['Prognose']] },
    en: { title: 'Four factors, multiplied', desc: 'Formula in one line: volume level times seasonal factor per month times working-day weight times site share gives the forecast. General form without company values. The forecast is highlighted.', n: [['Volume level'], ['Seasonal factor', '(month)'], ['Working-day weight'], ['Site share'], ['Forecast']] },
  }
  for (const [lang, t] of Object.entries(L)) {
    const ws = [128, 128, 150, 128, 128], xs = [0, 172.5, 345, 539.5, 712], ops = ['×', '×', '×', '='], p = []
    t.n.forEach((lines, i) => { const f = i === 4; p.push(box(xs[i], 0, ws[i], 64, f ? 'fig-focus' : 'fig-box')); p.push(label(xs[i] + ws[i] / 2, 32, lines, f ? 'fig-t-on' : 'fig-t')) })
    ops.forEach((o, i) => p.push(`<text class="fig-t-op" x="${r1((xs[i] + ws[i] + xs[i + 1]) / 2)}" y="41" text-anchor="middle">${o}</text>`))
    write(`kpi-reference/forecast-model.${lang}.svg`, svg({ id: 'fig-kpi-model', w: 840, h: 64, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= kpi-reference/forecast-error =======================
{
  const L = {
    de: { title: 'Prognosefehler im Rückblick', desc: 'Zwei waagerechte Balken, gewichteter mittlerer absoluter Prozentfehler (WMAPE) über 1.300 Prognosefälle: Vorjahr als Prognose 20,12 Prozent, gewähltes Modell 8,42 Prozent. Hervorgehoben ist das gewählte Modell.', a: 'Vorjahr als Prognose', b: 'Gewähltes Modell', va: '20,12 %', vb: '8,42 %' },
    en: { title: 'Forecast error in a backtest', desc: 'Two horizontal bars, weighted mean absolute percentage error (WMAPE) over 1,300 forecast cases: previous year as forecast 20.12 percent, chosen model 8.42 percent. The chosen model is highlighted.', a: 'Previous year as forecast', b: 'Chosen model', va: '20.12 %', vb: '8.42 %' },
  }
  for (const [lang, t] of Object.entries(L)) {
    const k = 420 / 20.12, wa = 20.12 * k, wb = 8.42 * k
    const body = `<text class="fig-t-muted" x="0" y="14">${t.a}</text>
  <rect class="fig-bar" x="0" y="24" width="${r1(wa)}" height="36" rx="2"/>
  <text class="fig-num-l" x="${r1(wa + 12)}" y="50">${t.va}</text>
  <text class="fig-t-b" x="0" y="94">${t.b}</text>
  <rect class="fig-bar-acc" x="0" y="104" width="${r1(wb)}" height="36" rx="2"/>
  <text class="fig-num-l fig-num-acc" x="${r1(wb + 12)}" y="130">${t.vb}</text>`
    write(`kpi-reference/forecast-error.${lang}.svg`, svg({ id: 'fig-kpi-error', w: 560, h: 140, title: t.title, desc: t.desc, body, wide: false }))
  }
}

// ======================= berlin-lst-downscaling/data-flow =======================
{
  const L = {
    de: { title: 'Von den Rohdaten zur Temperatur auf 10 m', desc: 'Datenfluss von links nach rechts: Quellen (Landsat 8/9, Sentinel-2, Berliner Geodaten, ERA5-Land), Szenenauswahl, analysefertige Raster, dazu Kontext aus Morphologie, Schatten und Wetter, daraus ein Feature-Stack mit 22 Kanälen, ein U-Net und die Temperatur auf 10 m. Hervorgehoben ist der Feature-Stack.',
      src: ['Landsat 8/9', 'Sentinel-2', 'Berliner Geodaten', 'ERA5-Land'], sel: ['Szenenauswahl'], ras: ['analysefertige', 'Raster'], stk: ['Feature-Stack', 'mit 22 Kanälen'], net: ['U-Net'], out: ['Temperatur', 'auf 10 m'], ctx: 'Kontext', ctxs: 'Morphologie, Schatten, Wetter' },
    en: { title: 'From raw data to temperature at 10 m', desc: 'Data flow from left to right: sources (Landsat 8/9, Sentinel-2, Berlin geodata, ERA5-Land), scene selection, analysis-ready rasters, plus context from morphology, shadows and weather, combined into a feature stack with 22 channels, a U-Net and temperature at 10 m. The feature stack is highlighted.',
      src: ['Landsat 8/9', 'Sentinel-2', 'Berlin geodata', 'ERA5-Land'], sel: ['Scene', 'selection'], ras: ['Analysis-ready', 'rasters'], stk: ['Feature stack', 'with 22 channels'], net: ['U-Net'], out: ['Temperature', 'at 10 m'], ctx: 'Context', ctxs: 'morphology, shadows, weather' },
  }
  for (const [lang, t] of Object.entries(L)) {
    const p = [], cy = 65, top = 33
    t.src.forEach((s, i) => { const y = i * 34; p.push(box(0, y, 140, 28, 'fig-box-quiet')); p.push(`<text class="fig-t-sm" x="12" y="${y + 18}">${s}</text>`) })
    p.push(`<path class="fig-ln" d="M140 14H152M140 48H152M140 82H152M140 116H152M152 14V116M152 65H167"/>`)
    p.push(`<path class="fig-head-muted" d="M172 65l-7 -4.5v9z"/>`)
    const nodes = [[174, 116, t.sel], [320, 110, t.ras], [460, 128, t.stk], [618, 72, t.net], [724, 116, t.out]]
    // back layers of the stack, offset up-right
    p.push(`<rect class="fig-focus-ring" x="${460 + 12}" y="${top - 12}" width="128" height="64" rx="6"/>`)
    p.push(`<rect class="fig-focus-ring" x="${460 + 6}" y="${top - 6}" width="128" height="64" rx="6"/>`)
    nodes.forEach(([x, w, lines], i) => { const f = i === 2; p.push(box(x, top, w, 64, f ? 'fig-focus' : 'fig-box')); p.push(label(x + w / 2, cy, lines, f ? 'fig-t-on' : 'fig-t')) })
    for (let i = 0; i < 4; i++) p.push(arrow(nodes[i][0] + nodes[i][1], nodes[i + 1][0], cy, i === 1 || i === 2 ? 'fig-head' : 'fig-head-muted'))
    // context, fed from the sources, into the stack
    p.push(box(340, 136, 248, 54, 'fig-box'))
    p.push(`<text class="fig-t-b" x="356" y="158">${t.ctx}</text>`)
    p.push(`<text class="fig-t-s" x="356" y="177">${t.ctxs}</text>`)
    p.push(`<path class="fig-ln" d="M70 130V163H333"/>`)
    p.push(`<path class="fig-head-muted" d="M338 163l-7 -4.5v9z"/>`)
    p.push(`<path class="fig-ln" d="M524 136V105"/>`)
    p.push(`<path class="fig-head" d="M524 98l-4.5 7h9z"/>`)
    write(`berlin-lst-downscaling/data-flow.${lang}.svg`, svg({ id: 'fig-lst-flow', w: 840, h: 190, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= berlin-lst-downscaling/ablation-stages =======================
{
  const L = {
    de: { title: 'Fünf Stufen auf einem festen Modell', desc: 'Fünf Spalten, Stufe 1 bis 5, auf demselben residualen 2D-U-Net. Stufe 1 nutzt Spektraldaten, Stufe 2 fügt Morphologie hinzu, Stufe 3 Schatten, Stufe 4 Wetter. Stufe 5 hat dieselben Eingänge und ein thermalsensitives Trainingsziel. Hervorgehoben ist Stufe 1, die Grundlage aller weiteren Stufen.',
      st: 'Stufe', g: ['Spektral', 'Morphologie', 'Schatten', 'Wetter'], loss: ['+ Trainingsziel', 'thermalsensitiv'], bb: 'Residuales 2D-U-Net, in allen Stufen gleich' },
    en: { title: 'Five stages on one fixed model', desc: 'Five columns, stage 1 to 5, on the same residual 2D U-Net. Stage 1 uses spectral data, stage 2 adds morphology, stage 3 shadows, stage 4 weather. Stage 5 has the same inputs and a temperature-sensitive training loss. Stage 1, the basis of all later stages, is highlighted.',
      st: 'Stage', g: ['Spectral', 'Morphology', 'Shadows', 'Weather'], loss: ['+ Training loss', 'temperature-sensitive'], bb: 'Residual 2D U-Net, the same in every stage' },
  }
  for (const [lang, t] of Object.entries(L)) {
    const p = [], W = 150, xs = [0, 172.5, 345, 517.5, 690], by = (i) => 196 - i * 36
    xs.forEach((x, s) => {
      p.push(`<text class="fig-hd" x="${x}" y="14">${t.st} ${s + 1}</text>`)
      const n = Math.min(s + 1, 4)
      for (let i = 0; i < n; i++) {
        const isNew = i === s, stage1 = s === 0
        if (stage1) { p.push(box(x, by(i), W, 30, 'fig-focus')); p.push(`<text class="fig-t-on" x="${x + 12}" y="${by(i) + 20}">+ ${t.g[i]}</text>`) }
        else if (isNew) { p.push(box(x, by(i), W, 30, 'fig-box')); p.push(`<text class="fig-t-b" x="${x + 12}" y="${by(i) + 20}">+ ${t.g[i]}</text>`) }
        else { p.push(box(x, by(i), W, 30, 'fig-box-quiet')); p.push(`<text class="fig-t-muted" x="${x + 12}" y="${by(i) + 20}">${t.g[i]}</text>`) }
      }
      if (s === 4) { p.push(box(x, 38, W, 44, 'fig-box fig-dash')); p.push(`<text class="fig-t-b" x="${x + 12}" y="56">${t.loss[0]}</text>`); p.push(`<text class="fig-t-s" x="${x + 12}" y="73">${t.loss[1]}</text>`) }
      p.push(`<path class="fig-ln" d="M${x + W / 2} 226V246"/>`)
    })
    p.push(box(0, 246, 840, 44, 'fig-box'))
    p.push(`<text class="fig-t" x="420" y="273" text-anchor="middle">${t.bb}</text>`)
    write(`berlin-lst-downscaling/ablation-stages.${lang}.svg`, svg({ id: 'fig-lst-stages', w: 840, h: 290, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= covers (wordless) =======================
const cover = (body) => `<svg class="figure-svg fig-cover" width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${body.trim()}
</svg>
`
{ // solver: tours on a plain grid, schematic, no real places
  let grid = ''; for (let x = 100; x < 1600; x += 100) grid += `M${x} 0V900`; for (let y = 100; y < 900; y += 100) grid += `M0 ${y}H1600`
  const D = [800, 470]
  const tours = [
    [[560, 380], [430, 250], [620, 160], [900, 210], [1010, 330]],
    [[1040, 560], [1240, 500], [1330, 680], [1080, 760], [880, 690]],
  ]
  const ghost = [[560, 560], [330, 600], [300, 760], [560, 780]]
  const pl = (pts) => 'M' + [D, ...pts, D].map((q) => q.join(' ')).join('L')
  write('routing-engine-solver/cover.svg', cover(`<rect class="fig-cover-acc" width="1600" height="900"/>
  <path class="fig-cover-hair" d="${grid}"/>
  <path class="fig-ink-thin" d="${pl(ghost)}"/>
  ${tours.map((t) => `<path class="fig-ink fig-draw" pathLength="1" d="${pl(t)}"/>`).join('\n  ')}
  ${[...tours.flat(), ...ghost].map(([x, y]) => `<circle class="fig-stop" cx="${x}" cy="${y}" r="17"/>`).join('\n  ')}
  <rect class="fig-ink-fill" x="${D[0] - 26}" y="${D[1] - 26}" width="52" height="52" rx="6"/>`))
}
{ // agentic: three lanes of work pass one gate into a single line to production
  const prs = [[260, 250], [430, 250], [200, 450], [380, 450], [560, 450], [300, 650], [500, 650]]
  write('routing-engine-agentic/cover.svg', cover(`<rect class="fig-cover-tint" width="1600" height="900"/>
  <path class="fig-lane" d="M120 250H600C760 250 760 450 900 450"/>
  <path class="fig-lane" d="M120 450H900"/>
  <path class="fig-lane" d="M120 650H600C760 650 760 450 900 450"/>
  ${prs.map(([x, y]) => `<rect class="fig-pr" x="${x - 13}" y="${y - 13}" width="26" height="26" rx="4"/>`).join('\n  ')}
  <path class="fig-lane-acc fig-draw" pathLength="1" d="M916 450H1400"/>
  <rect class="fig-gate" x="896" y="350" width="24" height="200" rx="4"/>
  <rect class="fig-gate" x="1400" y="410" width="80" height="80" rx="6"/>`))
}
{ // kpi: the two approved error values as bars, to scale
  const k = 1200 / 20.12
  write('kpi-reference/cover.svg', cover(`<rect class="fig-cover-bg" width="1600" height="900"/>
  <path class="fig-cover-hair-t" d="M200 0V900M500 0V900M800 0V900M1100 0V900M1400 0V900"/>
  <rect class="fig-bar" x="200" y="280" width="${r1(20.12 * k)}" height="140" rx="6"/>
  <rect class="fig-bar-acc" x="200" y="480" width="${r1(8.42 * k)}" height="140" rx="6"/>
  <path class="fig-base" d="M200 220V680"/>`))
}
