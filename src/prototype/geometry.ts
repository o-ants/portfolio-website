export type Settings = { radius: number; count: number; scale: number; spacing: number; depth: number; length: number }
export const defaults: Settings = { radius: 255, count: 60, scale: 1, spacing: 350, depth: 150, length: 2200 }
export const clamp = (n: number) => Math.max(0, Math.min(1, n))
export const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t) }
export const mix = (a: number, b: number, t: number) => a + (b - a) * t
export function spherePoints(count: number) {
  const points = Array.from({ length: count }, (_, i) => {
    const y = 1 - 2 * (i + .5) / count
    const r = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5))
    return { x: Math.cos(a) * r, y, z: Math.sin(a) * r }
  })
  // Reserve three front-facing points for the persistent project cards.
  const selected = [-.55, 0, .55].map(x => {
    let best = 0, distance = Infinity
    points.forEach((p, i) => {
      const d = (p.x - x) ** 2 + p.y ** 2 + (p.z - Math.sqrt(1 - x*x)) ** 2
      if (d < distance) { best = i; distance = d }
    })
    return points.splice(best, 1)[0]
  })
  return [...selected, ...points]
}
