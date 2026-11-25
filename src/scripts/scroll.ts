/** One frame per scroll burst. The callback does not schedule another frame. */
export function createScrollScheduler(update: () => void): () => void {
  let ticking = false
  return () => {
    if (ticking) return
    ticking = true
    globalThis.requestAnimationFrame(() => {
      ticking = false
      update()
    })
  }
}
