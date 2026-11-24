import assert from 'node:assert/strict'
import test from 'node:test'
import { headingNbsp, inlineHtml, omitBlocked, pruneDeadCaseLinks } from './text.ts'

test('inline code keeps the word and drops the markdown marks', () => {
  const html = inlineHtml('Ein Release ist ein Versions-Tag auf `main`.')
  assert.equal(html.includes('`'), false)
  assert.match(html, /<code>main<\/code>/)
  assert.match(html, /Versions-Tag auf <code>main<\/code>\./)
})

test('bold, italics and links still render', () => {
  const html = inlineHtml('**Fett** und *kursiv* und [Text](/projekte)')
  assert.match(html, /<strong>Fett<\/strong>/)
  assert.match(html, /<em>kursiv<\/em>/)
  assert.match(html, /href="\/projekte"/)
})

test('a blocked sentence is removed and a heading keeps the no-break space', () => {
  const blocked = 'Sichtbarer Satz. [' + 'OFFEN: weg] Danach.'
  assert.equal(omitBlocked(blocked).includes('[' + 'OFFEN'), false)
  assert.equal(omitBlocked(blocked).includes('Sichtbarer Satz.'), true)
  assert.equal(headingNbsp('Masterarbeit · Berliner Hitze').includes('\u00A0·'), true)
})

test('a proof link to a removed case is dropped and the rest stays', () => {
  const proof =
    '[Tourengenie](/projekte/tourengenie), [Masterarbeit](/projekte/berlin-lst-downscaling), [urban-tree-transfer](https://github.com/spignotti/urban-tree-transfer)'
  const left = pruneDeadCaseLinks(proof, ['tourengenie'], 'de')
  assert.equal(left, '[Tourengenie](/projekte/tourengenie), [urban-tree-transfer](https://github.com/spignotti/urban-tree-transfer)')
})

test('a comma inside a link label or target does not split the proof', () => {
  const labelled = '[Tourengenie · Planung, Betrieb und Auswertung](/projekte/tourengenie), Betrieb seit 2026'
  assert.equal(pruneDeadCaseLinks(labelled, ['tourengenie'], 'de'), labelled)
  assert.equal(pruneDeadCaseLinks(labelled, [], 'de'), 'Betrieb seit 2026')
  const targeted = '[Notizen](https://example.com/a,b), Text ohne Link'
  assert.equal(pruneDeadCaseLinks(targeted, [], 'de'), targeted)
})

test('only dead case links leave nothing to render', () => {
  assert.equal(pruneDeadCaseLinks('', [], 'de'), '')
  assert.equal(pruneDeadCaseLinks('[KPI-Referenz](/projekte/kpi-reference)', [], 'de'), '')
  assert.equal(pruneDeadCaseLinks('[Tourengenie](/en/projects/tourengenie)', ['tourengenie'], 'en'), '[Tourengenie](/en/projects/tourengenie)')
})
