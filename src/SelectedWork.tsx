import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { cardStops, createCardTracks } from './cardShuffle'

const projects = [
  { title: 'PP Assistant', description: 'Personalized nutrition product', category: 'Consumer product', color: 'violet', format: 'Mobile interface', number: '01' },
  { title: 'X5 Blogger Platform', description: 'B2B platform for creators and advertisers', category: 'B2B platform', color: 'gold', format: 'Web interface', number: '02' },
  { title: 'Food.ru', description: 'Consumer product and recipe ecosystem', category: 'Consumer product', color: 'mint', format: 'Web & mobile interfaces', number: '03' },
]
const motionQuery = '(prefers-reduced-motion: reduce)'
const last = projects.length - 1
const stickyTop = 24
const clamp = (position: number) => Math.min(last, Math.max(0, position))

export default function SelectedWork() {
  const section = useRef<HTMLElement>(null)
  const sticky = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLSpanElement>(null)
  const position = useRef(0)
  const drag = useRef<{ id: number; x: number; y: number; start: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [active, setActive] = useState(0)
  const [reduced, setReduced] = useState(() => matchMedia(motionQuery).matches)

  useEffect(() => {
    const motion = matchMedia(motionQuery)
    const update = () => setReduced(motion.matches)
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [])

  const scrollSpan = () => Math.max(1, (section.current?.offsetHeight ?? 0) - (sticky.current?.offsetHeight ?? 0))

  useLayoutEffect(() => {
    const element = section.current
    if (reduced || !element || !rail.current) return
    const tracks = createCardTracks(rail.current.children)
    let frame = 0
    const measure = () => {
      frame = 0
      const progress = clamp((stickyTop - element.getBoundingClientRect().top) / scrollSpan() * last)
      position.current = progress
      const segment = Math.min(last - 1, Math.floor(progress))
      const time = cardStops[segment] + (cardStops[segment + 1] - cardStops[segment]) * (progress - segment)
      tracks.forEach(track => { track.currentTime = time })
      setActive(time >= 2960 ? 2 : time >= 1460 ? 1 : 0)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      tracks.forEach(track => track.cancel())
    }
  }, [reduced])

  const navigate = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const element = section.current
    if (!element) return
    const start = window.scrollY + element.getBoundingClientRect().top - stickyTop
    window.scrollTo({ top: start + scrollSpan() * clamp(index) / last, behavior })
  }

  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || !event.isPrimary || event.button !== 0 || !(event.target instanceof Element) ||
      !event.target.closest('.project-card:not([aria-hidden])')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, start: position.current }
    setDragging(true)
  }

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (hint.current) {
      hint.current.style.left = `${event.clientX - rect.left}px`
      hint.current.style.top = `${event.clientY - (sticky.current?.getBoundingClientRect().top ?? rect.top)}px`
    }
    const gesture = drag.current
    if (gesture?.id !== event.pointerId) return
    const distance = gesture.x - event.clientX
    if (Math.abs(distance) > 6) {
      navigate(gesture.start + distance / (rect.width * 0.65), 'instant')
    }
  }

  const pointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = drag.current
    if (gesture?.id !== event.pointerId) return
    drag.current = null
    setDragging(false)
    const distance = gesture.x - event.clientX
    const movedVertically = Math.abs(event.clientY - gesture.y) > 12
    const start = Math.round(gesture.start)
    if (event.type === 'pointerup' && Math.abs(distance) >= 36) {
      navigate(start + Math.sign(distance))
    } else if (event.type === 'pointerup' && Math.abs(distance) <= 6 && !movedVertically) {
      if (start < last) navigate(start + 1)
    } else if (Math.abs(distance) > 6 && event.type !== 'pointercancel') {
      navigate(start)
    }
  }

  return (
    <section ref={section} className="work shuffle" id="work" aria-labelledby="work-title">
      <div ref={sticky} className="shuffle-sticky">
        <div className="section-heading"><h2 id="work-title">Selected work</h2><span>Three products. Different challenges.</span></div>
        <div ref={rail} className={dragging ? 'shuffle-stage is-dragging' : 'shuffle-stage'}
          onPointerDown={pointerDown} onPointerMove={pointerMove}
          onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onLostPointerCapture={pointerEnd}>
          {projects.map((project, index) => (
              <article
                className={`project-card ${project.color}`}
                key={project.title}
                style={reduced ? undefined : { zIndex: projects.length - index }}
                aria-hidden={!reduced && index !== active ? true : undefined}
              >
                <div className="project-decoration" aria-hidden="true" />
                <div className="project-top"><span className="project-number">{project.number}</span><span>{project.category}</span></div>
                <div className="project-visual"><span className="visual-frame" aria-hidden="true">{project.number}</span><div><strong>Project image placeholder</strong><span>{project.format} · Real screenshots coming soon</span></div></div>
                <div className="project-caption"><div><h3>{project.title}</h3><p>{project.description}</p></div><span className="case-status">Case study coming soon</span></div>
                <div className="project-depth" aria-hidden="true" />
              </article>
          ))}
        </div>
        <div className="shuffle-hint-anchor" aria-hidden="true"><span ref={hint} className="shuffle-hint">листай</span></div>
        <div className="shuffle-controls">
          <span className="shuffle-instruction">Scroll or drag ←</span>
          <div className="project-navigation" aria-label="Project navigation">
            <button type="button" aria-label="Previous project" disabled={active === 0} onClick={() => navigate(active - 1)}>←</button>
            <div className="project-dots" aria-hidden="true">
              {projects.map((project, index) => <span key={project.number} className={index === active ? 'is-current' : undefined} />)}
            </div>
            <button type="button" aria-label="Next project" disabled={active === last} onClick={() => navigate(active + 1)}>→</button>
          </div>
        </div>
      </div>
    </section>
  )
}
