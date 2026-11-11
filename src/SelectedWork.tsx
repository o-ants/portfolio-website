import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { copy, projects, otherProjects, type Language } from './content'
import { mix, smooth } from './prototype/geometry'

const galleryProjects = [...projects, ...otherProjects.map(project => ({ ...project, en: project.group, ru: project.group }))]
const count = galleryProjects.length
const projectIndex = (tile: number) => ((tile - 1) % count + count) % count

// Latitude rings retain the regular landscape-card rhythm of the reference.
function createGlobe() {
  return [-72, -48, -24, 0, 24, 48, 72].flatMap((latitude, row) => {
    const pitch = latitude * Math.PI / 180
    const count = Math.max(4, Math.round(13 * Math.cos(pitch)))
    return Array.from({ length: count }, (_, column) => {
      const yaw = column / count * Math.PI * 2 + (row % 2) * .13
      return { x: Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: Math.cos(yaw) * Math.cos(pitch), yaw: yaw * 180 / Math.PI, pitch: -latitude }
    })
  })
}
export default function SelectedWork({ language, onOpen }: { language: Language; onOpen: (index: number) => void }) {
  const text = copy[language]
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const tiles = useRef<(HTMLDivElement | null)[]>([])
  const points = useMemo(createGlobe, [])
  const [selected, setSelected] = useState<number | null>(null)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [active, setActive] = useState(0)
  const rotation = useRef({ x: -7, y: 0 })
  const pose = useRef({ x: -7, y: 0, zoom: 1, selected: 0 })
  const focusAmounts = useRef<number[]>([])
  const scrollFraction = useRef(0)
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number; startProgress: number; moved: boolean } | null>(null)
  const scheduleRef = useRef<() => void>(() => {})
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (reduced) return
    const advance = () => {
      const el = section.current
      if (!el) return
      const progress = Math.max(0, Math.min(1, (35 - el.getBoundingClientRect().top) / Math.max(1, el.offsetHeight - innerHeight)))
      scrollFraction.current = progress
      setActive(Math.min(count - 1, Math.max(0, Math.round((progress - .35) / .65 * (count - 1)))))
      scheduleRef.current()
    }
    advance()
    addEventListener('scroll', advance, { passive: true })
    addEventListener('resize', advance)
    return () => { removeEventListener('scroll', advance); removeEventListener('resize', advance) }
  }, [reduced, points])
  useEffect(() => {
    if (reduced) return
    let frame = 0
    const render = () => {
      frame = 0
      if (!stage.current || !world.current || !section.current) return
      const rect = stage.current.getBoundingClientRect()
      const scrollProgress = Math.max(0, Math.min(1, (35 - section.current.getBoundingClientRect().top) / Math.max(1, section.current.offsetHeight - innerHeight)))
      const unfold = smooth((scrollProgress - .06) / .32)
      const travel = Math.max(0, Math.min(1, (scrollProgress - .38) / .62)) * (count - 1)
      const targetZoom = selected === null ? 1 : 1.25
      const current = pose.current
      current.x = mix(current.x, rotation.current.x, .1)
      current.y = mix(current.y, rotation.current.y + scrollProgress * 24, .1)
      current.zoom = mix(current.zoom, targetZoom, .1)
      current.selected = mix(current.selected, selected === null ? 0 : 1, .13)
      const fit = Math.min(rect.width / 1000, rect.height / 900)
      const cardWidth = Math.min(380, Math.max(230, rect.width * .28))
      const rowScale = cardWidth / 172 / fit
      const spacing = (cardWidth + 22) / fit
      world.current.style.transform = `scale(${fit * current.zoom})`
      const ry = current.y * Math.PI / 180, rx = current.x * Math.PI / 180
      let tilesMoving = false
      points.forEach((point, index) => {
        const tile = tiles.current[index]
        if (!tile) return
        const x = point.x * Math.cos(ry) + point.z * Math.sin(ry)
        const z0 = point.z * Math.cos(ry) - point.x * Math.sin(ry)
        const y = point.y * Math.cos(rx) - z0 * Math.sin(rx)
        const z = point.y * Math.sin(rx) + z0 * Math.cos(rx)
        const focusTarget = selected === index ? 1 : 0
        const focus = mix(focusAmounts.current[index] ?? 0, focusTarget, .13)
        focusAmounts.current[index] = focus
        if (Math.abs(focus - focusTarget) > .001) tilesMoving = true
        const main = index < count + 2
        const rowX = (index - 1 - travel) * spacing
        const px = main ? mix(x * 355, rowX, unfold) : x * 355 * (1 + unfold)
        const py = main ? mix(y * 355, 0, unfold) : y * 355 * (1 + unfold)
        const pz = main ? mix(z * 355, 0, unfold) : z * 355
        tile.style.transform = `translate3d(${mix(px, 0, focus)}px,${mix(py, 0, focus)}px,${mix(pz, 460, focus)}px) rotateY(${mix(Math.atan2(x,z) * 180 / Math.PI * (1 - unfold), 0, focus)}deg) rotateX(${mix(-Math.asin(Math.max(-1, Math.min(1,y))) * 180 / Math.PI * (1 - unfold), 0, focus)}deg) scale(${mix(main ? mix(1, rowScale, unfold) : 1, 2.5, focus) * .5})`
        tile.style.visibility = !main && unfold > .995 ? 'hidden' : 'visible'
        tile.style.opacity = String(selected === index ? 1 : (main ? mix(z < -.08 ? .22 : .78 + z * .22, 1, unfold) : (z < -.08 ? .22 : .78 + z * .22) * (1 - unfold)) * (1 - current.selected * .28))
        tile.style.pointerEvents = (unfold > .8 ? main : z > .05) || selected === index ? 'auto' : 'none'
      })
      if (tilesMoving || Math.abs(current.zoom - targetZoom) > .001 || Math.abs(current.x - rotation.current.x) > .01 || Math.abs(current.y - rotation.current.y - scrollProgress * 24) > .01 || Math.abs(current.selected - (selected === null ? 0 : 1)) > .001) frame = requestAnimationFrame(render)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render) }
    scheduleRef.current = schedule
    const observer = new ResizeObserver(schedule)
    observer.observe(stage.current!)
    addEventListener('scroll', schedule, { passive: true }); schedule()
    return () => { cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('scroll', schedule); scheduleRef.current = () => {} }
  }, [points, selected, reduced])
  const select = (index: number) => { setSelected(index); setActive(projectIndex(index)) }
  const scrollToPhase = (progress: number) => {
    const el = section.current
    if (!el) return
    scrollTo({ top: scrollY + el.getBoundingClientRect().top - 35 + Math.max(1, el.offsetHeight - innerHeight) * progress, behavior: 'smooth' })
  }
  const navigate = (index: number) => {
    const target = Math.max(0, Math.min(count - 1, index))
    setSelected(null)
    scrollToPhase(.38 + target / (count - 1) * .62)
  }
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || !event.isPrimary || event.button !== 0) return
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: rotation.current.x, startY: rotation.current.y, startProgress: scrollFraction.current, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = drag.current
    if (!gesture || gesture.id !== event.pointerId) return
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y
    if (Math.abs(dx) > 7) {
      gesture.moved = true
      if (selected !== null) setSelected(null)
      if (gesture.startProgress > .38) {
        const el = section.current!
        const progress = Math.max(.38, Math.min(1, gesture.startProgress - dx / stage.current!.clientWidth * .35))
        scrollTo({ top: scrollY + el.getBoundingClientRect().top - 35 + (el.offsetHeight - innerHeight) * progress, behavior: 'instant' })
        return
      }
      rotation.current = { x: Math.max(-30, Math.min(30, gesture.startX - dy * .06)), y: gesture.startY + dx * .22 }
      scheduleRef.current()
    }
  }
  const pointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = drag.current
    if (!gesture || gesture.id !== event.pointerId) return
    drag.current = null
    if (!gesture.moved && event.type === 'pointerup' && Math.hypot(event.clientX - gesture.x,event.clientY - gesture.y) < 8) {
      const hit = document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('[data-globe-card]')
      if (hit) select(Number(hit.dataset.globeCard))
    }
  }
  return <section id="work" ref={section} className={`selected-section sphere-section${reduced ? ' sphere-reduced' : ''}`} aria-labelledby="selected-title">
    <div className="selected-sticky">
      <div className="section-heading"><h2 id="selected-title"><span className="section-index">01 /</span>{text.selected}</h2><p>{text.selectedText}</p></div>
      {reduced ? <div className="sphere-static-list">{galleryProjects.map((project,index) => <article className="sphere-static-card" key={project.title}><div className="neutral-placeholder">{text.image}</div><h3>{project.title}</h3><p>{project[language]}</p><button className="sphere-preview" onClick={() => onOpen(index)}>{text.preview} ↗</button></article>)}</div> : <>
        <div ref={stage} className={`sphere-stage${selected !== null ? ' has-selection' : ''}`} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={pointerEnd} aria-hidden="true">
          <div className="sphere-world" ref={world}>{points.map((_, index) => <div key={index} data-globe-card={index} ref={el => { tiles.current[index] = el }} className={`sphere-tile${selected === index ? ' is-selected' : ''}`}><div className="sphere-tile-content"><span className="sphere-tile-number">{String(projectIndex(index) + 1).padStart(2,'0')}</span><span className="sphere-cross" /><span className="sphere-tile-label">{galleryProjects[projectIndex(index)].title}</span><small>{text.image}</small></div></div>)}</div>
        </div>
        <div className="sphere-project-info"><div><span className="section-index">0{active + 1} / 0{count}</span><h3>{galleryProjects[active].title}</h3><p>{galleryProjects[active][language]}</p></div><button className="sphere-preview" onClick={() => onOpen(active)}>{text.preview}<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></button></div>
        <div className="gallery-bottom"><span>{language === 'en' ? 'Scroll to unfold the gallery and explore →' : 'Листайте: сфера раскроется в горизонтальную галерею →'}</span><div className="gallery-controls">{selected !== null && <button className="sphere-reset" onClick={() => scrollToPhase(0)}>{language === 'en' ? 'Overview' : 'Обзор'}</button>}<button aria-label={text.previous} disabled={active === 0} onClick={() => navigate(active - 1)}>←</button><span aria-live="polite" aria-atomic="true">0{active + 1}<i> / 0{count}</i></span><button aria-label={text.next} disabled={active === count - 1} onClick={() => navigate(active + 1)}>→</button></div></div>
      </>}
    </div>
  </section>
}
