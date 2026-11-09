import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cardStops, createCardTracks } from './cardShuffle'

const projects = [
  { title: 'PP Assistant', description: 'Personalized nutrition product', category: 'Consumer product', color: 'violet', format: 'Mobile interface', number: '01' },
  { title: 'X5 Blogger Platform', description: 'B2B platform for creators and advertisers', category: 'B2B platform', color: 'gold', format: 'Web interface', number: '02' },
  { title: 'Food.ru', description: 'Consumer product and recipe ecosystem', category: 'Consumer product', color: 'mint', format: 'Web & mobile interfaces', number: '03' },
]
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const lastProject = projects.length - 1
const motionQuery = '(prefers-reduced-motion: reduce)'
const mobileQuery = '(max-width: 700px)'
const stickyTop = 24

export default function SelectedWork() {
  const section = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [simple, setSimple] = useState(() => matchMedia(mobileQuery).matches || matchMedia(motionQuery).matches)

  useEffect(() => {
    const mobile = matchMedia(mobileQuery)
    const motion = matchMedia(motionQuery)
    const updateMode = () => setSimple(mobile.matches || motion.matches)
    updateMode()
    mobile.addEventListener('change', updateMode)
    motion.addEventListener('change', updateMode)
    return () => {
      mobile.removeEventListener('change', updateMode)
      motion.removeEventListener('change', updateMode)
    }
  }, [])

  useLayoutEffect(() => {
    const element = section.current
    if (simple || !element || !rail.current) return
    const tracks = createCardTracks(rail.current.children)
    let frame = 0
    const measure = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const position = clamp((stickyTop - rect.top) / Math.max(1, rect.height - innerHeight)) * lastProject
      const segment = Math.min(lastProject - 1, Math.floor(position))
      const time = cardStops[segment] + (cardStops[segment + 1] - cardStops[segment]) * (position - segment)
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
  }, [simple])

  const navigate = (index: number) => {
    if (index < 0 || index > lastProject) return
    if (simple) {
      const card = rail.current?.children[index] as HTMLElement | undefined
      if (card && rail.current) rail.current.scrollTo({ left: card.offsetLeft - rail.current.offsetLeft, behavior: 'smooth' })
    } else if (section.current) {
      const element = section.current
      window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - stickyTop + (element.offsetHeight - innerHeight) * index / lastProject, behavior: 'smooth' })
    }
  }

  return (
    <section ref={section} className="work shuffle" id="work" aria-labelledby="work-title">
      <div className="shuffle-sticky">
        <div className="section-heading"><h2 id="work-title">Selected work</h2><span>Three products. Different challenges.</span></div>
        <div ref={rail} className="shuffle-stage" onScroll={() => {
          if (!simple || !rail.current || matchMedia(motionQuery).matches) return
          const container = rail.current
          const cards = Array.from(container.children) as HTMLElement[]
          const nearest = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - container.offsetLeft - container.scrollLeft) < Math.abs(cards[best].offsetLeft - container.offsetLeft - container.scrollLeft) ? index : best, 0)
          setActive(nearest)
        }}>
          {projects.map((project, index) => (
              <article className={`project-card ${project.color}`} key={project.title} style={{ zIndex: lastProject - index }} aria-hidden={!simple && index !== active ? true : undefined}>
                <div className="project-decoration" aria-hidden="true" />
                <div className="project-top"><span className="project-number">{project.number}</span><span>{project.category}</span></div>
                <div className="project-visual"><span className="visual-frame" aria-hidden="true">{project.number}</span><div><strong>Project image placeholder</strong><span>{project.format} · Real screenshots coming soon</span></div></div>
                <div className="project-caption"><div><h3>{project.title}</h3><p>{project.description}</p></div><span className="case-status">Case study coming soon</span></div>
                <div className="project-depth" aria-hidden="true" />
              </article>
          ))}
        </div>
        <div className="shuffle-controls">
          <span className="scroll-hint">{simple ? 'Swipe to explore' : 'Scroll to explore'} <span aria-hidden="true">{simple ? '↔' : '↓'}</span></span>
          <div className="project-navigation" aria-label="Project navigation"><button type="button" aria-label="Previous project" disabled={active === 0} onClick={() => navigate(active - 1)}>←</button><span className="project-counter" aria-live="polite" aria-atomic="true">{projects[active].number} <span>/ {projects[lastProject].number}</span></span><button type="button" aria-label="Next project" disabled={active === lastProject} onClick={() => navigate(active + 1)}>→</button></div>
        </div>
      </div>
    </section>
  )
}
