// Writes the diagram and chart figures for tourengenie, berlin-lst-downscaling and
// urban-tree-transfer (DE + EN) and the non-raster covers into src/assets/figures.
// Geometry is authored here by hand; the script only swaps the language strings.
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
const write = (p, s) => { fs.mkdirSync(path.dirname(F(p)), { recursive: true }); fs.writeFileSync(F(p), s); console.log(p, s.length) }

// ======================= tourengenie/objective =======================
{
  const L = {
    de: {
      title: 'Feste Rangfolge im Ziel',
      desc: 'Vier Zeilen untereinander, jede mit einer Rangzahl, einem Ziel und einer Notiz, wann diese Stufe entscheidet. Rang 1: alle fälligen Aufträge eingeplant, zählt immer zuerst. Rang 2: möglichst wenige Touren, bei gleich vielen eingeplanten Aufträgen. Rang 3: möglichst wenig Fahrzeit, bei gleicher Tourenzahl. Rang 4: möglichst kurze Distanz, bei gleicher Fahrzeit. Eine Klammer rechts fasst die vier Zeilen zusammen: eine ganzzahlige Zielfunktion, jede Stufe wiegt mehr als alle darunter. Hervorgehoben ist Rang 1.',
      goals: ['Alle fälligen Aufträge eingeplant', 'Möglichst wenige Touren', 'Möglichst wenig Fahrzeit', 'Möglichst kurze Distanz'],
      notes: [['zählt immer zuerst'], ['bei gleich vielen', 'eingeplanten Aufträgen'], ['bei gleicher Tourenzahl'], ['bei gleicher Fahrzeit']],
      bracket: ['Eine ganzzahlige Zielfunktion:', 'jede Stufe wiegt mehr als alle darunter'],
    },
    en: {
      title: 'A fixed ranking in the objective',
      desc: 'Four rows, each with a rank number, a goal and a note on when that level decides. Rank 1: all due jobs planned, always counts first. Rank 2: as few tours as possible, if the same number of jobs is planned. Rank 3: as little travel time as possible, if the tour count is equal. Rank 4: as short a distance as possible, if the travel time is equal. A bracket on the right joins the four rows: one integer objective, each level outweighs all levels below. Rank 1 is highlighted.',
      goals: ['All due jobs planned', 'As few tours as possible', 'As little travel time as possible', 'As short a distance as possible'],
      notes: [['always counts first'], ['if the same number of', 'jobs is planned'], ['if the tour count is equal'], ['if the travel time is equal']],
      bracket: ['One integer objective:', 'each level outweighs all levels below'],
    },
  }
  for (const [lang, t] of Object.entries(L)) {
    const p = []
    t.goals.forEach((goal, i) => {
      const y = 8 + i * 52, cy = y + 22, focal = i === 0
      p.push(`<text class="fig-num" x="12" y="${cy + 5}" text-anchor="middle">${i + 1}</text>`)
      p.push(box(24, y, 300, 44, focal ? 'fig-focus' : 'fig-box'))
      p.push(label(174, cy, [goal], focal ? 'fig-t-on' : 'fig-t'))
      p.push(label(336, cy, t.notes[i], 'fig-t-s', 15, 'start'))
    })
    p.push(`<path class="fig-ln" d="M545 8H552V208H545"/>`)
    p.push(label(564, 108, t.bracket, 'fig-t-s', 15, 'start'))
    write(`tourengenie/objective.${lang}.svg`, svg({ id: 'fig-tg-objective', w: 840, h: 224, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= tourengenie/travel-cache =======================
{
  const L = {
    de: {
      title: 'Ein neuer Stopp braucht nur 2n Kanten',
      desc: 'Quadratische Fahrzeitmatrix mit sieben Zeilen und sieben Spalten, Felder von 22 Pixeln mit drei Pixeln Abstand. Oben links liegen die sechs vorhandenen Stopps als 6 mal 6 Felder, sie sind ruhig gefüllt. Die siebte Zeile und die siebte Spalte gehören zum neuen Stopp und sind die einzige akzentfarbene Fläche. Das Feld unten rechts, neuer Stopp zu neuem Stopp, bleibt leer. Die Achsen sind beschriftet: oben nach, links von, unter der siebten Spalte und neben der siebten Zeile neu. Rechts stehen drei Legendeneinträge: n vorhandene Stopps belegen n² Kanten im Cache; ein neuer Stopp braucht nur 2n neue Kanten, hin und zurück; die ganze Matrix neu zu berechnen hieße n² Kanten.',
      after: 'nach', before: 'von', fresh: 'neu',
      legend: [
        ['fig-bar', 'n vorhandene Stopps: n² Kanten liegen im Cache'],
        ['fig-focus', 'Neuer Stopp: nur 2n neue Kanten, hin und zurück'],
        ['fig-box-quiet fig-dash', 'Ganze Matrix neu berechnen: n² Kanten'],
      ],
    },
    en: {
      title: 'A new stop needs only 2n edges',
      desc: 'Square travel time matrix with seven rows and seven columns, cells of 22 pixels with three pixel gaps. The top left holds the six existing stops as a 6 by 6 field, filled quietly. The seventh row and the seventh column belong to the new stop and are the only accent area. The bottom right cell, new stop to new stop, stays empty. The axes are labelled: to on top, from on the left, new under the seventh column and beside the seventh row. The legend on the right reads: n existing stops occupy n² edges in the cache; a new stop needs only 2n new edges, there and back; recomputing the whole matrix would mean n² edges.',
      after: 'to', before: 'from', fresh: 'new',
      legend: [
        ['fig-bar', 'n existing stops: n² edges are already cached'],
        ['fig-focus', 'New stop: only 2n new edges, there and back'],
        ['fig-box-quiet fig-dash', 'Recomputing the whole matrix: n² edges'],
      ],
    },
  }
  const s = 22, gap = 3, pitch = s + gap, x0 = 48, y0 = 24
  for (const [lang, t] of Object.entries(L)) {
    const p = []
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const cls = r < 6 && c < 6 ? 'fig-bar' : r === 6 && c === 6 ? 'fig-box-quiet' : 'fig-focus'
        p.push(`<rect class="${cls}" x="${x0 + c * pitch}" y="${y0 + r * pitch}" width="${s}" height="${s}"/>`)
      }
    }
    p.push(`<text class="fig-t-s" x="${x0 + 3.5 * pitch}" y="14" text-anchor="middle">${esc(t.after)}</text>`)
    p.push(`<text class="fig-t-s" x="12" y="110" text-anchor="middle" transform="rotate(-90 12 110)">${esc(t.before)}</text>`)
    p.push(`<text class="fig-t-s" x="${x0 + 6 * pitch + s / 2}" y="${y0 + 7 * pitch - gap + 16}" text-anchor="middle">${esc(t.fresh)}</text>`)
    p.push(`<text class="fig-t-s" x="${x0 + 7 * pitch - gap + 8}" y="${y0 + 6 * pitch + s / 2 + 4}">${esc(t.fresh)}</text>`)
    t.legend.forEach(([cls, text], i) => {
      const yy = 70 + i * 40
      p.push(`<rect class="${cls}" x="268" y="${yy - 15}" width="20" height="20" rx="2"/>`)
      p.push(`<text class="fig-t-sm" x="298" y="${yy - 1}">${esc(text)}</text>`)
    })
    write(`tourengenie/travel-cache.${lang}.svg`, svg({ id: 'fig-tg-cache', w: 840, h: 240, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= tourengenie/release =======================
{
  const L = {
    de: {
      title: 'Von der Entwicklung in den Betrieb',
      desc: 'Drei Kästen von links nach rechts: Entwicklung, Staging, Produktion. Über dem ersten Pfeil steht Tests und Sicherheits-Scans, über dem zweiten steht signiertes Release, nachts ausgeliefert. Unter Produktion liegt gestrichelt die vorherige Version. Ein gestrichelter Weg führt von Produktion hinunter und mit zwei Pfeilspitzen wieder hinauf, beschriftet Deploy schlägt fehl: automatischer Rollback. Hervorgehoben ist Produktion.',
      stages: ['Entwicklung', 'Staging', 'Produktion'],
      a: 'Tests und Sicherheits-Scans', b: 'Signiertes Release, nachts ausgeliefert',
      prev: 'Vorherige Version', rollback: 'Deploy schlägt fehl: automatischer Rollback',
    },
    en: {
      title: 'From development to production',
      desc: 'Three boxes from left to right: development, staging, production. Above the first arrow: tests and security scans; above the second: signed release, shipped nightly. Below production lies the previous version in a dashed box. A dashed path runs from production down and back up with two arrow heads, labelled deploy fails: automatic rollback. Production is highlighted.',
      stages: ['Development', 'Staging', 'Production'],
      a: 'Tests and security scans', b: 'Signed release, shipped nightly',
      prev: 'Previous version', rollback: 'Deploy fails: automatic rollback',
    },
  }
  for (const [lang, t] of Object.entries(L)) {
    const p = [], xs = [8, 322, 636], cy = 56
    t.stages.forEach((name, i) => {
      const focal = i === 2
      p.push(box(xs[i], 24, 196, 64, focal ? 'fig-focus' : 'fig-box'))
      p.push(label(xs[i] + 98, cy, [name], focal ? 'fig-t-on' : 'fig-t'))
    })
    p.push(arrow(204, 318, cy))
    p.push(arrow(518, 632, cy, 'fig-head'))
    p.push(`<text class="fig-t-s" x="261" y="18" text-anchor="middle">${esc(t.a)}</text>`)
    p.push(`<text class="fig-t-s" x="575" y="18" text-anchor="middle">${esc(t.b)}</text>`)
    p.push(box(636, 130, 196, 44, 'fig-box-quiet fig-dash'))
    p.push(label(734, 152, [t.prev]))
    p.push(`<path class="fig-ln fig-dash" d="M714 92V120"/>`)
    p.push(`<path class="fig-head-muted" d="M714 127l-4.5 -7h9z"/>`)
    p.push(`<path class="fig-ln fig-dash" d="M754 126V98"/>`)
    p.push(`<path class="fig-head-muted" d="M754 91l-4.5 7h9z"/>`)
    p.push(`<text class="fig-t-s" x="694" y="114" text-anchor="end">${esc(t.rollback)}</text>`)
    write(`tourengenie/release.${lang}.svg`, svg({ id: 'fig-tg-release', w: 840, h: 190, title: t.title, desc: t.desc, body: p.join('\n  ') }))
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

// ======================= berlin-lst-downscaling/pseudo-pairs =======================
{
  const L = {
    de: {
      title: 'Eine Ebene gröber trainieren, eine Ebene feiner anwenden',
      desc: 'Zwei Zeilen, beschriftet Training und Anwendung. In der Training-Zeile geht ein grobes Raster aus 2 mal 2 Zellen als Eingang 1000 m in das U-Net und kommt als mittleres Raster aus 6 mal 6 Zellen heraus, Ziel 100 m (Landsat). In der Anwendung-Zeile geht das mittlere Raster als Eingang 100 m hinein und kommt als feines Raster aus 18 mal 18 Zellen heraus, Ausgabe 10 m. Dasselbe U-Net steht zwischen Eingang und Ausgang beider Zeilen und ist hervorgehoben, in beiden Schritten gleich. Rechts neben der Ausgabe führt ein Pfeil zu einer ruhigen Box Bewertung auf 100 m: die 10-m-Ausgabe zusammengefasst, mit Landsat verglichen.',
      rows: ['Training', 'Anwendung'],
      in1: 'Eingang 1000 m', out1: 'Ziel 100 m (Landsat)', in2: 'Eingang 100 m', out2: 'Ausgabe 10 m',
      net: 'U-Net', netSub: ['in beiden', 'Schritten gleich'],
      eval: 'Bewertung auf 100 m', evalSub: ['10-m-Ausgabe zusammengefasst,', 'mit Landsat verglichen'],
    },
    en: {
      title: 'Train one level coarser, apply one level finer',
      desc: 'Two rows, labelled training and application. In the training row a coarse raster of 2 by 2 cells goes as input 1000 m into the U-Net and comes out as a middle raster of 6 by 6 cells, target 100 m (Landsat). In the application row the middle raster goes in as input 100 m and comes out as a fine raster of 18 by 18 cells, output 10 m. The same U-Net sits between the inputs and outputs of both rows and is highlighted, the same in both steps. To the right of the output an arrow leads to a quiet box evaluation at 100 m: the 10 m output aggregated, compared with Landsat.',
      rows: ['Training', 'Application'],
      in1: 'Input 1000 m', out1: 'Target 100 m (Landsat)', in2: 'Input 100 m', out2: 'Output 10 m',
      net: 'U-Net', netSub: ['the same in', 'both steps'],
      eval: 'Evaluation at 100 m', evalSub: ['10 m output aggregated,', 'compared with Landsat'],
    },
  }
  const raster = (x, y, n) => {
    const size = 72, c = size / n
    let d = ''
    for (let i = 1; i < n; i++) d += `M${r1(x + i * c)} ${y}V${y + size}M${x} ${r1(y + i * c)}H${x + size}`
    return `<rect class="fig-box-quiet" x="${x}" y="${y}" width="${size}" height="${size}"/>\n  <path class="fig-box-quiet" d="${d}"/>`
  }
  for (const [lang, t] of Object.entries(L)) {
    const p = [], sizes = [2, 6, 18]
    p.push(`<text class="fig-hd" x="8" y="75">${esc(t.rows[0])}</text>`)
    p.push(`<text class="fig-hd" x="8" y="215">${esc(t.rows[1])}</text>`)
    p.push(raster(80, 34, sizes[0]))
    p.push(raster(80, 174, sizes[1]))
    p.push(raster(460, 34, sizes[1]))
    p.push(raster(460, 174, sizes[2]))
    p.push(label(116, 122, [t.in1], 'fig-t-s'))
    p.push(label(116, 262, [t.in2], 'fig-t-s'))
    p.push(label(496, 122, [t.out1], 'fig-t-s'))
    p.push(label(496, 262, [t.out2], 'fig-t-s'))
    p.push(box(252, 18, 140, 264, 'fig-focus'))
    p.push(`<text class="fig-t-on" x="322" y="144" text-anchor="middle">${esc(t.net)}</text>`)
    p.push(label(322, 172, t.netSub, 'fig-t-on-s', 16))
    p.push(arrow(152, 252, 70))
    p.push(arrow(392, 460, 70))
    p.push(arrow(392, 460, 210))
    p.push(arrow(532, 588, 210))
    p.push(box(588, 172, 248, 76, 'fig-box'))
    p.push(label(712, 196, [t.eval]))
    p.push(label(712, 226, t.evalSub, 'fig-t-s', 16))
    write(`berlin-lst-downscaling/pseudo-pairs.${lang}.svg`, svg({ id: 'fig-lst-pairs', w: 840, h: 300, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= berlin-lst-downscaling/ablation =======================
{
  const L = {
    de: {
      title: 'Ein festes Modell, wechselnde Eingänge',
      desc: 'Matrix mit fünf Spalten: Spektral, Morphologie, Schatten, Wetter, Embeddings. Neun Zeilen in drei Gruppen. Gruppen hinzufügen: Stufe 1 nutzt Spektral, Stufe 2 Spektral und Morphologie, Stufe 3 zusätzlich Schatten, Stufe 4 zusätzlich Wetter. Je eine Gruppe weglassen: ohne Morphologie nutzt Spektral, Schatten und Wetter; ohne Schatten nutzt Spektral, Morphologie und Wetter; ohne Wetter nutzt Spektral, Morphologie und Schatten. Gegenprobe: Embeddings statt Morphologie und Schatten nutzt Spektral, Wetter und Embeddings. Ein gefülltes Quadrat heißt enthalten, ein leeres heißt nicht enthalten. Rechts spannt ein hervorgehobener Kasten über alle Zeilen: dasselbe U-Net in allen Läufen, jede Zeile ist mit einer dünnen Linie verbunden.',
      heads: ['Spektral', 'Morphologie', 'Schatten', 'Wetter', 'Embeddings'],
      groups: [
        { name: 'Gruppen hinzufügen', rows: [['Stufe 1', [0]], ['Stufe 2', [0, 1]], ['Stufe 3', [0, 1, 2]], ['Stufe 4', [0, 1, 2, 3]]] },
        { name: 'Je eine Gruppe weglassen', rows: [['ohne Morphologie', [0, 2, 3]], ['ohne Schatten', [0, 1, 3]], ['ohne Wetter', [0, 1, 2]]] },
        { name: 'Gegenprobe', rows: [['Embeddings statt Morphologie', 'und Schatten', [0, 3, 4]]] },
      ],
      net: 'U-Net', netSub: 'in allen Läufen gleich',
    },
    en: {
      title: 'One fixed model, changing inputs',
      desc: 'Matrix with five columns: spectral, morphology, shadows, weather, embeddings. Nine rows in three groups. Adding groups: stage 1 uses spectral, stage 2 spectral and morphology, stage 3 adds shadows, stage 4 adds weather. Leaving one group out: without morphology uses spectral, shadows and weather; without shadows uses spectral, morphology and weather; without weather uses spectral, morphology and shadows. Cross-check: embeddings instead of morphology and shadows uses spectral, weather and embeddings. A filled square means included, an empty square means not included. On the right a highlighted box spans all rows: the same U-Net in every run, each row joined to it by a thin line.',
      heads: ['Spectral', 'Morphology', 'Shadows', 'Weather', 'Embeddings'],
      groups: [
        { name: 'Adding groups', rows: [['Stage 1', [0]], ['Stage 2', [0, 1]], ['Stage 3', [0, 1, 2]], ['Stage 4', [0, 1, 2, 3]]] },
        { name: 'Leaving one group out', rows: [['without morphology', [0, 2, 3]], ['without shadows', [0, 1, 3]], ['without weather', [0, 1, 2]]] },
        { name: 'Cross-check', rows: [['Embeddings instead of', 'morphology and shadows', [0, 3, 4]]] },
      ],
      net: 'U-Net', netSub: 'the same in every run',
    },
  }
  const cx = [276, 346, 416, 486, 556]
  for (const [lang, t] of Object.entries(L)) {
    const p = []
    let y = 40
    t.heads.forEach((head, i) => p.push(`<text class="fig-hd" x="${cx[i]}" y="14" text-anchor="middle">${esc(head)}</text>`))
    t.groups.forEach((group) => {
      p.push(`<text class="fig-hd" x="8" y="${y - 8}">${esc(group.name)}</text>`)
      for (const row of group.rows) {
        const lines = row.length === 3 ? row.slice(0, 2) : [row[0]]
        const on = row[row.length - 1]
        p.push(label(8, y + 16, lines, 'fig-t', 15, 'start'))
        for (let i = 0; i < 5; i++) {
          const cls = on.includes(i) ? 'fig-cell' : 'fig-box-quiet'
          p.push(`<rect class="${cls}" x="${cx[i] - 9}" y="${y + 7}" width="18" height="18" rx="3"/>`)
        }
        p.push(`<path class="fig-ln" d="M568 ${y + 16}H598"/>`)
        y += 32
      }
      y += 26
    })
    p.push(box(604, 40, 232, 308, 'fig-focus'))
    p.push(`<text class="fig-t-on" x="720" y="188" text-anchor="middle">${esc(t.net)}</text>`)
    p.push(`<text class="fig-t-on-s" x="720" y="208" text-anchor="middle">${esc(t.netSub)}</text>`)
    write(`berlin-lst-downscaling/ablation.${lang}.svg`, svg({ id: 'fig-lst-ablation', w: 840, h: 360, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= urban-tree-transfer/spatial-blocks =======================
{
  const L = {
    de: {
      title: 'Zufällige Aufteilung gegen räumliche Blöcke',
      desc: 'Zwei Felder nebeneinander, jedes mit zehn mal sechs Baumpunkten auf einem feinen Raster. Im linken Feld Zufällige Aufteilung sind die Punkte einzeln und gemischt Training oder Test, etwa jeder fünfte ist Test. Im rechten Feld Räumliche Blöcke, 1200 m teilen dickere Linien das Feld in fünf mal drei Blöcke zu je zwei mal zwei Bäumen. Ganze Blöcke sind Training oder Test; drei Testblöcke sind akzentfarben hinterlegt und ihre Punkte nur umrandet. Unter dem linken Feld steht: Nachbarbäume landen in Training und Test, das Ergebnis wirkt zu gut. Unter dem rechten: Ganze Blöcke sind Training oder Test, der Test misst echte Übertragung. Unten eine Legende: gefüllter Punkt Training, offener Punkt Test. Hervorgehoben sind die drei Testblöcke.',
      heads: ['Zufällige Aufteilung', 'Räumliche Blöcke, 1200 m'],
      notes: [['Nachbarbäume landen in Training und', 'Test: das Ergebnis wirkt zu gut'], ['Ganze Blöcke sind Training oder Test:', 'der Test misst echte Übertragung']],
      legend: ['Training', 'Test'],
    },
    en: {
      title: 'Random split versus spatial blocks',
      desc: 'Two fields side by side, each with ten by six tree dots on a faint grid. In the left field, random split, the dots are training or test one by one in a mixed pattern; about one in five is test. In the right field, spatial blocks, 1200 m, thicker lines divide the field into five by three blocks of two by two trees. Whole blocks are training or test; three test blocks have an accent background and their dots are outlines only. Below the left field: neighbouring trees end up in training and test, the score looks too good. Below the right: whole blocks are training or test, the test measures real transfer. At the bottom a legend: filled dot training, open dot test. The three test blocks are highlighted.',
      heads: ['Random split', 'Spatial blocks, 1200 m'],
      notes: [['Neighbouring trees end up in training', 'and test: the score looks too good'], ['Whole blocks are training or test:', 'the test measures real transfer']],
      legend: ['Training', 'Test'],
    },
  }
  const W = 240, H = 144, pitch = 24, off = (i, j) => [((i * 13 + j * 7) % 11) - 5, ((i * 5 + j * 17) % 11) - 5]
  const grid = (gx, gy) => {
    let d = ''
    for (let i = 0; i <= 10; i++) d += `M${gx + i * pitch} ${gy}V${gy + H}`
    for (let j = 0; j <= 6; j++) d += `M${gx} ${gy + j * pitch}H${gx + W}`
    return `<path class="fig-grid" d="${d}"/>`
  }
  const blocks = (gx, gy) => {
    let d = ''
    for (let i = 1; i < 5; i++) d += `M${gx + i * 48} ${gy}V${gy + H}`
    for (let j = 1; j < 3; j++) d += `M${gx} ${gy + j * 48}H${gx + W}`
    return `<path class="fig-ln" d="${d}"/>`
  }
  const dot = (gx, gy, i, j, cls) => {
    const [dx, dy] = off(i, j)
    return `<circle class="${cls}" cx="${r1(gx + 12 + i * pitch + dx)}" cy="${r1(gy + 12 + j * pitch + dy)}" r="5"/>`
  }
  const gx = [80, 520], gy = 28
  const tests = [[0, 0], [2, 1], [4, 2]]
  for (const [lang, t] of Object.entries(L)) {
    const p = []
    p.push(`<text class="fig-hd" x="${gx[0]}" y="14">${esc(t.heads[0])}</text>`)
    p.push(`<text class="fig-hd" x="${gx[1]}" y="14">${esc(t.heads[1])}</text>`)
    p.push(grid(gx[0], gy))
    for (let j = 0; j < 6; j++) for (let i = 0; i < 10; i++) p.push(dot(gx[0], gy, i, j, (i + 2 * j) % 5 === 0 ? 'fig-dot-open' : 'fig-bar'))
    p.push(grid(gx[1], gy))
    p.push(blocks(gx[1], gy))
    for (const [bx, by] of tests) p.push(`<rect class="fig-focus" x="${gx[1] + bx * 48}" y="${gy + by * 48}" width="48" height="48" rx="6"/>`)
    for (let j = 0; j < 6; j++) {
      for (let i = 0; i < 10; i++) {
        const isTest = tests.some(([bx, by]) => Math.floor(i / 2) === bx && Math.floor(j / 2) === by)
        p.push(dot(gx[1], gy, i, j, isTest ? 'fig-dot-on' : 'fig-bar'))
      }
    }
    p.push(label(gx[0] + W / 2, 200, t.notes[0], 'fig-t-s', 16))
    p.push(label(gx[1] + W / 2, 200, t.notes[1], 'fig-t-s', 16))
    p.push(`<circle class="fig-bar" cx="382" cy="248" r="5"/>`)
    p.push(`<text class="fig-t-s" x="394" y="252">${esc(t.legend[0])}</text>`)
    p.push(`<circle class="fig-dot-open" cx="472" cy="248" r="5"/>`)
    p.push(`<text class="fig-t-s" x="484" y="252">${esc(t.legend[1])}</text>`)
    write(`urban-tree-transfer/spatial-blocks.${lang}.svg`, svg({ id: 'fig-utt-blocks', w: 840, h: 270, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= urban-tree-transfer/transfer =======================
{
  const L = {
    de: {
      title: 'Leipzig: Ergebnis nach Anteil lokaler Daten',
      desc: 'Liniendiagramm: gewichteter F1 von 0,3 bis 0,8 über den Anteil Leipziger Trainingsdaten. Hervorgehoben ist die Linie des Berlin-Modells, nachtrainiert. Werte: ohne Leipziger Daten 0,38, bei 10 Prozent 0,50, bei 25 Prozent 0,57, bei 50 Prozent 0,66, bei 100 Prozent 0,77. Zwei gestrichelte Referenzen: Nur Leipzig, von Grund auf 0,79, und Berlin im eigenen Test 0,75.',
      xTitle: 'Anteil Leipziger Trainingsdaten', yTitle: 'Gewichteter F1', xTicks: ['0 %', '10 %', '25 %', '50 %', '100 %'], yTicks: ['0,3', '0,4', '0,5', '0,6', '0,7', '0,8'],
      zero: 'Zero-Shot', series: 'Berlin-Modell, nachtrainiert',
      refs: [['Nur Leipzig, von Grund auf: 0,79', 0.79], ['Berlin, eigener Test: 0,75', 0.75]],
      vals: ['0,38', '0,50', '0,57', '0,66', '0,77'],
    },
    en: {
      title: 'Leipzig: score by share of local data',
      desc: 'Line chart: weighted F1 from 0.3 to 0.8 against the share of Leipzig training data. Highlighted is the line of the Berlin model, fine-tuned. Values: without Leipzig data 0.38, at 10 percent 0.50, at 25 percent 0.57, at 50 percent 0.66, at 100 percent 0.77. Two dashed references: Leipzig only, from scratch 0.79, and Berlin in its own test 0.75.',
      xTitle: 'Share of Leipzig training data', yTitle: 'Weighted F1', xTicks: ['0 %', '10 %', '25 %', '50 %', '100 %'], yTicks: ['0.3', '0.4', '0.5', '0.6', '0.7', '0.8'],
      zero: 'zero-shot', series: 'Berlin model, fine-tuned',
      refs: [['Leipzig only, from scratch: 0.79', 0.79], ['Berlin, own test: 0.75', 0.75]],
      vals: ['0.38', '0.50', '0.57', '0.66', '0.77'],
    },
  }
  for (const [lang, t] of Object.entries(L)) {
    const x0 = 90, x1 = 560, yt = 40, yb = 320
    const X = (pct) => x0 + (pct / 100) * (x1 - x0)
    const Y = (v) => yb - ((v - 0.3) / 0.5) * (yb - yt)
    const pts = [[0, 0.38], [10, 0.5], [25, 0.57], [50, 0.66], [100, 0.77]]
    const p = []
    for (let i = 1; i < 6; i++) p.push(`<path class="fig-grid" d="M${x0} ${r1(Y(0.3 + i * 0.1))}H${x1}"/>`)
    t.refs.forEach(([, v]) => p.push(`<path class="fig-ln fig-dash" d="M${x0} ${r1(Y(v))}H${x1}"/>`))
    p.push(`<path class="fig-base" d="M${x0} ${yt}V${yb}"/>`)
    p.push(`<path class="fig-base" d="M${x0} ${yb}H${x1}"/>`)
    t.yTicks.forEach((tick, i) => p.push(`<text class="fig-num-s" x="80" y="${r1(Y(0.3 + i * 0.1) + 4)}" text-anchor="end">${tick}</text>`))
    t.xTicks.forEach((tick, i) => p.push(`<text class="fig-num-s" x="${r1(X(pts[i][0]))}" y="338" text-anchor="middle">${tick}</text>`))
    p.push(`<text class="fig-t-s" x="${(x0 + x1) / 2}" y="362" text-anchor="middle">${esc(t.xTitle)}</text>`)
    p.push(`<text class="fig-t-s" x="26" y="180" text-anchor="middle" transform="rotate(-90 26 180)">${esc(t.yTitle)}</text>`)
    p.push(`<path class="fig-ln-acc" d="${pts.map(([x, v], i) => `${i === 0 ? 'M' : 'L'}${r1(X(x))} ${r1(Y(v))}`).join('')}"/>`)
    pts.forEach(([x, v], i) => {
      const last = i === pts.length - 1
      p.push(`<circle class="fig-bar-acc" cx="${r1(X(x))}" cy="${r1(Y(v))}" r="4"/>`)
      p.push(`<text class="fig-num-s" x="${r1(last ? X(x) - 4 : X(x))}" y="${r1(Y(v) - 11)}" text-anchor="${last ? 'end' : 'middle'}">${t.vals[i]}</text>`)
    })
    p.push(`<text class="fig-t-s" x="${x0}" y="292" text-anchor="middle">${esc(t.zero)}</text>`)
    p.push(`<text class="fig-t-s" x="580" y="62">${esc(t.series)}</text>`)
    t.refs.forEach(([text, v], i) => p.push(`<text class="fig-t-s" x="572" y="${r1(i === 0 ? Y(v) - 9 : Y(v) + 14)}">${esc(text)}</text>`))
    write(`urban-tree-transfer/transfer.${lang}.svg`, svg({ id: 'fig-utt-transfer', w: 840, h: 380, title: t.title, desc: t.desc, body: p.join('\n  ') }))
  }
}

// ======================= covers (wordless) =======================
const cover = (body) => `<svg class="figure-svg fig-cover" width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${body.trim()}
</svg>
`
{ // tourengenie: accent bg, a plain grid, two tours and one dashed ghost tour, stops, depot
  write('tourengenie/cover.svg', cover(`<rect class="fig-cover-acc" width="1600" height="900"/>
  <path class="fig-cover-hair" d="M100 0V900M200 0V900M300 0V900M400 0V900M500 0V900M600 0V900M700 0V900M800 0V900M900 0V900M1000 0V900M1100 0V900M1200 0V900M1300 0V900M1400 0V900M1500 0V900M0 100H1600M0 200H1600M0 300H1600M0 400H1600M0 500H1600M0 600H1600M0 700H1600M0 800H1600"/>
  <path class="fig-ink-thin" d="M800 470L560 560L330 600L300 760L560 780L800 470"/>
  <path class="fig-ink fig-draw" pathLength="1" d="M800 470L560 380L430 250L620 160L900 210L1010 330L800 470"/>
  <path class="fig-ink fig-draw" pathLength="1" d="M800 470L1040 560L1240 500L1330 680L1080 760L880 690L800 470"/>
  <circle class="fig-stop" cx="560" cy="380" r="17"/>
  <circle class="fig-stop" cx="430" cy="250" r="17"/>
  <circle class="fig-stop" cx="620" cy="160" r="17"/>
  <circle class="fig-stop" cx="900" cy="210" r="17"/>
  <circle class="fig-stop" cx="1010" cy="330" r="17"/>
  <circle class="fig-stop" cx="1040" cy="560" r="17"/>
  <circle class="fig-stop" cx="1240" cy="500" r="17"/>
  <circle class="fig-stop" cx="1330" cy="680" r="17"/>
  <circle class="fig-stop" cx="1080" cy="760" r="17"/>
  <circle class="fig-stop" cx="880" cy="690" r="17"/>
  <circle class="fig-stop" cx="560" cy="560" r="17"/>
  <circle class="fig-stop" cx="330" cy="600" r="17"/>
  <circle class="fig-stop" cx="300" cy="760" r="17"/>
  <circle class="fig-stop" cx="560" cy="780" r="17"/>
  <rect class="fig-ink-fill" x="774" y="444" width="52" height="52" rx="6"/>`))
}
{ // urban-tree-transfer: one field of trees, its partner shifted, a third of them open, one accent path between
  const p = ['<rect class="fig-cover-bg" width="1600" height="900"/>']
  let grid = ''
  for (let x = 100; x < 1600; x += 100) grid += `M${x} 0V900`
  for (let y = 100; y < 900; y += 100) grid += `M0 ${y}H1600`
  p.push(`<path class="fig-cover-hair-t" d="${grid}"/>`)
  const tones = ['fig-bar', 'fig-dot', 'fig-bar-acc']
  for (const shift of [0, 800]) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 5; j++) {
        const dx = ((i * 37 + j * 17) % 41) - 20
        const dy = ((i * 23 + j * 29) % 41) - 20
        const ring = shift > 0 && (i + j) % 3 === 0
        const cls = ring ? 'fig-cover-ring' : tones[(i * 2 + j) % 3]
        p.push(`<circle class="${cls}" cx="${130 + shift + i * 90 + dx}" cy="${130 + j * 160 + dy}" r="22"/>`)
      }
    }
  }
  p.push(`<path class="fig-cover-flow fig-draw" pathLength="1" d="M700 600C760 600 760 330 905 330"/>`)
  write('urban-tree-transfer/cover.svg', cover(p.join('\n  ')))
}
