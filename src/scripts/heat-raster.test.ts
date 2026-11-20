import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { Hero, createScrollScheduler, dprFor, illustrativeNote, startHero, watchCanvas } from './heat-raster.ts'

type Fake = {
  width: number
  height: number
  clientWidth: number
  clientHeight: number
  getContext: () => FakeContext
  getBoundingClientRect: () => DOMRect
}

type FakeContext = {
  drawImage: (src: { width: number }) => void
  putImageData: () => void
  clearRect: () => void
  fillRect: () => void
  setTransform: () => void
  save: () => void
  restore: () => void
  stroke: () => void
  imageSmoothingEnabled: boolean
  globalAlpha: number
  strokeStyle: string
  lineWidth: number
}

function installDom() {
  const canvases: Fake[] = []
  let draws = 0
  const context = (): FakeContext => ({
    drawImage(src) {
      if (src.width === 0) throw new Error('source width is zero')
      draws += 1
    },
    putImageData() {},
    clearRect() {},
    fillRect() {},
    setTransform() {},
    save() {},
    restore() {},
    stroke() {},
    imageSmoothingEnabled: false,
    globalAlpha: 1,
    strokeStyle: '',
    lineWidth: 1,
  })
  const make = (): Fake => {
    const canvas: Fake = {
      width: 0,
      height: 0,
      clientWidth: 0,
      clientHeight: 0,
      getContext: () => context(),
      getBoundingClientRect: () =>
        ({
          left: 0,
          top: 0,
          right: canvas.clientWidth,
          bottom: canvas.clientHeight,
          width: canvas.clientWidth,
          height: canvas.clientHeight,
          x: 0,
          y: 0,
          toJSON() {
            return {}
          },
        }) as DOMRect,
    }
    canvases.push(canvas)
    return canvas
  }
  class Path2D {
    addPath() {}
  }
  class DOMMatrixStub {
    translate() {
      return this
    }
    scale() {
      return this
    }
  }
  class ImageDataStub {
    data: Uint8ClampedArray
    constructor(
      public width: number,
      public height: number,
    ) {
      if (!(width > 0) || !(height > 0)) throw new Error('source width is zero')
      this.data = new Uint8ClampedArray(width * height * 4)
    }
  }
  Object.assign(globalThis, {
    Path2D,
    DOMMatrix: DOMMatrixStub,
    ImageData: ImageDataStub,
    devicePixelRatio: 1,
    document: {
      documentElement: {},
      createElement: () => make(),
    },
  })
  globalThis.getComputedStyle = (() =>
    ({
      getPropertyValue(name: string) {
        if (name === '--heat-lo') return '#3b3e45'
        if (name === '--heat-hi') return '#d4724a'
        if (name === '--heat-out') return '#e9e6e0'
        if (name === '--color-text') return '#151922'
        return ''
      },
    }) as CSSStyleDeclaration) as typeof getComputedStyle
  return { make, draws: () => draws }
}

const raster = {
  w: 4,
  h: 4,
  v: new Float32Array(16).fill(0.4),
  frame: [0, 0, 4, 4],
}

function heroFor(canvas: Fake) {
  return new Hero({
    canvas: canvas as unknown as HTMLCanvasElement,
    data: raster,
    outline: 'M0 0L4 0L4 4Z',
    levels: [10, 6, 4, 2, 1],
    base: 4,
    fit: () => ({ s: 1, ox: 0, oy: 0 }),
    clear: () => [],
  })
}

test('a zero-size canvas is not built and does not throw', () => {
  const { make } = installDom()
  const canvas = make()
  const hero = heroFor(canvas)
  assert.equal(hero.build(), false)
  assert.equal(canvas.width, 0)
  assert.equal(canvas.height, 0)
})

test('ResizeObserver builds a non-zero canvas; reduced motion shows the finest level without a sweep', () => {
  const { make } = installDom()
  const canvas = make()
  let frames = 0
  globalThis.requestAnimationFrame = (() => {
    frames += 1
    return frames
  }) as typeof requestAnimationFrame
  let observed: ResizeObserverCallback | undefined
  globalThis.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      observed = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver
  const hero = heroFor(canvas)
  startHero(hero, { reducedMotion: true, level: () => 0 })
  assert.equal(hero.level, -1)
  assert.equal(frames, 0)
  observed?.([{ contentRect: { width: 180, height: 90, x: 0, y: 0, top: 0, left: 0, bottom: 90, right: 180, toJSON() { return {} } } }] as ResizeObserverEntry[], {} as ResizeObserver)
  assert.ok(canvas.width > 0)
  assert.equal(hero.level, hero.levels.length - 1)
  assert.equal(hero.sweep, null)
  assert.equal(frames, 0)
})

test('an instant show does not schedule a frame, and a finished sweep does not keep one running', () => {
  const { make } = installDom()
  const canvas = make()
  const hero = heroFor(canvas)
  assert.equal(hero.build({ w: 120, h: 80 }), true)
  let queued: FrameRequestCallback | undefined
  let frames = 0
  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    frames += 1
    queued = callback
    return frames
  }) as typeof requestAnimationFrame
  hero.show(hero.levels.length - 1, { instant: true })
  assert.equal(frames, 0)
  assert.equal(hero.sweep, null)
  hero.show(0)
  assert.equal(frames, 1)
  queued?.(performance.now() + 5000)
  assert.equal(hero.sweep, null)
  assert.equal(frames, 1)
})

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

