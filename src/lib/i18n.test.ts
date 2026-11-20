import assert from 'node:assert/strict'
import test from 'node:test'
import { pagePath, switchPath } from '../i18n.ts'

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
