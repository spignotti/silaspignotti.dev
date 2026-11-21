import assert from 'node:assert/strict'
import test from 'node:test'
import { isPlaceholder, parseSections } from './prose.ts'

test('a result placeholder stays, a link line does not', () => {
  const body = ['## Ergebnis', '', 'Die Pipeline ist fertig.', '', '[Platzhalter: Endergebnis]', '', '[Mehr](/projekte)', ''].join('\n')
  const section = parseSections(body)[0]
  assert.deepEqual(section?.paragraphs, ['Die Pipeline ist fertig.', '[Platzhalter: Endergebnis]'])
  assert.equal(isPlaceholder('[Placeholder: legal text]'), true)
  assert.equal(isPlaceholder('[Mehr](/projekte)'), false)
})
