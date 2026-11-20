import assert from 'node:assert/strict'
import test from 'node:test'
import { headingNbsp, inlineHtml, omitBlocked } from './text.ts'

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
