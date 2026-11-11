export type Settings = { radius: number; count: number; scale: number; spacing: number; depth: number; length: number }
export const defaults: Settings = { radius: 255, count: 70, scale: 1.18, spacing: 350, depth: 150, length: 2200 }
export const clamp = (n: number) => Math.max(0, Math.min(1, n))
export const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t) }
export const mix = (a: number, b: number, t: number) => a + (b - a) * t
export function spherePoints(count: number) {
  const points = Array.from({ length: count }, (_, i) => {
    const y = 1 - 2 * (i + .5) / count
    const r = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5))
    return { x: Math.cos(a) * r, y, z: Math.sin(a) * r }
  })
  // Reserve nine front-facing points for the persistent carousel cards.
  const selected = [-.55, 0, .55, -.85, .85, -.35, .35, -.7, .7].map(x => {
    let best = 0, distance = Infinity
    points.forEach((p, i) => {
      const d = (p.x - x) ** 2 + p.y ** 2 + (p.z - Math.sqrt(1 - x*x)) ** 2
      if (d < distance) { best = i; distance = d }
    })
    return points.splice(best, 1)[0]
  })
  return [...selected, ...points]
}

export const gallerySlots = [-1, 0, 1, -2, 2, -3, 3, -4, 4]
export function galleryLayout(width: number, fit: number, depth: number, spacing: number) {
  const radius = Math.max(1100, width / fit * 1.2) * (150 / depth)
  // Put the centers of the two outer visible cards exactly on the viewport edges.
  let low = 0, high = .7
  for (let i = 0; i < 30; i++) {
    const a = (low + high) / 2
    const z = radius * (1 - Math.cos(2 * a)) - depth / 2
    const projected = radius * Math.sin(2 * a) * fit / (1 - z * fit / 1300)
    if (projected < width / 2) low = a
    else high = a
  }
  return { radius, step: (low + high) / 2 * spacing / 350 }
}
export function galleryPoint(slot: number, radius: number, step: number, depth: number) {
  const angle = slot * step
  return { x: radius * Math.sin(angle), z: radius * (1 - Math.cos(angle)) - depth / 2, yaw: -angle * 180 / Math.PI }
}
