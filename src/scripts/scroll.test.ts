import assert from 'node:assert/strict'
import test from 'node:test'
import { createScrollScheduler } from './scroll.ts'

test('the scroll scheduler queues one frame and does not requeue it', () => {
  let frames = 0
  let queued: FrameRequestCallback | undefined
  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    frames += 1
    queued = callback
    return frames
  }) as typeof requestAnimationFrame
  let updates = 0
  const schedule = createScrollScheduler(() => {
    updates += 1
  })
  assert.equal(frames, 0)
  schedule()
  schedule()
  assert.equal(frames, 1)
  queued?.(0)
  assert.equal(updates, 1)
  assert.equal(frames, 1)
})
