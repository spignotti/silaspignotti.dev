/** Drag follows one pointer and stops on up, cancel, or lost capture. */
export function bindPointerDrag(el: HTMLElement, onMove: (event: PointerEvent) => void): void {
  let pointerId: number | null = null
  const end = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return
    pointerId = null
  }
  el.addEventListener('pointerdown', (event) => {
    if (pointerId !== null) return
    pointerId = event.pointerId
    el.setPointerCapture(event.pointerId)
    onMove(event)
  })
  el.addEventListener('pointermove', (event) => {
    if (pointerId !== event.pointerId) return
    onMove(event)
  })
  el.addEventListener('pointerup', end)
  el.addEventListener('pointercancel', end)
  el.addEventListener('lostpointercapture', end)
}