test('the note follows the illustrative flag on the real manifests', () => {
  const heat = JSON.parse(readFileSync(new URL('../assets/geo/heat-illustrative.json', import.meta.url), 'utf8')) as { illustrative?: boolean }
  const compare = JSON.parse(readFileSync(new URL('../assets/geo/heat-compare-illustrative.json', import.meta.url), 'utf8')) as { illustrative?: boolean }
  for (const manifest of [heat, compare]) {
    const note = illustrativeNote(manifest, 'de')
    if (manifest.illustrative === true) assert.equal(note, 'Illustrativ, keine Messdaten')
    else assert.equal(note, null)
    const english = illustrativeNote(manifest, 'en')
    if (manifest.illustrative === true) assert.equal(english, 'Illustrative, not measured data')
    else assert.equal(english, null)
  }
  assert.equal(illustrativeNote({ illustrative: false }, 'de'), null)
  assert.equal(illustrativeNote({ illustrative: true }, 'en'), 'Illustrative, not measured data')
})

test('startHero repaints after the observer rebuilds a canvas that already had a size', () => {
  const { make, draws } = installDom()
  const canvas = make()
  canvas.clientWidth = 180
  canvas.clientHeight = 90
  const queued: FrameRequestCallback[] = []
  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    queued.push(callback)
    return queued.length
  }) as typeof requestAnimationFrame
  let observed: ResizeObserverCallback | undefined
  globalThis.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      observed = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver
  const hero = heroFor(canvas)
  startHero(hero, { reducedMotion: false, level: () => 2 })
  assert.ok(canvas.width > 0)
  assert.equal(queued.length, 1)
  assert.notEqual(hero.sweep, null)
  const afterFirst = draws()
  assert.ok(afterFirst > 0)
  const firstSweep = hero.sweep
  const rect = { width: 180, height: 90, x: 0, y: 0, top: 0, left: 0, bottom: 90, right: 180, toJSON() { return {} } }
  observed?.([{ contentRect: rect }] as ResizeObserverEntry[], {} as ResizeObserver)
  assert.ok(draws() > afterFirst)
  assert.notEqual(hero.sweep, null)
  assert.notEqual(hero.sweep, firstSweep)
  assert.equal(queued.length, 2)
  const beforeStale = draws()
  queued[0]?.(performance.now())
  assert.equal(draws(), beforeStale)
  queued[1]?.(performance.now() + 5000)
  assert.ok(draws() > beforeStale)
  assert.equal(hero.sweep, null)
  const afterSweep = draws()
  const later = { width: 180, height: 80, x: 0, y: 0, top: 0, left: 0, bottom: 80, right: 180, toJSON() { return {} } }
  observed?.([{ contentRect: later }] as ResizeObserverEntry[], {} as ResizeObserver)
  assert.ok(draws() > afterSweep)
})

test('the rounded canvas stays within 4 MP, including a scale below 1', () => {
  globalThis.devicePixelRatio = 2
  assert.equal(dprFor(100, 80), 2)
  const wide = dprFor(2000, 1000)
  assert.equal(wide, 1.25)
  assert.ok(Math.round(2000 * wide) * Math.round(1000 * wide) <= 4_000_000)

  globalThis.devicePixelRatio = 1
  const below = dprFor(3000, 2000)
  assert.ok(below < 1)
  assert.ok(below > 0)
  assert.ok(Math.round(3000 * below) * Math.round(2000 * below) <= 4_000_000)

  const w = 2000.5
  const h = 1999.5
  assert.ok(w * h <= 4_000_000)
  assert.ok(Math.round(w) * Math.round(h) > 4_000_000)
  const rounded = dprFor(w, h)
  assert.ok(rounded < 1)
  assert.ok(Math.round(w * rounded) * Math.round(h * rounded) <= 4_000_000)

  globalThis.devicePixelRatio = 0.5
  const low = dprFor(5000, 5000)
  assert.ok(low < 0.5)
  assert.ok(low > 0)
  assert.ok(Math.round(5000 * low) * Math.round(5000 * low) <= 4_000_000)
})

test('watchCanvas ignores a zero size and reports a later size', () => {
  const { make } = installDom()
  const canvas = make()
  const seen: { w: number; h: number }[] = []
  let observed: ResizeObserverCallback | undefined
  globalThis.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      observed = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver
  watchCanvas(canvas as unknown as HTMLElement, (size) => seen.push(size))
  assert.deepEqual(seen, [])
  observed?.([{ contentRect: { width: 0, height: 40, x: 0, y: 0, top: 0, left: 0, bottom: 40, right: 0, toJSON() { return {} } } }] as ResizeObserverEntry[], {} as ResizeObserver)
  assert.deepEqual(seen, [])
  observed?.([{ contentRect: { width: 32, height: 24, x: 0, y: 0, top: 0, left: 0, bottom: 24, right: 32, toJSON() { return {} } } }] as ResizeObserverEntry[], {} as ResizeObserver)
  assert.deepEqual(seen, [{ w: 32, h: 24 }])
})
