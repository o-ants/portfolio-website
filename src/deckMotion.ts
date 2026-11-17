const perspective = 1240

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
export const mix = (from: number, to: number, amount: number) => from + (to - from) * amount

export function deckPose(index: number, position: number, selected: number | null, last: number, height: number, cardHeight: number, reduced: boolean) {
  const depth = index / last
  const distance = index - position
  const step = Math.min(.092, .83 / last)
  const span = step * last
  let scale = mix(.62, .92, depth)
  let y = (distance * step + mix(-span / 2, span * .33, position / last)) * height
  let z = reduced ? 0 : mix(-125, 4, depth)
  let angle = reduced ? -34 : mix(-51, -60, clamp(Math.abs(distance) / 2, 0, 1))
  let scaleY = scale * (reduced ? .77 : 1)

  if (selected !== null) {
    const offset = index - selected
    const side = Math.sign(offset)
    const activeHeight = Math.min(.88, .42 * height / cardHeight)
    if (!side) return [0, reduced ? 0 : 24, 0, .75, activeHeight]

    scale = mix(.62, .9, depth)
    z = reduced ? 0 : mix(-120, -15, depth)
    angle = reduced ? -34 : -60
    scaleY = scale * (reduced ? .68 : 1)
    const gap = cardHeight * activeHeight / 2 / (reduced ? 1 : 1 - 24 / perspective) + Math.max(4, height * .009)
    const neighbors = side < 0 ? selected : last - selected
    const step = Math.min(height * .059, (height * .46 - gap) / Math.max(1, neighbors - 1))
    const nearEdge = -side * cardHeight * scaleY / 2
    const radians = angle * Math.PI / 180
    y = side * (gap + (Math.abs(offset) - 1) * step) * (1 - (z + nearEdge * Math.sin(radians)) / perspective) - nearEdge * Math.cos(radians)
  }

  return [y, z, angle, scale, scaleY]
}

export function swipeSteps(delta: number, horizontal: number, height: number) {
  return Math.abs(delta) >= 36 && Math.abs(delta) > Math.abs(horizontal)
    ? Math.sign(delta) * (1 + Math.floor(Math.abs(delta) / Math.max(72, height * .23)))
    : 0
}
