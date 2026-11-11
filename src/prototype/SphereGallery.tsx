import { useEffect, useMemo, useRef, useState } from 'react'
import { clamp, defaults, mix, smooth, spherePoints, type Settings } from './geometry'
import { ProjectCard } from './ProjectCard'
import './prototype.css'

const controls: { key: keyof Settings; label: string; min: number; max: number; step: number }[] = [
  { key: 'radius', label: 'Sphere radius', min: 200, max: 310, step: 5 },
  { key: 'count', label: 'Number of cards', min: 40, max: 70, step: 1 },
  { key: 'scale', label: 'Card scale', min: .7, max: 1.2, step: .05 },
  { key: 'spacing', label: 'Card spacing', min: 330, max: 390, step: 5 },
  { key: 'depth', label: 'Concave arc depth', min: 60, max: 230, step: 5 },
  { key: 'length', label: 'Transition length', min: 1200, max: 4000, step: 100 },
]
export default function SphereGallery() {
  const [settings, setSettings] = useState(defaults)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const section = useRef<HTMLElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const tiles = useRef<(HTMLDivElement | null)[]>([])
  const progressLabel = useRef<HTMLSpanElement>(null)
  const phaseLabel = useRef<HTMLSpanElement>(null)
  const progressBar = useRef<HTMLDivElement>(null)
  const points = useMemo(() => spherePoints(settings.count), [settings.count])
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    let frame = 0, start = performance.now()
    const render = (now: number) => {
      const p = reduced ? 1 : clamp(-section.current!.getBoundingClientRect().top / settings.length)
      const unfold = smooth((p - .12) / .78)
      const settle = 1 - smooth(p / .55)
      // Idle breathing rotation is the sole time-based motion; unfolding follows scroll directly.
      const rotation = Math.sin((now - start) * .00012) * .22 * settle
      const fit = Math.min(1, (window.innerWidth - 32) / 1200, (window.innerHeight - 200) / 650)
      world.current!.style.transform = `scale(${Math.max(.23, fit)})`
      points.forEach((point, i) => {
        const tile = tiles.current[i]
        if (!tile) return
        const x = point.x * Math.cos(rotation) + point.z * Math.sin(rotation)
        const z = point.z * Math.cos(rotation) - point.x * Math.sin(rotation)
        const r = settings.radius * (1 + .15 * Math.sin(p * Math.PI))
        const yaw = Math.atan2(x, z) * 180 / Math.PI
        const pitch = -Math.asin(point.y) * 180 / Math.PI
        const main = i < 3, side = i - 1
        const gx = main ? side * settings.spacing : x * r * 1.7
        const gy = main ? 0 : point.y * r * 1.7
        // CSS positive Z is toward the viewer. Both sides are closer than the center.
        const gz = main ? (side === 0 ? -settings.depth / 2 : settings.depth / 2) : z * r - 250
        const angle = main ? -side * Math.atan(settings.depth / settings.spacing) * 180 / Math.PI : yaw
        const scale = mix(.215 * settings.scale, main ? Math.min(settings.scale, 1.05) : .1, unfold)
        tile.style.transform = `translate3d(${mix(x*r, gx, unfold)}px,${mix(point.y*r + 30, gy, unfold)}px,${mix(z*r, gz, unfold)}px) rotateY(${mix(yaw, angle, unfold)}deg) rotateX(${mix(pitch, 0, unfold)}deg) scale(${scale})`
        tile.style.opacity = String(main ? 1 : (1 - smooth((p - .23) / .44)) * (.3 + .7 * smooth((z + 1) / 2)))
        tile.style.visibility = !main && p > .7 ? 'hidden' : 'visible'
      })
      progressLabel.current!.textContent = `${Math.round(p * 100).toString().padStart(2, '0')}%`
      phaseLabel.current!.textContent = p < .2 ? '01 / Sphere' : p < .88 ? '02 / Unfolding' : '03 / Selected work'
      progressBar.current!.style.transform = `scaleX(${p})`
      if (!reduced) frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)
    const resize = () => { if (reduced) render(performance.now()) }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [settings, points, reduced])
  return <main>
    <section ref={section} className={`scroll-track${reduced ? ' reduced' : ''}`} style={{ height: reduced ? '100svh' : `calc(100svh + ${settings.length}px)` }} aria-label="Scroll-driven project gallery">
      <div className="viewport">
        <header className="prototype-header"><div>Olga Antsinova<span>Product Designer</span></div><span className="experiment">Interaction study <i /> 001</span></header>
        <div className="scene-heading"><span className="kicker">A different perspective</span><h1>Ideas take shape.</h1><p>Scroll to unfold selected work.</p></div>
        <div className="stage"><div className="world" ref={world}>
          {points.map((_, i) => <div className="project-tile" key={i} ref={el => { tiles.current[i] = el }} aria-hidden={i >= 3}><ProjectCard index={i} /></div>)}
        </div></div>
        <footer className="scene-footer"><span ref={phaseLabel}>01 / Sphere</span><span className="scroll-hint">{reduced ? 'Reduced motion · static gallery' : 'Scroll to explore ↓ · Scroll back to reassemble'}</span><span ref={progressLabel}>00%</span></footer>
        <div className="progress-track"><div ref={progressBar} /></div>
      </div>
    </section>
    {import.meta.env.DEV && <details className="dev-controls"><summary>Scene controls <span>⚙</span></summary><div className="control-body"><p>LIVE PROTOTYPE SETTINGS</p>{controls.map(c => <label key={c.key} htmlFor={`control-${c.key}`}><span>{c.label}<output>{settings[c.key]}</output></span><input id={`control-${c.key}`} type="range" min={c.min} max={c.max} step={c.step} value={settings[c.key]} onChange={e => setSettings(s => ({ ...s, [c.key]: Number(e.target.value) }))} /></label>)}<button onClick={() => setSettings(defaults)}>Reset defaults ↺</button><small>Abstract placeholders, not final project screens.</small></div></details>}
  </main>
}
