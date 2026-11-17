import { useState, type CSSProperties } from 'react'
import { copy, otherProjects, projects, type Language } from './content'

const selectedProjects = [...projects, ...otherProjects.slice(0, 3)]

type Props = {
  language: Language
  onOpen: (index: number) => void
}

export default function SelectedWork({ language, onOpen }: Props) {
  const text = copy[language]
  const [hovered, setHovered] = useState<number | null>(null)
  const [focused, setFocused] = useState<number | null>(null)
  const active = hovered ?? focused

  return (
    <section id="work" className="selected-section project-stack-section" aria-labelledby="selected-title">
      <div className="section-heading">
        <h2 id="selected-title"><span className="section-index">01 /</span>{text.selected}</h2>
        <p>{text.selectedText}</p>
      </div>
      <div className="project-stack-track">
        <ul
          className="project-stack"
          onPointerMove={event => {
            if (event.pointerType !== 'mouse') return
            const card = (event.target as HTMLElement).closest<HTMLElement>('[data-project-index]')
            if (card) setHovered(Number(card.dataset.projectIndex))
          }}
          onPointerLeave={() => setHovered(null)}
        >
          {selectedProjects.map((project, index) => {
            const offset = index - (active ?? (selectedProjects.length - 1) / 2)
            const depth = Math.abs(offset)
            const isOpen = active === index
            const y = offset * 11.5 + (active === null ? 0 : Math.sign(offset) * 12)
            const scale = active === null ? 0.69 + index * 0.049 : 1 - depth * 0.095
            const style = {
              '--card-y': `${y}cqh`,
              '--card-scale': scale,
              '--card-tilt': isOpen ? '0deg' : '58deg',
              zIndex: isOpen ? selectedProjects.length : index,
            } as CSSProperties

            return (
              <li key={project.title} data-project-index={index} style={style}>
                <button
                  type="button"
                  className="project-stack-card"
                  onFocus={event => {
                    if (event.currentTarget.matches(':focus-visible')) setFocused(index)
                  }}
                  onBlur={() => setFocused(null)}
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
            )
          })}
        </ul>
      </div>
    </section>
  )
}
