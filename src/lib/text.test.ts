import assert from 'node:assert/strict'
import test from 'node:test'
import { headingNbsp, inlineHtml, linkifySectionPhrase, omitBlocked, pruneDeadCaseLinks } from './text.ts'

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
  assert.equal(headingNbsp('Routing Engine · Solver').includes('\u00A0·'), true)
})

test('a proof link to a removed case is dropped and the rest stays', () => {
  const proof =
    '[Masterarbeit · Berliner Hitze auf 10 m](/projekte/berlin-lst-downscaling), [Routing Engine · Planung und Solver](/projekte/routing-engine-solver), [urban-tree-transfer](https://github.com/spignotti/urban-tree-transfer)'
  const left = pruneDeadCaseLinks(proof, ['routing-engine-solver'], 'de')
  assert.equal(
    left,
    '[Routing Engine · Planung und Solver](/projekte/routing-engine-solver), [urban-tree-transfer](https://github.com/spignotti/urban-tree-transfer)',
  )
})

test('a comma inside a link label or target does not split the proof', () => {
  const labelled = '[Routing Engine · Built with Agents, Run in Production](/en/projects/routing-engine-agentic), section "How I work"'
  assert.equal(pruneDeadCaseLinks(labelled, ['routing-engine-agentic'], 'en'), labelled)
  assert.equal(pruneDeadCaseLinks(labelled, [], 'en'), 'section "How I work"')
  const targeted = '[Notes](https://example.com/a,b), Abschnitt „So arbeite ich“'
  assert.equal(pruneDeadCaseLinks(targeted, [], 'de'), targeted)
})

test('only dead case links leave nothing to render', () => {
  assert.equal(pruneDeadCaseLinks('', [], 'de'), '')
  assert.equal(pruneDeadCaseLinks('[KPI-Referenz](/projekte/kpi-reference)', [], 'de'), '')
  assert.equal(pruneDeadCaseLinks('[KPI Reference](/en/projects/kpi-reference)', ['kpi-reference'], 'en'), '[KPI Reference](/en/projects/kpi-reference)')
})

test('the how-I-work phrase still links to the home section', () => {
  const proof = pruneDeadCaseLinks(
    '[Routing Engine · agentisch gebaut bis in den Betrieb](/projekte/routing-engine-agentic), Abschnitt „So arbeite ich“',
    [],
    'de',
  )
  const html = linkifySectionPhrase(inlineHtml(proof, 'tl tl-acc'), 'de')
  assert.equal(html.includes('/projekte/routing-engine-agentic'), false)
  assert.match(html, /href="#so-arbeite-ich"/)
  assert.match(html, /Abschnitt „So arbeite ich“/)
  const english = linkifySectionPhrase(inlineHtml('section "How I work"', 'tl tl-acc'), 'en')
  assert.match(english, /href="#how-i-work"/)
})
