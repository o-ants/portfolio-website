import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { copy, projects, type Language } from './content'
import { galleryPoint } from './prototype/geometry'

export default function SelectedWork({ language, onOpen }: { language: Language; onOpen: (index: number) => void }) {
  const text = copy[language]
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(0)
  const [simple, setSimple] = useState(false)
  const active = Math.max(0, Math.min(2, Math.round(position)))
  useEffect(() => {
    const mode = matchMedia('(max-width: 760px), (prefers-reduced-motion: reduce)')
    const change = () => setSimple(mode.matches)
    change(); mode.addEventListener('change', change)
    return () => mode.removeEventListener('change', change)
  }, [])
  useEffect(() => {
    if (simple) return
    let frame = 0
    const update = () => {
      frame = 0
      const el = section.current
      if (!el) return
      const span = Math.max(1, el.offsetHeight - innerHeight)
      setPosition(Math.max(0, Math.min(2, (80 - el.getBoundingClientRect().top) / span * 2)))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update(); addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule)
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule) }
  }, [simple])
  const navigate = (index: number) => {
    if (simple) {
      const card = stage.current?.children[index] as HTMLElement | undefined
      card?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest', inline: 'center' })
    } else if (section.current) {
      const el = section.current
      scrollTo({ top: scrollY + el.getBoundingClientRect().top - 80 + (el.offsetHeight - innerHeight) * index / 2, behavior: 'smooth' })
    }
  }
  return <section id="work" ref={section} className="selected-section" aria-labelledby="selected-title">
    <div className="selected-sticky">
      <div className="section-heading"><h2 id="selected-title"><span className="section-index">01 /</span>{text.selected}</h2><p>{text.selectedText}</p></div>
      <div ref={stage} className="curved-gallery" onScroll={() => {
        if (!simple || !stage.current) return
        const rail = stage.current
        const children = Array.from(rail.children) as HTMLElement[]
        const nearest = children.reduce((best, child, index) => Math.abs(child.offsetLeft - rail.offsetLeft - rail.scrollLeft) < Math.abs(children[best].offsetLeft - rail.offsetLeft - rail.scrollLeft) ? index : best, 0)
        setPosition(nearest)
      }}>
        {projects.map((project, index) => {
          const distance = index - position
          const point = galleryPoint(distance, 1450, .46, 100)
          const style: CSSProperties = simple ? {} : { transform: `translate(-50%, -50%) translate3d(${point.x}px, ${Math.abs(distance) * 26}px, ${point.z}px) rotateY(${point.yaw}deg) scale(${1 - Math.min(2, Math.abs(distance)) * .08})`, zIndex: 5 - Math.round(Math.abs(distance) * 2) }
          return <article key={project.title} className={`featured-card ${project.theme}`} style={style}>
            <div className="featured-meta"><span>0{index + 1}</span><span>{project.type}</span></div>
            <div className="featured-placeholder"><span className="project-mark" aria-hidden="true">{project.mark}</span><span className="placeholder-label">{text.image}</span></div>
            <div className="featured-caption"><div><h3>{project.title}</h3><p>{project[language]}</p></div><button onClick={() => onOpen(index)} aria-label={`${text.preview}: ${project.title}`} className="round-link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></button></div>
            <span className="case-status">{text.soon}</span>
          </article>
        })}
      </div>
      <div className="gallery-bottom"><span>{text.rail}</span><div className="gallery-controls"><button disabled={active === 0} aria-label={text.previous} onClick={() => navigate(active - 1)}>←</button><span aria-live="polite" aria-atomic="true">0{active + 1}<i> / 03</i></span><button disabled={active === 2} aria-label={text.next} onClick={() => navigate(active + 1)}>→</button></div></div>
    </div>
  </section>
}
