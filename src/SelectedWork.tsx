import { useEffect, useRef, useState, type CSSProperties } from 'react'

const projects = [
  { title: 'PP Assistant', description: 'Personalized nutrition product', category: 'Consumer product', color: 'sage', format: 'Mobile interface', number: '01' },
  { title: 'X5 Blogger Platform', description: 'B2B platform for creators and advertisers', category: 'B2B platform', color: 'sand', format: 'Web interface', number: '02' },
  { title: 'Food.ru', description: 'Consumer product and recipe ecosystem', category: 'Consumer product', color: 'clay', format: 'Web & mobile interfaces', number: '03' },
]
const clamp = (value: number) => Math.max(0, Math.min(1, value))

export default function SelectedWork() {
  const section = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)
  const [simple, setSimple] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mobile = matchMedia('(max-width: 700px)')
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const updateMode = () => {
      setSimple(mobile.matches || motion.matches)
      setReduced(motion.matches)
    }
    updateMode()
    mobile.addEventListener('change', updateMode)
    motion.addEventListener('change', updateMode)
    return () => {
      mobile.removeEventListener('change', updateMode)
      motion.removeEventListener('change', updateMode)
    }
  }, [])

  useEffect(() => {
    if (simple) return
    let frame = 0
    const measure = () => {
      frame = 0
      const element = section.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const value = clamp((24 - rect.top) / Math.max(1, rect.height - innerHeight)) * 2
      setProgress(value)
      setActive(Math.min(2, Math.floor(value + 0.5)))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [simple])

  const navigate = (index: number) => {
    if (index < 0 || index > 2) return
    if (simple) {
      const card = rail.current?.children[index] as HTMLElement | undefined
      if (card && rail.current) rail.current.scrollTo({ left: card.offsetLeft - rail.current.offsetLeft, behavior: reduced ? 'instant' : 'smooth' })
    } else if (section.current) {
      const element = section.current
      window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 24 + (element.offsetHeight - innerHeight) * index / 2, behavior: 'smooth' })
    }
  }

  return (
    <section ref={section} className="work shuffle" id="work" aria-labelledby="work-title">
      <div className="shuffle-sticky">
        <div className="section-heading"><h2 id="work-title">Selected work</h2><span>Three products. Different challenges.</span></div>
        <div ref={rail} className="shuffle-stage" onScroll={() => {
          if (!simple || !rail.current || reduced) return
          const container = rail.current
          const cards = Array.from(container.children) as HTMLElement[]
          const nearest = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - container.offsetLeft - container.scrollLeft) < Math.abs(cards[best].offsetLeft - container.offsetLeft - container.scrollLeft) ? index : best, 0)
          setActive(nearest)
        }}>
          {projects.map((project, index) => {
            const distance = Math.max(0, index - progress)
            const departure = clamp((progress - index - 0.18) / 0.64)
            const eased = departure * departure * (3 - 2 * departure)
            const style: CSSProperties = simple ? {} : {
              transform: `translate3d(${eased * 125}%, ${-distance * 15 + eased * 20}px, 0) rotate(${eased * 7}deg) scale(${1 - distance * 0.045})`,
              opacity: 1 - clamp((departure - 0.7) / 0.3),
              zIndex: 3 - index,
              pointerEvents: index === active ? 'auto' : 'none',
            }
            return (
              <article className={`project-card ${project.color}`} key={project.title} style={style} aria-hidden={!simple && index !== active ? true : undefined}>
                <div className="project-top"><span className="project-number">{project.number}</span><span>{project.category}</span></div>
                <div className="project-visual"><span className="visual-frame" aria-hidden="true">{project.number}</span><div><strong>Project image placeholder</strong><span>{project.format} · Real screenshots coming soon</span></div></div>
                <div className="project-caption"><div><h3>{project.title}</h3><p>{project.description}</p></div><span className="case-status">Case study coming soon</span></div>
              </article>
            )
          })}
        </div>
        <div className="shuffle-controls">
          <span className="scroll-hint">{simple ? 'Swipe to explore' : 'Scroll to explore'} <span aria-hidden="true">{simple ? '↔' : '↓'}</span></span>
          <div className="project-navigation" aria-label="Project navigation"><button type="button" aria-label="Previous project" disabled={active === 0} onClick={() => navigate(active - 1)}>←</button><span className="project-counter" aria-live="polite" aria-atomic="true">0{active + 1} <span>/ 03</span></span><button type="button" aria-label="Next project" disabled={active === 2} onClick={() => navigate(active + 1)}>→</button></div>
        </div>
      </div>
    </section>
  )
}
