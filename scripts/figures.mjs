// Writes the diagram and chart figures (DE + EN) and the non-raster cover into
// src/assets/figures. Geometry is authored here by hand; the script only swaps the language strings.
// Usage: node scripts/figures.mjs .   (raster figures: scripts/raster.mjs)
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
{ // kpi: the two approved error values as bars, to scale
  const k = 1200 / 20.12
  write('kpi-reference/cover.svg', cover(`<rect class="fig-cover-bg" width="1600" height="900"/>
  <path class="fig-cover-hair-t" d="M200 0V900M500 0V900M800 0V900M1100 0V900M1400 0V900"/>
  <rect class="fig-bar" x="200" y="280" width="${r1(20.12 * k)}" height="140" rx="6"/>
  <rect class="fig-bar-acc" x="200" y="480" width="${r1(8.42 * k)}" height="140" rx="6"/>
  <path class="fig-base" d="M200 220V680"/>`))
}
