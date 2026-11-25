import assert from 'node:assert/strict'
import test from 'node:test'
import {
  TEXT_CLEARANCE,
  dotRadius,
  dotStep,
  easeOutCubic,
  expandBox,
  heatScale,
  placeMap,
  sideFade,
  textClearanceFade,
  waveAmount,
} from './hero-halftone.ts'

test('desktop placement is the full-bleed box shifted right', () => {
  const mapW = 1000
  const mapH = 824.2
  const width = 1200
  const height = 800
  const placed = placeMap(mapW, mapH, width, height, true)
  const bw = width * 0.78
  const s = Math.min(bw / mapW, height / mapH)
  assert.equal(placed.s, s)
  assert.equal(placed.ox, width * 0.26 + (bw - mapW * s) / 2)
  assert.equal(placed.oy, height * 0.02 + (height - mapH * s) / 2)
  assert.ok(placed.ox > width * 0.2)
})

test('the mobile map is contained and centred in the canvas', () => {
  const placed = placeMap(1000, 824.2, 375, 375, false)
  const margin = 375 * 0.04
  const s = Math.min((375 - margin * 2) / 1000, (375 - margin * 2) / 824.2)
  assert.equal(placed.s, s)
  assert.equal(placed.ox, (375 - 1000 * s) / 2)
  assert.equal(placed.oy, (375 - 824.2 * s) / 2)
})

test('dot step stays at least 5px and otherwise follows the width', () => {
  assert.equal(dotStep(300), 5)
  assert.equal(dotStep(1500), 10)
})

test('heat dots grow towards the centre and the wave arrives there first', () => {
  assert.equal(heatScale(0), 1)
  assert.ok(heatScale(0) > heatScale(1))
  assert.ok(dotRadius(10, true, 0) > dotRadius(10, true, 1))
  assert.equal(dotRadius(10, false, 0), 0.8)
  assert.equal(waveAmount(0, 0), 0)
  assert.equal(waveAmount(1, 0), 1)
  assert.ok(waveAmount(0.5, 0) > waveAmount(0.5, 1))
  assert.equal(easeOutCubic(0), 0)
  assert.equal(easeOutCubic(1), 1)
  assert.ok(easeOutCubic(0.5) > 0.5)
})

test('the left fade is only used on the desktop layout', () => {
  assert.equal(sideFade(0, 1000, false), 1)
  assert.equal(sideFade(0, 1000, true), 0)
  assert.equal(sideFade(220, 1000, true), 0)
  assert.ok(Math.abs(sideFade(420, 1000, true) - 0.5) < 1e-12)
  assert.equal(sideFade(620, 1000, true), 1)
  assert.equal(sideFade(900, 1000, true), 1)
})

test('desktop dots inside the headline clearance fade out on top of the left ramp', () => {
  const box = expandBox({ x: 480, y: 520, w: 280, h: 48 }, TEXT_CLEARANCE)
  assert.equal(box.x, 480 - TEXT_CLEARANCE)
  assert.equal(box.w, 280 + TEXT_CLEARANCE * 2)
  assert.equal(textClearanceFade(500, 540, [box], true), 0)
  assert.equal(textClearanceFade(500, 540, [box], false), 1)
  assert.equal(textClearanceFade(900, 200, [box], true), 1)
  assert.equal(sideFade(800, 1000, true) * textClearanceFade(500, 540, [box], true), 0)
  assert.equal(sideFade(800, 1000, true) * textClearanceFade(900, 200, [box], true), 1)
})
