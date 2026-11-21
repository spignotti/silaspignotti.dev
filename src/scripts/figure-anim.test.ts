import assert from 'node:assert/strict'
import test from 'node:test'
import { barGrow, buildDelay } from './figure-anim.ts'

test('delay runs from 0 to 700 across the svg width', () => {
  assert.equal(buildDelay(0, 0, 840), 0)
  assert.equal(buildDelay(420, 0, 840), 350)
  assert.equal(buildDelay(840, 0, 840), 700)
  assert.equal(buildDelay(-20, 0, 840), 0)
  assert.equal(buildDelay(900, 0, 840), 700)
  assert.equal(buildDelay(10, 0, 0), 0)
})

test('bars wider than they are tall grow on x', () => {
  assert.equal(barGrow(420, 36), 'x')
  assert.equal(barGrow(72, 190), 'y')
  assert.equal(barGrow(40, 40), 'y')
})
