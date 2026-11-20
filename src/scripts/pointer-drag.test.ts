import assert from 'node:assert/strict'
import test from 'node:test'
import { bindPointerDrag } from './pointer-drag.ts'

test('a drag ends on pointerup, pointercancel and lostpointercapture', () => {
  const listeners = new Map<string, (event: PointerEvent) => void>()
  const el = {
    addEventListener(type: string, fn: (event: PointerEvent) => void) {
      listeners.set(type, fn)
    },
    setPointerCapture() {},
  }
  const moved: number[] = []
  bindPointerDrag(el as unknown as HTMLElement, (event) => moved.push(event.pointerId))
  const fire = (type: string, pointerId: number) => listeners.get(type)?.({ pointerId } as PointerEvent)

  fire('pointerdown', 3)
  fire('pointermove', 3)
  fire('pointermove', 9)
  assert.deepEqual(moved, [3, 3])

  fire('pointerup', 3)
  fire('pointermove', 3)
  assert.deepEqual(moved, [3, 3])

  fire('pointerdown', 4)
  fire('pointercancel', 4)
  fire('pointermove', 4)
  assert.deepEqual(moved, [3, 3, 4])

  fire('pointerdown', 5)
  fire('lostpointercapture', 5)
  fire('pointermove', 5)
  assert.deepEqual(moved, [3, 3, 4, 5])

  fire('pointercancel', 5)
  fire('pointerdown', 6)
  assert.deepEqual(moved, [3, 3, 4, 5, 6])
})
