import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cardInterval, createCardTracks } from './cardShuffle'

const projects = [
  { title: 'PP Assistant', description: 'Personalized nutrition product', category: 'Consumer product', color: 'violet', format: 'Mobile interface', number: '01' },
  { title: 'X5 Blogger Platform', description: 'B2B platform for creators and advertisers', category: 'B2B platform', color: 'gold', format: 'Web interface', number: '02' },
  { title: 'Food.ru', description: 'Consumer product and recipe ecosystem', category: 'Consumer product', color: 'mint', format: 'Web & mobile interfaces', number: '03' },
]
const motionQuery = '(prefers-reduced-motion: reduce)'
const cycleDuration = cardInterval * projects.length

export default function SelectedWork() {
  const section = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const position = useRef(0)
  const [active, setActive] = useState(0)
  const [seek, setSeek] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia(motionQuery).matches)

  useEffect(() => {
    const motion = matchMedia(motionQuery)
    const update = () => setReduced(motion.matches)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 })
    if (rail.current) observer.observe(rail.current)
    motion.addEventListener('change', update)
    return () => {
      observer.disconnect()
      motion.removeEventListener('change', update)
    }
  }, [])

  useLayoutEffect(() => {
    if (reduced || !rail.current) return
    const cards = createCardTracks(rail.current.children)
    let frame = 0
    let previous: number | undefined

    const render = (now: number) => {
      if (previous !== undefined) {
        position.current = (position.current + now - previous) % cycleDuration
      }
      cards.forEach(({ tracks, phase }) => {
        tracks.forEach(track => { track.currentTime = position.current + phase })
      })
      setActive(Math.floor(position.current / cardInterval))
      if (visible && !paused) {
        previous = now
        frame = requestAnimationFrame(render)
      }
    }
    render(performance.now())

    return () => {
      cancelAnimationFrame(frame)
      cards.forEach(({ tracks }) => tracks.forEach(track => track.cancel()))
    }
  }, [visible, paused, reduced, seek])

  const navigate = (index: number) => {
    const next = (index + projects.length) % projects.length
    position.current = next * cardInterval
    setPaused(true)
    setSeek(value => value + 1)
  }

  return (
    <section ref={section} className="work shuffle" id="work" aria-labelledby="work-title">
      <div className="shuffle-sticky">
        <div className="section-heading"><h2 id="work-title">Selected work</h2><span>Three products. Different challenges.</span></div>
        <div ref={rail} className="shuffle-stage">
          {projects.map((project, index) => (
              <article className={`project-card ${project.color}`} key={project.title} aria-hidden={!reduced && index !== active ? true : undefined}>
                <div className="project-decoration" aria-hidden="true" />
                <div className="project-top"><span className="project-number">{project.number}</span><span>{project.category}</span></div>
                <div className="project-visual"><span className="visual-frame" aria-hidden="true">{project.number}</span><div><strong>Project image placeholder</strong><span>{project.format} · Real screenshots coming soon</span></div></div>
                <div className="project-caption"><div><h3>{project.title}</h3><p>{project.description}</p></div><span className="case-status">Case study coming soon</span></div>
                <div className="project-depth" aria-hidden="true" />
              </article>
          ))}
        </div>
        <div className="shuffle-controls">
          <button type="button" className="shuffle-playback" onClick={() => setPaused(!paused)}>{paused ? 'Play animation' : 'Pause animation'}</button>
          <div className="project-navigation" aria-label="Project navigation">
            <button type="button" aria-label="Previous project" onClick={() => navigate(active - 1)}>←</button>
            <div className="project-dots" aria-hidden="true">
              {projects.map((project, index) => <span key={project.number} className={index === active ? 'is-current' : undefined} />)}
            </div>
            <button type="button" aria-label="Next project" onClick={() => navigate(active + 1)}>→</button>
          </div>
        </div>
      </div>
    </section>
  )
}
