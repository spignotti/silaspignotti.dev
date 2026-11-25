import assert from 'node:assert/strict'
import test from 'node:test'
import { LEGACY_SECTION_IDS, SECTION_IDS, pagePath, switchPath } from '../i18n.ts'

test('old home hashes stay distinct from the current section ids', () => {
  assert.equal(LEGACY_SECTION_IDS.de.areas, 'arbeitsfelder')
  assert.equal(LEGACY_SECTION_IDS.de.projects, 'fallstudien')
  assert.equal(LEGACY_SECTION_IDS.en.areas, 'areas-of-work')
  assert.equal(LEGACY_SECTION_IDS.en.projects, 'case-studies')
  assert.notEqual(LEGACY_SECTION_IDS.de.areas, SECTION_IDS.de.areas)
  assert.notEqual(LEGACY_SECTION_IDS.de.projects, SECTION_IDS.de.projects)
  assert.notEqual(LEGACY_SECTION_IDS.en.areas, SECTION_IDS.en.areas)
  assert.notEqual(LEGACY_SECTION_IDS.en.projects, SECTION_IDS.en.projects)
})

test('each legal page switches to its counterpart', () => {
  assert.equal(pagePath('de', 'imprint'), '/impressum')
  assert.equal(pagePath('en', 'imprint'), '/en/legal-notice')
  assert.equal(pagePath('de', 'privacy'), '/datenschutz')
  assert.equal(pagePath('en', 'privacy'), '/en/privacy')
  assert.equal(switchPath('de', pagePath('en', 'imprint')), '/en/legal-notice')
  assert.equal(switchPath('en', pagePath('de', 'imprint')), '/impressum')
  assert.equal(switchPath('de', pagePath('en', 'privacy')), '/en/privacy')
  assert.equal(switchPath('en', pagePath('de', 'privacy')), '/datenschutz')
})
