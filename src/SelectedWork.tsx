import { useEffect, useRef } from 'react'
import { copy, otherProjects, projects, type Language } from './content'

const selectedProjects = [...projects, ...otherProjects.slice(0, 3)]

type Props = {
  language: Language
  onOpen: (index: number) => void
}

export default function SelectedWork({ language, onOpen }: Props) {
  const text = copy[language]
  const track = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const deck = track.current!
    const viewport = stage.current!
    const cards = Array.from(viewport.children) as HTMLLIElement[]
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const update = () => {
      frame = 0
      if (reduced.matches) return

      const distance = Math.max(1, deck.offsetHeight - viewport.offsetHeight)
      const progress = Math.min(1, Math.max(0, -deck.getBoundingClientRect().top / distance))
      const position = progress * (cards.length - 1)
      const spacing = viewport.offsetHeight * 0.15

      cards.forEach((card, index) => {
        const offset = index - position
        const depth = Math.abs(offset)
        const tilt = Math.max(-1, Math.min(1, offset)) * 67
        const y = offset * spacing + Math.max(-1, Math.min(1, offset)) * spacing * 0.9
        const scale = 1 - Math.min(depth, 5) * 0.055

        card.style.transform = `translateY(${y}px) perspective(850px) rotateX(${tilt}deg) scale(${scale})`
        card.style.zIndex = String(100 - Math.round(depth * 10))
      })
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    reduced.addEventListener('change', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      reduced.removeEventListener('change', schedule)
    }
  }, [])

  const focusCard = (button: HTMLButtonElement, index: number) => {
    if (!button.matches(':focus-visible') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const deck = track.current!
    const viewport = stage.current!
    const start = deck.getBoundingClientRect().top + window.scrollY
    const distance = deck.offsetHeight - viewport.offsetHeight
    window.scrollTo({ top: start + distance * index / (selectedProjects.length - 1), behavior: 'instant' })
  }

  return (
    <section id="work" className="selected-section project-stack-section" aria-labelledby="selected-title">
      <div className="section-heading">
        <h2 id="selected-title"><span className="section-index">01 /</span>{text.selected}</h2>
        <p>{text.selectedText}</p>
      </div>
      <div className="project-stack-track" ref={track}>
        <ul className="project-stack" ref={stage}>
          {selectedProjects.map((project, index) => (
            <li key={project.title}>
              <button
                type="button"
                className="project-stack-card"
                onFocus={event => focusCard(event.currentTarget, index)}
                onClick={() => onOpen(index)}
                aria-label={`${text.preview}: ${project.title}`}
              >
                <span className="project-stack-preview">
                  <span className="project-stack-title">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{project.title}</strong>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                      <path d="M5 19 19 5M5 5h14v14" />
                    </svg>
                  </span>
                  <span className="project-stack-placeholder" aria-hidden="true">
                    <span>+</span>
                    <small>{text.image}</small>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
